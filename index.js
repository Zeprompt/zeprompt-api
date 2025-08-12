const express = require("express");
const app = express();
const port = 3000;
require("dotenv").config();
const { sequelize } = require("./models");
const redisClient = require("./config/redis");
require("./workers/emailWorker");
const authRoutes = require("./modules/auth/auth.routes");

app.use(express.json())
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Test Redis connection
(async () => {
  try {
    redisClient.on("connect", () => {
        console.log("✅ Connexion Redis réussie");
    })

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
    console.log("✅ Connexion DB réussie");
  } catch (error) {
    console.error("❌ Erreur connexion DB:", error);
  }
})();

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
