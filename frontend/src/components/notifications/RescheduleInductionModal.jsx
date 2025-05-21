import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Spinner, Alert } from "react-bootstrap";
import axios from "axios";
import { FaCalendarAlt } from "react-icons/fa";
import { motion } from "framer-motion";

const RescheduleInductionModal = ({
  show,
  onClose,
  onConfirm,
  refNo,
  darkMode,
  successMessage,
  errorMessage,
  onClearMessages,
  currentInductionId,
  currentInductionName,
}) => {
  const [inductions, setInductions] = useState([]);
  const [selectedInduction, setSelectedInduction] = useState("");
  const [rescheduleReason, setRescheduleReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState("");
  const [localSuccess, setLocalSuccess] = useState("");
  const API_BASE_URL = import.meta.env.VITE_BASE_URL;
  const token = localStorage.getItem("token");

  // Clear messages when modal closes or when parent clears them
  useEffect(() => {
    if (!show) {
      setLocalError("");
      setLocalSuccess("");
      setRescheduleReason("");
      setSelectedInduction("");
    }
  }, [show]);

  // Sync with parent component messages
  useEffect(() => {
    if (errorMessage) {
      setLocalError(errorMessage);
    }
    if (successMessage) {
      setLocalSuccess(successMessage);
    }
  }, [errorMessage, successMessage]);

  const fetchInductions = async () => {
    if (!show) return;

    setLoading(true);
    setLocalError("");
    setLocalSuccess("");

    try {
      const response = await axios.get(`${API_BASE_URL}/inductions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data && Array.isArray(response.data)) {
        // Filter out past inductions and the current induction being rescheduled
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0); // Set to beginning of today
        
        const availableInductions = response.data.filter(induction => {
          // Handle date formats
          const inductionStartDate = new Date(induction.inductionStartDate || induction.startDate);
          return inductionStartDate >= currentDate && induction._id !== currentInductionId;
        });
        
        setInductions(availableInductions);
        
        if (availableInductions.length === 0) {
          setLocalError("No available inductions found. Please create a new induction first.");
        }
      } else {
        throw new Error("Unexpected response format");
      }
    } catch (err) {
      setLocalError("Failed to fetch inductions. Please try again.");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInductions();
  }, [show, currentInductionId]);

  const handleConfirm = async () => {
    if (!selectedInduction) {
      setLocalError("Please select a new induction session.");
      return;
    }

    if (!rescheduleReason.trim()) {
      setLocalError("Please provide a reason for rescheduling.");
      return;
    }

    setSubmitting(true);
    setLocalError("");
    onClearMessages(); // Clear any existing messages before new submission

    try {
      // Pass the current induction ID and the new induction ID along with reason
      await onConfirm(selectedInduction, currentInductionId, rescheduleReason);
      // Success message will come from the parent component
    } catch (err) {
      setLocalError(err.message || "Failed to reschedule induction");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setLocalError("");
    setLocalSuccess("");
    onClearMessages();
    onClose();
  };

  return (
    <Modal show={show} onHide={handleClose} centered backdrop="static">
      <Modal.Header
        closeButton
        className={darkMode ? "bg-dark text-white" : "bg-light text-dark"}
      >
        <Modal.Title>
          <FaCalendarAlt className="me-2" /> Reschedule Induction
        </Modal.Title>
      </Modal.Header>

      <Modal.Body
        className={`${
          darkMode ? "bg-dark text-white" : "bg-light text-dark"
        }`}
      >
        <div className="text-center mb-4">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 1, repeat: Infinity, repeatType: "loop" }}
            className="mb-3"
          >
            <FaCalendarAlt className="text-warning" size={50} />
          </motion.div>

          <p>
            Reschedule the induction for <strong>{refNo}</strong>
            {currentInductionName && (
              <span> (Currently: <em>{currentInductionName}</em>)</span>
            )}
          </p>
        </div>

        {/* Show success/error messages from either local state or props */}
        {localSuccess && (
          <Alert
            variant="success"
            dismissible
            onClose={() => {
              setLocalSuccess("");
              onClearMessages();
            }}
          >
            {localSuccess}
          </Alert>
        )}

        {localError && (
          <Alert
            variant="danger"
            dismissible
            onClose={() => {
              setLocalError("");
              onClearMessages();
            }}
          >
            {localError}
            <Button
              size="sm"
              variant="outline-danger"
              className="ms-2"
              onClick={fetchInductions}
            >
              Retry
            </Button>
          </Alert>
        )}

        {loading ? (
          <div className="text-center">
            <Spinner animation="border" variant="warning" />
            <p>Loading available induction sessions...</p>
          </div>
        ) : (
          !localSuccess && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Select New Induction Session</Form.Label>
                <Form.Control
                  as="select"
                  value={selectedInduction}
                  onChange={(e) => setSelectedInduction(e.target.value)}
                  className={darkMode ? "bg-dark text-white border-warning" : ""}
                  disabled={submitting}
                >
                  <option value="">Select a New Induction Session</option>
                  {inductions.map((induction) => (
                    <option key={induction._id} value={induction._id}>
                      {induction.induction || induction.name || "Unnamed Induction"} - {" "}
                      {induction.inductionStartDate
                        ? new Date(induction.inductionStartDate).toLocaleDateString() + " to " + 
                          new Date(induction.inductionEndDate || induction.endDate).toLocaleDateString()
                        : induction.startDate 
                          ? new Date(induction.startDate).toLocaleDateString() + " to " + 
                            new Date(induction.endDate).toLocaleDateString()
                          : "No Date Range"}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Reason for Rescheduling</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  placeholder="Please provide a reason for rescheduling..."
                  className={darkMode ? "bg-dark text-white border-warning" : ""}
                  disabled={submitting}
                />
                <Form.Text className={darkMode ? "text-light" : "text-muted"}>
                  This reason will be included in the notification to the candidate.
                </Form.Text>
              </Form.Group>
            </Form>
          )
        )}
      </Modal.Body>

      <Modal.Footer
        className={darkMode ? "bg-dark text-white" : "bg-light text-dark"}
      >
        <Button
          variant={darkMode ? "outline-light" : "secondary"}
          onClick={handleClose}
          disabled={submitting}
        >
          Cancel
        </Button>
        {!localSuccess && (
          <Button
            variant="warning"
            onClick={handleConfirm}
            disabled={!selectedInduction || !rescheduleReason.trim() || submitting || loading}
          >
            {submitting ? (
              <>
                <Spinner animation="border" size="sm" /> Rescheduling...
              </>
            ) : (
              "Reschedule Induction"
            )}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default RescheduleInductionModal;