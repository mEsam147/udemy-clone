// // controllers/learnController.js
// const Course = require("../models/Course");
// const Enrollment = require("../models/Enrollment");
// const Lesson = require("../models/Lesson");
// const User = require("../models/User");
// const mongoose = require("mongoose");

// // @desc    Get user's enrolled courses with progress
// // @route   GET /api/learn
// // @access  Private
// exports.getEnrolledCourses = async (req, res, next) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const skip = (page - 1) * limit;

//     // Get user's enrollments with populated course data
//     const enrollments = await Enrollment.find({ student: req.user.id })
//       .populate({
//         path: "course",
//         match: { isPublished: true },
//         populate: {
//           path: "instructor",
//           select: "name avatar bio expertise",
//         },
//         select:
//           "title slug image price category level totalHours lecturesCount ratings studentsEnrolled description whatYoullLearn requirements publishedAt updatedAt",
//       })
//       .populate({
//         path: "completedLessons",
//         select: "_id title duration order",
//         options: { limit: 5 }, // Only get recent completed lessons
//       })
//       .sort({ lastAccessed: -1 })
//       .skip(skip)
//       .limit(limit);

//     // Filter out unpublished courses
//     const validEnrollments = enrollments.filter(
//       (enrollment) => enrollment.course
//     );

//     const courses = validEnrollments.map((enrollment) => {
//       const course = enrollment.course;
//       const completedCount = enrollment.completedLessons.length;
//       const totalLessons = course.lecturesCount || 0;
//       const progress =
//         totalLessons > 0
//           ? Math.round((completedCount / totalLessons) * 100)
//           : 0;

//       // Update progress if needed (in background)
//       if (Math.abs(enrollment.progress - progress) > 1) {
//         enrollment.progress = progress;
//         enrollment.lastAccessed = new Date();
//         enrollment.save().catch(console.error); // Don't block response
//       }

//       return {
//         id: course._id.toString(),
//         slug: course.slug,
//         title: course.title,
//         subtitle: course.description?.substring(0, 100) + "...",
//         image: course.image || "/placeholder-course.svg",
//         instructor: {
//           id: course.instructor._id.toString(),
//           name: course.instructor.name,
//           avatar: course.instructor.avatar || "/placeholder-avatar.svg",
//           bio: course.instructor.bio,
//           expertise: course.instructor.expertise || [],
//         },
//         price: course.price,
//         originalPrice: course.originalPrice || course.price,
//         category: course.category,
//         level: course.level,
//         language: course.language || "English",
//         ratings: course.ratings,
//         studentsEnrolled: course.studentsEnrolled || 0,
//         totalHours: course.totalHours || 0,
//         totalLessons,
//         completedLessons: completedCount,
//         progress,
//         lastAccessed: enrollment.lastAccessed,
//         enrolledAt: enrollment.enrolledAt,
//         rating: enrollment.rating,
//         nextLesson: getNextLesson(course, enrollment.completedLessons),
//         estimatedCompletionTime: calculateEstimatedCompletionTime(
//           totalLessons,
//           completedCount,
//           course.totalHours
//         ),
//       };
//     });

//     // Get total count for pagination
//     const totalEnrollments = await Enrollment.countDocuments({
//       student: req.user.id,
//       "course.isPublished": true,
//     });

//     res.status(200).json({
//       success: true,
//       count: courses.length,
//       total: totalEnrollments,
//       pagination: {
//         current: page,
//         pages: Math.ceil(totalEnrollments / limit),
//         totalItems: totalEnrollments,
//         hasNext: skip + limit < totalEnrollments,
//         hasPrev: page > 1,
//       },
//       data: courses,
//       overallProgress: Math.round(
//         courses.reduce((sum, course) => sum + course.progress, 0) /
//           Math.max(courses.length, 1)
//       ),
//     });
//   } catch (error) {
//     console.error("Error in getEnrolledCourses:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error while fetching enrolled courses",
//     });
//   }
// };

// // @desc    Get detailed course learning data
// // @route   GET /api/learn/courses/:slug
// // @access  Private
// exports.getCourseLearningData = async (req, res, next) => {
//   try {
//     const { slug } = req.params;

//     // Find course by slug
//     const course = await Course.findOne({
//       slug,
//       isPublished: true,
//     })
//       .populate(
//         "instructor",
//         "name avatar bio expertise responseTime officeHours"
//       )
//       .populate({
//         path: "lessons",
//         select:
//           "title description videoUrl duration order isPreview resources transcript",
//         options: { sort: { order: 1 } },
//       });

//     if (!course) {
//       return res.status(404).json({
//         success: false,
//         message: "Course not found or not published",
//       });
//     }

//     // Check enrollment status
//     const enrollment = await Enrollment.findOne({
//       student: req.user.id,
//       course: course._id,
//     }).populate({
//       path: "completedLessons",
//       populate: {
//         path: "resources",
//         select: "name url type",
//       },
//       select: "completedLessons progress enrolledAt lastAccessed rating",
//     });

//     let courseData;

//     if (!enrollment) {
//       // For non-enrolled users, return limited data (previews only)
//       const previewLessons = await Lesson.find({
//         course: course._id,
//         isPreview: true,
//       })
//         .select("title description videoUrl duration order isPreview")
//         .sort({ order: 1 });

//       courseData = {
//         id: course._id.toString(),
//         title: course.title,
//         slug: course.slug,
//         description: course.description,
//         image: course.image || "/placeholder-course.svg",
//         instructor: course.instructor,
//         price: course.price,
//         category: course.category,
//         level: course.level,
//         language: course.language || "English",
//         totalHours: course.totalHours || 0,
//         lecturesCount: course.lecturesCount || 0,
//         requirements: course.requirements || [],
//         whatYoullLearn: course.whatYoullLearn || [],
//         ratings: course.ratings,
//         studentsEnrolled: course.studentsEnrolled || 0,
//         lessons: previewLessons,
//         enrollment: null,
//         isEnrolled: false,
//         canAccessFullContent: false,
//         nextLesson: null,
//         progress: 0,
//         estimatedCompletionTime: null,
//         courseCompleted: false,
//       };
//     } else {
//       // Calculate current progress
//       const totalLessons = course.lessons.length;
//       const completedLessonsCount = enrollment.completedLessons.length;
//       const currentProgress =
//         totalLessons > 0
//           ? Math.round((completedLessonsCount / totalLessons) * 100)
//           : 0;

//       // Update enrollment progress if needed
//       if (Math.abs(enrollment.progress - currentProgress) > 1) {
//         enrollment.progress = currentProgress;
//         enrollment.lastAccessed = new Date();
//         await enrollment.save();
//       }

//       // Get next uncompleted lesson
//       const nextLessonIndex = course.lessons.findIndex(
//         (lesson) =>
//           !enrollment.completedLessons.some(
//             (cl) => cl._id.toString() === lesson._id.toString()
//           )
//       );

//       courseData = {
//         id: course._id.toString(),
//         slug: course.slug,
//         title: course.title,
//         subtitle: course.description?.substring(0, 150) + "...",
//         description: course.description,
//         image: course.image || "/placeholder-course.svg",
//         instructor: {
//           id: course.instructor._id.toString(),
//           name: course.instructor.name,
//           avatar: course.instructor.avatar || "/placeholder-avatar.svg",
//           bio: course.instructor.bio || "",
//           expertise: course.instructor.expertise || [],
//           responseTime: course.instructor.responseTime || "within 24 hours",
//           officeHours: course.instructor.officeHours || "",
//         },
//         price: course.price,
//         originalPrice: course.originalPrice || course.price,
//         category: course.category,
//         subcategory: course.subcategory || "",
//         level: course.level,
//         language: course.language || "English",
//         ratings: course.ratings,
//         studentsEnrolled: course.studentsEnrolled || 0,
//         totalHours: course.totalHours || 0,
//         lecturesCount: totalLessons,
//         requirements: course.requirements || [],
//         whatYoullLearn: course.whatYoullLearn || [],
//         publishedAt: course.publishedAt,
//         updatedAt: course.updatedAt,
//         lessons: course.lessons.map((lesson) => ({
//           id: lesson._id.toString(),
//           title: lesson.title,
//           description: lesson.description || "",
//           videoUrl: lesson.videoUrl,
//           duration: lesson.duration || 0,
//           order: lesson.order || 0,
//           isPreview: lesson.isPreview || false,
//           resources: lesson.resources || [],
//           transcript: lesson.transcript || null,
//           isCompleted: enrollment.completedLessons.some(
//             (cl) => cl._id.toString() === lesson._id.toString()
//           ),
//         })),
//         enrollment: {
//           id: enrollment._id.toString(),
//           progress: enrollment.progress,
//           completedLessons: enrollment.completedLessons.map((l) => ({
//             id: l._id.toString(),
//             title: l.title,
//             duration: l.duration || 0,
//             resources: l.resources || [],
//           })),
//           enrolledAt: enrollment.enrolledAt,
//           lastAccessed: enrollment.lastAccessed,
//           rating: enrollment.rating || null,
//         },
//         isEnrolled: true,
//         canAccessFullContent: true,
//         nextLesson:
//           nextLessonIndex !== -1
//             ? {
//                 id: course.lessons[nextLessonIndex]._id.toString(),
//                 title: course.lessons[nextLessonIndex].title,
//                 duration: course.lessons[nextLessonIndex].duration || 0,
//                 order: course.lessons[nextLessonIndex].order || 0,
//                 isPreview: course.lessons[nextLessonIndex].isPreview || false,
//               }
//             : null,
//         estimatedCompletionTime: calculateEstimatedCompletionTime(
//           totalLessons,
//           completedLessonsCount,
//           course.totalHours
//         ),
//         courseCompleted: currentProgress >= 100,
//       };
//     }

//     // Update last accessed time for enrolled users
//     if (enrollment) {
//       enrollment.lastAccessed = new Date();
//       await enrollment.save();
//     }

//     res.status(200).json({
//       success: true,
//       data: courseData,
//     });
//   } catch (error) {
//     console.error("Error in getCourseLearningData:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error while fetching course data",
//     });
//   }
// };

// // @desc    Update lesson progress
// // @route   PUT /api/learn/courses/:courseId/progress
// // @access  Private
// exports.updateLessonProgress = async (req, res, next) => {
//   try {
//     const { lessonId, completed } = req.body;
//     const { courseId } = req.params;

