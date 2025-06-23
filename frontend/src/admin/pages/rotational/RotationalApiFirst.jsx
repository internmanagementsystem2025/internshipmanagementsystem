import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Button, Badge, Row, Col, Form, Modal, ProgressBar } from 'react-bootstrap';
import axios from 'axios';

// Enhanced StatsCircle component with styling from ViewRotationalStation.jsx
const StatsCircle = ({ title, value, total, percentage, color, darkMode }) => {
  // Calculate the percentage if not provided
  const calculatedPercentage = percentage || Math.round((value / total) * 100) || 0;
  const strokeDasharray = `${calculatedPercentage * 2.512}, 251.2`; // 251.2 is approx 2π × 40 (circumference)
  
  // Background color based on dark mode
  const bgColor = darkMode ? "#444" : "#e6e6e6";
  
  return (
    <div className="text-center mb-4">
      <div style={{ 
        position: "relative", 
        width: "150px", 
        height: "150px", 
        margin: "0 auto",
        filter: "drop-shadow(0px 4px 8px rgba(0,0,0,0.2))"
      }}>
        <svg width="150" height="150" viewBox="0 0 100 100">
          {/* Background Circle */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke={bgColor}
            strokeWidth="14"
            opacity="0.2"
          />
          {/* Foreground Circle - The progress indicator */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke={color || "#28a745"} // Default to success green if no color provided
            strokeWidth="14"
            strokeDasharray={strokeDasharray}
            strokeDashoffset="0"
            transform="rotate(-90 50 50)" // Rotate to start from the top
            strokeLinecap="round" // Rounded ends for a nicer look
            style={{
              filter: "drop-shadow(0px 0px 4px rgba(0,0,0,0.3))"
            }}
          />
        </svg>
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          fontSize: "1.75rem",
          fontWeight: "bold",
          textShadow: "1px 1px 3px rgba(0,0,0,0.2)"
        }}>
          {calculatedPercentage}%
        </div>
      </div>
      <h5 className="mt-3 fw-bold">{title}</h5>
      <div className="text-muted fs-6 fw-semibold">{value} of {total}</div>
    </div>
  );
};

