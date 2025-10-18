// models/Notification.js
const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    enum: [
      "ENROLLMENT",
      "LESSON_COMPLETED",
      "WISHLIST_ADDED",
      "WISHLIST_REMOVED",
      "COURSE_CREATED",
      "LESSON_ADDED",
      "REVIEW_ADDED",
      "PAYMENT_SUCCESS",
      "COURSE_UPDATED",
      "COURSE_DELETED",
      "COURSE_COMPLETED", 
    ],
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    default: null,
  },
  read: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Notification", NotificationSchema);
