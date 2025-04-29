import React, { useState } from "react";
import { Container, Form, Button, Alert, Spinner } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const ForgotPasswordPage = ({ darkMode }) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const backendUrl = "http://localhost:5000";

  // Extract token from URL
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("token");

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
      await axios.post(`${backendUrl}/api/auth/reset-password`, {
        token,
        newPassword: password,
      });

      setMessage("Password successfully reset! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      setError("Error resetting password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className={`d-flex flex-column align-items-center justify-content-center vh-100 ${darkMode ? "bg-dark text-white" : ""}`}>
      <h3>Reset Your Password</h3>
      <Form onSubmit={handleSubmit} className="w-50">
        {error && <Alert variant="danger">{error}</Alert>}
        {message && <Alert variant="success">{message}</Alert>}
        
        <Form.Group className="mb-3">
          <Form.Label>New Password</Form.Label>
          <Form.Control
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={darkMode ? "bg-dark text-white" : ""}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Confirm Password</Form.Label>
          <Form.Control
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className={darkMode ? "bg-dark text-white" : ""}
          />
        </Form.Group>

        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? <Spinner size="sm" animation="border" /> : "Reset Password"}
        </Button>
      </Form>
    </Container>
  );
};

export default ForgotPasswordPage;
