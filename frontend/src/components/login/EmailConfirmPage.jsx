import React, { useState } from "react";
import {
  Container,
  Form,
  Button,
  Alert,
  Spinner,
  Card,
  InputGroup,
  Row,
  Col
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FiMail, FiArrowLeft } from "react-icons/fi";

const EmailConfirmPage = ({ darkMode }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const backendUrl = "http://localhost:5000"; 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    
    try {
      await axios.post(`${backendUrl}/api/auth/request-password-reset-otp`, { email });
      setMessage("OTP has been sent to your email.");
      setTimeout(() => {
        navigate(`/forgot-password/verify-otp?email=${encodeURIComponent(email)}`);
      }, 2000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Error sending OTP email.");
    } finally {
      setLoading(false);
    }
  };

  // Fixed theme classes for proper dark mode visibility
  const themeClass = darkMode ? "bg-dark text-white" : "bg-light text-dark";
  const cardClass = darkMode ? "bg-secondary text-white" : "bg-white text-dark";
  const inputClass = darkMode ? "bg-dark text-white border-secondary" : "bg-white text-dark";
  const textMutedClass = darkMode ? "text-light-emphasis" : "text-muted";

  return (
    <Container fluid className={`d-flex align-items-center justify-content-center min-vh-100 ${themeClass}`}>
      <Row className="justify-content-center w-100">
        <Col xs={12} sm={10} md={8} lg={6} xl={4}>
          <Card className={`shadow border-0 ${cardClass}`} style={{ borderRadius: "12px" }}>
            <Card.Body className="p-4 p-md-5">
              <div className="text-center mb-4">
                <h3 className="fw-bold">Reset Password</h3>
                <p className={textMutedClass}>Enter your email to receive a verification code</p>
              </div>

              {error && (
                <Alert variant="danger" className="mb-4 text-center" style={{ borderRadius: "8px" }}>
                  {error}
                </Alert>
              )}
              
              {message && (
                <Alert variant="success" className="mb-4 text-center" style={{ borderRadius: "8px" }}>
                  {message}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-4">
                  <Form.Label className="fw-medium">Email Address</Form.Label>
                  <InputGroup>
                    <InputGroup.Text className={inputClass}>
                      <FiMail />
                    </InputGroup.Text>
                    <Form.Control
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="Enter your email"
                      className={`${inputClass} border-start-0`}
                      style={{ borderRadius: "0 8px 8px 0" }}
                    />
                  </InputGroup>
                </Form.Group>

                <div className="d-grid gap-2">
                  <Button 
                    type="submit" 
                    variant="primary"
                    disabled={loading} 
                    className="py-2"
                    style={{ borderRadius: "8px" }}
                  >
                    {loading ? (
                      <>
                        <Spinner size="sm" animation="border" className="me-2" /> 
                        Sending...
                      </>
                    ) : (
                      "Send Verification Code"
                    )}
                  </Button>
                  
                  <Button 
                    variant="link" 
                    className={`text-decoration-none ${darkMode ? "text-light" : "text-dark"}`}
                    onClick={() => navigate("/login")}
                  >
                    <FiArrowLeft className="me-1" /> Back to Login
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default EmailConfirmPage;