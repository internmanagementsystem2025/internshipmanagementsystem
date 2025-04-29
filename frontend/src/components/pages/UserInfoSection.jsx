import React from "react";
import PropTypes from "prop-types";
import { CgProfile } from "react-icons/cg";

const UserInfoSection = ({
  districts,
  institutes,
  cvData,
  handleInputChange,
  readOnly,
  darkMode,
  errors = {}, // Add errors prop
}) => {
  return (
    <div
      className={`p-4 rounded mt-4 ${
        darkMode ? "bg-dark text-white" : "bg-light text-dark"
      }`}
    >
      {/* Section Header */}
      <div className="d-flex align-items-center gap-2">
        <CgProfile
          className={`fs-3 ${darkMode ? "text-white" : "text-dark"}`}
        />
        <h5 className="mb-0">About User</h5>
      </div>

      <hr className={darkMode ? "border-light mt-3" : "border-dark mt-3"} />

      {/* Gender */}
      <div className="mb-3">
        <label className="form-label">
          Gender <span className="text-danger">*</span>
        </label>
        <div className="d-flex gap-3">
          <div className="form-check form-check-inline">
            <input
              className={`form-check-input ${
                errors.gender ? "is-invalid" : ""
              }`}
              type="radio"
              id="gender-male"
              name="gender"
              value="male"
              checked={cvData.gender === "male"}
              onChange={handleInputChange}
              disabled={readOnly}
            />
            <label className="form-check-label" htmlFor="gender-male">
              Male
            </label>
          </div>
          <div className="form-check form-check-inline">
            <input
              className={`form-check-input ${
                errors.gender ? "is-invalid" : ""
              }`}
              type="radio"
              id="gender-female"
              name="gender"
              value="female"
              checked={cvData.gender === "female"}
              onChange={handleInputChange}
              disabled={readOnly}
            />
            <label className="form-check-label" htmlFor="gender-female">
              Female
            </label>
          </div>
        </div>
        {errors.gender && (
          <div className="invalid-feedback d-block">{errors.gender}</div>
        )}
      </div>

      {/* Full Name & Name with Initials */}
      <div className="row">
        <div className="col-md-6 mb-3">
          <label className="form-label">
            Full Name <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            name="fullName"
            className={`form-control ${
              darkMode ? "bg-secondary text-white" : "bg-white text-dark"
            } ${errors.fullName ? "is-invalid" : ""}`}
            placeholder="Enter full name"
            value={cvData.fullName}
            onChange={handleInputChange}
            required
            disabled={readOnly}
          />
          {errors.fullName && (
            <div className="invalid-feedback">{errors.fullName}</div>
          )}
        </div>
        <div className="col-md-6 mb-3">
          <label className="form-label">
            Name with Initials <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            name="nameWithInitials"
            className={`form-control ${
              darkMode ? "bg-secondary text-white" : "bg-white text-dark"
            } ${errors.nameWithInitials ? "is-invalid" : ""}`}
            placeholder="Enter initials"
            value={cvData.nameWithInitials}
            onChange={handleInputChange}
            required
            disabled={readOnly}
          />
          {errors.nameWithInitials && (
            <div className="invalid-feedback">{errors.nameWithInitials}</div>
          )}
        </div>
      </div>

      {/* Postal Address & District */}
      <div className="row">
        <div className="col-md-6 mb-3">
          <label className="form-label">
            Postal Address <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            name="postalAddress"
            className={`form-control ${
              darkMode ? "bg-secondary text-white" : "bg-white text-dark"
            } ${errors.postalAddress ? "is-invalid" : ""}`}
            placeholder="Enter postal address"
            value={cvData.postalAddress}
            onChange={handleInputChange}
            required
            disabled={readOnly}
          />
          {errors.postalAddress && (
            <div className="invalid-feedback">{errors.postalAddress}</div>
          )}
        </div>
        <div className="col-md-6 mb-3">
          <label className="form-label">
            District <span className="text-danger">*</span>
          </label>
          <select
            name="district"
            className={`form-select ${
              darkMode ? "bg-secondary text-white" : "bg-white text-dark"
            } ${errors.district ? "is-invalid" : ""}`}
            value={cvData.district}
            onChange={handleInputChange}
            required
            disabled={readOnly}
          >
            <option value="">Select District</option>
            {districts?.length > 0 ? (
              districts.map((district) => (
                <option
                  key={district.id || district.district_name}
                  value={district.id}
                >
                  {district.district_name}
                </option>
              ))
            ) : (
              <option value="">No districts available</option>
            )}
          </select>
          {errors.district && (
            <div className="invalid-feedback">{errors.district}</div>
          )}
        </div>
      </div>

      {/* Birthday & NIC */}
      <div className="row">
        <div className="col-md-6 mb-3">
          <label className="form-label">
            Birthday <span className="text-danger">*</span>
          </label>
          <input
            type="date"
            name="birthday"
            className={`form-control ${
              darkMode ? "bg-secondary text-white" : "bg-white text-dark"
            } ${errors.birthday ? "is-invalid" : ""}`}
            value={cvData.birthday}
            onChange={handleInputChange}
            required
            disabled={readOnly}
          />
          {errors.birthday && (
            <div className="invalid-feedback">{errors.birthday}</div>
          )}
        </div>

        <div className="col-md-6 mb-3">
          <label className="form-label">
            NIC <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            name="nic"
            className={`form-control ${
              darkMode ? "bg-secondary text-white" : "bg-white text-dark"
            } ${errors.nic ? "is-invalid" : ""}`}
            placeholder="Enter NIC"
            value={cvData.nic}
            onChange={handleInputChange}
            required
            disabled={readOnly}
          />
          {errors.nic && <div className="invalid-feedback">{errors.nic}</div>}
        </div>
      </div>

      {/* Mobile & Landline */}
      <div className="row">
        <div className="col-md-6 mb-3">
          <label className="form-label">
            Mobile Number <span className="text-danger">*</span>
          </label>
          <input
            type="tel"
            name="mobileNumber"
            className={`form-control ${
              darkMode ? "bg-secondary text-white" : "bg-white text-dark"
            } ${errors.mobileNumber ? "is-invalid" : ""}`}
            placeholder="Enter mobile number"
            value={cvData.mobileNumber}
            onChange={handleInputChange}
            required
            pattern="^\d{10}$"
            disabled={readOnly}
          />
          {errors.mobileNumber && (
            <div className="invalid-feedback">{errors.mobileNumber}</div>
          )}
        </div>
        <div className="col-md-6 mb-3">
          <label className="form-label">Landline</label>
          <input
            type="tel"
            name="landPhone"
            className={`form-control ${
              darkMode ? "bg-secondary text-white" : "bg-white text-dark"
            }`}
            placeholder="Enter landline number"
            value={cvData.landPhone}
            onChange={handleInputChange}
            disabled={readOnly}
          />
        </div>
      </div>

      {/* Email & Institute */}
      <div className="row">
        <div className="col-md-6 mb-3">
          <label className="form-label">
            Email <span className="text-danger">*</span>
          </label>
          <input
            type="email"
            name="emailAddress"
            className={`form-control ${
              darkMode ? "bg-secondary text-white" : "bg-white text-dark"
            } ${errors.emailAddress ? "is-invalid" : ""}`}
            placeholder="Enter email"
            value={cvData.emailAddress}
            onChange={handleInputChange}
            required
            disabled={readOnly}
          />
          {errors.emailAddress && (
            <div className="invalid-feedback">{errors.emailAddress}</div>
          )}
        </div>
        <div className="col-md-6 mb-3">
          <label className="form-label">
            Institute <span className="text-danger">*</span>
          </label>
          <select
            name="institute"
            className={`form-select ${
              darkMode ? "bg-secondary text-white" : "bg-white text-dark"
            } ${errors.institute ? "is-invalid" : ""}`}
            value={cvData.institute}
            onChange={handleInputChange}
            required
            disabled={readOnly}
          >
            <option value="">Select Institute</option>
            {institutes?.length > 0 ? (
              institutes.map((institute) => (
                <option
                  key={institute.id || institute.name}
                  value={institute.id}
                >
                  {institute.name}
                </option>
              ))
            ) : (
              <option value="">No institutes available</option>
            )}
          </select>
          {errors.institute && (
            <div className="invalid-feedback">{errors.institute}</div>
          )}
        </div>
      </div>
    </div>
  );
};

UserInfoSection.propTypes = {
  districts: PropTypes.array.isRequired,
  institutes: PropTypes.array.isRequired,
  cvData: PropTypes.object.isRequired,
  handleInputChange: PropTypes.func.isRequired,
  readOnly: PropTypes.bool,
  darkMode: PropTypes.bool.isRequired,
  errors: PropTypes.object, // Add errors to propTypes
};

UserInfoSection.defaultProps = {
  readOnly: false,
  errors: {}, // Default empty errors object
};

export default UserInfoSection;
