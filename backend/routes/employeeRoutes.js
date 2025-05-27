const express = require("express");
const {
  getAllEmployees,
  getEmployeeById,
  getOrganizationHierarchy,
  updateEmployee
} = require("../controllers/employeeController");

const router = express.Router();

// Organization hierarchy route (most specific first)
router.get("/hierarchy", getOrganizationHierarchy);

// ID-based routes - handles both numeric IDs and ObjectIds
router.get("/:id", getEmployeeById);
router.put("/:id", updateEmployee);

// Main listing route (least specific, should be last)
router.get("/", getAllEmployees);

module.exports = router;