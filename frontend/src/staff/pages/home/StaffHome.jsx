import { useState } from "react";
import { Card, Row, Col, Container } from "react-bootstrap";
import { FiFileText, FiUserCheck, FiAward, FiUser } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import logo from "../../../assets/logo.png";

const StaffHome = ({ darkMode }) => {
  const [hoveredCard, setHoveredCard] = useState(null);
  const navigate = useNavigate();

  const cardStyle = (isHovered) => ({
    cursor: "pointer",
    border: "none",
    borderRadius: "10px",
    boxShadow: isHovered
      ? "0 6px 15px rgba(0, 0, 0, 0.2)"
      : "0 4px 8px rgba(0, 0, 0, 0.1)",
    background: darkMode
      ? "linear-gradient(135deg, #3b4e76, #2f3b57)"
      : "linear-gradient(135deg, #66c466, #4d8f4d)",
    color: "white",
    height: "160px",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    transform: isHovered ? "scale(1.05)" : "scale(1)",
    textAlign: "center",
  });

  const cards = [
    { id: "executive-officer-request", title: "Executive Officer Request", icon: <FiUser size={40} />, path: "/executive-intern-request" },
    { id: "request-intern", title: "Request Intern", icon: <FiFileText size={40} />, path: "/create-intern-request" },
    { id: "my-requests", title: "My Requests", icon: <FiUserCheck size={40} />, path: "/view-my-requests" },
    { id: "my-certificate-request", title: "My Certificate Request", icon: <FiAward size={40} />, path: "/my-certificate-request" },
  ];

  return (
    <div
      style={{
        backgroundColor: darkMode ? "#1a1a1a" : "#f4f4f4",
        minHeight: "100vh",
        padding: "30px 0",
      }}
    >
      {/* Header Section */}
      <div className="text-center mb-5">
        <img src={logo} alt="Company Logo" style={{ width: "150px", height: "auto" }} />
        <h2 className="mt-3">Welcome to SLT Intern Management System</h2>
        <h5 >Senior Manager Home</h5>
      </div>

      <Container>
        <Row className="justify-content-center g-4">
          {/* Cards */}
          {cards.map(({ id, title, icon, path }) => (
            <Col md={4} sm={6} xs={12} key={id}>
              <Card
                onClick={() => navigate(path)}
                onMouseEnter={() => setHoveredCard(id)}
                onMouseLeave={() => setHoveredCard(null)}
                style={cardStyle(hoveredCard === id)}
              >
                <Card.Body className="d-flex flex-column align-items-center justify-content-between">
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

export default StaffHome;
