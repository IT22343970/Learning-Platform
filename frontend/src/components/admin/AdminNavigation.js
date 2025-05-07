import React from 'react';

function AdminNavigation({ activeSection, setActiveSection }) {
  const navItems = [
    { id: 'users', label: 'User Management' },
    { id: 'dashboard', label: 'Dashboard Stats' },
    // Add more admin sections as needed
  ];

  return (
    <div className="w-64 bg-white shadow-md rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-4">Admin Controls</h2>
      <nav>
        <ul>
          {navItems.map(item => (
            <li key={item.id} className="mb-1">
              <button
                onClick={() => setActiveSection(item.id)}
                className={`w-full text-left px-3 py-2 rounded-md ${
                  activeSection === item.id
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-gray-100'
                }`}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

export default AdminNavigation;
