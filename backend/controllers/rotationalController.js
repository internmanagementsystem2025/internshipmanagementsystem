const CV = require("../models/CV");
const Station = require("../models/Station");
const mongoose = require("mongoose");

// Fetch unassigned rotational CVs
const getUnassignedRotationalCVs = async (req, res) => {
  try {
    // Find CVs where isRotational is true and isAssignedStation is false
    const unassignedCVs = await CV.find(
      {
        isRotational: true,
        isAssignedStation: false, // CVs not assigned to any station
      },
      {
        fullName: 1,
        nic: 1,
        refNo: 1,
        selectedRole: 1,
        userType: 1,
        district: 1,
        applicationDate: 1,
        _id: 1, // Include the _id field in the response
      }
    );

    res.status(200).json(unassignedCVs);
  } catch (error) {
    console.error("Error fetching unassigned rotational CVs:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch unassigned rotational CVs" });
  }
};
const getAssignedCVs = async (req, res) => {
  try {
    const assignedCVs = await CV.find({ isAssignedStation: true }).populate({
      path: "assignedStation.station", // Populate the station details
      select: "stationName", // Only fetch the station name
    });

    res.status(200).json(assignedCVs);
  } catch (error) {
    console.error("Error fetching assigned CVs:", error);
    res.status(500).json({ error: "Failed to fetch assigned CVs" });
  }
};

