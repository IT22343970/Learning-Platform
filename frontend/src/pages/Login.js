import React, { useState, useEffect, useCallback, useContext } from "react";
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Paper, 
  Divider, 
  Container, 
  InputAdornment, 
  IconButton 
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axios";
// Import icons for a better look
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { AuthContext } from "../context/AuthContext"; // Add this import

function Login() {
  const navigate = useNavigate();
  const { setAuth } = useContext(AuthContext); // Add this line
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGoogleCallback = useCallback(async (response) => {
    console.log("Google response received:", response);
    setLoading(true);
    try {
      if (!response.credential) {
        throw new Error("No credential received from Google");
      }
      
      // Send the ID token to your backend
      const result = await axiosInstance.post("/api/auth/google", {
        idToken: response.credential
      });
      
      localStorage.setItem("user", JSON.stringify(result.data));
      setAuth({ isAuthenticated: true, user: result.data }); // Update auth context
      navigate("/");
    } catch (err) {
      console.error("Google auth error:", err);
      const errorMessage = err.response?.data || err.message || "Google authentication failed";
      setError(typeof errorMessage === 'object' ? JSON.stringify(errorMessage) : errorMessage);
    } finally {
      setLoading(false);
    }
  }, [navigate, setAuth]); // Add setAuth to dependency array

  useEffect(() => {
    // Clean up any existing Google script to prevent conflicts
    const existingScript = document.getElementById("google-signin-script");
    if (existingScript) {
      existingScript.remove();
    }
    
    // Load Google's OAuth script
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.id = "google-signin-script";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      // Add a slight delay to ensure Google's API is fully loaded
      setTimeout(() => {
        if (window.google) {
          try {
            window.google?.accounts.id.initialize({
              client_id: "793547860619-hccacc9oqnrjiphbve9hkvbef24o6sji.apps.googleusercontent.com",
              callback: handleGoogleCallback,
              auto_select: false,
              cancel_on_tap_outside: true,
              context: 'signin',
              ux_mode: 'popup'
            });
  
            window.google.accounts.id.renderButton(
              document.getElementById("googleSignInButton"),
              { 
                theme: "outline", 
                size: "large", 
                width: "100%",
                text: "signin_with",
                shape: "rectangular"
              }
            );
          } catch (err) {
            console.error("Error initializing Google Sign-In:", err);
            setError("Failed to initialize Google Sign-In. Please try again later.");
          }
        } else {
          console.error("Google API failed to load");
          setError("Google Sign-In is unavailable. Please try again later.");
        }
      }, 300);
    };

    script.onerror = () => {
      console.error("Failed to load Google Sign-In script");
      setError("Google Sign-In is unavailable. Please try again later.");
    };

    return () => {
      // Clean up script when component unmounts
      const scriptToRemove = document.getElementById("google-signin-script");
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [handleGoogleCallback]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axiosInstance.post("/api/auth/login", formData);
      localStorage.setItem("user", JSON.stringify(response.data));
      setAuth({ isAuthenticated: true, user: response.data }); // Update auth context
      navigate("/");
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data || "An error occurred";
      setError(typeof errorMessage === 'object' ? JSON.stringify(errorMessage) : errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        height: '100vh',
        background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', // Instagram gradient background
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
      }}
    >
      <Container maxWidth="sm" sx={{ display: 'flex', justifyContent: 'center' }}>
        <Paper 
          elevation={5} 
          sx={{ 
            p: 4, 
            borderRadius: '15px',
            boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
            backdropFilter: 'blur(5px)',
            background: 'rgba(255, 255, 255, 0.97)',
            width: '100%',
            maxWidth: '450px'
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography 
              variant="h4" 
              component="h1" 
              fontWeight="bold"
              sx={{
                background: 'linear-gradient(45deg, #405DE6, #5851DB, #833AB4, #C13584, #E1306C, #FD1D1D)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1
              }}
            >
              SkillBridge
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              Sign in to continue to your account
            </Typography>
          </Box>
          
          {error && (
            <Typography 
              color="error" 
              sx={{ 
                mb: 2, 
                p: 1, 
                borderRadius: 1, 
                bgcolor: 'rgba(255,0,0,0.05)',
                textAlign: 'center'
              }}
            >
              {error}
            </Typography>
          )}
          
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              required
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="primary" />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                }
              }}
            />
            
            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              required
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="primary" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleClickShowPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                }
              }}
            />
            
            <Button 
              type="submit" 
              fullWidth 
              variant="contained"
              disabled={loading}
              sx={{ 
                mt: 3, 
                mb: 2, 
                py: 1.5, 
                borderRadius: '10px',
                background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', 
                boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  opacity: 0.9,
                  boxShadow: '0 6px 15px rgba(0,0,0,0.2)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              <Typography variant="button" fontWeight="bold">
                {loading ? "Logging in..." : "Login"}
              </Typography>
            </Button>
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Typography 
                variant="body2" 
                color="primary"
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
              >
                Forgot Password?
              </Typography>
            </Box>
            
            <Divider sx={{ my: 2 }}>
              <Typography variant="body2" color="textSecondary">
                OR
              </Typography>
            </Divider>
            
            {/* Google Sign-In Button */}
            <Box 
              id="googleSignInButton" 
              sx={{ 
                width: "100%", 
                mt: 1,
                mb: 2,
                '& > div': {
                  borderRadius: '10px !important',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1) !important',
                  width: '100% !important',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15) !important',
                    transform: 'translateY(-1px)'
                  }
                }
              }}
            />
            
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="textSecondary">
                Don't have an account?{' '}
                <Typography
                  component="span"
                  color="primary"
                  fontWeight="bold"
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': {
                      textDecoration: 'underline'
                    }
                  }}
                  onClick={() => navigate("/register")}
                >
                  Register
                </Typography>
              </Typography>
            </Box>
          </form>
        </Paper>
      </Container>
    </Box>
  );
}

export default Login;
