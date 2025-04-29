const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const CV = require("../models/CV");
const User = require("../models/User");
const Interview = require("../models/Interview");
const Induction = require("../models/Induction");
const Station = require("../models/Station");
const Intern = require("../models/Intern");
const {
  sendSuccessEmail,
  sendAdminCreatedEmail,
  sendDeclineEmail,
  sendApproveEmail,
  sendInterviewScheduleEmail,
  sendInductionAssignmentEmail,
} = require("../services/cvEmailService");
const upload = require("../config/CVmulterConfig");
const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");
const axios = require("axios");
const multer = require("multer");
//const { downloadAndStoreFile } = require("../utils/downloadAnuStoreFile");
const { storeFile } = require("../utils/downloadAnuStoreFile");
// Helper function to validate NIC format

const validateObjectId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid CV ID format" });
  }
  next();
};
/*const validateNICFormat = (nic) => {
  if (!nic) return false;

  nic = String(nic).trim();

  const oldNicRegex = /^(\d{2})(\d{3})(\d{3})(\d{1})([VvXx])$/;
  const newNicRegex = /^(\d{4})(\d{3})(\d{4})(\d{1})$/;

  if (newNicRegex.test(nic)) {
    const matches = nic.match(newNicRegex);
    if (!matches) return false;

    const year = Number(matches[1]);
    const days = Number(matches[2]);

    if (year < 1900 || year > 2025) return false;
    if (days < 1 || days > 366) return false;

    return true;
  } else if (oldNicRegex.test(nic)) {
    const yearPart = nic.substring(0, 2);
    const dayPart = nic.substring(2, 5);
    const lastChar = nic.slice(-1).toUpperCase();

    const year = parseInt(yearPart, 10);
    const days = parseInt(dayPart, 10);

    if (year < 0 || year > 99) return false;

    if ((days >= 1 && days <= 366) || (days >= 501 && days <= 866)) {
      if (lastChar === "V" || lastChar === "X") {
        return true;
      }
    }
  }

  return false;
};*/

// Create CV
/*const createCV = async (req, res) => {
  try {
 
    const { userId, userType } = req;
    const autoApprove = req.body.autoApprove === "true";
    const createdByAdmin = req.body.createdByAdmin === "true";

    // Basic validation - do this first before any async operations
    if (!req.body.nic) {
      return res.status(400).json({ message: "NIC is required." });
    }

    // Check for duplicate NIC - consider adding index in MongoDB
    const existingCV = await CV.findOne({
      nic: req.body.nic,
      userId,
    })
      .lean()
      .select("_id");

    if (existingCV) {
      return res.status(400).json({
        message: "CV with this NIC already exists for this user.",
      });
    }

    // Prepare CV data - do this before file processing
    const cvData = {
      ...req.body,
      userId,
      userType,
      createdByAdmin,
      currentStatus: autoApprove ? "approved" : "submitted",
      cvApproval: {
        status: autoApprove ? "approved" : "pending",
        approvedBy: autoApprove ? userId : null,
        approvedDate: autoApprove ? new Date() : null,
        notes: autoApprove ? "Auto-approved on creation" : null,
      },
    };

    // Process files in parallel if possible
    const fileProcessing = [];
    const fileFields = [
      "updatedCv",
      "nicFile",
      "policeClearanceReport",
      "internshipRequestLetter",
    ];

    fileFields.forEach((field) => {
      if (req.files?.[field]?.[0]) {
        cvData[field] = req.files[field][0].path;
      }
    });

    // Create CV without waiting for email
    const newCV = await CV.create(cvData);

    // Generate refNo if not set by hook
    if (!newCV.refNo) {
      newCV.refNo = `REF-${newCV._id.toString().slice(-6).toUpperCase()}`;
      await newCV.save();
    }

    // Don't wait for email to send response
    const emailPromise = autoApprove
      ? sendAdminCreatedEmail(newCV.fullName, newCV.emailAddress, newCV.refNo, {
          status: "approved",
        })
      : sendSuccessEmail(newCV.fullName, newCV.emailAddress, newCV.refNo, {
          status: "submitted",
        });

    emailPromise.catch((err) => {
      console.error("Email sending failed:", err);
      // Don't fail the request if email fails
    });

    // Log performance
    console.log(`CV creation took ${Date.now() - startTime}ms`);

    res.status(201).json({
      message: `CV ${autoApprove ? "created and approved" : "submitted"}`,
      cv: {
        _id: newCV._id,
        refNo: newCV.refNo,
        fullName: newCV.fullName,
        nic: newCV.nic,
        selectedRole: newCV.selectedRole,
        currentStatus: newCV.currentStatus,
      },
    });
  } catch (error) {
    console.error("Error creating CV:", error);

    // Handle specific errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => ({
        field: err.path,
        message: err.message,
      }));
      return res.status(400).json({ message: "Validation failed", errors });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        message: "Duplicate key error",
        error: "A CV with this NIC or reference number already exists",
      });
    }

    res.status(500).json({
      message: "Failed to create CV",
      error: error.message,
    });
  }
};
*/

