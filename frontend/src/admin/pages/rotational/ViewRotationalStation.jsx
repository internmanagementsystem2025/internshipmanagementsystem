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

const API_BASE_URL = import.meta.env.VITE_BASE_URL;

const ViewRotationalStation = ({ darkMode }) => {
  const { id } = useParams();
  const [stationData, setStationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStation = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/stations/get-station/${id}`
        );
        setStationData(response.data);
      } catch (err) {
        setError(
          err.response?.data?.error || "Failed to load station details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStation();
  }, [id]);

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
        <h3 className="mt-3">VIEW STATION DETAILS</h3>
      </Container>

      {/* Main Section */}
      <Container
        className={`p-4 rounded shadow ${
          darkMode ? "bg-secondary text-white" : "bg-white text-dark"
        } mb-5`}
      >
        <Row>
          <Col md={12}>
            <Card
              className={darkMode ? "bg-dark text-white" : "bg-light text-dark"}
            >
              <Card.Body>
                {loading ? (
                  <div className="text-center">
                    <Spinner animation="border" size="lg" />
                    <p>Loading station details...</p>
                  </div>
                ) : error ? (
                  <Alert variant="danger">{error}</Alert>
                ) : (
                  <Form>
                    {/* Station Name */}
                    <Form.Group controlId="stationNameLabel" className="mb-3">
                      <Form.Label>Station Name</Form.Label>
                      <Form.Control
                        type="text"
                        value={stationData.stationName}
                        readOnly
                        className={`form-control ${
                          darkMode
                            ? "bg-secondary text-white"
                            : "bg-white text-dark"
                        }`}
                      />
                    </Form.Group>

                    {/* Display Name */}

                    <Form.Group controlId="displayName" className="mb-3">
                      <Form.Label>Display Name</Form.Label>
                      <Form.Control
                        type="text"
                        value={stationData.displayName}
                        readOnly
                        className={`form-control ${
                          darkMode
                            ? "bg-secondary text-white"
                            : "bg-white text-dark"
                        }`}
                      />
                    </Form.Group>
                    {/* Priority */}
                    <Form.Group controlId="priority" className="mb-3">
                      <Form.Label>Priority</Form.Label>
                      <Form.Control
                        type="text"
                        value={stationData.priority}
                        readOnly
                        className={`form-control ${
                          darkMode
                            ? "bg-secondary text-white"
                            : "bg-white text-dark"
                        }`}
                      />
                    </Form.Group>

                    {/* Maximum Students */}
                    <Form.Group controlId="maxStudents" className="mb-3">
                      <Form.Label>Maximum Students</Form.Label>
                      <Form.Control
                        type="number"
                        value={stationData.maxStudents}
                        readOnly
                        className={`form-control ${
                          darkMode
                            ? "bg-secondary text-white"
                            : "bg-white text-dark"
                        }`}
                      />
                    </Form.Group>

                    {/* Active Status */}
                    <Form.Group controlId="activeStatus" className="mb-3">
                      <Form.Label>Active Status</Form.Label>
                      <Form.Control
                        type="text"
                        value={stationData.activeStatus}
                        readOnly
                        className={`form-control ${
                          darkMode
                            ? "bg-secondary text-white"
                            : "bg-white text-dark"
                        }`}
                      />
                    </Form.Group>
                  </Form>
                )}

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
      </Container>
    </div>
  );
};

ViewRotationalStation.propTypes = {
  darkMode: PropTypes.bool.isRequired,
};

export default ViewRotationalStation;
