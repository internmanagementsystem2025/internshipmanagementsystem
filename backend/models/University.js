const mongoose = require("mongoose");

const UniversitySchema = new mongoose.Schema(
  {
    username: String,
    email: String,
    fullName: String,
    nameWithInitials: String,
    password: String,
    postalAddress: String,
    contactNumber: String,
    nic: String,
    district: String,
    preferredLanguage: String,
    instituteContactNumber: String,
    instituteContactEmail: String,
    instituteName: String,
    profileImage: String,
    department: String,
    instituteType: String,
    approveRequest: { type: Boolean, default: false },
    startDate: { type: Date, required: true }, // Internship start date
    endDate: { type: Date, required: true }, // Internship end date
    rotationPlan: [
      {
        stationId: mongoose.Schema.Types.ObjectId,
        stationName: String,
        duration: Number, // Duration in weeks
        status: { type: String, enum: ["assigned", "completed"], default: "assigned" }, // Progress status
      },
    ],
    currentStation: { type: mongoose.Schema.Types.ObjectId, ref: "RotationalStation" }, // Current station
    completedStations: [{ type: mongoose.Schema.Types.ObjectId, ref: "RotationalStation" }], // Completed stations
  },
  { timestamps: true }
);

module.exports = mongoose.model("University", UniversitySchema);
