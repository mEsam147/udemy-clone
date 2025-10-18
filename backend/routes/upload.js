// routes/uploadRoutes.js
const express = require("express");
const multer = require("multer");
const { generalStorage } = require("../config/cloudinary");
const {
  uploadSingleVideo,
  uploadSingleImage,
} = require("../controllers/uploadController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");

const router = express.Router();

const upload = multer({
  storage: generalStorage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB limit for videos, 10MB for images
  fileFilter: (req, file, cb) => {
    // You might want more specific file filters here if this is a general upload route
    if (
      file.mimetype.startsWith("image/") ||
      file.mimetype.startsWith("video/")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Unsupported file type!"), false);
    }
  },
});

router.post(
  "/video",
  protect,
  restrictTo("instructor", "admin"),
  upload.single("video"),
  uploadSingleVideo
);
router.post(
  "/image",
  protect,
  restrictTo("instructor", "admin"),
  upload.single("image"),
  uploadSingleImage
);

module.exports = router;
