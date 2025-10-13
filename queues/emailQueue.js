const {createQueue} = require("./queueFactory");
const emailQueue = createQueue("emailQueue");

module.exports = emailQueue;