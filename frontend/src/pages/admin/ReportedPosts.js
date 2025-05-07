import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axios';
import AdminSidebar from '../../components/AdminSidebar';

function ReportedPosts() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('PENDING');
  const [selectedReport, setSelectedReport] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [adminNote, setAdminNote] = useState('');
  const [user, setUser] = useState(null);
  const [postContent, setPostContent] = useState({});
  const [expanded, setExpanded] = useState({});
  const [reportStats, setReportStats] = useState({
    total: 0,
    pending: 0,
    resolved: 0,
    rejected: 0
  });
  const [error, setError] = useState(null);
  
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
        await fetchReportStats();
        await fetchReports(activeTab);
      } catch (error) {
        console.error("Error checking admin access:", error);
        setError("Error checking admin access. Please try again.");
        navigate("/");
      }
    };

    checkAdminAccess();
  }, [navigate]);

  const fetchReportStats = async () => {
    try {
      const response = await axiosInstance.get('/api/reports/stats');
      if (response?.data && typeof response.data === 'object') {
        setReportStats(response.data);
      } else {
        console.warn("Invalid stats data format:", response?.data);
        setReportStats({
          total: 0,
          pending: 0,
          resolved: 0,
          rejected: 0
        });
      }
    } catch (error) {
      console.error('Error fetching report stats:', error);
    }
  };

  const fetchReports = async (status) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/reports/status/${status}`);
      
      if (response?.data && Array.isArray(response.data)) {
        setReports(response.data);
      
        const reportedPostIds = response.data
          .map(report => report.postId)
          .filter(id => id);
        
        if (reportedPostIds.length > 0) {
          await fetchPostContent(reportedPostIds);
        }
      } else {
        console.warn("Invalid reports data format:", response?.data);
        setReports([]);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      setError("Error fetching reports. Please try again.");
      setReports([]);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchPostContent = async (postIds) => {
    if (!postIds?.length) return;
    
    try {
      const uniqueIds = [...new Set(postIds)];
      const content = {};
      
      for (const id of uniqueIds) {
        try {
          const response = await axiosInstance.get(`/api/posts/${id}`);
          if (response?.data) {
            content[id] = response.data;
          } else {
            content[id] = { error: 'Post data unavailable' };
          }
        } catch (error) {
          console.error(`Error fetching post ${id}:`, error);
          content[id] = { error: 'Post not found or deleted' };
        }
      }
      
      setPostContent(content);
    } catch (error) {
      console.error('Error fetching post content:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchReports(activeTab);
    }
  }, [activeTab, user]);
  
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  
  const handleReportAction = async (action, reportId) => {
    if (!reportId || !user) return;
    
    try {
      setProcessing(true);
      
      if (action === 'delete') {
        await axiosInstance.delete(`/api/reports/${reportId}/post`, {
          data: {
            adminId: user.id,
            adminNote: adminNote || 'Post was removed by admin.'
          }
        });
      } else if (action === 'dismiss') {
        await axiosInstance.put(`/api/reports/${reportId}/status`, {
          status: 'REJECTED',
          adminId: user.id,
          adminNote: adminNote || 'Report was dismissed by admin.'
        });
      }
      
      await fetchReportStats();
      await fetchReports(activeTab);
      setSelectedReport(null);
      setAdminNote('');
    } catch (error) {
      console.error('Error performing action:', error);
      setError("Error performing action. Please try again.");
    } finally {
      setProcessing(false);
    }
  };
  
  const togglePostContent = (reportId) => {
    setExpanded(prev => ({
      ...prev,
      [reportId]: !prev[reportId]
    }));
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";
    try {
      return new Date(dateString).toLocaleString();
    } catch (error) {
      return "Invalid date";
    }
  };
  
  const getReasonClass = (reason) => {
    if (!reason) return 'bg-gray-100 text-gray-800';
    
    const reasonStr = String(reason).toLowerCase();
    
    if (reasonStr.includes('inappropriate')) {
      return 'bg-purple-100 text-purple-800';
    } else if (reasonStr.includes('harass') || reasonStr.includes('bull')) {
      return 'bg-red-100 text-red-800';
    } else if (reasonStr.includes('spam') || reasonStr.includes('mislead')) {
      return 'bg-yellow-100 text-yellow-800';
    } else if (reasonStr.includes('hate')) {
      return 'bg-orange-100 text-orange-800';
    } else if (reasonStr.includes('false') || reasonStr.includes('fake')) {
      return 'bg-blue-100 text-blue-800';
    } else if (reasonStr.includes('property') || reasonStr.includes('copyright')) {
      return 'bg-indigo-100 text-indigo-800';
    } else {
      return 'bg-gray-100 text-gray-800';
    }
  };

  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar user={user} />
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-white p-8 rounded shadow-md max-w-md w-full">
            <div className="text-red-500 text-center mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-lg font-medium mt-2">Error</h2>
            </div>
            <p className="text-gray-600 text-center">{typeof error === 'string' ? error : 'An error occurred'}</p>
            <div className="mt-6 text-center">
              <button 
                onClick={() => {
                  setError(null);
                  fetchReports(activeTab);
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading && reports.length === 0) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar user={user} />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar user={user} />
      
      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Reported Posts</h1>
            
            <div className="mt-4 md:mt-0 flex space-x-4">
              <div className="px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-100">
                <span className="text-xs text-gray-500">Total</span>
                <p className="text-lg font-semibold">{reportStats.total || 0}</p>
              </div>
              <div className="px-4 py-2 bg-white rounded-lg shadow-sm border border-yellow-200">
                <span className="text-xs text-yellow-600">Pending</span>
                <p className="text-lg font-semibold text-yellow-600">{reportStats.pending || 0}</p>
              </div>
              <div className="px-4 py-2 bg-white rounded-lg shadow-sm border border-green-200">
                <span className="text-xs text-green-600">Resolved</span>
                <p className="text-lg font-semibold text-green-600">{reportStats.resolved || 0}</p>
              </div>
              <div className="px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200">
                <span className="text-xs text-gray-500">Rejected</span>
                <p className="text-lg font-semibold text-gray-500">{reportStats.rejected || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="mb-8 border-b border-gray-200">
            <div className="flex space-x-8">
              <button
                onClick={() => handleTabChange('PENDING')}
                className={`pb-4 font-medium text-sm ${
                  activeTab === 'PENDING'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Pending
                {reportStats.pending > 0 && (
                  <span className="ml-2 py-0.5 px-2.5 rounded-full text-xs bg-yellow-100 text-yellow-800">
                    {reportStats.pending}
                  </span>
                )}
              </button>
              <button
                onClick={() => handleTabChange('RESOLVED')}
                className={`pb-4 font-medium text-sm ${
                  activeTab === 'RESOLVED'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Resolved
              </button>
              <button
                onClick={() => handleTabChange('REJECTED')}
                className={`pb-4 font-medium text-sm ${
                  activeTab === 'REJECTED'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Rejected
              </button>
            </div>
          </div>
          
          {reports.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No {activeTab.toLowerCase()} reports</h3>
              <p className="mt-1 text-gray-500">
                {activeTab === 'PENDING' 
                  ? 'There are no pending reports to review at this time.'
                  : activeTab === 'RESOLVED'
                  ? 'No reports have been resolved yet.'
                  : 'No reports have been rejected yet.'}
              </p>
            </div>
          ) : (
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {reports.map((report) => {
                  if (!report || typeof report !== 'object') return null;
                  
                  const post = report.postId && postContent[report.postId];
                  const isExpanded = expanded[report.id];
                  
                  return (
                    <li key={report.id || `report-${Math.random().toString(36).substr(2, 9)}`} className="hover:bg-gray-50 transition-colors duration-150">
                      <div className="px-6 py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                Reported by <span className="font-semibold">{report.reporterName || "Unknown User"}</span>
                              </p>
                              <p className="text-sm text-gray-500">
                                {formatDate(report.createdAt)}
                              </p>
                            </div>
                          </div>
                          
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getReasonClass(report.reason)}`}>
                            {report.reason || "Not specified"}
                          </span>
                        </div>
                        
                        <div className="mt-3 pl-13">
                          <div className="rounded-md bg-gray-50 p-3">
                            <p className="text-sm text-gray-700 whitespace-pre-line">
                              {report.note || "No additional details provided."}
                            </p>
                          </div>
                        </div>
                        
                        <div className="mt-4 pl-13">
                          <button
                            onClick={() => togglePostContent(report.id)}
                            className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors duration-150"
                          >
                            <svg className={`h-4 w-4 mr-1.5 transform transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                            {isExpanded ? 'Hide post content' : 'View post content'}
                          </button>
                          
                          {isExpanded && (
                            <div className="mt-3 border border-gray-200 rounded-md p-4 bg-white">
                              {!post ? (
                                <div className="flex items-center justify-center h-24">
                                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500"></div>
                                </div>
                              ) : post.error ? (
                                <p className="text-red-500 text-sm">This post may have been deleted or is no longer available.</p>
                              ) : (
                                <>
                                  <div className="flex items-center space-x-3 mb-3">
                                    <div className="flex-shrink-0">
                                      <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-800 font-medium">
                                        {post.userName?.charAt(0) || 'U'}
                                      </div>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-gray-900">{post.userName || "Unknown User"}</p>
                                      <p className="text-xs text-gray-500">{formatDate(post.createdAt)}</p>
                                    </div>
                                  </div>
                                  
                                  <p className="text-sm text-gray-800 whitespace-pre-line">{post.content || "No content available"}</p>
                                  
                                  {post.imageUrls && post.imageUrls.length > 0 && (
                                    <div className="mt-3 grid grid-cols-2 gap-2">
                                      {post.imageUrls.slice(0, 4).map((url, index) => (
                                        <div key={index} className="rounded-md overflow-hidden h-32 bg-gray-100">
                                          <img 
                                            src={url} 
                                            alt={`Post image ${index + 1}`} 
                                            className="h-full w-full object-cover"
                                            onError={(e) => {
                                              e.target.onerror = null;
                                              e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIEZhaWxlZCB0byBMb2FkPC90ZXh0Pjwvc3ZnPg==";
                                            }}
                                          />
                                        </div>
                                      ))}
                                      {post.imageUrls.length > 4 && (
                                        <div className="rounded-md overflow-hidden h-32 bg-gray-800 flex items-center justify-center">
                                          <p className="text-white font-medium">+{post.imageUrls.length - 4} more</p>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          )}
                        </div>
                        
                        {activeTab === 'PENDING' && (
                          <div className="mt-4 flex justify-end space-x-3">
                            <button
                              onClick={() => setSelectedReport({...report, action: 'dismiss'})}
                              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                              Dismiss Report
                            </button>
                            <button
                              onClick={() => setSelectedReport({...report, action: 'delete'})}
                              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                              Delete Post
                            </button>
                          </div>
                        )}
                        
                        {(activeTab === 'RESOLVED' || activeTab === 'REJECTED') && report.adminNote && (
                          <div className="mt-4 pl-13 border-t border-gray-100 pt-3">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Admin Note</p>
                            <p className="text-sm mt-1 text-gray-700">{report.adminNote}</p>
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>
      
      {selectedReport && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
                 onClick={() => !processing && setSelectedReport(null)}>
            </div>
            
            <div className="relative bg-white rounded-lg max-w-md w-full mx-auto shadow-xl transform transition-all">
              <div className="p-6">
                <div className="text-center">
                  <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${
                    selectedReport.action === 'delete' ? 'bg-red-100' : 'bg-yellow-100'
                  }`}>
                    {selectedReport.action === 'delete' ? (
                      <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    ) : (
                      <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">
                    {selectedReport.action === 'delete' ? 'Delete Reported Post' : 'Dismiss Report'}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    {selectedReport.action === 'delete'
                      ? 'Are you sure you want to delete this post? This action cannot be undone.'
                      : 'Are you sure you want to dismiss this report? The post will remain visible to all users.'}
                  </p>

                  <div className="mt-4">
                    <label htmlFor="admin-note" className="block text-left text-sm font-medium text-gray-700">
                      Add an admin note (optional)
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="admin-note"
                        name="admin-note"
                        rows="3"
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                        placeholder={selectedReport.action === 'delete' ? "Reason for deleting this post..." : "Reason for dismissing this report..."}
                        value={adminNote}
                        onChange={(e) => setAdminNote(e.target.value)}
                      ></textarea>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    className="inline-flex justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={() => setSelectedReport(null)}
                    disabled={processing}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className={`inline-flex justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      selectedReport.action === 'delete'
                        ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                        : 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
                    }`}
                    onClick={() => handleReportAction(selectedReport.action, selectedReport.id)}
                    disabled={processing}
                  >
                    {processing ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : selectedReport.action === 'delete' ? 'Delete Post' : 'Dismiss Report'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReportedPosts;
