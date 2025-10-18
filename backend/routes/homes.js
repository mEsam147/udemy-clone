// routes/home.js
const express = require("express");
const router = express.Router();
const { getHomeData, searchContent } = require("../controllers/homeController");

// Public route with language support
// Usage: /api/home?lang=en OR /api/home?lang=ar
router.get("/", getHomeData);

router.get("/search", searchContent);


module.exports = router;