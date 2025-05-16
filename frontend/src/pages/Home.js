/** @jsxImportSource react */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CreatePost from "../components/CreatePost";
import Post from "../components/Post";
import axiosInstance from "../utils/axios";

function Home() {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("newest");
  const navigate = useNavigate();

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

  const fetchPosts = async () => {
    try {
      console.log("Fetching posts...");
      setLoading(true);
      const response = await axiosInstance.get("/api/posts");
      console.log("Posts API response:", response.data);

      const processedPosts = response.data.map(post => {
        if (!post.userName || post.userName === "Deleted User") {
          if (post.userFirstName || post.userLastName) {
            post.userName = `${(post.userFirstName || '')} ${(post.userLastName || '')}`.trim();

          }
        }
        return post;
      });

      setPosts(processedPosts);
      setFilteredPosts(processedPosts);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchPosts();
  }, []);

  useEffect(() => {
    let updatedPosts = [...posts];

    if (searchQuery) {
      updatedPosts = updatedPosts.filter(
        post =>
          post.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.userName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (sortOption === "newest") {
      updatedPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortOption === "oldest") {
      updatedPosts.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortOption === "likes") {
      updatedPosts.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    }

    setFilteredPosts(updatedPosts);
  }, [searchQuery, sortOption, posts]);

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
     newPost.userName = `${(currentUser.firstName || '')} ${(currentUser.lastName || '')}`.trim();
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

  const handlePostDeleted = (postId) => {
    setPosts(posts.filter((post) => post.id !== postId));
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts(
      posts.map((post) => (post.id === updatedPost.id ? updatedPost : post))
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-green-600 to-blue-500">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-green-600 to-blue-500 text-gray-900 min-h-screen font-sans">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md shadow-md">
        <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <h1 className="text-2xl font-bold text-gray-900">Learnora</h1>
          </div>
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 px-4 py-2 rounded-3xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-500"
              aria-label="Search posts"
            />
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="px-4 py-2 rounded-3xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 bg-white"
              aria-label="Sort posts"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="likes">Most Liked</option>
            </select>
            <button
              onClick={fetchPosts}
              className="p-2 rounded-3xl bg-green-600 text-white hover:bg-green-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500"
              aria-label="Refresh posts"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9H0m0 0v5h5.582M20 20v-5h-.582m-15.356-2A8.001 8.001 0 0019.418 15H24m0 0v-5h-5.582" />
              </svg>
            </button>
            <button
              onClick={handleLogout}
              className="p-2 rounded-3xl bg-red-600 text-white hover:bg-red-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500"
              aria-label="Log out"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto py-8 px-4">
        <div className="mb-8 animate-fade-in">
          <CreatePost 
            onPostCreated={handlePostCreated} 
            debugFn={debugCreatePost}
            user={user}
          />
        </div>

        {filteredPosts && filteredPosts.length > 0 ? (
          <ul className="flex flex-col gap-6">
            {filteredPosts.map((post, index) => (
              <li
                key={post.id}
                className="animate-slide-up"
               style={{ animationDelay: `${index * 100}ms` }}

              >
                <Post
                  post={post}
                  onPostDeleted={handlePostDeleted}
                  onPostUpdated={handlePostUpdated}
                />
              </li>
            ))}
          </ul>
        ) : (
          <div className="bg-white/80 backdrop-blur-md text-black rounded-3xl shadow-md p-8 text-center animate-fade-in">
            <p className="text-gray-600">No posts available. Be the first to create a post!</p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }
        .animate-slide-up {
          animation: slideUp 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}

export default Home;