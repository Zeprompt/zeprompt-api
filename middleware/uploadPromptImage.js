'use strict';

const fs = require('fs');
const path = require('path');
const multer = require('multer');

const uploadDir = path.resolve(process.cwd(), 'uploads', 'prompts', 'images');

// Ensure upload directory exists
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}
ensureDir(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9_.-]/g, '_');
    const ts = Date.now();
    cb(null, `${ts}-${safeName}`);
  },
});

function fileFilter(req, file, cb) {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  
  if (allowedMimes.includes(file.mimetype)) {
    return cb(null, true);
  }
  
  cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'image'));
}

const uploadPromptImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
}).single('image');

function handleUploadError(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        message: 'Fichier trop volumineux. Taille maximale : 5MB',
        code: 'FILE_TOO_LARGE' 
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ 
        message: 'Type de fichier non supporté. Formats acceptés : JPEG, PNG, WebP, GIF',
        code: 'INVALID_FILE_TYPE' 
      });
    }
    return res.status(400).json({ message: 'Erreur lors de l\'upload', code: err.code });
  }
  if (err) {
    return res.status(500).json({ message: 'Erreur inattendue lors de l\'upload' });
  }
  next();
}

module.exports = { uploadPromptImage, handleUploadError };
