import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Logo from "../../assets/logo.png";

// Fixed Icons as React components
const SunIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <path d="M12 1v2"/>
    <path d="M12 21v2"/>
    <path d="M4.22 4.22l1.42 1.42"/>
    <path d="M18.36 18.36l1.42 1.42"/>
    <path d="M1 12h2"/>
    <path d="M21 12h2"/>
    <path d="M4.22 19.78l1.42-1.42"/>
    <path d="M18.36 5.64l1.42-1.42"/>
  </svg>
);

const MoonIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

const EyeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const EyeOffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const MicrosoftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z"/>
  </svg>
);

// Enhanced Animated Logo Component with continuous animation
const AnimatedLogo = ({ darkMode }) => {
  const accentColor = darkMode ? "#00aaff" : "#00cc66";
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8 }}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }}
    >
      {/* Continuous floating animation for the main text */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ 
          y: [0, -10, 0], 
          opacity: 1,
          scale: [1, 1.02, 1]
        }}
        transition={{ 
          y: {
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          },
          scale: {
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          },
          opacity: { delay: 0.3, duration: 0.8 }
        }}
        style={{
          fontSize: '3rem',
          fontWeight: 'bold',
          color: darkMode ? 'white' : '#1e293b',
          textAlign: 'center',
          lineHeight: 1.2
        }}
      >
        Welcome Back!
      </motion.div>
      
      {/* Subtitle with gentle fade animation */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ 
          y: 0, 
          opacity: [0.8, 1, 0.8]
        }}
        transition={{ 
          y: { delay: 0.5, duration: 0.8 },
          opacity: {
            delay: 0.5,
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
        style={{
          fontSize: '1.2rem',
          fontWeight: '600',
          color: darkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
          marginTop: '1rem',
          textAlign: 'center'
        }}
      >
        Sign in to access your internship portal
      </motion.div>
      
      {/* Animated gradient line with continuous movement */}
      <motion.div
        initial={{ width: 0, opacity: 0 }}
        animate={{ 
          width: ['0%', '80%', '60%', '80%'],
          opacity: 1
        }}
        transition={{ 
          width: {
            delay: 0.7,
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          },
          opacity: { delay: 0.7, duration: 1 }
        }}
        style={{
          height: '4px',
          background: `linear-gradient(90deg, ${accentColor}, transparent)`,
          marginTop: '2rem',
          borderRadius: '2px'
        }}
      />
      
      {/* Floating particles animation */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            opacity: 0,
            x: Math.random() * 400 - 200,
            y: Math.random() * 400 - 200
          }}
          animate={{ 
            opacity: [0, 0.6, 0],
            x: Math.random() * 400 - 200,
            y: Math.random() * 400 - 200,
            scale: [0, 1, 0]
          }}
          transition={{ 
            duration: 4 + Math.random() * 2,
            repeat: Infinity,
            delay: i * 0.8,
            ease: "easeInOut"
          }}
          style={{
            position: 'absolute',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: accentColor,
            boxShadow: `0 0 20px ${accentColor}80`,
            pointerEvents: 'none'
          }}
        />
      ))}
      
      {/* Pulsing ring animation */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.1, 0.3]
        }}
        transition={{ 
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
        style={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          border: `2px solid ${accentColor}`,
          borderRadius: '50%',
          pointerEvents: 'none'
        }}
      />
    </motion.div>
  );
};

