// utils/certificateUtils.js
const crypto = require("crypto");

class CertificateUtils {
  static generateCertificateId(enrollmentId, courseId, studentId) {
    // Create a unique identifier
    const timestamp = Date.now().toString();
    const random = crypto.randomBytes(4).toString("hex");
    
    // Combine parts to create certificate ID
    const parts = [
      studentId.toString().substring(0, 8),
      courseId.toString().substring(0, 8),
      timestamp.substring(4), // YYYYMMDD
      random,
    ].join("-");

    return `MINI-${parts.toUpperCase()}`;
  }

  static validateCertificateIdFormat(certificateId) {
    // Basic validation for certificate ID format
    const regex = /^MINI-[A-F0-9]{8}-[A-F0-9]{8}-\d{6,8}-[A-F0-9]{8}$/i;
    return regex.test(certificateId);
  }

  static generateVerificationHash(enrollmentId, courseId, completionDate) {
    // Create a hash for verification
    const data = `${enrollmentId}${courseId}${completionDate}`;
    return crypto.createHash("sha256").update(data).digest("hex").substring(0, 16);
  }
}

module.exports = CertificateUtils;