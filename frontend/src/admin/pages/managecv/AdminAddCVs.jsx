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
    // Use roleData structure that matches backend
    roleData: {
      dataEntry: {
        proficiency: {
          msWord: 0,
          msExcel: 0,
          msPowerPoint: 0,
        },
        olResults: {
          language: "",
          mathematics: "",
          science: "",
          english: "",
          history: "",
          religion: "",
          optional1: "",
          optional2: "",
          optional3: "",
        },
        alResults: {
          aLevelSubject1: "",
          aLevelSubject2: "",
          aLevelSubject3: "",
          git: "",
          gk: "",
        },
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
  });
  const navigate = useNavigate();
  const [autoApprove, setAutoApprove] = useState(false);

  // Fetch districts and institutes on mount
  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/districts");
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
        const response = await fetch("http://localhost:5000/api/institutes");
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

  // Handle Role Change
  const handleRoleChange = (event) => {
    const role = event.target.value;
    setSelectedRole(role);
    setCvData((prevState) => ({
      ...prevState,
      selectedRole: role,
    }));
    // Clear role-specific errors when changing roles
    setFormErrors({});
  };

  // Handle Input Change with improved nested object handling
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested paths like "roleData.dataEntry.proficiency.msWord"
    if (name.includes(".")) {
      const parts = name.split(".");
      setCvData(prevState => {
        const newState = { ...prevState };
        let current = newState;
        
        // Navigate to the deepest level except the last part
        for (let i = 0; i < parts.length - 1; i++) {
          if (!current[parts[i]]) {
            current[parts[i]] = {};
          }
          current = current[parts[i]];
        }
        
        // Set the value at the last part
        const lastPart = parts[parts.length - 1];
        
        // Handle numeric values for proficiency
        if (parts.includes("proficiency") && 
            (lastPart === "msWord" || lastPart === "msExcel" || lastPart === "msPowerPoint")) {
          current[lastPart] = parseInt(value) || 0;
        } else {
          current[lastPart] = value;
        }
        
        return newState;
      });
    } else {
      // Handle simple fields
      setCvData(prevState => ({
        ...prevState,
        [name]: value
      }));
    }
  };

  // Handle File Upload
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setCvData((prevState) => ({
      ...prevState,
      [name]: files[0] || null,
    }));
  };

  // Validate form before submission
  const validateForm = () => {
    const errors = {};
    
    // Check if a role is selected
    if (!cvData.selectedRole) {
      errors["selectedRole"] = "Please select a role";
    }
    
    // Data Entry specific validations
    if (cvData.selectedRole === "dataEntry") {
      // Check preferred location
      if (!cvData.roleData?.dataEntry?.preferredLocation) {
        errors["roleData.dataEntry.preferredLocation"] = "Please select a preferred location";
      }
      
      // Check required O/L results
      const requiredSubjects = ["language", "mathematics", "science", "english"];
      requiredSubjects.forEach(subject => {
        if (!cvData.roleData?.dataEntry?.olResults?.[subject]) {
          errors[`roleData.dataEntry.olResults.${subject}`] = "This field is required";
        }
      });
    }
    
    // Internship specific validations
    if (cvData.selectedRole === "internship") {
      if (!cvData.roleData?.internship?.categoryOfApply) {
        errors["roleData.internship.categoryOfApply"] = "Please select a category";
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Form Submission - FIXED VERSION
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form first
    if (!validateForm()) {
      setNotification({
        show: true,
        message: "Please fill in all required fields.",
        variant: "danger",
      });
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

    // Create FormData object
    const formData = new FormData();

    // Fix: Send autoApprove as a boolean value without string conversion
    formData.append("autoApprove", autoApprove);
    formData.append("createdByAdmin", true);
    

    // Add basic fields
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

    // Handle role-specific data with proper field names for backend
    if (cvData.selectedRole === 'dataEntry') {
      const dataEntryData = cvData.roleData?.dataEntry || {};
      
      // Add proficiency scores exactly as backend expects
      if (dataEntryData.proficiency) {
        Object.entries(dataEntryData.proficiency).forEach(([key, value]) => {
          formData.append(`proficiency[${key}]`, value !== undefined ? value : 0);
        });
      }
      
      // Add O/L Results exactly as backend expects
      if (dataEntryData.olResults) {
        Object.entries(dataEntryData.olResults).forEach(([key, value]) => {
          formData.append(`olResults[${key}]`, value || '');
        });
      }
      
      // Add A/L Results exactly as backend expects
      if (dataEntryData.alResults) {
        Object.entries(dataEntryData.alResults).forEach(([key, value]) => {
          formData.append(`alResults[${key}]`, value || '');
        });
      }
      
      // Add preferred location and other qualifications
      formData.append('preferredLocation', dataEntryData.preferredLocation || '');
      formData.append('otherQualifications', dataEntryData.otherQualifications || '');
    } 
    else if (cvData.selectedRole === 'internship') {
      // Internship specific fields
      const internshipData = cvData.roleData?.internship || {};
      formData.append('categoryOfApply', internshipData.categoryOfApply || '');
      formData.append('higherEducation', internshipData.higherEducation || '');
      formData.append('otherQualifications', internshipData.otherQualifications || '');
    }

    // Add files
    const fileFields = ['updatedCv', 'nicFile', 'policeClearanceReport', 'internshipRequestLetter'];
    fileFields.forEach(field => {
      if (cvData[field]) {
        formData.append(field, cvData[field]);
      }
    });

    // Log the form data for debugging purposes
    console.log("Form Data entries:");
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }

    try {
      // Set loading state
      setNotification({
        show: true,
        message: "Submitting CV...",
        variant: "info",
        isLoading: true,
      });

      const response = await fetch("http://localhost:5000/api/cvs/addcv", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setNotification({
          show: true,
          message: "CV successfully added!",
          variant: "success",
          isLoading: false,
        });


        setTimeout(() => {
          navigate("/admin-home");
        }, 2000);
      } else {
        console.error("Failed to submit CV:", result);
        // Better error handling
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
        message: "Error submitting CV! Please check the console for details.",
        variant: "danger",
        isLoading: false,
      });
    }
  };

  return (
    <div className={`d-flex flex-column min-vh-100 ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
      {/* Header */}
      <div className="text-center mt-4 mb-3">
        <img src={logo} alt="Company Logo" className="mx-auto d-block" style={{ height: "50px" }} />
        <h3 className="mt-3">ADD NEW CV</h3>
      </div>

      {/* Main Content */}
      <main className={`container p-4 rounded shadow ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"} mb-5`}>
        <div className={`p-4 border rounded shadow-sm ${darkMode ? "border-light" : "border-secondary"}`}>
          <h2 className="text-start">New CV</h2>
          <p className="text-start">You can add a new CV and later schedule an interview for it.</p>
          <hr />

          {/* Form */}
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

            <button type="submit" className={`btn w-100 mt-3 ${darkMode ? "btn-primary" : "btn-success"}`}>
              Submit CV
            </button>
          </form>
        </div>
      </main>

      <Notification
        show={notification.show}
        onClose={() => setNotification({ ...notification, show: false })}
        message={notification.message}
        variant={notification.variant}
      />
    </div>
  );
};

export default AdminAddCVs;