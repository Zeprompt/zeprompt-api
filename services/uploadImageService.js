const { PutObjectCommand, s3Client } = require("../config/s3");

require("dotenv").config();

async function uploadImage(key, body, contentType) {
  const params = {
    Bucket: process.env.CLOUDFLARE_BUCKET_NAME,
    key: key,
    Body: body,
    ContentType: contentType,
  };

  const command = new PutObjectCommand(params);
  await s3Client.send(command);

  return `${process.env.CLOUDFLARE_PUBLIC_URL}/${key}`;
}

module.exports = { uploadImage };
