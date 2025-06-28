import React, { useState, useEffect } from "react";
import { FaUniversity } from "react-icons/fa";

const BankDetailsForm = ({ bankData, handleInputChange, handleSubmit, readOnly, darkMode, loading }) => {
  const [nicError, setNicError] = useState("");
  
  // Validate NIC format
  const validateNIC = (nic) => {
    if (!nic) return "NIC is required";
    
    // Remove any whitespace
    const cleanNIC = nic.trim();
    
    // Check for old format (9 digits with optional V/X at end)
    const oldFormat = /^[0-9]{9}[VXvx]?$/;
    // Check for new format (12 digits)
    const newFormat = /^[0-9]{12}$/;
    
    if (oldFormat.test(cleanNIC)) {
      // Validate old format (9 digits + optional letter)
      if (cleanNIC.length === 10 && !/[VXvx]$/.test(cleanNIC)) {
        return "Old NIC format should end with V or X if 10 characters";
      }
      return "";
    } else if (newFormat.test(cleanNIC)) {
      // New format is valid
      return "";
    } else {
      return "Invalid NIC format. Use either 9 digits (with optional V/X) or 12 digits";
    }
   
  };
  

  // Handle NIC change with validation
  const handleNICChange = (e) => {
    const { name, value } = e.target;
    
    // Perform validation
    const error = validateNIC(value);
    setNicError(error);
    
    // Only update the field if there's no error or if the error is being cleared
    if (!error || (nicError && !error)) {
      handleInputChange(e);
    }
  };

  // Format account number with spaces every 4 digits
  const formatAccountNumber = (e) => {
    const { name, value } = e.target;
    // Remove all non-digit characters
    const digitsOnly = value.replace(/\D/g, '');
    
    // Add space every 4 digits
    let formatted = '';
    for (let i = 0; i < digitsOnly.length; i++) {
      if (i > 0 && i % 4 === 0) {
        formatted += ' ';
      }
      formatted += digitsOnly[i];
    }
    
    // Create synthetic event
    const syntheticEvent = {
      target: {
        name,
        value: formatted
      }
    };
    
    handleInputChange(syntheticEvent);
  };

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
            className={`form-control ${nicError ? "is-invalid" : ""} ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
            placeholder="Enter NIC number (e.g., 123456789V or 123456789012)"
            value={bankData.nic || ""}
            onChange={handleNICChange}
            required
            disabled={readOnly}
          />
          {nicError && <div className="invalid-feedback">{nicError}</div>}
          <small className={`form-text ${darkMode ? "text-light" : "text-muted"}`}>
            Format: 123456789V (old) or 123456789012 (new)
          </small>
        </div>

        <div className="col-md-6">
          <label className="form-label">Intern ID <span className="text-danger">*</span></label>
          <input
            type="text"
            name="internId"
            className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
            placeholder="Enter Intern ID"
            value={bankData.internId || ""}
            onChange={handleInputChange}
            required
            disabled={readOnly}
          />
        </div>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-md-6">
          <label className="form-label">Account Holder Name <span className="text-danger">*</span></label>
          <input
            type="text"
            name="accountHolderName"
            className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
            placeholder="Enter account holder name"
            value={bankData.accountHolderName || ""}
            onChange={handleInputChange}
            required
            disabled={readOnly}
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Bank Name <span className="text-danger">*</span></label>
          <input
            type="text"
            name="bankName"
            className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
            placeholder="Enter bank name"
            value={bankData.bankName || ""}
            onChange={handleInputChange}
            required
            disabled={readOnly}
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
            placeholder="Enter branch name"
            value={bankData.branch || ""}
            onChange={handleInputChange}
            required
            disabled={readOnly}
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Account Number <span className="text-danger">*</span></label>
          <input
            type="text"
            name="accountNumber"
            className={`form-control ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`}
            placeholder="XXXX XXXX XXXX XXXX"
            value={bankData.accountNumber || ""}
            onChange={formatAccountNumber}
            required
            disabled={readOnly}
            maxLength="19"
          />
          <small className={`form-text ${darkMode ? "text-light" : "text-muted"}`}>
            Enter 16-digit account number
          </small>
        </div>
      </div>

      {!readOnly && (
        <button 
          type="submit" 
          className={`btn w-100 mt-3 ${darkMode ? "btn-primary" : "btn-success"}`} 
          onClick={handleSubmit} 
          disabled={loading || nicError}
        >
          {loading ? "Submitting..." : "Submit Bank Details"}
        </button>
      )}
    </div>
  );
};

export default BankDetailsForm;