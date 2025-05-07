import api from '../services/api';
import axios from 'axios';

// Define potential backend endpoints to check
const HEALTH_ENDPOINTS = [
  { url: '/api/health', port: 8081 },
  { url: '/api/health', port: 5000 },
  { url: '/health', port: 8081 },
  { url: '/health', port: 5000 }
];

/**
 * Utility function to check if the backend server is running
 * @returns {Promise<{isRunning: boolean, message: string, port?: number}>} Status object with connection info
 */
export const isServerRunning = async () => {
  // Try all possible health endpoints
  for (const endpoint of HEALTH_ENDPOINTS) {
    try {
      // Try with axios directly to avoid interceptors that might be in the api instance
      await axios.get(`http://localhost:${endpoint.port}${endpoint.url}`, { 
        timeout: 3000,
        headers: { 'Accept': 'application/json' }
      });
      
      return { 
        isRunning: true, 
        message: `Connected successfully on port ${endpoint.port}`,
        port: endpoint.port
      };
    } catch (error) {
      console.log(`Attempt failed for ${endpoint.url} on port ${endpoint.port}`);
      // Continue to next endpoint
    }
  }

  // If we reach here, all endpoints failed
  console.error('Server connection check failed on all endpoints');
  return { 
    isRunning: false, 
    message: 'Could not connect to backend server on any port' 
  };
};

/**
 * Gets detailed diagnostic information about connection issues
 * @returns {Promise<object>} Detailed connection diagnostics
 */
export const getDiagnostics = async () => {
  const diagnostics = {
    ports: {},
    corsIssue: false,
    networkIssue: false,
    timeoutIssue: false
  };

  for (const endpoint of HEALTH_ENDPOINTS) {
    try {
      await axios.get(`http://localhost:${endpoint.port}${endpoint.url}`, { timeout: 2000 });
      diagnostics.ports[endpoint.port] = 'available';
    } catch (error) {
      diagnostics.ports[endpoint.port] = 'unavailable';
      
      if (error.code === 'ERR_NETWORK') {
        diagnostics.networkIssue = true;
      } else if (error.code === 'ECONNABORTED') {
        diagnostics.timeoutIssue = true;
      } else if (error.response && error.response.status === 0) {
        diagnostics.corsIssue = true;
      }
    }
  }

  return diagnostics;
};

/**
 * Adds backend connection status checking to any component
 * @param {Function} callback Function to execute after checking connection
 * @param {Function} onError Optional error handler
 */
export const withConnectionCheck = async (callback, onError) => {
  try {
    const result = await isServerRunning();
    if (result.isRunning) {
      return callback(result);
    } else {
      const diagnostics = await getDiagnostics();
      throw new Error(`Backend server connection failed: ${JSON.stringify(diagnostics)}`);
    }
  } catch (error) {
    if (onError) {
      onError(error);
    }
    throw error;
  }
};

/**
 * Retry connecting to server with exponential backoff
 * @param {number} maxAttempts Maximum number of connection attempts
 * @param {number} initialDelay Initial delay in ms
 * @returns {Promise<{isRunning: boolean, attempts: number, port?: number}>}
 */
export const retryConnection = async (maxAttempts = 3, initialDelay = 1000) => {
  let attempts = 0;
  let delay = initialDelay;
  
  while (attempts < maxAttempts) {
    attempts++;
    const result = await isServerRunning();
    
    if (result.isRunning) {
      return { ...result, attempts };
    }
    
    // Wait before next attempt with exponential backoff
    await new Promise(resolve => setTimeout(resolve, delay));
    delay *= 2; // Exponential backoff
  }
  
  return { isRunning: false, attempts, message: `Failed after ${attempts} attempts` };
};
