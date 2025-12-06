// routes/user.route.js
const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  updateUserRole,
  deleteUser,
  updateProfile,
  changePassword,
  deleteAccount,
} = require("../controllers/user.controller");
const { verifyUser, verifyAdmin } = require("../middlewares/token");

// Admin-only routes
router.get("/all", verifyUser, verifyAdmin, getAllUsers);
router.put("/:id/role", verifyUser, verifyAdmin, updateUserRole);
router.delete("/:id", verifyUser, verifyAdmin, deleteUser);

// User routes (authenticated users)
router.put("/profile", verifyUser, updateProfile);
router.put("/change-password", verifyUser, changePassword);
router.delete("/delete-account", verifyUser, deleteAccount);

module.exports = router;
