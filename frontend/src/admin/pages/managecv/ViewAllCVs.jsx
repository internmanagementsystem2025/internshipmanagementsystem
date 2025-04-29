import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Table,
  Button,
  Container,
  Spinner,
  Alert,
  Form,
  Row,
  Col,
  ButtonGroup,
} from "react-bootstrap";
import { FaChevronLeft, FaChevronRight, FaFileCode } from "react-icons/fa";
import logo from "../../../assets/logo.png";
import ConfirmDeleteModal from "../../../components/notifications/ConfirmDeleteModal";
const API_BASE_URL = import.meta.env.VITE_BASE_URL;
const ViewAllCVs = ({ darkMode }) => {
  const [cvData, setCvData] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("fullName");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const itemsPerPage = 20;
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [cvToDelete, setCvToDelete] = useState(null);

  const [filteredData, setFilteredData] = useState([]);
  useEffect(() => {
    const fetchCVs = async () => {
      setLoading(true);
      setError("");

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await axios.get(
          `${API_BASE_URL}/cvs/get-all-with-filtering`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: {
              status: statusFilter === "all" ? undefined : statusFilter,
              search: searchTerm || undefined,
              filterBy: filterCategory,
            },
          }
        );

        if (response.status === 200 && Array.isArray(response.data)) {
          setCvData(response.data);
          setFilteredData(response.data);
        } else {
          setError("Unexpected response format from the server.");
        }
      } catch (error) {
        setError(error.response?.data?.message || "Failed to fetch CV data.");
      } finally {
        setLoading(false);
      }
    };

    fetchCVs();
  }, [navigate]);

  useEffect(() => {
    const applyFilters = () => {
      let filtered = [...cvData];

      // Apply search term filter
      if (searchTerm) {
        filtered = filtered.filter((cv) => {
          const value = (cv[filterCategory] || "").toString().toLowerCase();
          return value.includes(searchTerm.toLowerCase());
        });
      }

      // Apply status filter
      if (statusFilter !== "all") {
        filtered = filtered.filter((cv) => {
          if (statusFilter === "cv-approved") {
            return cv.currentStatus === "cv-approved";
          } else if (statusFilter === "cv-pending") {
            return (
              cv.currentStatus === "cv-submitted" ||
              cv.currentStatus === "cv-pending"
            );
          } else if (statusFilter === "interview-scheduled") {
            return cv.currentStatus === "interview-scheduled";
          }
          return true;
        });
      }

      // Apply date filter
      if (dateFilter !== "all") {
        filtered.sort((a, b) => {
          const dateA = new Date(a.applicationDate || 0);
          const dateB = new Date(b.applicationDate || 0);
          return dateFilter === "newest" ? dateB - dateA : dateA - dateB;
        });
      }

      setFilteredData(filtered);
      setCurrentPage(1);
    };

    applyFilters();
  }, [searchTerm, filterCategory, statusFilter, dateFilter, cvData]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
  const indexOfLastCV = currentPage * itemsPerPage;
  const indexOfFirstCV = indexOfLastCV - itemsPerPage;
  const currentCVs = filteredData.slice(indexOfFirstCV, indexOfLastCV);
  const isValidMongoId = (id) => {
    return id && /^[0-9a-fA-F]{24}$/.test(id);
  };
  const columns = [
    "#",
    "NIC",
    "Ref No",
    "Name",
    "CV From",
    "Intern Type",
    "Application Date",
    "District",
    "Institute",
    "Referred By",
    "Status",
    "View",
    "Delete",
  ];

  const handleView = (cvId) => {
    if (!isValidMongoId(cvId)) {
      alert("Invalid CV ID format");
      return;
    }
    navigate(`/view-cv/${cvId}`);
  };

  // Update your fetchCVs function to validate IDs
  useEffect(() => {
    const fetchCVs = async () => {
      setLoading(true);
      setError("");

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await axios.get(
          `${API_BASE_URL}/cvs/get-all-with-filtering`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: {
              status: statusFilter === "all" ? undefined : statusFilter,
              search: searchTerm || undefined,
              filterBy: filterCategory,
            },
          }
        );

        if (response.status === 200 && Array.isArray(response.data)) {
          // Filter out any CVs with invalid IDs
          const validCVs = response.data.filter((cv) => isValidMongoId(cv._id));
          setCvData(validCVs);
          setFilteredData(validCVs);
        } else {
          setError("Unexpected response format from the server.");
        }
      } catch (error) {
        setError(error.response?.data?.message || "Failed to fetch CV data.");
      } finally {
        setLoading(false);
      }
    };

    fetchCVs();
  }, [navigate]);

  const handleDelete = async () => {
    if (!cvToDelete) return;

    // Validate ID format
    if (!isValidMongoId(cvToDelete)) {
      alert("Invalid CV ID format");
      setShowDeleteModal(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.delete(`${API_BASE_URL}/cvs/${cvToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        setCvData(cvData.filter((cv) => cv._id !== cvToDelete));
        setFilteredData((prev) => prev.filter((cv) => cv._id !== cvToDelete));
      } else {
        alert("Failed to delete CV. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting CV:", error);
      alert(
        error.response?.data?.message ||
          "Failed to delete CV. Please try again."
      );
    } finally {
      setShowDeleteModal(false);
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
          alt="SLT Mobitel Logo"
          className="mx-auto d-block"
          style={{ height: "50px" }}
        />
        <h3 className="mt-3">VIEW ALL CVs</h3>
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
          <FaFileCode
            className="me-2"
            style={{ fontSize: "1.2rem", color: darkMode ? "white" : "black" }}
          />
          view All CVs
        </h5>
        <hr className={darkMode ? "border-light mt-3" : "border-dark mt-3"} />

        {/* Filter Section */}
        <Row className="mb-3">
          <Col md={3} sm={6} xs={12}>
            <Form.Group controlId="filterCategory">
              <Form.Label>Filter Category</Form.Label>
              <Form.Select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="fullName">Name</option>
                <option value="nic">NIC</option>
                <option value="refNo">Ref No</option>
                <option value="district">District</option>
                <option value="institute">Institute</option>
                <option value="userType">CV From</option>
                <option value="selectedRole">Intern Type</option>
                <option value="referredBy">Referred By</option>
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={5} sm={12} xs={12}>
            <Form.Group controlId="searchInput">
              <Form.Label>Search</Form.Label>
              <Form.Control
                type="text"
                placeholder={`Search by ${filterCategory}`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: "100%" }}
              />
            </Form.Group>
          </Col>
          <Col
            md={4}
            sm={6}
            xs={12}
            className="d-flex justify-content-md-end justify-content-center mt-3 mt-md-0"
          >
            <Button
              variant="primary"
              onClick={() => navigate("/admin-add-cv")}
              className="mx-2"
              style={{ width: "auto" }}
            >
              Add New CV
            </Button>

            <Button
              variant="secondary"
              onClick={() => navigate("/schedule-interview")}
              className="mx-2"
              style={{ width: "auto" }}
            >
              Schedule Interview
            </Button>
          </Col>
        </Row>

        {/* Button Filter Section */}
        <Row className="mb-4">
          {/* Status Filter */}
          <Col md={6}>
            <Form.Label>Status Filter</Form.Label>
            <div>
              <ButtonGroup>
                <Button
                  variant={
                    statusFilter === "all" ? "outline-dark" : "outline-dark"
                  }
                  onClick={() => setStatusFilter("all")}
                  style={
                    statusFilter === "all"
                      ? { backgroundColor: "#6c757d", color: "white" }
                      : {}
                  }
                >
                  All CVs
                </Button>
                <Button
                  variant={
                    statusFilter === "approved"
                      ? "outline-dark"
                      : "outline-dark"
                  }
                  onClick={() => setStatusFilter("approved")}
                  style={
                    statusFilter === "approved"
                      ? { backgroundColor: "#6c757d", color: "white" }
                      : {}
                  }
                >
                  Approved CVs
                </Button>
                <Button
                  variant={
                    statusFilter === "pending" ? "outline-dark" : "outline-dark"
                  }
                  onClick={() => setStatusFilter("pending")}
                  style={
                    statusFilter === "pending"
                      ? { backgroundColor: "#6c757d", color: "white" }
                      : {}
                  }
                >
                  Pending CVs
                </Button>
                <Button
                  variant={
                    statusFilter === "interview"
                      ? "outline-dark"
                      : "outline-dark"
                  }
                  onClick={() => setStatusFilter("interview")}
                  style={
                    statusFilter === "interview"
                      ? { backgroundColor: "#6c757d", color: "white" }
                      : {}
                  }
                >
                  Interview Stage
                </Button>
              </ButtonGroup>
            </div>
          </Col>

          {/* Date Filter */}
          <Col md={6}>
            <Form.Label>Date Filter</Form.Label>
            <div>
              <ButtonGroup>
                <Button
                  variant={
                    dateFilter === "all" ? "outline-dark" : "outline-dark"
                  }
                  onClick={() => setDateFilter("all")}
                  style={
                    dateFilter === "all"
                      ? { backgroundColor: "#6c757d", color: "white" }
                      : {}
                  }
                >
                  All Dates
                </Button>
                <Button
                  variant={
                    dateFilter === "newest" ? "outline-dark" : "outline-dark"
                  }
                  onClick={() => setDateFilter("newest")}
                  style={
                    dateFilter === "newest"
                      ? { backgroundColor: "#6c757d", color: "white" }
                      : {}
                  }
                >
                  Newest First
                </Button>
                <Button
                  variant={
                    dateFilter === "earliest" ? "outline-dark" : "outline-dark"
                  }
                  onClick={() => setDateFilter("earliest")}
                  style={
                    dateFilter === "earliest"
                      ? { backgroundColor: "#6c757d", color: "white" }
                      : {}
                  }
                >
                  Earliest First
                </Button>
              </ButtonGroup>
            </div>
          </Col>
        </Row>

        {loading ? (
          <div className="text-center">
            <Spinner animation="border" variant={darkMode ? "light" : "dark"} />
          </div>
        ) : error ? (
          <Alert variant="danger" className="text-center">
            {error}
          </Alert>
        ) : (
          <>
            <Table
              striped
              bordered
              hover
              variant={darkMode ? "dark" : "light"}
              responsive
            >
              <thead>
                <tr>
                  {columns.map((col, index) => (
                    <th key={index}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentCVs.length > 0 ? (
                  currentCVs.map((cv, index) => (
                    <tr key={cv._id || index}>
                      <td>{indexOfFirstCV + index + 1}</td>
                      <td>{cv.nic || "N/A"}</td>
                      <td>{cv.refNo || "N/A"}</td>
                      <td>{cv.fullName || "N/A"}</td>
                      <td>{cv.userType || "N/A"}</td>
                      <td>{cv.selectedRole || "N/A"}</td>
                      <td>
                        {cv.applicationDate
                          ? new Date(cv.applicationDate).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td>{cv.district || "N/A"}</td>
                      <td>{cv.institute || "N/A"}</td>
                      <td>{cv.referredBy || "N/A"}</td>
                      <td>
                        <span
                          className={`badge ${
                            cv.currentStatus === "approved"
                              ? "bg-success"
                              : cv.currentStatus === "rejected"
                              ? "bg-danger"
                              : cv.currentStatus === "interview-scheduled" ||
                                cv.currentStatus === "induction-assigned" ||
                                cv.currentStatus === "schema-assigned"
                              ? "bg-info"
                              : "bg-warning"
                          }`}
                        >
                          {cv.currentStatus
                            ? cv.currentStatus.toUpperCase().replace("-", " ")
                            : "PENDING"}
                        </span>
                      </td>
                      <td>
                        <Button
                          size="sm"
                          variant="outline-primary"
                          onClick={() => handleView(cv._id)}
                          className="fw-semibold"
                        >
                          View
                        </Button>
                      </td>
                      <td>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => {
                            setShowDeleteModal(true);
                            setCvToDelete(cv._id);
                          }}
                          className="fw-semibold"
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="13" className="text-center">
                      No CVs found
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr>
                  <td
                    colSpan={columns.length}
                    style={{ padding: "5px", fontSize: "14px" }}
                  >
                    <div
                      className="d-flex justify-content-between align-items-center"
                      style={{ minHeight: "30px" }}
                    >
                      <div className="flex-grow-1 text-center">
                        <span>
                          {filteredData.length} of {cvData.length} CV(s) shown
                        </span>
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
                          Page {currentPage} of {totalPages}
                        </span>
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(prev + 1, totalPages)
                            )
                          }
                          disabled={currentPage === totalPages}
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
          </>
        )}
      </Container>
      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        refNo={cvData.find((cv) => cv._id === cvToDelete)?.refNo || "N/A"}
        darkMode={darkMode}
      />
    </div>
  );
};

export default ViewAllCVs;
