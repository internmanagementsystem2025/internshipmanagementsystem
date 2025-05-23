import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Nav } from "react-bootstrap";
import { FiHelpCircle, FiMenu, FiX, FiHome, FiUserCheck, FiFileText, FiList } from "react-icons/fi";
import logo from "../../assets/logo.png";

const InstituteSidebar = ({ darkMode }) => {
  const [show, setShow] = useState(false);
  const [hovered, setHovered] = useState(null);
  const [certDropdown, setCertDropdown] = useState(false);
  const [cv, setCV] = useState(false);

  const sidebarRef = useRef(null);
  const hoverTimeoutRef = useRef(null);

  const closeAllDropdowns = () => {
    setCertDropdown(false);
    setCV(false);
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

  const toggleSidebar = () => {
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
      {/* Sidebar Toggle Button */}
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
              style={{ width: "80px", height: "30px", marginRight: "10px" }}
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
          <style>{`::-webkit-scrollbar { display: none; }`}</style>

          {/* Navigation Links */}
          <div>
            <Nav className="flex-column">
              <Nav.Link
                as={Link}
                to="/institute-home"
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
                Institute Home
              </Nav.Link>

              {/* Request Internship*/}
              <Nav.Link
                as={Link}
                to="/institute-add-cv"
                onClick={() => setShow(false)}
                onMouseEnter={() => setHovered("institute-add-cv")}
                onMouseLeave={() => setHovered(null)}
                style={{
                  color: hovered === "institute-add-cv" ? "#fff" : darkMode ? "#fff" : "#000",
                  backgroundColor: hovered === "institute-add-cv" ? (darkMode ? "#007bff" : "#28a745") : "transparent",
                  borderRadius: "5px",
                  padding: "10px",
                  transition: "all 0.3s ease",
                  margin: "5px 10px",
                }}
              >
                <FiFileText size={20} className="me-2" />
                Request Internship
              </Nav.Link>

              {/* My CVs*/}
              <Nav.Link
                as={Link}
                to="/institute-all-aplications"
                onClick={() => setShow(false)}
                onMouseEnter={() => setHovered("institute-all-aplications")}
                onMouseLeave={() => setHovered(null)}
                style={{
                  color: hovered === "institute-all-aplications" ? "#fff" : darkMode ? "#fff" : "#000",
                  backgroundColor: hovered === "institute-all-aplications" ? (darkMode ? "#007bff" : "#28a745") : "transparent",
                  borderRadius: "5px",
                  padding: "10px",
                  transition: "all 0.3s ease",
                  margin: "5px 10px",
                }}
              >
                <FiUserCheck size={20} className="me-2" />
                My CVs
              </Nav.Link>

              {/* Help*/}
              <Nav.Link
                as={Link}
                to="/bulk-cv-upload"
                onClick={() => setShow(false)}
                onMouseEnter={() => setHovered("bulk-cv-upload")}
                onMouseLeave={() => setHovered(null)}
                style={{
                  color: hovered === "bulk-cv-upload" ? "#fff" : darkMode ? "#fff" : "#000",
                  backgroundColor: hovered === "bulk-cv-upload" ? (darkMode ? "#007bff" : "#28a745") : "transparent",
                  borderRadius: "5px",
                  padding: "10px",
                  transition: "all 0.3s ease",
                  margin: "5px 10px",
                }}
              >
                <FiList size={20} className="me-2" />
               Bulk CV
              </Nav.Link>

              {/* Help*/}
              <Nav.Link
                as={Link}
                to="/institute-help-support"
                onClick={() => setShow(false)}
                onMouseEnter={() => setHovered("institute-help-support")}
                onMouseLeave={() => setHovered(null)}
                style={{
                  color: hovered === "institute-help-support" ? "#fff" : darkMode ? "#fff" : "#000",
                  backgroundColor: hovered === "institute-help-support" ? (darkMode ? "#007bff" : "#28a745") : "transparent",
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

export default InstituteSidebar;
