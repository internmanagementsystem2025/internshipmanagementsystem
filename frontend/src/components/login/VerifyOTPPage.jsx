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
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { FiLock, FiKey, FiRepeat, FiArrowLeft, FiEye, FiEyeOff } from "react-icons/fi";

const VerifyOTPPage = ({ darkMode }) => {
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const backendUrl = "http://localhost:5000";

  // Extract email from URL
  const queryParams = new URLSearchParams(location.search);
  const email = queryParams.get("email");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      await axios.post(`${backendUrl}/api/auth/verify-otp-reset-password`, {
        email,
        otp,
        newPassword: password,
      });

      setMessage("Password successfully reset! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Error verifying OTP or resetting password.");
    } finally {
      setLoading(false);
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Toggle confirm password visibility
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Theme classes
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
                <h3 className="fw-bold">Verify OTP & Reset Password</h3>
                <p className={textMutedClass}>Enter the OTP sent to {email} and your new password</p>
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
                  <Form.Label className="fw-medium">OTP Code</Form.Label>
                  <InputGroup>
                    <InputGroup.Text className={inputClass}>
                      <FiKey />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                      placeholder="Enter 6-digit OTP code"
                      className={`${inputClass} border-start-0`}
                      style={{ borderRadius: "0 8px 8px 0" }}
                    />
                  </InputGroup>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-medium">New Password</Form.Label>
                  <InputGroup>
                    <InputGroup.Text className={inputClass}>
                      <FiLock />
                    </InputGroup.Text>
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Enter new password"
                      className={`${inputClass} border-start-0 border-end-0`}
                      style={{ borderRadius: "0" }}
                    />
                    <InputGroup.Text 
                      className={`${inputClass} cursor-pointer`}
                      onClick={togglePasswordVisibility}
                      style={{ borderRadius: "0 8px 8px 0", cursor: "pointer" }}
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </InputGroup.Text>
                  </InputGroup>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-medium">Confirm Password</Form.Label>
                  <InputGroup>
                    <InputGroup.Text className={inputClass}>
                      <FiRepeat />
                    </InputGroup.Text>
                    <Form.Control
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="Confirm your password"
                      className={`${inputClass} border-start-0 border-end-0`}
                      style={{ borderRadius: "0" }}
                    />
                    <InputGroup.Text 
                      className={`${inputClass} cursor-pointer`}
                      onClick={toggleConfirmPasswordVisibility}
                      style={{ borderRadius: "0 8px 8px 0", cursor: "pointer" }}
                    >
                      {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                    </InputGroup.Text>
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
                        Processing...
                      </>
                    ) : (
                      "Reset Password"
                    )}
                  </Button>
                  
                  <Button 
                    variant="link" 
                    className={`text-decoration-none ${darkMode ? "text-light" : "text-dark"}`}
                    onClick={() => navigate("/forgot-password")}
                  >
                    <FiArrowLeft className="me-1" /> Back to Email Confirmation
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

export default VerifyOTPPage;