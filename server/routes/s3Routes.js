const express = require('express');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const router = express.Router();

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

router.post('/s3/presigned-url', async (req, res) => {
  try {
    const { userId, fileName, uploadType } = req.body;

    // Validate incoming request
    if (!userId || !fileName) {
      return res.status(400).json({ error: 'User ID and file name are required.' });
    }

    // Determine S3 key based on upload type
    let key;
    if (uploadType === 'profile') {
      key = `users/${userId}/profile/${fileName}`;
    } else {
      key = `tires/${userId}/${fileName}`; // Default to tires path
    }

    // Prepare S3 upload command
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      ContentType: 'image/jpeg', // Adjust if needed
      ACL: 'public-read', // Ensure the bucket policy allows this
    });

    // Generate a pre-signed URL (valid for 5 minutes)
    const url = await getSignedUrl(s3Client, command, { expiresIn: 300 });

    // Return the pre-signed URL and public S3 URL for accessing the uploaded image
    res.json({
      url,
      imageUrl: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
    });
  } catch (error) {
    console.error('Error generating pre-signed URL:', error);
    res.status(500).json({ error: `Error generating pre-signed URL: ${error.message}` });
  }
});


module.exports = router;
