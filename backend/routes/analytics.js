const express = require("express");
const router = express.Router();
const {
  getPlatformStats,
  getInstructorAnalytics,
  getStudentProgressAnalytics,
  getStudentAnalytics,
  getStudentProgressDetails,
  getRevenueAnalytics,
  getUserAnalytics
} = require("../controllers/analyticsController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");


router.get("/platform", protect, restrictTo("admin"), getPlatformStats);
router.get("/revenue", protect, restrictTo("admin"), getRevenueAnalytics);
router.get("/users", protect, restrictTo("admin"), getUserAnalytics);

// router.get("/platform", protect, restrictTo("admin"), getPlatformStats);
router.get(
  "/instructor",
  protect,
  restrictTo("instructor"),
  getInstructorAnalytics
);
router.get(
  "/student",
  protect,
  restrictTo("student"),
  getStudentProgressAnalytics
);

router.get("/student", protect, getStudentAnalytics);
router.get("/student/progress/:courseId", protect, getStudentProgressDetails);

module.exports = router;
