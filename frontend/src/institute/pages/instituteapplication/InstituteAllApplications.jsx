import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Table, Button, Container, Spinner, Alert, Form } from "react-bootstrap";
import { FaPenFancy, FaChevronLeft, FaChevronRight } from "react-icons/fa"; 
import logo from "../../../assets/logo.png";

const InstituteAllApplications = ({ darkMode }) => {
  const [cvData, setCvData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserCVs = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await axios.get("http://localhost:5000/api/cvs/mycvs", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 200) {
          setCvData(response.data);
        } else {
          setCvData([]);
        }
      } catch (error) {
        setError("Failed to fetch CV data.");
        console.error("Error fetching CVs:", error.message);
        setCvData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserCVs();
  }, [navigate]);

  const handleView = (cvId) => {
    navigate(`/view-cv/${cvId}`);
  };

  const handleEdit = (cvId) => {
    navigate(`/edit-cv/${cvId}`);
  };

  const handleNewCV = () => {
    navigate("/institute-add-cv");
  };

  const filteredCvs = cvData?.filter(
    (cv) =>
      cv.fullName.toLowerCase().includes(filter.toLowerCase()) ||
      cv.nic.toLowerCase().includes(filter.toLowerCase())
  ) || [];

  const indexOfLastCv = currentPage * itemsPerPage;
  const indexOfFirstCv = indexOfLastCv - itemsPerPage;
  const currentCvs = filteredCvs.slice(indexOfFirstCv, indexOfLastCv);
  const totalPages = Math.ceil(filteredCvs.length / itemsPerPage);

  const columns = [
    "#",
    "Application Ref. No.",
    "Full Name",
    "NIC",
    "Intern Type",
    "CV Status",
    "View",
    "Edit",
  ];

  return (
    <div className={`d-flex flex-column min-vh-100 ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
      <Container className="text-center mt-4 mb-3">
        <img src={logo} alt="SLT Mobitel Logo" className="mx-auto d-block" style={{ height: "50px" }} />
        <h3 className="mt-3">ALL CV APPLICATIONS</h3>
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
          All Internship Applications
        </h5>

        <hr className={darkMode ? "border-light mt-3" : "border-dark mt-3"} />

        {/* Filter Input and New CV Button */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <Form.Control
            type="text"
            placeholder="Filter by Full Name or NIC"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ maxWidth: "250px", width: "100%" }}
          />

          <Button variant="primary" onClick={handleNewCV}>
            Add New CV
          </Button>
        </div>

        {loading ? (
          <div className="text-center">
            <Spinner animation="border" variant={darkMode ? "light" : "dark"} />
          </div>
        ) : error ? (
          <Alert variant="danger" className="text-center">{error}</Alert>
        ) : (
          <>
            <Table striped bordered hover variant={darkMode ? "dark" : "light"} responsive>
              <thead>
                <tr>
                  {columns.map((col, index) => (
                    <th key={index}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentCvs.length > 0 ? (
                  currentCvs.map((cv, index) => (
                    <tr key={cv._id || index}>
                      <td>{indexOfFirstCv + index + 1}</td>
                      <td>{cv.refNo || "N/A"}</td>
                      <td>{cv.fullName || "N/A"}</td>
                      <td>{cv.nic || "N/A"}</td>
                      <td>{cv.selectedRole || "N/A"}</td>
                      <td>{cv.cvStatus || "N/A"}</td>

                      <td>
                        <Button size="sm" variant="outline-primary" onClick={() => handleView(cv._id)} className="fw-semibold" >
                          View
                        </Button>
                      </td>
                      <td>
                        {cv.cvStatus === "pending" && (
                          <Button size="sm" variant="outline-success" onClick={() => handleEdit(cv._id)} className="fw-semibold" >
                            Edit
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center">
                      No CVs found
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={columns.length} style={{ padding: "5px", fontSize: "14px" }}>
                    <div className="d-flex justify-content-between align-items-center" style={{ minHeight: "30px" }}>
                      <div className="flex-grow-1 text-center">
                        <span>{filteredCvs.length} application(s) in total</span>
                      </div>
                      <div className="d-flex align-items-center">
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          style={{ color: darkMode ? "white" : "black", padding: 0, margin: 0 }}
                        >
                          <FaChevronLeft /><FaChevronLeft />
                        </Button>
                        <span className="mx-2">{`Page ${currentPage} of ${totalPages}`}</span>
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          style={{ color: darkMode ? "white" : "black", padding: 0, margin: 0 }}
                        >
                          <FaChevronRight /><FaChevronRight />
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
    </div>
  );
};

export default InstituteAllApplications;
