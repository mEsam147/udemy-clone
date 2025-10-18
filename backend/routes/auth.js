const express = require("express");
const passport = require("passport");
const {
  googleAuth,
  githubAuth,
  register,
  login,
  logout,
  getMe,
  updateProfile,
  becomeInstructor,
  getInstructorApplications,
  processInstructorApplication,
  forgotPassword,
  resetPassword,
  validateResetToken,
  deleteAvatar,
  uploadAvatar,
} = require("../controllers/authController");
const {
  protect,
  restrictTo,
  passwordResetLimiter,
} = require("../middlewares/authMiddleware");
const { upload } = require("../config/cloudinary");
const {
  updateSettings,
  getSettings,
  changePassword,
  deleteAccount,
} = require("../controllers/settingsController");

const router = express.Router();

// OAuth routes
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  googleAuth
);

router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] })
);
router.get(
  "/github/callback",
  passport.authenticate("github", { session: false }),
  githubAuth
);

// Local auth routes
router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);

router.post("/upload-avatar", protect, upload.single("avatar"), uploadAvatar);
router.delete("/avatar", protect, deleteAvatar);

// Password reset routes
router.post("/forgot-password", passwordResetLimiter, forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/validate-reset-token/:token", validateResetToken);

router.put("/settings", protect, updateSettings);
router.get("/settings", protect, getSettings);
router.put("/settings/change-password", protect, changePassword);
router.delete("/settings/account", protect, deleteAccount);

// Instructor application routes
router.post("/become-instructor", protect, becomeInstructor);
router.get(
  "/instructor-applications",
  protect,
  restrictTo("admin"),
  getInstructorApplications
);
router.put(
  "/instructor-applications/:userId",
  protect,
  restrictTo("admin"),
  processInstructorApplication
);

module.exports = router;
