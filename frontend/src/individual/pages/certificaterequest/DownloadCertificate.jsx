import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Form, Alert, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import logo from "../../../assets/logo.png";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faDownload, faSearch, faFileAlt } from '@fortawesome/free-solid-svg-icons';
import PropTypes from "prop-types";
import { motion } from 'framer-motion';
import Notification from "../../../components/notifications/Notification";

const DownloadCertificate = ({ darkMode }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [certificates, setCertificates] = useState([]);
  const [filteredCertificates, setFilteredCertificates] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  
  // Notification state
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationVariant, setNotificationVariant] = useState("success");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setUnauthorized(true);
      setIsLoading(false);
      return;
    }

    try {
      const decoded = jwtDecode(token);
      if (!decoded.currentStatus || decoded.currentStatus === "pending") {
        setUnauthorized(true);
      } else {
        setUser(decoded);
        fetchCertificates(token);
      }
    } catch (error) {
      console.error("Invalid token:", error);
      setUnauthorized(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCertificates = async (token) => {
    try {
      setIsLoading(true);
      const response = await axios.get("http://localhost:5000/api/certificates", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setCertificates(response.data);
      setFilteredCertificates(response.data);
    } catch (error) {
      console.error("Error fetching certificates:", error);
      setErrorMessage("Failed to load certificates. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setIsSearching(true);
    
    const filtered = certificates.filter(cert => 
      cert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.internId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.nic.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setFilteredCertificates(filtered);
    setIsSearching(false);
  };

  const handleDownload = async (certificateId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`http://localhost:5000/api/certificates/download/${certificateId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        responseType: 'blob'
      });
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificate-${certificateId}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      link.parentNode.removeChild(link);
      
      setNotificationMessage("Certificate Downloaded Successfully!");
      setNotificationVariant("success");
      setShowNotification(true);
    } catch (error) {
      console.error("Error downloading certificate:", error);
      setErrorMessage("Failed to download certificate. Please try again later.");
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setFilteredCertificates(certificates);
  };

  const handleNotificationClose = () => {
    setShowNotification(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  if (unauthorized) {
    return (
      <Container className={`mt-5 text-center ${darkMode ? "text-white" : "text-dark"}`}>
        <div>
          <img src={logo} alt="SLT Mobitel Logo" className="mx-auto d-block" style={{ height: "50px" }} />
          <h3 className="mt-2 mb-5">DOWNLOAD TRAINING CERTIFICATE</h3>
        </div>
        <div className="mt-5 mb-5">
          <Alert variant={darkMode ? "dark" : "light"} className={`rounded ${darkMode ? "bg-dark text-white" : "bg-light text-dark border border-secondary"}`}>
            <motion.div
              initial={{ scale: 1 }}
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <FontAwesomeIcon icon={faLock} size="8x" className="mt-3 mb-5" />
            </motion.div>
            <h1 className="mb-3">Access Denied</h1>
            <p style={{ fontSize: '20px' }}>You do not have permission to access this page. Please contact the administrator if you believe this is a mistake.</p>
            <Button variant="link" onClick={() => navigate('/individual-home')}>Return Home</Button>
          </Alert>
        </div>
      </Container>
    );
  }

  return (
    <div className={`d-flex flex-column min-vh-100 ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
      {/* Notification Component */}
      <Notification 
        show={showNotification}
        onClose={handleNotificationClose}
        message={notificationMessage}
        variant={notificationVariant}
      />
      
      {/* Info Banner */}
      <div className={`alert ${darkMode ? "alert-info" : "alert-warning"} text-center`} role="alert">
        Download your approved training certificates here.
      </div>

      {/* Header */}
      <Container className="text-center mt-4 mb-3">
        <img src={logo} alt="SLT Mobitel Logo" className="mx-auto d-block" style={{ height: "50px" }} />
        <h3 className="mt-3">DOWNLOAD TRAINING CERTIFICATE</h3>
      </Container>

      {/* Main Content Section */}
      <Container className={`p-4 rounded shadow ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"} mb-5`}>
        <Row>
          <Col md={12}>
            <h4>Available Certificates</h4>
            <Card className={darkMode ? "bg-dark text-white" : "bg-light text-dark"}>
              <Card.Body>
                {/* Search Form */}
                <Form onSubmit={handleSearch} className="mb-4">
                  <Row className="align-items-end">
                    <Col md={8}>
                      <Form.Group controlId="searchQuery">
                        <Form.Label>Search Certificates</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Search by name, intern ID, or NIC"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4} className="d-flex justify-content-end">
                      <Button type="submit" className="me-2" disabled={isSearching}>
                        <FontAwesomeIcon icon={faSearch} className="me-1" /> Search
                      </Button>
                      <Button variant="secondary" onClick={handleClearSearch}>
                        Clear
                      </Button>
                    </Col>
                  </Row>
                </Form>

                {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

                {filteredCertificates.length === 0 ? (
                  <Alert variant="info" className="text-center">
                    <FontAwesomeIcon icon={faFileAlt} size="2x" className="mb-3" />
                    <p className="mb-0">No certificates found. If you've recently requested a certificate, it may still be pending approval.</p>
                  </Alert>
                ) : (
                  <div className="table-responsive">
                    <Table striped bordered hover variant={darkMode ? "dark" : "light"}>
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Intern ID</th>
                          <th>Training Category</th>
                          <th>Period</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCertificates.map((certificate) => (
                          <tr key={certificate._id}>
                            <td>{certificate.name}</td>
                            <td>{certificate.internId}</td>
                            <td>{certificate.trainingCategory}</td>
                            <td>{formatDate(certificate.periodFrom)} - {formatDate(certificate.periodTo)}</td>
                            <td>
                              <span className={`badge ${certificate.status === 'approved' ? 'bg-success' : certificate.status === 'pending' ? 'bg-warning' : 'bg-danger'}`}>
                                {certificate.status === 'approved' ? 'Approved' : certificate.status === 'pending' ? 'Pending' : 'Rejected'}
                              </span>
                            </td>
                            <td>
                              <Button 
                                variant="primary" 
                                size="sm" 
                                onClick={() => handleDownload(certificate._id)}
                                disabled={certificate.status !== 'approved'}
                              >
                                <FontAwesomeIcon icon={faDownload} className="me-1" /> Download
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}

                <div className="d-flex justify-content-between mt-3">
                  <Button variant="danger" onClick={() => window.history.back()}>Go Back</Button>
                  <Button variant="success" onClick={() => navigate('/request-certificate')}>
                    Request New Certificate
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

DownloadCertificate.propTypes = {
  darkMode: PropTypes.bool.isRequired,
};

export default DownloadCertificate;