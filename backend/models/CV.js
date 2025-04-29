const mongoose = require("mongoose");

const cvSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fullName: { type: String, required: true },
    nameWithInitials: { type: String, required: true },
    gender: { type: String, required: true },
    postalAddress: { type: String, required: true },
    referredBy: { type: String },
    userType: { type: String, required: true },
    district: { type: String, required: true },
    birthday: { type: String, required: true },
    nic: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    landPhone: { type: String },
    emailAddress: { type: String, required: true },
    institute: { type: String, required: true },
    selectedRole: {
      type: String,
      required: true,
      enum: ["dataEntry", "internship"],
    },

    // Role-specific data
    roleData: {
      // Data Entry Operator specific fields
      dataEntry: {
        proficiency: {
          msWord: { type: Number, min: 0, max: 100, default: 0 },
          msExcel: { type: Number, min: 0, max: 100, default: 0 },
          msPowerPoint: { type: Number, min: 0, max: 100, default: 0 },
        },
        olResults: {
          language: { type: String },
          mathematics: { type: String },
          science: { type: String },
          english: { type: String },
          history: { type: String },
          religion: { type: String },
          optional1: { type: String },
          optional2: { type: String },
          optional3: { type: String },
        },
        alResults: {
          aLevelSubject1: { type: String },
          aLevelSubject2: { type: String },
          aLevelSubject3: { type: String },
          git: { type: String },
          gk: { type: String },
        },
        preferredLocation: { type: String },
        otherQualifications: { type: String },
      },

      // Internship specific fields
      internship: {
        categoryOfApply: { type: String },
        higherEducation: { type: String },
        otherQualifications: { type: String },
      },
    },

    emergencyContactName1: { type: String, required: true },
    emergencyContactNumber1: { type: String, required: true },
    emergencyContactName2: { type: String },
    emergencyContactNumber2: { type: String },
    previousTraining: { type: String, required: true },
    updatedCv: { type: String },
    nicFile: { type: String },
    policeClearanceReport: { type: String },
    internshipRequestLetter: { type: String },

    refNo: { type: String, unique: true },
    applicationDate: { type: Date, default: Date.now },
    createdByAdmin: {
      type: Boolean,
      default: false,
    },
    // CV Approval Status
    cvApproval: {
      cvApproved: { type: Boolean, default: false },
      status: {
        type: String,
        enum: ["cv-submitted", "cv-pending", "cv-approved", "cv-rejected"],
        default: "cv-submitted",
      },
      approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      approvedDate: { type: Date },
      rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      rejectedDate: { type: Date },
      notes: { type: String },
    },

    // Interview Details
    interview: {
      interviewScheduled: { type: Boolean, default: false },
      status: {
        type: String,
        enum: [
          "interview-not-scheduled",
          "interview-scheduled",
          "interview-completed",
          "interview-failed",
          "interview-no-show",
          "interview-skipped",
        ],
        default: "interview-not-scheduled",
      },
      interviews: [
        {
          interviewId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Interview",
          },
          interviewName: { type: String },

          result: {
            status: {
              type: String,
              enum: [
                "interview-passed",
                "interview-failed",
                "interview-pending",
              ],
            },
            evaluatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            evaluatedDate: { type: Date },
            feedback: { type: String },
          },
        },
      ],
    },

    // Induction Details
    induction: {
      inductionAssigned: { type: Boolean, default: false },
      status: {
        type: String,
        enum: [
          "induction-not-assigned",
          "induction-assigned",
          "induction-completed",
          "induction-failed",
        ],
        default: "induction-not-assigned",
      },
      inductionId: { type: mongoose.Schema.Types.ObjectId, ref: "Induction" },
      inductionName: { type: String },

      result: {
        status: {
          type: String,
          enum: ["induction-passed", "induction-failed", "induction-pending"],
        },
        evaluatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        evaluatedDate: { type: Date },
        feedback: { type: String },
      },
    },

    // Schema Assignment
    schemaAssignment: {
      schemaAssigned: { type: Boolean, default: false },
      status: {
        type: String,
        enum: [
          "schema-not-assigned",
          "schema-assigned",
          "schema-completed",
          "terminated",
        ],
        default: "schema-not-assigned",
      },
      schemeId: { type: mongoose.Schema.Types.ObjectId, ref: "Scheme" },
      schemeName: { type: String },
      managerId: { type: String }, // 'generalManager', 'deputyManager', or 'supervisor'
      managerName: { type: String },
      managerRole: { type: String },
      internshipPeriod: { type: Number }, // in months
      startDate: { type: Date },
      endDate: { type: Date },
      forRequest: { type: String, enum: ["yes", "no"], default: "no" },

      evaluation: {
        status: {
          type: String,
          enum: ["satisfactory", "unsatisfactory", "pending"],
          default: "pending",
        },
        evaluatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        evaluatedDate: { type: Date },
        feedback: { type: String },
      },
    },

    // Overall CV Status
    currentStatus: {
      type: String,
      enum: [
        "draft",
        "cv-submitted",
        "cv-approved",
        "cv-rejected",
        "interview-scheduled",
        "interview-passed",
        "interview-failed",
        "induction-assigned",
        "induction-passed",
        "induction-failed",
        "schema-assigned",
        "schema-completed",
        "terminated",
      ],
      default: "draft",
    },

    // Tracking
    applicationDate: { type: Date, default: Date.now },
    lastUpdated: { type: Date },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // Rotational
    rotationalAssignment: {
      isRotational: { type: Boolean, default: false },
      status: {
        type: String,
        enum: [
          "station-not-assigned",
          "station-assigned",
          "rotational-completed",
          "terminated",
        ],
        default: "station-not-assigned",
      },
      assignedStations: [
        {
          station: { type: mongoose.Schema.Types.ObjectId, ref: "Station" },
          startDate: { type: Date },
          endDate: { type: Date },
          serviceTimePeriod: { type: Number }, // Service time in days
          isCurrent: { type: Boolean, default: false },
        },
      ],
      internshipDuration: { type: Number, default: 24 }, // Default duration in weeks
    },
  },
  { timestamps: true }
);

