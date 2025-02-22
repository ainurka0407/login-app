//routes//auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticate = require('../utils/authenticate'); // Import middleware



// Login route
router.post('/login', authController.login);
// Register route
router.post('/register', authController.register);
module.exports = router;

router.get('/profile', authenticate, (req, res) => {
    res.json({ message: `Welcome ${req.user.email}`, user: req.user });
  });
  

const User = require('../models/user');



module.exports = authenticate;

