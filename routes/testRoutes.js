//testRoutes.js
const express = require('express');
const router = express.Router();
const testController = require('../controllers/testController');
const authMiddleware = require('../utils/authenticate');


router.get('/get-tests', testController.getTests);

router.delete('/delete/:id', authMiddleware, testController.deleteTestQuestion);

router.post('/add-question', authMiddleware, testController.addTestQuestion);

module.exports = router;
