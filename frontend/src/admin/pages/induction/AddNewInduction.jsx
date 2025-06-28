import React, { useState } from "react";
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

const AddNewInduction = ({ darkMode }) => {
  const [inductionData, setInductionData] = useState({
    induction: "",
    startDate: "",
    time: "",
    location: "",
    note: "",
  });

   const [formErrors, setFormErrors] = useState({
    induction: "",
    startDate: "",
    time: "",
    location: "",
    note: "",
  });


  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const navigate = useNavigate();

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInductionData({
      ...inductionData,
      [name]: value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await axios.post(`${import.meta.env.VITE_BASE_URL}/api/inductions`, inductionData);
      setSuccessMessage("Induction Created Successfully!");

      setShowSuccessNotification(true);

      setInductionData({
        induction: "",
        startDate: "",
        time: "",
        location: "",
        note: "",
      });

      setTimeout(() => {
        setShowSuccessNotification(false);
        navigate("/view-all-inductions");
      }, 3000);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.error ||
          "An error occurred while scheduling the induction."
      );

      setShowErrorNotification(true);

      setTimeout(() => {
        setShowErrorNotification(false);
      }, 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    if (!inductionData.induction.trim()) {
      errors.induction = "Induction name is required";
      isValid = false;
    }

    if (!inductionData.startDate) {
      errors.startDate = "Start date is required";
      isValid = false;
    } else {
      const selectedDate = new Date(inductionData.startDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        errors.startDate = "Date cannot be in the past";
        isValid = false;
      }
    }

    if (!inductionData.time) {
      errors.time = "Time is required";
      isValid = false;
    } else if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(inductionData.time)) {
      errors.time = "Invalid time format (use HH:MM)";
      isValid = false;
    }

    if (!inductionData.location.trim()) {
      errors.location = "Location is required";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
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
        <h3 className="mt-3">ADD NEW INDUCTION</h3>
      </Container>

      {/* Main Form Section */}
      <Container
        className={`p-4 rounded shadow ${
          darkMode ? "bg-secondary text-white" : "bg-white text-dark"
        } mb-5`}
      >
        <Row>
          <Col md={12}>
            <h4>Induction Details</h4>
            <Card
              className={darkMode ? "bg-dark text-white" : "bg-light text-dark"}
            >
              <Card.Body>
                <Form onSubmit={handleSubmit}>
                  {/* Form Fields */}
                  <Form.Group controlId="induction" className="mb-3">
                    <Form.Label>Induction Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter Induction Name"
                      name="induction"
                      value={inductionData.induction}
                      onChange={handleInputChange}
                      className={`form-control ${
                        darkMode
                          ? "bg-secondary text-white"
                          : "bg-white text-dark"
                      }`}
                      required
                    />
                  </Form.Group>

                  <Form.Group controlId="startDate" className="mb-3">
                    <Form.Label>Start Date</Form.Label>
                    <Form.Control
                      type="date"
                      name="startDate"
                      value={inductionData.startDate}
                      onChange={handleInputChange}
                      min={getMinDate()}
                      isInvalid={!!formErrors.startDate}
                      className={darkMode ? "bg-secondary text-white" : "bg-white text-dark"}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      {formErrors.startDate}
                    </Form.Control.Feedback>
                  </Form.Group>


                  <Form.Group controlId="time" className="mb-3">
                    <Form.Label>Start Time</Form.Label>
                    <Form.Control
                      type="time"
                      name="time"
                      value={inductionData.time}
                      onChange={handleInputChange}
                      isInvalid={!!formErrors.time}
                      className={darkMode ? "bg-secondary text-white" : "bg-white text-dark"}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      {formErrors.time}
                    </Form.Control.Feedback>
                  </Form.Group>


                  <Form.Group controlId="location" className="mb-3">
                    <Form.Label>Location</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter Induction Location"
                      name="location"
                      value={inductionData.location}
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
                    <Form.Label>Note (Optional)</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="note"
                      value={inductionData.note}
                      onChange={handleInputChange}
                      className={darkMode ? "bg-secondary text-white" : "bg-white text-dark"}
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
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <Spinner animation="border" size="sm" />
                      ) : (
                        "Create Induction"
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

AddNewInduction.propTypes = {
  darkMode: PropTypes.bool.isRequired,
};

export default AddNewInduction;
