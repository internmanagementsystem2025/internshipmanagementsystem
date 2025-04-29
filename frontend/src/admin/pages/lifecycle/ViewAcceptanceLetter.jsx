import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Spinner, Alert, Row, Col } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import logo from '../../../assets/logo.png';

const ViewAcceptanceLetter = ({ darkMode }) => {
  const { nic } = useParams();
  const navigate = useNavigate();
  const [letterData, setLetterData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Retrieve letter data from localStorage
    const savedData = localStorage.getItem('acceptanceLetterData');
    if (savedData) {
      setLetterData(JSON.parse(savedData));
    } else {
      setError('No letter data found. Please return to the request form.');
    }
    setLoading(false);
  }, []);

  const handleBack = () => {
    navigate(`/acceptance-letter/${nic}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className={`d-flex flex-column min-vh-100 justify-content-center align-items-center ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
        <Spinner animation="border" variant={darkMode ? "light" : "dark"} />
        <p className="mt-2">Loading letter preview...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`d-flex flex-column min-vh-100 justify-content-center align-items-center ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
        <Alert variant="danger" className="text-center">{error}</Alert>
        <Button variant="primary" onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className={`d-flex flex-column min-vh-100 ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
      {/* Logo and Header */}
      <div className="text-center mt-4 mb-3">
        <img src={logo} alt="Company Logo" className="mx-auto d-block" style={{ height: "50px" }} />
        <h3 className="mt-3">ACCEPTANCE LETTER PREVIEW</h3>
      </div>

      <Container className="p-4 rounded shadow mb-5" style={{ backgroundColor: darkMode ? '#343a40' : '#f8f9fa' }}>
        <Card className={`border-0 ${darkMode ? "bg-dark text-white" : "bg-light"}`}>
          <Card.Body>
            <div className="letter-preview p-4 border" style={{ backgroundColor: darkMode ? '#495057' : 'white', color: darkMode ? 'white' : 'black' }}>
              {/* Letter Header */}
              <div className="text-center mb-4">
                <div className="mb-2">INTERNAL USE ONLY</div>
                <h4 className="mb-0">Memo</h4>
                <div>Talent Development Section</div>
                <div>7th Floor, Head Office, Lotus Road, Colombo 01</div>
              </div>

              {/* Letter Reference */}
              <Row className="mb-4">
                <Col md={6}>
                  <div><strong>Our/My Ref:</strong> {letterData?.letterRef}</div>
                  <div><strong>Your Ref:</strong></div>
                  <div><strong>To:</strong> DGM/{letterData?.department}</div>
                  <div><strong>From:</strong> Engineer/Talent Development</div>
                </Col>
                <Col md={6} className="text-md-end">
                  <div>Telephone: 011-2021359, 2021263</div>
                  <div>Email: shrivi@slt.com.lk</div>
                  <div>Date: {new Date().toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' })}</div>
                </Col>
              </Row>

              <hr className={darkMode ? "border-light" : "border-dark"} />

              {/* Letter Subject */}
              <div className="mb-4">
                <strong>Subject: Assignment of {letterData?.internPosition}</strong>
              </div>

              {/* Letter Body */}
              <div className="mb-4">
                <p>
                  Following student/ students from {letterData?.institute} has/have been assigned to 
                  you to undergo the Intern Programme under your supervision from {formatDate(letterData?.startDate)} to {formatDate(letterData?.endDate)}.
                </p>
                <p>
                  Please arrange to accommodate the Intern/Interns. Please note that the induction programme 
                  is compulsory for all interns and please arrange to release them for next induction training.
                </p>
                <p>
                  Please do not expose any confidential information to the Intern and strictly follow the 
                  Information Security guideline currently prevailing at SLT when assigning duties to the Intern.
                </p>
              </div>

              {/* Student Details */}
              <div className="mb-4">
                <p>Details of the Interns are as follows:</p>
                <table className={`table ${darkMode ? 'table-dark' : 'table-bordered'}`}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>NIC No</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>1. {letterData?.fullName}</td>
                      <td>{nic}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Signature Section */}
              
              <div className="mt-5 mb-4">
              <div>_______________________________</div>
                <div>Engineer/ Talent Development</div>
              </div>

              {/* Document Checklist */}
              <div className="mt-5 pt-5 border-top">
              <h6 className="text-start mb-3">Intern has signed the following documents</h6>
                <Row>
                  <Col md={6}>
                    <div>☑ Police Report</div>
                    <div>☑ Agreement</div>
                  </Col>
                  <Col md={6}>
                    <div>☑ Duration Checked</div>
                    <div>☑ NDA</div>
                  </Col>
                </Row>
                <div className="text-end mt-3">
                  <div>________________</div>
                  <div>Signature</div>
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-center mt-4">
              <Button variant="secondary" className="me-3" onClick={handleBack}>
                Back to Form
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default ViewAcceptanceLetter;