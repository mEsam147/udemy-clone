// // // // // // // const express = require("express");
// // // // // // // const {
// // // // // // //   getCourses,
// // // // // // //   getCourse,
// // // // // // //   createCourse,
// // // // // // //   updateCourse,
// // // // // // //   deleteCourse,
// // // // // // //   getCourseLessons,
// // // // // // //   addLesson,
// // // // // // //   updateLesson,
// // // // // // //   deleteLesson,
// // // // // // //   enrollCourse,
// // // // // // //   getEnrolledCourses,
// // // // // // //   getCourseProgress,
// // // // // // //   updateProgress,
// // // // // // //   addReview,
// // // // // // //   searchCourses,
// // // // // // //   getCategories,
// // // // // // //   getVideoUrl,
// // // // // // //   getCourseReviews,
// // // // // // //   checkEnrollment,
// // // // // // //   addToWishlist,
// // // // // // //   removeFromWishlist,
// // // // // // //   getWishlistStatus,
// // // // // // //   getWishlist,
// // // // // // //   updateInstructorApplication,
// // // // // // //   getInstructorApplications,
// // // // // // // } = require("../controllers/courseController");
// // // // // // // const { protect, restrictTo } = require("../middlewares/authMiddleware");
// // // // // // // const { becomeInstructor } = require("../controllers/authController");
// // // // // // // const uploadVideo = require("../middlewares/uploadVideo");

// // // // // // // const router = express.Router();

// // // // // // // // Public routes
// // // // // // // router.get("/", getCourses);
// // // // // // // router.get("/search", searchCourses);
// // // // // // // router.get("/categories", getCategories);
// // // // // // // router.get("/:slug", getCourse);
// // // // // // // router.get("/:id/lessons", getCourseLessons);
// // // // // // // router.get("/:id/reviews", getCourseReviews);

// // // // // // // // Admin routes
// // // // // // // router.post("/", protect, restrictTo("admin"), createCourse);

// // // // // // // router.get("/:id/lessons/:lessonId/video-url", protect, getVideoUrl);
// // // // // // // // Protected routes
// // // // // // // router.use(protect);

// // // // // // // // Enrollment routes
// // // // // // // router.get("/:id/enrolled", checkEnrollment);
// // // // // // // router.post("/:id/enroll", enrollCourse);
// // // // // // // router.get("/user/enrolled", getEnrolledCourses);
// // // // // // // router.get("/:id/progress", getCourseProgress);
// // // // // // // router.put("/:id/progress", updateProgress);

// // // // // // // router.post("/:id/wishlist", addToWishlist);
// // // // // // // router.delete("/:id/wishlist", removeFromWishlist);
// // // // // // // router.get("/:id/wishlist-status", getWishlistStatus);
// // // // // // // router.get("/wishlist", getWishlist);

// // // // // // // router.get("/search", protect, searchCourses);

// // // // // // // router.get(
// // // // // // //   "/instructor/my-courses",
// // // // // // //   restrictTo("instructor"),
// // // // // // //   becomeInstructor
// // // // // // // );

// // // // // // // router.get(
// // // // // // //   "/applications",
// // // // // // //   protect,
// // // // // // //   restrictTo("admin"),
// // // // // // //   getInstructorApplications
// // // // // // // );
// // // // // // // router.put(
// // // // // // //   "/applications/:userId",
// // // // // // //   protect,
// // // // // // //   restrictTo("admin"),
// // // // // // //   updateInstructorApplication
// // // // // // // );

// // // // // // // router.post("/:id/review", addReview);

// // // // // // // // Instructor routes
// // // // // // // // router.post('/', restrictTo('instructor', 'admin'), createCourse);
// // // // // // // router.put("/:id", restrictTo("instructor", "admin"), updateCourse);
// // // // // // // router.delete("/:id", restrictTo("instructor", "admin"), deleteCourse);
// // // // // // // router.post(
// // // // // // //   "/:id/lessons",
// // // // // // //   restrictTo("instructor", "admin"),
// // // // // // //   uploadVideo.single("video"), // Add middleware here
// // // // // // //   addLesson
// // // // // // // );

// // // // // // // router.put(
// // // // // // //   "/:id/lessons/:lessonId",
// // // // // // //   restrictTo("instructor", "admin"),
// // // // // // //   uploadVideo.single("video"), // Add middleware here
// // // // // // //   updateLesson
// // // // // // // );
// // // // // // // router.delete(
// // // // // // //   "/:id/lessons/:lessonId",
// // // // // // //   restrictTo("instructor", "admin"),
// // // // // // //   deleteLesson
// // // // // // // );

// // // // // // // module.exports = router;

// // // // // // const express = require("express");
// // // // // // const {
// // // // // //   getCourses,
// // // // // //   getCourse,
// // // // // //   createCourse,
// // // // // //   updateCourse,
// // // // // //   deleteCourse,
// // // // // //   getCourseLessons,
// // // // // //   addLesson,
// // // // // //   updateLesson,
// // // // // //   deleteLesson,
// // // // // //   enrollCourse,
// // // // // //   getEnrolledCourses,
// // // // // //   getCourseProgress,
// // // // // //   updateProgress,
// // // // // //   addReview,
// // // // // //   searchCourses,
// // // // // //   getCategories,
// // // // // //   getVideoUrl,
// // // // // //   getCourseReviews,
// // // // // //   checkEnrollment,
// // // // // //   addToWishlist,
// // // // // //   removeFromWishlist,
// // // // // //   getWishlistStatus,
// // // // // //   getWishlist,
// // // // // //   updateInstructorApplication,
// // // // // //   getInstructorApplications,
// // // // // //   createCourseWithLessons, // Add this new function
// // // // // // } = require("../controllers/courseController");
// // // // // // const { protect, restrictTo } = require("../middlewares/authMiddleware");
// // // // // // const { becomeInstructor } = require("../controllers/authController");
// // // // // // const uploadVideo = require("../middlewares/uploadVideo");
// // // // // // const uploadImage = require("../middlewares/uploadImage");

// // // // // // const router = express.Router();

// // // // // // // Public routes
// // // // // // router.get("/", getCourses);
// // // // // // router.get("/search", searchCourses);
// // // // // // router.get("/categories", getCategories);
// // // // // // router.get("/:slug", getCourse);
// // // // // // router.get("/:id/lessons", getCourseLessons);
// // // // // // router.get("/:id/reviews", getCourseReviews);

// // // // // // // Update the create course route to handle file uploads
// // // // // // router.post(
// // // // // //   "/",
// // // // // //   protect,
// // // // // //   restrictTo("instructor", "admin"),
// // // // // //   // restrictTo("instructor"),
// // // // // //   uploadImage.single("image"), // Handle course image upload
// // // // // //   createCourse // Use the new function
// // // // // // );

// // // // // // // ... rest of your routes remain the same

// // // // // // router.get("/:id/lessons/:lessonId/video-url", protect, getVideoUrl);

// // // // // // // Protected routes
// // // // // // router.use(protect);

// // // // // // // Enrollment routes
// // // // // // router.get("/:id/enrolled", checkEnrollment);
// // // // // // router.post("/:id/enroll", enrollCourse);
// // // // // // router.get("/user/enrolled", getEnrolledCourses);
// // // // // // router.get("/:id/progress", getCourseProgress);
// // // // // // router.put("/:id/progress", updateProgress);

// // // // // // router.post("/:id/wishlist", addToWishlist);
// // // // // // router.delete("/:id/wishlist", removeFromWishlist);
// // // // // // router.get("/:id/wishlist-status", getWishlistStatus);
// // // // // // router.get("/wishlist", getWishlist);

// // // // // // router.get("/search", protect, searchCourses);

// // // // // // router.get(
// // // // // //   "/instructor/my-courses",
// // // // // //   restrictTo("instructor"),
// // // // // //   becomeInstructor
// // // // // // );

// // // // // // router.get(
// // // // // //   "/applications",
// // // // // //   protect,
// // // // // //   restrictTo("admin"),
// // // // // //   getInstructorApplications
// // // // // // );
// // // // // // router.put(
// // // // // //   "/applications/:userId",
// // // // // //   protect,
// // // // // //   restrictTo("admin"),
// // // // // //   updateInstructorApplication
// // // // // // );

