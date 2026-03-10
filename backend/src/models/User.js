const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: {
      type: String,
      required: true,
      unique: true,
    },
    passwordHash: {
      type: String,
      required: false, // ✅ MUST be optional
    },
    googleId: {
      type: String,
    },
    provider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    settings: {
      emailNotifications: {
        type: Boolean,
        default: false
      },
      autoSaveDraft: {
        type: Boolean,
        default: true
      },
      language: {
        type: String,
        default: 'en'
      }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