//     // Validate input
//     if (
//       !mongoose.Types.ObjectId.isValid(courseId) ||
//       !mongoose.Types.ObjectId.isValid(lessonId)
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid course or lesson ID",
//       });
//     }

//     if (!req.user) {
//       return res.status(401).json({
//         success: false,
//         message: "User not authenticated",
//       });
//     }

//     // Find enrollment
//     const enrollment = await Enrollment.findOne({
//       student: req.user.id,
//       course: courseId,
//     });

//     if (!enrollment) {
//       return res.status(404).json({
//         success: false,
//         message: "Enrollment not found. You must be enrolled in this course.",
//       });
//     }

//     // Verify lesson belongs to course
//     const lesson = await Lesson.findOne({
//       _id: lessonId,
//       course: courseId,
//     });

//     if (!lesson) {
//       return res.status(400).json({
//         success: false,
//         message: "Lesson not found or does not belong to this course",
//       });
//     }

//     let wasCompleted = false;
//     let actionTaken = false;

//     if (completed) {
//       // Mark as completed
//       wasCompleted = enrollment.completedLessons.includes(lessonId);

//       if (!wasCompleted) {
//         enrollment.completedLessons.push(lessonId);
//         actionTaken = true;

//         // Add completion timestamp if needed
//         await Lesson.findByIdAndUpdate(lessonId, {
//           $set: { completedAt: new Date() },
//         });
//       }
//     } else {
//       // Mark as incomplete
//       wasCompleted = enrollment.completedLessons.includes(lessonId);

//       if (wasCompleted) {
//         enrollment.completedLessons = enrollment.completedLessons.filter(
//           (id) => id.toString() !== lessonId
//         );
//         actionTaken = true;

//         // Remove completion timestamp
//         await Lesson.findByIdAndUpdate(lessonId, {
//           $unset: { completedAt: "" },
//         });
//       }
//     }

//     if (!actionTaken) {
//       return res.status(200).json({
//         success: true,
//         message: "No change needed",
//         data: {
//           lessonId,
//           completed,
//           wasAlreadyCompleted: wasCompleted,
//           actionTaken: false,
//           progress: enrollment.progress,
//         },
//       });
//     }

//     // Recalculate progress
//     const totalLessons = await Lesson.countDocuments({ course: courseId });
//     const completedCount = enrollment.completedLessons.length;
//     const newProgress =
//       totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

//     // Update enrollment
//     enrollment.progress = newProgress;
//     enrollment.lastAccessed = new Date();
//     await enrollment.save();

//     // Populate completed lessons for response (limited)
//     const populatedEnrollment = await Enrollment.findById(enrollment._id)
//       .populate({
//         path: "completedLessons",
//         select: "_id title duration order",
//         options: { limit: 3 },
//       })
//       .select("completedLessons progress");

//     res.status(200).json({
//       success: true,
//       data: {
//         enrollmentId: enrollment._id.toString(),
//         lessonId,
//         completed,
//         wasAlreadyCompleted: wasCompleted,
//         actionTaken,
//         progress: newProgress,
//         completedLessonsCount: enrollment.completedLessons.length,
//         totalLessons,
//         completedLessons: populatedEnrollment.completedLessons,
//       },
//     });
//   } catch (error) {
//     console.error("Error in updateLessonProgress:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error while updating lesson progress",
//     });
//   }
// };

// // @desc    Get user's learning progress analytics
// // @route   GET /api/learn/progress
// // @access  Private
// exports.getLearningProgress = async (req, res, next) => {
//   try {
//     const timeRange = req.query.range || "all-time"; // "all-time", "30-days", "90-days"
//     const matchCondition = getTimeRangeCondition(timeRange);

//     const [enrollments, stats] = await Promise.all([
//       // Get enrollments with course data
//       Enrollment.aggregate([
//         {
//           $match: {
//             student: req.user.id,
//             ...matchCondition,
//           },
//         },
//         {
//           $lookup: {
//             from: "courses",
//             localField: "course",
//             foreignField: "_id",
//             as: "course",
//             pipeline: [
//               { $match: { isPublished: true } },
//               {
//                 $project: {
//                   title: 1,
//                   slug: 1,
//                   image: 1,
//                   category: 1,
//                   level: 1,
//                   totalHours: 1,
//                   price: 1,
//                   ratings: 1,
//                   studentsEnrolled: 1,
//                 },
//               },
//             ],
//           },
//         },
//         {
//           $unwind: { path: "$course", preserveNullAndEmptyArrays: true },
//         },
//         {
//           $project: {
//             courseId: "$course._id",
//             courseTitle: "$course.title",
//             courseSlug: "$course.slug",
//             courseImage: "$course.image",
//             category: "$course.category",
//             level: "$course.level",
//             totalHours: "$course.totalHours",
//             enrolledAt: 1,
//             lastAccessed: 1,
//             progress: 1,
//             completedLessons: { $size: "$completedLessons" },
//             totalLessons: "$course.lecturesCount",
//             isCompleted: { $eq: ["$progress", 100] },
//             daysSinceEnrollment: {
//               $divide: [
//                 { $subtract: ["$$NOW", "$enrolledAt"] },
//                 1000 * 60 * 60 * 24,
//               ],
//             },
//             timeSpent: {
//               $divide: [
//                 { $subtract: ["$lastAccessed", "$enrolledAt"] },
//                 1000 * 60 * 60, // Convert to hours
//               ],
//             },
//           },
//         },
//         { $sort: { lastAccessed: -1 } },
//       ]),

//       // Get learning statistics
//       Enrollment.aggregate([
//         {
//           $match: {
//             student: req.user.id,
//             ...matchCondition,
//           },
//         },
//         {
//           $lookup: {
//             from: "courses",
//             localField: "course",
//             foreignField: "_id",
//             as: "course",
//             pipeline: [{ $match: { isPublished: true } }],
//           },
//         },
//         {
//           $unwind: { path: "$course", preserveNullAndEmptyArrays: true },
//         },
//         {
//           $group: {
//             _id: null,
//             totalEnrolled: { $sum: 1 },
//             totalCompleted: {
//               $sum: { $cond: [{ $eq: ["$progress", 100] }, 1, 0] },
//             },
//             totalInProgress: {
//               $sum: {
//                 $cond: [
//                   {
//                     $and: [
//                       { $gt: ["$progress", 0] },
//                       { $lt: ["$progress", 100] },
//                     ],
//                   },
//                   1,
//                   0,
//                 ],
//               },
//             },
//             totalProgress: { $avg: "$progress" },
//             totalHoursEnrolled: {
//               $sum: {
//                 $multiply: [
//                   "$progress",
//                   { $divide: ["$course.totalHours", 100] },
//                 ],
//               },
//             },
//             avgDaysToComplete: {
//               $avg: {
//                 $cond: [
//                   { $eq: ["$progress", 100] },
//                   {
//                     $divide: [
//                       { $subtract: ["$updatedAt", "$enrolledAt"] },
//                       1000 * 60 * 60 * 24, // Convert to days
//                     ],
//                   },
//                   0,
//                 ],
//               },
//             },
//             avgTimePerCourse: {
//               $avg: {
//                 $divide: [
//                   { $subtract: ["$lastAccessed", "$enrolledAt"] },
//                   1000 * 60 * 60, // Convert to hours
//                 ],
//               },
//             },
//             categories: {
//               $addToSet: "$course.category",
//             },
//             levels: {
//               $addToSet: "$course.level",
//             },
//           },
//         },
//         {
//           $project: {
//             totalEnrolled: 1,
//             totalCompleted: 1,
//             totalInProgress: 1,
//             completionRate: {
//               $multiply: [
//                 {
//                   $divide: ["$totalCompleted", "$totalEnrolled"],
//                 },
//                 100,
//               ],
//             },
//             averageProgress: { $round: ["$totalProgress", 1] },
//             totalHoursCompleted: { $round: ["$totalHoursEnrolled", 1] },
//             avgDaysToComplete: { $round: ["$avgDaysToComplete", 1] },
//             avgTimePerCourse: { $round: ["$avgTimePerCourse", 1] },
//             categoryCount: { $size: "$categories" },
//             levelCount: { $size: "$levels" },
//             categories: "$categories",
//             levels: "$levels",
//           },
//         },
//       ]),
//     ]);

//     const analytics = {
//       enrollments: enrollments,
//       statistics: stats[0] || {
//         totalEnrolled: 0,
//         totalCompleted: 0,
//         totalInProgress: 0,
//         completionRate: 0,
//         averageProgress: 0,
//         totalHoursCompleted: 0,
//         avgDaysToComplete: 0,
//         avgTimePerCourse: 0,
//         categoryCount: 0,
//         levelCount: 0,
//         categories: [],
//         levels: [],
//       },
//       timeRange,
//       summary: {
//         activeCourses: enrollments.filter(
//           (e) => e.progress > 0 && e.progress < 100
//         ).length,
//         recentlyActive: enrollments.filter(
//           (e) =>
//             new Date(e.lastAccessed) >
//             new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
//         ).length,
//         highCompletion: enrollments.filter((e) => e.progress >= 80).length,
//       },
//     };

//     res.status(200).json({
//       success: true,
//       data: analytics,
//     });
//   } catch (error) {
//     console.error("Error in getLearningProgress:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error while fetching learning progress",
//     });
//   }
// };

// // @desc    Get course recommendations for user
// // @route   GET /api/learn/recommendations
// // @access  Private
// exports.getLearningRecommendations = async (req, res, next) => {
//   try {
//     const limit = parseInt(req.query.limit) || 12;
//     const category = req.query.category; // Optional category filter
//     const level = req.query.level; // Optional level filter

//     // Get user's enrolled courses to understand interests
//     const userEnrollments = await Enrollment.find({
//       student: req.user.id,
//       "course.isPublished": true,
//     })
//       .populate("course", "category level")
//       .limit(10);

//     const userInterests = {
//       categories: [
//         ...new Set(
//           userEnrollments.map((e) => e.course?.category).filter(Boolean)
//         ),
//       ],
//       levels: [
//         ...new Set(userEnrollments.map((e) => e.course?.level).filter(Boolean)),
//       ],
//     };

//     let matchCondition = {
//       isPublished: true,
//       _id: {
//         $nin: userEnrollments.map((e) => e.course._id), // Exclude already enrolled
//       },
//     };

//     // Filter by category if specified
//     if (category) {
//       matchCondition.category = category;
//     } else if (userInterests.categories.length > 0) {
//       matchCondition.category = { $in: userInterests.categories };
//     }

