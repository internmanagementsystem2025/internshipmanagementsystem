import React, { useState, useEffect } from "react";
import { Modal, Form, Button, Alert, Badge, Card, Spinner, Row, Col, InputGroup } from "react-bootstrap";
import { CheckCircle, ExclamationCircle, Diagram3, Search } from "react-bootstrap-icons";

// Dummy manager data with hierarchy (clarified allocation logic)
// Each manager's 'allocated' is what they keep, 'available' is what can be allocated to their subordinates.
// The sum of allocations for all subordinates must not exceed the parent's 'available'.

const dummyManagers = [
  {
    id: "573824",
    name: "Alice Johnson",
    employeeCode: "573824",
    department: "Management",
    position: "CEO",
    costCenter: "CC-001",
    hierarchyLevel: 1,
    allocated: 10, // Alice keeps 10 interns
    available: 10, // 20 total - 10 allocated to Alice = 10 available for subordinates
    subordinates: [
      {
        id: "573825",
        name: "Bob Smith",
        employeeCode: "573825",
        department: "Operations",
        position: "CXO",
        costCenter: "CC-002",
        hierarchyLevel: 2,
        allocated: 6, // Bob keeps 6 interns
        available: 0, // Bob has no available interns for subordinates (all 10 available from Alice are allocated: 6 to Bob, 4 to Helen)
        subordinates: [
          {
            id: "573827",
            name: "Carol Lee",
            employeeCode: "573827",
            department: "Operations",
            position: "DCXO",
            costCenter: "CC-004",
            hierarchyLevel: 3,
            allocated: 0, // Carol gets 0 interns
            available: 0,
            subordinates: []
          }
        ]
      },
      {
        id: "573826",
        name: "Helen Black",
        employeeCode: "573826",
        department: "Finance",
        position: "CXO",
        costCenter: "CC-003",
        hierarchyLevel: 2,
        allocated: 4, // Helen keeps 4 interns
        available: 0, // Helen has no available interns for subordinates
        subordinates: [
          {
            id: "573829",
            name: "Ian Gray",
            employeeCode: "573829",
            department: "Finance",
            position: "DCXO",
            costCenter: "CC-006",
            hierarchyLevel: 3,
            allocated: 0, // Ian gets 0 interns
            available: 0,
            subordinates: []
          }
        ]
      }
    ]
  },
  {
    id: "573830",
    name: "David Kim",
    employeeCode: "573830",
    department: "IT",
    position: "GM",
    costCenter: "CC-007",
    hierarchyLevel: 4,
    allocated: 0,
    available: 0,
    subordinates: []
  }
];

// Helper for position color and badge style
function getPositionStyles(position, darkMode) {
  const baseCard = darkMode
    ? { background: "#23272f", border: "1px solid #374151", borderRadius: "12px", color: "#F3F4F6" }
    : { background: "#fff", border: "1px solid #E2E8F0", borderRadius: "12px", color: "#1E293B" };
  switch (position) {
    case "CEO": return { card: baseCard, badge: { background: "#FFD700", color: "#000" } };
    case "CXO": return { card: baseCard, badge: { background: "#003366", color: "#fff" } };
    case "DCXO": return { card: baseCard, badge: { background: "#4169E1", color: "#fff" } };
    case "GM": return { card: baseCard, badge: { background: "#008080", color: "#fff" } };
    default: return { card: baseCard, badge: { background: "#CBD5E0", color: "#1E293B" } };
  }
}

