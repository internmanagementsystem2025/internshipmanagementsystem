import React, { useState } from "react";
import { Container, Row, Col, Card, Button, Form, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../../../assets/logo.png";
import PropTypes from "prop-types";
import Notification from "../../../components/notifications/Notification";

const API_BASE_URL = `${import.meta.env.VITE_BASE_URL}/api/interncertificates`;

const AddCertificate = ({ darkMode }) => {
  // Read-only lines configuration
  const readOnlyLines = [1, 3, 5, 9, 10, 13];
  
  const [certificateData, setCertificateData] = useState({
    certificateName: "Training Completion Certificate",
    label1: "TRAINING COMPLETION CERTIFICATE",       // Read-only
    label2: "This Certificate is awarded to [Intern Name]", // Editable
    label3: "on Successful completion of",           // Read-only
    label4: "[Duration] months intern program",             // Editable
    label5: "as",                                   // Read-only
    label6: "[Position]",                           // Editable
    label7: "from [Start Date]",                    // Editable
    label8: "to [End Date]",                        // Editable
    label9: "at",                                   // Read-only
    label10: "Sri Lanka Telecom PLC",               // Read-only
    label11: "Awarded on: [Award Date]",           // Editable
    label12: "Certificate No: [Certificate Number]", // Editable
    label13: "Engineer/Talent Development",         // Read-only
    label14: "",                                    // Editable (optional)
    label15: "",                                    // Editable (optional)
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCertificateData({
      ...certificateData,
      [name]: value,
    });

    // Clear validation error when user types
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: null,
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    const requiredFields = ['label2', 'label4', 'label6', 'label7', 'label8', 'label11', 'label12'];

    requiredFields.forEach(field => {
      if (!certificateData[field] || certificateData[field].trim() === '') {
        errors[field] = 'This field is required';
      } else if (certificateData[field].includes('[') && certificateData[field].includes(']')) {
        errors[field] = 'Please replace the placeholder with actual value';
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await axios.post(API_BASE_URL, certificateData);
      setSuccessMessage("Certificate Created Successfully!");
      setShowSuccessNotification(true);

      // Reset form data
      setCertificateData({
        certificateName: "Training Completion Certificate",
        label1: "TRAINING COMPLETION CERTIFICATE",
        label2: "This Certificate is awarded to [Intern Name]",
        label3: "on Successful completion of",
        label4: "[Duration] months intern program",
        label5: "as",
        label6: "[Position]",
        label7: "from [Start Date]",
        label8: "to [End Date]",
        label9: "at",
        label10: "Sri Lanka Telecom PLC",
        label11: "Awarded on: [Award Date]",
        label12: "Certificate No: [Certificate Number]",
        label13: "Engineer/Talent Development",
        label14: "",
        label15: "",
      });

      setTimeout(() => {
        setShowSuccessNotification(false);
        navigate("/all-certificate", { state: { refresh: true } });
      }, 3000);

    } catch (error) {
      setErrorMessage(error.response?.data?.error || "An error occurred while creating the certificate.");
      setShowErrorNotification(true);
      setTimeout(() => setShowErrorNotification(false), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`d-flex flex-column min-vh-100 ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
      <Container className="text-center mt-4 mb-3">
        <img src={logo} alt="Company Logo" className="mx-auto d-block" style={{ height: "50px" }} />
        <h3 className="mt-3">CREATE NEW CERTIFICATE</h3>
      </Container>

      <Container className={`p-4 rounded shadow ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"} mb-5`}>
        <Row>
          <Col md={12}>
            <h4>Certificate Details</h4>
            <Card className={darkMode ? "bg-dark text-white" : "bg-light text-dark"}>
              <Card.Body>
                <Form onSubmit={handleSubmit}>
                  <Form.Group controlId="certificateName" className="mb-3">
                    <Form.Label>Certificate Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="certificateName"
                      value={certificateData.certificateName}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>

                  {Array.from({ length: 15 }, (_, i) => {
                    const fieldName = `label${i + 1}`;
                    const isRequired = [2, 4, 6, 7, 8, 11, 12].includes(i + 1);
                    const isReadOnly = readOnlyLines.includes(i + 1);
                    
                    return (
                      <Form.Group key={fieldName} controlId={fieldName} className="mb-3">
                        <Form.Label>
                          Line {i + 1} {isRequired && <span className="text-danger">*</span>}
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name={fieldName}
                          value={certificateData[fieldName]}
                          onChange={handleInputChange}
                          placeholder={isReadOnly ? "" : `Enter text for line ${i + 1}`}
                          required={isRequired}
                          isInvalid={!!validationErrors[fieldName]}
                          readOnly={isReadOnly}
                          plaintext={isReadOnly}
                          className={isReadOnly ? (darkMode ? "text-white" : "text-dark") : ""}
                        />
                        {validationErrors[fieldName] && (
                          <Form.Control.Feedback type="invalid">
                            {validationErrors[fieldName]}
                          </Form.Control.Feedback>
                        )}
                      </Form.Group>
                    );
                  })}

                  <div className="d-flex justify-content-between mt-3">
                    <Button variant="danger" onClick={() => navigate(-1)} disabled={isSubmitting}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? <Spinner animation="border" size="sm" /> : "Create Certificate"}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <Notification 
        show={showSuccessNotification} 
        onClose={() => setShowSuccessNotification(false)} 
        message={successMessage} 
        variant="success" 
      />
      <Notification 
        show={showErrorNotification} 
        onClose={() => setShowErrorNotification(false)} 
        message={errorMessage} 
        variant="danger" 
      />
    </div>
  );
};

AddCertificate.propTypes = {
  darkMode: PropTypes.bool.isRequired,
};

export default AddCertificate;