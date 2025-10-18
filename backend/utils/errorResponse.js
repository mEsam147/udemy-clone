class ErrorResponse extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Custom error classes for learning system
class EnrollmentError extends ErrorResponse {
  constructor(message = "Enrollment error occurred") {
    super(message, 403);
    this.name = "EnrollmentError";
  }
}

class CertificateError extends ErrorResponse {
  constructor(message = "Certificate error occurred", statusCode = 400) {
    super(message, statusCode);
    this.name = "CertificateError";
  }
}

class LearningProgressError extends ErrorResponse {
  constructor(message = "Learning progress error occurred") {
    super(message, 400);
    this.name = "LearningProgressError";
  }
}

class CourseAccessError extends ErrorResponse {
  constructor(message = "Course access denied") {
    super(message, 403);
    this.name = "CourseAccessError";
  }
}

module.exports = {
  ErrorResponse,
  EnrollmentError,
  CertificateError,
  LearningProgressError,
  CourseAccessError,
};