// Create New CV - Admin and Individual
const createCV = async (req, res) => {
  let newUser = null; // Moved outside try block to fix scope issue

  try {
    const { id: userId, userType } = req.user; // Updated to properly get user info from JWT middleware
    const autoApprove = req.body.autoApprove === "true";
    const createdByAdmin = req.body.createdByAdmin === "true";

    // Basic validation
    if (!req.body.nic) {
      return res.status(400).json({ message: "NIC is required." });
    }

    // Check for duplicate NIC
    const existingCV = await CV.findOne({
      nic: req.body.nic,
    })
      .lean()
      .select("_id");

    if (existingCV) {
      return res.status(400).json({
        message: "CV with this NIC already exists.",
      });
    }

    // Generate credentials
    const randomPassword = Math.random().toString(36).slice(-8);
    const username = `${req.body.fullName
      .split(" ")[0]
      .toLowerCase()}${req.body.nic.slice(-4)}`;
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    // Create user account first if created by admin
    if (createdByAdmin) {
      // Check if user already exists with this email or NIC
      const existingUser = await User.findOne({
        $or: [{ email: req.body.emailAddress }, { nic: req.body.nic }],
      });

      if (existingUser) {
        return res.status(400).json({
          message:
            existingUser.email === req.body.emailAddress
              ? "User with this email already exists"
              : "User with this NIC already exists",
        });
      }

      newUser = await User.create({
        username,
        email: req.body.emailAddress,
        password: hashedPassword,
        userType: "individual", // This creates the user with type "individual"
        nic: req.body.nic,
        fullName: req.body.fullName,
        contactNumber: req.body.mobileNumber,
        district: req.body.district,
        cvStatus: autoApprove ? "cv-approved" : "cv-submitted",
      });
    }

    // Correctly structure data according to schema
    const selectedRole = req.body.selectedRole;

    // Create properly structured roleData based on selected role
    const roleData = {
      dataEntry:
        selectedRole === "dataEntry"
          ? {
              proficiency: {
                msWord: parseInt(req.body["proficiency[msWord]"] || 0),
                msExcel: parseInt(req.body["proficiency[msExcel]"] || 0),
                msPowerPoint: parseInt(
                  req.body["proficiency[msPowerPoint]"] || 0
                ),
              },
              olResults: {
                language: req.body["olResults[language]"] || "",
                mathematics: req.body["olResults[mathematics]"] || "",
                science: req.body["olResults[science]"] || "",
                english: req.body["olResults[english]"] || "",
                history: req.body["olResults[history]"] || "",
                religion: req.body["olResults[religion]"] || "",
                optional1: req.body["olResults[optional1]"] || "",
                optional2: req.body["olResults[optional2]"] || "",
                optional3: req.body["olResults[optional3]"] || "",
              },
              alResults: {
                aLevelSubject1: req.body["alResults[aLevelSubject1]"] || "",
                aLevelSubject2: req.body["alResults[aLevelSubject2]"] || "",
                aLevelSubject3: req.body["alResults[aLevelSubject3]"] || "",
                git: req.body["alResults[git]"] || "",
                gk: req.body["alResults[gk]"] || "",
              },
              preferredLocation: req.body.preferredLocation || "",
              otherQualifications: req.body.otherQualifications || "",
            }
          : null,
      internship:
        selectedRole === "internship"
          ? {
              categoryOfApply: req.body.categoryOfApply || "",
              higherEducation: req.body.higherEducation || "",
              otherQualifications: req.body.otherQualifications || "",
            }
          : null,
    };

    // Prepare CV data with proper approval status
    const cvData = {
      userId: createdByAdmin ? newUser._id : userId,
      userType: createdByAdmin ? "individual" : userType || "individual", // Fix userType issue
      fullName: req.body.fullName,
      nameWithInitials: req.body.nameWithInitials,
      gender: req.body.gender,
      postalAddress: req.body.postalAddress,
      referredBy: req.body.referredBy || "", // Fix referredBy issue
      district: req.body.district,
      birthday: req.body.birthday,
      nic: req.body.nic,
      mobileNumber: req.body.mobileNumber,
      landPhone: req.body.landPhone || "", // Fix landPhone issue
      emailAddress: req.body.emailAddress,
      institute: req.body.institute,
      selectedRole: selectedRole,
      roleData: roleData,
      emergencyContactName1: req.body.emergencyContactName1,
      emergencyContactNumber1: req.body.emergencyContactNumber1,
      emergencyContactName2: req.body.emergencyContactName2 || "", // Fix emergency contact 2 issue
      emergencyContactNumber2: req.body.emergencyContactNumber2 || "", // Fix emergency contact 2 issue
      previousTraining: req.body.previousTraining,
      createdByAdmin,
      currentStatus: autoApprove ? "cv-approved" : "cv-submitted",
      cvApproval: {
        status: autoApprove ? "cv-approved" : "cv-submitted",
        approvedBy: autoApprove ? userId : null,
        approvedDate: autoApprove ? new Date() : null,
        notes: autoApprove ? "Auto-approved on creation" : null,
      },
    };

    // Process files
    const fileFields = [
      "updatedCv",
      "nicFile",
      "policeClearanceReport",
      "internshipRequestLetter",
    ];

    fileFields.forEach((field) => {
      if (req.files?.[field]?.[0]) {
        cvData[field] = req.files[field][0].path;
      }
    });

    // Create CV
    const newCV = await CV.create(cvData);

    // Generate refNo if not set by hook
    if (!newCV.refNo) {
      newCV.refNo = `REF-${newCV._id.toString().slice(-6).toUpperCase()}`;
      await newCV.save();
    }

    // Update user's cvStatus if created by admin
    if (createdByAdmin && newUser) {
      await User.findByIdAndUpdate(newUser._id, {
        $set: { cvStatus: autoApprove ? "cv-approved" : "cv-pending" },
      });
    }

    // Send appropriate email using imported email services
    if (createdByAdmin) {
      await sendAdminCreatedEmail(
        newCV.fullName,
        newCV.emailAddress,
        newCV.refNo,
        {
          username,
          password: randomPassword,
          status: autoApprove ? "cv-approved" : "cv-pending",
        }
      );
    } else {
      await sendSuccessEmail(newCV.fullName, newCV.emailAddress, newCV.refNo);
    }

    res.status(201).json({
      message: `CV ${
        autoApprove ? "created and approved" : "submitted successfully"
      }`,
      cv: {
        _id: newCV._id,
        refNo: newCV.refNo,
        fullName: newCV.fullName,
        nic: newCV.nic,
        selectedRole: newCV.selectedRole,
        currentStatus: newCV.currentStatus,
      },
      // Only return credentials in development for testing
      ...(process.env.NODE_ENV === "development" && createdByAdmin
        ? {
            credentials: {
              username,
              password: randomPassword,
            },
          }
        : {}),
    });
  } catch (error) {
    console.error("Error creating CV:", error);

    // Clean up user if CV creation failed and user was created
    if (newUser) {
      try {
        await User.deleteOne({ _id: newUser._id });
      } catch (cleanupError) {
        console.error(
          "Failed to clean up user after CV creation failed:",
          cleanupError
        );
      }
    }

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => ({
        field: err.path,
        message: err.message,
      }));
      return res.status(400).json({ message: "Validation failed", errors });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        message: "Duplicate key error",
        error: error.message.includes("username")
          ? "Username already exists"
          : error.message.includes("email")
          ? "Email already exists"
          : "A CV with this NIC or reference number already exists",
      });
    }

    res.status(500).json({
      message: "Failed to create CV",
      error: error.message,
    });
  }
};

