const { io } = require("socket.io-client");
const logger = require("./utils/logger");

const socket = io("http://localhost:3000", {
  transports: ["websocket"], // Force l'utilisation du WebSocket pur
});

socket.on("prompt:likeUpdated", (data) => {
  logger.info("Like updated:", data);
});

socket.on("connect", () => {
  logger.info("✅ Connecté au serveur WebSocket :", socket.id);
  socket.emit("clientMessage", { message: "Test depuis le client Node.js" });
});

socket.on("connect_error", (err) => {
  logger.error("❌ Erreur de connexion :", err.message);
});

socket.on("disconnect", (reason) => {
  logger.info("❌ Déconnecté du serveur WebSocket :", reason);
});

socket.on("new_prompt_created", (prompt) => {
  logger.info("Nouveau prompt reçu :", prompt);
});
