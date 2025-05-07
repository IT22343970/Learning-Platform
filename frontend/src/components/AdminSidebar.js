import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import axiosInstance from "../utils/axios";

const AdminSidebar = ({ user }) => {
  const [expanded, setExpanded] = useState({
    users: false,
    content: false
  });
  const [reportStats, setReportStats] = useState({
    pending: 0
  });

  // Fetch report stats when component mounts
  useEffect(() => {
    const fetchReportStats = async () => {
      try {
        const response = await axiosInstance.get('/api/reports/stats');
        if (response.data) {
          setReportStats(response.data);
        }
      } catch (error) {
        console.error('Error fetching report stats:', error);
      }
    };

    fetchReportStats();
    
    // Refresh stats every 60 seconds
    const interval = setInterval(fetchReportStats, 60000);
    return () => clearInterval(interval);
  }, []);

  const toggleSection = (section) => {
    setExpanded(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="h-screen bg-gradient-to-b from-indigo-800 to-purple-900 text-white flex flex-col shadow-xl">
      {/* Header */}
      <div className="px-6 py-5 flex items-center border-b border-indigo-700">
        <svg className="h-8 w-8 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <h2 className="ml-3 text-xl font-bold tracking-wide">Admin Panel</h2>
      </div>

      {/* User profile */}
      <div className="p-6 border-b border-indigo-700">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xl">
            {user?.firstName?.charAt(0) || 'A'}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-white">{user?.firstName || 'Admin'} {user?.lastName || 'User'}</p>
            <p className="text-xs text-indigo-200">Administrator</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-grow overflow-y-auto px-4 py-3">
        <div className="space-y-1.5">
          <p className="px-3 text-xs font-semibold text-indigo-200 uppercase tracking-wider pt-3">Main</p>

          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) =>
              isActive
                ? "group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg bg-indigo-700 text-white"
                : "group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-indigo-100 hover:bg-indigo-700 hover:bg-opacity-50 transition-all duration-200"
            }
          >
            <svg className="h-5 w-5 mr-3 text-indigo-300 group-hover:text-white transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Dashboard
          </NavLink>
        </div>

        <div className="mt-5 space-y-1.5">
          <button 
            onClick={() => toggleSection('users')} 
            className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg text-indigo-100 hover:bg-indigo-700 hover:bg-opacity-50 transition-all duration-200"
          >
            <div className="flex items-center">
              <svg className="h-5 w-5 mr-3 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span>User Management</span>
            </div>
            <svg 
              className={`h-4 w-4 transform transition-transform duration-200 ${expanded.users ? 'rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {expanded.users && (
            <div className="ml-6 space-y-1 pt-1">
              <NavLink
                to="/admin/users"
                className={({ isActive }) =>
                  isActive
                    ? "group flex items-center px-3 py-2 text-sm font-medium rounded-lg bg-indigo-700 text-white"
                    : "group flex items-center px-3 py-2 text-sm font-medium rounded-lg text-indigo-100 hover:bg-indigo-700 hover:bg-opacity-50 transition-all duration-200"
                }
              >
                <svg className="h-4 w-4 mr-3 text-indigo-300 group-hover:text-white transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                All Users
              </NavLink>

              <NavLink
                to="/admin/users/add"
                className={({ isActive }) =>
                  isActive
                    ? "group flex items-center px-3 py-2 text-sm font-medium rounded-lg bg-indigo-700 text-white"
                    : "group flex items-center px-3 py-2 text-sm font-medium rounded-lg text-indigo-100 hover:bg-indigo-700 hover:bg-opacity-50 transition-all duration-200"
                }
              >
                <svg className="h-4 w-4 mr-3 text-indigo-300 group-hover:text-white transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add User
              </NavLink>

              <NavLink
                to="/admin/users/blocked"
                className={({ isActive }) =>
                  isActive
                    ? "group flex items-center px-3 py-2 text-sm font-medium rounded-lg bg-indigo-700 text-white"
                    : "group flex items-center px-3 py-2 text-sm font-medium rounded-lg text-indigo-100 hover:bg-indigo-700 hover:bg-opacity-50 transition-all duration-200"
                }
              >
                <svg className="h-4 w-4 mr-3 text-indigo-300 group-hover:text-white transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
                Blocked Users
              </NavLink>
            </div>
          )}
        </div>

        <div className="mt-5 space-y-1.5">
          <button 
            onClick={() => toggleSection('content')} 
            className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg text-indigo-100 hover:bg-indigo-700 hover:bg-opacity-50 transition-all duration-200"
          >
            <div className="flex items-center">
              <svg className="h-5 w-5 mr-3 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Content</span>
            </div>
            <svg 
              className={`h-4 w-4 transform transition-transform duration-200 ${expanded.content ? 'rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {expanded.content && (
            <div className="ml-6 space-y-1 pt-1">
              <NavLink
                to="/admin/posts"
                className={({ isActive }) =>
                  isActive
                    ? "group flex items-center px-3 py-2 text-sm font-medium rounded-lg bg-indigo-700 text-white"
                    : "group flex items-center px-3 py-2 text-sm font-medium rounded-lg text-indigo-100 hover:bg-indigo-700 hover:bg-opacity-50 transition-all duration-200"
                }
              >
                <svg className="h-4 w-4 mr-3 text-indigo-300 group-hover:text-white transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                Manage Posts
              </NavLink>

              <NavLink
                to="/admin/reports"
                className={({ isActive }) =>
                  isActive
                    ? "group flex items-center px-3 py-2 text-sm font-medium rounded-lg bg-indigo-700 text-white"
                    : "group flex items-center px-3 py-2 text-sm font-medium rounded-lg text-indigo-100 hover:bg-indigo-700 hover:bg-opacity-50 transition-all duration-200"
                }
              >
                <svg className="h-4 w-4 mr-3 text-indigo-300 group-hover:text-white transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Reported Posts
                {reportStats.pending > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                    {reportStats.pending}
                  </span>
                )}
              </NavLink>

              <NavLink
                to="/admin/comments"
                className={({ isActive }) =>
                  isActive
                    ? "group flex items-center px-3 py-2 text-sm font-medium rounded-lg bg-indigo-700 text-white"
                    : "group flex items-center px-3 py-2 text-sm font-medium rounded-lg text-indigo-100 hover:bg-indigo-700 hover:bg-opacity-50 transition-all duration-200"
                }
              >
                <svg className="h-4 w-4 mr-3 text-indigo-300 group-hover:text-white transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                Comments
              </NavLink>
            </div>
          )}
        </div>

        <div className="mt-5 space-y-1.5">
          <p className="px-3 text-xs font-semibold text-indigo-200 uppercase tracking-wider pt-2">Settings</p>

          <NavLink
            to="/admin/settings"
            className={({ isActive }) =>
              isActive
                ? "group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg bg-indigo-700 text-white"
                : "group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-indigo-100 hover:bg-indigo-700 hover:bg-opacity-50 transition-all duration-200"
            }
          >
            <svg className="h-5 w-5 mr-3 text-indigo-300 group-hover:text-white transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </NavLink>

          <div className="pt-3">
            <NavLink
              to="/"
              className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-indigo-100 hover:bg-indigo-700 hover:bg-opacity-50 transition-all duration-200"
            >
              <svg className="h-5 w-5 mr-3 text-indigo-300 group-hover:text-white transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
              </svg>
              Back to Site
            </NavLink>
          </div>
        </div>
      </nav>

      {/* Version info */}
      <div className="px-6 py-4 border-t border-indigo-700">
        <div className="flex items-center justify-between">
          <div className="text-xs text-indigo-300">SkillBridge v1.0</div>
          <div className="flex space-x-2">
            <button className="p-1 rounded-full bg-indigo-700 hover:bg-indigo-600 transition-colors duration-200 text-white">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <button className="p-1 rounded-full bg-indigo-700 hover:bg-indigo-600 transition-colors duration-200 text-white">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
