const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const { isAuthenticated, isAdmin } = require('../middleware/authMiddleware');

// Admin routes
// All routes are protected by isAuthenticated and isAdmin middleware

// User routes
router.get('/users/recent', isAuthenticated, isAdmin, AdminController.getRecentUsers);

// Post routes
router.get('/posts/recent', isAuthenticated, isAdmin, AdminController.getRecentPosts);

// Statistics routes
router.get('/stats/users', isAuthenticated, isAdmin, AdminController.getUserStats);
router.get('/stats/posts', isAuthenticated, isAdmin, AdminController.getPostStats);

module.exports = router;
