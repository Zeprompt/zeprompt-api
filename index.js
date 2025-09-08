require("dotenv").config();
require("./workers/emailWorker");

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
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
setupHelmet(app);
setupRateLimit(app);

app.use("/api/auth", authRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/prompts", promptRoutes);
// Swagger UI
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));

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

app.get("/", (req, res) => {
  res.send("Hello World! yeah");
});

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

app.listen(port, () => {
  logger.info(`🚀 API démarrée sur http://localhost:${port}`);
});
