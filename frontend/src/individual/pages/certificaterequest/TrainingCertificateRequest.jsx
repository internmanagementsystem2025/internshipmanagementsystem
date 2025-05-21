import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Form, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import logo from "../../../assets/logo.png";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock } from '@fortawesome/free-solid-svg-icons';
import PropTypes from "prop-types";
import { motion } from 'framer-motion';
import Notification from "../../../components/notifications/Notification"; 

const TrainingCertificateRequest = ({ darkMode }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const navigate = useNavigate();
  const [staffList, setStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState("");

  const [certificateRequest, setCertificateRequest] = useState({
    name: "",
    internId: "",
    nic: "",
    contactNumber: "",
    sectionUnit: "",
    trainingCategory: "",
    periodFrom: "",
    periodTo: "",
    workAttended: { A: "", B: "", C: "", D: "" },
    traineeSignature: null,
    staffName: "",
    staffUserId: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  // Notification state
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationVariant, setNotificationVariant] = useState("success");

  // Section/Unit options
  const sectionUnitOptions = [
    "Digital Platform",
    "Digital Lab",
    "Network Operations",
    "Customer Support",
    "Human Resources",
    "Finance",
    "Marketing",
    "Research & Development"
  ];

  useEffect(() => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      setUnauthorized(true);
      setIsLoading(false);
      return;
    }
    
    try {
      const decoded = jwtDecode(token);
      if (!decoded.currentStatus || decoded.currentStatus === "pending") {
        setUnauthorized(true);
      } else {
        setUser(decoded);
        fetchStaffList(token);
      }
    } catch (error) {
      console.error("Invalid token:", error);
      setUnauthorized(true);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Fetch staff list from backend
  const fetchStaffList = async (token) => {
    try {
      const response = await axios.get("http://localhost:5000/api/staff", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setStaffList(response.data);
    } catch (error) {
      console.error("Error fetching staff list:", error);
    }
  };

  // Handle staff selection
  const handleStaffSelect = (e) => {
    const staffId = e.target.value;
    if (!staffId) {
      setSelectedStaff("");
      setCertificateRequest({
        ...certificateRequest,
        staffName: "",
        staffUserId: null
      });
      return;
    }

    const staff = staffList.find(staff => staff._id === staffId);
    if (staff) {
      setSelectedStaff(staffId);
      setCertificateRequest({
        ...certificateRequest,
        staffName: staff.name,
        staffUserId: staff.userId
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      setCertificateRequest({ ...certificateRequest, traineeSignature: files[0] });
    } else if (["A", "B", "C", "D"].includes(name)) {
      setCertificateRequest((prevState) => ({
        ...prevState,
        workAttended: { ...prevState.workAttended, [name]: value },
      }));
    } else {
      setCertificateRequest({ ...certificateRequest, [name]: value });
    }
  };

  const handleNotificationClose = () => {
    setShowNotification(false);
    navigate('/individual-home');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    Object.entries(certificateRequest).forEach(([key, value]) => {
      if (key === "workAttended") {
        formData.append("workAttended", JSON.stringify(value));
      } else if (key === "traineeSignature" && value) {
        formData.append("traineeSignature", value);
      } else if (value !== null && value !== "") {
        formData.append(key, value);
      }
    });

    try {
      setIsSubmitting(true);
      setErrorMessage("");

      const token = localStorage.getItem("token");
      const response = await axios.post("http://localhost:5000/api/certificates/create", formData, {
        headers: { 
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${token}`
        }
      });

      console.log("Training Certificate Request Submitted:", response.data);
      
      setNotificationMessage("Certificate Request Created Successfully!");
      setNotificationVariant("success");
      setShowNotification(true);

      // Reset form
      setCertificateRequest({
        name: "",
        internId: "",
        nic: "",
        contactNumber: "",
        sectionUnit: "",
        trainingCategory: "",
        periodFrom: "",
        periodTo: "",
        workAttended: { A: "", B: "", C: "", D: "" },
        traineeSignature: null,
        staffName: "",
        staffUserId: null,
      });
      setSelectedStaff("");
      
      setTimeout(() => {
        navigate('/individual-home');
      }, 3000); 
      
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Error submitting the form. Please try again later.");
      console.error("Error submitting the form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  if (unauthorized) {
    return (
      <Container className={`mt-5 text-center ${darkMode ? "text-white" : "text-dark"}`}>
        <div>
          <img src={logo} alt="SLT Mobitel Logo" className="mx-auto d-block" style={{ height: "50px" }} />
          <h3 className="mt-2 mb-5">TRAINING CERTIFICATE REQUEST</h3>
        </div>
        <div className="mt-5 mb-5">
          <Alert variant={darkMode ? "dark" : "light"} className={`rounded ${darkMode ? "bg-dark text-white" : "bg-light text-dark border border-secondary"}`}>
            <motion.div initial={{ scale: 1 }} whileHover={{ scale: 1.1 }} transition={{ type: "spring", stiffness: 300 }}>
              <FontAwesomeIcon icon={faLock} size="8x" className="mt-3 mb-5" />
            </motion.div>
            <h1 className="mb-3">Access Denied</h1>
            <p style={{ fontSize: '20px' }}>You do not have permission to access this page. Please contact the administrator if you believe this is a mistake.</p>
            <Button variant="link" onClick={() => navigate('/individual-home')}>Return Home</Button>
          </Alert>
        </div>
      </Container>
    );
  }

  return (
    <div className={`d-flex flex-column min-vh-100 ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
      {/* Notification Component */}
      <Notification 
        show={showNotification}
        onClose={handleNotificationClose}
        message={notificationMessage}
        variant={notificationVariant}
      />

      {/* Info Banner */}
      <div className={`alert ${darkMode ? "alert-info" : "alert-warning"} text-center`} role="alert">
        This page is for authorized users only.
      </div>

      <Container className="text-center mt-4 mb-3">
        <img src={logo} alt="SLT Mobitel Logo" className="mx-auto d-block" style={{ height: "50px" }} />
        <h3 className="mt-3">TRAINING CERTIFICATE REQUEST FORM</h3>
      </Container>

      <Container className={`p-4 rounded shadow ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"} mb-5`}>
        <Row>
          <Col md={12}>
            <h4>Trainee Details</h4>
            <Card className={darkMode ? "bg-dark text-white" : "bg-light text-dark"}>
              <Card.Body>
                {/* Form */}
                <Form onSubmit={handleSubmit}>
                  {/* Staff Selection */}
                  <Form.Group controlId="staffSelect" className="mb-3">
                    <Form.Label>Select Staff Member</Form.Label>
                    <Form.Control
                      as="select"
                      value={selectedStaff}
                      onChange={handleStaffSelect}
                      className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                      required
                    >
                      <option value="">Select Staff Member</option>
                      {staffList.map((staff) => (
                        <option key={staff._id} value={staff._id}>
                          {staff.name} - {staff.jobPosition}
                        </option>
                      ))}
                    </Form.Control>
                  </Form.Group>

                  {/* Form Fields */}
                  <Form.Group controlId="name" className="mb-3">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter your full name"
                      name="name"
                      value={certificateRequest.name}
                      onChange={handleInputChange}
                      className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                      required
                    />
                  </Form.Group>

                  <Form.Group controlId="internId" className="mb-3">
                    <Form.Label>Intern ID</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter your Intern ID"
                      name="internId"
                      value={certificateRequest.internId}
                      onChange={handleInputChange}
                      className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                      required
                    />
                  </Form.Group>

                  <Form.Group controlId="nic" className="mb-3">
                    <Form.Label>NIC</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter NIC"
                      name="nic"
                      value={certificateRequest.nic}
                      onChange={handleInputChange}
                      className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                      required
                    />
                  </Form.Group>

                  <Form.Group controlId="contactNumber" className="mb-3">
                    <Form.Label>Contact Number</Form.Label>
                    <Form.Control
                      type="tel"
                      placeholder="Enter contact number"
                      name="contactNumber"
                      value={certificateRequest.contactNumber}
                      onChange={handleInputChange}
                      className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                      required
                    />
                  </Form.Group>

                  <Form.Group controlId="sectionUnit" className="mb-3">
                    <Form.Label>Section/Unit</Form.Label>
                    <Form.Control
                      as="select"
                      name="sectionUnit"
                      value={certificateRequest.sectionUnit}
                      onChange={handleInputChange}
                      className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                      required
                    >
                      <option value="">Select Section/Unit</option>
                      {sectionUnitOptions.map((option, index) => (
                        <option key={index} value={option}>{option}</option>
                      ))}
                    </Form.Control>
                  </Form.Group>

                  <Form.Group controlId="trainingCategory" className="mb-3">
                    <Form.Label>Training Category</Form.Label>
                    <Form.Control
                      as="select"
                      name="trainingCategory"
                      value={certificateRequest.trainingCategory}
                      onChange={handleInputChange}
                      className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                      required
                    >
                      <option value="">Select Category</option>
                      <option value="Vocational">Vocational</option>
                      <option value="In Plant">In Plant</option>
                      <option value="Audit">Audit</option>
                    </Form.Control>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Period</Form.Label>
                    <Row>
                      <Col>
                        <Form.Control
                          type="date"
                          name="periodFrom"
                          value={certificateRequest.periodFrom}
                          onChange={handleInputChange}
                          className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                          required
                        />
                      </Col>
                      <Col>
                        <Form.Control
                          type="date"
                          name="periodTo"
                          value={certificateRequest.periodTo}
                          onChange={handleInputChange}
                          className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                          required
                        />
                      </Col>
                    </Row>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Work Attended</Form.Label>
                    {["A", "B", "C", "D"].map((work) => (
                      <Form.Group key={work} controlId={`workAttended-${work}`} className="mb-3">
                        <Form.Label>Work {work}</Form.Label>
                        <Form.Control
                          as="textarea"
                          placeholder={`Enter details for Work ${work}`}
                          name={work}
                          value={certificateRequest.workAttended[work]}
                          onChange={handleInputChange}
                          className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                          rows={2}
                          required
                        />
                      </Form.Group>
                    ))}
                  </Form.Group>

                  <Form.Group controlId="traineeSignature" className="mb-3">
                    <Form.Label>Upload Signature</Form.Label>
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={handleInputChange}
                      className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                      required
                    />
                  </Form.Group>

                  <div className="d-flex justify-content-between mt-3">
                      <Button variant="danger" onClick={() => window.history.back()}>Go Back</Button>
                      <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Submitting..." : "Request Certificate"}
                      </Button>
                  </div>

                  {errorMessage && <div className="mt-3 text-danger">{errorMessage}</div>}
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

TrainingCertificateRequest.propTypes = {
  darkMode: PropTypes.bool.isRequired,
};

export default TrainingCertificateRequest;