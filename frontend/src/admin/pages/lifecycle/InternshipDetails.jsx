import React from "react";
import { Card, Row, Col, Badge, ListGroup, Table, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const InternshipDetails = ({ internData, darkMode }) => {
  const navigate = useNavigate();

  if (!internData) {
    return <p className="text-center">No internship data available.</p>;
  }

  // Format date to display in a readable format
  const formatDate = (dateString) => {
    if (!dateString) return "Not assigned";
    return new Date(dateString).toLocaleDateString();
  };

  // Navigate to the Acceptance Letter Request page with NIC
  const handleAcceptanceLetterClick = () => {
    navigate(`/acceptance-letter/${internData.nic}`);
  };

  return (
    <Card className={`border-0 ${darkMode ? "bg-dark text-white" : "bg-light"}`}>
      <Card.Body>
        <h4 className="mb-4">Internship Details</h4>

        {/* Basic Internship Info */}
        <Table responsive striped bordered hover variant={darkMode ? "dark" : "light"} className="mb-4">
          <tbody>
            <tr>
              <th>Full Name</th>
              <td>{internData.fullName}</td>
            </tr>
            <tr>
              <th>NIC</th>
              <td>{internData.nic}</td>
            </tr>
            <tr>
              <th>Status</th>
              <td>
                <Badge bg={
                  internData.cvStatus === "approved" ? "success" : 
                  internData.cvStatus === "reviewing" ? "warning" : 
                  internData.cvStatus === "rejected" ? "danger" : "secondary"
                }>
                  {internData.cvStatus?.toUpperCase() || "PENDING"}
                </Badge>
              </td>
            </tr>
            <tr>
              <th>Assigned Scheme</th>
              <td>{internData.schemeName || "Not assigned"}</td>
            </tr>
            <tr>
              <th>Manager</th>
              <td>{internData.managerName || "Not assigned"}</td>
            </tr>
            <tr>
              <th>Internship Period</th>
              <td>{internData.internshipPeriod || 0} months</td>
            </tr>
            <tr>
              <th>Start Date</th>
              <td>{formatDate(internData.schemeStartDate)}</td>
            </tr>
            <tr>
              <th>Assignment Date</th>
              <td>{formatDate(internData.schemeAssignedDate)}</td>
            </tr>
            <tr>
              <th>Scheme Approved</th>
              <td>
                {internData.schemeApproved ? 
                  <Badge bg="success">YES</Badge> : 
                  <Badge bg="danger">NO</Badge>
                }
              </td>
            </tr>
            <tr>
              <th>Scheme Status</th>
              <td>
                <Badge bg={
                  internData.schemeStatus === "approved" ? "success" : 
                  internData.schemeStatus === "rejected" ? "danger" : "warning"
                }>
                  {internData.schemeStatus?.toUpperCase() || "PENDING"}
                </Badge>
              </td>
            </tr>
          </tbody>
        </Table>

        {/* Additional Details */}
        <Row className="mb-4">
          <Col md={6}>
            <Card className={darkMode ? "bg-dark text-white border-secondary" : ""}>
              <Card.Header>Personal Information</Card.Header>
              <ListGroup variant={darkMode ? "flush" : "light"}>
                <ListGroup.Item className={darkMode ? "bg-dark text-white border-secondary" : ""}>
                  <strong>Gender:</strong> {internData.gender}
                </ListGroup.Item>
                <ListGroup.Item className={darkMode ? "bg-dark text-white border-secondary" : ""}>
                  <strong>Birthday:</strong> {formatDate(internData.birthday)}
                </ListGroup.Item>
                <ListGroup.Item className={darkMode ? "bg-dark text-white border-secondary" : ""}>
                  <strong>District:</strong> {internData.district}
                </ListGroup.Item>
                <ListGroup.Item className={darkMode ? "bg-dark text-white border-secondary" : ""}>
                  <strong>Mobile:</strong> {internData.mobileNumber}
                </ListGroup.Item>
                <ListGroup.Item className={darkMode ? "bg-dark text-white border-secondary" : ""}>
                  <strong>Email:</strong> {internData.emailAddress}
                </ListGroup.Item>
              </ListGroup>
            </Card>
          </Col>
          <Col md={6}>
            <Card className={darkMode ? "bg-dark text-white border-secondary" : ""}>
              <Card.Header>Academic Information</Card.Header>
              <ListGroup variant={darkMode ? "flush" : "light"}>
                <ListGroup.Item className={darkMode ? "bg-dark text-white border-secondary" : ""}>
                  <strong>Institute:</strong> {internData.institute}
                </ListGroup.Item>
                <ListGroup.Item className={darkMode ? "bg-dark text-white border-secondary" : ""}>
                  <strong>Selected Role:</strong> {internData.selectedRole}
                </ListGroup.Item>
                <ListGroup.Item className={darkMode ? "bg-dark text-white border-secondary" : ""}>
                  <strong>For Request:</strong> {internData.forRequest || "No"}
                </ListGroup.Item>
              </ListGroup>
            </Card>
          </Col>
        </Row>

        {/* Action Buttons */}
        <div className="d-flex justify-content-center mt-4">
          <Button variant="primary" className="me-3" onClick={handleAcceptanceLetterClick}>
            Acceptance Letter
          </Button>
          <Button variant="success">Send Email</Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default InternshipDetails;
