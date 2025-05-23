// Fixed ViewAllCVs.jsx - Updated delete modal usage
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
import DeleteConfirmationModal from "../../../components/notifications/DeleteConfirmationModal";

const API_BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5000/api";

const ViewAllCVs = ({ darkMode = false }) => {
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
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Helper function to render name with gender prefix
  const renderNameWithPrefix = (fullName, gender) => {
    const name = fullName || "N/A";
    if (gender?.toLowerCase() === 'male') {
      return `Mr. ${name}`;
    } else if (gender?.toLowerCase() === 'female') {
      return `Ms. ${name}`;
    }
    return name;
  };

  // Helper function to check if any CV has internship role
  const hasInternshipCVs = () => {
    return filteredData.some(cv => cv.selectedRole === 'internship');
  };

  // Validate MongoDB ObjectId
  const isValidMongoId = (id) => {
    return id && typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);
  };

  // Fetch CVs from API
  useEffect(() => {
    const fetchCVs = async () => {
      setLoading(true);
      setError("");

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Authentication token not found. Please login again.");
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

        if (response.status === 200) {
          const data = Array.isArray(response.data) ? response.data : [];
          // Filter out any CVs with invalid IDs
          const validCVs = data.filter((cv) => cv && cv._id && isValidMongoId(cv._id));
          setCvData(validCVs);
          setError("");
        } else {
          setError("Unexpected response format from the server.");
        }
      } catch (error) {
        console.error("Error fetching CVs:", error);
        if (error.response?.status === 401) {
          setError("Session expired. Please login again.");
          localStorage.removeItem("token");
          navigate("/login");
        } else {
          setError(error.response?.data?.message || "Failed to fetch CV data. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCVs();
  }, [navigate, statusFilter, searchTerm, filterCategory]);

  // Apply filters to CV data
  useEffect(() => {
    const applyFilters = () => {
      let filtered = [...cvData];

      // Apply search term filter
      if (searchTerm && searchTerm.trim()) {
        filtered = filtered.filter((cv) => {
          const value = (cv[filterCategory] || "").toString().toLowerCase();
          return value.includes(searchTerm.toLowerCase().trim());
        });
      }

      // Apply status filter
      if (statusFilter !== "all") {
        filtered = filtered.filter((cv) => {
          const currentStatus = cv.currentStatus || "";
          
          switch (statusFilter) {
            case "cv-approved":
              return currentStatus === "cv-approved";
            case "cv-pending":
              return currentStatus === "cv-submitted" || currentStatus === "cv-pending" || !currentStatus;
            case "interview-scheduled":
              return (
                currentStatus === "interview-scheduled" ||
                currentStatus === "induction-scheduled" ||
                currentStatus === "schema-assigned" ||
                currentStatus.includes("interview") ||
                currentStatus.includes("induction") ||
                currentStatus.includes("schema")
              );
            case "cv-rejected":
              return currentStatus === "cv-rejected";
            default:
              return true;
          }
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

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
  const indexOfLastCV = currentPage * itemsPerPage;
  const indexOfFirstCV = indexOfLastCV - itemsPerPage;
  const currentCVs = filteredData.slice(indexOfFirstCV, indexOfLastCV);

  // Dynamic columns based on whether there are internship CVs
  const getColumns = () => {
    const baseColumns = [
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
    ];

    if (hasInternshipCVs()) {
      baseColumns.push("Category of Apply");
    }

    baseColumns.push("Status", "View", "Delete");
    return baseColumns;
  };

  const columns = getColumns();

  // Handle view CV
  const handleView = (cvId) => {
    if (!isValidMongoId(cvId)) {
      alert("Invalid CV ID format");
      return;
    }
    navigate(`/view-cv/${cvId}`);
  };

  // Handle delete CV with form data - FIXED
  const handleDelete = async (deletionData) => {
    if (!cvToDelete) return;

    // Validate ID format
    if (!isValidMongoId(cvToDelete._id)) {
      alert("Invalid CV ID format");
      setShowDeleteModal(false);
      return;
    }

    setDeleteLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      // Use the soft delete endpoint with the form data
      const response = await axios.delete(`${API_BASE_URL}/cvs/${cvToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` },
        data: {
          adminName: deletionData.adminName,
          employeeId: deletionData.employeeId,
          deletionReason: deletionData.deletionReason,
          deletionComments: deletionData.deletionComments
        }
      });

      if (response.status === 200) {
        // Remove the CV from the current data
        setCvData(prevData => prevData.filter((cv) => cv._id !== cvToDelete._id));
        setFilteredData(prevData => prevData.filter((cv) => cv._id !== cvToDelete._id));
        
        // Show success message
        alert(`CV deleted successfully! 
        
Deletion Details:
- Ref No: ${response.data.deletionInfo?.refNo || cvToDelete.refNo || 'N/A'}  
- Deleted by: ${response.data.deletionInfo?.deletedBy || deletionData.adminName || 'N/A'}
- Reason: ${deletionData.deletionReason.replace(/_/g, ' ').toUpperCase()}

The CV has been moved to deleted items and can be restored by administrators if needed.`);
      } else {
        alert("Failed to delete CV. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting CV:", error);
      
      let errorMessage = "Failed to delete CV. Please try again.";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 400) {
        errorMessage = "Invalid request. Please check all required fields are filled correctly.";
      } else if (error.response?.status === 404) {
        errorMessage = "CV not found or may have already been deleted.";
      } else if (error.response?.status === 401) {
        errorMessage = "Session expired. Please login again.";
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }
      
      alert(errorMessage);
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
      setCvToDelete(null);
    }
  };

  // Handle opening delete modal - FIXED
  const handleDeleteClick = (cvId) => {
    const cvToDeleteData = cvData.find((cv) => cv._id === cvId);
    if (cvToDeleteData) {
      setCvToDelete(cvToDeleteData); // Pass the full CV object instead of just ID
      setShowDeleteModal(true);
    } else {
      alert("CV not found");
    }
  };

  // Handle closing delete modal
  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setCvToDelete(null);
    setDeleteLoading(false);
  };

  // Format status display
  const formatStatus = (status) => {
    if (!status) return "PENDING";
    return status.toUpperCase().replace(/-/g, " ");
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "cv-approved":
        return "bg-success";
      case "cv-rejected":
        return "bg-danger";
      case "interview-scheduled":
      case "induction-assigned":
      case "schema-assigned":
        return "bg-info";
      default:
        return "bg-warning";
    }
  };

  // Render main content
  if (loading) {
    return (
      <div
        className={`d-flex flex-column min-vh-100 justify-content-center align-items-center ${
          darkMode ? "bg-dark text-white" : "bg-light text-dark"
        }`}
      >
        <Spinner animation="border" variant={darkMode ? "light" : "dark"} />
        <p className="mt-3">Loading CV data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`d-flex flex-column min-vh-100 ${
          darkMode ? "bg-dark text-white" : "bg-light text-dark"
        }`}
      >
        <Container className="text-center mt-4">
          <Alert variant="danger">
            <h5>Error Loading CVs</h5>
            <p>{error}</p>
            <Button 
              variant="outline-danger" 
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </Alert>
        </Container>
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
          alt="SLT Mobitel Logo"
          className="mx-auto d-block"
          style={{ height: "50px" }}
          onError={(e) => {
            e.target.style.display = 'none';
          }}
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
          View All CVs
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
              <ButtonGroup className="flex-wrap">
                {[
                  { key: "all", label: "All CVs" },
                  { key: "cv-approved", label: "Approved CVs" },
                  { key: "cv-pending", label: "Pending CVs" },
                  { key: "interview-scheduled", label: "Interview Stage" },
                  { key: "cv-rejected", label: "Rejected CVs" }
                ].map(({ key, label }) => (
                  <Button
                    key={key}
                    variant="outline-dark"
                    onClick={() => setStatusFilter(key)}
                    style={
                      statusFilter === key
                        ? { backgroundColor: "#6c757d", color: "white" }
                        : {}
                    }
                    className="mb-2"
                  >
                    {label}
                  </Button>
                ))}
              </ButtonGroup>
            </div>
          </Col>

          {/* Date Filter */}
          <Col md={6}>
            <Form.Label>Date Filter</Form.Label>
            <div>
              <ButtonGroup className="flex-wrap">
                {[
                  { key: "all", label: "All Dates" },
                  { key: "newest", label: "Newest First" },
                  { key: "earliest", label: "Earliest First" }
                ].map(({ key, label }) => (
                  <Button
                    key={key}
                    variant="outline-dark"
                    onClick={() => setDateFilter(key)}
                    style={
                      dateFilter === key
                        ? { backgroundColor: "#6c757d", color: "white" }
                        : {}
                    }
                    className="mb-2"
                  >
                    {label}
                  </Button>
                ))}
              </ButtonGroup>
            </div>
          </Col>
        </Row>

        {/* CV Table */}
        <div className="table-responsive">
          <Table
            striped
            bordered
            hover
            variant={darkMode ? "dark" : "light"}
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
                    <td>
                      {renderNameWithPrefix(cv.fullName, cv.gender)}
                    </td>
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
                    {hasInternshipCVs() && (
                      <td>
                        {cv.selectedRole === 'internship' 
                          ? cv.roleData?.internship?.categoryOfApply || "N/A"
                          : "-"
                        }
                      </td>
                    )}
                    <td>
                      <span
                        className={`badge ${getStatusBadgeClass(cv.currentStatus)}`}
                      >
                        {formatStatus(cv.currentStatus)}
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
                        onClick={() => handleDeleteClick(cv._id)}
                        className="fw-semibold"
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="text-center">
                    {searchTerm || statusFilter !== "all" || dateFilter !== "all" 
                      ? "No CVs found matching your criteria" 
                      : "No CVs found"}
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
        </div>
      </Container>
      
      {/* Delete Confirmation Modal - FIXED PROPS */}
      <DeleteConfirmationModal
        show={showDeleteModal}
        onClose={handleCloseDeleteModal}
        onDelete={handleDelete}
        cvData={cvToDelete} // Now passing the full CV object
        darkMode={darkMode}
        loading={deleteLoading}
      />
    </div>
  );
};

export default ViewAllCVs;