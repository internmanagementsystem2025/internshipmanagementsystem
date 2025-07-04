const CV = require("../models/CV");
const Station = require("../models/Station");
const mongoose = require("mongoose");

// Get all rotational CVs
const getAllRotationalCVs = async (req, res) => {
  try {
    const rotationalCVs = await CV.find({
      "rotationalAssignment.isRotational": true,
      userType: "institute",
    }).populate({
      path: "rotationalAssignment.assignedStations.station",
      select: "stationName timePeriod",
    });

    res.status(200).json(rotationalCVs);
  } catch (error) {
    console.error("Error fetching all rotational CVs:", error);
    res.status(500).json({ error: "Failed to fetch rotational CVs" });
  }
};

// Get pending rotational CVs (never assigned before)
const getPendingRotationalCVs = async (req, res) => {
  try {
    const pendingCVs = await CV.find({
      "rotationalAssignment.isRotational": true,
      "rotationalAssignment.assignedStations": { $size: 0 },
    });

    res.status(200).json(pendingCVs);
  } catch (error) {
    console.error("Error fetching pending rotational CVs:", error);
    res.status(500).json({ error: "Failed to fetch pending CVs" });
  }
};

// GetUnassignedRotationalCVs to get CVs not currently assigned
const getUnassignedRotationalCVs = async (req, res) => {
  try {
    const currentDate = new Date();
    const unassignedCVs = await CV.find({
      "rotationalAssignment.isRotational": true,
      $or: [
        { "rotationalAssignment.assignedStations": { $size: 0 } },
        {
          "rotationalAssignment.assignedStations": {
            $not: {
              $elemMatch: {
                isCurrent: true,
                startDate: { $lte: currentDate },
                endDate: { $gte: currentDate },
              },
            },
          },
        },
      ],
    }).populate({
      path: "rotationalAssignment.assignedStations.station",
      select: "stationName",
    });

    res.status(200).json(unassignedCVs);
  } catch (error) {
    console.error("Error fetching unassigned rotational CVs:", error);
    res.status(500).json({ error: "Failed to fetch unassigned CVs" });
  }
};

// getAssignedCVs to get currently assigned rotational CVs
const getAssignedCVs = async (req, res) => {
  try {
    const assignedCVs = await CV.find({
      "rotationalAssignment.isRotational": true,
      "rotationalAssignment.assignedStations": {
        $elemMatch: {
          isCurrent: true,
        },
      },
    })
      .populate({
        path: "rotationalAssignment.assignedStations.station",
        select: "stationName timePeriod",
      })
      .lean(); // Add lean() for better performance

    res.status(200).json(assignedCVs);
  } catch (error) {
    console.error("Error fetching assigned CVs:", error);
    res.status(500).json({ error: "Failed to fetch assigned CVs" });
  }
};

