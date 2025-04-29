import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Table, Button, Container, Spinner, Alert, Form } from "react-bootstrap";
import { FaListAlt, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import logo from "../../../assets/logo.png";

const MyViewDetails = ({ darkMode }) => {
  const navigate = useNavigate();
  const [staffData, setStaffData] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const token = localStorage.getItem("token");

  const fetchStaff = async () => {
    setLoading(true);
    setError("");
    try {
      if (!token) {
        navigate("/login");
        return;
      }
      
      // Make API call to get staff data
      const response = await axios.get('http://localhost:5000/api/staff', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setStaffData(response.data);
      setLoading(false);
    } catch (error) {
      setError("Failed to fetch staff data.");
      console.error("Error fetching staff:", error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [navigate]);

  const filteredStaff = staffData.filter(
    (staff) =>
      staff.name?.toLowerCase().includes(filter.toLowerCase()) ||
      staff.staffId?.toLowerCase().includes(filter.toLowerCase()) ||
      staff.jobPosition?.toLowerCase().includes(filter.toLowerCase())
  );

  const indexOfLastStaff = currentPage * itemsPerPage;
  const indexOfFirstStaff = indexOfLastStaff - itemsPerPage;
  const currentStaff = filteredStaff.slice(indexOfFirstStaff, indexOfLastStaff);
  const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);

  const columns = [
    "#",
    "Name",
    "Staff ID",
    "Job Position"
  ];

  return (
    <div className={`d-flex flex-column min-vh-100 ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
      <Container className="text-center mt-4 mb-3">
        <img src={logo} alt="SLT Mobitel Logo" className="mx-auto d-block" style={{ height: "50px" }} />
        <h3 className="mt-3">STAFF DETAILS</h3>
      </Container>

      <Container
        className="mt-4 p-4 rounded"
        style={{
          background: darkMode ? "#343a40" : "#ffffff",
          color: darkMode ? "white" : "black",
          border: darkMode ? "1px solid #454d55" : "1px solid #ced4da",
        }}
      >
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5>
            <FaListAlt className="me-2" style={{ fontSize: "1.2rem", color: darkMode ? "white" : "black" }} />
            Staff Records
          </h5>
          <Button 
            variant="primary" 
            onClick={() => navigate('/add-staff')}
          >
            Add New Staff
          </Button>
        </div>

        <hr className={darkMode ? "border-light mt-3" : "border-dark mt-3"} />
        
        {/* Filter Input */}
        <div className="mb-3">
          <Form.Control
            type="text"
            placeholder="Filter by Name, Staff ID, or Job Position"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ maxWidth: "300px", width: "100%" }}
          />
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
                    {columns.map((col, index) => (
                      <th key={index}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {currentStaff.length > 0 ? (
                    currentStaff.map((staff, index) => (
                      <tr key={staff._id || index}>
                        <td>{indexOfFirstStaff + index + 1}</td>
                        <td>{staff.name || "N/A"}</td>
                        <td>{staff.staffId || "N/A"}</td>
                        <td>{staff.jobPosition || "N/A"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={columns.length} className="text-center">
                        No staff records found
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={columns.length} style={{ padding: "5px", fontSize: "14px" }}>
                      <div className="d-flex justify-content-between align-items-center" style={{ minHeight: "30px" }}>
                        <div className="flex-grow-1 text-center">
                          <span>{filteredStaff.length} staff record(s) in total</span>
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
    </div>
  );
};

export default MyViewDetails;