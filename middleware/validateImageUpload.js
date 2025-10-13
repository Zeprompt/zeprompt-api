const allowedTags = [
  "design",
  "marketing",
  "social media",
  "education",
  "creative",
  "health",
  "personal",
];

module.exports = function validateImageUpload(req, res, next) {
  try {
    const { tags } = req.body;
    if (!req.file) return next(); // Si pas d'image, passe !

    let parsedTags = [];
    if (typeof tags === "string") {
      parsedTags = tags.split(",").map((tag) => tag.trim().toLowerCase());
    } else if (Array.isArray(tags)) {
      parsedTags = tags.map((t) => t.toLowerCase());
    }

    const isImageAllowed = parsedTags.some((tag) => allowedTags.includes(tag));

    if (!isImageAllowed) {
      return res.status(400).json({
        error: "Image not allowed for the selected tags.",
      });
    }

    next();
  } catch (error) {
    console.error("Erreur validateImageUpload : ", error);
    res.status(500).json({ error: error.message });
  }
};