// // // // // // router.post("/:id/review", addReview);

// // // // // // // Instructor routes
// // // // // // router.put("/:id", restrictTo("instructor", "admin"), updateCourse);
// // // // // // router.delete("/:id", restrictTo("instructor", "admin"), deleteCourse);

// // // // // // // Lesson routes - update to handle video uploads
// // // // // // router.post(
// // // // // //   "/:id/lessons",
// // // // // //   restrictTo("instructor", "admin"),
// // // // // //   uploadVideo.single("video"),
// // // // // //   addLesson
// // // // // // );
// // // // // // router.put(
// // // // // //   "/:id/lessons/:lessonId",
// // // // // //   restrictTo("instructor", "admin"),
// // // // // //   uploadVideo.single("video"),
// // // // // //   updateLesson
// // // // // // );
// // // // // // router.delete(
// // // // // //   "/:id/lessons/:lessonId",
// // // // // //   restrictTo("instructor", "admin"),
// // // // // //   deleteLesson
// // // // // // );

// // // // // // module.exports = router;

// // // // // const express = require("express");
// // // // // const {
// // // // //   getCourses,
// // // // //   getCourse,
// // // // //   createCourseWithLessons,
// // // // //   updateCourse,
// // // // //   deleteCourse,
// // // // //   getCourseLessons,
// // // // //   addLesson,
// // // // //   updateLesson,
// // // // //   deleteLesson,
// // // // //   enrollCourse,
// // // // //   getEnrolledCourses,
// // // // //   getCourseProgress,
// // // // //   updateProgress,
// // // // //   addReview,
// // // // //   searchCourses,
// // // // //   getCategories,
// // // // //   getVideoUrl,
// // // // //   getCourseReviews,
// // // // //   checkEnrollment,
// // // // //   addToWishlist,
// // // // //   removeFromWishlist,
// // // // //   getWishlistStatus,
// // // // //   getWishlist,
// // // // //   updateInstructorApplication,
// // // // //   getInstructorApplications,
// // // // //   getInstructorCourses, // Added for instructor's courses
// // // // // } = require("../controllers/courseController");
// // // // // const { protect, restrictTo } = require("../middlewares/authMiddleware");
// // // // // const { becomeInstructor } = require("../controllers/authController");
// // // // // const multer = require("multer");
// // // // // const { generalStorage } = require("../config/cloudinary");

// // // // // const router = express.Router();

// // // // // // Unified multer middleware for images and videos
// // // // // const uploadGeneral = multer({
// // // // //   storage: generalStorage,
// // // // //   fileFilter: (req, file, cb) => {
// // // // //     if (
// // // // //       file.fieldname === "image" &&
// // // // //       !file.originalname.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i)
// // // // //     ) {
// // // // //       return cb(
// // // // //         new Error("Only image files are allowed for course image!"),
// // // // //         false
// // // // //       );
// // // // //     } else if (
// // // // //       file.fieldname === "video" &&
// // // // //       !file.originalname.match(/\.(mp4|mov|avi|wmv|flv|mkv|webm)$/i)
// // // // //     ) {
// // // // //       return cb(new Error("Only video files are allowed for lessons!"), false);
// // // // //     } else if (
// // // // //       file.fieldname === "lessonVideos[]" &&
// // // // //       !file.originalname.match(/\.(mp4|mov|avi|wmv|flv|mkv|webm)$/i)
// // // // //     ) {
// // // // //       return cb(
// // // // //         new Error("Only video files are allowed for lesson videos!"),
// // // // //         false
// // // // //       );
// // // // //     }
// // // // //     cb(null, true);
// // // // //   },
// // // // //   limits: { fileSize: 500 * 1024 * 1024 }, // 500MB limit
// // // // // });

// // // // // // Public routes
// // // // // router.get("/", getCourses);
// // // // // router.get("/categories", getCategories);
// // // // // router.get("/:slug", getCourse);
// // // // // router.get("/:id/lessons", getCourseLessons);
// // // // // router.get("/:id/reviews", getCourseReviews);

// // // // // // Unified search route (handles both public and protected access)
// // // // // router.get("/search", (req, res, next) => {
// // // // //   if (req.headers.authorization || req.cookies.token) {
// // // // //     return protect(req, res, () => searchCourses(req, res, next));
// // // // //   }
// // // // //   return searchCourses(req, res, next);
// // // // // });

// // // // // // Course creation with image and lesson videos
// // // // // router.post(
// // // // //   "/",
// // // // //   protect,
// // // // //   restrictTo("instructor", "admin"),
// // // // //   uploadGeneral.fields([
// // // // //     { name: "image", maxCount: 1 },
// // // // //     { name: "lessonVideos[]", maxCount: 20 },
// // // // //   ]),
// // // // //   createCourseWithLessons
// // // // // );

// // // // // // Protected routes
// // // // // router.use(protect);

// // // // // router.get("/:id/lessons/:lessonId/video-url", getVideoUrl);
// // // // // router.get("/:id/enrolled", checkEnrollment);
// // // // // router.post("/:id/enroll", enrollCourse);
// // // // // router.get("/user/enrolled", getEnrolledCourses);
// // // // // router.get("/:id/progress", getCourseProgress);
// // // // // router.put("/:id/progress", updateProgress);
// // // // // router.post("/:id/wishlist", addToWishlist);
// // // // // router.delete("/:id/wishlist", removeFromWishlist);
// // // // // router.get("/:id/wishlist-status", getWishlistStatus);
// // // // // router.get("/wishlist", getWishlist);
// // // // // router.post("/:id/review", addReview);

// // // // // // Instructor routes
// // // // // router.get(
// // // // //   "/instructor/my-courses",
// // // // //   restrictTo("instructor"),
// // // // //   getInstructorCourses
// // // // // ); // Fixed controller
// // // // // router.put("/:id", restrictTo("instructor", "admin"), updateCourse);
// // // // // router.delete("/:id", restrictTo("instructor", "admin"), deleteCourse);
// // // // // router.post(
// // // // //   "/:id/lessons",
// // // // //   restrictTo("instructor", "admin"),
// // // // //   uploadGeneral.single("video"),
// // // // //   addLesson
// // // // // );
// // // // // router.put(
// // // // //   "/:id/lessons/:lessonId",
// // // // //   restrictTo("instructor", "admin"),
// // // // //   uploadGeneral.single("video"),
// // // // //   updateLesson
// // // // // );
// // // // // router.delete(
// // // // //   "/:id/lessons/:lessonId",
// // // // //   restrictTo("instructor", "admin"),
// // // // //   deleteLesson
// // // // // );

// // // // // // Admin routes
// // // // // router.get(
// // // // //   "/applications",
// // // // //   protect,
// // // // //   restrictTo("admin"),
// // // // //   getInstructorApplications
// // // // // );
// // // // // router.put(
// // // // //   "/applications/:userId",
// // // // //   protect,
// // // // //   restrictTo("admin"),
// // // // //   updateInstructorApplication
// // // // // );

// // // // // // Instructor application (optional, if needed)
// // // // // router.get("/instructor/apply", protect, becomeInstructor);

// // // // // module.exports = router;

// // // // // routes/courseRoutes.js (or wherever your routes are defined)

// // // // const express = require("express");
// // // // const {
// // // //   getCourses,
// // // //   getCourse,
// // // //   createCourseWithLessons,
// // // //   updateCourse,
// // // //   deleteCourse,
// // // //   getCourseLessons,
// // // //   addLesson,
// // // //   updateLesson,
// // // //   deleteLesson,
// // // //   enrollCourse,
// // // //   getEnrolledCourses,
// // // //   getCourseProgress,
// // // //   updateProgress,
// // // //   addReview,
// // // //   searchCourses,
// // // //   getCategories,
// // // //   getVideoUrl,
// // // //   getCourseReviews,
// // // //   checkEnrollment,
// // // //   addToWishlist,
// // // //   removeFromWishlist,
// // // //   getWishlistStatus,
// // // //   getWishlist,
// // // //   updateInstructorApplication,
// // // //   getInstructorApplications,
// // // //   getInstructorCourses,
// // // // } = require("../controllers/courseController");
// // // // const { protect, restrictTo } = require("../middlewares/authMiddleware");
// // // // const { becomeInstructor } = require("../controllers/authController");
// // // // const multer = require("multer");
// // // // const { generalStorage } = require("../config/cloudinary"); // Import generalStorage

