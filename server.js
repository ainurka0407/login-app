// server.js
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');

const app = express();

// --- Security & Sanitization Middleware ---
// Use Helmet for security headers including a custom Content Security Policy
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

// Use express-mongo-sanitize to prevent NoSQL injection attacks
app.use(mongoSanitize());

// --- Basic Endpoints ---
// Health-check endpoint for uptime monitoring
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// --- CORS Configuration ---
// Update origin in production (e.g. your front-end URL)
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
};
app.use(cors(corsOptions));

// --- Body Parsing Middleware ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Session Middleware ---
// Note: In production, consider using a session store like connect-mongo
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'default-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // set secure cookies in production
      httpOnly: true,
      maxAge: 60000,
    },
  })
);

// --- Static Files ---
// Serve files from public directories (adjust as needed)
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'views')));
app.use(express.static(path.join(__dirname, 'assets')));
app.use('/bootstrap/css', express.static(path.join(__dirname, 'bootstrap/css')));
app.use('/bootstrap/js', express.static(path.join(__dirname, 'bootstrap/js')));
app.use('/js', express.static(path.join(__dirname, 'js')));

// --- MongoDB Connection ---
const MONGODB_URI = process.env.MONGODB_URI;
mongoose
  .connect(MONGODB_URI, { serverSelectionTimeoutMS: 50000 })
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

// --- Import and Mount Routes ---
// (Make sure the files exist in your ./routes directory)
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const viewRoutes = require('./routes/viewRoutes');
// If you have additional test or video routes, mount them on unique paths
const testResultsRoutes = require('./routes/testResultsRoutes'); // e.g., for test results
const videoRoutes = require('./routes/videoRoutes');             // for video-related routes
const testRoutes = require('./routes/testRoutes');                 // avoid conflict with testResultsRoutes

// Mount routes with unique paths (adjust as necessary)
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/videos', videoRoutes);
app.use('/test-results', testResultsRoutes);
app.use('/tests', testRoutes); // Ensure these do not conflict with each other
app.use('/', viewRoutes); // Your default or view routes (e.g. home page)

// --- Fallback Content Security Policy Header ---
// (Optional – to enforce a strict policy on unmatched routes)
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; style-src 'self' https://fonts.googleapis.com https://cdn.jsdelivr.net 'unsafe-inline';"
  );
  next();
});

// --- Start Server ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
