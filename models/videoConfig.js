const mongoose = require('mongoose');

const videoConfigSchema = new mongoose.Schema({
  htmlVideoUrl: { type: String, default: "" },
  cssVideoUrl: { type: String, default: "" },
  jsVideoUrl: { type: String, default: "" }
});

const VideoConfig = mongoose.model('VideoConfig', videoConfigSchema);
module.exports = VideoConfig;
