import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "../utils/axios";
import Header from "../components/Header";
import AdminSidebar from "../components/AdminSidebar"; // Import AdminSidebar component

function AdminUserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(""); // Add success state for messages
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, userId: null, currentStatus: false });
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, userId: null });
  const [editDialog, setEditDialog] = useState({ isOpen: false, userData: null });
  const [roleDialog, setRoleDialog] = useState({ isOpen: false, userId: null, currentRole: "" });
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const userData = localStorage.getItem("user");
        if (!userData) {
          navigate("/login");
          return;
        }

        const user = JSON.parse(userData);
        if (user.role !== "ROLE_ADMIN") {
          navigate("/");
          return;
        }
        
        setUser(user);
        fetchUsers();
      } catch (error) {
        console.error("Error checking admin access:", error);
        navigate("/");
      }
    };

    checkAdminAccess();
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      // Try to fetch real data
      const response = await axiosInstance.get("/api/admin/users");
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Failed to load users. Using sample data instead.");
      
      // Use sample data as fallback
      setUsers([
        { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@example.com', role: 'ROLE_USER', enabled: true },
        { id: '2', firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', role: 'ROLE_USER', enabled: true },
        { id: '3', firstName: 'Admin', lastName: 'User', email: 'admin@example.com', role: 'ROLE_ADMIN', enabled: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      await axiosInstance.put(`/api/admin/users/${userId}/toggle-status`);
      setUsers(users.map(user => 
        user.id === userId ? {...user, enabled: !currentStatus} : user
      ));
    } catch (error) {
      console.error("Error toggling user status:", error);
      setError("Failed to update user status. Please try again.");
    }
  };

  const openStatusConfirmation = (userId, currentStatus) => {
    setConfirmDialog({
      isOpen: true,
      userId,
      currentStatus,
    });
  };

  const handleConfirmStatusChange = () => {
    handleToggleUserStatus(confirmDialog.userId, confirmDialog.currentStatus);
    setConfirmDialog({ isOpen: false, userId: null, currentStatus: false });
  };

  const handlePromoteToAdmin = async (userId, currentRole) => {
    try {
      const isCurrentlyAdmin = currentRole === "ROLE_ADMIN";
      const newRole = isCurrentlyAdmin ? "ROLE_USER" : "ROLE_ADMIN";
      
      console.log(`Updating role for user ID: ${userId} from ${currentRole} to ${newRole}`);
      
      // Use a single, reliable endpoint with proper error handling
      const response = await axiosInstance.put(`/api/admin/users/${userId}/role`, 
        { role: newRole },
        { headers: { 'Content-Type': 'application/json' } }
      );
      
      // Update UI immediately regardless of refresh function
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      
      // Show success message
      const successMessage = isCurrentlyAdmin 
        ? "User has been demoted to regular user successfully!" 
        : "User has been promoted to admin successfully!";
      
      setSuccess(successMessage);
      setError("");
      
      // Optional refresh - don't rely on this for UI updates
      setTimeout(() => {
        fetchUsers();
      }, 1000);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (error) {
      console.error("Error updating user role:", error);
      
      let errorMessage = "Failed to update user role.";
      
      if (error.response) {
        if (error.response.status === 404) {
          errorMessage = "User not found or endpoint not available. Please check if the backend server is running.";
        } else if (error.response.status === 403 || error.response.status === 401) {
          errorMessage = "You don't have permission to change user roles.";
        } else if (error.response.data) {
          // Try to extract the most helpful error message
          if (typeof error.response.data === 'string') {
            errorMessage = error.response.data;
          } else if (error.response.data.message) {
            errorMessage = error.response.data.message;
          }
        }
      } else if (error.request) {
        errorMessage = "No response received from the server. Please check your network connection.";
      }
      
      setError(errorMessage);
    }
  };

  const openRoleConfirmation = (userId, currentRole) => {
    setRoleDialog({
      isOpen: true,
      userId,
      currentRole,
    });
  };

  const handleConfirmRoleChange = () => {
    handlePromoteToAdmin(roleDialog.userId, roleDialog.currentRole);
    setRoleDialog({ isOpen: false, userId: null, currentRole: "" });
  };

  const openDeleteConfirmation = (userId) => {
    setDeleteDialog({
      isOpen: true,
      userId,
    });
  };

  const handleConfirmDelete = async () => {
    try {
      // Set loading state or indicator if needed
      setError("");
      
      console.log(`Attempting to delete user with ID: ${deleteDialog.userId}`);
      
      // Add proper error handling and make sure the URL is correct
      const response = await axiosInstance.delete(`/api/admin/users/${deleteDialog.userId}`, {
        headers: {
          'Content-Type': 'application/json',
          // Include auth token if your API requires it and it's not in the axiosInstance defaults
        }
      });
      
      console.log("Delete response:", response);
      
      // Check if the delete was successful based on your API's response structure
      if (response.status === 200 || response.status === 204) {
        // Update UI by removing the deleted user
        setUsers(users.filter(user => user.id !== deleteDialog.userId));
        
        // Show success message
        setSuccess("User has been deleted successfully!");
        
        // Close dialog
        setDeleteDialog({ isOpen: false, userId: null });
        
        // Optional: refresh the users list to ensure UI is in sync with backend
        setTimeout(() => {
          fetchUsers();
        }, 1000);
      } else {
        throw new Error("Unexpected response status: " + response.status);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      
      let errorMessage = "Failed to delete user. Please try again.";
      
      if (error.response) {
        console.log("Delete error response:", error.response);
        
        if (error.response.status === 404) {
          errorMessage = "User not found. The user may have been deleted already.";
        } else if (error.response.data) {
          if (typeof error.response.data === 'string') {
            errorMessage = error.response.data;
          } else if (error.response.data.message) {
            errorMessage = error.response.data.message;
          }
        }
      }
      
      setError(errorMessage);
      setDeleteDialog({ isOpen: false, userId: null });
    }
  };

  const openEditDialog = (userData) => {
    // Create a deep copy to avoid reference issues
    const userDataCopy = JSON.parse(JSON.stringify(userData));
    
    console.log("Opening edit dialog with user data:", userDataCopy);
    
    setEditDialog({
      isOpen: true,
      userData: userDataCopy,
    });
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setError("");
    
    // Validate form data
    if (!editDialog.userData.firstName || !editDialog.userData.lastName || !editDialog.userData.email) {
      setError("Please fill out all required fields.");
      return;
    }
    
    try {
      // Add debugging information
      console.log(`Attempting to update user: ${editDialog.userData.id}`);
      
      // Create a clean user object with only the fields needed for update
      // Include all required fields that the backend expects
      const userUpdateData = {
        firstName: editDialog.userData.firstName,
        lastName: editDialog.userData.lastName,
        email: editDialog.userData.email,
        role: editDialog.userData.role,
        enabled: editDialog.userData.enabled
      };
      
      console.log('Update payload:', userUpdateData);

      // Make request without stringifying the JSON - axios does this automatically
      const response = await axiosInstance.put(
        `/api/admin/users/${editDialog.userData.id}`, 
        userUpdateData,
        { 
          headers: { 
            'Content-Type': 'application/json'
          } 
        }
      );
      
      // Log success
      console.log('Update successful:', response.data);
      
      // Update users state with the response data
      setUsers(users.map(user => 
        user.id === editDialog.userData.id ? response.data : user
      ));
      
      // Show success message
      setSuccess("User updated successfully!");
      
      // Clear error message
      setError("");
      
      // Close dialog
      setEditDialog({ isOpen: false, userData: null });
      
      // Refresh users list to get updated data
      fetchUsers();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (error) {
      console.error("Error updating user:", error);
      
      let errorMessage = "Failed to update user. Please try again.";
      
      if (error.response) {
        console.log('Error response:', error.response);
        
        if (error.response.status === 404) {
          errorMessage = "User not found. The user may have been deleted or you may need to refresh the page.";
          
          // Refresh user list to get updated data
          fetchUsers();
        } else if (error.response.data) {
          // Try to extract the most helpful error message
          if (typeof error.response.data === 'string') {
            errorMessage = error.response.data;
          } else if (error.response.data.message) {
            errorMessage = error.response.data.message;
          }
        }
      }
      
      setError(errorMessage);
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditDialog({
      ...editDialog,
      userData: {
        ...editDialog.userData,
        [name]: value,
      }
    });
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
     
      <div className="flex">
        {/* Replace the existing sidebar with AdminSidebar component */}
        <AdminSidebar user={user} />
        
        {/* Mobile sidebar toggle */}
        <div className="md:hidden fixed bottom-6 right-6 z-40">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 focus:outline-none"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {sidebarOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 min-w-0 overflow-auto">
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">User Management</h1>
                <Link 
                  to="/admin/users/add" 
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Add New User
                </Link>
              </div>
              
              {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {success && (
                <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-green-700">{success}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-700">
                                {user.firstName?.[0] || "U"}
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => openRoleConfirmation(user.id, user.role)}
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.role === "ROLE_ADMIN" 
                                ? "bg-purple-100 text-purple-800" 
                                : "bg-blue-100 text-blue-800 cursor-pointer hover:opacity-80"
                            }`}>
                            {user.role === "ROLE_ADMIN" ? "Admin" : "User"}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button 
                            onClick={() => openStatusConfirmation(user.id, user.enabled)}
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer hover:opacity-80 ${
                              user.enabled 
                                ? "bg-green-100 text-green-800" 
                                : "bg-red-100 text-red-800"
                            }`}>
                            {user.enabled ? "Active" : "Blocked"}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 space-x-2">
                          <button 
                            onClick={() => openEditDialog(user)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => openDeleteConfirmation(user.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Confirmation Dialog */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Change User Status</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  {confirmDialog.currentStatus 
                    ? "Do you want to block this user?" 
                    : "Do you want to activate this user?"}
                </p>
              </div>
              <div className="items-center px-4 py-3 flex justify-center space-x-4">
                <button
                  id="cancel-btn"
                  className="px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md shadow-sm hover:bg-gray-400 focus:outline-none"
                  onClick={() => setConfirmDialog({ isOpen: false, userId: null, currentStatus: false })}
                >
                  Cancel
                </button>
                <button
                  id="ok-btn"
                  className="px-4 py-2 bg-blue-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none"
                  onClick={handleConfirmStatusChange}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Role Change Confirmation Dialog */}
      {roleDialog.isOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Change User Role</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  {roleDialog.currentRole === "ROLE_ADMIN"
                    ? "Do you want to change this admin to a regular user?"
                    : "Do you want to promote this user to Admin?"}
                </p>
              </div>
              <div className="items-center px-4 py-3 flex justify-center space-x-4">
                <button
                  id="cancel-btn"
                  className="px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md shadow-sm hover:bg-gray-400 focus:outline-none"
                  onClick={() => setRoleDialog({ isOpen: false, userId: null, currentRole: "" })}
                >
                  Cancel
                </button>
                <button
                  id="ok-btn"
                  className="px-4 py-2 bg-blue-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none"
                  onClick={handleConfirmRoleChange}
                >
                  {roleDialog.currentRole === "ROLE_ADMIN" ? "Yes, Change to User" : "Yes, Promote to Admin"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteDialog.isOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Delete User</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete this user? This action cannot be undone.
                </p>
              </div>
              <div className="items-center px-4 py-3 flex justify-center space-x-4">
                <button
                  id="cancel-btn"
                  className="px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md shadow-sm hover:bg-gray-400 focus:outline-none"
                  onClick={() => setDeleteDialog({ isOpen: false, userId: null })}
                >
                  Cancel
                </button>
                <button
                  id="ok-btn"
                  className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-700 focus:outline-none"
                  onClick={handleConfirmDelete}
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Dialog */}
      {editDialog.isOpen && editDialog.userData && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center pb-3">
              <h3 className="text-lg font-medium text-gray-900">Edit User</h3>
              <button 
                className="text-gray-400 hover:text-gray-500"
                onClick={() => setEditDialog({ isOpen: false, userData: null })}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleUpdateUser}>
              <div className="mt-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      id="firstName"
                      value={editDialog.userData.firstName || ""}
                      onChange={handleEditInputChange}
                      required
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      id="lastName"
                      value={editDialog.userData.lastName || ""}
                      onChange={handleEditInputChange}
                      required
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={editDialog.userData.email || ""}
                    onChange={handleEditInputChange}
                    required
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:col-start-1"
                  onClick={() => setEditDialog({ isOpen: false, userData: null })}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none sm:col-start-2"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminUserManagement;
