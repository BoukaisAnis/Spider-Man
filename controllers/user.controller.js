// controllers/user.controller.js - COMPLETE FIXED VERSION
const User = require("../models/user.model");
const CryptoJS = require("crypto-js");

// Get all users (Admin only)
const getAllUsers = async (req, res) => {
  try {
    console.log("👥 Getting all users...");

    const users = await User.find().select("-password");

    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: users,
      count: users.length,
    });
  } catch (error) {
    console.error("❌ Error getting users:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Update user role (Admin only)
const updateUserRole = async (req, res) => {
  const userId = req.params.id;

  try {
    // Toggle role between 'user' and 'admin'
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Toggle the role
    user.role = user.role === "admin" ? "user" : "admin";
    await user.save();

    const updatedUser = await User.findById(userId).select("-password");

    res.status(200).json({
      success: true,
      message: `User role updated to ${user.role} successfully`,
      data: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Update user (User can update their own profile)
const updateUser = async (req, res) => {
  const userId = req.params.id;
  console.log(req.user);

  try {
    // Improved authorization check
    if (req.user.id !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to update this user",
      });
    }

    // If password is being updated, hash it first
    if (req.body.password) {
      req.body.password = CryptoJS.AES.encrypt(
        req.body.password,
        process.env.PASSWORD_SECRET
      ).toString();
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: req.body,
      },
      { new: true }
    ).select("-password");

    // Check if user was found and updated
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Delete user (Admin only)
const deleteUser = async (req, res) => {
  const userId = req.params.id;

  try {
    // Check if the user is an admin
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to delete users. Admin access required.",
      });
    }

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Update user profile (User can update their own profile)
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: "Username is required",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { username },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify current password
    const decryptedBytes = CryptoJS.AES.decrypt(
      user.password,
      process.env.PASSWORD_SECRET
    );
    const decryptedPassword = decryptedBytes.toString(CryptoJS.enc.Utf8);

    if (decryptedPassword !== currentPassword) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Encrypt new password
    const encryptedPassword = CryptoJS.AES.encrypt(
      newPassword,
      process.env.PASSWORD_SECRET
    ).toString();

    // Update password
    user.password = encryptedPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Delete account (User deletes their own account)
const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Debug: Verify all exports
console.log("🔍 user.controller.js exports:");
console.log("   getAllUsers:", typeof getAllUsers);
console.log("   updateUserRole:", typeof updateUserRole);
console.log("   updateUser:", typeof updateUser);
console.log("   deleteUser:", typeof deleteUser);
console.log("   updateProfile:", typeof updateProfile);
console.log("   changePassword:", typeof changePassword);
console.log("   deleteAccount:", typeof deleteAccount);

module.exports = {
  getAllUsers,
  updateUserRole,
  updateUser,
  deleteUser,
  updateProfile,
  changePassword,
  deleteAccount,
};
