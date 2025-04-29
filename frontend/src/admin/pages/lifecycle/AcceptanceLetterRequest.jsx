import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Row, Col, Button, Spinner, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from '../../../assets/logo.png';

const AcceptanceLetterRequest = ({ darkMode }) => {
  const { nic } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    fullName: '',
    institute: '',
    programName: '',
    duration: '',
    startDate: '',
    endDate: '',
    managerName: '',
    managerPosition: '',
    department: 'Digital Platform', 
    letterRef: '', 
    internPosition: 'Intern/Computer Science',
    nic: '' 
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const generateLetterRef = () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `REF-${year}${month}${day}-${randomNum}`;
  };

  useEffect(() => {
    const fetchInternData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Unauthorized: Please log in.');
          setLoading(false);
          return;
        }

        const headers = { Authorization: `Bearer ${token}` };
        const response = await axios.get(`http://localhost:5000/api/interns/details/${nic}`, { headers });
        
        if (response.data) {
          // Calculate end date based on start date and internship period
          let startDate = new Date();
          let endDate = new Date();
          
          if (response.data.schemeStartDate) {
            startDate = new Date(response.data.schemeStartDate);
            endDate = new Date(startDate);
            endDate.setMonth(endDate.getMonth() + (response.data.internshipPeriod || 6));
          }
          
          // Format dates to YYYY-MM-DD for input fields
          const formattedStartDate = startDate.toISOString().split('T')[0];
          const formattedEndDate = endDate.toISOString().split('T')[0];
          
          let managerName = '';
          if (response.data.managerId) {
            managerName = response.data.managerName || 'Not Assigned';
          }
          
          // Get the letter reference from localStorage or generate a new one
          let letterRef = localStorage.getItem(`letterRef_${nic}`);
          if (!letterRef) {
            letterRef = generateLetterRef();
            localStorage.setItem(`letterRef_${nic}`, letterRef);
          }
          
          setFormData({
            fullName: response.data.fullName || '',
            institute: response.data.institute || '',
            programName: response.data.schemeName || 'Internship Program',
            duration: response.data.internshipPeriod || 6,
            startDate: formattedStartDate,
            endDate: formattedEndDate,
            managerName: managerName,
            managerPosition: 'Senior Engineer', 
            department: 'Digital Platform', 
            letterRef: letterRef, 
            internPosition: response.data.selectedRole || 'Intern/Computer Science',
            nic: response.data.nic || nic
          });
        } else {
          setError('No data found for this NIC.');
        }
      } catch (err) {
        console.error('Error fetching intern data:', err);
        if (err.response && err.response.status === 404) {
          setError('Intern not found with the provided NIC.');
        } else {
          setError('Error fetching intern data. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (nic) {
      fetchInternData();
    } else {
      setError('No NIC provided');
      setLoading(false);
    }
  }, [nic]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));

    // If start date or duration changes, recalculate end date
    if (name === 'startDate' || name === 'duration') {
      const startDate = name === 'startDate' ? new Date(value) : new Date(formData.startDate);
      const duration = name === 'duration' ? parseInt(value) : parseInt(formData.duration);
      
      if (startDate && !isNaN(duration)) {
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + duration);
        
        setFormData(prevData => ({
          ...prevData,
          endDate: endDate.toISOString().split('T')[0]
        }));
      }
    }
  };

  const handleViewLetter = () => {
    // Store the current formData with the consistent letterRef
    localStorage.setItem('acceptanceLetterData', JSON.stringify({
      ...formData,
      nic: nic 
    }));
    navigate(`/view-acceptance-letter/${nic}`);
  };

  const handleDownloadLetter = async () => {
    try {
      setLoading(true);
      
      // Ensure we're using the same letterRef that's stored in both localStorage and formData
      const dataToSend = {
        ...formData,
        letterRef: formData.letterRef // Use the consistent reference
      };
      
      console.log('Form Data:', dataToSend); 
      const token = localStorage.getItem('token');
      
      // First generate the letter
      const response = await axios.post(
        'http://localhost:5000/api/letters/generate-acceptance',
        dataToSend,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Generation response:', response.data);
      
      // Then download the file
      window.open(`http://localhost:5000/api/letters/download/${formData.nic}`, '_blank');
      
      setSuccess('Acceptance letter generated successfully!');
    } catch (error) {
      console.error('Error downloading letter:', error);
      if (error.response) {
        // Display the error message from the backend
        setError(`Error: ${error.response.data.message || 'Failed to generate letter'}`);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`d-flex flex-column min-vh-100 ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
      {/* Logo and Header */}
      <div className="text-center mt-4 mb-3">
        <img src={logo} alt="Company Logo" className="mx-auto d-block" style={{ height: "50px" }} />
        <h3 className="mt-3">ACCEPTANCE LETTER REQUEST</h3>
      </div>

      <Container className="p-4 rounded shadow mb-5">
        {loading ? (
          <div className="text-center">
            <Spinner animation="border" variant={darkMode ? "light" : "dark"} />
            <p className="mt-2">Loading intern details...</p>
          </div>
        ) : error ? (
          <Alert variant="danger" className="text-center">{error}</Alert>
        ) : (
          <Card className={`border-0 ${darkMode ? "bg-dark text-white" : "bg-light"}`}>
            <Card.Body>
              <h4 className="mb-4">Acceptance Letter Details</h4>
              
              {success && <Alert variant="success" className="text-center">{success}</Alert>}
              
              <Form>
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Full Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        className={darkMode ? "bg-secondary text-white" : ""}
                        disabled
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Institute</Form.Label>
                      <Form.Control
                        type="text"
                        name="institute"
                        value={formData.institute}
                        onChange={handleChange}
                        className={darkMode ? "bg-secondary text-white" : ""}
                        disabled
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Program Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="programName"
                        value={formData.programName}
                        onChange={handleChange}
                        className={darkMode ? "bg-secondary text-white" : ""}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Intern Position</Form.Label>
                      <Form.Control
                        type="text"
                        name="internPosition"
                        value={formData.internPosition}
                        onChange={handleChange}
                        className={darkMode ? "bg-secondary text-white" : ""}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Duration (months)</Form.Label>
                      <Form.Control
                        type="number"
                        name="duration"
                        value={formData.duration}
                        onChange={handleChange}
                        min="1"
                        max="12"
                        className={darkMode ? "bg-secondary text-white" : ""}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Start Date</Form.Label>
                      <Form.Control
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleChange}
                        className={darkMode ? "bg-secondary text-white" : ""}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>End Date</Form.Label>
                      <Form.Control
                        type="date"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleChange}
                        className={darkMode ? "bg-secondary text-white" : ""}
                        disabled
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Manager Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="managerName"
                        value={formData.managerName}
                        onChange={handleChange}
                        className={darkMode ? "bg-secondary text-white" : ""}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Manager Position</Form.Label>
                      <Form.Control
                        type="text"
                        name="managerPosition"
                        value={formData.managerPosition}
                        onChange={handleChange}
                        className={darkMode ? "bg-secondary text-white" : ""}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Department</Form.Label>
                      <Form.Control
                        type="text"
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        className={darkMode ? "bg-secondary text-white" : ""}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Letter Reference</Form.Label>
                      <Form.Control
                        type="text"
                        name="letterRef"
                        value={formData.letterRef}
                        onChange={handleChange}
                        className={darkMode ? "bg-secondary text-white" : ""}
                        disabled
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <div className="d-flex justify-content-center mt-4">
                  <Button variant="primary" className="me-3" onClick={handleViewLetter}>
                    View Acceptance Letter
                  </Button>
                  <Button variant="success" onClick={handleDownloadLetter}>
                    Download Acceptance Letter
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        )}
      </Container>
    </div>
  );
};

export default AcceptanceLetterRequest;