import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Form, Alert, Spinner, Table, Tabs, Tab, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../../assets/logo.png";
import defaultProfilePic from "../../assets/user-profile.png";
import Notification from "../notifications/Notification";
import ChangePasswordModal from "./ChangePasswordModal";
import ForgotPassword from "./ForgotPassword";
import { FaDesktop, FaMobile, FaTablet, FaQuestionCircle, FaGoogle } from "react-icons/fa";

const UserProfile = ({ darkMode }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    fullName: "",
    email: "",
    contactNumber: "",
    userType: "",
    department: "",
    profileImage: "",
    googleId: null,
  });

  const [imageFile, setImageFile] = useState(null);
  const [notification, setNotification] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [notificationVariant, setNotificationVariant] = useState("success");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  // Password change state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  
  // New state for user activity history
  const [loginHistory, setLoginHistory] = useState([]);
  const [loginDevices, setLoginDevices] = useState([]);
  const [passwordHistory, setPasswordHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  const backendUrl = "http://localhost:5000"; 

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        triggerNotification("Unauthorized: Please log in.", "danger");
        setLoading(false);
        return;
      }
  
      const response = await axios.get(`${backendUrl}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      const { fullName, email, contactNumber, userType, department, profileImage, googleId } = response.data;
  
      // Set default profile image
      let displayImage = defaultProfilePic;
      
      // Handle profile image for Google users
      if (googleId) {
        try {
          // Always try to fetch the latest Google profile image
          const googleProfileResponse = await axios.get(`${backendUrl}/api/auth/google-profile`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          if (googleProfileResponse.data && googleProfileResponse.data.picture) {
            // Use the Google profile image if available
            let googleImage = googleProfileResponse.data.picture;
            
            // Fix for incomplete URLs in the frontend
            if (!googleImage.includes('=s') && !googleImage.endsWith('.jpg') && !googleImage.endsWith('.png')) {
              googleImage = `${googleImage}=s400-c`;
            }
            
            displayImage = googleImage;
          } else if (profileImage) {
            // Fall back to stored profile image
            displayImage = profileImage.startsWith('http') 
              ? profileImage 
              : `${backendUrl}${profileImage}`;
          }
        } catch (googleError) {
          console.error("Failed to fetch Google profile image:", googleError);
          // Fall back to existing profile image or default
          if (profileImage) {
            displayImage = profileImage.startsWith('http') 
              ? profileImage 
              : `${backendUrl}${profileImage}`;
          }
        }
      } else if (profileImage) {
        // For non-Google users, use their uploaded profile image
        displayImage = profileImage.startsWith('http') 
          ? profileImage 
          : `${backendUrl}${profileImage}`;
      }
  
      setUser({
        fullName,
        email,
        contactNumber: contactNumber || "",
        userType,
        department: department || "",
        profileImage: displayImage,
        googleId,
      });
    } catch (error) {
      triggerNotification("Error fetching profile.", "danger");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Fetch user activity history
  const fetchUserHistory = async () => {
    if (activeTab !== "profile" && (loginHistory.length === 0 || loginDevices.length === 0)) {
      setLoadingHistory(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        // Fetch login history
        const loginResponse = await axios.get(`${backendUrl}/api/user-activity/login-history`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLoginHistory(loginResponse.data || []);

        // Fetch login devices
        const devicesResponse = await axios.get(`${backendUrl}/api/user-activity/login-devices`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLoginDevices(devicesResponse.data || []);

        if (!user.googleId) {
          const passwordResponse = await axios.get(`${backendUrl}/api/user-activity/password-history`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setPasswordHistory(passwordResponse.data || []);
        }
      } catch (error) {
        console.error("Error fetching user history:", error);
        triggerNotification("Error fetching user activity history.", "danger");
      } finally {
        setLoadingHistory(false);
      }
    }
  };

  useEffect(() => {
    fetchUserHistory();
  }, [activeTab, loginHistory.length, loginDevices.length, user.googleId]);

  // Function to trigger notifications
  const triggerNotification = (message, variant = "success") => {
    setNotification(message);
    setNotificationVariant(variant);
    setShowNotification(true);
  };

  // Handle input changes for text fields
  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  // Handle profile image change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setUser((prevUser) => ({ ...prevUser, profileImage: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle profile update (only fullName & contactNumber)
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const token = localStorage.getItem("token");
      const updateData = {
        fullName: user.fullName,
        contactNumber: user.contactNumber,
      };

      const response = await axios.put(`${backendUrl}/api/auth/profile`, updateData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });

      setUser((prevUser) => ({
        ...prevUser,
        fullName: response.data.fullName,
        contactNumber: response.data.contactNumber || "",
      }));

      triggerNotification("Profile updated successfully!", "success");
      
      setTimeout(() => {
        fetchUserProfile();
      }, 1000);
    } catch (error) {
      triggerNotification("Error updating profile.", "danger");
    } finally {
      setUpdating(false);
    }
  };

  // Handle profile image upload separately
  const handleUpdateProfileImage = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      triggerNotification("Please select an image first.", "warning");
      return;
    }

    setUpdating(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("profileImage", imageFile);

      const response = await axios.put(`${backendUrl}/api/auth/profile`, formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });

      // Clear the file input after successful upload
      setImageFile(null);
      document.getElementById('profile-image-input').value = '';
      
      triggerNotification("Profile image updated successfully!", "success");
      
      setTimeout(() => {
        fetchUserProfile();
      }, 1000);
    } catch (error) {
      triggerNotification("Error updating profile image.", "danger");
    } finally {
      setUpdating(false);
    }
  };

  // Get device icon based on device type
  const getDeviceIcon = (deviceType) => {
    switch (deviceType.toLowerCase()) {
      case 'desktop':
        return <FaDesktop />;
      case 'mobile':
        return <FaMobile />;
      case 'tablet':
        return <FaTablet />;
      default:
        return <FaQuestionCircle />;
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  if (showForgotPassword) {
    return <ForgotPassword darkMode={darkMode} onBack={() => setShowForgotPassword(false)} />;
  }

  const renderProfileSidebar = () => (
    <Col md={4} className="text-center">
      {/* Profile Image */}
      <Card className={darkMode ? "bg-dark text-white" : "bg-light text-dark"}>
        <Card.Body>
          <img
            src={user.profileImage}
            alt="Profile"
            className="rounded-circle mb-3"
            style={{ width: "150px", height: "150px", objectFit: "cover", border: "2px solid #ccc" }}
          />
          
          {user.googleId && (
            <div className="mb-3">
              <Badge bg="primary" className="p-2">
                <FaGoogle className="me-1" /> Google Account
              </Badge>
              <div className="mt-2 small">
                Profile image synced with your Google account
              </div>
            </div>
          )}
          
          {!user.googleId && (
            <>
              <Form.Group>
                <Form.Control 
                  id="profile-image-input"
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange} 
                />
              </Form.Group>
              <Button
                className="mt-2 w-100"
                variant="primary"
                onClick={handleUpdateProfileImage}
                disabled={updating}
              >
                {updating ? <Spinner animation="border" size="sm" /> : "Update Image"}
              </Button>
            </>
          )}
        </Card.Body>
      </Card>

      {!user.googleId && (
        <Card className={`mt-3 ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
          <Card.Header>Password Management</Card.Header>
          <Card.Body>
            <Button
              className="w-100 mb-2"
              variant="outline-secondary"
              onClick={() => setShowPasswordModal(true)}
            >
              Change Password
            </Button>
            
            <Button
              className="w-100"
              variant="outline-secondary"
              onClick={() => navigate("/forgot-password/email-confirm")}
            >
              Reset Password with OTP
            </Button>
          </Card.Body>
        </Card>
      )}

      {/* Google account info box - Only for Google users */}
      {user.googleId && (
        <Card className={`mt-3 ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
          <Card.Header>Google Account</Card.Header>
          <Card.Body>
            <p className="mb-2">Your profile is linked to your Google account.</p>
            <small>
              Password management is handled through your Google account settings.
            </small>
          </Card.Body>
        </Card>
      )}

      {/* Notification Box */}
      {notification && (
        <Alert variant={darkMode ? "info" : "success"} className="mt-3">
          {notification}
        </Alert>
      )}
    </Col>
  );

  const renderLoginHistory = () => (
    <Card className={darkMode ? "bg-dark text-white" : "bg-light text-dark"}>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Login History</h5>
        {loginHistory.length > 0 && (
          <Badge bg="info">{loginHistory.length} records</Badge>
        )}
      </Card.Header>
      <Card.Body>
        {loadingHistory ? (
          <div className="text-center py-3">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : loginHistory.length > 0 ? (
          <div style={{ maxHeight: "400px", overflowY: "auto" }}>
            <Table responsive striped bordered hover variant={darkMode ? "dark" : "light"}>
              <thead style={{ position: "sticky", top: 0, background: darkMode ? "#343a40" : "white" }}>
                <tr>
                  <th>Date & Time</th>
                  <th>Device</th>
                  <th>Browser</th>
                  <th>Location</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loginHistory.map((login, idx) => (
                  <tr key={idx} className={idx < 5 ? "fw-bold" : ""}>
                    <td>{new Date(login.timestamp).toLocaleString()}</td>
                    <td>
                      {getDeviceIcon(login.deviceType)} {login.deviceName}
                    </td>
                    <td>{login.browser}</td>
                    <td>{login.location || 'Unknown'}</td>
                    <td>
                      <span className={`badge ${login.status === 'Success' ? 'bg-success' : 'bg-danger'}`}>
                        {login.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        ) : (
          <Alert variant="info">No login history available.</Alert>
        )}
      </Card.Body>
      {loginHistory.length > 5 && (
        <Card.Footer className={`${darkMode ? "text-white" : "text-muted"}`}>
          <small>The most recent 5 entries are highlighted. Scroll to see older entries.</small>
        </Card.Footer>
      )}
    </Card>
  );

  const renderLoginDevices = () => (
    <Card className={darkMode ? "bg-dark text-white" : "bg-light text-dark"}>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Active Login Devices</h5>
        {loginDevices.length > 0 && (
          <Badge bg="info">{loginDevices.length} devices</Badge>
        )}
      </Card.Header>
      <Card.Body>
        {loadingHistory ? (
          <div className="text-center py-3">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : loginDevices.length > 0 ? (
          <div style={{ maxHeight: "400px", overflowY: "auto" }}>
            <Table responsive striped bordered hover variant={darkMode ? "dark" : "light"}>
              <thead style={{ position: "sticky", top: 0, background: darkMode ? "#343a40" : "white" }}>
                <tr>
                  <th>Device</th>
                  <th>Last Active</th>
                  <th>Browser</th>
                  <th>Location</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loginDevices.map((device, idx) => (
                  <tr key={idx} className={idx < 5 || device.isCurrent ? "fw-bold" : ""}>
                    <td>
                      {getDeviceIcon(device.deviceType)} {device.deviceName}
                    </td>
                    <td>{new Date(device.lastActive).toLocaleString()}</td>
                    <td>{device.browser}</td>
                    <td>{device.location || 'Unknown'}</td>
                    <td>
                      {device.isCurrent ? (
                        <Badge bg="success">Current Device</Badge>
                      ) : (
                        <Button size="sm" variant="danger">
                          Revoke Access
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        ) : (
          <Alert variant="info">No active devices found.</Alert>
        )}
      </Card.Body>
      {loginDevices.length > 5 && (
        <Card.Footer className={`${darkMode ? "text-white" : "text-muted"}`}>
          <small>The most recent 5 devices and your current device are highlighted. Scroll to see more devices.</small>
        </Card.Footer>
      )}
    </Card>
  );

  const renderPasswordHistory = () => (
    <Card className={darkMode ? "bg-dark text-white" : "bg-light text-dark"}>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Password Change History</h5>
        {passwordHistory.length > 0 && (
          <Badge bg="info">{passwordHistory.length} records</Badge>
        )}
      </Card.Header>
      <Card.Body>
        {loadingHistory ? (
          <div className="text-center py-3">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : passwordHistory.length > 0 ? (
          <div style={{ maxHeight: "400px", overflowY: "auto" }}>
            <Table responsive striped bordered hover variant={darkMode ? "dark" : "light"}>
              <thead style={{ position: "sticky", top: 0, background: darkMode ? "#343a40" : "white" }}>
                <tr>
                  <th>Date & Time</th>
                  <th>Method</th>
                  <th>Device</th>
                  <th>Location</th>
                </tr>
              </thead>
              <tbody>
                {passwordHistory.map((event, idx) => (
                  <tr key={idx} className={idx < 5 ? "fw-bold" : ""}>
                    <td>{new Date(event.timestamp).toLocaleString()}</td>
                    <td>{event.method}</td>
                    <td>
                      {getDeviceIcon(event.deviceType)} {event.deviceName}
                    </td>
                    <td>{event.location || 'Unknown'}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        ) : (
          <Alert variant="info">No password change history available.</Alert>
        )}
      </Card.Body>
      {passwordHistory.length > 5 && (
        <Card.Footer className={`${darkMode ? "text-white" : "text-muted"}`}>
          <small>The most recent 5 password changes are highlighted. Scroll to see older entries.</small>
        </Card.Footer>
      )}
    </Card>
  );

  // Render user info component
  const renderUserInfo = () => (
    <Card className={darkMode ? "bg-dark text-white" : "bg-light text-dark"}>
      <Card.Body>
        <Form onSubmit={handleUpdateProfile}>
          <Form.Group className="mb-3">
            <Form.Label>Full Name</Form.Label>
            <Form.Control
              type="text"
              name="fullName"
              value={user.fullName}
              onChange={handleChange}
              className={darkMode ? "bg-dark text-white" : ""}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={user.email}
              disabled
              className={darkMode ? "bg-dark text-white" : ""}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Contact Number</Form.Label>
            <Form.Control
              type="text"
              name="contactNumber"
              value={user.contactNumber}
              onChange={handleChange}
              className={darkMode ? "bg-dark text-white" : ""}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>User Type</Form.Label>
            <Form.Control
              type="text"
              value={user.userType}
              disabled
              className={darkMode ? "bg-dark text-white" : ""}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Department</Form.Label>
            <Form.Control
              type="text"
              value={user.department}
              disabled
              className={darkMode ? "bg-dark text-white" : ""}
            />
          </Form.Group>

          <Button variant={darkMode ? "primary" : "success"} type="submit" disabled={updating}>
            {updating ? <Spinner animation="border" size="sm" /> : "Update Profile"}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );

  const tabStyle = {
    color: darkMode ? "white" : "inherit",
    fontWeight: "bold"
  };

  const getTabs = () => {
    const tabs = [
      <Tab 
        key="profile"
        eventKey="profile" 
        title={<span style={tabStyle}>Profile Info</span>}
      >
        {renderUserInfo()}
      </Tab>,
      <Tab 
        key="loginHistory"
        eventKey="loginHistory" 
        title={<span style={tabStyle}>Login History</span>}
      >
        {renderLoginHistory()}
      </Tab>,
      <Tab 
        key="devices"
        eventKey="devices" 
        title={<span style={tabStyle}>Login Devices</span>}
      >
        {renderLoginDevices()}
      </Tab>
    ];

    if (!user.googleId) {
      tabs.push(
        <Tab 
          key="passwordHistory"
          eventKey="passwordHistory" 
          title={<span style={tabStyle}>Password History</span>}
        >
          {renderPasswordHistory()}
        </Tab>
      );
    }

    return tabs;
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
      <Container className="text-center mt-4 mb-3">
        <img src={logo} alt="SLT Mobitel Logo" className="mx-auto d-block" style={{ height: "50px" }} />
        <h3 className="mt-3">USER PROFILE</h3>
      </Container>

      {/* Profile Section */}
      <Container className={`p-4 rounded shadow ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"} mb-5`}>
        <Row>
          {renderProfileSidebar()}

          <Col md={8}>
            <Tabs
              activeKey={activeTab}
              onSelect={(k) => setActiveTab(k)}
              className={`mb-3 ${darkMode ? "dark-mode-tabs" : ""}`}
              fill
            >
              {getTabs()}
            </Tabs>
          </Col>
        </Row>
      </Container>
      
      {!user.googleId && (
        <ChangePasswordModal 
          show={showPasswordModal}
          onHide={() => setShowPasswordModal(false)}
          darkMode={darkMode}
          triggerNotification={triggerNotification}
        />
      )}

      {/* Add custom CSS for dark mode tabs */}
      <style jsx>{`
        /* Custom CSS for dark mode tabs */
        .dark-mode-tabs .nav-link {
          color: rgba(255, 255, 255, 0.8);
        }
        
        .dark-mode-tabs .nav-link.active {
          color: white;
          font-weight: bold;
          background-color: #343a40;
          border-color: #dee2e6 #dee2e6 #343a40;
        }
        
        .dark-mode-tabs .nav-link:hover:not(.active) {
          color: white;
          border-color: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
};

export default UserProfile;