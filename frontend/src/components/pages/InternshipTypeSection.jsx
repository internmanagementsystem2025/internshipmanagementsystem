import React from "react";
import PropTypes from "prop-types";
import { CgMail } from "react-icons/cg";

const InternshipTypeSection = ({
  selectedRole,
  handleRoleChange,
  cvData,
  handleInputChange,
  readOnly,
  darkMode,
  errors = {},
}) => {
  return (
    <div
      className={`p-4 rounded mt-4 ${
        darkMode ? "bg-dark text-white" : "bg-light text-dark"
      }`}
    >
      {/* Section Header */}
      <div className="d-flex align-items-center gap-2">
        <CgMail className={`fs-3 ${darkMode ? "text-white" : "text-dark"}`} />
        <h5 className="mb-0">Type of Internship and Qualifications</h5>
      </div>

      <hr className={darkMode ? "border-light mt-3" : "border-dark mt-3"} />

      {/* Role Selection */}
      <div className="mt-3">
        <label className="form-label">
          Apply As <span className="text-danger">*</span>
        </label>
        <div className="d-flex gap-3">
          {["dataEntry", "internship"].map((role) => (
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
                {role === "dataEntry" ? "Data Entry Operator" : "Internship"}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Data Entry Operator Section */}
      {selectedRole === "dataEntry" && (
        <>
          <p className="mt-3 fw-semibold">
            Data Entry Operator Internship requires an IT course including
            Microsoft Office.
          </p>
          <hr className={darkMode ? "border-light" : "border-dark"} />

          {/* Proficiency Levels in Microsoft Office */}
          <p className="mt-3 fw-semibold">Microsoft Office Proficiency (%)</p>
          <div className="row">
            {["msWord", "msExcel", "msPowerPoint"].map((skill, index) => (
              <div key={skill} className="col-md-4 mb-3">
                <label className="form-label">
                  {
                    [
                      "Microsoft Word",
                      "Microsoft Excel",
                      "Microsoft PowerPoint",
                    ][index]
                  }
                  <span className="text-danger">*</span>
                </label>
                <input
                  type="range"
                  id={skill}
                  name={`roleData.dataEntry.proficiency.${skill}`}
                  className="form-range"
                  min="0"
                  max="100"
                  value={cvData.roleData?.dataEntry?.proficiency?.[skill] || 0}
                  onChange={handleInputChange}
                  disabled={readOnly}
                />

                <div>
                  <strong>
                    {cvData.roleData?.dataEntry?.proficiency?.[skill] || 0}%
                  </strong>
                </div>
              </div>
            ))}
          </div>

          <hr className={darkMode ? "border-light" : "border-dark"} />

          {/* O/L Results Section */}
          <p className="mt-3 fw-semibold">O/L RESULTS ARE REQUIRED:</p>
          <div className="row">
            {[
              "language",
              "mathematics",
              "science",
              "english",
              "history",
              "religion",
              "optional1",
              "optional2",
              "optional3",
            ].map((subject) => (
              <div key={subject} className="col-md-4 mb-3">
                <label className="form-label">
                  {subject.charAt(0).toUpperCase() +
                    subject.slice(1).replace(/([A-Z])/g, " $1")}
                  <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  id={subject}
                  name={`roleData.dataEntry.olResults.${subject}`}
                  className={`form-control ${
                    darkMode ? "bg-secondary text-white" : "bg-white text-dark"
                  }`}
                  value={cvData.roleData?.dataEntry?.olResults?.[subject] || ""}
                  onChange={handleInputChange}
                  required={[
                    "language",
                    "mathematics",
                    "science",
                    "english",
                  ].includes(subject)}
                  disabled={readOnly}
                />
              </div>
            ))}
          </div>

          <hr className={darkMode ? "border-light" : "border-dark"} />

          <p className="mt-3 fw-semibold">A/L RESULTS (Optional):</p>
          <div className="row">
            {[
              "aLevelSubject1",
              "aLevelSubject2",
              "aLevelSubject3",
              "git",
              "gk",
            ].map((subject) => (
              <div key={subject} className="col-md-4 mb-3">
                <label className="form-label">
                  {subject.charAt(0).toUpperCase() +
                    subject.slice(1).replace(/([A-Z])/g, " $1")}
                </label>
                <input
                  type="text"
                  id={subject}
                  name={`roleData.dataEntry.alResults.${subject}`}
                  className={`form-control ${
                    darkMode ? "bg-secondary text-white" : "bg-white text-dark"
                  }`}
                  value={cvData.roleData?.dataEntry?.alResults?.[subject] || ""}
                  onChange={handleInputChange}
                  disabled={readOnly}
                />
              </div>
            ))}
          </div>

          {/* Preferred Location & Other Qualifications */}
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">
                Preferred Location <span className="text-danger">*</span>
              </label>
              <select
                id="preferredLocation"
                name="roleData.dataEntry.preferredLocation"
                className={`form-select ${
                  darkMode ? "bg-secondary text-white" : "bg-white text-dark"
                } ${
                  errors?.["roleData.dataEntry.preferredLocation"]
                    ? "is-invalid"
                    : ""
                }`}
                value={cvData.roleData?.dataEntry?.preferredLocation || ""}
                onChange={(e) => {
                  handleInputChange(e); // Use the passed handleInputChange directly
                  // Clear error if it exists
                  if (errors?.["roleData.dataEntry.preferredLocation"]) {
                    setFormErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors["roleData.dataEntry.preferredLocation"];
                      return newErrors;
                    });
                  }
                }}
                disabled={readOnly}
                required
              >
                <option value="">Select Location</option>
                <option value="colombo">Colombo</option>
                <option value="kandy">Kandy</option>
                <option value="galle">Galle</option>
              </select>
              {errors?.preferredLocation && (
                <div className="invalid-feedback">
                  {errors.preferredLocation}
                </div>
              )}
              {/* Add a more visible error message */}
              {errors?.["roleData.dataEntry.preferredLocation"] && (
                <div className="text-danger mt-1">
                  <strong>Please select a location before submitting.</strong>
                </div>
              )}
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Other Qualifications</label>
              <input
                type="text"
                id="otherQualifications"
                name={`roleData.dataEntry.otherQualifications`}
                className={`form-control ${
                  darkMode ? "bg-secondary text-white" : "bg-white text-dark"
                }`}
                value={cvData.roleData?.dataEntry?.otherQualifications || ""}
                onChange={handleInputChange}
                disabled={readOnly}
              />
            </div>
          </div>
        </>
      )}

      {/* Internship Section */}
      {selectedRole === "internship" && (
        <>
          <p className="mt-3 fw-semibold">
            Internships are offered to students pursuing higher education
            programs at recognized institutes that require an internship period
            as part of the program.
          </p>
          <hr className={darkMode ? "border-light" : "border-dark"} />

          <div className="mb-3">
            <label className="form-label">
              Category of Apply <span className="text-danger">*</span>
            </label>
            <select
              id="categoryOfApply"
              name="roleData.internship.categoryOfApply"
              className={`form-select ${
                darkMode ? "bg-secondary text-white" : "bg-white text-dark"
              } ${errors?.categoryOfApply ? "is-invalid" : ""}`}
              value={cvData.roleData?.internship?.categoryOfApply || ""}
              onChange={handleInputChange}
              disabled={readOnly}
              required
            >
              <option value="">Select Category</option>
              <option value="software">Software Development</option>
              <option value="marketing">Marketing</option>
              <option value="design">Design</option>
              <option value="business">Business Development</option>
            </select>
            {errors?.categoryOfApply && (
              <div className="invalid-feedback">{errors.categoryOfApply}</div>
            )}
          </div>

          <div className="mb-3">
            <label className="form-label">
              Higher Education Qualifications
            </label>
            <input
              type="text"
              id="higherEducation"
              name="roleData.internship.higherEducation"
              className={`form-control ${
                darkMode ? "bg-secondary text-white" : "bg-white text-dark"
              }`}
              value={cvData.roleData?.internship?.higherEducation || ""}
              onChange={handleInputChange}
              disabled={readOnly}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Other Qualifications</label>
            <input
              type="text"
              id="otherQualifications"
              name="roleData.internship.otherQualifications"
              className={`form-control ${
                darkMode ? "bg-secondary text-white" : "bg-white text-dark"
              }`}
              value={cvData.roleData?.internship?.otherQualifications || ""}
              onChange={handleInputChange}
              disabled={readOnly}
            />
          </div>
        </>
      )}
    </div>
  );
};

InternshipTypeSection.propTypes = {
  selectedRole: PropTypes.string.isRequired,
  handleRoleChange: PropTypes.func.isRequired,
  cvData: PropTypes.object.isRequired,
  handleInputChange: PropTypes.func.isRequired,
  readOnly: PropTypes.bool,
  darkMode: PropTypes.bool.isRequired,
  errors: PropTypes.object,
  setFormErrors: PropTypes.func.isRequired,
};

InternshipTypeSection.defaultProps = {
  readOnly: false,
  errors: {},
};

export default InternshipTypeSection;
