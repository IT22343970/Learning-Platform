import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axios';
import UserForm from './UserForm';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState('');

  // Fetch all users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/admin/users');
      setUsers(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Delete user
  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axiosInstance.delete(`/api/admin/users/${userId}`);
        setUsers(users.filter(user => user.id !== userId));
      } catch (err) {
        setError('Failed to delete user');
        console.error(err);
      }
    }
  };

  // Suspend/unsuspend user
  const handleToggleSuspend = async (userId, currentStatus) => {
    try {
      await axiosInstance.patch(`/api/admin/users/${userId}/status`, {
        suspended: !currentStatus
      });
      setUsers(users.map(user => 
        user.id === userId ? { ...user, suspended: !currentStatus } : user
      ));
    } catch (err) {
      setError('Failed to update user status');
      console.error(err);
    }
  };

  // Add new user or edit existing user
  const handleSubmitUser = async (userData) => {
    try {
      if (currentUser) {
        // Edit user
        const response = await axiosInstance.put(`/api/admin/users/${currentUser.id}`, userData);
        setUsers(users.map(user => 
          user.id === currentUser.id ? response.data : user
        ));
      } else {
        // Add new user
        const response = await axiosInstance.post('/api/admin/users', userData);
        setUsers([...users, response.data]);
      }
      setShowForm(false);
      setCurrentUser(null);
    } catch (err) {
      setError('Failed to save user');
      console.error(err);
    }
  };

  const handleEditUser = (user) => {
    setCurrentUser(user);
    setShowForm(true);
  };
  
  const handleAddNewUser = () => {
    setCurrentUser(null);
    setShowForm(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">User Management</h2>
        <button 
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={handleAddNewUser}
        >
          Add New User
        </button>
      </div>

      {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">{error}</div>}

      {showForm && (
        <UserForm 
          user={currentUser} 
          onSubmit={handleSubmitUser} 
          onCancel={() => {
            setShowForm(false);
            setCurrentUser(null);
          }} 
        />
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 text-left">Name</th>
                <th className="py-2 px-4 text-left">Email</th>
                <th className="py-2 px-4 text-left">Role</th>
                <th className="py-2 px-4 text-left">Status</th>
                <th className="py-2 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="border-t">
                  <td className="py-2 px-4">{user.name}</td>
                  <td className="py-2 px-4">{user.email}</td>
                  <td className="py-2 px-4">{user.isAdmin ? 'Admin' : 'User'}</td>
                  <td className="py-2 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.suspended ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {user.suspended ? 'Suspended' : 'Active'}
                    </span>
                  </td>
                  <td className="py-2 px-4 flex gap-2">
                    <button 
                      className="text-blue-600 hover:text-blue-800"
                      onClick={() => handleEditUser(user)}
                    >
                      Edit
                    </button>
                    <button 
                      className="text-red-600 hover:text-red-800"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      Delete
                    </button>
                    <button 
                      className={`${user.suspended ? 'text-green-600 hover:text-green-800' : 'text-orange-600 hover:text-orange-800'}`}
                      onClick={() => handleToggleSuspend(user.id, user.suspended)}
                    >
                      {user.suspended ? 'Unsuspend' : 'Suspend'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default UserManagement;
