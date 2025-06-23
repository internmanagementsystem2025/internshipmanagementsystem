import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Button, Badge, Modal, Form, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { FaChevronLeft, FaChevronRight, FaCalendarCheck, FaUsers } from "react-icons/fa";
import axios from 'axios';
import logo from "../../../assets/logo.png";

const API_BASE_URL = `${import.meta.env.VITE_BASE_URL || 'http://localhost:5000'}/api`;

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
        width: "140px", 
        height: "140px", 
        margin: "0 auto",
        filter: "drop-shadow(0px 3px 6px rgba(0,0,0,0.15))"
      }}>
        <svg width="140" height="140" viewBox="0 0 100 100">
          {/* Background Circle */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke={bgColor}
            strokeWidth="12"
            opacity="0.2"
          />
          {/* Foreground Circle - The progress indicator */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke={color || "#28a745"}
            strokeWidth="12"
            strokeDasharray={strokeDasharray}
            strokeDashoffset="0"
            transform="rotate(-90 50 50)"
            strokeLinecap="round"
          />
        </svg>
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          fontSize: "1.75rem",
          fontWeight: "bold",
          textShadow: "0px 1px 2px rgba(0,0,0,0.1)"
        }}>
          {calculatedPercentage}%
        </div>
      </div>
      <h5 className="mt-3 fw-bold">{title}</h5>
      <div className="text-muted fw-semibold">{value} of {total}</div>
    </div>
  );
};