const LoginPage = ({ darkMode: propDarkMode, toggleTheme: propToggleTheme }) => {
  const [internalDarkMode, setInternalDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme !== null) {
      return JSON.parse(savedTheme);
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("individual");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);
  const [showStaffNotification, setShowStaffNotification] = useState(false);
  const [registrationMessage, setRegistrationMessage] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  const darkMode = propDarkMode !== undefined ? propDarkMode : internalDarkMode;

  // Theme configurations
  const darkTheme = {
    backgroundColor: "#0a192f",
    color: "white",
    accentColor: "#00aaff",
    textSecondary: "#94a3b8",
    darkMode: true,
  };

  const lightTheme = {
    backgroundColor: "#f8fafc",
    color: "#1e293b",
    accentColor: "#00cc66",
    textSecondary: "#64748b",
    darkMode: false,
  };

  const theme = darkMode ? darkTheme : lightTheme;

  // Handle responsive design
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Check for messages from other pages
  useEffect(() => {
    if (window.location.state?.message) {
      setRegistrationMessage(window.location.state.message);
    }
  }, []);

  // Handle URL parameters for authentication callbacks
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const redirectUserType = params.get('userType');
    const errorParam = params.get('error');
    
    if (errorParam) {
      const errorMessages = {
        'azure_auth_failed': 'Microsoft Azure authentication failed.',
        'oauth_individual_only': 'OAuth login is only available for individual users.',
        'unauthorized_organization': 'You are not authorized to access this system.',
        'authentication_failed': 'Authentication failed.',
        'token_generation_failed': 'Failed to generate authentication token.',
      };
      setError(errorMessages[errorParam] || 'Authentication error occurred.');
      setIsOAuthLoading(false);
      return;
    }
    
    if (token) {
      console.log('Token detected in URL, storing and redirecting');
      localStorage.setItem("token", token);
      
      if (redirectUserType) {
        redirectUser(redirectUserType);
      } else {
        redirectUser('individual');
      }
    }
  }, []);

  // Theme toggle function
  const toggleTheme = () => {
    if (propToggleTheme) {
      propToggleTheme();
    } else {
      const newDarkMode = !internalDarkMode;
      setInternalDarkMode(newDarkMode);
      localStorage.setItem('darkMode', JSON.stringify(newDarkMode));
    }
  };

  const redirectUser = (userType) => {
    const routes = {
      individual: "/individual-home",
      institute: "/institute-home",
      admin: "/admin-home",
      staff: "/staff-home",
      executive_staff: "/executive-staff-home"
    };

    const route = routes[userType];
    if (route) {
      window.location.href = route;
    } else {
      setError("Unknown user type.");
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password, userType }),
      });

      const data = await response.json();

      if (response.ok) {
        const { token, userType: responseUserType } = data;
        localStorage.setItem("token", token);
        redirectUser(responseUserType);
      } else {
        if (data.useAzureLogin) {
          setError("Staff and Executive members must use Microsoft Azure login. Please click the Azure login button below.");
        } else {
          setError(data.message || "Invalid credentials or user type.");
        }
      }
    } catch (err) {
      console.error("Error during login:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAzureLogin = () => {
    setIsOAuthLoading(true);
    console.log('Redirecting to Azure auth for:', userType);
    window.location.href = `${import.meta.env.VITE_BASE_URL}/api/auth/azure/login?userType=${userType}`;
  };

  const toggleStaffNotification = () => {
    setShowStaffNotification(!showStaffNotification);
  };

  const handleBackToHome = () => {
    window.location.href = '/';
  };

  const showAzureLogin = ["staff", "executive_staff"].includes(userType);

  return (
    <div
      style={{
        backgroundColor: theme.backgroundColor,
        color: theme.color,
        transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "relative",
        overflow: "hidden",
        minHeight: "100vh",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      }}
    >
      {/* Background Effects */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        opacity: 0.1,
        pointerEvents: 'none',
        background: darkMode 
          ? 'radial-gradient(circle at 20% 50%, #00aaff 0%, transparent 50%), radial-gradient(circle at 80% 20%, #0066ff 0%, transparent 50%)'
          : 'radial-gradient(circle at 20% 50%, #00cc66 0%, transparent 50%), radial-gradient(circle at 80% 20%, #00aa88 0%, transparent 50%)'
      }} />

      {/* Main Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Enhanced Navbar */}
        <nav style={{ 
          background: "transparent", 
          position: "fixed", 
          top: 0,
          width: "100%",
          padding: isMobile ? "1rem" : "1rem 2rem",
          zIndex: 10,
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${theme.darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`
        }}>
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            maxWidth: "1200px",
            margin: "0 auto"
          }}>
            <div 
              onClick={handleBackToHome} 
              style={{ 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}
            >
              <img 
                src={Logo} 
                alt="Logo" 
                style={{ height: '40px', width: 'auto' }} 
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleTheme}
                style={{ 
                  background: "transparent",
                  border: "none",
                  color: theme.color,
                  cursor: "pointer",
                  padding: "0.5rem",
                  borderRadius: "50%",
                  transition: "all 0.3s ease",
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {darkMode ? <SunIcon /> : <MoonIcon />}
              </motion.button>
              
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{ 
                  background: "transparent", 
                  color: theme.color,
                  border: `1px solid ${theme.darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'}`,
                  padding: "0.5rem 1rem",
                  borderRadius: "8px",
                  cursor: "pointer",
                  backdropFilter: 'blur(10px)',
                  transition: "all 0.3s ease",
                  fontSize: '0.9rem'
                }} 
                onClick={() => window.location.href = '/register'}
              >
                Register
              </motion.button>
            </div>
          </div>
        </nav>

        {/* Main Content Container */}
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          minHeight: '100vh', 
          paddingTop: '80px',
          maxWidth: "1200px",
          margin: "0 auto",
          padding: isMobile ? "80px 1rem 2rem" : "80px 2rem 2rem"
        }}>
          {/* Login Container */}
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: (isMobile || isTablet) ? "1fr" : "1fr 1fr",
            gap: isMobile ? "2rem" : "3rem",
            alignItems: "center",
            width: "100%",
            maxWidth: "1000px"
          }}>
            {/* Left Content - Animated Logo */}
            {!isMobile && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
                style={{
                  width: '100%',
                  height: '500px',
                  overflow: 'hidden',

                  backdropFilter: 'blur(20px)',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <AnimatedLogo darkMode={darkMode} />
              </motion.div>
            )}

            {/* Right Content - Login Form */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              style={{
                background: darkMode 
                  ? 'linear-gradient(135deg, rgba(10, 25, 47, 0.6), rgba(15, 30, 55, 0.4))' 
                  : 'linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(248, 250, 252, 0.6))',
                backdropFilter: 'blur(20px)',
                border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                borderRadius: '24px',
                padding: isMobile ? '2rem' : '3rem',
                boxShadow: `0 25px 50px ${darkMode ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.15)'}`,
                width: '100%'
              }}
            >
              {loading || isOAuthLoading ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "300px"
                  }}
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    style={{
                      width: "3rem",
                      height: "3rem",
                      border: `3px solid ${theme.accentColor}30`,
                      borderTop: `3px solid ${theme.accentColor}`,
                      borderRadius: "50%"
                    }}
                  />
                  <p style={{ marginTop: "1rem", fontSize: "1.1rem", color: theme.textSecondary }}>
                    {isOAuthLoading ? "Redirecting to authentication..." : "Logging in..."}
                  </p>
                </div>
              ) : (
                <>
                  {/* Header */}
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    style={{ textAlign: "center", marginBottom: "2rem" }}
                  >
                    <h1 style={{ 
                      fontSize: isMobile ? "1.8rem" : "2.2rem", 
                      fontWeight: "800", 
                      color: theme.accentColor,
                      marginBottom: "0.5rem",
                      textShadow: `0 0 15px ${theme.accentColor}40`
                    }}>
                      Welcome Back
                    </h1>
                    <p style={{ color: theme.textSecondary, fontSize: "1rem" }}>
                      Sign in to access your internship portal
                    </p>
                  </motion.div>

                  {/* Registration success message */}
                  {registrationMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        background: `linear-gradient(135deg, #00cc66, #00aa88)`,
                        color: "white",
                        padding: "0.75rem 1rem",
                        borderRadius: "12px",
                        marginBottom: "1rem",
                        fontSize: "0.9rem"
                      }}
                    >
                      {registrationMessage}
                    </motion.div>
                  )}

                  {/* Error message */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        background: `linear-gradient(135deg, #ff4444, #cc3333)`,
                        color: "white",
                        padding: "0.75rem 1rem",
                        borderRadius: "12px",
                        marginBottom: "1rem",
                        fontSize: "0.9rem"
                      }}
                    >
                      {error}
                    </motion.div>
                  )}

                  {/* Azure Login Card for Staff/Executive */}
                  {showAzureLogin && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.6 }}
                      style={{
                        background: darkMode 
                          ? 'linear-gradient(135deg, rgba(15, 30, 55, 0.6), rgba(20, 35, 60, 0.4))' 
                          : 'linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(240, 245, 255, 0.6))',
                        border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                        borderRadius: '16px',
                        padding: '2rem',
                        textAlign: 'center',
                        marginBottom: '1.5rem'
                      }}
                    >
                      <MicrosoftIcon />
                      <h3 style={{ 
                        fontWeight: "700", 
                        marginBottom: "0.5rem", 
                        marginTop: "1rem",
                        color: theme.color 
                      }}>
                        Employee Login
                      </h3>
                      <p style={{ 
                        marginBottom: "1.5rem", 
                        color: theme.textSecondary,
                        fontSize: "0.95rem"
                      }}>
                        {userType === 'executive_staff' ? 'Executive' : 'Staff'} members must use 
                        Microsoft Azure Active Directory to login with your company credentials.
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleAzureLogin}
                        disabled={isOAuthLoading}
                        style={{
                          background: `linear-gradient(135deg, ${theme.accentColor}, ${darkMode ? '#0066ff' : '#00aa88'})`,
                          color: "white",
                          border: "none",
                          padding: "0.75rem 1.5rem",
                          borderRadius: "12px",
                          fontSize: "1rem",
                          fontWeight: "600",
                          cursor: "pointer",
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                          width: '100%',
                          boxShadow: `0 8px 25px ${theme.accentColor}40`,
                          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                        }}
                      >
                        <MicrosoftIcon />
                        Login with Microsoft Azure
                      </motion.button>
                    </motion.div>
                  )}

                  {/* Traditional Login Form - Hidden for staff/executive_staff */}
                  {!showAzureLogin && (
                    <motion.form
                      onSubmit={handleSubmit}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.6 }}
                    >
                      {/* User Type Selection */}
                      <div style={{ marginBottom: "1.5rem" }}>
                        <label style={{ 
                          display: "block", 
                          marginBottom: "0.5rem", 
                          fontWeight: "600", 
                          color: theme.color 
                        }}>
                          Select Role
                        </label>
                        <select
                          value={userType}
                          onChange={(e) => setUserType(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "0.75rem 1rem",
                            borderRadius: "12px",
                            border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'}`,
                            background: darkMode 
                              ? 'rgba(15, 30, 55, 0.3)' 
                              : 'rgba(255, 255, 255, 0.8)',
                            color: theme.color,
                            fontSize: "1rem",
                            backdropFilter: 'blur(10px)',
                            transition: "all 0.3s ease"
                          }}
                        >
                          <option value="individual">Individual</option>
                          <option value="institute">Institute</option>
                          <option value="admin">Admin</option>
                          <option value="staff">Staff</option>
                          <option value="executive_staff">Executive Staff</option>
                        </select>
                      </div>

                      {/* Username Field */}
                      <div style={{ marginBottom: "1.5rem" }}>
                        <label style={{ 
                          display: "block", 
                          marginBottom: "0.5rem", 
                          fontWeight: "600", 
                          color: theme.color 
                        }}>
                          Username
                        </label>
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "0.75rem 1rem",
                            borderRadius: "12px",
                            border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'}`,
                            background: darkMode 
                              ? 'rgba(15, 30, 55, 0.3)' 
                              : 'rgba(255, 255, 255, 0.8)',
                            color: theme.color,
                            fontSize: "1rem",
                            backdropFilter: 'blur(10px)',
                            transition: "all 0.3s ease"
                          }}
                          required
                          placeholder="Enter your username"
                        />
                      </div>

                      {/* Password Field */}
                      <div style={{ marginBottom: "1.5rem" }}>
                        <label style={{ 
                          display: "block", 
                          marginBottom: "0.5rem", 
                          fontWeight: "600", 
                          color: theme.color 
                        }}>
                          Password
                        </label>
                        <div style={{ 
                          display: "flex", 
                          alignItems: "center",
                          position: "relative"
                        }}>
                          <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{
                              width: "100%",
                              padding: "0.75rem 1rem",
                              borderRadius: "12px",
                              border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'}`,
                              background: darkMode 
                                ? 'rgba(15, 30, 55, 0.3)' 
                                : 'rgba(255, 255, 255, 0.8)',
                              color: theme.color,
                              fontSize: "1rem",
                              backdropFilter: 'blur(10px)',
                              transition: "all 0.3s ease"
                            }}
                            required
                            placeholder="Enter your password"
                          />
                          <button
                            onClick={() => setShowPassword(!showPassword)}
                            style={{
                              position: "absolute",
                              right: "0.75rem",
                              background: "transparent",
                              border: "none",
                              color: theme.textSecondary,
                              cursor: "pointer",
                              padding: "0.5rem",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center"
                            }}
                          >
                            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                          </button>
                        </div>
                      </div>

                      {/* Forgot Password Link */}
                      <div style={{ 
                        display: "flex", 
                        justifyContent: "flex-end", 
                        marginBottom: "1.5rem" 
                      }}>
                        <a
                          href="/forgot-password/email-confirm"
                          style={{ 
                            color: theme.accentColor,
                            textDecoration: "none",
                            fontSize: "0.9rem",
                            fontWeight: "500"
                          }}
                        >
                          Forgot your password?
                        </a>
                      </div>

                      {/* Submit Button */}
                      <motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        style={{
                          width: "100%",
                          background: `linear-gradient(135deg, ${theme.accentColor}, ${darkMode ? '#0066ff' : '#00aa88'})`,
                          color: "white",
                          border: "none",
                          padding: "0.75rem 1.5rem",
                          borderRadius: "12px",
                          fontSize: "1rem",
                          fontWeight: "600",
                          cursor: "pointer",
                          marginBottom: "1.5rem",
                          boxShadow: `0 8px 25px ${theme.accentColor}40`,
                          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                        }}
                      >
                        Login
                      </motion.button>

                      {/* Registration Link */}
                      <div style={{ 
                        textAlign: "center", 
                        marginTop: "1rem" 
                      }}>
                        <p style={{ 
                          color: theme.textSecondary,
                          fontSize: "0.95rem"
                        }}>
                          Don't have an account?{" "}
                          <a
                            href="/register"
                            style={{ 
                              color: theme.accentColor,
                              textDecoration: "none",
                              fontWeight: "600"
                            }}
                          >
                            Create one
                          </a>
                        </p>
                      </div>
                    </motion.form>
                  )}

                  {/* Staff Login Info Button */}
                  <div style={{ 
                    textAlign: "center", 
                    marginTop: "1.5rem" 
                  }}>
                    <button
                      onClick={toggleStaffNotification}
                      style={{ 
                        background: "transparent",
                        border: "none",
                        color: theme.accentColor,
                        textDecoration: "none",
                        cursor: "pointer",
                        fontSize: "0.9rem",
                        fontWeight: "500"
                      }}
                    >
                      University/Institute login information
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Staff Notification Modal */}
      {showStaffNotification && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 100,
          backdropFilter: "blur(5px)"
        }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            style={{
              background: darkMode 
                ? 'linear-gradient(135deg, rgba(10, 25, 47, 0.9), rgba(15, 30, 55, 0.8))' 
                : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(248, 250, 252, 0.8))',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
              borderRadius: '16px',
              padding: '2rem',
              maxWidth: '500px',
              width: '90%',
              boxShadow: `0 25px 50px ${darkMode ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.15)'}`
            }}
          >
            <h3 style={{ 
              fontWeight: "700", 
              marginBottom: "1rem",
              color: theme.color 
            }}>
              University/Institute Login Information
            </h3>
            
            <div style={{ marginBottom: "1.5rem" }}>
              <h4 style={{ 
                fontSize: "1rem",
                marginBottom: "0.5rem",
                color: theme.color 
              }}>
                For University/Institute Representatives:
              </h4>
              <p style={{ 
                color: theme.textSecondary,
                fontSize: "0.95rem",
                lineHeight: 1.6
              }}>
                If you want to log in as a university or institute representative, please click the "Create one" button to register.
              </p>
            </div>
            
            <div style={{ marginBottom: "1.5rem" }}>
              <h4 style={{ 
                fontSize: "1rem",
                marginBottom: "0.5rem",
                color: theme.color 
              }}>
                For Company Staff & Executives:
              </h4>
              <p style={{ 
                color: theme.textSecondary,
                fontSize: "0.95rem",
                lineHeight: 1.6
              }}>
                Company employees must use Microsoft Azure Active Directory login with their corporate credentials. Select "Staff" or "Executive" from the role dropdown and use the Azure login button.
              </p>
            </div>
            
            <div style={{ 
              display: "flex", 
              justifyContent: "flex-end" 
            }}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={toggleStaffNotification}
                style={{
                  background: `linear-gradient(135deg, ${theme.accentColor}, ${darkMode ? '#0066ff' : '#00aa88'})`,
                  color: "white",
                  border: "none",
                  padding: "0.5rem 1.5rem",
                  borderRadius: "8px",
                  fontSize: "0.95rem",
                  fontWeight: "600",
                  cursor: "pointer",
                  boxShadow: `0 4px 15px ${theme.accentColor}40`,
                  transition: "all 0.3s ease"
                }}
              >
                Got it
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Enhanced Global Styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        
        body {
          overflow-x: hidden;
        }
        
        button:hover {
          transform: translateY(-1px);
        }
        
        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 6px;
        }
        
        ::-webkit-scrollbar-track {
          background: ${darkMode ? '#0a192f' : '#f1f5f9'};
        }
        
        ::-webkit-scrollbar-thumb {
          background: ${theme.accentColor};
          border-radius: 3px;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;