// Generate unique reference number and update status before saving
cvSchema.pre("save", function (next) {
  // Generate refNo if not set
  if (!this.refNo) {
    this.refNo = `REF-${this._id.toString().slice(-6).toUpperCase()}`;
  }

  // Update lastUpdated timestamp
  this.lastUpdated = new Date();

  // Update currentStatus based on other statuses
  if (
    this.isModified("cvApproval.status") ||
    this.isModified("interview.status") ||
    this.isModified("induction.status") ||
    this.isModified("schemaAssignment.status")
  ) {
    this.updateCurrentStatus();
  }

  next();
});

// Method to update currentStatus based on other statuses
cvSchema.methods.updateCurrentStatus = function () {
  // First check CV rejection (highest priority)
  if (this.cvApproval.status === "cv-rejected") {
    this.currentStatus = "cv-rejected";
    return;
  }

  // Check schema assignment status
  if (this.schemaAssignment.status === "schema-assigned") {
    this.currentStatus = "schema-assigned";
    return;
  } else if (this.schemaAssignment.status === "schema-completed") {
    this.currentStatus = "schema-completed";
    return;
  } else if (this.schemaAssignment.status === "terminated") {
    this.currentStatus = "terminated";
    return;
  }

  // Check induction status
  if (this.induction.status === "induction-assigned") {
    this.currentStatus = "induction-assigned";
    return;
  } else if (this.induction.result?.status === "induction-passed") {
    this.currentStatus = "induction-passed";
    return;
  } else if (this.induction.result?.status === "induction-failed") {
    this.currentStatus = "induction-failed";
    return;
  }

  // Check interview status
  if (this.interview.status === "interview-scheduled") {
    this.currentStatus = "interview-scheduled";
    return;
  } else if (
    this.interview.interviews?.some(
      (i) => i.result?.status === "interview-passed"
    )
  ) {
    this.currentStatus = "interview-passed";
    return;
  } else if (
    this.interview.interviews?.some(
      (i) => i.result?.status === "interview-failed"
    )
  ) {
    this.currentStatus = "interview-failed";
    return;
  }

  // Check CV approval status
  if (this.cvApproval.status === "cv-approved") {
    this.currentStatus = "cv-approved";
    return;
  } else if (this.cvApproval.status === "cv-submitted") {
    this.currentStatus = "cv-submitted";
    return;
  }

  // Default fallback
  this.currentStatus = "draft";
};

// Add indexes
// Role-Specific Indexes
cvSchema.index({ "roleData.internship.categoryOfApply": 1 }); // For filtering interns by category
cvSchema.index({ "roleData.dataEntry.preferredLocation": 1 }); // For filtering DEOs by location

// Combined Role + Status Index (Optimizes admin dashboards)
cvSchema.index({ selectedRole: 1, "cvApproval.status": 1 });

// Text Index for Search (Name/NIC)
cvSchema.index({ fullName: "text", nic: "text" });

// Unique NIC Index (Prevent duplicates)
cvSchema.index({ nic: 1 }, { unique: true });

module.exports = mongoose.model("CV", cvSchema);
