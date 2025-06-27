import React, { useState, useEffect } from "react";
import logo from "../../../assets/logo.png";
import UserInfoSection from "../../../components/pages/UserInfoSection";
import EmergencySection from "../../../components/pages/EmergencySection";
import PreviousTrainingSection from "../../../components/pages/PreviousTrainingSection";
import InternshipTypeSection from "../../../components/pages/InternshipTypeSection";
import { useNavigate } from "react-router-dom";
import Notification from "../../../components/notifications/Notification";
import AdminUploadDocumentSection from "../../../components/pages/AdminUploadDocumentSection";
import { Form } from "react-bootstrap";

const AdminAddCVs = ({ darkMode }) => {
  const defaultCVData = {
    fullName: "",
    nameWithInitials: "",
    gender: "",
    postalAddress: "",
    referredBy: "",
    district: "",
    birthday: "",
    nic: "",
    mobileNumber: "",
    landPhone: "",
    emailAddress: "",
    institute: "",
    selectedRole: "",
    roleData: {
      dataEntry: {
        language: "",
        mathematics: "",
        science: "",
        english: "",
        history: "",
        religion: "",
        optional1Name: "",
        optional1Result: "",
        optional2Name: "",
        optional2Result: "",
        optional3Name: "",
        optional3Result: "",
        aLevelSubject1Name: "",
        aLevelSubject1Result: "",
        aLevelSubject2Name: "",
        aLevelSubject2Result: "",
        aLevelSubject3Name: "",
        aLevelSubject3Result: "",
        preferredLocation: "",
        otherQualifications: "",
      },
      internship: {
        categoryOfApply: "",
        higherEducation: "",
        otherQualifications: "",
      }
    },
    emergencyContactName1: "",
    emergencyContactNumber1: "",
    emergencyContactName2: "",
    emergencyContactNumber2: "",
    previousTraining: "",
    updatedCv: null,
    nicFile: null,
    policeClearanceReport: null,
    internshipRequestLetter: null,
  };

  const [districts, setDistricts] = useState([]);
  const [institutes, setInstitutes] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [cvData, setCvData] = useState(defaultCVData);
  const [formErrors, setFormErrors] = useState({});
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    variant: "success",
    isLoading: false,
    onClose: null,
  });
  const [formModified, setFormModified] = useState(false);
  const [showBackConfirmation, setShowBackConfirmation] = useState(false);
  const navigate = useNavigate();
  const [autoApprove, setAutoApprove] = useState(false);

  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/districts`);
        if (!response.ok) throw new Error("Failed to fetch districts");
        const data = await response.json();
        setDistricts(data);
      } catch (error) {
        console.error("Error fetching districts:", error);
        setNotification({
          show: true,
          message: "Error fetching districts. Please try again.",
          variant: "danger",
        });
      }
    };

    const fetchInstitutes = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/institutes`);
        if (!response.ok) throw new Error("Failed to fetch institutes");
        const data = await response.json();
        setInstitutes(data.institutes);
      } catch (error) {
        console.error("Error fetching institutes:", error);
        setNotification({
          show: true,
          message: "Error fetching institutes. Please try again.",
          variant: "danger",
        });
      }
    };

    fetchDistricts();
    fetchInstitutes();
  }, []);

  const handleBackClick = () => {
    if (formModified) {
      setShowBackConfirmation(true);
    } else {
      navigate(-1);
    }
  };

  const handleConfirmBack = () => {
    setShowBackConfirmation(false);
    navigate(-1);
  };

  const handleCancelBack = () => {
    setShowBackConfirmation(false);
  };

  const handleRoleChange = (event) => {
    const role = event.target.value;
    setSelectedRole(role);
    setCvData((prevState) => ({
      ...prevState,
      selectedRole: role,
    }));
    setFormModified(true);
    const commonErrors = {};
    Object.entries(formErrors).forEach(([key, value]) => {
      if (!key.includes('roleData')) {
        commonErrors[key] = value;
      }
    });
    setFormErrors(commonErrors);
  };

  // Add these helper functions at the top of the file after imports
  const isLeapYear = (year) => {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  };

  const getDayOfYear = (month, day, year) => {
    const daysInMonth = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let dayOfYear = day;
    for (let i = 0; i < month - 1; i++) {
      dayOfYear += daysInMonth[i];
    }
    return dayOfYear;
  };

  const getDateFromDayOfYear = (dayOfYear, year) => {
    const daysInMonth = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let month = 0;
    let remainingDays = dayOfYear;

    while (remainingDays > daysInMonth[month]) {
      remainingDays -= daysInMonth[month];
      month++;
    }

    return {
      month: month + 1,
      day: remainingDays
    };
  };

  const extractBirthdayFromNIC = (nic) => {
    // Remove any spaces or special characters
    nic = nic.replace(/[^0-9vVxX]/g, '');

    try {
      let year, dayOfYear, gender;

      if (nic.length === 10) {
        // Old NIC format (e.g., 841234567V)
        year = parseInt("19" + nic.substr(0, 2));
        dayOfYear = parseInt(nic.substr(2, 3));
      } else if (nic.length === 12) {
        // New NIC format (e.g., 200419204350)
        year = parseInt(nic.substr(0, 4));
        dayOfYear = parseInt(nic.substr(4, 3));
      } else {
        return { isValid: false, error: "Invalid NIC length" };
      }

      // Determine gender and adjust day number
      gender = dayOfYear > 500 ? "Female" : "Male";
      dayOfYear = dayOfYear > 500 ? dayOfYear - 500 : dayOfYear;

      // Validate day of year
      if (dayOfYear < 1 || dayOfYear > (isLeapYear(year) ? 366 : 365)) {
        return { isValid: false, error: "Invalid day of year" };
      }

      // Convert day of year to date
      const { month, day } = getDateFromDayOfYear(dayOfYear, year);

      // Format date components
      const formattedMonth = month.toString().padStart(2, '0');
      const formattedDay = day.toString().padStart(2, '0');
      const birthday = `${year}-${formattedMonth}-${formattedDay}`;

      return {
        isValid: true,
        birthday,
        gender,
        year,
        month: formattedMonth,
        day: formattedDay
      };
    } catch (error) {
      console.error('Error parsing NIC:', error);
      return { isValid: false, error: "Invalid NIC format" };
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormModified(true);
    
    if (name.includes(".")) {
      const parts = name.split(".");
      setCvData(prevState => {
        const newState = { ...prevState };
        let current = newState;
        
        for (let i = 0; i < parts.length - 1; i++) {
          if (!current[parts[i]]) {
            current[parts[i]] = {};
          }
          current = current[parts[i]];
        }
        
        const lastPart = parts[parts.length - 1];
        
        if (parts.includes("proficiency") && 
            (lastPart === "msWord" || lastPart === "msExcel" || lastPart === "msPowerPoint")) {
          current[lastPart] = parseInt(value) || 0;
        } else {
          current[lastPart] = value;
        }
        
        return newState;
      });
      
      if (formErrors[name]) {
        setFormErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    } else {
      setCvData(prevState => ({
        ...prevState,
        [name]: value
      }));
      
      // Special handling for email validation on change
      if (name === "emailAddress" && value) {
        const emailRegex = /^(?!.*\.\.)(?!.*\.$)(?!^\.)[a-zA-Z0-9.%+-]+@gmail\.com$/;
        if (!emailRegex.test(value)) {
          setFormErrors(prev => ({
            ...prev,
            emailAddress: "Please enter a valid email address (e.g., example@domain.com)"
          }));
        } else if (formErrors.emailAddress) {
          setFormErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.emailAddress;
            return newErrors;
          });
        }
      }
      
      if (formErrors[name]) {
        setFormErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormModified(true);
    setCvData((prevState) => ({
      ...prevState,
      [name]: files[0] || null,
    }));
    
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    const requiredFields = [
      'fullName', 'nameWithInitials', 'gender', 'district', 
      'birthday', 'nic', 'mobileNumber', 'emailAddress', 'institute'
    ];
    
    // Basic required fields validation
    requiredFields.forEach(field => {
      if (!cvData[field]) {
        errors[field] = "This field is required";
      }
    });

    // Email validation
    if (!cvData.emailAddress) {
      errors.emailAddress = "Email address is required";
    } else {
      const emailRegex =/^(?!.*\.\.)(?!.*\.$)(?!^\.)[a-zA-Z0-9.%+-]+@gmail\.com$/;
      if (!emailRegex.test(cvData.emailAddress)) {
        errors.emailAddress = "Please enter a valid email address (e.g., example@domain.com)";
      }
    }

    // NIC validation
    if (!cvData.nic) {
      errors.nic = "NIC is required";
    } else {
      const nicRegex = /^([0-9]{9}[vVxX]|[0-9]{12})$/;
      if (!nicRegex.test(cvData.nic)) {
        errors.nic = "Please enter a valid NIC number (e.g., 123456789V or 123456789012)";
      }
    }

    // Mobile number validation
    if (!cvData.mobileNumber) {
      errors.mobileNumber = "Mobile number is required";
    } else {
      const mobileRegex = /^0[0-9]{9}$/;
      if (!mobileRegex.test(cvData.mobileNumber)) {
        errors.mobileNumber = "Please enter a valid mobile number (e.g., 0712345678)";
      }
    }

    // Role selection validation
    if (!cvData.selectedRole) {
      errors.selectedRole = "Please select a role";
    }
    
    // Data Entry specific validations
    if (cvData.selectedRole === "dataEntry") {
      const requiredSubjects = ["language", "mathematics", "science", "english"];
      requiredSubjects.forEach(subject => {
        if (!cvData.roleData?.dataEntry?.[subject]) {
          errors[`roleData.dataEntry.${subject}`] = "This field is required";
        }
      });
      
      if (!cvData.roleData?.dataEntry?.preferredLocation) {
        errors["roleData.dataEntry.preferredLocation"] = "Please select a preferred location";
      }
    }
    
    // Internship specific validations
    if (cvData.selectedRole === "internship") {
      if (!cvData.roleData?.internship?.categoryOfApply) {
        errors["roleData.internship.categoryOfApply"] = "Please select a category";
      }
    }

    // Emergency contact validation
    if (!cvData.emergencyContactName1 || !cvData.emergencyContactNumber1) {
      errors.emergencyContactName1 = "At least one emergency contact is required";
      errors.emergencyContactNumber1 = "At least one emergency contact is required";
    }

  
    // File validations
    if (!cvData.updatedCv) {
      errors.updatedCv = "CV file is required";
    }
    if (!cvData.nicFile) {
      errors.nicFile = "NIC copy is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setNotification({
        show: true,
        message: "Please fill in all required fields and correct any errors.",
        variant: "danger",
      });
      
      const firstErrorElement = document.querySelector('.is-invalid');
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setNotification({
        show: true,
        message: "You are not logged in. Please log in and try again.",
        variant: "danger",
      });
      return;
    }

    const formData = new FormData();
    formData.append("autoApprove", autoApprove);
    formData.append("createdByAdmin", true);

    const basicFields = [
      'fullName', 'nameWithInitials', 'gender', 'postalAddress', 'referredBy',
      'district', 'birthday', 'nic', 'mobileNumber', 'landPhone', 'emailAddress',
      'institute', 'selectedRole', 'emergencyContactName1', 'emergencyContactNumber1',
      'emergencyContactName2', 'emergencyContactNumber2', 'previousTraining'
    ];
    
    basicFields.forEach(field => {
      if (cvData[field] !== undefined && cvData[field] !== null) {
        formData.append(field, cvData[field]);
      }
    });

    if (cvData.selectedRole === 'dataEntry') {
      const dataEntryData = cvData.roleData?.dataEntry || {};
      
      const olSubjects = ['language', 'mathematics', 'science', 'english', 'history', 'religion'];
      olSubjects.forEach(subject => {
        formData.append(subject, dataEntryData[subject] || '');
      });
      
      for (let i = 1; i <= 3; i++) {
        formData.append(`optional${i}Name`, dataEntryData[`optional${i}Name`] || '');
        formData.append(`optional${i}Result`, dataEntryData[`optional${i}Result`] || '');
      }
      
      for (let i = 1; i <= 3; i++) {
        formData.append(`aLevelSubject${i}Name`, dataEntryData[`aLevelSubject${i}Name`] || '');
        formData.append(`aLevelSubject${i}Result`, dataEntryData[`aLevelSubject${i}Result`] || '');
      }
      
      formData.append('preferredLocation', dataEntryData.preferredLocation || '');
      formData.append('otherQualifications', dataEntryData.otherQualifications || '');
      
      if (dataEntryData.proficiency) {
        formData.append('msWordProficiency', dataEntryData.proficiency.msWord || '0');
        formData.append('msExcelProficiency', dataEntryData.proficiency.msExcel || '0');
        formData.append('msPowerPointProficiency', dataEntryData.proficiency.msPowerPoint || '0');
      }
    } 
    else if (cvData.selectedRole === 'internship') {
      const internshipData = cvData.roleData?.internship || {};
      formData.append('categoryOfApply', internshipData.categoryOfApply || '');
      formData.append('higherEducation', internshipData.higherEducation || '');
      formData.append('otherQualifications', internshipData.otherQualifications || '');
    }

    const fileFields = ['updatedCv', 'nicFile', 'policeClearanceReport', 'internshipRequestLetter'];
    fileFields.forEach(field => {
      if (cvData[field]) {
        formData.append(field, cvData[field]);
      }
    });

    try {
      setNotification({
        show: true,
        message: "Submitting CV...",
        variant: "info",
        isLoading: true,
      });

      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/cvs/addcv`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setFormModified(false);
        setNotification({
          show: true,
          message: "CV successfully added!",
          variant: "success",
          isLoading: false,
          onClose: () => {
            navigate("/admin-home", { replace: true });
          }
        });
        
        setTimeout(() => {
          navigate("/admin-home", { replace: true });
        }, 1500);
      } else {
        console.error("Failed to submit CV:", result);
        let errorMessage = "Failed to submit CV: ";
        
        if (typeof result === 'object') {
          if (result.message) {
            errorMessage += result.message;
          } else if (result.error) {
            errorMessage += result.error;
          } else if (result.errors && Array.isArray(result.errors)) {
            errorMessage += result.errors.map(e => e.message || e.field).join(', ');
          } else {
            errorMessage += JSON.stringify(result);
          }
        } else {
          errorMessage += "Unknown error";
        }
        
        setNotification({
          show: true,
          message: errorMessage,
          variant: "danger",
          isLoading: false,
        });
      }
    } catch (error) {
      console.error("Error submitting CV:", error);
      setNotification({
        show: true,
        message: `Error submitting CV: ${error.message || "Unknown error"}`,
        variant: "danger",
        isLoading: false,
      });
    }
  };

  return (
    <div className={`d-flex flex-column min-vh-100 ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
      <div className="text-center mt-4 mb-3">
        <img src={logo} alt="Company Logo" className="mx-auto d-block" style={{ height: "50px" }} />
        <h3 className="mt-3">ADD NEW CV</h3>
      </div>

      <main className={`container p-4 rounded shadow ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"} mb-5`}>
        <div className={`p-4 border rounded shadow-sm ${darkMode ? "border-light" : "border-secondary"}`}>
          <h2 className="text-start">New CV</h2>
          <p className="text-start">You can add a new CV and later schedule an interview for it.</p>
          <hr />

          <form onSubmit={handleSubmit}>
            <UserInfoSection
              districts={districts}
              institutes={institutes}
              cvData={cvData}
              handleInputChange={handleInputChange}
              darkMode={darkMode}
              errors={formErrors}
              setFormErrors={setFormErrors}
            />
            <InternshipTypeSection
              selectedRole={selectedRole}
              handleRoleChange={handleRoleChange}
              cvData={cvData}
              handleInputChange={handleInputChange}
              darkMode={darkMode}
              errors={formErrors}
              setFormErrors={setFormErrors}
            />
            <EmergencySection 
              cvData={cvData} 
              handleInputChange={handleInputChange} 
              darkMode={darkMode}
              errors={formErrors}
              setFormErrors={setFormErrors}
            />
            <PreviousTrainingSection 
              cvData={cvData} 
              handleInputChange={handleInputChange} 
              darkMode={darkMode}
              errors={formErrors}
              setFormErrors={setFormErrors}
            />
            <AdminUploadDocumentSection
              handleFileChange={handleFileChange}
              cvData={cvData}
              darkMode={darkMode}
              handleInputChange={handleInputChange}
              errors={formErrors}
              setFormErrors={setFormErrors}
            />
 
            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                id="auto-approve-switch"
                label="Approve this CV immediately"
                checked={autoApprove}
                onChange={(e) => setAutoApprove(e.target.checked)}
              />
              <Form.Text className="text-muted">
                Toggle to approve this CV immediately. Otherwise, it will need
                manual approval.
              </Form.Text>
            </Form.Group>

            <div className="d-flex flex-wrap gap-2 justify-content-between mt-4">
              <button 
                type="button" 
                className={`btn ${darkMode ? "btn-outline-light" : "btn-outline-secondary"} px-5`}
                onClick={handleBackClick}
              >
                Back
              </button>
              
              <button 
                type="submit" 
                className={`btn ${darkMode ? "btn-primary" : "btn-success"} px-5`}
              >
                Submit CV
              </button>
            </div>
          </form>
        </div>
      </main>

      {showBackConfirmation && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
             style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1050 }}>
          <div className={`card ${darkMode ? "bg-dark text-white" : "bg-white"}`} style={{ maxWidth: '400px' }}>
            <div className="card-header">
              <h5>Unsaved Changes</h5>
            </div>
            <div className="card-body">
              <p>You have unsaved changes. Are you sure you want to go back?</p>
              <div className="d-flex justify-content-end gap-2">
                <button 
                  className={`btn ${darkMode ? "btn-outline-light" : "btn-outline-secondary"}`}
                  onClick={handleCancelBack}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-danger" 
                  onClick={handleConfirmBack}
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Notification
        show={notification.show}
        onClose={() => {
          setNotification({ ...notification, show: false });
          if (notification.onClose && typeof notification.onClose === 'function') {
            notification.onClose();
          }
        }}
        message={notification.message}
        variant={notification.variant}
        isLoading={notification.isLoading}
      />
    </div>
  );
};

export default AdminAddCVs;