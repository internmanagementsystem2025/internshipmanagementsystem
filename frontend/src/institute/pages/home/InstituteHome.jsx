import { useState, useEffect } from "react";
import { Card, Row, Col, Container, Form, Button } from "react-bootstrap";
import { FiFileText, FiUserCheck, FiAward, FiUpload } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import RecommendationPopup from "../../../components/notifications/RecommendationPopup";
import logo from "../../../assets/logo.png";
import Notification from "../../../components/notifications/Notification";

const InstituteHome = ({ darkMode }) => {
  const [email, setEmail] = useState("");
  const [hoveredCard, setHoveredCard] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    variant: "success",
  });

  // Handle Email Submit to backend
  const handleEmailSubmit = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/emails/register",
        { email }
      );
      setNotification({
        show: true,
        message: response.data.message,
        variant: "success",
      });
    } catch (error) {
      console.error("Error submitting email:", error);
      setNotification({
        show: true,
        message: "Email has already been sent for this address.",
        variant: "danger",
      });
    }
  };

  // Save user rating to backend
  const saveUserRating = async (rating) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in to submit your rating.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/recommendations",
        { userId: "YOUR_USER_ID_HERE", rating },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response.data.message);
      alert(response.data.message);
    } catch (error) {
      console.error("Error saving rating:", error);
      alert("An error occurred while saving your rating.");
    }
  };

  const cardStyle = (darkMode, isHovered) => ({
    cursor: "pointer",
    border: "none",
    borderRadius: "8px",
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
  });

  useEffect(() => {
    // Check last popup display time
    const lastPopupTime = localStorage.getItem("lastPopupTime");
    const currentTime = new Date().getTime();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;

    if (!lastPopupTime || currentTime - lastPopupTime > oneWeek) {
      setTimeout(() => {
        setShowPopup(true);
        localStorage.setItem("lastPopupTime", currentTime.toString());
      }, 60000);
    }
  }, []);

  return (
    <div
      style={{
        backgroundColor: darkMode ? "#1a1a1a" : "#f4f4f4",
        minHeight: "100vh",
        padding: "30px 0",
      }}
    >
      <Container>
        {/* Logo Section */}
        <div className="d-flex justify-content-center mt-4 mb-5">
          <img src={logo} alt="Company Logo" className="w-25 h-auto" />
        </div>

        {/* Main Content */}
        <h2 className="text-center mb-5 mt-4">CLICK YOUR INTERNSHIP STATUS</h2>
        <Row className="justify-content-center g-4">
          <Col md={4}>
            <Card
              onClick={() => navigate("/institute-add-cv")}
              onMouseEnter={() => setHoveredCard("request-internship")}
              onMouseLeave={() => setHoveredCard(null)}
              style={cardStyle(darkMode, hoveredCard === "request-internship")}
            >
              <Card.Body className="d-flex flex-column align-items-center justify-content-between">
                <Card.Title className="text-center">
                  Request an Internship
                </Card.Title>
                <FiFileText size={40} />
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={4}>
            <Card
              onClick={() => navigate("/bulk-cv-upload")}
              onMouseEnter={() => setHoveredCard("bulk-cv-upload")}
              onMouseLeave={() => setHoveredCard(null)}
              style={cardStyle(darkMode, hoveredCard === "bulk-cv-upload")}
            >
              <Card.Body className="d-flex flex-column align-items-center justify-content-between">
                <Card.Title className="text-center">Add Bulk CVs</Card.Title>
                <FiUpload size={40} />
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={4}>
            <Card
              onClick={() => navigate("/institute-all-aplications")}
              onMouseEnter={() => setHoveredCard("all-applications")}
              onMouseLeave={() => setHoveredCard(null)}
              style={cardStyle(darkMode, hoveredCard === "all-applications")}
            >
              <Card.Body className="d-flex flex-column align-items-center justify-content-between">
                <Card.Title className="text-center">
                  All Applications
                </Card.Title>
                <FiUserCheck size={40} />
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Email Subscription Section */}
        <h4 className="text-center mb-4" style={{ marginTop: "80px" }}>
          Please Enter your Email to get more information about your Internship!
        </h4>
        <div className="d-flex justify-content-center">
          <div
            className="position-relative"
            style={{ width: "100%", maxWidth: "400px" }}
          >
            <Form
              onSubmit={(e) => {
                e.preventDefault();
                handleEmailSubmit();
              }}
            >
              <div
                className="d-flex"
                style={{
                  border: darkMode ? "2px solid #007bff" : "2px solid #28a745",
                  borderRadius: "30px",
                  overflow: "hidden",
                  padding: "3px",
                  backgroundColor: "white",
                }}
              >
                <Form.Control
                  type="email"
                  placeholder="Enter your email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="p-2"
                  style={{
                    border: "none",
                    boxShadow: "none",
                    outline: "none",
                    fontSize: "14px",
                    height: "35px",
                    borderRadius: "30px 0 0 30px",
                  }}
                />
                <Button
                  type="submit"
                  className="px-3 py-2"
                  style={{
                    background: darkMode
                      ? "linear-gradient(135deg, #007bff, #004d99)"
                      : "linear-gradient(135deg, #28a745, #004d00)",
                    border: "none",
                    color: "white",
                    fontSize: "14px",
                    height: "35px",
                    borderRadius: "30px",
                  }}
                >
                  Send
                </Button>
              </div>
            </Form>
          </div>
        </div>

        {/* About SLT Training Program */}
        <h2 className="text-center mb-4" style={{ marginTop: "80px" }}>
          ABOUT SLT TRAINING PROGRAM
        </h2>
        <p className="text-justify mb-5" style={{ textAlign: "justify" }}>
          The SLT Training Program is a comprehensive initiative designed to
          empower individuals with the skills and knowledge required to excel in
          the telecommunications industry. This program focuses on developing
          technical expertise, problem-solving abilities, and customer service
          skills through hands-on training and real-world scenarios.
          Participants will gain insights into cutting-edge technologies,
          network infrastructure, and incident management processes. With a
          blend of theoretical knowledge and practical experience, the program
          equips trainees to handle challenges effectively while fostering
          innovation and teamwork. By completing the SLT Training Program,
          individuals can unlock opportunities for professional growth and
          contribute significantly to the organization's success.
        </p>
      </Container>

      <RecommendationPopup
        show={showPopup}
        onClose={() => setShowPopup(false)}
        darkMode={darkMode}
        onSaveRating={saveUserRating}
      />

      <Notification
        show={notification.show}
        onClose={() => setNotification({ ...notification, show: false })}
        message={notification.message}
        variant={notification.variant}
      />
    </div>
  );
};

export default InstituteHome;