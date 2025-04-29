import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Spinner, Alert } from "react-bootstrap";
import axios from "axios";

const AssignSchemeModal = ({ show, onClose, onConfirm, refNo, darkMode }) => {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    schemeId: "",
    managerId: "",
    internshipPeriod: 6,
    startDate: "",
    forRequest: "no",
  });
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [message, setMessage] = useState({ text: "", variant: "" });
  const [schemeManagers, setSchemeManagers] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch schemes
        const schemesResponse = await axios.get(
          "http://localhost:5000/api/schemes",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setSchemes(schemesResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (show) {
      fetchData();
      // Reset form when modal opens
      setFormData({
        schemeId: "",
        managerId: "",
        internshipPeriod: 6,
        startDate: "",
        forRequest: "no",
      });
      setSelectedScheme(null);
      setSchemeManagers([]);
    }
  }, [show, token]);

  useEffect(() => {
    // Update available managers when a scheme is selected
    if (selectedScheme) {
      const managers = [];

      if (selectedScheme.generalManager?.name) {
        managers.push({
          id: "generalManager",
          name: selectedScheme.generalManager.name,
          role: "General Manager",
          availableAllocation:
            selectedScheme.generalManager.availableAllocation || 0,
        });
      }

      if (selectedScheme.deputyManager?.name) {
        managers.push({
          id: "deputyManager",
          name: selectedScheme.deputyManager.name,
          role: "Deputy Manager",
          availableAllocation:
            selectedScheme.deputyManager.availableAllocation || 0,
        });
      }

      if (selectedScheme.supervisor?.name) {
        managers.push({
          id: "supervisor",
          name: selectedScheme.supervisor.name,
          role: "Supervisor",
          availableAllocation:
            selectedScheme.supervisor.availableAllocation || 0, // Add available allocation
        });
      }

      setSchemeManagers(managers);

      setFormData((prev) => ({
        ...prev,
        managerId: "",
      }));
    } else {
      setSchemeManagers([]);
    }
  }, [selectedScheme]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (name === "schemeId" && value) {
      const scheme = schemes.find((s) => s._id === value);
      setSelectedScheme(scheme);
    } else if (name === "schemeId" && !value) {
      setSelectedScheme(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true); // Show loading state during submission
      setMessage({ text: "", variant: "" }); // Clear any previous messages

      // Call the onConfirm prop (which calls handleAssignScheme from parent)
      const result = await onConfirm({
        ...formData,
        schemeName: selectedScheme?.schemeName,
      });

      // Only show success and close if the operation was successful
      setMessage({
        text: "Scheme assigned successfully!",
        variant: "success",
      });

      // Close the modal after 2 seconds
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error) {
      setMessage({
        text: `Failed to assign scheme: ${error.message}`,
        variant: "danger",
      });
    } finally {
      setLoading(false); // Hide loading state
    }
  };

  // Reset message when modal closes
  const handleClose = () => {
    setMessage({ text: "", variant: "" });
    onClose();
  };

  const getSchemeDisplayText = (scheme) => {
    const emptyCount =
      scheme.totalEmptyCount !== undefined
        ? scheme.totalEmptyCount
        : scheme.totalAllocation - (scheme.totalAllocatedCount || 0);

    return `${scheme.schemeName} (Available: ${emptyCount})`;
  };

  // Filter out schemes with no empty spots
  const availableSchemes = schemes.filter((scheme) => {
    const emptyCount =
      scheme.totalEmptyCount !== undefined
        ? scheme.totalEmptyCount
        : scheme.totalAllocation - (scheme.totalAllocatedCount || 0);
    return emptyCount > 0;
  });

  return (
    <Modal
      show={show}
      onHide={onClose}
      backdrop="static"
      keyboard={false}
      centered
      contentClassName={darkMode ? "bg-dark text-white" : ""}
    >
      <Modal.Header closeButton className={darkMode ? "border-secondary" : ""}>
        <Modal.Title>Assign Scheme</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <div className="text-center p-4">
            <Spinner animation="border" />
            <p className="mt-3">Loading data...</p>
          </div>
        ) : null}

        {message.text && (
          <Alert variant={message.variant} className="mt-3">
            {message.text}
          </Alert>
        )}

        {!loading && (
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Candidate Reference</Form.Label>
              <Form.Control
                type="text"
                value={refNo || "Selected Candidate"}
                disabled
                className={darkMode ? "bg-secondary text-white" : ""}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                Select Scheme <span className="text-danger">*</span>
              </Form.Label>
              {availableSchemes.length === 0 ? (
                <div
                  className={`alert ${
                    darkMode ? "alert-danger bg-dark" : "alert-danger"
                  }`}
                >
                  No schemes with available positions found.
                </div>
              ) : (
                <>
                  <Form.Select
                    name="schemeId"
                    value={formData.schemeId}
                    onChange={handleChange}
                    required
                    className={darkMode ? "bg-secondary text-white" : ""}
                  >
                    <option value="">Choose a scheme...</option>
                    {availableSchemes.map((scheme) => (
                      <option key={scheme._id} value={scheme._id}>
                        {getSchemeDisplayText(scheme)}
                      </option>
                    ))}
                  </Form.Select>
                  {formData.schemeId && (
                    <Form.Text
                      className={darkMode ? "text-light" : "text-muted"}
                    >
                      {schemes.find((s) => s._id === formData.schemeId)
                        ?.description || ""}
                    </Form.Text>
                  )}
                </>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                Select Manager <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                name="managerId"
                value={formData.managerId}
                onChange={handleChange}
                required
                className={darkMode ? "bg-secondary text-white" : ""}
                disabled={!selectedScheme || schemeManagers.length === 0}
              >
                <option value="">Choose a manager...</option>
                {schemeManagers.map((manager) => (
                  <option key={manager.id} value={manager.id}>
                    {manager.name} ({manager.role}) - Available:{" "}
                    {manager.availableAllocation}
                  </option>
                ))}
              </Form.Select>
              {selectedScheme && schemeManagers.length === 0 && (
                <Form.Text className="text-danger">
                  No managers assigned to this scheme. Please choose a different
                  scheme or assign managers first.
                </Form.Text>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                Internship Period (Months){" "}
                <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="number"
                name="internshipPeriod"
                value={formData.internshipPeriod}
                onChange={handleChange}
                min="1"
                max="24"
                required
                className={darkMode ? "bg-secondary text-white" : ""}
                disabled={availableSchemes.length === 0}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                Internship Start Date <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
                className={darkMode ? "bg-secondary text-white" : ""}
                disabled={availableSchemes.length === 0}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>For Request</Form.Label>
              <Form.Select
                name="forRequest"
                value={formData.forRequest}
                onChange={handleChange}
                className={darkMode ? "bg-secondary text-white" : ""}
                disabled={availableSchemes.length === 0}
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </Form.Select>
            </Form.Group>

            <div className="d-flex justify-content-end">
              <Button variant="secondary" onClick={onClose} className="me-2">
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={
                  availableSchemes.length === 0 ||
                  !formData.managerId ||
                  loading
                }
              >
                {loading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                    />
                    <span className="ms-2">Processing...</span>
                  </>
                ) : (
                  "Confirm"
                )}
              </Button>
            </div>
          </Form>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default AssignSchemeModal;
