const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');
const authMiddleware = require('../utils/authenticate'); // Optionally add an admin-check middleware

// GET current video configuration
router.get('/get-config', videoController.getVideoConfig);

// PUT to update video URLs (admin only)
router.put('/update-urls', authMiddleware, videoController.updateVideoUrls);

module.exports = router;