// Get Not Approved Cvs
const getAllNotApprovedCVs = async (req, res) => {
  try {
    const { status, includeAdminCreated } = req.query;

    let query = {
      $or: [
        { "cvApproval.status": "cv-pending" },
        { currentStatus: "cv-pending" },
        { currentStatus: "cv-submitted" },
      ],
    };

    // Explicitly exclude approved CVs
    query.$and = [
      {
        $or: [
          { "cvApproval.status": { $ne: "cv-approved" } },
          { "cvApproval.status": { $exists: false } },
        ],
      },
    ];

    // Filter out admin created CVs if requested
    if (includeAdminCreated === "false") {
      query.userType = { $ne: "admin" };
    }

    const cvs = await CV.find(query)
      .sort({ createdAt: -1 })
      .select(
        "-__v -roleData.dataEntry.olResults -roleData.dataEntry.alResults -roleData.dataEntry.proficiency"
      );

    res.status(200).json(cvs);
  } catch (error) {
    console.error("Error fetching CVs:", error);
    res.status(500).json({
      message: "Failed to fetch CVs",
      error: error.message,
    });
  }
};

//approve CV
const approveCV = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req;
    const { notes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid CV ID format" });
    }

    const cv = await CV.findById(id);
    if (!cv) {
      return res.status(404).json({ message: "CV not found" });
    }

    // Check if CV is already approved or rejected
    if (cv.cvApproval.status === "cv-approved") {
      return res.status(400).json({
        message: "CV is already approved.",
        cvId: cv._id,
      });
    }
    if (cv.cvApproval.status === "cv-rejected") {
      return res.status(400).json({
        message: "Cannot approve a rejected CV.",
        cvId: cv._id,
      });
    }

    // Update CV status
    cv.cvApproval = {
      cvApproved: true,
      status: "cv-approved",
      approvedBy: userId,
      approvedDate: new Date(),
      notes: notes || "Approved by admin",
    };
    cv.currentStatus = "cv-approved";

    await cv.save();

    // Send approval notification
    await sendApproveEmail(cv.fullName, cv.emailAddress, cv.refNo);

    res.status(200).json({
      message: "CV approved successfully",
      cv: {
        _id: cv._id,
        refNo: cv.refNo,
        fullName: cv.fullName,
        currentStatus: cv.currentStatus,
        cvApproval: cv.cvApproval,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to approve CV",
      error: error.message,
    });
  }
};
// Decline CV
const declineCV = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req;
    const { notes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid CV ID format" });
    }

    const cv = await CV.findById(id);
    if (!cv) {
      return res.status(404).json({ message: "CV not found" });
    }

    // Check if CV is already approved or rejected
    if (cv.cvApproval.status === "cv-approved") {
      return res
        .status(400)
        .json({ message: "Cannot decline an approved CV." });
    }
    if (cv.cvApproval.status === "cv-rejected") {
      return res.status(400).json({ message: "CV is already rejected." });
    }

    // Update CV status
    cv.cvApproval = {
      cvApproved: false,
      status: "cv-rejected",
      rejectedBy: userId,
      rejectedDate: new Date(),
      notes: notes || "Declined by admin",
    };
    cv.currentStatus = "cv-rejected";

    await cv.save();

    // Send rejection notification
    await sendDeclineEmail(cv.fullName, cv.emailAddress, cv.refNo);

    res.status(200).json({
      message: "CV declined successfully",
      cv: {
        _id: cv._id,
        refNo: cv.refNo,
        fullName: cv.fullName,
        currentStatus: cv.currentStatus,
        cvApproval: cv.cvApproval,
      },
      willBeDeletedOn: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to decline CV",
      error: error.message,
    });
  }
};

// Get all CVs with filtering
const getAllCVsWithFiltering = async (req, res) => {
  try {
    const { status, search = "", filterBy = "fullName", role } = req.query;
    let query = {};

    // Status filter
    if (status && status !== "all") {
      if (status === "cv-pending") {
        query.$or = [
          { "cvApproval.status": "cv-pending" },
          { currentStatus: "cv-submitted" },
          { currentStatus: "cv-pending" },
        ];
      } else if (status === "cv-approved") {
        query["cvApproval.status"] = "cv-approved";
        query.currentStatus = "cv-approved";
      } else if (status === "cv-rejected") {
        query["cvApproval.status"] = "cv-rejected";
      } else if (status === "interview-scheduled") {
        query.currentStatus = "interview-scheduled";
      }
    }

    // Role filter
    if (role && ["dataEntry", "internship"].includes(role)) {
      query.selectedRole = role;
    }

    // Search filter
    if (search) {
      const searchableFields = [
        "fullName",
        "nic",
        "refNo",
        "district",
        "institute",
        "userType",
        "selectedRole",
        "referredBy",
      ];

      if (searchableFields.includes(filterBy)) {
        query[filterBy] = { $regex: search, $options: "i" };
      }
    }

    const cvs = await CV.find(query)
      .sort({ applicationDate: -1 })
      .select(
        "fullName nic refNo userType selectedRole applicationDate district institute referredBy cvApproval currentStatus roleData.internship.categoryOfApply roleData.dataEntry.preferredLocation"
      )
      .lean();

    res.status(200).json(cvs);
  } catch (error) {
    console.error("Error in getAllCVsWithFiltering:", error);
    res.status(500).json({
      message: "Failed to fetch CVs",
      error: error.message,
    });
  }
};
//Get CV by ID
const getCVById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid CV ID format" });
    }

    const cv = await CV.findById(id)
      .populate("cvApproval.approvedBy", "name email")
      .populate("cvApproval.rejectedBy", "name email")
      .populate("interview.interviews.interviewId")
      .populate("induction.inductionId")
      .populate("schemaAssignment.schemeId")
      .select("+roleData"); // Explicitly include roleData

    if (!cv) {
      return res.status(404).json({ message: "CV not found" });
    }

    res.status(200).json(cv);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch CV",
      error: error.message,
    });
  }
};
// Get all CVs
const getAllCV = async (req, res) => {
  try {
    const cvs = await CV.find();

    if (!cvs || cvs.length === 0) {
      return res.status(404).json({ message: "No CVs found" });
    }

    res.status(200).json(cvs);
  } catch (error) {
    console.error("Error fetching all CVs:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch all CVs", error: error.message });
  }
};

