import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import logo from "../../../assets/logo.png";
import PropTypes from "prop-types";
import axios from "axios";
import Notification from "../../../components/notifications/Notification";

const CreateInternRequest = ({ darkMode }) => {
  const navigate = useNavigate();
  const [internRequest, setInternRequest] = useState({
    internType: "internship",
    district: "",
    scheme: "",
    requiredInterns: "",
    justification: "",
    periodFrom: "",
    periodTo: "",
    workScope: "",
    proposedInternNIC: "",
    note: "",
    category: ""
  });

  const [districts, setDistricts] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState({
    districts: true,
    schemes: true
  });

  // Notification state
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationVariant, setNotificationVariant] = useState("success");

  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/districts');
        const districtsData = Array.isArray(response.data) ? response.data : [];
        setDistricts(districtsData);
      } catch (error) {
        console.error("Error fetching districts:", error);
        setErrorMessage("Failed to load districts. Please refresh the page.");
      } finally {
        setLoading(prevState => ({ ...prevState, districts: false }));
      }
    };

    const fetchSchemes = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/schemes');
        const schemesData = Array.isArray(response.data) ? response.data : [];
        setSchemes(schemesData);
      } catch (error) {
        console.error("Error fetching schemes:", error);
        setErrorMessage("Failed to load schemes. Please refresh the page.");
      } finally {
        setLoading(prevState => ({ ...prevState, schemes: false }));
      }
    };

    fetchDistricts();
    fetchSchemes();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInternRequest({ ...internRequest, [name]: value });
  };

  const validateForm = () => {
    if (!internRequest.periodFrom || !internRequest.periodTo) {
      setErrorMessage("Please select both start and end dates.");
      return false;
    }

    if (new Date(internRequest.periodFrom) > new Date(internRequest.periodTo)) {
      setErrorMessage("End date must be after the start date.");
      return false;
    }

    if (!internRequest.requiredInterns || parseInt(internRequest.requiredInterns) < 1) {
      setErrorMessage("Please enter a valid number of interns required.");
      return false;
    }

    setErrorMessage("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        setErrorMessage("Authentication required. Please login again.");
        setIsSubmitting(false);
        return;
      }

      const response = await axios.post(
        'http://localhost:5000/api/internRequest/intern-requests',
        internRequest,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Show success notification
      setNotificationMessage("Intern Request Created Successfully!");
      setNotificationVariant("success");
      setShowNotification(true);

      // Reset form
      setInternRequest({
        internType: "internship",
        district: "",
        scheme: "",
        requiredInterns: "",
        justification: "",
        periodFrom: "",
        periodTo: "",
        workScope: "",
        proposedInternNIC: "",
        note: "",
        category: ""
      });

      // Redirect after 3 seconds
      setTimeout(() => {
        navigate("/view-my-requests");
      }, 3000);
    } catch (error) {
      console.error("Error submitting the form:", error);
      let errorMsg = "Error submitting the form. Please try again later.";
      
      if (error.response) {
        errorMsg = error.response.data.message || errorMsg;
      } else if (error.request) {
        errorMsg = "No response from server. Please check your connection.";
      }

      setErrorMessage(errorMsg);
      setNotificationMessage(errorMsg);
      setNotificationVariant("danger");
      setShowNotification(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`d-flex flex-column min-vh-100 ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
      <Container className="text-center mt-4 mb-3">
        <img src={logo} alt="SLT Mobitel Logo" className="mx-auto d-block" style={{ height: "50px" }} />
        <h3 className="mt-3">INTERN REQUEST FORM</h3>
      </Container>

      <Container className={`p-4 rounded shadow ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"} mb-5`}>
        <Row>
          <Col md={12}>
            <h4>Intern Request Details</h4>
            <Card className={darkMode ? "bg-dark text-white" : "bg-light text-dark"}>
              <Card.Body>
                <Form onSubmit={handleSubmit}>
                  {/* Intern Type Radio Buttons */}
                  <Form.Group className="mb-3">
                    <Form.Label>Intern Type</Form.Label>
                    <div>
                      <Form.Check
                        inline
                        type="radio"
                        label="Internship"
                        name="internType"
                        value="internship"
                        checked={internRequest.internType === "internship"}
                        onChange={handleInputChange}
                        className={darkMode ? "text-white" : "text-dark"}
                        required
                      />
                      <Form.Check
                        inline
                        type="radio"
                        label="Data Entry"
                        name="internType"
                        value="dataEntry"
                        checked={internRequest.internType === "dataEntry"}
                        onChange={handleInputChange}
                        className={darkMode ? "text-white" : "text-dark"}
                      />
                    </div>
                  </Form.Group>

                  {/* District Dropdown */}
                  <Form.Group controlId="district" className="mb-3">
                    <Form.Label>District</Form.Label>
                    <Form.Control
                      as="select"
                      name="district"
                      value={internRequest.district}
                      onChange={handleInputChange}
                      className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                      required
                      disabled={loading.districts}
                    >
                      <option value="">Select District</option>
                      {districts.map(district => (
                        <option key={district._id} value={district.district_name}>
                          {district.district_name}
                        </option>
                      ))}
                    </Form.Control>
                    {loading.districts && <small className="text-muted">Loading districts...</small>}
                  </Form.Group>

                  {/* Scheme Dropdown */}
                  <Form.Group controlId="scheme" className="mb-3">
                    <Form.Label>Scheme</Form.Label>
                    <Form.Control
                      as="select"
                      name="scheme"
                      value={internRequest.scheme}
                      onChange={handleInputChange}
                      className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                      required
                      disabled={loading.schemes}
                    >
                      <option value="">Select Scheme</option>
                      {schemes.map(scheme => (
                        <option key={scheme._id} value={scheme.schemeName}>
                          {scheme.schemeName}
                        </option>
                      ))}
                    </Form.Control>
                    {loading.schemes && <small className="text-muted">Loading schemes...</small>}
                  </Form.Group>

                  {/* Required Number of Interns */}
                  <Form.Group controlId="requiredInterns" className="mb-3">
                    <Form.Label>Required Number of Interns</Form.Label>
                    <Form.Control
                      type="number"
                      min="1"
                      placeholder="Enter required number of interns"
                      name="requiredInterns"
                      value={internRequest.requiredInterns}
                      onChange={handleInputChange}
                      className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                      required
                    />
                  </Form.Group>

                  {/* Justification */}
                  <Form.Group controlId="justification" className="mb-3">
                    <Form.Label>Justification for Request</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder="Enter justification for the intern request"
                      name="justification"
                      value={internRequest.justification}
                      onChange={handleInputChange}
                      className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                      required
                    />
                  </Form.Group>

                  {/* Expected Period */}
                  <Form.Group className="mb-3">
                    <Form.Label>Expected Period</Form.Label>
                    <Row>
                      <Col>
                        <Form.Label>Start Date</Form.Label>
                        <Form.Control
                          type="date"
                          name="periodFrom"
                          value={internRequest.periodFrom}
                          onChange={handleInputChange}
                          className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                          required
                        />
                      </Col>
                      <Col>
                        <Form.Label>End Date</Form.Label>
                        <Form.Control
                          type="date"
                          name="periodTo"
                          value={internRequest.periodTo}
                          onChange={handleInputChange}
                          className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                          required
                        />
                      </Col>
                    </Row>
                  </Form.Group>

                  {/* Work Scope */}
                  <Form.Group controlId="workScope" className="mb-3">
                    <Form.Label>Work Scope of Intern</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder="Describe the work scope for the intern"
                      name="workScope"
                      value={internRequest.workScope}
                      onChange={handleInputChange}
                      className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                      required
                    />
                  </Form.Group>

                  {/* Proposed Intern NIC */}
                  <Form.Group controlId="proposedInternNIC" className="mb-3">
                    <Form.Label>Proposed Intern NIC Number</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter proposed intern NIC number (optional)"
                      name="proposedInternNIC"
                      value={internRequest.proposedInternNIC}
                      onChange={handleInputChange}
                      className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                    />
                  </Form.Group>

                  {/* Category Selection */}
                  <Form.Group controlId="category" className="mb-3">
                    <Form.Label>Category</Form.Label>
                    <Form.Control
                      as="select"
                      name="category"
                      value={internRequest.category}
                      onChange={handleInputChange}
                      className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                      required
                    >
                      <option value="">Select Category</option>
                      <option value="IT">IT</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Management">Management</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Finance">Finance</option>
                      <option value="Human Resources">Human Resources</option>
                      <option value="Other">Other</option>
                    </Form.Control>
                  </Form.Group>

                  {/* Note */}
                  <Form.Group controlId="note" className="mb-3">
                    <Form.Label>Additional Notes</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      placeholder="Enter any additional notes"
                      name="note"
                      value={internRequest.note}
                      onChange={handleInputChange}
                      className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                    />
                  </Form.Group>

                  {/* Submit and Cancel Buttons */}
                  <div className="d-flex justify-content-between mt-3">
                    <Button variant="danger" onClick={() => window.history.back()}>Cancel</Button>
                    <Button 
                      type="submit" 
                      disabled={isSubmitting || loading.districts || loading.schemes}
                      variant={darkMode ? "outline-light" : "primary"}
                    >
                      {isSubmitting ? "Creating..." : "Create Intern Request"}
                    </Button>
                  </div>

                  {errorMessage && (
                    <div className={`mt-3 ${darkMode ? "text-warning" : "text-danger"}`}>
                      {errorMessage}
                    </div>
                  )}
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Notification Component */}
      <Notification
        show={showNotification}
        onClose={() => setShowNotification(false)}
        message={notificationMessage}
        variant={notificationVariant}
        darkMode={darkMode}
      />
    </div>
  );
};

CreateInternRequest.propTypes = {
  darkMode: PropTypes.bool.isRequired,
};

export default CreateInternRequest;