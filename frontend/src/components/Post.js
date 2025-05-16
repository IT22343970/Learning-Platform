/** @jsxImportSource react */
import React, { useState, useEffect } from "react";
import axiosInstance from "../utils/axios";
import Comments from "./Comments";
import ReactionButton from "./ReactionButton";
import ReportModal from "./ReportModal";

function Post({ post, onPostDeleted, onPostUpdated }) {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [editImages, setEditImages] = useState([]);
  const [editPreviewUrls, setEditPreviewUrls] = useState([]);
  const [deleting, setDeleting] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [mediaUrls, setMediaUrls] = useState({});
  const [mediaErrors, setMediaErrors] = useState({});
  const [showComments, setShowComments] = useState(false);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentCount, setCommentCount] = useState(post.comments?.length || 0);
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(Date.now());
  const [showReportModal, setShowReportModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (user && user.role === "ROLE_ADMIN") {
      setIsUserAdmin(true);
    }
  }, [user]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getFullUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
   return `${window.location.protocol}//${window.location.hostname}:8081${url}`;
  };

  const getMediaUrl = async (mediaId, originalUrl) => {
    try {
      const mediaType = post.mediaTypes && post.mediaTypes[mediaId];
     const response = await axiosInstance.get(`/api/media/${mediaId}`, {
        responseType: "blob",
      });

      if (response.data && response.data.url) {
        return response.data.url;
      } else if (response.data instanceof Blob && response.data.size > 0) {
        return URL.createObjectURL(response.data);
      }

      console.warn(`Invalid or empty media data for ${mediaId}, using fallback URL`);
      return getFullUrl(originalUrl);
    } catch (error) {
      console.error(`Error loading media ${mediaId}:`, error);
      setMediaErrors((prev) => ({ ...prev, [mediaId]: true }));
      return getFullUrl(originalUrl);
    }
  };

  useEffect(() => {
    const loadMedia = async () => {
      const newMediaUrls = {};

      if (post.videoUrl) {
        const mediaId = post.videoUrl.split("/").pop();
        try {
          newMediaUrls.video = await getMediaUrl(mediaId, post.videoUrl);
        } catch (error) {
          console.error("Failed to load video:", error);
        }
      }

      if (post.imageUrls?.length) {
        for (const url of post.imageUrls) {
          const mediaId = url.split("/").pop();
          try {
            const mediaUrl = await getMediaUrl(mediaId, url);
            newMediaUrls[mediaId] = mediaUrl;
          } catch (error) {
            console.error("Failed to load image:", error);
          }
        }
      }

      setMediaUrls(newMediaUrls);
    };

    loadMedia();

    return () => {
      Object.values(mediaUrls).forEach((url) => {
        if (url && typeof url === "string" && url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [post.videoUrl, post.imageUrls]);

  const refreshPostData = async () => {
    try {
     const response = await axiosInstance.get(`/api/posts/${post.id}`);
      if (response.data) {
        setCommentCount(response.data.comments?.length || 0);
        onPostUpdated?.(response.data);
        setLastRefreshed(Date.now());
      }
    } catch (error) {
      console.error("Error refreshing post data:", error);
    }
  };

  useEffect(() => {
    let refreshInterval;

    if (!showComments) {
      refreshInterval = setInterval(() => {
        refreshPostData();
      }, 30000);
    }

    return () => {
      if (refreshInterval) clearInterval(refreshInterval);
    };
  }, [showComments, post.id]);

  const handleReactionChange = (reactionData) => {
    setTimeout(() => {
      refreshPostData();
    }, 500);
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      setDeleting(true);
      if (isUserAdmin && user.id !== post.userId) {
       await axiosInstance.delete(`/api/posts/${post.id}?userId=${user.id}&isAdmin=true`);
      } else {
      await axiosInstance.delete(`/api/posts/${post.id}?userId=${user.id}`);
      }
      onPostDeleted?.(post.id);
      setShowMenu(false);
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Failed to delete post. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setShowMenu(false);
    setEditContent(post.content);
    setEditImages([]);
    setEditPreviewUrls([]);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setEditImages(files);
    const urls = files.map((file) => URL.createObjectURL(file));
    setEditPreviewUrls(urls);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!editContent.trim() && editImages.length === 0) return;

    try {
      setUpdating(true);
      const formData = new FormData();
      formData.append("userId", user.id);
      formData.append("content", editContent);
      editImages.forEach((image) => formData.append("images", image));

      const response = await axiosInstance.put(
        `/api/posts/${post.id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      onPostUpdated?.(response.data);
      setIsEditing(false);

      editPreviewUrls.forEach((url) => URL.revokeObjectURL(url));
    } catch (error) {
      console.error("Error updating post:", error);
      alert(error.response?.data || "Failed to update post. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const handleCommentClick = () => {
    setShowComments(!showComments);
    if (!showComments) {
      setShowCommentInput(true);
    }
  };

  const handleCommentCountChange = (newCount) => {
    setCommentCount(newCount);
  };

  const handleReportSuccess = () => {
    console.log("Report submitted successfully");
  };

  const handleNextImage = () => {
    if (currentImageIndex < post.imageUrls.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const handlePrevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="bg-white rounded-3xl shadow-md p-6 mb-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-fade-in">
      {/* Post Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 p-0.5">
            <div className="w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center">
              {post.userProfilePicture ? (
                <img
                  src={post.userProfilePicture}
                  alt={post.userName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-lg font-semibold text-indigo-600">
                  {post.userName?.charAt(0) || "U"}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center space-x-1">
              <h3 className="text-base font-bold text-gray-900">{post.userName || "Unknown User"}</h3>
              {isUserAdmin && (
                <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              )}
            </div>
            <p className="text-xs text-gray-500">{formatDate(post.createdAt)}</p>
          </div>
        </div>
        {user && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500"
              disabled={deleting || updating}
              aria-label="Post options"
            >
              <svg
                className={`w-5 h-5 ${deleting || updating ? 'text-gray-300' : 'text-gray-600'}`}

                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                />
              </svg>
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50 border border-gray-200 animate-slide-in">
                {user.id === post.userId && (
                  <button
                    onClick={handleEdit}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200 flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Post
                  </button>
                )}
                {user.id === post.userId || isUserAdmin ? (
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center ${deleting ? "text-gray-400" : "text-red-600 hover:bg-red-50"} transition-colors duration-200`}
                  >
                   <svg className={`w-4 h-4 mr-2 ${deleting ? "text-gray-400" : "text-red-500"}`}  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    {deleting
                      ? "Deleting..."
                      : isUserAdmin && user.id !== post.userId
                      ? "Delete as Admin"
                      : "Delete Post"}
                  </button>
                ) : (
                  <button
                    onClick={() => setShowReportModal(true)}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Report Post
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Post Media */}
      {isEditing ? (
        <div className="mb-4">
          <form onSubmit={handleUpdateSubmit} className="space-y-4">
            <textarea
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm text-gray-900 placeholder-gray-500"
              rows="4"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              disabled={updating}
              placeholder="What's on your mind?"
            />
            {editPreviewUrls.length > 0 && (
              <div className="relative">
                <img
                  src={editPreviewUrls[0]}
                  alt="Preview"
                  className="w-full aspect-[4/5] object-cover rounded-xl"
                />
              </div>
            )}
            <div className="flex justify-between items-center">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="edit-image-input"
                disabled={updating}
              />
              <label
                htmlFor="edit-image-input"
                className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl cursor-pointer transition-colors duration-200 text-sm"
              >
                <svg className="w-5 h-5 mr-2" fill hydrochlor="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Add Images
              </label>
              <div className="space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors duration-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
                  disabled={updating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating || (!editContent.trim() && editImages.length === 0)}
                  className={`px-4 py-2 rounded-xl text-white text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    updating || (!editContent.trim() && editImages.length === 0)
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {updating ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Updating...
                    </span>
                  ) : (
                    "Save"
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      ) : (
        <>
          {/* Media Content */}
          <div className="mb-4">
            {post.videoUrl ? (
              <video
                src={mediaUrls.video || getFullUrl(post.videoUrl)}
                className="w-full aspect-[4/5] object-contain bg-black rounded-xl"
                controls
                playsInline
                preload="metadata"
                onError={(e) => {
                  console.error("Video loading error:", e);
                  e.target.src =
                    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTAwJSIgaGViZ2h0PSIxMDAlIiBmaWxsPSIjZTFlMWUxIi8+Cjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5WaWRlbyBGYWlsZWQgdG8gTG9hZDwvdGV4dD4KPC9zdmc+";
                }}
              />
            ) : post.imageUrls?.length > 0 ? (
              <div className="relative">
                <img
                  src={mediaUrls[post.imageUrls[currentImageIndex]?.split("/").pop()] || getFullUrl(post.imageUrls[currentImageIndex])}
                  alt={`Post image ${currentImageIndex + 1}`}
                  className="w-full aspect-[4/5] object-cover rounded-xl"
                  onError={(e) => {
                    console.error("Image failed to load:", post.imageUrls[currentImageIndex]);
                    e.target.src =
                      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTFlMWUxIi8+Cjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBGYWlsZWQgdG8gTG9hZDwvdGV4dD4KPC9zdmc+";
                  }}
                />
                {post.imageUrls.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      disabled={currentImageIndex === 0}
                      className={`absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full text-white transition-opacity duration-200 focus:outline-none focus:ring-2 focus:ring-white ${
                        currentImageIndex === 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-black/70"
                      }`}
                      aria-label="Previous image"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={handleNextImage}
                      disabled={currentImageIndex === post.imageUrls.length - 1}
                      className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full text-white transition-opacity duration-200 focus:outline-none focus:ring-2 focus:ring-white ${
                        currentImageIndex === post.imageUrls.length - 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-black/70"
                      }`}
                      aria-label="Next image"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-1.5">
                      {post.imageUrls.map((_, index) => (
                        <span
                          key={index}
                          className={`w-2 h-2 rounded-full ${
                            index === currentImageIndex ? "bg-white" : "bg-gray-400"
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : null}
          </div>

          {/* Caption */}
          {post.content && (
            <div className="mb-4">
             <p className={`text-sm text-gray-900 ${isExpanded ? "" : "line-clamp-2"}`}>
                <span className="font-bold">{post.userName || "Unknown User"}:</span> {post.content}
              </p>
              {!isExpanded && post.content.length > 100 && (
                <button
                  onClick={toggleExpand}
                  className="text-sm text-gray-500 hover:text-gray-700 mt-1 focus:outline-none"
                >
                  See more
                </button>
              )}
            </div>
          )}

          {/* Engagement Section */}
          <div className="flex items-center space-x-4 mb-4">
            <ReactionButton
              postId={post.id}
              userId={user.id}
              onReactionchange={handleReactionChange}
              key={`reaction-${lastRefreshed}`}
              renderButton={({ liked, count, onClick, loading }) => (
                <button
                  onClick={onClick}
                  disabled={loading}
                  className="p-2 rounded-full hover:bg-gray-100 transition-transform duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500"
                  aria-label={liked ? "Unlike post" : "Like post"}
                >
                  <svg
                    className={`w-6 h-6 ${liked ? "text-green-600" : "text-gray-600"}`}
                    fill={liked ? "currentColor" : "none"}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={liked ? "0" : "2"}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                    {liked && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <svg
                          className="w-6 h-6 text-green-600 animate-ping opacity-75"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                          />
                        </svg>
                      </span>
                    )}
                  </svg>
                  {count > 0 && (
                    <span className="text-sm font-bold text-gray-900 ml-1">{count}</span>
                  )}
                </button>
              )}
            />
            <button
              onClick={handleCommentClick}
              className="p-2 rounded-full hover:bg-gray-100 transition-transform duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500"
              aria-label="View comments"
            >
              <svg
                className={`w-6 h-6 ${commentCount > 0 ? "text-green-600" : "text-gray-600"}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              {commentCount > 0 && (
                <span className="text-sm font-bold text-gray-900 ml-1">{commentCount}</span>
              )}
            </button>
            {user.id !== post.userId && (
              <button
                onClick={() => setShowReportModal(true)}
                className="p-2 rounded-full hover:bg-gray-100 transition-transform duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500"
                aria-label="Report post"
              >
                <svg
                  className="w-6 h-6 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* Comments Section */}
          {showComments ? (
            <div className="bg-gray-50 px-4 py-3 rounded-xl">
              <Comments
                postId={post.id}
                postOwnerId={post.userId}
                showInput={showCommentInput}
                onCommentCountChange={handleCommentCountChange}
                key={`comments-${lastRefreshed}`}
                maxComments={2} // Show only 2 comments by default
              />
              {commentCount > 2 && (
                <button
                  onClick={handleCommentClick}
                  className="text-sm text-gray-500 hover:text-gray-700 mt-2 focus:outline-none"
                >
                  {showComments ? "Hide comments" : `View all ${commentCount} comments`}
                </button>
              )}
            </div>
          ) : commentCount > 0 ? (
            <div>
              <button
                onClick={handleCommentClick}
                className="text-sm text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                View all {commentCount} comments
              </button>
            </div>
          ) : null}
        </>
      )}

      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        postId={post.id}
        onSuccess={handleReportSuccess}
      />

      <style jsx>{`
        @keyframes slideIn {
          from { transform: translateY(-10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-slide-in {
          animation: slideIn 0.2s ease-out;
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}

export default Post;