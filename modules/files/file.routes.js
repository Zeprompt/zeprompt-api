const express = require("express");
const router = express.Router();
const fileController = require("./file.controller");
const AuthMiddleware = require("../../middleware/auth");

// Route pour vérifier le statut d'un job
router.get(
  "/job/:jobId",
  AuthMiddleware.authenticate,
  (req, res, next) => fileController.getJobStatus(req, res, next)
);

// Route pour obtenir les statistiques de la queue
router.get(
  "/queue/stats",
  AuthMiddleware.authenticate,
  (req, res, next) => fileController.getQueueStats(req, res, next)
);

module.exports = router;
