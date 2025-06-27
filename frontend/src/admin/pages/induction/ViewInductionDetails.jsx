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
import logo from "../../../assets/logo.png";
import PropTypes from "prop-types";

const API_BASE_URL = `${import.meta.env.VITE_BASE_URL}/api/inductions`;

const ViewInductionDetails = ({ darkMode }) => {
  const { id } = useParams();
  const [inductionData, setInductionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInduction = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/${id}`);
        setInductionData(response.data);
      } catch (err) {
        setError(
          err.response?.data?.error || "Failed to load induction details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchInduction();
  }, [id]);

  return (
    <div
      className={`d-flex flex-column min-vh-100 ${
        darkMode ? "bg-dark text-white" : "bg-light text-dark"
      }`}
    >
      {/* Main Section */}
      <Container className={`p-4 rounded shadow ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"} mb-5`}>
        <h4>View Induction Details</h4>

        <hr className={darkMode ? "border-light mt-3" : "border-dark mt-3"} />

        {/* Loading State */}
        {loading && (
          <div className="text-center py-5">
            <Spinner animation="border" size="lg" />
            <p className="mt-3">Loading induction details...</p>
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
        {!loading && !error && inductionData && (
          <Row>
            <Col md={12}>
              <Card
                className={darkMode ? "bg-dark text-white" : "bg-light text-dark"}
              >
                <Card.Body>
                  <Form>
                    {/* Induction Label */}
                    <Form.Group controlId="inductionLabel" className="mb-3">
                      <Form.Label>Induction Name</Form.Label>
                      <Form.Control
                        type="text"
                        value={inductionData.induction || ""}
                        readOnly
                        className={`form-control ${
                          darkMode
                            ? "bg-secondary text-white"
                            : "bg-white text-dark"
                        }`}
                      />
                    </Form.Group>

                    {/* Start Date */}
                    <Form.Group controlId="startDate" className="mb-3">
                      <Form.Label>Start Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={inductionData.startDate || ""}
                        readOnly
                        className={`form-control ${
                          darkMode
                            ? "bg-secondary text-white"
                            : "bg-white text-dark"
                        }`}
                      />
                    </Form.Group>

                    {/* Time */}
                    <Form.Group controlId="time" className="mb-3">
                      <Form.Label>Time</Form.Label>
                      <Form.Control
                        type="time"
                        value={inductionData.time || ""}
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
                        value={inductionData.location || ""}
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
                        type="text"
                        value={inductionData.note || ""}
                        readOnly
                        className={`form-control ${
                          darkMode
                            ? "bg-secondary text-white"
                            : "bg-white text-dark"
                        }`}
                      />
                    </Form.Group>
                  </Form>

                  {/* Go Back Button */}
                  <div className="d-flex justify-content-between mt-3">
                    <Button
                      variant="danger"
                      onClick={() => navigate(-1)}
                      disabled={loading}
                    >
                      Go Back
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}
      </Container>
    </div>
  );
};

ViewInductionDetails.propTypes = {
  darkMode: PropTypes.bool.isRequired,
};

export default ViewInductionDetails;