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

// Définition des constantes
const port = 3000;

// Middleware globaux
app.use(cors());
app.use(express.json());
setupHelmet(app);
setupRateLimit(app);

// Différentes routes
app.use("/api/auth", authRoutes);
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
