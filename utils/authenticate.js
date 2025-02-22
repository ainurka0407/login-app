// utils/authenticate.js
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token)
    return res.status(401).json({ error: 'Access denied. Token missing.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    

    // If the token belongs to admin (we hard-coded admin's _id as "admin")
    if (decoded.userId === "admin") {
      req.user = { _id: "admin", email: "admin@admin", isAdmin: true };
      req.token = token;
      return next();
    }

    // For normal users, look up the user in the database.
    const user = await User.findOne({ _id: decoded.userId, 'tokens.token': token });
    if (!user) return res.status(403).json({ error: 'Invalid token' });
    
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = authenticate;
