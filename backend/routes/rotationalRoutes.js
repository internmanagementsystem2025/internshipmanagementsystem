const express = require("express");
const router = express.Router();
const {
  getAssignedCVs,
  assignCVsToStation,
  getUnassignedRotationalCVs,
  checkAssignedCVs,
  getStationAnalytics,
  getCVAssignmentHistory,
  reassignCVToNewStation,
  removeFromStation,
  getCVsForStation,
} = require("../controllers/rotationalController");

// Rotational CVs
router.get("/assigned-rotational", getAssignedCVs);
router.post("/assign-to-station", assignCVsToStation);
router.get("/unassigned-rotational", getUnassignedRotationalCVs);
router.get("/check-assigned", checkAssignedCVs);
router.get("/analytics", getStationAnalytics);

router.get("/assignment-history/:cvId", getCVAssignmentHistory);
router.post("/reassign-cv", reassignCVToNewStation);
router.delete("/remove-from-station/:cvId", removeFromStation);
router.get("/station-cvs/:stationId", getCVsForStation);

module.exports = router;
