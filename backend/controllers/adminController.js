const User = require("../models/User");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const { retryWithBackoff } = require("../utils/retry");

exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 12, role } = req.query;
    const query = role ? { role } : {};
    const users = await User.find(query)
      .select("-password")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();
    const totalCount = await User.countDocuments(query);
    res.json({
      success: true,
      data: users,
      currentPage: Number(page),
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
      limit: Number(limit),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// In your admin controller
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params; // Get from route params
    const { role } = req.body; // Get from request body

    if (!["student", "instructor", "admin"].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }

    // Prevent self-role change to non-admin
    if (id === req.user.id && role !== "admin") {
      return res.status(400).json({
        success: false,
        message: "Cannot remove admin role from yourself",
      });
    }

    const user = await User.findByIdAndUpdate(
      id, // Use the id from params
      { role },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: `User role updated to ${role}`,
      data: user,
    });
  } catch (error) {
    console.error("Update user role error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getAllCoursesAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 12, isPublished } = req.query;
    const query =
      isPublished !== undefined ? { isPublished: isPublished === "true" } : {};
    const courses = await Course.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate("instructor", "name")
      .lean();
    const totalCount = await Course.countDocuments(query);
    res.json({
      success: true,
      data: courses,
      currentPage: Number(page),
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
      limit: Number(limit),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.toggleCoursePublishStatus = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course)
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    course.isPublished = !course.isPublished;
    course.publishedAt = course.isPublished ? new Date() : null;
    await retryWithBackoff(() => course.save());
    res.json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("user", "name")
      .populate("course", "title");
    res.json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getInstructorApplications = async (req, res) => {
  try {
    const applications = await User.find({
      "instructorApplication.status": { $exists: true },
    })
      .select("name email avatar instructorApplication createdAt")
      .sort({ "instructorApplication.submittedAt": -1 });

    console.log("Found applications:", applications.length);

    // Check if applications exist
    if (!applications || applications.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "No instructor applications found",
      });
    }

    // Format the response - safer mapping
    const formattedApplications = applications.map((user) => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      instructorApplication: user.instructorApplication || {},
      createdAt: user.createdAt,
    }));

    res.status(200).json({
      success: true,
      data: formattedApplications,
    });
  } catch (error) {
    console.error("Get instructor applications error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching applications",
    });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id)
      .select("-password")
      .populate("instructorApplication")
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get user profile error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getUserStats = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let stats = {};

    if (user.role === "instructor") {
      // Get instructor stats
      const courses = await Course.find({ instructor: id });
      const enrollments = await Enrollment.find({
        course: { $in: courses.map((c) => c._id) },
      });

      stats = {
        coursesCreated: courses.length,
        totalStudents: enrollments.length,
        totalRevenue: courses.reduce(
          (sum, course) => sum + course.price * course.studentsEnrolled,
          0
        ),
        averageRating:
          courses.length > 0
            ? courses.reduce(
                (sum, course) => sum + (course.ratings?.average || 0),
                0
              ) / courses.length
            : 0,
      };
    } else if (user.role === "student") {
      // Get student stats
      const enrollments = await Enrollment.find({ student: id }).populate(
        "course"
      );

      stats = {
        enrolledCourses: enrollments.length,
        completedCourses: enrollments.filter((e) => e.progress === 100).length,
        learningHours: enrollments.reduce(
          (sum, e) => sum + (e.course?.totalHours || 0),
          0
        ),
      };
    }

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Get user stats error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deactivateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, reason } = req.body; // action: 'deactivate' or 'activate'

    console.log(`User ${action} request:`, { id, action, reason });

    // Validate action
    if (!["deactivate", "activate"].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Invalid action. Must be 'deactivate' or 'activate'",
      });
    }

    // Prevent self-deactivation
    if (id === req.user.id && action === "deactivate") {
      return res.status(400).json({
        success: false,
        message: "Cannot deactivate your own account",
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update user status
    user.isActive = action === "activate";
    user.status = action === "activate" ? "active" : "inactive";

    // Add deactivation reason and timestamp if deactivating
    if (action === "deactivate") {
      user.deactivatedAt = new Date();
      user.deactivatedBy = req.user.id;
      user.deactivationReason = reason || "Administrative action";
    } else {
      // Clear deactivation fields when reactivating
      user.deactivatedAt = undefined;
      user.deactivatedBy = undefined;
      user.deactivationReason = undefined;
      user.reactivatedAt = new Date();
      user.reactivatedBy = req.user.id;
    }

    await user.save();

    // Log the action
    console.log(`User ${action}d successfully:`, {
      userId: user._id,
      email: user.email,
      actionBy: req.user.email,
    });

    res.status(200).json({
      success: true,
      message: `User ${action}d successfully`,
      data: {
        user: {
          _id: user._id,
          email: user.email,
          name: user.name,
          isActive: user.isActive,
          status: user.status,
          deactivatedAt: user.deactivatedAt,
          deactivationReason: user.deactivationReason,
        },
      },
    });
  } catch (error) {
    console.error("Deactivate user error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @access  Private/Admin
exports.suspendUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, duration } = req.body; // duration in days

    // Prevent self-suspension
    if (id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "Cannot suspend your own account",
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Calculate suspension end date
    const suspensionEnd = duration
      ? new Date(Date.now() + duration * 24 * 60 * 60 * 1000)
      : null;

    // Update user suspension status
    user.isSuspended = true;
    user.suspendedAt = new Date();
    user.suspendedBy = req.user.id;
    user.suspensionReason = reason || "Violation of terms of service";
    user.suspensionEnd = suspensionEnd;

    await user.save();

    res.status(200).json({
      success: true,
      message: `User suspended ${
        duration ? `for ${duration} days` : "indefinitely"
      }`,
      data: {
        user: {
          _id: user._id,
          email: user.email,
          name: user.name,
          isSuspended: user.isSuspended,
          suspendedAt: user.suspendedAt,
          suspensionEnd: user.suspensionEnd,
          suspensionReason: user.suspensionReason,
        },
      },
    });
  } catch (error) {
    console.error("Suspend user error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get user status history
// @route   GET /api/admin/users/:id/status-history
// @access  Private/Admin
exports.getUserStatusHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id)
      .select(
        "statusHistory deactivatedAt reactivatedAt suspendedAt suspensionEnd"
      )
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        statusHistory: user.statusHistory || [],
        currentStatus: {
          deactivatedAt: user.deactivatedAt,
          reactivatedAt: user.reactivatedAt,
          suspendedAt: user.suspendedAt,
          suspensionEnd: user.suspensionEnd,
        },
      },
    });
  } catch (error) {
    console.error("Get user status history error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
