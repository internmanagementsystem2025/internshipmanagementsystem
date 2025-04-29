import React, { useState } from "react";
import { Card, Row, Col, Table, Badge, Button, Modal, ListGroup, Accordion } from "react-bootstrap";

const CVDetailsCard = ({ userData, darkMode }) => {
  const [showCVModal, setShowCVModal] = useState(false);

  if (!userData) return null;

  const cvStatus = userData.cvApproval.status;
  const getStatusBadge = (status) => {
    const statusMap = {
      "cv-submitted": { bg: "info", text: "Submitted" },
      "cv-pending": { bg: "warning", text: "Pending" },
      "cv-approved": { bg: "success", text: "Approved" },
      "cv-rejected": { bg: "danger", text: "Rejected" }
    };
    
    const statusInfo = statusMap[status] || { bg: "secondary", text: "Unknown" };
    return <Badge bg={statusInfo.bg}>{statusInfo.text}</Badge>;
  };

  return (
    <>
      <Card className={`border-0 shadow-sm mb-4 ${darkMode ? "bg-dark text-white" : ""}`}>
        <Card.Header className={`bg-transparent py-3 ${darkMode ? "border-secondary" : ""}`}>
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0 fw-bold">CV Details</h5>
            <Button 
              variant="outline-primary" 
              size="sm"
              onClick={() => setShowCVModal(true)}
            >
              View Full Details
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <div className="mb-3">
                <div className={darkMode ? "text-light-emphasis" : "text-muted"}>Status</div>
                <div>{getStatusBadge(cvStatus)}</div>
              </div>
              <div className="mb-3">
                <div className={darkMode ? "text-light-emphasis" : "text-muted"}>Submission Date</div>
                <div>{new Date(userData.applicationDate).toLocaleDateString()}</div>
              </div>
            </Col>
            <Col md={6}>
              <div className="mb-3">
                <div className={darkMode ? "text-light-emphasis" : "text-muted"}>Review Date</div>
                <div>
                  {userData.cvApproval.approvedDate 
                    ? new Date(userData.cvApproval.approvedDate).toLocaleDateString() 
                    : "Pending"}
                </div>
              </div>
              <div className="mb-3">
                <div className={darkMode ? "text-light-emphasis" : "text-muted"}>Feedback</div>
                <div>{userData.cvApproval.notes || "No feedback provided yet"}</div>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* CV Details Modal */}
      <Modal
        show={showCVModal}
        onHide={() => setShowCVModal(false)}
        size="lg"
        centered
        className={darkMode ? "modal-dark" : ""}
      >
        <Modal.Header closeButton className={darkMode ? "bg-dark text-white border-secondary" : ""}>
          <Modal.Title>CV Details</Modal.Title>
        </Modal.Header>
        <Modal.Body className={darkMode ? "bg-dark text-white" : ""}>
          <Accordion defaultActiveKey="0" className={darkMode ? "accordion-dark" : ""}>
            <Accordion.Item eventKey="0" className={darkMode ? "bg-dark border-secondary" : ""}>
              <Accordion.Header className={darkMode ? "accordion-dark-header" : ""}>Personal Information</Accordion.Header>
              <Accordion.Body className={darkMode ? "bg-dark text-white" : ""}>
                <ListGroup variant={darkMode ? "dark" : "flush"}>
                  <ListGroup.Item className={darkMode ? "bg-dark text-white border-secondary" : ""}>
                    <Row>
                      <Col md={4} className={darkMode ? "text-light-emphasis" : "text-muted"}>Full Name</Col>
                      <Col md={8}>{userData.fullName}</Col>
                    </Row>
                  </ListGroup.Item>
                  <ListGroup.Item className={darkMode ? "bg-dark text-white border-secondary" : ""}>
                    <Row>
                      <Col md={4} className={darkMode ? "text-light-emphasis" : "text-muted"}>Gender</Col>
                      <Col md={8}>{userData.gender}</Col>
                    </Row>
                  </ListGroup.Item>
                  <ListGroup.Item className={darkMode ? "bg-dark text-white border-secondary" : ""}>
                    <Row>
                      <Col md={4} className={darkMode ? "text-light-emphasis" : "text-muted"}>Birthday</Col>
                      <Col md={8}>{userData.birthday}</Col>
                    </Row>
                  </ListGroup.Item>
                  <ListGroup.Item className={darkMode ? "bg-dark text-white border-secondary" : ""}>
                    <Row>
                      <Col md={4} className={darkMode ? "text-light-emphasis" : "text-muted"}>NIC</Col>
                      <Col md={8}>{userData.nic}</Col>
                    </Row>
                  </ListGroup.Item>
                  <ListGroup.Item className={darkMode ? "bg-dark text-white border-secondary" : ""}>
                    <Row>
                      <Col md={4} className={darkMode ? "text-light-emphasis" : "text-muted"}>Address</Col>
                      <Col md={8}>{userData.postalAddress}</Col>
                    </Row>
                  </ListGroup.Item>
                  <ListGroup.Item className={darkMode ? "bg-dark text-white border-secondary" : ""}>
                    <Row>
                      <Col md={4} className={darkMode ? "text-light-emphasis" : "text-muted"}>District</Col>
                      <Col md={8}>{userData.district}</Col>
                    </Row>
                  </ListGroup.Item>
                </ListGroup>
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="1" className={darkMode ? "bg-dark border-secondary" : ""}>
              <Accordion.Header className={darkMode ? "accordion-dark-header" : ""}>Contact Information</Accordion.Header>
              <Accordion.Body className={darkMode ? "bg-dark text-white" : ""}>
                <ListGroup variant={darkMode ? "dark" : "flush"}>
                  <ListGroup.Item className={darkMode ? "bg-dark text-white border-secondary" : ""}>
                    <Row>
                      <Col md={4} className={darkMode ? "text-light-emphasis" : "text-muted"}>Mobile</Col>
                      <Col md={8}>{userData.mobileNumber}</Col>
                    </Row>
                  </ListGroup.Item>
                  {userData.landPhone && (
                    <ListGroup.Item className={darkMode ? "bg-dark text-white border-secondary" : ""}>
                      <Row>
                        <Col md={4} className={darkMode ? "text-light-emphasis" : "text-muted"}>Land Phone</Col>
                        <Col md={8}>{userData.landPhone}</Col>
                      </Row>
                    </ListGroup.Item>
                  )}
                  <ListGroup.Item className={darkMode ? "bg-dark text-white border-secondary" : ""}>
                    <Row>
                      <Col md={4} className={darkMode ? "text-light-emphasis" : "text-muted"}>Email</Col>
                      <Col md={8}>{userData.emailAddress}</Col>
                    </Row>
                  </ListGroup.Item>
                  <ListGroup.Item className={darkMode ? "bg-dark text-white border-secondary" : ""}>
                    <Row>
                      <Col md={4} className={darkMode ? "text-light-emphasis" : "text-muted"}>Emergency Contact 1</Col>
                      <Col md={8}>{userData.emergencyContactName1} - {userData.emergencyContactNumber1}</Col>
                    </Row>
                  </ListGroup.Item>
                  {userData.emergencyContactName2 && (
                    <ListGroup.Item className={darkMode ? "bg-dark text-white border-secondary" : ""}>
                      <Row>
                        <Col md={4} className={darkMode ? "text-light-emphasis" : "text-muted"}>Emergency Contact 2</Col>
                        <Col md={8}>{userData.emergencyContactName2} - {userData.emergencyContactNumber2}</Col>
                      </Row>
                    </ListGroup.Item>
                  )}
                </ListGroup>
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="2" className={darkMode ? "bg-dark border-secondary" : ""}>
              <Accordion.Header className={darkMode ? "accordion-dark-header" : ""}>Educational Background</Accordion.Header>
              <Accordion.Body className={darkMode ? "bg-dark text-white" : ""}>
                <ListGroup variant={darkMode ? "dark" : "flush"}>
                  <ListGroup.Item className={darkMode ? "bg-dark text-white border-secondary" : ""}>
                    <Row>
                      <Col md={4} className={darkMode ? "text-light-emphasis" : "text-muted"}>Institute</Col>
                      <Col md={8}>{userData.institute}</Col>
                    </Row>
                  </ListGroup.Item>
                  
                  {userData.selectedRole === "internship" && userData.roleData?.internship && (
                    <>
                      <ListGroup.Item className={darkMode ? "bg-dark text-white border-secondary" : ""}>
                        <Row>
                          <Col md={4} className={darkMode ? "text-light-emphasis" : "text-muted"}>Category</Col>
                          <Col md={8}>{userData.roleData.internship.categoryOfApply}</Col>
                        </Row>
                      </ListGroup.Item>
                      <ListGroup.Item className={darkMode ? "bg-dark text-white border-secondary" : ""}>
                        <Row>
                          <Col md={4} className={darkMode ? "text-light-emphasis" : "text-muted"}>Higher Education</Col>
                          <Col md={8}>{userData.roleData.internship.higherEducation}</Col>
                        </Row>
                      </ListGroup.Item>
                    </>
                  )}
                  
                  {userData.selectedRole === "dataEntry" && userData.roleData?.dataEntry && (
                    <>
                      <ListGroup.Item className={darkMode ? "bg-dark text-white border-secondary" : ""}>
                        <Row>
                          <Col md={4} className={darkMode ? "text-light-emphasis" : "text-muted"}>MS Office Proficiency</Col>
                          <Col md={8}>
                            <div>Word: {userData.roleData.dataEntry.proficiency.msWord}%</div>
                            <div>Excel: {userData.roleData.dataEntry.proficiency.msExcel}%</div>
                            <div>PowerPoint: {userData.roleData.dataEntry.proficiency.msPowerPoint}%</div>
                          </Col>
                        </Row>
                      </ListGroup.Item>
                      <ListGroup.Item className={darkMode ? "bg-dark text-white border-secondary" : ""}>
                        <Row>
                          <Col md={4} className={darkMode ? "text-light-emphasis" : "text-muted"}>Preferred Location</Col>
                          <Col md={8}>{userData.roleData.dataEntry.preferredLocation}</Col>
                        </Row>
                      </ListGroup.Item>
                    </>
                  )}
                  
                  <ListGroup.Item className={darkMode ? "bg-dark text-white border-secondary" : ""}>
                    <Row>
                      <Col md={4} className={darkMode ? "text-light-emphasis" : "text-muted"}>Previous Training</Col>
                      <Col md={8}>{userData.previousTraining}</Col>
                    </Row>
                  </ListGroup.Item>
                </ListGroup>
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="3" className={darkMode ? "bg-dark border-secondary" : ""}>
              <Accordion.Header className={darkMode ? "accordion-dark-header" : ""}>Review Status</Accordion.Header>
              <Accordion.Body className={darkMode ? "bg-dark text-white" : ""}>
                <ListGroup variant={darkMode ? "dark" : "flush"}>
                  <ListGroup.Item className={darkMode ? "bg-dark text-white border-secondary" : ""}>
                    <Row>
                      <Col md={4} className={darkMode ? "text-light-emphasis" : "text-muted"}>Status</Col>
                      <Col md={8}>{getStatusBadge(cvStatus)}</Col>
                    </Row>
                  </ListGroup.Item>
                  <ListGroup.Item className={darkMode ? "bg-dark text-white border-secondary" : ""}>
                    <Row>
                      <Col md={4} className={darkMode ? "text-light-emphasis" : "text-muted"}>Review Date</Col>
                      <Col md={8}>
                        {userData.cvApproval.approvedDate 
                          ? new Date(userData.cvApproval.approvedDate).toLocaleDateString() 
                          : "Pending"}
                      </Col>
                    </Row>
                  </ListGroup.Item>
                  <ListGroup.Item className={darkMode ? "bg-dark text-white border-secondary" : ""}>
                    <Row>
                      <Col md={4} className={darkMode ? "text-light-emphasis" : "text-muted"}>Feedback</Col>
                      <Col md={8}>{userData.cvApproval.notes || "No feedback provided yet"}</Col>
                    </Row>
                  </ListGroup.Item>
                </ListGroup>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </Modal.Body>
        <Modal.Footer className={darkMode ? "bg-dark text-white border-secondary" : ""}>
          <Button variant="secondary" onClick={() => setShowCVModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

const InterviewDetailsCard = ({ userData, darkMode }) => {
  const [showInterviewModal, setShowInterviewModal] = useState(false);

  if (!userData) return null;

  const interviewStatus = userData.interview.status;
  const hasInterviews = userData.interview.interviews && userData.interview.interviews.length > 0;

  const getStatusBadge = (status) => {
    const statusMap = {
      "interview-not-scheduled": { bg: "secondary", text: "Not Scheduled" },
      "interview-scheduled": { bg: "warning", text: "Scheduled" },
      "interview-completed": { bg: "info", text: "Completed" },
      "interview-passed": { bg: "success", text: "Passed" },
      "interview-failed": { bg: "danger", text: "Failed" },
      "interview-no-show": { bg: "danger", text: "No Show" },
      "interview-skipped": { bg: "secondary", text: "Skipped" }
    };
    
    const statusInfo = statusMap[status] || { bg: "secondary", text: "Unknown" };
    return <Badge bg={statusInfo.bg}>{statusInfo.text}</Badge>;
  };

  return (
    <>
      <Card className={`border-0 shadow-sm mb-4 ${darkMode ? "bg-dark text-white" : ""}`}>
        <Card.Header className={`bg-transparent py-3 ${darkMode ? "border-secondary" : ""}`}>
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0 fw-bold">Interview Details</h5>
            {hasInterviews && (
              <Button 
                variant="outline-primary" 
                size="sm"
                onClick={() => setShowInterviewModal(true)}
              >
                View Details
              </Button>
            )}
          </div>
        </Card.Header>
        <Card.Body>
          {!hasInterviews ? (
            <div className="text-center py-3">
              <p className={darkMode ? "text-light-emphasis" : "text-muted"}>
                No interview has been scheduled yet.
              </p>
            </div>
          ) : (
            <Row>
              <Col md={6}>
                <div className="mb-3">
                  <div className={darkMode ? "text-light-emphasis" : "text-muted"}>Status</div>
                  <div>{getStatusBadge(interviewStatus)}</div>
                </div>
                <div className="mb-3">
                  <div className={darkMode ? "text-light-emphasis" : "text-muted"}>Interview Type</div>
                  <div>{userData.interview.interviews[0].interviewName || "Standard Interview"}</div>
                </div>
              </Col>
              <Col md={6}>
                {userData.interview.interviews[0].result && (
                  <>
                    <div className="mb-3">
                      <div className={darkMode ? "text-light-emphasis" : "text-muted"}>Evaluation Date</div>
                      <div>
                        {userData.interview.interviews[0].result.evaluatedDate 
                          ? new Date(userData.interview.interviews[0].result.evaluatedDate).toLocaleDateString() 
                          : "Pending"}
                      </div>
                    </div>
                    <div className="mb-3">
                      <div className={darkMode ? "text-light-emphasis" : "text-muted"}>Result</div>
                      <div>
                        {getStatusBadge(userData.interview.interviews[0].result.status)}
                      </div>
                    </div>
                  </>
                )}
              </Col>
            </Row>
          )}
        </Card.Body>
      </Card>

      {/* Interview Details Modal */}
      <Modal
        show={showInterviewModal}
        onHide={() => setShowInterviewModal(false)}
        size="lg"
        centered
        className={darkMode ? "modal-dark" : ""}
      >
        <Modal.Header closeButton className={darkMode ? "bg-dark text-white border-secondary" : ""}>
          <Modal.Title>Interview Details</Modal.Title>
        </Modal.Header>
        <Modal.Body className={darkMode ? "bg-dark text-white" : ""}>
          <Table responsive bordered className={darkMode ? "table-dark" : ""}>
            <thead>
              <tr>
                <th>Interview Type</th>
                <th>Status</th>
                <th>Evaluation Date</th>
                <th>Feedback</th>
              </tr>
            </thead>
            <tbody>
              {userData.interview.interviews.map((interview, idx) => (
                <tr key={idx}>
                  <td>{interview.interviewName || "Standard Interview"}</td>
                  <td>
                    {interview.result ? getStatusBadge(interview.result.status) : getStatusBadge("interview-pending")}
                  </td>
                  <td>
                    {interview.result?.evaluatedDate 
                      ? new Date(interview.result.evaluatedDate).toLocaleDateString() 
                      : "Pending"}
                  </td>
                  <td>{interview.result?.feedback || "No feedback yet"}</td>
                </tr>
              ))}
            </tbody>
          </Table>
          
          {userData.interview.interviews[0].result?.feedback && (
            <div className="mt-4">
              <h6 className="fw-bold">Detailed Feedback</h6>
              <Card className={darkMode ? "bg-dark-secondary border-secondary" : "bg-light"}>
                <Card.Body>
                  {userData.interview.interviews[0].result.feedback}
                </Card.Body>
              </Card>
            </div>
          )}

          <div className="mt-4">
            <h6 className="fw-bold">Notes for Candidate</h6>
            <ul className={darkMode ? "text-light-emphasis" : "text-muted"}>
              <li>Please arrive 15 minutes before your scheduled interview time.</li>
              <li>Bring your original NIC and other certificates mentioned in your CV.</li>
              <li>Dress professionally and be prepared to discuss your qualifications and experience.</li>
              <li>If you need to reschedule, please contact us at least 24 hours in advance.</li>
            </ul>
          </div>
        </Modal.Body>
        <Modal.Footer className={darkMode ? "bg-dark text-white border-secondary" : ""}>
          <Button variant="secondary" onClick={() => setShowInterviewModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

const InductionDetailsCard = ({ userData, darkMode }) => {
  const [showInductionModal, setShowInductionModal] = useState(false);

  if (!userData) return null;

  const inductionStatus = userData.induction.status;
  const isInductionAssigned = inductionStatus !== "induction-not-assigned";

  const getStatusBadge = (status) => {
    const statusMap = {
      "induction-not-assigned": { bg: "secondary", text: "Not Assigned" },
      "induction-assigned": { bg: "warning", text: "Assigned" },
      "induction-completed": { bg: "info", text: "Completed" },
      "induction-passed": { bg: "success", text: "Passed" },
      "induction-failed": { bg: "danger", text: "Failed" },
      "induction-pending": { bg: "warning", text: "Pending" }
    };
    
    const statusInfo = statusMap[status] || { bg: "secondary", text: "Unknown" };
    return <Badge bg={statusInfo.bg}>{statusInfo.text}</Badge>;
  };

  return (
    <>
      <Card className={`border-0 shadow-sm mb-4 ${darkMode ? "bg-dark text-white" : ""}`}>
        <Card.Header className={`bg-transparent py-3 ${darkMode ? "border-secondary" : ""}`}>
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0 fw-bold">Induction Details</h5>
            {isInductionAssigned && (
              <Button 
                variant="outline-primary" 
                size="sm"
                onClick={() => setShowInductionModal(true)}
              >
                View Details
              </Button>
            )}
          </div>
        </Card.Header>
        <Card.Body>
          {!isInductionAssigned ? (
            <div className="text-center py-3">
              <p className={darkMode ? "text-light-emphasis" : "text-muted"}>
                No induction has been assigned yet.
              </p>
            </div>
          ) : (
            <Row>
              <Col md={6}>
                <div className="mb-3">
                  <div className={darkMode ? "text-light-emphasis" : "text-muted"}>Status</div>
                  <div>{getStatusBadge(inductionStatus)}</div>
                </div>
                <div className="mb-3">
                  <div className={darkMode ? "text-light-emphasis" : "text-muted"}>Induction Program</div>
                  <div>{userData.induction.inductionName || "Standard Induction"}</div>
                </div>
              </Col>
              <Col md={6}>
                {userData.induction.result && (
                  <>
                    <div className="mb-3">
                      <div className={darkMode ? "text-light-emphasis" : "text-muted"}>Completion Date</div>
                      <div>
                        {userData.induction.result.evaluatedDate 
                          ? new Date(userData.induction.result.evaluatedDate).toLocaleDateString() 
                          : "In Progress"}
                      </div>
                    </div>
                    <div className="mb-3">
                      <div className={darkMode ? "text-light-emphasis" : "text-muted"}>Result</div>
                      <div>
                        {getStatusBadge(userData.induction.result.status)}
                      </div>
                    </div>
                  </>
                )}
              </Col>
            </Row>
          )}
        </Card.Body>
      </Card>

      {/* Induction Details Modal */}
      <Modal
        show={showInductionModal}
        onHide={() => setShowInductionModal(false)}
        size="lg"
        centered
        className={darkMode ? "modal-dark" : ""}
      >
        <Modal.Header closeButton className={darkMode ? "bg-dark text-white border-secondary" : ""}>
          <Modal.Title>Induction Program Details</Modal.Title>
        </Modal.Header>
        <Modal.Body className={darkMode ? "bg-dark text-white" : ""}>
          <Card className={`mb-4 ${darkMode ? "bg-dark text-white border-secondary" : ""}`}>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <div className="mb-3">
                    <div className={darkMode ? "text-light-emphasis" : "text-muted"}>Program Name</div>
                    <div className="fw-bold">{userData.induction.inductionName || "Standard Induction"}</div>
                  </div>
                  <div className="mb-3">
                    <div className={darkMode ? "text-light-emphasis" : "text-muted"}>Status</div>
                    <div>{getStatusBadge(inductionStatus)}</div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <div className={darkMode ? "text-light-emphasis" : "text-muted"}>Assignment Date</div>
                    <div>{new Date().toLocaleDateString()}</div>
                  </div>
                  {userData.induction.result && (
                    <div className="mb-3">
                      <div className={darkMode ? "text-light-emphasis" : "text-muted"}>Completion Date</div>
                      <div>
                        {userData.induction.result.evaluatedDate 
                          ? new Date(userData.induction.result.evaluatedDate).toLocaleDateString() 
                          : "In Progress"}
                      </div>
                    </div>
                  )}
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <h6 className="fw-bold mb-3">Induction Program Schedule</h6>
          <Table responsive bordered className={darkMode ? "table-dark" : ""}>
            <thead>
              <tr>
                <th>Module</th>
                <th>Description</th>
                <th>Duration</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Company Introduction</td>
                <td>Overview of company history, vision, and values</td>
                <td>2 hours</td>
                <td><Badge bg="success">Completed</Badge></td>
              </tr>
              <tr>
                <td>Policies & Procedures</td>
                <td>Review of company policies, code of conduct</td>
                <td>3 hours</td>
                <td><Badge bg="success">Completed</Badge></td>
              </tr>
              <tr>
                <td>Technical Training</td>
                <td>Introduction to technical systems and tools</td>
                <td>6 hours</td>
                <td>
                  {inductionStatus === "induction-completed" || inductionStatus === "induction-passed" 
                    ? <Badge bg="success">Completed</Badge>
                    : <Badge bg="warning">In Progress</Badge>}
                </td>
              </tr>
              <tr>
                <td>Assessment</td>
                <td>Final assessment and feedback session</td>
                <td>3 hours</td>
                <td>
                  {inductionStatus === "induction-completed" || inductionStatus === "induction-passed" 
                    ? <Badge bg="success">Completed</Badge>
                    : <Badge bg="secondary">Pending</Badge>}
                </td>
              </tr>
            </tbody>
          </Table>
          
          {userData.induction.result?.feedback && (
            <div className="mt-4">
              <h6 className="fw-bold">Feedback & Evaluation</h6>
              <Card className={darkMode ? "bg-dark-secondary border-secondary" : "bg-light"}>
                <Card.Body>
                  {userData.induction.result.feedback}
                </Card.Body>
              </Card>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className={darkMode ? "bg-dark text-white border-secondary" : ""}>
          <Button variant="secondary" onClick={() => setShowInductionModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

const ApplicationDetailsSection = ({ userData, darkMode }) => {
  if (!userData) return null;

  return (
    <div className="application-details-section mt-5">
      <h4 className="text-center mb-4 fw-bold">Application Phase Details</h4>
      
      <CVDetailsCard userData={userData} darkMode={darkMode} />
      <InterviewDetailsCard userData={userData} darkMode={darkMode} />
      <InductionDetailsCard userData={userData} darkMode={darkMode} />
      
      {/* Add this style for dark mode */}
      <style jsx>{`
        .modal-dark .modal-content {
          background-color: #212529;
          color: white;
        }
        
        .bg-dark-secondary {
          background-color: #2c3034;
        }
        
        .accordion-dark .accordion-button {
          background-color: #2c3034;
          color: white;
          border-color: #495057;
        }
        
        .accordion-dark .accordion-button:not(.collapsed) {
          background-color: #3d4349;
          color: white;
        }
        
        .accordion-dark .accordion-button::after {
          filter: invert(1);
        }
      `}</style>
    </div>
  );
};

export default ApplicationDetailsSection;