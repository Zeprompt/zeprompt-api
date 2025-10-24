const {
  uploadPDF,
  handleUploadError: handlePDFUploadError,
} = require("./uploadPDF");
const {
  uploadImage,
  handleUploadError: handleImageUploadError,
} = require("./uploadImage");

/**
 * Middleware conditionnel pour l'upload de PDF et/ou d'images
 * Détecte automatiquement le type de fichier et applique l'upload approprié
 */
function conditionalFileUpload(req, res, next) {
  const contentType = req.get("content-type") || "";

  if (!contentType.includes("multipart/form-data")) {
    // Pas de fichier, continuer normalement (pour les prompts texte)
    return next();
  }

  // Créer un middleware combiné qui gère PDF et images
  const combinedUpload = (req, res, callback) => {
    // D'abord, essayer d'uploader un PDF
    uploadPDF(req, res, (pdfErr) => {
      if (pdfErr && pdfErr.code !== "LIMIT_UNEXPECTED_FILE") {
        return callback(pdfErr);
      }

      const hasPDF = req.file !== undefined;
      const pdfFile = req.file;

      // Essayer d'uploader une image
      uploadImage(req, res, (imgErr) => {
        if (imgErr && imgErr.code !== "LIMIT_UNEXPECTED_FILE") {
          return callback(imgErr);
        }

        const hasImage = req.file !== undefined && req.file !== pdfFile;

        // Gérer les deux fichiers s'ils existent
        if (hasPDF) {
          req.body.pdfFilePath = pdfFile.path;
          req.body.pdfOriginalName = pdfFile.originalname;
          req.body.pdfFileSize = pdfFile.size;

          if (!req.body.contentType) {
            req.body.contentType = "pdf";
          }
        }

        if (hasImage) {
          req.body.imageFilePath = req.file.path;
          req.body.imageOriginalName = req.file.originalname;
          req.body.imageFileSize = req.file.size;

          if (!req.body.contentType) {
            req.body.contentType = "image";
          } else if (hasPDF) {
            req.body.contentType = "pdf_and_image";
          }
        }

        callback(null);
      });
    });
  };

  // Exécuter l'upload combiné
  combinedUpload(req, res, (err) => {
    if (err) {
      // Déterminer quel handler d'erreur utiliser
      if (err.message && err.message.includes("image")) {
        return handleImageUploadError(err, req, res, next);
      }
      return handlePDFUploadError(err, req, res, next);
    }
    next();
  });
}

module.exports = conditionalFileUpload;