const RotationalApiFirst = ({ darkMode }) => {
  const [allCVs, setAllCVs] = useState([]);
  const [pendingCVs, setPendingCVs] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [selectedCVs, setSelectedCVs] = useState([]);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [stationAssignments, setStationAssignments] = useState([
    {
      stationId: '',
      startDate: '',
      endDate: ''
    }
  ]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [assignmentHistory, setAssignmentHistory] = useState([]);
  const [selectedCVForHistory, setSelectedCVForHistory] = useState(null);

  // Fetch data on component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  // Update the fetchAllData function to include stations
  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [allResponse, pendingResponse, analyticsResponse, stationsResponse] = await Promise.all([
        axios.get('http://localhost:5000/api/rotational/all-rotational'),
        axios.get('http://localhost:5000/api/rotational/pending-rotational'),
        axios.get('http://localhost:5000/api/rotational/analytics'),
        axios.get('http://localhost:5000/api/rotational/stations')
      ]);

      setAllCVs(allResponse.data);
      setPendingCVs(pendingResponse.data);
      setAnalytics(analyticsResponse.data);
      setStations(stationsResponse.data.data); // Access the data array from the response
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCVSelect = (cvId) => {
    setSelectedCVs(prev => {
      if (prev.includes(cvId)) {
        return prev.filter(id => id !== cvId);
      }
      return [...prev, cvId];
    });
  };

  // Function to handle opening the assignment modal
  const handleOpenAssignModal = () => {
    setShowAssignModal(true);
  };

  // Function to add another station assignment
  const handleAddStation = () => {
    setStationAssignments([
      ...stationAssignments,
      {
        stationId: '',
        startDate: '',
        endDate: ''
      }
    ]);
  };

  // Function to update station assignment details
  const handleStationAssignmentChange = (index, field, value) => {
    const updatedAssignments = [...stationAssignments];
    updatedAssignments[index][field] = value;
    setStationAssignments(updatedAssignments);
  };

  // Updated assignment function
  const handleAssignToStations = async () => {
    try {
      // Validate all assignments have required fields
      const isValid = stationAssignments.every(assignment => 
        assignment.stationId && assignment.startDate && assignment.endDate
      );

      if (!isValid) {
        alert('Please fill all station assignment details');
        return;
      }

      // Format the stations array with all assignments
      const formattedStations = stationAssignments.map(assignment => ({
        stationId: assignment.stationId,
        startDate: assignment.startDate,
        endDate: assignment.endDate
      }));

      const response = await axios.post(
        'http://localhost:5000/api/rotational/assign-to-multiple-stations',
        {
          cvIds: selectedCVs,
          stations: formattedStations // Send all station assignments
        }
      );

      if (response.data.successfulAssignments.length > 0) {
        alert(`Successfully assigned ${response.data.successfulAssignments.length} CVs to ${formattedStations.length} stations`);
        setShowAssignModal(false);
        // Reset the station assignments
        setStationAssignments([{ stationId: '', startDate: '', endDate: '' }]);
        setSelectedCVs([]); // Clear selected CVs
        fetchAllData(); // Refresh the data
      }
    } catch (error) {
      console.error('Assignment error:', error);
      alert('Error assigning stations: ' + (error.response?.data?.error || error.message));
    }
  };

  // Add a function to remove a station assignment
  const handleRemoveStation = (index) => {
    if (stationAssignments.length > 1) {
      setStationAssignments(prev => prev.filter((_, i) => i !== index));
    }
  };

  // Add this new component for the assignment modal
  const AssignmentModal = () => (
    <Modal show={showAssignModal} onHide={() => setShowAssignModal(false)} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Assign Stations to Selected CVs</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="mb-3">
          <strong>Selected CVs: </strong> 
          {selectedCVs.length} CVs selected
        </div>
        
        {stationAssignments.map((assignment, index) => (
          <Card key={index} className="mb-3">
            <Card.Body>
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Select Station</Form.Label>
                    <Form.Select
                      value={assignment.stationId}
                      onChange={(e) => handleStationAssignmentChange(index, 'stationId', e.target.value)}
                    >
                      <option value="">Choose station...</option>
                      {stations.map(station => (
                        <option key={station._id} value={station._id}>
                          {station.stationName} ({station.availableSeats} seats available, {station.timePeriod} weeks)
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Start Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={assignment.startDate}
                      onChange={(e) => handleStationAssignmentChange(index, 'startDate', e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>End Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={assignment.endDate}
                      onChange={(e) => handleStationAssignmentChange(index, 'endDate', e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        ))}
        
        <Button variant="secondary" onClick={handleAddStation} className="mb-3">
          Add Another Station
        </Button>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowAssignModal(false)}>
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={handleAssignToStations}
          disabled={stationAssignments.some(assignment => 
            !assignment.stationId || !assignment.startDate || !assignment.endDate
          )}
        >
          Assign Stations
        </Button>
      </Modal.Footer>
    </Modal>
  );

  const handleViewHistory = async (cvId) => {
    try {
      setSelectedCVForHistory(cvId);
      setShowHistoryModal(true);
      const response = await axios.get(`http://localhost:5000/api/rotational/assignment-history/${cvId}`);
      const currentDate = new Date();

      // Categorize stations based on current date
      const categorizedHistory = response.data.map(assignment => {
        const startDate = new Date(assignment.startDate);
        const endDate = new Date(assignment.endDate);

        if (currentDate >= startDate && currentDate <= endDate) {
          return { ...assignment, status: 'Currently Working' };
        } else if (currentDate > endDate) {
          return { ...assignment, status: 'Completed' };
        } else if (currentDate < startDate) {
          return { ...assignment, status: 'Upcoming' };
        }
        return assignment;
      });

      setAssignmentHistory(categorizedHistory);
    } catch (error) {
      console.error('Error fetching assignment history:', error);
      alert('Failed to fetch assignment history');
    }
  };

  const HistoryModal = () => (
    <Modal show={showHistoryModal} onHide={() => setShowHistoryModal(false)} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Assignment History</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {assignmentHistory.length > 0 ? (
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Station Name</th>
                <th>Time Period (weeks)</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {assignmentHistory.map((assignment, index) => (
                <tr key={index}>
                  <td>{assignment.station?.stationName || 'Unknown'}</td>
                  <td>{assignment.station?.timePeriod || 'N/A'}</td>
                  <td>{new Date(assignment.startDate).toLocaleDateString()}</td>
                  <td>{new Date(assignment.endDate).toLocaleDateString()}</td>
                  <td>
                    <Badge bg={
                      assignment.status === 'Currently Working' ? 'success' :
                      assignment.status === 'Completed' ? 'secondary' :
                      'warning'
                    }>
                      {assignment.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <div>No assignment history available for this CV.</div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowHistoryModal(false)}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );

  // Function to determine color based on utilization percentage with more vibrant colors
  const getUtilizationColor = (percentage) => {
    if (percentage >= 80) return "#dc3545"; // A more vibrant danger red
    if (percentage >= 50) return "#ff9800"; // A more vibrant warning orange
    return "#00acc1"; // A more vibrant info teal
  };

  // Function to get status text based on utilization
  const getUtilizationStatus = (percentage) => {
    if (percentage >= 80) return "High Utilization";
    if (percentage >= 50) return "Medium Utilization";
    return "Low Utilization";
  };

  return (
    <Container className="py-4">
      {loading ? (
        <div className="text-center p-5">
          <div className="spinner-border text-primary" role="status" style={{ width: "3rem", height: "3rem" }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 fs-5">Loading data...</p>
        </div>
      ) : (
        <>
          {/* Analytics Section with improved styling */}
          <Card className={`mb-4 shadow ${darkMode ? 'bg-dark text-white' : ''}`}>
            <Card.Header as="h5" className={`py-3 ${darkMode ? 'bg-secondary' : 'bg-primary text-white'}`}>
              Station Analytics
            </Card.Header>
            <Card.Body className="p-4">
              <Row className="g-4">
                {analytics.map(station => (
                  <Col lg={4} md={6} key={station.stationId} className="mb-4">
                    <Card className={`h-100 shadow ${darkMode ? 'bg-dark text-white border-secondary' : 'border-0'}`}>
                      <Card.Header className={`text-center py-3 ${darkMode ? 'bg-secondary' : 'bg-light'}`}>
                        <h5 className="fw-bold mb-0">{station.stationName}</h5>
                      </Card.Header>
                      <Card.Body className="text-center p-4">
                        {/* Enhanced StatsCircle component */}
                        <StatsCircle 
                          title={getUtilizationStatus(station.utilizationPercentage)} 
                          value={station.assignedCVs} 
                          total={station.maxStudents || station.assignedCVs + station.availableSeats} 
                          percentage={station.utilizationPercentage} 
                          color={getUtilizationColor(station.utilizationPercentage)}
                          darkMode={darkMode}
                        />
                        
                        <div className="mt-4 px-3">
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <span className="fs-6 fw-semibold">Assigned CVs:</span>
                            <Badge bg="primary" pill className="px-3 py-2 fs-6">{station.assignedCVs}</Badge>
                          </div>
                          <div className="d-flex justify-content-between align-items-center mb-4">
                            <span className="fs-6 fw-semibold">Available Seats:</span>
                            <Badge bg="success" pill className="px-3 py-2 fs-6">{station.availableSeats}</Badge>
                          </div>
                          
                          {/* Progress bar with improved styling */}
                          <div className="mt-3">
                            <ProgressBar 
                              now={station.utilizationPercentage} 
                              variant={
                                station.utilizationPercentage >= 80 ? "danger" : 
                                station.utilizationPercentage >= 50 ? "warning" : "info"
                              }
                              style={{ height: "10px", borderRadius: "5px" }}
                              className="mb-2"
                            />
                            <div className="d-flex justify-content-between mt-2 px-2">
                              <small className={`${darkMode ? "text-light" : "text-muted"}`}>0%</small>
                              <small className={`${darkMode ? "text-light" : "text-muted"} fw-semibold`}>Utilization</small>
                              <small className={`${darkMode ? "text-light" : "text-muted"}`}>100%</small>
                            </div>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>

          {/* Add the modal components */}
          <AssignmentModal />
          <HistoryModal />
        </>
      )}
      <style jsx="true">{`
        .shadow {
          box-shadow: 0 .5rem 1rem rgba(0,0,0,.15)!important;
        }
        .border-0 {
          border: none!important;
        }
      `}</style>
    </Container>
  );
};

export default RotationalApiFirst;