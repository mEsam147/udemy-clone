const User = require("../models/User");
const Notification = require("../models/Notification");

const updateSettings = async (req, res) => {
  try {
    const { notifications, language, timezone, privacy, communication } =
      req.body;

    const fieldsToUpdate = {};

    if (notifications !== undefined)
      fieldsToUpdate.notificationSettings = notifications;
    if (language !== undefined) fieldsToUpdate.language = language;
    if (timezone !== undefined) fieldsToUpdate.timezone = timezone;
    if (privacy !== undefined) fieldsToUpdate.privacySettings = privacy;
    if (communication !== undefined)
      fieldsToUpdate.communicationSettings = communication;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: fieldsToUpdate },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    res.status(200).json({
      success: true,
      message: "Settings updated successfully",
      data: user,
    });
  } catch (error) {
    console.error("Update settings error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during settings update",
    });
  }
};

// @desc    Get user settings
// @route   GET /api/settings
// @access  Private
const getSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "notificationSettings language timezone privacySettings communicationSettings"
    );

    // Default settings if not set
    const settings = {
      notifications: user.notificationSettings || {
        email: true,
        push: false,
        marketing: true,
        courseUpdates: true,
        newMessages: true,
      },
      language: user.language || "en",
      timezone: user.timezone || "UTC",
      privacy: user.privacySettings || {
        profileVisibility: "public",
        showEmail: false,
        showEnrollments: true,
      },
      communication: user.communicationSettings || {
        newsletter: true,
        productUpdates: true,
        courseRecommendations: true,
      },
    };

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("Get settings error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching settings",
    });
  }
};

// @desc    Change password
// @route   PUT /api/settings/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters long",
      });
    }

    const user = await User.findById(req.user.id).select("+password");

    // Check current password
    const isMatch = user.password === currentPassword;
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during password change",
    });
  }
};

// @desc    Delete account
// @route   DELETE /api/settings/account
// @access  Private
const deleteAccount = async (req, res) => {
  try {
    const { confirmation } = req.body;

    if (confirmation !== "DELETE MY ACCOUNT") {
      return res.status(400).json({
        success: false,
        message: "Please type 'DELETE MY ACCOUNT' to confirm",
      });
    }

    // In a real application, you might want to soft delete or handle related data
    await User.findByIdAndDelete(req.user.id);

    // Clear notifications
    await Notification.deleteMany({ user: req.user.id });

    res.clearCookie("token");

    res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Delete account error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during account deletion",
    });
  }
};

module.exports = {
  updateSettings,
  getSettings,
  changePassword,
  deleteAccount,
};