//     // Filter by level if specified
//     if (level) {
//       matchCondition.level = level;
//     } else if (userInterests.levels.length > 0) {
//       matchCondition.level = { $in: userInterests.levels };
//     }

//     // Get recommended courses
//     const recommendations = await Course.find(matchCondition)
//       .populate("instructor", "name avatar")
//       .select(
//         "title slug image price originalPrice ratings category level totalHours lecturesCount studentsEnrolled updatedAt"
//       )
//       .sort({
//         "ratings.average": -1,
//         studentsEnrolled: -1,
//         updatedAt: -1, // Recently updated courses
//       })
//       .limit(limit);

//     // Calculate discount info
//     const coursesWithDiscounts = recommendations.map((course) => {
//       let discountInfo = null;

//       if (course.originalPrice && course.originalPrice > course.price) {
//         const discountPercentage = Math.round(
//           ((course.originalPrice - course.price) / course.originalPrice) * 100
//         );
//         discountInfo = {
//           originalPrice: course.originalPrice,
//           discountPercentage,
//           savings: course.originalPrice - course.price,
//         };
//       }

//       return {
//         id: course._id.toString(),
//         slug: course.slug,
//         title: course.title,
//         subtitle: course.description?.substring(0, 120) + "...",
//         image: course.image || "/placeholder-course.svg",
//         instructor: {
//           id: course.instructor._id.toString(),
//           name: course.instructor.name,
//           avatar: course.instructor.avatar || "/placeholder-avatar.svg",
//         },
//         price: course.price,
//         originalPrice: course.originalPrice,
//         discountInfo,
//         category: course.category,
//         level: course.level,
//         ratings: course.ratings,
//         studentsEnrolled: course.studentsEnrolled || 0,
//         totalHours: course.totalHours || 0,
//         lecturesCount: course.lecturesCount || 0,
//         lastUpdated: new Date(course.updatedAt).toLocaleDateString("en-US", {
//           month: "short",
//           year: "numeric",
//         }),
//         whyRecommended: generateRecommendationReason(course, userInterests),
//       };
//     });

//     res.status(200).json({
//       success: true,
//       count: coursesWithDiscounts.length,
//       data: coursesWithDiscounts,
//       interests: userInterests,
//     });
//   } catch (error) {
//     console.error("Error in getLearningRecommendations:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error while fetching recommendations",
//     });
//   }
// };

// // @desc    Get user's recently viewed courses
// // @route   GET /api/learn/recent
// // @access  Private
// exports.getRecentCourses = async (req, res, next) => {
//   try {
//     const limit = parseInt(req.query.limit) || 6;
//     const days = parseInt(req.query.days) || 30;

//     const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

//     const recentEnrollments = await Enrollment.find({
//       student: req.user.id,
//       lastAccessed: { $gte: cutoffDate },
//     })
//       .populate({
//         path: "course",
//         match: { isPublished: true },
//         populate: { path: "instructor", select: "name avatar" },
//         select: "title slug image price category level totalHours progress",
//       })
//       .sort({ lastAccessed: -1 })
//       .limit(limit);

//     const recentCourses = recentEnrollments
//       .filter((e) => e.course)
//       .map((enrollment) => ({
//         id: enrollment.course._id.toString(),
//         slug: enrollment.course.slug,
//         title: enrollment.course.title,
//         image: enrollment.course.image || "/placeholder-course.svg",
//         instructor: {
//           id: enrollment.course.instructor._id.toString(),
//           name: enrollment.course.instructor.name,
//           avatar:
//             enrollment.course.instructor.avatar || "/placeholder-avatar.svg",
//         },
//         price: enrollment.course.price,
//         category: enrollment.course.category,
//         level: enrollment.course.level,
//         totalHours: enrollment.course.totalHours || 0,
//         progress: enrollment.progress,
//         lastAccessed: enrollment.lastAccessed,
//         daysAgo: Math.round(
//           (Date.now() - new Date(enrollment.lastAccessed).getTime()) /
//             (1000 * 60 * 60 * 24)
//         ),
//       }));

//     res.status(200).json({
//       success: true,
//       count: recentCourses.length,
//       data: recentCourses,
//     });
//   } catch (error) {
//     console.error("Error in getRecentCourses:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error while fetching recent courses",
//     });
//   }
// };

// // @desc    Search user's learning content
// // @route   GET /api/learn/search
// // @access  Private
// exports.searchLearningContent = async (req, res, next) => {
//   try {
//     const { q, type, category, level } = req.query;
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const skip = (page - 1) * limit;

//     if (!q || typeof q !== "string") {
//       return res.status(400).json({
//         success: false,
//         message: "Search query is required",
//       });
//     }

//     const searchTerm = q.trim().toLowerCase();

//     // Get user's enrolled courses for context
//     const userEnrollments = await Enrollment.find({ student: req.user.id })
//       .populate("course", "title description category level")
//       .lean();

//     const enrolledCourses = userEnrollments
//       .filter((e) => e.course)
//       .map((e) => e.course);

//     let searchResults = [];

//     // Search in enrolled courses first
//     const enrolledMatches = enrolledCourses.filter(
//       (course) =>
//         course.title.toLowerCase().includes(searchTerm) ||
//         (course.description &&
//           course.description.toLowerCase().includes(searchTerm))
//     );

//     // If type is specified, filter accordingly
//     if (type === "lessons") {
//       // Search lessons within enrolled courses
//       const lessonPromises = enrolledCourses.map(async (course) => {
//         const lessons = await Lesson.find({
//           course: course._id,
//           $or: [
//             { title: { $regex: searchTerm, $options: "i" } },
//             { description: { $regex: searchTerm, $options: "i" } },
//           ],
//         })
//           .select("title description duration order")
//           .limit(5);

//         return lessons.map((lesson) => ({
//           type: "lesson",
//           id: lesson._id.toString(),
//           title: lesson.title,
//           description: lesson.description || "",
//           duration: lesson.duration || 0,
//           course: {
//             id: course._id.toString(),
//             title: course.title,
//             slug: course.slug,
//           },
//           matchType: "lesson",
//           score: calculateSearchScore(
//             lesson.title + " " + (lesson.description || ""),
//             searchTerm
//           ),
//         }));
//       });

//       const allLessons = (await Promise.all(lessonPromises)).flat();
//       searchResults = allLessons
//         .sort((a, b) => b.score - a.score)
//         .slice(0, limit);
//     } else {
//       // Default search: courses and sections
//       searchResults = enrolledMatches
//         .map((course) => ({
//           type: "course",
//           id: course._id.toString(),
//           title: course.title,
//           description: course.description || "",
//           category: course.category,
//           level: course.level,
//           progress:
//             userEnrollments.find(
//               (e) => e.course._id.toString() === course._id.toString()
//             )?.progress || 0,
//           matchType: "course",
//           score: calculateSearchScore(
//             course.title + " " + course.description,
//             searchTerm
//           ),
//         }))
//         .sort((a, b) => b.score - a.score)
//         .slice(0, limit);
//     }

//     // Add search suggestions
//     const suggestions = generateSearchSuggestions(searchTerm, enrolledCourses);

//     res.status(200).json({
//       success: true,
//       count: searchResults.length,
//       suggestions,
//       data: searchResults,
//       searchTerm,
//       type: type || "all",
//     });
//   } catch (error) {
//     console.error("Error in searchLearningContent:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error while searching learning content",
//     });
//   }
// };

// // @desc    Get learning streaks and achievements
// // @route   GET /api/learn/streaks
// // @access  Private
// exports.getLearningStreaks = async (req, res, next) => {
//   try {
//     const days = parseInt(req.query.days) || 30;

//     const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

//     // Get daily activity
//     const dailyActivity = await Enrollment.aggregate([
//       {
//         $match: {
//           student: req.user.id,
//           lastAccessed: { $gte: cutoffDate },
//         },
//       },
//       {
//         $group: {
//           _id: {
//             year: { $year: "$lastAccessed" },
//             month: { $month: "$lastAccessed" },
//             day: { $dayOfMonth: "$lastAccessed" },
//           },
//           date: { $first: "$lastAccessed" },
//           activities: {
//             $sum: 1,
//           },
//           courses: {
//             $addToSet: "$course",
//           },
//         },
//       },
//       {
//         $sort: { date: 1 },
//       },
//       {
//         $project: {
//           _id: 0,
//           date: 1,
//           activities: 1,
//           uniqueCourses: { $size: "$courses" },
//           streakDay: {
//             $dateToString: {
//               format: "%Y-%m-%d",
//               date: "$date",
//             },
//           },
//         },
//       },
//     ]);

//     // Calculate current streak
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     let currentStreak = 0;
//     let maxStreak = 0;
//     let longestStreakStart = null;
//     let currentStreakStart = null;

//     const dailyMap = new Map();
//     dailyActivity.forEach((day) => {
//       dailyMap.set(day.streakDay, day);
//     });

//     // Check consecutive days
//     for (let i = 0; i < days; i++) {
//       const checkDate = new Date(today);
//       checkDate.setDate(today.getDate() - i);
//       const dateKey = checkDate.toISOString().split("T")[0];

//       const hasActivity = dailyMap.has(dateKey);

//       if (hasActivity) {
//         currentStreak++;
//         if (!currentStreakStart) {
//           currentStreakStart = dateKey;
//         }

//         if (currentStreak > maxStreak) {
//           maxStreak = currentStreak;
//           longestStreakStart = dateKey;
//         }
//       } else {
//         currentStreak = 0;
//         currentStreakStart = null;
//       }
//     }

//     // Get achievements
//     const achievements = calculateAchievements(dailyActivity, userEnrollments);

//     const streaksData = {
//       currentStreak,
//       maxStreak,
//       currentStreakStart,
//       longestStreakStart,
//       dailyActivity: dailyActivity.map((day) => ({
//         date: day.date,
//         activities: day.activities,
//         uniqueCourses: day.uniqueCourses,
//         streakDay: day.streakDay,
//       })),
//       achievements,
//       totalDaysAnalyzed: days,
//     };

//     res.status(200).json({
//       success: true,
//       data: streaksData,
//     });
//   } catch (error) {
//     console.error("Error in getLearningStreaks:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error while fetching learning streaks",
//     });
//   }
// };

// // @desc    Get user's learning timeline
// // @route   GET /api/learn/timeline
// // @access  Private
// exports.getLearningTimeline = async (req, res, next) => {
//   try {
//     const limit = parseInt(req.query.limit) || 50;
//     const since = req.query.since ? new Date(req.query.since) : undefined;

