const jwt = require("jsonwebtoken");
const User = require("../models/User");
const rateLimit = require("express-rate-limit");

// Protect routes
exports.protect = async (req, res, next) => {
  try {
    let token;

    console.log("cookies token", req.cookies);
    // Check cookies first
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    // Fallback to Authorization header
    else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
      console.log("✅ Token from Authorization header:", token);
    }

    if (!token) {
      console.log("❌ No token found in cookies or headers");
      return res
        .status(401)
        .json({ message: "Not authorized to access this route" });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("✅ Token decoded successfully:", decoded);

      // Get user from the token
      req.user = await User.findById(decoded.id);

      if (!req.user) {
        console.log("❌ User not found for token");
        return res
          .status(401)
          .json({ message: "Not authorized to access this route" });
      }

      console.log("✅ User authenticated:", req.user.email);
      next();
    } catch (error) {
      console.log("❌ Token verification failed:", error.message);
      return res
        .status(401)
        .json({ message: "Not authorized to access this route" });
    }
  } catch (error) {
    console.log("💥 Auth middleware error:", error);
    next(error);
  }
};

// Grant access to specific roles
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role ${req.user.role} is not authorized to access this route`,
      });
    }
    next();
  };
};

exports.passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // limit each IP to 3 reset requests per windowMs
  message: {
    success: false,
    message: "Too many password reset attempts. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
