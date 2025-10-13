const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");
const Notification = require("../models/Notification");
const { retryWithBackoff } = require("../utils/retry");
const Lesson = require("../models/Lesson");

exports.enrollCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const existing = await Enrollment.findOne({
      student: req.user._id,
      course: courseId,
    });
    if (existing)
      return res
        .status(400)
        .json({ success: false, message: "Already enrolled" });
    const enrollment = await retryWithBackoff(() =>
      Enrollment.create({ student: req.user._id, course: courseId })
    );
    await Course.findByIdAndUpdate(courseId, { $inc: { studentsEnrolled: 1 } });
    await retryWithBackoff(() =>
      Notification.create({
        user: req.user._id,
        type: "ENROLLMENT",
        message: `Enrolled in course: ${courseId}`,
        course: courseId,
      })
    );
    res.json({ success: true, data: enrollment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getEnrolledCourses = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user._id })
      .populate("course", "title slug image")
      .lean();
    res.json({ success: true, data: enrollments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCourseProgress = async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: req.params.courseId,
    })
      .populate("completedLessons")
      .lean();
    if (!enrollment)
      return res
        .status(404)
        .json({ success: false, message: "Enrollment not found" });
    res.json({
      success: true,
      data: {
        progress: enrollment.progress,
        completedLessons: enrollment.completedLessons,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



exports.markLessonCompleted = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;

    // Validate courseId and lessonId
    if (!courseId || !lessonId) {
      return res.status(400).json({
        success: false,
        message: "Course ID and Lesson ID are required",
      });
    }

    // Check if the lesson exists and belongs to the course
    const lesson = await Lesson.findOne({
      _id: lessonId,
      course: courseId,
    });

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found or does not belong to this course",
      });
    }

    // Find enrollment
    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: courseId,
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found",
      });
    }

    // Check if lesson is already completed
    if (enrollment.completedLessons.includes(lessonId)) {
      return res.json({
        success: true,
        data: enrollment,
        message: "Lesson already completed",
      });
    }

    // Add lesson to completed lessons
    enrollment.completedLessons.push(lessonId);

    // Get total lessons count for this course
    const totalLessons = await Lesson.countDocuments({ course: courseId });

    // Calculate progress
    enrollment.progress = Math.round(
      (enrollment.completedLessons.length / totalLessons) * 100
    );
    enrollment.lastAccessed = new Date();

    await enrollment.save();

    // Populate the updated enrollment
    const updatedEnrollment = await Enrollment.findById(enrollment._id).populate(
      "completedLessons",
      "title order"
    );

    // Create notification
    if (enrollment.progress === 100) {
      await retryWithBackoff(() =>
        Notification.create({
          user: req.user._id,
          type: "COURSE_COMPLETED",
          message: `Congratulations! You completed the course`,
          course: courseId,
        })
      );
    } else {
      await retryWithBackoff(() =>
        Notification.create({
          user: req.user._id,
          type: "LESSON_COMPLETED",
          message: `Completed a lesson`,
          course: courseId,
        })
      );
    }

    res.json({
      success: true,
      data: updatedEnrollment,
      message:
        enrollment.progress === 100
          ? "Course completed!"
          : "Lesson marked as completed",
    });
  } catch (error) {
    console.error("Error in markLessonCompleted:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateProgress = async (req, res) => {
  try {
    const { completedLessons } = req.body;
    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: req.params.courseId,
    });
    if (!enrollment)
      return res
        .status(404)
        .json({ success: false, message: "Enrollment not found" });
    const course = await Course.findById(req.params.courseId).populate(
      "lessons"
    );
    enrollment.completedLessons = completedLessons;
    enrollment.progress =
      (completedLessons.length / course.lessons.length) * 100;
    enrollment.lastAccessed = new Date();
    await retryWithBackoff(() => enrollment.save());
    if (completedLessons.length > 0) {
      await retryWithBackoff(() =>
        Notification.create({
          user: req.user._id,
          type: "LESSON_COMPLETED",
          message: `Completed lesson in course: ${course.title}`,
          course: req.params.courseId,
        })
      );
    }
    res.json({ success: true, data: enrollment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// In your enrollmentController.js
exports.getEnrollmentByCourse = async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: req.params.courseId,
    })
    .populate("completedLessons", "title order")
    .populate("course", "title instructor totalHours lecturesCount");
    
    if (!enrollment) {
      return res.status(404).json({ 
        success: false, 
        message: "Enrollment not found",
        data: null
      });
    }
    
    res.json({ 
      success: true, 
      data: {
        ...enrollment.toObject(),
        isEnrolled: true
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// In your enrollmentController.js
exports.checkEnrollment = async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: req.params.courseId,
    })
    .populate('completedLessons', 'title order')
    .lean();

    if (!enrollment) {
      return res.json({
        success: false,
        data: null,
        message: "Not enrolled in this course",
      });
    }

    // Return the enrollment data with isEnrolled flag
    res.json({
      success: true,
      data: {
        ...enrollment,
        isEnrolled: true, // Explicitly set this flag
        completedLessons: enrollment.completedLessons || [],
      },
    });
  } catch (error) {
    console.error("Error in checkEnrollment:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// Add this to your enrollmentController.js
// In your enrollmentController.js
exports.createEnrollmentFromPayment = async (req, res) => {
  try {
    const { courseId, sessionId } = req.body;
    
    // Verify the course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if enrollment already exists
    const existingEnrollment = await Enrollment.findOne({
      student: req.user._id,
      course: courseId,
    });

    if (existingEnrollment) {
      return res.json({
        success: true,
        data: {
          ...existingEnrollment.toObject(),
          isEnrolled: true
        },
        message: 'Already enrolled'
      });
    }

    // Create enrollment
    const enrollment = await Enrollment.create({
      student: req.user._id,
      course: courseId,
      enrolledAt: new Date(),
      lastAccessed: new Date(),
      progress: 0,
      completedLessons: []
    });

    // Update course count
    await Course.findByIdAndUpdate(courseId, { $inc: { studentsEnrolled: 1 } });

    // Create notification
    await Notification.create({
      user: req.user._id,
      type: "ENROLLMENT",
      message: `You have been enrolled in "${course.title}"`,
      course: courseId,
    });

    res.json({
      success: true,
      data: {
        ...enrollment.toObject(),
        isEnrolled: true
      },
      message: 'Enrollment created successfully'
    });

  } catch (error) {
    console.error('Error creating enrollment from payment:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};