// Assign CVs to multiple stations
const assignCVsToMultipleStations = async (req, res) => {
  const { cvIds, stations } = req.body;

  try {
    // Validate input
    if (!cvIds || !Array.isArray(cvIds)) {
      return res.status(400).json({ error: "CV IDs must be provided as an array" });
    }
    if (!stations || !Array.isArray(stations)) {
      return res.status(400).json({ error: "Stations must be provided as an array" });
    }

    const errors = [];
    const successfulAssignments = [];

    for (const cvId of cvIds) {
      try {
        const cv = await CV.findById(cvId);
        if (!cv) {
          errors.push(`CV with ID ${cvId} not found`);
          continue;
        }

        // Initialize rotationalAssignment if it doesn't exist
        if (!cv.rotationalAssignment) {
          cv.rotationalAssignment = {
            isRotational: true,
            status: 'station-not-assigned',
            assignedStations: [],
            internshipDuration: 24
          };
        }

        // Mark existing assignments as not current
        if (cv.rotationalAssignment.assignedStations.length > 0) {
          cv.rotationalAssignment.assignedStations.forEach(assignment => {
            assignment.isCurrent = false;
          });
        }

        // Add new stations
        for (const stationData of stations) {
          const { stationId, startDate, endDate } = stationData;

          // Validate station data
          const start = new Date(startDate);
          const end = new Date(endDate);
          if (!stationId || isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
            errors.push(`Invalid station data for CV ${cvId}`);
            continue;
          }

          // Check if the station exists
          const station = await Station.findById(stationId);
          if (!station) {
            errors.push(`Station with ID ${stationId} not found`);
            continue;
          }

          // Add CV to station's currentStudents if not already present
          if (!station.currentStudents.includes(cvId)) {
            station.currentStudents.push(cvId);
            await station.save();
          }

          // Add new assignment
          cv.rotationalAssignment.assignedStations.push({
            station: stationId,
            startDate: start,
            endDate: end,
            serviceTimePeriod: Math.ceil((end - start) / (1000 * 60 * 60 * 24)),
            isCurrent: true,
          });
        }

        // Update rotational status
        cv.rotationalAssignment.isRotational = true;
        cv.rotationalAssignment.status = 'station-assigned';

        // Update CV's currentStatus if needed
        if (cv.currentStatus === 'cv-approved' || cv.currentStatus === 'interview-passed') {
          cv.currentStatus = 'schema-assigned';
        }

        await cv.save();
        successfulAssignments.push(cvId);

        console.log('Updated CV Status:', {
          cvId,
          rotationalStatus: cv.rotationalAssignment.status,
          currentStatus: cv.currentStatus,
          assignedStations: cv.rotationalAssignment.assignedStations.length
        });

      } catch (err) {
        errors.push(`Error processing CV ${cvId}: ${err.message}`);
      }
    }

    if (errors.length > 0) {
      return res.status(207).json({
        message: "Some assignments completed with errors",
        successfulAssignments,
        errors,
        totalAttempted: cvIds.length,
        successCount: successfulAssignments.length,
        errorCount: errors.length,
      });
    }

    res.status(200).json({
      message: "All CVs assigned to stations successfully",
      successfulAssignments,
      total: cvIds.length,
    });
  } catch (error) {
    console.error("Error in assignCVsToMultipleStations:", error);
    res.status(500).json({ error: "Internal server error" });
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
     // Validate input
    if (!cvIds || !Array.isArray(cvIds)) {
      return res.status(400).json({ error: "CV IDs must be provided as an array" });
    }

    // Query to find CVs with assigned stations
    const assignedCVs = await CV.find({
      _id: { $in: cvIds },
      "rotationalAssignment.assignedStations.station": { $exists: true },
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
        // Get current assignments
        const currentCVs = await CV.find({
          "rotationalAssignment.assignedStations": {
            $elemMatch: {
              station: station._id,
              isCurrent: true,
            },
          },
        });

        // Get CVs ending this week
        const now = new Date();
        const oneWeekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        const endingCVs = await CV.find({
          "rotationalAssignment.assignedStations": {
            $elemMatch: {
              station: station._id,
              isCurrent: true,
              endDate: {
                $gte: now,
                $lte: oneWeekLater,
              },
            },
          },
        }).select("_id refNo fullName rotationalAssignment.assignedStations.$");

        return {
          stationId: station._id.toString(),
          stationName: station.stationName,
          assignedCVs: currentCVs.length,
          availableSeats: Math.max(0, station.maxStudents - currentCVs.length),
          maxStudents: station.maxStudents,
          utilizationPercentage:
            station.maxStudents > 0
              ? Math.round((currentCVs.length / station.maxStudents) * 100)
              : 0,
          cvsEndingThisWeek: endingCVs.map((cv) => ({
            _id: cv._id,
            refNo: cv.refNo,
            fullName: cv.fullName,
            endDate: cv.rotationalAssignment.assignedStations[0].endDate,
          })),
        };
      })
    );

    res.status(200).json(analytics);
  } catch (error) {
    console.error("Error fetching station analytics:", error);
    res.status(500).json({
      error: "Failed to fetch analytics data",
      details: error.message,
    });
  }
};

