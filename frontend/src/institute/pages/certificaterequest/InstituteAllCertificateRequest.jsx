import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Table, Button, Container, Spinner, Alert, Form } from "react-bootstrap";
import { FaPenFancy, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import logo from "../../../assets/logo.png";

const InstituteAllCertificateRequest = ({ darkMode }) => {
  const [certificateData, setCertificateData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCertificateRequests = async () => {
      setLoading(true);
      setError("");

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await axios.get("http://localhost:5000/api/certificates/user-certificates", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 200 && Array.isArray(response.data.data)) {
          setCertificateData(response.data.data);
        } else {
          setCertificateData([]);
        }
      } catch (error) {
        setError("Failed to fetch certificate request data.");
        console.error("Error fetching certificate requests:", error);
        setCertificateData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCertificateRequests();
  }, [navigate]);

  const filteredRequests = certificateData.filter(
    (request) =>
      request.name?.toLowerCase().includes(filter.toLowerCase()) ||
      request.internId?.toLowerCase().includes(filter.toLowerCase()) ||
      request.nic?.toLowerCase().includes(filter.toLowerCase())
  );

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const indexOfLastRequest = currentPage * itemsPerPage;
  const indexOfFirstRequest = indexOfLastRequest - itemsPerPage;
  const currentRequests = filteredRequests.slice(indexOfFirstRequest, indexOfLastRequest);

  const columns = ["#", "Name", "Intern ID", "NIC", "Section/Unit", "Status"];

  const handleNewRequest = () => {
    // Define what happens when the "Create New Request" button is clicked
    navigate("/institute-certificate-request");
  };

  return (
    <div className={`d-flex flex-column min-vh-100 ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
      <Container className="text-center mt-4 mb-3">
        <img src={logo} alt="SLT Mobitel Logo" className="mx-auto d-block" style={{ height: "50px" }} />
        <h3 className="mt-3">ALL CERTIFICATE REQUESTS</h3>
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
          All Certificate Requests
        </h5>

        <hr className={darkMode ? "border-light mt-3" : "border-dark mt-3"} />

        {/* Filter Input */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <Form.Control
            type="text"
            placeholder="Filter by Name, Intern ID or NIC"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ maxWidth: "250px", width: "100%" }}
          />

          <Button variant="primary" onClick={handleNewRequest}>
            Create New Request
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
                {currentRequests.length > 0 ? (
                  currentRequests.map((request, index) => (
                    <tr key={request._id || index}>
                      <td>{indexOfFirstRequest + index + 1}</td>
                      <td>{request.name || "N/A"}</td>
                      <td>{request.internId || "N/A"}</td>
                      <td>{request.nic || "N/A"}</td>
                      <td>{request.sectionUnit || "N/A"}</td>
                      <td>{request.certificateRequestStatus || "Pending"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center">
                      No certificate requests found
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={columns.length} style={{ padding: "5px", fontSize: "14px" }}>
                    <div className="d-flex justify-content-between align-items-center" style={{ minHeight: "30px" }}>
                      <div className="flex-grow-1 text-center">
                        <span>{filteredRequests.length} request(s) in total</span>
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
          </>
        )}
      </Container>
    </div>
  );
};

export default InstituteAllCertificateRequest;
