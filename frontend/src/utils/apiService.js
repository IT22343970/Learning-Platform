import axiosInstance from './axios';

/**
 * Admin Dashboard API Service
 * Centralizes all admin dashboard API calls with proper error handling and response formatting
 */
class AdminApiService {
  /**
   * Fetch recent users data
   * @param {number} limit - Number of users to fetch (default: 5)
   * @returns {Promise<Array>} - Array of recent users
   */
  static async fetchRecentUsers(limit = 5) {
    try {
      // Try the specific recent users endpoint first
      const response = await axiosInstance.get(`/api/admin/users/recent?limit=${limit}`);
      
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      }
      
      if (response.data && response.data.users && Array.isArray(response.data.users)) {
        return response.data.users;
      }
      
      // Fallback: get all users and sort by createdAt
      const allUsers = await axiosInstance.get('/api/admin/users');
      
      if (Array.isArray(allUsers.data)) {
        return allUsers.data
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, limit);
      }
      
      if (allUsers.data && allUsers.data.users && Array.isArray(allUsers.data.users)) {
        return allUsers.data.users
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, limit);
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching recent users:', error);
      return [];
    }
  }

  /**
   * Fetch recent posts data
   * @param {number} limit - Number of posts to fetch (default: 5)
   * @returns {Promise<Array>} - Array of recent posts
   */
  static async fetchRecentPosts(limit = 5) {
    try {
      // Try the specific recent posts endpoint first
      const response = await axiosInstance.get(`/api/admin/posts/recent?limit=${limit}`);
      
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      }
      
      if (response.data && response.data.posts && Array.isArray(response.data.posts)) {
        return response.data.posts;
      }
      
      // Fallback: get all posts and sort by createdAt
      const allPosts = await axiosInstance.get('/api/admin/posts');
      
      if (Array.isArray(allPosts.data)) {
        return allPosts.data
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, limit);
      }
      
      if (allPosts.data && allPosts.data.posts && Array.isArray(allPosts.data.posts)) {
        return allPosts.data.posts
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, limit);
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching recent posts:', error);
      return [];
    }
  }

  /**
   * Fetch all dashboard stats in a single call
   * @returns {Promise<Object>} - Dashboard statistics
   */
  static async fetchDashboardStats() {
    try {
      const [userStats, postStats, recentUsers, recentPosts] = await Promise.allSettled([
        axiosInstance.get("/api/admin/stats/users"),
        axiosInstance.get("/api/admin/stats/posts"),
        this.fetchRecentUsers(),
        this.fetchRecentPosts()
      ]);

      return {
        userStats: userStats.status === 'fulfilled' ? userStats.value.data : {},
        postStats: postStats.status === 'fulfilled' ? postStats.value.data : {},
        recentUsers: recentUsers.status === 'fulfilled' ? recentUsers.value : [],
        recentPosts: recentPosts.status === 'fulfilled' ? recentPosts.value : []
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        userStats: {},
        postStats: {},
        recentUsers: [],
        recentPosts: []
      };
    }
  }
}

export default AdminApiService;
