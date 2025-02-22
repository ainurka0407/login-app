//testResultsRoutes

const express = require('express');
const router = express.Router();
const testResultController = require('../controllers/testResultController');
const authMiddleware = require('../utils/authenticate');

// This endpoint will require authentication
router.get('/results', authMiddleware, testResultController.getUserResults);



router.post('/results', authMiddleware, testResultController.createTestResult);
//for admin see all results of users
router.get('/all-results', authMiddleware, testResultController.getAllResults);

module.exports = router;

