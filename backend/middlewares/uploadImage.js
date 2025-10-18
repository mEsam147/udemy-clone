const multer = require("multer");
const { imageStorage, imageFileFilter } = require("../config/cloudinary");

const uploadImage = multer({
  storage: imageStorage, // Use image-specific storage
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for images
  },
});

module.exports = uploadImage;
