const { s3Client, PutObjectCommand } = require("../config/s3");
const { DeleteObjectCommand, GetObjectCommand, HeadObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const fs = require("fs");
const path = require("path");
const logger = require("../utils/logger");
const sharp = require("sharp");

/**
 * Service pour gérer le stockage sur Cloudflare R2 (S3-compatible)
 */
class R2StorageService {
  constructor() {
    this.bucketName = process.env.CLOUDFLARE_BUCKET_NAME;
    this.publicUrl = process.env.CLOUDFLARE_PUBLIC_URL; // URL publique du bucket si configuré
  }

  /**
   * Upload un fichier vers R2
   * @param {Buffer|string} fileContent - Contenu du fichier (Buffer) ou chemin local
   * @param {string} key - Clé/chemin du fichier dans R2 (ex: "profiles/user-123.jpg")
   * @param {Object} options - Options additionnelles (contentType, metadata, etc.)
   * @returns {Promise<Object>} Informations sur le fichier uploadé
   */
  async uploadFile(fileContent, key, options = {}) {
    try {
      let body;
      let fileSize;

      // Si c'est un chemin de fichier local, le lire
      if (typeof fileContent === "string" && fs.existsSync(fileContent)) {
        body = fs.readFileSync(fileContent);
        const stats = fs.statSync(fileContent);
        fileSize = stats.size;
      } else {
        body = fileContent;
        fileSize = Buffer.byteLength(fileContent);
      }

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: body,
        ContentType: options.contentType || this._getContentType(key),
        Metadata: options.metadata || {},
        CacheControl: options.cacheControl || "public, max-age=31536000", // 1 an
      });

      await s3Client.send(command);

      const fileUrl = this.getPublicUrl(key);

      logger.info(`✅ Fichier uploadé vers R2: ${key}`);

      return {
        key,
        url: fileUrl,
        size: fileSize,
        bucket: this.bucketName,
      };
    } catch (error) {
      logger.error(`❌ Erreur upload R2: ${error.message}`);
      throw new Error(`Erreur lors de l'upload vers R2: ${error.message}`);
    }
  }

  /**
   * Upload une image optimisée vers R2
   * @param {string} localPath - Chemin local de l'image
   * @param {string} key - Clé R2 (ex: "profiles/user-123.jpg")
   * @param {Object} resizeOptions - Options de redimensionnement Sharp
   * @returns {Promise<Object>} Informations sur l'image uploadée
   */
  async uploadOptimizedImage(localPath, key, resizeOptions = {}) {
    try {
      const {
        width = 1200,
        height = 1200,
        quality = 90,
        fit = "inside",
      } = resizeOptions;

      // Optimiser l'image avec Sharp
      const optimizedBuffer = await sharp(localPath)
        .resize(width, height, {
          fit,
          withoutEnlargement: true,
        })
        .jpeg({ quality })
        .toBuffer();

      // Upload vers R2
      return await this.uploadFile(optimizedBuffer, key, {
        contentType: "image/jpeg",
      });
    } catch (error) {
      logger.error(`❌ Erreur optimisation/upload image: ${error.message}`);
      throw error;
    }
  }

  /**
   * Upload une image avec son thumbnail
   * @param {string} localPath - Chemin local de l'image
   * @param {string} baseKey - Clé de base (ex: "profiles/user-123")
   * @param {Object} options - Options de traitement
   * @returns {Promise<Object>} URLs de l'image et du thumbnail
   */
  async uploadImageWithThumbnail(localPath, baseKey, options = {}) {
    try {
      const {
        imageWidth = 1200,
        imageHeight = 1200,
        imageQuality = 90,
        thumbWidth = 300,
        thumbHeight = 300,
        thumbQuality = 85,
      } = options;

      // Extension
      const ext = path.extname(baseKey) || ".jpg";
      const keyWithoutExt = baseKey.replace(ext, "");

      // 1. Upload de l'image principale optimisée
      const imageKey = `${keyWithoutExt}${ext}`;
      const imageBuffer = await sharp(localPath)
        .resize(imageWidth, imageHeight, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .jpeg({ quality: imageQuality })
        .toBuffer();

      const imageResult = await this.uploadFile(imageBuffer, imageKey, {
        contentType: "image/jpeg",
      });

      // 2. Upload du thumbnail
      const thumbKey = `${keyWithoutExt}_thumb${ext}`;
      const thumbBuffer = await sharp(localPath)
        .resize(thumbWidth, thumbHeight, {
          fit: "cover",
          position: "center",
        })
        .jpeg({ quality: thumbQuality })
        .toBuffer();

      const thumbResult = await this.uploadFile(thumbBuffer, thumbKey, {
        contentType: "image/jpeg",
      });

      logger.info(`✅ Image et thumbnail uploadés vers R2`);

      return {
        image: imageResult,
        thumbnail: thumbResult,
      };
    } catch (error) {
      logger.error(`❌ Erreur upload image+thumbnail: ${error.message}`);
      throw error;
    }
  }

  /**
   * Upload un PDF vers R2
   * @param {string} localPath - Chemin local du PDF
   * @param {string} key - Clé R2
   * @returns {Promise<Object>} Informations sur le PDF uploadé
   */
  async uploadPDF(localPath, key) {
    try {
      // Vérifier que c'est bien un PDF
      const fileBuffer = fs.readFileSync(localPath);
      const isPdf = fileBuffer.toString("utf8", 0, 4) === "%PDF";

      if (!isPdf) {
        throw new Error("Le fichier n'est pas un PDF valide");
      }

      return await this.uploadFile(fileBuffer, key, {
        contentType: "application/pdf",
      });
    } catch (error) {
      logger.error(`❌ Erreur upload PDF: ${error.message}`);
      throw error;
    }
  }

  /**
   * Supprimer un fichier de R2
   * @param {string} key - Clé du fichier à supprimer
   * @returns {Promise<void>}
   */
  async deleteFile(key) {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await s3Client.send(command);
      logger.info(`🗑️ Fichier supprimé de R2: ${key}`);
    } catch (error) {
      logger.error(`❌ Erreur suppression R2: ${error.message}`);
      throw error;
    }
  }

  /**
   * Vérifier si un fichier existe dans R2
   * @param {string} key - Clé du fichier
   * @returns {Promise<boolean>}
   */
  async fileExists(key) {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await s3Client.send(command);
      return true;
    } catch (error) {
      if (error.name === "NotFound") {
        return false;
      }
      throw error;
    }
  }

  /**
   * Obtenir une URL signée pour un fichier privé
   * @param {string} key - Clé du fichier
   * @param {number} expiresIn - Durée de validité en secondes (défaut: 1h)
   * @returns {Promise<string>} URL signée
   */
  async getSignedUrl(key, expiresIn = 3600) {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
      return signedUrl;
    } catch (error) {
      logger.error(`❌ Erreur génération URL signée: ${error.message}`);
      throw error;
    }
  }

  /**
   * Obtenir l'URL publique d'un fichier
   * @param {string} key - Clé du fichier
   * @returns {string} URL publique
   */
  getPublicUrl(key) {
    // Si une URL publique est configurée, l'utiliser
    if (this.publicUrl) {
      return `${this.publicUrl}/${key}`;
    }

    // Sinon, construire l'URL à partir de l'endpoint
    const endpoint = process.env.CLOUDFLARE_ENDPOINT_URL;
    return `${endpoint}/${this.bucketName}/${key}`;
  }

  /**
   * Générer une clé unique pour un fichier
   * @param {string} folder - Dossier (ex: "profiles", "prompts/images")
   * @param {string} userId - ID de l'utilisateur
   * @param {string} filename - Nom du fichier original
   * @returns {string} Clé unique
   */
  generateKey(folder, userId, filename) {
    const timestamp = Date.now();
    const safeName = filename.replace(/[^a-zA-Z0-9_.-]/g, "_");
    const ext = path.extname(safeName);
    const basename = path.basename(safeName, ext);

    return `${folder}/${userId}-${timestamp}-${basename}${ext}`;
  }

  /**
   * Déterminer le Content-Type d'un fichier
   * @param {string} filename - Nom du fichier
   * @returns {string} Content-Type
   */
  _getContentType(filename) {
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
      ".pdf": "application/pdf",
    };

    return mimeTypes[ext] || "application/octet-stream";
  }
}

module.exports = new R2StorageService();
