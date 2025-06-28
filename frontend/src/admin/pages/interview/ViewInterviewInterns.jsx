import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  Button,
  Container,
  Spinner,
  Alert,
  Form,
  Badge,
} from "react-bootstrap";
import { FaChevronLeft, FaChevronRight, FaUser, FaEye } from "react-icons/fa";
import axios from "axios";
import PropTypes from "prop-types";

const ViewInterviewInterns = ({ darkMode, interviewId }) => {
  const navigate = useNavigate();
  const [interns, setInterns] = useState([]);
  const [interviewDetails, setInterviewDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState("");
  const [actionLoading, setActionLoading] = useState({}); // Track loading per intern
  const itemsPerPage = 20;

  // Fetch interview details and assigned interns from backend
  const fetchInterviewInterns = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch interview details
      const interviewResponse = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/interviews/${interviewId}`
      );
      setInterviewDetails(interviewResponse.data);

      // Fetch interns assigned to this interview
      const internsResponse = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/interviews/${interviewId}/interns`
      );
      setInterns(internsResponse.data);
    } catch (error) {
      console.error("Error fetching interview interns:", error);
      setError("Failed to load interns for this interview. Please try again.");
      setInterviewDetails(null);
      setInterns([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (interviewId) {
      fetchInterviewInterns();
    }
  }, [interviewId]);

  // Filter interns based on name or NIC
  const filteredInterns = interns.filter((intern) =>
    intern.fullName?.toLowerCase().includes(filter.toLowerCase()) ||
    intern.nic?.toLowerCase().includes(filter.toLowerCase()) ||
    intern.refNo?.toLowerCase().includes(filter.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredInterns.length / itemsPerPage);
  const indexOfLastIntern = currentPage * itemsPerPage;
  const indexOfFirstIntern = indexOfLastIntern - itemsPerPage;
  const currentInterns = filteredInterns.slice(
    indexOfFirstIntern,
    indexOfLastIntern
  );

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Reset to first page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  // Get status badge variant
  const getStatusBadge = (status) => {
    switch (status) {
      case "interview-scheduled":
        return <Badge bg="primary">Scheduled</Badge>;
      case "interview-rescheduled":
        return <Badge bg="warning">Rescheduled</Badge>;
      case "interview-passed":
        return <Badge bg="success">Passed</Badge>;
      case "interview-failed":
        return <Badge bg="danger">Failed</Badge>;
      case "interview-pending":
        return <Badge bg="secondary">Pending</Badge>;
      default:
        return <Badge bg="secondary">{status || "Unknown"}</Badge>;
    }
  };

  // Handle status update
  const handleStatusUpdate = async (internId, newStatus) => {
    setActionLoading((prev) => ({ ...prev, [internId]: true }));
    try {
      await axios.patch(
        `${import.meta.env.VITE_BASE_URL}/api/interviews/${interviewId}/interns/${internId}/status`,
        { status: newStatus }
      );
      await fetchInterviewInterns();
    } catch (err) {
      alert("Failed to update status. Please try again.");
    } finally {
      setActionLoading((prev) => ({ ...prev, [internId]: false }));
    }
  };

  return (
    <Container
      className="mt-4 p-4 rounded"
      style={{
        background: darkMode ? "#343a40" : "#ffffff",
        color: darkMode ? "white" : "black",
        border: darkMode ? "1px solid #454d55" : "1px solid #ced4da",
      }}
    >
      {/* Header */}
      <div className="d-flex align-items-center mb-3">
        <FaUser
          className="me-2"
          style={{ fontSize: "1.2rem", color: darkMode ? "white" : "black" }}
        />
        <h5 className="mb-0">
          Interns in {interviewDetails?.interviewName || "Interview"}
        </h5>
      </div>

      {/* Interview Details Summary */}
      {interviewDetails && (
        <div className="mb-3 p-3 rounded" style={{ backgroundColor: darkMode ? "#495057" : "#f8f9fa" }}>
          <div className="row">
            <div className="col-md-3">
              <strong>Interview Date:</strong> {interviewDetails.interviewDate || "N/A"}
            </div>
            <div className="col-md-3">
              <strong>Time:</strong> {interviewDetails.interviewTime || "N/A"}
            </div>
            <div className="col-md-6">
              <strong>Location:</strong> {interviewDetails.location || "N/A"}
            </div>
          </div>
        </div>
      )}

      <hr className={darkMode ? "border-light mt-3" : "border-dark mt-3"} />

      {/* Filter Section and Go Back Button */}
      <div className="d-flex flex-wrap justify-content-between mb-3">
        <Form.Group
          className="mb-0"
          style={{ maxWidth: "300px", flex: "1 1 100%" }}
        >
          <Form.Control
            type="text"
            placeholder="Filter by Name, NIC, or Ref No"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            disabled={loading}
          />
        </Form.Group>

        <div className="d-flex align-items-center mt-2 mt-sm-0">
          <small className={darkMode ? "text-light me-3" : "text-muted me-3"}>
            Total: {filteredInterns.length} intern(s)
          </small>
          <Button
            variant="danger"
            onClick={() => navigate(-1)}
            disabled={loading}
            size="sm"
          >
            Go Back
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" role="status" />
          <p className="mt-3">Loading interns...</p>
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <>
          {/* Table */}
          <Table
            striped
            bordered
            hover
            variant={darkMode ? "dark" : "light"}
            responsive
          >
            <thead>
              <tr>
                <th>#</th>
                <th>Ref No</th>
                <th>Full Name</th>
                <th>NIC</th>
                <th>Email</th>
                <th>Category</th>
                <th className="text-center">View CV</th>
              </tr>
            </thead>
            <tbody>
              {currentInterns.length > 0 ? (
                currentInterns.map((intern, index) => (
                  <tr key={intern._id}>
                    <td>{indexOfFirstIntern + index + 1}</td>
                    <td>
                      {intern.refNo ||
                        intern.application?.refNo ||
                        "N/A"}
                    </td>
                    <td>{intern.fullName || "N/A"}</td>
                    <td>{intern.nic || "N/A"}</td>
                    <td>{intern.emailAddress || "N/A"}</td>
                    <td>
                      {intern.category ||
                        (intern.selectedRole === "dataEntry"
                          ? "Data Entry Operator"
                          : intern.selectedRole === "internship"
                          ? "Internship"
                          : "N/A")}
                    </td>
                    <td className="text-center">
                      <Button 
                        size="sm"
                        variant="outline-primary"
                        onClick={() => navigate(`/view-cv/${intern._id}`)}
                        className="fw-semibold"
                        title="View CV Details"
                      >
                        <FaEye />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="text-center py-4">
                    {filter ? (
                      <>
                        <p className="mb-2">No interns found matching "{filter}"</p>
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => setFilter("")}
                        >
                          Clear filter
                        </Button>
                      </>
                    ) : (
                      <p className="mb-2">No interns assigned to this interview yet</p>
                    )}
                  </td>
                </tr>
              )}
            </tbody>

            {/* Pagination Footer */}
            {totalPages > 1 && (
              <tfoot>
                <tr>
                  <td colSpan={9} style={{ padding: "10px", fontSize: "14px" }}>
                    <div
                      className="d-flex justify-content-between align-items-center"
                      style={{ minHeight: "30px" }}
                    >
                      <div className="flex-grow-1 text-center">
                        Showing {indexOfFirstIntern + 1} to{" "}
                        {Math.min(indexOfLastIntern, filteredInterns.length)} of{" "}
                        {filteredInterns.length} intern(s)
                      </div>
                      <div className="d-flex align-items-center">
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          style={{
                            color: darkMode ? "white" : "black",
                            padding: "0 5px",
                          }}
                          title="Previous Page"
                        >
                          <FaChevronLeft />
                        </Button>
                        <span className="mx-2">
                          Page {currentPage} of {totalPages}
                        </span>
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          style={{
                            color: darkMode ? "white" : "black",
                            padding: "0 5px",
                          }}
                          title="Next Page"
                        >
                          <FaChevronRight />
                        </Button>
                      </div>
                    </div>
                  </td>
                </tr>
              </tfoot>
            )}
          </Table>
        </>
      )}
    </Container>
  );
};

ViewInterviewInterns.propTypes = {
  darkMode: PropTypes.bool.isRequired,
  interviewId: PropTypes.string.isRequired,
};

export default ViewInterviewInterns;
