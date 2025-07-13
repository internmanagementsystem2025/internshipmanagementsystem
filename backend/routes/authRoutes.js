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
  getGoogleProfile,
  handleAzureCallback,
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");
const { passport, generateTokenAndRedirect } = require('../config/oauthStrategies');

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", authMiddleware, getUserProfile);
router.put("/profile", authMiddleware, upload.single("profileImage"), updateUserProfile);
router.get("/institutes", authMiddleware, getInstitutes);
router.put("/change-password", authMiddleware, changePassword);
router.get("/profile/:nic", authMiddleware, getUserProfileByNic);
router.post("/verify-email", verifyEmail);

// OTP-based password reset
router.post("/request-password-reset-otp", requestPasswordResetOTP);
router.post("/verify-otp-reset-password", verifyOTPAndResetPassword);

router.get("/google-profile", authMiddleware, getGoogleProfile);

// Google OAuth
router.get('/google',
  (req, res, next) => {
    req.session = req.session || {};
    req.session.userType = 'individual';
    next();
  },
  passport.authenticate('google', { session: false })
);
router.get('/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=google_auth_failed`
  }),
  generateTokenAndRedirect
);

// Azure AD: start login
router.get('/azure', (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.CLIENT_ID,
    response_type: 'code',
    redirect_uri: process.env.REDIRECT_URI,
    response_mode: 'query',
    scope: 'https://graph.microsoft.com/user.read',
  });
  const authorizeUrl = `https://login.microsoftonline.com/${process.env.TENANT_ID}/oauth2/v2.0/authorize?${params.toString()}`;
  res.redirect(authorizeUrl);
});

// Azure AD: callback (IMPORTANT: GET, not POST!)
router.get('/azure/callback', handleAzureCallback);

module.exports = router;
