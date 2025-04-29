import React from "react";
import { Card, Row, Col, Badge, ListGroup, Button, ProgressBar } from "react-bootstrap";
import { CgFileDocument } from "react-icons/cg";

const CV_DOCUMENT_BASE_URL = "http://localhost:5000";

const CVDetails = ({ cvData, darkMode }) => {
  if (!cvData) {
    return <p className="text-center">No CV data available.</p>;
  }

  // Function to format date string
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return dateString;
    }
  };

  // Function to handle document download/view
  const handleViewDocument = (documentPath) => {
    if (!documentPath) {
      alert("Document not available");
      return;
    }

    // Ensure the documentPath is a valid URL or construct it properly
    let fullUrl;
    if (documentPath.startsWith("http") || documentPath.startsWith("/")) {
      fullUrl = documentPath; // Use as-is if it's already a full URL or starts with a slash
    } else {
      // Construct the full URL using the base URL (adjust as needed)
      const fileName = documentPath.split("\\").pop();
      fullUrl = `${CV_DOCUMENT_BASE_URL}/uploads/${fileName}`;
    }

    // Open in new tab
    window.open(fullUrl, '_blank');
  };

  // Function to get status badge variant
  const getStatusVariant = (status) => {
    switch (status) {
      case "approved": return "success";
      case "rejected": return "danger";
      case "pending": return "warning";
      case "pass": return "success";
      case "fail": return "danger";
      default: return "secondary";
    }
  };

  return (
    <Card className={`border-0 ${darkMode ? "bg-dark text-white" : "bg-light"}`}>
      <Card.Body>
        <h4 className="mb-4">Curriculum Vitae</h4>
        
        {/* Reference Number and Application Date */}
        <Row className="mb-4">
          <Col md={6} className="d-flex">
            <Card className={`flex-fill ${darkMode ? "bg-dark text-white border-secondary" : "bg-light border"}`}>
              <Card.Body>
                <h5>Reference Number: {cvData.refNo}</h5>
                <p>Application Date: {formatDate(cvData.applicationDate)}</p>
                <Badge bg={getStatusVariant(cvData.cvStatus)}>
                  Status: {cvData.cvStatus.toUpperCase()}
                </Badge>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} className="d-flex">
            <Card className={`flex-fill ${darkMode ? "bg-dark text-white border-secondary" : "bg-light border"}`}>
              <Card.Body>
                <h5>Selected Role: {cvData.selectedRole}</h5>
                <p>Preferred Location: {cvData.preferredLocation || "N/A"}</p>
                <p>Category of Apply: {cvData.categoryOfApply || "N/A"}</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Personal Information */}
        <div className="mb-4">
          <h5>Personal Information</h5>
          <Row>
            <Col md={6} className="d-flex">
              <ListGroup variant={darkMode ? "dark" : "light"} className="flex-fill">
                <ListGroup.Item className={darkMode ? "bg-dark text-white border-secondary" : ""}>
                  <strong>Full Name:</strong> {cvData.fullName}
                </ListGroup.Item>
                <ListGroup.Item className={darkMode ? "bg-dark text-white border-secondary" : ""}>
                  <strong>Name with Initials:</strong> {cvData.nameWithInitials}
                </ListGroup.Item>
                <ListGroup.Item className={darkMode ? "bg-dark text-white border-secondary" : ""}>
                  <strong>Gender:</strong> {cvData.gender}
                </ListGroup.Item>
                <ListGroup.Item className={darkMode ? "bg-dark text-white border-secondary" : ""}>
                  <strong>NIC:</strong> {cvData.nic}
                </ListGroup.Item>
                <ListGroup.Item className={darkMode ? "bg-dark text-white border-secondary" : ""}>
                  <strong>Birthday:</strong> {cvData.birthday}
                </ListGroup.Item>
              </ListGroup>
            </Col>
            <Col md={6} className="d-flex">
              <ListGroup variant={darkMode ? "dark" : "light"} className="flex-fill">
                <ListGroup.Item className={darkMode ? "bg-dark text-white border-secondary" : ""}>
                  <strong>Mobile Number:</strong> {cvData.mobileNumber}
                </ListGroup.Item>
                <ListGroup.Item className={darkMode ? "bg-dark text-white border-secondary" : ""}>
                  <strong>Land Phone:</strong> {cvData.landPhone || "N/A"}
                </ListGroup.Item>
                <ListGroup.Item className={darkMode ? "bg-dark text-white border-secondary" : ""}>
                  <strong>Email Address:</strong> {cvData.emailAddress}
                </ListGroup.Item>
                <ListGroup.Item className={darkMode ? "bg-dark text-white border-secondary" : ""}>
                  <strong>Postal Address:</strong> {cvData.postalAddress}
                </ListGroup.Item>
                <ListGroup.Item className={darkMode ? "bg-dark text-white border-secondary" : ""}>
                  <strong>District:</strong> {cvData.district}
                </ListGroup.Item>
              </ListGroup>
            </Col>
          </Row>
        </div>

        {/* Education Section */}
        <div className="mb-4">
          <h5>Education</h5>
          <Card className={darkMode ? "bg-dark text-white border-secondary" : "bg-light border"}>
            <Card.Body>
              <h6>Institute: {cvData.institute}</h6>
              <p>Higher Education: {cvData.higherEducation || "N/A"}</p>
              
              {/* O/L Results */}
              <h6 className="mt-3">O/L Results</h6>
              <Row className="mb-3">
                <Col md={4}>
                  <p className="mb-1"><strong>Language:</strong> {cvData.olResults?.language || "N/A"}</p>
                  <p className="mb-1"><strong>Mathematics:</strong> {cvData.olResults?.mathematics || "N/A"}</p>
                  <p className="mb-1"><strong>Science:</strong> {cvData.olResults?.science || "N/A"}</p>
                </Col>
                <Col md={4}>
                  <p className="mb-1"><strong>English:</strong> {cvData.olResults?.english || "N/A"}</p>
                  <p className="mb-1"><strong>History:</strong> {cvData.olResults?.history || "N/A"}</p>
                  <p className="mb-1"><strong>Religion:</strong> {cvData.olResults?.religion || "N/A"}</p>
                </Col>
                <Col md={4}>
                  <p className="mb-1"><strong>Optional 1:</strong> {cvData.olResults?.optional1 || "N/A"}</p>
                  <p className="mb-1"><strong>Optional 2:</strong> {cvData.olResults?.optional2 || "N/A"}</p>
                  <p className="mb-1"><strong>Optional 3:</strong> {cvData.olResults?.optional3 || "N/A"}</p>
                </Col>
              </Row>
              
              {/* A/L Results */}
              <h6 className="mt-3">A/L Results</h6>
              <Row>
                <Col md={6}>
                  <p className="mb-1"><strong>Subject 1:</strong> {cvData.alResults?.aLevelSubject1 || "N/A"}</p>
                  <p className="mb-1"><strong>Subject 2:</strong> {cvData.alResults?.aLevelSubject2 || "N/A"}</p>
                  <p className="mb-1"><strong>Subject 3:</strong> {cvData.alResults?.aLevelSubject3 || "N/A"}</p>
                </Col>
                <Col md={6}>
                  <p className="mb-1"><strong>GIT:</strong> {cvData.alResults?.git || "N/A"}</p>
                  <p className="mb-1"><strong>General Knowledge:</strong> {cvData.alResults?.gk || "N/A"}</p>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </div>

        {/* Microsoft Office Proficiency */}
        <div className="mb-4">
          <h5>Microsoft Office Proficiency</h5>
          <Card className={darkMode ? "bg-dark text-white border-secondary" : "bg-light border"}>
            <Card.Body>
              <Row>
                <Col md={4}>
                  <p><strong>MS Word</strong></p>
                  <ProgressBar 
                    now={cvData.proficiency?.msWord || 0} 
                    label={`${cvData.proficiency?.msWord || 0}%`} 
                    variant="success" 
                    className="mb-3"
                  />
                </Col>
                <Col md={4}>
                  <p><strong>MS Excel</strong></p>
                  <ProgressBar 
                    now={cvData.proficiency?.msExcel || 0} 
                    label={`${cvData.proficiency?.msExcel || 0}%`} 
                    variant="info" 
                    className="mb-3"
                  />
                </Col>
                <Col md={4}>
                  <p><strong>MS PowerPoint</strong></p>
                  <ProgressBar 
                    now={cvData.proficiency?.msPowerPoint || 0} 
                    label={`${cvData.proficiency?.msPowerPoint || 0}%`} 
                    variant="warning" 
                    className="mb-3"
                  />
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </div>

        {/* Additional Information */}
        <div className="mb-4">
          <h5>Additional Information</h5>
          <Card className={darkMode ? "bg-dark text-white border-secondary" : "bg-light border"}>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <p><strong>Other Qualifications:</strong> {cvData.otherQualifications || "N/A"}</p>
                  <p><strong>Previous Training:</strong> {cvData.previousTraining || "N/A"}</p>
                  <p><strong>Referred By:</strong> {cvData.referredBy || "N/A"}</p>
                </Col>
                <Col md={6}>
                  <h6>Emergency Contacts</h6>
                  <p><strong>Name 1:</strong> {cvData.emergencyContactName1}</p>
                  <p><strong>Contact 1:</strong> {cvData.emergencyContactNumber1}</p>
                  {cvData.emergencyContactName2 && (
                    <>
                      <p><strong>Name 2:</strong> {cvData.emergencyContactName2}</p>
                      <p><strong>Contact 2:</strong> {cvData.emergencyContactNumber2}</p>
                    </>
                  )}
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </div>

        {/* Interview and Induction Information */}
        {(cvData.interviewId || cvData.inductionId) && (
          <div className="mb-4">
            <h5>Application Progress</h5>
            <Row>
              {cvData.interviewId && (
                <Col md={6} className="mb-3 d-flex">
                  <Card className={`flex-fill ${darkMode ? "bg-dark text-white border-secondary" : "bg-light border"}`}>
                    <Card.Body>
                      <h6>Interview Details</h6>
                      <p><strong>Interview Name:</strong> {cvData.interviewName || "N/A"}</p>
                      <p><strong>Interview Date:</strong> {cvData.interviewDate || "N/A"}</p>
                      <Badge bg={getStatusVariant(cvData.interviewStatus)}>
                        Status: {cvData.interviewStatus.toUpperCase()}
                      </Badge>
                    </Card.Body>
                  </Card>
                </Col>
              )}
              
              {cvData.inductionId && (
                <Col md={6} className="d-flex">
                  <Card className={`flex-fill ${darkMode ? "bg-dark text-white border-secondary" : "bg-light border"}`}>
                    <Card.Body>
                      <h6>Induction Details</h6>
                      <p><strong>Induction Name:</strong> {cvData.inductionName || "N/A"}</p>
                      <p><strong>Start Date:</strong> {cvData.inductionStartDate || "N/A"}</p>
                      <p><strong>End Date:</strong> {cvData.inductionEndDate || "N/A"}</p>
                      <Badge bg={getStatusVariant(cvData.inductionStatus)}>
                        Status: {cvData.inductionStatus.toUpperCase()}
                      </Badge>
                    </Card.Body>
                  </Card>
                </Col>
              )}
            </Row>
          </div>
        )}

        {/* Document Buttons */}
        <div className="mb-4">
          <h5>Documents</h5>
          <div className="d-flex flex-wrap gap-2">
            {cvData.updatedCv && (
              <Button 
                variant="primary" 
                onClick={() => handleViewDocument(cvData.updatedCv)}
              >
                <CgFileDocument /> View CV
              </Button>
            )}
            
            {cvData.nicFile && (
              <Button 
                variant="primary" 
                onClick={() => handleViewDocument(cvData.nicFile)}
              >
                <CgFileDocument /> View NIC
              </Button>
            )}
            
            {cvData.policeClearanceReport && (
              <Button 
                variant="primary" 
                onClick={() => handleViewDocument(cvData.policeClearanceReport)}
              >
                <CgFileDocument /> View Police Clearance
              </Button>
            )}
            
            {cvData.internshipRequestLetter && (
              <Button 
                variant="primary" 
                onClick={() => handleViewDocument(cvData.internshipRequestLetter)}
              >
                <CgFileDocument /> View Internship Request Letter
              </Button>
            )}
            
            {!cvData.updatedCv && !cvData.nicFile && !cvData.policeClearanceReport && !cvData.internshipRequestLetter && (
              <p>No documents available</p>
            )}
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default CVDetails;