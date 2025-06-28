import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Table,
  Button,
  Form,
  Spinner,
  Alert,
  Dropdown,
  Modal,
  Badge,
  Tooltip,
  OverlayTrigger,
  InputGroup,
  Row,
  Col,
  Card,
} from "react-bootstrap";
import axios from "axios";
import logo from "../../../assets/logo.png";

const API_BASE_URL = `${import.meta.env.VITE_BASE_URL}/api`;

const ScheduleRotations = ({ darkMode }) => {
  const navigate = useNavigate();
  const [CVs, setCVs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [view, setView] = useState("all");
  const [selectedCVs, setSelectedCVs] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedStation, setSelectedStation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [stations, setStations] = useState([]);
  const [showNoSelectionAlert, setShowNoSelectionAlert] = useState(false);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [currentCV, setCurrentCV] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [stationHistory, setStationHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [stationAssignments, setStationAssignments] = useState([
    {
      stationId: "",
      startDate: "",
      endDate: "",
    },
  ]);

  // Effect hooks
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (showNoSelectionAlert) {
      const timer = setTimeout(() => setShowNoSelectionAlert(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showNoSelectionAlert]);

  useEffect(() => {
    fetchData();
  }, [view]);

  // Helper functions
  const formatDate = (dateString, format = "local") => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);

    if (format === "ddmmyyyy") {
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }

    return date.toLocaleDateString();
  };

  const formatDuration = (startDate, endDate) => {
    if (!startDate || !endDate) return "N/A";

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Set time to midnight for accurate calculation
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    // Calculate total days (including both start and end dates)
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    
    // Calculate weeks and days
    const weeks = Math.floor(totalDays / 7);
    const days = totalDays % 7;

    // Format the duration string
    if (weeks === 0) {
      return `${totalDays} day${totalDays !== 1 ? 's' : ''}`;
    } else if (days === 0) {
      return `${weeks} week${weeks !== 1 ? 's' : ''}`;
    } else {
      return `${weeks}w ${days}d`;
    }
  };

  // Data fetching
  const fetchData = async () => {
    try {
      setLoading(true);
      let [allResponse, pendingResponse, analyticsResponse, stationsResponse] = await Promise.all([
        axios.get('http://localhost:5000/api/rotational/all-rotational'),
        axios.get('http://localhost:5000/api/rotational/pending-rotational'),
        axios.get('http://localhost:5000/api/rotational/analytics'),
        axios.get('http://localhost:5000/api/rotational/stations')
      ]);

      // Process CVs before setting state
      const processedPendingCVs = pendingResponse.data.map(processCV);
      const processedAllCVs = allResponse.data.map(processCV);

      // Set state based on view
      switch (view) {
        case 'all':
          setCVs(processedAllCVs);
          break;
        case 'pending':
          setCVs(processedPendingCVs);
          break;
        case 'assigned':
          setCVs(processedAllCVs.filter(cv => 
            cv.rotationalAssignment?.assignedStations?.some(as => as.isCurrent)
          ));
          break;
        default:
          setCVs(processedAllCVs);
      }

      setStations(stationsResponse.data.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(error.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // Event handlers
  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const handleCVSelection = (cvId) => {
    setSelectedCVs((prev) =>
      prev.includes(cvId) ? prev.filter((id) => id !== cvId) : [...prev, cvId]
    );
  };

  const handleAssignButtonClick = () => {
    if (selectedCVs.length === 0) {
      setShowNoSelectionAlert(true);
      return;
    }
    setShowAssignModal(true);
  };

  const handleRotateCVs = () => {
    if (selectedCVs.length === 0) {
      setShowNoSelectionAlert(true);
      return;
    }
    setShowReassignModal(true);
    setCurrentCV(null); // Indicates this is a bulk operation
  };

  const handleDeleteCV = async (cvId) => {
    if (window.confirm("Are you sure you want to delete this CV?")) {
      try {
        await axios.delete(`${API_BASE_URL}/cvs/${cvId}`);
        setSuccessMessage("CV deleted successfully!");
        fetchData();
      } catch (error) {
        console.error("Error deleting CV:", error);
        setError("Failed to delete CV. Please try again.");
      }
    }
  };

  const handleStartDateChange = (e) => {
    const selectedStartDate = e.target.value;
    setStartDate(selectedStartDate);

    if (selectedStation) {
      const selectedStationData = stations.find(
        (station) => station._id === selectedStation
      );
      if (selectedStationData?.timePeriod) {
        const start = new Date(selectedStartDate);
        const end = new Date(start);
        end.setDate(end.getDate() + selectedStationData.timePeriod * 7 - 1);
        const endDateStr = end.toISOString().split("T")[0];
        setEndDate(endDateStr);
      }
    }
  };

  const handleStationSelection = (stationId) => {
    const selectedStationData = stations.find(
      (station) => station._id === stationId
    );
    if (selectedStationData) {
      setSelectedStation(stationId);
      if (startDate && selectedStationData.timePeriod) {
        const start = new Date(startDate);
        const end = new Date(start);
        end.setDate(end.getDate() + selectedStationData.timePeriod * 7 - 1);
        const endDateStr = end.toISOString().split("T")[0];
        setEndDate(endDateStr);
      }
    }
  };

  const handleAssignCV = (cv) => {
    setCurrentCV(cv);
    setShowAssignModal(true);
    setSelectedStation("");
    setStartDate("");
    setEndDate("");
    setError("");
    setSuccessMessage("");
  };

  const handleAssignCVs = async () => {
    try {
      setAssigning(true);
      
      const response = await axios.post(
        'http://localhost:5000/api/rotational/assign-to-station',
        {
          cvIds: currentCV ? [currentCV._id] : selectedCVs,
          stationId: selectedStation,
          startDate: startDate,
          endDate: endDate
        }
      );

      if (response.data) {
        setSuccessMessage("Successfully assigned CVs");
        await fetchData();
        setShowAssignModal(false);
        resetAssignmentForm();
      }
    } catch (error) {
      setError(error.response?.data?.error || "Failed to assign CVs");
    } finally {
      setAssigning(false);
    }
  };

  const handleReassignCV = async () => {
    if (!selectedStation || !startDate || !endDate) {
      setError("All fields are required.");
      return;
    }

    try {
      setAssigning(true);
      setError("");
      setSuccessMessage("");

      // Determine if we're doing bulk or single reassignment
      const cvIds = currentCV ? [currentCV._id] : selectedCVs;

      // First remove from current stations
      const currentDate = new Date().toISOString().split("T")[0];
      await Promise.all(
        cvIds.map((cvId) =>
          axios.delete(
            `${API_BASE_URL}/rotational/remove-from-station/${cvId}`,
            { data: { endDate: currentDate } }
          )
        )
      );

      // Then assign to new station
      const response = await axios.post(
        `${API_BASE_URL}/rotational/assign-to-station`,
        {
          cvIds,
          stationId: selectedStation,
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString(),
          status: "station-assigned",
        }
      );

      setSuccessMessage(
        `Successfully rotated ${cvIds.length} CV${
          cvIds.length > 1 ? "s" : ""
        } to new station`
      );

      // Refresh data and reset states
      await fetchData();
      setShowReassignModal(false);
      setSelectedCVs([]);
      resetAssignmentForm();
    } catch (error) {
      setAssigning(false);
      console.error("Error rotating CVs:", error);
      setError(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Failed to rotate CVs. Please try again."
      );
    } finally {
      setAssigning(false);
    }
  };
  // Helper function to reset form
  const resetAssignmentForm = () => {
    setSelectedStation("");
    setStartDate("");
    setEndDate("");
    setCurrentCV(null);
    if (!currentCV) {
      setSelectedCVs([]);
    }
  };

  const handleRemoveFromStation = async (cvId) => {
    try {
      if (
        !window.confirm(
          "Are you sure you want to remove this CV from its current station?"
        )
      ) {
        return;
      }

      const currentDate = new Date().toISOString();
      const response = await axios.delete(
        `${API_BASE_URL}/rotational/remove-from-station/${cvId}`,
        { data: { endDate: currentDate } }
      );

      setSuccessMessage(
        response.data.message || "CV removed from station successfully!"
      );

      // Force a complete refresh of the data
      setLoading(true);
      await fetchData();
      setLoading(false);
    } catch (error) {
      console.error("Error removing CV:", error);
      setError(
        error.response?.data?.error ||
          error.response?.data?.details ||
          "Failed to remove CV from station. Please try again."
      );
    }
  };
  // Helper function to format date for input fields
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  const handleSubmitReassignment = async () => {
    if (!currentCV || !selectedStation || !startDate || !endDate) {
      setError("All fields are required.");
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/rotational/reassign-cv`, {
        cvId: currentCV._id,
        newStationId: selectedStation,
        newStartDate: startDate,
        newEndDate: endDate,
      });
      setSuccessMessage("CV reassigned successfully!");
      fetchData();
      setShowReassignModal(false);
      setCurrentCV(null);
    } catch (error) {
      console.error("Error reassigning CV:", error);
      setError(error.response?.data?.error || "Failed to reassign CV.");
    }
  };

  const handleViewHistory = async (cvId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/rotational/assignment-history/${cvId}`
      );

      const currentDate = new Date();
      const categorizedHistory = response.data.map(assignment => {
        const startDate = new Date(assignment.startDate);
        const endDate = new Date(assignment.endDate);

        // Set time to midnight for accurate date comparison
        currentDate.setHours(0, 0, 0, 0);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);

        let status;
        let badgeVariant;
        let dayCount;

        if (currentDate >= startDate && currentDate <= endDate) {
          // Currently Working - show remaining days
          const remainingDays = Math.ceil((endDate - currentDate) / (1000 * 60 * 60 * 24));
          status = `Currently Working (${remainingDays} days remaining)`;
          badgeVariant = 'success';
        } else if (currentDate > endDate) {
          // Completed - show days since completion
          const daysSinceCompletion = Math.ceil((currentDate - endDate) / (1000 * 60 * 60 * 24));
          status = `Completed ${daysSinceCompletion} days ago`;
          badgeVariant = 'secondary';
        } else if (currentDate < startDate) {
          // Upcoming - show days until start
          const daysUntilStart = Math.ceil((startDate - currentDate) / (1000 * 60 * 60 * 24));
          status = `Starts in ${daysUntilStart} days`;
          badgeVariant = 'warning';
        }

        return {
          ...assignment,
          status,
          badgeVariant,
          duration: formatDuration(assignment.startDate, assignment.endDate)
        };
      });

      setStationHistory(categorizedHistory);
      setShowHistoryModal(true);
    } catch (error) {
      console.error("Error fetching history:", error);
      setError("Failed to fetch assignment history");
    }
  };

  const renderStationsTooltip = (cv) => {
    if (
      !cv.rotationalAssignment?.assignedStations ||
      cv.rotationalAssignment.assignedStations.length === 0
    ) {
      return "No station history available";
    }

    const assignmentsToShow = cv.currentAssignment
      ? cv.rotationalAssignment.assignedStations.filter((as) => !as.isCurrent)
      : cv.rotationalAssignment.assignedStations;

    if (assignmentsToShow.length === 0) {
      return cv.currentAssignment
        ? "Currently assigned (no previous stations)"
        : "No station history";
    }

    return (
      <div>
        {assignmentsToShow.map((assignment, index) => (
          <div key={index}>
            <strong>
              {assignment.station?.stationName || "Unknown Station"}
            </strong>
            <br />
            Dates: {formatDate(assignment.startDate, "ddmmyyyy")} -{" "}
            {formatDate(assignment.endDate, "ddmmyyyy")}
            <br />
            Duration: {formatDuration(assignment.startDate, assignment.endDate)}
            <br />
            Status: <Badge bg="secondary">Past</Badge>
            {index < assignmentsToShow.length - 1 && <hr />}
          </div>
        ))}
      </div>
    );
  };
  const processCV = (cv) => {
    const currentAssignment = cv.rotationalAssignment?.assignedStations?.find(
      (as) => as.isCurrent
    );

    return {
      ...cv,
      currentAssignment,
      hasPreviousAssignments: cv.rotationalAssignment?.assignedStations?.length > 0,
      isPending: cv.rotationalAssignment?.status === "station-not-assigned" 
                && cv.rotationalAssignment?.isRotational 
                && (!cv.rotationalAssignment?.assignedStations 
                    || cv.rotationalAssignment.assignedStations.length === 0),
      isUnassigned: !currentAssignment 
                    && cv.rotationalAssignment?.status === "station-assigned"
    };
  };
  // Filter CVs based on search term
  const filteredCVs = CVs.filter((cv) => {
    const matchesSearch =
      (cv.nic && cv.nic.toLowerCase().includes(searchTerm)) ||
      (cv.fullName && cv.fullName.toLowerCase().includes(searchTerm));

    switch (view) {
      case 'pending':
        return matchesSearch && cv.isPending;
      case 'unassigned':
        return matchesSearch && cv.isUnassigned;
      case 'assigned':
        return matchesSearch && cv.currentAssignment;
      default:
        return matchesSearch;
    }
  });

  // Handle changes in station assignments
  const handleStationAssignmentChange = (index, field, value) => {
    const newAssignments = [...stationAssignments];
    newAssignments[index][field] = value;
    
    // If changing station and we have a start date, calculate end date
    if (field === 'stationId' && newAssignments[index].startDate) {
      const station = stations.find(s => s._id === value);
      if (station?.timePeriod) {
        const start = new Date(newAssignments[index].startDate);
        const end = new Date(start);
        end.setDate(end.getDate() + (station.timePeriod * 7) - 1);
        newAssignments[index].endDate = end.toISOString().split('T')[0];
      }
    }
    
    // If changing start date and we have a station, calculate end date
    if (field === 'startDate' && newAssignments[index].stationId) {
      const station = stations.find(s => s._id === newAssignments[index].stationId);
      if (station?.timePeriod) {
        const start = new Date(value);
        const end = new Date(start);
        end.setDate(end.getDate() + (station.timePeriod * 7) - 1);
        newAssignments[index].endDate = end.toISOString().split('T')[0];
      }
    }
    
    setStationAssignments(newAssignments);
  };

  // Add a new station assignment row
  const handleAddStation = () => {
    setStationAssignments([...stationAssignments, { stationId: "", startDate: "", endDate: "" }]);
  };

  // Assign CVs to multiple stations
  const handleAssignToStations = async () => {
    try {
      setAssigning(true);
      setError('');

      // Validate all assignments have required fields
      const isValid = stationAssignments.every(assignment => 
        assignment.stationId && assignment.startDate && assignment.endDate
      );

      if (!isValid) {
        setError('Please fill all station assignment details');
        return;
      }

      // Format the stations array with all assignments
      const formattedStations = stationAssignments.map(assignment => ({
        stationId: assignment.stationId,
        startDate: new Date(assignment.startDate).toISOString(),
        endDate: new Date(assignment.endDate).toISOString()
      }));

      console.log('Sending request with:', {
        cvIds: selectedCVs,
        stations: formattedStations
      });

      const response = await axios.post(
        `${API_BASE_URL}/rotational/assign-to-multiple-stations`,
        {
          cvIds: selectedCVs,
          stations: formattedStations
        }
      );

      if (response.data.successfulAssignments?.length > 0) {
        setSuccessMessage(`Successfully assigned ${response.data.successfulAssignments.length} CVs to ${formattedStations.length} stations`);
        setShowAssignModal(false);
        // Reset states
        setStationAssignments([{ stationId: '', startDate: '', endDate: '' }]);
        setSelectedCVs([]);
        await fetchData(); // Refresh the data
      } else {
        throw new Error('No assignments were successful');
      }
    } catch (error) {
      console.error('Assignment error:', error);
      setError(error.response?.data?.error || error.message);
    } finally {
      setAssigning(false);
    }
  };

  const renderAssignModalContent = () => {
    if (view === "assigned") {
      return (
        <>
          <Form.Group>
            <Form.Label>Select Station</Form.Label>
            <Form.Control
              as="select"
              value={selectedStation}
              onChange={(e) => handleStationSelection(e.target.value)}
            >
              <option value="">Select a station</option>
              {stations.map((station) => (
                <option key={station._id} value={station._id}>
                  {station.stationName} ({station.timePeriod} weeks)
                </option>
              ))}
            </Form.Control>
          </Form.Group>

          <Form.Group className="mt-3">
            <Form.Label>Start Date</Form.Label>
            <Form.Control
              type="date"
              value={startDate}
              onChange={handleStartDateChange}
              min={new Date().toISOString().split("T")[0]}
            />
          </Form.Group>

          <Form.Group className="mt-3">
            <Form.Label>End Date</Form.Label>
            <Form.Control type="date" value={endDate} readOnly />
          </Form.Group>
        </>
      );
    } else {
      return (
        <div>
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
        </div>
      );
    }
  };

  return (
    <div
      className={`d-flex flex-column min-vh-100 ${
        darkMode ? "bg-dark text-white" : "bg-light text-dark"
      }`}
    >
      <Container className="text-center mt-4 mb-3">
        <img
          src={logo}
          alt="Logo"
          className="mx-auto d-block"
          style={{ height: "50px" }}
        />
        <h3 className="mt-3">SCHEDULE ROTATIONS</h3>
      </Container>

      <Container
        className="mt-4 p-4 rounded"
        style={{
          background: darkMode ? "#343a40" : "#ffffff",
          color: darkMode ? "white" : "black",
          border: darkMode ? "1px solid #454d55" : "1px solid #ced4da",
        }}
      >
        <div className="d-flex justify-content-between mb-3 align-items-center">
          <div className="d-flex align-items-center">
            <Dropdown className="me-3">
              <Dropdown.Toggle variant="primary">
                {view === "all"
                  ? "All Rotational CVs"
                  : view === "pending"
                  ? "Pending CVs"
                  : view === "unassigned"
                  ? "Unassigned CVs"
                  : "Assigned CVs"}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => setView("all")}>
                  All Rotational CVs
                </Dropdown.Item>
                <Dropdown.Item onClick={() => setView("pending")}>
                  Pending CVs (Never Assigned)
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            <Form.Control
              type="text"
              placeholder="Search by NIC or Name"
              value={searchTerm}
              onChange={handleSearch}
              className={darkMode ? "bg-dark text-white border-secondary" : ""}
              style={{ width: "150px",fontSize:"12px" }}
            />
          </div>
          <div className="d-flex">
            {(view === "unassigned" || view === "pending") && (
              <Button
                variant="success"
                onClick={handleAssignButtonClick}
                className="me-2"
              >
                Assign Selected CVs
              </Button>
            )}
            {view === "assigned" && (
              <Button variant="primary" onClick={handleRotateCVs}>
                Rotate Selected CVs
              </Button>
            )}
          </div>
        </div>

        {showNoSelectionAlert && (
          <Alert
            variant="warning"
            dismissible
            onClose={() => setShowNoSelectionAlert(false)}
          >
            Please select at least one CV.
          </Alert>
        )}
        {successMessage && (
          <Alert
            variant="success"
            dismissible
            onClose={() => setSuccessMessage("")}
          >
            {successMessage}
          </Alert>
        )}
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        <div className="table-responsive">
          <Table striped bordered hover variant={darkMode ? "dark" : "light"}>
            <thead>
              <tr>
                {/* Select column for all views except 'all' */}
                {view !== "all" && <th>Select</th>}
                <th>Ref. No.</th>
                <th>NIC</th>
                <th>Full Name</th>
                <th>Intern Type</th>
                <th>Current Station</th>
                {view === "assigned" && (
                  <>
                    <th>Start Date</th>
                    <th>End Date</th>
                  </>
                )}
                <th>Previous Stations</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={view === "assigned" ? 10 : view !== "all" ? 9 : 7}
                    className="text-center"
                  >
                    <Spinner animation="border" /> Loading...
                  </td>
                </tr>
              ) : filteredCVs.length > 0 ? (
                filteredCVs.map((cv) => (
                  <tr key={cv._id}>
                    {/* Select checkbox for all views except 'all' */}
                    {view !== "all" && (
                      <td>
                        <Form.Check
                          type="checkbox"
                          checked={selectedCVs.includes(cv._id)}
                          onChange={() => handleCVSelection(cv._id)}
                        />
                      </td>
                    )}

                    <td>{cv.refNo || "N/A"}</td>
                    <td>{cv.nic || "N/A"}</td>
                    <td>{cv.fullName || "N/A"}</td>
                    <td>{cv.selectedRole || "N/A"}</td>
                    <td>
                      {cv.currentAssignment?.station?.stationName ||
                        "Not Assigned"}
                    </td>

                    {view === "assigned" && (
                      <>
                        <td>
                          {cv.currentAssignment?.startDate
                            ? formatDate(cv.currentAssignment.startDate)
                            : "N/A"}
                        </td>
                        <td>
                          {cv.currentAssignment?.endDate
                            ? formatDate(cv.currentAssignment.endDate)
                            : "N/A"}
                        </td>
                      </>
                    )}

                    <td>
                      {cv.hasPreviousAssignments ? (
                        <OverlayTrigger
                          placement="left"
                          overlay={
                            <Tooltip id={`tooltip-${cv._id}`}>
                              {renderStationsTooltip(cv)}
                            </Tooltip>
                          }
                        >
                          <Button
                            variant="info"
                            size="sm"
                            onClick={() => handleViewHistory(cv._id)}
                          >
                            View History
                          </Button>
                        </OverlayTrigger>
                      ) : (
                        "None"
                      )}
                    </td>

                    <td>
                      <div className="d-flex gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => navigate(`/view-cv/${cv._id}`)}
                        >
                          View/Edit
                        </Button>
                        {view !== "assigned" && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDeleteCV(cv._id)}
                          >
                            Delete
                          </Button>
                        )}
                        {view === "assigned" && (
                          <>
                            <Button
                              variant="warning"
                              size="sm"
                              onClick={() => handleReassignCV(cv)}
                            >
                              Reassign
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleRemoveFromStation(cv._id)}
                            >
                              Remove
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={view === "assigned" ? 10 : view !== "all" ? 9 : 7}
                    className="text-center"
                  >
                    No CVs found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </Container>

      {/* Assign CVs Modal */}
      <Modal
        show={showAssignModal}
        onHide={() => {
          if (!assigning) {
            setShowAssignModal(false);
            setError("");
          }
        }}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {currentCV
              ? `Assign CV (${currentCV.fullName})`
              : view === "assigned"
              ? `Rotate ${selectedCVs.length} CVs`
              : `Assign ${selectedCVs.length} CVs`}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {successMessage && (
            <Alert variant="success" className="mb-3">
              {successMessage}
            </Alert>
          )}
          {error && (
            <Alert variant="danger" onClose={() => setError("")} dismissible>
              {error}
            </Alert>
          )}

          {renderAssignModalContent()}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setShowAssignModal(false);
              setStationAssignments([{ stationId: '', startDate: '', endDate: '' }]);
            }}
            disabled={assigning}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={view === "assigned" ? handleAssignCVs : handleAssignToStations}
            disabled={assigning || (view === "assigned" ? !selectedStation : !stationAssignments.some(a => a.stationId))}
          >
            {assigning ? (
              <>
                <Spinner as="span" size="sm" animation="border" role="status" />
                <span className="ms-2">Assigning...</span>
              </>
            ) : (
              "Assign"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Reassign CV Modal */}
      <Modal
        show={showReassignModal}
        onHide={() => {
          setShowReassignModal(false);
          setError("");
          setCurrentCV(null);
        }}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Reassign CV to New Station</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && (
            <Alert variant="danger" onClose={() => setError("")} dismissible>
              {error}
            </Alert>
          )}

          {currentCV && (
            <div className="mb-3">
              <h6>CV Details:</h6>
              <p className="mb-1">
                <strong>Name:</strong> {currentCV.fullName}
              </p>
              <p className="mb-1">
                <strong>NIC:</strong> {currentCV.nic}
              </p>
              <p className="mb-1">
                <strong>Current Station:</strong>{" "}
                {currentCV.currentAssignment?.station?.stationName || "N/A"}
              </p>
            </div>
          )}

          <Form.Group>
            <Form.Label>Select New Station</Form.Label>
            <Form.Control
              as="select"
              value={selectedStation}
              onChange={(e) => handleStationSelection(e.target.value)}
            >
              <option value="">Select a station</option>
              {stations.map((station) => (
                <option key={station._id} value={station._id}>
                  {station.stationName} ({station.timePeriod} weeks)
                </option>
              ))}
            </Form.Control>
          </Form.Group>

          <Form.Group className="mt-3">
            <Form.Label>Start Date</Form.Label>
            <Form.Control
              type="date"
              value={startDate}
              onChange={handleStartDateChange}
            />
          </Form.Group>

          <Form.Group className="mt-3">
            <Form.Label>End Date</Form.Label>
            <Form.Control type="date" value={endDate} readOnly />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowReassignModal(false)}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmitReassignment}>
            Reassign
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Station History Modal */}
      <Modal
        show={showHistoryModal}
        onHide={() => setShowHistoryModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Station Assignment History</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Table striped bordered hover size="sm">
            <thead>
              <tr>
                <th>#</th>
                <th>Station</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th style={{ width: '100px' }}>Duration</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {stationHistory.map((assignment, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{assignment.station?.stationName || "Unknown Station"}</td>
                  <td>{formatDate(assignment.startDate, "ddmmyyyy")}</td>
                  <td>{formatDate(assignment.endDate, "ddmmyyyy")}</td>
                  <td className="text-center">
                    <Badge bg="info">
                      {formatDuration(assignment.startDate, assignment.endDate)}
                    </Badge>
                  </td>
                  <td>
                    <Badge bg={assignment.badgeVariant}>
                      {assignment.status}
                    </Badge>
                  </td>
                </tr>
              ))}
              {stationHistory.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center">
                    No assignment history found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowHistoryModal(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ScheduleRotations;
