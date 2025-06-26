import React, { useState, useEffect } from "react";
import axios from "axios";
import logo from "../../../assets/logo.png";
import { Spinner, Alert, Button, Form, InputGroup } from "react-bootstrap";
import { FaUniversity, FaEye, FaEyeSlash } from "react-icons/fa";

const AddNewInstitute = ({ darkMode }) => {
  const [instituteData, setInstituteData] = useState({
    instituteName: "",
    instituteContactEmail: "",
    instituteContactNumber: "",
    department: "",
    instituteType: "",
    fullName: "",
    email: "",
    contactNumber: "",
    username: "",
    nameWithInitials: "",
    password: "",
    confirmPassword: "",
    nic: "",
    userType: "institute",
  });

  const [institutes, setInstitutes] = useState([]);
  const [existingEmails, setExistingEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({
    contactNumber: "",
    instituteContactNumber: "",
    nic: "",
    email: "",
    instituteContactEmail: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [institutesRes, usersRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BASE_URL}/api/institutes`),
          axios.get(`${import.meta.env.VITE_BASE_URL}/api/users/emails`)
        ]);
        
        setInstitutes(institutesRes.data.institutes || []);
        setExistingEmails(usersRes.data.emails || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const validatePhoneNumber = (phoneNumber) => {
    const regex = /^(?:\+94|0)(?:7[0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9]|6[0-9]|7[0-9]|8[0-9]|9[0-9])\d{7}$/;
    return regex.test(phoneNumber);
  };

  const validateNIC = (nic) => {
    const regex = /^([0-9]{9}[vVxX]|[0-9]{12})$/;
    return regex.test(nic);
  };

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validatePassword = (password) => {
    // At least 8 characters, one uppercase, one lowercase, one number and one special character
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };

  const checkEmailExists = (email) => {
    return existingEmails.includes(email);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Prevent entering more than allowed characters for phone numbers
    if (name === "contactNumber" || name === "instituteContactNumber") {
      if (value.startsWith("+94")) {
        if (value.length > 12) return;
      } else if (value.startsWith("0")) {
        if (value.length > 10) return;
      }
    }
    
    setInstituteData(prev => ({ ...prev, [name]: value }));

    // Validate fields in real-time
    const errors = { ...validationErrors };

    if (name === "contactNumber" || name === "instituteContactNumber") {
      errors[name] = value && !validatePhoneNumber(value) 
        ? "Please enter a valid 10-digit number (0712345678) or international format (+94712345678)" 
        : "";
    }

    if (name === "nic") {
      errors.nic = value && !validateNIC(value)
        ? "Please enter a valid NIC (123456789V or 123456789012)"
        : "";
    }

    if (name === "email" || name === "instituteContactEmail") {
      if (value && !validateEmail(value)) {
        errors[name] = "Please enter a valid email address";
      } else if (value && checkEmailExists(value)) {
        errors[name] = "This email is already registered";
      } else {
        errors[name] = "";
      }
    }

    if (name === "password") {
      errors.password = value && !validatePassword(value)
        ? "Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character"
        : "";
      
      if (instituteData.confirmPassword) {
        errors.confirmPassword = value !== instituteData.confirmPassword
          ? "Passwords do not match"
          : "";
      }
    }

    if (name === "confirmPassword") {
      errors.confirmPassword = value !== instituteData.password
        ? "Passwords do not match"
        : "";
    }

    setValidationErrors(errors);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Final validation before submission
    const errors = {
      contactNumber: !validatePhoneNumber(instituteData.contactNumber)
        ? "Please enter a valid contact number"
        : "",
      instituteContactNumber: !validatePhoneNumber(instituteData.instituteContactNumber)
        ? "Please enter a valid institute contact number"
        : "",
      nic: !validateNIC(instituteData.nic)
        ? "Please enter a valid NIC"
        : "",
      email: !validateEmail(instituteData.email)
        ? "Please enter a valid email"
        : checkEmailExists(instituteData.email)
        ? "This email is already registered"
        : "",
      instituteContactEmail: !validateEmail(instituteData.instituteContactEmail)
        ? "Please enter a valid institute email"
        : checkEmailExists(instituteData.instituteContactEmail)
        ? "This email is already registered"
        : "",
      password: !validatePassword(instituteData.password)
        ? "Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character"
        : "",
      confirmPassword: instituteData.password !== instituteData.confirmPassword
        ? "Passwords do not match"
        : "",
    };

    setValidationErrors(errors);

    if (Object.values(errors).some(error => error !== "")) {
      setLoading(false);
      return;
    }

    try {
      // Remove confirmPassword from the data being sent
      const { confirmPassword, ...dataToSend } = instituteData;
      
      await axios.post(`${import.meta.env.VITE_BASE_URL}/api/auth/register`, dataToSend, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      
      setSuccess("Institute added successfully!");
      setInstituteData({
        instituteName: "",
        instituteContactEmail: "",
        instituteContactNumber: "",
        department: "",
        instituteType: "",
        fullName: "",
        email: "",
        contactNumber: "",
        username: "",
        nameWithInitials: "",
        password: "",
        confirmPassword: "",
        nic: "",
        userType: "institute",
      });
      
      // Refresh existing emails list after successful registration
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/users/emails`);
      setExistingEmails(response.data.emails || []);
    } catch (err) {
      setError(err.response?.data?.message || "Error adding institute. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    window.history.back();
  };

  return (
    <div className={`d-flex flex-column min-vh-100 ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
      <div className="text-center mt-4 mb-3">
        <img src={logo} alt="Company Logo" className="mx-auto d-block" style={{ height: "50px" }} />
        <h3 className="mt-3">ADD INSTITUTE</h3>
      </div>

      <main className={`container p-4 rounded shadow ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"} mb-5`}>
        <div className={`p-4 rounded ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
          <div className="d-flex align-items-center gap-2 mb-3">
            <FaUniversity className={`fs-3 ${darkMode ? "text-white" : "text-dark"}`} />
            <h5 className="mb-0">Institute Information</h5>
          </div>

          <p>Fill in the details to add a new institute:</p>
          <hr className={darkMode ? "border-light" : "border-dark"} />

          {loading && <Spinner animation="border" variant={darkMode ? "light" : "dark"} />}
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="username" className="mb-3">
              <Form.Label><strong>Username:</strong></Form.Label>
              <Form.Control
                type="text"
                name="username"
                value={instituteData.username}
                onChange={handleChange}
                required
                className={darkMode ? "bg-secondary text-white" : ""}
              />
            </Form.Group>

            <Form.Group controlId="fullName" className="mb-3">
              <Form.Label><strong>Contact Person Full Name:</strong></Form.Label>
              <Form.Control
                type="text"
                name="fullName"
                value={instituteData.fullName}
                onChange={handleChange}
                required
                className={darkMode ? "bg-secondary text-white" : ""}
              />
            </Form.Group>

            <Form.Group controlId="nameWithInitials" className="mb-3">
              <Form.Label><strong>Contact Person Name with Initials:</strong></Form.Label>
              <Form.Control
                type="text"
                name="nameWithInitials"
                value={instituteData.nameWithInitials}
                onChange={handleChange}
                required
                className={darkMode ? "bg-secondary text-white" : ""}
              />
            </Form.Group>

            <Form.Group controlId="email" className="mb-3">
              <Form.Label><strong>Contact Person Email:</strong></Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={instituteData.email}
                onChange={handleChange}
                required
                className={darkMode ? "bg-secondary text-white" : ""}
              />
              {validationErrors.email && (
                <Form.Text className="text-danger">{validationErrors.email}</Form.Text>
              )}
            </Form.Group>

            <Form.Group controlId="contactNumber" className="mb-3">
              <Form.Label><strong>Contact Person Number:</strong></Form.Label>
              <Form.Control
                type="tel"
                name="contactNumber"
                value={instituteData.contactNumber}
                onChange={handleChange}
                required
                className={darkMode ? "bg-secondary text-white" : ""}
                placeholder="0712345678 or +94712345678"
                maxLength={12}
              />
              {validationErrors.contactNumber && (
                <Form.Text className="text-danger">{validationErrors.contactNumber}</Form.Text>
              )}
            </Form.Group>

            <Form.Group controlId="nic" className="mb-3">
              <Form.Label><strong>Contact Person NIC:</strong></Form.Label>
              <Form.Control
                type="text"
                name="nic"
                value={instituteData.nic}
                onChange={handleChange}
                required
                className={darkMode ? "bg-secondary text-white" : ""}
                placeholder="123456789V or 123456789012"
              />
              {validationErrors.nic && (
                <Form.Text className="text-danger">{validationErrors.nic}</Form.Text>
              )}
            </Form.Group>

            <Form.Group controlId="instituteName" className="mb-3">
              <Form.Label><strong>Institute:</strong></Form.Label>
              <Form.Control
                as="select"
                name="instituteName"
                value={instituteData.instituteName}
                onChange={handleChange}
                required
                className={darkMode ? "bg-secondary text-white" : ""}
              >
                <option value="">Select Institute</option>
                {institutes.map((institute, index) => (
                  <option key={institute.id || index} value={institute.name}>
                    {institute.name}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            <Form.Group controlId="instituteContactEmail" className="mb-3">
              <Form.Label><strong>Institute Contact Email:</strong></Form.Label>
              <Form.Control
                type="email"
                name="instituteContactEmail"
                value={instituteData.instituteContactEmail}
                onChange={handleChange}
                required
                className={darkMode ? "bg-secondary text-white" : ""}
              />
              {validationErrors.instituteContactEmail && (
                <Form.Text className="text-danger">{validationErrors.instituteContactEmail}</Form.Text>
              )}
            </Form.Group>

            <Form.Group controlId="instituteContactNumber" className="mb-3">
              <Form.Label><strong>Institute Contact Number:</strong></Form.Label>
              <Form.Control
                type="tel"
                name="instituteContactNumber"
                value={instituteData.instituteContactNumber}
                onChange={handleChange}
                required
                className={darkMode ? "bg-secondary text-white" : ""}
                placeholder="0712345678 or +94712345678"
                maxLength={12}
              />
              {validationErrors.instituteContactNumber && (
                <Form.Text className="text-danger">{validationErrors.instituteContactNumber}</Form.Text>
              )}
            </Form.Group>

            <Form.Group controlId="department" className="mb-3">
              <Form.Label><strong>Department:</strong></Form.Label>
              <Form.Control
                type="text"
                name="department"
                value={instituteData.department}
                onChange={handleChange}
                required
                className={darkMode ? "bg-secondary text-white" : ""}
              />
            </Form.Group>

            <Form.Group controlId="instituteType" className="mb-3">
              <Form.Label><strong>Institute Type:</strong></Form.Label>
              <Form.Control
                as="select"
                name="instituteType"
                value={instituteData.instituteType}
                onChange={handleChange}
                required
                className={darkMode ? "bg-secondary text-white" : ""}
              >
                <option value="">Select Institute Type</option>
                <option value="Government University">Government University</option>
                <option value="Private University">Private University</option>
              </Form.Control>
            </Form.Group>

            <Form.Group controlId="password" className="mb-3">
              <Form.Label><strong>Password:</strong></Form.Label>
              <InputGroup>
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={instituteData.password}
                  onChange={handleChange}
                  required
                  className={darkMode ? "bg-secondary text-white" : ""}
                />
                <InputGroup.Text 
                  className={`cursor-pointer ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </InputGroup.Text>
              </InputGroup>
              {validationErrors.password && (
                <Form.Text className="text-danger">{validationErrors.password}</Form.Text>
              )}
              <Form.Text className={darkMode ? "text-light" : "text-muted"}>
                Password must contain at least:
                <ul>
                  <li>8 characters</li>
                  <li>1 uppercase letter</li>
                  <li>1 lowercase letter</li>
                  <li>1 number</li>
                  <li>1 special character (@$!%*?&)</li>
                </ul>
              </Form.Text>
            </Form.Group>

            <Form.Group controlId="confirmPassword" className="mb-4">
              <Form.Label><strong>Confirm Password:</strong></Form.Label>
              <InputGroup>
                <Form.Control
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={instituteData.confirmPassword}
                  onChange={handleChange}
                  required
                  className={darkMode ? "bg-secondary text-white" : ""}
                />
                <InputGroup.Text 
                  className={`cursor-pointer ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}
                  onClick={toggleConfirmPasswordVisibility}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </InputGroup.Text>
              </InputGroup>
              {validationErrors.confirmPassword && (
                <Form.Text className="text-danger">{validationErrors.confirmPassword}</Form.Text>
              )}
            </Form.Group>

            <div className="d-flex justify-content-between mt-4">
              <Button variant="danger" onClick={handleBack}>
                Go Back
              </Button>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? "Adding..." : "Add Institute"}
              </Button>
            </div>
          </Form>
        </div>
      </main>
    </div>
  );
};

export default AddNewInstitute;