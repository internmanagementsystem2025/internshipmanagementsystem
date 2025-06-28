import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Form, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import logo from "../../../assets/logo.png";
import PropTypes from "prop-types";
import Notification from "../../../components/notifications/Notification";

const API_BASE_URL = "http://localhost:5000/api/schemes";

const EditScheme = ({ darkMode }) => {
  const [schemeData, setSchemeData] = useState({
    schemeName: "",
    totalAllocation: "",
    onRequest: "no",
    recurring: "no",
    rotational: "no",
    perHeadAllowance: "",
    allowanceFrequency: "",
    description: "",
    minimumQualifications: "",
    schemeStartDate: "",
    schemeEndDate: "",
  });

  const [editComment, setEditComment] = useState(""); // NEW: Edit comment field

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [showErrorNotification, setShowErrorNotification] = useState(false);

  const navigate = useNavigate();
  const { schemeId } = useParams();

  // Fetch scheme details
  useEffect(() => {
    const fetchSchemeDetails = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${API_BASE_URL}/${schemeId}`);
        const scheme = response.data;

        const formatDate = (dateString) => {
          return dateString ? new Date(dateString).toISOString().split('T')[0] : '';
        };

        setSchemeData({
          schemeName: scheme.schemeName || "",
          totalAllocation: scheme.totalAllocation || "",
          onRequest: scheme.onRequest || "no",
          recurring: scheme.recurring || "no",
          rotational: scheme.rotational || "no",
          perHeadAllowance: scheme.perHeadAllowance || "",
          allowanceFrequency: scheme.allowanceFrequency || "",
          description: scheme.description || "",
          minimumQualifications: scheme.minimumQualifications || "",
          schemeStartDate: formatDate(scheme.schemeStartDate),
          schemeEndDate: formatDate(scheme.schemeEndDate),
        });
      } catch (error) {
        setErrorMessage("Failed to fetch scheme details");
        setShowErrorNotification(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchemeDetails();
  }, [schemeId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSchemeData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    // ✅ Validate comment
    if (!editComment.trim()) {
      setErrorMessage("Please enter a comment before updating.");
      setShowErrorNotification(true);
      setTimeout(() => setShowErrorNotification(false), 3000);
      setIsSubmitting(false);
      return;
    }

    try {
      // Optional: include editComment in payload if backend supports it
      await axios.put(`${API_BASE_URL}/${schemeId}`, {
        ...schemeData,
        totalAllocation: Number(schemeData.totalAllocation),
        perHeadAllowance: Number(schemeData.perHeadAllowance),
        editComment: editComment.trim(), // Include only if backend accepts
      });

      setSuccessMessage("Scheme Updated Successfully!");
      setShowSuccessNotification(true);

      setTimeout(() => {
        setShowSuccessNotification(false);
        navigate("/view-all-scheme");
      }, 3000);

    } catch (error) {
      setErrorMessage(error.response?.data?.error || "An error occurred while updating the scheme.");
      setShowErrorNotification(true);
      setTimeout(() => setShowErrorNotification(false), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Container className="d-flex justify-content-center align-items-center min-vh-100">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <div className={`d-flex flex-column min-vh-100 ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
      <Container className="text-center mt-4 mb-3">
        <img src={logo} alt="Company Logo" className="mx-auto d-block" style={{ height: "50px" }} />
        <h3 className="mt-3">EDIT SCHEME</h3>
      </Container>

      <Container className={`p-4 rounded shadow ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"} mb-5`}>
        <Row>
          <Col md={12}>
            <h4>Scheme Details</h4>
            <hr className={darkMode ? "border-light mt-3" : "border-dark mt-3"} />

            <Card className={darkMode ? "bg-dark text-white" : "bg-light text-dark"}>
              <Card.Body>
                <Form onSubmit={handleSubmit}>
                  <Form.Group controlId="schemeName" className="mb-3">
                    <Form.Label>Scheme Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter Scheme Name"
                      name="schemeName"
                      value={schemeData.schemeName}
                      onChange={handleInputChange}
                      className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                      required
                    />
                  </Form.Group>

                  <Form.Group controlId="totalAllocation" className="mb-3">
                    <Form.Label>Total Allocation</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="Enter Total Allocation"
                      name="totalAllocation"
                      value={schemeData.totalAllocation}
                      onChange={handleInputChange}
                      className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                      required
                    />
                  </Form.Group>

                  {["onRequest", "recurring", "rotational"].map((field) => (
                    <Form.Group key={field} controlId={field} className="mb-3">
                      <Form.Label>{field.charAt(0).toUpperCase() + field.slice(1)}</Form.Label>
                      <div className="d-flex gap-4">
                        <Form.Check
                          type="radio"
                          label="Yes"
                          name={field}
                          value="yes"
                          checked={schemeData[field] === "yes"}
                          onChange={handleInputChange}
                        />
                        <Form.Check
                          type="radio"
                          label="No"
                          name={field}
                          value="no"
                          checked={schemeData[field] === "no"}
                          onChange={handleInputChange}
                        />
                      </div>
                    </Form.Group>
                  ))}

                  <Form.Group controlId="schemeStartDate" className="mb-3">
                    <Form.Label>Scheme Start Date</Form.Label>
                    <Form.Control
                      type="date"
                      name="schemeStartDate"
                      value={schemeData.schemeStartDate}
                      onChange={handleInputChange}
                      className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                      required
                    />
                  </Form.Group>

                  <Form.Group controlId="schemeEndDate" className="mb-3">
                    <Form.Label>Scheme End Date</Form.Label>
                    <Form.Control
                      type="date"
                      name="schemeEndDate"
                      value={schemeData.schemeEndDate}
                      onChange={handleInputChange}
                      className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                      required
                    />
                  </Form.Group>

                  <Form.Group controlId="perHeadAllowance" className="mb-3">
                    <Form.Label>Per Head Allowance</Form.Label>
                    <Form.Control
                      type="number"
                      name="perHeadAllowance"
                      value={schemeData.perHeadAllowance}
                      onChange={handleInputChange}
                      className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                      required
                    />
                  </Form.Group>

                  <Form.Group controlId="allowanceFrequency" className="mb-3">
                    <Form.Label>Allowance Frequency</Form.Label>
                    <Form.Control
                      as="select"
                      name="allowanceFrequency"
                      value={schemeData.allowanceFrequency}
                      onChange={handleInputChange}
                      className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                      required
                    >
                      <option value="">Select Frequency</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </Form.Control>
                  </Form.Group>

                  <Form.Group controlId="minimumQualifications" className="mb-3">
                    <Form.Label>Minimum Qualifications</Form.Label>
                    <Form.Control
                      type="text"
                      name="minimumQualifications"
                      value={schemeData.minimumQualifications}
                      onChange={handleInputChange}
                      className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                      required
                    />
                  </Form.Group>

                  <Form.Group controlId="description" className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      name="description"
                      value={schemeData.description}
                      onChange={handleInputChange}
                      className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                    />
                  </Form.Group>

                  {/* ✅ NEW: Edit Comment */}
                  <Form.Group controlId="editComment" className="mb-3">
                    <Form.Label>Comment about the Edit <span className="text-danger"></span></Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder="Enter a comment about the changes"
                      value={editComment}
                      onChange={(e) => setEditComment(e.target.value)}
                      className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                      required
                    />
                  </Form.Group>

                  <div className="d-flex justify-content-between mt-3">
                    <Button variant="danger" onClick={() => navigate(-1)} disabled={isSubmitting}>
                      Go Back
                    </Button>
                    <Button type="submit" variant="primary" disabled={isSubmitting}>
                      {isSubmitting ? <Spinner animation="border" size="sm" /> : "Update Scheme"}
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

EditScheme.propTypes = {
  darkMode: PropTypes.bool.isRequired,
};

export default EditScheme;
