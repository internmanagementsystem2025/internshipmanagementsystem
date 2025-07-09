const express = require("express");
const { 
  getAllStaff, 
  addStaff, 
  getStaffById, 
  getStaffByUserId,
  updateStaff, 
  deleteStaff 
} = require("../controllers/staffController");
const AzureAuthControllers = require("../controllers/azureAuth");
const router = express.Router();

router.get("/", AzureAuthControllers.protect, getAllStaff);

router.post("/",
             AzureAuthControllers.protect, 
             AzureAuthControllers.restrict("staff"),
             addStaff
            );

router.get("/:id",
              AzureAuthControllers.protect,
              AzureAuthControllers.restrict("staff"),
              getStaffById
            );

router.put("/:id",
             AzureAuthControllers.protect,
             AzureAuthControllers.restrict("staff"),
             updateStaff
             );

router.delete("/:id",
              AzureAuthControllers.protect,
              AzureAuthControllers.restrict("staff"), 
              deleteStaff
              );

router.get("/user/:userId", getStaffByUserId);

module.exports = router;