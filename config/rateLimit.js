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
  });

  app.use(limiter);
};
