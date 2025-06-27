import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Spinner,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../../../assets/logo.png";
import PropTypes from "prop-types";
import Notification from "../../../components/notifications/Notification";

const API_BASE_URL = `${import.meta.env.VITE_BASE_URL}/api/interviews`;

const AddNewInterview = ({ darkMode }) => {
  const [interviewData, setInterviewData] = useState({
    interviewName: "", 
    interviewDate: "",
    interviewTime: "",
    location: "",
    note: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const navigate = useNavigate();

  // Get today's date in YYYY-MM-DD format for min date
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInterviewData({
      ...interviewData,
      [name]: value,
    });
  };

  // Validate interview date is not in the past
  const validateInterviewDate = (date) => {
    const today = new Date();
    const selectedDate = new Date(date);
    today.setHours(0, 0, 0, 0);
    return selectedDate >= today;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    // Validate interview date
    if (!validateInterviewDate(interviewData.interviewDate)) {
      setErrorMessage("Interview date cannot be in the past");
      setShowErrorNotification(true);
      setIsSubmitting(false);
      setTimeout(() => setShowErrorNotification(false), 3000);
      return;
    }

    try {
      const response = await axios.post(API_BASE_URL, interviewData);
      setSuccessMessage("Interview Created Successfully!");
      setShowSuccessNotification(true);

      // Reset form
      setInterviewData({
        interviewName: "",
        interviewDate: "",
        interviewTime: "",
        location: "",
        note: "",
      });

      setTimeout(() => {
        setShowSuccessNotification(false);
        navigate("/view-all-interviews");
      }, 3000);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.error ||
          "An error occurred while scheduling the interview."
      );
      setShowErrorNotification(true);
      setTimeout(() => setShowErrorNotification(false), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`d-flex flex-column min-vh-100 ${
        darkMode ? "bg-dark text-white" : "bg-light text-dark"
      }`}
    >
      {/* Header */}
      <Container className="text-center mt-4 mb-3">
        <img
          src={logo}
          alt="Company Logo"
          className="mx-auto d-block"
          style={{ height: "50px" }}
        />
        <h3 className="mt-3">ADD NEW INTERVIEW</h3>
      </Container>

      {/* Main Form Section */}
      <Container
        className={`p-4 rounded shadow ${
          darkMode ? "bg-secondary text-white" : "bg-white text-dark"
        } mb-5`}
      >
        <Row>
          <Col md={12}>
            <h4>Interview Details</h4>
            <Card
              className={darkMode ? "bg-dark text-white" : "bg-light text-dark"}
            >
              <Card.Body>
                <Form onSubmit={handleSubmit}>
                  {/* Form Fields */}
                  <Form.Group controlId="interviewName" className="mb-3">
                    <Form.Label>Interview Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter Interview Name"
                      name="interviewName" 
                      value={interviewData.interviewName} 
                      onChange={handleInputChange}
                      className={`form-control ${
                        darkMode
                          ? "bg-secondary text-white"
                          : "bg-white text-dark"
                      }`}
                      required
                    />
                  </Form.Group>

                  <Form.Group controlId="interviewDate" className="mb-3">
                    <Form.Label>Interview Date</Form.Label>
                    <Form.Control
                      type="date"
                      name="interviewDate"
                      value={interviewData.interviewDate}
                      onChange={handleInputChange}
                      min={getTodayDate()}
                      className={`form-control ${
                        darkMode
                          ? "bg-secondary text-white"
                          : "bg-white text-dark"
                      }`}
                      required
                    />
                    {interviewData.interviewDate && !validateInterviewDate(interviewData.interviewDate) && (
                      <Form.Text className="text-danger">
                        Please select a future date
                      </Form.Text>
                    )}
                  </Form.Group>

                  <Form.Group controlId="interviewTime" className="mb-3">
                    <Form.Label>Interview Time</Form.Label>
                    <Form.Control
                      type="time"
                      name="interviewTime"
                      value={interviewData.interviewTime}
                      onChange={handleInputChange}
                      className={`form-control ${
                        darkMode
                          ? "bg-secondary text-white"
                          : "bg-white text-dark"
                      }`}
                      required
                    />
                  </Form.Group>

                  <Form.Group controlId="location" className="mb-3">
                    <Form.Label>Location</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter Interview Location"
                      name="location"
                      value={interviewData.location}
                      onChange={handleInputChange}
                      className={`form-control ${
                        darkMode
                          ? "bg-secondary text-white"
                          : "bg-white text-dark"
                      }`}
                      required
                    />
                  </Form.Group>

                  <Form.Group controlId="note" className="mb-3">
                    <Form.Label>Note</Form.Label>
                    <Form.Control
                      as="textarea"
                      placeholder="Enter any additional notes"
                      name="note"
                      value={interviewData.note}
                      onChange={handleInputChange}
                      className={`form-control ${
                        darkMode
                          ? "bg-secondary text-white"
                          : "bg-white text-dark"
                      }`}
                      rows={3}
                    />
                  </Form.Group>

                  {/* Buttons */}
                  <div className="d-flex justify-content-between mt-3">
                    <Button
                      variant="danger"
                      onClick={() => navigate(-1)}
                      disabled={isSubmitting}
                    >
                      Go Back
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isSubmitting || (interviewData.interviewDate && !validateInterviewDate(interviewData.interviewDate))}
                    >
                      {isSubmitting ? (
                        <Spinner animation="border" size="sm" />
                      ) : (
                        "Create Interview"
                      )}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Notification Component for Success and Error */}
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

AddNewInterview.propTypes = {
  darkMode: PropTypes.bool.isRequired,
};

export default AddNewInterview;