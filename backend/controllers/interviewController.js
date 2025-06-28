const Interview = require("../models/Interview");
const CV = require("../models/CV");

// Create a new interview
exports.createInterview = async (req, res) => {
  try {
    const interview = new Interview(req.body);
    await interview.save();
    res
      .status(201)
      .json({ message: "Interview created successfully", interview });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to create interview", details: error.message });
  }
};

// Get all interviews
exports.getAllInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find();
    res.status(200).json(interviews);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch interviews", details: error.message });
  }
};

// Get a single interview by ID
exports.getInterviewById = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview)
      return res.status(404).json({ error: "Interview not found" });
    res.status(200).json(interview);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch interview", details: error.message });
  }
};

// Update an interview
exports.updateInterview = async (req, res) => {
  try {
    const interview = await Interview.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!interview)
      return res.status(404).json({ error: "Interview not found" });
    res
      .status(200)
      .json({ message: "Interview updated successfully", interview });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to update interview", details: error.message });
  }
};

// Delete an interview
exports.deleteInterview = async (req, res) => {
  try {
    const interview = await Interview.findByIdAndDelete(req.params.id);
    if (!interview)
      return res.status(404).json({ error: "Interview not found" });
    res.status(200).json({ message: "Interview deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to delete interview", details: error.message });
  }
};

// Get all interns (CVs) assigned to a specific interview
exports.getInternsByInterviewId = async (req, res) => {
  try {
    const { id } = req.params;
    // Find all CVs where any interview.interviews.interviewId matches the given id
    const interns = await CV.find({
      "interview.interviews.interviewId": id,
    }).select(
      "fullName nic emailAddress institute selectedRole currentStatus interview"
    );
    res.status(200).json(interns);
  } catch (error) {
    res
      .status(500)
      .json({
        error: "Failed to fetch interns for this interview",
        details: error.message,
      });
  }
};
