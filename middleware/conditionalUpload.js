const { uploadPDF, handleUploadError } = require("./uploadPDF");

/**
 * Middleware conditionnel pour l'upload de PDF
 * Applique l'upload seulement si contentType est "pdf" ou si un fichier est présent
 */
function conditionalPdfUpload(req, res, next) {
  // Si c'est un multipart/form-data (avec fichier)
  const contentType = req.get("content-type") || "";
  
  if (contentType.includes("multipart/form-data")) {
    // Utiliser le middleware d'upload
    uploadPDF(req, res, (err) => {
      if (err) {
        return handleUploadError(err, req, res, next);
      }
      
      // Si un fichier a été uploadé, ajouter les infos au body
      if (req.file) {
        req.body.pdfFilePath = req.file.path;
        req.body.pdfOriginalName = req.file.originalname;
        req.body.pdfFileSize = req.file.size;
        req.body.contentType = "pdf"; // S'assurer que contentType est "pdf"
      }
      
      next();
    });
  } else {
    // Pas de fichier, continuer normalement (pour les prompts texte)
    next();
  }
}

module.exports = conditionalPdfUpload;
