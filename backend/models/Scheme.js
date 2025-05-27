const mongoose = require("mongoose");

// Manager schema for embedded manager documents
const managerSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, trim: true },
  name: { type: String, required: true, trim: true },
  employeeCode: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true },
  department: { type: String, required: true, trim: true },
  position: { type: String, required: true, trim: true },
  hierarchyLevel: { type: Number, default: 1 },
  divisionCode: { type: String, trim: true },
  costCenter: { type: String, trim: true },
  gradeLevel: { type: String, trim: true },
  allocationCount: { type: Number, default: 0, min: 0 },
  availableAllocation: { type: Number, default: 0, min: 0 },
  assignedCount: { type: Number, default: 0, min: 0 },
  assignedDate: { type: Date, default: Date.now },
  assignedBy: { type: String, trim: true }
}, { _id: false });

const schemeSchema = new mongoose.Schema(
  {
    schemeName: { type: String, required: true, trim: true },
    totalAllocation: { type: Number, required: true, min: 1 },
    onRequest: { type: String, enum: ["yes", "no"], required: true },
    recurring: { type: String, enum: ["yes", "no"], required: true },
    rotational: { type: String, enum: ["yes", "no"], required: true },
    perHeadAllowance: { type: Number, required: true, min: 0 },
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
    totalAllocatedCount: { type: Number, default: 0, min: 0 },
    totalEmptyCount: { type: Number, default: 0, min: 0 },

    // Manager assignments with full employee details
    generalManager: managerSchema,
    deputyManager: managerSchema,
    supervisor: managerSchema,

    // Metadata
    isActive: { type: Boolean, default: true },
    lastRecalculated: { type: Date, default: Date.now }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for utilization percentage
schemeSchema.virtual('utilizationPercentage').get(function() {
  if (this.totalAllocation === 0) return 0;
  return Math.round((this.totalAllocatedCount / this.totalAllocation) * 100);
});

// Virtual for total manager allocation
schemeSchema.virtual('totalManagerAllocation').get(function() {
  return (this.generalManager?.allocationCount || 0) +
         (this.deputyManager?.allocationCount || 0) +
         (this.supervisor?.allocationCount || 0);
});

// Virtual for assigned managers count
schemeSchema.virtual('assignedManagersCount').get(function() {
  let count = 0;
  if (this.generalManager?.employeeId) count++;
  if (this.deputyManager?.employeeId) count++;
  if (this.supervisor?.employeeId) count++;
  return count;
});

// Pre-save middleware to calculate empty count and available allocations
schemeSchema.pre("save", function (next) {
  // Calculate total empty positions
  this.totalEmptyCount = Math.max(0, this.totalAllocation - this.totalAllocatedCount);

  // Calculate available allocation for each manager
  if (this.generalManager && this.generalManager.employeeId) {
    this.generalManager.availableAllocation = Math.max(
      0, 
      this.generalManager.allocationCount - this.generalManager.assignedCount
    );
  }
  
  if (this.deputyManager && this.deputyManager.employeeId) {
    this.deputyManager.availableAllocation = Math.max(
      0,
      this.deputyManager.allocationCount - this.deputyManager.assignedCount
    );
  }
  
  if (this.supervisor && this.supervisor.employeeId) {
    this.supervisor.availableAllocation = Math.max(
      0,
      this.supervisor.allocationCount - this.supervisor.assignedCount
    );
  }

  // Update last recalculated timestamp
  this.lastRecalculated = new Date();

  next();
});

// Pre-save validation
schemeSchema.pre("save", function (next) {
  // Validate that total manager allocation doesn't exceed scheme allocation
  const totalManagerAllocation = this.totalManagerAllocation;
  
  if (totalManagerAllocation > this.totalAllocation) {
    const error = new Error(
      `Total manager allocation (${totalManagerAllocation}) cannot exceed scheme total allocation (${this.totalAllocation})`
    );
    error.name = 'ValidationError';
    return next(error);
  }

  // Validate dates
  if (this.schemeStartDate && this.schemeEndDate) {
    const startDate = new Date(this.schemeStartDate);
    const endDate = new Date(this.schemeEndDate);
    
    if (startDate >= endDate) {
      const error = new Error('Scheme end date must be after start date');
      error.name = 'ValidationError';
      return next(error);
    }
  }

  next();
});

// Post-save middleware to log changes
schemeSchema.post('save', function(doc) {
  console.log(`Scheme ${doc.schemeName} (${doc._id}) saved successfully`);
  console.log(`Allocation status: ${doc.totalAllocatedCount}/${doc.totalAllocation} (${doc.utilizationPercentage}%)`);
});

// Static methods
schemeSchema.statics.findActive = function() {
  return this.find({ isActive: true });
};

schemeSchema.statics.findByManager = function(employeeId) {
  return this.find({
    $or: [
      { 'generalManager.employeeId': employeeId },
      { 'deputyManager.employeeId': employeeId },
      { 'supervisor.employeeId': employeeId }
    ]
  });
};

schemeSchema.statics.getSchemeStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalSchemes: { $sum: 1 },
        activeSchemes: { 
          $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } 
        },
        totalPositions: { $sum: '$totalAllocation' },
        allocatedPositions: { $sum: '$totalAllocatedCount' },
        availablePositions: { $sum: '$totalEmptyCount' },
        averageUtilization: { 
          $avg: { 
            $multiply: [
              { $divide: ['$totalAllocatedCount', '$totalAllocation'] },
              100
            ]
          }
        }
      }
    }
  ]);
  
  return stats[0] || {
    totalSchemes: 0,
    activeSchemes: 0,
    totalPositions: 0,
    allocatedPositions: 0,
    availablePositions: 0,
    averageUtilization: 0
  };
};

// Instance methods
schemeSchema.methods.canAssignManager = function(managerType, allocationCount) {
  const currentAllocation = this.totalManagerAllocation;
  const managerCurrentAllocation = this[managerType]?.allocationCount || 0;
  const newTotalAllocation = currentAllocation - managerCurrentAllocation + allocationCount;
  
  return newTotalAllocation <= this.totalAllocation;
};

schemeSchema.methods.getManagerByEmployeeId = function(employeeId) {
  if (this.generalManager?.employeeId === employeeId) {
    return { type: 'generalManager', data: this.generalManager };
  }
  if (this.deputyManager?.employeeId === employeeId) {
    return { type: 'deputyManager', data: this.deputyManager };
  }
  if (this.supervisor?.employeeId === employeeId) {
    return { type: 'supervisor', data: this.supervisor };
  }
  return null;
};

schemeSchema.methods.isEmployeeAlreadyAssigned = function(employeeId) {
  return !!(
    this.generalManager?.employeeId === employeeId ||
    this.deputyManager?.employeeId === employeeId ||
    this.supervisor?.employeeId === employeeId
  );
};

// Indexes for better query performance
schemeSchema.index({ schemeName: 1 });
schemeSchema.index({ isActive: 1 });
schemeSchema.index({ 'generalManager.employeeId': 1 });
schemeSchema.index({ 'deputyManager.employeeId': 1 });
schemeSchema.index({ 'supervisor.employeeId': 1 });
schemeSchema.index({ schemeStartDate: 1, schemeEndDate: 1 });
schemeSchema.index({ totalAllocation: 1, totalAllocatedCount: 1 });

module.exports = mongoose.model("Scheme", schemeSchema);