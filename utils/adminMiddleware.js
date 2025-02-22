// utils/adminMiddleware.js
module.exports = (req, res, next) => {
    // Check if req.user exists and has the admin email or an admin flag.
    if (req.user && (req.user.email === 'admin@admin' || req.user.isAdmin)) {
      next();
    } else {
      res.status(403).json({ message: 'Access denied. Admins only.' });
    }
  };
  