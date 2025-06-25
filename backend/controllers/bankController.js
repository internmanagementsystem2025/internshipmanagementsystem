const BankDetails = require("../models/BankDetails");

// Sri Lankan NIC validation function
const validateSriLankanNIC = (nic) => {
  if (!nic) return false;
  
  // Remove spaces and convert to uppercase
  const cleanNIC = nic.replace(/\s+/g, '').toUpperCase();
  
  // Old format: 9 digits + V (e.g., 123456789V)
  const oldNICRegex = /^[0-9]{9}[VX]$/;
  
  // New format: 12 digits (e.g., 123456789012)
  const newNICRegex = /^[0-9]{12}$/;
  
  if (oldNICRegex.test(cleanNIC)) {
    // Validate old format
    const digits = cleanNIC.substring(0, 9);
    const letter = cleanNIC.substring(9, 10);
    
    // Check if it's a valid date (first 3 digits represent days from January 1st)
    const dayOfYear = parseInt(digits.substring(0, 3));
    const year = parseInt(digits.substring(7, 9));
    
    // Day of year should be between 1-366 (for leap years)
    // For females, 500 is added to the day of year
    const actualDayOfYear = dayOfYear > 500 ? dayOfYear - 500 : dayOfYear;
    
    if (actualDayOfYear < 1 || actualDayOfYear > 366) {
      return false;
    }
    
    return letter === 'V' || letter === 'X';
  } else if (newNICRegex.test(cleanNIC)) {
    // Validate new format
    const year = parseInt(cleanNIC.substring(0, 4));
    const dayOfYear = parseInt(cleanNIC.substring(4, 7));
    
    // Year should be reasonable (e.g., 1900-2030)
    if (year < 1900 || year > 2030) {
      return false;
    }
    
    // Day of year validation (similar to old format)
    const actualDayOfYear = dayOfYear > 500 ? dayOfYear - 500 : dayOfYear;
    
    if (actualDayOfYear < 1 || actualDayOfYear > 366) {
      return false;
    }
    
    return true;
  }
  
  return false;
};

