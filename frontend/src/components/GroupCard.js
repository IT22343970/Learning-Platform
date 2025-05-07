import React, { useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../utils/axios";

function GroupCard({ group, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState(group.description);
  const [displayName, setDisplayName] = useState(group.name);
  const [displayDescription, setDisplayDescription] = useState(
    group.description
  );
  const [loading, setLoading] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [currentUser] = useState(JSON.parse(localStorage.getItem("user")));
  const isOwner = currentUser?.id === group.createdBy;

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setLoading(true);
      const response = await axiosInstance.put(
        `/api/groups/${group.id}`,
        null,
        {
          params: {
            userId: group.createdBy,
            name: name.trim(),
            description: description.trim(),
          },
        }
      );
      // Update local display state
      setDisplayName(response.data.name);
      setDisplayDescription(response.data.description);
      // Reset editing state
      setName(response.data.name);
      setDescription(response.data.description);
      // Notify parent component
      onUpdate?.(response.data);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating group:", error);
      alert(error.response?.data || "Failed to update group");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this group?")) return;

    try {
      setLoading(true);
      setIsDeleted(true); // Hide card immediately
      await axiosInstance.delete(`/api/groups/${group.id}`, {
        params: { userId: group.createdBy },
      });
      // Notify parent component
      onDelete?.(group.id);
    } catch (error) {
      console.error("Error deleting group:", error);
      alert(error.response?.data || "Failed to delete group");
      setIsDeleted(false); // Show card again if delete fails
    } finally {
      setLoading(false);
    }
  };

  // Don't render the card if it's marked as deleted
  if (isDeleted) return null;

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-all duration-200 flex flex-col">
      <Link to={`/groups/${group.id}`} className="block flex-grow">
        <div className="h-40 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-t-lg flex items-center justify-center">
          <span className="text-5xl font-bold text-white">
            {displayName?.charAt(0) || "?"}
          </span>
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
            {displayName}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2 min-h-[2.5rem]">
            {displayDescription}
          </p>
          <div className="mt-3 flex items-center text-sm text-gray-500">
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Created {new Date(group.createdAt).toLocaleDateString()}
          </div>
        </div>
      </Link>

      {/* Action Buttons at Bottom - Only show for group owner */}
      {isOwner && (
        <div className="px-4 py-3 border-t border-gray-100 flex justify-end space-x-3 bg-gray-50">
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors duration-200"
            title="Edit group"
            disabled={loading}
          >
            <svg
              className="w-4 h-4 mr-2"
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
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors duration-200"
            title="Delete group"
            disabled={loading}
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      )}

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold mb-4">Edit Group</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Group name"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Description"
                  rows="3"
                  disabled={loading}
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium rounded-md hover:bg-gray-100"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium disabled:opacity-50"
                  disabled={loading || !name.trim()}
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default GroupCard;
