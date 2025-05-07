/**
 * Formats API error messages for display
 * @param {Error} error - The error object from axios
 * @returns {string} - Formatted error message
 */
export const formatApiError = (error) => {
  console.error("API Error:", error);
  
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.log("Error response data:", error.response.data);
    console.log("Error response status:", error.response.status);
    
    // Try to extract meaningful message from response
    const message = error.response.data?.message || 
                   error.response.data?.error || 
                   `Server Error (${error.response.status})`;
    
    return typeof message === 'object' ? JSON.stringify(message) : message;
  } else if (error.request) {
    // The request was made but no response was received
    return "No response received from server. Check your internet connection.";
  } else {
    // Something happened in setting up the request that triggered an Error
    return error.message || "An unknown error occurred";
  }
};

/**
 * Helper for creating form data with logging
 * @param {Object} data - Key/value pairs to add to FormData
 * @returns {FormData} - Populated FormData object
 */
export const createFormData = (data) => {
  const formData = new FormData();
  
  Object.entries(data).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach(item => {
        if (item !== null && item !== undefined) {
          formData.append(key, item);
        }
      });
    } else if (value !== null && value !== undefined) {
      formData.append(key, value);
    }
  });
  
  // Log FormData contents for debugging
  console.log("FormData created with keys:", Object.keys(data));
  
  return formData;
};

export default {
  formatApiError,
  createFormData
};
