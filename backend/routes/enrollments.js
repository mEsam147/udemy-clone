// const express = require("express");
// const router = express.Router();
// const {
//   enrollCourse,
//   getEnrolledCourses,
//   getCourseProgress,
//   updateProgress,
//   checkEnrollment,
// } = require("../controllers/enrollmentController");
// const { protect, restrictTo } = require("../middlewares/authMiddleware");

// router.post("/:courseId/enroll", protect, restrictTo("student"), enrollCourse);
// router.get(
//   "/user/enrolled",
//   protect,
//   restrictTo("student"),
//   getEnrolledCourses
// );
// router.get(
//   "/:courseId/progress",
//   protect,
//   restrictTo("student"),
//   getCourseProgress
// );
// router.put(
//   "/:courseId/progress",
//   protect,
//   restrictTo("student"),
//   updateProgress
// );
// router.get(
//   "/:courseId/enrolled",
//   protect,
//   restrictTo("student"),
//   checkEnrollment
// );

// module.exports = router;

// backend/routes/enrollments.js
const express = require("express");
const router = express.Router();
const {
  enrollCourse,
  getEnrolledCourses,
  getCourseProgress,
  updateProgress,
  checkEnrollment,
  createEnrollmentFromPayment,
  markLessonCompleted,
  getEnrollmentByCourse,
} = require("../controllers/enrollmentController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");

// student enrolls in course
router.post("/:courseId/enroll", protect, restrictTo("student"), enrollCourse);

// get student's enrolled courses
router.get(
  "/user/enrolled",
  protect,
  restrictTo("student"),
  getEnrolledCourses
);

// get course progress
router.get(
  "/:courseId/progress",
  protect,
  restrictTo("student"),
  getCourseProgress
);

// update course progress
router.put(
  "/:courseId/progress",
  protect,
  restrictTo("student"),
  updateProgress
);

// check if enrolled
router.get(
  "/:courseId/enrolled",
  protect,
  restrictTo("student"),
  checkEnrollment
);

router.post(
  "/:courseId/complete-lesson/:lessonId",
  protect,
  restrictTo("student"),
  markLessonCompleted
);

router.post(
  "/payment/enroll",
  protect,
  restrictTo("student"),
  createEnrollmentFromPayment
);

router.get(
  "/:courseId/enrollment",
  protect,
  restrictTo("student"),
  getEnrollmentByCourse
); // NEW

module.exports = router;
