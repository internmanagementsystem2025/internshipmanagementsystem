const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  EMPLOYEE_NUMBER: {
    type: String,
    required: [true, 'Employee number is required'],
    trim: true,
  },
  EMPLOYEE_TITLE: {
    type: String,
    trim: true,
  },
  EMPLOYEE_FIRST_NAME: {
    type: String,
    required: [true, 'Employee first name is required'],
    trim: true,
  },
  EMPLOYEE_SURNAME: {
    type: String,
    required: [true, 'Employee surname is required'],
    trim: true,
  },
  EMPLOYEE_DESIGNATION: {
    type: String,
    required: [true, 'Employee designation is required'],
    trim: true,
  },
  EMPLOYEE_IMM_ES_SERVICE_NO: {
    type: String,
    default: '',
    trim: true,
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function (v) {
        return !v || /^\S+@\S+\.\S+$/.test(v);
      },
      message: props => `${props.value} is not a valid email!`,
    },
  },
}, { timestamps: true });

const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee;
