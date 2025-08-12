const { Worker } = require("bullmq");
const redisConnection = require("../config/redis");
const EmailUtils = require("../utils/emailUtils");

const emailWorker = new Worker(
  "emailQueue",
  async (job) => {
    const { to, subject, htmlContent, options } = job.data;

    console.log("🚀 Email worker started");

    const result = await EmailUtils.sendEmail(
      to,
      subject,
      htmlContent,
      options
    );

    if (!result.success) {
      throw new Error(`Failed to send email to ${to}: ${result.error}`);
    }

    console.log(`Email envoyé avec succès à ${to}`);
    return Promise.resolve();
  },
  {
    connection: redisConnection,
    concurrency: 5,
  }
);

emailWorker.on("failed", (job, err) => {
  console.error(`Job ${job.id} failed : `, err);
});

module.exports = emailWorker;