// // // // const router = express.Router();

// // // // // Unified multer middleware instance using generalStorage
// // // // const upload = multer({
// // // //   storage: generalStorage,
// // // //   fileFilter: (req, file, cb) => {
// // // //     if (
// // // //       file.fieldname === "image" &&
// // // //       !file.originalname.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i)
// // // //     ) {
// // // //       return cb(
// // // //         new Error("Only image files are allowed for course image!"),
// // // //         false
// // // //       );
// // // //     } else if (
// // // //       file.fieldname === "video" &&
// // // //       !file.originalname.match(/\.(mp4|mov|avi|wmv|flv|mkv|webm)$/i)
// // // //     ) {
// // // //       return cb(new Error("Only video files are allowed for lessons!"), false);
// // // //     } else if (
// // // //       file.fieldname === "lessonVideos[]" &&
// // // //       !file.originalname.match(/\.(mp4|mov|avi|wmv|flv|mkv|webm)$/i)
// // // //     ) {
// // // //       return cb(
// // // //         new Error("Only video files are allowed for lesson videos!"),
// // // //         false
// // // //       );
// // // //     }
// // // //     cb(null, true);
// // // //   },
// // // //   limits: { fileSize: 500 * 1024 * 1024 }, // 500MB limit
// // // // });

// // // // // Public routes
// // // // router.get("/", getCourses);
// // // // router.get("/categories", getCategories);
// // // // router.get("/:slug", getCourse);
// // // // router.get("/:id/lessons", getCourseLessons);
// // // // router.get("/:id/reviews", getCourseReviews);

// // // // // Unified search route (handles both public and protected access)
// // // // router.get("/search", (req, res, next) => {
// // // //   if (req.headers.authorization || req.cookies.token) {
// // // //     return protect(req, res, () => searchCourses(req, res, next));
// // // //   }
// // // //   return searchCourses(req, res, next);
// // // // });

// // // // // Course creation with image and lesson videos
// // // // router.post(
// // // //   "/",
// // // //   protect,
// // // //   restrictTo("instructor", "admin"),
// // // //   upload.fields([
// // // //     { name: "image", maxCount: 1 },
// // // //     { name: "lessonVideos[]", maxCount: 20 },
// // // //   ]),
// // // //   createCourseWithLessons
// // // // );

// // // // // Protected routes
// // // // router.use(protect);

// // // // router.get("/:id/lessons/:lessonId/video-url", getVideoUrl);
// // // // router.get("/:id/enrolled", checkEnrollment);
// // // // router.post("/:id/enroll", enrollCourse);
// // // // router.get("/user/enrolled", getEnrolledCourses);
// // // // router.get("/:id/progress", getCourseProgress);
// // // // router.put("/:id/progress", updateProgress);
// // // // router.post("/:id/wishlist", addToWishlist);
// // // // router.delete("/:id/wishlist", removeFromWishlist);
// // // // router.get("/:id/wishlist-status", getWishlistStatus);
// // // // router.get("/wishlist", getWishlist);
// // // // router.post("/:id/review", addReview);

// // // // // Instructor routes
// // // // router.get(
// // // //   "/instructor/my-courses",
// // // //   restrictTo("instructor"),
// // // //   getInstructorCourses
// // // // );
// // // // router.put("/:id", restrictTo("instructor", "admin"), updateCourse);
// // // // router.delete("/:id", restrictTo("instructor", "admin"), deleteCourse);

// // // // // Lesson routes - update to handle video uploads
// // // // router.post(
// // // //   "/:id/lessons",
// // // //   restrictTo("instructor", "admin"),
// // // //   upload.single("video"), // Use the unified 'upload' instance for single video
// // // //   addLesson
// // // // );
// // // // router.put(
// // // //   "/:id/lessons/:lessonId",
// // // //   restrictTo("instructor", "admin"),
// // // //   upload.single("video"), // Use the unified 'upload' instance for single video
// // // //   updateLesson
// // // // );
// // // // router.delete(
// // // //   "/:id/lessons/:lessonId",
// // // //   restrictTo("instructor", "admin"),
// // // //   deleteLesson
// // // // );

// // // // // Admin routes
// // // // router.get(
// // // //   "/applications",
// // // //   protect,
// // // //   restrictTo("admin"),
// // // //   getInstructorApplications
// // // // );
// // // // router.put(
// // // //   "/applications/:userId",
// // // //   protect,
// // // //   restrictTo("admin"),
// // // //   updateInstructorApplication
// // // // );

// // // // // Instructor application (optional, if needed)
// // // // router.get("/instructor/apply", protect, becomeInstructor);

// // // // module.exports = router;

// // // const express = require("express");
// // // const {
// // //   getCourses,
// // //   getCourse,
// // //   createCourseWithLessons,
// // //   updateCourse,
// // //   deleteCourse,
// // //   getCourseLessons,
// // //   addLesson,
// // //   updateLesson,
// // //   deleteLesson,
// // //   enrollCourse,
// // //   getEnrolledCourses,
// // //   getCourseProgress,
// // //   updateProgress,
// // //   addReview,
// // //   searchCourses,
// // //   getCategories,
// // //   getVideoUrl,
// // //   getCourseReviews,
// // //   checkEnrollment,
// // //   addToWishlist,
// // //   removeFromWishlist,
// // //   getWishlistStatus,
// // //   getWishlist,
// // //   updateInstructorApplication,
// // //   getInstructorApplications,
// // //   getInstructorCourses,
// // //   createLesson,
// // //   createCourse,
// // // } = require("../controllers/courseController");
// // // const { protect, restrictTo } = require("../middlewares/authMiddleware");
// // // const { becomeInstructor } = require("../controllers/authController");
// // // const { upload } = require("../config/cloudinary");

// // // const router = express.Router();

// // // // Public routes
// // // router.get("/", getCourses);
// // // router.get("/categories", getCategories);
// // // router.get("/:slug", getCourse);
// // // router.get("/:id/lessons", getCourseLessons);
// // // router.get("/:id/reviews", getCourseReviews);
// // // router.get("/search", (req, res, next) => {
// // //   if (req.headers.authorization || req.cookies.token) {
// // //     return protect(req, res, () => searchCourses(req, res, next));
// // //   }
// // //   return searchCourses(req, res, next);
// // // });

// // // // Course creation with image and lesson videos
// // // // router.post(
// // // //   "/",
// // // //   protect,
// // // //   restrictTo("instructor", "admin"),
// // // //   upload.fields([
// // // //     { name: "image", maxCount: 1 },
// // // //     { name: "lessonVideos[]", maxCount: 20 },
// // // //   ]),
// // // //   createCourseWithLessons
// // // // );

// // // // Protected routes
// // // router.use(protect);

// // // router.post("/", protect, restrictTo("instructor", "admin"), createCourse);

// // // module.exports = router; // <--- Issue: Premature export

// // // router.get("/:id/lessons/:lessonId/video-url", getVideoUrl);
// // // router.get("/:id/enrolled", checkEnrollment);
// // // router.post("/:id/enroll", enrollCourse);
// // // router.get("/user/enrolled", getEnrolledCourses);
// // // router.get("/:id/progress", getCourseProgress);
// // // router.put("/:id/progress", updateProgress);
// // // router.post("/:id/wishlist", addToWishlist);
// // // router.delete("/:id/wishlist", removeFromWishlist);
// // // router.get("/:id/wishlist-status", getWishlistStatus);
// // // router.get("/wishlist", getWishlist);
// // // router.post("/:id/review", addReview);

// // // // Instructor routes
// // // router.get(
// // //   "/instructor/my-courses",
// // //   restrictTo("instructor"),
// // //   getInstructorCourses
// // // );

// // // router.get("/:id/lessons", restrictTo("instructor", "admin"), getCourseLessons);

