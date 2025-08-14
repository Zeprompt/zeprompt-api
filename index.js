require("dotenv").config();
require("./workers/emailWorker");
const express = require("express");
const app = express();
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

// Définition des constantes
const port = 3000;

// Middleware globaux
app.use(cors());
app.use(express.json());
setupHelmet(app);
setupRateLimit(app);

// Différentes routes
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
  res.send("Hello World!");
});

// Test Redis connection
(async () => {
  try {
    redisClient.on("connect", () => {
      logger.info("✅ Connexion Redis réussie");
    });

    redisClient.on("error", (error) => {
      console.error("❌ Erreur connexion Redis:", error);
    });
  } catch (error) {
    console.error("❌ Erreur connexion Redis:", error);
  }
})();

// Test DB Sequelize connection
(async () => {
  try {
    await sequelize.authenticate();
    logger.info("✅ Connexion DB réussie");
  } catch (error) {
    console.error("❌ Erreur connexion DB:", error);
  }
})();

app.listen(port, () => {
  logger.info(`Example app listening at http://localhost:${port}`);
});
