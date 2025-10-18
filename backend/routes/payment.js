const express = require("express");
const {
  createCheckoutSession,
  handleStripeWebhook,
  retrieveCheckoutSession,
  verifyAndCreateEnrollment,
  createPlanCheckoutSession,
  getUserPlan,
  updateUserPlan,
  verifySubscription,
} = require("../controllers/paymentController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");
const {
  createEnrollmentFromPayment,
} = require("../controllers/enrollmentController");

const router = express.Router();

router.post("/checkout", protect, restrictTo("student"), createCheckoutSession);
router.get("/session/:sessionId", protect, retrieveCheckoutSession);

router.post("/verify-subscription", protect, verifySubscription);

router.post("/plan-checkout", protect, createPlanCheckoutSession);
router.get("/user-plan", protect, getUserPlan);
router.post("/update-plan", protect, restrictTo("admin"), updateUserPlan);


router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);
// In your payment routes (backend/routes/payment.js)
router.post(
  "/verify-enroll",
  protect,
  restrictTo("student"),
  verifyAndCreateEnrollment
);

// backend/routes/payment.js - Verify you have this route

// backend/routes/enrollments.js - And this route exists
router.post(
  "/payment/enroll",
  protect,
  restrictTo("student"),
  createEnrollmentFromPayment
);

module.exports = router;
