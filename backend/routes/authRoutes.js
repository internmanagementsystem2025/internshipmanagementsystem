const express = require("express");
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  getUserProfile, 
  updateUserProfile, 
  upload, 
  getInstitutes,
  changePassword,
  requestPasswordResetOTP,
  verifyOTPAndResetPassword,
  getUserProfileByNic,
  verifyEmail,
  loginWithAzure
} = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", authMiddleware, getUserProfile);
router.put("/profile", authMiddleware, upload.single("profileImage"), updateUserProfile);
router.get("/institutes", authMiddleware, getInstitutes);
router.put("/change-password", authMiddleware, changePassword);
router.get("/profile/:nic", authMiddleware, getUserProfileByNic);
router.post("/verify-email", verifyEmail);

// OTP-based password reset routes
router.post("/request-password-reset-otp", requestPasswordResetOTP);
router.post("/verify-otp-reset-password", verifyOTPAndResetPassword);

router.post("/azure-login",loginWithAzure);

module.exports = router;