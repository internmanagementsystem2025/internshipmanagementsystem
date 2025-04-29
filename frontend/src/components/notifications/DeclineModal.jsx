import React, { useState } from "react";
import { Modal, Button, Spinner, Alert, Form } from "react-bootstrap";
import { FaTimesCircle, FaTimes } from "react-icons/fa";
import { motion } from "framer-motion";

const DeclineModal = ({
  show,
  onClose,
  onConfirm,
  refNo,
  darkMode,
  isLoading,
  successMessage,
}) => {
  return (
    <>
      {show && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.3)",
            backdropFilter: "blur(8px)",
            zIndex: 1040,
          }}
        />
      )}

      <Modal
        show={show}
        onHide={onClose}
        centered
        backdrop="static"
        style={{ zIndex: 1050 }}
      >
        <Modal.Header
          closeButton
          className={darkMode ? "bg-danger text-white" : "bg-light text-dark"}
        >
          <Modal.Title>
            <FaTimesCircle className="me-2" />
            {successMessage ? "Decline Successful" : "Confirm Decline"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body
          className={`text-center ${
            darkMode ? "bg-dark text-white" : "bg-light text-dark"
          }`}
        >
          {successMessage ? (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
                className="mb-3"
              >
                <FaTimesCircle className="text-danger" size={50} />
              </motion.div>
              <Alert variant="success" className="mt-3">
                {successMessage}
              </Alert>
            </>
          ) : (
            <>
              <motion.div
                animate={{
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  repeatType: "loop",
                }}
                className="mb-3"
              >
                <FaTimesCircle className="text-danger" size={50} />
              </motion.div>
              <p>
                Are you sure you want to decline{" "}
                <strong className="text-danger">{refNo || "this item"}</strong>?
                This action cannot be undone.
              </p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer
          className={darkMode ? "bg-dark text-white" : "bg-light text-dark"}
        >
          {!successMessage && (
            <>
              <Button
                variant={darkMode ? "outline-light" : "secondary"}
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button variant="danger" onClick={onConfirm} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Declining...
                  </>
                ) : (
                  "Decline"
                )}
              </Button>
            </>
          )}
          {successMessage && (
            <Button variant="danger" onClick={onClose}>
              Close
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default DeclineModal;
