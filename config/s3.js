const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
require("dotenv").config();

const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.CLOUDFLARE_ENDPOINT_URL,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY,
  },
});

module.exports = { s3Client, PutObjectCommand };
