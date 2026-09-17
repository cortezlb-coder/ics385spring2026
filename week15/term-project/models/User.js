const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      unique: true,
      sparse: true
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true
    },
    displayName: String,
    firstName: String,
    lastName: String,
    username: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true
    },
    passwordHash: {
      type: String
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      required: true,
      default: "user"
    },
    provider: {
      type: String,
      enum: ["local", "google"],
      default: "local"
    },
    profilePhoto: String
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("User", userSchema);
