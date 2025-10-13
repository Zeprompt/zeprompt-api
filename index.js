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
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const errorHandler = require("./middleware/errorHandler");
const { initSocket } = require("./config/socket");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Sécurité HTTP avec Helmet
setupHelmet(app);
setupRateLimit(app);
const server = http.createServer(app);
initSocket(server);

app.use("/api/auth", authRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/prompts", promptRoutes);
app.use("/api/users", userRoutes);
app.use("/api/files", fileRoutes);
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