// Fetch CV assignment history
const getCVAssignmentHistory = async (req, res) => {
  try {
    const { cvId } = req.params;

    const cv = await CV.findById(cvId).populate({
      path: "rotationalAssignment.assignedStations.station",
      select: "stationName timePeriod",
      options: { strictPopulate: false }, // Add this to prevent errors
    });

    if (!cv) {
      return res.status(404).json({ error: "CV not found" });
    }

    // Get all assignments and sort by start date (newest first)
    const assignments = cv.rotationalAssignment?.assignedStations || [];
    const assignmentHistory = [...assignments].sort(
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

    // Find the CV with rotational assignment data
    const cv = await CV.findById(cvId);
    if (!cv) {
      return res.status(404).json({ error: "CV not found" });
    }

    // Verify rotational assignment exists
    if (!cv.rotationalAssignment) {
      return res
        .status(400)
        .json({ error: "CV is not part of rotational program" });
    }

    // Find the station
    const station = await Station.findById(newStationId);
    if (!station) {
      return res.status(404).json({ error: "Station not found" });
    }

    // Calculate new assignment duration in days
    const startDate = new Date(newStartDate);
    const endDate = new Date(newEndDate);
    const newAssignmentDays = Math.ceil(
      (endDate - startDate) / (1000 * 60 * 60 * 24) + 1 // Include both dates
    );

    // Mark current assignment as not current (if exists)
    if (cv.rotationalAssignment.assignedStations.length > 0) {
      const currentAssignments =
        cv.rotationalAssignment.assignedStations.filter((as) => as.isCurrent);

      for (const assignment of currentAssignments) {
        assignment.isCurrent = false;
        // Update end date to today if it's in the future
        if (new Date(assignment.endDate) > new Date()) {
          assignment.endDate = new Date();
        }
      }
    }

    // Add the new assignment
    cv.rotationalAssignment.assignedStations.push({
      station: newStationId,
      startDate: startDate,
      endDate: endDate,
      serviceTimePeriod: newAssignmentDays,
      isCurrent: true,
    });

    // Update rotational status
    cv.rotationalAssignment.status = "station-assigned";

    // Save the updated CV
    await cv.save();

    // Update station assignments
    await Station.findByIdAndUpdate(newStationId, {
      $addToSet: { currentStudents: cvId },
    });

    // Remove from previous stations
    const previousStations = cv.rotationalAssignment.assignedStations
      .filter((as) => !as.isCurrent)
      .map((as) => as.station);

    await Station.updateMany(
      { _id: { $in: previousStations } },
      { $pull: { currentStudents: cvId } }
    );

    res.status(200).json({
      message: "CV reassigned successfully",
      cv: await CV.findById(cvId).populate({
        path: "rotationalAssignment.assignedStations.station",
        select: "stationName",
      }),
    });
  } catch (error) {
    console.error("Error reassigning CV:", error);
    res.status(500).json({
      error: "Failed to reassign CV",
      details: error.message,
    });
  }
};

// Remove CV from current station (without assigning to new one)
const removeFromStation = async (req, res) => {
  const { cvId } = req.params;
  const { endDate } = req.body;

  try {
    const cv = await CV.findById(cvId);
    if (!cv) {
      return res.status(404).json({ error: "CV not found" });
    }

    // Find current assignment
    const currentAssignmentIndex = cv.rotationalAssignment.assignedStations.findIndex(
      (as) => as.isCurrent
    );

    if (currentAssignmentIndex === -1) {
      return res.status(400).json({ error: "CV has no current station assignment" });
    }

    // Get the current station ID
    const stationId = cv.rotationalAssignment.assignedStations[currentAssignmentIndex].station;

    // Update station's currentStudents array
    await Station.findByIdAndUpdate(stationId, {
      $pull: { currentStudents: cvId }
    });

    // Update CV assignment
    cv.rotationalAssignment.assignedStations[currentAssignmentIndex].isCurrent = false;
    cv.rotationalAssignment.assignedStations[currentAssignmentIndex].endDate = 
      endDate ? new Date(endDate) : new Date();
    cv.rotationalAssignment.status = "station-not-assigned";

    await cv.save();

    res.status(200).json({
      message: "CV removed from station successfully",
      cvId: cv._id,
      stationId,
      newStatus: cv.rotationalAssignment.status
    });
  } catch (error) {
    console.error("Error removing CV from station:", error);
    res.status(500).json({
      error: "Failed to remove CV from station",
      details: error.message
    });
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
    const station = await Station.findById(stationObjectId);
    if (!station) {
      return res.status(404).json({ error: "Station not found" });
    }

    // Get all CVs with current assignments to this station
    const cvs = await CV.find({
      'rotationalAssignment.assignedStations': {
        $elemMatch: {
          station: stationObjectId,
          isCurrent: true
        }
      }
    }).select({
      _id: 1,
      nic: 1,
      fullName: 1,
      selectedRole: 1,
      'rotationalAssignment.assignedStations.$': 1
    });

    // Transform the results
    const transformedCVs = cvs.map(cv => {
      const assignment = cv.rotationalAssignment.assignedStations[0];
      return {
        _id: cv._id,
        nic: cv.nic,
        fullName: cv.fullName,
        selectedRole: cv.selectedRole,
        startDate: assignment.startDate,
        endDate: assignment.endDate,
        stationName: station.stationName,
        remainingDays: Math.ceil(
          (new Date(assignment.endDate) - new Date()) / (1000 * 60 * 60 * 24)
        )
      };
    });

    if (transformedCVs.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No currently assigned CVs found for this station",
        data: []
      });
    }

    // Log for debugging
    console.log('Station:', station.stationName);
    console.log('Current Students:', station.currentStudents);
    console.log('Found CVs:', transformedCVs.length);

    res.status(200).json({
      success: true,
      count: transformedCVs.length,
      data: transformedCVs
    });

  } catch (error) {
    console.error("Error in getCVsForStation:", error);
    res.status(500).json({
      success: false,
      error: "Server error while fetching CVs",
      details: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

// Get all available stations
const getAllStations = async (req, res) => {
  try {
    const stations = await Station.find({ activeStatus: true })
      .select('_id stationName displayName maxStudents timePeriod currentStudents')
      .lean();

    // Calculate available seats for each station
    const stationsWithAvailability = stations.map(station => ({
      ...station,
      availableSeats: Math.max(0, station.maxStudents - (station.currentStudents?.length || 0))
    }));

    res.status(200).json({
      success: true,
      count: stationsWithAvailability.length,
      data: stationsWithAvailability
    });
  } catch (error) {
    console.error("Error fetching stations:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch stations",
      details: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

const getStationDetails = async (req, res) => {
  try {
    const { stationId } = req.params;

    if (!mongoose.isValidObjectId(stationId)) {
      return res.status(400).json({ error: "Invalid station ID" });
    }

    // Get station with populated current students
    const station = await Station.findById(stationId)
      .select('_id stationName displayName priority maxStudents timePeriod currentStudents activeStatus')
      .populate({
        path: 'currentStudents',
        select: 'fullName nic selectedRole rotationalAssignment',
        model: 'CV'
      })
      .lean();

    if (!station) {
      return res.status(404).json({ 
        success: false,
        error: "Station not found" 
      });
    }

    // Transform the data
    const stationDetails = {
      ...station,
      availableSeats: Math.max(0, station.maxStudents - (station.currentStudents?.length || 0)),
      utilization: `${Math.round((station.currentStudents?.length || 0) / station.maxStudents * 100)}%`,
      currentAssignments: station.currentStudents.map(cv => {
        const assignment = cv.rotationalAssignment?.assignedStations
          .find(a => a.station.toString() === stationId && a.isCurrent);
        return {
          _id: cv._id,
          fullName: cv.fullName,
          nic: cv.nic,
          role: cv.selectedRole,
          startDate: assignment?.startDate,
          endDate: assignment?.endDate,
          remainingDays: assignment ? Math.ceil(
            (new Date(assignment.endDate) - new Date()) / (1000 * 60 * 60 * 24)
          ) : 0
        };
      })
    };

    res.status(200).json({
      success: true,
      data: stationDetails
    });

  } catch (error) {
    console.error("Error fetching station details:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch station details",
      details: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

module.exports = {
  getAllRotationalCVs,
  getPendingRotationalCVs,
  getUnassignedRotationalCVs,
  getAssignedCVs,
  assignCVsToStation,
  checkAssignedCVs,
  getStationAnalytics,
  getCVAssignmentHistory,
  reassignCVToNewStation,
  removeFromStation,
  getCVsForStation,
  assignCVsToMultipleStations,
  getAllStations,
  getStationDetails
};