// // // router.put("/:id", restrictTo("instructor", "admin"), updateCourse);
// // // router.delete("/:id", restrictTo("instructor", "admin"), deleteCourse);
// // // router.post(
// // //   "/:id/lessons",
// // //   restrictTo("instructor", "admin"),
// // //   upload.single("video"),
// // //   addLesson
// // // );
// // // router.put(
// // //   "/:id/lessons/:lessonId",
// // //   restrictTo("instructor", "admin"),
// // //   upload.single("video"),
// // //   updateLesson
// // // );
// // // router.delete(
// // //   "/:id/lessons/:lessonId",
// // //   restrictTo("instructor", "admin"),
// // //   deleteLesson
// // // );

// // // // Admin routes
// // // router.get(
// // //   "/applications",
// // //   protect,
// // //   restrictTo("admin"),
// // //   getInstructorApplications
// // // );
// // // router.put(
// // //   "/applications/:userId",
// // //   protect,
// // //   restrictTo("admin"),
// // //   updateInstructorApplication
// // // );
// // // router.get("/instructor/apply", protect, becomeInstructor);

// // // module.exports = router;
// // // // routes/courseRoutes.js
// // // const express = require("express");
// // // const {
// // //   getCourses,
// // //   getCourse,
// // //   createCourseWithLessons,
// // //   updateCourse,
// // //   deleteCourse,
// // //   getCourseLessons,
// // //   addLesson,
// // //   updateLesson,
// // //   deleteLesson,
// // //   enrollCourse,
// // //   getEnrolledCourses,
// // //   getCourseProgress,
// // //   updateProgress,
// // //   addReview,
// // //   searchCourses,
// // //   getCategories,
// // //   getVideoUrl,
// // //   getCourseReviews,
// // //   checkEnrollment,
// // //   addToWishlist,
// // //   removeFromWishlist,
// // //   getWishlistStatus,
// // //   getWishlist,
// // //   updateInstructorApplication,
// // //   getInstructorApplications,
// // //   getInstructorCourses,
// // //   createCourse,
// // // } = require("../controllers/courseController");
// // // const { protect, restrictTo } = require("../middlewares/authMiddleware");
// // // const { becomeInstructor } = require("../controllers/authController");
// // // const { upload } = require("../config/cloudinary");

// // // const router = express.Router();

// // // // Public routes
// // // router.get("/", getCourses);
// // // router.get("/categories", getCategories);
// // // router.get("/:slug", getCourse);
// // // router.get("/:id/reviews", getCourseReviews);
// // // router.get("/search", (req, res, next) => {
// // //   if (req.headers.authorization || req.cookies.token) {
// // //     return protect(req, res, () => searchCourses(req, res, next));
// // //   }
// // //   return searchCourses(req, res, next);
// // // });

// // // // Protected routes
// // // router.use(protect);

// // // router.post(
// // //   "/",
// // //   restrictTo("instructor", "admin"),
// // //   // upload.fields([
// // //   //   // { name: "image", maxCount: 1 },
// // //   //   // { name: "lessonVideos[]", maxCount: 20 },
// // //   // ]),
// // //   createCourse
// // // );

// // // router.get("/:id/lessons/:lessonId/video-url", getVideoUrl);
// // // router.get("/:id/enrolled", checkEnrollment);
// // // router.post("/:id/enroll", enrollCourse);
// // // router.get("/user/enrolled", getEnrolledCourses);
// // // router.get("/:id/progress", getCourseProgress);
// // // router.put("/:id/progress", updateProgress);
// // // router.post("/:id/wishlist", addToWishlist);
// // // router.delete("/:id/wishlist", removeFromWishlist);
// // // router.get("/:id/wishlist-status", getWishlistStatus);
// // // router.get("/wishlist", getWishlist);
// // // router.post("/:id/review", addReview);

// // // // Instructor routes
// // // router.get(
// // //   "/instructor/my-courses",
// // //   restrictTo("instructor"),
// // //   getInstructorCourses
// // // );
// // // router.get("/:id/lessons", restrictTo("instructor", "admin"), getCourseLessons);
// // // router.put("/:id", restrictTo("instructor", "admin"), updateCourse);
// // // router.delete("/:id", restrictTo("instructor", "admin"), deleteCourse);

// // // router.post(
// // //   "/:id/lessons",
// // //   restrictTo("instructor", "admin"),
// // //   upload.single("video"),
// // //   addLesson
// // // );
// // // router.put(
// // //   "/:id/lessons/:lessonId",
// // //   restrictTo("instructor", "admin"),
// // //   upload.single("video"),
// // //   updateLesson
// // // );
// // // router.delete(
// // //   "/:id/lessons/:lessonId",
// // //   restrictTo("instructor", "admin"),
// // //   deleteLesson
// // // );

// // // // Admin routes
// // // router.get("/applications", restrictTo("admin"), getInstructorApplications);
// // // router.put(
// // //   "/applications/:userId",
// // //   restrictTo("admin"),
// // //   updateInstructorApplication
// // // );
// // // router.get("/instructor/apply", becomeInstructor);

// // // module.exports = router;

// // // routes/courses.js// routes/courses.js
// // const express = require("express");
// // const {
// //   getCourses,
// //   getCourse,
// //   createCourseWithLessons,
// //   updateCourse,
// //   deleteCourse,
// //   getCourseLessons,
// //   addLesson,
// //   updateLesson,
// //   deleteLesson,
// //   enrollCourse,
// //   getEnrolledCourses,
// //   getCourseProgress,
// //   updateProgress,
// //   addReview,
// //   searchCourses,
// //   getCategories,
// //   getVideoUrl,
// //   getCourseReviews,
// //   checkEnrollment,
// //   addToWishlist,
// //   removeFromWishlist,
// //   getWishlistStatus,
// //   getWishlist,
// //   updateInstructorApplication,
// //   getInstructorApplications,
// //   getInstructorCourses,
// //   createCourse,
// //   dashboardSearch,
// //   updateCourseStatus,
// //   bulkUpdateCourseStatus,
// //   getCourseStatusStats,
// // } = require("../controllers/courseController");
// // const { protect, restrictTo } = require("../middlewares/authMiddleware");
// // const { becomeInstructor } = require("../controllers/authController");
// // const { upload } = require("../config/cloudinary");
// // const Course = require("../models/Course");
// // const Enrollment = require("../models/Enrollment");

// // const router = express.Router();

// // // Public routes
// // router.get("/", getCourses);
// // router.get("/categories", getCategories);
// // router.get("/:slug", getCourse);
// // router.get("/:id/reviews", getCourseReviews);
// // router.get("/search", (req, res, next) => {
// //   if (req.headers.authorization || req.cookies.token) {
// //     return protect(req, res, () => searchCourses(req, res, next));
// //   }
// //   return searchCourses(req, res, next);
// // });

// // // Protected routes
// // router.use(protect);

// // router.get("/dashboard/search", protect, dashboardSearch);

// // router.post(
// //   "/",
// //   restrictTo("instructor", "admin"),
// //   upload.single("image"),
// //   createCourse
// // );

// // router.get("/:id/lessons/:lessonId/video-url", getVideoUrl);
// // router.get("/:id/enrolled", checkEnrollment);
// // router.post("/:id/enroll", enrollCourse);
// // router.get("/user/enrolled", getEnrolledCourses);
// // router.get("/:id/progress", getCourseProgress);
// // router.put("/:id/progress", updateProgress);
// // router.post("/:id/wishlist", addToWishlist);
// // router.delete("/:id/wishlist", removeFromWishlist);
// // router.get("/:id/wishlist-status", getWishlistStatus);
// // router.get("/wishlist", getWishlist);
// // router.post("/:id/review", addReview);

// // // Instructor routes
// // router.get(
// //   "/instructor/my-courses",
// //   restrictTo("instructor"),
// //   getInstructorCourses
// // );
// // router.get("/:id/lessons", restrictTo("instructor", "admin"), getCourseLessons);
// // router.put("/:id", restrictTo("instructor", "admin"), updateCourse);
// // router.delete("/:id", restrictTo("instructor", "admin"), deleteCourse);

// // router.post(
// //   "/:id/lessons",
// //   restrictTo("instructor", "admin"),
// //   upload.single("video"),
// //   addLesson
// // );
// // router.put(
// //   "/:id/lessons/:lessonId",
// //   restrictTo("instructor", "admin"),
// //   upload.single("video"),
// //   updateLesson
// // );
// // router.delete(
// //   "/:id/lessons/:lessonId",
// //   restrictTo("instructor", "admin"),
// //   deleteLesson
// // );

