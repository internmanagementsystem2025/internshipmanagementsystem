import React, { useState } from "react";
import { Container, Row, Col, Card, Button, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import logo from "../../../assets/logo.png";
import PropTypes from "prop-types";
import axios from "axios";
import Notification from "../../../components/notifications/Notification"; 

const CreateDetails = ({ darkMode }) => {
  const navigate = useNavigate();
  const [staffData, setStaffData] = useState({
    name: "",
    staffId: "",
    jobPosition: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Notification state
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationVariant, setNotificationVariant] = useState("success");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStaffData({ ...staffData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      setErrorMessage("");
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        setErrorMessage("Authentication required. Please login again.");
        setIsSubmitting(false);
        return;
      }
      
      let userId = null;
      try {
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        userId = tokenPayload.id || tokenPayload.userId || tokenPayload._id;
      } catch (error) {
        console.error("Error extracting user ID from token:", error);
      }

      const staffWithUserId = {
        ...staffData,
        userId: userId
      };

      const response = await axios.post(
        'http://localhost:5000/api/staff',
        staffWithUserId,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log("Staff Created:", response.data);

      // Show success notification
      setNotificationMessage("Staff Created Successfully!");
      setNotificationVariant("success");
      setShowNotification(true);

      // Reset form
      setStaffData({
        name: "",
        staffId: "",
        jobPosition: ""
      });

      setTimeout(() => {
        navigate("/view-my-details");
      }, 3000); 
    } catch (error) {
      console.error("Error submitting the form:", error);
      
      if (error.response) {
        setErrorMessage(error.response.data.message || "Error submitting the form. Please try again later.");
      } else if (error.request) {
        setErrorMessage("No response from server. Please check your connection.");
      } else {
        setErrorMessage("Error submitting the form. Please try again later.");
      }

      // Show error notification
      setNotificationMessage("Error creating staff. Please try again later.");
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
        <h3 className="mt-3">CREATE STAFF</h3>
      </Container>

      <Container className={`p-4 rounded shadow ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"} mb-5`}>
        <Row>
          <Col md={12}>
            <h4>Staff Details</h4>
            <Card className={darkMode ? "bg-dark text-white" : "bg-light text-dark"}>
              <Card.Body>
                <Form onSubmit={handleSubmit}>
                  {/* Name */}
                  <Form.Group controlId="name" className="mb-3">
                    <Form.Label>Full Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter staff name"
                      name="name"
                      value={staffData.name}
                      onChange={handleInputChange}
                      className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                      required
                    />
                  </Form.Group>

                  {/* Staff ID */}
                  <Form.Group controlId="staffId" className="mb-3">
                    <Form.Label>Staff ID</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter unique staff ID"
                      name="staffId"
                      value={staffData.staffId}
                      onChange={handleInputChange}
                      className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                      required
                    />
                  </Form.Group>

                  {/* Job Position */}
                  <Form.Group controlId="jobPosition" className="mb-3">
                    <Form.Label>Job Position</Form.Label>
                    <Form.Control
                      as="select"
                      name="jobPosition"
                      value={staffData.jobPosition}
                      onChange={handleInputChange}
                      className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                      required
                    >
                      <option value="">Select Position</option>
                      <option value="General Manager">General Manager</option>
                      <option value="Deputy General Manager">Deputy General Manager</option>
                      <option value="Supervisor">Supervisor</option>
                      <option value="Staff">Staff</option>
                    </Form.Control>
                  </Form.Group>

                  {/* Submit and Cancel Buttons */}
                  <div className="d-flex justify-content-between mt-3">
                    <Button variant="danger" onClick={() => window.history.back()}>Cancel</Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Creating..." : "Create"}
                    </Button>
                  </div>

                  {errorMessage && <div className="mt-3 text-danger">{errorMessage}</div>}
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
      />
    </div>
  );
};

CreateDetails.propTypes = {
  darkMode: PropTypes.bool.isRequired,
};

export default CreateDetails;