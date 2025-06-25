import React from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertTriangle, FiX } from 'react-icons/fi';

const ConfirmationModal = ({ show, title, message, onConfirm, onCancel, darkMode }) => {
  if (!show) {
    return null;
  }

  // Theme colors matching the notification component
  const getThemeColors = () => {
    return {
      bg: darkMode ? "#1f2937" : "#ffffff",
      border: darkMode ? "#374151" : "#e5e7eb",
      text: darkMode ? "#ffffff" : "#111827",
      headerBg: darkMode ? "#374151" : "#f9fafb",
      headerText: darkMode ? "#ffffff" : "#374151",
      overlayBg: darkMode ? "rgba(0, 0, 0, 0.7)" : "rgba(0, 0, 0, 0.5)"
    };
  };

  const themeColors = getThemeColors();

  // Modal styles matching notification component design
  const modalStyle = {
    background: `linear-gradient(135deg, ${themeColors.bg}, ${themeColors.bg})`,
    border: `1px solid ${themeColors.border}`,
    borderRadius: "12px",
    boxShadow: darkMode
      ? "0 20px 25px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)"
      : "0 20px 25px rgba(0, 0, 0, 0.2)",
    backdropFilter: "blur(10px)",
    width: "100%",
    maxWidth: "450px",
    minWidth: "320px"
  };

  const overlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: themeColors.overlayBg,
    backdropFilter: "blur(3px)",
    zIndex: 1050,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1rem"
  };

  const headerStyle = {
    background: `linear-gradient(135deg, ${themeColors.headerBg}, ${themeColors.border})`,
    color: themeColors.headerText,
    padding: "1.25rem 1.5rem",
    borderTopLeftRadius: "12px",
    borderTopRightRadius: "12px",
    borderBottom: `1px solid ${themeColors.border}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.75rem"
  };

  const bodyStyle = {
    color: themeColors.text,
    padding: "1.5rem",
    textAlign: "center",
    fontSize: "1rem",
    lineHeight: "1.5"
  };

  const footerStyle = {
    padding: "1rem 1.5rem",
    borderTop: `1px solid ${themeColors.border}`,
    borderBottomLeftRadius: "12px",
    borderBottomRightRadius: "12px",
    display: "flex",
    gap: "0.75rem",
    justifyContent: "center"
  };

  const buttonBaseStyle = {
    padding: "0.75rem 1.5rem",
    borderRadius: "8px",
    fontSize: "0.95rem",
    fontWeight: "500",
    border: "none",
    cursor: "pointer",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "120px"
  };

  const cancelButtonStyle = {
    ...buttonBaseStyle,
    background: darkMode ? "rgba(107, 114, 128, 0.2)" : "rgba(107, 114, 128, 0.1)",
    color: darkMode ? "#d1d5db" : "#374151",
    border: `1px solid ${darkMode ? "#4b5563" : "#d1d5db"}`
  };

  const confirmButtonStyle = {
    ...buttonBaseStyle,
    background: "linear-gradient(135deg, #ef4444, #dc2626)",
    color: "#ffffff",
    border: "1px solid #dc2626"
  };

  // Mobile responsiveness
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  
  const mobileOverlayStyle = isMobile ? {
    ...overlayStyle,
    padding: "1rem"
  } : overlayStyle;

  const mobileModalStyle = isMobile ? {
    ...modalStyle,
    maxWidth: "95vw",
    minWidth: "280px"
  } : modalStyle;

  // Animation variants
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  const modalVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.95,
      y: isMobile ? -20 : -30
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0
    },
    exit: { 
      opacity: 0, 
      scale: 0.95,
      y: isMobile ? -20 : -30
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  const handleCancelHover = (e, isHover) => {
    if (isHover) {
      e.currentTarget.style.background = darkMode ? "rgba(107, 114, 128, 0.3)" : "rgba(107, 114, 128, 0.2)";
      e.currentTarget.style.transform = "translateY(-1px)";
    } else {
      e.currentTarget.style.background = darkMode ? "rgba(107, 114, 128, 0.2)" : "rgba(107, 114, 128, 0.1)";
      e.currentTarget.style.transform = "translateY(0)";
    }
  };

  const handleConfirmHover = (e, isHover) => {
    if (isHover) {
      e.currentTarget.style.background = "linear-gradient(135deg, #dc2626, #b91c1c)";
      e.currentTarget.style.transform = "translateY(-1px)";
    } else {
      e.currentTarget.style.background = "linear-gradient(135deg, #ef4444, #dc2626)";
      e.currentTarget.style.transform = "translateY(0)";
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          style={mobileOverlayStyle}
          onClick={handleOverlayClick}
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.2 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <motion.div
            style={mobileModalStyle}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 30,
              duration: 0.3 
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={headerStyle}>
              <FiAlertTriangle size={24} color="#f59e0b" />
              <h3 
                id="modal-title"
                style={{ 
                  margin: 0, 
                  fontSize: "1.25rem", 
                  fontWeight: "600",
                  color: themeColors.headerText
                }}
              >
                {title}
              </h3>
            </div>

            {/* Modal Body */}
            <div style={bodyStyle}>
              <p style={{ margin: 0 }}>{message}</p>
            </div>

            {/* Modal Footer */}
            <div style={footerStyle}>
              <button
                type="button"
                style={cancelButtonStyle}
                onClick={onCancel}
                onMouseEnter={(e) => handleCancelHover(e, true)}
                onMouseLeave={(e) => handleCancelHover(e, false)}
                onTouchStart={(e) => handleCancelHover(e, true)}
                onTouchEnd={(e) => handleCancelHover(e, false)}
              >
                Cancel
              </button>
              <button
                type="button"
                style={confirmButtonStyle}
                onClick={onConfirm}
                onMouseEnter={(e) => handleConfirmHover(e, true)}
                onMouseLeave={(e) => handleConfirmHover(e, false)}
                onTouchStart={(e) => handleConfirmHover(e, true)}
                onTouchEnd={(e) => handleConfirmHover(e, false)}
              >
                Discard Changes
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// PropTypes for type checking and documentation
ConfirmationModal.propTypes = {
  show: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  darkMode: PropTypes.bool,
};

ConfirmationModal.defaultProps = {
  darkMode: false,
};

export default ConfirmationModal;