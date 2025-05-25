import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Table, Button, Container, Spinner, Alert, Form, InputGroup, Row, Col} from "react-bootstrap";
import { FaEye, FaChevronLeft, FaChevronRight, FaFileExcel, FaFilePdf, FaSearch, FaCalendarAlt } from "react-icons/fa";
import logo from "../../../assets/logo.png";
import PassModal from "../../../components/notifications/PassModal";
import FailModal from "../../../components/notifications/FailModal";
import RescheduleInductionModal from "../../../components/notifications/RescheduleInductionModal";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const InductionResults = ({ darkMode }) => {
  const navigate = useNavigate();
  const [cvData, setCvData] = useState([]);
  const [filteredCvData, setFilteredCvData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [inductionSearchTerm, setInductionSearchTerm] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [showPassModal, setShowPassModal] = useState(false);
  const [showFailModal, setShowFailModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedCvId, setSelectedCvId] = useState(null);
  const [selectedCvRef, setSelectedCvRef] = useState("");
  const [selectedInductionId, setSelectedInductionId] = useState("");
  const [selectedInductionName, setSelectedInductionName] = useState("");
  const [isBulkAction, setIsBulkAction] = useState(false);

  const token = localStorage.getItem("token");

  const api = axios.create({
    baseURL: "http://localhost:5000/api/cvs",
  });

  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const refreshToken = localStorage.getItem("refreshToken");
          const response = await axios.post("/api/auth/refresh", {
            refreshToken,
          });

          const { token } = response.data;
          localStorage.setItem("token", token);

          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        } catch (err) {
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          window.location.href = "/login";
          return Promise.reject(err);
        }
      }

      return Promise.reject(error);
    }
  );

  const fetchCVs = async () => {
    setLoading(true);
    setError("");

    try {
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await api.get("/assigned-to-induction");
      const inductionData = response.data || []; 
      
      // Include all CVs with induction-assigned and induction-re-scheduled status
      const filteredData = inductionData.filter(cv => 
        cv.induction?.status === "induction-assigned" || 
        cv.induction?.status === "induction-re-scheduled" ||
        cv.currentStatus === "induction-assigned" ||
        cv.currentStatus === "induction-re-scheduled"
      );

      setCvData(filteredData);
      setFilteredCvData(filteredData);
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to fetch induction data."
      );
      console.error("Error fetching inductions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCVs();
  }, []);

  useEffect(() => {
    let filtered = cvData;

    if (inductionSearchTerm.trim() !== "") {
      const term = inductionSearchTerm.toLowerCase();
      filtered = filtered.filter(
        (cv) =>
          (cv.induction?.inductionName &&
            cv.induction.inductionName.toLowerCase().includes(term)) ||
          (cv.fullName && cv.fullName.toLowerCase().includes(term)) ||
          (cv.nic && cv.nic.toLowerCase().includes(term)) ||
          (cv.refNo && cv.refNo.toLowerCase().includes(term))
      );
    }

    setFilteredCvData(filtered);
    setCurrentPage(1);
    setSelectedRows([]);
  }, [cvData, inductionSearchTerm]);

  const openPassModal = (id, refNo, bulk = false) => {
    setIsBulkAction(bulk);
    if (bulk) {
      if (selectedRows.length === 0) {
        setError("Please select at least one row to perform bulk action");
        return;
      }
      setSelectedCvRef("multiple selected references");
    } else {
      setSelectedCvId(id);
      setSelectedCvRef(refNo);
    }
    setShowPassModal(true);
  };

  const openFailModal = (id, refNo, bulk = false) => {
    setIsBulkAction(bulk);
    if (bulk) {
      if (selectedRows.length === 0) {
        setError("Please select at least one row to perform bulk action");
        return;
      }
      setSelectedCvRef("multiple selected references");
    } else {
      setSelectedCvId(id);
      setSelectedCvRef(refNo);
    }
    setShowFailModal(true);
  };

  const openRescheduleModal = (id, refNo, inductionId, inductionName) => {
    setSelectedCvId(id);
    setSelectedCvRef(refNo);
    setSelectedInductionId(inductionId);
    setSelectedInductionName(inductionName);
    setShowRescheduleModal(true);
  };

  const handlePassInduction = async () => {
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return;
      }

      if (isBulkAction) {
        const results = await Promise.all(
          selectedRows.map((id) =>
            api.patch(`/${id}/pass-induction`, {
              status: "induction-passed",
            })
          )
        );
      } else {
        await api.patch(`/${selectedCvId}/pass-induction`, {
          status: "induction-passed",
        });
      }

      setSuccessMessage(
        isBulkAction
          ? "Selected candidates passed successfully!"
          : `Candidate ${selectedCvRef} passed successfully!`
      );

      setTimeout(() => {
        setShowPassModal(false);
        fetchCVs();
      }, 1500);
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
      } else {
        setError(
          error.response?.data?.message || "Failed to update induction status"
        );
      }
    }
  };

  const handleFailInduction = async () => {
    setError("");
    try {
      if (isBulkAction) {
        for (const id of selectedRows) {
          await api.patch(`/${id}/fail-induction`);
        }
      } else {
        await api.patch(`/${selectedCvId}/fail-induction`);
      }
      setShowFailModal(false);
      fetchCVs();
      setSuccessMessage(
        isBulkAction
          ? "Bulk fail successful!"
          : `CV ${selectedCvRef} failed successfully!`
      );
    } catch (error) {
      console.error("Error failing induction:", error.message);
      setError(
        `Failed to update induction status: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  const handleRescheduleInduction = async (newInductionId, currentInductionId, reason) => {
    setError("");
    try {
      await api.patch(`/${selectedCvId}/reschedule-induction`, {
        newInductionId: newInductionId,
        currentInductionId: currentInductionId,
        reason: reason
      });
      
      setSuccessMessage(`Induction for ${selectedCvRef} rescheduled successfully!`);
      setTimeout(() => {
        setShowRescheduleModal(false);
        fetchCVs();
      }, 1500);
    } catch (error) {
      console.error("Error rescheduling induction:", error);
      setError(
        error.response?.data?.message || "Failed to reschedule induction"
      );
    }
  };

  const clearMessages = () => {
    setError("");
    setSuccessMessage("");
  };

  // Get induction status display text
  const getInductionStatus = (cv) => {
    if (cv.induction?.status === "induction-re-scheduled" || cv.currentStatus === "induction-re-scheduled") {
      return "Re-scheduled";
    } else if (cv.induction?.status === "induction-assigned" || cv.currentStatus === "induction-assigned") {
      return "Scheduled";
    }
    return cv.currentStatus || "Pending";
  };

  // Export to Excel - Updated to remove Assignment Type
  const exportToExcel = () => {
    try {
      let dataToExport =
        selectedRows.length > 0
          ? filteredCvData.filter((cv) => selectedRows.includes(cv._id))
          : filteredCvData;

      const formattedData = dataToExport.map((cv) => ({
        "Reference No": cv.refNo || "N/A",
        NIC: cv.nic || "N/A",
        "Full Name": cv.fullName || "N/A",
        Category: cv.selectedRole || "N/A",
        "Mobile No": cv.mobileNumber || "N/A",
        "Induction Name": cv.induction?.inductionName || "N/A",
        "Start Date": cv.induction?.inductionStartDate
          ? new Date(cv.induction.inductionStartDate).toLocaleDateString()
          : "N/A",
        "End Date": cv.induction?.inductionEndDate
          ? new Date(cv.induction.inductionEndDate).toLocaleDateString()
          : "N/A",
        Status: getInductionStatus(cv),
      }));

      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Inductions");

      const columnWidths = [
        { wch: 15 },
        { wch: 15 },
        { wch: 25 },
        { wch: 20 },
        { wch: 15 },
        { wch: 25 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
      ];
      worksheet["!cols"] = columnWidths;

      const date = new Date();
      const fileName = `Induction_Results_${
        date.toISOString().split("T")[0]
      }.xlsx`;

      XLSX.writeFile(workbook, fileName);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      setError("Failed to export to Excel. Please try again.");
    }
  };

  // Export to PDF - Updated to remove Assignment Type
  const exportToPDF = () => {
    try {
      let dataToExport =
        selectedRows.length > 0
          ? filteredCvData.filter((cv) => selectedRows.includes(cv._id))
          : filteredCvData;

      const doc = new jsPDF();

      doc.setFontSize(18);
      doc.text("List of Induction Candidates", 14, 22);
      doc.setFontSize(11);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

      if (inductionSearchTerm) {
        doc.text(`Search: "${inductionSearchTerm}"`, 14, 38);
      }

      const tableColumn = [
        "Ref. No.",
        "Name",
        "Category",
        "Mobile",
        "Induction",
        "Start Date",
        "End Date",
        "Status",
      ];

      const tableRows = [];

      dataToExport.forEach((cv) => {
        const cvData = [
          cv.refNo || "N/A",
          cv.fullName || "N/A",
          cv.selectedRole || "N/A",
          cv.mobileNumber || "N/A",
          cv.induction?.inductionName || "N/A",
          cv.induction?.inductionStartDate
            ? new Date(cv.induction.inductionStartDate).toLocaleDateString()
            : "N/A",
          cv.induction?.inductionEndDate
            ? new Date(cv.induction.inductionEndDate).toLocaleDateString()
            : "N/A",
          getInductionStatus(cv),
        ];
        tableRows.push(cvData);
      });

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: inductionSearchTerm ? 45 : 38,
        theme: "striped",
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        styles: { fontSize: 8 },
        columnStyles: {
          0: { cellWidth: 20 },
          1: { cellWidth: 30 },
          2: { cellWidth: 25 },
          3: { cellWidth: 20 },
          4: { cellWidth: 30 },
          5: { cellWidth: 20 },
          6: { cellWidth: 20 },
          7: { cellWidth: 20 },
        },
      });

      const date = new Date();
      const fileName = `Induction_Results_${
        date.toISOString().split("T")[0]
      }.pdf`;

      doc.save(fileName);
    } catch (error) {
      console.error("Error exporting to PDF:", error);
      setError("Failed to export to PDF. Please try again.");
    }
  };

  const handleSelectRow = (id) => {
    setSelectedRows((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((rowId) => rowId !== id)
        : [...prevSelected, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedRows(
      selectedRows.length === currentCvs.length
        ? []
        : currentCvs.map((cv) => cv._id)
    );
  };

  const indexOfLastCv = currentPage * itemsPerPage;
  const indexOfFirstCv = indexOfLastCv - itemsPerPage;
  const currentCvs = filteredCvData.slice(indexOfFirstCv, indexOfLastCv);
  const totalPages = Math.ceil(filteredCvData.length / itemsPerPage);

  const columns = [
    "Select",
    "Ref. No.",
    "NIC",
    "Full Name",
    "Category",
    "Mobile No",
    "Induction Name",
    "Start Date",
    "End Date",
    "Status",
    "View",
    "Pass",
    "Fail",
    "Reschedule" 
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
        <h3 className="mt-3">INDUCTION MANAGEMENT</h3>
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
          <FaEye
            className="me-2"
            style={{ fontSize: "1.2rem", color: darkMode ? "white" : "black" }}
          />
          Manage Induction Candidates
        </h5>

        <hr className={darkMode ? "border-light mt-3" : "border-dark mt-3"} />

        <Row className="mb-3 align-items-end">
          <Col md={6} lg={5}>
            <Form.Group controlId="inductionSearch">
              <Form.Label>Search Candidates</Form.Label>
              <InputGroup>
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search by name, NIC or reference..."
                  value={inductionSearchTerm}
                  onChange={(e) => setInductionSearchTerm(e.target.value)}
                />
                {inductionSearchTerm && (
                  <Button
                    variant="outline-secondary"
                    onClick={() => setInductionSearchTerm("")}
                  >
                    Clear
                  </Button>
                )}
              </InputGroup>
            </Form.Group>
          </Col>
        </Row>

        {/* Export Buttons */}
        <div className="d-flex justify-content-end mb-3">
          <Button
            variant="success"
            size="sm"
            onClick={exportToExcel}
            className="me-2"
            disabled={filteredCvData.length === 0}
          >
            <FaFileExcel className="me-1" /> Export Excel
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={exportToPDF}
            disabled={filteredCvData.length === 0}
          >
            <FaFilePdf className="me-1" /> Export PDF
          </Button>
        </div>

        {/* Bulk Actions */}
        <div className="d-flex justify-content-end mb-3">
          <Button
            variant="success"
            size="sm"
            className="me-2"
            onClick={() => openPassModal(null, null, true)}
            disabled={selectedRows.length === 0}
          >
            Bulk Pass
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => openFailModal(null, null, true)}
            disabled={selectedRows.length === 0}
          >
            Bulk Fail
          </Button>
        </div>

        <div className="mb-3">
          <span>Total Candidates: {filteredCvData.length}</span>
          {selectedRows.length > 0 && (
            <span className="ms-2">Selected: {selectedRows.length}</span>
          )}
        </div>

        {error && (
          <Alert
            variant="danger"
            className="text-center mb-3"
            onClose={() => setError("")}
            dismissible
          >
            {error}
          </Alert>
        )}

        {successMessage && (
          <Alert
            variant="success"
            className="text-center mb-3"
            onClose={() => setSuccessMessage("")}
            dismissible
          >
            {successMessage}
          </Alert>
        )}

        {loading ? (
          <div className="text-center">
            <Spinner animation="border" variant={darkMode ? "light" : "dark"} />
            <p>Loading induction candidates...</p>
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
                        selectedRows.length === currentCvs.length &&
                        currentCvs.length > 0
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
                {currentCvs.length > 0 ? (
                  currentCvs.map((cv, index) => (
                    <tr key={cv._id || index}>
                      <td>
                        <Form.Check
                          type="checkbox"
                          checked={selectedRows.includes(cv._id)}
                          onChange={() => handleSelectRow(cv._id)}
                        />
                      </td>
                      <td>{cv.refNo || "N/A"}</td>
                      <td>{cv.nic || "N/A"}</td>
                      <td>{cv.fullName || "N/A"}</td>
                      <td>{cv.selectedRole || "N/A"}</td>
                      <td>{cv.mobileNumber || "N/A"}</td>
                      <td>{cv.induction?.inductionName || "N/A"}</td>
                      <td>
                        {cv.induction?.inductionStartDate
                          ? new Date(cv.induction.inductionStartDate).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td>
                        {cv.induction?.inductionEndDate
                          ? new Date(cv.induction.inductionEndDate).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td>
                        <span className={`badge ${
                          getInductionStatus(cv) === "Re-scheduled" 
                            ? "bg-warning" 
                            : "bg-info"
                        }`}>
                          {getInductionStatus(cv)}
                        </span>
                      </td>
                      <td>
                        <Button
                          size="sm"
                          variant="outline-primary"
                          onClick={() => navigate(`/view-cv/${cv._id}`)}
                          className="fw-semibold"
                        >
                          View
                        </Button>
                      </td>
                      <td>
                        <Button
                          size="sm"
                          variant="outline-success"
                          onClick={() => openPassModal(cv._id, cv.refNo)}
                          className="fw-semibold"
                          disabled={
                            cv.induction?.result?.status === "induction-passed"
                          }
                        >
                          Pass
                        </Button>
                      </td>
                      <td>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => openFailModal(cv._id, cv.refNo)}
                          className="fw-semibold"
                          disabled={
                            cv.induction?.result?.status === "induction-failed"
                          }
                        >
                          Fail
                        </Button>
                      </td>
                      <td>
                        <Button
                          size="sm"
                          variant="outline-info"
                          onClick={() => openRescheduleModal(
                            cv._id, 
                            cv.refNo, 
                            cv.induction?._id,
                            cv.induction?.inductionName
                          )}
                          className="fw-semibold"
                          disabled={
                            cv.induction?.result?.status === "induction-passed"
                          }
                        >
                           Reschedule
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length} className="text-center">
                      {inductionSearchTerm
                        ? "No matching candidates found"
                        : "No induction candidates found"}
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
                          Showing {currentCvs.length} of {filteredCvData.length}{" "}
                          candidates
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

      {/* Pass Modal */}
      <PassModal
        show={showPassModal}
        onClose={() => setShowPassModal(false)}
        onConfirm={handlePassInduction}
        refNo={selectedCvRef}
        isBulk={isBulkAction}
        darkMode={darkMode}
      />

      {/* Fail Modal */}
      <FailModal
        show={showFailModal}
        onClose={() => setShowFailModal(false)}
        onConfirm={handleFailInduction}
        refNo={selectedCvRef}
        isBulk={isBulkAction}
        darkMode={darkMode}
      />

      {/* Reschedule Modal */}
      <RescheduleInductionModal
        show={showRescheduleModal}
        onClose={() => setShowRescheduleModal(false)}
        onConfirm={handleRescheduleInduction}
        refNo={selectedCvRef}
        darkMode={darkMode}
        successMessage={successMessage}
        errorMessage={error}
        onClearMessages={clearMessages}
        currentInductionId={selectedInductionId}
        currentInductionName={selectedInductionName}
      />
    </div>
  );
};

export default InductionResults;