import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Button, Container, Spinner, Form } from "react-bootstrap";
import { FaChevronLeft, FaChevronRight, FaCalendarCheck } from "react-icons/fa";
import logo from "../../../assets/logo.png";

const dummyStatusData = [
  {
    _id: "1",
    nic: "987654321V",
    name: "John Doe",
    mobileno: "0771234567",
    university: "University of Colombo",
    internshipStartDate: "2023-01-15",
    internshipEndDate: "2023-06-15",
    internshipPeriod: "5 months",
    status: "Active"
  },
  {
    _id: "2",
    nic: "123456789V",
    name: "Jane Smith",
    mobileno: "0769876543",
    university: "University of Moratuwa",
    internshipStartDate: "2023-02-01",
    internshipEndDate: "2023-07-01",
    internshipPeriod: "5 months",
    status: "Completed"
  },
  {
    _id: "3",
    nic: "456789123V",
    name: "Robert Johnson",
    mobileno: "0751234567",
    university: "SLIIT",
    internshipStartDate: "2023-03-10",
    internshipEndDate: "2023-08-10",
    internshipPeriod: "5 months",
    status: "Active"
  },
  {
    _id: "4",
    nic: "789123456V",
    name: "Emily Davis",
    mobileno: "0712345678",
    university: "NSBM",
    internshipStartDate: "2023-01-05",
    internshipEndDate: "2023-06-05",
    internshipPeriod: "5 months",
    status: "Terminated"
  },
  {
    _id: "5",
    nic: "321654987V",
    name: "Michael Wilson",
    mobileno: "0723456789",
    university: "IIT",
    internshipStartDate: "2023-04-20",
    internshipEndDate: "2023-09-20",
    internshipPeriod: "5 months",
    status: "Active"
  },
];

const InternsStatus = ({ darkMode }) => {
  const navigate = useNavigate();
  const [status, setStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState(""); // For text search
  const [statusFilter, setStatusFilter] = useState("All"); // For dropdown filter
  const itemsPerPage = 20;

  // Load dummy data directly
  useEffect(() => {
    setStatus(dummyStatusData);
    setLoading(false);
  }, []);

  // Filter interns based on search input and status filter
  const filteredStatus = status.filter((item) => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.university.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === "All" || 
      item.status.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredStatus.length / itemsPerPage);
  const indexOfLastStatus = currentPage * itemsPerPage;
  const indexOfFirstStatus = indexOfLastStatus - itemsPerPage;
  const currentStatus = filteredStatus.slice(indexOfFirstStatus, indexOfLastStatus);

  return (
    <div className={`d-flex flex-column min-vh-100 ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
      <Container className="text-center mt-4 mb-3">
        <img src={logo} alt="SLT Mobitel Logo" className="mx-auto d-block" style={{ height: "50px" }} />
        <h3 className="mt-3">INTERN STATUS</h3>
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
          Intern Status
        </h5>
        <hr className={darkMode ? "border-light mt-3" : "border-dark mt-3"} />

        {/* Search Filters */}
        <div className="d-flex flex-wrap justify-content-between mb-3">
          {/* Text Search Filter */}
          <Form.Group className="mb-0 me-2" style={{ maxWidth: "300px" }}>
            <Form.Control
              type="text"
              placeholder="Search by name, NIC, or university"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Form.Group>

          {/* Status Dropdown Filter */}
          <Form.Group className="mb-0" style={{ maxWidth: "200px" }}>
            <Form.Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Active">CV Received</option>
              <option value="Completed">CV Approved</option>
              <option value="Terminated">Scheduled for Interview</option>
              <option value="Terminated">Re-scheduled for Interview</option>
              <option value="Terminated">Intern Selected and waiting for assigning</option>
              <option value="Terminated">Intern Rejected</option>
            </Form.Select>
          </Form.Group>
        </div>

        {loading ? (
          <div className="text-center">
            <Spinner animation="border" role="status" />
            <p>Loading status...</p>
          </div>
        ) : (
          <Table striped bordered hover variant={darkMode ? "dark" : "light"} responsive>
            <thead>
              <tr>
                <th>#</th>
                <th>NIC</th>
                <th>Name</th>
                <th>Mobile No</th>
                <th>University</th>
                <th>Internship Start Date</th>
                <th>Internship End Date</th>
                <th>Internship Period</th>
                <th>Status</th>
                <th>View</th>
              </tr>
            </thead>
            <tbody>
              {currentStatus.length > 0 ? (
                currentStatus.map((status, index) => (
                  <tr key={status._id}>
                    <td>{indexOfFirstStatus + index + 1}</td>
                    <td>{status.nic}</td>
                    <td>{status.name}</td>
                    <td>{status.mobileno}</td>
                    <td>{status.university}</td>
                    <td>{status.internshipStartDate}</td>
                    <td>{status.internshipEndDate}</td>
                    <td>{status.internshipPeriod}</td>
                    <td>
                      <span className={`badge ${
                        status.status === "Active" ? "bg-success" :
                        status.status === "Completed" ? "bg-primary" :
                        status.status === "Terminated" ? "bg-danger" : "bg-secondary"
                      }`}>
                        {status.status}
                      </span>
                    </td>
                    <td>
                      <Button 
                        size="sm" 
                        variant="outline-primary" 
                        onClick={() => navigate(`/status/${status._id}`)}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="text-center">No Intern Status found</td>
                </tr>
              )}
            </tbody>

            {/* Pagination Footer */}
            <tfoot>
              <tr>
                <td colSpan={10} style={{ padding: "5px", fontSize: "14px" }}>
                  <div className="d-flex justify-content-between align-items-center">
                  <div className="flex-grow-1 text-center">
                      Showing {currentStatus.length} of {filteredStatus.length} interns
                    </div>
                    <div className="d-flex align-items-center">
                      <Button 
                        variant="link" 
                        size="sm" 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                        disabled={currentPage === 1}
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
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                        disabled={currentPage === totalPages}
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
    </div>
  );
};

export default InternsStatus;