//     const matchCondition = since ? { lastAccessed: { $gte: since } } : {};

//     const timelineEvents = await Enrollment.aggregate([
//       {
//         $match: {
//           student: req.user.id,
//           ...matchCondition,
//         },
//       },
//       {
//         $lookup: {
//           from: "courses",
//           localField: "course",
//           foreignField: "_id",
//           as: "course",
//           pipeline: [
//             { $match: { isPublished: true } },
//             {
//               $project: {
//                 title: 1,
//                 slug: 1,
//                 image: 1,
//                 instructor: 1,
//                 category: 1,
//                 level: 1,
//               },
//             },
//           ],
//         },
//       },
//       {
//         $unwind: { path: "$course", preserveNullAndEmptyArrays: true },
//       },
//       {
//         $addFields: {
//           eventType: {
//             $cond: [
//               { $eq: ["$progress", 100] },
//               "completed",
//               { $cond: [{ $gt: ["$progress", 0] }, "in_progress", "enrolled"] },
//             ],
//           },
//           eventDate: "$lastAccessed",
//           courseTitle: "$course.title",
//           courseSlug: "$course.slug",
//           courseImage: "$course.image",
//           instructorName: "$course.instructor.name",
//           category: "$course.category",
//           level: "$course.level",
//           progress: 1,
//         },
//       },
//       {
//         $sort: { eventDate: -1 },
//       },
//       {
//         $limit: limit,
//       },
//       {
//         $project: {
//           _id: 0,
//           eventType: 1,
//           eventDate: 1,
//           courseTitle: 1,
//           courseSlug: 1,
//           courseImage: 1,
//           instructorName: 1,
//           category: 1,
//           level: 1,
//           progress: "$progress",
//           timeSpent: {
//             $round: [
//               {
//                 $divide: [
//                   { $subtract: ["$lastAccessed", "$enrolledAt"] },
//                   1000 * 60 * 60, // Convert to hours
//                 ],
//               },
//               1,
//             ],
//           },
//         },
//       },
//     ]);

//     res.status(200).json({
//       success: true,
//       count: timelineEvents.length,
//       data: timelineEvents,
//     });
//   } catch (error) {
//     console.error("Error in getLearningTimeline:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error while fetching learning timeline",
//     });
//   }
// };

// // Helper functions
// function getNextLesson(course, completedLessonsIds) {
//   if (!course.lessons || course.lessons.length === 0) return null;

//   // Find first uncompleted lesson
//   const nextLesson = course.lessons.find(
//     (lesson) =>
//       !completedLessonsIds.some(
//         (clId) => clId._id.toString() === lesson._id.toString()
//       )
//   );

//   if (!nextLesson) return null;

//   return {
//     id: nextLesson._id.toString(),
//     title: nextLesson.title,
//     duration: nextLesson.duration || 0,
//     order: nextLesson.order || 0,
//     isPreview: nextLesson.isPreview || false,
//     estimatedTime: formatDuration(nextLesson.duration || 0),
//   };
// }

// function calculateEstimatedCompletionTime(
//   totalLessons,
//   completedCount,
//   totalHours
// ) {
//   const remainingLessons = totalLessons - completedCount;
//   if (remainingLessons <= 0) return null;

//   const avgTimePerLesson = totalHours / totalLessons;
//   const estimatedRemainingHours = remainingLessons * avgTimePerLesson;
//   const estimatedDays = Math.ceil(estimatedRemainingHours / 2); // Assuming 2 hours/day

//   return {
//     lessonsRemaining: remainingLessons,
//     hoursRemaining: Math.round(estimatedRemainingHours * 10) / 10,
//     daysEstimated: estimatedDays,
//     completionPace: "2 hours/day",
//   };
// }

// function getTimeRangeCondition(range) {
//   const now = new Date();
//   let matchCondition = {};

//   switch (range) {
//     case "30-days":
//       const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
//       matchCondition = { lastAccessed: { $gte: thirtyDaysAgo } };
//       break;
//     case "90-days":
//       const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
//       matchCondition = { lastAccessed: { $gte: ninetyDaysAgo } };
//       break;
//     case "all-time":
//     default:
//       matchCondition = {};
//   }

//   return matchCondition;
// }

// function generateRecommendationReason(course, userInterests) {
//   const reasons = [];

//   if (userInterests.categories.includes(course.category)) {
//     reasons.push("Matches your learning interests");
//   }

//   if (course.ratings.average >= 4.5) {
//     reasons.push("Highly rated by students");
//   }

//   if (course.studentsEnrolled >= 1000) {
//     reasons.push("Popular among learners");
//   }

//   if (course.updatedAt > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)) {
//     reasons.push("Recently updated content");
//   }

//   return reasons.length > 0
//     ? reasons[0]
//     : "Great next step in your learning journey";
// }

// function calculateSearchScore(text, searchTerm) {
//   const normalizedText = text.toLowerCase();
//   const normalizedTerm = searchTerm.toLowerCase();

//   let score = 0;

//   // Exact match
//   if (normalizedText.includes(normalizedTerm)) {
//     score += 100;
//   }

//   // Title/heading weight
//   if (normalizedText.startsWith(normalizedTerm)) {
//     score += 50;
//   }

//   // Word boundary matches
//   const words = normalizedText.split(/\s+/);
//   const termWords = normalizedTerm.split(/\s+/);
//   termWords.forEach((termWord) => {
//     words.forEach((word, index) => {
//       if (word.includes(termWord)) {
//         score += 20 - index * 2; // Higher score for earlier matches
//       }
//     });
//   });

//   // Partial matches
//   if (normalizedText.includes(normalizedTerm.split("")[0])) {
//     score += 10;
//   }

//   return Math.max(0, score);
// }

// function generateSearchSuggestions(searchTerm, enrolledCourses) {
//   const suggestions = [];

//   // Course title suggestions
//   enrolledCourses.forEach((course) => {
//     const titleWords = course.title.toLowerCase().split(/\s+/);
//     const searchWords = searchTerm.toLowerCase().split(/\s+/);

//     // If search term partially matches course title
//     if (
//       searchWords.every((word) =>
//         titleWords.some(
//           (titleWord) => titleWord.includes(word) || word.includes(titleWord)
//         )
//       )
//     ) {
//       suggestions.push({
//         type: "course",
//         title: course.title,
//         slug: course.slug,
//         category: course.category,
//       });
//     }
//   });

//   // Category suggestions
//   const uniqueCategories = [...new Set(enrolledCourses.map((c) => c.category))];
//   uniqueCategories.forEach((category) => {
//     if (category.toLowerCase().includes(searchTerm.toLowerCase())) {
//       suggestions.push({
//         type: "category",
//         title: `Courses in ${category}`,
//         category,
//       });
//     }
//   });

//   return suggestions.slice(0, 5);
// }

// function calculateAchievements(dailyActivity, enrollments) {
//   const achievements = [];
//   const today = new Date().toDateString();

//   // Streak achievements
//   const currentStreak = calculateCurrentStreak(dailyActivity);
//   if (currentStreak >= 7) {
//     achievements.push({
//       id: "7-day-streak",
//       title: "7-Day Learning Streak",
//       description: `Amazing! You've learned for ${currentStreak} consecutive days`,
//       icon: "flame",
//       earned: true,
//     });
//   }

//   if (currentStreak >= 30) {
//     achievements.push({
//       id: "30-day-streak",
//       title: "30-Day Learning Streak",
//       description: "You're on fire! 30 days of consistent learning",
//       icon: "fire",
//       earned: true,
//     });
//   }

//   // Completion achievements
//   const completedCount = enrollments.filter((e) => e.progress >= 100).length;
//   if (completedCount >= 1) {
//     achievements.push({
//       id: "first-completion",
//       title: "First Course Complete",
//       description: "Congratulations on completing your first course!",
//       icon: "trophy",
//       earned: true,
//     });
//   }

//   if (completedCount >= 5) {
//     achievements.push({
//       id: "5-courses",
//       title: "5 Courses Mastered",
//       description: "You've completed 5 courses - keep it up!",
//       icon: "award",
//       earned: true,
//     });
//   }

//   // Progress achievements
//   const totalProgress = enrollments.reduce((sum, e) => sum + e.progress, 0);
//   if (totalProgress >= 500) {
//     achievements.push({
//       id: "progress-master",
//       title: "Progress Master",
//       description: "500% total progress across all courses",
//       icon: "chart-line",
//       earned: true,
//     });
//   }

//   // Recent activity
//   const todayActivity = dailyActivity.find(
//     (day) => new Date(day.date).toDateString() === today
//   );

//   if (todayActivity && todayActivity.activities >= 3) {
//     achievements.push({
//       id: "daily-achiever",
//       title: "Daily Achiever",
//       description: "3+ hours of learning today",
//       icon: "sun",
//       earned: true,
//     });
//   }

//   return achievements;
// }

// function calculateCurrentStreak(dailyActivity) {
//   if (dailyActivity.length === 0) return 0;

//   const today = new Date();
//   let streak = 0;

//   for (let i = 0; i < dailyActivity.length; i++) {
//     const activityDate = new Date(dailyActivity[i].date);

//     // Check if consecutive days
//     const daysDiff = Math.floor((today - activityDate) / (1000 * 60 * 60 * 24));

//     if (daysDiff === streak) {
//       streak++;
//     } else {
//       break;
//     }
//   }

//   return streak;
// }

// module.exports = {
//   getEnrolledCourses,
//   getCourseLearningData,
//   updateLessonProgress,
//   getLearningProgress,
//   getLearningRecommendations,
//   getRecentCourses,
//   searchLearningContent,
//   getLearningStreaks,
//   getLearningTimeline,
// };

const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const Lesson = require("../models/Lesson");
const User = require("../models/User");
const mongoose = require("mongoose");
const {
  EnrollmentError,
  CourseAccessError,
  LearningProgressError,
} = require("../utils/errorResponse");

