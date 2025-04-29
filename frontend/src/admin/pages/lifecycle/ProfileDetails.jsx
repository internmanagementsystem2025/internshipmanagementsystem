import React from "react";
import { Card, Row, Col, Badge } from "react-bootstrap";
import { Person, Envelope, Telephone, GeoAlt, House, Building, Translate } from "react-bootstrap-icons";
import { motion } from "framer-motion";

const ProfileDetails = ({ profileData, darkMode }) => {
  if (!profileData) {
    return <p className="text-center">No profile data available.</p>;
  }

  // Animation variants for Framer Motion
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={cardVariants}
    >
      <Card
        className={`border-0 shadow-sm ${darkMode ? "bg-dark text-white" : "bg-light"}`}
        style={{ borderRadius: "15px" }}
      >
        <Card.Body>
          <div className="text-center mb-4">
            {profileData.profileImage ? (
              <motion.img
                src={`http://localhost:5000${profileData.profileImage}`}
                alt="Profile"
                className="rounded-circle shadow"
                style={{ width: "150px", height: "150px", objectFit: "cover", border: "4px solid #fff" }}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              />
            ) : (
              <motion.div
                className="rounded-circle bg-secondary d-flex align-items-center justify-content-center mx-auto shadow"
                style={{ width: "150px", height: "150px", border: "4px solid #fff" }}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <span className="display-4 text-white">
                  {profileData.fullName && profileData.fullName.charAt(0)}
                </span>
              </motion.div>
            )}
            <motion.h3 className="mt-3 fw-bold" variants={itemVariants}>
              {profileData.fullName}
            </motion.h3>
            <motion.div variants={itemVariants}>
              <Badge bg="info" className="mb-2" pill>
                {profileData.userType || "Individual"}
              </Badge>
            </motion.div>
          </div>

          <Row className="g-4">
            <Col md={6}>
              <motion.div className="d-flex align-items-center mb-3" variants={itemVariants}>
                <Person className="me-2" size={20} />
                <p className="mb-0">
                  <strong>NIC:</strong> {profileData.nic}
                </p>
              </motion.div>
              <motion.div className="d-flex align-items-center mb-3" variants={itemVariants}>
                <Envelope className="me-2" size={20} />
                <p className="mb-0">
                  <strong>Email:</strong> {profileData.email}
                </p>
              </motion.div>
              <motion.div className="d-flex align-items-center mb-3" variants={itemVariants}>
                <Telephone className="me-2" size={20} />
                <p className="mb-0">
                  <strong>Contact Number:</strong> {profileData.contactNumber || "Not Available"}
                </p>
              </motion.div>
            </Col>
            <Col md={6}>
              <motion.div className="d-flex align-items-center mb-3" variants={itemVariants}>
                <GeoAlt className="me-2" size={20} />
                <p className="mb-0">
                  <strong>District:</strong> {profileData.district || "Not Specified"}
                </p>
              </motion.div>
              <motion.div className="d-flex align-items-center mb-3" variants={itemVariants}>
                <House className="me-2" size={20} />
                <p className="mb-0">
                  <strong>Address:</strong> {profileData.postalAddress || "Not Available"}
                </p>
              </motion.div>
              {profileData.userType === "institute" && (
                <>
                  <motion.div className="d-flex align-items-center mb-3" variants={itemVariants}>
                    <Building className="me-2" size={20} />
                    <p className="mb-0">
                      <strong>Institute Name:</strong> {profileData.instituteName || "Not Available"}
                    </p>
                  </motion.div>
                  <motion.div className="d-flex align-items-center mb-3" variants={itemVariants}>
                    <Building className="me-2" size={20} />
                    <p className="mb-0">
                      <strong>Institute Type:</strong> {profileData.instituteType || "Not Available"}
                    </p>
                  </motion.div>
                </>
              )}
              <motion.div className="d-flex align-items-center mb-3" variants={itemVariants}>
                <Translate className="me-2" size={20} />
                <p className="mb-0">
                  <strong>Preferred Language:</strong> {profileData.preferredLanguage || "Not Available"}
                </p>
              </motion.div>
            </Col>
          </Row>

          {profileData.department && (
            <motion.div className="mt-4" variants={itemVariants}>
              <h5 className="fw-bold">Department</h5>
              <p>{profileData.department}</p>
            </motion.div>
          )}
        </Card.Body>
      </Card>
    </motion.div>
  );
};

export default ProfileDetails;