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

const ArrowRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"/>
    <path d="M12 5l7 7-7 7"/>
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
          fontSize: '4rem',
          fontWeight: 'bold',
          color: darkMode ? 'white' : '#1e293b',
          textAlign: 'center',
          lineHeight: 1.2
        }}
      >
        SLT-Mobitel
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
          fontSize: '1.5rem',
          fontWeight: '600',
          color: darkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
          marginTop: '1rem',
          textAlign: 'center'
        }}
      >
        Internship Portal
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

const LandingPage = ({ darkMode: propDarkMode, toggleTheme: propToggleTheme }) => {
  const [internalDarkMode, setInternalDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme !== null) {
      return JSON.parse(savedTheme);
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

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

  // Handle theme persistence
  useEffect(() => {
    if (propDarkMode === undefined) {
      localStorage.setItem('darkMode', JSON.stringify(internalDarkMode));
    }
  }, [internalDarkMode, propDarkMode]);

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

  // Navigation handlers
  const handleLogin = () => {
    window.location.href = '/login';
  };

  const handleRegister = () => {
    window.location.href = '/register';
  };

  const handleGetStarted = () => {
    window.location.href = '/login';
  };

  const handleLearnMore = () => {
    window.location.href = '/learn-more';
  };

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
        {/* Enhanced Navbar with Company Logo */}
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
            {/* Logo and Company Name */}
            <div 
              onClick={() => window.location.reload()} 
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

            <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "0.5rem" : "1rem" }}>
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
              
              {!isMobile && (
                <>
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
                    onClick={handleLogin}
                  >
                    Login
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{ 
                      background: `linear-gradient(135deg, ${theme.accentColor}, ${darkMode ? '#0066ff' : '#00aa88'})`, 
                      color: "white",
                      border: "none",
                      padding: "0.5rem 1rem",
                      borderRadius: "8px",
                      cursor: "pointer",
                      boxShadow: `0 4px 15px ${theme.accentColor}40`,
                      transition: "all 0.3s ease",
                      fontSize: '0.9rem'
                    }}
                    onClick={handleRegister}
                  >
                    Register
                  </motion.button>
                </>
              )}
            </div>
          </div>
        </nav>

        {/* Main Content Container */}
        <div style={{ 
          display: "flex", 
          flexDirection: "column", 
          alignItems: "center", 
          justifyContent: "center", 
          minHeight: '100vh', 
          paddingTop: '80px',
          maxWidth: "1200px",
          margin: "0 auto",
          padding: isMobile ? "80px 1rem 2rem" : "80px 2rem 2rem"
        }}>
          {/* Hero Section */}
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: (isMobile || isTablet) ? "1fr" : "1fr 1fr",
            gap: isMobile ? "2rem" : "3rem",
            alignItems: "center",
            width: "100%"
          }}>
            {/* Left Content */}
            <div style={{ textAlign: (isMobile || isTablet) ? "center" : "left" }}>
              <motion.h1
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                style={{ 
                  fontSize: isMobile ? "2rem" : isTablet ? "2.5rem" : "3rem", 
                  color: theme.accentColor,
                  lineHeight: 1.2,
                  fontWeight: "800",
                  marginBottom: "1.5rem",
                  textShadow: `0 0 15px ${theme.accentColor}40`
                }}
              >
                WELCOME TO{" "}
                <span style={{ 
                  color: theme.color,
                  fontWeight: "800"
                }}>
                  SLT-MOBITEL
                </span>{" "}
                INTERNSHIP PORTAL
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                style={{ 
                  color: theme.textSecondary,
                  fontSize: isMobile ? "1rem" : "1.1rem",
                  marginBottom: "2rem",
                  lineHeight: 1.6,
                  maxWidth: isMobile ? "100%" : "90%"
                }}
              >
                Manage and track your internship journey with ease. Join our innovative program and gain real-world experience with cutting-edge technologies.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                style={{ 
                  display: "flex", 
                  gap: "1rem", 
                  justifyContent: (isMobile || isTablet) ? "center" : "flex-start",
                  flexWrap: "wrap"
                }}
              >
                <motion.button 
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  style={{ 
                    background: `linear-gradient(135deg, ${theme.accentColor}, ${darkMode ? '#0066ff' : '#00aa88'})`,
                    color: "white",
                    border: "none",
                    padding: isMobile ? "0.8rem 1.5rem" : "1rem 2rem",
                    borderRadius: "12px",
                    fontSize: isMobile ? "0.9rem" : "1rem",
                    fontWeight: "600",
                    cursor: "pointer",
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    boxShadow: `0 8px 25px ${theme.accentColor}40`,
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                  }} 
                  onClick={handleGetStarted}
                >
                  Explore Opportunities <ArrowRightIcon />
                </motion.button>
                
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{ 
                    background: 'transparent',
                    color: theme.accentColor,
                    border: `2px solid ${theme.accentColor}`,
                    padding: isMobile ? "0.8rem 1.5rem" : "1rem 2rem",
                    borderRadius: "12px",
                    fontSize: isMobile ? "0.9rem" : "1rem",
                    fontWeight: "600",
                    cursor: "pointer",
                    backdropFilter: 'blur(10px)',
                    transition: "all 0.3s ease"
                  }}
                  onClick={handleLearnMore}
                >
                  Learn More
                </motion.button>
              </motion.div>

              {/* Mobile buttons */}
              {isMobile && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.8 }}
                  style={{ 
                    display: "flex", 
                    gap: "0.5rem", 
                    justifyContent: "center",
                    marginTop: "1.5rem"
                  }}
                >
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{ 
                      background: "transparent", 
                      color: theme.color,
                      border: `1px solid ${theme.darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'}`,
                      padding: "0.6rem 1.2rem",
                      borderRadius: "8px",
                      cursor: "pointer",
                      backdropFilter: 'blur(10px)',
                      transition: "all 0.3s ease",
                      fontSize: '0.85rem'
                    }} 
                    onClick={handleLogin}
                  >
                    Login
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{ 
                      background: `linear-gradient(135deg, ${theme.accentColor}, ${darkMode ? '#0066ff' : '#00aa88'})`, 
                      color: "white",
                      border: "none",
                      padding: "0.6rem 1.2rem",
                      borderRadius: "8px",
                      cursor: "pointer",
                      boxShadow: `0 4px 15px ${theme.accentColor}40`,
                      transition: "all 0.3s ease",
                      fontSize: '0.85rem'
                    }}
                    onClick={handleRegister}
                  >
                    Register
                  </motion.button>
                </motion.div>
              )}
            </div>
            
            {/* Right Content - Always Animated Logo */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
              style={{
                width: '100%',
                height: isMobile ? '400px' : '500px',
                borderRadius: '24px',
                overflow: 'hidden',
                boxShadow: `0 25px 50px ${darkMode ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.15)'}`,
                background: darkMode 
                  ? 'linear-gradient(135deg, rgba(10, 25, 47, 0.4), rgba(15, 30, 55, 0.3))' 
                  : 'linear-gradient(135deg, rgba(255, 255, 255, 0.4), rgba(248, 250, 252, 0.3))',
                backdropFilter: 'blur(20px)',
                border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <AnimatedLogo darkMode={darkMode} />
            </motion.div>
          </div>
        </div>
      </div>

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

export default LandingPage;