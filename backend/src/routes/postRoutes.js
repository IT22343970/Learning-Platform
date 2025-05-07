const express = require('express');
const router = express.Router();
const postController = require('../main/java/com/example/backend/controller/postController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Create a new post (protected route)
router.post('/', authenticateToken, postController.createPost);

// Get all posts
router.get('/', postController.getAllPosts);

// Get posts by group
router.get('/group/:groupId', postController.getPostsByGroup);

module.exports = router;
