// controllers/reviewController.js - ADD THESE FUNCTIONS
const Review = require("../models/Review");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");

// @desc    Mark review as helpful
// @route   POST /api/reviews/:reviewId/helpful
// @access  Private
exports.markHelpful = async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) {
      return res.status(404).json({ 
        success: false, 
        message: "Review not found" 
      });
    }

    // Check if user already marked this review as helpful
    const alreadyHelpful = review.helpful.users.includes(req.user._id);
    
    if (alreadyHelpful) {
      // Remove helpful mark
      review.helpful.users = review.helpful.users.filter(
        userId => userId.toString() !== req.user._id.toString()
      );
      review.helpful.count = Math.max(0, review.helpful.count - 1);
    } else {
      // Add helpful mark
      review.helpful.users.push(req.user._id);
      review.helpful.count += 1;
    }

    await review.save();

    res.json({
      success: true,
      data: {
        helpfulCount: review.helpful.count,
        isHelpful: !alreadyHelpful
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get reviews for a course with helpful data
// @route   GET /api/courses/:courseId/reviews
// @access  Public
exports.getCourseReviews = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user?._id; // Optional, for checking if user marked as helpful

    const reviews = await Review.find({ course: courseId })
      .populate("user", "name avatar")
      .sort({ createdAt: -1 })
      .lean();

    // Add helpful status for current user
    const reviewsWithHelpfulStatus = reviews.map(review => ({
      ...review,
      userHasMarkedHelpful: userId 
        ? review.helpful.users.some(user => user.toString() === userId.toString())
        : false
    }));

    res.json({
      success: true,
      data: reviewsWithHelpfulStatus
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add a review for a course
// @route   POST /api/courses/:courseId/reviews
// @access  Private (student who enrolled in the course)
exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ 
        success: false, 
        message: "Course not found" 
      });
    }

    // Check if the student is enrolled in the course
    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: course._id,
    });
    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: "You must enroll in the course to review it",
      });
    }

    // Check if already reviewed
    const existingReview = await Review.findOne({
      user: req.user._id,
      course: course._id,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this course",
      });
    }

    const review = new Review({
      user: req.user._id,
      course: course._id,
      rating,
      comment,
      helpful: {
        count: 0,
        users: []
      }
    });

    await review.save();

    // Update course ratings
    const reviews = await Review.find({ course: course._id });
    course.ratings.average =
      reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
    course.ratings.count = reviews.length;
    await course.save();

    // Populate the new review for response
    const populatedReview = await Review.findById(review._id)
      .populate("user", "name avatar");

    res.status(201).json({ 
      success: true, 
      data: populatedReview 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a review
// @route   PUT /api/reviews/:reviewId
// @access  Private (review owner)
exports.updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    let review = await Review.findById(req.params.reviewId);
    if (!review) {
      return res.status(404).json({ 
        success: false, 
        message: "Review not found" 
      });
    }

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this review",
      });
    }

    review.rating = rating;
    review.comment = comment;
    await review.save();

    // Update course ratings
    const course = await Course.findById(review.course);
    const reviews = await Review.find({ course: course._id });
    course.ratings.average =
      reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
    course.ratings.count = reviews.length;
    await course.save();

    res.json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:reviewId
// @access  Private (review owner or admin)
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) {
      return res.status(404).json({ 
        success: false, 
        message: "Review not found" 
      });
    }

    if (
      review.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this review",
      });
    }

    await Review.findByIdAndDelete(req.params.reviewId);

    // Update course ratings
    const course = await Course.findById(review.course);
    const reviews = await Review.find({ course: course._id });
    course.ratings.average =
      reviews.length > 0
        ? reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length
        : 0;
    course.ratings.count = reviews.length;
    await course.save();

    res.json({ success: true, message: "Review deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};