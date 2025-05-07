import React, { useState, useEffect } from 'react';

function UserForm({ user, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    isAdmin: false,
    suspended: false
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '', // Don't populate password for security reasons
        isAdmin: user.isAdmin || false,
        suspended: user.suspended || false
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // If editing and password is empty, don't include it
    const dataToSubmit = user && !formData.password 
      ? { ...formData, password: undefined }
      : formData;
      
    onSubmit(dataToSubmit);
  };

  return (
    <div className="bg-gray-50 p-6 mb-6 rounded-lg border">
      <h3 className="text-lg font-medium mb-4">{user ? 'Edit User' : 'Add New User'}</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password {user && <span className="text-xs text-gray-500">(Leave empty to keep current password)</span>}
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
            required={!user}
          />
        </div>
        
        <div className="mb-4 flex items-center">
          <input
            type="checkbox"
            name="isAdmin"
            id="isAdmin"
            checked={formData.isAdmin}
            onChange={handleChange}
            className="mr-2"
          />
          <label htmlFor="isAdmin" className="text-sm font-medium text-gray-700">
            Admin User
          </label>
        </div>
        
        {user && (
          <div className="mb-4 flex items-center">
            <input
              type="checkbox"
              name="suspended"
              id="suspended"
              checked={formData.suspended}
              onChange={handleChange}
              className="mr-2"
            />
            <label htmlFor="suspended" className="text-sm font-medium text-gray-700">
              Suspended
            </label>
          </div>
        )}
        
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 rounded-md text-white hover:bg-blue-700"
          >
            {user ? 'Update User' : 'Add User'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default UserForm;
