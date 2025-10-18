const express = require("express");
const router = express.Router();
const {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
} = require("../controllers/notificationController");
const { protect } = require("../middlewares/authMiddleware");

router.get("/", protect, getNotifications);
router.put("/read-all", protect, markAllNotificationsAsRead); // Likely line 13
router.put("/:id/read", protect, markNotificationAsRead);
router.delete("/:id", protect, deleteNotification);
router.delete("/", protect, deleteAllNotifications);

module.exports = router;
