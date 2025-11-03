const express = require("express");
const router = express.Router();
const statsController = require("./stats.controller");

// Route publique pour récupérer les statistiques globales
router.get("/global", (req, res, next) =>
  statsController.getGlobalStats(req, res, next)
);

module.exports = router;
