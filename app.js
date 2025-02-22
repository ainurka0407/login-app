// app.js
const express = require('express');
const session = require('express-session');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');

const app = express();
const PORT = process.env.PORT || 3000;

// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const viewRoutes = require('./routes/viewRoutes');

// 1) Serve static files
app.use(express.static('public'));

// 2) Parse incoming data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3) Sanitize
app.use(mongoSanitize());

// 4) CORS
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// 5) Session
app.use(session({
  secret: process.env.SESSION_SECRET || 'default-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // set secure=true in production with HTTPS
}));

// 6) Routes
app.use('/', viewRoutes);
app.use('/auth', authRoutes);
app.use('/user', userRoutes);

// 7) Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
