const { Queue } = require("bullmq");
const redisClient = require("../config/redis");

function createQueue(name) {
  return new Queue(name, { connection: redisClient });
}

module.exports = { createQueue };
