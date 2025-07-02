import React from "react";
import PropTypes from "prop-types";
import { CgAwards } from "react-icons/cg";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const PreviousTrainingSection = ({ 
  selectedRole,
  handleRoleChange,
  handleInputChange, 
  cvData, 
  errors = {},
  setFormErrors,
  darkMode, 
  readOnly 
}) => {
  
  const handleDateChange = (date, fieldName) => {
    handleInputChange({ 
      target: { 
        name: fieldName, 
        value: date 
      } 
    });
  };

  const CustomDateInput = React.forwardRef(({ value, onClick }, ref) => (
    <input
      type="text"
      className={`form-control ${darkMode ? "bg-secondary text-white" : ""}`}
      onClick={onClick}
      ref={ref}
      value={value ? new Date(value).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }) : ''}
      readOnly
      placeholder="mm/dd/yyyy"
    />
  ));

  return (
    <div className={`p-4 rounded mt-4 ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
      {/* Section Header */}
      <div className="d-flex align-items-center gap-2">
        <CgAwards className={`fs-3 ${darkMode ? "text-white" : "text-dark"}`} />
        <h5 className="mb-0">Previous Training at SLT</h5>
      </div>

      <hr className={darkMode ? "border-light mt-3" : "border-dark mt-3"} />

      {/* Radio Buttons for Previous Training */}
      <div className="mb-3">
        <label className="form-label">
          Have you had previous training at SLT? <span className="text-danger">*</span>
        </label>
        <div className="d-flex gap-3">
          {["yes", "no"].map((role) => (
            <div className="form-check" key={role}>
              <input
                type="radio"
                id={`role-${role}`}
                name="selectedRole"
                value={role}
                className="form-check-input"
                onChange={handleRoleChange}
                checked={selectedRole === role}
                disabled={readOnly}
              />
              <label htmlFor={`role-${role}`} className="form-check-label">
                {role === "yes" ? "Yes" : "No"}
              </label>
            </div>
          ))}
        </div>
        {errors?.selectedRole && (
          <div className="text-danger mt-1">
            <small>{errors.selectedRole}</small>
          </div>
        )}
      </div>

      {selectedRole === "yes" && (
        <div>
          <hr className={darkMode ? "border-light" : "border-dark"} />
          <p className="mt-3 fw-semibold">THESE ARE REQUIRED:</p>
          
          <div className={`mb-4 ${darkMode ? "text-white" : "text-dark"}`}>
            
            
            {/* First Row */}
            <div className="row g-3 mb-3">
              <div className="col-md-3">
                <div className="form-group">
                  <label className="form-label">Work Station</label>
                  <input
                    type="text"
                    className={`form-control ${darkMode ? "bg-secondary text-white" : ""}`}
                    placeholder="Enter work station"
                    value={cvData.workStation || ""}
                    onChange={(e) => handleInputChange({ target: { name: "workStation", value: e.target.value }})}
                    disabled={readOnly}
                  />
                </div>
              </div>

              <div className="col-md-2">
                <div className="form-group">
                  <label className="form-label">From</label>
                  <DatePicker
                    selected={cvData.durationFrom}
                    onChange={(date) => handleDateChange(date, "durationFrom")}
                    customInput={<CustomDateInput />}
                    dateFormat="MM/dd/yyyy"
                    disabled={readOnly}
                  />
                </div>
              </div>

              <div className="col-md-2">
                <div className="form-group">
                  <label className="form-label">To</label>
                  <DatePicker
                    selected={cvData.durationTo}
                    onChange={(date) => handleDateChange(date, "durationTo")}
                    customInput={<CustomDateInput />}
                    dateFormat="MM/dd/yyyy"
                    disabled={readOnly}
                  />
                </div>
              </div>

              <div className="col-md-2">
                <div className="form-group">
                  <label className="form-label">Area/Division</label>
                  <input
                    type="text"
                    className={`form-control ${darkMode ? "bg-secondary text-white" : ""}`}
                    placeholder="Area/Division"
                    value={cvData.areaDivision || ""}
                    onChange={(e) => handleInputChange({ target: { name: "areaDivision", value: e.target.value }})}
                    disabled={readOnly}
                  />
                </div>
              </div>

              <div className="col-md-3">
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input
                    type="text"
                    className={`form-control ${darkMode ? "bg-secondary text-white" : ""}`}
                    placeholder="Location"
                    value={cvData.location || ""}
                    onChange={(e) => handleInputChange({ target: { name: "location", value: e.target.value }})}
                    disabled={readOnly}
                  />
                </div>
              </div>
            </div>

            {/* Second Row */}
            <div className="row g-3 mb-3">
              <div className="col-md-3">
                <div className="form-group">
                  <input
                    type="text"
                    className={`form-control ${darkMode ? "bg-secondary text-white" : ""}`}
                    placeholder="Second work station"
                    value={cvData.workStation2 || ""}
                    onChange={(e) => handleInputChange({ target: { name: "workStation2", value: e.target.value }})}
                    disabled={readOnly}
                  />
                </div>
              </div>

              <div className="col-md-2">
                <div className="form-group">
                  <DatePicker
                    selected={cvData.durationFrom2}
                    onChange={(date) => handleDateChange(date, "durationFrom2")}
                    customInput={<CustomDateInput />}
                    dateFormat="MM/dd/yyyy"
                    disabled={readOnly}
                  />
                </div>
              </div>

              <div className="col-md-2">
                <div className="form-group">
                  <DatePicker
                    selected={cvData.durationTo2}
                    onChange={(date) => handleDateChange(date, "durationTo2")}
                    customInput={<CustomDateInput />}
                    dateFormat="MM/dd/yyyy"
                    disabled={readOnly}
                  />
                </div>
              </div>

              <div className="col-md-2">
                <div className="form-group">
                  <input
                    type="text"
                    className={`form-control ${darkMode ? "bg-secondary text-white" : ""}`}
                    placeholder="Second area/division"
                    value={cvData.areaDivision2 || ""}
                    onChange={(e) => handleInputChange({ target: { name: "areaDivision2", value: e.target.value }})}
                    disabled={readOnly}
                  />
                </div>
              </div>

              <div className="col-md-3">
                <div className="form-group">
                  <input
                    type="text"
                    className={`form-control ${darkMode ? "bg-secondary text-white" : ""}`}
                    placeholder="Second location"
                    value={cvData.location2 || ""}
                    onChange={(e) => handleInputChange({ target: { name: "location2", value: e.target.value }})}
                    disabled={readOnly}
                  />
                </div>
              </div>
            </div>

            {/* Third Row */}
            <div className="row g-3">
              <div className="col-md-3">
                <div className="form-group">
                  <input
                    type="text"
                    className={`form-control ${darkMode ? "bg-secondary text-white" : ""}`}
                    placeholder="Third work station"
                    value={cvData.workStation3 || ""}
                    onChange={(e) => handleInputChange({ target: { name: "workStation3", value: e.target.value }})}
                    disabled={readOnly}
                  />
                </div>
              </div>

              <div className="col-md-2">
                <div className="form-group">
                  <DatePicker
                    selected={cvData.durationFrom3}
                    onChange={(date) => handleDateChange(date, "durationFrom3")}
                    customInput={<CustomDateInput />}
                    dateFormat="MM/dd/yyyy"
                    disabled={readOnly}
                  />
                </div>
              </div>

              <div className="col-md-2">
                <div className="form-group">
                  <DatePicker
                    selected={cvData.durationTo3}
                    onChange={(date) => handleDateChange(date, "durationTo3")}
                    customInput={<CustomDateInput />}
                    dateFormat="MM/dd/yyyy"
                    disabled={readOnly}
                  />
                </div>
              </div>

              <div className="col-md-2">
                <div className="form-group">
                  <input
                    type="text"
                    className={`form-control ${darkMode ? "bg-secondary text-white" : ""}`}
                    placeholder="Third area/division"
                    value={cvData.areaDivision3 || ""}
                    onChange={(e) => handleInputChange({ target: { name: "areaDivision3", value: e.target.value }})}
                    disabled={readOnly}
                  />
                </div>
              </div>

              <div className="col-md-3">
                <div className="form-group">
                  <input
                    type="text"
                    className={`form-control ${darkMode ? "bg-secondary text-white" : ""}`}
                    placeholder="Third location"
                    value={cvData.location3 || ""}
                    onChange={(e) => handleInputChange({ target: { name: "location3", value: e.target.value }})}
                    disabled={readOnly}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

PreviousTrainingSection.propTypes = {
  selectedRole: PropTypes.string.isRequired,
  handleRoleChange: PropTypes.func.isRequired,
  cvData: PropTypes.shape({
    workStation: PropTypes.string,
    workStation2: PropTypes.string,
    workStation3: PropTypes.string,
    durationFrom: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.string]),
    durationFrom2: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.string]),
    durationFrom3: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.string]),
    durationTo: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.string]),
    durationTo2: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.string]),
    durationTo3: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.string]),
    areaDivision: PropTypes.string,
    areaDivision2: PropTypes.string,
    areaDivision3: PropTypes.string,
    location: PropTypes.string,
    location2: PropTypes.string,
    location3: PropTypes.string,
    roleData: PropTypes.shape({
      yes: PropTypes.object
    })
  }).isRequired,
  handleInputChange: PropTypes.func.isRequired,
  readOnly: PropTypes.bool,
  darkMode: PropTypes.bool.isRequired,
  errors: PropTypes.object,
  setFormErrors: PropTypes.func.isRequired,
};

PreviousTrainingSection.defaultProps = {
  readOnly: false,
  errors: {},
};

export default PreviousTrainingSection;