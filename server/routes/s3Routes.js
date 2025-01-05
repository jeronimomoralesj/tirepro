const express = require('express');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const router = express.Router();

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

router.post('/s3/presigned-url', async (req, res) => {
  const { tireId, fileName } = req.body;

  if (!tireId || !fileName) {
    return res.status(400).send('Tire ID and file name are required');
  }

  try {
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `tires/${tireId}/${fileName}`,
      ContentType: 'image/jpeg',
      ACL: 'public-read', // Make file publicly readable
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 60 });
    res.json({ url });
  } catch (error) {
    console.error('Error generating pre-signed URL:', error);
    res.status(500).send('Error generating pre-signed URL');
  }
});

module.exports = router;