// Add Bank Details (Only if user doesn't have existing bank details)
const addBankDetails = async (req, res) => {
  try {
    const { nic, internId, accountHolderName, bankName, branch, accountNumber } = req.body;

    // Validate Sri Lankan NIC
    if (!validateSriLankanNIC(nic)) {
      return res.status(400).json({ 
        message: "Invalid Sri Lankan NIC format. Please enter a valid NIC (e.g., 123456789V or 123456789012)." 
      });
    }

    // Validate account number (should be 10-16 digits)
    const cleanAccountNumber = accountNumber.replace(/\s+/g, '');
    if (!/^\d{10,16}$/.test(cleanAccountNumber)) {
      return res.status(400).json({ 
        message: "Account number must be between 10-16 digits." 
      });
    }

    // Check if user already has bank details
    const existingUserBankDetails = await BankDetails.findOne({ nic });
    if (existingUserBankDetails) {
      return res.status(400).json({ 
        message: "Bank details already exist for this user. Use update instead.",
        hasExisting: true 
      });
    }

    // Check if Account Number already exists for other users
    const existingAccountNumber = await BankDetails.findOne({ accountNumber: cleanAccountNumber });
    if (existingAccountNumber) {
      return res.status(400).json({ message: "Account Number already exists" });
    }

    const newBankDetails = new BankDetails({ 
      nic: nic.replace(/\s+/g, '').toUpperCase(), 
      internId, 
      accountHolderName, 
      bankName, 
      branch, 
      accountNumber: cleanAccountNumber 
    });
    await newBankDetails.save();

    res.status(201).json({ message: "Bank details added successfully", data: newBankDetails });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get All Bank Details
const getAllBankDetails = async (req, res) => {
  try {
    const bankDetailsList = await BankDetails.find();
    res.status(200).json(bankDetailsList);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get Bank Details by NIC
const getBankDetailsByNIC = async (req, res) => {
  try {
    const nicParam = req.params.nic.replace(/\s+/g, '').toUpperCase();
    const bankDetails = await BankDetails.findOne({ nic: nicParam });
    if (!bankDetails) {
      return res.status(404).json({ message: "Bank details not found", hasExisting: false });
    }
    res.status(200).json({ data: bankDetails, hasExisting: true });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Check if user has existing bank details
const checkExistingBankDetails = async (req, res) => {
  try {
    const nicParam = req.params.nic.replace(/\s+/g, '').toUpperCase();
    const bankDetails = await BankDetails.findOne({ nic: nicParam });
    
    if (bankDetails) {
      // User has existing bank details
      res.status(200).json({ 
        hasExisting: true,
        data: bankDetails
      });
    } else {
      // User doesn't have bank details yet
      res.status(200).json({ 
        hasExisting: false,
        data: null
      });
    }
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getBankDetailsById = async (req, res) => {
  try {
    const bankDetails = await BankDetails.findById(req.params.id);
    if (!bankDetails) {
      return res.status(404).json({ message: "Bank details not found" });
    }
    res.status(200).json(bankDetails);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const updateBankDetailsById = async (req, res) => {
  try {
    const { nic, accountNumber } = req.body;

    // Validate Sri Lankan NIC if provided
    if (nic && !validateSriLankanNIC(nic)) {
      return res.status(400).json({ 
        message: "Invalid Sri Lankan NIC format. Please enter a valid NIC (e.g., 123456789V or 123456789012)." 
      });
    }

    // Validate account number if provided
    if (accountNumber) {
      const cleanAccountNumber = accountNumber.replace(/\s+/g, '');
      if (!/^\d{10,16}$/.test(cleanAccountNumber)) {
        return res.status(400).json({ 
          message: "Account number must be between 10-16 digits." 
        });
      }
      req.body.accountNumber = cleanAccountNumber;
    }

    const updatedBankDetails = await BankDetails.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedBankDetails) {
      return res.status(404).json({ message: "Bank details not found" });
    }
    res.status(200).json({ 
      message: "Bank details updated successfully", 
      data: updatedBankDetails 
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Update Bank Details by NIC (Only allow updates, not creation)
const updateBankDetails = async (req, res) => {
  try {
    const { accountNumber, nic: bodyNIC } = req.body;
    const nic = req.params.nic.replace(/\s+/g, '').toUpperCase();

    // Validate Sri Lankan NIC if provided in body
    if (bodyNIC && !validateSriLankanNIC(bodyNIC)) {
      return res.status(400).json({ 
        message: "Invalid Sri Lankan NIC format. Please enter a valid NIC (e.g., 123456789V or 123456789012)." 
      });
    }

    // Check if account number is being changed and validate it
    if (accountNumber) {
      const cleanAccountNumber = accountNumber.replace(/\s+/g, '');
      
      // Validate account number format
      if (!/^\d{10,16}$/.test(cleanAccountNumber)) {
        return res.status(400).json({ 
          message: "Account number must be between 10-16 digits." 
        });
      }

      // Check if it conflicts with another user
      const existingAccountNumber = await BankDetails.findOne({ 
        accountNumber: cleanAccountNumber, 
        nic: { $ne: nic } 
      });
      if (existingAccountNumber) {
        return res.status(400).json({ message: "Account Number already exists for another user" });
      }

      req.body.accountNumber = cleanAccountNumber;
    }

    const updatedBankDetails = await BankDetails.findOneAndUpdate(
      { nic }, 
      req.body, 
      { new: true }
    );
    
    if (!updatedBankDetails) {
      return res.status(404).json({ message: "Bank details not found" });
    }
    
    res.status(200).json({ 
      message: "Bank details updated successfully", 
      data: updatedBankDetails 
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Delete functions removed for security - users should not be able to delete bank details
// Keep admin functions for administrative purposes only
const deleteBankDetails = async (req, res) => {
  return res.status(403).json({ message: "Delete operation not allowed for users" });
};

const deleteBankDetailsById = async (req, res) => {
  return res.status(403).json({ message: "Delete operation not allowed for users" });
};

module.exports = {
  addBankDetails,
  getAllBankDetails,
  getBankDetailsByNIC,
  checkExistingBankDetails,
  updateBankDetails,
  deleteBankDetails,
  getBankDetailsById,
  updateBankDetailsById,
  deleteBankDetailsById
};