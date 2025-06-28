import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Form, Alert, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import logo from "../../../assets/logo.png";
import PropTypes from "prop-types";
import { Doughnut, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const SchemeInfo = ({ darkMode }) => {
  const { schemeId } = useParams();
  const [schemeData, setSchemeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalAllocatedCount, setTotalAllocatedCount] = useState(0);
  const [totalEmptyCount, setTotalEmptyCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSchemeDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/schemes/${schemeId}`);
        setSchemeData(response.data);

        // Assuming the API returns these counts or we calculate them
        setTotalAllocatedCount(response.data.totalAllocatedCount || 0);
        setTotalEmptyCount(response.data.totalEmptyCount || 0);

        setLoading(false);
      } catch (err) {
        setError("Failed to load scheme details");
        setLoading(false);
      }
    };

    if (schemeId) {
      fetchSchemeDetails();
    }
  }, [schemeId]);

  // Half Donut chart configuration
  const donutChartData = {
    labels: ['Allocated', 'Empty'],
    datasets: [
      {
        data: [totalAllocatedCount, totalEmptyCount],
        backgroundColor: [
          'rgba(75, 192, 192, 0.8)',
          'rgba(255, 99, 132, 0.8)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const donutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: darkMode ? 'white' : 'black',
          font: {
            size: 14
          }
        },
      },
      title: {
        display: true,
        text: 'Allocation Status',
        color: darkMode ? 'white' : 'black',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        backgroundColor: darkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        titleColor: darkMode ? 'white' : 'black',
        bodyColor: darkMode ? 'white' : 'black',
        borderColor: darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
        borderWidth: 1
      }
    },
    cutout: '70%',
    rotation: -90,
    circumference: 180,
  };

  // Pie chart configuration
  const pieChartData = {
    labels: ['Allocated', 'Empty'],
    datasets: [
      {
        data: [totalAllocatedCount, totalEmptyCount],
        backgroundColor: [
          'rgba(75, 192, 192, 0.8)',
          'rgba(255, 99, 132, 0.8)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: darkMode ? 'white' : 'black',
          font: {
            size: 14
          }
        },
      },
      title: {
        display: true,
        text: 'Current Allocation',
        color: darkMode ? 'white' : 'black',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        backgroundColor: darkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        titleColor: darkMode ? 'white' : 'black',
        bodyColor: darkMode ? 'white' : 'black',
        borderColor: darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
        borderWidth: 1
      }
    },
  };

  // Calculate percentage values for labels
  const calculatePercentage = () => {
    const total = totalAllocatedCount + totalEmptyCount;
    if (total === 0) return { allocated: '0%', empty: '0%' };

    const allocatedPercentage = Math.round((totalAllocatedCount / total) * 100);
    const emptyPercentage = 100 - allocatedPercentage;

    return {
      allocated: `${allocatedPercentage}%`,
      empty: `${emptyPercentage}%`
    };
  };

  const percentages = calculatePercentage();

  return (
    <div className={`d-flex flex-column min-vh-100 ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>

      {/* Main Section */}
      <Container className={`p-4 rounded shadow ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"} mb-5`}>
        <h4>View Scheme Details</h4>

        <hr className={darkMode ? "border-light mt-3" : "border-dark mt-3"} />

        {/* Charts Section */}
        {!loading && !error && schemeData && (
          <Row className="mb-4">
            <Col md={6}>
              <Card className={`${darkMode ? "bg-dark text-white" : "bg-light text-dark"} h-100`}>
                <Card.Body>
                  <div style={{ height: '300px', position: 'relative' }}>
                    <Doughnut data={donutChartData} options={donutChartOptions} />
                    <div 
                      style={{ 
                        position: 'absolute', 
                        bottom: '40%', 
                        left: '0', 
                        right: '0',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <div style={{ fontSize: '14px', color: darkMode ? 'white' : 'black' }}>
                        Allocated
                      </div>
                      <div style={{ 
                        fontSize: '24px', 
                        fontWeight: 'bold', 
                        color: 'rgba(75, 192, 192, 1)'
                      }}>
                        {percentages.allocated}
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className={`${darkMode ? "bg-dark text-white" : "bg-light text-dark"} h-100`}>
                <Card.Body>
                  <div style={{ height: '300px', position: 'relative' }}>
                    <Pie data={pieChartData} options={pieChartOptions} />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        <Row>
          <Col md={12}>
            <Card className={darkMode ? "bg-dark text-white" : "bg-light text-dark"}>
              <Card.Body>
                {loading ? (
                  <div className="text-center">
                    <Spinner animation="border" size="lg" />
                    <p>Loading scheme details...</p>
                  </div>
                ) : error ? (
                  <Alert variant="danger">{error}</Alert>
                ) : (
                  <Form>
                    {/* Scheme Name */}
                    <Form.Group controlId="SchemenameLabel" className="mb-3">
                      <Form.Label>Scheme Name</Form.Label>
                      <Form.Control
                        type="text"
                        value={schemeData.schemeName}
                        readOnly
                        className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                      />
                    </Form.Group>

                    {/* Total Allocation */}
                    <Form.Group controlId="totalAllocation" className="mb-3">
                      <Form.Label>Total Allocation</Form.Label>
                      <Form.Control
                        type="number"
                        value={schemeData.totalAllocation}
                        readOnly
                        className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                      />
                    </Form.Group>

                    {/* Scheme Type: On Request, Recurring, Rotational */}
                    {["onRequest", "recurring", "rotational"].map((field) => (
                      <Form.Group key={field} controlId={field} className="mb-3">
                        <Form.Label className="font-semibold">
                          {field.charAt(0).toUpperCase() + field.slice(1)} {/* Capitalize first letter */}
                        </Form.Label>
                        <div className="d-flex gap-4">
                          <Form.Check
                            type="radio"
                            id={`${field}-yes`}
                            label="Yes"
                            name={field}
                            value="yes"
                            checked={schemeData[field] === "yes"}
                            readOnly
                          />
                          <Form.Check
                            type="radio"
                            id={`${field}-no`}
                            label="No"
                            name={field}
                            value="no"
                            checked={schemeData[field] === "no"}
                            readOnly
                          />
                        </div>
                      </Form.Group>
                    ))}

                    {/* Per Head Allowance */}
                    <Form.Group controlId="perHeadAllowance" className="mb-3">
                      <Form.Label>Per Head Allowance</Form.Label>
                      <Form.Control
                        type="number"
                        value={schemeData.perHeadAllowance}
                        readOnly
                        className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                      />
                    </Form.Group>

                    {/* Allowance Frequency */}
                    <Form.Group controlId="allowanceFrequency" className="mb-3">
                      <Form.Label>Allowance Frequency</Form.Label>
                      <Form.Control
                        type="text"
                        value={schemeData.allowanceFrequency}
                        readOnly
                        className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                      />
                    </Form.Group>

                    {/* Start Date */}
                    <Form.Group controlId="schemeStartDate" className="mb-3">
                      <Form.Label>Start Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={schemeData.schemeStartDate}
                        readOnly
                        className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                      />
                    </Form.Group>

                    {/* End Date */}
                    <Form.Group controlId="schemeEndDate" className="mb-3">
                      <Form.Label>End Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={schemeData.schemeEndDate}
                        readOnly
                        className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                      />
                    </Form.Group>

                    {/* Minimum Qualifications */}
                    <Form.Group controlId="minimumQualifications" className="mb-3">
                      <Form.Label>Minimum Qualifications</Form.Label>
                      <Form.Control
                        type="text"
                        value={schemeData.minimumQualifications}
                        readOnly
                        className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                      />
                    </Form.Group>

                    {/* Scheme Description */}
                    <Form.Group controlId="description" className="mb-3">
                      <Form.Label>Description</Form.Label>
                      <Form.Control
                        as="textarea"
                        value={schemeData.description}
                        readOnly
                        className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                        rows={4}
                      />
                    </Form.Group>

                    {/* Comment About the Edit */}
                    <Form.Group controlId="editComment" className="mb-3">
                      <Form.Label>Comment About the Edit</Form.Label>
                      <Form.Control
                        as="textarea"
                        value={schemeData.editComment || "Enter a comment about the changes"}
                        readOnly
                        className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                        rows={3}
                      />
                    </Form.Group>
                  </Form>
                )}

                {/* Go Back Button */}
                <div className="d-flex justify-content-between mt-3">
                  <Button variant="danger" onClick={() => navigate(-1)} disabled={loading}>
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

SchemeInfo.propTypes = {
  darkMode: PropTypes.bool.isRequired,
};

export default SchemeInfo;