// // // Admin routes
// // router.get("/applications", restrictTo("admin"), getInstructorApplications);
// // router.put(
// //   "/applications/:userId",
// //   restrictTo("admin"),
// //   updateInstructorApplication
// // );
// // router.get("/instructor/apply", becomeInstructor);



// // router.patch(
// //   "/:id/status",
// //   protect,
// //   restrictTo("instructor", "admin"),
// //   updateCourseStatus
// // );

// // router.patch(
// //   "/bulk-status",
// //   restrictTo("instructor", "admin"),
// //   bulkUpdateCourseStatus
// // );

// // router.get(
// //   "/status-stats",
// //   restrictTo("instructor", "admin"),
// //   getCourseStatusStats
// // );





// // // Apply protect middleware to all routes
// // router.use(protect);

// // // Status management routes


// // // Existing routes
// // router.get("/", restrictTo("instructor", "admin"), getInstructorCourses);
// // // ... other existing routes





// // // Add these routes to your existing courseRoutes.js

// // // @desc    Get course by ID (for preview)
// // // @route   GET /api/courses/id/:id
// // // @access  Private/Instructor
// // router.get('/id/:id', protect, restrictTo('instructor', 'admin'), async (req, res) => {
// //   try {
// //     const course = await Course.findById(req.params.id)
// //       .populate('instructor', 'name avatar bio')
// //       .lean();
    
// //     if (!course) {
// //       return res.status(404).json({ success: false, message: 'Course not found' });
// //     }

// //     // Check if user is instructor or admin
// //     if (course.instructor._id.toString() !== req.user.id && req.user.role !== 'admin') {
// //       return res.status(403).json({ success: false, message: 'Not authorized' });
// //     }

// //     res.status(200).json({ success: true, data: course });
// //   } catch (error) {
// //     res.status(500).json({ success: false, message: error.message });
// //   }
// // });

// // // @desc    Get instructor analytics
// // // @route   GET /api/analytics/instructor
// // // @access  Private/Instructor
// // router.get('/analytics/instructor', protect, restrictTo('instructor'), async (req, res) => {
// //   try {
// //     const { courseId } = req.query;
    
// //     let matchCriteria = { instructor: req.user.id };
// //     if (courseId) {
// //       matchCriteria._id = courseId;
// //     }

// //     const courses = await Course.find(matchCriteria);
// //     const courseIds = courses.map(course => course._id);

// //     // Get enrollment trends (last 30 days)
// //     const enrollmentTrends = await Enrollment.aggregate([
// //       {
// //         $match: {
// //           course: { $in: courseIds },
// //           enrolledAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
// //         }
// //       },
// //       {
// //         $group: {
// //           _id: { $dateToString: { format: "%Y-%m-%d", date: "$enrolledAt" } },
// //           count: { $sum: 1 }
// //         }
// //       },
// //       { $sort: { _id: 1 } }
// //     ]);

// //     // Get total students
// //     const totalStudents = await Enrollment.countDocuments({
// //       course: { $in: courseIds }
// //     });

// //     // Get total revenue
// //     const revenueData = await Enrollment.aggregate([
// //       {
// //         $match: { course: { $in: courseIds } }
// //       },
// //       {
// //         $lookup: {
// //           from: 'courses',
// //           localField: 'course',
// //           foreignField: '_id',
// //           as: 'course'
// //         }
// //       },
// //       {
// //         $group: {
// //           _id: null,
// //           totalRevenue: { $sum: { $arrayElemAt: ['$course.price', 0] } }
// //         }
// //       }
// //     ]);

// //     const analytics = {
// //       enrollmentTrends,
// //       totalStudents,
// //       totalRevenue: revenueData[0]?.totalRevenue || 0,
// //       totalCourses: courses.length,
// //       averageRating: courses.reduce((acc, course) => acc + (course.ratings?.average || 0), 0) / courses.length || 0
// //     };

// //     res.status(200).json({ success: true, data: analytics });
// //   } catch (error) {
// //     res.status(500).json({ success: false, message: error.message });
// //   }
// // });

// // // @desc    Get instructor earnings
// // // @route   GET /api/instructor/earnings
// // // @access  Private/Instructor
// // router.get('/instructor/earnings', protect, restrictTo('instructor'), async (req, res) => {
// //   try {
// //     const courses = await Course.find({ instructor: req.user.id });
// //     const courseIds = courses.map(course => course._id);

// //     const earningsData = await Enrollment.aggregate([
// //       {
// //         $match: { course: { $in: courseIds } }
// //       },
// //       {
// //         $lookup: {
// //           from: 'courses',
// //           localField: 'course',
// //           foreignField: '_id',
// //           as: 'course'
// //         }
// //       },
// //       {
// //         $group: {
// //           _id: null,
// //           revenue: { $sum: { $arrayElemAt: ['$course.price', 0] } },
// //           enrollments: { $sum: 1 }
// //         }
// //       }
// //     ]);

// //     const result = earningsData[0] || { revenue: 0, enrollments: 0 };
    
// //     res.status(200).json({ 
// //       success: true, 
// //       data: {
// //         revenue: result.revenue,
// //         enrollments: result.enrollments,
// //         trend: 15 // Mock trend percentage
// //       }
// //     });
// //   } catch (error) {
// //     res.status(500).json({ success: false, message: error.message });
// //   }
// // });

// // // @desc    Get instructor students
// // // @route   GET /api/instructor/students
// // // @access  Private/Instructor
// // router.get('/instructor/students', protect, restrictTo('instructor'), async (req, res) => {
// //   try {
// //     const { courseId } = req.query;
    
// //     let matchCriteria = { instructor: req.user.id };
// //     if (courseId) {
// //       matchCriteria._id = courseId;
// //     }

// //     const courses = await Course.find(matchCriteria);
// //     const courseIds = courses.map(course => course._id);

// //     const students = await Enrollment.find({ course: { $in: courseIds } })
// //       .populate('student', 'name email')
// //       .populate('course', 'title')
// //       .sort({ enrolledAt: -1 })
// //       .limit(50);

// //     const studentData = students.map(enrollment => ({
// //       _id: enrollment.student._id,
// //       name: enrollment.student.name,
// //       email: enrollment.student.email,
// //       courseTitle: enrollment.course.title,
// //       enrolledAt: enrollment.enrolledAt,
// //       progress: enrollment.progress || 0
// //     }));

// //     res.status(200).json({ success: true, data: studentData });
// //   } catch (error) {
// //     res.status(500).json({ success: false, message: error.message });
// //   }
// // });




// // // @desc    Update course status (publish/unpublish)
// // // @route   PATCH /api/courses/:id/status
// // // @access  Private/Instructor/Admin
// // router.patch('/:id/status', protect, restrictTo('instructor', 'admin'), async (req, res) => {
// //   try {
// //     const { status } = req.body;
// //     const course = await Course.findById(req.params.id);
    
// //     if (!course) {
// //       return res.status(404).json({ success: false, message: 'Course not found' });
// //     }

// //     // Check if user is instructor or admin
// //     if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
// //       return res.status(403).json({ success: false, message: 'Not authorized to update this course' });
// //     }

// //     course.isPublished = status === 'published';
// //     await course.save();

// //     res.status(200).json({ 
// //       success: true, 
// //       data: course,
// //       message: `Course ${status === 'published' ? 'published' : 'unpublished'} successfully` 
// //     });
// //   } catch (error) {
// //     res.status(500).json({ success: false, message: error.message });
// //   }
// // });

// // // @desc    Get course analytics
// // // @route   GET /api/courses/:id/analytics
// // // @access  Private/Instructor/Admin
// // router.get('/:id/analytics', protect, restrictTo('instructor', 'admin'), async (req, res) => {
// //   try {
// //     const course = await Course.findById(req.params.id);
    
// //     if (!course) {
// //       return res.status(404).json({ success: false, message: 'Course not found' });
// //     }

// //     // Check if user is instructor or admin
// //     if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
// //       return res.status(403).json({ success: false, message: 'Not authorized to view analytics' });
// //     }

// //     // Get enrollment data
// //     const enrollments = await Enrollment.find({ course: course._id });
// //     const totalStudents = enrollments.length;

