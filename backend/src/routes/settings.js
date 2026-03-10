const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

// Get user settings
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('settings');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return default settings if not set
    const settings = user.settings || {
      emailNotifications: false,
      autoSaveDraft: true,
      language: 'en'
    };

    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user settings
router.put('/', authMiddleware, async (req, res) => {
  try {
    const { emailNotifications, autoSaveDraft, language } = req.body;

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update settings
    if (!user.settings) {
      user.settings = {};
    }

    if (typeof emailNotifications !== 'undefined') {
      user.settings.emailNotifications = emailNotifications;
    }
    if (typeof autoSaveDraft !== 'undefined') {
      user.settings.autoSaveDraft = autoSaveDraft;
    }
    if (language) {
      user.settings.language = language;
    }

    await user.save();

    res.json({ 
      message: 'Settings updated successfully',
      settings: user.settings 
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
