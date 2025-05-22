import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import logo from "../../assets/logo.png";
import UserInfoSection from "../pages/UserInfoSection";
import EmergencySection from "../pages/EmergencySection";
import PreviousTrainingSection from "../pages/PreviousTrainingSection";
import InternshipTypeSection from "../pages/InternshipTypeSection";
import UploadDocumentSection from "../pages/UploadDocumentSection";

const API_BASE_URL = "http://localhost:5000";

const EditCV = ({ darkMode }) => {
  const { cvId } = useParams();
  const navigate = useNavigate();

  // CV Data State with proper structure matching the backend schema
  const [cvData, setCvData] = useState({
    fullName: "",
    nameWithInitials: "",
    gender: "",
    emailAddress: "",
    nic: "",
    birthday: "",
    mobileNumber: "",
    landPhone: "",
    postalAddress: "",
    district: "",
    institute: "",
    emergencyContactName1: "",
    emergencyContactNumber1: "",
    emergencyContactName2: "",
    emergencyContactNumber2: "",
    previousTraining: "",
    // Initialize roleData with proper structure
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
        otherQualifications: ""
      },
      internship: {
        categoryOfApply: "",
        higherEducation: "",
        otherQualifications: ""
      }
    }
  });

  const [districts, setDistricts] = useState([]);
  const [institutes, setInstitutes] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [formErrors, setFormErrors] = useState({});

  // File State
  const [files, setFiles] = useState({
    updatedCv: null,
    nicFile: null,
    policeClearanceReport: null,
    internshipRequestLetter: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          alert("You are not logged in. Please log in.");
          navigate("/login");
          return;
        }

        const [districtsRes, institutesRes, cvRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/districts`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_BASE_URL}/api/institutes`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_BASE_URL}/api/cvs/${cvId}`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        setDistricts(districtsRes.data || []);
        setInstitutes(institutesRes.data?.institutes || []);
        
        // Set CV data with proper structure
        const fetchedCV = cvRes.data || {};
        
        // Ensure roleData structure exists
        if (!fetchedCV.roleData) {
          fetchedCV.roleData = {
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
              otherQualifications: ""
            },
            internship: {
              categoryOfApply: "",
              higherEducation: "",
              otherQualifications: ""
            }
          };
        }

        setCvData(fetchedCV);
        setSelectedRole(fetchedCV.selectedRole || "");
      } catch (err) {
        console.error("Error fetching data:", err.message);
        setError("Failed to fetch data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (cvId) fetchData();
  }, [cvId, navigate]);

  // Handle Input Changes with proper nesting for roleData
  const handleInputChange = (e) => {
    const { name, value } = e.target;
  
    setCvData((prevData) => {
      // Handle nested roleData fields (e.g., roleData.dataEntry.language)
      if (name.includes('roleData.')) {
        const parts = name.split('.');
        
        if (parts.length === 3) {
          // Handle roleData.dataEntry.field or roleData.internship.field
          const [, roleType, fieldName] = parts;
          
          return {
            ...prevData,
            roleData: {
              ...prevData.roleData,
              [roleType]: {
                ...prevData.roleData[roleType],
                [fieldName]: value
              }
            }
          };
        }
      }
  
      // Handle top-level fields
      return { ...prevData, [name]: value };
    });

    // Clear any existing errors for this field
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle Role Change
  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value);
    setCvData(prev => ({
      ...prev,
      selectedRole: e.target.value
    }));

    // Clear role-related errors
    const roleErrorKeys = Object.keys(formErrors).filter(key => key.includes('selectedRole'));
    if (roleErrorKeys.length > 0) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        roleErrorKeys.forEach(key => delete newErrors[key]);
        return newErrors;
      });
    }
  };

  // Handle File Uploads
  const handleFileChange = (e) => {
    setFiles({ ...files, [e.target.name]: e.target.files[0] });
  };

  // Validate form data
  const validateForm = () => {
    const errors = {};

    // Validate role selection
    if (!selectedRole) {
      errors['selectedRole'] = 'Please select a role';
    }

    // Validate based on selected role
    if (selectedRole === 'dataEntry') {
      // Required O/L subjects
      const requiredOLSubjects = ['language', 'mathematics', 'science', 'english'];
      requiredOLSubjects.forEach(subject => {
        if (!cvData.roleData?.dataEntry?.[subject]?.trim()) {
          errors[`roleData.dataEntry.${subject}`] = `${subject.charAt(0).toUpperCase() + subject.slice(1)} result is required`;
        }
      });

      // Required preferred location
      if (!cvData.roleData?.dataEntry?.preferredLocation) {
        errors['roleData.dataEntry.preferredLocation'] = 'Preferred location is required';
      }
    }

    if (selectedRole === 'internship') {
      // Required category
      if (!cvData.roleData?.internship?.categoryOfApply) {
        errors['roleData.internship.categoryOfApply'] = 'Category of apply is required';
      }
    }

    // Validate user info (basic validation)
    if (!cvData.fullName?.trim()) {
      errors['fullName'] = 'Full name is required';
    }
    if (!cvData.emailAddress?.trim()) {
      errors['emailAddress'] = 'Email address is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Updated CV Data
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setError(null);

    // Validate form
    if (!validateForm()) {
      setError("Please fix all the validation errors before submitting.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      // Set selectedRole
      formData.append('selectedRole', selectedRole);
      
      // Add non-nested properties first
      const topLevelFields = [
        'fullName', 'nameWithInitials', 'gender', 'emailAddress', 'nic', 
        'birthday', 'mobileNumber', 'landPhone', 'postalAddress', 'district', 
        'institute', 'emergencyContactName1', 'emergencyContactNumber1',
        'emergencyContactName2', 'emergencyContactNumber2', 'previousTraining'
      ];
      
      topLevelFields.forEach(field => {
        if (cvData[field] !== undefined) {
          formData.append(field, cvData[field] === null ? '' : cvData[field]);
        }
      });
      
      // Handle roleData structure
      if (cvData.roleData) {
        // For dataEntry role
        if (cvData.roleData.dataEntry) {
          Object.entries(cvData.roleData.dataEntry).forEach(([key, value]) => {
            formData.append(`roleData[dataEntry][${key}]`, value || '');
          });
        }
        
        // For internship role
        if (cvData.roleData.internship) {
          Object.entries(cvData.roleData.internship).forEach(([key, value]) => {
            formData.append(`roleData[internship][${key}]`, value || '');
          });
        }
      }

      // Append uploaded files if any
      Object.keys(files).forEach((key) => {
        if (files[key]) {
          formData.append(key, files[key]);
        }
      });

      // Send update request
      const response = await axios.put(`${API_BASE_URL}/api/cvs/${cvId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccessMessage("CV updated successfully!");
      setTimeout(() => navigate(-1), 2000); 
    } catch (error) {
      console.error("Error updating CV:", error.response?.data?.message || error.message);
      setError(error.response?.data?.message || "Failed to update CV. Please try again.");
    }
  };

  if (loading) return <div className="text-center text-white">Loading...</div>;
  if (error && error !== "Please fix all the validation errors before submitting.") {
    return <div className="text-danger text-center">{error}</div>;
  }

  return (
    <div className={`d-flex flex-column min-vh-100 ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
      {/* Header */}
      <div className="text-center mt-4 mb-3">
        <img src={logo} alt="Company Logo" className="mx-auto d-block" style={{ height: "50px" }} />
        <h3 className="mt-3">EDIT CV</h3>
      </div>

      {/* Main Content */}
      <main className={`container p-4 rounded shadow ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"} mb-5`}>
        <div className={`p-4 border rounded shadow-sm ${darkMode ? "border-light" : "border-secondary"}`}>
          <h2 className="text-start">Edit Your CV</h2>
          <p className="text-start">Update your CV details below.</p>
          <hr />

          {/* Error Message */}
          {error && (
            <div className="alert alert-danger mb-3">{error}</div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="alert alert-success mb-3">{successMessage}</div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <UserInfoSection
              cvData={cvData}
              handleInputChange={handleInputChange} 
              districts={districts}
              institutes={institutes}
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
            />
            <PreviousTrainingSection 
              cvData={cvData} 
              handleInputChange={handleInputChange} 
              darkMode={darkMode} 
            />
            <UploadDocumentSection
              cvData={cvData}
              handleFileChange={handleFileChange}
              darkMode={darkMode}
            />

            {/* Submit Button */}
            <button 
              type="submit" 
              className={`btn ${darkMode ? "btn-light text-dark" : "btn-primary"} w-100 mt-3`}
              disabled={loading}
            >
              {loading ? "Updating..." : "Update CV"}
            </button>
          </form>

          {/* Back Button */}
          <button 
            className={`btn ${darkMode ? "btn-light text-dark" : "btn-secondary"} w-100 mt-3`} 
            onClick={() => navigate(-1)}
          >
            Back to Previous Page
          </button>
        </div>
      </main>
    </div>
  );
};

export default EditCV;