// //     // Get revenue data
// //     const revenueData = await Enrollment.aggregate([
// //       { $match: { course: course._id } },
// //       {
// //         $lookup: {
// //           from: 'courses',
// //           localField: 'course',
// //           foreignField: '_id',
// //           as: 'course'
// //         }
// //       },
// //       {
// //         $group: {
// //           _id: null,
// //           totalRevenue: { $sum: { $arrayElemAt: ['$course.price', 0] } }
// //         }
// //       }
// //     ]);

// //     // Get progress data
// //     const progressData = await Enrollment.aggregate([
// //       { $match: { course: course._id } },
// //       {
// //         $group: {
// //           _id: null,
// //           avgProgress: { $avg: '$progress' },
// //           completedStudents: { 
// //             $sum: { 
// //               $cond: [{ $eq: ['$progress', 100] }, 1, 0] 
// //             } 
// //           }
// //         }
// //       }
// //     ]);

// //     // Get enrollment trends (last 30 days)
// //     const enrollmentTrends = await Enrollment.aggregate([
// //       {
// //         $match: {
// //           course: course._id,
// //           enrolledAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
// //         }
// //       },
// //       {
// //         $group: {
// //           _id: { $dateToString: { format: "%Y-%m-%d", date: "$enrolledAt" } },
// //           count: { $sum: 1 }
// //         }
// //       },
// //       { $sort: { _id: 1 } }
// //     ]);

// //     const analytics = {
// //       course: {
// //         title: course.title,
// //         studentsEnrolled: totalStudents,
// //         revenue: revenueData[0]?.totalRevenue || 0,
// //         averageRating: course.ratings.average || 0,
// //         totalReviews: course.ratings.count || 0
// //       },
// //       progress: {
// //         averageProgress: progressData[0]?.avgProgress || 0,
// //         completedStudents: progressData[0]?.completedStudents || 0,
// //         activeStudents: totalStudents - (progressData[0]?.completedStudents || 0)
// //       },
// //       enrollmentTrends,
// //       lessons: {
// //         total: course.lecturesCount,
// //         totalDuration: course.totalHours
// //       }
// //     };

// //     res.status(200).json({ success: true, data: analytics });
// //   } catch (error) {
// //     res.status(500).json({ success: false, message: error.message });
// //   }
// // });

// // // @desc    Update course details
// // // @route   PUT /api/courses/:id/details
// // // @access  Private/Instructor/Admin
// // router.put('/:id/details', protect, restrictTo('instructor', 'admin'), async (req, res) => {
// //   try {
// //     const course = await Course.findById(req.params.id);
    
// //     if (!course) {
// //       return res.status(404).json({ success: false, message: 'Course not found' });
// //     }

// //     // Check if user is instructor or admin
// //     if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
// //       return res.status(403).json({ success: false, message: 'Not authorized to update this course' });
// //     }

// //     const allowedUpdates = [
// //       'title', 'subtitle', 'description', 'category', 'subcategory', 
// //       'price', 'level', 'language', 'whatYoullLearn', 'requirements'
// //     ];
    
// //     const updates = Object.keys(req.body);
// //     const isValidOperation = updates.every(update => allowedUpdates.includes(update));
    
// //     if (!isValidOperation) {
// //       return res.status(400).json({ success: false, message: 'Invalid updates' });
// //     }

// //     updates.forEach(update => {
// //       course[update] = req.body[update];
// //     });

// //     await course.save();

// //     res.status(200).json({ 
// //       success: true, 
// //       data: course,
// //       message: 'Course updated successfully' 
// //     });
// //   } catch (error) {
// //     res.status(500).json({ success: false, message: error.message });
// //   }
// // });


// // module.exports = router;



// // routes/courseRoutes.js
// const express = require("express");
// const {
//   getCourses,
//   getCourse,
//   createCourse,
//   createCourseWithLessons,
//   updateCourse,
//   deleteCourse,
//   getCourseLessons,
//   addLesson,
//   updateLesson,
//   deleteLesson,
//   enrollCourse,
//   getEnrolledCourses,
//   getCourseProgress,
//   updateProgress,
//   addReview,
//   searchCourses,
//   getCategories,
//   getVideoUrl,
//   getCourseReviews,
//   checkEnrollment,
//   addToWishlist,
//   removeFromWishlist,
//   getWishlistStatus,
//   getWishlist,
//   updateInstructorApplication,
//   getInstructorApplications,
//   getInstructorCourses,
//   dashboardSearch,
//   updateCourseStatus,
//   bulkUpdateCourseStatus,
//   getCourseStatusStats,
//   getAllInstructors,
//   getInstructorStats,
//   getAllInstructorsOptimized,
// } = require("../controllers/courseController");
// const { protect, restrictTo } = require("../middlewares/authMiddleware");
// const { becomeInstructor } = require("../controllers/authController");
// const { upload } = require("../config/cloudinary");
// const Course = require("../models/Course");
// const Enrollment = require("../models/Enrollment");

// const router = express.Router();

// // Public routes
// router.get("/", getCourses);
// router.get("/categories", getCategories);
// router.get('/:identifier', getCourse);
// router.get("/:id/lessons", getCourseLessons);
// router.get("/:id/reviews", getCourseReviews);
// router.get("/search", (req, res, next) => {
//   if (req.headers.authorization || req.cookies.token) {
//     return protect(req, res, () => searchCourses(req, res, next));
//   }
//   return searchCourses(req, res, next);
// });

// // Protected routes
// router.use(protect);

// // Course creation and management
// router.post(
//   "/",
//   restrictTo("instructor", "admin"),
//   upload.fields([
//     { name: "image", maxCount: 1 },
//     { name: "lessonVideos[]", maxCount: 20 },
//   ]),
//   createCourseWithLessons
// );
// router.get("/id/:id", restrictTo("instructor", "admin"), async (req, res) => {
//   try {
//     const course = await Course.findById(req.params.id)
//       .populate("instructor", "name avatar bio")
//       .lean();
//     if (!course) {
//       return res.status(404).json({ success: false, message: "Course not found" });
//     }
//     if (course.instructor._id.toString() !== req.user.id && req.user.role !== "admin") {
//       return res.status(403).json({ success: false, message: "Not authorized" });
//     }
//     res.status(200).json({ success: true, data: course });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });
// router.put("/:id", restrictTo("instructor", "admin"), updateCourse);
// router.put("/:id/details", restrictTo("instructor", "admin"), async (req, res) => {
//   try {
//     const course = await Course.findById(req.params.id);
//     if (!course) {
//       return res.status(404).json({ success: false, message: "Course not found" });
//     }
//     if (course.instructor.toString() !== req.user.id && req.user.role !== "admin") {
//       return res.status(403).json({ success: false, message: "Not authorized to update this course" });
//     }
//     const allowedUpdates = [
//       "title",
//       "subtitle",
//       "description",
//       "category",
//       "subcategory",
//       "price",
//       "level",
//       "language",
//       "whatYoullLearn",
//       "requirements",
//     ];
//     const updates = Object.keys(req.body);
//     const isValidOperation = updates.every((update) => allowedUpdates.includes(update));
//     if (!isValidOperation) {
//       return res.status(400).json({ success: false, message: "Invalid updates" });
//     }
//     updates.forEach((update) => {
//       course[update] = req.body[update];
//     });
//     await course.save();
//     res.status(200).json({
//       success: true,
//       data: course,
//       message: "Course updated successfully",
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });
// router.delete("/:id", restrictTo("instructor", "admin"), deleteCourse);
// router.patch(
//   "/:id/status",
//   restrictTo("instructor", "admin"),
//   updateCourseStatus
// );
// router.patch(
//   "/bulk-status",
//   restrictTo("instructor", "admin"),
//   bulkUpdateCourseStatus
// );
// router.get(
//   "/status-stats",
//   restrictTo("instructor", "admin"),
//   getCourseStatusStats
// );

// // Lesson routes
// router.post(
//   "/:id/lessons",
//   restrictTo("instructor", "admin"),
//   upload.single("video"),
//   addLesson
// );
// router.put(
//   "/:id/lessons/:lessonId",
//   restrictTo("instructor", "admin"),
//   upload.single("video"),
//   updateLesson
// );
// router.delete(
//   "/:id/lessons/:lessonId",
//   restrictTo("instructor", "admin"),
//   deleteLesson
// );

