const multer = require("multer");
const { generalStorage } = require("../config/cloudinary"); // Use general for consistency

const uploadGeneral = multer({
  storage: generalStorage,
  fileFilter: (req, file, cb) => {
    // Check if it's an image
    if (file.fieldname === "image") {
      if (!file.mimetype.startsWith("image/")) {
        return cb(
          new Error("Only image files are allowed for course image!"),
          false
        );
      }
    }
    // Check if it's a video
    else if (
      file.fieldname === "lessonVideos[]" ||
      file.fieldname === "video"
    ) {
      if (!file.mimetype.startsWith("video/")) {
        return cb(
          new Error("Only video files are allowed for lessons!"),
          false
        );
      }
    }
    cb(null, true);
  },
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB limit
  },
});
