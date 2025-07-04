import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import logo from "../../assets/logo.png";
import UserInfoSection from "../pages/UserInfoSection";
import EmergencySection from "../pages/EmergencySection";
import PreviousTrainingSection from "../pages/PreviousTrainingSection";
import InternshipTypeSection from "../pages/InternshipTypeSection";
import UploadDocumentSection from "../pages/UploadDocumentSection";
import { useNotification } from "../notifications/Notification";
import ConfirmationModal from "../notifications/ConfirmationModal";

const EditCV = ({ darkMode }) => {
  const { cvId } = useParams();
  const navigate = useNavigate();

  // Initialize notification hook
  const { showNotification, NotificationComponent } = useNotification();

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

  // Use a ref to store the original CV data
  const originalCvData = useRef(null);

  const [districts, setDistricts] = useState([]);
  const [institutes, setInstitutes] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [formErrors, setFormErrors] = useState({});

  // State for the confirmation modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // File State
  const [files, setFiles] = useState({
    updatedCv: null,
    nicFile: null,
    policeClearanceReport: null,
    internshipRequestLetter: null,
  });

  // Use a ref to store the original file details (e.g., URLs if they exist)
  const originalFileUrls = useRef({});

  // CSS styles for modal
  const modalStyles = `
    /* Prevent body scroll when modal is open */
    .modal-open {
      overflow: hidden;
    }
    
    /* Ensure modal appears above all other content */
    .confirmation-modal-overlay {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      z-index: 1060 !important;
    }
    
    /* Responsive adjustments for mobile */
    @media (max-width: 768px) {
      .confirmation-modal-content {
        margin: 1rem;
        max-height: 90vh;
        overflow-y: auto;
      }
    }
  `;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          showNotification("You are not logged in. Please log in.", "error");
          navigate("/login");
          return;
        }

        const [districtsRes, institutesRes, cvRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BASE_URL}/api/districts`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${import.meta.env.VITE_BASE_URL}/api/institutes`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${import.meta.env.VITE_BASE_URL}/api/cvs/${cvId}`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        setDistricts(districtsRes.data || []);
        setInstitutes(institutesRes.data?.institutes || []);

        // Set CV data with proper structure
        const fetchedCV = cvRes.data || {};

        // Ensure roleData structure exists
        if (!fetchedCV.roleData) {
          fetchedCV.roleData = {
            dataEntry: {
              language: "", mathematics: "", science: "", english: "", history: "", religion: "",
              optional1Name: "", optional1Result: "", optional2Name: "", optional2Result: "",
              optional3Name: "", optional3Result: "",
              aLevelSubject1Name: "", aLevelSubject1Result: "",
              aLevelSubject2Name: "", aLevelSubject2Result: "",
              aLevelSubject3Name: "", aLevelSubject3Result: "",
              preferredLocation: "", otherQualifications: ""
            },
            internship: {
              categoryOfApply: "", higherEducation: "", otherQualifications: ""
            }
          };
        }

        // Store a deep copy of the fetched CV data and selected role
        originalCvData.current = JSON.parse(JSON.stringify(fetchedCV));
        originalCvData.current.selectedRole = fetchedCV.selectedRole || ""; // Store selectedRole too

        // Initialize original file URLs if they exist in the fetched CV data
        originalFileUrls.current = {
          updatedCv: fetchedCV.updatedCv || null,
          nicFile: fetchedCV.nicFile || null,
          policeClearanceReport: fetchedCV.policeClearanceReport || null,
          internshipRequestLetter: fetchedCV.internshipRequestLetter || null,
        };

        setCvData(fetchedCV);
        setSelectedRole(fetchedCV.selectedRole || "");
        showNotification("CV data loaded successfully!", "success");
      } catch (err) {
        console.error("Error fetching data:", err.message);
        showNotification("Failed to fetch CV data. Please try again.", "error");
      } finally {
        setLoading(false);
      }
    };

    if (cvId) fetchData();
  }, [cvId, navigate, showNotification]);

  // Cleanup effect to remove modal-open class if component unmounts
  useEffect(() => {
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, []);

  // Handle Input Changes with proper nesting for roleData
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setCvData((prevData) => {
      if (name.includes('roleData.')) {
        const parts = name.split('.');

        if (parts.length === 3) {
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
    showNotification(`${e.target.files[0].name} uploaded successfully!`, "info", 3000);
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

    // Validate form
    if (!validateForm()) {
      showNotification("Please fix all validation errors before submitting.", "warning");
      return;
    }

    setLoading(true);

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
      const response = await axios.put(`${import.meta.env.VITE_BASE_URL}/api/cvs/${cvId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      showNotification("CV updated successfully! Redirecting...", "success", 3000);
      setTimeout(() => navigate(-1), 3000);
    } catch (error) {
      console.error("Error updating CV:", error.response?.data?.message || error.message);
      showNotification(
        error.response?.data?.message || "Failed to update CV. Please try again.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // Function to show the confirmation modal
  const handleCancelEdit = () => {
    // Add modal-open class to body to prevent scrolling
    document.body.classList.add('modal-open');
    setShowConfirmModal(true);
  };

  // Function to confirm discarding changes
  const confirmDiscardChanges = () => {
    // Remove modal-open class from body
    document.body.classList.remove('modal-open');
    setShowConfirmModal(false);
    
    if (originalCvData.current) {
      setCvData(JSON.parse(JSON.stringify(originalCvData.current)));
      setSelectedRole(originalCvData.current.selectedRole);
      setFormErrors({});
      setFiles({
        updatedCv: null,
        nicFile: null,
        policeClearanceReport: null,
        internshipRequestLetter: null,
      });
      showNotification("Changes discarded. CV reverted to original details.", "info");
    }
    navigate(-1);
  };

  // Function to cancel discarding changes (close modal)
  const cancelDiscardChanges = () => {
    // Remove modal-open class from body
    document.body.classList.remove('modal-open');
    setShowConfirmModal(false);
    showNotification("Changes not discarded. You can continue editing.", "info");
  };

  if (loading && !cvData.fullName) {
    return (
      <div className={`d-flex justify-content-center align-items-center min-vh-100 ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
        <div className="text-center">
          <div className="spinner-border mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading CV data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`d-flex flex-column min-vh-100 ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
      {/* Add the styles to the head */}
      <style>{modalStyles}</style>
      
      {/* Notification Component */}
      <NotificationComponent darkMode={darkMode} />

      {/* Updated Confirmation Modal with proper positioning */}
      <ConfirmationModal
        show={showConfirmModal}
        title="Discard Changes?"
        message="Are you sure you want to discard all changes and revert to the original CV details?"
        onConfirm={confirmDiscardChanges}
        onCancel={cancelDiscardChanges}
        darkMode={darkMode}
      />

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
              originalFileUrls={originalFileUrls.current}
            />

            {/* Submit Button */}
            <button
              type="submit"
              className={`btn ${darkMode ? "btn-light text-dark" : "btn-primary"} w-100 mt-3`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Updating...
                </>
              ) : (
                "Update CV"
              )}
            </button>
          </form>

          {/* Cancel Button */}
          <button
            className={`btn ${darkMode ? "btn-outline-light" : "btn-outline-secondary"} w-100 mt-3`}
            onClick={handleCancelEdit}
            disabled={loading}
          >
            Cancel and Discard Changes
          </button>
        </div>
      </main>
    </div>
  );
};

export default EditCV;