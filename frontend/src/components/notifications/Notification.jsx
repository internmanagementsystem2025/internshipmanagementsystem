import React from "react";
import { Toast, ToastContainer } from "react-bootstrap";

const Notification = ({ show, onClose, message, variant = "success" }) => {
  return (
    <>
      {show && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            backdropFilter: "blur(5px)",
            zIndex: 1049,
          }}
        />
      )}

      <ToastContainer
        className="position-fixed start-50 top-50 translate-middle p-3"
        style={{ zIndex: 1050 }}
      >
        <Toast onClose={onClose} show={show} delay={3000} autohide bg={variant}>
          <Toast.Body className="text-white text-center">{message}</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
};

export default Notification;
