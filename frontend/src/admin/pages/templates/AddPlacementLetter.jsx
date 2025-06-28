import React, { useState } from "react";
import { Container, Row, Col, Card, Button, Form, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../../../assets/logo.png";
import PropTypes from "prop-types";
import Notification from "../../../components/notifications/Notification";

const API_BASE_URL = `${import.meta.env.VITE_BASE_URL}/api/letters`;

const AddPlacementLetter = ({ darkMode }) => {
  const [letterData, setLetterData] = useState({
    letterName: "Placement Letter",
    label1: "Talent Development Section",  
    label2: "7th Floor, Head Office, Lotus Road, Colombo 01",
    label3: "Our/My Ref: [......]",
    label4: "Your Ref:[........]",
    label5: "Telephone: 011-2021359",
    label6: "Fax: 011-2478627",
    label7: "Email: hiroshim@slt.com",
    label8: "To: Security Staff",
    label9: "From: Engineer Talent Development",
    label10: "Date: [........]",
    label11: "Subject - Assignment of Internship",
    label12: "Following student from [Uni/Institute] has been assigned to",
    label13: "you to undergo the Intern Program under your supervision from [Start Date] to [End Date]",
    label14: "",
    label15: "Please arrage to accommodate the Intern. Please note that the induction programme is",
    label16: "compulsory for all interns.",
    label17: "Please arrange to release the interns for the next induction programme which will be held on undefined",
    label18: "Please do not expose any confidential information to the Intern and strictly follow the information",
    label19: "Security guideline currently prevailing at SLT when assigning duties to the Intern.",
    label20: "Details of the Intern as follows:",
    label21: "Name: [Intern Name]",
    label22: "NIC: [Intern NIC]",
    label23: "Scheme Name:[Scheme Name]",
    label24: {
      policeReport: false,
      durationCheck: false,
      agreement: false,
      nda: false
    },
    label25: "...........................",
    label26: "Engineer/Talent Development",
    label27: ".................",
    label28: "Signature",
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
    setLetterData({
      ...letterData,
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

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setLetterData({
      ...letterData,
      label24: {
        ...letterData.label24,
        [name]: checked
      }
    });
  };

  const validateForm = () => {
    const errors = {};
    const requiredFields = ['label3', 'label4', 'label10', 'label13', 'label21', 'label22', 'label23'];

    requiredFields.forEach(field => {
      if (!letterData[field] || letterData[field].trim() === '') {
        errors[field] = 'This field is required';
      } else if (letterData[field].includes('[') && letterData[field].includes(']')) {
        errors[field] = 'Please replace the placeholder with actual value';
      }
    });

    // Validate at least one document is checked
    if (!Object.values(letterData.label24).some(val => val)) {
      errors.label24 = 'At least one document must be selected';
    }

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
      // Prepare data for submission
      const submissionData = {
        ...letterData,
        label24: `Intern has signed the following documents - ${
          letterData.label24.policeReport ? 'Police report, ' : ''
        }${
          letterData.label24.durationCheck ? 'Duration check, ' : ''
        }${
          letterData.label24.agreement ? 'Agreement, ' : ''
        }${
          letterData.label24.nda ? 'NDA' : ''
        }`.replace(/, $/, '') // Remove trailing comma
      };

      const response = await axios.post(API_BASE_URL, submissionData);
      setSuccessMessage("Placement Letter Created Successfully!");
      setShowSuccessNotification(true);

      // Reset form data
      setLetterData({
        letterName: "Placement Letter",
        label1: "Talent Development Section",  
        label2: "7th Floor, Head Office, Lotus Road, Colombo 01",
        label3: "Our/My Ref: [......]",
        label4: "Your Ref:[........]",
        label5: "Telephone: 011-2021359",
        label6: "Fax: 011-2478627",
        label7: "Email: hiroshim@slt.com",
        label8: "To: Security Staff",
        label9: "From: Engineer Talent Development",
        label10: "Date: [........]",
        label11: "Subject - Assignment of Internship",
        label12: "Following student from [Uni/Institute] has been assigned to",
        label13: "you to undergo the Intern Program under your supervision from [Start Date] to [End Date]",
        label14: "",
        label15: "Please arrage to accommodate the Intern. Please note that the induction programme is",
        label16: "compulsory for all interns.",
        label17: "Please arrange to release the interns for the next induction programme which will be held on undefined",
        label18: "Please do not expose any confidential information to the Intern and strictly follow the information",
        label19: "Security guideline currently prevailing at SLT when assigning duties to the Intern.",
        label20: "Details of the Intern as follows:",
        label21: "Name: [Intern Name]",
        label22: "NIC: [Intern NIC]",
        label23: "Scheme Name:[Scheme Name]",
        label24: {
          policeReport: false,
          durationCheck: false,
          agreement: false,
          nda: false
        },
        label25: "...........................",
        label26: "Engineer/Talent Development",
        label27: ".................",
        label28: "Signature",
      });

      setTimeout(() => {
        setShowSuccessNotification(false);
        navigate("/all-placement-letters", { state: { refresh: true } });
      }, 3000);

    } catch (error) {
      setErrorMessage(error.response?.data?.error || "An error occurred while creating the letter.");
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
        <h3 className="mt-3">CREATE NEW PLACEMENT LETTER</h3>
      </Container>

      <Container className={`p-4 rounded shadow ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"} mb-5`}>
        <Row>
          <Col md={12}>
            <h4>Placement Letter Details</h4>
            <Card className={darkMode ? "bg-dark text-white" : "bg-light text-dark"}>
              <Card.Body>
                <Form onSubmit={handleSubmit}>
                  <Form.Group controlId="letterName" className="mb-3">
                    <Form.Label>Letter Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="letterName"
                      value={letterData.letterName}
                      onChange={handleInputChange}
                      required
                      readOnly
                    />
                  </Form.Group>

                  {Array.from({ length: 28 }, (_, i) => {
                    const fieldName = `label${i + 1}`;
                    const isEditable = [3, 4, 10, 13, 21, 22, 23].includes(i + 1);
                    
                    // Special handling for line 24 (checkboxes)
                    if (i + 1 === 24) {
                      return (
                        <Form.Group key={fieldName} controlId={fieldName} className="mb-3">
                          <Form.Label>Line {i + 1} <span className="text-danger">*</span></Form.Label>
                          <div className={`p-3 rounded ${darkMode ? "bg-dark" : "bg-light"}`}>
                            <p className="mb-2">Intern has signed the following documents:</p>
                            <div className="d-flex flex-wrap gap-3">
                              {['policeReport', 'durationCheck', 'agreement', 'nda'].map((doc) => (
                                <Form.Check
                                  key={doc}
                                  type="checkbox"
                                  id={`label24-${doc}`}
                                  name={doc}
                                  label={
                                    doc === 'policeReport' ? 'Police Report' :
                                    doc === 'durationCheck' ? 'Duration Check' :
                                    doc === 'agreement' ? 'Agreement' : 'NDA'
                                  }
                                  checked={letterData.label24[doc]}
                                  onChange={handleCheckboxChange}
                                  className={darkMode ? "text-white" : ""}
                                />
                              ))}
                            </div>
                            {validationErrors.label24 && (
                              <div className="text-danger mt-2">{validationErrors.label24}</div>
                            )}
                          </div>
                        </Form.Group>
                      );
                    }
                    
                    return (
                      <Form.Group key={fieldName} controlId={fieldName} className="mb-3">
                        <Form.Label>
                          Line {i + 1} {isEditable && <span className="text-danger">*</span>}
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name={fieldName}
                          value={letterData[fieldName]}
                          onChange={handleInputChange}
                          required={isEditable}
                          readOnly={!isEditable}
                          plaintext={!isEditable}
                          className={!isEditable ? (darkMode ? "text-white" : "text-dark") : ""}
                          isInvalid={!!validationErrors[fieldName]}
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
                      {isSubmitting ? <Spinner animation="border" size="sm" /> : "Create Letter"}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <Notification show={showSuccessNotification} onClose={() => setShowSuccessNotification(false)} message={successMessage} variant="success" />
      <Notification show={showErrorNotification} onClose={() => setShowErrorNotification(false)} message={errorMessage} variant="danger" />
    </div>
  );
};

AddPlacementLetter.propTypes = {
  darkMode: PropTypes.bool.isRequired,
};

export default AddPlacementLetter;