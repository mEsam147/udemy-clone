// controllers/uploadController.js
const { cloudinary } = require("../config/cloudinary"); // Ensure cloudinary config is imported

// @desc    Upload a single video file
// @route   POST /api/upload/video
// @access  Private (e.g., instructor/admin)
exports.uploadSingleVideo = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No video file uploaded." });
    }

    // req.file will contain info from CloudinaryStorage
    res.status(200).json({
      success: true,
      message: "Video uploaded successfully",
      data: {
        url: req.file.path, // The Cloudinary URL
        public_id: req.file.filename, // The public ID from Cloudinary
        resource_type: "video", // Explicitly set as video
        // You might get duration from Cloudinary's response if configured
      },
    });
  } catch (error) {
    console.error("Error uploading video:", error);
    next(error);
  }
};

// @desc    Upload a single image file
// @route   POST /api/upload/image
// @access  Private (e.g., instructor/admin)
exports.uploadSingleImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file uploaded." });
    }

    res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      data: {
        url: req.file.path, // The Cloudinary URL
        public_id: req.file.filename, // The public ID from Cloudinary
        resource_type: "image", // Explicitly set as image
      },
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    next(error);
  }
};
