// utils/jwt.js
const jwt = require('jsonwebtoken');

const generateToken = (userId, deviceId) => {
  return jwt.sign({ userId, deviceId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = { generateToken, verifyToken };
