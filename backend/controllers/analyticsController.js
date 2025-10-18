const User = require("../models/User");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const Review = require("../models/Review");

// exports.getPlatformStats = async (req, res) => {
//   try {
//     const [userCount, courseCount, enrollmentCount] = await Promise.all([
//       User.countDocuments(),
//       Course.countDocuments({ isPublished: true }),
//       Enrollment.countDocuments(),
//     ]);
//     const categoryStats = await Course.aggregate([
//       { $match: { isPublished: true } },
//       { $group: { _id: "$category", courseCount: { $sum: 1 } } },
//     ]);
//     res.json({
//       success: true,
//       data: {
//         users: userCount,
//         courses: courseCount,
//         enrollments: enrollmentCount,
//         categories: categoryStats,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };


// controllers/analyticsController.js


exports.getPlatformStats = async (req, res) => {
  try {
    // Basic counts
    const [userCount, courseCount, enrollmentCount, instructorCount] = await Promise.all([
      User.countDocuments(),
      Course.countDocuments({ isPublished: true }),
      Enrollment.countDocuments(),
      User.countDocuments({ role: "instructor" })
    ]);

    // Revenue calculation (assuming price is per enrollment)
    const revenueData = await Enrollment.aggregate([
      {
        $lookup: {
          from: "courses",
          localField: "course",
          foreignField: "_id",
          as: "course"
        }
      },
      {
        $unwind: "$course"
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$course.price" },
          monthlyRevenue: {
            $sum: {
              $cond: [
                { $gte: ["$enrolledAt", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)] },
                "$course.price",
                0
              ]
            }
          }
        }
      }
    ]);

    // Enrollment trends (last 12 months)
    const enrollmentTrends = await Enrollment.aggregate([
      {
        $match: {
          enrolledAt: {
            $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1))
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$enrolledAt" },
            month: { $month: "$enrolledAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 12 }
    ]);

    // Category distribution
    const categoryStats = await Course.aggregate([
      { $match: { isPublished: true } },
      {
        $group: {
          _id: "$category",
          courseCount: { $sum: 1 },
          totalStudents: { $sum: "$studentsEnrolled" },
          avgRating: { $avg: "$ratings.average" }
        }
      }
    ]);

    // User growth trends
    const userGrowth = await User.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 12 }
    ]);

    // Course performance
    const topCourses = await Course.find({ isPublished: true })
      .populate("instructor", "name")
      .select("title instructor studentsEnrolled ratings price")
      .sort({ studentsEnrolled: -1 })
      .limit(10)
      .lean();

    // Recent activity
    const recentEnrollments = await Enrollment.find()
      .populate("student", "name email")
      .populate("course", "title")
      .sort({ enrolledAt: -1 })
      .limit(10)
      .lean();

    const recentReviews = await Review.find()
      .populate("user", "name")
      .populate("course", "title")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Platform health metrics
    const completionRate = await Enrollment.aggregate([
      {
        $group: {
          _id: null,
          totalEnrollments: { $sum: 1 },
          completedEnrollments: {
            $sum: { $cond: [{ $eq: ["$progress", 100] }, 1, 0] }
          }
        }
      }
    ]);

    const avgCompletionRate = completionRate[0] 
      ? (completionRate[0].completedEnrollments / completionRate[0].totalEnrollments) * 100 
      : 0;

    const stats = {
      summary: {
        users: userCount,
        courses: courseCount,
        enrollments: enrollmentCount,
        instructors: instructorCount,
        totalRevenue: revenueData[0]?.totalRevenue || 0,
        monthlyRevenue: revenueData[0]?.monthlyRevenue || 0,
        completionRate: Math.round(avgCompletionRate)
      },
      trends: {
        enrollmentTrends: enrollmentTrends.map(trend => ({
          month: `${trend._id.year}-${trend._id.month.toString().padStart(2, '0')}`,
          enrollments: trend.count
        })),
        userGrowth: userGrowth.map(growth => ({
          month: `${growth._id.year}-${growth._id.month.toString().padStart(2, '0')}`,
          users: growth.count
        }))
      },
      categories: categoryStats,
      topCourses,
      recentActivity: {
        enrollments: recentEnrollments.map(enrollment => ({
          studentName: enrollment.student?.name,
          courseTitle: enrollment.course?.title,
          date: enrollment.enrolledAt
        })),
        reviews: recentReviews.map(review => ({
          userName: review.user?.name,
          courseTitle: review.course?.title,
          rating: review.rating,
          date: review.createdAt
        }))
      }
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error("Platform stats error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Additional analytics endpoints
exports.getRevenueAnalytics = async (req, res) => {
  try {
    const revenueByMonth = await Enrollment.aggregate([
      {
        $match: {
          enrolledAt: {
            $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1))
          }
        }
      },
      {
        $lookup: {
          from: "courses",
          localField: "course",
          foreignField: "_id",
          as: "course"
        }
      },
      { $unwind: "$course" },
      {
        $group: {
          _id: {
            year: { $year: "$enrolledAt" },
            month: { $month: "$enrolledAt" }
          },
          revenue: { $sum: "$course.price" },
          enrollments: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    const revenueByCategory = await Enrollment.aggregate([
      {
        $lookup: {
          from: "courses",
          localField: "course",
          foreignField: "_id",
          as: "course"
        }
      },
      { $unwind: "$course" },
      {
        $group: {
          _id: "$course.category",
          revenue: { $sum: "$course.price" },
          enrollments: { $sum: 1 }
        }
      },
      { $sort: { revenue: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        monthlyRevenue: revenueByMonth,
        categoryRevenue: revenueByCategory
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUserAnalytics = async (req, res) => {
  try {
    const userRoles = await User.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 }
        }
      }
    ]);

    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1))
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    const activeUsers = await Enrollment.aggregate([
      {
        $match: {
          lastAccessed: {
            $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      },
      {
        $group: {
          _id: "$student",
          activityCount: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: null,
          activeUsers: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        userRoles,
        userGrowth: userGrowth.map(growth => ({
          month: `${growth._id.year}-${growth._id.month.toString().padStart(2, '0')}`,
          users: growth.count
        })),
        activeUsers: activeUsers[0]?.activeUsers || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// controllers/analyticsController.js
exports.getInstructorAnalytics = async (req, res) => {
  try {
    const instructorId = req.user._id;

    // Get all instructor courses with detailed information
    const courses = await Course.find({ instructor: instructorId })
      .select(
        "title price studentsEnrolled ratings lecturesCount totalHours isPublished createdAt category level"
      )
      .lean();

    const courseIds = courses.map((c) => c._id);

    // Get detailed enrollment data
    const enrollments = await Enrollment.find({ course: { $in: courseIds } })
      .populate("course", "title price")
      .populate("student", "name email")
      .lean();

    // Get reviews for instructor's courses
    const reviews = await Review.find({ course: { $in: courseIds } })
      .populate("user", "name")
      .populate("course", "title")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    // Revenue calculations
    const revenueData = await Enrollment.aggregate([
      { $match: { course: { $in: courseIds } } },
      {
        $lookup: {
          from: "courses",
          localField: "course",
          foreignField: "_id",
          as: "course",
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: { $arrayElemAt: ["$course.price", 0] } },
          monthlyRevenue: {
            $sum: {
              $cond: [
                {
                  $gte: [
                    "$enrolledAt",
                    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                  ],
                },
                { $arrayElemAt: ["$course.price", 0] },
                0,
              ],
            },
          },
        },
      },
    ]);

    // Enrollment trends (last 12 months)
    const enrollmentTrends = await Enrollment.aggregate([
      { $match: { course: { $in: courseIds } } },
      {
        $group: {
          _id: {
            year: { $year: "$enrolledAt" },
            month: { $month: "$enrolledAt" },
          },
          count: { $sum: 1 },
          revenue: {
            $sum: {
              $let: {
                vars: {
                  coursePrice: { $arrayElemAt: ["$course.price", 0] },
                },
                in: "$$coursePrice",
              },
            },
          },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 12 },
    ]);

    // Student progress analytics
    const progressData = await Enrollment.aggregate([
      { $match: { course: { $in: courseIds } } },
      {
        $group: {
          _id: "$course",
          avgProgress: { $avg: "$progress" },
          totalStudents: { $sum: 1 },
          completedStudents: {
            $sum: { $cond: [{ $eq: ["$progress", 100] }, 1, 0] },
          },
        },
      },
    ]);

    // Category distribution
    const categoryData = await Course.aggregate([
      { $match: { instructor: instructorId } },
      {
        $group: {
          _id: "$category",
          courseCount: { $sum: 1 },
          totalStudents: { $sum: "$studentsEnrolled" },
          totalRevenue: {
            $sum: { $multiply: ["$price", "$studentsEnrolled"] },
          },
        },
      },
    ]);

    // Rating distribution
    const ratingDistribution = await Review.aggregate([
      { $match: { course: { $in: courseIds } } },
      {
        $group: {
          _id: "$rating",
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Recent activity
    const recentActivity = await Enrollment.find({ course: { $in: courseIds } })
      .populate("course", "title")
      .populate("student", "name")
      .sort({ enrolledAt: -1 })
      .limit(10)
      .lean();

    const analytics = {
      summary: {
        totalCourses: courses.length,
        publishedCourses: courses.filter((c) => c.isPublished).length,
        totalStudents: enrollments.length,
        totalRevenue: revenueData[0]?.totalRevenue || 0,
        monthlyRevenue: revenueData[0]?.monthlyRevenue || 0,
        avgRating:
          courses.reduce((acc, c) => acc + (c.ratings?.average || 0), 0) /
            courses.length || 0,
        totalReviews: reviews.length,
      },
      courses,
      enrollments,
      enrollmentTrends: enrollmentTrends.map((trend) => ({
        month: `${trend._id.year}-${trend._id.month
          .toString()
          .padStart(2, "0")}`,
        enrollments: trend.count,
        revenue: trend.revenue,
      })),
      progressData,
      categoryData,
      ratingDistribution,
      recentActivity: recentActivity.map((activity) => ({
        studentName: activity.student.name,
        courseTitle: activity.course.title,
        action: "enrolled",
        time: activity.enrolledAt,
        progress: activity.progress,
      })),
      reviews: reviews.slice(0, 10),
    };

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};



exports.getStudentAnalytics = async (req, res) => {
  try {
    const studentId = req.user._id;

    // Get all enrollments with course details
    const enrollments = await Enrollment.find({ student: studentId })
      .populate("course", "title image slug category level instructor ratings studentsEnrolled totalHours lessons")
      .sort({ lastAccessed: -1 })
      .lean();

    // Calculate overall statistics
    const totalCourses = enrollments.length;
    const completedCourses = enrollments.filter(e => e.progress === 100).length;
    const inProgressCourses = enrollments.filter(e => e.progress > 0 && e.progress < 100).length;
    const totalLearningHours = enrollments.reduce((sum, e) => sum + (e.course?.totalHours || 0), 0);
    const averageProgress = totalCourses > 0 ? enrollments.reduce((sum, e) => sum + e.progress, 0) / totalCourses : 0;

    // Progress trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const progressTrends = await Enrollment.aggregate([
      {
        $match: {
          student: studentId,
          lastAccessed: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$lastAccessed" },
            month: { $month: "$lastAccessed" }
          },
          avgProgress: { $avg: "$progress" },
          coursesAccessed: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Format progress trends for chart
    const formattedProgressTrends = progressTrends.map(trend => ({
      month: `${new Date(trend._id.year, trend._id.month - 1).toLocaleString('default', { month: 'short' })} ${trend._id.year}`,
      progress: Math.round(trend.avgProgress),
      courses: trend.coursesAccessed
    }));

    // Category distribution
    const categoryDistribution = await Enrollment.aggregate([
      { $match: { student: studentId } },
      {
        $lookup: {
          from: "courses",
          localField: "course",
          foreignField: "_id",
          as: "course"
        }
      },
      { $unwind: "$course" },
      {
        $group: {
          _id: "$course.category",
          count: { $sum: 1 },
          avgProgress: { $avg: "$progress" }
        }
      }
    ]);

    // Recent activity (last 10 enrollments with progress updates)
    const recentActivity = await Enrollment.find({ student: studentId })
      .populate("course", "title image slug category")
      .sort({ lastAccessed: -1 })
      .limit(10)
      .lean();

    // Learning time distribution (by time of day)
    const timeDistribution = await Enrollment.aggregate([
      { $match: { student: studentId } },
      {
        $group: {
          _id: { $hour: "$lastAccessed" },
          sessions: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Recommended courses (based on enrolled categories and progress)
    const enrolledCategories = [...new Set(enrollments.map(e => e.course?.category).filter(Boolean))];
    
    const recommendedCourses = await Course.find({
      category: { $in: enrolledCategories },
      _id: { $nin: enrollments.map(e => e.course?._id) },
      isPublished: true
    })
    .populate("instructor", "name")
    .select("title image slug instructor price ratings studentsEnrolled totalHours")
    .sort({ "ratings.average": -1, studentsEnrolled: -1 })
    .limit(8)
    .lean();

    // Weekly learning goals
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const weeklyProgress = await Enrollment.aggregate([
      {
        $match: {
          student: studentId,
          lastAccessed: { $gte: startOfWeek }
        }
      },
      {
        $group: {
          _id: null,
          totalProgress: { $sum: "$progress" },
          sessions: { $sum: 1 },
          courses: { $addToSet: "$course" }
        }
      }
    ]);

    const weeklyStats = weeklyProgress[0] ? {
      progress: weeklyProgress[0].totalProgress,
      sessions: weeklyProgress[0].sessions,
      courses: weeklyProgress[0].courses.length
    } : { progress: 0, sessions: 0, courses: 0 };

    // Achievement badges (mock data for now)
    const achievements = [
      { name: "First Course", earned: totalCourses > 0, icon: "🎯" },
      { name: "Halfway There", earned: averageProgress >= 50, icon: "🏆" },
      { name: "Course Collector", earned: totalCourses >= 5, icon: "📚" },
      { name: "Perfect Score", earned: completedCourses > 0, icon: "⭐" },
      { name: "Weekend Warrior", earned: weeklyStats.sessions >= 3, icon: "⚡" },
      { name: "Early Bird", earned: timeDistribution.some(t => t._id >= 5 && t._id <= 8), icon: "🌅" }
    ];

    res.json({
      success: true,
      data: {
        summary: {
          totalCourses,
          completedCourses,
          inProgressCourses,
          totalLearningHours: Math.round(totalLearningHours),
          averageProgress: Math.round(averageProgress),
          weeklyStats
        },
        progressTrends: formattedProgressTrends,
        categoryDistribution,
        recentCourses: enrollments.slice(0, 6).map(e => ({
          _id: e.course?._id,
          title: e.course?.title,
          image: e.course?.image,
          slug: e.course?.slug,
          progress: e.progress,
          category: e.course?.category,
          lastAccessed: e.lastAccessed
        })),
        recommendedCourses,
        timeDistribution: timeDistribution.map(t => ({
          hour: t._id,
          sessions: t.sessions,
          period: t._id < 12 ? 'Morning' : t._id < 17 ? 'Afternoon' : 'Evening'
        })),
        achievements: achievements.filter(a => a.earned),
        recentActivity: recentActivity.map(activity => ({
          courseTitle: activity.course?.title,
          progress: activity.progress,
          action: activity.progress === 100 ? 'Completed' : activity.progress > 0 ? 'In Progress' : 'Enrolled',
          time: activity.lastAccessed
        }))
      }
    });
  } catch (error) {
    console.error("Student analytics error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getStudentProgressDetails = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { courseId } = req.params;

    const enrollment = await Enrollment.findOne({ 
      student: studentId, 
      course: courseId 
    })
    .populate("course", "title lessons totalHours")
    .populate("completedLessons")
    .lean();

    if (!enrollment) {
      return res.status(404).json({ 
        success: false, 
        message: "Enrollment not found" 
      });
    }

    // Calculate detailed progress
    const totalLessons = enrollment.course.lessons.length;
    const completedLessons = enrollment.completedLessons.length;
    const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

    // Time spent calculations (mock data - you'd need to track this)
    const estimatedTimeSpent = (enrollment.course.totalHours * progressPercentage) / 100;

    res.json({
      success: true,
      data: {
        enrollment,
        progress: {
          percentage: Math.round(progressPercentage),
          completedLessons,
          totalLessons,
          estimatedTimeSpent: Math.round(estimatedTimeSpent * 100) / 100
        },
        nextLesson: enrollment.course.lessons[completedLessons] || null
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getStudentProgressAnalytics = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user._id })
      .populate("course", "title lessons")
      .lean();
    res.json({ success: true, data: enrollments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
