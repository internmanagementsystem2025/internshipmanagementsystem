import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Form,
  Spinner,
  Alert,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import RegisterImage from "../../assets/login-3.jpg";
import Logo from "../../assets/logo.png";

const RegisterPage = ({ darkMode }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState("individual");
  const [error, setError] = useState("");
  const [districts, setDistricts] = useState([]);
  const [institutes, setInstitutes] = useState([]);
  const [registrationMessage, setRegistrationMessage] = useState("");

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    fullName: "",
    nameWithInitials: "",
    postalAddress: "",
    contactNumber: "",
    nic: "",
    district: "",
    preferredLanguage: "",
    password: "",
    instituteContactNumber: "",
    instituteContactEmail: "",
    instituteName: "",
    department: "",
    instituteType: "",
  });

  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/districts");
        setDistricts(response.data);
      } catch (error) {
        console.error("Error fetching districts:", error);
        setError("Failed to load districts");
      }
    };

    const fetchInstitutes = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/institutes"
        );
        setInstitutes(response.data.institutes || []);
      } catch (error) {
        console.error("Error fetching institutes:", error);
        setError("Failed to load institutes");
      }
    };

    fetchDistricts();
    fetchInstitutes();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setRegistrationMessage("");

    // Validate form data
    if (!formData.username || !formData.email || !formData.password) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    const formDataWithUserType = {
      ...formData,
      userType,
    };

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/register",
        formDataWithUserType,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setLoading(false);

      if (response.data.requiresVerification) {
        localStorage.setItem("registerEmail", formData.email);

        setRegistrationMessage(response.data.message);

        setTimeout(() => {
          navigate("/email-verification");
        }, 2000);
      } else {
        navigate("/login", {
          state: {
            message: "Registration successful. Please login.",
          },
        });
      }
    } catch (err) {
      setLoading(false);
      if (err.response) {
        console.error("Server Error:", err.response.data);
        setError(err.response.data.message || "Registration failed");
      } else {
        console.error("Error:", err);
        setError("Server Error. Please try again.");
      }
    }
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
                      src={RegisterImage}
                      alt="Register visual"
                      className="w-100 h-100"
                      style={{ objectFit: "cover" }}
                    />
                  </motion.div>
                </Col>

                {/* Form Column */}
                <Col lg={7} md={12}>
                  <div
                    className={`py-4 px-4 px-md-5 ${
                      darkMode ? "bg-dark" : "bg-white"
                    }`}
                  >
                    {loading ? (
                      <div
                        className="d-flex flex-column justify-content-center align-items-center"
                        style={{ minHeight: "400px" }}
                      >
                        <Spinner
                          animation="border"
                          variant={darkMode ? "light" : "primary"}
                        />
                        <p className="mt-3">Processing registration...</p>
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
                            alt="Logo"
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
                          <p>Fill the form below to create a new account.</p>
                        </motion.div>

                        {/* Alert Messages */}
                        {error && (
                          <Alert variant="danger" className="py-2 mb-3">
                            {error}
                          </Alert>
                        )}

                        {registrationMessage && (
                          <Alert variant="success" className="py-2 mb-3">
                            {registrationMessage}
                          </Alert>
                        )}

                        {userType === "institute" && (
                          <Alert
                            className={`py-2 mb-3 text-center ${
                              darkMode
                                ? "bg-dark border-warning text-warning"
                                : "bg-warning bg-opacity-10 text-dark"
                            }`}
                          >
                            <strong>Note:</strong> This form is for
                            university/institute staff only.
                          </Alert>
                        )}

                        {/* Registration Form */}
                        <motion.form
                          onSubmit={handleSubmit}
                          variants={fadeIn}
                          initial="initial"
                          animate="animate"
                          custom={2}
                        >
                          {/* User Type Selection */}
                          <Form.Group className="mb-3">
                            <Form.Label className="fw-medium mb-1">
                              Select User Type
                            </Form.Label>
                            <Form.Select
                              value={userType}
                              onChange={(e) => setUserType(e.target.value)}
                              className={`py-2 ${
                                darkMode
                                  ? "bg-dark text-white border-secondary"
                                  : ""
                              }`}
                            >
                              <option value="individual">Individual</option>
                              <option value="institute">Institute</option>
                            </Form.Select>
                          </Form.Group>

                          {/* Username and Email */}
                          <Row className="mb-2">
                            <Col md={6} className="mb-3">
                              <Form.Group>
                                <Form.Label className="fw-medium mb-1">
                                  Username
                                </Form.Label>
                                <Form.Control
                                  type="text"
                                  name="username"
                                  value={formData.username}
                                  onChange={handleChange}
                                  required
                                  placeholder="Enter username"
                                  className={`py-2 ${
                                    darkMode
                                      ? "bg-dark text-white border-secondary"
                                      : ""
                                  }`}
                                />
                              </Form.Group>
                            </Col>
                            <Col md={6} className="mb-3">
                              <Form.Group>
                                <Form.Label className="fw-medium mb-1">
                                  Email
                                </Form.Label>
                                <Form.Control
                                  type="email"
                                  name="email"
                                  value={formData.email}
                                  onChange={handleChange}
                                  required
                                  placeholder="Enter email"
                                  className={`py-2 ${
                                    darkMode
                                      ? "bg-dark text-white border-secondary"
                                      : ""
                                  }`}
                                />
                              </Form.Group>
                            </Col>
                          </Row>

                          {/* Full Name and Name with Initials */}
                          <Row className="mb-2">
                            <Col md={6} className="mb-3">
                              <Form.Group>
                                <Form.Label className="fw-medium mb-1">
                                  Full Name
                                </Form.Label>
                                <Form.Control
                                  type="text"
                                  name="fullName"
                                  value={formData.fullName}
                                  onChange={handleChange}
                                  required
                                  placeholder="Enter full name"
                                  className={`py-2 ${
                                    darkMode
                                      ? "bg-dark text-white border-secondary"
                                      : ""
                                  }`}
                                />
                              </Form.Group>
                            </Col>
                            <Col md={6} className="mb-3">
                              <Form.Group>
                                <Form.Label className="fw-medium mb-1">
                                  Name with Initials
                                </Form.Label>
                                <Form.Control
                                  type="text"
                                  name="nameWithInitials"
                                  value={formData.nameWithInitials}
                                  onChange={handleChange}
                                  required
                                  placeholder="Enter name with initials"
                                  className={`py-2 ${
                                    darkMode
                                      ? "bg-dark text-white border-secondary"
                                      : ""
                                  }`}
                                />
                              </Form.Group>
                            </Col>
                          </Row>

                          {/* Contact Number and NIC */}
                          <Row className="mb-2">
                            <Col md={6} className="mb-3">
                              <Form.Group>
                                <Form.Label className="fw-medium mb-1">
                                  Contact Number
                                </Form.Label>
                                <Form.Control
                                  type="tel"
                                  name="contactNumber"
                                  value={formData.contactNumber}
                                  onChange={handleChange}
                                  required
                                  placeholder="Enter contact number"
                                  className={`py-2 ${
                                    darkMode
                                      ? "bg-dark text-white border-secondary"
                                      : ""
                                  }`}
                                />
                              </Form.Group>
                            </Col>
                            <Col md={6} className="mb-3">
                              <Form.Group>
                                <Form.Label className="fw-medium mb-1">
                                  NIC
                                </Form.Label>
                                <Form.Control
                                  type="text"
                                  name="nic"
                                  value={formData.nic}
                                  onChange={handleChange}
                                  required
                                  placeholder="Enter NIC number"
                                  className={`py-2 ${
                                    darkMode
                                      ? "bg-dark text-white border-secondary"
                                      : ""
                                  }`}
                                />
                              </Form.Group>
                            </Col>
                          </Row>

                          {/* Individual-specific fields */}
                          {userType === "individual" && (
                            <>
                              <Row className="mb-2">
                                <Col md={6} className="mb-3">
                                  <Form.Group>
                                    <Form.Label className="fw-medium mb-1">
                                      Postal Address
                                    </Form.Label>
                                    <Form.Control
                                      type="text"
                                      name="postalAddress"
                                      value={formData.postalAddress}
                                      onChange={handleChange}
                                      required
                                      placeholder="Enter postal address"
                                      className={`py-2 ${
                                        darkMode
                                          ? "bg-dark text-white border-secondary"
                                          : ""
                                      }`}
                                    />
                                  </Form.Group>
                                </Col>
                                <Col md={6} className="mb-3">
                                  <Form.Group>
                                    <Form.Label className="fw-medium mb-1">
                                      Preferred Language
                                    </Form.Label>
                                    <Form.Select
                                      name="preferredLanguage"
                                      value={formData.preferredLanguage}
                                      onChange={handleChange}
                                      required
                                      className={`py-2 ${
                                        darkMode
                                          ? "bg-dark text-white border-secondary"
                                          : ""
                                      }`}
                                    >
                                      <option value="">Select Language</option>
                                      <option value="English">English</option>
                                      <option value="Sinhala">Sinhala</option>
                                      <option value="Tamil">Tamil</option>
                                    </Form.Select>
                                  </Form.Group>
                                </Col>
                              </Row>

                              <Form.Group className="mb-3">
                                <Form.Label className="fw-medium mb-1">
                                  District
                                </Form.Label>
                                <Form.Select
                                  name="district"
                                  value={formData.district}
                                  onChange={handleChange}
                                  required
                                  className={`py-2 ${
                                    darkMode
                                      ? "bg-dark text-white border-secondary"
                                      : ""
                                  }`}
                                >
                                  <option value="">Select District</option>
                                  {districts.map((district, index) => (
                                    <option
                                      key={district.id || index}
                                      value={district.id}
                                    >
                                      {district.district_name}
                                    </option>
                                  ))}
                                </Form.Select>
                              </Form.Group>
                            </>
                          )}

                          {/* Institute-specific fields */}
                          {userType === "institute" && (
                            <>
                              <Row className="mb-2">
                                <Col md={6} className="mb-3">
                                  <Form.Group>
                                    <Form.Label className="fw-medium mb-1">
                                      Institute Contact Number
                                    </Form.Label>
                                    <Form.Control
                                      type="tel"
                                      name="instituteContactNumber"
                                      value={formData.instituteContactNumber}
                                      onChange={handleChange}
                                      required
                                      placeholder="Enter institute contact number"
                                      className={`py-2 ${
                                        darkMode
                                          ? "bg-dark text-white border-secondary"
                                          : ""
                                      }`}
                                    />
                                  </Form.Group>
                                </Col>
                                <Col md={6} className="mb-3">
                                  <Form.Group>
                                    <Form.Label className="fw-medium mb-1">
                                      Institute Contact Email
                                    </Form.Label>
                                    <Form.Control
                                      type="email"
                                      name="instituteContactEmail"
                                      value={formData.instituteContactEmail}
                                      onChange={handleChange}
                                      required
                                      placeholder="Enter institute email"
                                      className={`py-2 ${
                                        darkMode
                                          ? "bg-dark text-white border-secondary"
                                          : ""
                                      }`}
                                    />
                                  </Form.Group>
                                </Col>
                              </Row>

                              <Row className="mb-2">
                                <Col md={6} className="mb-3">
                                  <Form.Group>
                                    <Form.Label className="fw-medium mb-1">
                                      Department / Faculty
                                    </Form.Label>
                                    <Form.Control
                                      type="text"
                                      name="department"
                                      value={formData.department}
                                      onChange={handleChange}
                                      required
                                      placeholder="Enter department or faculty"
                                      className={`py-2 ${
                                        darkMode
                                          ? "bg-dark text-white border-secondary"
                                          : ""
                                      }`}
                                    />
                                  </Form.Group>
                                </Col>
                                <Col md={6} className="mb-3">
                                  <Form.Group>
                                    <Form.Label className="fw-medium mb-1">
                                      Institute Type
                                    </Form.Label>
                                    <Form.Select
                                      name="instituteType"
                                      value={formData.instituteType}
                                      onChange={handleChange}
                                      required
                                      className={`py-2 ${
                                        darkMode
                                          ? "bg-dark text-white border-secondary"
                                          : ""
                                      }`}
                                    >
                                      <option value="">
                                        Select Institute Type
                                      </option>
                                      <option value="Government University">
                                        Government University
                                      </option>
                                      <option value="Private University">
                                        Private University
                                      </option>
                                    </Form.Select>
                                  </Form.Group>
                                </Col>
                              </Row>

                              <Form.Group className="mb-3">
                                <Form.Label className="fw-medium mb-1">
                                  Institute
                                </Form.Label>
                                <Form.Select
                                  name="instituteName"
                                  value={formData.instituteName}
                                  onChange={handleChange}
                                  required
                                  className={`py-2 ${
                                    darkMode
                                      ? "bg-dark text-white border-secondary"
                                      : ""
                                  }`}
                                >
                                  <option value="">Select Institute</option>
                                  {institutes.map((institute, index) => (
                                    <option
                                      key={institute.id || index}
                                      value={institute.name}
                                    >
                                      {institute.name}
                                    </option>
                                  ))}
                                </Form.Select>
                              </Form.Group>
                            </>
                          )}

                          {/* Password */}
                          <Form.Group className="mb-4">
                            <Form.Label className="fw-medium mb-1">
                              Password
                            </Form.Label>
                            <Form.Control
                              type="password"
                              name="password"
                              value={formData.password}
                              onChange={handleChange}
                              required
                              placeholder="Enter a strong password"
                              className={`py-2 ${
                                darkMode
                                  ? "bg-dark text-white border-secondary"
                                  : ""
                              }`}
                            />
                          </Form.Group>

                          {/* Submit Button */}
                          <Button
                            variant={darkMode ? "light" : "primary"}
                            type="submit"
                            className="w-100 py-2 mb-3"
                            style={{ fontWeight: "600" }}
                          >
                            Register
                          </Button>

                          {/* Login Link */}
                          <div className="text-center mt-3">
                            <p className="mb-3">
                              Already have an account?{" "}
                              <a
                                href="/login"
                                className={`text-${
                                  darkMode ? "light" : "primary"
                                } text-decoration-none fw-medium`}
                              >
                                Login
                              </a>
                            </p>
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
    </section>
  );
};

export default RegisterPage;
