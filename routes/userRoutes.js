// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const profileController = require('../controllers/profileController');
const authenticate = require('../utils/authenticate');
const adminMiddleware = require('../utils/adminMiddleware');

// (Optional) Admin registration endpoint (if needed)
router.post('/register', userController.registerUser);

// Admin routes for updating/deleting any user (by user ID)
router.delete('/delete/:id', authenticate, adminMiddleware, userController.deleteUser);
router.get('/get-users', authenticate, adminMiddleware, userController.getAllUsers);
router.get('/current-user', userController.getCurrentUser);
// Self–update routes for the logged-in user (profile information)
// Get your own profile
router.get('/profile', authenticate, profileController.getUserProfile);
// Update your own profile
router.put('/profile', authenticate, profileController.updateUserProfile);


// Route for changing password
router.put('/change-password', authenticate, userController.changePassword);
// New route for admin to change a user's password

router.put('/admin/change-password/:id', authenticate, adminMiddleware, userController.changeUserPasswordAdmin);


module.exports = router;
