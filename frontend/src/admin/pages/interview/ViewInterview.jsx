import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container, Dropdown } from "react-bootstrap";
import axios from "axios";
import PropTypes from "prop-types";
import logo from "../../../assets/logo.png";
import ViewInterviewDetails from "./ViewInterviewDetails";
import ViewInterviewInterns from "./ViewInterviewInterns";

const API_BASE_URL = `${import.meta.env.VITE_BASE_URL}/api/interviews`;

const ViewInterview = ({ darkMode }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [interviewData, setInterviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("interview-info");

  const tabs = [
    { id: "interview-info", label: "Interview Info" },
    { id: "interview-interns", label: "Interview Interns" },
  ];

  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/${id}`);
        setInterviewData(response.data);
      } catch (err) {
        setError(
          err.response?.data?.error || "Failed to load interview details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchInterview();
  }, [id]);

  const renderTabContent = () => {
    switch (activeTab) {
      case "interview-info":
        return <ViewInterviewDetails darkMode={darkMode} interviewId={id} />;
      case "interview-interns":
        return <ViewInterviewInterns darkMode={darkMode} interviewId={id} />;
      default:
        return <ViewInterviewDetails darkMode={darkMode} interviewId={id} />;
    }
  };

  return (
    <div
      className={`d-flex flex-column min-vh-100 ${
        darkMode ? "bg-dark text-white" : "bg-white text-dark"
      }`}
    >
      {/* Main Content Section */}
      <Container fluid className="px-0">
        {/* Logo and Title */}
        <div className="text-center mt-4 mb-3">
          <img
            src={logo}
            alt="Company Logo"
            className="mx-auto d-block"
            style={{ height: "50px" }}
          />
          <h3 className="mt-2 px-3">VIEW INTERVIEW DETAILS</h3>
        </div>

        {/* Responsive Navigation */}
        <div className="d-block d-md-none px-3 mb-3">
          <Dropdown>
            <Dropdown.Toggle
              variant={darkMode ? "secondary" : "outline-primary"}
              className="w-100"
            >
              {tabs.find((tab) => tab.id === activeTab)?.label || "Select Tab"}
            </Dropdown.Toggle>
            <Dropdown.Menu className={darkMode ? "dropdown-menu-dark" : ""}>
              {tabs.map((tab) => (
                <Dropdown.Item
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  active={activeTab === tab.id}
                >
                  {tab.label}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </div>

        {/* Desktop Tabs */}
        <div
          className={`
            d-none 
            d-md-flex 
            justify-content-center 
            gap-3 
            border-bottom 
            py-2 
            ${darkMode ? "border-secondary" : "border-gray-300"}
          `}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`
                btn 
                ${
                  activeTab === tab.id
                    ? darkMode
                      ? "btn-light text-dark"
                      : "btn-primary"
                    : "btn-outline-secondary"
                }
                btn-sm 
                px-3
              `}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div
          className={`
            flex-grow-1 
            overflow-auto 
            p-3 
            p-md-4 
            ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}
          `}
        >
          {renderTabContent()}
        </div>
      </Container>
    </div>
  );
};

ViewInterview.propTypes = {
  darkMode: PropTypes.bool.isRequired,
};

export default ViewInterview;

