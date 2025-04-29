import React, { useState, useEffect } from "react";
import { Modal, Form, Button, Alert } from "react-bootstrap";
import axios from "axios";
import { CheckCircle, ExclamationCircle } from "react-bootstrap-icons";

const AssignNewManagerModal = ({ 
  show, 
  onClose, 
  onAssignManager, 
  scheme, 
  darkMode = false 
}) => {
  // Initialize form state with existing values from scheme (if any)
  const [generalManager, setGeneralManager] = useState({ 
    name: scheme?.generalManager?.name || '', 
    allocationCount: scheme?.generalManager?.availableAllocation || 0 
  });
  const [deputyManager, setDeputyManager] = useState({ 
    name: scheme?.deputyManager?.name || '', 
    allocationCount: scheme?.deputyManager?.availableAllocation || 0 
  });
  const [supervisor, setSupervisor] = useState({ 
    name: scheme?.supervisor?.name || '', 
    allocationCount: scheme?.supervisor?.availableAllocation || 0 
  });
  
  const [managers, setManagers] = useState([]);
  const [deputies, setDeputies] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Reset form values when scheme changes
  useEffect(() => {
    if (scheme) {
      setGeneralManager({ 
        name: scheme.generalManager?.name || '', 
        allocationCount: scheme.generalManager?.availableAllocation || 0 
      });
      setDeputyManager({ 
        name: scheme.deputyManager?.name || '', 
        allocationCount: scheme.deputyManager?.availableAllocation || 0 
      });
      setSupervisor({ 
        name: scheme.supervisor?.name || '', 
        allocationCount: scheme.supervisor?.availableAllocation || 0 
      });
    }
  }, [scheme]);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:5000/api/staff");
        const users = response.data;

        setManagers(
          users
            .filter((user) => user.jobPosition === "General Manager")
            .map((user) => ({ value: user.id, label: user.name }))
        );
        setDeputies(
          users
            .filter((user) => user.jobPosition === "Deputy General Manager")
            .map((user) => ({ value: user.id, label: user.name }))
        );
        setSupervisors(
          users
            .filter((user) => user.jobPosition === "Supervisor")
            .map((user) => ({ value: user.id, label: user.name }))
        );

        setLoading(false);
      } catch (err) {
        console.error("Error fetching staff:", err);
        setError("Failed to load staff data: " + (err.response?.data?.error || err.message));
        setLoading(false);
      }
    };

    if (show) {
      fetchStaff();
    }
  }, [show]);

  const validateForm = () => {
    // Clear previous errors
    setError(null);
    
    // Calculate total allocation
    const totalAssignedAllocation =
      parseInt(generalManager.allocationCount || 0) +
      parseInt(deputyManager.allocationCount || 0) +
      parseInt(supervisor.allocationCount || 0);

    // Validation checks
    if (totalAssignedAllocation > scheme.totalAllocation) {
      setError(`Total allocation (${totalAssignedAllocation}) cannot exceed scheme's total allocation (${scheme.totalAllocation}).`);
      return false;
    }

    // Check for negative allocation counts
    if (generalManager.allocationCount < 0 || deputyManager.allocationCount < 0 || supervisor.allocationCount < 0) {
      setError("Allocation counts cannot be negative.");
      return false;
    }

    // Ensure at least one manager is assigned
    if (!generalManager.name && !deputyManager.name && !supervisor.name) {
      setError("At least one manager must be assigned.");
      return false;
    }

    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    // Send manager data with proper structure
    onAssignManager({
      generalManager: {
        name: generalManager.name || null,
        allocationCount: parseInt(generalManager.allocationCount || 0)
      },
      deputyManager: {
        name: deputyManager.name || null,
        allocationCount: parseInt(deputyManager.allocationCount || 0)
      },
      supervisor: {
        name: supervisor.name || null,
        allocationCount: parseInt(supervisor.allocationCount || 0)
      }
    });
  };

  return (
    <Modal 
      show={show} 
      onHide={onClose} 
      size="lg" 
      centered 
      data-bs-theme={darkMode ? "dark" : "light"}
    >
      <Modal.Header closeButton className={darkMode ? "bg-dark text-white" : ""}>
        <Modal.Title>Assign Managers</Modal.Title>
      </Modal.Header>
      
      <Modal.Body className={darkMode ? "bg-dark text-white" : ""}>
        {loading ? (
          <div className="text-center">
            <div className={`spinner-border ${darkMode ? "text-light" : "text-primary"}`} role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading staff data...</p>
          </div>
        ) : (
          <>
            {error && (
              <Alert variant="danger" className="mb-3">
                <ExclamationCircle className="me-2" />
                {error}
              </Alert>
            )}
            
            <div className="mb-3">
              <p>Scheme: <strong>{scheme?.schemeName}</strong></p>
              <p>Total Allocation: <strong>{scheme?.totalAllocation}</strong></p>
              <p>Available Positions: <strong>{scheme?.totalEmptyCount}</strong></p>
            </div>
            
            {[
              { 
                label: "General Manager", 
                state: generalManager, 
                setState: setGeneralManager,
                options: managers,
                variant: "danger"
              },
              { 
                label: "Deputy Manager", 
                state: deputyManager, 
                setState: setDeputyManager,
                options: deputies,
                variant: "primary"
              },
              { 
                label: "Supervisor", 
                state: supervisor, 
                setState: setSupervisor,
                options: supervisors,
                variant: "success"
              }
            ].map(({ label, state, setState, options, variant }) => (
              <div key={label} className={`p-3 mb-3 border-${variant} border rounded`}>
                <h5 className={`text-${variant}`}>{label}</h5>
                <Form.Group className="mb-3" controlId={`${label.replace(/\s+/g, '')}Select`}>
                  <Form.Label>{label} Name</Form.Label>
                  <Form.Control 
                    as="select"
                    value={state.name || ''}
                    onChange={(e) => setState({
                      ...state,
                      name: e.target.value
                    })}
                    className={darkMode ? "bg-secondary text-white" : ""}
                  >
                    <option value="">Select {label}</option>
                    {options.map((option) => (
                      <option key={option.value} value={option.label}>
                        {option.label}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>

                <Form.Group className="mb-3" controlId={`${label.replace(/\s+/g, '')}Allocation`}>
                  <Form.Label>Allocation Count</Form.Label>
                  <Form.Control
                    type="number"
                    value={state.allocationCount || 0}
                    onChange={(e) => setState({ 
                      ...state, 
                      allocationCount: e.target.value === '' ? 0 : parseInt(e.target.value)
                    })}
                    placeholder={`Enter ${label.toLowerCase()} allocation`}
                    className={darkMode ? "bg-secondary text-white" : ""}
                    min="0"
                  />
                </Form.Group>
              </div>
            ))}
          </>
        )}
      </Modal.Body>
      
      <Modal.Footer className={darkMode ? "bg-dark text-white" : ""}>
        <Button 
          variant={darkMode ? "outline-light" : "secondary"} 
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button 
          variant={darkMode ? "outline-primary" : "primary"} 
          onClick={handleSubmit}
          disabled={loading}
        >
          <CheckCircle className="me-2" /> Assign Managers
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AssignNewManagerModal;