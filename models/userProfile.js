// models/userProfile.js
const mongoose = require("mongoose");

const userProfileSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true },
  name: { 
    type: String, 
    required: [function() { return !this.isNew; }, "Name is required"],
    default: ""
  },
  surname: { 
    type: String, 
    required: [function() { return !this.isNew; }, "Surname is required"],
    default: ""
  },
  faculty: { 
    type: String, 
    required: [function() { return !this.isNew; }, "Faculty is required"],
    default: ""
  },
  group: { 
    type: String, 
    required: [function() { return !this.isNew; }, "Group is required"],
    default: ""
  }
});

// Explicitly set the collection name to "user_profiles"
module.exports = mongoose.model("UserProfile", userProfileSchema, "user_profiles");