// @desc    Get user's enrolled courses with progress
// @route   GET /api/learn
// @access  Private
const getEnrolledCourses = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get user's enrollments with populated course data
    const enrollments = await Enrollment.find({ student: req.user.id })
      .populate({
        path: "course",
        match: { isPublished: true },
        populate: {
          path: "instructor",
          select: "name avatar bio expertise",
        },
        select:
          "title slug image price category level totalHours lecturesCount ratings studentsEnrolled description whatYoullLearn requirements publishedAt updatedAt",
      })
      .populate({
        path: "completedLessons",
        select: "_id title duration order",
        options: { limit: 5 },
      })
      .sort({ lastAccessed: -1 })
      .skip(skip)
      .limit(limit);

    // Filter out unpublished courses
    const validEnrollments = enrollments.filter(
      (enrollment) => enrollment.course
    );

    const courses = validEnrollments.map((enrollment) => {
      const course = enrollment.course;
      const completedCount = enrollment.completedLessons.length;
      const totalLessons = course.lecturesCount || 0;
      const progress =
        totalLessons > 0
          ? Math.round((completedCount / totalLessons) * 100)
          : 0;

      // Update progress if needed (in background)
      if (Math.abs(enrollment.progress - progress) > 1) {
        enrollment.progress = progress;
        enrollment.lastAccessed = new Date();
        enrollment.save().catch(console.error);
      }

      return {
        id: course._id.toString(),
        slug: course.slug,
        title: course.title,
        subtitle: course.description?.substring(0, 100) + "...",
        image: course.image || "/placeholder-course.svg",
        instructor: {
          id: course.instructor._id.toString(),
          name: course.instructor.name,
          avatar: course.instructor.avatar || "/placeholder-avatar.svg",
          bio: course.instructor.bio,
          expertise: course.instructor.expertise || [],
        },
        price: course.price,
        originalPrice: course.originalPrice || course.price,
        category: course.category,
        level: course.level,
        language: course.language || "English",
        ratings: course.ratings,
        studentsEnrolled: course.studentsEnrolled || 0,
        totalHours: course.totalHours || 0,
        totalLessons,
        completedLessons: completedCount,
        progress,
        lastAccessed: enrollment.lastAccessed,
        enrolledAt: enrollment.enrolledAt,
        rating: enrollment.rating,
        nextLesson: getNextLesson(course, enrollment.completedLessons),
        estimatedCompletionTime: calculateEstimatedCompletionTime(
          totalLessons,
          completedCount,
          course.totalHours
        ),
      };
    });

    // Get total count for pagination
    const totalEnrollments = await Enrollment.countDocuments({
      student: req.user.id,
      "course.isPublished": true,
    });

    res.status(200).json({
      success: true,
      count: courses.length,
      total: totalEnrollments,
      pagination: {
        current: page,
        pages: Math.ceil(totalEnrollments / limit),
        totalItems: totalEnrollments,
        hasNext: skip + limit < totalEnrollments,
        hasPrev: page > 1,
      },
      data: courses,
      overallProgress: Math.round(
        courses.reduce((sum, course) => sum + course.progress, 0) /
          Math.max(courses.length, 1)
      ),
    });
  } catch (error) {
    console.error("Error in getEnrolledCourses:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching enrolled courses",
    });
  }
};

const getCourseLearningData = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const userId = req.user.id;

    // Find course by slug with comprehensive data
    const course = await Course.findOne({
      slug,
      isPublished: true,
    })
      .populate(
        "instructor",
        "name avatar bio expertise responseTime officeHours socialLinks"
      )
      .populate({
        path: "lessons",
        select:
          "title description videoUrl duration order isPreview resources transcript quiz assignments",
        options: { sort: { order: 1 } },
        populate: [
          {
            path: "resources",
            select: "name url type size uploadedAt",
          },
          {
            path: "quiz",
            select: "title questions timeLimit passingScore",
          },
        ],
      })
      .populate({
        path: "sections",
        select: "title description order lessons",
        populate: {
          path: "lessons",
          select: "title duration order isPreview",
          options: { sort: { order: 1 } },
        },
      })
      .select("-__v");

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found or not published",
      });
    }

    // Check enrollment status with detailed progress
    const enrollment = await Enrollment.findOne({
      student: userId,
      course: course._id,
    })
      .populate({
        path: "completedLessons",
        select: "_id title duration order completedAt",
      })
      .populate({
        path: "notes",
        select: "lessonId content createdAt updatedAt",
      });

    // Calculate comprehensive progress data
    const totalLessons = course.lessons.length;
    const completedLessons = enrollment?.completedLessons || [];
    const completedCount = completedLessons.length;
    const currentProgress =
      totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    // Get next uncompleted lesson
    const nextLesson = course.lessons.find(
      (lesson) =>
        !completedLessons.some(
          (cl) => cl._id.toString() === lesson._id.toString()
        )
    );

    // Calculate time statistics
    const totalDuration = course.lessons.reduce(
      (sum, lesson) => sum + (lesson.duration || 0),
      0
    );
    const completedDuration = completedLessons.reduce(
      (sum, lesson) => sum + (lesson.duration || 0),
      0
    );
    const remainingDuration = totalDuration - completedDuration;

    // Get course ratings and reviews
    const reviews = await Review.find({ course: course._id })
      .populate("student", "name avatar")
      .sort({ createdAt: -1 })
      .limit(5)
      .select("rating comment createdAt student");

    // Check if user has reviewed this course
    const userReview = await Review.findOne({
      course: course._id,
      student: userId,
    });

    // Prepare sections with lesson data
    const sectionsWithProgress = course.sections.map((section) => {
      const sectionLessons = course.lessons.filter((lesson) =>
        section.lessons.some(
          (sl) => sl._id.toString() === lesson._id.toString()
        )
      );
      const completedSectionLessons = sectionLessons.filter((lesson) =>
        completedLessons.some(
          (cl) => cl._id.toString() === lesson._id.toString()
        )
      );
      const sectionProgress =
        sectionLessons.length > 0
          ? Math.round(
              (completedSectionLessons.length / sectionLessons.length) * 100
            )
          : 0;

      return {
        id: section._id.toString(),
        title: section.title,
        description: section.description,
        order: section.order,
        totalLessons: sectionLessons.length,
        completedLessons: completedSectionLessons.length,
        progress: sectionProgress,
        duration: sectionLessons.reduce(
          (sum, lesson) => sum + (lesson.duration || 0),
          0
        ),
        lessons: sectionLessons.map((lesson) => ({
          id: lesson._id.toString(),
          title: lesson.title,
          description: lesson.description,
          duration: lesson.duration || 0,
          order: lesson.order,
          isPreview: lesson.isPreview || false,
          isCompleted: completedLessons.some(
            (cl) => cl._id.toString() === lesson._id.toString()
          ),
          resources: lesson.resources || [],
          hasQuiz: !!lesson.quiz,
          hasAssignments: !!(
            lesson.assignments && lesson.assignments.length > 0
          ),
        })),
      };
    });

    // Prepare comprehensive response
    const courseData = {
      id: course._id.toString(),
      slug: course.slug,
      title: course.title,
      subtitle: course.description?.substring(0, 150) + "...",
      description: course.description,
      image: course.image || "/placeholder-course.svg",
      trailerVideo: course.trailerVideo,
      language: course.language || "English",
      category: course.category,
      subcategory: course.subcategory,
      level: course.level,
      price: course.price,
      originalPrice: course.originalPrice,
      discountInfo:
        course.originalPrice && course.originalPrice > course.price
          ? {
              discountPercentage: Math.round(
                ((course.originalPrice - course.price) / course.originalPrice) *
                  100
              ),
              savings: course.originalPrice - course.price,
            }
          : null,

      instructor: {
        id: course.instructor._id.toString(),
        name: course.instructor.name,
        avatar: course.instructor.avatar || "/placeholder-avatar.svg",
        bio: course.instructor.bio,
        expertise: course.instructor.expertise || [],
        responseTime: course.instructor.responseTime || "within 24 hours",
        officeHours: course.instructor.officeHours,
        socialLinks: course.instructor.socialLinks || {},
        rating: course.instructor.rating || { average: 0, count: 0 },
        totalStudents: course.instructor.totalStudents || 0,
      },

      // Course statistics
      statistics: {
        totalLessons,
        totalSections: course.sections.length,
        totalDuration,
        totalResources: course.lessons.reduce(
          (sum, lesson) => sum + (lesson.resources?.length || 0),
          0
        ),
        totalQuizzes: course.lessons.filter((lesson) => lesson.quiz).length,
        totalAssignments: course.lessons.reduce(
          (sum, lesson) => sum + (lesson.assignments?.length || 0),
          0
        ),
        lastUpdated: course.updatedAt,
      },

      // Learning progress
      progress: {
        overall: currentProgress,
        completedLessons: completedCount,
        remainingLessons: totalLessons - completedCount,
        completedDuration,
        remainingDuration,
        estimatedCompletion:
          remainingDuration > 0
            ? {
                hours: Math.ceil(remainingDuration / 60),
                days: Math.ceil(remainingDuration / (60 * 2)), // Assuming 2 hours per day
                pace: "2 hours per day",
              }
            : null,
        lastAccessed: enrollment?.lastAccessed,
        startedAt: enrollment?.enrolledAt,
      },

      // Course content
      sections: sectionsWithProgress,
      lessons: course.lessons.map((lesson) => ({
        id: lesson._id.toString(),
        title: lesson.title,
        description: lesson.description,
        videoUrl: lesson.videoUrl,
        duration: lesson.duration || 0,
        order: lesson.order,
        isPreview: lesson.isPreview || false,
        isCompleted: completedLessons.some(
          (cl) => cl._id.toString() === lesson._id.toString()
        ),
        resources: lesson.resources || [],
        transcript: lesson.transcript,
        quiz: lesson.quiz
          ? {
              id: lesson.quiz._id.toString(),
              title: lesson.quiz.title,
              questionCount: lesson.quiz.questions?.length || 0,
              timeLimit: lesson.quiz.timeLimit,
              passingScore: lesson.quiz.passingScore,
            }
          : null,
        assignments: lesson.assignments || [],
      })),

      // Enrollment information
      enrollment: enrollment
        ? {
            id: enrollment._id.toString(),
            progress: enrollment.progress,
            enrolledAt: enrollment.enrolledAt,
            lastAccessed: enrollment.lastAccessed,
            completedLessons: enrollment.completedLessons.map((lesson) => ({
              id: lesson._id.toString(),
              title: lesson.title,
              completedAt: lesson.completedAt,
            })),
            rating: enrollment.rating,
            notes:
              enrollment.notes?.map((note) => ({
                id: note._id.toString(),
                lessonId: note.lessonId,
                content: note.content,
                createdAt: note.createdAt,
              })) || [],
          }
        : null,

      // Course reviews
      reviews: {
        average: course.ratings.average || 0,
        count: course.ratings.count || 0,
        distribution: course.ratings.distribution || {
          5: 0,
          4: 0,
          3: 0,
          2: 0,
          1: 0,
        },
        recent: reviews.map((review) => ({
          id: review._id.toString(),
          rating: review.rating,
          comment: review.comment,
          createdAt: review.createdAt,
          student: {
            id: review.student._id.toString(),
            name: review.student.name,
            avatar: review.student.avatar,
          },
        })),
        userReview: userReview
          ? {
              id: userReview._id.toString(),
              rating: userReview.rating,
              comment: userReview.comment,
              createdAt: userReview.createdAt,
            }
          : null,
      },

      // Access information
      isEnrolled: !!enrollment,
      canAccessFullContent: !!enrollment,
      requiresEnrollment: !course.allowPreview,
      previewLessons: course.lessons
        .filter((lesson) => lesson.isPreview)
        .map((lesson) => ({
          id: lesson._id.toString(),
          title: lesson.title,
          description: lesson.description,
          duration: lesson.duration || 0,
          order: lesson.order,
        })),

      // Navigation
      nextLesson: nextLesson
        ? {
            id: nextLesson._id.toString(),
            title: nextLesson.title,
            order: nextLesson.order,
            section:
              sectionsWithProgress.find((section) =>
                section.lessons.some(
                  (lesson) => lesson.id === nextLesson._id.toString()
                )
              )?.title || "Introduction",
          }
        : null,

      courseCompleted: currentProgress >= 95, // 95% considered complete
      certificateEligible: currentProgress >= 90 && !!enrollment, // 90% for certificate
    };

    // Update last accessed time for enrolled users
    if (enrollment) {
      enrollment.lastAccessed = new Date();
      await enrollment.save();
    }

    res.status(200).json({
      success: true,
      data: courseData,
    });
  } catch (error) {
    console.error("Error in getCourseLearningData:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching course data",
    });
  }
};

