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
    // Initialize roleData with proper structure
    roleData: {
      dataEntry: {
        proficiency: { msWord: 0, msExcel: 0, msPowerPoint: 0 },
        olResults: {},
        alResults: {},
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
      // Handle proficiency within roleData.dataEntry
      if (name.startsWith("proficiency.")) {
        const proficiencyKey = name.split(".")[1]; 
        return {
          ...prevData,
          roleData: {
            ...prevData.roleData,
            dataEntry: {
              ...prevData.roleData.dataEntry,
              proficiency: {
                ...prevData.roleData.dataEntry.proficiency,
                [proficiencyKey]: parseInt(value, 10) || 0,
              }
            }
          }
        };
      }
  
      // Handling olResults within roleData.dataEntry
      if (name.startsWith("olResults.")) {
        const olKey = name.split(".")[1];
        return {
          ...prevData,
          roleData: {
            ...prevData.roleData,
            dataEntry: {
              ...prevData.roleData.dataEntry,
              olResults: {
                ...prevData.roleData.dataEntry.olResults,
                [olKey]: value,
              }
            }
          }
        };
      }
  
      // Handling alResults within roleData.dataEntry
      if (name.startsWith("alResults.")) {
        const alKey = name.split(".")[1];
        return {
          ...prevData,
          roleData: {
            ...prevData.roleData,
            dataEntry: {
              ...prevData.roleData.dataEntry,
              alResults: {
                ...prevData.roleData.dataEntry.alResults,
                [alKey]: value,
              }
            }
          }
        };
      }
      
      // Handle internship fields
      if (name === "categoryOfApply" || name === "higherEducation" || (name === "otherQualifications" && selectedRole === "internship")) {
        return {
          ...prevData,
          roleData: {
            ...prevData.roleData,
            internship: {
              ...prevData.roleData.internship,
              [name]: value
            }
          }
        };
      }
      
      // Handle dataEntry specific fields
      if (name === "preferredLocation" || (name === "otherQualifications" && selectedRole === "dataEntry")) {
        return {
          ...prevData,
          roleData: {
            ...prevData.roleData,
            dataEntry: {
              ...prevData.roleData.dataEntry,
              [name]: value
            }
          }
        };
      }
  
      // Regular top-level fields
      return { ...prevData, [name]: value };
    });
  };

  // Handle Role Change
  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value);
  };

  // Handle File Uploads
  const handleFileChange = (e) => {
    setFiles({ ...files, [e.target.name]: e.target.files[0] });
  };

  // Submit Updated CV Data
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setError(null);

    // Check if there are any form errors
    if (Object.keys(formErrors).length > 0) {
      setError("Please fix all the validation errors before submitting.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      // Manually structure the roleData for the form
      // Set selectedRole separately
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
      
      // Handle nested roleData structure correctly
      // For dataEntry role
      if (cvData.roleData?.dataEntry) {
        // Proficiency
        Object.entries(cvData.roleData.dataEntry.proficiency || {}).forEach(([key, value]) => {
          formData.append(`roleData[dataEntry][proficiency][${key}]`, value);
        });
        
        // OL Results
        Object.entries(cvData.roleData.dataEntry.olResults || {}).forEach(([key, value]) => {
          formData.append(`roleData[dataEntry][olResults][${key}]`, value || '');
        });
        
        // AL Results
        Object.entries(cvData.roleData.dataEntry.alResults || {}).forEach(([key, value]) => {
          formData.append(`roleData[dataEntry][alResults][${key}]`, value || '');
        });
        
        // Other dataEntry fields
        formData.append('roleData[dataEntry][preferredLocation]', cvData.roleData.dataEntry.preferredLocation || '');
        formData.append('roleData[dataEntry][otherQualifications]', cvData.roleData.dataEntry.otherQualifications || '');
      }
      
      // For internship role
      if (cvData.roleData?.internship) {
        formData.append('roleData[internship][categoryOfApply]', cvData.roleData.internship.categoryOfApply || '');
        formData.append('roleData[internship][higherEducation]', cvData.roleData.internship.higherEducation || '');
        formData.append('roleData[internship][otherQualifications]', cvData.roleData.internship.otherQualifications || '');
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
          {error === "Please fix all the validation errors before submitting." && (
            <div className="alert alert-danger mb-3">{error}</div>
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
            />
            <EmergencySection cvData={cvData} handleInputChange={handleInputChange} darkMode={darkMode} />
            <PreviousTrainingSection cvData={cvData} handleInputChange={handleInputChange} darkMode={darkMode} />
            <UploadDocumentSection
              cvData={cvData} // Pass existing file data
              handleFileChange={handleFileChange}
              darkMode={darkMode}
            />

            {/* Submit Button */}
            <button type="submit" className={`btn ${darkMode ? "btn-light text-dark" : "btn-primary"} w-100 mt-3`}>
              Update CV
            </button>
          </form>

          {/* Success Message */}
          {successMessage && <div className="alert alert-success mt-3">{successMessage}</div>}

          {/* Back Button */}
          <button className={`btn ${darkMode ? "btn-light text-dark" : "btn-secondary"} w-100 mt-3`} onClick={() => navigate(-1)}>
            Back to Previous Page
          </button>
        </div>
      </main>
    </div>
  );
};

export default EditCV;