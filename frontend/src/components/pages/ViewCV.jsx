import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import logo from "../../assets/logo.png";
import UserInfoSection from "../pages/UserInfoSection";
import EmergencySection from "../pages/EmergencySection";
import PreviousTrainingSection from "../pages/PreviousTrainingSection";
import InternshipTypeSection from "../pages/InternshipTypeSection";
import ViewUploadDocuments from "../pages/ViewUploadDocuments";

const API_BASE_URL = "http://localhost:5000"; 

const ViewCV = ({ darkMode }) => {
  const { cvId } = useParams(); 
  const navigate = useNavigate(); 
  const [cvData, setCvData] = useState(null);
  const [districts, setDistricts] = useState([]);
  const [institutes, setInstitutes] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data when the component is mounted
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
        setCvData(cvRes.data);
        setSelectedRole(cvRes.data?.selectedRole || "");
      } catch (err) {
        console.error("Error fetching data:", err.message);
        setError("Failed to fetch data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (cvId) fetchData();
  }, [cvId, navigate]); // Re-run on cvId or navigate changes

  // Loading state
  if (loading) return <div className="text-center text-white">Loading...</div>;

  // Error state
  if (error) return <div className="text-danger text-center">{error}</div>;

  return (
    <div className={`d-flex flex-column min-vh-100 ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
      {/* Header */}
      <div className="text-center mt-4 mb-3">
        <img src={logo} alt="Company Logo" className="mx-auto d-block" style={{ height: "50px" }} />
        <h3 className="mt-3">VIEW CV</h3>
      </div>

      {/* Main Content */}
      <main className={`container p-4 rounded shadow ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"} mb-5`}>
        <div className={`p-4 border rounded shadow-sm ${darkMode ? "border-light" : "border-secondary"}`}>
          <h2 className="text-start">CV Details</h2>
          <p className="text-start">Here you can view your CV details.</p>
          <hr />

          {/* Display CV Details in Read-Only Mode */}
          <UserInfoSection
            cvData={cvData}
            districts={districts}
            institutes={institutes}
            darkMode={darkMode}
            readOnly={true}
          />
          <InternshipTypeSection
            cvData={cvData}
            selectedRole={selectedRole}
            darkMode={darkMode}
            readOnly={true}
          />
          <EmergencySection cvData={cvData} darkMode={darkMode} readOnly={true} />
          <PreviousTrainingSection cvData={cvData} darkMode={darkMode} readOnly={true} />
          <ViewUploadDocuments cvId={cvId} darkMode={darkMode} />

          <button
            className={`btn ${darkMode ? "btn-light text-dark" : "btn-secondary"} w-100 mt-3`}
            onClick={() => navigate(-1)} // Navigate back to the previous page
          >
            Back to Previous Page
          </button>

        </div>
      </main>
    </div>
  );
};

export default ViewCV;
