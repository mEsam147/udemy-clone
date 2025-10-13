// const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const express = require("express");
const {
  getEnrolledCourses,
  getCourseLearningData,
  updateLessonProgress,
  getLearningProgress,
  getLearningRecommendations,
  getRecentCourses,
  searchLearningContent,
  getLearningStreaks,
  getLearningTimeline,
} = require("../controllers/learnController");

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Learning Dashboard Routes
router.get("/", getEnrolledCourses);
router.get("/progress", getLearningProgress);
router.get("/recommendations", getLearningRecommendations);
router.get("/recent", getRecentCourses);
router.get("/search", searchLearningContent);
router.get("/streaks", getLearningStreaks);
router.get("/timeline", getLearningTimeline);

// Course Learning Routes
router.get("/courses/:slug", getCourseLearningData);
router.put("/courses/:courseId/progress", updateLessonProgress);

module.exports = router;
