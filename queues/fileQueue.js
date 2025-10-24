const { Queue } = require('bullmq');
const redisConnection = require("../config/redis");

const fileQueue = new Queue('fileQueue', {
    connection: redisConnection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 2000,
        },
        removeOnComplete: {
            age: 3600, // Garder les jobs complétés pendant 1 heure
            count: 100,
        },
        removeOnFail: {
            age: 24 * 3600, // Garder les jobs échoués pendant 24 heures
        },
    },
});

module.exports = fileQueue;
