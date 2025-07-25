import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { CgProfile } from "react-icons/cg";
import { validateSriLankanNIC, extractBirthdayFromNIC } from "../../utils/nicValidator";
import { validateSriLankanMobile, formatSriLankanMobile } from "../../utils/phoneValidator";

const UserInfoSection = ({
  districts,
  institutes,
  cvData,
  handleInputChange,
  readOnly,
  darkMode,
  errors = {},
  setFormErrors,
}) => {
  // State for institute search
  const [instituteSearch, setInstituteSearch] = useState('');
  const [showInstituteDropdown, setShowInstituteDropdown] = useState(false);
  const [filteredInstitutes, setFilteredInstitutes] = useState([]);
  const [selectedInstituteId, setSelectedInstituteId] = useState('');

  useEffect(() => {
  // When cvData.institute changes (e.g., after discard), update the search box
  setInstituteSearch(cvData.institute || "");
}, [cvData.institute]);

  // Initialize institute data on component mount
  useEffect(() => {
    if (institutes?.length > 0) {
      // Sort institutes alphabetically, pushing "Other" to bottom
      const sortedInstitutes = [...institutes].sort((a, b) => {
        const nameA = a.name?.toLowerCase() || '';
        const nameB = b.name?.toLowerCase() || '';
        if (nameA === 'other') return 1;
        if (nameB === 'other') return -1;
        return nameA.localeCompare(nameB);
      });
      setFilteredInstitutes(sortedInstitutes);

      // Set initial selected institute name if there's a value
      if (cvData.institute) {
        const selectedInstitute = institutes.find(inst => 
          inst.id === cvData.institute || inst._id === cvData.institute || inst.name === cvData.institute
        );
        if (selectedInstitute) {
          setInstituteSearch(selectedInstitute.name || '');
          setSelectedInstituteId(selectedInstitute.id || selectedInstitute._id || cvData.institute);
        } else {
          // If no matching institute found, treat cvData.institute as a custom name
          setInstituteSearch(cvData.institute);
          setSelectedInstituteId('');
        }
      }
    }
  }, [institutes, cvData.institute]);

  // Filter institutes based on search
  const handleInstituteSearch = (searchTerm) => {
    setInstituteSearch(searchTerm);
    
    if (!searchTerm.trim()) {
      // If search is empty, show all institutes
      const sortedInstitutes = [...institutes].sort((a, b) => {
        const nameA = a.name?.toLowerCase() || '';
        const nameB = b.name?.toLowerCase() || '';
        if (nameA === 'other') return 1;
        if (nameB === 'other') return -1;
        return nameA.localeCompare(nameB);
      });
      setFilteredInstitutes(sortedInstitutes);
    } else {
      // Filter institutes based on search term
      const filtered = institutes.filter(institute =>
        institute.name?.toLowerCase().includes(searchTerm.toLowerCase())
      ).sort((a, b) => {
        const nameA = a.name?.toLowerCase() || '';
        const nameB = b.name?.toLowerCase() || '';
        if (nameA === 'other') return 1;
        if (nameB === 'other') return -1;
        return nameA.localeCompare(nameB);
      });
      setFilteredInstitutes(filtered);
    }
    
    setShowInstituteDropdown(true);
    
    // Clear selected institute if search doesn't match any existing institute
    const exactMatch = institutes.find(inst => 
      inst.name?.toLowerCase() === searchTerm.toLowerCase()
    );
    if (!exactMatch) {
      setSelectedInstituteId('');
    }
  };

  // Handle institute selection from dropdown
  const handleInstituteSelect = (institute) => {
    const instituteName = institute.name || '';
    const instituteId = institute.id || institute._id || instituteName;
    
    setInstituteSearch(instituteName);
    setSelectedInstituteId(instituteId);
    setShowInstituteDropdown(false);
    
    // Update the form data - use ID if available, otherwise use name
    const event = {
      target: {
        name: 'institute',
        value: instituteId
      }
    };
    handleInputChange(event);
    
    // Clear institute errors
    if (setFormErrors) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.institute;
        return newErrors;
      });
    }
  };

  // Handle institute input focus
  const handleInstituteInputFocus = () => {
    if (!readOnly) {
      setShowInstituteDropdown(true);
    }
  };

  // Handle institute input blur
  const handleInstituteInputBlur = () => {
    // Delay hiding dropdown to allow for clicks
    setTimeout(() => {
      // If user typed a custom institute name that doesn't exist in dropdown
      if (instituteSearch && !selectedInstituteId) {
        const event = {
          target: {
            name: 'institute',
            value: instituteSearch
          }
        };
        handleInputChange(event);
      }
    }, 200);
  };

  // Handle clicking outside the dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.institute-search-container')) {
        setShowInstituteDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Format date for consistent comparison
  const formatDateToYYYYMMDD = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  // Calculate age from a date of birth
  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  // Handle NIC validation when either NIC or birthday changes
  useEffect(() => {
    if (cvData.nic && setFormErrors) {
      const nicFormatValid = 
        (cvData.nic.length === 10 && /^[0-9]{9}[VvXx]$/.test(cvData.nic)) || 
        (cvData.nic.length === 12 && /^[0-9]{12}$/.test(cvData.nic));
      
      if (!nicFormatValid) {
        setFormErrors(prev => ({
          ...prev,
          nic: 'Invalid NIC format. Must be 9 digits + V/X or 12 digits'
        }));
        return;
      }
      
      // Extract birthday from NIC
      const extractedBirthday = extractBirthdayFromNIC(cvData.nic);
      
      if (!extractedBirthday) {
        setFormErrors(prev => ({
          ...prev,
          nic: 'Could not extract valid birth date from NIC'
        }));
        return;
      }
      
      // Check age constraints based on extracted birthday
      const age = calculateAge(extractedBirthday);
      if (age < 0 || age > 300) {
        setFormErrors(prev => ({
          ...prev,
          nic: `Age must be between 18-30 years. Current age: ${age}`
        }));
        return;
      }
      
      // If we have a birthday value already, validate it matches NIC
      if (cvData.birthday) {
        const formattedBirthday = formatDateToYYYYMMDD(cvData.birthday);
        
        if (formattedBirthday !== extractedBirthday) {
          setFormErrors(prev => ({
            ...prev,
            birthday: 'Birthday does not match the date extracted from NIC'
          }));
        } else {
          // Clear birthday error if it matches
          setFormErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.birthday;
            delete newErrors.nic;
            return newErrors;
          });
        }
      } else {
        // Clear NIC errors if validation passes
        setFormErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.nic;
          return newErrors;
        });
      }
    }
  }, [cvData.nic, cvData.birthday, setFormErrors]);

  // Handle NIC input with auto-birthday extraction
  const handleNICChange = (e) => {
    const { value } = e.target;
    
    // Update the NIC value through the parent component
    handleInputChange(e);
    
    // If there's a valid NIC format, try to extract birthday
    const nicFormatValid = 
      (value.length === 10 && /^[0-9]{9}[VvXx]$/.test(value)) || 
      (value.length === 12 && /^[0-9]{12}$/.test(value));
      
    if (nicFormatValid) {
      const extractedBirthday = extractBirthdayFromNIC(value);
      
      if (extractedBirthday) {
        // Check if we need to update the birthday field
        if (!cvData.birthday || formatDateToYYYYMMDD(cvData.birthday) !== extractedBirthday) {
          const birthdayEvent = {
            target: {
              name: 'birthday',
              value: extractedBirthday
            }
          };
          handleInputChange(birthdayEvent);
        }
        
        // If NIC validation reveals gender, update it automatically
        const nicValidation = validateSriLankanNIC(value);
        if (nicValidation && nicValidation.gender && !cvData.gender) {
          const genderEvent = {
            target: {
              name: 'gender',
              value: nicValidation.gender
            }
          };
          handleInputChange(genderEvent);
        }
      }
    }
  };

  // Handle birthday input
  const handleBirthdayChange = (e) => {
    handleInputChange(e);
    
    // Check age constraints when birthday is entered manually
    if (e.target.value && setFormErrors) {
      const age = calculateAge(e.target.value);
      
      if (age < 0 || age > 300) {
        setFormErrors(prev => ({
          ...prev,
          birthday: `Age must be between 18-30 years. Current age: ${age}`
        }));
      } else {
        setFormErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.birthday;
          return newErrors;
        });
        
        // If NIC exists, check if birthday matches
        if (cvData.nic) {
          const extractedBirthday = extractBirthdayFromNIC(cvData.nic);
          if (extractedBirthday && formatDateToYYYYMMDD(e.target.value) !== extractedBirthday) {
            setFormErrors(prev => ({
              ...prev,
              birthday: 'Birthday does not match the date extracted from NIC'
            }));
          }
        }
      }
    }
  };

  // Handle mobile number input with Sri Lankan validation
  const handleMobileChange = (e) => {
    const { value } = e.target;
    
    // Update the mobile value through the parent component
    handleInputChange(e);
    
    // Validate Sri Lankan mobile number format
    if (value && setFormErrors) {
      const mobileValidation = validateSriLankanMobile(value);
      
      if (!mobileValidation.isValid) {
        setFormErrors(prev => ({
          ...prev,
          mobileNumber: mobileValidation.error
        }));
      } else {
        // Clear errors if validation passes
        setFormErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.mobileNumber;
          return newErrors;
        });
      }
    }
  };

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
            value={cvData.fullName || ''}
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
            value={cvData.nameWithInitials || ''}
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
            value={cvData.postalAddress || ''}
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
            value={cvData.district || ''}
            onChange={handleInputChange}
            required
            disabled={readOnly}
          >
            <option value="">Select District</option>
            {districts?.length > 0 ? (
              districts
                .sort((a, b) => a.district_name.localeCompare(b.district_name))
                .map((district) => (
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

      {/* NIC & Birthday */}
      <div className="row">
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
            placeholder="Enter NIC (e.g., 123456789V or 199912345678)"
            value={cvData.nic || ''}
            onChange={handleNICChange}
            required
            disabled={readOnly}
          />
          {errors.nic && <div className="invalid-feedback">{errors.nic}</div>}
          {!errors.nic && cvData.nic && (
            <small>
              {cvData.nic.length === 10 ? "Old format (9 digits + V/X)" : "New format (12 digits)"}
            </small>
          )}
        </div>
        
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
            value={cvData.birthday || ''}
            onChange={handleBirthdayChange}
            required
            disabled={readOnly}
          />
          {errors.birthday && (
            <div className="invalid-feedback">{errors.birthday}</div>
          )}
          {cvData.nic && cvData.birthday && !errors.birthday && !errors.nic && (
            <small className="text-success">Birthday matches NIC</small>
          )}
          {cvData.birthday && !errors.birthday && (
            <small className="text-info d-block">
              Age: {calculateAge(cvData.birthday)} years
            </small>
          )}
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
            placeholder="Enter mobile number (e.g., 07XXXXXXXX or +947XXXXXXXX)"
            value={cvData.mobileNumber || ''}
            onChange={handleMobileChange}
            required
            disabled={readOnly}
          />
          {errors.mobileNumber && (
            <div className="invalid-feedback">{errors.mobileNumber}</div>
          )}
          {cvData.mobileNumber && !errors.mobileNumber && validateSriLankanMobile && (
            <small>
              Format: {cvData.mobileNumber.startsWith('+') ? 'International' : 
              cvData.mobileNumber.startsWith('07') ? 'Local' : 'Custom'}
              {validateSriLankanMobile(cvData.mobileNumber).provider && 
                ` (Possible provider: ${validateSriLankanMobile(cvData.mobileNumber).provider})`
              }
            </small>
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
            value={cvData.landPhone || ''}
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
            value={cvData.emailAddress || ''}
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
          <div className="institute-search-container position-relative">
            <input
              type="text"
              name="institute"
              className={`form-control ${
                darkMode ? "bg-secondary text-white" : "bg-white text-dark"
              } ${errors.institute ? "is-invalid" : ""}`}
              placeholder="Search or type institute name..."
              value={instituteSearch}
              onChange={(e) => handleInstituteSearch(e.target.value)}
              onFocus={handleInstituteInputFocus}
              onBlur={handleInstituteInputBlur}
              disabled={readOnly}
              autoComplete="off"
              required
            />
            
            {/* Dropdown */}
            {showInstituteDropdown && !readOnly && filteredInstitutes.length > 0 && (
              <div 
                className={`position-absolute w-100 shadow-lg border rounded-bottom ${
                  darkMode ? "bg-dark border-secondary" : "bg-white border-light"
                }`}
                style={{
                  top: '100%',
                  zIndex: 1000,
                  maxHeight: '200px',
                  overflowY: 'auto'
                }}
              >
                {filteredInstitutes.map((institute) => (
                  <div
                    key={institute.id || institute._id || institute.name}
                    className={`p-2 cursor-pointer border-bottom ${
                      darkMode ? "text-white border-secondary hover-bg-secondary" : "text-dark border-light hover-bg-light"
                    }`}
                    style={{ cursor: 'pointer' }}
                    onMouseDown={(e) => {
                      e.preventDefault(); // Prevent input blur
                      handleInstituteSelect(institute);
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = darkMode ? '#6c757d' : '#f8f9fa';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                    }}
                  >
                    {institute.name || 'Unnamed Institute'}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {errors.institute && (
            <div className="invalid-feedback d-block">{errors.institute}</div>
          )}
          
          {/* Show helpful text */}
          <small className="text-muted">
            Start typing to search for institutes or enter a custom name
          </small>
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
  errors: PropTypes.object,
  setFormErrors: PropTypes.func.isRequired
};

UserInfoSection.defaultProps = {
  readOnly: false,
  errors: {},
};

export default UserInfoSection;