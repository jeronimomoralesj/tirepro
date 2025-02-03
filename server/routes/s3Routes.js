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
  const { userId, fileName, uploadType } = req.body;

  if (!userId || !fileName) {
    return res.status(400).send('User ID and file name are required');
  }

  try {
    let key;
    if (uploadType === 'profile') {
      key = `users/${userId}/profile/${fileName}`;
    } else {
      key = `tires/${userId}/${fileName}`; // Existing logic for tires
    }

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      ContentType: 'image/jpeg',
      ACL: 'public-read',
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 60 });
    res.json({ url, imageUrl: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}` });
  } catch (error) {
    console.error('Error generating pre-signed URL:', error);
    res.status(500).send('Error generating pre-signed URL');
  }
});

module.exports = router;
