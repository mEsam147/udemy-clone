const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');

// @desc    Get student dashboard
// @route   GET /api/students/dashboard
// @access  Private/Student
exports.getStudentDashboard = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Get enrolled courses with progress
    const enrollments = await Enrollment.find({ student: req.user.id })
      .populate({
        path: 'course',
        populate: {
          path: 'instructor',
          select: 'name avatar'
        }
      });
    
    // Calculate overall progress
    const totalProgress = enrollments.reduce((sum, enrollment) => sum + enrollment.progress, 0);
    const averageProgress = enrollments.length > 0 ? Math.round(totalProgress / enrollments.length) : 0;
    
    // Get recently accessed courses
    const recentCourses = enrollments
      .sort((a, b) => new Date(b.lastAccessed) - new Date(a.lastAccessed))
      .slice(0, 5)
      .map(enrollment => enrollment.course);
    
    // Get recommended courses (based on wishlist and enrolled categories)
    const recommendedCourses = await getRecommendedCourses(req.user.id);
    
    res.status(200).json({
      success: true,
      data: {
        user,
        enrolledCourses: enrollments.length,
        averageProgress,
        recentCourses,
        recommendedCourses
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add course to wishlist
// @route   POST /api/students/wishlist/:courseId
// @access  Private/Student
exports.addToWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (user.wishlist.includes(req.params.courseId)) {
      return res.status(400).json({ message: 'Course already in wishlist' });
    }
    
    user.wishlist.push(req.params.courseId);
    await user.save();
    
    res.status(200).json({
      success: true,
      data: user.wishlist
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove course from wishlist
// @route   DELETE /api/students/wishlist/:courseId
// @access  Private/Student
exports.removeFromWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    user.wishlist = user.wishlist.filter(
      courseId => courseId.toString() !== req.params.courseId
    );
    
    await user.save();
    
    res.status(200).json({
      success: true,
      data: user.wishlist
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get wishlist
// @route   GET /api/students/wishlist
// @access  Private/Student
exports.getWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'wishlist',
      populate: {
        path: 'instructor',
        select: 'name avatar'
      }
    });
    
    res.status(200).json({
      success: true,
      data: user.wishlist
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get learning activity
// @route   GET /api/students/activity
// @access  Private/Student
exports.getLearningActivity = async (req, res, next) => {
  try {
    const { limit = 10, page = 1 } = req.query;
    
    const enrollments = await Enrollment.find({ student: req.user.id })
      .populate({
        path: 'course',
        select: 'title image instructor',
        populate: {
          path: 'instructor',
          select: 'name'
        }
      })
      .populate('completedLessons', 'title')
      .sort({ lastAccessed: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    res.status(200).json({
      success: true,
      data: enrollments
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to get recommended courses
const getRecommendedCourses = async (userId) => {
  try {
    const user = await User.findById(userId);
    
    // Get categories from enrolled courses and wishlist
    const enrolledCategories = await getCategoriesFromEnrollments(userId);
    const wishlistCategories = await getCategoriesFromWishlist(user.wishlist);
    
    const allCategories = [...new Set([...enrolledCategories, ...wishlistCategories])];
    
    if (allCategories.length === 0) {
      // If no categories, return popular courses
      return await Course.find({ isPublished: true })
        .populate('instructor', 'name avatar')
        .sort({ studentsEnrolled: -1 })
        .limit(6);
    }
    
    // Get recommended courses based on categories
    return await Course.find({
      isPublished: true,
      category: { $in: allCategories },
      _id: { $nin: user.wishlist }
    })
      .populate('instructor', 'name avatar')
      .limit(6);
  } catch (error) {
    console.error('Error getting recommended courses:', error);
    return [];
  }
};

// Helper function to get categories from enrollments
const getCategoriesFromEnrollments = async (userId) => {
  const enrollments = await Enrollment.find({ student: userId }).populate('course');
  return enrollments.map(enrollment => enrollment.course.category);
};

// Helper function to get categories from wishlist
const getCategoriesFromWishlist = async (wishlist) => {
  const courses = await Course.find({ _id: { $in: wishlist } });
  return courses.map(course => course.category);
};