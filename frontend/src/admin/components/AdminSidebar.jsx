import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Nav } from "react-bootstrap";
import { FiMenu, FiX, FiHome, FiFileText, FiList,  FiFilePlus, FiCheckCircle, FiCalendar, FiAward, FiUsers,  FiRepeat, FiLayers, FiMail, FiClipboard, FiBriefcase, FiDatabase, FiCodepen, FiCreditCard, FiBarChart, FiHelpCircle } from "react-icons/fi";
import { FaBuildingColumns } from "react-icons/fa6";
import logo from "../../assets/logo.png";

const AdminSidebar = ({ darkMode }) => {
  const [show, setShow] = useState(false);
  const [hovered, setHovered] = useState(null);
  const [cvsDropdown, setCvsDropdown] = useState(false);
  const [interviewsDropdown, setInterviewsDropdown] = useState(false);
  const [inductionsDropdown, setInductionsDropdown] = useState(false);
  const [instituteDropdown, setInstituteDropdown] = useState(false);
  const [schemeDropdown, setSchemeDropdown] = useState(false);
  const [rotationDropdown, setRotationDropdown] = useState(false);
  const [templateDropdown, setTemplateDropdown] = useState(false);
  
  const sidebarRef = useRef(null);
  const hoverTimeoutRef = useRef(null);

  const closeAllDropdowns = () => {
    setCvsDropdown(false);
    setInterviewsDropdown(false);
    setInductionsDropdown(false);
    setInstituteDropdown(false);
    setSchemeDropdown(false);
    setRotationDropdown(false);
    setTemplateDropdown(false);
  };

  const handleMouseEnter = () => {
    clearTimeout(hoverTimeoutRef.current);
    setShow(true);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      if (!sidebarRef.current?.matches(':hover')) {
        setShow(false);
        closeAllDropdowns();
      }
    }, 300);
  };

  // This is the function that needs fixing
  const toggleSidebar = () => {
    // Modified to ensure clicking X always closes the sidebar
    if (show) {
      setShow(false);
      closeAllDropdowns();
    } else {
      setShow(true);
    }
  };

  useEffect(() => {
    return () => {
      clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  return (
    <>
      {/* Persistent Sidebar Toggle Icon */}
      <div 
        className="position-fixed"
        style={{
          left: show ? '250px' : '0',
          top: '5px',
          zIndex: 2000,
          transition: 'left 0.3s ease',
          backgroundColor: darkMode ? '#2c3e50' : '#f8f9fa',
          borderRadius: '0 5px 5px 0',
          padding: '10px 5px',
          boxShadow: '2px 2px 5px rgba(0,0,0,0.2)',
          cursor: 'pointer'
        }}
        onClick={toggleSidebar}
        onMouseEnter={() => !show && setShow(true)}
      >
        {show ? (
          <FiX size={24} color={darkMode ? "#fff" : "#000"} />
        ) : (
          <FiMenu size={24} color={darkMode ? "#fff" : "#000"} />
        )}
      </div>

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          position: 'fixed',
          left: show ? 0 : '-250px',
          top: 0,
          width: '250px',
          height: '100vh',
          backgroundColor: darkMode ? "#343a40" : "#f8f9fa",
          color: darkMode ? "#fff" : "#000",
          transition: 'left 0.3s ease',
          zIndex: 1000,
          overflowY: 'auto',
          boxShadow: '2px 0 5px rgba(0,0,0,0.1)'
        }}
      >
        {/* Sidebar Header */}
        <div
          style={{
            backgroundColor: darkMode ? "#343a40" : "#f8f9fa",
            padding: "16px",
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${darkMode ? "#666" : "#ddd"}`
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
          <img
            src={logo}
            alt="Logo"
            style={{
              width: "80px",
              height: "30px",
              marginRight: "10px",
            }}
          />
            <div>
            <span
              className="block text-sm font-semibold"
              style={{
                fontSize: "0.75rem",
                color: darkMode ? "#fff" : "#000",
                display: "block",
              }}
            >
              Sri Lanka Telecom
            </span>
            <span
              className="block text-sm"
              style={{
                fontSize: "0.875rem",
                color: darkMode ? "#b0b0b0" : "#6c757d",
                display: "block",
              }}
            >
              Mobitel
            </span>
          </div>
          </div>
        </div>

        {/* Sidebar Body */}
        <div
          className="d-flex flex-column justify-content-between"
          style={{
            backgroundColor: darkMode ? "#343a40" : "#f8f9fa",
            color: darkMode ? "#fff" : "#000",
            height: "calc(100vh - 80px)",
            paddingBottom: "10px",
            overflowY: "auto", 
          }}
        >
          <style>{`
            ::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          
          {/* Navigation Links */}
          <div>
            <Nav className="flex-column ">
              {/* Home */}
              <Nav.Link
                as={Link}
                to="/admin-home"
                onClick={() => setShow(false)}
                onMouseEnter={() => setHovered("home")}
                onMouseLeave={() => setHovered(null)}
                style={{
                  color: hovered === "home" ? "#fff" : darkMode ? "#fff" : "#000",
                  backgroundColor: hovered === "home" ? (darkMode ? "#007bff" : "#28a745") : "transparent",
                  borderRadius: "5px",
                  padding: "10px",
                  transition: "all 0.3s ease",
                  margin: "5px 10px",
                }}
              >
                <FiHome size={20} className="me-2" />
                Home
              </Nav.Link>

              {/* Manage CV */}
              <Nav.Link
                onClick={() => {
                  setCvsDropdown(!cvsDropdown);
                  setInterviewsDropdown(false);
                }}
                onMouseEnter={() => setHovered("cvs-manage")}
                onMouseLeave={() => setHovered(null)}
                style={{
                  color: hovered === "cvs-manage" ? "#fff" : darkMode ? "#fff" : "#000",
                  backgroundColor: hovered === "cvs-manage" ? (darkMode ? "#007bff" : "#28a745") : "transparent",
                  borderRadius: "5px",
                  padding: "10px",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                  margin: "5px 10px",
                }}
              >
                <FiFileText size={20} className="me-2" />
                Manage CVs
              </Nav.Link>

              {cvsDropdown && (
                <div style={{ marginLeft: "30px" }}>
                  <Nav.Link
                    as={Link}
                    to="/view-all-cvs"
                    onClick={() => setShow(false)}
                    onMouseEnter={() => setHovered("view-all-cvs")}
                    onMouseLeave={() => setHovered(null)}
                    style={{
                      color: hovered === "view-all-cvs" ? "#fff" : darkMode ? "#fff" : "#000",
                      backgroundColor: hovered === "view-all-cvs" ? (darkMode ? "#007bff" : "#28a745") : "transparent",
                      borderRadius: "5px",
                      padding: "8px",
                      transition: "all 0.3s ease",
                      margin: "3px 0",
                    }}
                  >
                    <FiList size={18} className="me-2" />
                    View All CVs
                  </Nav.Link>
                  <Nav.Link
                    as={Link}
                    to="/admin-add-cv"
                    onClick={() => setShow(false)}
                    onMouseEnter={() => setHovered("add-cv")}
                    onMouseLeave={() => setHovered(null)}
                    style={{
                      color: hovered === "add-cv" ? "#fff" : darkMode ? "#fff" : "#000",
                      backgroundColor: hovered === "add-cv" ? (darkMode ? "#007bff" : "#28a745") : "transparent",
                      borderRadius: "5px",
                      padding: "8px",
                      transition: "all 0.3s ease",
                      margin: "3px 0",
                    }}
                  >
                    <FiFilePlus size={18} className="me-2" />
                    Add New CV
                  </Nav.Link>
                  <Nav.Link
                    as={Link}
                    to="/admin-approve-cvs"
                    onClick={() => setShow(false)}
                    onMouseEnter={() => setHovered("approve-cv")}
                    onMouseLeave={() => setHovered(null)}
                    style={{
                      color: hovered === "approve-cv" ? "#fff" : darkMode ? "#fff" : "#000",
                      backgroundColor: hovered === "approve-cv" ? (darkMode ? "#007bff" : "#28a745") : "transparent",
                      borderRadius: "5px",
                      padding: "8px",
                      transition: "all 0.3s ease",
                      margin: "3px 0",
                    }}
                  >
                    <FiCheckCircle size={18} className="me-2" />
                    Approve CV
                  </Nav.Link>
                </div>
              )}

              {/* Interview */}
              <Nav.Link
                onClick={() => {
                  setInterviewsDropdown(!interviewsDropdown);
                  setCvsDropdown(false);
                }}
                onMouseEnter={() => setHovered("interviews")}
                onMouseLeave={() => setHovered(null)}
                style={{
                  color: hovered === "interviews" ? "#fff" : darkMode ? "#fff" : "#000",
                  backgroundColor: hovered === "interviews" ? (darkMode ? "#007bff" : "#28a745") : "transparent",
                  borderRadius: "5px",
                  padding: "10px",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                  margin: "5px 10px",
                }}
              >
                <FiCalendar size={20} className="me-2" />
                Interviews
              </Nav.Link>

              {interviewsDropdown && (
                <div style={{ marginLeft: "30px" }}>
                  <Nav.Link
                    as={Link}
                    to="/view-all-interviews"
                    onClick={() => setShow(false)}
                    onMouseEnter={() => setHovered("all-interviews")}
                    onMouseLeave={() => setHovered(null)}
                    style={{
                      color: hovered === "all-interviews" ? "#fff" : darkMode ? "#fff" : "#000",
                      backgroundColor: hovered === "all-interviews" ? (darkMode ? "#007bff" : "#28a745") : "transparent",
                      borderRadius: "5px",
                      padding: "8px",
                      transition: "all 0.3s ease",
                      margin: "3px 0",
                    }}
                  >
                    <FiList size={18} className="me-2" />
                    All Interviews
                  </Nav.Link>
                  <Nav.Link
                    as={Link}
                    to="/add-new-interview"
                    onClick={() => setShow(false)}
                    onMouseEnter={() => setHovered("new-interview")}
                    onMouseLeave={() => setHovered(null)}
                    style={{
                      color: hovered === "new-interview" ? "#fff" : darkMode ? "#fff" : "#000",
                      backgroundColor: hovered === "new-interview" ? (darkMode ? "#007bff" : "#28a745") : "transparent",
                      borderRadius: "5px",
                      padding: "8px",
                      transition: "all 0.3s ease",
                      margin: "3px 0",
                    }}
                  >
                    <FiFilePlus size={18} className="me-2" />
                    New Interview
                  </Nav.Link>
                  <Nav.Link
                    as={Link}
                    to="/schedule-interview"
                    onClick={() => setShow(false)}
                    onMouseEnter={() => setHovered("schedule-interview")}
                    onMouseLeave={() => setHovered(null)}
                    style={{
                      color: hovered === "schedule-interview" ? "#fff" : darkMode ? "#fff" : "#000",
                      backgroundColor: hovered === "schedule-interview" ? (darkMode ? "#007bff" : "#28a745") : "transparent",
                      borderRadius: "5px",
                      padding: "8px",
                      transition: "all 0.3s ease",
                      margin: "3px 0",
                    }}
                  >
                    <FiCalendar size={18} className="me-2" />
                    Schedule Interview
                  </Nav.Link>
                  <Nav.Link
                    as={Link}
                    to="/interview-results"
                    onClick={() => setShow(false)}
                    onMouseEnter={() => setHovered("interview-results")}
                    onMouseLeave={() => setHovered(null)}
                    style={{
                      color: hovered === "interview-results" ? "#fff" : darkMode ? "#fff" : "#000",
                      backgroundColor: hovered === "interview-results" ? (darkMode ? "#007bff" : "#28a745") : "transparent",
                      borderRadius: "5px",
                      padding: "8px",
                      transition: "all 0.3s ease",
                      margin: "3px 0",
                    }}
                  >
                    <FiAward size={18} className="me-2" />
                    Interview Results
                  </Nav.Link>
                </div>
              )}

              {/* Induction */}
              <Nav.Link
                onClick={() => {
                  setInductionsDropdown(!inductionsDropdown);
                  setCvsDropdown(false);
                  setInterviewsDropdown(false);
                }}
                onMouseEnter={() => setHovered("inductions")}
                onMouseLeave={() => setHovered(null)}
                style={{
                  color: hovered === "inductions" ? "#fff" : darkMode ? "#fff" : "#000",
                  backgroundColor: hovered === "inductions" ? (darkMode ? "#007bff" : "#28a745") : "transparent",
                  borderRadius: "5px",
                  padding: "10px",
                  cursor: "pointer",
                  margin: "5px 10px",
                }}
              >
                <FiUsers size={20} className="me-2" />
                Inductions
              </Nav.Link>

              {inductionsDropdown && (
                <div style={{ marginLeft: "30px" }}>
                  <Nav.Link
                    as={Link}
                    to="/view-all-inductions"
                    onClick={() => setShow(false)}
                    onMouseEnter={() => setHovered("all-inductions")}
                    onMouseLeave={() => setHovered(null)}
                    style={{
                      color: hovered === "all-inductions" ? "#fff" : darkMode ? "#fff" : "#000",
                      backgroundColor: hovered === "all-inductions" ? (darkMode ? "#007bff" : "#28a745") : "transparent",
                      borderRadius: "5px",
                      padding: "8px",
                      margin: "3px 0",
                    }}
                  >
                    <FiList size={18} className="me-2" />
                    All Inductions
                  </Nav.Link>

                  <Nav.Link
                    as={Link}
                    to="/add-new-induction"
                    onClick={() => setShow(false)}
                    onMouseEnter={() => setHovered("new-induction")}
                    onMouseLeave={() => setHovered(null)}
                    style={{
                      color: hovered === "new-induction" ? "#fff" : darkMode ? "#fff" : "#000",
                      backgroundColor: hovered === "new-induction" ? (darkMode ? "#007bff" : "#28a745") : "transparent",
                      borderRadius: "5px",
                      padding: "8px",
                      margin: "3px 0",
                    }}
                  >
                    <FiFilePlus size={18} className="me-2" />
                    New Induction
                  </Nav.Link>

                  <Nav.Link
                    as={Link}
                    to="/schedule-induction"
                    onClick={() => setShow(false)}
                    onMouseEnter={() => setHovered("schedule-induction")}
                    onMouseLeave={() => setHovered(null)}
                    style={{
                      color: hovered === "schedule-induction" ? "#fff" : darkMode ? "#fff" : "#000",
                      backgroundColor: hovered === "schedule-induction" ? (darkMode ? "#007bff" : "#28a745") : "transparent",
                      borderRadius: "5px",
                      padding: "8px",
                      margin: "3px 0",
                    }}
                  >
                    <FiCalendar size={18} className="me-2" />
                    Schedule Induction
                  </Nav.Link>

                  <Nav.Link
                    as={Link}
                    to="/induction-results"
                    onClick={() => setShow(false)}
                    onMouseEnter={() => setHovered("induction-results")}
                    onMouseLeave={() => setHovered(null)}
                    style={{
                      color: hovered === "induction-results" ? "#fff" : darkMode ? "#fff" : "#000",
                      backgroundColor: hovered === "induction-results" ? (darkMode ? "#007bff" : "#28a745") : "transparent",
                      borderRadius: "5px",
                      padding: "8px",
                      margin: "3px 0",
                    }}
                  >
                    <FiAward size={18} className="me-2" />
                    Induction Results
                  </Nav.Link>
                </div>
              )}                 

              {/* Assign to Scheme */}
              <Nav.Link
                as={Link}
                to="/schedule-scheme"
                onClick={() => setShow(false)}
                onMouseEnter={() => setHovered("assign-scheme")}
                onMouseLeave={() => setHovered(null)}
                style={{
                  color: hovered === "assign-scheme" ? "#fff" : darkMode ? "#fff" : "#000",
                  backgroundColor: hovered === "assign-scheme" ? (darkMode ? "#007bff" : "#28a745") : "transparent",
                  borderRadius: "5px",
                  padding: "10px",
                  transition: "all 0.3s ease",
                  margin: "5px 10px",
                }}
              >
                <FiList size={20} className="me-2" />
                Assign to Scheme
              </Nav.Link>

              {/* Intern Status */}
              <Nav.Link
                as={Link}
                to="/intern-status"
                onClick={() => setShow(false)}
                onMouseEnter={() => setHovered("intern-status")}
                onMouseLeave={() => setHovered(null)}
                style={{
                  color: hovered === "intern-status" ? "#fff" : darkMode ? "#fff" : "#000",
                  backgroundColor: hovered === "intern-status" ? (darkMode ? "#007bff" : "#28a745") : "transparent",
                  borderRadius: "5px",
                  padding: "10px",
                  transition: "all 0.3s ease",
                  margin: "5px 10px",
                }}
              >
                <FiHelpCircle size={20} className="me-2" />
                Intern Status
              </Nav.Link>

              {/* Life Cycle */}
              <Nav.Link
                as={Link}
                to="/life-cycle"
                onClick={() => setShow(false)}
                onMouseEnter={() => setHovered("life-cycle")}
                onMouseLeave={() => setHovered(null)}
                style={{
                  color: hovered === "life-cycle" ? "#fff" : darkMode ? "#fff" : "#000",
                  backgroundColor: hovered === "life-cycle" ? (darkMode ? "#007bff" : "#28a745") : "transparent",
                  borderRadius: "5px",
                  padding: "10px",
                  transition: "all 0.3s ease",
                  margin: "5px 10px",
                }}
              >
                <FiRepeat size={20} className="me-2" />
                Life Cycle
              </Nav.Link>

              {/* Institute */}
              <Nav.Link
                onClick={() => {
                  setInstituteDropdown(!instituteDropdown);
                  setCvsDropdown(false);
                  setInterviewsDropdown(false);
                }}
                onMouseEnter={() => setHovered("institute")}
                onMouseLeave={() => setHovered(null)}
                style={{
                  color: hovered === "institute" ? "#fff" : darkMode ? "#fff" : "#000",
                  backgroundColor: hovered === "institute" ? (darkMode ? "#007bff" : "#28a745") : "transparent",
                  borderRadius: "5px",
                  padding: "10px",
                  cursor: "pointer",
                  margin: "5px 10px",
                }}
              >
                <FaBuildingColumns size={20} className="me-2" />
                Institute
              </Nav.Link>

              {instituteDropdown && (
                <div style={{ marginLeft: "30px" }}>
                  <Nav.Link
                    as={Link}
                    to="/view-all-institute"
                    onClick={() => setShow(false)}
                    onMouseEnter={() => setHovered("all-institute")}
                    onMouseLeave={() => setHovered(null)}
                    style={{
                      color: hovered === "all-institute" ? "#fff" : darkMode ? "#fff" : "#000",
                      backgroundColor: hovered === "all-institute" ? (darkMode ? "#007bff" : "#28a745") : "transparent",
                      borderRadius: "5px",
                      padding: "8px",
                      margin: "3px 0",
                    }}
                  >
                    <FiList size={18} className="me-2" />
                    All institute
                  </Nav.Link>

                  <Nav.Link
                    as={Link}
                    to="/add-new-institute"
                    onClick={() => setShow(false)}
                    onMouseEnter={() => setHovered("new-institute")}
                    onMouseLeave={() => setHovered(null)}
                    style={{
                      color: hovered === "new-institute" ? "#fff" : darkMode ? "#fff" : "#000",
                      backgroundColor: hovered === "new-institute" ? (darkMode ? "#007bff" : "#28a745") : "transparent",
                      borderRadius: "5px",
                      padding: "8px",
                      margin: "3px 0",
                    }}
                  >
                    <FiFilePlus size={18} className="me-2" />
                    New institute
                  </Nav.Link>

                  <Nav.Link
                    as={Link}
                    to="/approve-institute"
                    onClick={() => setShow(false)}
                    onMouseEnter={() => setHovered("approve-institute")}
                    onMouseLeave={() => setHovered(null)}
                    style={{
                      color: hovered === "approve-institute" ? "#fff" : darkMode ? "#fff" : "#000",
                      backgroundColor: hovered === "approve-institute" ? (darkMode ? "#007bff" : "#28a745") : "transparent",
                      borderRadius: "5px",
                      padding: "8px",
                      margin: "3px 0",
                    }}
                  >
                    <FiCheckCircle size={18} className="me-2" />
                    Approve institute
                  </Nav.Link>
                </div>
              )}

              {/* Schemes */}
              <Nav.Link
                onClick={() => {
                  closeAllDropdowns();
                  setSchemeDropdown(!schemeDropdown);
                }}
                onMouseEnter={() => setHovered("scheme")}
                onMouseLeave={() => setHovered(null)}
                style={{
                  color: hovered === "scheme" ? "#fff" : darkMode ? "#fff" : "#000",
                  backgroundColor: hovered === "scheme" ? (darkMode ? "#007bff" : "#28a745") : "transparent",
                  borderRadius: "5px",
                  padding: "10px",
                  cursor: "pointer",
                  margin: "5px 10px",
                }}
              >
                <FiLayers size={20} className="me-2" />
                Scheme
              </Nav.Link>

              {schemeDropdown && (
                <div style={{ marginLeft: "30px" }}>
                  <Nav.Link
                    as={Link}
                    to="/view-all-scheme"
                    onClick={() => setShow(false)}
                    onMouseEnter={() => setHovered("all-scheme")}
                    onMouseLeave={() => setHovered(null)}
                    style={{
                      color: hovered === "all-scheme" ? "#fff" : darkMode ? "#fff" : "#000",
                      backgroundColor: hovered === "all-scheme" ? (darkMode ? "#007bff" : "#28a745") : "transparent",
                      borderRadius: "5px",
                      padding: "8px",
                      margin: "3px 0",
                    }}
                  >
                    <FiList size={18} className="me-2" />
                    All schemes
                  </Nav.Link>

                  <Nav.Link
                    as={Link}
                    to="/add-new-scheme"
                    onClick={() => setShow(false)}
                    onMouseEnter={() => setHovered("new-scheme")}
                    onMouseLeave={() => setHovered(null)}
                    style={{
                      color: hovered === "new-scheme" ? "#fff" : darkMode ? "#fff" : "#000",
                      backgroundColor: hovered === "new-scheme" ? (darkMode ? "#007bff" : "#28a745") : "transparent",
                      borderRadius: "5px",
                      padding: "8px",
                      margin: "3px 0",
                    }}
                  >
                    <FiFilePlus size={18} className="me-2" />
                    New scheme
                  </Nav.Link>
                </div>
              )}
              
              {/* Requests */}
              <Nav.Link
                as={Link}
                to="/staff-intern-request"
                onClick={() => setShow(false)}
                onMouseEnter={() => setHovered("/staff-intern-request")}
                onMouseLeave={() => setHovered(null)}
                style={{
                  color: hovered === "/staff-intern-request" ? "#fff" : darkMode ? "#fff" : "#000",
                  backgroundColor: hovered === "/staff-intern-request" ? (darkMode ? "#007bff" : "#28a745") : "transparent",
                  borderRadius: "5px",
                  padding: "10px",
                  transition: "all 0.3s ease",
                  margin: "5px 10px",
                }}
              >
                <FiMail size={20} className="me-2" />
                Intern Requests
              </Nav.Link>

              {/* Certificate Requests */}
              <Nav.Link
                as={Link}
                to="/intern-certificate-request"
                onClick={() => setShow(false)}
                onMouseEnter={() => setHovered("request")}
                onMouseLeave={() => setHovered(null)}
                style={{
                  color: hovered === "request" ? "#fff" : darkMode ? "#fff" : "#000",
                  backgroundColor: hovered === "request" ? (darkMode ? "#007bff" : "#28a745") : "transparent",
                  borderRadius: "5px",
                  padding: "10px",
                  transition: "all 0.3s ease",
                  margin: "5px 10px",
                }}
              >
                <FiClipboard size={20} className="me-2" />
                Certificate Requests
              </Nav.Link>

              {/* Intern Placements */}
              <Nav.Link
                as={Link}
                to="/intern-placement"
                onClick={() => setShow(false)}
                onMouseEnter={() => setHovered("intern-placement")}
                onMouseLeave={() => setHovered(null)}
                style={{
                  color: hovered === "intern-placement" ? "#fff" : darkMode ? "#fff" : "#000",
                  backgroundColor: hovered === "intern-placement" ? (darkMode ? "#007bff" : "#28a745") : "transparent",
                  borderRadius: "5px",
                  padding: "10px",
                  transition: "all 0.3s ease",
                  margin: "5px 10px",
                }}
              >
                <FiBriefcase size={20} className="me-2" />
                Intern Placement
              </Nav.Link>

              {/* Rotational */}
              <Nav.Link
                onClick={() => {
                  closeAllDropdowns();
                  setRotationDropdown(!rotationDropdown);
                }}
                onMouseEnter={() => setHovered("rotation")}
                onMouseLeave={() => setHovered(null)}
                style={{
                  color: hovered === "rotation" ? "#fff" : darkMode ? "#fff" : "#000",
                  backgroundColor: hovered === "rotation" ? (darkMode ? "#007bff" : "#28a745") : "transparent",
                  borderRadius: "5px",
                  padding: "10px",
                  cursor: "pointer",
                  margin: "5px 10px",
                }}
              >
                <FiDatabase size={20} className="me-2" />
                Rotations
              </Nav.Link>

              {rotationDropdown && (
                <div style={{ marginLeft: "30px" }}>
                  <Nav.Link
                    as={Link}
                    to="/all-rotational-stations"
                    onClick={() => setShow(false)}
                    onMouseEnter={() => setHovered("all-rotational-stations")}
                    onMouseLeave={() => setHovered(null)}
                    style={{
                      color: hovered === "all-rotational-stations" ? "#fff" : darkMode ? "#fff" : "#000",
                      backgroundColor: hovered === "all-rotational-stations" ? (darkMode ? "#007bff" : "#28a745") : "transparent",
                      borderRadius: "5px",
                      padding: "8px",
                      margin: "3px 0",
                    }}
                  >
                    <FiList size={18} className="me-2" />
                    Stations
                  </Nav.Link>

                  <Nav.Link
                    as={Link}
                    to="/schedule-rotations"
                    onClick={() => setShow(false)}
                    onMouseEnter={() => setHovered("schedule-for-rotations")}
                    onMouseLeave={() => setHovered(null)}
                    style={{
                      color: hovered === "schedule-for-rotations" ? "#fff" : darkMode ? "#fff" : "#000",
                      backgroundColor: hovered === "schedule-for-rotations" ? (darkMode ? "#007bff" : "#28a745") : "transparent",
                      borderRadius: "5px",
                      padding: "8px",
                      margin: "3px 0",
                    }}
                  >
                    <FiCheckCircle size={18} className="me-2" />
                    Schedule
                  </Nav.Link>
                </div>
              )}

              {/* Templates */}
              <Nav.Link
                onClick={() => {
                  closeAllDropdowns();
                  setTemplateDropdown(!templateDropdown);
                }}
                onMouseEnter={() => setHovered("template")}
                onMouseLeave={() => setHovered(null)}
                style={{
                  color: hovered === "template" ? "#fff" : darkMode ? "#fff" : "#000",
                  backgroundColor: hovered === "template" ? (darkMode ? "#007bff" : "#28a745") : "transparent",
                  borderRadius: "5px",
                  padding: "10px",
                  cursor: "pointer",
                  margin: "5px 10px",
                }}
              >
                <FiCodepen size={20} className="me-2" />
                Templates
              </Nav.Link>

              {templateDropdown && (
                <div style={{ marginLeft: "30px" }}>
                  <Nav.Link
                    as={Link}
                    to="/all-certificate"
                    onClick={() => setShow(false)}
                    onMouseEnter={() => setHovered("all-certificate")}
                    onMouseLeave={() => setHovered(null)}
                    style={{
                      color: hovered === "all-certificate" ? "#fff" : darkMode ? "#fff" : "#000",
                      backgroundColor: hovered === "all-certificate" ? (darkMode ? "#007bff" : "#28a745") : "transparent",
                      borderRadius: "5px",
                      padding: "8px",
                      margin: "3px 0",
                    }}
                  >
                    <FiList size={18} className="me-2" />
                    All Certificates
                  </Nav.Link>

                  <Nav.Link
                    as={Link}
                    to="/add-certificate"
                    onClick={() => setShow(false)}
                    onMouseEnter={() => setHovered("add-new-certificate")}
                    onMouseLeave={() => setHovered(null)}
                    style={{
                      color: hovered === "add-new-certificate" ? "#fff" : darkMode ? "#fff" : "#000",
                      backgroundColor: hovered === "add-new-certificate" ? (darkMode ? "#007bff" : "#28a745") : "transparent",
                      borderRadius: "5px",
                      padding: "8px",
                      margin: "3px 0",
                    }}
                  >
                    <FiFilePlus size={18} className="me-2" />
                    New Certificate
                  </Nav.Link>

                  <Nav.Link
                    as={Link}
                    to="/all-certificate-letters"
                    onClick={() => setShow(false)}
                    onMouseEnter={() => setHovered("all-certificate-letters")}
                    onMouseLeave={() => setHovered(null)}
                    style={{
                      color: hovered === "all-certificate-letters" ? "#fff" : darkMode ? "#fff" : "#000",
                      backgroundColor: hovered === "all-certificate-letters" ? (darkMode ? "#007bff" : "#28a745") : "transparent",
                      borderRadius: "5px",
                      padding: "8px",
                      margin: "3px 0",
                    }}
                  >
                    <FiList size={18} className="me-2" />
                    All Certificate Letters
                  </Nav.Link>

                  <Nav.Link
                    as={Link}
                    to="/add-certificate-letter"
                    onClick={() => setShow(false)}
                    onMouseEnter={() => setHovered("add-new-certificate-letter")}
                    onMouseLeave={() => setHovered(null)}
                    style={{
                      color: hovered === "add-new-certificate-letter" ? "#fff" : darkMode ? "#fff" : "#000",
                      backgroundColor: hovered === "add-new-certificate-letter" ? (darkMode ? "#007bff" : "#28a745") : "transparent",
                      borderRadius: "5px",
                      padding: "8px",
                      margin: "3px 0",
                    }}
                  >
                    <FiFilePlus size={18} className="me-2" />
                    New Certificate Letter
                  </Nav.Link>

                  <Nav.Link
                    as={Link}
                    to="/all-placement-letters"
                    onClick={() => setShow(false)}
                    onMouseEnter={() => setHovered("all-placement-letters")}
                    onMouseLeave={() => setHovered(null)}
                    style={{
                      color: hovered === "all-placement-letters" ? "#fff" : darkMode ? "#fff" : "#000",
                      backgroundColor: hovered === "all-placement-letters" ? (darkMode ? "#007bff" : "#28a745") : "transparent",
                      borderRadius: "5px",
                      padding: "8px",
                      margin: "3px 0",
                    }}
                  >
                    <FiList size={18} className="me-2" />
                    All Placement Letters
                  </Nav.Link>

                  <Nav.Link
                    as={Link}
                    to="/add-new-placement-letter"
                    onClick={() => setShow(false)}
                    onMouseEnter={() => setHovered("add-new-placement-letter")}
                    onMouseLeave={() => setHovered(null)}
                    style={{
                      color: hovered === "add-new-placement-letter" ? "#fff" : darkMode ? "#fff" : "#000",
                      backgroundColor: hovered === "add-new-placement-letter" ? (darkMode ? "#007bff" : "#28a745") : "transparent",
                      borderRadius: "5px",
                      padding: "8px",
                      margin: "3px 0",
                    }}
                  >
                    <FiFilePlus size={18} className="me-2" />
                    New Placement Letter
                  </Nav.Link>
                </div>
              )}

              {/* Bank Details */}
              <Nav.Link
                as={Link}
                to="/intern-bank-details"
                onClick={() => setShow(false)}
                onMouseEnter={() => setHovered("bank-details")}
                onMouseLeave={() => setHovered(null)}
                style={{
                  color: hovered === "bank-details" ? "#fff" : darkMode ? "#fff" : "#000",
                  backgroundColor: hovered === "bank-details" ? (darkMode ? "#007bff" : "#28a745") : "transparent",
                  borderRadius: "5px",
                  padding: "10px",
                  transition: "all 0.3s ease",
                  margin: "5px 10px",
                }}
              >
                <FiCreditCard size={20} className="me-2" />
                Bank Details
              </Nav.Link>

              {/* Reports */}
              <Nav.Link
                as={Link}
                to="/admin-reports" 
                onClick={() => setShow(false)}
                onMouseEnter={() => setHovered("reports")}
                onMouseLeave={() => setHovered(null)}
                style={{
                  color: hovered === "reports" ? "#fff" : darkMode ? "#fff" : "#000",
                  backgroundColor: hovered === "reports" ? (darkMode ? "#007bff" : "#28a745") : "transparent",
                  borderRadius: "5px",
                  padding: "10px",
                  transition: "all 0.3s ease",
                  margin: "5px 10px",
                }}
              >
                <FiBarChart size={20} className="me-2" />
                Reports
              </Nav.Link>
            
              {/* Help */}
              <Nav.Link
                as={Link}
                to="/admin-help-support"
                onClick={() => setShow(false)}
                onMouseEnter={() => setHovered("help")}
                onMouseLeave={() => setHovered(null)}
                style={{
                  color: hovered === "help" ? "#fff" : darkMode ? "#fff" : "#000",
                  backgroundColor: hovered === "help" ? (darkMode ? "#007bff" : "#28a745") : "transparent",
                  borderRadius: "5px",
                  padding: "10px",
                  transition: "all 0.3s ease",
                  margin: "5px 10px",
                }}
              >
                <FiHelpCircle size={20} className="me-2" />
                Help
              </Nav.Link>
            </Nav>
          </div>

        </div>
      </div>
    </>
  );
};

export default AdminSidebar;