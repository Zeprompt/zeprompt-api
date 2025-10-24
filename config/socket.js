const { Server } = require("socket.io");

let io;

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`Client connected : ${socket.id}`);

    socket.on("clientMessage", (data) => {
      console.log("Message from client :", data);
    });
    socket.on("disconnect", () => {
      console.log(`Client disconnected : ${socket.id}`);
    });
  });
}

function getIO() {
  if (!io) throw new Error("Socket.io not initialized !");
  return io;
}

module.exports = { initSocket, getIO };
