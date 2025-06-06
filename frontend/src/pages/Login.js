import React, { useState, useEffect, useCallback, useContext } from "react";
import { Box, Button, TextField, Typography, Paper, Divider, Container, InputAdornment, IconButton } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axios";
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import backgroundImage from "../assets/nick-morrison-FHnnjk1Yj7Y-unsplash.jpg"; // Importing the background image
import { AuthContext } from "../context/AuthContext"; // Importing AuthContext here

function Login() {
  const navigate = useNavigate();
  const { setAuth } = useContext(AuthContext); // Use AuthContext to manage the auth state
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
  }, [navigate, setAuth]);

  useEffect(() => {
    const existingScript = document.getElementById("google-signin-script");
    if (existingScript) {
      existingScript.remove();
    }
    
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.id = "google-signin-script";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      setTimeout(() => {
        if (window.google) {
          try {
            window.google.accounts.id.initialize({
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
                color_scheme: "gray",
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
        background: `url(${backgroundImage}) no-repeat center center fixed`, // Corrected background image path
        backgroundSize: 'cover',
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
            background: 'rgb(255, 255, 255)',
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
                background: 'linear-gradient(45deg,rgb(0, 0, 0),rgb(54, 54, 54),rgb(102, 102, 102),rgb(104, 102, 103),rgb(153, 153, 153),rgb(189, 189, 189))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1
              }}
            >
              Learnora
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
                startAdornment: <InputAdornment position="start"><EmailIcon color="green" /></InputAdornment>,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'transparent', // Transparent background
                  borderRadius: '10px', 
                },
                '& .MuiInputLabel-root': {
                  color: 'black', // White label color
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.5)', // Transparent border with white color
                },
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
                startAdornment: <InputAdornment position="start"><LockIcon color="green" /></InputAdornment>,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleClickShowPassword} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'transparent', // Transparent background
                  borderRadius: '10px', 
                },
                '& .MuiInputLabel-root': {
                  color: 'black', // White label color
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.5)', // Transparent border with white color
                },
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
                background: 'green', // Green color for the button
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
            
            <Divider sx={{ my: 2 }} />
            
            <Box id="googleSignInButton" sx={{ width: "100%", mt: 1, mb: 2 }} />
            
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
