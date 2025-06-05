import { useState, useEffect } from "react";
import { Navbar, Nav, Container, Button, Dropdown } from "react-bootstrap";
import { FiUser, FiLogOut } from "react-icons/fi";
import { BsSun, BsMoon } from "react-icons/bs";
import { AiOutlineScan } from "react-icons/ai"; 
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

const NavbarComp = ({ toggleTheme, darkMode, scrolled }) => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState({ id: null, username: "User", email: "user@example.com" });
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser({ id: decoded.id, username: decoded.username, email: decoded.email });
      } catch (error) {
        console.error("Invalid token:", error);
        handleLogout();
      }
    } else {
      navigate("/login");
    }

    // Detect fullscreen change
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [navigate]);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error("Error attempting to enable fullscreen:", err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <Navbar expand="lg" bg={darkMode ? "dark" : "light"} variant={darkMode ? "dark" : "light"} style={navbarStyle(darkMode, scrolled)}>
      <Container fluid>
        {/* Welcome message and profile icon for small devices */}
        <div className="d-flex d-lg-none ms-auto align-items-center">
          <span style={welcomeStyle(darkMode)} className="me-3">
            Welcome, {user.username}
          </span>
          
          <Dropdown align="end" show={dropdownOpen} onToggle={toggleDropdown} autoClose="outside">
            <Dropdown.Toggle as={Button} variant="link" className="p-0 border-0 d-flex align-items-center">
              <FiUser size={20} color={darkMode ? "#fff" : "#000"} />
            </Dropdown.Toggle>
            
            <Dropdown.Menu align="end" style={dropdownStyle(darkMode)}>
              <div style={{ textAlign: "center", padding: "8px 12px" }}>
                <strong>{user.username}</strong>
                <div style={{ fontSize: "0.75rem", color: darkMode ? "#ccc" : "#333" }}>{user.email}</div>
              </div>

              <div style={separatorStyle(darkMode)}></div>

              <Dropdown.Item onClick={toggleTheme} style={dropdownItemStyle(darkMode)}>
                {darkMode ? (
                  <BsSun size={16} style={{ marginRight: "8px" }} />
                ) : (
                  <BsMoon size={16} style={{ marginRight: "8px" }} />
                )}
                Switch to {darkMode ? "Light" : "Dark"} Mode
              </Dropdown.Item>

              <Dropdown.Item onClick={() => navigate(`/user-profile/${user.id}`)} style={dropdownItemStyle(darkMode)}>
                <FiUser size={16} style={{ marginRight: "8px" }} />
                Change Password
              </Dropdown.Item>

              <Dropdown.Item onClick={handleLogout} style={dropdownItemStyle(darkMode)}>
                <FiLogOut size={16} style={{ marginRight: "8px" }} />
                Logout
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>

        {/* Original navbar content for desktop */}
        <Navbar.Collapse id="navbar-nav">
          <Nav className="ms-auto d-flex align-items-center gap-3">
            <span className="d-none d-lg-block" style={welcomeStyle(darkMode)}>
              Welcome, {user.username}
            </span>

            {/* Other icons visible on desktop only */}
            <Button variant="link" onClick={toggleTheme} className="p-0 border-0 d-none d-lg-block" style={{ fontSize: "20px" }}>
              {darkMode ? <BsSun size={20} color="#ffc107" /> : <BsMoon size={20} color="#000" />}
            </Button>

            <Button variant="link" onClick={toggleFullscreen} className="p-0 border-0 d-none d-lg-block" style={{ fontSize: "20px" }}>
              <AiOutlineScan size={22} color={darkMode ? "#fff" : "#000"} />
            </Button>

            {/* Profile icon aligned after AiOutlineScan for desktop */}
            <div className="d-none d-lg-block">
              <Dropdown align="end" show={dropdownOpen} onToggle={toggleDropdown} autoClose="outside">
                <Dropdown.Toggle as={Button} variant="link" className="p-0 border-0 d-flex align-items-center" onClick={toggleDropdown}>
                  <FiUser size={20} color={darkMode ? "#fff" : "#000"} />
                </Dropdown.Toggle>

                <Dropdown.Menu align="end" style={dropdownStyle(darkMode)}>
                  <div style={{ textAlign: "center", padding: "8px 12px" }}>
                    <strong>{user.username}</strong>
                    <div style={{ fontSize: "0.75rem", color: darkMode ? "#ccc" : "#333" }}>{user.email}</div>
                  </div>

                  <div style={separatorStyle(darkMode)}></div>

                  <Dropdown.Item onClick={toggleTheme} style={dropdownItemStyle(darkMode)}>
                    {darkMode ? (
                      <BsSun size={16} style={{ marginRight: "8px" }} />
                    ) : (
                      <BsMoon size={16} style={{ marginRight: "8px" }} />
                    )}
                    Switch to {darkMode ? "Light" : "Dark"} Mode
                  </Dropdown.Item>

                  <Dropdown.Item onClick={() => navigate(`/user-profile/${user.id}`)} style={dropdownItemStyle(darkMode)}>
                    <FiUser size={16} style={{ marginRight: "8px" }} />
                    Change Password
                  </Dropdown.Item>

                  <Dropdown.Item onClick={handleLogout} style={dropdownItemStyle(darkMode)}>
                    <FiLogOut size={16} style={{ marginRight: "8px" }} />
                    Logout
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

// Styles (unchanged)
const navbarStyle = (darkMode, scrolled) => ({
  height: "60px",
  transition: "all 0.3s ease",
  boxShadow: darkMode
    ? "0px 3px 6px rgba(255, 255, 255, 0.2), inset 0px -2px 2px rgba(255, 255, 255, 0.2)"
    : "0px 3px 6px rgba(0, 0, 0, 0.1), inset 0px -2px 2px rgba(0, 0, 0, 0.2)",
  borderBottom: "3px solid #ccc",
  backgroundColor: scrolled ? (darkMode ? "#343a40" : "#f8f9fa") : "transparent",
  position: scrolled ? "fixed" : "relative",
  top: 0,
  width: "100%",
  zIndex: 1000,
});

const welcomeStyle = (darkMode) => ({
  color: darkMode ? "#fff" : "#000",
  fontWeight: "bold",
  fontSize: "0.875rem",
});

const dropdownStyle = (darkMode) => ({
  backgroundColor: darkMode ? "#343a40" : "#fff",
  color: darkMode ? "#fff" : "#000",
  width: "200px",
  padding: "8px 0",
  border: darkMode ? "1px solid #555" : "1px solid #ddd",
});

const separatorStyle = (darkMode) => ({
  borderTop: "1px solid",
  borderColor: darkMode ? "#555" : "#ccc",
  margin: "8px 0",
});

const dropdownItemStyle = (darkMode) => ({
  backgroundColor: darkMode ? "#343a40" : "#fff",
  color: darkMode ? "#fff" : "#000",
  padding: "6px 12px",
  fontSize: "0.875rem",
  cursor: "pointer",
  transition: "background-color 0.3s ease, color 0.3s ease",
});

export default NavbarComp;