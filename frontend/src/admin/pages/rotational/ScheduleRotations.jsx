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
} from "react-bootstrap";
import axios from "axios";
import logo from "../../../assets/logo.png";

const API_BASE_URL = import.meta.env.VITE_BASE_URL;

const ScheduleCVs = ({ darkMode }) => {
  const navigate = useNavigate();
  const [unassignedCVs, setUnassignedCVs] = useState([]);
  const [assignedCVs, setAssignedCVs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [view, setView] = useState("unassigned");
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
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [unassignedResponse, assignedResponse, stationsResponse] =
        await Promise.all([
          axios.get(`${API_BASE_URL}/rotational/unassigned-rotational`),
          axios.get(`${API_BASE_URL}/rotational/assigned-rotational`),
          axios.get(`${API_BASE_URL}/stations/all-stations`),
        ]);

      const processCV = (cv, isAssigned) => {
        const processedAssignments = Array.isArray(cv.assignedStation)
          ? cv.assignedStation.map((as) => ({
              ...as,
              station: as.station || { stationName: "Unknown Station" },
              startDate: as.startDate || null,
              endDate: as.endDate || null,
              serviceTimePeriod: as.serviceTimePeriod || 0,
            }))
          : [];

        return {
          ...cv,
          isAssignedStation: isAssigned,
          assignedStation: processedAssignments,
        };
      };

      setUnassignedCVs(
        unassignedResponse.data.map((cv) => processCV(cv, false))
      );
      setAssignedCVs(assignedResponse.data.map((cv) => processCV(cv, true)));
      setStations(stationsResponse.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const filteredUnassignedCVs = unassignedCVs.filter(
    (cv) =>
      (cv.nic && cv.nic.toLowerCase().includes(searchTerm)) ||
      (cv.fullName && cv.fullName.toLowerCase().includes(searchTerm))
  );

  const filteredAssignedCVs = assignedCVs.filter(
    (cv) =>
      (cv.nic && cv.nic.toLowerCase().includes(searchTerm)) ||
      (cv.fullName && cv.fullName.toLowerCase().includes(searchTerm))
  );

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

  const handleAssignCVs = async () => {
    if (!selectedStation || !startDate || !endDate) {
      setError("Please select a station and start date.");
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/rotational/assign-to-station`, {
        cvIds: selectedCVs,
        stationId: selectedStation,
        startDate,
        endDate,
      });
      setSuccessMessage("CVs assigned successfully!");
      fetchData();
      setShowAssignModal(false);
      setSelectedCVs([]);
      setSelectedStation("");
      setStartDate("");
      setEndDate("");
    } catch (error) {
      console.error("Error assigning CVs:", error);
      setError(error.response?.data?.error || "Failed to assign CVs.");
    }
  };

  const handleReassignCV = (cv) => {
    setCurrentCV(cv);
    setShowReassignModal(true);
    setStartDate("");
    setEndDate("");
    setSelectedStation("");
  };

  const handleRemoveFromStation = async (cvId) => {
    try {
      const currentDate = new Date().toISOString().split("T")[0];
      const cvToRemove = assignedCVs.find((cv) => cv._id === cvId);
      if (!cvToRemove) {
        throw new Error("CV not found in assigned list");
      }

      const response = await axios.delete(
        `${API_BASE_URL}/rotational/remove-from-station/${cvId}`,
        { data: { endDate: currentDate } }
      );

      setAssignedCVs((prev) => prev.filter((cv) => cv._id !== cvId));
      setUnassignedCVs((prev) => {
        const filtered = prev.filter((cv) => cv._id !== cvId);
        return [
          ...filtered,
          {
            ...cvToRemove,
            isAssignedStation: false,
            assignedStation:
              response.data?.assignedStation || cvToRemove.assignedStation,
          },
        ];
      });

      setSuccessMessage("CV removed from station successfully!");
    } catch (error) {
      console.error("Error removing CV:", error);
      setError("Failed to remove CV from station. Please try again.");
      fetchData();
    }
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
      const isCurrentlyAssigned = assignedCVs.some((cv) => cv._id === cvId);

      const history = response.data.map((assignment, index, arr) => {
        const isCurrent = isCurrentlyAssigned && index === arr.length - 1;
        return {
          ...assignment,
          isCurrent,
          duration: formatDuration(assignment.startDate, assignment.endDate),
        };
      });

      setStationHistory(history);
      setShowHistoryModal(true);
    } catch (error) {
      console.error("Error fetching history:", error);
      setError("Failed to load station history.");
    }
  };

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
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const weeks = Math.floor(diffDays / 7);
    const remainingDays = diffDays % 7;

    return [
      weeks > 0 && `${weeks} week${weeks !== 1 ? "s" : ""}`,
      remainingDays > 0 &&
        `${remainingDays} day${remainingDays !== 1 ? "s" : ""}`,
    ]
      .filter(Boolean)
      .join(" and ");
  };

  const renderStationsTooltip = (cv) => {
    if (!cv.assignedStation || cv.assignedStation.length === 0) {
      return "No station history available";
    }

    const assignmentsToShow = cv.isAssignedStation
      ? cv.assignedStation.slice(0, -1)
      : cv.assignedStation;

    if (assignmentsToShow.length === 0) {
      return cv.isAssignedStation
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

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

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
        <h3 className="mt-3">SCHEDULE CVs</h3>
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
                {view === "unassigned" ? "Unassigned CVs" : "Assigned CVs"}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => setView("unassigned")}>
                  Unassigned
                </Dropdown.Item>
                <Dropdown.Item onClick={() => setView("assigned")}>
                  Assigned
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            <Form.Control
              type="text"
              placeholder="Search by NIC or Name"
              value={searchTerm}
              onChange={handleSearch}
              className={darkMode ? "bg-dark text-white border-secondary" : ""}
              style={{ width: "250px" }}
            />
          </div>
          {view === "unassigned" && (
            <Button variant="success" onClick={handleAssignButtonClick}>
              Assign Selected CVs
            </Button>
          )}
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

        {view === "unassigned" ? (
          <Table striped bordered hover variant={darkMode ? "dark" : "light"}>
            <thead>
              <tr>
                <th>Select</th>
                <th>Ref. No.</th>
                <th>NIC</th>
                <th>Full Name</th>
                <th>Intern Type</th>
                <th>CV From</th>
                <th>District</th>
                <th>Application Date</th>
                <th>Previous Stations</th>
              </tr>
            </thead>
            <tbody>
              {filteredUnassignedCVs.map((cv) => (
                <tr key={cv._id}>
                  <td>
                    <Form.Check
                      type="checkbox"
                      checked={selectedCVs.includes(cv._id)}
                      onChange={() => handleCVSelection(cv._id)}
                    />
                  </td>
                  <td>{cv.refNo || "N/A"}</td>
                  <td>{cv.nic || "N/A"}</td>
                  <td>{cv.fullName || "N/A"}</td>
                  <td>{cv.selectedRole || "N/A"}</td>
                  <td>{cv.userType || "N/A"}</td>
                  <td>{cv.district || "N/A"}</td>
                  <td>{formatDate(cv.applicationDate)}</td>
                  <td>
                    {cv.assignedStation && cv.assignedStation.length > 0 ? (
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
                          View History ({cv.assignedStation.length})
                        </Button>
                      </OverlayTrigger>
                    ) : (
                      "No previous stations"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <Table striped bordered hover variant={darkMode ? "dark" : "light"}>
            <thead>
              <tr>
                <th>Ref. No.</th>
                <th>NIC</th>
                <th>Full Name</th>
                <th>Intern Type</th>
                <th>CV From</th>
                <th>District</th>
                <th>Current Station</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Previous Stations</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssignedCVs.map((cv) => {
                const latestAssignment =
                  cv.assignedStation?.[cv.assignedStation.length - 1];
                return (
                  <tr key={cv._id}>
                    <td>{cv.refNo || "N/A"}</td>
                    <td>{cv.nic || "N/A"}</td>
                    <td>{cv.fullName || "N/A"}</td>
                    <td>{cv.selectedRole || "N/A"}</td>
                    <td>{cv.userType || "N/A"}</td>
                    <td>{cv.district || "N/A"}</td>
                    <td>{latestAssignment?.station?.stationName || "N/A"}</td>
                    <td>{formatDate(latestAssignment?.startDate)}</td>
                    <td>{formatDate(latestAssignment?.endDate)}</td>
                    <td>
                      {cv.assignedStation && cv.assignedStation.length > 1 ? (
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
                            View History ({cv.assignedStation.length - 1})
                          </Button>
                        </OverlayTrigger>
                      ) : (
                        "No previous stations"
                      )}
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <Button
                          variant="success"
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
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </Container>

      {/* Assign CVs Modal */}
      <Modal
        show={showAssignModal}
        onHide={() => {
          setShowAssignModal(false);
          setError("");
        }}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Assign CVs to Station</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && (
            <Alert variant="danger" onClose={() => setError("")} dismissible>
              {error}
            </Alert>
          )}

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
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAssignModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAssignCVs}>
            Assign
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
                {currentCV.assignedStation &&
                currentCV.assignedStation.length > 0
                  ? currentCV.assignedStation[
                      currentCV.assignedStation.length - 1
                    ]?.station?.stationName || "N/A"
                  : "N/A"}
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
                <th>Duration</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {stationHistory.map((assignment, index) => (
                <tr
                  key={index}
                  style={
                    assignment.isCurrent
                      ? {
                          backgroundColor: darkMode ? "#2a6b9e" : "#cfe8ff",
                          fontWeight: "bold",
                        }
                      : {}
                  }
                >
                  <td>{index + 1}</td>
                  <td>
                    {assignment.station?.stationName || "Unknown Station"}
                  </td>
                  <td>{formatDate(assignment.startDate, "ddmmyyyy")}</td>
                  <td>{formatDate(assignment.endDate, "ddmmyyyy")}</td>
                  <td>{assignment.duration}</td>
                  <td>
                    <Badge bg={assignment.isCurrent ? "success" : "secondary"}>
                      {assignment.isCurrent ? "Current" : "Past"}
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

export default ScheduleCVs;
