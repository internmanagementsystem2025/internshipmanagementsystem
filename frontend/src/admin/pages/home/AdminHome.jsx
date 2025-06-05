import { useState } from "react";
import { Card, Row, Col, Container } from "react-bootstrap";
import { FiFileText, FiUserCheck, FiUsers, FiSearch, FiLayers, FiMail, FiHome, FiMapPin } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import logo from "../../../assets/logo.png";

const AdminHome = ({ darkMode }) => {
  const [hoveredCard, setHoveredCard] = useState(null);
  const navigate = useNavigate();

  // Define dark and light mode colors
  const backgroundColor = darkMode ? "#1a1a1a" : "#f4f4f4";
  const textColor = darkMode ? "white" : "#333";
  const subTextColor = darkMode ? "lightgray" : "#666";


  const cardStyle = (isHovered, bgColor) => ({
    cursor: "pointer",
    border: "none",
    borderRadius: "8px",
    boxShadow: isHovered ? "0 6px 15px rgba(0, 0, 0, 0.2)" : "0 4px 8px rgba(0, 0, 0, 0.1)",
    background: bgColor,
    color: "white",
    height: "160px",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    transform: isHovered ? "scale(1.05)" : "scale(1)",
  });

  return (
    <div
      style={{
        backgroundColor,
        minHeight: "100vh",
        padding: "30px 0",
      }}
    >
      <Container>
        {/* Logo Section */}
        <div className="d-flex justify-content-center mt-2 mb-5">
          <img src={logo} alt="Company Logo" style={{ width: "15%", height: "auto" }} />
        </div>

        {/* Heading and Subheading */}
        <h3 className="text-center mb-4" style={{ fontSize: "2rem", color: textColor }}>
          MANAGE INTERNS AND PLACEMENTS
        </h3>
        <h4 className="text-center mb-5" style={{ fontSize: "1.5rem", color: subTextColor }}>
          Manage & Schedule Interns
        </h4>

        {/* First Row of Cards */}
        <Row className="justify-content-center g-4">
          {[ 
            { title: "Manage CVs", icon: <FiFileText size={40} />, path: "/view-all-cvs", bg: "#2e7d32" },
            { title: "Interviews", icon: <FiUserCheck size={40} />, path: "/view-all-interviews", bg: "#388e3c" },
            { title: "Inductions", icon: <FiUsers size={40} />, path: "/view-all-inductions", bg: "#00695c" },
            { title: "Find Profile", icon: <FiSearch size={40} />, path: "/life-cycle", bg: "#004d40" },
          ].map(({ title, icon, path, bg }, index) => (
            <Col key={index} md={3} sm={6}>
              <Card
                onClick={() => navigate(path)}
                onMouseEnter={() => setHoveredCard(title)}
                onMouseLeave={() => setHoveredCard(null)}
                style={cardStyle(hoveredCard === title, `linear-gradient(to right, ${bg}, ${bg}d0)`)}
              >
                <Card.Body className="d-flex flex-column align-items-center justify-content-center">
                  <Card.Title className="text-center">{title}</Card.Title>
                  {icon}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Secondary Heading */}
        <h3 className="text-center mb-4 mt-5" style={{ fontSize: "2rem", color: textColor }}>
          SCHEMES, MANAGERS, AND REQUESTS
        </h3>
        <h4 className="text-center mb-5" style={{ fontSize: "1.5rem", color: subTextColor }}>
          Manage the Schemes and Requests
        </h4>

        {/* Second Row of Cards */}
        <Row className="justify-content-center g-4">
          {[ 
            { title: "Schemes", icon: <FiLayers size={40} />, path: "/view-all-scheme", bg: "#1e3a8a" },
            { title: "Requests", icon: <FiMail size={40} />, path: "/staff-intern-request", bg: "#1e40af" },
            { title: "Institutes", icon: <FiHome size={40} />, path: "/view-all-institute", bg: "#4f46e5" },
            { title: "Rotations", icon: <FiMapPin size={40} />, path: "/all-rotational-stations", bg: "#1a237e" },
          ].map(({ title, icon, path, bg }, index) => (
            <Col key={index} md={3} sm={6}>
              <Card
                onClick={() => navigate(path)}
                onMouseEnter={() => setHoveredCard(title)}
                onMouseLeave={() => setHoveredCard(null)}
                style={cardStyle(hoveredCard === title, `linear-gradient(to right, ${bg}, ${bg}d0)`)}
              >
                <Card.Body className="d-flex flex-column align-items-center justify-content-center">
                  <Card.Title className="text-center">{title}</Card.Title>
                  {icon}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
};

export default AdminHome;
