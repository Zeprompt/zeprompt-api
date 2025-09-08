'use strict';

const fs = require('fs');
const path = require('path');
const multer = require('multer');

const uploadDir = path.resolve(process.cwd(), 'uploads', 'pdfs');

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
  if (file.mimetype === 'application/pdf' || (file.originalname || '').toLowerCase().endsWith('.pdf')) {
    return cb(null, true);
  }
  cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'pdf'));
}

const uploadPDF = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
}).single('pdf');

function handleUploadError(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: 'Upload error', code: err.code });
  }
  if (err) {
    return res.status(500).json({ message: 'Unexpected upload error' });
  }
  next();
}

module.exports = { uploadPDF, handleUploadError };
