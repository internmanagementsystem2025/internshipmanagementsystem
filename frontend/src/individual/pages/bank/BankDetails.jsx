import React, { useState, useEffect } from "react";
import { Container, Button, Alert, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import logo from "../../../assets/logo.png";
import BankDetailsForm from "../bank/BankDetailsForm";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock } from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";
import Notification from "../../../components/notifications/Notification";

const BankDetails = ({ darkMode }) => {
  const defaultBankData = {
    nic: "",
    internId: "",
    accountHolderName: "",
    bankName: "",
    branch: "",
    accountNumber: "",
  };

  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [bankData, setBankData] = useState(defaultBankData);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    variant: "success"
  });
  const navigate = useNavigate();

  // Authentication Check
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
      }
    } catch (error) {
      console.error("Invalid token:", error);
      setUnauthorized(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle Input Change
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "accountNumber") {
      let numericValue = value.replace(/\D/g, "").slice(0, 16);
      const formattedValue = numericValue.replace(/(\d{4})/g, "$1 ").trim();

      setBankData((prevState) => ({
        ...prevState,
        [name]: formattedValue,
      }));
      return;
    }

    setBankData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formattedData = { ...bankData, accountNumber: bankData.accountNumber.replace(/\s/g, "") };

    try {
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/bankDetails`, formattedData, {
        headers: { "Content-Type": "application/json" },
      });
      console.log("Bank Details Saved:", response.data);
      
      // Show success notification
      setNotification({
        show: true,
        message: "Bank details successfully saved!",
        variant: "success"
      });
      
      // Reset form data
      setBankData(defaultBankData);
      
      setTimeout(() => {
        navigate("/individual-home");
      }, 3000);
      
    } catch (error) {
      console.error("Error Saving Bank Details:", error.response?.data || error.message);
      setNotification({
        show: true,
        message: `Submission Failed: ${error.response?.data?.message || error.message}`,
        variant: "danger"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleCloseNotification = () => {
    setNotification({...notification, show: false});
    
    if (notification.variant === "success") {
      navigate("/individual-home");
    }
  };

  if (isLoading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  if (unauthorized) {
    return (
      <Container className={`mt-5 text-center ${darkMode ? "text-white" : "text-dark"}`}>
        <div>
          <img src={logo} alt="Company Logo" className="mx-auto d-block" style={{ height: "50px" }} />
          <h3 className="mt-2 mb-5">ADD BANK DETAILS</h3>
        </div>
        <div className="mt-5 mb-5">
          <Alert
            variant={darkMode ? "dark" : "light"}
            className={`rounded ${darkMode ? "bg-dark text-white" : "bg-light text-dark border border-secondary"}`}
          >
            <motion.div initial={{ scale: 1 }} whileHover={{ scale: 1.1 }} transition={{ type: "spring", stiffness: 300 }}>
              <FontAwesomeIcon icon={faLock} size="8x" className="mt-3 mb-5" />
            </motion.div>
            <h1 className="mb-3">Access Denied</h1>
            <p style={{ fontSize: "20px" }}>
              You do not have permission to access this page. Please contact the administrator if you believe this is a mistake.
            </p>
            <Button variant="link" onClick={() => navigate("/individual-home")}>
              Return Home
            </Button>
          </Alert>
        </div>
      </Container>
    );
  }

  return (
    <div className={`d-flex flex-column min-vh-100 ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
      {/* Notification Component */}
      <Notification 
        show={notification.show}
        onClose={handleCloseNotification}
        message={notification.message}
        variant={notification.variant}
      />

      {/* Message Banner */}
      <div className={`alert ${darkMode ? "alert-info" : "alert-warning"} text-center`} role="alert">
        This is currently for use only by authorized users and data entry operators who are assigned to SLT Mobitel services.
      </div>

      {/* Header */}
      <div className="text-center mt-4 mb-3">
        <img src={logo} alt="Company Logo" className="mx-auto d-block" style={{ height: "50px" }} />
        <h3 className="mt-3">ADD BANK DETAILS</h3>
      </div>

      {/* Main Content */}
      <main className={`container p-4 rounded shadow ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"} mb-5`}>
        <div className={`p-4 border rounded shadow-sm ${darkMode ? "border-light" : "border-secondary"}`}>
          <h2 className="text-start">Bank Details</h2>
          <p className="text-start">Please fill in your bank details for payment processing.</p>
          <hr />

          {/* Bank Details Form Component */}
          <BankDetailsForm
            bankData={bankData}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            darkMode={darkMode}
            loading={loading}
          />
        </div>
      </main>
    </div>
  );
};

export default BankDetails;