// Recursive tree renderer for hierarchy
function HierarchyTree({ node, darkMode, collapsed }) {
  if (!node) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 16 }}>
      <div
        style={{
          ...getPositionStyles(node.position, darkMode).card,
          minWidth: 200,
          maxWidth: 220,
          padding: 16,
          margin: "8px auto",
          boxShadow: darkMode
            ? "0 2px 4px rgba(0,0,0,0.25)"
            : "0 2px 4px rgba(0,0,0,0.05)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <div style={{
          fontWeight: 600,
          fontSize: 13,
          marginBottom: 8,
          padding: "4px 12px",
          borderRadius: 4,
          ...getPositionStyles(node.position, darkMode).badge,
          display: "inline-block"
        }}>
          {node.position}
        </div>
        <div style={{ fontWeight: 600, fontSize: 15 }}>{node.name}</div>
        <div style={{ fontSize: 13, color: darkMode ? "#94a3b8" : "#64748B", marginBottom: 4 }}>Service: {node.employeeCode}</div>
        <div style={{ fontSize: 13, color: darkMode ? "#94a3b8" : "#64748B", marginBottom: 4 }}>Cost Center: {node.costCenter}</div>
        <div style={{
          width: "100%",
          borderTop: darkMode ? "1px solid #374151" : "1px solid #E2E8F0",
          marginTop: 8,
          paddingTop: 8,
          display: "flex",
          justifyContent: "space-between"
        }}>
          <span style={{ color: "#22C55E", fontSize: 13 }}>Allocated: <strong>{node.allocated ?? "—"}</strong></span>
          <span style={{ color: "#3B82F6", fontSize: 13 }}>Available: <strong>{node.available ?? "—"}</strong></span>
        </div>
      </div>
      {/* Collapse logic: only show first subordinate if collapsed */}
      {node.subordinates && node.subordinates.length > 0 && (
        <>
          <div style={{ width: 2, height: 24, background: darkMode ? "#374151" : "#CBD5E0", margin: "0 auto" }} />
          <div style={{
            display: "flex",
            gap: 40,
            justifyContent: "center",
            alignItems: "center",
            marginTop: 8
          }}>
            {collapsed
              ? <HierarchyTree node={node.subordinates[0]} darkMode={darkMode} collapsed={collapsed} />
              : node.subordinates.map(sub => (
                  <HierarchyTree key={sub.id} node={sub} darkMode={darkMode} collapsed={collapsed} />
                ))
            }
          </div>
        </>
      )}
    </div>
  );
}

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
  const [collapsed, setCollapsed] = useState(false);

  // Search logic (by name or service number)
  const filteredManagers = dummyManagers.filter(
    m =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.employeeCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // When search term changes, preview first match
  useEffect(() => {
    if (!searchTerm) {
      setPreviewEmployee(null);
      return;
    }
    setPreviewEmployee(filteredManagers[0] || null);
  }, [searchTerm, filteredManagers]);

  // Allocation summary
  const allocatedCount = Object.values(allocationMap).reduce((a, b) => a + b, 0);
  const remainingAllocation = scheme?.totalAllocation - allocatedCount;

  // Select manager (only one at a time)
  const handleSelectManager = emp => {
    if (selectedManagers.length === 1 && selectedManagers[0].id === emp.id) return;
    setSelectedManagers([emp]);
    setAllocationMap({ [emp.id]: 1 });
    setAllocationError("");
  };

  // Remove manager (just clear selection)
  const handleRemoveManager = empId => {
    setSelectedManagers([]);
    setAllocationMap({});
    setAllocationError("");
  };

  // Allocation change: restrict allocation so total never exceeds totalAllocation
  const handleAllocationChange = (empId, value) => {
    let allocation = Math.max(1, Math.min(Number(value) || 1, scheme?.totalAllocation));
    // Calculate current total minus this manager's previous allocation
    const currentTotal = Object.entries(allocationMap)
      .filter(([id]) => id !== empId)
      .reduce((sum, [, val]) => sum + val, 0);
    // Restrict so sum does not exceed totalAllocation
    if (allocation + currentTotal > scheme?.totalAllocation) {
      allocation = scheme.totalAllocation - currentTotal;
      if (allocation < 1) allocation = 1;
    }
    setAllocationMap(prev => ({ ...prev, [empId]: allocation }));
    setAllocationError("");
  };

  // Rename handler to allocate interns
  const handleAllocateInterns = () => {
    if (allocatedCount > scheme?.totalAllocation) {
      setAllocationError("Total allocation exceeded!");
      return;
    }
    if (selectedManagers.length === 0) return;
    // Prepare allocationData for parent handler
    const allocationData = {};
    selectedManagers.forEach(emp => {
      allocationData[emp.employeeCode] = {
        id: emp.id,
        name: emp.name,
        employeeCode: emp.employeeCode,
        email: emp.email,
        department: emp.department,
        position: emp.position,
        allocationCount: allocationMap[emp.id] || 1
      };
    });
    onAssignManager(allocationData); // You may want to rename this prop to onAllocateInterns
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
      <Modal.Header
        closeButton
        className={darkMode ? "bg-dark text-white" : ""}
        closeVariant={darkMode ? "white" : "dark"}
        style={{
          borderBottom: darkMode ? "1px solid #374151" : "1px solid #dee2e6",
          position: "relative"
        }}
      >
        <Modal.Title>
          <Diagram3 className="me-2" />
          Allocate Interns
        </Modal.Title>
        {/* Ensure close icon is visible in both modes */}
        <style>
          {`
            .btn-close {
              filter: none !important;
            }
            .bg-dark .btn-close {
              filter: invert(100%) brightness(200%) !important;
            }
          `}
        </style>
      </Modal.Header>
      <Modal.Body className={darkMode ? "bg-dark text-white" : ""} style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        <Row>
          {/* Left: Hierarchy & Allocation Info */}
          <Col md={8}>
            <Card className={darkMode ? "bg-dark text-white border-secondary" : "bg-light"}>
              <Card.Body>
                <div className="mb-4">
                  <strong>Total Intern Allocation Available:</strong>{" "}
                  <Badge bg="primary">{scheme?.totalAllocation}</Badge>
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
                      onClick={() => setCollapsed(c => !c)}
                    >
                      {collapsed ? "Expand All" : "Collapse All"}
                    </Button>
                  </h5>
                  {/* Hierarchy/Empty State */}
                  <div style={{ minHeight: 200 }}>
                    {selectedManagers.length === 0 ? (
                      <div className="text-center py-5 text-muted">
                        <Diagram3 size={48} className="mb-3" />
                        <h5>Select a manager or employee from the sidebar to view hierarchy</h5>
                        <p>Click a button to preview their subordinate hierarchy.</p>
                      </div>
                    ) : collapsed ? (
                      <div className="mb-4">
                        {/* Only show the first selected manager's card, not the full hierarchy */}
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                          <div
                            style={{
                              ...getPositionStyles(selectedManagers[0].position, darkMode).card,
                              minWidth: 200,
                              maxWidth: 220,
                              padding: 16,
                              margin: "8px auto",
                              boxShadow: darkMode
                                ? "0 2px 4px rgba(0,0,0,0.25)"
                                : "0 2px 4px rgba(0,0,0,0.05)",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              justifyContent: "center"
                            }}
                          >
                            <div style={{
                              fontWeight: 600,
                              fontSize: 13,
                              marginBottom: 8,
                              padding: "4px 12px",
                              borderRadius: 4,
                              ...getPositionStyles(selectedManagers[0].position, darkMode).badge,
                              display: "inline-block"
                            }}>
                              {selectedManagers[0].position}
                            </div>
                            <div style={{ fontWeight: 600, fontSize: 15 }}>{selectedManagers[0].name}</div>
                            <div style={{ fontSize: 13, color: darkMode ? "#94a3b8" : "#64748B", marginBottom: 4 }}>
                              Service: {selectedManagers[0].employeeCode}
                            </div>
                            <div style={{ fontSize: 13, color: darkMode ? "#94a3b8" : "#64748B", marginBottom: 4 }}>
                              Cost Center: {selectedManagers[0].costCenter}
                            </div>
                            <div style={{
                              width: "100%",
                              borderTop: darkMode ? "1px solid #374151" : "1px solid #E2E8F0",
                              marginTop: 8,
                              paddingTop: 8,
                              display: "flex",
                              justifyContent: "space-between"
                            }}>
                              <span style={{ color: "#22C55E", fontSize: 13 }}>
                                Allocated: <strong>{selectedManagers[0].allocated ?? "—"}</strong>
                              </span>
                              <span style={{ color: "#3B82F6", fontSize: 13 }}>
                                Available: <strong>{selectedManagers[0].available ?? "—"}</strong>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      selectedManagers.map(manager => (
                        <div key={manager.id} className="mb-4">
                          <HierarchyTree node={manager} darkMode={darkMode} collapsed={false} />
                        </div>
                      ))
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
                <strong>Search Manager/Employee</strong>
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
                {filteredManagers.length > 0 && (
                  <div className="mb-3">
                    {filteredManagers.map(emp => (
                      <Button
                        key={emp.id}
                        variant={selectedManagers.length === 1 && selectedManagers[0].id === emp.id ? "success" : "outline-primary"}
                        className="w-100 mb-2 text-start"
                        onClick={() => handleSelectManager(emp)}
                        disabled={selectedManagers.length === 1 && selectedManagers[0].id === emp.id}
                      >
                        <Badge bg="primary" className="me-2">{emp.employeeCode}</Badge>
                        <strong>{emp.name}</strong>
                        <span className="ms-2 text-muted" style={{ fontSize: 13 }}>
                          {emp.position} | {emp.department}
                        </span>
                      </Button>
                    ))}
                  </div>
                )}
              </Card.Body>
            </Card>
            {/* Selected Managers/Employees List */}
            <Card className={`mt-3 ${darkMode ? "bg-dark text-white border-secondary" : "bg-white"}`}>
              <Card.Header>
                <strong>Selected for Intern Allocation ({selectedManagers.length})</strong>
              </Card.Header>
              <Card.Body>
                {selectedManagers.length === 0 ? (
                  <div className="text-muted text-center py-2">No selection made.</div>
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
                        <Form.Label>Intern Allocation</Form.Label>
                        <Form.Control
                          type="number"
                          min={1}
                          max={scheme?.totalAllocation}
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
                  disabled={selectedManagers.length === 0 || allocatedCount > scheme?.totalAllocation}
                  onClick={handleAllocateInterns}
                >
                  {allocatedCount > scheme?.totalAllocation ? "Allocation Exceeded" : "Allocate Interns"}
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