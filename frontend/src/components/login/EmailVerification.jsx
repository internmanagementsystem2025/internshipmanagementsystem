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
import { FiKey, FiArrowLeft } from "react-icons/fi";

const EmailVerification = ({ darkMode }) => {
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const backendUrl = "http://localhost:5000";

  // Theme classes
  const themeClass = darkMode ? "bg-dark text-white" : "bg-light text-dark";
  const cardClass = darkMode ? "bg-secondary text-white" : "bg-white text-dark";
  const inputClass = darkMode ? "bg-dark text-white border-secondary" : "bg-white text-dark";
  const textMutedClass = darkMode ? "text-light-emphasis" : "text-muted";

  const handleVerification = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        `${backendUrl}/api/auth/verify-email`,
        { verificationCode },
        { 
          headers: { 
            'Content-Type': 'application/json' 
          } 
        }
      );

      // Successful verification
      navigate('/login', {
        state: {
          message: response.data.message,
          userType: response.data.userType
        }
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
      setLoading(false);
    }
  };

  return (
    <Container fluid className={`d-flex align-items-center justify-content-center min-vh-100 ${themeClass}`}>
      <Row className="justify-content-center w-100">
        <Col xs={12} sm={10} md={8} lg={6} xl={4}>
          <Card className={`shadow border-0 ${cardClass}`} style={{ borderRadius: "12px" }}>
            <Card.Body className="p-4 p-md-5">
              <div className="text-center mb-4">
                <h3 className="fw-bold">Email Verification</h3>
                <p className={textMutedClass}>Enter the 6-digit verification code sent to your email</p>
              </div>

              {error && (
                <Alert variant="danger" className="mb-4 text-center" style={{ borderRadius: "8px" }}>
                  {error}
                </Alert>
              )}

              <Form onSubmit={handleVerification}>
                <Form.Group className="mb-4">
                  <Form.Label className="fw-medium">Verification Code</Form.Label>
                  <InputGroup>
                    <InputGroup.Text className={inputClass}>
                      <FiKey />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      required
                      placeholder="Enter 6-digit verification code"
                      maxLength="6"
                      className={`${inputClass} border-start-0`}
                      style={{ borderRadius: "0 8px 8px 0" }}
                    />
                  </InputGroup>
                </Form.Group>

                <div className="d-grid gap-2">
                  <Button 
                    type="submit" 
                    variant="primary"
                    disabled={loading || verificationCode.length !== 6} 
                    className="py-2"
                    style={{ borderRadius: "8px" }}
                  >
                    {loading ? (
                      <>
                        <Spinner size="sm" animation="border" className="me-2" /> 
                        Verifying...
                      </>
                    ) : (
                      "Verify Email"
                    )}
                  </Button>
                  
                  <Button 
                    variant="link" 
                    className={`text-decoration-none ${darkMode ? "text-light" : "text-dark"}`}
                    onClick={() => navigate("/register")}
                  >
                    <FiArrowLeft className="me-1" /> Back to Register
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

export default EmailVerification;