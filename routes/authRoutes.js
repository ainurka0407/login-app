// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const authenticate = require('../utils/authenticate'); // <-- IMPORT HERE

// Login route
router.post('/login', authController.login);

// Register route
router.post('/register', authController.register);

// (Optional) Get current user by token
router.get('/current-user', async (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('email');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ email: user.email });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
});


// New endpoints for two-step verification from profile
// In authRoutes.js
router.post('/send-verification-otp', authenticate, authController.sendVerificationOtp);
router.post('/verify-otp', authenticate, authController.verifyOtp);



module.exports = router;
