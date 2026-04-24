const mongoose = require("mongoose");

// This schema defines what one user document looks like in MongoDB.
const userSchema = new mongoose.Schema(
  {
    // Public username used for login/display.
    username: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 40,
      unique: true,
    },
    // Email is stored lowercase to avoid duplicate variants (A@x.com vs a@x.com).
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    // Store only hashed password, never plain text.
    passwordHash: {
      type: String,
      required: true,
    },
  },
  {
    // Adds createdAt and updatedAt automatically.
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
