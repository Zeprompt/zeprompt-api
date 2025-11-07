require("dotenv").config();
require("./workers/emailWorker");
require("./workers/fileWorker");
const http = require("http");

const express = require("express");
const cors = require("cors");
const logger = require("./utils/logger");
const { sequelize } = require("./models");
const redisClient = require("./config/redis");
const setupHelmet = require("./config/helmet");
const setupRateLimit = require("./config/rateLimit");
const authRoutes = require("./modules/auth/auth.routes");
const tagRoutes = require("./modules/tags/tag.routes");
const promptRoutes = require("./modules/prompts/prompt.routes");
const userRoutes = require("./modules/users/user.routes");
const fileRoutes = require("./modules/files/file.routes");
const statsRoutes = require("./modules/stats/stats.routes");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const errorHandler = require("./middleware/errorHandler");
const { initSocket } = require("./config/socket");

const app = express();
const port = process.env.PORT || 3005;

// Configuration CORS
const corsOptions = {
  origin: function (origin, callback) {
    // Autoriser les requêtes sans origine (comme Postman, curl, etc.)
    if (!origin) {
      logger.info('✅ CORS: Requête sans origine autorisée');
      return callback(null, true);
    }
    
    // Liste des origines autorisées
    const allowedOrigins = [
      'http://localhost:3005',
      'http://localhost:3001',
      'http://localhost:5173',
      process.env.FRONTEND_URL
    ].filter(Boolean); // Retirer les valeurs undefined
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      logger.info(`✅ CORS: Origine autorisée: ${origin}`);
      callback(null, true);
    } else {
      logger.warn(`⚠️ CORS: Origine non autorisée: ${origin}`);
      callback(null, true); // En développement, on autorise quand même
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers'
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400 // 24 heures
};

// Configuration du trust proxy pour express-rate-limit
// Permet de récupérer correctement l'IP des clients derrière un proxy/load balancer
app.set('trust proxy', 1);

// Sécurité HTTP avec Helmet (avant CORS pour éviter les conflits)
setupHelmet(app);

// Configuration CORS (après Helmet)
app.use(cors(corsOptions));

// Augmentation de la limite de taille du body pour les uploads d'images en base64
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

setupRateLimit(app);
const server = http.createServer(app);
initSocket(server);

// Servir les fichiers statiques d'upload (pour le développement)
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use("/api/auth", authRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/prompts", promptRoutes);
app.use("/api/users", userRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/stats", statsRoutes);
// Swagger UI
app.use(
  "/api/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, { explorer: true })
);

/**
 * @openapi
 * /api/health:
 *   get:
 *     summary: Health check
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: Service status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 uptime:
 *                   type: number
 *                   description: Process uptime in seconds
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 version:
 *                   type: string
 */
app.get("/api/health", (req, res) => {
  const { version } = require("./package.json");
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    version,
  });
});

// Gestion des erreurs
app.use(errorHandler);

// Redis connection
redisClient.on("connect", () => logger.info("✅ Connexion Redis réussie"));
redisClient.on("error", (error) =>
  logger.error("❌ Erreur connexion Redis:", error)
);

// DB connection
(async () => {
  try {
    await sequelize.authenticate();
    logger.info("✅ Connexion DB réussie");
  } catch (error) {
    logger.error("❌ Erreur connexion DB:", error);
  }
})();

// Gestion globale des erreurs non gérées
process.on("uncaughtException", (err) => {
  logger.error("❌ Uncaught Exception:", err);
  process.exit(1);
});
process.on("unhandledRejection", (reason, promise) => {
  logger.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
});

server.listen(port, () => {
  logger.info(`🚀 API démarrée sur http://localhost:${port}`);
});
