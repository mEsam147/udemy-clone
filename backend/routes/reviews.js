// routes/reviews.js
const express = require("express");
const {
  addReview,
  updateReview,
  deleteReview,
  markHelpful,
  getCourseReviews,
} = require("../controllers/reviewController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/:courseId/reviews", protect, restrictTo("student"), addReview);
router.get("/:courseId/reviews", getCourseReviews);
router.put("/:reviewId", protect, updateReview);
router.delete("/:reviewId", protect, deleteReview);
router.post("/:reviewId/helpful", protect, markHelpful);

module.exports = router;