import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Navbar, Nav } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BsSun, BsMoon } from "react-icons/bs";
import { BsFillPersonFill, BsFillPersonPlusFill, BsFillCheckCircleFill } from "react-icons/bs";
import axios from "axios";
import logo from "../../assets/logo.png";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000"); 

const LandingPage = ({ darkMode, toggleTheme }) => {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    visitorCount: 0,
    registeredUsers: 0,
    recommendationPercentage: 0,
  });

  const darkTheme = {
    backgroundColor: "#0a192f",
    color: "white",
    accentColor: "#00aaff",
    textSecondary: "#cbd5e1",
  };

  const lightTheme = {
    backgroundColor: "#f8f9fa",
    color: "#333",
    accentColor: "#00cc66",
    textSecondary: "#555",
  };

  const theme = darkMode ? darkTheme : lightTheme;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axios.get("http://localhost:5000/api/stats");
        setStats(data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    // Increase visitor count when user visits the page
    axios.post("http://localhost:5000/api/stats/visit").catch((error) => {
      console.error("Error updating visitor count:", error);
    });

    fetchStats();

    // Listen for real-time updates
    socket.on("statsUpdate", (data) => {
      setStats(data);
    });

    return () => {
      socket.off("statsUpdate");
    };
  }, []);

  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center min-vh-100"
      style={{
        backgroundColor: theme.backgroundColor,
        color: theme.color,
        transition: "background 0.3s ease-in-out, color 0.3s ease-in-out",
      }}
    >
      {/* Navbar */}
      <Navbar expand="lg" className="py-3 px-4 w-100" style={{ background: "transparent", position: "absolute", top: 0 }}>
        <Container fluid>
          <div className="d-flex justify-content-between align-items-center w-100">
            <Navbar.Brand onClick={() => navigate("/")} className="p-0">
              <img src={logo} alt="Company Logo" className="img-fluid" style={{ height: "30px", maxWidth: "100%" }} />
            </Navbar.Brand>

            <Nav className="d-flex align-items-center">
              <Nav.Item className="me-2">
                <Button variant="link" onClick={toggleTheme} className="p-1 d-flex align-items-center" style={{ minWidth: "auto" }}>
                  {darkMode ? <BsSun size={20} color="#ffcc00" /> : <BsMoon size={20} color="#003366" />}
                </Button>
              </Nav.Item>
              <Nav.Item className="me-2 d-none d-md-block">
                <Button className="btn-sm border-0 px-3 py-2" style={{ background: "transparent", color: theme.color }} onClick={() => navigate("/login")}>
                  Login
                </Button>
              </Nav.Item>
              <Nav.Item className="d-none d-lg-block">
                <Button
                  className="btn-sm px-3 py-2 border-0"
                  style={{ background: theme.accentColor, color: darkMode ? "black" : "white" }}
                  onClick={() => navigate("/register")}
                >
                  Register
                </Button>
              </Nav.Item>
            </Nav>
          </div>
        </Container>
      </Navbar>

      {/* Main Content */}
      <Container className="text-center d-flex flex-column align-items-center justify-content-center">
        <motion.h1
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="fw-bold"
          style={{ fontSize: "calc(1.5rem + 1vw)", color: theme.accentColor, textShadow: `0 0 15px ${theme.accentColor}` }}
        >
          WELCOME TO SLT-MOBITEL INTERNSHIP PORTAL
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 fs-5" style={{ color: theme.textSecondary }}>
          Manage and track your internship journey with ease.
        </motion.p>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Button className="mt-3 px-4 py-2 btn-lg border-0 explore-btn" style={{ color: "white", fontSize: "1rem" }} onClick={() => navigate("/login")}>
            Explore Opportunities
          </Button>
        </motion.div>

        {/* Stats Section */}
        <Row style={{ marginTop: "8rem" }} className="w-100 d-flex justify-content-center">
        <Col xs={6} sm={4} md={3} className="d-flex justify-content-center">
        <StatCard count={stats.visitorCount} label="Visitor Count" theme={theme} icon={<BsFillPersonFill size={22} color="white" />} />
        </Col>
        <Col xs={6} sm={4} md={3} className="d-flex justify-content-center">
        <StatCard count={stats.registeredUsers} label="Registered Users" theme={theme} icon={<BsFillPersonPlusFill size={22} color="white" />} />
        </Col>
        <Col xs={6} sm={4} md={3} className="d-flex justify-content-center">
        <StatCard count={`${stats.recommendationPercentage}%`} label="Recommended" theme={theme} icon={<BsFillCheckCircleFill size={22} color="white" />} />
        </Col>
        </Row>
      </Container>

      <style>{`
        .explore-btn {
          background: linear-gradient(45deg, #00aaff, #00cc66);
          background-size: 400% 400%;
          animation: gradientAnimation 3s ease infinite;
        }
        @keyframes gradientAnimation {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
};

const formatNumber = (num) => {
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + "B";
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
  return num;
};

// StatCard Component
const StatCard = ({ count, label, theme, icon }) => {
  return (
    <div className="stat-card d-flex align-items-center p-3">
      <div className="icon-container" style={{ backgroundColor: theme.accentColor }}>
        {icon}
      </div>
      <div className="text-container ms-3">
        <div className="count-text" style={{ color: theme.color }}>
          {formatNumber(count)}
        </div>
        <div className="label-text" style={{ color: theme.textSecondary }}>
          {label}
        </div>
      </div>
      <style>{`
        .stat-card {
          width: 210px;
          height: 90px;
          text-align: left;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .icon-container {
          padding: 8px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
        }

        .text-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .count-text {
          font-size: 1.5rem;
          font-weight: 600;
        }

        .label-text {
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
