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

const ViewInductionInterns = ({ darkMode, inductionId }) => {
  const navigate = useNavigate();
  const [interns, setInterns] = useState([]);
  const [inductionDetails, setInductionDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState("");
  const itemsPerPage = 20;

  // Dummy data for induction interns
  const dummyInductionDetails = {
    _id: inductionId || "dummy-induction-id",
    induction: "Software Development Fundamentals",
    startDate: "2024-01-15",
    time: "09:00",
    location: "Training Room A, SLT Mobitel Headquarters",
  };

  const dummyInterns = [
    {
      _id: "intern-001",
      refNo: "INT-2024-001",
      fullName: "Amal Perera",
      nic: "199801234567",
      emailAddress: "amal.perera@email.com",
      mobileNumber: "0771234567",
      induction: {
        inductionId: inductionId || "dummy-induction-id",
        status: "induction-assigned",
        result: {
          evaluatedDate: "2024-01-15T10:00:00.000Z",
        },
      },
    },
    {
      _id: "intern-002",
      refNo: "INT-2024-002",
      fullName: "Nimal Silva",
      nic: "199701234568",
      emailAddress: "nimal.silva@email.com",
      mobileNumber: "0771234568",
      induction: {
        inductionId: inductionId || "dummy-induction-id",
        status: "induction-passed",
        result: {
          evaluatedDate: "2024-01-15T11:30:00.000Z",
        },
      },
    },
    {
      _id: "intern-003",
      refNo: "INT-2024-003",
      fullName: "Saman Fernando",
      nic: "199901234569",
      emailAddress: "saman.fernando@email.com",
      mobileNumber: "0771234569",
      induction: {
        inductionId: inductionId || "dummy-induction-id",
        status: "induction-failed",
        result: {
          evaluatedDate: "2024-01-15T14:00:00.000Z",
        },
      },
    },
    {
      _id: "intern-004",
      refNo: "INT-2024-004",
      fullName: "Kamala Jayasinghe",
      nic: "199801234570",
      emailAddress: "kamala.jayasinghe@email.com",
      mobileNumber: "0771234570",
      induction: {
        inductionId: inductionId || "dummy-induction-id",
        status: "induction-re-scheduled",
        result: {
          evaluatedDate: "2024-01-16T09:00:00.000Z",
        },
      },
    },
    {
      _id: "intern-005",
      refNo: "INT-2024-005",
      fullName: "Ruwan Wijesinghe",
      nic: "199701234571",
      emailAddress: "ruwan.wijesinghe@email.com",
      mobileNumber: "0771234571",
      induction: {
        inductionId: inductionId || "dummy-induction-id",
        status: "induction-pending",
        result: {
          evaluatedDate: "2024-01-17T10:00:00.000Z",
        },
      },
    },
    {
      _id: "intern-006",
      refNo: "INT-2024-006",
      fullName: "Dilani Kumari",
      nic: "199901234572",
      emailAddress: "dilani.kumari@email.com",
      mobileNumber: "0771234572",
      induction: {
        inductionId: inductionId || "dummy-induction-id",
        status: "induction-passed",
        result: {
          evaluatedDate: "2024-01-15T16:00:00.000Z",
        },
      },
    },
  ];

  // Fetch interns assigned to this induction
  const fetchInductionInterns = async () => {
    try {
      setLoading(true);
      setError("");

      // For demo purposes, use dummy data
      // In production, uncomment the API calls below

      // First get induction details
      
      const inductionResponse = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/inductions/${inductionId}`
      );
      setInductionDetails(inductionResponse.data);
      
      setInductionDetails(dummyInductionDetails);

      // Then get CVs assigned to this induction
      /*
      const internsResponse = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/cvs/assigned-to-induction`
      );

      // Filter CVs that are assigned to this specific induction
      const filteredInterns = internsResponse.data.filter(
        (intern) => intern.induction?.inductionId === inductionId
      );
      */

      const filteredInterns = dummyInterns.filter(
        (intern) => intern.induction?.inductionId === (inductionId || "dummy-induction-id")
      );

      setInterns(filteredInterns);
    } catch (error) {
      console.error("Error fetching induction interns:", error);
      setError("Failed to load interns for this induction. Please try again.");

      // Fallback to dummy data on error
      setInductionDetails(dummyInductionDetails);
      setInterns(dummyInterns);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (inductionId) {
      fetchInductionInterns();
    }
  }, [inductionId]);

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
      case "induction-assigned":
        return <Badge bg="primary">Assigned</Badge>;
      case "induction-re-scheduled":
        return <Badge bg="warning">Re-scheduled</Badge>;
      case "induction-passed":
        return <Badge bg="success">Passed</Badge>;
      case "induction-failed":
        return <Badge bg="danger">Failed</Badge>;
      case "induction-pending":
        return <Badge bg="secondary">Pending</Badge>;
      default:
        return <Badge bg="secondary">{status || "Unknown"}</Badge>;
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
          Interns in {inductionDetails?.induction || "Induction"}
        </h5>
      </div>

      {/* Induction Details Summary */}
      {inductionDetails && (
        <div className="mb-3 p-3 rounded" style={{ backgroundColor: darkMode ? "#495057" : "#f8f9fa" }}>
          <div className="row">
            <div className="col-md-3">
              <strong>Start Date:</strong> {inductionDetails.startDate || "N/A"}
            </div>
            <div className="col-md-3">
              <strong>Time:</strong> {inductionDetails.time || "N/A"}
            </div>
            <div className="col-md-6">
              <strong>Location:</strong> {inductionDetails.location || "N/A"}
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
                <th>Mobile</th>
                <th>Status</th>
                <th>Assigned Date</th>
                <th>View CV</th>
              </tr>
            </thead>
            <tbody>
              {currentInterns.length > 0 ? (
                currentInterns.map((intern, index) => (
                  <tr key={intern._id}>
                    <td>{indexOfFirstIntern + index + 1}</td>
                    <td>{intern.refNo || "N/A"}</td>
                    <td>{intern.fullName || "N/A"}</td>
                    <td>{intern.nic || "N/A"}</td>
                    <td>{intern.emailAddress || "N/A"}</td>
                    <td>{intern.mobileNumber || "N/A"}</td>
                    <td>{getStatusBadge(intern.induction?.status)}</td>
                    <td>
                      {intern.induction?.result?.evaluatedDate 
                        ? new Date(intern.induction.result.evaluatedDate).toLocaleDateString()
                        : "N/A"}
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
                      <p className="mb-2">No interns assigned to this induction yet</p>
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

ViewInductionInterns.propTypes = {
  darkMode: PropTypes.bool.isRequired,
  inductionId: PropTypes.string.isRequired,
};

export default ViewInductionInterns;
