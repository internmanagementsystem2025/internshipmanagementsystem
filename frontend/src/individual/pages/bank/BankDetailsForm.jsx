import React from "react";
import { FaUniversity } from "react-icons/fa";

const BankDetailsForm = ({ 
  bankData, 
  handleInputChange, 
  handleSubmit, 
  readOnly, 
  darkMode, 
  loading, 
  buttonText = "Submit Bank Details" 
}) => {
  
  // Format account number for display (add spaces every 4 digits)
  const formatAccountNumber = (value) => {
    if (!value) return "";
    const cleaned = value.replace(/\D/g, '');
    return cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  // Improved NIC validation and formatting
  const validateAndFormatNIC = (value) => {
    if (!value) return { isValid: false, formatted: "", error: "" };
    
    const cleaned = value.replace(/\s+/g, '').toUpperCase();
    
    // Old format: 9 digits + V/X
    if (/^\d{9}[VX]$/.test(cleaned)) {
      return { 
        isValid: true, 
        formatted: cleaned.replace(/(\d{9})([VX])/, '$1$2'),
        error: ""
      };
    }
    
    // New format: 12 digits
    if (/^\d{12}$/.test(cleaned)) {
      return { 
        isValid: true, 
        formatted: cleaned,
        error: ""
      };
    }
    
    // Partial input - still typing
    if (/^\d{1,9}$/.test(cleaned)) {
      return { 
        isValid: false, 
        formatted: cleaned,
        error: cleaned.length < 9 ? "Enter at least 9 digits" : "Add V/X or continue with new format"
      };
    }
    
    if (/^\d{9}$/.test(cleaned)) {
      return { 
        isValid: false, 
        formatted: cleaned,
        error: "Add V or X for old format, or continue typing for new format"
      };
    }
    
    if (/^\d{10,11}$/.test(cleaned)) {
      return { 
        isValid: false, 
        formatted: cleaned,
        error: "Add one more digit for new format (12 digits total)"
      };
    }
    
    // Invalid format
    return { 
      isValid: false, 
      formatted: cleaned,
      error: "Invalid NIC format. Use 9 digits + V/X or 12 digits"
    };
  };

  // Enhanced input change handler
  const enhancedHandleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "accountNumber") {
      // Remove all non-digits and limit to 16 characters
      const cleaned = value.replace(/\D/g, '').slice(0, 16);
      
      // Update the input field display
      e.target.value = formatAccountNumber(cleaned);
      
      // Pass the raw number to parent component
      handleInputChange({
        target: {
          name,
          value: cleaned
        }
      });
      return;
    }

    if (name === "nic") {
      let cleaned = value.replace(/\s+/g, '').toUpperCase();
      
      // Prevent invalid characters
      cleaned = cleaned.replace(/[^0-9VX]/g, '');
      
      // Handle different input scenarios
      if (/^\d+$/.test(cleaned)) {
        // All digits - could be new format (12) or old format start (9)
        cleaned = cleaned.slice(0, 12);
      } else if (/^\d+[VX]$/.test(cleaned)) {
        // Digits + V/X - old format
        const digits = cleaned.replace(/[VX]/g, '');
        const letter = cleaned.slice(-1);
        
        if (digits.length <= 9) {
          cleaned = digits + letter;
        } else {
          // Too many digits for old format, keep only 9 + letter
          cleaned = digits.slice(0, 9) + letter;
        }
      } else if (/^\d+[VX]/.test(cleaned)) {
        // Multiple V/X letters, keep only the first valid one
        const match = cleaned.match(/^(\d{1,9})([VX])/);
        if (match) {
          cleaned = match[1] + match[2];
        }
      }
      
      // Update input field
      e.target.value = cleaned;
      
      // Pass to parent
      handleInputChange({
        target: {
          name,
          value: cleaned
        }
      });
      return;
    }

    if (name === "internId") {
      // Allow alphanumeric, hyphens, underscores, and periods
      // Remove spaces and other special characters
      const cleaned = value.replace(/[^a-zA-Z0-9\-_\.]/g, '').slice(0, 50);
      
      e.target.value = cleaned;
      handleInputChange({
        target: {
          name,
          value: cleaned
        }
      });
      return;
    }

    if (name === "accountHolderName") {
      // Allow letters, spaces, periods, and common name characters
      const cleaned = value.replace(/[^a-zA-Z\s\.\-']/g, '').slice(0, 100);
      
      e.target.value = cleaned;
      handleInputChange({
        target: {
          name,
          value: cleaned
        }
      });
      return;
    }

    if (name === "bankName" || name === "branch") {
      // Allow letters, numbers, spaces, and common bank/branch name characters
      const cleaned = value.replace(/[^a-zA-Z0-9\s\.\-&'()]/g, '').slice(0, 100);
      
      e.target.value = cleaned;
      handleInputChange({
        target: {
          name,
          value: cleaned
        }
      });
      return;
    }

    // For other fields, just pass through
    handleInputChange(e);
  };

  // Get NIC validation info
  const nicValidation = validateAndFormatNIC(bankData.nic || "");

  return (
    <div className={`p-4 rounded mt-4 ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
      {/* Section Header */}
      <div className="d-flex align-items-center gap-2">
        <FaUniversity className={`fs-3 ${darkMode ? "text-white" : "text-dark"}`} />
        <h5 className="mb-0">Bank Details</h5>
      </div>

      <hr className={darkMode ? "border-light mt-3" : "border-dark mt-3"} />

      {/* Bank Details Inputs */}
      <div className="row g-3 mb-3">
        <div className="col-md-6">
          <label className="form-label">NIC Number <span className="text-danger">*</span></label>
          <input
            type="text"
            name="nic"
            className={`form-control ${
              darkMode ? "bg-secondary text-white" : "bg-white text-dark"
            } ${
              bankData.nic && !nicValidation.isValid ? "border-warning" : 
              bankData.nic && nicValidation.isValid ? "border-success" : ""
            }`}
            placeholder="Enter NIC (e.g., 123456789V or 123456789012)"
            value={bankData.nic || ""}
            onChange={enhancedHandleInputChange}
            required
            disabled={readOnly}
          />
          <small className={`form-text ${
            bankData.nic && !nicValidation.isValid ? "text-warning" : "text-muted"
          }`}>
            {bankData.nic && nicValidation.error ? 
              nicValidation.error : 
              "Enter old format (9 digits + V/X) or new format (12 digits)"
            }
          </small>
        </div>

        <div className="col-md-6">
          <label className="form-label">Intern ID <span className="text-danger">*</span></label>
          <input
            type="text"
            name="internId"
            className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
            placeholder="Enter Intern ID (e.g., INT001, MOBITEL-2024-001)"
            value={bankData.internId || ""}
            onChange={enhancedHandleInputChange}
            required
            disabled={readOnly}
            maxLength="50"
          />
          <small className="form-text text-muted">
            Letters, numbers, hyphens, underscores, and periods allowed
          </small>
        </div>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-md-6">
          <label className="form-label">Account Holder Name <span className="text-danger">*</span></label>
          <input
            type="text"
            name="accountHolderName"
            className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
            placeholder="Enter full name as per bank records"
            value={bankData.accountHolderName || ""}
            onChange={enhancedHandleInputChange}
            required
            disabled={readOnly}
            maxLength="100"
          />
          <small className="form-text text-muted">
            Enter name exactly as it appears on your bank account
          </small>
        </div>

        <div className="col-md-6">
          <label className="form-label">Bank Name <span className="text-danger">*</span></label>
          <input
            type="text"
            name="bankName"
            className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
            placeholder="Enter bank name (e.g., Commercial Bank)"
            value={bankData.bankName || ""}
            onChange={enhancedHandleInputChange}
            required
            disabled={readOnly}
            maxLength="100"
          />
        </div>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-md-6">
          <label className="form-label">Branch <span className="text-danger">*</span></label>
          <input
            type="text"
            name="branch"
            className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
            placeholder="Enter branch name (e.g., Colombo 03)"
            value={bankData.branch || ""}
            onChange={enhancedHandleInputChange}
            required
            disabled={readOnly}
            maxLength="100"
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Account Number <span className="text-danger">*</span></label>
          <input
            type="text"
            name="accountNumber"
            className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
            placeholder="Enter account number"
            value={formatAccountNumber(bankData.accountNumber || "")}
            onChange={enhancedHandleInputChange}
            required
            disabled={readOnly}
            maxLength="19" // 16 digits + 3 spaces
          />
          <small className="form-text text-muted">
            Account number should be 8-16 digits (automatically formatted)
          </small>
        </div>
      </div>

      {!readOnly && (
        <button 
          type="submit" 
          className={`btn w-100 mt-3 ${darkMode ? "btn-primary" : "btn-success"}`} 
          onClick={handleSubmit} 
          disabled={loading}
        >
          {loading ? "Processing..." : buttonText}
        </button>
      )}
    </div>
  );
};

export default BankDetailsForm;