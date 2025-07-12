import React, { useState, useEffect } from "react";
import { Modal, Form, Button, Alert, Badge, Card, Spinner, Row, Col, InputGroup } from "react-bootstrap";
import { CheckCircle, ExclamationCircle, Diagram3, Search } from "react-bootstrap-icons";

const AssignNewManagerModal = ({ 
  show, 
  onClose, 
  onAssignManager, 
  scheme, 
  employees = [],
  hierarchyData = [],
  darkMode = false 
}) => {
  // UI state
  const [searchTerm, setSearchTerm] = useState("");
  const [previewEmployee, setPreviewEmployee] = useState(null);
  const [selectedManagers, setSelectedManagers] = useState([]);
  const [allocationMap, setAllocationMap] = useState({});
  const [allocationError, setAllocationError] = useState("");
  const totalAllocation = scheme?.totalAllocation || 0;

  // Search and preview logic
  useEffect(() => {
    if (!searchTerm) {
      setPreviewEmployee(null);
      return;
    }
    const emp = employees.find(
      e =>
        e.employeeCode?.toLowerCase() === searchTerm.toLowerCase() ||
        e.name?.toLowerCase() === searchTerm.toLowerCase()
    );
    setPreviewEmployee(emp || null);
  }, [searchTerm, employees]);

  // Allocation summary
  const allocatedCount = Object.values(allocationMap).reduce((a, b) => a + b, 0);
  const remainingAllocation = totalAllocation - allocatedCount;

  // Select manager
  const handleSelectManager = emp => {
    if (selectedManagers.some(m => m.id === emp.id)) return;
    setSelectedManagers([...selectedManagers, emp]);
    setAllocationMap(prev => ({ ...prev, [emp.id]: 1 }));
    setAllocationError("");
  };

  // Remove manager
  const handleRemoveManager = empId => {
    setSelectedManagers(selectedManagers.filter(m => m.id !== empId));
    setAllocationMap(prev => {
      const copy = { ...prev };
      delete copy[empId];
      return copy;
    });
    setAllocationError("");
  };

  // Allocation change
  const handleAllocationChange = (empId, value) => {
    const allocation = Math.max(1, Math.min(Number(value) || 1, totalAllocation));
    setAllocationMap(prev => ({ ...prev, [empId]: allocation }));
    setAllocationError("");
  };

  // Assign managers
  const handleAssignManagers = () => {
    if (allocatedCount > totalAllocation) {
      setAllocationError("Total allocation exceeded!");
      return;
    }
    if (selectedManagers.length === 0) return;
    // Prepare managerData for parent handler
    const managerData = {};
    selectedManagers.forEach(emp => {
      managerData[emp.employeeCode] = {
        id: emp.id,
        name: emp.name,
        employeeCode: emp.employeeCode,
        email: emp.email,
        department: emp.department,
        position: emp.position,
        allocationCount: allocationMap[emp.id] || 1
      };
    });
    onAssignManager(managerData);
    setSelectedManagers([]);
    setAllocationMap({});
    setAllocationError("");
  };

  return (
    <Modal 
      show={show} 
      onHide={onClose} 
      fullscreen
      centered 
      data-bs-theme={darkMode ? "dark" : "light"}
    >
      <Modal.Header closeButton className={darkMode ? "bg-dark text-white" : ""}>
        <Modal.Title>
          <Diagram3 className="me-2" />
          Assign Managers
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className={darkMode ? "bg-dark text-white" : ""} style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        <Row>
          {/* Left: Hierarchy & Allocation Info */}
          <Col md={8}>
            <Card className={darkMode ? "bg-dark text-white border-secondary" : "bg-light"}>
              <Card.Body>
                <div className="mb-4">
                  <strong>Total Allocation Available:</strong>{" "}
                  <Badge bg="primary">{totalAllocation}</Badge>
                  <div>
                    <strong>Allocated:</strong>{" "}
                    <Badge bg="success">{allocatedCount}</Badge>
                  </div>
                  <div>
                    <strong>Remaining:</strong>{" "}
                    <Badge bg="info">{remainingAllocation}</Badge>
                  </div>
                  {allocationError && (
                    <div className="text-danger mt-2">{allocationError}</div>
                  )}
                </div>
                <div>
                  <h5 className="mb-3 d-flex justify-content-between align-items-center">
                    Organizational Hierarchy
                    <Button
                      variant={darkMode ? "outline-secondary" : "outline-primary"}
                      size="sm"
                      // TODO: collapse/expand logic
                    >
                      Collapse All
                    </Button>
                  </h5>
                  {/* Hierarchy/Empty State */}
                  <div style={{ minHeight: 200 }}>
                    {!previewEmployee ? (
                      <div className="text-center py-5 text-muted">
                        <Diagram3 size={48} className="mb-3" />
                        <h5>Select an employee to view hierarchy</h5>
                        <p>Search for an employee in the sidebar to view their subordinate hierarchy.</p>
                      </div>
                    ) : (
                      <Card className="mb-3">
                        <Card.Body>
                          <div className="d-flex align-items-center mb-2">
                            <Badge bg="primary" className="me-2">{previewEmployee.employeeCode}</Badge>
                            <strong>{previewEmployee.name}</strong>
                          </div>
                          <div className="mb-2">
                            <span className="me-3"><strong>Department:</strong> {previewEmployee.department}</span>
                            <span className="me-3"><strong>Position:</strong> {previewEmployee.position}</span>
                          </div>
                          <div>
                            <strong>Hierarchy Level:</strong> {previewEmployee.hierarchyLevel}
                          </div>
                          {/* TODO: Show subordinates tree if needed */}
                        </Card.Body>
                      </Card>
                    )}
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          {/* Right: Sidebar */}
          <Col md={4}>
            <Card className={darkMode ? "bg-dark text-white border-secondary" : "bg-white"}>
              <Card.Header>
                <Search className="me-2" />
                <strong>Search Employee</strong>
              </Card.Header>
              <Card.Body>
                <InputGroup className="mb-3">
                  <Form.Control
                    type="text"
                    placeholder="Enter Service Number or Name"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className={darkMode ? "bg-secondary text-white" : ""}
                  />
                </InputGroup>
                {previewEmployee && (
                  <div className="mb-3 p-2 border rounded bg-light">
                    <div className="fw-bold">{previewEmployee.name}</div>
                    <div>
                      <Badge bg="primary">{previewEmployee.employeeCode}</Badge>
                    </div>
                    <div className="text-muted" style={{ fontSize: 13 }}>
                      Service: {previewEmployee.employeeCode}
                    </div>
                    <div className="text-muted" style={{ fontSize: 13 }}>
                      Cost Center: {previewEmployee.costCenter}
                    </div>
                    <Button
                      variant="outline-success"
                      size="sm"
                      className="mt-2"
                      onClick={() => handleSelectManager(previewEmployee)}
                      disabled={selectedManagers.some(m => m.id === previewEmployee.id)}
                    >
                      Add as Manager
                    </Button>
                  </div>
                )}
              </Card.Body>
            </Card>
            {/* Selected Managers List */}
            <Card className={`mt-3 ${darkMode ? "bg-dark text-white border-secondary" : "bg-white"}`}>
              <Card.Header>
                <strong>Selected Managers ({selectedManagers.length})</strong>
              </Card.Header>
              <Card.Body>
                {selectedManagers.length === 0 ? (
                  <div className="text-muted text-center py-2">No managers selected.</div>
                ) : (
                  selectedManagers.map(emp => (
                    <div key={emp.id} className="mb-3 border-bottom pb-2">
                      <div className="d-flex align-items-center justify-content-between">
                        <div>
                          <Badge bg="primary" className="me-2">{emp.employeeCode}</Badge>
                          <strong>{emp.name}</strong>
                        </div>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleRemoveManager(emp.id)}
                        >
                          ×
                        </Button>
                      </div>
                      <Form.Group className="mt-2">
                        <Form.Label>Allocation</Form.Label>
                        <Form.Control
                          type="number"
                          min={1}
                          max={totalAllocation}
                          value={allocationMap[emp.id] || 1}
                          onChange={e => handleAllocationChange(emp.id, e.target.value)}
                          className={darkMode ? "bg-secondary text-white" : ""}
                        />
                      </Form.Group>
                    </div>
                  ))
                )}
                <Button
                  variant="primary"
                  className="w-100 mt-3"
                  disabled={selectedManagers.length === 0 || allocatedCount > totalAllocation}
                  onClick={handleAssignManagers}
                >
                  {allocatedCount > totalAllocation ? "Allocation Exceeded" : "Assign Managers"}
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer className={darkMode ? "bg-dark text-white" : ""}>
        <Button variant={darkMode ? "outline-light" : "secondary"} onClick={onClose}>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AssignNewManagerModal;