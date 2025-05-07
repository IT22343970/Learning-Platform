import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import axiosInstance from "../utils/axios";
import Header from "../components/Header";
import Post from "../components/Post";

function Profile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: authUser } = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [error, setError] = useState("");

  // Use auth context instead of localStorage
  const isOwnProfile = authUser?.id === userId;

  useEffect(() => {
    // Redirect to current user's profile if no userId is provided
    if (!userId && authUser) {
      navigate(`/profile/${authUser.id}`);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setPostsLoading(true);
      try {
        // Fetch user data
        const userResponse = await axiosInstance.get(
          `/api/users/${userId || authUser.id}`
        );
        setUser(userResponse.data);
        setLoading(false);

        // Fetch posts separately
        try {
          const postsResponse = await axiosInstance.get(
            `/api/users/${userId || authUser.id}/posts`
          );
          const sortedPosts = postsResponse.data.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          setPosts(sortedPosts);
        } catch (postError) {
          console.error("Error fetching posts:", postError);
          setPosts([]);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError(
          error.response?.status === 404
            ? "User not found"
            : "Failed to load profile"
        );
        setLoading(false);
      } finally {
        setPostsLoading(false);
      }
    };

    if (authUser) {
      fetchData();
    }
  }, [userId, authUser, navigate]);

  const handlePostDeleted = (postId) => {
    setPosts(posts.filter((post) => post.id !== postId));
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts(
      posts.map((post) => (post.id === updatedPost.id ? updatedPost : post))
    );
  };

  // Show loading state for a reasonable time only
  if (loading) {
    return (
      <>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </>
    );
  }

  // Show error state
  if (error && !user) {
    return (
      <>
        <div className="flex justify-center items-center min-h-screen">
          <div className="bg-red-100 text-red-700 p-4 rounded-lg">{error}</div>
        </div>
      </>
    );
  }

  // Show not found state as a fallback
  if (!user) {
    return (
      <>
        <div className="flex justify-center items-center min-h-screen">
          <div className="bg-yellow-100 text-yellow-700 p-4 rounded-lg">
            User not found
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="max-w-4xl mx-auto p-4">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row items-center md:items-start">
            <div className="w-32 h-32 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden mb-4 md:mb-0 md:mr-6">
              {user.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={`${user.firstName} ${user.lastName}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://via.placeholder.com/150?text=" +
                      user.firstName?.charAt(0);
                  }}
                />
              ) : (
                <span className="text-4xl font-semibold text-gray-600">
                  {user.firstName?.charAt(0)}
                </span>
              )}
            </div>

            <div className="text-center md:text-left">
              <h1 className="text-2xl font-bold">
                {user.firstName} {user.lastName}
              </h1>
              <p className="text-gray-600 mt-1">{user.email}</p>

              {user.bio && (
                <div className="mt-3 text-gray-700">
                  <p>{user.bio}</p>
                </div>
              )}

              {isOwnProfile && (
                <button
                  onClick={() => navigate(`/edit-profile`)}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-200"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>

        {/* User's Posts */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">
            {isOwnProfile ? "My Posts" : `${user?.firstName}'s Posts`}
          </h2>

          {postsLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-gray-500">
                {isOwnProfile
                  ? "You haven't created any posts yet"
                  : "This user hasn't created any posts yet"}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <Post
                  key={post.id}
                  post={post}
                  onPostDeleted={handlePostDeleted}
                  onPostUpdated={handlePostUpdated}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Profile;
