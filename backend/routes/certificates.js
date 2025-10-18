// routes/certificates.js
const express = require('express');
const router = express.Router();
const {
  getCertificate,
  verifyCertificate,
  getAllCertificates,
  generateCertificatePDF,
  downloadCertificatePDF,
  checkCertificateEligibility,
  getCertificateById
} = require('../controllers/certificateController');
const { protect } = require('../middlewares/authMiddleware');

// Public routes
router.get('/verify/:verificationCode', verifyCertificate);

// Protected routes
router.get('/student', protect, getAllCertificates);
router.get('/course/:courseId', protect, getCertificate);
router.get('/course/:courseId/check', protect, checkCertificateEligibility);
router.get('/:certificateId', protect, getCertificateById);
router.post('/:certificateId/generate-pdf', protect, generateCertificatePDF);
router.get('/:certificateId/download', protect, downloadCertificatePDF);

module.exports = router;