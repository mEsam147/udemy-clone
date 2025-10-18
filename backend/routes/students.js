const express = require("express");
const {
  getStudentDashboard,
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  getLearningActivity,
} = require("../controllers/studentController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(protect);
router.use(restrictTo("student"));

router.get("/dashboard", getStudentDashboard);
router.get("/wishlist", getWishlist);
router.post("/wishlist/:courseId", addToWishlist);
router.delete("/wishlist/:courseId", removeFromWishlist);
router.get("/activity", getLearningActivity);

module.exports = router;
