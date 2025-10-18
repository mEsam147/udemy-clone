const express = require("express");
const router = express.Router();
const {
  getUsers,
  updateUserRole,
  getAllCoursesAdmin,
  toggleCoursePublishStatus,
  getReviews,
  getInstructorApplications,
  getUserProfile,
  getUserStats,
  getUserStatusHistory,
  suspendUser,
  deactivateUser,
} = require("../controllers/adminController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");

router.get("/users", protect, restrictTo("admin"), getUsers);
router.put("/users/:id/role", protect, restrictTo("admin"), updateUserRole);
router.get("/courses", protect, restrictTo("admin"), getAllCoursesAdmin);

router.get("/applications", getInstructorApplications);

// routes/admin.js
router.get("/users/:id/profile", protect, restrictTo("admin"), getUserProfile);
router.get("/users/:id/stats", protect, restrictTo("admin"), getUserStats);

// routes/admin.js
router.patch("/users/:id/status", protect, restrictTo("admin"), deactivateUser);
router.patch("/users/:id/suspend", protect, restrictTo("admin"), suspendUser);
router.get(
  "/users/:id/status-history",
  protect,
  restrictTo("admin"),
  getUserStatusHistory
);

router.patch(
  "/courses/:courseId/publish",
  protect,
  restrictTo("admin"),
  toggleCoursePublishStatus
);

router.get("/", protect, restrictTo("admin"), getReviews);
module.exports = router;
