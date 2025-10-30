const helmet = require("helmet");

module.exports = function setupHelmet(app) {
  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          "default-src": ["'self'"],
          "img-src": ["'self'", "data:", "https:"],
          "script-src": ["'self'", "'unsafe-inline'"],
        },
      },
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: false,
    })
  );

  app.use(helmet.noSniff());
  app.use(helmet.hidePoweredBy());
  app.use(helmet.frameguard({ action: "deny" }));
  app.use(helmet.xssFilter());
};