const RotationalapiSecond = ({ darkMode }) => {
  const [allCVs, setAllCVs] = useState([]);
  const [pendingCVs, setPendingCVs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [assignmentHistory, setAssignmentHistory] = useState([]);
  const [selectedCVForHistory, setSelectedCVForHistory] = useState(null);
  const [selectedCVs, setSelectedCVs] = useState([]);
  const [stations, setStations] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [stationAssignments, setStationAssignments] = useState([
    {
      stationId: '',
      startDate: '',
      endDate: ''
    }
  ]);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState("");
  const itemsPerPage = 10;

  // Format date to DD/MM/YYYY
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [allResponse, pendingResponse, stationsResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/rotational/all-rotational`),
        axios.get(`${API_BASE_URL}/rotational/pending-rotational`),
        axios.get(`${API_BASE_URL}/rotational/stations`)
      ]);

      setAllCVs(allResponse.data);
      setPendingCVs(pendingResponse.data);
      setStations(stationsResponse.data.data || stationsResponse.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.response?.data?.message || "Failed to load data. Please try again.");
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
        `${API_BASE_URL}/rotational/assign-to-multiple-stations`,
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
      setError('Error assigning stations: ' + (error.response?.data?.error || error.message));
    }
  };

  // Function to remove a station assignment
  const handleRemoveStation = (index) => {
    if (stationAssignments.length > 1) {
      setStationAssignments(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleViewHistory = async (cvId) => {
    try {
      setSelectedCVForHistory(cvId);
      setShowHistoryModal(true);
      setError(null);
      const response = await axios.get(`${API_BASE_URL}/rotational/assignment-history/${cvId}`);
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
      setError('Failed to fetch assignment history: ' + (error.response?.data?.message || error.message));
    }
  };

  // Assignment Modal Component
  const AssignmentModal = () => (
    <Modal 
      show={showAssignModal} 
      onHide={() => setShowAssignModal(false)} 
      size="lg"
      centered
      className={darkMode ? "dark-modal" : ""}
    >
      <Modal.Header 
        closeButton
        closeVariant={darkMode ? "white" : undefined}
        className={darkMode ? "bg-dark text-white" : ""}
      >
        <Modal.Title>Assign Stations to Selected CVs</Modal.Title>
      </Modal.Header>
      <Modal.Body className={darkMode ? "bg-dark text-white" : ""}>
        <div className="mb-3">
          <strong>Selected CVs: </strong> 
          {selectedCVs.length} CVs selected
        </div>
        
        {stationAssignments.map((assignment, index) => (
          <Card key={index} className={`mb-3 ${darkMode ? "bg-dark text-white border-secondary" : ""}`}>
            <Card.Body>
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Select Station</Form.Label>
                    <Form.Select
                      value={assignment.stationId}
                      onChange={(e) => handleStationAssignmentChange(index, 'stationId', e.target.value)}
                      className={darkMode ? "bg-secondary text-white" : ""}
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
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Start Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={assignment.startDate}
                      onChange={(e) => handleStationAssignmentChange(index, 'startDate', e.target.value)}
                      className={darkMode ? "bg-secondary text-white" : ""}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>End Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={assignment.endDate}
                      onChange={(e) => handleStationAssignmentChange(index, 'endDate', e.target.value)}
                      className={darkMode ? "bg-secondary text-white" : ""}
                    />
                  </Form.Group>
                </Col>
                <Col md={2} className="d-flex align-items-end mb-3">
                  {stationAssignments.length > 1 && (
                    <Button 
                      variant="danger" 
                      size="sm"
                      onClick={() => handleRemoveStation(index)}
                    >
                      Remove
                    </Button>
                  )}
                </Col>
              </Row>
            </Card.Body>
          </Card>
        ))}
        
        <Button 
          variant={darkMode ? "outline-light" : "secondary"} 
          onClick={handleAddStation} 
          className="mb-3"
        >
          Add Another Station
        </Button>
      </Modal.Body>
      <Modal.Footer className={darkMode ? "bg-dark text-white" : ""}>
        <Button 
          variant={darkMode ? "outline-light" : "secondary"} 
          onClick={() => setShowAssignModal(false)}
        >
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

  // History Modal Component
  const HistoryModal = () => (
    <Modal 
      show={showHistoryModal} 
      onHide={() => setShowHistoryModal(false)} 
      size="lg"
      centered
      className={darkMode ? "dark-modal" : ""}
    >
      <Modal.Header 
        closeButton
        closeVariant={darkMode ? "white" : undefined}
        className={darkMode ? "bg-dark text-white" : ""}
      >
        <Modal.Title>Assignment History</Modal.Title>
      </Modal.Header>
      <Modal.Body className={darkMode ? "bg-dark text-white" : ""}>
        {assignmentHistory.length > 0 ? (
          <div className="table-responsive">
            <Table 
              striped 
              bordered 
              hover
              variant={darkMode ? "dark" : "light"}
            >
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
                    <td>{formatDate(assignment.startDate)}</td>
                    <td>{formatDate(assignment.endDate)}</td>
                    <td>
                      <Badge 
                        bg={
                          assignment.status === 'Currently Working' ? 'primary' :
                          assignment.status === 'Completed' ? 'secondary' :
                          ''
                        }
                        className={`px-3 py-1 rounded-pill ${assignment.status === 'Upcoming' ? 'border border-warning text-warning bg-transparent' : ''}`}
                        style={{ fontSize: '0.85rem', fontWeight: '500' }}
                      >
                        {assignment.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        ) : (
          <Alert variant="info">No assignment history available for this CV.</Alert>
        )}
      </Modal.Body>
      <Modal.Footer className={darkMode ? "bg-dark text-white" : ""}>
        <Button 
          variant={darkMode ? "outline-light" : "secondary"}
          onClick={() => setShowHistoryModal(false)}
        >
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );

  // Pagination logic for pending CVs
  const filteredCVs = pendingCVs.filter(cv => 
    cv.fullName?.toLowerCase().includes(filter.toLowerCase()) ||
    cv.refNo?.toLowerCase().includes(filter.toLowerCase())
  );
  const totalPages = Math.ceil(filteredCVs.length / itemsPerPage);
  const indexOfLastCV = currentPage * itemsPerPage;
  const indexOfFirstCV = indexOfLastCV - itemsPerPage;
  const currentCVs = filteredCVs.slice(indexOfFirstCV, indexOfLastCV);

  return (
    <div
      className={`d-flex flex-column min-vh-100 ${
        darkMode ? "bg-dark text-white" : "bg-light text-dark"
      }`}
    >
      {/* Header with logo */}
      <Container className="text-center mt-4 mb-3">
        <img
          src={logo}
          alt="SLT Mobitel Logo"
          className="mx-auto d-block"
          style={{ height: "50px" }}
        />
        <h3 className="mt-3">ROTATIONAL INTERNSHIP MANAGEMENT</h3>
      </Container>

      {/* Main Content */}
      <Container
        className="mt-4 p-4 rounded"
        style={{
          background: darkMode ? "#343a40" : "#ffffff",
          color: darkMode ? "white" : "black",
          border: darkMode ? "1px solid #454d55" : "1px solid #ced4da",
        }}
      >
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant={darkMode ? "light" : "primary"} />
            <p className="mt-3 fs-5">Loading data...</p>
          </div>
        ) : error ? (
          <Alert variant="danger" onClose={() => setError(null)} dismissible>
            {error}
          </Alert>
        ) : (
          <>
            {/* Pending CVs Section */}
            <h5 className="mb-3">
              <FaUsers
                className="me-2"
                style={{ fontSize: "1.2rem", color: darkMode ? "white" : "black" }}
              />
              Pending CVs for Assignment
            </h5>
            <hr className={darkMode ? "border-light mt-3" : "border-dark mt-3"} />

            <div className="d-flex flex-wrap justify-content-between mb-3">
              <Form.Group
                className="mb-3"
                style={{ maxWidth: "300px" }}
              >
                <div className="input-group">

                  <Form.Control
                    type="text"
                    placeholder="Filter by Name or Reference No..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className={darkMode ? "bg-dark text-white border-secondary" : ""}
                    aria-describedby="filter-addon"
                  />
                </div>
              </Form.Group>

              <div>
                {selectedCVs.length > 0 && (
                  <Button
                    variant="success"
                    onClick={handleOpenAssignModal}
                  >
                    Assign Selected CVs ({selectedCVs.length})
                  </Button>
                )}
              </div>
            </div>

            <div className="table-responsive mb-5">
              <Table
                striped
                bordered
                hover
                variant={darkMode ? "dark" : "light"}
                className="align-middle"
              >
                <thead>
                  <tr>
                    <th width="50px">Select</th>
                    <th>#</th>
                    <th>Name</th>
                    <th>Reference No</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentCVs.length > 0 ? (
                    currentCVs.map((cv, index) => (
                      <tr key={cv._id}>
                        <td className="text-center">
                          <Form.Check
                            type="checkbox"
                            checked={selectedCVs.includes(cv._id)}
                            onChange={() => handleCVSelect(cv._id)}
                          />
                        </td>
                        <td>{indexOfFirstCV + index + 1}</td>
                        <td>{cv.fullName || 'N/A'}</td>
                        <td>{cv.refNo || 'N/A'}</td>
                        <td>
                          <Badge 
                            bg={cv.rotationalAssignment?.status === 'station-assigned' ? 'primary' : ''}
                            className={`px-3 py-1 rounded-pill ${cv.rotationalAssignment?.status !== 'station-assigned' ? 'border border-warning text-warning bg-transparent' : ''}`}
                            style={{ fontSize: '0.85rem', fontWeight: '500' }}
                          >
                            {cv.rotationalAssignment?.status === 'station-assigned' ? 'Assigned' : 'Pending'}
                          </Badge>
                        </td>
                        <td>
                          <Button
                            size="sm"
                            variant="outline-info"
                            onClick={() => handleViewHistory(cv._id)}
                            className="fw-semibold"
                          >
                            View History
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-3">
                        No pending CVs found
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={6} style={{ padding: "5px", fontSize: "14px" }}>
                      <div
                        className="d-flex justify-content-between align-items-center"
                        style={{ minHeight: "30px" }}
                      >
                        <div className="flex-grow-1 text-center">
                          {currentCVs.length} of {filteredCVs.length}{" "}
                          CV(s) shown
                        </div>
                        <div className="d-flex align-items-center">
                          <Button
                            variant="link"
                            size="sm"
                            onClick={() =>
                              setCurrentPage((prev) => Math.max(prev - 1, 1))
                            }
                            disabled={currentPage === 1}
                            style={{
                              color: darkMode ? "white" : "black",
                              padding: 0,
                              margin: 0,
                            }}
                          >
                            <FaChevronLeft />
                            <FaChevronLeft />
                          </Button>
                          <span className="mx-2">
                            Page {currentPage} of {Math.max(1, totalPages)}
                          </span>
                          <Button
                            variant="link"
                            size="sm"
                            onClick={() =>
                              setCurrentPage((prev) =>
                                Math.min(prev + 1, Math.max(1, totalPages))
                              )
                            }
                            disabled={currentPage === totalPages || totalPages === 0}
                            style={{
                              color: darkMode ? "white" : "black",
                              padding: 0,
                              margin: 0,
                            }}
                          >
                            <FaChevronRight />
                            <FaChevronRight />
                          </Button>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tfoot>
              </Table>
            </div>

            {/* All Rotational CVs Section */}
            <h5 className="mb-3">
              <FaCalendarCheck
                className="me-2"
                style={{ fontSize: "1.2rem", color: darkMode ? "white" : "black" }}
              />
              All Rotational CVs
            </h5>
            <hr className={darkMode ? "border-light mt-3" : "border-dark mt-3"} />
            
            <div className="table-responsive">
              <Table
                striped
                bordered
                hover
                variant={darkMode ? "dark" : "light"}
                className="align-middle"
              >
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Reference No</th>
                    <th>Current Station</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allCVs.length > 0 ? (
                    allCVs.map((cv, index) => (
                      <tr key={cv._id}>
                        <td>{index + 1}</td>
                        <td>{cv.fullName || 'N/A'}</td>
                        <td>{cv.refNo || 'N/A'}</td>
                        <td>
                          {cv.rotationalAssignment?.assignedStations?.find(
                            station => station.isCurrent
                          )?.station?.stationName || 'Not Assigned'}
                        </td>
                        <td>
                          <Badge 
                            bg={
                              cv.rotationalAssignment?.status === 'station-assigned' 
                                ? 'primary' 
                                : ''
                            }
                            className={`px-3 py-1 rounded-pill ${cv.rotationalAssignment?.status !== 'station-assigned' ? 'border border-warning text-warning bg-transparent' : ''}`}
                            style={{ fontSize: '0.85rem', fontWeight: '500' }}
                          >
                            {cv.rotationalAssignment?.status === 'station-assigned' ? 'Assigned' : 'Pending'}
                          </Badge>
                        </td>
                        <td>
                          <Button 
                            size="sm" 
                            variant="outline-info" 
                            onClick={() => handleViewHistory(cv._id)}
                            className="fw-semibold"
                          >
                            View History
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-3">
                        No rotational CVs found
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </>
        )}
      </Container>

      {/* Assignment Modal */}
      <AssignmentModal />

      {/* History Modal */}
      <HistoryModal />
    </div>
  );
};

export default RotationalapiSecond;