/**
 * Gets the cached user data from localStorage
 * @returns {Object|null} User object or null if not found
 */
export const getCachedUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch (e) {
    console.error("Error parsing user from localStorage:", e);
    return null;
  }
};

/**
 * Updates the cached user data with new values
 * @param {Object} updates - New user data to merge with existing data
 * @returns {Object} Updated user object
 */
export const updateCachedUser = (updates) => {
  const currentUser = getCachedUser() || {};
  const updatedUser = { ...currentUser, ...updates };
  localStorage.setItem("user", JSON.stringify(updatedUser));
  return updatedUser;
};

/**
 * Safely extracts user info, providing defaults for missing fields
 * @param {Object} user - User object
 * @returns {Object} User object with guaranteed default values for missing fields
 */
export const getSafeUserInfo = (user) => {
  if (!user) return {
    id: "",
    firstName: "User",
    lastName: "",
    email: "",
    profilePicture: "",
    bio: "",
    role: ""
  };
  
  return {
    id: user.id || "",
    firstName: user.firstName || "User",
    lastName: user.lastName || "",
    email: user.email || "",
    profilePicture: user.profilePicture || "",
    bio: user.bio || "",
    role: user.role || ""
  };
};

/**
 * Determines if a user object represents a valid user
 * @param {Object} user - User object
 * @returns {boolean} True if user is valid
 */
export const isValidUser = (user) => {
  return user && typeof user === 'object' && !!user.id;
};
