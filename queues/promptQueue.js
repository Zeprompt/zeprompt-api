const { createQueue } = require("./queueFactory");
const promptQueue = createQueue("promptQueue");

module.exports = promptQueue;