// Assign CVs to a station
const assignCVsToStation = async (req, res) => {
  const { cvIds, stationId, startDate, endDate } = req.body;

  try {
    // Validate input
    if (!cvIds || !Array.isArray(cvIds)) {
      // Fixed: Added missing closing parenthesis
      return res
        .status(400)
        .json({ error: "CV IDs must be provided as an array" });
    }
    if (!stationId) {
      return res.status(400).json({ error: "Station ID is required" });
    }
    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ error: "Both start date and end date are required" });
    }

    // Check dates are valid
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()))
      return res.status(400).json({ error: "Invalid start date" }); // Fixed: Added missing closing parenthesis
    if (isNaN(end.getTime()))
      return res.status(400).json({ error: "Invalid end date" });
    if (start >= end)
      return res
        .status(400)
        .json({ error: "End date must be after start date" });

    // Check if the station exists
    const station = await Station.findById(stationId);
    if (!station) {
      return res.status(404).json({ error: "Station not found" });
    }

    // Process each CV
    const errors = [];
    const successfulAssignments = [];

    for (const cvId of cvIds) {
      try {
        const cv = await CV.findById(cvId);
        if (!cv) {
          errors.push(`CV with ID ${cvId} not found`);
          continue;
        }

        // Check if already assigned to this station in the same period
        const existingAssignment =
          cv.rotationalAssignment.assignedStations.find(
            (as) =>
              as.station.equals(stationId) &&
              ((start >= as.startDate && start <= as.endDate) ||
                (end >= as.startDate && end <= as.endDate))
          );

        if (existingAssignment) {
          errors.push(
            `CV ${cvId} is already assigned to this station for overlapping dates`
          );
          continue;
        }

        // Calculate total assigned weeks
        const totalAssignedWeeks =
          cv.rotationalAssignment.assignedStations.reduce((total, as) => {
            const weeks =
              (new Date(as.endDate) - new Date(as.startDate)) /
              (1000 * 60 * 60 * 24 * 7);
            return total + weeks;
          }, 0);

        const newAssignmentWeeks = (end - start) / (1000 * 60 * 60 * 24 * 7);
        const remainingWeeks =
          cv.rotationalAssignment.internshipDuration - totalAssignedWeeks;

        if (newAssignmentWeeks > remainingWeeks) {
          errors.push(
            `CV ${cvId} exceeds available internship duration (${remainingWeeks} weeks remaining)`
          );
          continue;
        }

        // Add new assignment
        cv.rotationalAssignment.assignedStations.push({
          station: stationId,
          startDate: start,
          endDate: end,
          serviceTimePeriod: Math.ceil((end - start) / (1000 * 60 * 60 * 24)), // days
          isCurrent: true,
        });

        cv.rotationalAssignment.isRotational = true;
        await cv.save();
        successfulAssignments.push(cvId);
      } catch (err) {
        errors.push(`Error processing CV ${cvId}: ${err.message}`);
      }
    }

    if (errors.length > 0) {
      return res.status(207).json({
        // 207 Multi-Status
        message: "Some assignments completed with errors",
        successfulAssignments,
        errors,
        totalAttempted: cvIds.length,
        successCount: successfulAssignments.length,
        errorCount: errors.length,
      });
    }

    res.status(200).json({
      message: "All CVs assigned to station successfully",
      successfulAssignments,
      total: cvIds.length,
    });
  } catch (error) {
    console.error("Error in assignCVsToStation:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// check if CV is already assigned
const checkAssignedCVs = async (req, res) => {
  try {
    const { cvIds } = req.query;
    const assignedCVs = await CV.find({
      _id: { $in: cvIds },
      "assignedStation.station": { $exists: true },
    });
    res.status(200).json(assignedCVs);
  } catch (error) {
    console.error("Error checking assigned CVs:", error);
    res.status(500).json({ error: "Failed to check assigned CVs" });
  }
};

// Fetch analytics data for each active station
const getStationAnalytics = async (req, res) => {
  try {
    const stations = await Station.find();
    const analytics = await Promise.all(
      stations.map(async (station) => {
        // Safely handle cases where assignedStations might be undefined
        const cvs = await CV.find({
          "rotationalAssignment.assignedStations": {
            $elemMatch: { station: station._id },
          },
        });

        const currentCVs = cvs.filter((cv) => {
          const assignments = cv.rotationalAssignment?.assignedStations || [];
          return assignments.some(
            (as) => as.station.equals(station._id) && as.isCurrent === true
          );
        });

        const pastCVs = cvs.filter((cv) => {
          const assignments = cv.rotationalAssignment?.assignedStations || [];
          return assignments.some(
            (as) => as.station.equals(station._id) && as.isCurrent === false
          );
        });

        return {
          stationId: station._id,
          stationName: station.stationName,
          totalAssigned: cvs.length,
          currentAssignments: currentCVs.length,
          pastAssignments: pastCVs.length,
          capacity: station.maxStudents || 0,
          utilization: station.maxStudents
            ? Math.round((currentCVs.length / station.maxStudents) * 100)
            : 0,
        };
      })
    );

    res.status(200).json(analytics);
  } catch (error) {
    console.error("Error fetching station analytics:", error);
    res.status(500).json({ error: "Failed to fetch analytics data" });
  }
};

// Fetch CV assignment history
const getCVAssignmentHistory = async (req, res) => {
  try {
    const { cvId } = req.params;

    const cv = await CV.findById(cvId).populate({
      path: "assignedStation.station",
      select: "stationName timePeriod",
    });

    if (!cv) {
      return res.status(404).json({ error: "CV not found" });
    }

    // Sort by start date in descending order (most recent first)
    const assignmentHistory = [...cv.assignedStation].sort(
      (a, b) => new Date(b.startDate) - new Date(a.startDate)
    );

    res.status(200).json(assignmentHistory);
  } catch (error) {
    console.error("Error fetching CV assignment history:", error);
    res.status(500).json({ error: "Failed to fetch assignment history" });
  }
};

// Remove CV from current station and assign to new station
const reassignCVToNewStation = async (req, res) => {
  const { cvId, newStationId, newStartDate, newEndDate } = req.body;

  try {
    // Validate input
    if (!cvId || !newStationId || !newStartDate || !newEndDate) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Find the CV
    const cv = await CV.findById(cvId);
    if (!cv) {
      return res.status(404).json({ error: "CV not found" });
    }

    // Find the station
    const station = await Station.findById(newStationId);
    if (!station) {
      return res.status(404).json({ error: "Station not found" });
    }

    // Calculate new assignment duration in weeks
    const startDate = new Date(newStartDate);
    const endDate = new Date(newEndDate);
    const newAssignmentDays = Math.ceil(
      (endDate - startDate) / (1000 * 60 * 60 * 24)
    );
    const newAssignmentWeeks = newAssignmentDays / 7;

    // Get current assignment (if any)
    let currentAssignment = null;
    if (cv.assignedStation.length > 0) {
      currentAssignment = cv.assignedStation[cv.assignedStation.length - 1];

      // If current assignment is not ended, end it now
      if (new Date(currentAssignment.endDate) > new Date()) {
        currentAssignment.endDate = new Date();

        // Calculate actual service time in days
        const actualServiceDays = Math.ceil(
          (new Date() - new Date(currentAssignment.startDate)) /
            (1000 * 60 * 60 * 24)
        );
        currentAssignment.serviceTimePeriod = actualServiceDays;
      }
    }

    // Calculate total weeks already assigned
    const totalAssignedDays = cv.assignedStation.reduce((total, assignment) => {
      // Skip the current assignment in calculation if it exists and was updated
      if (
        currentAssignment &&
        assignment.station.toString() ===
          currentAssignment.station.toString() &&
        assignment.startDate.toString() ===
          currentAssignment.startDate.toString()
      ) {
        return total + (assignment.serviceTimePeriod || 0);
      }

      const start = new Date(assignment.startDate);
      const end = new Date(assignment.endDate);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      return total + days;
    }, 0);

    const totalAssignedWeeks = totalAssignedDays / 7;

    // Convert internship duration from months to weeks (1 month = 4 weeks)
    const internshipDurationWeeks = cv.internshipDuration;

    // Check if new assignment exceeds internship duration
    if (totalAssignedWeeks + newAssignmentWeeks > internshipDurationWeeks) {
      return res.status(400).json({
        error: "Internship period exceeds the allowed duration",
        details: {
          totalAssignedWeeks,
          newAssignmentWeeks,
          internshipDurationWeeks,
        },
      });
    }

    // Add the new station assignment
    cv.assignedStation.push({
      station: newStationId,
      startDate: startDate,
      endDate: endDate,
      serviceTimePeriod: newAssignmentDays,
    });

    // Ensure CV is marked as assigned
    cv.isAssignedStation = true;

    // Save the updated CV
    await cv.save();

    // Update the station's currentStudents array
    await Station.findByIdAndUpdate(newStationId, {
      $addToSet: { currentStudents: cvId },
    });

    // If there was a previous station, remove CV from its currentStudents
    if (currentAssignment) {
      await Station.findByIdAndUpdate(currentAssignment.station, {
        $pull: { currentStudents: cvId },
      });
    }

    res.status(200).json({
      message: "CV reassigned successfully",
      cv: await CV.findById(cvId).populate({
        path: "assignedStation.station",
        select: "stationName",
      }),
    });
  } catch (error) {
    console.error("Error reassigning CV:", error);
    res.status(500).json({ error: "Failed to reassign CV" });
  }
};

// Remove CV from current station (without assigning to new one)
const removeFromStation = async (req, res) => {
  const { cvId } = req.params;

  try {
    const cv = await CV.findById(cvId);
    if (!cv) {
      return res.status(404).json({ error: "CV not found" });
    }

    // Get current assignment
    if (cv.assignedStation.length === 0) {
      return res
        .status(400)
        .json({ error: "CV is not assigned to any station" });
    }

    const currentAssignment = cv.assignedStation[cv.assignedStation.length - 1];

    // End current assignment
    currentAssignment.endDate = new Date();

    // Calculate actual service time in days
    const actualServiceDays = Math.ceil(
      (new Date() - new Date(currentAssignment.startDate)) /
        (1000 * 60 * 60 * 24)
    );
    currentAssignment.serviceTimePeriod = actualServiceDays;

    // Mark CV as unassigned
    cv.isAssignedStation = false;

    // Save the updated CV
    await cv.save();

    // Remove CV from station's currentStudents
    await Station.findByIdAndUpdate(currentAssignment.station, {
      $pull: { currentStudents: cvId },
    });

    res.status(200).json({ message: "CV removed from station successfully" });
  } catch (error) {
    console.error("Error removing CV from station:", error);
    res.status(500).json({ error: "Failed to remove CV from station" });
  }
};

const getCVsForStation = async (req, res) => {
  try {
    const { stationId } = req.params;

    if (!mongoose.isValidObjectId(stationId)) {
      return res.status(400).json({ error: "Invalid station ID" });
    }

    const stationObjectId = new mongoose.Types.ObjectId(stationId);

    // First, verify the station exists
    const station = await mongoose.model("Station").findById(stationObjectId);
    if (!station) {
      return res.status(404).json({ error: "Station not found" });
    }

    // Get all CVs with current assignments to this station
    const cvs = await CV.aggregate([
      // Match CVs that have at least one assignment to this station
      {
        $match: {
          "assignedStation.station": stationObjectId,
        },
      },
      // Unwind the assignments array
      { $unwind: "$assignedStation" },
      // Match only assignments to our specific station
      {
        $match: {
          "assignedStation.station": stationObjectId,
        },
      },
      // Sort by assignment end date (descending) to get latest first
      { $sort: { "assignedStation.endDate": -1 } },
      // Group by CV ID to get the latest assignment for each CV
      {
        $group: {
          _id: "$_id",
          doc: { $first: "$$ROOT" },
          latestAssignment: { $first: "$assignedStation" },
        },
      },
      // Lookup station details
      {
        $lookup: {
          from: "stations",
          localField: "latestAssignment.station",
          foreignField: "_id",
          as: "stationDetails",
        },
      },
      { $unwind: "$stationDetails" },
      // Project the final output
      {
        $project: {
          _id: 1,
          nic: "$doc.nic",
          fullName: "$doc.fullName",
          selectedRole: "$doc.selectedRole",
          startDate: "$latestAssignment.startDate",
          endDate: "$latestAssignment.endDate",
          stationName: "$stationDetails.stationName",
          remainingDays: {
            $ceil: {
              $divide: [
                { $subtract: ["$latestAssignment.endDate", "$$NOW"] },
                1000 * 60 * 60 * 24,
              ],
            },
          },
        },
      },
    ]);

    if (cvs.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No currently assigned CVs found for this station",
        data: [],
      });
    }

    res.status(200).json({
      success: true,
      count: cvs.length,
      data: cvs,
    });
  } catch (error) {
    console.error("Error in getCVsForStation:", error);
    res.status(500).json({
      success: false,
      error: "Server error while fetching CVs",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = {
  getUnassignedRotationalCVs,
  getAssignedCVs,
  assignCVsToStation,
  checkAssignedCVs,
  getStationAnalytics,
  getCVAssignmentHistory,
  reassignCVToNewStation,
  removeFromStation,
  getCVsForStation,
};
