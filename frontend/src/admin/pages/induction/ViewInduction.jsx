import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Dropdown } from "react-bootstrap";

import logo from "../../../assets/logo.png";
import ViewInductionDetails from "./ViewInductionDetails";


const ViewInductions = ({ darkMode }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Induction-info");

  const tabs = [
    { id: "induction-info", label: "Induction Info" },
    { id: "induction-details", label: "Induction Details" },

  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "induction-info":
        return <ViewInductionDetails darkMode={darkMode} />;
      case "induction-details":
        return <ViewInductions darkMode={darkMode} />;
    }
  };

  return (
    <div 
      className={`
        d-flex 
        flex-column 
        min-vh-100 
        ${darkMode ? "bg-dark text-white" : "bg-white text-dark"}
      `}
    >
      {/* Main Content Section */}
      <Container fluid className="px-0">
        {/* Logo and Title */}
        <div className="text-center mt-4 mb-3">
          <img
            src={logo}
            alt="SLT Mobitel Logo"
            className="mx-auto d-block mb-3"
            style={{ 
              height: "50px", 
              maxWidth: "100%", 
              objectFit: "contain" 
            }}
          />
          <h3 className="mt-2 px-3">VIEW INDUCTION DETAILS</h3>
        </div>

        {/* Responsive Navigation */}
        <div className="d-block d-md-none px-3 mb-3">
          <Dropdown>
            <Dropdown.Toggle 
              variant={darkMode ? "secondary" : "outline-primary"} 
              className="w-100"
            >
              {tabs.find(tab => tab.id === activeTab)?.label || "Select Tab"}
            </Dropdown.Toggle>
            <Dropdown.Menu 
              className={darkMode ? "dropdown-menu-dark" : ""}
            >
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
                    ? (darkMode ? "btn-light text-dark" : "btn-primary") 
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

export default ViewInductions;