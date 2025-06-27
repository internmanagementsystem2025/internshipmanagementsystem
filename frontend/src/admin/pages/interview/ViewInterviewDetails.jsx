import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Alert,
  Spinner,
} from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import PropTypes from "prop-types";

const API_BASE_URL = `${import.meta.env.VITE_BASE_URL}/api/interviews`;

const ViewInterviewDetails = ({ darkMode, interviewId }) => {
  const { id } = useParams();
  const actualId = interviewId || id;
  const [interviewData, setInterviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/${id}`);
        setInterviewData(response.data);
      } catch (err) {
        setError(
          err.response?.data?.error || "Failed to load interview details."
        );
      } finally {
        setLoading(false);
      }
    };

    if (actualId) {
      fetchInterview();
    }
  }, [actualId]);

  return (
    <Container className={`p-4 rounded shadow ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"} mb-5`}>
      <h4>View Interview Details</h4>

      <hr className={darkMode ? "border-light mt-3" : "border-dark mt-3"} />

      {/* Loading State */}
      {loading && (
        <div className="text-center py-5">
          <Spinner animation="border" size="lg" />
          <p className="mt-3">Loading interview details...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <Alert variant="danger" className="mb-4">
          <Alert.Heading>Error</Alert.Heading>
          {error}
        </Alert>
      )}

      {/* Success State - Show content only when data is loaded */}
      {!loading && !error && interviewData && (
        <Row>
          <Col md={12}>
            <Card
              className={darkMode ? "bg-dark text-white" : "bg-light text-dark"}
            >
              <Card.Body>
                <Form>
                  {/* Interview Name */}
                  <Form.Group controlId="interviewName" className="mb-3">
                    <Form.Label>Interview Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={interviewData.interviewName || ""}
                      readOnly
                      className={`form-control ${
                        darkMode
                          ? "bg-secondary text-white"
                          : "bg-white text-dark"
                      }`}
                    />
                  </Form.Group>

                  {/* Interview Date */}
                  <Form.Group controlId="interviewDate" className="mb-3">
                    <Form.Label>Interview Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={interviewData.interviewDate || ""}
                      readOnly
                      className={`form-control ${
                        darkMode
                          ? "bg-secondary text-white"
                          : "bg-white text-dark"
                      }`}
                    />
                  </Form.Group>

                  {/* Interview Time */}
                  <Form.Group controlId="interviewTime" className="mb-3">
                    <Form.Label>Interview Time</Form.Label>
                    <Form.Control
                      type="time"
                      value={interviewData.interviewTime || ""}
                      readOnly
                      className={`form-control ${
                        darkMode
                          ? "bg-secondary text-white"
                          : "bg-white text-dark"
                      }`}
                    />
                  </Form.Group>

                  {/* Location */}
                  <Form.Group controlId="location" className="mb-3">
                    <Form.Label>Location</Form.Label>
                    <Form.Control
                      type="text"
                      value={interviewData.location || ""}
                      readOnly
                      className={`form-control ${
                        darkMode
                          ? "bg-secondary text-white"
                          : "bg-white text-dark"
                      }`}
                    />
                  </Form.Group>

                  {/* Note */}
                  <Form.Group controlId="note" className="mb-3">
                    <Form.Label>Note</Form.Label>
                    <Form.Control
                      as="textarea"
                      value={interviewData.note || "No additional notes"}
                      readOnly
                      rows={3}
                      className={`form-control ${
                        darkMode
                          ? "bg-secondary text-white"
                          : "bg-white text-dark"
                      }`}
                    />
                  </Form.Group>
                </Form>

                {/* Go Back Button - only show if not used as a tab */}
                {!interviewId && (
                  <div className="d-flex justify-content-between mt-3">
                    <Button
                      variant="danger"
                      onClick={() => navigate(-1)}
                      disabled={loading}
                    >
                      Go Back
                    </Button>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

ViewInterviewDetails.propTypes = {
  darkMode: PropTypes.bool.isRequired,
  interviewId: PropTypes.string,
};

export default ViewInterviewDetails;
