import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Spinner } from 'react-bootstrap';
import Select from 'react-select';
import axios from 'axios';

const AssignNewManagerModal = ({ show, onClose, onAssignManager, scheme, darkMode = false }) => {
  const [supervisors, setSupervisors] = useState([]);
  const [loadingSupervisors, setLoadingSupervisors] = useState(true);
  const [selectedGeneralManager, setSelectedGeneralManager] = useState(null);
  const [selectedDeputyManager, setSelectedDeputyManager] = useState(null);
  const [selectedSupervisor, setSelectedSupervisor] = useState(null);
  const [allocations, setAllocations] = useState({
    generalManager: 0,
    deputyManager: 0,
    supervisor: 0,
  });

  useEffect(() => {
    const fetchSupervisors = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/supervisors');
        const supervisorOptions = response.data.map(emp => ({
          value: emp._id,
          label: `${emp.SUPERVISOR_TITLE} ${emp.SUPERVISOR_INITIALS} ${emp.SUPERVISOR_FIRST_NAME} ${emp.SUPERVISOR_SURNAME}`,
        }));
        setSupervisors(supervisorOptions);
        setLoadingSupervisors(false);
      } catch (error) {
        console.error('Error fetching employees:', error);
        setLoadingSupervisors(false);
      }
    };

    fetchSupervisors();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const managerData = {
      generalManager: selectedGeneralManager?.value || null,
      deputyManager: selectedDeputyManager?.value || null,
      supervisor: selectedSupervisor?.value || null,
      generalManagerAllocation: allocations.generalManager,
      deputyManagerAllocation: allocations.deputyManager,
      supervisorAllocation: allocations.supervisor,
    };
    onAssignManager(managerData);
  };

  return (
    <Modal show={show} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton className={darkMode ? 'bg-dark text-white' : ''}>
        <Modal.Title>Assign New Managers</Modal.Title>
      </Modal.Header>
      <Modal.Body className={darkMode ? 'bg-dark text-white' : ''}>
        {loadingSupervisors ? (
          <div className="text-center">
            <Spinner animation="border" />
            <p>Loading supervisors...</p>
          </div>
        ) : (
          <Form onSubmit={handleSubmit}>
            {/* General Manager */}
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="generalManager">
                  <Form.Label>General Manager</Form.Label>
                  <Select
                    options={supervisors}
                    value={selectedGeneralManager}
                    onChange={setSelectedGeneralManager}
                    placeholder="Select General Manager"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="generalManagerAllocation">
                  <Form.Label>Allocation</Form.Label>
                  <Form.Control
                    type="number"
                    value={allocations.generalManager}
                    onChange={(e) =>
                      setAllocations({ ...allocations, generalManager: parseInt(e.target.value, 10) })
                    }
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Deputy Manager */}
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="deputyManager">
                  <Form.Label>Deputy Manager</Form.Label>
                  <Select
                    options={supervisors}
                    value={selectedDeputyManager}
                    onChange={setSelectedDeputyManager}
                    placeholder="Select Deputy Manager"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="deputyManagerAllocation">
                  <Form.Label>Allocation</Form.Label>
                  <Form.Control
                    type="number"
                    value={allocations.deputyManager}
                    onChange={(e) =>
                      setAllocations({ ...allocations, deputyManager: parseInt(e.target.value, 10) })
                    }
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Supervisor */}
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="supervisor">
                  <Form.Label>Supervisor</Form.Label>
                  <Select
                    options={supervisors}
                    value={selectedSupervisor}
                    onChange={setSelectedSupervisor}
                    placeholder="Select Supervisor"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="supervisorAllocation">
                  <Form.Label>Allocation</Form.Label>
                  <Form.Control
                    type="number"
                    value={allocations.supervisor}
                    onChange={(e) =>
                      setAllocations({ ...allocations, supervisor: parseInt(e.target.value, 10) })
                    }
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end">
              <Button variant="secondary" onClick={onClose} className="me-2">
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Assign Managers
              </Button>
            </div>
          </Form>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default AssignNewManagerModal;