// Get approved CVs
const getApprovedCVs = async (req, res) => {
  try {
    const approvedCVs = await CV.find({ cvApproved: true });
    res.status(200).json(approvedCVs);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch approved CVs", error: error.message });
  }
};

// Update CV by ID
const updateCV = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid CV ID format" });
    }

    const existingCV = await CV.findById(id);
    if (!existingCV) {
      return res.status(404).json({ message: "CV not found" });
    }

    // Handle roleData updates
    const roleData = {
      dataEntry: {
        ...existingCV.roleData.dataEntry,
        ...(req.body.roleData?.dataEntry || {}),
      },
      internship: {
        ...existingCV.roleData.internship,
        ...(req.body.roleData?.internship || {}),
      },
    };

    // File fields to check
    const fileFields = [
      "updatedCv",
      "nicFile",
      "policeClearanceReport",
      "internshipRequestLetter",
    ];

    // Object to store new file paths
    const updatedFiles = {};

    // Check for uploaded files and update paths
    fileFields.forEach((field) => {
      if (req.files && req.files[field]) {
        // Delete old file before replacing it
        if (existingCV[field]) {
          const oldFilePath = path.join(__dirname, "../", existingCV[field]);
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
          }
        }
        updatedFiles[field] = req.files[field][0].path;
      }
    });

    // Update CV data
    const updatedCV = await CV.findByIdAndUpdate(
      id,
      {
        ...req.body,
        roleData,
        ...updatedFiles,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({ message: "CV updated successfully", cv: updatedCV });
  } catch (error) {
    console.error("Error updating CV:", error.message);
    res.status(500).json({
      message: "Failed to update CV",
      error: error.message,
    });
  }
};

// Delete CV by ID
const deleteCV = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid CV ID format" });
    }

    const cv = await CV.findByIdAndDelete(id);
    if (!cv) {
      return res.status(404).json({ message: "CV not found" });
    }

    res.status(200).json({ message: "CV deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete CV", error: error.message });
  }
};

// Get CVs for logged-in user
const getUserCVs = async (req, res) => {
  try {
    const userEmail = req.user.email;

    if (!userEmail) {
      return res
        .status(400)
        .json({ message: "User email not found in request" });
    }

    const cvs = await CV.find({ emailAddress: userEmail });

    if (!cvs.length) {
      return res.status(404).json({ message: "No CVs found." });
    }

    res.status(200).json(cvs);
  } catch (error) {
    console.error("Error fetching user CVs:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch CVs", error: error.message });
  }
};

// Get CV by NIC
const getCVByNIC = async (req, res) => {
  try {
    const { nic } = req.params;

    if (!nic) {
      return res.status(400).json({ message: "NIC is required" });
    }

    const cv = await CV.findOne({ nic });
    if (!cv)
      return res.status(404).json({ message: "CV not found for this NIC" });

    res.status(200).json(cv);
  } catch (error) {
    console.error("Error fetching CV by NIC:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch CV", error: error.message });
  }
};

// ---------------------------------------Controllers for Admin Interview Section ----------------------------------------------------------
// Get CVs that is approved by the admin and not scheduled for an interview
// Controller for fetching approved but not scheduled CVs
const getApprovedAndNotScheduledCVs = async (req, res) => {
  try {
    const cvs = await CV.find({
      "cvApproval.status": "cv-approved",
      "interview.status": "interview-not-scheduled",
    })
      .populate("userId", "email fullName")
      .lean();

    res.status(200).json(cvs);
  } catch (error) {
    console.error("Error fetching approved not scheduled CVs:", error);
    res.status(500).json({
      message: "Failed to fetch approved CVs",
      error: error.message,
    });
  }
};
// Schedule interview for a CV
const scheduleInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const { interviewId, status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid CV ID format" });
    }

    if (!interviewId) {
      return res.status(400).json({ message: "Interview ID is required" });
    }

    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    const updatedCV = await CV.findByIdAndUpdate(
      id,
      {
        $set: {
          "interview.status": status || "interview-scheduled",
          "interview.interviewScheduled": true,
        },
        $push: {
          "interview.interviews": {
            interviewId: interview._id,
            interviewName: interview.interviewName,
            interviewDate: interview.interviewDate,
            result: { status: "interview-pending" },
          },
        },
      },
      { new: true }
    ).populate("userId", "email fullName");

    if (!updatedCV) {
      return res.status(404).json({ message: "CV not found" });
    }

    // Safely send email if user data exists
    if (updatedCV.userId && updatedCV.userId.email) {
      const fullName =
        updatedCV.userId.fullName || updatedCV.fullName || "Applicant";
      await sendInterviewScheduleEmail(
        fullName,
        updatedCV.userId.email,
        updatedCV.refNo,
        interview.interviewName,
        interview.interviewDate
      );
    }

    res.status(200).json({
      message: "Interview scheduled successfully",
      cv: updatedCV,
    });
  } catch (error) {
    console.error("Error scheduling interview:", error);
    res.status(500).json({
      message: "Failed to schedule interview",
      error: error.message,
    });
  }
};

