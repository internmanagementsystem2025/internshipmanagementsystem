const express = require("express");
const interviewController = require("../controllers/interviewController");

const router = express.Router();

router.post("/", interviewController.createInterview);
router.get("/", interviewController.getAllInterviews);
router.get("/:id", interviewController.getInterviewById);
router.put("/:id", interviewController.updateInterview);
router.delete("/:id", interviewController.deleteInterview);
// Added this route to get all interns assigned to a specific interview
router.get("/:id/interns", interviewController.getInternsByInterviewId);

module.exports = router;
