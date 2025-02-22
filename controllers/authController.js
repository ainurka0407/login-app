// controllers/authController.js
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const { generateToken } = require('../utils/jwt');
const nodemailer = require('nodemailer');

// Helper: Generate a random 6-digit code as a string
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Helper: Send a verification email using Gmail SMTP via STARTTLS
// Note: This function will send the OTP to the email address provided.
// Since your workflow is: register → login → verify (in profile),
// the user's email is available in req.user when this function is called.
// controllers/authController.js

// Helper: Send a verification email using Gmail SMTP via STARTTLS
async function sendVerificationEmail(email, code) {
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.GMAIL_USER, // Your Gmail address
      pass: process.env.GMAIL_PASS  // Your Gmail App Password (if 2FA is enabled)
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  transporter.verify(function(error, success) {
    if (error) {
      console.error("SMTP connection error:", error);
    } else {
      console.log("SMTP server is ready to take our messages");
    }
  });

  const mailOptions = {
    from: `"MyApp" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "Your Verification Code",
    text: `Your verification code is: ${code}`,
    html: `<p>Your verification code is: <strong>${code}</strong></p>`
  };

  let info = await transporter.sendMail(mailOptions);
  console.log("Verification email sent:", info.messageId);
  console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
}
// ─────────────────────────────────────────────────────────────────────────────
// REGISTER (User registers with email and password; the email is stored but not yet verified)
exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required' });

    const trimmedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: trimmedEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already taken' });
    }

    // Create a new user with isVerified: false.
    // The user will verify the email later from the profile page.
    const newUser = new User({
      email: trimmedEmail,
      password,
      isVerified: false
    });

    await newUser.save();
    res.status(201).json({
      message: 'Registration successful. You can now log in.'
    });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Something went wrong', error });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// SEND VERIFICATION OTP (This endpoint is called from the profile page once the user is logged in)
// The authenticated user (req.user) already has an email from login,
// so we use that email address to send the OTP.
exports.sendVerificationOtp = async (req, res) => {
  try {
    const user = req.user;  // req.user is set by your authentication middleware
    if (!user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Email is already verified.' });
    }

    const code = generateVerificationCode();
    user.verificationCode = code;
    await user.save();

    await sendVerificationEmail(user.email, code);

    res.status(200).json({ success: true, message: 'Verification code sent.' });
  } catch (error) {
    console.error('Error sending verification code:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// VERIFY OTP (Called from the profile page after the user enters the OTP)
// This endpoint compares the OTP entered by the user with the one stored in the database.
exports.verifyOtp = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'Already verified.' });
    }

    const { otp } = req.body;
    if (!otp) {
      return res.status(400).json({ success: false, message: 'OTP is required.' });
    }

    if (user.verificationCode !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP.' });
    }

    user.isVerified = true;
    user.verificationCode = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully!'
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// LOGIN (Handles both admin and normal user login)
// Once logged in, the server sets req.session.user and returns a JWT token.
// The logged-in user's email is then available via req.user for further actions,
// such as sending the verification OTP.
exports.login = async (req, res) => {
  const { email, password } = req.body;
  const trimmedEmail = email.toLowerCase().trim();

  // Check for admin login
  if (trimmedEmail === 'admin@admin') {
    if (password !== 'admin') {
      return res.status(400).json({ message: 'Incorrect password for admin.' });
    }
    // Create an admin user object (hard-coded)
    const adminUser = { _id: 'admin', email: 'admin@admin', isAdmin: true, tokens: [] };
    const token = generateToken(adminUser._id, req.headers['device-id'] || 'default-device-id');
    req.session.user = { _id: adminUser._id, email: adminUser.email, isAdmin: true };
    return res.status(200).json({
      message: 'Login successful',
      token,
      user: { email: adminUser.email, isAdmin: true }
    });
  }

  // Normal user login flow...
  try {
    const user = await User.findOne({ email: trimmedEmail });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect password' });
    }

    req.session.user = { _id: user._id, email: user.email };
    const token = generateToken(user._id, req.headers['device-id'] || 'default-device-id');
    user.tokens.push({ token, deviceId: req.headers['device-id'] || 'default-device-id' });
    await user.save();

    res.status(200).json({
      message: 'Login successful',
      token,
      user: { email: user.email }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};
