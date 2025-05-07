import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axios";
import Header from "../components/Header";

function EditProfile() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    bio: "",
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));

        if (!user || !user.id) {
          // Redirect to login if not authenticated
          navigate("/login");
          return;
        }

        // Use current user data from localStorage to avoid API call failure
        setFormData({
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          bio: user.bio || "",
        });

        if (user.profilePicture) {
          setProfilePicturePreview(user.profilePicture);
        }

        // Try to fetch fresh user data in the background
        try {
          const response = await axiosInstance.get(`/api/users/${user.id}`);
          const userData = response.data;

          setFormData({
            firstName: userData.firstName || "",
            lastName: userData.lastName || "",
            bio: userData.bio || "",
          });

          if (userData.profilePicture) {
            setProfilePicturePreview(userData.profilePicture);
          }
        } catch (apiError) {
          console.warn(
            "Could not fetch latest user data, using cached data instead:",
            apiError
          );
          // Continue with localStorage data, no need to show error to user
        }
      } catch (error) {
        console.error("Error loading user data:", error);
        setError("Failed to load user data. Please try refreshing the page.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file is an image
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }

    setProfilePicture(file);
    setProfilePicturePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const user = JSON.parse(localStorage.getItem("user"));

      if (!user || !user.id) {
        navigate("/login");
        return;
      }

      // Create form data
      const data = new FormData();

      if (formData.firstName) data.append("firstName", formData.firstName);
      if (formData.lastName) data.append("lastName", formData.lastName);
      if (formData.bio !== undefined) data.append("bio", formData.bio);
      if (profilePicture) data.append("profilePicture", profilePicture);

      // Update profile
      const response = await axiosInstance.put(`/api/users/${user.id}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Update user in localStorage
      const updatedUser = {
        ...user,
        firstName: response.data.firstName,
        lastName: response.data.lastName,
        bio: response.data.bio,
        profilePicture: response.data.profilePicture,
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));

      setSuccess("Profile updated successfully!");

      // Redirect to profile after short delay
      setTimeout(() => {
        navigate(`/profile/${user.id}`);
      }, 1500);
    } catch (error) {
      console.error("Error updating profile:", error);
      setError(error.response?.data || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-gray-700 mb-2">
                Profile Picture
              </label>
              <div className="flex items-center">
                <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden mr-4">
                  {profilePicturePreview ? (
                    <img
                      src={profilePicturePreview}
                      alt="Profile Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-semibold text-gray-600">
                      {formData.firstName?.charAt(0)}
                    </span>
                  )}
                </div>

                <label className="cursor-pointer px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition">
                  Choose Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 mb-2">Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows="4"
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tell us about yourself"
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/profile/${JSON.parse(localStorage.getItem("user")).id}`
                  )
                }
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default EditProfile;
