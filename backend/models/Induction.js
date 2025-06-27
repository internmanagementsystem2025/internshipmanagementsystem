const mongoose = require("mongoose");

const inductionSchema = new mongoose.Schema(
  {
    induction: { type: String, required: true },
    startDate: { type: String, required: true },
    time: {
      type: String,
      required: [true, "time is required"],
      validate: {
        validator: function (v) {
          return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
        },
        message: "Invalid time format. Please use HH:MM in 24-hour format.",
      },
    },  // <-- This closing brace was missing
    location: { type: String, required: true },
    note: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Induction", inductionSchema);