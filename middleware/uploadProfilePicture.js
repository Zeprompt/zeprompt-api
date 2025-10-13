const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Dossier de destination pour les photos de profil
const uploadDir = path.resolve(process.cwd(), "uploads", "profiles");

// Créer le dossier s'il n'existe pas
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

ensureDir(uploadDir);

// Configuration du stockage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Nettoyer le nom du fichier
    const safeName = file.originalname.replace(/[^a-zA-Z0-9_.-]/g, "_");
    const ts = Date.now();
    const ext = path.extname(safeName);
    const basename = path.basename(safeName, ext);
    cb(null, `${req.user.id}-${ts}-${basename}${ext}`);
  },
});

// Filtrer les types de fichiers (images uniquement)
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
  const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
  
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedMimeTypes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Seules les images (JPEG, PNG, GIF, WebP) sont autorisées"), false);
  }
};

// Configuration de Multer
const uploadProfilePicture = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limite de 5 MB
  },
}).single("profilePicture"); // Le champ form-data doit s'appeler "profilePicture"

module.exports = uploadProfilePicture;
