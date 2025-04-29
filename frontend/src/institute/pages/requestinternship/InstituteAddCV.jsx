import React, { useState, useEffect } from "react";
import logo from "../../../assets/logo.png";
import UserInfoSection from "../../../components/pages/UserInfoSection";
import EmergencySection from "../../../components/pages/EmergencySection";
import PreviousTrainingSection from "../../../components/pages/PreviousTrainingSection";
import UploadDocumentSection from "../../../components/pages/UploadDocumentSection";
import InternshipTypeSection from "../../../components/pages/InternshipTypeSection";
import SuccessfullyAddedModal from "../../../components/notifications/SuccessfullyAddedCVModal";
import { useNavigate } from "react-router-dom";
import Notification from "../../../components/notifications/Notification";

const InstituteAddCV = ({ darkMode }) => {
  const defaultCVData = {
    fullName: "",
    nameWithInitials: "",
    gender: "",
    postalAddress: "",
    district: "",
    birthday: "",
    nic: "",
    mobileNumber: "",
    landPhone: "",
    emailAddress: "",
    institute: "",
    selectedRole: "",
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
    proficiency: {
        msWord: 0,
        msExcel: 0,
        msPowerPoint: 0,
      },
    emergencyContactName1: "",
    emergencyContactNumber1: "",
    emergencyContactName2: "",
    emergencyContactNumber2: "",
    previousTraining: "",
    preferredLocation: "",
    otherQualifications: "",
    categoryOfApply: "",
    higherEducation: "",
    updatedCv: null,
    nicFile: null,
    policeClearanceReport: null,
    internshipRequestLetter: null,
  };

  const [districts, setDistricts] = useState([]);
  const [institutes, setInstitutes] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [cvData, setCvData] = useState(defaultCVData);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    variant: "success",
  });
  const navigate = useNavigate();

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
      categoryOfApply: "",
    }));
  };

  // Handle Input Change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
  
    setCvData((prevState) => {
      if (name.includes(".")) {
        const [parent, child] = name.split(".");
        return {
          ...prevState,
          [parent]: {
            ...prevState[parent],
            [child]: value,
          },
        };
      }
      return { ...prevState, [name]: value };
    });
  };
  

  // Handle File Upload
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setCvData((prevState) => ({
      ...prevState,
      [name]: files[0] || null,
    }));
  };

  // Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();

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

    for (const key in cvData) {
      if (key === "proficiency") {
        for (const skill in cvData.proficiency) {
          formData.append(`proficiency[${skill}]`, cvData.proficiency[skill]);
        }
      } else if (cvData[key] && key !== "olResults" && key !== "alResults") {
        formData.append(key, cvData[key]);
      } else if (cvData[key]) {
        for (const subKey in cvData[key]) {
          formData.append(`${key}[${subKey}]`, cvData[key][subKey]);
        }
      }
    }

    try {
      const response = await fetch("http://localhost:5000/api/cvs/addcv", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setShowSuccessModal(true);
        setNotification({ show: false }); 
      } else {
        console.error("Failed to submit CV:", result);
        setNotification({
          show: true,
          message: `Failed to submit CV: ${result.message || "Unknown error"}`,
          variant: "danger",
        });
      }
    } catch (error) {
      console.error("Error submitting CV:", error);
      setNotification({
        show: true,
        message: "Error submitting CV! Please check the console for details.",
        variant: "danger",
      });
    }
  };
  // Close Success Modal
  const handleCloseModal = () => {
    setShowSuccessModal(false);
    navigate("/institute-home");
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
            <UploadDocumentSection handleFileChange={handleFileChange} darkMode={darkMode} />

            <button type="submit" className={`btn w-100 mt-3 ${darkMode ? "btn-primary" : "btn-success"}`}>
              Submit CV
            </button>
          </form>
        </div>
      </main>

      <SuccessfullyAddedModal show={showSuccessModal} onClose={handleCloseModal} darkMode={darkMode} />
      <Notification
        show={notification.show}
        onClose={() => setNotification({ ...notification, show: false })}
        message={notification.message}
        variant={notification.variant}
      />
    </div>
  );
};

export default InstituteAddCV;
