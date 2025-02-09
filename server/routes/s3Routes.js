const express = require('express');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const Post = require('../models/Post');  // Import the Post model

const router = express.Router();

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// --- Route to get pre-signed URL and save post metadata ---
router.post('/s3/upload-post', async (req, res) => {
  const { userId, fileName, uploadType, contentType, textContent } = req.body;

  if (!userId || !fileName) {
    return res.status(400).send('User ID and file name are required');
  }

  try {
    // Determine where to store the file based on the upload type (profile pic, post, etc.)
    let key;
    if (uploadType === 'profile') {
      key = `users/${userId}/profile/${fileName}`;
    } else {
      key = `posts/${userId}/${fileName}`;  // Store files under "posts/userId/"
    }

    // Step 1: Generate S3 pre-signed URL
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      ContentType: contentType || 'image/jpeg',  // Allow dynamic content types
      ACL: 'public-read',
    });

    const s3UploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 });

    // Step 2: Construct the file's public URL (S3 public link)
    const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    // Step 3: Create and save post metadata
    const post = new Post({
      userId,
      content: {
        type: contentType.includes('audio') ? 'audio' : 'image',  // Determine content type
        data: fileUrl,
      },
      ...(textContent && { content: { type: 'text', data: textContent } }),  // Support text posts too
    });

    const savedPost = await post.save();

    // Step 4: Respond with pre-signed URL and post data
    res.status(201).json({
      uploadUrl: s3UploadUrl,
      post: savedPost,
      message: 'Upload URL generated, and post metadata saved!',
    });
  } catch (error) {
    console.error('Error generating upload URL or saving post:', error);
    res.status(500).send('Error generating upload URL or saving post');
  }
});

module.exports = router;
