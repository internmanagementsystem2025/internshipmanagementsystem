const mongoose = require("mongoose");

const schemeSchema = new mongoose.Schema(
  {
    schemeName: { type: String, required: true, trim: true },
    totalAllocation: { type: Number, required: true },
    onRequest: { type: String, enum: ["yes", "no"], required: true },
    recurring: { type: String, enum: ["yes", "no"], required: true },
    rotational: { type: String, enum: ["yes", "no"], required: true },
    perHeadAllowance: { type: Number, required: true },
    allowanceFrequency: {
      type: String,
      enum: ["daily", "weekly", "monthly"],
      required: true,
    },
    description: { type: String, trim: true },
    minimumQualifications: { type: String, required: true, trim: true },
    schemeStartDate: { type: String, required: true },
    schemeEndDate: { type: String, required: true },

    // Fields to track allocation
    totalAllocatedCount: { type: Number, default: 0 },
    totalEmptyCount: { type: Number, default: 0 },

    generalManager: {
      name: { type: String, trim: true },
      allocationCount: { type: Number, default: 0 },
      availableAllocation: { type: Number, default: 0 },
      assignedCount: { type: Number, default: 0 },
    },
    deputyManager: {
      name: { type: String, trim: true },
      allocationCount: { type: Number, default: 0 },
      availableAllocation: { type: Number, default: 0 },
      assignedCount: { type: Number, default: 0 },
    },
    supervisor: {
      name: { type: String, trim: true },
      allocationCount: { type: Number, default: 0 },
      availableAllocation: { type: Number, default: 0 },
      assignedCount: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

// Calculate empty count before saving
schemeSchema.pre("save", function (next) {
  this.totalEmptyCount = this.totalAllocation - this.totalAllocatedCount;

  // Calculate available allocation for each manager
  if (this.generalManager.name) {
    this.generalManager.availableAllocation =
      this.generalManager.allocationCount - this.generalManager.assignedCount;
  }
  if (this.deputyManager.name) {
    this.deputyManager.availableAllocation =
      this.deputyManager.allocationCount - this.deputyManager.assignedCount;
  }
  if (this.supervisor.name) {
    this.supervisor.availableAllocation =
      this.supervisor.allocationCount - this.supervisor.assignedCount;
  }

  next();
});

module.exports = mongoose.model("Scheme", schemeSchema);
