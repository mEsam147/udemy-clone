const express = require('express')
const router = express.Router()
const {
  dashboardSearch,
  getRecentSearches,
  clearRecentSearches,
} = require('../controllers/searchController')
const { protect } = require('../middlewares/authMiddleware')

// All search routes are protected
router.use(protect)

// Main search endpoint
router.get('/dashboard', dashboardSearch)

// Recent searches management
router.get('/recent', getRecentSearches)
router.delete('/recent', clearRecentSearches)

module.exports = router
