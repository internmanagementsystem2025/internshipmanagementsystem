import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Table, Button, Container, Spinner, Alert, Form } from "react-bootstrap";
import { FaPenFancy, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import logo from "../../../assets/logo.png";
import ApproveModal from "../../../components/notifications/ApproveModal";
import DeclineModal from "../../../components/notifications/DeclineModal";

const ApproveExecutiveInternRequests = ({ darkMode }) => {
  const navigate = useNavigate();
  const [requestData, setRequestData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [requestToApprove, setRequestToApprove] = useState(null);
  const [requestToDecline, setRequestToDecline] = useState(null);
  const [batchApproval, setBatchApproval] = useState(false);
  const [batchDecline, setBatchDecline] = useState(false);

  // Get token from localStorage
  const token = localStorage.getItem("token");

  // Axios instance with authentication
  const api = axios.create({
    baseURL: "http://localhost:5000/api/executive-requests",
    headers: { Authorization: `Bearer ${token}` }
  });

  // Mock data for demonstration purposes
  const mockData = [
    {
      _id: "1",
      executiveName: "John Smith",
      startDate: "2025-05-01",
      endDate: "2025-08-31",
      headCount: 3,
      district: "Colombo",
      scheme: "Technical",
      dgmComment: "Approved for technical support team",
      dgmApproved: "Yes",
      adminApproved: "Pending",
      internAssigned: 0,
      requestDate: "2025-03-01"
    },
    {
      _id: "2",
      executiveName: "Sarah Johnson",
      startDate: "2025-06-15",
      endDate: "2025-09-15",
      headCount: 2,
      district: "Kandy",
      scheme: "Marketing",
      dgmComment: "Required for new product launch",
      dgmApproved: "Yes",
      adminApproved: "Pending",
      internAssigned: 0,
      requestDate: "2025-03-05"
    },
    {
      _id: "3",
      executiveName: "Mahesh Perera",
      startDate: "2025-05-15",
      endDate: "2025-07-15",
      headCount: 4,
      district: "Galle",
      scheme: "Administration",
      dgmComment: "Support required for quarterly audit",
      dgmApproved: "Yes",
      adminApproved: "Pending",
      internAssigned: 0,
      requestDate: "2025-03-02"
    }
  ];

  const fetchRequests = async () => {
    setLoading(true);
    setError("");
    try {
      if (!token) {
        navigate("/login");
        return;
      }
      
      setTimeout(() => {
        setRequestData(mockData);
        setLoading(false);
      }, 1000);
      
    } catch (error) {
      setError("Failed to fetch executive intern requests.");
      console.error("Error fetching requests:", error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [navigate]);

  const handleApprove = async () => {
    setError("");
    try {
      if (batchApproval) {
        console.log("Batch approving:", selectedRows);
      } else if (requestToApprove) {
        console.log("Approving single request:", requestToApprove._id);
      }
      setShowApproveModal(false);
      setBatchApproval(false);
      setRequestToApprove(null);
      setSelectedRows([]);
      fetchRequests();
    } catch (error) {
      console.error("Error approving request:", error.message);
      setError(`Failed to approve request(s): ${error.response?.data?.message || error.message}`);
    }
  };

  const handleDecline = async () => {
    setError("");
    try {
      if (batchDecline) {
        console.log("Batch declining:", selectedRows);
      } else if (requestToDecline) {
        console.log("Declining single request:", requestToDecline._id);
      }
      setShowDeclineModal(false);
      setBatchDecline(false);
      setRequestToDecline(null);
      setSelectedRows([]);
      fetchRequests();
    } catch (error) {
      console.error("Error declining request:", error.message);
      setError(`Failed to decline request(s): ${error.response?.data?.message || error.message}`);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedRows((prevSelected) =>
      prevSelected.includes(id) ? prevSelected.filter((rowId) => rowId !== id) : [...prevSelected, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedRows(selectedRows.length === currentRequests.length ? [] : currentRequests.map((req) => req._id));
  };

  const filteredRequests = requestData.filter(
    (request) =>
      request.executiveName?.toLowerCase().includes(filter.toLowerCase()) ||
      request.district?.toLowerCase().includes(filter.toLowerCase())
  );

  const indexOfLastRequest = currentPage * itemsPerPage;
  const indexOfFirstRequest = indexOfLastRequest - itemsPerPage;
  const currentRequests = filteredRequests.slice(indexOfFirstRequest, indexOfLastRequest);
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

  const columns = [
    "Select",
    "Executive Name",
    "Start Date",
    "End Date",
    "Head Count",
    "District",
    "Scheme",
    "DGM Comment",
    "DGM Approved",
    "Admin Approved",
    "Intern Assigned",
    "Approve",
    "Decline",
    "View"
  ];

  return (
    <div className={`d-flex flex-column min-vh-100 ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
      <Container className="text-center mt-4 mb-3">
        <img src={logo} alt="SLT Mobitel Logo" className="mx-auto d-block" style={{ height: "50px" }} />
        <h3 className="mt-3">EXECUTIVE INTERN REQUESTS</h3>
      </Container>

      <Container
        className="mt-4 p-4 rounded"
        style={{
          background: darkMode ? "#343a40" : "#ffffff",
          color: darkMode ? "white" : "black",
          border: darkMode ? "1px solid #454d55" : "1px solid #ced4da",
        }}
      >
        <h5 className="mb-3">
          <FaPenFancy className="me-2" style={{ fontSize: "1.2rem", color: darkMode ? "white" : "black" }} />
          Approve Executive Intern Requests
        </h5>

        <hr className={darkMode ? "border-light mt-3" : "border-dark mt-3"} />
        
        {/* Filter Input with Batch Buttons */}
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center mb-3">
          <div className="mb-2 mb-sm-0">
            <Form.Control
              type="text"
              placeholder="Filter by Executive Name or District"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{ maxWidth: "250px", width: "100%" }}
            />
          </div>
          <div className="d-flex justify-content-start flex-wrap">
            <Button
              variant="success"
              size="sm"
              onClick={() => {
                setBatchApproval(true);
                setBatchDecline(false);
                setShowApproveModal(true);
              }}
              disabled={selectedRows.length === 0}
              style={{ marginLeft: "10px", marginTop: "5px" }}
            >
              Batch Approve
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                setBatchDecline(true);
                setBatchApproval(false);
                setShowDeclineModal(true);
              }}
              disabled={selectedRows.length === 0}
              style={{ marginLeft: "10px", marginTop: "5px" }}
            >
              Batch Decline
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="danger" className="text-center mb-3" onClose={() => setError("")} dismissible>
            {error}
          </Alert>
        )}

        {loading ? (
          <div className="text-center">
            <Spinner animation="border" variant={darkMode ? "light" : "dark"} />
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <Table striped bordered hover variant={darkMode ? "dark" : "light"}>
                <thead>
                  <tr>
                    <th>
                      <Form.Check
                        type="checkbox"
                        checked={selectedRows.length === currentRequests.length && currentRequests.length > 0}
                        onChange={handleSelectAll}
                      />
                    </th>
                    {columns.slice(1).map((col, index) => (
                      <th key={index}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {currentRequests.length > 0 ? (
                    currentRequests.map((request, index) => (
                      <tr key={request._id || index}>
                        <td>
                          <Form.Check
                            type="checkbox"
                            checked={selectedRows.includes(request._id)}
                            onChange={() => handleSelectRow(request._id)}
                          />
                        </td>
                        <td>{request.executiveName || "N/A"}</td>
                        <td>{request.startDate ? new Date(request.startDate).toLocaleDateString() : "N/A"}</td>
                        <td>{request.endDate ? new Date(request.endDate).toLocaleDateString() : "N/A"}</td>
                        <td>{request.headCount || "N/A"}</td>
                        <td>{request.district || "N/A"}</td>
                        <td>{request.scheme || "N/A"}</td>
                        <td>{request.dgmComment || "N/A"}</td>
                        <td>{request.dgmApproved || "N/A"}</td>
                        <td>{request.adminApproved || "N/A"}</td>
                        <td>{request.internAssigned || 0}</td>
                        <td>
                          <Button
                            size="sm"
                            variant="outline-success"
                            onClick={() => {
                              setRequestToApprove(request);
                              setBatchApproval(false);
                              setShowApproveModal(true);
                            }}
                            className="fw-semibold"
                          >
                            Approve
                          </Button>
                        </td>
                        <td>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => {
                              setRequestToDecline(request);
                              setBatchDecline(false);
                              setShowDeclineModal(true);
                            }}
                            className="fw-semibold"
                          >
                             Decline
                          </Button>
                        </td>
                        <td>
                          <Button 
                            size="sm" 
                            variant="outline-primary" 
                            onClick={() => navigate(`/view-request/${request._id}`)}
                            className="fw-semibold"
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={columns.length} className="text-center">
                        No requests found
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={columns.length} style={{ padding: "5px", fontSize: "14px" }}>
                      <div className="d-flex justify-content-between align-items-center" style={{ minHeight: "30px" }}>
                        <div className="flex-grow-1 text-center">
                          <span>{filteredRequests.length} request(s) in total • {selectedRows.length} selected</span>
                        </div>
                        <div className="d-flex align-items-center">
                          <Button
                            variant="link"
                            size="sm"
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            style={{ color: darkMode ? "white" : "black", padding: 0, margin: 0 }}
                          >
                            <FaChevronLeft />
                            <FaChevronLeft />
                          </Button>
                          <span className="mx-2">{`Page ${currentPage} of ${totalPages}`}</span>
                          <Button
                            variant="link"
                            size="sm"
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            style={{ color: darkMode ? "white" : "black", padding: 0, margin: 0 }}
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
          </>
        )}
      </Container>

      {/* Approve Modal */}
      <ApproveModal
        show={showApproveModal}
        onClose={() => {
          setShowApproveModal(false);
          setBatchApproval(false);
          setRequestToApprove(null);
        }}
        onConfirm={handleApprove}
        refNo={batchApproval ? `${selectedRows.length} selected requests` : requestToApprove?.executiveName}
        darkMode={darkMode}
      />

    <DeclineModal
        show={showDeclineModal}
        onClose={() => {
          setShowDeclineModal(false);
          setBatchDecline(false);
          setCvToDecline(null);
        }}
        onConfirm={handleDecline}
        refNo={batchDecline ? `${selectedRows.length} selected requests` : requestToDecline?.executiveName}
        darkMode={darkMode}
      />
    </div>
  );
};

export default ApproveExecutiveInternRequests;