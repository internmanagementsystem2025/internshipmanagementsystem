import { useState } from "react";
import { Link } from "react-router-dom";
import { Offcanvas, Button, Nav } from "react-bootstrap";
import { List } from "react-bootstrap-icons";
import { FiCreditCard, FiHelpCircle, FiHome, FiFileText } from "react-icons/fi"; 
import logo from "../../assets/logo.png";

const Sidebar = ({ darkMode }) => {
  const [show, setShow] = useState(false);
  const [hovered, setHovered] = useState(null);

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
                to="/individual-home"
                onClick={() => setShow(false)}
                onMouseEnter={() => setHovered("home")}
                onMouseLeave={() => setHovered(null)}
                style={{
                  color: hovered === "home" ? "#fff" : darkMode ? "#fff" : "#000",
                  backgroundColor:
                    hovered === "home" ? (darkMode ? "#007bff" : "#28a745") : "transparent",
                  borderRadius: "5px",
                  padding: "10px",
                  transition: "all 0.3s ease",
                }}
              >
                <FiHome size={20} className="me-2" />
                Individual Home
              </Nav.Link>

              <Nav.Link
                as={Link}
                to="/status-report"
                onClick={() => setShow(false)}
                onMouseEnter={() => setHovered("status")}
                onMouseLeave={() => setHovered(null)}
                style={{
                  color: hovered === "status" ? "#fff" : darkMode ? "#fff" : "#000",
                  backgroundColor:
                    hovered === "status" ? (darkMode ? "#007bff" : "#28a745") : "transparent",
                  borderRadius: "5px",
                  padding: "10px",
                  transition: "all 0.3s ease",
                }}
              >
                <FiFileText size={20} className="me-2" />
                Status Report
              </Nav.Link>

              <Nav.Link
                as={Link}
                to="/bank-details"
                onClick={() => setShow(false)}
                onMouseEnter={() => setHovered("services")}
                onMouseLeave={() => setHovered(null)}
                style={{
                  color: hovered === "services" ? "#fff" : darkMode ? "#fff" : "#000",
                  backgroundColor:
                    hovered === "services" ? (darkMode ? "#007bff" : "#28a745") : "transparent",
                  borderRadius: "5px",
                  padding: "10px",
                  transition: "all 0.3s ease",
                }}
              >
                <FiCreditCard size={20} className="me-2" />
                Bank Details
              </Nav.Link>

              <Nav.Link
                as={Link}
                to="/help-support"
                onClick={() => setShow(false)}
                onMouseEnter={() => setHovered("contact")}
                onMouseLeave={() => setHovered(null)}
                style={{
                  color: hovered === "contact" ? "#fff" : darkMode ? "#fff" : "#000",
                  backgroundColor:
                    hovered === "contact" ? (darkMode ? "#007bff" : "#28a745") : "transparent",
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

export default Sidebar;
