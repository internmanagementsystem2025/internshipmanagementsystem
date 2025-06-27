import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Spinner, Alert, Button } from "react-bootstrap";
import logo from "../../../assets/logo.png";
import PropTypes from "prop-types";
import { FaArrowLeft, FaPrint } from "react-icons/fa";

const ViewCertificateLetter = ({ darkMode }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [letter, setLetter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch letter data from the API
  useEffect(() => {
    const fetchLetter = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/certificate-letters/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch letter details");
        }
        const data = await response.json();
        setLetter(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLetter();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: "80vh" }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          {error}
          <Button variant="link" onClick={() => navigate("/all-certificate-letters")}>
            Return to Certificate Letter List
          </Button>
        </Alert>
      </Container>
    );
  }

  if (!letter) {
    return (
      <Container className="mt-5">
        <Alert variant="warning">Letter data not found.</Alert>
      </Container>
    );
  }

  return (
    <div className={`d-flex flex-column min-vh-100 ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
      <style>
        {`
          /* Common styles for both screen and print */
          .letter-paper {
            position: relative;
            background-color: ${darkMode ? "#2c2c2c" : "#f9f9f9"};
            color: ${darkMode ? "#e4e4e4" : "#000"};
            padding: 40px;
            font-family: 'Times New Roman', Times, serif;
            line-height: 1.5;
            min-height: auto;
            width: 210mm; /* A4 width */
            max-width: 210mm;
            margin: 0 auto;
            box-shadow: ${darkMode ? "0 4px 8px rgba(0, 0, 0, 0.5)" : "0 4px 8px rgba(0, 0, 0, 0.1)"};
            border: ${darkMode ? "1px solid #444" : "none"};
            transition: background-color 0.3s, color 0.3s, box-shadow 0.3s;
          }

          .letter-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 20px;
          }

          .logo-container {
            display: flex;
            align-items: center;
          }

          .company-logo {
            margin-right: 20px;
            height: 60px;
          }

          .company-address {
            text-align: right;
            margin-bottom: 10px;
          }

          .letter-name {
            text-align: center;
            margin: 20px 0;
            width: 100%;
          }

          .date-container {
            text-align: right;
            margin-bottom: 10px;
          }

          .divider {
            border-top: 1px solid ${darkMode ? "#666" : "#000"};
            margin: 15px 0;
          }

          .subject-line {
            margin-bottom: 20px;
            font-weight: bold;
          }
          
          .subject-line strong {
            font-weight: bold;
          }
          
          .signature-block {
            display: flex;
            justify-content: flex-start;
            margin-top: 40px;
            flex-direction: column;
          }
          
          .signature-line {
            border-top: 1px solid ${darkMode ? "#777" : "#999"};
            width: 250px;
            text-align: left;
            padding-top: 5px;
            margin-top: 50px;
          }

          .letter-content {
            white-space: pre-line;
          }

          /* Print-specific styles */
          @media print {
            @page {
              size: A4 portrait;
              margin: 0;
            }
            
            /* Hide all UI elements */
            .no-print, 
            button, 
            .navbar, 
            .footer {
              display: none !important;
            }
            
            body {
              background-color: white !important;
              padding: 0 !important;
              margin: 0 !important;
            }
            
            /* Set the letter to fill the A4 page */
            .letter-paper {
              width: 210mm !important;
              min-height: 297mm !important;
              max-width: none !important;
              padding: 20mm !important;
              margin: 0 !important;
              box-shadow: none !important;
              background-color: white !important;
              color: black !important;
              border: none !important;
              overflow: visible !important;
              page-break-inside: avoid !important;
              page-break-after: always !important;
            }
            
            .letter-content {
              font-family: 'Times New Roman', Times, serif !important;
              font-size: 12pt !important;
            }
            
            /* Reset any dark mode styles for printing */
            .divider {
              border-top-color: #000 !important;
            }

            .signature-line {
              border-top-color: #999 !important;
            }
          }
        `}
      </style>

      {/* Screen-only UI elements */}
      <Container className="text-center mt-4 mb-3 no-print">
        <img 
          src={logo} 
          alt="Company Logo" 
          className="mx-auto d-block" 
          style={{ 
            height: "50px",
            filter: darkMode ? "brightness(1.2) contrast(1.2)" : "none" 
          }} 
        />
        <h3 className="mt-3">VIEW CERTIFICATE LETTER</h3>
      </Container>

      <Container className="mb-3 no-print">
        <div className="d-flex justify-content-start gap-2">
          <Button 
            variant={darkMode ? "outline-light" : "outline-secondary"} 
            onClick={() => navigate("/all-certificate-letters")}
          >
            <FaArrowLeft className="me-2" /> Back to All Certificate Letters
          </Button>
          
          <Button 
            variant={darkMode ? "outline-light" : "outline-primary"} 
            onClick={handlePrint}
          >
            <FaPrint className="me-2" /> Print Certificate Letter
          </Button>
        </div>
      </Container>

      {/* The letter content - this is what will be printed */}
      <Container className="letter-container">
        <div className="letter-paper">
          {/* Header with logo left and address right */}
          <div className="letter-header">
            <div className="logo-container">
              <img 
                src={logo} 
                alt="SLT Logo" 
                className="company-logo"
                style={{ 
                  filter: darkMode ? "brightness(1.2) contrast(1.2)" : "none" 
                }} 
              />
            </div>
            
            <div className="company-address">
              <p style={{ margin: "0" }}>{letter.label1}</p>
              <p style={{ margin: "0" }}>{letter.label2}</p>
              <p style={{ margin: "0" }}>{letter.label3}</p>
            </div>
          </div>

        
          
          {/* Date aligned to the right */}
          <div className="date-container">
            <p>{letter.label4}</p>
          </div>
          

          
         <div className="subject-line">
  <p style={{ textDecoration: "underline" }}>{letter.label5 || "Internship Completion Certificate"}</p>
</div>
          
          <div className="letter-body">
  <div className="letter-paragraph">
    {letter.label6} {letter.label7} {letter.label8}
  </div>
  <div className="letter-paragraph mt-4"> {/* Added margin-top here */}
    {letter.label9} {letter.label10}
  </div>
</div>
          
          <div className="signature-block">
            <div className="signature-line">
              {letter.label11 || "Engineer/Talent Development"}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

ViewCertificateLetter.propTypes = {
  darkMode: PropTypes.bool.isRequired,
};

export default ViewCertificateLetter;