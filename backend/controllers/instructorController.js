// controllers/instructorController.js
const User = require("../models/User");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");

// @desc    Get all instructors with pagination and filters
// @route   GET /api/instructors
// @access  Public
exports.getAllInstructors = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {
      role: "instructor",
      isActive: true,
      status: "active",
    };

    // Search filter
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: "i" } },
        { bio: { $regex: req.query.search, $options: "i" } },
        { expertise: { $regex: req.query.search, $options: "i" } },
      ];
    }

    // Expertise filter
    if (req.query.expertise) {
      const expertiseArray = Array.isArray(req.query.expertise)
        ? req.query.expertise
        : [req.query.expertise];
      filter.expertise = { $in: expertiseArray };
    }

    // Verified filter
    if (req.query.verified === "true") {
      filter.isVerified = true;
    }

    // Featured filter
    if (req.query.featured === "true") {
      filter.featured = true;
    }

    // Country filter
    if (req.query.country) {
      filter.country = { $regex: req.query.country, $options: "i" };
    }

    // Build sort options
    let sortOptions = {};
    switch (req.query.sort) {
      case "rating":
        sortOptions = { "instructorStats.averageRating": -1 };
        break;
      case "newest":
        sortOptions = { createdAt: -1 };
        break;
      case "courses":
        sortOptions = { "instructorStats.totalCourses": -1 };
        break;
      case "students":
        sortOptions = { "instructorStats.totalStudents": -1 };
        break;
      default: // popular
        sortOptions = { "instructorStats.totalStudents": -1 };
    }

    // Get total count for pagination
    const totalCount = await User.countDocuments(filter);

    // Get instructors with pagination and sorting
    const instructors = await User.find(filter)
      .select(
        "name email avatar bio expertise country isVerified featured instructorStats createdAt"
      )
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean();

    // Transform data for frontend
    const transformedInstructors = instructors.map((instructor) => ({
      _id: instructor._id,
      user: {
        _id: instructor._id,
        name: instructor.name,
        email: instructor.email,
        avatar: instructor.avatar,
        country: instructor.country,
      },
      profile: {
        bio: instructor.bio || "",
        expertise: instructor.expertise || [],
        website: instructor.website,
      },
      stats: {
        totalStudents: instructor.instructorStats?.totalStudents || 0,
        totalCourses: instructor.instructorStats?.totalCourses || 0,
        totalReviews: instructor.instructorStats?.totalReviews || 0,
        averageRating: instructor.instructorStats?.averageRating || 0,
        totalEnrollments: instructor.instructorStats?.totalEnrollments || 0,
      },
      isVerified: instructor.isVerified || false,
      featured: instructor.featured || false,
      joinedAt: instructor.createdAt,
    }));

    res.status(200).json({
      success: true,
      count: transformedInstructors.length,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      limit,
      data: transformedInstructors,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get instructor by ID
// @route   GET /api/instructors/:id
// @access  Public
exports.getInstructorById = async (req, res, next) => {
  try {
    const instructor = await User.findOne({
      _id: req.params.id,
      role: "instructor",
      isActive: true,
      status: "active",
    })
      .select(
        "name email avatar bio expertise country website socialLinks isVerified featured instructorStats instructorProfile createdAt"
      )
      .lean();

    if (!instructor) {
      return res.status(404).json({
        success: false,
        message: "Instructor not found",
      });
    }

    // Get instructor's published courses
    const courses = await Course.find({
      instructor: req.params.id,
      isPublished: true,
    })
      .select(
        "title description price image category level duration studentsEnrolled rating totalReviews createdAt"
      )
      .sort({ studentsEnrolled: -1 })
      .limit(10)
      .lean();

    // Transform data for frontend
    const transformedInstructor = {
      _id: instructor._id,
      user: {
        _id: instructor._id,
        name: instructor.name,
        email: instructor.email,
        avatar: instructor.avatar,
        country: instructor.country,
      },
      profile: {
        bio: instructor.bio || "",
        expertise: instructor.expertise || [],
        website: instructor.website,
        socialLinks: instructor.socialLinks,
        availability: instructor.instructorProfile?.availability,
        responseTime: instructor.instructorProfile?.responseTime,
        officeHours: instructor.instructorProfile?.officeHours,
        contactEmail: instructor.instructorProfile?.contactEmail,
      },
      stats: {
        totalStudents: instructor.instructorStats?.totalStudents || 0,
        totalCourses: instructor.instructorStats?.totalCourses || 0,
        totalReviews: instructor.instructorStats?.totalReviews || 0,
        averageRating: instructor.instructorStats?.averageRating || 0,
        totalEnrollments: instructor.instructorStats?.totalEnrollments || 0,
      },
      isVerified: instructor.isVerified || false,
      featured: instructor.featured || false,
      joinedAt: instructor.createdAt,
      courses: courses,
    };

    res.status(200).json({
      success: true,
      data: transformedInstructor,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get instructor profile (for logged-in instructor)
// @route   GET /api/instructors/profile/me
// @access  Private/Instructor
exports.getInstructorProfile = async (req, res, next) => {
  try {
    const instructor = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: instructor,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get instructor courses (for logged-in instructor)
// @route   GET /api/instructors/profile/me/courses
// @access  Private/Instructor
exports.getInstructorCourses = async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const search = req.query.search || "";
  const status = req.query.status;
  const sort = req.query.sort || "-createdAt";

  try {
    // Build filter object
    const filter = { instructor: req.user.id };

    // Add search filter
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    // Add status filter
    if (status && status !== "all") {
      switch (status) {
        case "published":
          filter.isPublished = true;
          break;
        case "draft":
          filter.isPublished = false;
          break;
        case "archived":
          filter.isArchived = true;
          break;
        default:
          break;
      }
    }

    // Build sort object
    let sortOptions = {};
    switch (sort) {
      case "newest":
        sortOptions = { createdAt: -1 };
        break;
      case "oldest":
        sortOptions = { createdAt: 1 };
        break;
      case "popular":
        sortOptions = { studentsEnrolled: -1 };
        break;
      case "price-high":
        sortOptions = { price: -1 };
        break;
      case "price-low":
        sortOptions = { price: 1 };
        break;
      default:
        sortOptions = { createdAt: -1 };
    }

    const totalCount = await Course.countDocuments(filter);
    const courses = await Course.find(filter)
      .populate("instructor", "name avatar")
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: courses.length,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      limit,
      data: courses,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get instructor students
// @route   GET /api/instructors/profile/me/students
// @access  Private/Instructor
exports.getInstructorStudents = async (req, res, next) => {
  try {
    const courses = await Course.find({ instructor: req.user.id }).lean();
    const courseIds = courses.map((course) => course._id);

    const enrollments = await Enrollment.find({ course: { $in: courseIds } })
      .lean()
      .populate("student", "name email avatar")
      .populate("course", "title");

    res.status(200).json({
      success: true,
      count: enrollments.length,
      data: enrollments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get instructor earnings
// @route   GET /api/instructors/profile/me/earnings
// @access  Private/Instructor
exports.getInstructorEarnings = async (req, res, next) => {
  try {
    const courses = await Course.find({ instructor: req.user.id });
    const courseIds = courses.map((course) => course._id);

    const enrollments = await Enrollment.find({ course: { $in: courseIds } });

    const totalRevenue = enrollments.reduce((sum, enrollment) => {
      const course = courses.find(
        (c) => c._id.toString() === enrollment.course.toString()
      );
      return sum + (course ? course.price * 0.7 : 0);
    }, 0);

    const enrollmentsByMonth = await getEnrollmentsByMonth(courseIds);

    res.status(200).json({
      success: true,
      data: {
        totalStudents: enrollments.length,
        totalCourses: courses.length,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        enrollmentsByMonth,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get instructor dashboard
// @route   GET /api/instructors/profile/me/dashboard
// @access  Private/Instructor
exports.getInstructorDashboard = async (req, res, next) => {
  try {
    const courses = await Course.find({ instructor: req.user.id });
    const courseIds = courses.map((course) => course._id);

    const enrollments = await Enrollment.find({ course: { $in: courseIds } });
    const totalStudents = enrollments.length;

    const totalRevenue = enrollments.reduce((sum, enrollment) => {
      const course = courses.find(
        (c) => c._id.toString() === enrollment.course.toString()
      );
      return sum + (course ? course.price * 0.7 : 0);
    }, 0);

    const topCourses = await Course.aggregate([
      { $match: { instructor: req.user._id } },
      {
        $lookup: {
          from: "enrollments",
          localField: "_id",
          foreignField: "course",
          as: "enrollments",
        },
      },
      {
        $project: {
          title: 1,
          studentsEnrolled: { $size: "$enrollments" },
          revenue: { $multiply: ["$price", { $size: "$enrollments" }, 0.7] },
        },
      },
      { $sort: { studentsEnrolled: -1 } },
      { $limit: 5 },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalCourses: courses.length,
        totalStudents,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        averageRating: await getAverageRating(courseIds),
        topCourses,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to get enrollments by month
const getEnrollmentsByMonth = async (courseIds) => {
  const currentYear = new Date().getFullYear();
  const enrollments = await Enrollment.aggregate([
    {
      $match: {
        course: { $in: courseIds },
        enrolledAt: {
          $gte: new Date(`${currentYear}-01-01`),
          $lte: new Date(`${currentYear}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: "$enrolledAt" },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  const result = Array(12)
    .fill(0)
    .map((_, i) => ({
      month: i + 1,
      count: 0,
    }));

  enrollments.forEach((item) => {
    result[item._id - 1].count = item.count;
  });

  return result;
};

// Helper function to get average rating
const getAverageRating = async (courseIds) => {
  const result = await Enrollment.aggregate([
    {
      $match: {
        course: { $in: courseIds },
        "rating.score": { $exists: true },
      },
    },
    {
      $group: {
        _id: null,
        average: { $avg: "$rating.score" },
      },
    },
  ]);

  return result.length > 0 ? Math.round(result[0].average * 10) / 10 : 0;
};

// Application routes (existing)
exports.applyForInstructor = async (req, res) => {
  try {
    const { message } = req.body;
    const user = await User.findById(req.user._id);

    if (user.role !== "student") {
      return res.status(400).json({
        success: false,
        message: "Only students can apply to become instructors",
      });
    }

    if (user.instructorApplication.status === "pending") {
      return res.status(400).json({
        success: false,
        message: "You have already submitted an application",
      });
    }

    user.instructorApplication = {
      status: "pending",
      message,
      submittedAt: new Date(),
    };

    await user.save();

    res.json({ success: true, message: "Application submitted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getInstructorApplications = async (req, res) => {
  try {
    const applications = await User.find({
      "instructorApplication.status": "pending",
    }).select("name email instructorApplication submittedAt");

    res.json({ success: true, data: applications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateInstructorApplication = async (req, res) => {
  try {
    const { status } = req.body;
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.instructorApplication.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Application has already been processed",
      });
    }

    user.instructorApplication.status = status;
    if (status === "approved") {
      user.role = "instructor";
    }

    await user.save();

    res.json({ success: true, message: `Application ${status}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
exports.getInstructorPublicCourses = async (req, res, next) => {
  try {
    const instructorId = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Filter options
    const search = req.query.search || "";
    const category = req.query.category || "";
    const level = req.query.level || "all";
    const sort = req.query.sort || "popular";

    // Verify instructor exists and is active
    const instructor = await User.findOne({
      _id: instructorId,
      role: "instructor",
      isActive: true,
      status: "active",
    });

    if (!instructor) {
      return res.status(404).json({
        success: false,
        message: "Instructor not found",
      });
    }

    // Build filter object
    const filter = {
      instructor: instructorId,
      isPublished: true,
      status: "active",
    };

    // Add search filter
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    // Add category filter
    if (category) {
      filter.category = { $regex: category, $options: "i" };
    }

    // Add level filter
    if (level && level !== "all") {
      filter.level = level.toLowerCase();
    }

    // Build sort options
    let sortOptions = {};
    switch (sort) {
      case "popular":
        sortOptions = { studentsEnrolled: -1 };
        break;
      case "rating":
        sortOptions = { rating: -1 };
        break;
      case "newest":
        sortOptions = { createdAt: -1 };
        break;
      case "oldest":
        sortOptions = { createdAt: 1 };
        break;
      case "price-high":
        sortOptions = { price: -1 };
        break;
      case "price-low":
        sortOptions = { price: 1 };
        break;
      case "duration":
        sortOptions = { duration: -1 };
        break;
      default:
        sortOptions = { studentsEnrolled: -1 };
    }

    // Get total count for pagination
    const totalCount = await Course.countDocuments(filter);

    // Get courses with pagination and sorting
    const courses = await Course.find(filter)
      .select(
        "title description price image category level duration studentsEnrolled rating totalReviews lessons projects isBestseller createdAt updatedAt"
      )
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean();

    // Transform course data
    const transformedCourses = courses.map((course) => ({
      _id: course._id,
      title: course.title,
      description: course.description,
      price: course.price,
      image: course.image,
      category: course.category,
      level: course.level,
      duration: course.duration,
      studentsEnrolled: course.studentsEnrolled || 0,
      rating: course.rating || 0,
      totalReviews: course.totalReviews || 0,
      lessons: course.lessons || 0,
      projects: course.projects || 0,
      isBestseller: course.isBestseller || false,
      updatedAt: course.updatedAt,
      createdAt: course.createdAt,
    }));

    res.status(200).json({
      success: true,
      data: transformedCourses,
      count: transformedCourses.length,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      limit,
      instructor: {
        _id: instructor._id,
        name: instructor.name,
        avatar: instructor.avatar,
        bio: instructor.bio,
        expertise: instructor.expertise,
        stats: {
          totalStudents: instructor.instructorStats?.totalStudents || 0,
          totalCourses: instructor.instructorStats?.totalCourses || 0,
          totalReviews: instructor.instructorStats?.totalReviews || 0,
          averageRating: instructor.instructorStats?.averageRating || 0,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
