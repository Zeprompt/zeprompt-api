const rateLimit = require("express-rate-limit");

module.exports = function setupRateLimit(app) {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
      status: 429,
      error: "Trop de requêtes, réessayez plus tard.",
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Désactiver la vérification stricte du X-Forwarded-For
    // utile en développement local ou sans proxy
    trustProxy: false,
  });

  app.use(limiter);
};
