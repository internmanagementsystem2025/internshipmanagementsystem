import React from "react";
import { Modal, Button, Spinner, Alert } from "react-bootstrap";
import { FaCheckCircle, FaTimes } from "react-icons/fa";
import { motion } from "framer-motion";

const ApproveModal = ({
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
          className={darkMode ? "bg-success text-white" : "bg-light text-dark"}
        >
          <Modal.Title>
            <FaCheckCircle className="me-2" />
            {successMessage ? "Approval Successful" : "Confirm Approval"}
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
                <FaCheckCircle className="text-success" size={50} />
              </motion.div>
              <Alert variant="success" className="mt-3">
                {successMessage}
              </Alert>
            </>
          ) : (
            <>
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  repeatType: "loop",
                }}
                className="mb-3"
              >
                <FaCheckCircle className="text-success" size={50} />
              </motion.div>
              <p>
                Are you sure you want to approve{" "}
                <strong className="text-success">{refNo || "this item"}</strong>
                ?
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
              <Button
                variant="success"
                onClick={onConfirm}
                disabled={isLoading}
              >
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
                    Approving...
                  </>
                ) : (
                  "Approve"
                )}
              </Button>
            </>
          )}
          {successMessage && (
            <Button variant="success" onClick={onClose}>
              Close
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ApproveModal;
