import {  Container,  Row,  Col,  Button,  Form,  Spinner,  InputGroup,  Alert, Modal
} from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { FaEye, FaEyeSlash, FaGoogle } from "react-icons/fa";
import LoginImage from "../../assets/login-3.jpg";
import Logo from "../../assets/logo.png";

const LoginPage = ({ darkMode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("individual");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);
  const [showStaffNotification, setShowStaffNotification] = useState(false);
  const [registrationMessage, setRegistrationMessage] = useState("");
  const [showOAuthOptions, setShowOAuthOptions] = useState(true);

  // Check for messages from other pages (like successful registration)
  useEffect(() => {
    if (location.state?.message) {
      setRegistrationMessage(location.state.message);
    }
  }, [location]);

  // Check for token in URL from direct redirect (e.g., OAuth callback)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const redirectUserType = params.get('userType');
    const errorParam = params.get('error');
    
    if (errorParam) {
      const errorMessages = {
        'google_auth_failed': 'Google authentication failed.',
        'oauth_individual_only': 'OAuth login is only available for individual users.',
        'authentication_failed': 'Authentication failed.',
        'token_generation_failed': 'Failed to generate authentication token.',
      };
      setError(errorMessages[errorParam] || 'Authentication error occurred.');
      setIsOAuthLoading(false);
      return;
    }
    
    if (token) {
      console.log('Token detected in URL, storing and redirecting to appropriate home page');
      localStorage.setItem("token", token);
      
      if (redirectUserType) {
        redirectUser(redirectUserType);
      } else {
        // Default to individual for OAuth users
        redirectUser('individual');
      }
    }
  }, []);

  // Toggle OAuth options based on selected user type
  useEffect(() => {
    setShowOAuthOptions(userType === "individual");
  }, [userType]);

  const redirectUser = (userType) => {
    switch (userType) {
      case "individual":
        navigate("/individual-home", { replace: true });
        break;
      case "institute":
        navigate("/institute-home", { replace: true });
        break;
      case "admin":
        navigate("/admin-home", { replace: true });
        break;
      case "staff":
        navigate("/staff-home", { replace: true });
        break;
      case "senior_staff":
        navigate("/senior-staff-home", { replace: true });
        break;
      default:
        setError("Unknown user type.");
        setLoading(false);
        break;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password, userType }),
      });

      if (response.ok) {
        const data = await response.json();
        const { token, userType: responseUserType } = data;

        localStorage.setItem("token", token);
        redirectUser(responseUserType);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Invalid credentials or user type.");
      }
    } catch (err) {
      console.error("Error during login:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setIsOAuthLoading(true);
    console.log('Redirecting to Google auth');
    // Redirect to Google OAuth route
    window.location.href = `http://localhost:5000/api/auth/google`;
  };

  const toggleStaffNotification = () => {
    setShowStaffNotification(!showStaffNotification);
  };

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: (custom) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, delay: custom * 0.1 },
    }),
  };

  return (
    <section 
      className={darkMode ? "bg-dark text-white" : "bg-light text-dark"} 
      style={{ minHeight: "100vh", paddingTop: "2rem", paddingBottom: "2rem" }}
    >
      <Container fluid>
        <Row className="justify-content-center">
          <Col lg={10} className="p-0">
            <div className="shadow-lg rounded-4 overflow-hidden">
              <Row className="g-0">
                {/* Image Column */}
                <Col lg={5} className="d-none d-lg-block">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    style={{ height: "100%", minHeight: "100%" }}
                  >
                    <img
                      src={LoginImage}
                      alt="Login visual"
                      className="w-100 h-100"
                      style={{ objectFit: "cover" }}
                    />
                  </motion.div>
                </Col>

                {/* Form Column */}
                <Col lg={7} md={12}>
                  <div className={`py-4 px-4 px-md-5 ${darkMode ? "bg-dark" : "bg-white"}`}>
                    {loading || isOAuthLoading ? (
                      <div
                        className="d-flex flex-column justify-content-center align-items-center"
                        style={{ minHeight: "400px" }}
                      >
                        <Spinner
                          animation="border"
                          variant={darkMode ? "light" : "primary"}
                          style={{ width: "3rem", height: "3rem" }}
                        />
                        <p className="mt-3 fs-5">
                          {isOAuthLoading ? "Redirecting to Google authentication..." : "Logging in..."}
                        </p>
                      </div>
                    ) : (
                      <>
                        {/* Logo */}
                        <motion.div
                          className="text-center mb-3"
                          variants={fadeIn}
                          initial="initial"
                          animate="animate"
                          custom={0}
                        >
                          <img
                            src={Logo}
                            alt="SLTMOBITEL"
                            style={{ maxWidth: "130px" }}
                          />
                        </motion.div>

                        {/* Headings */}
                        <motion.div
                          variants={fadeIn}
                          initial="initial"
                          animate="animate"
                          custom={1}
                          className="mb-4 text-center"
                        >
                          <h1 className="fw-bold fs-3 mb-2">
                            INTERNSHIP MANAGEMENT SYSTEM
                          </h1>
                          <p>Login to your account to access the system.</p>
                        </motion.div>

                        {/* Registration success message */}
                        {registrationMessage && (
                          <Alert variant="success" className="py-2 mb-3">
                            {registrationMessage}
                          </Alert>
                        )}

                        {/* Error message */}
                        {error && (
                          <Alert variant="danger" className="py-2 mb-3">
                            {error}
                          </Alert>
                        )}

                        {/* Login Form */}
                        <motion.form
                          onSubmit={handleSubmit}
                          variants={fadeIn}
                          initial="initial"
                          animate="animate"
                          custom={2}
                        >
                          {/* User Type Selection */}
                          <Form.Group className="mb-3" controlId="formUserType">
                            <Form.Label className="fw-medium mb-1">
                              Select Role
                            </Form.Label>
                            <Form.Select
                              value={userType}
                              onChange={(e) => setUserType(e.target.value)}
                              className={`py-2 ${darkMode ? "bg-dark text-white border-secondary" : ""}`}
                            >
                              <option value="individual">Individual</option>
                              <option value="institute">Institute</option>
                              <option value="admin">Admin</option>
                              <option value="staff">Staff</option>
                              <option value="senior_staff">Senior Staff</option>
                            </Form.Select>
                          </Form.Group>

                          {/* Username Field */}
                          <Form.Group className="mb-3" controlId="formUsername">
                            <Form.Label className="fw-medium mb-1">
                              Username
                            </Form.Label>
                            <Form.Control
                              type="text"
                              value={username}
                              onChange={(e) => setUsername(e.target.value)}
                              className={`py-2 ${darkMode ? "bg-dark text-white border-secondary" : ""}`}
                              required
                              placeholder="Enter your username"
                            />
                          </Form.Group>

                          {/* Password Field */}
                          <Form.Group className="mb-4" controlId="formPassword">
                            <Form.Label className="fw-medium mb-1">
                              Password
                            </Form.Label>
                            <InputGroup>
                              <Form.Control
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={`py-2 ${darkMode ? "bg-dark text-white border-secondary" : ""}`}
                                required
                                placeholder="Enter your password"
                              />
                              <Button
                                variant={darkMode ? "outline-secondary" : "outline-secondary"}
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                              </Button>
                            </InputGroup>
                          </Form.Group>

                          {/* Forgot Password Link */}
                          <div className="d-flex justify-content-end mb-3">
                            <a
                              href="/forgot-password/email-confirm"
                              className={`text-${darkMode ? "light" : "primary"} text-decoration-none`}
                            >
                              Forgot your password?
                            </a>
                          </div>

                          {/* Submit Button */}
                          <Button
                            variant={darkMode ? "light" : "primary"}
                            type="submit"
                            className="w-100 py-2 mb-3"
                            style={{ fontWeight: "600" }}
                          >
                            Login
                          </Button>

                          {/* Registration Link */}
                          <div className="text-center my-3">
                            <p className="mb-3">
                              Don't have an account?{" "}
                              <a
                                href="/register"
                                className={`text-${darkMode ? "light" : "primary"} text-decoration-none fw-medium`}
                              >
                                Create one
                              </a>
                            </p>
                          </div>
                          
                          {/* Google OAuth section - only shown for individual users */}
                          {showOAuthOptions && (
                            <>
                              {/* Divider */}
                              <div className="d-flex align-items-center my-4">
                                <div className="flex-grow-1 border-top border-secondary"></div>
                                <div className="mx-3">OR</div>
                                <div className="flex-grow-1 border-top border-secondary"></div>
                              </div>

                              {/* Google OAuth Button */}
                              <Button
                                variant={darkMode ? "outline-light" : "outline-primary"}
                                className="w-100 d-flex align-items-center justify-content-center py-2"
                                onClick={handleGoogleLogin}
                                disabled={isOAuthLoading}
                              >
                                <FaGoogle className="me-2" /> Login with Google
                              </Button>
                            </>
                          )}
                          
                          {/* Staff Login Info Button */}
                          <div className="text-center mt-4">
                            <Button
                              variant={darkMode ? "link" : "link"}
                              className="text-decoration-none p-0"
                              onClick={toggleStaffNotification}
                            >
                               university/institute login information
                            </Button>
                          </div>
                        </motion.form>
                      </>
                    )}
                  </div>
                </Col>
              </Row>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Staff Notification Modal */}
      <Modal 
        show={showStaffNotification} 
        onHide={toggleStaffNotification} 
        centered
        contentClassName={darkMode ? "bg-dark text-white" : ""}
      >
        <Modal.Header closeButton className={darkMode ? "border-secondary" : ""}>
          <Modal.Title> university/institute Login Information</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          If you want to log in as a staff member of a university/institute, please click the "Create one" button to register.
        </Modal.Body>
        <Modal.Footer className={darkMode ? "border-secondary" : ""}>
          <Button variant={darkMode ? "light" : "primary"} onClick={toggleStaffNotification}>
            Got it
          </Button>
        </Modal.Footer>
      </Modal>
    </section>
  );
};

export default LoginPage;