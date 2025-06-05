import React, { useState } from "react";
import { Container, Card, Button, Form, Alert, Spinner, InputGroup } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../../assets/logo.png";
import Notification from "../notifications/Notification";
import { Eye, EyeSlash } from "react-bootstrap-icons";

const UserProfile = ({ darkMode }) => {
  const navigate = useNavigate();
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [notification, setNotification] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [notificationVariant, setNotificationVariant] = useState("success");
  
  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const backendUrl = "http://localhost:5000";

  // Function to trigger notifications
  const triggerNotification = (message, variant = "success") => {
    setNotification(message);
    setNotificationVariant(variant);
    setShowNotification(true);
  };

  // Handle password form changes
  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    // Clear error when user starts typing again
    if (passwordError) setPasswordError("");
  };

  // Handle password change submission
  const handleSubmitPasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError("");

    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }

    // Don't allow the same password
    if (passwordData.currentPassword === passwordData.newPassword) {
      setPasswordError("New password must be different from current password");
      return;
    }

    setChangingPassword(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setPasswordError("Unauthorized: Please log in again.");
        setChangingPassword(false);
        return;
      }

      await axios.put(
        `${backendUrl}/api/auth/change-password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Reset form
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });

      // Reset password visibility states
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);

      triggerNotification("Password changed successfully!", "success");
      
      // Navigate back to previous page after successful password change
      setTimeout(() => {
        navigate(-1); // Goes back to previous page
      }, 2000);

    } catch (error) {
      console.error("Password change error:", error);
      const errorMessage = error.response?.data?.message || "Error changing password";
      setPasswordError(errorMessage);
      triggerNotification(errorMessage, "danger");
    } finally {
      setChangingPassword(false);
    }
  };

  // Handle cancel/back button
  const handleCancel = () => {
    navigate(-1); // Goes back to previous page
  };

  // Toggle button styles for eye icon
  const eyeIconStyle = {
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 12px",
  };

  return (
    <div className={`d-flex flex-column min-vh-100 ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
      <Notification 
        show={showNotification} 
        onClose={() => setShowNotification(false)} 
        message={notification} 
        variant={notificationVariant} 
      />
      
      {/* Header */}
      <Container className="text-center mt-4 mb-4">
        <img src={logo} alt="SLT Mobitel Logo" className="mx-auto d-block" style={{ height: "50px" }} />
        <h3 className="mt-3">CHANGE PASSWORD</h3>
      </Container>

      {/* Password Change Form */}
      <Container className="d-flex justify-content-center">
        <div style={{ maxWidth: "500px", width: "100%" }}>
          <Card className={`shadow ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}>
            <Card.Header className="text-center">
              <h5 className="mb-0">Update Your Password</h5>
            </Card.Header>
            <Card.Body className="p-4">
              <Form onSubmit={handleSubmitPasswordChange}>
                {passwordError && <Alert variant="danger">{passwordError}</Alert>}

                <Form.Group className="mb-3">
                  <Form.Label>Current Password</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type={showCurrentPassword ? "text" : "password"}
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      required
                      placeholder="Enter your current password"
                      className={darkMode ? "bg-dark text-white" : ""}
                    />
                    <InputGroup.Text 
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      style={eyeIconStyle}
                      className={darkMode ? "bg-dark text-white border-secondary" : ""}
                    >
                      {showCurrentPassword ? <EyeSlash /> : <Eye />}
                    </InputGroup.Text>
                  </InputGroup>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>New Password</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type={showNewPassword ? "text" : "password"}
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      required
                      placeholder="Enter your new password"
                      className={darkMode ? "bg-dark text-white" : ""}
                    />
                    <InputGroup.Text 
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      style={eyeIconStyle}
                      className={darkMode ? "bg-dark text-white border-secondary" : ""}
                    >
                      {showNewPassword ? <EyeSlash /> : <Eye />}
                    </InputGroup.Text>
                  </InputGroup>
                  <Form.Text className={darkMode ? "text-light" : "text-muted"}>
                    Password must be at least 6 characters long and different from your current password.
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Confirm New Password</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmNewPassword"
                      value={passwordData.confirmNewPassword}
                      onChange={handlePasswordChange}
                      required
                      placeholder="Confirm your new password"
                      className={darkMode ? "bg-dark text-white" : ""}
                    />
                    <InputGroup.Text 
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={eyeIconStyle}
                      className={darkMode ? "bg-dark text-white border-secondary" : ""}
                    >
                      {showConfirmPassword ? <EyeSlash /> : <Eye />}
                    </InputGroup.Text>
                  </InputGroup>
                </Form.Group>

                <div className="d-grid gap-2">
                  <Button 
                    type="submit" 
                    variant="primary" 
                    size="lg"
                    disabled={changingPassword}
                  >
                    {changingPassword ? (
                      <>
                        <Spinner size="sm" animation="border" className="me-2" />
                        Changing Password...
                      </>
                    ) : (
                      "Change Password"
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline-secondary" 
                    onClick={handleCancel}
                    disabled={changingPassword}
                  >
                    Cancel
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>

          {/* Additional Security Note */}
          <Card className={`mt-3 ${darkMode ? "bg-secondary text-white" : "bg-light text-dark"}`}>
            <Card.Body className="text-center">
              <small className={darkMode ? "text-light" : "text-muted"}>
                <strong>Security Note:</strong> After changing your password, you may need to log in again on other devices.
              </small>
            </Card.Body>
          </Card>
        </div>
      </Container>
    </div>
  );
};

export default UserProfile;