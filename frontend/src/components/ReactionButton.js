import React, { useState, useEffect } from "react";
import axiosInstance from "../utils/axios";

function ReactionButton({ postId, userId, onReactionChange, renderButton }) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkReactionStatus = async () => {
      try {
        const response = await axiosInstance.get(`/api/reactions/status?postId=${postId}&userId=${userId}`);
        setLiked(response.data.liked);
        setCount(response.data.count);
      } catch (error) {
        console.error("Error checking reaction status:", error);
      }
    };

    if (postId && userId) {
      checkReactionStatus();
    }
  }, [postId, userId]);

  const handleReaction = async () => {
    if (loading) return;
    
    try {
      setLoading(true);
      // Optimistic UI update
      setLiked(!liked);
      setCount(liked ? count - 1 : count + 1);

      const response = await axiosInstance.post("/api/reactions/toggle", null, {
        params: { userId, postId }
      });

      // Update with actual values from server
      setLiked(response.data.liked);
      setCount(response.data.count);
      
      if (onReactionChange) {
        onReactionChange(response.data);
      }
    } catch (error) {
      // Revert to previous state on error
      setLiked(!liked);
      setCount(liked ? count + 1 : count - 1);
      console.error("Error toggling reaction:", error);
    } finally {
      setLoading(false);
    }
  };

  // If a custom render function is provided, use it
  if (renderButton) {
    return renderButton({
      liked,
      count,
      onClick: handleReaction,
      loading
    });
  }

  // Default button render
  return (
    <button
      onClick={handleReaction}
      disabled={loading}
      className={`flex items-center space-x-2 ${liked ? "text-blue-600" : "text-gray-500 hover:text-blue-500"}`}
    >
      <svg
        className="w-6 h-6"
        fill={liked ? "currentColor" : "none"}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
        />
      </svg>
      <span>{count}</span>
    </button>
  );
}

export default ReactionButton;
