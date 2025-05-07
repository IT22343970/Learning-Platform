import React, { useState, useEffect } from "react";
import axiosInstance from "../utils/axios";

function Comments({ postId, postOwnerId, showInput, onCommentCountChange }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [editingComment, setEditingComment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingComments, setFetchingComments] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.role === "ROLE_ADMIN";

  useEffect(() => {
    const abortController = new AbortController();

    const fetchComments = async () => {
      try {
        setFetchingComments(true);
        const response = await axiosInstance.get(
          `/api/comments/post/${postId}?limit=10`,
          {
            signal: abortController.signal,
          }
        );
        // Reverse the comments array to show newest first
        setComments(response.data.reverse());
        onCommentCountChange?.(response.data.length);
      } catch (error) {
        if (!error.name === "AbortError") {
          console.error("Error fetching comments:", error);
        }
      } finally {
        setFetchingComments(false);
      }
    };

    fetchComments();

    return () => {
      abortController.abort();
    };
  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setLoading(true);
      const response = await axiosInstance.post("/api/comments", null, {
        params: {
          postId,
          userId: user.id,
          content: newComment.trim(),
        },
      });
      // Add new comment to the beginning of the array
      const updatedComments = [response.data, ...comments];
      setComments(updatedComments);
      onCommentCountChange?.(updatedComments.length);
      setNewComment("");
    } catch (error) {
      console.error("Error creating comment:", error);
      alert("Failed to create comment");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (commentId, content) => {
    try {
      const response = await axiosInstance.put(
        `/api/comments/${commentId}`,
        null,
        {
          params: {
            userId: user.id,
            content: content.trim(),
          },
        }
      );
      setComments(
        comments.map((c) => (c.id === commentId ? response.data : c))
      );
      setEditingComment(null);
    } catch (error) {
      console.error("Error updating comment:", error);
      alert("Failed to update comment");
    }
  };

  const handleDelete = async (commentId, isAdminDelete = false) => {
    if (!window.confirm("Are you sure you want to delete this comment?"))
      return;

    try {
      setDeletingCommentId(commentId);
      await axiosInstance.delete(`/api/comments/${commentId}`, {
        params: { 
          userId: user.id,
          isAdmin: isAdminDelete 
        },
      });
      const updatedComments = comments.filter((c) => c.id !== commentId);
      setComments(updatedComments);
      onCommentCountChange?.(updatedComments.length);
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert("Failed to delete comment");
    } finally {
      setDeletingCommentId(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="mt-4">
      {showInput && (
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="w-full p-3 pr-12 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                disabled={loading}
                autoFocus
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                {newComment.length}/500
              </div>
            </div>
            <button
              type="submit"
              disabled={loading || !newComment.trim()}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 min-w-[100px] font-medium"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                "Post"
              )}
            </button>
          </div>
        </form>
      )}

      {fetchingComments ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {comments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No comments yet. Be the first to comment!
            </div>
          ) : (
            <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="group bg-white p-4 rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-100"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 p-[2px] ring-2 ring-offset-2 ring-blue-100">
                        {comment.userProfilePicture ? (
                          <img
                            src={comment.userProfilePicture}
                            alt=""
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="absolute inset-0 flex items-center justify-center text-lg font-semibold text-white">
                            {comment.userName?.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900 hover:text-blue-600 cursor-pointer transition-colors">
                            {comment.userName}
                          </span>
                          <span className="text-xs text-gray-500">•</span>
                          <span className="text-xs text-gray-500 hover:text-gray-700">
                            {formatDate(comment.createdAt)}
                            {comment.updatedAt !== comment.createdAt && (
                              <span className="inline-flex items-center ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                edited
                              </span>
                            )}
                          </span>
                        </div>

                        {editingComment === comment.id ? (
                          <div className="mt-2 relative">
                            <input
                              type="text"
                              defaultValue={comment.content}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  handleUpdate(comment.id, e.target.value);
                                } else if (e.key === "Escape") {
                                  setEditingComment(null);
                                }
                              }}
                              className="w-full p-3 pr-12 border rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                              autoFocus
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                              <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">
                                Enter
                              </kbd>
                            </div>
                          </div>
                        ) : (
                          <p className="mt-1 text-gray-700 leading-relaxed">
                            {comment.content}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* User can edit their own comments */}
                      {user.id === comment.userId && (
                        <button
                          onClick={() => setEditingComment(comment.id)}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-200 transform hover:scale-110"
                          title="Edit comment"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                            />
                          </svg>
                        </button>
                      )}

                      {/* User can delete their own comments */}
                      {user.id === comment.userId && (
                        <button
                          onClick={() => handleDelete(comment.id)}
                          disabled={deletingCommentId === comment.id}
                          className={`p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-all duration-200 transform hover:scale-110 ${
                            deletingCommentId === comment.id ? "animate-pulse" : ""
                          }`}
                          title="Delete comment"
                        >
                          <svg
                            className="w-4 h-4"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      )}

                      {/* Post owner can delete any comment on their post */}
                      {user.id === postOwnerId && user.id !== comment.userId && (
                        <button
                          onClick={() => handleDelete(comment.id)}
                          disabled={deletingCommentId === comment.id}
                          className={`p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-all duration-200 transform hover:scale-110 ${
                            deletingCommentId === comment.id ? "animate-pulse" : ""
                          }`}
                          title="Delete comment as post owner"
                        >
                          <svg
                            className="w-4 h-4"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      )}
                      
                      {/* Admin can delete any comment */}
                      {isAdmin && user.id !== comment.userId && user.id !== postOwnerId && (
                        <button
                          onClick={() => handleDelete(comment.id, true)}
                          disabled={deletingCommentId === comment.id}
                          className={`p-1.5 relative group/admin hover:bg-red-50 rounded-full transition-all duration-200 transform hover:scale-110 ${
                            deletingCommentId === comment.id ? "animate-pulse" : ""
                          }`}
                          title="Delete as Admin"
                        >
                          <svg
                            className="w-4 h-4 text-gray-500 group-hover/admin:text-red-600 transition-colors duration-200"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                          <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover/admin:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                            Admin Delete
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Comments;
