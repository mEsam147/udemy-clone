// routes/compare.js - ADD DEBUG LOGGING
const express = require("express");
const mongoose = require("mongoose");
const Course = require("../models/Course");

const router = express.Router();

// Helper function to validate MongoDB ObjectId
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// Helper function to validate and convert course IDs
const validateCourseIds = (courseIds) => {
  console.log("🔍 validateCourseIds received:", courseIds); // DEBUG
  
  if (!courseIds || !Array.isArray(courseIds)) {
    throw new Error("Course IDs array is required");
  }

  if (courseIds.length > 3) {
    throw new Error("Cannot compare more than 3 courses at once");
  }

  // Validate each course ID
  const validIds = [];
  const invalidIds = [];

  courseIds.forEach(id => {
    console.log("🔍 Checking course ID:", id, "Type:", typeof id); // DEBUG
    if (isValidObjectId(id)) {
      validIds.push(new mongoose.Types.ObjectId(id));
    } else {
      invalidIds.push(id);
    }
  });

  if (invalidIds.length > 0) {
    throw new Error(`Invalid course IDs: ${invalidIds.join(', ')}. Course IDs must be valid MongoDB ObjectIds.`);
  }

  if (validIds.length === 0) {
    throw new Error("No valid course IDs provided");
  }

  return validIds;
};

// @desc    Get multiple courses by IDs for comparison
// @route   POST /api/compare/courses
// @access  Public
router.post("/courses", async (req, res) => {
  try {
    console.log("🔍 POST /api/compare/courses - Headers:", req.headers); // DEBUG
    console.log("🔍 POST /api/compare/courses - Body:", req.body); // DEBUG
    
    const { courseIds } = req.body;
    
    if (!courseIds) {
      console.log("🔍 No courseIds in request body"); // DEBUG
      return res.status(400).json({
        success: false,
        message: "Course IDs array is required in request body"
      });
    }

    // Validate course IDs
    const validCourseIds = validateCourseIds(courseIds);

    console.log("🔍 Valid course IDs:", validCourseIds); // DEBUG

    // Fetch courses with detailed information
    const courses = await Course.find({ 
      _id: { $in: validCourseIds },
      status: "published",
      isPublished: true
    })
    .populate("instructor", "name avatar bio expertise")
    .select("title description subtitle image price category level language ratings studentsEnrolled totalHours lecturesCount requirements whatYoullLearn isPremium slug features")
    .lean();

    console.log("🔍 Found courses:", courses.length); // DEBUG

    if (courses.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No published courses found for the provided IDs"
      });
    }

    res.status(200).json({
      success: true,
      data: courses,
      count: courses.length
    });

  } catch (error) {
    console.error("❌ Compare courses error:", error);
    
    if (error.message.includes("Course IDs array is required") || 
        error.message.includes("Cannot compare more than 3 courses") ||
        error.message.includes("Invalid course IDs") ||
        error.message.includes("No valid course IDs")) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error while fetching courses for comparison"
    });
  }
})

// @desc    Get comparison data for specific courses
// @route   GET /api/compare/:courseIds
// @access  Public
router.get("/:courseIds", async (req, res) => {
  try {
    const { courseIds } = req.params;
    
    if (!courseIds) {
      return res.status(400).json({
        success: false,
        message: "Course IDs parameter is required"
      });
    }

    const ids = courseIds.split(',');
    
    // Validate course IDs
    const validCourseIds = validateCourseIds(ids);

    const courses = await Course.find({ 
      _id: { $in: validCourseIds },
      status: "published",
      isPublished: true
    })
    .populate("instructor", "name avatar bio expertise")
    .select("title description subtitle image price category level language ratings studentsEnrolled totalHours lecturesCount requirements whatYoullLearn isPremium slug features")
    .lean();

    if (courses.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No published courses found for the provided IDs"
      });
    }

    // Format comparison data
    const comparisonData = {
      courses: courses,
      fields: [
        {
          key: "price",
          label: "Price",
          type: "currency"
        },
        {
          key: "ratings.average",
          label: "Rating", 
          type: "rating"
        },
        {
          key: "ratings.count",
          label: "Reviews",
          type: "number"
        },
        {
          key: "studentsEnrolled",
          label: "Students Enrolled",
          type: "number"
        },
        {
          key: "totalHours",
          label: "Total Duration",
          type: "hours"
        },
        {
          key: "lecturesCount",
          label: "Lectures",
          type: "number"
        },
        {
          key: "level",
          label: "Level",
          type: "text"
        },
        {
          key: "language",
          label: "Language",
          type: "text"
        },
        {
          key: "category",
          label: "Category",
          type: "text"
        }
      ]
    };

    res.status(200).json({
      success: true,
      data: comparisonData
    });

  } catch (error) {
    console.error("Comparison data error:", error);
    
    if (error.message.includes("Course IDs parameter is required") || 
        error.message.includes("Cannot compare more than 3 courses") ||
        error.message.includes("Invalid course IDs") ||
        error.message.includes("No valid course IDs")) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error while fetching comparison data"
    });
  }
});

// @desc    Get available courses for comparison (to help users find valid course IDs)
// @route   GET /api/compare/available/courses
// @access  Public
router.get("/available/courses", async (req, res) => {
  try {
    const { limit = 10, page = 1 } = req.query;
    
    const courses = await Course.find({ 
      status: "published",
      isPublished: true
    })
    .select("_id title price category level ratings studentsEnrolled")
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit))
    .sort({ studentsEnrolled: -1 })
    .lean();

    res.status(200).json({
      success: true,
      data: courses,
      count: courses.length
    });

  } catch (error) {
    console.error("Available courses error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching available courses"
    });
  }
});

module.exports = router;