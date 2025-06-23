import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Button, Badge, Row, Col, Form, Modal } from 'react-bootstrap';
import axios from 'axios';

const RotationalApiFirst = () => {
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

  return (
    <Container className="py-4">
      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <>
          {/* Analytics Section */}
          <Card className="mb-4">
            <Card.Header as="h5">Station Analytics</Card.Header>
            <Card.Body>
              <Row>
                {analytics.map(station => (
                  <Col md={4} key={station.stationId} className="mb-3">
                    <Card>
                      <Card.Body>
                        <Card.Title>{station.stationName}</Card.Title>
                        <Card.Text>
                          Assigned CVs: {station.assignedCVs}<br />
                          Available Seats: {station.availableSeats}<br />
                          Utilization: {station.utilizationPercentage}%
                        </Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>

          {/* Pending CVs Section */}
          <Card className="mb-4">
            <Card.Header as="h5">
              Pending CVs
              <Button 
                variant="primary" 
                size="sm" 
                className="float-end"
                disabled={selectedCVs.length === 0}
                onClick={handleOpenAssignModal}
              >
                Assign Selected CVs
              </Button>
            </Card.Header>
            <Card.Body>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Select</th>
                    <th>Name</th>
                    <th>Reference No</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingCVs.map(cv => (
                    <tr key={cv._id}>
                      <td>
                        <Form.Check
                          type="checkbox"
                          checked={selectedCVs.includes(cv._id)}
                          onChange={() => handleCVSelect(cv._id)}
                        />
                      </td>
                      <td>{cv.fullName}</td>
                      <td>{cv.refNo}</td>
                      <td>
                        <Badge bg="warning">
                          {cv.rotationalAssignment?.status || 'Pending'}
                        </Badge>
                      </td>
                      <td>
                        <Button 
                          variant="info" 
                          size="sm" 
                          onClick={() => handleViewHistory(cv._id)}
                        >
                          View History
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>

          {/* All Rotational CVs Section */}
          <Card>
            <Card.Header as="h5">All Rotational CVs</Card.Header>
            <Card.Body>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Reference No</th>
                    <th>Current Station</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allCVs.map(cv => (
                    <tr key={cv._id}>
                      <td>{cv.fullName}</td>
                      <td>{cv.refNo}</td>
                      <td>
                        {cv.rotationalAssignment?.assignedStations?.find(
                          station => station.isCurrent
                        )?.station?.stationName || 'Not Assigned'}
                      </td>
                      <td>
                        <Badge bg={
                          cv.rotationalAssignment?.status === 'station-assigned' 
                            ? 'success' 
                            : 'warning'
                        }>
                          {cv.rotationalAssignment?.status || 'Pending'}
                        </Badge>
                      </td>
                      <td>
                        <Button 
                          variant="info" 
                          size="sm" 
                          onClick={() => handleViewHistory(cv._id)}
                        >
                          View History
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>

          {/* Add the modal components */}
          <AssignmentModal />
          <HistoryModal />
        </>
      )}
    </Container>
  );
};

export default RotationalApiFirst;