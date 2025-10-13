// const Certificate = require("../models/Certificate");
// const Course = require("../models/Course");
// const Enrollment = require("../models/Enrollment");

// // @desc    Get certificate for a course
// // @route   GET /api/certificates/course/:courseId
// // @access  Private (student who completed the course)
// exports.getCertificate = async (req, res) => {
//   try {
//     const course = await Course.findById(req.params.courseId);
//     if (!course) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Course not found" });
//     }

//     const enrollment = await Enrollment.findOne({
//       student: req.user._id,
//       course: course._id,
//     });
//     if (!enrollment || enrollment.progress < 100) {
//       return res.status(403).json({
//         success: false,
//         message: "You must complete the course to get the certificate",
//       });
//     }

//     let certificate = await Certificate.findOne({
//       student: req.user._id,
//       course: course._id,
//     });
//     if (!certificate) {
//       // Generate certificate if not exists
//       const verificationCode = `CERT-${require("crypto").randomBytes(8).toString("hex")}`;
//       certificate = new Certificate({
//         student: req.user._id,
//         course: course._id,
//         certificateUrl: `${process.env.BASE_URL || 'http://localhost:3000'}/certificates/verify/${verificationCode}`,
//         verificationCode,
//       });
//       await certificate.save();
//     }

//     res.json({ success: true, data: certificate });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // @desc    Verify a certificate
// // @route   GET /api/certificates/verify/:verificationCode
// // @access  Public
// exports.verifyCertificate = async (req, res) => {
//   try {
//     const certificate = await Certificate.findOne({
//       verificationCode: req.params.verificationCode,
//     })
//       .populate("student", "name email")
//       .populate("course", "title instructor description duration");

//     if (!certificate) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Certificate not found" });
//     }

//     res.json({ 
//       success: true, 
//       data: certificate 
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // @desc    Get all certificates for a student
// // @route   GET /api/certificates/student
// // @access  Private
// exports.getAllCertificates = async (req, res) => {
//   try {
//     const certificates = await Certificate.find({
//       student: req.user._id,
//     })
//       .populate("course", "title instructor")
//       .select("course issuedAt verificationCode certificateUrl")
//       .sort({ issuedAt: -1 });

//     res.json({ success: true, data: certificates });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // @desc    Generate certificate PDF
// // @route   POST /api/certificates/:certificateId/generate-pdf
// // @access  Private
// exports.generateCertificatePDF = async (req, res) => {
//   try {
//     const certificate = await Certificate.findById(req.params.certificateId)
//       .populate("student", "name")
//       .populate("course", "title instructor");

//     if (!certificate) {
//       return res.status(404).json({ success: false, message: "Certificate not found" });
//     }

//     // In a real implementation, you would generate a PDF here
//     // For now, we'll return the certificate data
//     res.json({ 
//       success: true, 
//       data: {
//         ...certificate.toObject(),
//         pdfUrl: `${process.env.BASE_URL || 'http://localhost:3000'}/api/certificates/${certificate._id}/download`
//       }
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

const Certificate = require("../models/Certificate");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

// @desc    Get certificate for a course
// @route   GET /api/certificates/course/:courseId
// @access  Private (student who completed the course)
exports.getCertificate = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: course._id,
    });
    if (!enrollment || enrollment.progress < 100) {
      return res.status(403).json({
        success: false,
        message: "You must complete the course to get the certificate",
      });
    }

    let certificate = await Certificate.findOne({
      student: req.user._id,
      course: course._id,
    });
    
    if (!certificate) {
      const verificationCode = `CERT-${require("crypto").randomBytes(8).toString("hex")}`;
      certificate = new Certificate({
        student: req.user._id,
        course: course._id,
        certificateUrl: `${process.env.BASE_URL || 'http://localhost:3000'}/certificates/verify/${verificationCode}`,
        verificationCode,
        issuedAt: new Date(),
      });
      await certificate.save();
    }

    res.json({ success: true, data: certificate });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify a certificate
