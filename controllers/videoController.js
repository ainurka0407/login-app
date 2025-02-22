const VideoConfig = require('../models/videoConfig');

// Update video URLs (admin only)
// This endpoint will update only the fields that are provided in the request body.
exports.updateVideoUrls = async (req, res) => {
  try {
    const { htmlVideoUrl, cssVideoUrl, jsVideoUrl } = req.body;
    
    // Find existing configuration or create new one if not exists
    let config = await VideoConfig.findOne({});
    if (!config) {
      config = new VideoConfig({ htmlVideoUrl, cssVideoUrl, jsVideoUrl });
    } else {
      // Only update fields that are provided (allow partial updates)
      if (typeof htmlVideoUrl === 'string') config.htmlVideoUrl = htmlVideoUrl;
      if (typeof cssVideoUrl === 'string') config.cssVideoUrl = cssVideoUrl;
      if (typeof jsVideoUrl === 'string') config.jsVideoUrl = jsVideoUrl;
    }
    await config.save();
    res.json({ message: "Video URLs updated successfully", config });
  } catch (error) {
    console.error("Error updating video URLs:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get video configuration (could be public)
exports.getVideoConfig = async (req, res) => {
  try {
    const config = await VideoConfig.findOne({});
    if (!config) {
      return res.status(404).json({ message: "No video configuration found." });
    }
    res.json(config);
  } catch (error) {
    console.error("Error fetching video config:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