// Pass interview
const passInterview = async (req, res) => {
  try {
    const { id } = req.params;

    // Add proper check for user
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - User not authenticated",
      });
    }

    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid CV ID format" });
    }

    const cv = await CV.findById(id);
    if (!cv) {
      return res.status(404).json({ message: "CV not found" });
    }

    // Check if interview exists
    if (!cv.interview?.interviews?.length) {
      return res
        .status(400)
        .json({ message: "No interview scheduled for this CV" });
    }

    // Update interview result
    cv.interview.interviews[0].result = {
      status: "interview-passed",
      evaluatedBy: userId,
      evaluatedDate: new Date(),
    };
    cv.interview.status = "interview-completed";

    await cv.save();

    res.status(200).json({
      success: true,
      message: "Interview marked as passed successfully",
      data: cv,
    });
  } catch (error) {
    console.error("Error passing interview:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update interview status",
      error: error.message,
    });
  }
};

// Fail Interview controller
const failInterview = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid CV ID format" });
    }

    const cv = await CV.findById(id);
    if (!cv) {
      return res.status(404).json({ message: "CV not found" });
    }

    // Check if interview exists
    if (!cv.interview?.interviews?.length) {
      return res
        .status(400)
        .json({ message: "No interview scheduled for this CV" });
    }

    // Update the first interview result
    cv.interview.interviews[0].result = {
      status: "interview-failed",
      evaluatedBy: req.user.id,
      evaluatedDate: new Date(),
    };
    cv.interview.status = "interview-failed";

    await cv.save();

    res.status(200).json({
      message: "Interview marked as failed successfully",
      cv,
    });
  } catch (error) {
    console.error("Error failing interview:", error);
    res.status(500).json({
      message: "Failed to update interview status",
      error: error.message,
    });
  }
};
const getCVsAssignedToInterviews = async (req, res, next) => {
  try {
    const cvs = await CV.find({
      "interview.interviewScheduled": true,
      "interview.status": "interview-scheduled",
    })
      .populate("userId", "firstName lastName email")
      .populate({
        path: "interview.interviews.interviewId",
        select: "interviewName interviewDate interviewTime location note",
      });

    res.status(200).json({
      success: true,
      count: cvs.length,
      data: cvs,
    });
  } catch (err) {
    console.error("Error fetching scheduled interviews:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
// -------------------------------------------------------- Controllers for Admin Induction Section --------------------------------------------------------
// Assign CV to an Induction
const assignInduction = async (req, res) => {
  try {
    const { id } = req.params;
    const { inductionId, emailData } = req.body;

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid CV ID format",
        field: "cvId",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(inductionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Induction ID format",
        field: "inductionId",
      });
    }

    // Find and validate induction
    const induction = await Induction.findById(inductionId);
    if (!induction) {
      return res.status(404).json({
        success: false,
        message: "Induction program not found",
      });
    }

    // Only validate fields that are actually required
    const requiredFields = ["induction", "startDate", "endDate", "location"];
    const missingFields = requiredFields.filter((field) => !induction[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Induction program is incomplete",
        missingFields,
        details: `Missing: ${missingFields.join(", ")}`,
      });
    }

    const updatedCV = await CV.findByIdAndUpdate(
      id,
      {
        $set: {
          "interview.status": "interview-skipped",
          "induction.status": "induction-assigned",
          "induction.inductionId": induction._id,
          "induction.inductionName": induction.induction,
          "induction.startDate": induction.startDate,
          "induction.endDate": induction.endDate,
          "induction.location": induction.location,

          "induction.result.status": "induction-pending",
        },
      },
      { new: true }
    ).populate("userId", "email fullName");

    if (!updatedCV) {
      return res.status(404).json({
        success: false,
        message: "CV record not found",
      });
    }

    // Send email
    if (emailData?.recipientEmail) {
      try {
        await sendInductionAssignmentEmail({
          recipientName: updatedCV.fullName || "Intern",
          recipientEmail: emailData.recipientEmail,
          refNo: updatedCV.refNo || "N/A",
          inductionName: induction.induction,
          startDate: induction.startDate,
          endDate: induction.endDate,
          location: induction.location,
        });
      } catch (emailError) {
        console.error("Email failed but assignment succeeded:", emailError);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Induction assigned successfully",
      cv: updatedCV,
    });
  } catch (error) {
    console.error("Assignment failed:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during assignment",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
// Get interview-completed CVs to assign to an induction
const getInterviewPassedCVs = async (req, res) => {
  try {
    const cvs = await CV.find({
      "interview.status": "interview-completed",
      $or: [
        { "induction.status": { $exists: false } },
        { "induction.status": "induction-not-assigned" },
      ],
    }).select(
      "refNo nic fullName selectedRole interview.status interview.interviewDate induction.status"
    );

    res.status(200).json(cvs);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch interview-passed CVs" });
  }
};
// Get CVs assigned to inductions
const getCVsAssignedToInduction = async (req, res) => {
  try {
    const cvs = await CV.find({
      "induction.status": "induction-assigned",
    })
      .populate({
        path: "interview.interviews.interviewId",
        select: "interviewName interviewDate interviewTime location",
      })
      .populate({
        path: "induction.inductionId",
        select: "induction startDate endDate location",
      })
      .select("-password -__v")
      .sort({ createdAt: -1 });

    if (!cvs || cvs.length === 0) {
      return res.status(200).json([]);
    }

    // Format the response to include the populated data
    const formattedCvs = cvs.map((cv) => {
      const interview = cv.interview.interviews[0]; // Assuming one interview per CV
      const induction = cv.induction;

      return {
        ...cv.toObject(),
        interviewWithDetails: {
          name:
            interview?.interviewId?.interviewName ||
            interview?.interviewName ||
            "N/A",
          date: interview?.interviewId?.interviewDate || "N/A",
          time: interview?.interviewId?.interviewTime || "N/A",
        },
        inductionWithDetails: {
          name:
            induction?.inductionId?.induction ||
            induction?.inductionName ||
            "N/A",
          startDate: induction?.inductionId?.startDate || "N/A",
          endDate: induction?.inductionId?.endDate || "N/A",
        },
      };
    });

    res.status(200).json(formattedCvs);
  } catch (error) {
    console.error("Error fetching CVs assigned to induction:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching CVs",
      error: error.message,
    });
  }
};

// Pass induction
const passInduction = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id || !status) {
      return res.status(400).json({ message: "CV ID and status are required" });
    }

    const cv = await CV.findById(id);
    if (!cv) {
      return res.status(404).json({ message: "CV not found" });
    }

    // Update induction status
    cv.induction.result = {
      status:
        status === "induction-passed" ? "induction-passed" : "induction-failed",
      evaluatedDate: new Date(),
      evaluatedBy: req.user.id || null,
    };
    cv.induction.status = "induction-completed";

    await cv.save();

    res.status(200).json({
      message: `Induction ${status} successfully`,
      cv,
    });
  } catch (error) {
    console.error("Error passing induction:", error);
    res.status(500).json({
      message: "Failed to update induction status",
      error: error.message,
    });
  }
};

