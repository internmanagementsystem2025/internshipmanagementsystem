const express = require("express");
const router = express.Router();
const {
  addBankDetails,
  getAllBankDetails,
  getBankDetailsByNIC,
  checkExistingBankDetails,
  updateBankDetails,
  deleteBankDetails,
  updateBankDetailsById,
  getBankDetailsById,
  deleteBankDetailsById
} = require("../controllers/bankController");

// Routes
router.post("/", addBankDetails);
router.get("/", getAllBankDetails);
router.get("/check/:nic", checkExistingBankDetails); // New route to check existing bank details
router.get("/:nic", getBankDetailsByNIC);
router.put("/:nic", updateBankDetails);
router.delete("/:nic", deleteBankDetails); // Returns 403 error
router.get("/id/:id", getBankDetailsById);
router.put("/id/:id", updateBankDetailsById);
router.delete("/id/:id", deleteBankDetailsById); // Returns 403 error

module.exports = router;