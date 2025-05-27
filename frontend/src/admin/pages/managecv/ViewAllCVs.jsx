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
      { key: "#", label: "#", width: "60px" },
      { key: "nic", label: "NIC", width: "140px" },
      { key: "refNo", label: "Ref No", width: "120px" },
      { key: "name", label: "Name", width: "180px" },
      { key: "cvFrom", label: "CV From", width: "110px" },
      { key: "internType", label: "Intern Type", width: "130px" },
      { key: "applicationDate", label: "Application Date", width: "150px" },
      { key: "district", label: "District", width: "120px" },
      { key: "institute", label: "Institute", width: "200px" },
      { key: "referredBy", label: "Referred By", width: "140px" },
    ];

    if (hasInternshipCVs()) {
      baseColumns.push({ key: "categoryOfApply", label: "Category of Apply", width: "160px" });
    }

    baseColumns.push(
      { key: "status", label: "Status", width: "120px" },
      { key: "view", label: "View", width: "80px" },
      { key: "delete", label: "Delete", width: "80px" }
    );

    return baseColumns;
  };

  const columns = getColumns();

  // Calculate total table width
  const getTotalTableWidth = () => {
    return columns.reduce((total, col) => {
      return total + parseInt(col.width.replace('px', ''));
    }, 0);
  };

  // Handle view CV
  const handleView = (cvId) => {
    if (!isValidMongoId(cvId)) {
      alert("Invalid CV ID format");
      return;
    }
    navigate(`/view-cv/${cvId}`);
  };

  // Handle delete CV with form data
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

  // Handle opening delete modal
  const handleDeleteClick = (cvId) => {
    const cvToDeleteData = cvData.find((cv) => cv._id === cvId);
    if (cvToDeleteData) {
      setCvToDelete(cvToDeleteData); 
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

  // Enhanced table styles for better horizontal scrolling
  const tableContainerStyles = {
    overflowX: 'auto',
    overflowY: 'visible',
    WebkitOverflowScrolling: 'touch', 
    scrollbarWidth: 'auto',
    scrollbarColor: darkMode ? '#6c757d #343a40' : '#6c757d #f8f9fa', 
    border: darkMode ? '1px solid #454d55' : '1px solid #dee2e6',
    borderRadius: '0.375rem',
    boxShadow: darkMode 
      ? '0 0.125rem 0.25rem rgba(255, 255, 255, 0.075)' 
      : '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)',
    position: 'relative',
    minHeight: '200px' 
  };

  const scrollbarStyles = `
    .enhanced-table-container::-webkit-scrollbar {
      height: 12px;
      background-color: ${darkMode ? '#343a40' : '#f8f9fa'};
      border-radius: 6px;
    }
    
    .enhanced-table-container::-webkit-scrollbar-track {
      background-color: ${darkMode ? '#343a40' : '#f8f9fa'};
      border-radius: 6px;
      border: 1px solid ${darkMode ? '#454d55' : '#dee2e6'};
    }
    
    .enhanced-table-container::-webkit-scrollbar-thumb {
      background-color: ${darkMode ? '#6c757d' : '#adb5bd'};
      border-radius: 6px;
      border: 2px solid ${darkMode ? '#343a40' : '#f8f9fa'};
      transition: background-color 0.2s ease;
    }
    
    .enhanced-table-container::-webkit-scrollbar-thumb:hover {
      background-color: ${darkMode ? '#868e96' : '#868e96'};
    }
    
    .enhanced-table-container::-webkit-scrollbar-thumb:active {
      background-color: ${darkMode ? '#495057' : '#6c757d'};
    }
    
    .enhanced-table-container {
      scrollbar-width: auto;
      scrollbar-color: ${darkMode ? '#6c757d #343a40' : '#6c757d #f8f9fa'};
    }

    /* Fixed table layout with precise column widths */
    .enhanced-table-container table {
      table-layout: fixed;
      width: ${getTotalTableWidth()}px;
      min-width: ${getTotalTableWidth()}px;
    }

    .enhanced-table-container th,
    .enhanced-table-container td {
      white-space: nowrap;
      padding: 0.75rem 0.5rem;
      overflow: hidden;
      text-overflow: ellipsis;
      vertical-align: middle;
    }

    /* Specific column widths */
    ${columns.map((col, index) => `
    .enhanced-table-container th:nth-child(${index + 1}),
    .enhanced-table-container td:nth-child(${index + 1}) { 
      width: ${col.width}; 
      min-width: ${col.width}; 
      max-width: ${col.width}; 
    }`).join('\n')}

    /* Smooth scrolling behavior */
    .enhanced-table-container {
      scroll-behavior: smooth;
    }

    /* Focus styles for accessibility */
    .enhanced-table-container:focus {
      outline: 2px solid ${darkMode ? '#0d6efd' : '#0d6efd'};
      outline-offset: 2px;
    }

    /* Sticky header */
    .enhanced-table-container thead th {
      position: sticky;
      top: 0;
      z-index: 10;
      background-color: ${darkMode ? '#343a40' : '#f8f9fa'};
      border-bottom: 2px solid ${darkMode ? '#454d55' : '#dee2e6'};
    }

    /* Better cell content handling */
    .enhanced-table-container td {
      position: relative;
    }

    .enhanced-table-container td:hover {
      overflow: visible;
      z-index: 5;
    }

    /* Button sizing in action columns */
    .enhanced-table-container .btn-sm {
      padding: 0.25rem 0.5rem;
      font-size: 0.875rem;
      white-space: nowrap;
    }

    /* Badge styling */
    .enhanced-table-container .badge {
      font-size: 0.75rem;
      white-space: nowrap;
    }
  `;

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
       style={{ paddingBottom: '3rem' }} 
    >
      {/* Inject custom scrollbar styles */}
      <style dangerouslySetInnerHTML={{ __html: scrollbarStyles }} />
      
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
            className="d-flex justify-content-md-end justify-content-left mt-3 mt-md-0"
          >
            <Button
              variant="primary"
              onClick={() => navigate("/admin-add-cv")}
              className="mx-0"
              style={{ width: "auto" }}
            >
              Add New CV
            </Button>

            <Button
              variant="secondary"
              onClick={() => navigate("/admin-approve-cvs")}
              className="mx-2"
              style={{ width: "auto" }}
            >
              Approve CVs
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

        {/* Enhanced CV Table Container with Professional Horizontal Scrolling */}
        <div 
          className="enhanced-table-container" 
          style={tableContainerStyles}
          tabIndex="0" 
          role="region"
          aria-label="CV data table with horizontal scrolling"
        >
          <Table
            striped
            bordered
            hover
            variant={darkMode ? "dark" : "light"}
            className="mb-0"
          >
            <thead>
              <tr>
                {columns.map((col, index) => (
                  <th key={index} className="text-center align-middle">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentCVs.length > 0 ? (
                currentCVs.map((cv, index) => (
                  <tr key={cv._id || index}>
                    <td className="text-center">{indexOfFirstCV + index + 1}</td>
                    <td title={cv.nic || "N/A"}>{cv.nic || "N/A"}</td>
                    <td title={cv.refNo || "N/A"}>{cv.refNo || "N/A"}</td>
                    <td title={renderNameWithPrefix(cv.fullName, cv.gender)}>
                      {renderNameWithPrefix(cv.fullName, cv.gender)}
                    </td>
                    <td title={cv.userType || "N/A"}>{cv.userType || "N/A"}</td>
                    <td title={cv.selectedRole || "N/A"}>{cv.selectedRole || "N/A"}</td>
                    <td title={cv.applicationDate ? new Date(cv.applicationDate).toLocaleDateString() : "N/A"}>
                      {cv.applicationDate
                        ? new Date(cv.applicationDate).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td title={cv.district || "N/A"}>{cv.district || "N/A"}</td>
                    <td title={cv.institute || "N/A"}>{cv.institute || "N/A"}</td>
                    <td title={cv.referredBy || "N/A"}>{cv.referredBy || "N/A"}</td>
                    {hasInternshipCVs() && (
                      <td title={cv.selectedRole === 'internship' ? cv.roleData?.internship?.categoryOfApply || "N/A" : "-"}>
                        {cv.selectedRole === 'internship' 
                          ? cv.roleData?.internship?.categoryOfApply || "N/A"
                          : "-"
                        }
                      </td>
                    )}
                    <td className="text-center">
                      <span
                        className={`badge ${getStatusBadgeClass(cv.currentStatus)}`}
                        title={formatStatus(cv.currentStatus)}
                      >
                        {formatStatus(cv.currentStatus)}
                      </span>
                    </td>
                    <td className="text-center">
                      <Button
                        size="sm"
                        variant="outline-primary"
                        onClick={() => handleView(cv._id)}
                        className="fw-semibold"
                      >
                        View
                      </Button>
                    </td>
                    <td className="text-center">
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
                  <td colSpan={columns.length} className="text-center py-4">
                    <div>
                      <i className="fa fa-search mb-2" style={{ fontSize: '2rem' }}></i>
                      <br />
                      {searchTerm || statusFilter !== "all" || dateFilter !== "all" 
                        ? "No CVs found matching your criteria" 
                        : "No CVs found"}
                    </div>
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
      
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        show={showDeleteModal}
        onClose={handleCloseDeleteModal}
        onDelete={handleDelete}
        cvData={cvToDelete}
        darkMode={darkMode}
        loading={deleteLoading}
      />
    </div>
  );
};

export default ViewAllCVs;