const updateLessonProgress = async (req, res, next) => {
  try {
    const { lessonId, completed } = req.body;
    const { courseId } = req.params;

    // Validate input
    if (
      !mongoose.Types.ObjectId.isValid(courseId) ||
      !mongoose.Types.ObjectId.isValid(lessonId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid course or lesson ID",
      });
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // Find enrollment
    const enrollment = await Enrollment.findOne({
      student: req.user.id,
      course: courseId,
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found. You must be enrolled in this course.",
      });
    }

    // Verify lesson belongs to course
    const lesson = await Lesson.findOne({
      _id: lessonId,
      course: courseId,
    });

    if (!lesson) {
      return res.status(400).json({
        success: false,
        message: "Lesson not found or does not belong to this course",
      });
    }

    let wasCompleted = false;
    let actionTaken = false;

    if (completed) {
      // Mark as completed
      wasCompleted = enrollment.completedLessons.includes(lessonId);

      if (!wasCompleted) {
        enrollment.completedLessons.push(lessonId);
        actionTaken = true;

        // Add completion timestamp if needed
        await Lesson.findByIdAndUpdate(lessonId, {
          $set: { completedAt: new Date() },
        });
      }
    } else {
      // Mark as incomplete
      wasCompleted = enrollment.completedLessons.includes(lessonId);

      if (wasCompleted) {
        enrollment.completedLessons = enrollment.completedLessons.filter(
          (id) => id.toString() !== lessonId
        );
        actionTaken = true;

        // Remove completion timestamp
        await Lesson.findByIdAndUpdate(lessonId, {
          $unset: { completedAt: "" },
        });
      }
    }

    if (!actionTaken) {
      return res.status(200).json({
        success: true,
        message: "No change needed",
        data: {
          lessonId,
          completed,
          wasAlreadyCompleted: wasCompleted,
          actionTaken: false,
          progress: enrollment.progress,
        },
      });
    }

    // Recalculate progress
    const totalLessons = await Lesson.countDocuments({ course: courseId });
    const completedCount = enrollment.completedLessons.length;
    const newProgress =
      totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    // Update enrollment
    enrollment.progress = newProgress;
    enrollment.lastAccessed = new Date();
    await enrollment.save();

    // Populate completed lessons for response (limited)
    const populatedEnrollment = await Enrollment.findById(enrollment._id)
      .populate({
        path: "completedLessons",
        select: "_id title duration order",
        options: { limit: 3 },
      })
      .select("completedLessons progress");

    res.status(200).json({
      success: true,
      data: {
        enrollmentId: enrollment._id.toString(),
        lessonId,
        completed,
        wasAlreadyCompleted: wasCompleted,
        actionTaken,
        progress: newProgress,
        completedLessonsCount: enrollment.completedLessons.length,
        totalLessons,
        completedLessons: populatedEnrollment.completedLessons,
      },
    });
  } catch (error) {
    console.error("Error in updateLessonProgress:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating lesson progress",
    });
  }
};

// @desc    Get user's learning progress analytics
// @route   GET /api/learn/progress
// @access  Private
const getLearningProgress = async (req, res, next) => {
  try {
    const timeRange = req.query.range || "all-time";
    const matchCondition = getTimeRangeCondition(timeRange);

    const [enrollments, stats] = await Promise.all([
      // Get enrollments with course data
      Enrollment.aggregate([
        {
          $match: {
            student: req.user.id,
            ...matchCondition,
          },
        },
        {
          $lookup: {
            from: "courses",
            localField: "course",
            foreignField: "_id",
            as: "course",
            pipeline: [
              { $match: { isPublished: true } },
              {
                $project: {
                  title: 1,
                  slug: 1,
                  image: 1,
                  category: 1,
                  level: 1,
                  totalHours: 1,
                  price: 1,
                  ratings: 1,
                  studentsEnrolled: 1,
                },
              },
            ],
          },
        },
        {
          $unwind: { path: "$course", preserveNullAndEmptyArrays: true },
        },
        {
          $project: {
            courseId: "$course._id",
            courseTitle: "$course.title",
            courseSlug: "$course.slug",
            courseImage: "$course.image",
            category: "$course.category",
            level: "$course.level",
            totalHours: "$course.totalHours",
            enrolledAt: 1,
            lastAccessed: 1,
            progress: 1,
            completedLessons: { $size: "$completedLessons" },
            totalLessons: "$course.lecturesCount",
            isCompleted: { $eq: ["$progress", 100] },
            daysSinceEnrollment: {
              $divide: [
                { $subtract: ["$$NOW", "$enrolledAt"] },
                1000 * 60 * 60 * 24,
              ],
            },
            timeSpent: {
              $divide: [
                { $subtract: ["$lastAccessed", "$enrolledAt"] },
                1000 * 60 * 60,
              ],
            },
          },
        },
        { $sort: { lastAccessed: -1 } },
      ]),

      // Get learning statistics
      Enrollment.aggregate([
        {
          $match: {
            student: req.user.id,
            ...matchCondition,
          },
        },
        {
          $lookup: {
            from: "courses",
            localField: "course",
            foreignField: "_id",
            as: "course",
            pipeline: [{ $match: { isPublished: true } }],
          },
        },
        {
          $unwind: { path: "$course", preserveNullAndEmptyArrays: true },
        },
        {
          $group: {
            _id: null,
            totalEnrolled: { $sum: 1 },
            totalCompleted: {
              $sum: { $cond: [{ $eq: ["$progress", 100] }, 1, 0] },
            },
            totalInProgress: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $gt: ["$progress", 0] },
                      { $lt: ["$progress", 100] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            totalProgress: { $avg: "$progress" },
            totalHoursEnrolled: {
              $sum: {
                $multiply: [
                  "$progress",
                  { $divide: ["$course.totalHours", 100] },
                ],
              },
            },
            avgDaysToComplete: {
              $avg: {
                $cond: [
                  { $eq: ["$progress", 100] },
                  {
                    $divide: [
                      { $subtract: ["$updatedAt", "$enrolledAt"] },
                      1000 * 60 * 60 * 24,
                    ],
                  },
                  0,
                ],
              },
            },
            avgTimePerCourse: {
              $avg: {
                $divide: [
                  { $subtract: ["$lastAccessed", "$enrolledAt"] },
                  1000 * 60 * 60,
                ],
              },
            },
            categories: {
              $addToSet: "$course.category",
            },
            levels: {
              $addToSet: "$course.level",
            },
          },
        },
        {
          $project: {
            totalEnrolled: 1,
            totalCompleted: 1,
            totalInProgress: 1,
            completionRate: {
              $multiply: [
                {
                  $divide: ["$totalCompleted", "$totalEnrolled"],
                },
                100,
              ],
            },
            averageProgress: { $round: ["$totalProgress", 1] },
            totalHoursCompleted: { $round: ["$totalHoursEnrolled", 1] },
            avgDaysToComplete: { $round: ["$avgDaysToComplete", 1] },
            avgTimePerCourse: { $round: ["$avgTimePerCourse", 1] },
            categoryCount: { $size: "$categories" },
            levelCount: { $size: "$levels" },
            categories: "$categories",
            levels: "$levels",
          },
        },
      ]),
    ]);

    const analytics = {
      enrollments: enrollments,
      statistics: stats[0] || {
        totalEnrolled: 0,
        totalCompleted: 0,
        totalInProgress: 0,
        completionRate: 0,
        averageProgress: 0,
        totalHoursCompleted: 0,
        avgDaysToComplete: 0,
        avgTimePerCourse: 0,
        categoryCount: 0,
        levelCount: 0,
        categories: [],
        levels: [],
      },
      timeRange,
      summary: {
        activeCourses: enrollments.filter(
          (e) => e.progress > 0 && e.progress < 100
        ).length,
        recentlyActive: enrollments.filter(
          (e) =>
            new Date(e.lastAccessed) >
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        ).length,
        highCompletion: enrollments.filter((e) => e.progress >= 80).length,
      },
    };

    res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error("Error in getLearningProgress:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching learning progress",
    });
  }
};

