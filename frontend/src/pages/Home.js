import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate from react-router-dom
import CreatePost from "../components/CreatePost"; // Import CreatePost component
import Post from "../components/Post"; // Import Post component
import axiosInstance from "../utils/axios";

function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Fetch user data
  const fetchUserData = async () => {
    try {
      const userData = localStorage.getItem("user");
      if (!userData) {
        navigate("/login");
        return;
      }

      const user = JSON.parse(userData);
      setUser(user);
    } catch (error) {
      console.error("Error fetching user data:", error);
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  // Debugging function for Create Post
  const debugCreatePost = (formData) => {
    console.group("Create Post Debug Info");
    console.log("User ID:", user?.id);
    console.log("Token present:", !!localStorage.getItem("token"));
    console.log("Form data:", formData);
    console.groupEnd();
    
    return {
      userId: user?.id,
      token: localStorage.getItem("token")
    };
  };

  // Fetch posts data
  const fetchPosts = async () => {
    try {
      console.log("Fetching posts...");
      const response = await axiosInstance.get("/api/posts");
      console.log("Posts API response:", response.data);

      const processedPosts = response.data.map(post => {
        if (!post.userName || post.userName === "Deleted User") {
          if (post.userFirstName || post.userLastName) {
            post.userName = `${post.userFirstName || ''} ${post.userLastName || ''}`.trim();
          }
        }
        return post;
      });

      setPosts(processedPosts);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetching posts and user data on component mount
  useEffect(() => {
    fetchUserData();
    fetchPosts();
  }, []);

  // Handle new post creation
  const handlePostCreated = (newPost) => {
    console.log("New post created:", newPost);

    if (!newPost || typeof newPost !== 'object') {
      console.error("Invalid post object returned:", newPost);
      alert("Failed to create post: Invalid response format");
      return;
    }

    if (!newPost.userName || newPost.userName === "Deleted User") {
      const currentUser = JSON.parse(localStorage.getItem("user"));
      if (currentUser) {
        newPost.userName = `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim();
        console.log("Updated post with user name:", newPost.userName);
      }
    }

    if (!newPost.id) {
      console.warn("Created post missing ID, generating temporary ID");
      newPost.id = `temp-${Date.now()}`;
    }

    setPosts(prevPosts => [newPost, ...prevPosts]);
    console.log("Posts state updated. Total posts:", posts.length + 1);

    setTimeout(() => {
      fetchPosts();
    }, 1000);
  };

  // Handle post deletion
  const handlePostDeleted = (postId) => {
    setPosts(posts.filter((post) => post.id !== postId));
  };

  // Handle post update
  const handlePostUpdated = (updatedPost) => {
    setPosts(
      posts.map((post) => (post.id === updatedPost.id ? updatedPost : post))
    );
  };

  // Show loading spinner while posts are being fetched
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400"></div>
      </div>
    );
  }

  return (
    <div className="bg-green-100 text-gray-900 min-h-screen"> {/* Light green background */}
      <div className="max-w-2xl mx-auto py-8 px-4">
        {/* CreatePost component */}
        <CreatePost 
          onPostCreated={handlePostCreated} 
          debugFn={debugCreatePost}
          user={user}
        />
        {posts && posts.length > 0 ? (
          posts.map((post) => (
            <Post
              key={post.id}
              post={post}
              onPostDeleted={handlePostDeleted}
              onPostUpdated={handlePostUpdated}
            />
          ))
        ) : (
          <div className="bg-white text-black rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600">No posts available. Be the first to create a post!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
