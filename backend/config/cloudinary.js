// config/cloudinary.js
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");

const cloudinaryConfig = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
};

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    console.log(
      "Processing file:",
      file.fieldname,
      file.mimetype,
      file.originalname
    );
    return {
      folder: "courses",
      resource_type:
        file.mimetype.startsWith("video") ||
        file.mimetype === "application/octet-stream"
          ? "video"
          : "image",
      public_id: `${Date.now()}-${file.originalname}`,
    };
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    console.log(
      "Filtering file:",
      file.fieldname,
      file.mimetype,
      file.originalname
    );
    const validVideoExtensions = [
      ".mp4",
      ".mov",
      ".avi",
      ".wmv",
      ".flv",
      ".mkv",
      ".webm",
    ];
    const extension = file.originalname
      .toLowerCase()
      .slice(file.originalname.lastIndexOf("."));
    if (
      file.fieldname === "image" &&
      !file.mimetype.match(/image\/(jpg|jpeg|png|gif|bmp|webp)/i)
    ) {
      return cb(new Error("Only image files are allowed for course image!"));
    } else if (
      file.fieldname === "video" &&
      !(
        file.mimetype.match(/video\/(mp4|mov|avi|wmv|flv|mkv|webm)/i) ||
        (file.mimetype === "application/octet-stream" &&
          validVideoExtensions.includes(extension))
      )
    ) {
      return cb(new Error("Only video files are allowed for lessons!"));
    }
    cb(null, true);
  },
  limits: { fileSize: 500 * 1024 * 1024, files: 1 }, // 500MB for Cloudinary free tier
});

module.exports = { cloudinary, cloudinaryConfig, upload };