// @desc    Get course recommendations for user
// @route   GET /api/learn/recommendations
// @access  Private
const getLearningRecommendations = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 12;
    const category = req.query.category;
    const level = req.query.level;

    // Get user's enrolled courses to understand interests
    const userEnrollments = await Enrollment.find({
      student: req.user.id,
      "course.isPublished": true,
    })
      .populate("course", "category level")
      .limit(10);

    const userInterests = {
      categories: [
        ...new Set(
          userEnrollments.map((e) => e.course?.category).filter(Boolean)
        ),
      ],
      levels: [
        ...new Set(userEnrollments.map((e) => e.course?.level).filter(Boolean)),
      ],
    };

    let matchCondition = {
      isPublished: true,
      _id: {
        $nin: userEnrollments.map((e) => e.course._id),
      },
    };

    // Filter by category if specified
    if (category) {
      matchCondition.category = category;
    } else if (userInterests.categories.length > 0) {
      matchCondition.category = { $in: userInterests.categories };
    }

    // Filter by level if specified
    if (level) {
      matchCondition.level = level;
    } else if (userInterests.levels.length > 0) {
      matchCondition.level = { $in: userInterests.levels };
    }

    // Get recommended courses
    const recommendations = await Course.find(matchCondition)
      .populate("instructor", "name avatar")
      .select(
        "title slug image price originalPrice ratings category level totalHours lecturesCount studentsEnrolled updatedAt"
      )
      .sort({
        "ratings.average": -1,
        studentsEnrolled: -1,
        updatedAt: -1,
      })
      .limit(limit);

    // Calculate discount info
    const coursesWithDiscounts = recommendations.map((course) => {
      let discountInfo = null;

      if (course.originalPrice && course.originalPrice > course.price) {
        const discountPercentage = Math.round(
          ((course.originalPrice - course.price) / course.originalPrice) * 100
        );
        discountInfo = {
          originalPrice: course.originalPrice,
          discountPercentage,
          savings: course.originalPrice - course.price,
        };
      }

      return {
        id: course._id.toString(),
        slug: course.slug,
        title: course.title,
        subtitle: course.description?.substring(0, 120) + "...",
        image: course.image || "/placeholder-course.svg",
        instructor: {
          id: course.instructor._id.toString(),
          name: course.instructor.name,
          avatar: course.instructor.avatar || "/placeholder-avatar.svg",
        },
        price: course.price,
        originalPrice: course.originalPrice,
        discountInfo,
        category: course.category,
        level: course.level,
        ratings: course.ratings,
        studentsEnrolled: course.studentsEnrolled || 0,
        totalHours: course.totalHours || 0,
        lecturesCount: course.lecturesCount || 0,
        lastUpdated: new Date(course.updatedAt).toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        }),
        whyRecommended: generateRecommendationReason(course, userInterests),
      };
    });

    res.status(200).json({
      success: true,
      count: coursesWithDiscounts.length,
      data: coursesWithDiscounts,
      interests: userInterests,
    });
  } catch (error) {
    console.error("Error in getLearningRecommendations:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching recommendations",
    });
  }
};

// @desc    Get user's recently viewed courses
// @route   GET /api/learn/recent
// @access  Private
const getRecentCourses = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 6;
    const days = parseInt(req.query.days) || 30;

    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const recentEnrollments = await Enrollment.find({
      student: req.user.id,
      lastAccessed: { $gte: cutoffDate },
    })
      .populate({
        path: "course",
        match: { isPublished: true },
        populate: { path: "instructor", select: "name avatar" },
        select: "title slug image price category level totalHours progress",
      })
      .sort({ lastAccessed: -1 })
      .limit(limit);

    const recentCourses = recentEnrollments
      .filter((e) => e.course)
      .map((enrollment) => ({
        id: enrollment.course._id.toString(),
        slug: enrollment.course.slug,
        title: enrollment.course.title,
        image: enrollment.course.image || "/placeholder-course.svg",
        instructor: {
          id: enrollment.course.instructor._id.toString(),
          name: enrollment.course.instructor.name,
          avatar:
            enrollment.course.instructor.avatar || "/placeholder-avatar.svg",
        },
        price: enrollment.course.price,
        category: enrollment.course.category,
        level: enrollment.course.level,
        totalHours: enrollment.course.totalHours || 0,
        progress: enrollment.progress,
        lastAccessed: enrollment.lastAccessed,
        daysAgo: Math.round(
          (Date.now() - new Date(enrollment.lastAccessed).getTime()) /
            (1000 * 60 * 60 * 24)
        ),
      }));

    res.status(200).json({
      success: true,
      count: recentCourses.length,
      data: recentCourses,
    });
  } catch (error) {
    console.error("Error in getRecentCourses:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching recent courses",
    });
  }
};

// @desc    Search user's learning content
// @route   GET /api/learn/search
// @access  Private
const searchLearningContent = async (req, res, next) => {
  try {
    const { q, type, category, level } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    if (!q || typeof q !== "string") {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const searchTerm = q.trim().toLowerCase();

    // Get user's enrolled courses for context
    const userEnrollments = await Enrollment.find({ student: req.user.id })
      .populate("course", "title description category level")
      .lean();

    const enrolledCourses = userEnrollments
      .filter((e) => e.course)
      .map((e) => e.course);

    let searchResults = [];

    // Search in enrolled courses first
    const enrolledMatches = enrolledCourses.filter(
      (course) =>
        course.title.toLowerCase().includes(searchTerm) ||
        (course.description &&
          course.description.toLowerCase().includes(searchTerm))
    );

    // If type is specified, filter accordingly
    if (type === "lessons") {
      // Search lessons within enrolled courses
      const lessonPromises = enrolledCourses.map(async (course) => {
        const lessons = await Lesson.find({
          course: course._id,
          $or: [
            { title: { $regex: searchTerm, $options: "i" } },
            { description: { $regex: searchTerm, $options: "i" } },
          ],
        })
          .select("title description duration order")
          .limit(5);

        return lessons.map((lesson) => ({
          type: "lesson",
          id: lesson._id.toString(),
          title: lesson.title,
          description: lesson.description || "",
          duration: lesson.duration || 0,
          course: {
            id: course._id.toString(),
            title: course.title,
            slug: course.slug,
          },
          matchType: "lesson",
          score: calculateSearchScore(
            lesson.title + " " + (lesson.description || ""),
            searchTerm
          ),
        }));
      });

      const allLessons = (await Promise.all(lessonPromises)).flat();
      searchResults = allLessons
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    } else {
      // Default search: courses and sections
      searchResults = enrolledMatches
        .map((course) => ({
          type: "course",
          id: course._id.toString(),
          title: course.title,
          description: course.description || "",
          category: course.category,
          level: course.level,
          progress:
            userEnrollments.find(
              (e) => e.course._id.toString() === course._id.toString()
            )?.progress || 0,
          matchType: "course",
          score: calculateSearchScore(
            course.title + " " + course.description,
            searchTerm
          ),
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    }

    // Add search suggestions
    const suggestions = generateSearchSuggestions(searchTerm, enrolledCourses);

    res.status(200).json({
      success: true,
      count: searchResults.length,
      suggestions,
      data: searchResults,
      searchTerm,
      type: type || "all",
    });
  } catch (error) {
    console.error("Error in searchLearningContent:", error);
    res.status(500).json({
      success: false,
      message: "Server error while searching learning content",
    });
  }
};

// @desc    Get learning streaks and achievements
// @route   GET /api/learn/streaks
// @access  Private
const getLearningStreaks = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 30;

    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Get daily activity
    const dailyActivity = await Enrollment.aggregate([
      {
        $match: {
          student: req.user.id,
          lastAccessed: { $gte: cutoffDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$lastAccessed" },
            month: { $month: "$lastAccessed" },
            day: { $dayOfMonth: "$lastAccessed" },
          },
          date: { $first: "$lastAccessed" },
          activities: {
            $sum: 1,
          },
          courses: {
            $addToSet: "$course",
          },
        },
      },
      {
        $sort: { date: 1 },
      },
      {
        $project: {
          _id: 0,
          date: 1,
          activities: 1,
          uniqueCourses: { $size: "$courses" },
          streakDay: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$date",
            },
          },
        },
      },
    ]);

    // Calculate current streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let currentStreak = 0;
    let maxStreak = 0;
    let longestStreakStart = null;
    let currentStreakStart = null;

    const dailyMap = new Map();
    dailyActivity.forEach((day) => {
      dailyMap.set(day.streakDay, day);
    });

    // Check consecutive days
    for (let i = 0; i < days; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateKey = checkDate.toISOString().split("T")[0];

      const hasActivity = dailyMap.has(dateKey);

      if (hasActivity) {
        currentStreak++;
        if (!currentStreakStart) {
          currentStreakStart = dateKey;
        }

        if (currentStreak > maxStreak) {
          maxStreak = currentStreak;
          longestStreakStart = dateKey;
        }
      } else {
        currentStreak = 0;
        currentStreakStart = null;
      }
    }

    // Get achievements
    const achievements = calculateAchievements(dailyActivity, userEnrollments);

    const streaksData = {
      currentStreak,
      maxStreak,
      currentStreakStart,
      longestStreakStart,
      dailyActivity: dailyActivity.map((day) => ({
        date: day.date,
        activities: day.activities,
        uniqueCourses: day.uniqueCourses,
        streakDay: day.streakDay,
      })),
      achievements,
      totalDaysAnalyzed: days,
    };

    res.status(200).json({
      success: true,
      data: streaksData,
    });
  } catch (error) {
    console.error("Error in getLearningStreaks:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching learning streaks",
    });
  }
};

// @desc    Get user's learning timeline
// @route   GET /api/learn/timeline
// @access  Private
const getLearningTimeline = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const since = req.query.since ? new Date(req.query.since) : undefined;

    const matchCondition = since ? { lastAccessed: { $gte: since } } : {};

    const timelineEvents = await Enrollment.aggregate([
      {
        $match: {
          student: req.user.id,
          ...matchCondition,
        },
      },
      {
        $lookup: {
          from: "courses",
          localField: "course",
          foreignField: "_id",
          as: "course",
          pipeline: [
            { $match: { isPublished: true } },
            {
              $project: {
                title: 1,
                slug: 1,
                image: 1,
                instructor: 1,
                category: 1,
                level: 1,
              },
            },
          ],
        },
      },
      {
        $unwind: { path: "$course", preserveNullAndEmptyArrays: true },
      },
      {
        $addFields: {
          eventType: {
            $cond: [
              { $eq: ["$progress", 100] },
              "completed",
              { $cond: [{ $gt: ["$progress", 0] }, "in_progress", "enrolled"] },
            ],
          },
          eventDate: "$lastAccessed",
          courseTitle: "$course.title",
          courseSlug: "$course.slug",
          courseImage: "$course.image",
          instructorName: "$course.instructor.name",
          category: "$course.category",
          level: "$course.level",
          progress: 1,
        },
      },
      {
        $sort: { eventDate: -1 },
      },
      {
        $limit: limit,
      },
      {
        $project: {
          _id: 0,
          eventType: 1,
          eventDate: 1,
          courseTitle: 1,
          courseSlug: 1,
          courseImage: 1,
          instructorName: 1,
          category: 1,
          level: 1,
          progress: "$progress",
          timeSpent: {
            $round: [
              {
                $divide: [
                  { $subtract: ["$lastAccessed", "$enrolledAt"] },
                  1000 * 60 * 60,
                ],
              },
              1,
            ],
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      count: timelineEvents.length,
      data: timelineEvents,
    });
  } catch (error) {
    console.error("Error in getLearningTimeline:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching learning timeline",
    });
  }
};

