// routes/viewRoutes.js
const express = require('express');
const router = express.Router();
const path = require('path');

router.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../views', 'login.html'));
});

router.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '../views', 'register.html'));
});


router.get('/managa', (req, res) => {
  // Check that a session exists and that the user is admin.
  if (!req.session.user || req.session.user.email !== 'admin@admin') {
    return res.redirect('/login.html');
  }
  res.sendFile(path.join(__dirname, '../views', 'managa.html'));
});
router.get('/profile', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login.html');
  }
  res.sendFile(path.join(__dirname, '../views', 'profile.html'));
});

module.exports = router;