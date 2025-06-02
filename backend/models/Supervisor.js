const mongoose = require('mongoose');

const supervisorSchema = new mongoose.Schema({
  SUPERVISOR_NUMBER: {
    type: String,
    required: [true, 'Employee number is required'],
    trim: true,
    unique: true,
  },
  SUPERVISOR_TITLE: {
    type: String,
    trim: true,
  },
  SUPERVISOR_INITIALS: {
    type: String,
    trim: true,
  },
  SUPERVISOR_FIRST_NAME: {
    type: String,
    required: [true, 'Employee first name is required'],
    trim: true,
  },
  SUPERVISOR_SURNAME: {
    type: String,
    required: [true, 'Employee surname is required'],
    trim: true,
  },
  SUPERVISOR_DESIGNATION: {
    type: String,
    required: [true, 'Employee designation is required'],
    trim: true,
  },
  SUPERVISOR_OFFICE_PHONE: {
    type:   String,
    required: [true, 'Employee Office Phone Number is required'],
    trim: true,
  },
  SUPERVISOR_MOBILE_PHONE: {
    type: String,
    required: [true, 'Employee Mobile Phone Number is required'],
    trim: true,
  },
  email: {
    type: String,
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function (v) {
        return !v || /^\S+@\S+\.\S+$/.test(v);
      },
      message: props => `${props.value} is not a valid email!`,
    },
  },

  SUPERVISOR_SECTION: {
    type: String,
    required: [true, 'Employee Section is required'],
    trim: true,
  },

  SUPERVISOR_DIVISION: {
    type: String,
    required: [true, 'Employee Division is required'],
    trim: true,
  },

  SUPERVISOR_COST_CENTRE_CODE: {
    type: String,
    required: [true, 'Employee Cost Centre Code is required'],
    trim: true,
  },

  SUPERVISOR_GROUP_NAME: {
    type: String,
    required: [true, 'Employee Group Name is required'],
    trim: true,
  },

  SUPERVISOR_SALARY_GRADE: {
    type: String,
    required: [true, 'Employee Salary Grade is required'],
    trim: true,
  },

}, { timestamps: true });

const Supervisor = mongoose.model('Supervisor', supervisorSchema);

module.exports = Supervisor;
