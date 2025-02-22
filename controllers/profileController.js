// controllers/profileController.js
const UserProfile = require("../models/userProfile");

exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user._id; // Set by the authenticate middleware
    let userProfile = await UserProfile.findOne({ user_id: userId });
    if (!userProfile) {
      // Auto-create a profile by only providing the user_id;
      // The default empty strings for name, surname, faculty, and group will be applied.
      userProfile = await UserProfile.create({ user_id: userId });
    }
    res.json({ user: userProfile });
  } catch (error) {
    console.error("Error in getUserProfile:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, surname, faculty, group } = req.body;
    if (!name || !surname || !faculty || !group)
      return res.status(400).json({ message: "All fields are required" });

    const updatedProfile = await UserProfile.findOneAndUpdate(
      { user_id: userId },
      { name, surname, faculty, group },
      { new: true, upsert: true }
    );
    res.json({ message: "Profile updated successfully", updatedProfile });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Error updating profile", error });
  }
};
