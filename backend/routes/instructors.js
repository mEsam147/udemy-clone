// const express = require("express");
// const {
//   getInstructorProfile,
//   getInstructorCourses,
//   getInstructorStudents,
//   getInstructorEarnings,
//   getInstructorDashboard,
//   applyForInstructor,
//   getInstructorApplications,
//   updateInstructorApplication,
// } = require("../controllers/instructorController");
// const { protect, restrictTo } = require("../middlewares/authMiddleware");

// const router = express.Router();

// router.use(protect);
// router.use(restrictTo("instructor", "admin"));

// router.get("/profile", getInstructorProfile);
// router.get("/courses", getInstructorCourses);
// router.get("/students", getInstructorStudents);
// router.get("/earnings", getInstructorEarnings);
// router.get("/dashboard", getInstructorDashboard);

// router.post("/apply", protect, restrictTo("student"), applyForInstructor);
// router.get(
//   "/applications",
//   protect,
//   restrictTo("admin"),
//   getInstructorApplications
// );
// router.put(
//   "/applications/:userId",
//   protect,
//   restrictTo("admin"),
//   updateInstructorApplication
// );

// module.exports = router;


// routes/instructors.js
const express = require("express");
const {
  getAllInstructors,
  getInstructorById,
  getInstructorProfile,
  getInstructorCourses,
  getInstructorStudents,
  getInstructorEarnings,
  getInstructorDashboard,
  applyForInstructor,
  getInstructorApplications,
  updateInstructorApplication,
  getInstructorPublicCourses,
} = require("../controllers/instructorController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");

const router = express.Router();

// Public routes (no authentication required)
router.get("/", getAllInstructors);
router.get("/:id", getInstructorById);router.get("/profile/me/courses", getInstructorCourses);

router.get("/:id/courses", getInstructorPublicCourses); // NEW

// Protected routes (require authentication)
router.use(protect);

// Instructor-specific routes
router.use(restrictTo("instructor", "admin"));
router.get("/profile/me", getInstructorProfile);
router.get("/profile/me/courses", getInstructorCourses);
router.get("/profile/me/students", getInstructorStudents);
router.get("/profile/me/earnings", getInstructorEarnings);
router.get("/profile/me/dashboard", getInstructorDashboard);

// Application routes
router.post("/apply", restrictTo("student"), applyForInstructor);
router.get("/applications", restrictTo("admin"), getInstructorApplications);
router.put("/applications/:userId", restrictTo("admin"), updateInstructorApplication);

module.exports = router;