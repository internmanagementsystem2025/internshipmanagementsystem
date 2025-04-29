import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Button, Container, Form, Spinner, Alert } from "react-bootstrap";
import { FaChevronLeft, FaChevronRight, FaCalendarCheck } from "react-icons/fa";
import axios from "axios"; 
import logo from "../../../assets/logo.png";
import ConfirmDeleteModal from "../../../components/notifications/ConfirmDeleteModal";

const ViewAllSchemes = ({ darkMode }) => {
  const navigate = useNavigate();
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [schemeToDelete, setSchemeToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState(""); // Search filter
  const itemsPerPage = 10;

  // Fetch schemes from backend
  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/schemes"); 
        setSchemes(response.data);
      } catch (error) {
        console.error("Error fetching schemes:", error);
        setError("Failed to load schemes. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchSchemes();
  }, []);

  // Handle delete scheme
  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/schemes/${schemeToDelete}`);
      setSchemes(schemes.filter((scheme) => scheme._id !== schemeToDelete));
    } catch (error) {
      console.error("Error deleting scheme:", error);
      setError("Failed to delete scheme. Please try again.");
    } finally {
      setShowDeleteModal(false);
    }
  };

  // Filter schemes based on scheme name
  const filteredSchemes = schemes.filter((scheme) =>
    scheme.schemeName?.toLowerCase().includes(filter.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredSchemes.length / itemsPerPage);
  const indexOfLastScheme = currentPage * itemsPerPage;
  const indexOfFirstScheme = indexOfLastScheme - itemsPerPage;
  const currentSchemes = filteredSchemes.slice(indexOfFirstScheme, indexOfLastScheme);

  return (
    <div className={`d-flex flex-column min-vh-100 ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
      <Container className="text-center mt-4 mb-3">
        <img src={logo} alt="SLT Mobitel Logo" className="mx-auto d-block" style={{ height: "50px" }} />
        <h3 className="mt-3">VIEW ALL SCHEMES</h3>
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
          <FaCalendarCheck className="me-2" style={{ fontSize: "1.2rem", color: darkMode ? "white" : "black" }} />
          All Schemes
        </h5>
        <hr className={darkMode ? "border-light mt-3" : "border-dark mt-3"} />

        {/* Filter and Add Scheme Button */}
        <div className="d-flex flex-wrap justify-content-between mb-3">
          <Form.Group className="mb-0" style={{ maxWidth: "300px", flex: "1 1 100%" }}>
            <Form.Control
              type="text"
              placeholder="Filter by Scheme Name"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </Form.Group>

          <div className="d-flex flex-wrap justify-content-end align-items-center mt-2 mt-sm-0">
            <Button variant="primary" onClick={() => navigate("/add-new-scheme")} className="mx-2 mb-2 mb-sm-0">
              Add New Scheme
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {error && <Alert variant="danger">{error}</Alert>}

        {/* Loading State */}
        {loading ? (
          <div className="text-center">
            <Spinner animation="border" role="status" />
            <p>Loading schemes...</p>
          </div>
        ) : (
          <Table striped bordered hover variant={darkMode ? "dark" : "light"} responsive>
            <thead>
              <tr>
                <th>#</th>
                <th>Scheme Name</th>
                <th>Total Allocations</th>
                <th>Recurring</th>
                <th>View</th>
                <th>Edit</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {currentSchemes.length > 0 ? (
                currentSchemes.map((scheme, index) => (
                  <tr key={scheme._id}>
                    <td>{indexOfFirstScheme + index + 1}</td>
                    <td>{scheme.schemeName || "N/A"}</td>
                    <td>{scheme.totalAllocation || "N/A"}</td>
                    <td>{scheme.recurring || "N/A"}</td>
                    <td>
                      <Button
                        size="sm"
                        variant="outline-primary"
                        onClick={() => navigate(`/view-scheme/${scheme._id}`)}
                        className="fw-semibold"
                      >
                        View
                      </Button>
                    </td>
                    <td>
                      <Button
                        size="sm"
                        variant="outline-primary"
                        onClick={() => navigate(`/edit-scheme/${scheme._id}`)}
                        className="fw-semibold"
                      >
                        Edit
                      </Button>
                    </td>
                    <td>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => {
                          setShowDeleteModal(true);
                          setSchemeToDelete(scheme._id);
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
                  <td colSpan="7" className="text-center">No Schemes found</td>
                </tr>
              )}
            </tbody>

            {/* Pagination Footer (Your Existing Code) */}
            <tfoot>
              <tr>
                <td colSpan={7} style={{ padding: "5px", fontSize: "14px" }}>
                  <div className="d-flex justify-content-between align-items-center" style={{ minHeight: "30px" }}>
                    <div className="flex-grow-1 text-center">
                      {currentSchemes.length} of {filteredSchemes.length} Scheme(s) shown
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
                      <span className="mx-2">Page {currentPage} of {totalPages}</span>
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
        )}
      </Container>

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        refNo={schemes.find((i) => i._id === schemeToDelete)?.schemeName || "N/A"}
        darkMode={darkMode}
      />
    </div>
  );
};

export default ViewAllSchemes;
