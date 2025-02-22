// models/user.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
  },
  tokens: [
    {
      token: { type: String, required: true },
      deviceId: { type: String, required: true },
    },
  ],
  isVerified: { 
    type: Boolean, 
    default: false 
  },
  verificationCode: {
    type: String,
    default: null
  }
});

// Pre-save hook to hash password if modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// (Optional) A method to generate an auth token
userSchema.methods.generateAuthToken = function (deviceId) {
  const token = jwt.sign({ userId: this._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  this.tokens.push({ token, deviceId });
  this.save();
  return token;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
