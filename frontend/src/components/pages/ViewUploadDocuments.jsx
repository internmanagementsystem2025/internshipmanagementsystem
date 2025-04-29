import React, { useEffect, useState } from "react";
import axios from "axios";
import { CgFileDocument } from "react-icons/cg";
import { Container, Row, Col, Button, Alert, Spinner } from "react-bootstrap";

// Use the same API_BASE_URL as the rest of the application
const API_BASE_URL = "http://localhost:5000";

const ViewUploadedDocuments = ({ cvId, darkMode }) => {
  const [cvData, setCvData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [referredBy, setReferredBy] = useState(""); 

  useEffect(() => {
    const fetchCV = async () => {
      try {
        // Get token from localStorage for authentication
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Authentication token not found. Please log in again.");
          setLoading(false);
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/api/cvs/${cvId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setCvData(response.data);
        setReferredBy(response.data.referredBy || "");
      } catch (err) {
        console.error("Error fetching CV documents:", err);
        setError("Failed to load CV documents.");
      } finally {
        setLoading(false);
      }
    };

    if (cvId) {
      fetchCV();
    }
  }, [cvId]);

  if (loading) return <Spinner animation="border" variant={darkMode ? "light" : "dark"} />;
  if (error) return <Alert variant="danger" className="text-center">{error}</Alert>;
  if (!cvData) return <Alert variant="info" className="text-center">No documents found.</Alert>;

  const fileFields = [
    { label: "Updated CV", key: "updatedCv" },
    { label: "NIC (Both Sides)", key: "nicFile" },
    { label: "Police Clearance Report", key: "policeClearanceReport" },
    { label: "Internship Request Letter", key: "internshipRequestLetter" },
  ];

  const openInNewTab = (filePath) => {
    if (!filePath) return;
    
    // Extract the file name from the path
    const fileName = filePath.split("\\").pop().split("/").pop();
    const fileUrl = `${API_BASE_URL}/uploads/cvs/${fileName}`;
    window.open(fileUrl, "_blank");
  };

  return (
    <Container className={`mt-4 p-4 rounded ${darkMode ? "bg-dark text-white" : "bg-white text-dark shadow-sm"}`}>
      <Row className="align-items-center mb-4">
        <Col xs="auto">
          <CgFileDocument className="text-3xl" />
        </Col>
        <Col>
          <h5 className="font-weight-bold">Uploaded Documents</h5>
        </Col>
      </Row>

      <hr className={darkMode ? "border-light" : "border-dark"} />

      <div className="mt-3">
        {fileFields.map(({ label, key }) => {
          const filePath = cvData[key];
          if (!filePath) return null;

          return (
            <div key={key} className="mb-3">
              <p className="font-weight-medium">{label}</p>
              <Button
                variant={darkMode ? "outline-light" : "primary"}
                onClick={() => openInNewTab(filePath)}
              >
                View {label}
              </Button>
            </div>
          );
        })}
      </div>

      {/* Referred By Input Field */}
      <div className="mt-4">
        <label htmlFor="referredBy" className="form-label">
          Referred By <span className="text-danger">*</span>
        </label>
        <input
          type="text"
          id="referredBy"
          name="referredBy"
          className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
          placeholder="Enter the name of the person who referred you"
          value={referredBy || ""}
          readOnly 
        />
      </div>
    </Container>
  );
};

export default ViewUploadedDocuments;