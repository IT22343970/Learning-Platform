import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ServerErrorAlert from '../../../src/components/common/ServerErrorAlert';
import { isServerRunning } from '../utils/serverStatus';

const ServerErrorPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [returnPath, setReturnPath] = useState('/');

  useEffect(() => {
    // Get the return path from state or default to home
    const from = location.state?.from || '/';
    setReturnPath(from);
  }, [location]);

  const handleRetry = async (result) => {
    if (result.isRunning) {
      // If connection is successful, navigate back to the page the user was trying to access
      navigate(returnPath);
    }
  };

  // Check if server comes back online automatically
  useEffect(() => {
    const checkInterval = setInterval(async () => {
      const status = await isServerRunning();
      if (status.isRunning) {
        clearInterval(checkInterval);
        navigate(returnPath);
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(checkInterval);
  }, [navigate, returnPath]);

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <ServerErrorAlert onRetry={handleRetry} />
      
      <div className="mt-8 text-center text-gray-500">
        <p>
          Attempting to automatically reconnect...
        </p>
      </div>
    </div>
  );
};

export default ServerErrorPage;
