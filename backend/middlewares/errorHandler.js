// middleware/errorHandler.js - Add learning-specific errors
const ErrorResponse = require("../utils/errorResponse");

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  console.error("ERROR: ", err);

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = "Resource not found with that ID";
    error = new ErrorResponse(message, 404);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = "Duplicate field value entered";
    error = new ErrorResponse(message, 400);
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((val) => val.message);
    error = new ErrorResponse(message, 400);
  }

  // Enrollment-specific errors
  if (err.name === "EnrollmentError") {
    error = new ErrorResponse(err.message, 403);
  }

  // Certificate-specific errors
  if (err.name === "CertificateError") {
    error = new ErrorResponse(err.message, err.statusCode || 400);
  }

  // JWT Error
  if (err.name === "JsonWebTokenError") {
    const message = "JSON Web Token is invalid";
    error = new ErrorResponse(message, 401);
  }

  // JWT Expired error
  if (err.name === "TokenExpiredError") {
    const message = "JSON Web Token is expired";
    error = new ErrorResponse(message, 401);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.name || "Server Error",
    message: error.message || "Server Error",
  });
};

module.exports = errorHandler;