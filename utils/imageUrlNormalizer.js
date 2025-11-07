/**
 * Utilitaire pour normaliser les URLs d'images
 * Gère à la fois les URLs R2 et les chemins locaux
 */

/**
 * Convertit un chemin de fichier ou une URL en URL accessible publiquement
 * @param {string|null} imagePath - Chemin local ou URL R2
 * @returns {string|null} - URL publique accessible
 */
const normalizeImageUrl = (imagePath) => {
  if (!imagePath) {
    return null;
  }

  // Si c'est déjà une URL R2 Cloudflare, la retourner telle quelle
  if (imagePath.startsWith('https://')) {
    return imagePath;
  }

  // Si c'est un chemin local (ex: /app/uploads/... ou uploads/...)
  // Le convertir en URL locale pour le développement
  if (imagePath.includes('uploads/')) {
    // Extraire le chemin relatif après "uploads/"
    const relativePath = imagePath.split('uploads/')[1] || imagePath;
    
    // Construire l'URL publique
    const baseUrl = process.env.API_URL || 'http://localhost:3005';
    return `${baseUrl}/uploads/${relativePath}`;
  }

  // Sinon, retourner tel quel (pour les autres cas)
  return imagePath;
};

module.exports = {
  normalizeImageUrl,
};

