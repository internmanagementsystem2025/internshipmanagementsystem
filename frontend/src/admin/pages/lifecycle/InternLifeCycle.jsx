import React, { useState } from "react";
import axios from "axios";
import { 
  Container, Row, Col, Card, Form, Button, Spinner, Alert,
  Badge, Accordion, Tab, Tabs, ListGroup
} from "react-bootstrap";
import { BookOpen, School, MapPin, Award, Layers } from "lucide-react";
import logo from "../../../assets/logo.png";
import { format } from 'date-fns';

const InternLifeCycle = ({ darkMode }) => {
  const [nic, setNic] = useState("");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!nic.trim()) {
      setError("Please enter a valid NIC number.");
      return;
    }
  
    setLoading(true);
    setError("");
    setUserData(null);
  
    try {
      const { data } = await axios.get(`http://localhost:5000/api/cvs/nic/${nic}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
  
      setUserData(data);
    } catch (err) {
      setError("No application found for this NIC number.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Format date helper function
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), 'MMMM d, yyyy');
    } catch {
      return dateString;
    }
  };

  // Render basic information section
  const renderBasicInfo = () => (
    <Card className={`mb-4 ${darkMode ? "bg-dark text-white" : ""}`}>
      <Card.Header className={darkMode ? "bg-secondary text-white" : "bg-light"}>
        <h5 className="mb-0">Basic Information</h5>
      </Card.Header>
      <Card.Body>
        <Row>
          <Col md={6}>
            <ListGroup variant="flush">
              <ListGroup.Item className={darkMode ? "bg-dark text-white" : ""}>
                <strong>Full Name:</strong> {userData.fullName}
              </ListGroup.Item>
              <ListGroup.Item className={darkMode ? "bg-dark text-white" : ""}>
                <strong>Name with Initials:</strong> {userData.nameWithInitials}
              </ListGroup.Item>
              <ListGroup.Item className={darkMode ? "bg-dark text-white" : ""}>
                <strong>Gender:</strong> {userData.gender}
              </ListGroup.Item>
              <ListGroup.Item className={darkMode ? "bg-dark text-white" : ""}>
                <strong>Date of Birth:</strong> {formatDate(userData.birthday)}
              </ListGroup.Item>
            </ListGroup>
          </Col>
          <Col md={6}>
            <ListGroup variant="flush">
              <ListGroup.Item className={darkMode ? "bg-dark text-white" : ""}>
                <strong>NIC:</strong> {userData.nic}
              </ListGroup.Item>
              <ListGroup.Item className={darkMode ? "bg-dark text-white" : ""}>
                <strong>Mobile:</strong> {userData.mobileNumber}
              </ListGroup.Item>
              <ListGroup.Item className={darkMode ? "bg-dark text-white" : ""}>
                <strong>Email:</strong> {userData.emailAddress}
              </ListGroup.Item>
              <ListGroup.Item className={darkMode ? "bg-dark text-white" : ""}>
                <strong>District:</strong> {userData.district}
              </ListGroup.Item>
            </ListGroup>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );

  // Render CV details section
  const renderCVDetails = () => (
    <Card className={`mb-4 ${darkMode ? "bg-dark text-white" : ""}`}>
      <Card.Header className={darkMode ? "bg-secondary text-white" : "bg-light"}>
        <h5 className="mb-0">Application Details</h5>
      </Card.Header>
      <Card.Body>
        <Row>
          <Col md={6}>
            <ListGroup variant="flush">
              <ListGroup.Item className={darkMode ? "bg-dark text-white" : ""}>
                <strong>Reference No:</strong> {userData.refNo}
              </ListGroup.Item>
              <ListGroup.Item className={darkMode ? "bg-dark text-white" : ""}>
                <strong>Applied Position:</strong> 
                <Badge bg="primary" className="ms-2 text-capitalize">
                  {userData.selectedRole === "dataEntry" ? "Data Entry Operator" : "Internship"}
                </Badge>
              </ListGroup.Item>
              <ListGroup.Item className={darkMode ? "bg-dark text-white" : ""}>
                <strong>Institute:</strong> {userData.institute}
              </ListGroup.Item>
              <ListGroup.Item className={darkMode ? "bg-dark text-white" : ""}>
                <strong>Application Date:</strong> {formatDate(userData.applicationDate)}
              </ListGroup.Item>
            </ListGroup>
          </Col>
          <Col md={6}>
            <ListGroup variant="flush">
              <ListGroup.Item className={darkMode ? "bg-dark text-white" : ""}>
                <strong>Status:</strong> 
                <Badge 
                  bg={
                    userData.currentStatus.includes("rejected") || 
                    userData.currentStatus.includes("failed") || 
                    userData.currentStatus === "terminated" ? "danger" : 
                    userData.currentStatus.includes("completed") ? "success" : "info"
                  }
                  className="ms-2 text-capitalize"
                >
                  {userData.currentStatus.replace(/-/g, ' ')}
                </Badge>
              </ListGroup.Item>
              <ListGroup.Item className={darkMode ? "bg-dark text-white" : ""}>
                <strong>Postal Address:</strong> {userData.postalAddress}
              </ListGroup.Item>
              <ListGroup.Item className={darkMode ? "bg-dark text-white" : ""}>
                <strong>Emergency Contact:</strong> {userData.emergencyContactName1} ({userData.emergencyContactNumber1})
              </ListGroup.Item>
              {userData.referredBy && (
                <ListGroup.Item className={darkMode ? "bg-dark text-white" : ""}>
                  <strong>Referred By:</strong> {userData.referredBy}
                </ListGroup.Item>
              )}
            </ListGroup>
          </Col>
        </Row>

        {/* Role-specific details */}
<Accordion className="mt-4">
      <Accordion.Item
        eventKey="0"
        className={darkMode ? "bg-dark text-white border-secondary" : ""}
      >
        <Accordion.Header>
          {userData.selectedRole === "dataEntry"
            ? "Data Entry Operator Details"
            : "Internship Details"}
        </Accordion.Header>

        <Accordion.Body>
          {userData.selectedRole === "dataEntry" ? (
            <>
              {/* O/L Results (Main + Optional in one card) */}
              <Card className="mb-3 shadow-sm">
                <Card.Header>
                  <BookOpen size={16} className="me-2" />
                  O/L Results
                </Card.Header>
                <Card.Body>
                  <Row className="mb-2">
                    <Col md={4}>
                      <strong>Language:</strong>{" "}
                      {userData.roleData?.dataEntry?.language || "N/A"}
                    </Col>
                    <Col md={4}>
                      <strong>Mathematics:</strong>{" "}
                      {userData.roleData?.dataEntry?.mathematics || "N/A"}
                    </Col>
                    <Col md={4}>
                      <strong>Science:</strong>{" "}
                      {userData.roleData?.dataEntry?.science || "N/A"}
                    </Col>
                  </Row>
                  <Row className="mb-3">
                    <Col md={4}>
                      <strong>English:</strong>{" "}
                      {userData.roleData?.dataEntry?.english || "N/A"}
                    </Col>
                    <Col md={4}>
                      <strong>History:</strong>{" "}
                      {userData.roleData?.dataEntry?.history || "N/A"}
                    </Col>
                    <Col md={4}>
                      <strong>Religion:</strong>{" "}
                      {userData.roleData?.dataEntry?.religion || "N/A"}
                    </Col>
                  </Row>

                  {/* Optional Subjects */}
                  {(userData.roleData?.dataEntry?.optional1Name ||
                    userData.roleData?.dataEntry?.optional2Name ||
                    userData.roleData?.dataEntry?.optional3Name) && (
                    <>
                      <h6 className="mt-3">Optional Subjects</h6>
                      <Row>
                        {userData.roleData.dataEntry.optional1Name && (
                          <Col md={4}>
                            <strong>
                              {userData.roleData.dataEntry.optional1Name}:
                            </strong>{" "}
                            {userData.roleData.dataEntry.optional1Result ||
                              "N/A"}
                          </Col>
                        )}
                        {userData.roleData.dataEntry.optional2Name && (
                          <Col md={4}>
                            <strong>
                              {userData.roleData.dataEntry.optional2Name}:
                            </strong>{" "}
                            {userData.roleData.dataEntry.optional2Result ||
                              "N/A"}
                          </Col>
                        )}
                        {userData.roleData.dataEntry.optional3Name && (
                          <Col md={4}>
                            <strong>
                              {userData.roleData.dataEntry.optional3Name}:
                            </strong>{" "}
                            {userData.roleData.dataEntry.optional3Result ||
                              "N/A"}
                          </Col>
                        )}
                      </Row>
                    </>
                  )}
                </Card.Body>
              </Card>

              {/* A/L Results */}
              {(userData.roleData?.dataEntry?.aLevelSubject1Name ||
                userData.roleData?.dataEntry?.aLevelSubject2Name ||
                userData.roleData?.dataEntry?.aLevelSubject3Name) && (
                <Card className="mb-3 shadow-sm">
                  <Card.Header>
                    <Award size={16} className="me-2" />
                    A/L Results
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      {userData.roleData.dataEntry.aLevelSubject1Name && (
                        <Col md={4}>
                          <strong>
                            {userData.roleData.dataEntry.aLevelSubject1Name}:
                          </strong>{" "}
                          {userData.roleData.dataEntry.aLevelSubject1Result ||
                            "N/A"}
                        </Col>
                      )}
                      {userData.roleData.dataEntry.aLevelSubject2Name && (
                        <Col md={4}>
                          <strong>
                            {userData.roleData.dataEntry.aLevelSubject2Name}:
                          </strong>{" "}
                          {userData.roleData.dataEntry.aLevelSubject2Result ||
                            "N/A"}
                        </Col>
                      )}
                      {userData.roleData.dataEntry.aLevelSubject3Name && (
                        <Col md={4}>
                          <strong>
                            {userData.roleData.dataEntry.aLevelSubject3Name}:
                          </strong>{" "}
                          {userData.roleData.dataEntry.aLevelSubject3Result ||
                            "N/A"}
                        </Col>
                      )}
                    </Row>
                  </Card.Body>
                </Card>
              )}

              {/* Preferred Location */}
              <Card className="mb-3 shadow-sm">
                <Card.Header>
                  <MapPin size={16} className="me-2" />
                  Preferred Location
                </Card.Header>
                <Card.Body>
                  <p>
                    {userData.roleData?.dataEntry?.preferredLocation ||
                      "Not specified"}
                  </p>
                </Card.Body>
              </Card>

              {/* Other Qualifications */}
              <Card className="mb-3 shadow-sm">
                <Card.Header>
                  <School size={16} className="me-2" />
                  Other Qualifications
                </Card.Header>
                <Card.Body>
                  <p>
                    {userData.roleData?.dataEntry?.otherQualifications ||
                      "None"}
                  </p>
                </Card.Body>
              </Card>
            </>
          ) : (
            <>
              {/* Internship Category */}
              <Card className="mb-3 shadow-sm">
                <Card.Header>
                  <BookOpen size={16} className="me-2" />
                  Category of Application
                </Card.Header>
                <Card.Body>
                  <p>
                    {userData.roleData?.internship?.categoryOfApply ||
                      "Not specified"}
                  </p>
                </Card.Body>
              </Card>

              {/* Higher Education */}
              <Card className="mb-3 shadow-sm">
                <Card.Header>
                  <School size={16} className="me-2" />
                  Higher Education
                </Card.Header>
                <Card.Body>
                  <p>
                    {userData.roleData?.internship?.higherEducation || "None"}
                  </p>
                </Card.Body>
              </Card>

              {/* Other Qualifications */}
              <Card className="mb-3 shadow-sm">
                <Card.Header>
                  <Award size={16} className="me-2" />
                  Other Qualifications
                </Card.Header>
                <Card.Body>
                  <p>
                    {userData.roleData?.internship?.otherQualifications ||
                      "None"}
                  </p>
                </Card.Body>
              </Card>
            </>
          )}
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>

      </Card.Body>
    </Card>
  );

  // Render interview details section
  const renderInterviewDetails = () => (
    <Card className={`mb-4 ${darkMode ? "bg-dark text-white" : ""}`}>
      <Card.Header className={darkMode ? "bg-secondary text-white" : "bg-light"}>
        <h5 className="mb-0">Interview Details</h5>
      </Card.Header>
      <Card.Body>
        {userData.interview.interviews && userData.interview.interviews.length > 0 ? (
          <Tabs
            defaultActiveKey="interview-0"
            id="interview-tabs"
            className={`mb-3 ${darkMode ? "dark-tabs" : ""}`}
          >
            {userData.interview.interviews.map((interview, index) => (
              <Tab
                key={`interview-${index}`}
                eventKey={`interview-${index}`}
                title={`Interview ${index + 1}`}
                className={darkMode ? "text-white" : ""}
              >
                <ListGroup variant="flush">
                  <ListGroup.Item className={darkMode ? "bg-dark text-white" : ""}>
                    <strong>Status:</strong> 
                    <Badge 
                      bg={
                        interview.result?.status === "interview-passed" ? "success" :
                        interview.result?.status === "interview-failed" ? "danger" : "warning"
                      }
                      className="ms-2"
                    >
                      {interview.result?.status?.replace('interview-', '') || 'Pending'}
                    </Badge>
                  </ListGroup.Item>
                  <ListGroup.Item className={darkMode ? "bg-dark text-white" : ""}>
                    <strong>Interview Name:</strong> {interview.interviewName || "N/A"}
                  </ListGroup.Item>
                  <ListGroup.Item className={darkMode ? "bg-dark text-white" : ""}>
                    <strong>Evaluated By:</strong> {interview.result?.evaluatedBy?.name || "N/A"}
                  </ListGroup.Item>
                  <ListGroup.Item className={darkMode ? "bg-dark text-white" : ""}>
                    <strong>Evaluation Date:</strong> {formatDate(interview.result?.evaluatedDate)}
                  </ListGroup.Item>
                  <ListGroup.Item className={darkMode ? "bg-dark text-white" : ""}>
                    <strong>Feedback:</strong> {interview.result?.feedback || "No feedback provided"}
                  </ListGroup.Item>
                </ListGroup>
              </Tab>
            ))}
          </Tabs>
        ) : (
          <Alert variant="info">
            No interview details available yet.
          </Alert>
        )}
      </Card.Body>
    </Card>
  );

// Render induction details section
const renderInductionDetails = () => (
  <Card className={`mb-4 ${darkMode ? "bg-dark text-white" : ""}`}>
    <Card.Header className={darkMode ? "bg-secondary text-white" : "bg-light"}>
      <h5 className="mb-0">Induction Details</h5>
    </Card.Header>
    <Card.Body>
      {userData.induction && (userData.induction.inductionAssigned || userData.induction.status !== "induction-not-assigned") ? (
        <ListGroup variant="flush">
          <ListGroup.Item className={darkMode ? "bg-dark text-white" : ""}>
            <strong>Status:</strong> 
            <Badge 
              bg={
                userData.induction.result?.status === "induction-passed" ? "success" :
                userData.induction.result?.status === "induction-failed" ? "danger" : "warning"
              }
              className="ms-2"
            >
              {(userData.induction.result?.status || userData.induction.status || "pending").replace('induction-', '')}
            </Badge>
          </ListGroup.Item>
          <ListGroup.Item className={darkMode ? "bg-dark text-white" : ""}>
            <strong>Induction Name:</strong> {userData.induction.inductionName || "N/A"}
          </ListGroup.Item>
          <ListGroup.Item className={darkMode ? "bg-dark text-white" : ""}>
            <strong>Evaluated By:</strong> {userData.induction.result?.evaluatedBy?.name || "N/A"}
          </ListGroup.Item>
          <ListGroup.Item className={darkMode ? "bg-dark text-white" : ""}>
            <strong>Evaluation Date:</strong> {formatDate(userData.induction.result?.evaluatedDate)}
          </ListGroup.Item>
          <ListGroup.Item className={darkMode ? "bg-dark text-white" : ""}>
            <strong>Feedback:</strong> {userData.induction.result?.feedback || "No feedback provided"}
          </ListGroup.Item>
        </ListGroup>
      ) : (
        <Alert variant="info">
          No induction details available yet.
        </Alert>
      )}
    </Card.Body>
  </Card>
);

  // Render schema assignment details section
  const renderSchemaDetails = () => (
    <Card className={`mb-4 ${darkMode ? "bg-dark text-white" : ""}`}>
      <Card.Header className={darkMode ? "bg-secondary text-white" : "bg-light"}>
        <h5 className="mb-0">Assignment Details</h5>
      </Card.Header>
      <Card.Body>
        {userData.schemaAssignment.schemaAssigned ? (
          <ListGroup variant="flush">
            <ListGroup.Item className={darkMode ? "bg-dark text-white" : ""}>
              <strong>Status:</strong> 
              <Badge 
                bg={
                  userData.schemaAssignment.status === "schema-completed" ? "success" :
                  userData.schemaAssignment.status === "terminated" ? "danger" : "info"
                }
                className="ms-2"
              >
                {userData.schemaAssignment.status.replace('schema-', '')}
              </Badge>
            </ListGroup.Item>
            <ListGroup.Item className={darkMode ? "bg-dark text-white" : ""}>
              <strong>Scheme Name:</strong> {userData.schemaAssignment.schemeName || "N/A"}
            </ListGroup.Item>
            <ListGroup.Item className={darkMode ? "bg-dark text-white" : ""}>
              <strong>Manager:</strong> {userData.schemaAssignment.managerName || "N/A"} ({userData.schemaAssignment.managerRole})
            </ListGroup.Item>
            <ListGroup.Item className={darkMode ? "bg-dark text-white" : ""}>
              <strong>Period:</strong> {userData.schemaAssignment.internshipPeriod} months
            </ListGroup.Item>
            <ListGroup.Item className={darkMode ? "bg-dark text-white" : ""}>
              <strong>Dates:</strong> {formatDate(userData.schemaAssignment.startDate)} to {formatDate(userData.schemaAssignment.endDate)}
            </ListGroup.Item>
            <ListGroup.Item className={darkMode ? "bg-dark text-white" : ""}>
              <strong>Evaluation:</strong> 
              {userData.schemaAssignment.evaluation ? (
                <>
                  <Badge 
                    bg={
                      userData.schemaAssignment.evaluation.status === "satisfactory" ? "success" :
                      userData.schemaAssignment.evaluation.status === "unsatisfactory" ? "danger" : "warning"
                    }
                    className="ms-2"
                  >
                    {userData.schemaAssignment.evaluation.status}
                  </Badge>
                  <div className="mt-2">
                    <strong>Feedback:</strong> {userData.schemaAssignment.evaluation.feedback || "No feedback provided"}
                  </div>
                </>
              ) : "Pending"}
            </ListGroup.Item>
          </ListGroup>
        ) : (
          <Alert variant="info">
            No assignment details available yet.
          </Alert>
        )}
      </Card.Body>
    </Card>
  );

  return (
    <div className={`status-report-page d-flex flex-column min-vh-100 ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
      {/* Header with Background */}
      <div className="header-section py-5" style={{
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        <Container>
          <div className="text-center">
            <img 
              src={logo} 
              alt="Company Logo" 
              className="mx-auto d-block mb-3" 
              style={{ height: "60px", filter: darkMode ? 'brightness(1.2)' : 'none' }} 
            />
            <h2 className="mb-4 fw-bold">INTERN LIFE CYCLE</h2>
            
            {/* NIC Search Section */}
            <Row className="justify-content-center">
              <Col md={8} lg={6}>
                <Card className={`border-0 shadow ${darkMode ? "bg-dark text-white" : ""}`}>
                  <Card.Body className="p-4">
                    <p className="mb-3">Enter your NIC number to view your application details</p>
                    <Form className="d-flex gap-2">
                      <Form.Control
                        type="text"
                        placeholder="Enter NIC Number"
                        value={nic}
                        onChange={(e) => setNic(e.target.value)}
                        className={`flex-grow-1 ${darkMode ? "bg-dark text-white border-secondary" : ""}`}
                      />
                      <Button 
                        variant="primary" 
                        onClick={handleSearch}
                        className="px-4"
                        disabled={loading}
                      >
                        {loading ? <Spinner as="span" animation="border" size="sm" /> : "Search"}
                      </Button>
                    </Form>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </div>
        </Container>
      </div>

      <Container className="py-4">
        {/* Error Message */}
        {error && (
          <Alert 
            variant="danger" 
            className="text-center mb-4 shadow-sm"
            dismissible
            onClose={() => setError("")}
          >
            {error}
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
            <p className="mt-3">Loading your application details...</p>
          </div>
        )}

        {/* Display user data sections */}
        {userData && (
          <>
            {renderBasicInfo()}
            {renderCVDetails()}
            {renderInterviewDetails()}
            {renderInductionDetails()}
            {renderSchemaDetails()}
          </>
        )}
      </Container>

      <style jsx>{`
        :global(.dark-tabs .nav-link) {
          color: #adb5bd;
        }
        :global(.dark-tabs .nav-link.active) {
          background-color: #495057;
          color: white;
          border-color: #495057;
        }
        :global(.dark-tabs .nav-tabs) {
          border-bottom-color: #495057;
        }
      `}</style>
    </div>
  );
};

export default InternLifeCycle;