import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Table, Alert, Row, Col } from 'react-bootstrap';
import axios from 'axios';

const InstituteRotational = () => {
  // State management
  const [students, setStudents] = useState([]);
  const [stations, setStations] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [newStation, setNewStation] = useState({
    stationName: '',
    maxCapacity: '',
    duration: ''
  });
  const [rotationStudent, setRotationStudent] = useState('');
  const [selectedStations, setSelectedStations] = useState([]);
  const [progress, setProgress] = useState(null);

  // Fetch students and stations on component mount
  useEffect(() => {
    fetchStudents();
    fetchStations();
  }, []);

  // Fetch all students
  const fetchStudents = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/rotation/students');
      setStudents(response.data);
    } catch (error) {
      showMessage('error', 'Failed to fetch students');
    }
  };

  // Fetch all stations
  const fetchStations = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/rotation/stations');
      setStations(response.data);
    } catch (error) {
      showMessage('error', 'Failed to fetch stations');
    }
  };

  // Show message helper
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  // Handle station creation
  const handleCreateStation = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/rotation/stations', newStation);
      showMessage('success', 'Station created successfully');
      fetchStations();
      setNewStation({ stationName: '', maxCapacity: '', duration: '' });
    } catch (error) {
      showMessage('error', 'Failed to create station');
    }
  };

  // Handle setting dates
  const handleSetDates = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/rotation/student/${selectedStudent}/dates`, {
        startDate,
        endDate
      });
      showMessage('success', 'Dates set successfully');
    } catch (error) {
      showMessage('error', 'Failed to set dates');
    }
  };

  // Handle rotation assignment
  const handleAssignRotation = async () => {
    try {
      const response = await axios.post(
        `http://localhost:5000/api/rotation/assign-rotation/${rotationStudent}`
      );
      showMessage('success', 'Rotation plan assigned successfully');
    } catch (error) {
      showMessage('error', 'Failed to assign rotation plan');
    }
  };

  // Handle fetching progress
  const handleFetchProgress = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/rotation/progress/${rotationStudent}`
      );
      setProgress(response.data.progress);
      showMessage('success', 'Progress fetched successfully');
    } catch (error) {
      showMessage('error', 'Failed to fetch progress');
    }
  };

  // Handle station selection
  const handleStationSelect = (stationId) => {
    setSelectedStations(prev => {
      if (prev.includes(stationId)) {
        return prev.filter(id => id !== stationId);
      }
      return [...prev, stationId];
    });
  };

  return (
    <Container className="py-4">
      {message.text && (
        <Alert variant={message.type === 'error' ? 'danger' : 'success'}>
          {message.text}
        </Alert>
      )}

      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header as="h5">Set Internship Period</Card.Header>
            <Card.Body>
              <Form onSubmit={handleSetDates}>
                <Form.Group className="mb-3">
                  <Form.Label>Select Student</Form.Label>
                  <Form.Select 
                    value={selectedStudent}
                    onChange={(e) => setSelectedStudent(e.target.value)}
                  >
                    <option value="">Select a student...</option>
                    {students.map(student => (
                      <option key={student._id} value={student._id}>
                        {student.fullName}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Start Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>End Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </Form.Group>
                <Button type="submit">Set Dates</Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col>
          <Card>
            <Card.Header as="h5">Create New Station</Card.Header>
            <Card.Body>
              <Form onSubmit={handleCreateStation}>
                <Form.Group className="mb-3">
                  <Form.Label>Station Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={newStation.stationName}
                    onChange={(e) => setNewStation({...newStation, stationName: e.target.value})}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Maximum Capacity</Form.Label>
                  <Form.Control
                    type="number"
                    value={newStation.maxCapacity}
                    onChange={(e) => setNewStation({...newStation, maxCapacity: e.target.value})}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Duration (weeks)</Form.Label>
                  <Form.Control
                    type="number"
                    value={newStation.duration}
                    onChange={(e) => setNewStation({...newStation, duration: e.target.value})}
                    required
                  />
                </Form.Group>
                <Button type="submit">Create Station</Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="mb-4">
        <Card.Header as="h5">Manage Rotation Plan</Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Select Student</Form.Label>
                <Form.Select
                  value={rotationStudent}
                  onChange={(e) => setRotationStudent(e.target.value)}
                >
                  <option value="">Select a student...</option>
                  {students.map(student => (
                    <option key={student._id} value={student._id}>
                      {student.fullName}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Select Stations</Form.Label>
                <div className="border rounded p-3" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {stations.map(station => (
                    <Form.Check
                      key={station._id}
                      type="checkbox"
                      id={`station-${station._id}`}
                      label={`${station.stationName} (${station.duration} weeks)`}
                      checked={selectedStations.includes(station._id)}
                      onChange={() => handleStationSelect(station._id)}
                      className="mb-2"
                    />
                  ))}
                </div>
                <Form.Text className="text-muted">
                  Select the stations for the rotation plan
                </Form.Text>
              </Form.Group>

              {/* Show selected stations order */}
              {selectedStations.length > 0 && (
                <div className="mt-3">
                  <h6>Selected Stations Order:</h6>
                  <ol className="ps-3">
                    {selectedStations.map((stationId, index) => {
                      const station = stations.find(s => s._id === stationId);
                      return (
                        <li key={stationId}>
                          {station?.stationName} ({station?.duration} weeks)
                        </li>
                      );
                    })}
                  </ol>
                </div>
              )}
            </Col>
          </Row>

          <div className="d-flex gap-2 mt-3">
            <Button 
              variant="primary" 
              onClick={handleAssignRotation}
              disabled={!rotationStudent}
            >
              Assign Rotation Plan
            </Button>
            <Button 
              variant="info" 
              onClick={handleFetchProgress}
              disabled={!rotationStudent}
            >
              Check Progress
            </Button>
          </div>

          {/* Progress Display */}
          {progress && (
            <div className="mt-4">
              <h6>Rotation Progress</h6>
              <Table striped bordered hover size="sm">
                <thead>
                  <tr>
                    <th>Total Stations</th>
                    <th>Completed</th>
                    <th>Remaining</th>
                    
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{progress.totalStations}</td>
                    <td>{progress.completedStations}</td>
                    <td>{progress.remainingStations}</td>
                    
                  </tr>
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      <Card>
        <Card.Header as="h5">Available Stations</Card.Header>
        <Card.Body>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Station Name</th>
                <th>Max Capacity</th>
                <th>Duration (weeks)</th>
                <th>Current Capacity</th>
              </tr>
            </thead>
            <tbody>
              {stations.map(station => (
                <tr key={station._id}>
                  <td>{station.stationName}</td>
                  <td>{station.maxCapacity}</td>
                  <td>{station.duration}</td>
                  <td>{station.currentCapacity}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default InstituteRotational;