// // Enrollment routes
// router.get("/:id/enrolled", checkEnrollment);
// router.post("/:id/enroll", enrollCourse);
// router.get("/user/enrolled", getEnrolledCourses);
// router.get("/:id/progress", getCourseProgress);
// router.put("/:id/progress", updateProgress);

// // Wishlist routes
// router.post("/:id/wishlist", addToWishlist);
// router.delete("/:id/wishlist", removeFromWishlist);
// router.get("/:id/wishlist-status", getWishlistStatus);
// router.get("/wishlist", getWishlist);

// // Review routes
// router.post("/:id/review", addReview);

// // Video URL route
// router.get("/:id/lessons/:lessonId/video-url", getVideoUrl);

// // Instructor routes
// router.get("/dashboard/search", dashboardSearch);
// router.get("/instructor/my-courses", restrictTo("instructor"), getInstructorCourses);
// router.get("/instructor/students", restrictTo("instructor"), async (req, res) => {
//   try {
//     const { courseId } = req.query;
//     let matchCriteria = { instructor: req.user.id };
//     if (courseId) {
//       matchCriteria._id = courseId;
//     }
//     const courses = await Course.find(matchCriteria);
//     const courseIds = courses.map((course) => course._id);
//     const students = await Enrollment.find({ course: { $in: courseIds } })
//       .populate("student", "name email")
//       .populate("course", "title")
//       .sort({ enrolledAt: -1 })
//       .limit(50);
//     const studentData = students.map((enrollment) => ({
//       _id: enrollment.student._id,
//       name: enrollment.student.name,
//       email: enrollment.student.email,
//       courseTitle: enrollment.course.title,
//       enrolledAt: enrollment.enrolledAt,
//       progress: enrollment.progress || 0,
//     }));
//     res.status(200).json({ success: true, data: studentData });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });
// router.get("/instructor/earnings", restrictTo("instructor"), async (req, res) => {
//   try {
//     const courses = await Course.find({ instructor: req.user.id });
//     const courseIds = courses.map((course) => course._id);
//     const earningsData = await Enrollment.aggregate([
//       { $match: { course: { $in: courseIds } } },
//       {
//         $lookup: {
//           from: "courses",
//           localField: "course",
//           foreignField: "_id",
//           as: "course",
//         },
//       },
//       {
//         $group: {
//           _id: null,
//           revenue: { $sum: { $arrayElemAt: ["$course.price", 0] } },
//           enrollments: { $sum: 1 },
//         },
//       },
//     ]);
//     const result = earningsData[0] || { revenue: 0, enrollments: 0 };
//     res.status(200).json({
//       success: true,
//       data: {
//         revenue: result.revenue,
//         enrollments: result.enrollments,
//         trend: 15, // Mock trend percentage
//       },
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });
// router.get("/instructor/apply", becomeInstructor);

// // Admin routes
// router.get("/applications", restrictTo("admin"), getInstructorApplications);
// router.put(
//   "/applications/:userId",
//   restrictTo("admin"),
//   updateInstructorApplication
// );





// // Get instructor stats


// // routes/courseRoutes.js - Add these routes

// // Admin instructor management routes
// router.get(
//   "/instructors/all",
//   protect,
//   restrictTo("admin"),
//   getAllInstructors
// );

// router.get(
//   "/instructors/stats",
//   protect,
//   restrictTo("admin"),
//   getInstructorStats
// );

// router.get(
//   "/applications",
//   protect,
//   restrictTo("admin"),
//   getInstructorApplications
// );

// router.put(
//   "/applications/:userId",
//   protect,
//   restrictTo("admin"),
//   updateInstructorApplication
// );

// router.get(
//   "/instructors/optimized",
//   protect,
//   restrictTo("admin"),
//   getAllInstructorsOptimized
// );

// // Analytics routes
// router.get("/analytics/instructor", restrictTo("instructor"), async (req, res) => {
//   try {
//     const { courseId } = req.query;
//     let matchCriteria = { instructor: req.user.id };
//     if (courseId) {
//       matchCriteria._id = courseId;
//     }
//     const courses = await Course.find(matchCriteria);
//     const courseIds = courses.map((course) => course._id);
//     const enrollmentTrends = await Enrollment.aggregate([
//       {
//         $match: {
//           course: { $in: courseIds },
//           enrolledAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
//         },
//       },
//       {
//         $group: {
//           _id: { $dateToString: { format: "%Y-%m-%d", date: "$enrolledAt" } },
//           count: { $sum: 1 },
//         },
//       },
//       { $sort: { _id: 1 } },
//     ]);
//     const totalStudents = await Enrollment.countDocuments({
//       course: { $in: courseIds },
//     });
//     const revenueData = await Enrollment.aggregate([
//       { $match: { course: { $in: courseIds } } },
//       {
//         $lookup: {
//           from: "courses",
//           localField: "course",
//           foreignField: "_id",
//           as: "course",
//         },
//       },
//       {
//         $group: {
//           _id: null,
//           totalRevenue: { $sum: { $arrayElemAt: ["$course.price", 0] } },
//         },
//       },
//     ]);
//     const analytics = {
//       enrollmentTrends,
//       totalStudents,
//       totalRevenue: revenueData[0]?.totalRevenue || 0,
//       totalCourses: courses.length,
//       averageRating: courses.reduce((acc, course) => acc + (course.ratings?.average || 0), 0) / courses.length || 0,
//     };
//     res.status(200).json({ success: true, data: analytics });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });
// router.get("/:id/analytics", restrictTo("instructor", "admin"), async (req, res) => {
//   try {
//     const course = await Course.findById(req.params.id);
//     if (!course) {
//       return res.status(404).json({ success: false, message: "Course not found" });
//     }
//     if (course.instructor.toString() !== req.user.id && req.user.role !== "admin") {
//       return res.status(403).json({ success: false, message: "Not authorized to view analytics" });
//     }
//     const enrollments = await Enrollment.find({ course: course._id });
//     const totalStudents = enrollments.length;
//     const revenueData = await Enrollment.aggregate([
//       { $match: { course: course._id } },
//       {
//         $lookup: {
//           from: "courses",
//           localField: "course",
//           foreignField: "_id",
//           as: "course",
//         },
//       },
//       {
//         $group: {
//           _id: null,
//           totalRevenue: { $sum: { $arrayElemAt: ["$course.price", 0] } },
//         },
//       },
//     ]);
//     const progressData = await Enrollment.aggregate([
//       { $match: { course: course._id } },
//       {
//         $group: {
//           _id: null,
//           avgProgress: { $avg: "$progress" },
//           completedStudents: {
//             $sum: { $cond: [{ $eq: ["$progress", 100] }, 1, 0] },
//           },
//         },
//       },
//     ]);
//     const enrollmentTrends = await Enrollment.aggregate([
//       {
//         $match: {
//           course: course._id,
//           enrolledAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
//         },
//       },
//       {
//         $group: {
//           _id: { $dateToString: { format: "%Y-%m-%d", date: "$enrolledAt" } },
//           count: { $sum: 1 },
//         },
//       },
//       { $sort: { _id: 1 } },
//     ]);
//     const analytics = {
//       course: {
//         title: course.title,
//         studentsEnrolled: totalStudents,
//         revenue: revenueData[0]?.totalRevenue || 0,
//         averageRating: course.ratings.average || 0,
//         totalReviews: course.ratings.count || 0,
//       },
//       progress: {
//         averageProgress: progressData[0]?.avgProgress || 0,
//         completedStudents: progressData[0]?.completedStudents || 0,
//         activeStudents: totalStudents - (progressData[0]?.completedStudents || 0),
//       },
//       enrollmentTrends,
//       lessons: {
//         total: course.lecturesCount,
//         totalDuration: course.totalHours,
//       },
//     };
//     res.status(200).json({ success: true, data: analytics });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// module.exports = router;