// Fail induction
const failInduction = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid CV ID" });
    }

    const cv = await CV.findByIdAndUpdate(
      id,
      {
        $set: {
          "induction.result.status": "induction-failed",
          "induction.result.evaluatedDate": new Date(),
          "induction.result.evaluatedBy": req.user.id || null,
          "induction.status": "induction-failed",
        },
      },
      { new: true }
    );

    if (!cv) {
      return res.status(404).json({ message: "CV not found" });
    }

    res.status(200).json({
      message: "Induction failed",
      cv,
    });
  } catch (error) {
    console.error("Error failing induction:", error);
    res.status(500).json({
      message: "Failed to update induction status",
      error: error.message,
    });
  }
};


// ------------------------------------------------------------ Controllers for Rotational Section --------------------------------------------------------------------

// Assign CV to stations
// Controller function to assign CVs to station and update status
const assignCVToStations = async (req, res) => {
  try {
    const { cvIds, stationId, startDate, serviceTimePeriod } = req.body;

    // Validate input
    if (!cvIds || !Array.isArray(cvIds) || cvIds.length === 0) {
      return res.status(400).json({ message: "Please select at least one CV" });
    }
    if (!stationId) {
      return res.status(400).json({ message: "Station ID is required" });
    }

    // Calculate end date based on start date and service time period
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + serviceTimePeriod);

    // Update all selected CVs
    const updatePromises = cvIds.map((cvId) =>
      CVModel.findByIdAndUpdate(
        cvId,
        {
          $set: {
            "rotationalAssignment.status": "station-assigned",
            "rotationalAssignment.assignedStations": [
              {
                station: stationId,
                startDate: new Date(startDate),
                endDate: endDate,
                serviceTimePeriod: serviceTimePeriod,
                isCurrent: true,
              },
            ],
          },
        },
        { new: true }
      )
    );

    await Promise.all(updatePromises);

    res.status(200).json({ message: "CVs successfully assigned to station" });
  } catch (error) {
    console.error("Error assigning CVs to station:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// -------------------------------------------------------- Controllers for Admin- Assign Scheme Section --------------------------------------------------------
// Get induction completed CVs for assign scheme
const getCVsForSchemeAssignment = async (req, res) => {
  try {
    // Query for CVs where induction is completed but scheme is not assigned
    const cvs = await CV.find({
      "induction.status": "induction-completed",
      "schemaAssignment.status": "schema-not-assigned",
    })
      .select("-password -__v") // Exclude sensitive/unnecessary fields
      .sort({ createdAt: -1 }); // Sort by newest first

    if (!cvs || cvs.length === 0) {
      return res.status(200).json([]); // Return empty array if no matching CVs
    }

    // Format the response data to match your frontend expectations
    const formattedCvs = cvs.map((cv) => ({
      _id: cv._id,
      refNo: cv.refNo,
      nic: cv.nic,
      fullName: cv.fullName,
      selectedRole: cv.selectedRole,
      emailAddress: cv.emailAddress,
      mobileNumber: cv.mobileNumber,
      district: cv.district,
      institute: cv.institute,
      induction: cv.induction,
      schemaAssignment: cv.schemaAssignment,
    }));

    res.status(200).json(formattedCvs);
  } catch (error) {
    console.error("Error fetching CVs for scheme assignment:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching CVs for scheme assignment",
      error: error.message,
    });
  }
};

// Get all CVs with filters for scheme assignment
const assignSchemeToCV = async (req, res) => {
  try {
    const { id } = req.params;
    const { schemeId, managerId, internshipPeriod, startDate, forRequest } =
      req.body;

    // Validate input
    if (!schemeId || !managerId || !internshipPeriod || !startDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Get scheme details
    const scheme = await Scheme.findById(schemeId);
    if (!scheme) {
      return res.status(404).json({ message: "Scheme not found" });
    }

    // Check if scheme has available slots
    if (scheme.totalEmptyCount <= 0) {
      return res
        .status(400)
        .json({ message: "No available slots in this scheme" });
    }

    // Get manager details from scheme
    let managerDetails;
    switch (managerId) {
      case "generalManager":
        managerDetails = scheme.generalManager;
        break;
      case "deputyManager":
        managerDetails = scheme.deputyManager;
        break;
      case "supervisor":
        managerDetails = scheme.supervisor;
        break;
      default:
        return res.status(400).json({ message: "Invalid manager ID" });
    }

    // Check if manager has available allocation
    if (managerDetails.availableAllocation <= 0) {
      return res
        .status(400)
        .json({ message: "Manager has no available allocation" });
    }

    // Calculate end date based on start date and internship period
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + parseInt(internshipPeriod));

    // Prepare update data
    const updateData = {
      $set: {
        "schemaAssignment.schemaAssigned": true,
        "schemaAssignment.status": "schema-assigned",
        "schemaAssignment.schemeId": schemeId,
        "schemaAssignment.schemeName": scheme.schemeName,
        "schemaAssignment.managerId": managerId,
        "schemaAssignment.managerName": managerDetails.name,
        "schemaAssignment.managerRole": managerId
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase()),
        "schemaAssignment.internshipPeriod": internshipPeriod,
        "schemaAssignment.startDate": startDate,
        "schemaAssignment.endDate": endDate,
        "schemaAssignment.forRequest": forRequest || "no",
        currentStatus: "schema-assigned",
      },
    };

    // If scheme is rotational, set isRotational to true
    if (scheme.rotational === "yes") {
      updateData.$set["rotationalAssignment.isRotational"] = true;
    }

    // Update CV
    const updatedCV = await CV.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedCV) {
      return res.status(404).json({ message: "CV not found" });
    }

    // Update scheme allocation counts
    scheme.totalAllocatedCount += 1;
    scheme.totalEmptyCount =
      scheme.totalAllocation - scheme.totalAllocatedCount;

    // Update manager's assigned count
    switch (managerId) {
      case "generalManager":
        scheme.generalManager.assignedCount += 1;
        scheme.generalManager.availableAllocation =
          scheme.generalManager.allocationCount -
          scheme.generalManager.assignedCount;
        break;
      case "deputyManager":
        scheme.deputyManager.assignedCount += 1;
        scheme.deputyManager.availableAllocation =
          scheme.deputyManager.allocationCount -
          scheme.deputyManager.assignedCount;
        break;
      case "supervisor":
        scheme.supervisor.assignedCount += 1;
        scheme.supervisor.availableAllocation =
          scheme.supervisor.allocationCount - scheme.supervisor.assignedCount;
        break;
    }

    await scheme.save();

    res.status(200).json(updatedCV);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Batch assign scheme to multiple CVs
const batchAssignScheme = async (req, res) => {
  try {
    const {
      cvIds,
      schemeId,
      managerId,
      internshipPeriod,
      startDate,
      forRequest,
    } = req.body;

    // Validate input
    if (!cvIds || !Array.isArray(cvIds)) {
      return res.status(400).json({ message: "Invalid CV IDs" });
    }
    if (!schemeId || !managerId || !internshipPeriod || !startDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Get scheme details
    const scheme = await Scheme.findById(schemeId);
    if (!scheme) {
      return res.status(404).json({ message: "Scheme not found" });
    }

    // Check if scheme has enough available slots
    if (scheme.totalEmptyCount < cvIds.length) {
      return res.status(400).json({
        message: `Not enough available slots in this scheme. Available: ${scheme.totalEmptyCount}, Requested: ${cvIds.length}`,
      });
    }

    // Get manager details from scheme
    let managerDetails;
    switch (managerId) {
      case "generalManager":
        managerDetails = scheme.generalManager;
        break;
      case "deputyManager":
        managerDetails = scheme.deputyManager;
        break;
      case "supervisor":
        managerDetails = scheme.supervisor;
        break;
      default:
        return res.status(400).json({ message: "Invalid manager ID" });
    }

    // Check if manager has enough available allocation
    if (managerDetails.availableAllocation < cvIds.length) {
      return res.status(400).json({
        message: `Manager doesn't have enough available allocation. Available: ${managerDetails.availableAllocation}, Requested: ${cvIds.length}`,
      });
    }

    // Calculate end date based on start date and internship period
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + parseInt(internshipPeriod));

    // Prepare base update data
    const baseUpdateData = {
      $set: {
        "schemaAssignment.schemaAssigned": true,
        "schemaAssignment.status": "schema-assigned",
        "schemaAssignment.schemeId": schemeId,
        "schemaAssignment.schemeName": scheme.schemeName,
        "schemaAssignment.managerId": managerId,
        "schemaAssignment.managerName": managerDetails.name,
        "schemaAssignment.managerRole": managerId
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase()),
        "schemaAssignment.internshipPeriod": internshipPeriod,
        "schemaAssignment.startDate": startDate,
        "schemaAssignment.endDate": endDate,
        "schemaAssignment.forRequest": forRequest || "no",
        currentStatus: "schema-assigned",
      },
    };

    // If scheme is rotational, add isRotational to the update
    if (scheme.rotational === "yes") {
      baseUpdateData.$set["rotationalAssignment.isRotational"] = true;
    }

    // Update all CVs
    const updatePromises = cvIds.map(async (cvId) => {
      return CV.findByIdAndUpdate(cvId, baseUpdateData, { new: true });
    });

    const updatedCVs = await Promise.all(updatePromises);

    // Update scheme allocation counts
    scheme.totalAllocatedCount += cvIds.length;
    scheme.totalEmptyCount =
      scheme.totalAllocation - scheme.totalAllocatedCount;

    // Update manager's assigned count
    switch (managerId) {
      case "generalManager":
        scheme.generalManager.assignedCount += cvIds.length;
        scheme.generalManager.availableAllocation =
          scheme.generalManager.allocationCount -
          scheme.generalManager.assignedCount;
        break;
      case "deputyManager":
        scheme.deputyManager.assignedCount += cvIds.length;
        scheme.deputyManager.availableAllocation =
          scheme.deputyManager.allocationCount -
          scheme.deputyManager.assignedCount;
        break;
      case "supervisor":
        scheme.supervisor.assignedCount += cvIds.length;
        scheme.supervisor.availableAllocation =
          scheme.supervisor.allocationCount - scheme.supervisor.assignedCount;
        break;
    }

    await scheme.save();

    res.status(200).json(updatedCVs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//----------------------------------- Controllers for admin-institute section --------------------------------------------------------------------

// CV bulk upload
const bulkUploadCV = async (req, res) => {
  try {
    // Check if file exists
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    // Verify institute user
    if (!req.user || req.user.userType !== "institute") {
      fs.unlinkSync(req.file.path); // Clean up file
      return res
        .status(403)
        .json({ message: "Only institutes can perform bulk uploads." });
    }

    const instituteId = req.user.id;
    const userType = "institute";

    // Process the Excel file
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0]; // Get first sheet
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    // Validate row count
    if (data.length > 50) {
      fs.unlinkSync(req.file.path); // Clean up file
      return res.status(400).json({
        message: "Maximum 50 CVs allowed per bulk upload.",
      });
    }

    // Process each row
    const results = {
      success: 0,
      failures: 0,
      errors: [],
    };

    for (const [index, row] of data.entries()) {
      try {
        // Validate required fields
        const requiredFields = [
          "Full Name",
          "Name with Initials",
          "Gender",
          "Postal Address",
          "District",
          "Birthday",
          "NIC",
          "Mobile Number",
          "Email",
          "Institute",
        ];

        const missingFields = requiredFields.filter((field) => !row[field]);
        if (missingFields.length > 0) {
          throw new Error(
            `Missing required fields: ${missingFields.join(", ")}`
          );
        }

        // Convert Excel date to DD/MM/YYYY format
        if (row["Birthday"] && typeof row["Birthday"] === "number") {
          const date = xlsx.SSF.parse_date_code(row["Birthday"]);
          row["Birthday"] = `${date.d}/${date.m}/${date.y}`;
        }

        // Build CV data
        const cvData = {
          fullName: row["Full Name"],
          nameWithInitials: row["Name with Initials"],
          gender: row["Gender"],
          postalAddress: row["Postal Address"],
          district: row["District"],
          birthday: row["Birthday"],
          nic: row["NIC"],
          mobileNumber: row["Mobile Number"],
          landPhone: row["Land Phone"] || "",
          emailAddress: row["Email"],
          institute: row["Institute"],
          userId: instituteId,
          userType: userType,
          currentStatus: "pending",
          cvApproval: {
            status: "pending",
          },
          // Initialize roleData
          roleData: {
            dataEntry: {},
            internship: {},
          },
        };

        // Set role-specific data
        if (row["O/L Language"]) {
          // Data Entry Operator
          cvData.selectedRole = "dataEntry";
          cvData.roleData.dataEntry = {
            proficiency: {
              msWord: row["MS Word Proficiency"] || 0,
              msExcel: row["MS Excel Proficiency"] || 0,
              msPowerPoint: row["MS PowerPoint Proficiency"] || 0,
            },
            olResults: {
              language: row["O/L Language"],
              mathematics: row["O/L Mathematics"],
              science: row["O/L Science"],
              english: row["O/L English"],
              history: row["O/L History"],
              religion: row["O/L Religion"],
              optional1: row["O/L Optional 1"],
              optional2: row["O/L Optional 2"],
              optional3: row["O/L Optional 3"],
            },
            alResults: {
              aLevelSubject1: row["A/L Subject 1"] || "",
              aLevelSubject2: row["A/L Subject 2"] || "",
              aLevelSubject3: row["A/L Subject 3"] || "",
              git: row["A/L GIT"] || "",
              gk: row["A/L GK"] || "",
            },
            preferredLocation: row["Preferred Location"] || "",
            otherQualifications: row["Other Qualifications"] || "",
          };
        } else {
          // Internship
          cvData.selectedRole = "internship";
          cvData.roleData.internship = {
            categoryOfApply: row["Category of Apply"] || "",
            higherEducation: row["Higher Education"] || "",
            otherQualifications: row["Other Qualifications"] || "",
          };
        }

        // Handle emergency contacts
        if (row["Emergency Contact Name 1"]) {
          cvData.emergencyContactName1 = row["Emergency Contact Name 1"];
          cvData.emergencyContactNumber1 =
            row["Emergency Contact Number 1"] || "";
        }
        if (row["Emergency Contact Name 2"]) {
          cvData.emergencyContactName2 = row["Emergency Contact Name 2"];
          cvData.emergencyContactNumber2 =
            row["Emergency Contact Number 2"] || "";
        }

        // Handle previous training
        if (row["Previous Training"]) {
          cvData.previousTraining = row["Previous Training"];
        }

        // Check for duplicates
        const existingCV = await CV.findOne({
          $or: [{ emailAddress: cvData.emailAddress }, { nic: cvData.nic }],
        });

        if (existingCV) {
          throw new Error(
            `CV with ${
              existingCV.emailAddress === cvData.emailAddress ? "email" : "NIC"
            } already exists`
          );
        }

        // Create CV
        await CV.create(cvData);
        results.success++;
      } catch (error) {
        results.failures++;
        results.errors.push({
          row: index + 1,
          message: error.message,
        });
      }
    }

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    // Return results
    res.status(200).json({
      message: `Bulk upload processed. Success: ${results.success}, Failures: ${results.failures}`,
      details:
        results.errors.length > 0 ? { errors: results.errors } : undefined,
    });
  } catch (error) {
    console.error("Bulk upload error:", error);

    // Clean up file if error occurred
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      message: "Failed to process bulk upload",
      error: error.message,
    });
  }
};

module.exports = {
  createCV,
  getCVById,
  getUserCVs,
  getAllCVsWithFiltering,
  getApprovedCVs,
  approveCV,
  declineCV,
  updateCV,
  deleteCV,
  getCVByNIC,
  scheduleInterview,
  assignInduction,
  scheduleInterview,
  getCVsAssignedToInterviews,
  passInterview,
  failInterview,
  passInduction,
  failInduction,
  assignCVToStations,
  getCVsAssignedToInduction,
  bulkUploadCV,
  validateObjectId,
  getAllNotApprovedCVs,
  getApprovedAndNotScheduledCVs,
  scheduleInterview,
  getInterviewPassedCVs,
  upload,
};
