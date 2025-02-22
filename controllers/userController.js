// controllers/userController.js
const User = require('../models/user');
const bcrypt = require('bcryptjs');

// Register a new user (admin use or public registration alternative)
const registerUser = async (req, res) => {
  const { email, password } = req.body;
  // Check if email is already registered
  const existingUser = await User.findOne({ email });
  if (existingUser)
    return res.status(400).json({ error: 'User already exists' });

  // Create a new user
  const user = new User({ email, password });
  try {
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.registerUser = registerUser;

exports.updateUser = async (req, res) => {
  const userId = req.params.id;
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: 'Email and password are required!' });

  try {
    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ message: 'User not found!' });

    user.email = email;
    user.password = await bcrypt.hash(password, 10);
    await user.save();
    res.status(200).json({ message: 'User updated successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.deleteUser = async (req, res) => {
  const userId = req.params.id;
  try {
    // Use findByIdAndDelete to delete the user
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found!' });
    }
    res.status(200).json({ message: 'User deleted successfully!' });
  } catch (error) {
    console.error("Error in deleteUser:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    // Adjust the projection fields as needed
    const users = await User.find({}, '_id email');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getCurrentUser = (req, res) => {
  if (req.session.email) {
    res.json({ email: req.session.email });
  } else {
    res.json({ email: null });
  }
};

exports.changePassword = async (req, res) => {
  try {
    // req.user is set by the authenticate middleware
    const user = req.user;
    const { newPassword, confirmPassword } = req.body;

    if (!newPassword || !confirmPassword) {
      return res.status(400).json({ message: "Both new password and confirmation are required." });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }

    // Instead of hashing manually, simply assign the new plain password.
    // The pre-save hook in the User model will hash it.
    user.password = newPassword;

    // (Optional) Clear existing tokens so that old tokens are invalidated.
    user.tokens = [];

    // Save the updated user document.
    await user.save();

    res.json({ message: "Password changed successfully." });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ message: "Error changing password", error });
  }
};

exports.changeUserPasswordAdmin = async (req, res) => {
  try {
    const userId = req.params.id;
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ message: 'Password is required!' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found!' });

    // Assign the new plain text password so that the pre-save hook hashes it only once.
    user.password = password;
    // Optionally clear existing tokens so that old tokens become invalid
    user.tokens = [];
    await user.save();

    res.status(200).json({ message: 'Password updated successfully!' });
  } catch (error) {
    console.error("Error in changeUserPasswordAdmin:", error);
    res.status(500).json({ message: 'Server error', error });
  }
};