// server.js
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const helmet = require('helmet');

const app = express();

// Use Helmet for security headers and a custom content security policy
app.use(helmet());
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:"],
      frameSrc: ["'self'", "https://*.youtube.com", "https://*.youtube-nocookie.com"],
    },
  })
);

// Health-check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// CORS configuration (Update origin for production if needed)
const corsOptions = {
  origin: 'http://localhost:3000', // Change this to your deployed front-end URL in production
  credentials: true,
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware (adjust options for production as needed)
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'default-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false, // Change to true if using HTTPS in production
      httpOnly: true,
      maxAge: 60000,
    },
  })
);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'views')));
app.use(express.static(path.join(__dirname, 'assets')));
app.use('/bootstrap/css', express.static(path.join(__dirname, 'bootstrap/css')));
app.use('/bootstrap/js', express.static(path.join(__dirname, 'bootstrap/js')));
app.use('/js', express.static(path.join(__dirname, 'js')));

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;
mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 50000 })
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const testRoutes = require('./routes/testRoutes'); // if needed
const viewRoutes = require('./routes/viewRoutes');
const testResultsRoutes = require('./routes/testResultsRoutes');
const videoRoutes = require('./routes/videoRoutes');

// Mount routes
app.use('/test', testResultsRoutes);
app.use('/video', videoRoutes);
app.use('/', viewRoutes);
app.use('/auth', authRoutes);
console.log("Mounting authRoutes at /auth");
app.use('/user', userRoutes);
app.use('/test', testRoutes);

// Fallback Content Security Policy header (if needed)
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; style-src 'self' https://fonts.googleapis.com https://cdn.jsdelivr.net 'unsafe-inline';"
  );
  next();
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
