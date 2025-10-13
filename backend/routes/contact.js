// routes/contact.js
const express = require('express');
const router = express.Router();
const {
  createContact,
  getContacts,
  getContact,
  updateContact,
  deleteContact,
  getContactStats
} = require('../controllers/contactController');
const { contactValidation } = require('../middlewares/validation');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

// Public routes
router.post('/', contactValidation, createContact);

// Admin routes
router.get('/', protect, restrictTo('admin'), getContacts);
router.get('/stats/overview', protect, restrictTo('admin'), getContactStats);
router.get('/:id', protect, restrictTo('admin'), getContact);
router.put('/:id', protect, restrictTo('admin'), updateContact);
router.delete('/:id', protect, restrictTo('admin'), deleteContact);

module.exports = router;