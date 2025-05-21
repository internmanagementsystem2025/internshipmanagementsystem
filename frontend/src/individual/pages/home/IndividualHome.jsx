import { useState, useEffect } from "react";
import { Card, Row, Col, Container, Form, Button } from "react-bootstrap";
import { FiFileText, FiUserCheck, FiAward } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import TableComponent from "../home/TableComponent";
import logo from "../../../assets/logo.png";
import axios from "axios";
import RecommendationPopup from "../../../components/notifications/RecommendationPopup";
import Notification from "../../../components/notifications/Notification";
import DeleteModal from "../../../components/notifications/DeleteModal"; 

const IndividualHome = ({ darkMode }) => {
  const [email, setEmail] = useState("");
  const [cvData, setCvData] = useState([]);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();
  const [notification, setNotification] = useState({ show: false, message: "", variant: "success" });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [cvToDelete, setCvToDelete] = useState(null);

  const handleView = (cvId) => {
    navigate(`/view-cv/${cvId}`);
  };

  const handleEdit = (cvId) => {
    navigate(`/edit-cv/${cvId}`);
  };

  const handleDeleteConfirmation = (cv) => {
    setCvToDelete(cv);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!cvToDelete) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setNotification({ show: true, message: "Please log in.", variant: "danger" });
      setShowDeleteModal(false);
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/cvs/${cvToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setCvData(prevData => prevData.filter(cv => cv._id !== cvToDelete._id));
      
      setNotification({ 
        show: true, 
        message: "CV successfully deleted", 
        variant: "success" 
      });
      
      setShowDeleteModal(false);
      setCvToDelete(null);
    } catch (error) {
      console.error("Error deleting CV:", error);
      setNotification({ 
        show: true, 
        message: error.response?.data?.message || "Failed to delete CV", 
        variant: "danger" 
      });
      setShowDeleteModal(false);
    }
  };

  // Map CV approval status to display status
  const getStatusDisplay = (cv) => {
    if (!cv.cvApproval) return "pending";
    
    switch (cv.cvApproval.status) {
      case "cv-submitted":
        return "Submitted";
      case "cv-pending":
        return "Under Review";
      case "cv-approved":
        return "Approved";
      case "cv-rejected":
        return "Rejected";
      case "completed":
        return "Completed";
      default:
        return "Unknown";
    }
  };

  // Check if user can edit this CV
  const canEdit = (cv) => {
    return !cv.cvApproval || 
           cv.cvApproval.status === "cv-submitted" || 
           cv.cvApproval.status === "cv-pending";
  };

  // Check if user can delete this CV
  const canDelete = (cv) => {
    return !cv.cvApproval || 
           cv.cvApproval.status === "cv-submitted" || 
           cv.cvApproval.status === "cv-pending" || 
           cv.cvApproval.status === "completed";
  };

  const columns = [
    { header: "Application Ref. No.", accessor: "refNo" },
    { header: "Name", accessor: "fullName" },
    { header: "NIC", accessor: "nic" },
    { header: "Intern Type", accessor: "selectedRole" },
    { 
      header: "CV Status", 
      render: (cv) => getStatusDisplay(cv)
    },
    { 
      header: "Actions", 
      render: (cv) => (
        <div className="d-flex justify-content-center gap-2">
          <Button 
            size="sm" 
            variant="outline-primary" 
            onClick={() => handleView(cv._id)} 
            className="fw-semibold"
          >
            View
          </Button>

          {canEdit(cv) && (
            <Button 
              size="sm" 
              variant="outline-success" 
              onClick={() => handleEdit(cv._id)} 
              className="fw-semibold"
            >
              Edit
            </Button>
          )}

          {canDelete(cv) && (
            <Button 
              size="sm" 
              variant="outline-danger" 
              onClick={() => handleDeleteConfirmation(cv)} 
              className="fw-semibold"
            >
              Delete
            </Button>
          )}
        </div>
      )
    }
  ];

  const fetchUserCVs = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setNotification({ 
          show: true, 
          message: "Please log in to view your CVs", 
          variant: "warning" 
        });
        return;
      }
  
      try {
        const response = await axios.get("http://localhost:5000/api/cvs/mycvs", {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        setCvData(response.data);
      } catch (error) {
        console.error("Error fetching CVs:", {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
        
        if (error.response?.status === 404) {
          setCvData([]);  
        } else {
          setNotification({ 
            show: true, 
            message: error.response?.data?.message || "Failed to fetch CVs", 
            variant: "danger" 
          });
        }
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      setNotification({ 
        show: true, 
        message: "An unexpected error occurred", 
        variant: "danger" 
      });
    }
  };

  const handleEmailSubmit = async () => {
    // Check for empty email first
    if (!email.trim()) {
      setNotification({ 
        show: true, 
        message: "Email address cannot be empty", 
        variant: "danger" 
      });
      return;
    }
    
    // Split email into local part and domain part
    const parts = email.split('@');
    if (parts.length !== 2) {
      setNotification({ 
        show: true, 
        message: "Email must contain exactly one @ symbol", 
        variant: "danger" 
      });
      return;
    }
    
    const [localPart, domainPart] = parts;
    
    // Check local part (before @)
    if (!localPart || localPart.length === 0) {
      setNotification({ 
        show: true, 
        message: "Email username cannot be empty", 
        variant: "danger" 
      });
      return;
    }
    
    // Check domain part (after @)
    if (!domainPart || domainPart.length === 0) {
      setNotification({ 
        show: true, 
        message: "Email domain cannot be empty", 
        variant: "danger" 
      });
      return;
    }
    
    // Domain must have at least one dot
    if (!domainPart.includes('.')) {
      setNotification({ 
        show: true, 
        message: "Email domain must include a dot (e.g., .com, .org)", 
        variant: "danger" 
      });
      return;
    }
    
    // Domain cannot start or end with hyphen or dot
    if (domainPart.startsWith('.') || domainPart.endsWith('.') || 
        domainPart.startsWith('-') || domainPart.endsWith('-')) {
      setNotification({ 
        show: true, 
        message: "Email domain cannot start or end with a dot or hyphen", 
        variant: "danger" 
      });
      return;
    }
    
    // Check domain characters (only allow letters, numbers, dots, and hyphens)
    const invalidDomainChars = domainPart.replace(/[a-zA-Z0-9.-]/g, '');
    if (invalidDomainChars.length > 0) {
      setNotification({ 
        show: true, 
        message: `Email domain contains invalid characters: ${invalidDomainChars}`, 
        variant: "danger" 
      });
      return;
    }
    
    // Check TLD (last part after the last dot)
    const tld = domainPart.split('.').pop();
    const allowedTlds = ['com', 'org', 'lk'];
    if (!allowedTlds.includes(tld)) {
      setNotification({ 
        show: true, 
        message: "Only .com, .org, and .lk domains are accepted", 
        variant: "danger" 
      });
      return;
    }
    
    // List of allowed email domains
    const allowedDomains = [
      'gmail.com',
      'yahoo.com',
      'outlook.com',
      'hotmail.com',
      'aol.com',
      'protonmail.com',
      'mail.com',
      'icloud.com',
      'zoho.com',
      'yandex.com'
    ];
    
    // Check if the domain is in the allowed list
    if (!allowedDomains.includes(domainPart)) {
      setNotification({ 
        show: true, 
        message: "Only emails from supported providers are accepted", 
        variant: "danger" 
      });
      return;
    }
    
    try {
      const response = await axios.post("http://localhost:5000/api/emails/register", { email });
      setNotification({ 
        show: true, 
        message: response.data.message, 
        variant: "success" 
      });
      setEmail("");
    } catch (error) {
      console.error("Error submitting email:", error);
      
      if (error.response) {
        if (error.response.status === 409) {
          setNotification({ 
            show: true, 
            message: "You're already subscribed with this email address.", 
            variant: "info"
          });
        } else if (error.response.data && error.response.data.alreadyRegistered) {
          setNotification({ 
            show: true, 
            message: "You're already subscribed with this email address.", 
            variant: "info"
          });
        } else if (error.response.data && error.response.data.message) {
          setNotification({ 
            show: true, 
            message: error.response.data.message, 
            variant: "danger" 
          });
        } else {
          setNotification({ 
            show: true, 
            message: `Server error (${error.response.status}). Please try again later.`, 
            variant: "danger" 
          });
        }
      } else if (error.request) {
        setNotification({ 
          show: true, 
          message: "Network error. Please check your connection and try again.", 
          variant: "danger" 
        });
      } else {
        setNotification({ 
          show: true, 
          message: "Failed to send your request. Please try again later.", 
          variant: "danger" 
        });
      }
    }
  };

  const saveUserRating = async (rating) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setNotification({ show: true, message: "Please log in to submit your rating.", variant: "danger" });
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/recommendations",
        { userId: "YOUR_USER_ID_HERE", rating },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNotification({ show: true, message: response.data.message, variant: "success" });
    } catch (error) {
      console.error("Error saving rating:", error);
      setNotification({ show: true, message: "An error occurred while saving your rating.", variant: "danger" });
    }
  };

  const cardStyle = (darkMode, isHovered) => ({
    cursor: "pointer",
    border: "none",
    borderRadius: "8px",
    boxShadow: isHovered ? "0 6px 15px rgba(0, 0, 0, 0.2)" : "0 4px 8px rgba(0, 0, 0, 0.1)",
    background: darkMode
      ? "linear-gradient(135deg, #3b4e76, #2f3b57)"
      : "linear-gradient(135deg, #66c466, #4d8f4d)",
    color: "white",
    height: "160px",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    transform: isHovered ? "scale(1.05)" : "scale(1)",
  });

  useEffect(() => {
    fetchUserCVs();

    const lastPopupTime = localStorage.getItem("lastPopupTime");
    const currentTime = new Date().getTime();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;

    if (!lastPopupTime || currentTime - lastPopupTime > oneWeek) {
      setTimeout(() => {
        setShowPopup(true);
        localStorage.setItem("lastPopupTime", currentTime.toString());
      }, 60000);
    }
  }, []);

  return (
    <div
      style={{
        backgroundColor: darkMode ? "#1a1a1a" : "#f4f4f4",
        minHeight: "100vh",
        padding: "30px 0",
      }}
    >
      <Container>
        <div className="d-flex justify-content-center mt-4 mb-5">
          <img src={logo} alt="Company Logo" className="w-25 h-auto" />
        </div>

        <h2 className="text-center mb-5 mt-4">CLICK YOUR INTERNSHIP STATUS</h2>
        <Row className="justify-content-center g-4">
          <Col md={4}>
            <Card
              onClick={() => navigate("/individual-add-cv")}
              onMouseEnter={() => setHoveredCard("request-internship")}
              onMouseLeave={() => setHoveredCard(null)}
              style={cardStyle(darkMode, hoveredCard === "request-internship")}
            >
              <Card.Body className="d-flex flex-column align-items-center justify-content-between">
                <Card.Title className="text-center">Request an Internship</Card.Title>
                <FiFileText size={40} />
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card
              onClick={() => navigate("/request-certificate")}
              onMouseEnter={() => setHoveredCard("request-certificate")}
              onMouseLeave={() => setHoveredCard(null)}
              style={cardStyle(darkMode, hoveredCard === "request-certificate")}
            >
              <Card.Body className="d-flex flex-column align-items-center justify-content-between">
                <Card.Title className="text-center">Request Certificate</Card.Title>
                <FiAward size={40} />
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card
              onClick={() => navigate("/download-certificate")}
              onMouseEnter={() => setHoveredCard("download-certificate")}
              onMouseLeave={() => setHoveredCard(null)}
              style={cardStyle(darkMode, hoveredCard === "download-certificate")}
            >
              <Card.Body className="d-flex flex-column align-items-center justify-content-between">
                <Card.Title className="text-center">Download certificate</Card.Title>
                <FiUserCheck size={40} />
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <h2 className="text-center mb-4" style={{ marginTop: "80px" }}>
          ABOUT SLT TRAINING PROGRAM
        </h2>
        <p className="text-justify mb-5" style={{ textAlign: "justify" }}>
          The SLT Training Program is a comprehensive initiative designed to empower individuals with the skills and knowledge required to excel in the telecommunications industry. This program focuses on developing technical expertise, problem-solving abilities, and customer service skills through hands-on training and real-world scenarios. Participants will gain insights into cutting-edge technologies, network infrastructure, and incident management processes. With a blend of theoretical knowledge and practical experience, the program equips trainees to handle challenges effectively while fostering innovation and teamwork. By completing the SLT Training Program, individuals can unlock opportunities for professional growth and contribute significantly to the organization's success.
        </p>

        <h4 className="text-center mb-4" style={{ marginTop: "80px" }}>
          Please Enter your Email to get more information about your Internship!
        </h4>
        <div className="d-flex justify-content-center">
          <div className="position-relative" style={{ width: "100%", maxWidth: "400px" }}>
            <Form onSubmit={(e) => { e.preventDefault(); handleEmailSubmit(); }}>
              <div className="d-flex" style={{
                border: darkMode ? "2px solid #007bff" : "2px solid #28a745",
                borderRadius: "30px",
                overflow: "hidden",
                padding: "3px",
                backgroundColor: "white"
              }}>
                <Form.Control
                  type="email"
                  placeholder="Enter your email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="p-2"
                  style={{
                    border: "none",
                    boxShadow: "none",
                    outline: "none",
                    fontSize: "14px",
                    height: "35px",
                    borderRadius: "30px 0 0 30px",
                  }}
                />
                <Button
                  type="submit"
                  className="px-3 py-2"
                  style={{
                    background: darkMode ? "linear-gradient(135deg, #007bff, #004d99)" : "linear-gradient(135deg, #28a745, #004d00)",
                    border: "none",
                    color: "white",
                    fontSize: "14px",
                    height: "35px",
                    borderRadius: "30px",
                  }}
                >
                  Send
                </Button>
              </div>
            </Form>
          </div>
        </div>

        <h2 className="text-center mb-4" style={{ marginTop: "80px" }}>
          INTERNSHIP STATUS
        </h2>
        {/* Only show TableComponent when there are CVs */}
        {cvData.length > 0 ? (
          <TableComponent
            tableData={cvData}
            columns={columns}
            footerText={`${cvData.length} application(s) in total`}
            className="mb-10"
            darkMode={darkMode}
          />
        ) : (
          <div className="text-center p-4">
            <p style={{ color: darkMode ? '#cccccc' : '#666666' }}>
              No applications found. Click "Request an Internship" to submit a new application.
            </p>
          </div>
        )}
      </Container>

      <DeleteModal 
        show={showDeleteModal} 
        onClose={() => {
          setShowDeleteModal(false);
          setCvToDelete(null);
        }}
        onDelete={handleDelete}
        itemName={cvToDelete ? `CV for ${cvToDelete.fullName}` : ''} 
        darkMode={darkMode} 
      />

      <RecommendationPopup show={showPopup} onClose={() => setShowPopup(false)} darkMode={darkMode} onSaveRating={saveUserRating} />

      <Notification show={notification.show} onClose={() => setNotification({ ...notification, show: false })} message={notification.message} variant={notification.variant} />
    </div>
  );
};

export default IndividualHome;