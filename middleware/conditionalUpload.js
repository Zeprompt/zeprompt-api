const multer = require("multer");
const logger = require("../utils/logger");

/**
 * Middleware conditionnel pour l'upload de fichiers (PDF et images)
 * Gère l'upload de PDF pour les prompts de type "pdf"
 * Gère l'upload d'images pour les prompts de type "text" (facultatif)
 */
function conditionalPdfUpload(req, res, next) {
  // Si c'est un multipart/form-data (avec fichier)
  const contentType = req.get("content-type") || "";
  
  logger.info(`📤 Middleware upload - Content-Type: ${contentType}`);
  
  if (!contentType.includes("multipart/form-data")) {
    // Pas de fichier, continuer normalement (pour les prompts texte sans image)
    logger.info('📤 Pas de multipart/form-data, passage au middleware suivant');
    return next();
  }
  
  logger.info('📤 Multipart/form-data détecté, configuration de multer...');

  // Créer un upload qui gère à la fois PDF et image
  const upload = multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        // Choisir le bon dossier selon le type de fichier
        if (file.fieldname === 'pdf') {
          cb(null, require('path').resolve(process.cwd(), 'uploads', 'pdfs'));
        } else if (file.fieldname === 'image' || file.fieldname === 'image2') {
          cb(null, require('path').resolve(process.cwd(), 'uploads', 'prompts', 'images'));
        } else {
          cb(new Error('Field name inconnu'));
        }
      },
      filename: (req, file, cb) => {
        const safeName = file.originalname.replace(/[^a-zA-Z0-9_.-]/g, '_');
        const ts = Date.now();
        cb(null, `${ts}-${safeName}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (file.fieldname === 'pdf') {
        // Validation pour PDF
        if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
          return cb(null, true);
        }
        return cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'pdf'));
      } else if (file.fieldname === 'image' || file.fieldname === 'image2') {
        // Validation pour images
        const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
        if (allowedMimes.includes(file.mimetype)) {
          return cb(null, true);
        }
        return cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'image'));
      }
      cb(new Error('Field name inconnu'));
    },
    limits: {
      fileSize: 20 * 1024 * 1024, // 20MB max (pour PDF)
    },
  }).fields([
    { name: 'pdf', maxCount: 1 },
    { name: 'image', maxCount: 1 },
    { name: 'image2', maxCount: 1 }
  ]);

  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      logger.error(`❌ Erreur Multer: ${err.code} - ${err.message}`);
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ 
          message: 'Fichier trop volumineux. Taille maximale : 20MB pour PDF, 5MB pour images',
          code: 'FILE_TOO_LARGE' 
        });
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ 
          message: 'Type de fichier non supporté',
          code: 'INVALID_FILE_TYPE' 
        });
      }
      return res.status(400).json({ message: 'Erreur lors de l\'upload', code: err.code });
    }
    if (err) {
      logger.error(`❌ Erreur inattendue upload: ${err.message}`);
      return res.status(500).json({ message: 'Erreur inattendue lors de l\'upload' });
    }

    logger.info('✅ Upload réussi, traitement des fichiers...');
    // Traiter les fichiers uploadés
    if (req.files) {
      // PDF uploadé
      if (req.files.pdf && req.files.pdf[0]) {
        const pdfFile = req.files.pdf[0];
        req.body.pdfFilePath = pdfFile.path;
        req.body.pdfOriginalName = pdfFile.originalname;
        req.body.pdfFileSize = pdfFile.size;
        req.body.contentType = "pdf";
      }
      
      // Image uploadée (facultatif pour prompts text)
      if (req.files.image && req.files.image[0]) {
        const imageFile = req.files.image[0];
        req.body.imagePath = imageFile.path;
        req.body.imageOriginalName = imageFile.originalname;
        req.body.imageFileSize = imageFile.size;
      }
      
      // Deuxième image uploadée (facultatif pour prompts text)
      if (req.files.image2 && req.files.image2[0]) {
        const image2File = req.files.image2[0];
        req.body.imagePath2 = image2File.path;
        req.body.imageOriginalName2 = image2File.originalname;
        req.body.imageFileSize2 = image2File.size;
      }
      
      logger.info(`✅ Fichiers traités - PDF: ${!!req.files.pdf}, Image: ${!!req.files.image}, Image2: ${!!req.files.image2}`);
    }
    
    next();
  });
}

module.exports = conditionalPdfUpload;
