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
} from "react-bootstrap";
import { FaPenFancy, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import logo from "../../../assets/logo.png";
import AssignSchemeModal from "./AssignSchemeModal";

const ScheduleScheme = ({ darkMode }) => {
  const navigate = useNavigate();
  const [internData, setInternData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [internToAssign, setInternToAssign] = useState(null);
  const [batchAssign, setBatchAssign] = useState(false);
  const [error, setError] = useState("");
  const [selectedCvId, setSelectedCvId] = useState(null);
  const token = localStorage.getItem("token");

  const api = axios.create({
    baseURL: "http://localhost:5000/api",
    headers: { Authorization: `Bearer ${token}` },
  });

  const fetchInterns = async () => {
    setLoading(true);
    setError("");
    try {
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await api.get("/cvs/get-cvs-for-scheme-assignment");
      setInternData(response.data);
    } catch (error) {
      setError("Failed to fetch intern data.");
      console.error("Error fetching interns:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterns();
  }, []);

  // Assign scheme
  const handleAssignScheme = async (schemeData) => {
    try {
      if (batchAssign) {
        // Batch assignment
        const response = await api.post(`/cvs/batch-assign-scheme`, {
          cvIds: selectedRows,
          ...schemeData,
        });
        return response.data;
      } else {
        // Single assignment
        const response = await api.post(
          `/cvs/${internToAssign._id}/assign-scheme`,
          schemeData
        );
        return response.data;
      }
    } catch (error) {
      console.error("Error assigning scheme:", error);
      throw new Error(error.response?.data?.message || error.message);
    }
  };

  // Handle row selection
  const handleSelectRow = (id) => {
    setSelectedRows((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((rowId) => rowId !== id)
        : [...prevSelected, id]
    );
  };

  // Select all rows
  const handleSelectAll = () => {
    setSelectedRows(
      selectedRows.length === currentInterns.length
        ? []
        : currentInterns.map((intern) => intern._id)
    );
  };

  const filteredInterns = internData.filter(
    (intern) =>
      intern.fullName?.toLowerCase().includes(filter.toLowerCase()) ||
      intern.nic?.toLowerCase().includes(filter.toLowerCase())
  );

  const indexOfLastIntern = currentPage * itemsPerPage;
  const indexOfFirstIntern = indexOfLastIntern - itemsPerPage;
  const currentInterns = filteredInterns.slice(
    indexOfFirstIntern,
    indexOfLastIntern
  );
  const totalPages = Math.ceil(filteredInterns.length / itemsPerPage);

  const columns = [
    "Select",
    "NIC",
    "Full Name",
    "Intern Type",
    "Email",
    "Mobile No",
    "District",
    "Institute",
    "Assign Scheme",
  ];

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
        <h3 className="mt-3">SCHEME ASSIGNMENT</h3>
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
          <FaPenFancy
            className="me-2"
            style={{ fontSize: "1.2rem", color: darkMode ? "white" : "black" }}
          />
          Assign Scheme to Induction Passed Candidates
        </h5>

        <hr className={darkMode ? "border-light mt-3" : "border-dark mt-3"} />

        {/* Filter Input with Batch Button */}
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center mb-3">
          <div className="mb-2 mb-sm-0">
            <Form.Control
              type="text"
              placeholder="Filter by Full Name or NIC"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{ maxWidth: "250px", width: "100%" }}
            />
          </div>
          <div className="d-flex justify-content-start flex-wrap">
            <Button
              variant="info"
              size="sm"
              onClick={() => {
                setBatchAssign(true);
                setShowAssignModal(true);
              }}
              disabled={selectedRows.length === 0}
              style={{ marginLeft: "10px", marginTop: "5px" }}
            >
              Batch Assign Scheme
            </Button>
          </div>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        {loading ? (
          <div className="text-center">
            <Spinner animation="border" variant={darkMode ? "light" : "dark"} />
          </div>
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
                  <th>
                    <Form.Check
                      type="checkbox"
                      checked={
                        selectedRows.length === currentInterns.length &&
                        currentInterns.length > 0
                      }
                      onChange={handleSelectAll}
                    />
                  </th>
                  {columns.slice(1).map((col, index) => (
                    <th key={index}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentInterns.length > 0 ? (
                  currentInterns.map((intern, index) => (
                    <tr key={intern._id || index}>
                      <td>
                        <Form.Check
                          type="checkbox"
                          checked={selectedRows.includes(intern._id)}
                          onChange={() => handleSelectRow(intern._id)}
                        />
                      </td>
                      <td>{intern.nic || "N/A"}</td>
                      <td>{intern.fullName || "N/A"}</td>
                      <td>{intern.selectedRole || "N/A"}</td>
                      <td>{intern.emailAddress || "N/A"}</td>
                      <td>{intern.mobileNumber || "N/A"}</td>
                      <td>{intern.district || "N/A"}</td>
                      <td>{intern.institute || "N/A"}</td>
                      <td>
                        <Button
                          size="sm"
                          variant="outline-info"
                          onClick={() => {
                            setInternToAssign(intern);
                            setSelectedCvId(intern._id);
                            setBatchAssign(false);
                            setShowAssignModal(true);
                          }}
                          className="fw-semibold"
                        >
                          Assign
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length} className="text-center">
                      No induction-completed candidates found for scheme
                      assignment
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
                          {filteredInterns.length} candidate(s) in total •{" "}
                          {selectedRows.length} selected
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
                        <span className="mx-2">{`Page ${currentPage} of ${totalPages}`}</span>
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

      {/* Assign Scheme Modal */}
      <AssignSchemeModal
        show={showAssignModal}
        onClose={() => {
          setShowAssignModal(false);
          setBatchAssign(false);
          setInternToAssign(null);
          setSelectedRows([]);
          fetchInterns(); // Refresh data after closing
        }}
        onConfirm={handleAssignScheme}
        refNo={
          batchAssign
            ? `${selectedRows.length} selected candidates`
            : internToAssign?.refNo
        }
        darkMode={darkMode}
      />
    </div>
  );
};

export default ScheduleScheme;