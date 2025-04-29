import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Container, Row, Col, Card, Button, Form, Alert, Spinner } from "react-bootstrap";
import { PersonPlus, ExclamationCircle } from "react-bootstrap-icons";
import AssignNewManagerModal from "./AssignNewManagerModal";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

export const SchemeManagers = ({ darkMode = false }) => {
  const [scheme, setScheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { schemeId } = useParams();
  const navigate = useNavigate();

  const fetchSchemeDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/schemes/${schemeId}`);
      setScheme(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching scheme:", err);
      setError("Failed to load scheme details: " + (err.response?.data?.error || err.message));
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemeDetails();
  }, [schemeId]);

  const handleAssignManager = async (managerData) => {
    try {
      setLoading(true);
      setError(null);

      const { generalManager, deputyManager, supervisor } = managerData;

      const assignManagerData = {
        generalManager: generalManager.name || null,
        deputyManager: deputyManager.name || null,
        supervisor: supervisor.name || null,
        generalManagerAllocation: generalManager.allocationCount || 0,
        deputyManagerAllocation: deputyManager.allocationCount || 0,
        supervisorAllocation: supervisor.allocationCount || 0,
      };

      console.log("Sending manager data:", assignManagerData);

      const assignResponse = await axios.put(
        `http://localhost:5000/api/schemes/${schemeId}/assign-managers`,
        assignManagerData
      );
      console.log("Assign managers response:", assignResponse.data);

      try {
        const recalcResponse = await axios.post(`http://localhost:5000/api/schemes/${schemeId}/recalculate`);
        console.log("Recalculate response:", recalcResponse.data);
      } catch (recalcError) {
        console.error("Recalculation error:", recalcError);
      }

      // Fetch updated scheme data
      await fetchSchemeDetails();

      // Close the modal
      setIsModalOpen(false);
      setLoading(false);
    } catch (err) {
      console.error("Error assigning managers:", err);
      setError("Failed to assign managers: " + (err.response?.data?.error || err.message));
      setLoading(false);
    }
  };

  // Chart Data for Available Allocation and Assigned Interns
  const chartData = (roleData) => ({
    labels: ["Available Allocation", "Assigned Interns"],
    datasets: [
      {
        label: "Count",
        data: [roleData?.availableAllocation || 0, roleData?.assignedCount || 0],
        backgroundColor: ["rgba(255, 99, 132, 1)", "rgba(75, 192, 192, 1)"],
        borderColor: ["rgba(255, 99, 132, 1)", "rgba(75, 192, 192, 1)"],
        borderWidth: 1,
      },
    ],
  });

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: darkMode ? "white" : "black",
          font: {
            size: 14,
          },
        },
      },
      tooltip: {
        backgroundColor: darkMode ? "rgba(0, 0, 0, 0.8)" : "rgba(255, 255, 255, 0.8)",
        titleColor: darkMode ? "white" : "black",
        bodyColor: darkMode ? "white" : "black",
        borderColor: darkMode ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)",
        borderWidth: 1,
      },
    },
    cutout: "70%",
  };

  // Loading State
  if (loading)
    return (
      <div className={`d-flex flex-column min-vh-100 ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
        <Container className="text-center mt-5">
          <Spinner animation="border" size="lg" />
          <p className="mt-2">Loading scheme details...</p>
        </Container>
      </div>
    );

  // Error State
  if (error)
    return (
      <div className={`d-flex flex-column min-vh-100 ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
        <Container className="mt-5">
          <Alert variant="danger">
            <ExclamationCircle className="me-2" />
            {error}
          </Alert>
          <Button
            variant={darkMode ? "outline-light" : "primary"}
            onClick={() => {
              setError(null);
              fetchSchemeDetails();
            }}
          >
            Try Again
          </Button>
        </Container>
      </div>
    );

  // No Scheme Found State
  if (!scheme)
    return (
      <div className={`d-flex flex-column min-vh-100 ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
        <Container className="mt-5">
          <Alert variant="warning">
            <ExclamationCircle className="me-2" />
            No scheme found with this ID.
          </Alert>
          <Button
            variant={darkMode ? "outline-light" : "primary"}
            onClick={() => navigate("/schemes")}
          >
            Back to Schemes
          </Button>
        </Container>
      </div>
    );
    const supervisorHierarchy = scheme.supervisor?.allocationCount || 0;
    const deputyManagerHierarchy = (scheme.deputyManager?.allocationCount || 0) + supervisorHierarchy;
    const generalManagerHierarchy = (scheme.generalManager?.allocationCount || 0) + deputyManagerHierarchy;

  return (
    <div className={`d-flex flex-column min-vh-100 ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
      <Container className={`p-4 rounded shadow ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"} mb-5`}>
        <h4>Scheme Manager's Details</h4>
        <hr className={darkMode ? "border-light mt-3" : "border-dark mt-3"} />

        <Row className="mb-4 justify-content-end">
           <Col xs="auto">
                <Button
                 variant={darkMode ? "outline-light" : "primary"}
                 onClick={() => setIsModalOpen(true)}
                 >
                 <PersonPlus className="me-2" /> Assign New Manager
                </Button>
            </Col>
        </Row>

        <Row className="mb-4">
          <Col md={12}>
            <Card className={darkMode ? "bg-dark text-white" : "bg-light text-dark"}>
              <Card.Body>
                <Form>
                  {/* Scheme Name */}
                  <Form.Group controlId="schemeName" className="mb-3">
                    <Form.Label>Scheme Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={scheme.schemeName}
                      readOnly
                      className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                    />
                  </Form.Group>

                  {/* Total Allocation */}
                  <Form.Group controlId="totalAllocation" className="mb-3">
                    <Form.Label>Total Allocation</Form.Label>
                    <Form.Control
                      type="number"
                      value={scheme.totalAllocation}
                      readOnly
                      className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                    />
                  </Form.Group>

                  {/* Available Positions */}
                  <Form.Group controlId="totalEmptyCount" className="mb-3">
                    <Form.Label>Available Positions</Form.Label>
                    <Form.Control
                      type="number"
                      value={scheme.totalEmptyCount}
                      readOnly
                      className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                    />
                  </Form.Group>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="mb-4">
          {[
            {
              role: "General Manager",
              data: scheme.generalManager,
              variant: darkMode ? "dark" : "danger",
              hierarchy: generalManagerHierarchy,
            },
            {
              role: "Deputy Manager",
              data: scheme.deputyManager,
              variant: darkMode ? "dark" : "primary",
              hierarchy: deputyManagerHierarchy,
            },
            {
              role: "Supervisor",
              data: scheme.supervisor,
              variant: darkMode ? "dark" : "success",
              hierarchy: supervisorHierarchy,
            },
          ].map(({ role, data, variant, hierarchy }, index) => (
            <Col key={index} md={4}>
              <Card className={`${darkMode ? "bg-dark text-white" : "bg-light text-dark"} h-100`}>
                <Card.Header className={`bg-${variant} text-white`}>{role}</Card.Header>
                <Card.Body>
                  <Card.Text>
                    <strong>Name:</strong> {data?.name || "Not Assigned"}
                  </Card.Text>
                  <Card.Text>
                    <strong>Total Allocation:</strong> {data?.allocationCount || "Not Assigned"}
                  </Card.Text>
                  <Card.Text>
                    <strong>Hierarchy Allocation:</strong> {hierarchy}
                  </Card.Text>
                  {/* Donut Chart */}
                  <div style={{ height: "200px", position: "relative" }}>
                    <Doughnut data={chartData(data)} options={chartOptions} />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
          <div className="d-flex justify-content-between mt-3">
             <Button variant="danger" onClick={() => navigate(-1)} disabled={loading}>
                Go Back
             </Button>
          </div>
      </Container>

      {/* Assign New Manager Modal */}
      <AssignNewManagerModal
        show={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAssignManager={handleAssignManager}
        scheme={scheme}
        darkMode={darkMode}
      />
    </div>
  );
};