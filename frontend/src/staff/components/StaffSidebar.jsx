import { useState } from "react";
import { Link } from "react-router-dom";
import { Offcanvas, Button, Nav } from "react-bootstrap";
import { List } from "react-bootstrap-icons";
import { FiCreditCard, FiHelpCircle, FiHome, FiFilePlus, FiList, FiFile, FiPenTool, FiDivideCircle, FiDatabase, FiUserCheck } from "react-icons/fi";
import logo from "../../assets/logo.png";

const StaffSidebar = ({ darkMode }) => {
  const [show, setShow] = useState(false);
  const [hovered, setHovered] = useState(null);
  const [staffDetailsDropdown, setStaffDetailsDropdown] = useState(false);
  const [internRequestDropdown, setInternRequestDropdown] = useState(false);

  return (
    <>
      {/* Sidebar Toggle Button */}
      {!show && (
        <Button
          variant={darkMode ? "light" : "dark"}
          onClick={() => setShow(true)}
          className="position-fixed top-0 start-0 m-2"
          style={{
            fontSize: "25px",
            background: "transparent",
            border: "none",
            zIndex: 2000,
          }}
        >
          <List size={25} color={darkMode ? "#fff" : "#000"} />
        </Button>
      )}

      {/* Sidebar Offcanvas */}
      <Offcanvas
        show={show}
        onHide={() => setShow(false)}
        backdrop="static"
        style={{
          backgroundColor: darkMode ? "#343a40" : "#f8f9fa",
          width: "250px",
        }}
      >
        {/* Sidebar Header */}
        <Offcanvas.Header
          style={{
            backgroundColor: darkMode ? "#343a40" : "#f8f9fa",
            marginBottom: "0",
            paddingBottom: "0",
          }}
        >
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
        </Offcanvas.Header>

        {/* Sidebar Body */}
        <Offcanvas.Body
          className="d-flex flex-column justify-content-between"
          style={{
            backgroundColor: darkMode ? "#343a40" : "#f8f9fa",
            color: darkMode ? "#fff" : "#000",
            height: "100vh",
            paddingBottom: "10px",
          }}
        >
          {/* Navigation Links */}
          <div>
            <hr
              style={{
                borderColor: darkMode ? "#666" : "#ddd",
                borderTop: "1px solid",
                margin: "0",
              }}
            />
            <Nav className="flex-column">
              <Nav.Link
                as={Link}
                to="/staff-home"
                onClick={() => setShow(false)}
                onMouseEnter={() => setHovered("staff-home")}
                onMouseLeave={() => setHovered(null)}
                style={{
                  color: hovered === "home" ? "#fff" : darkMode ? "#fff" : "#000",
                  backgroundColor: hovered === "home" ? (darkMode ? "#007bff" : "#28a745") : "transparent",
                  borderRadius: "5px",
                  padding: "10px",
                  transition: "all 0.3s ease",
                }}
              >
                <FiHome size={20} className="me-2" />
                Staff Home
              </Nav.Link>

              <Nav.Link
                onClick={() => setStaffDetailsDropdown(!staffDetailsDropdown)}
                onMouseEnter={() => setHovered("staff-details")}
                onMouseLeave={() => setHovered(null)}
                style={{
                  color: hovered === "staff-details" ? "#fff" : darkMode ? "#fff" : "#000",
                  backgroundColor: hovered === "staff-details" ? (darkMode ? "#007bff" : "#28a745") : "transparent",
                  borderRadius: "5px",
                  padding: "10px",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                }}
              >
                <FiUserCheck size={20} className="me-2" />
                Staff Details
              </Nav.Link>

              {staffDetailsDropdown && (
                <div style={{ marginLeft: "20px" }}>
                  <Nav.Link
                    as={Link}
                    to="/create-details"
                    onClick={() => setShow(false)}
                    onMouseEnter={() => setHovered("create-details")}
                    onMouseLeave={() => setHovered(null)}
                    style={{
                      color: hovered === "create-details" ? "#fff" : darkMode ? "#fff" : "#000",
                      backgroundColor: hovered === "create-details" ? (darkMode ? "#007bff" : "#28a745") : "transparent",
                      borderRadius: "5px",
                      padding: "8px",
                      transition: "all 0.3s ease",
                    }}
                  >
                    <FiFilePlus size={18} className="me-2" />
                    Add Details
                  </Nav.Link>
                  <Nav.Link
                    as={Link}
                    to="/view-my-details"
                    onClick={() => setShow(false)}
                    onMouseEnter={() => setHovered("view-details")}
                    onMouseLeave={() => setHovered(null)}
                    style={{
                      color: hovered === "view-details" ? "#fff" : darkMode ? "#fff" : "#000",
                      backgroundColor: hovered === "view-details" ? (darkMode ? "#007bff" : "#28a745") : "transparent",
                      borderRadius: "5px",
                      padding: "8px",
                      transition: "all 0.3s ease",
                    }}
                  >
                    <FiList size={18} className="me-2" />
                    View Details
                  </Nav.Link>
                </div>
              )}

              <Nav.Link
                as={Link}
                to="/executive-intern-request"
                onClick={() => setShow(false)}
                onMouseEnter={() => setHovered("executive-intern-request")}
                onMouseLeave={() => setHovered(null)}
                style={{
                  color: hovered === "home" ? "#fff" : darkMode ? "#fff" : "#000",
                  backgroundColor: hovered === "home" ? (darkMode ? "#007bff" : "#28a745") : "transparent",
                  borderRadius: "5px",
                  padding: "10px",
                  transition: "all 0.3s ease",
                }}
              >
                <FiFile size={20} className="me-2" />
                Executive Request
              </Nav.Link>

              <Nav.Link
                onClick={() => setInternRequestDropdown(!internRequestDropdown)}
                onMouseEnter={() => setHovered("intern-request")}
                onMouseLeave={() => setHovered(null)}
                style={{
                  color: hovered === "intern-request" ? "#fff" : darkMode ? "#fff" : "#000",
                  backgroundColor: hovered === "intern-request" ? (darkMode ? "#007bff" : "#28a745") : "transparent",
                  borderRadius: "5px",
                  padding: "10px",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                }}
              >
                <FiPenTool size={20} className="me-2" />
                Intern Request
              </Nav.Link>

              {/* Sub-menu */}
              {internRequestDropdown && (
                <div style={{ marginLeft: "20px" }}>
                  <Nav.Link
                    as={Link}
                    to="/create-intern-request"
                    onClick={() => setShow(false)}
                    onMouseEnter={() => setHovered("create-intern-request")}
                    onMouseLeave={() => setHovered(null)}
                    style={{
                      color: hovered === "create-intern-request" ? "#fff" : darkMode ? "#fff" : "#000",
                      backgroundColor: hovered === "create-intern-request" ? (darkMode ? "#007bff" : "#28a745") : "transparent",
                      borderRadius: "5px",
                      padding: "8px",
                      transition: "all 0.3s ease",
                    }}
                  >
                    <FiFilePlus size={18} className="me-2" />
                    Create Request
                  </Nav.Link>
                  <Nav.Link
                    as={Link}
                    to="/view-my-requests"
                    onClick={() => setShow(false)}
                    onMouseEnter={() => setHovered("view-my-requests")}
                    onMouseLeave={() => setHovered(null)}
                    style={{
                      color: hovered === "view-my-requests" ? "#fff" : darkMode ? "#fff" : "#000",
                      backgroundColor: hovered === "view-my-requests" ? (darkMode ? "#007bff" : "#28a745") : "transparent",
                      borderRadius: "5px",
                      padding: "8px",
                      transition: "all 0.3s ease",
                    }}
                  >
                    <FiList size={18} className="me-2" />
                    View My Requests
                  </Nav.Link>
                </div>
              )}

              <Nav.Link
                as={Link}
                to="/my-interns-pending"
                onClick={() => setShow(false)}
                onMouseEnter={() => setHovered("my-interns-pending")}
                onMouseLeave={() => setHovered(null)}
                style={{
                  color: hovered === "my-interns-pending" ? "#fff" : darkMode ? "#fff" : "#000",
                  backgroundColor: hovered === "my-interns-pending" ? (darkMode ? "#007bff" : "#28a745") : "transparent",
                  borderRadius: "5px",
                  padding: "10px",
                  transition: "all 0.3s ease",
                }}
              >
                <FiDivideCircle size={20} className="me-2" />
                My Interns Pending
              </Nav.Link>

              <Nav.Link
                as={Link}
                to="/my-interns-placement"
                onClick={() => setShow(false)}
                onMouseEnter={() => setHovered("my-interns-placement")}
                onMouseLeave={() => setHovered(null)}
                style={{
                  color: hovered === "my-interns-placement" ? "#fff" : darkMode ? "#fff" : "#000",
                  backgroundColor: hovered === "my-interns-placement" ? (darkMode ? "#007bff" : "#28a745") : "transparent",
                  borderRadius: "5px",
                  padding: "10px",
                  transition: "all 0.3s ease",
                }}
              >
                <FiDatabase size={20} className="me-2" />
                My Interns Placemet
              </Nav.Link>

              <Nav.Link
                as={Link}
                to="/my-interns-allocations"
                onClick={() => setShow(false)}
                onMouseEnter={() => setHovered("my-interns-allocations")}
                onMouseLeave={() => setHovered(null)}
                style={{
                  color: hovered === "my-interns-allocations" ? "#fff" : darkMode ? "#fff" : "#000",
                  backgroundColor: hovered === "my-interns-allocations" ? (darkMode ? "#007bff" : "#28a745") : "transparent",
                  borderRadius: "5px",
                  padding: "10px",
                  transition: "all 0.3s ease",
                }}
              >
                <FiDatabase size={20} className="me-2" />
                My Interns Allocations
              </Nav.Link>

              <Nav.Link
                as={Link}
                to="/my-certificate-request"
                onClick={() => setShow(false)}
                onMouseEnter={() => setHovered("my-certificate-request")}
                onMouseLeave={() => setHovered(null)}
                style={{
                  color: hovered === "my-certificate-request" ? "#fff" : darkMode ? "#fff" : "#000",
                  backgroundColor: hovered === "my-certificate-request" ? (darkMode ? "#007bff" : "#28a745") : "transparent",
                  borderRadius: "5px",
                  padding: "10px",
                  transition: "all 0.3s ease",
                }}
              >
                <FiDatabase size={20} className="me-2" />
                My Certificate Request
              </Nav.Link>


              <Nav.Link
                as={Link}
                to="/staff-help-support"
                onClick={() => setShow(false)}
                onMouseEnter={() => setHovered("help")}
                onMouseLeave={() => setHovered(null)}
                style={{
                  color: hovered === "help" ? "#fff" : darkMode ? "#fff" : "#000",
                  backgroundColor: hovered === "help" ? (darkMode ? "#007bff" : "#28a745") : "transparent",
                  borderRadius: "5px",
                  padding: "10px",
                  transition: "all 0.3s ease",
                }}
              >
                <FiHelpCircle size={20} className="me-2" />
                Help
              </Nav.Link>
            </Nav>
          </div>

          {/* Collapse Button */}
          <div className="text-center mt-auto">
            <Button
              variant={darkMode ? "outline-light" : "outline-dark"}
              onClick={() => setShow(false)}
              style={{
                width: "90%",
                marginBottom: "10px",
                borderRadius: "5px",
              }}
            >
              Collapse
            </Button>
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default StaffSidebar;