// routes/courseRoutes.js
const express = require("express");
const {
  getCourses,
  getCourse,
  createCourse,
  createCourseWithLessons,
  updateCourse,
  deleteCourse,
  getCourseLessons,
  addLesson,
  updateLesson,
  deleteLesson,
  enrollCourse,
  getEnrolledCourses,
  getCourseProgress,
  updateProgress,
  addReview,
  searchCourses,
  getCategories,
  getVideoUrl,
  getCourseReviews,
  checkEnrollment,
  addToWishlist,
  removeFromWishlist,
  getWishlistStatus,
  getWishlist,
  updateInstructorApplication,
  getInstructorApplications,
  getInstructorCourses,
  dashboardSearch,
  updateCourseStatus,
  bulkUpdateCourseStatus,
  getCourseStatusStats,
  getAllInstructors,
  getInstructorStats,
  getAllInstructorsOptimized,
} = require("../controllers/courseController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");
const { becomeInstructor } = require("../controllers/authController");
const { upload } = require("../config/cloudinary");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");

const router = express.Router();

// Public routes
router.get("/", getCourses);
router.get("/categories", getCategories);
router.get("/search", (req, res, next) => {
  if (req.headers.authorization || req.cookies.token) {
    return protect(req, res, () => searchCourses(req, res, next));
  }
  return searchCourses(req, res, next);
});

router.get("/applications", restrictTo("admin"), getInstructorApplications);


router.get("/:identifier", getCourse);
router.get("/:id/lessons", getCourseLessons);
router.get("/:id/reviews", getCourseReviews);

// Protected routes
router.use(protect);

// Course management routes
router.post(
  "/",
  restrictTo("instructor", "admin"),
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "lessonVideos[]", maxCount: 20 },
  ]),
  createCourseWithLessons
);
router.get("/id/:id", restrictTo("instructor", "admin"), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("instructor", "name avatar bio")
      .lean();
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }
    if (course.instructor._id.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }
    res.status(200).json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
router.put("/:id", restrictTo("instructor", "admin"), updateCourse);
router.put("/:id/details", restrictTo("instructor", "admin" , "student"), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }
    if (course.instructor.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized to update this course" });
    }
    const allowedUpdates = [
      "title",
      "subtitle",
      "description",
      "category",
      "subcategory",
      "price",
      "level",
      "language",
      "whatYoullLearn",
      "requirements",
    ];
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));
    if (!isValidOperation) {
      return res.status(400).json({ success: false, message: "Invalid updates" });
    }
    updates.forEach((update) => {
      course[update] = req.body[update];
    });
    await course.save();
    res.status(200).json({
      success: true,
      data: course,
      message: "Course updated successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
router.delete("/:id", restrictTo("instructor", "admin"), deleteCourse);
router.patch("/:id/status", restrictTo("instructor", "admin"), updateCourseStatus);
router.patch("/bulk-status", restrictTo("instructor", "admin"), bulkUpdateCourseStatus);
router.get("/status-stats", restrictTo("instructor", "admin"), getCourseStatusStats);

// Lesson routes
router.post("/:id/lessons", restrictTo("instructor", "admin"), upload.single("video"), addLesson);
router.put("/:id/lessons/:lessonId", restrictTo("instructor", "admin"), upload.single("video"), updateLesson);
router.delete("/:id/lessons/:lessonId", restrictTo("instructor", "admin"), deleteLesson);
router.get("/:id/lessons/:lessonId/video-url", getVideoUrl);

// Enrollment routes
router.get("/:id/enrolled", checkEnrollment);
router.post("/:id/enroll", enrollCourse);
router.get("/user/enrolled", getEnrolledCourses);
router.get("/:id/progress", getCourseProgress);
router.put("/:id/progress", updateProgress);

// Wishlist routes
router.post("/:id/wishlist", addToWishlist);
router.delete("/:id/wishlist", removeFromWishlist);
router.get("/:id/wishlist-status", getWishlistStatus);
router.get("/wishlist", getWishlist);

// Review routes
router.post("/:id/review", addReview);

// Instructor routes
router.get("/dashboard/search", dashboardSearch);
router.get("/instructor/my-courses", restrictTo("instructor"), getInstructorCourses);
router.get("/instructor/students", restrictTo("instructor"), async (req, res) => {
  try {
    const { courseId } = req.query;
    let matchCriteria = { instructor: req.user.id };
    if (courseId) {
      matchCriteria._id = courseId;
    }
    const courses = await Course.find(matchCriteria);
    const courseIds = courses.map((course) => course._id);
    const students = await Enrollment.find({ course: { $in: courseIds } })
      .populate("student", "name email")
      .populate("course", "title")
      .sort({ enrolledAt: -1 })
      .limit(50);
    const studentData = students.map((enrollment) => ({
      _id: enrollment.student._id,
      name: enrollment.student.name,
      email: enrollment.student.email,
      courseTitle: enrollment.course.title,
      enrolledAt: enrollment.enrolledAt,
      progress: enrollment.progress || 0,
    }));
    res.status(200).json({ success: true, data: studentData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
router.get("/instructor/earnings", restrictTo("instructor"), async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user.id });
    const courseIds = courses.map((course) => course._id);
    const earningsData = await Enrollment.aggregate([
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
          revenue: { $sum: { $arrayElemAt: ["$course.price", 0] } },
          enrollments: { $sum: 1 },
        },
      },
    ]);
    const result = earningsData[0] || { revenue: 0, enrollments: 0 };
    res.status(200).json({
      success: true,
      data: {
        revenue: result.revenue,
        enrollments: result.enrollments,
        trend: 15, // Mock trend percentage
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
router.get("/instructor/apply", becomeInstructor);

// Analytics routes
router.get("/analytics/instructor", restrictTo("instructor"), async (req, res) => {
  try {
    const { courseId } = req.query;
    let matchCriteria = { instructor: req.user.id };
    if (courseId) {
      matchCriteria._id = courseId;
    }
    const courses = await Course.find(matchCriteria);
    const courseIds = courses.map((course) => course._id);
    const enrollmentTrends = await Enrollment.aggregate([
      {
        $match: {
          course: { $in: courseIds },
          enrolledAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$enrolledAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const totalStudents = await Enrollment.countDocuments({
      course: { $in: courseIds },
    });
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
        },
      },
    ]);
    const analytics = {
      enrollmentTrends,
      totalStudents,
      totalRevenue: revenueData[0]?.totalRevenue || 0,
      totalCourses: courses.length,
      averageRating: courses.reduce((acc, course) => acc + (course.ratings?.average || 0), 0) / courses.length || 0,
    };
    res.status(200).json({ success: true, data: analytics });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
router.get("/:id/analytics", restrictTo("instructor", "admin"), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }
    if (course.instructor.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized to view analytics" });
    }
    const enrollments = await Enrollment.find({ course: course._id });
    const totalStudents = enrollments.length;
    const revenueData = await Enrollment.aggregate([
      { $match: { course: course._id } },
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
        },
      },
    ]);
    const progressData = await Enrollment.aggregate([
      { $match: { course: course._id } },
      {
        $group: {
          _id: null,
          avgProgress: { $avg: "$progress" },
          completedStudents: {
            $sum: { $cond: [{ $eq: ["$progress", 100] }, 1, 0] },
          },
        },
      },
    ]);
    const enrollmentTrends = await Enrollment.aggregate([
      {
        $match: {
          course: course._id,
          enrolledAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$enrolledAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const analytics = {
      course: {
        title: course.title,
        studentsEnrolled: totalStudents,
        revenue: revenueData[0]?.totalRevenue || 0,
        averageRating: course.ratings.average || 0,
        totalReviews: course.ratings.count || 0,
      },
      progress: {
        averageProgress: progressData[0]?.avgProgress || 0,
        completedStudents: progressData[0]?.completedStudents || 0,
        activeStudents: totalStudents - (progressData[0]?.completedStudents || 0),
      },
      enrollmentTrends,
      lessons: {
        total: course.lecturesCount,
        totalDuration: course.totalHours,
      },
    };
    res.status(200).json({ success: true, data: analytics });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin routes
router.put("/applications/:userId", restrictTo("admin"), updateInstructorApplication);
router.get("/instructors/all", restrictTo("admin"), getAllInstructors);
router.get("/instructors/stats", restrictTo("admin"), getInstructorStats);
router.get("/instructors/optimized", restrictTo("admin"), getAllInstructorsOptimized);

module.exports = router;