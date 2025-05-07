const User = require('../models/User');
const Post = require('../models/Post');

/**
 * Admin controller for dashboard operations
 */
class AdminController {
  /**
   * Get recent users
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getRecentUsers(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 5;
      
      const users = await User.find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .select('firstName lastName email createdAt');
      
      return res.status(200).json(users);
    } catch (error) {
      console.error('Error getting recent users:', error);
      return res.status(500).json({ 
        message: 'Error retrieving recent users', 
        error: error.message 
      });
    }
  }

  /**
   * Get recent posts
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getRecentPosts(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 5;
      
      const posts = await Post.find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('author', 'firstName lastName')
        .select('title createdAt author');
      
      // Format the response to include username
      const formattedPosts = posts.map(post => ({
        id: post._id,
        title: post.title,
        createdAt: post.createdAt,
        username: post.author ? `${post.author.firstName} ${post.author.lastName}` : 'Unknown User'
      }));
      
      return res.status(200).json(formattedPosts);
    } catch (error) {
      console.error('Error getting recent posts:', error);
      return res.status(500).json({ 
        message: 'Error retrieving recent posts', 
        error: error.message 
      });
    }
  }

  /**
   * Get user statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getUserStats(req, res) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const [total, newToday, active] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ createdAt: { $gte: today } }),
        User.countDocuments({ lastLogin: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } })
      ]);
      
      return res.status(200).json({
        total,
        newToday,
        active
      });
    } catch (error) {
      console.error('Error getting user stats:', error);
      return res.status(500).json({ 
        message: 'Error retrieving user statistics', 
        error: error.message 
      });
    }
  }

  /**
   * Get post statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getPostStats(req, res) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const [total, todayTotal] = await Promise.all([
        Post.countDocuments(),
        Post.countDocuments({ createdAt: { $gte: today } })
      ]);
      
      return res.status(200).json({
        total,
        todayTotal
      });
    } catch (error) {
      console.error('Error getting post stats:', error);
      return res.status(500).json({ 
        message: 'Error retrieving post statistics', 
        error: error.message 
      });
    }
  }
}

module.exports = AdminController;
