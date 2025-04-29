import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Form, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import logo from "../../../assets/logo.png";
import PropTypes from "prop-types";
import { FaUser } from "react-icons/fa";

const InstituteCertificateRequest = ({ darkMode }) => {
  const navigate = useNavigate();
  
  const [userId, setUserId] = useState("");
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
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  
  // Fetch user ID from JWT token in local storage
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setErrorMessage("User is not logged in. Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
      return;
    }

    try {
      const decodedToken = jwtDecode(token); 
      if (decodedToken?.id) {
        setUserId(decodedToken.id);
      } else {
        setErrorMessage("Invalid token. Please log in again.");
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (error) {
      console.error("Error decoding token:", error);
      setErrorMessage("Session expired. Please log in again.");
      setTimeout(() => navigate("/login"), 2000);
    }
  }, [navigate]);

  // Handle input changes
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

  // Check if the intern ID has an existing request
  const checkExistingRequest = async (internId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/certificates/user-certificates", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const existingRequest = response.data.data.find(
        (request) => request.internId === internId
      );

      return existingRequest;
    } catch (error) {
      console.error("Error checking existing requests:", error);
      return null;
    }
  };

  // Validate periodTo is within 7 days of current date
  const isPeriodValid = (periodTo) => {
    const currentDate = new Date();
    const toDate = new Date(periodTo);
    const dateDifference = (toDate - currentDate) / (1000 * 3600 * 24); // Difference in days
    return dateDifference <= 7;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId) {
      setErrorMessage("User ID not found. Please log in again.");
      return;
    }

    const { internId, periodTo } = certificateRequest;

    // Check if the intern ID already has a request
    const existingRequest = await checkExistingRequest(internId);
    if (existingRequest) {
      setErrorMessage("You have already submitted a certificate request for this Intern ID.");
      return;
    }

    // Validate periodTo
    if (!isPeriodValid(periodTo)) {
      setErrorMessage("The 'Period To' date cannot be more than 7 days from the current date.");
      return;
    }

    const formData = new FormData();
    formData.append("userId", userId);

    Object.entries(certificateRequest).forEach(([key, value]) => {
      if (key === "workAttended") {
        Object.entries(value).forEach(([subKey, subValue]) => {
          formData.append(`workAttended[${subKey}]`, subValue);
        });
      } else if (key === "traineeSignature" && value) {
        formData.append(key, value);
      } else {
        formData.append(key, value);
      }
    });

    // Log FormData to check contents
    for (let pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }

    try {
      setIsSubmitting(true);
      setErrorMessage("");
      setSuccessMessage("");

      const token = localStorage.getItem("token");

      const response = await axios.post("http://localhost:5000/api/certificates/create", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      setSuccessMessage("Certificate Request Created Successfully!");

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
      });
    } catch (error) {
      console.error("Error submitting form:", error.response?.data || error.message);
      setErrorMessage(error.response?.data?.message || "Error submitting the form. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`d-flex flex-column min-vh-100 ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
      <Container className="text-center mt-4 mb-3">
        <img src={logo} alt="SLT Mobitel Logo" className="mx-auto d-block" style={{ height: "50px" }} />
        <h3 className="mt-3">TRAINING CERTIFICATE REQUEST FORM</h3>
      </Container>

      <Container className={`p-4 rounded shadow ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"} mb-5`}>
        <Row>
          <Col md={12}>
            <div className="d-flex align-items-center gap-2">
              <FaUser className={`fs-3 ${darkMode ? "text-white" : "text-dark"}`} />
              <h5 className="mb-0">Trainee Details</h5>
            </div>

            <hr className={darkMode ? "border-light mt-3" : "border-dark mt-3"} />

            <Card className={darkMode ? "bg-dark text-white" : "bg-light text-dark"}>
              <Card.Body>
                {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
                {successMessage && <Alert variant="success">{successMessage}</Alert>}

                <Form onSubmit={handleSubmit}>
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
                      type="text"
                      placeholder="Enter section/unit"
                      name="sectionUnit"
                      value={certificateRequest.sectionUnit}
                      onChange={handleInputChange}
                      className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                      required
                    />
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
                        />
                      </Form.Group>
                    ))}
                  </Form.Group>

                  <Form.Group controlId="traineeSignature" className="mb-3">
                    <Form.Label>Upload Signature</Form.Label>
                    <Form.Control type="file" accept="image/*" onChange={handleInputChange} className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`} required />
                  </Form.Group>

                  <div className="d-flex justify-content-between mt-3">
                    <Button variant="danger" onClick={() => navigate('/institute-home')}>Go Back</Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Submitting..." : "Request Certificate"}
                    </Button>
                  </div>

                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

InstituteCertificateRequest.propTypes = {
  darkMode: PropTypes.bool.isRequired,
};

export default InstituteCertificateRequest;
