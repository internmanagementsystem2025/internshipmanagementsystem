const mongoose = require("mongoose");

const staffSchema = new mongoose.Schema({
  name: { type: String, required: true },
  staffId: { type: String, required: true, unique: true },
  jobPosition: {
    type: String,
    enum: ["General Manager", "Deputy General Manager", "Supervisor", "Staff"],
    required: true,
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  // Azure AD Integration Fields
  azureId: {
    type: String,
    unique: true,
    sparse: true // Allows null for non-Azure users
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/^[\w-]+(\.[\w-]+)*@mobitel\.lk$/, 'Please use a valid Mobitel email']
  }
});

const Staff = mongoose.model("Staff", staffSchema);
module.exports = Staff;