import React from "react";
import { Modal, Button } from "react-bootstrap";
import { Diagram3 } from "react-bootstrap-icons";

// Demo hierarchy data (replace with real data from props)
const demoHierarchy = [
  {
    position: "CEO",
    name: "Alice Johnson",
    service: "573824",
    cost: "CC-001",
    allocated: 15,
    available: 5,
    subordinates: [
      {
        position: "CXO",
        name: "Bob Smith",
        service: "573825",
        cost: "CC-002",
        allocated: 8,
        available: 4,
        subordinates: [
          {
            position: "DCXO",
            name: "Carol Lee",
            service: "573827",
            cost: "CC-004",
            allocated: 5,
            available: 3,
            subordinates: [],
          },
          {
            position: "DCXO",
            name: "Dan Miller",
            service: "573828",
            cost: "CC-005",
            allocated: 4,
            available: 2,
            subordinates: [],
          }
        ],
      },
      {
        position: "CXO",
        name: "Helen Black",
        service: "573826",
        cost: "CC-003",
        allocated: 7,
        available: 2,
        subordinates: [
          {
            position: "DCXO",
            name: "Ian Gray",
            service: "573829",
            cost: "CC-006",
            allocated: 4,
            available: 1,
            subordinates: [],
          }
        ],
      }
    ]
  }
];

// Helper for position color and badge style (matches HTML/CSS)
function getPositionStyles(position, darkMode) {
  // Card background and text color for dark/light mode
  const baseCard = darkMode
    ? {
        background: "#23272f",
        border: "1px solid #374151",
        borderRadius: "12px",
        color: "#F3F4F6"
      }
    : {
        background: "#fff",
        border: "1px solid #E2E8F0",
        borderRadius: "12px",
        color: "#1E293B"
      };

  // Badge color for dark/light mode
  switch (position) {
    case "CEO":
      return {
        card: baseCard,
        badge: { background: "#FFD700", color: "#000" }
      };
    case "CXO":
      return {
        card: baseCard,
        badge: { background: "#003366", color: "#fff" }
      };
    case "DCXO":
      return {
        card: baseCard,
        badge: { background: "#4169E1", color: "#fff" }
      };
    case "GM":
      return {
        card: baseCard,
        badge: { background: "#008080", color: "#fff" }
      };
    case "DGM":
      return {
        card: baseCard,
        badge: { background: "#006666", color: "#fff" }
      };
    case "Engineer":
      return {
        card: baseCard,
        badge: { background: "#F5F5F5", color: darkMode ? "#1E293B" : "#374151" }
      };
    case "Assistant":
      return {
        card: baseCard,
        badge: { background: "#E5E7EB", color: darkMode ? "#1E293B" : "#374151" }
      };
    default:
      return {
        card: baseCard,
        badge: { background: "#CBD5E0", color: "#1E293B" }
      };
  }
}

// Render a single node (matches HTML/CSS screenshot)
function NodeCard({ node, darkMode }) {
  const styles = getPositionStyles(node.position, darkMode);
  return (
    <div
      style={{
        ...styles.card,
        minWidth: 200,
        maxWidth: 220,
        padding: 16,
        margin: "16px auto", // ensure vertical and horizontal centering
        boxShadow: darkMode
          ? "0 2px 4px rgba(0,0,0,0.25)"
          : "0 2px 4px rgba(0,0,0,0.05)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center" // center content vertically
      }}
    >
      <div style={{
        fontWeight: 600,
        fontSize: 13,
        marginBottom: 8,
        padding: "4px 12px",
        borderRadius: 4,
        ...styles.badge,
        display: "inline-block"
      }}>
        {node.position || "—"}
      </div>
      <div style={{ fontWeight: 600, fontSize: 15 }}>{node.name || "—"}</div>
      <div style={{ fontSize: 13, color: darkMode ? "#94a3b8" : "#64748B", marginBottom: 4 }}>Service: {node.service || "—"}</div>
      <div style={{ fontSize: 13, color: darkMode ? "#94a3b8" : "#64748B", marginBottom: 4 }}>Cost Center: {node.cost || "—"}</div>
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
  );
}

function HierarchyTree({ node, darkMode }) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center" // center tree horizontally
    }}>
      <NodeCard node={node} darkMode={darkMode} />
      {node.subordinates && node.subordinates.length > 0 && (
        <>
          <div style={{ width: 2, height: 24, background: darkMode ? "#374151" : "#CBD5E0", margin: "0 auto" }} />
          <div style={{
            display: "flex",
            gap: 40,
            justifyContent: "center",
            alignItems: "center", // center subordinates horizontally
            marginTop: 8
          }}>
            {node.subordinates.map(sub => (
              <HierarchyTree key={sub.service} node={sub} darkMode={darkMode} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const ViewRelativeHierachy = ({
  show,
  onClose,
  scheme,
  employees,
  hierarchyData,
  darkMode
}) => {
  // Use demoHierarchy for now, replace with hierarchyData if available
  // If hierarchyData is passed from parent and is non-empty, it will override demoHierarchy.
  // If you always want to use dummy data, remove hierarchyData from props or always use demoHierarchy.
  const treeData = demoHierarchy; // <-- force dummy data only

  return (
    <Modal
      show={show}
      onHide={onClose}
      fullscreen
      centered
      contentClassName={darkMode ? "bg-dark text-white" : ""}
      style={{ zIndex: 2000 }}
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
          Manager Hierarchy View
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
      <Modal.Body style={{ minHeight: "400px", padding: 0 }}>
        <div
          className="view-hierarchy"
          style={{
            background: darkMode ? "#23272f" : "#fff",
            borderRadius: 12,
            padding: 24,
            minHeight: "100vh",
            boxShadow: darkMode
              ? "0 4px 12px rgba(0,0,0,0.3)"
              : "0 4px 6px rgba(0,0,0,0.05)"
          }}
        >
          <div className="toolbar" style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
            paddingBottom: 16,
            borderBottom: darkMode ? "1px solid #374151" : "1px solid #E2E8F0"
          }}>
            <h2 className="toolbar-title" style={{ fontWeight: 600, fontSize: 18, color: darkMode ? "#F3F4F6" : "#1E293B" }}>
              Manager Hierarchy View
            </h2>
            <div className="toolbar-actions" style={{ display: "flex", gap: 8 }}>
              <Button variant={darkMode ? "outline-light" : "outline-primary"} size="sm">🔍 Zoom In</Button>
              <Button variant={darkMode ? "outline-light" : "outline-primary"} size="sm">🔍 Zoom Out</Button>
              <Button variant={darkMode ? "outline-light" : "outline-primary"} size="sm">📁 Expand All</Button>
              <Button variant={darkMode ? "outline-light" : "outline-primary"} size="sm">📂 Collapse All</Button>
              <Button variant={darkMode ? "outline-light" : "outline-primary"} size="sm">📄 Export PDF</Button>
            </div>
          </div>
          <div className="hierarchy-chart" style={{
            overflow: "auto",
            minHeight: "300px",
            padding: 20,
            background: darkMode ? "#23272f" : "#fff"
          }}>
            <div className="hierarchy-tree" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
              {/* Render the hierarchy tree */}
              {treeData.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <Diagram3 size={48} className="mb-3" />
                  <h5>No hierarchy data available</h5>
                  <p>Hierarchy tree will appear here once data is available.</p>
                </div>
              ) : (
                treeData.map(node => <HierarchyTree key={node.service} node={node} darkMode={darkMode} />)
              )}
            </div>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ViewRelativeHierachy;