// Helper functions
function getNextLesson(course, completedLessonsIds) {
  if (!course.lessons || course.lessons.length === 0) return null;

  // Find first uncompleted lesson
  const nextLesson = course.lessons.find(
    (lesson) =>
      !completedLessonsIds.some(
        (clId) => clId._id.toString() === lesson._id.toString()
      )
  );

  if (!nextLesson) return null;

  return {
    id: nextLesson._id.toString(),
    title: nextLesson.title,
    duration: nextLesson.duration || 0,
    order: nextLesson.order || 0,
    isPreview: nextLesson.isPreview || false,
    estimatedTime: formatDuration(nextLesson.duration || 0),
  };
}

function calculateEstimatedCompletionTime(
  totalLessons,
  completedCount,
  totalHours
) {
  const remainingLessons = totalLessons - completedCount;
  if (remainingLessons <= 0) return null;

  const avgTimePerLesson = totalHours / totalLessons;
  const estimatedRemainingHours = remainingLessons * avgTimePerLesson;
  const estimatedDays = Math.ceil(estimatedRemainingHours / 2); // Assuming 2 hours/day

  return {
    lessonsRemaining: remainingLessons,
    hoursRemaining: Math.round(estimatedRemainingHours * 10) / 10,
    daysEstimated: estimatedDays,
    completionPace: "2 hours/day",
  };
}

function formatDuration(minutes) {
  if (!minutes) return "0 min";

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0) {
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }
  return `${mins}m`;
}

function getTimeRangeCondition(range) {
  const now = new Date();
  let matchCondition = {};

  switch (range) {
    case "30-days":
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      matchCondition = { lastAccessed: { $gte: thirtyDaysAgo } };
      break;
    case "90-days":
      const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      matchCondition = { lastAccessed: { $gte: ninetyDaysAgo } };
      break;
    case "all-time":
    default:
      matchCondition = {};
  }

  return matchCondition;
}

function generateRecommendationReason(course, userInterests) {
  const reasons = [];

  if (userInterests.categories.includes(course.category)) {
    reasons.push("Matches your learning interests");
  }

  if (course.ratings.average >= 4.5) {
    reasons.push("Highly rated by students");
  }

  if (course.studentsEnrolled >= 1000) {
    reasons.push("Popular among learners");
  }

  if (course.updatedAt > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)) {
    reasons.push("Recently updated content");
  }

  return reasons.length > 0
    ? reasons[0]
    : "Great next step in your learning journey";
}

function calculateSearchScore(text, searchTerm) {
  const normalizedText = text.toLowerCase();
  const normalizedTerm = searchTerm.toLowerCase();

  let score = 0;

  // Exact match
  if (normalizedText.includes(normalizedTerm)) {
    score += 100;
  }

  // Title/heading weight
  if (normalizedText.startsWith(normalizedTerm)) {
    score += 50;
  }

  // Word boundary matches
  const words = normalizedText.split(/\s+/);
  const termWords = normalizedTerm.split(/\s+/);
  termWords.forEach((termWord) => {
    words.forEach((word, index) => {
      if (word.includes(termWord)) {
        score += 20 - index * 2; // Higher score for earlier matches
      }
    });
  });

  // Partial matches
  if (normalizedText.includes(normalizedTerm.split("")[0])) {
    score += 10;
  }

  return Math.max(0, score);
}

function generateSearchSuggestions(searchTerm, enrolledCourses) {
  const suggestions = [];

  // Course title suggestions
  enrolledCourses.forEach((course) => {
    const titleWords = course.title.toLowerCase().split(/\s+/);
    const searchWords = searchTerm.toLowerCase().split(/\s+/);

    // If search term partially matches course title
    if (
      searchWords.every((word) =>
        titleWords.some(
          (titleWord) => titleWord.includes(word) || word.includes(titleWord)
        )
      )
    ) {
      suggestions.push({
        type: "course",
        title: course.title,
        slug: course.slug,
        category: course.category,
      });
    }
  });

  // Category suggestions
  const uniqueCategories = [...new Set(enrolledCourses.map((c) => c.category))];
  uniqueCategories.forEach((category) => {
    if (category.toLowerCase().includes(searchTerm.toLowerCase())) {
      suggestions.push({
        type: "category",
        title: `Courses in ${category}`,
        category,
      });
    }
  });

  return suggestions.slice(0, 5);
}

function calculateAchievements(dailyActivity, enrollments) {
  const achievements = [];
  const today = new Date().toDateString();

  // Streak achievements
  const currentStreak = calculateCurrentStreak(dailyActivity);
  if (currentStreak >= 7) {
    achievements.push({
      id: "7-day-streak",
      title: "7-Day Learning Streak",
      description: `Amazing! You've learned for ${currentStreak} consecutive days`,
      icon: "flame",
      earned: true,
    });
  }

  if (currentStreak >= 30) {
    achievements.push({
      id: "30-day-streak",
      title: "30-Day Learning Streak",
      description: "You're on fire! 30 days of consistent learning",
      icon: "fire",
      earned: true,
    });
  }

  // Completion achievements
  const completedCount = enrollments.filter((e) => e.progress >= 100).length;
  if (completedCount >= 1) {
    achievements.push({
      id: "first-completion",
      title: "First Course Complete",
      description: "Congratulations on completing your first course!",
      icon: "trophy",
      earned: true,
    });
  }

  if (completedCount >= 5) {
    achievements.push({
      id: "5-courses",
      title: "5 Courses Mastered",
      description: "You've completed 5 courses - keep it up!",
      icon: "award",
      earned: true,
    });
  }

  // Progress achievements
  const totalProgress = enrollments.reduce((sum, e) => sum + e.progress, 0);
  if (totalProgress >= 500) {
    achievements.push({
      id: "progress-master",
      title: "Progress Master",
      description: "500% total progress across all courses",
      icon: "chart-line",
      earned: true,
    });
  }

  // Recent activity
  const todayActivity = dailyActivity.find(
    (day) => new Date(day.date).toDateString() === today
  );

  if (todayActivity && todayActivity.activities >= 3) {
    achievements.push({
      id: "daily-achiever",
      title: "Daily Achiever",
      description: "3+ hours of learning today",
      icon: "sun",
      earned: true,
    });
  }

  return achievements;
}

function calculateCurrentStreak(dailyActivity) {
  if (dailyActivity.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = 0;
  let currentDate = new Date(today);

  // Sort activities by date descending
  const sortedActivities = [...dailyActivity].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  for (let i = 0; i < sortedActivities.length; i++) {
    const activityDate = new Date(sortedActivities[i].date);
    activityDate.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor(
      (currentDate - activityDate) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff === 0) {
      // Activity today
      streak++;
      currentDate = new Date(activityDate);
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (daysDiff === 1) {
      // Activity yesterday (consecutive)
      streak++;
      currentDate = new Date(activityDate);
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      // Gap in activity, break the streak
      break;
    }
  }

  return streak;
}

// Fix the missing userEnrollments parameter in getLearningStreaks
const getLearningStreaksFixed = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 30;

    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Get user enrollments for achievements calculation
    const userEnrollments = await Enrollment.find({
      student: req.user.id,
    }).populate("course");

    // Get daily activity
    const dailyActivity = await Enrollment.aggregate([
      {
        $match: {
          student: req.user.id,
          lastAccessed: { $gte: cutoffDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$lastAccessed" },
            month: { $month: "$lastAccessed" },
            day: { $dayOfMonth: "$lastAccessed" },
          },
          date: { $first: "$lastAccessed" },
          activities: {
            $sum: 1,
          },
          courses: {
            $addToSet: "$course",
          },
        },
      },
      {
        $sort: { date: 1 },
      },
      {
        $project: {
          _id: 0,
          date: 1,
          activities: 1,
          uniqueCourses: { $size: "$courses" },
          streakDay: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$date",
            },
          },
        },
      },
    ]);

    // Calculate current streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let currentStreak = 0;
    let maxStreak = 0;
    let longestStreakStart = null;
    let currentStreakStart = null;

    const dailyMap = new Map();
    dailyActivity.forEach((day) => {
      dailyMap.set(day.streakDay, day);
    });

    // Check consecutive days
    for (let i = 0; i < days; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateKey = checkDate.toISOString().split("T")[0];

      const hasActivity = dailyMap.has(dateKey);

      if (hasActivity) {
        currentStreak++;
        if (!currentStreakStart) {
          currentStreakStart = dateKey;
        }

        if (currentStreak > maxStreak) {
          maxStreak = currentStreak;
          longestStreakStart = dateKey;
        }
      } else {
        currentStreak = 0;
        currentStreakStart = null;
      }
    }

    // Get achievements with proper parameters
    const achievements = calculateAchievements(dailyActivity, userEnrollments);

    const streaksData = {
      currentStreak,
      maxStreak,
      currentStreakStart,
      longestStreakStart,
      dailyActivity: dailyActivity.map((day) => ({
        date: day.date,
        activities: day.activities,
        uniqueCourses: day.uniqueCourses,
        streakDay: day.streakDay,
      })),
      achievements,
      totalDaysAnalyzed: days,
    };

    res.status(200).json({
      success: true,
      data: streaksData,
    });
  } catch (error) {
    console.error("Error in getLearningStreaks:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching learning streaks",
    });
  }
};

// Export all functions
module.exports = {
  getEnrolledCourses,
  getCourseLearningData,
  updateLessonProgress,
  getLearningProgress,
  getLearningRecommendations,
  getRecentCourses,
  searchLearningContent,
  getLearningStreaks: getLearningStreaksFixed, // Use the fixed version
  getLearningTimeline,
};