// @route   GET /api/certificates/verify/:verificationCode
// @access  Public
exports.verifyCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findOne({
      verificationCode: req.params.verificationCode,
    })
      .populate("student", "name email")
      .populate("course", "title instructor description duration");

    if (!certificate) {
      return res.status(404).json({ success: false, message: "Certificate not found" });
    }

    res.json({ 
      success: true, 
      data: certificate 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all certificates for a student
// @route   GET /api/certificates/student
// @access  Private
exports.getAllCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find({
      student: req.user._id,
    })
      .populate("course", "title instructor")
      .select("course issuedAt verificationCode certificateUrl")
      .sort({ issuedAt: -1 });

    res.json({ success: true, data: certificates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Generate certificate PDF
// @route   POST /api/certificates/:certificateId/generate-pdf
// @access  Private
exports.generateCertificatePDF = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.certificateId)
      .populate("student", "name")
      .populate("course", "title instructor duration");

    if (!certificate) {
      return res.status(404).json({ success: false, message: "Certificate not found" });
    }

    // Generate PDF
    const doc = new PDFDocument({
      layout: 'landscape',
      size: 'A4',
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=certificate-${certificate.verificationCode}.pdf`);

    // Pipe PDF to response
    doc.pipe(res);

    // Add background
    doc.rect(0, 0, doc.page.width, doc.page.height)
       .fill('#f8fafc');

    // Border
    doc.strokeColor('#3b82f6')
       .lineWidth(20)
       .roundedRect(40, 40, doc.page.width - 80, doc.page.height - 80, 10)
       .stroke();

    // Decorative elements
    doc.fillColor('#dbeafe')
       .rect(0, 0, 60, doc.page.height)
       .fill();
    
    doc.fillColor('#dbeafe')
       .rect(doc.page.width - 60, 0, 60, doc.page.height)
       .fill();

    // Title
    doc.fillColor('#1e40af')
       .fontSize(36)
       .font('Helvetica-Bold')
       .text('CERTIFICATE OF COMPLETION', 0, 120, {
         align: 'center',
         width: doc.page.width
       });

    // Subtitle
    doc.fillColor('#64748b')
       .fontSize(18)
       .font('Helvetica')
       .text('This is to certify that', 0, 180, {
         align: 'center',
         width: doc.page.width
       });

    // Student Name
    doc.fillColor('#1e293b')
       .fontSize(42)
       .font('Helvetica-Bold')
       .text(certificate.student.name, 0, 220, {
         align: 'center',
         width: doc.page.width
       });

    // Course completion text
    doc.fillColor('#64748b')
       .fontSize(16)
       .font('Helvetica')
       .text('has successfully completed the course', 0, 290, {
         align: 'center',
         width: doc.page.width
       });

    // Course Title
    doc.fillColor('#1e40af')
       .fontSize(24)
       .font('Helvetica-Bold')
       .text(`"${certificate.course.title}"`, 0, 320, {
         align: 'center',
         width: doc.page.width
       });

    // Instructor
    if (certificate.course.instructor) {
      doc.fillColor('#64748b')
         .fontSize(14)
         .font('Helvetica')
         .text(`Instructor: ${certificate.course.instructor.name}`, 0, 360, {
           align: 'center',
           width: doc.page.width
         });
    }

    // Date issued
    const issuedDate = new Date(certificate.issuedAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    doc.fillColor('#64748b')
       .fontSize(14)
       .font('Helvetica')
       .text(`Issued on: ${issuedDate}`, 0, 400, {
         align: 'center',
         width: doc.page.width
       });

    // Verification section
    doc.fillColor('#94a3b8')
       .fontSize(12)
       .font('Helvetica')
       .text(`Verification Code: ${certificate.verificationCode}`, 0, 460, {
         align: 'center',
         width: doc.page.width
       });

    doc.text(`Verify at: ${process.env.BASE_URL || 'http://localhost:3000'}/certificates/verify/${certificate.verificationCode}`, 0, 480, {
      align: 'center',
      width: doc.page.width
    });

    // Footer
    doc.fillColor('#1e40af')
       .fontSize(16)
       .font('Helvetica-Bold')
       .text('Learnify Academy', 0, doc.page.height - 80, {
         align: 'center',
         width: doc.page.width
       });

    // Finalize PDF
    doc.end();

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Download certificate PDF
// @route   GET /api/certificates/:certificateId/download
// @access  Private
exports.downloadCertificatePDF = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.certificateId)
      .populate("student", "name")
      .populate("course", "title instructor duration");

    if (!certificate) {
      return res.status(404).json({ success: false, message: "Certificate not found" });
    }

    const doc = new PDFDocument({
      layout: 'landscape',
      size: 'A4',
    });

    // Set download headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=certificate-${certificate.verificationCode}.pdf`);

    doc.pipe(res);

    // PDF content (same as generateCertificatePDF)
    doc.rect(0, 0, doc.page.width, doc.page.height)
       .fill('#f8fafc');

    doc.strokeColor('#3b82f6')
       .lineWidth(20)
       .roundedRect(40, 40, doc.page.width - 80, doc.page.height - 80, 10)
       .stroke();

    doc.fillColor('#dbeafe')
       .rect(0, 0, 60, doc.page.height)
       .fill();
    
    doc.fillColor('#dbeafe')
       .rect(doc.page.width - 60, 0, 60, doc.page.height)
       .fill();

    doc.fillColor('#1e40af')
       .fontSize(36)
       .font('Helvetica-Bold')
       .text('CERTIFICATE OF COMPLETION', 0, 120, {
         align: 'center',
         width: doc.page.width
       });

    doc.fillColor('#64748b')
       .fontSize(18)
       .font('Helvetica')
       .text('This is to certify that', 0, 180, {
         align: 'center',
         width: doc.page.width
       });

    doc.fillColor('#1e293b')
       .fontSize(42)
       .font('Helvetica-Bold')
       .text(certificate.student.name, 0, 220, {
         align: 'center',
         width: doc.page.width
       });

    doc.fillColor('#64748b')
       .fontSize(16)
       .font('Helvetica')
       .text('has successfully completed the course', 0, 290, {
         align: 'center',
         width: doc.page.width
       });

    doc.fillColor('#1e40af')
       .fontSize(24)
       .font('Helvetica-Bold')
       .text(`"${certificate.course.title}"`, 0, 320, {
         align: 'center',
         width: doc.page.width
       });

    if (certificate.course.instructor) {
      doc.fillColor('#64748b')
         .fontSize(14)
         .font('Helvetica')
         .text(`Instructor: ${certificate.course.instructor.name}`, 0, 360, {
           align: 'center',
           width: doc.page.width
         });
    }

    const issuedDate = new Date(certificate.issuedAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    doc.fillColor('#64748b')
       .fontSize(14)
       .font('Helvetica')
       .text(`Issued on: ${issuedDate}`, 0, 400, {
         align: 'center',
         width: doc.page.width
       });

    doc.fillColor('#94a3b8')
       .fontSize(12)
       .font('Helvetica')
       .text(`Verification Code: ${certificate.verificationCode}`, 0, 460, {
         align: 'center',
         width: doc.page.width
       });

    doc.text(`Verify at: ${process.env.BASE_URL || 'http://localhost:3000'}/certificates/verify/${certificate.verificationCode}`, 0, 480, {
      align: 'center',
      width: doc.page.width
    });

    doc.fillColor('#1e40af')
       .fontSize(16)
       .font('Helvetica-Bold')
       .text('Learnify Academy', 0, doc.page.height - 80, {
         align: 'center',
         width: doc.page.width
       });

    doc.end();

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// controllers/certificateController.js


// ... (previous imports and functions remain the same)

// @desc    Check if user can get certificate for a course
// @route   GET /api/certificates/course/:courseId/check
// @access  Private
exports.checkCertificateEligibility = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: course._id,
    });

    const canGetCertificate = enrollment && enrollment.progress >= 100;
    const message = canGetCertificate 
      ? "You are eligible to receive a certificate" 
      : "Complete the course to get a certificate";

    res.json({ 
      success: true, 
      data: { 
        canGet: canGetCertificate,
        message,
        progress: enrollment?.progress || 0
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get certificate by ID
// @route   GET /api/certificates/:certificateId
// @access  Private
exports.getCertificateById = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.certificateId)
      .populate("student", "name email")
      .populate("course", "title instructor description duration");

    if (!certificate) {
      return res.status(404).json({ success: false, message: "Certificate not found" });
    }

    // Check if the certificate belongs to the user
    if (certificate.student._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    res.json({ success: true, data: certificate });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};