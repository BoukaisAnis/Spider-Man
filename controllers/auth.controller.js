// controllers/auth.controller.js - CORRECTED VERSION
const User = require("../models/user.model");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  console.log("🎯 REGISTER CONTROLLER CALLED");

  try {
    const { username, email, password, role } = req.body;

    console.log("📥 Request body received:", {
      username: username || "MISSING",
      email: email || "MISSING", 
      password: password ? "***" : "MISSING",
      role: role || "MISSING"
    });

    // Check required fields
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check environment variable
    if (!process.env.PASSWORD_SECRET) {
      return res.status(500).json({
        success: false,
        message: "Server configuration error",
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email or username",
      });
    }

    // Hash password
    const hashedPassword = CryptoJS.AES.encrypt(
      password,
      process.env.PASSWORD_SECRET
    ).toString();

    // Create and save user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role: role || 'user' 
    });

    console.log("💾 Saving user to database...");
    const savedUser = await newUser.save();
    console.log("✅ User saved successfully:", {
      id: savedUser._id,
      username: savedUser.username,
      email: savedUser.email,
      role: savedUser.role
    });

    // Success response
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: savedUser._id,
        username: savedUser.username,
        email: savedUser.email,
        role: savedUser.role
      },
    });
  } catch (err) {
    console.error("💥 ERROR in register controller:");
    console.error("Error name:", err.name);
    console.error("Error message:", err.message);
    console.error("Full error:", err);

    
    if (err.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error: " + err.message,
      });
    }

    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error: " + err.message,
    });
  }
};


const login = async (req, res) => {
  console.log("🎯 LOGIN CONTROLLER CALLED");
  
  try {
    const { email, password } = req.body;

    console.log("📥 Login request:", {
      email: email || "MISSING",
      password: password ? "***" : "MISSING"
    });

    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log("❌ User not found with email:", email);
      return res.status(401).json({ 
        success: false,
        message: "Invalid credentials" 
      });
    }

    console.log("✅ User found:", { 
      id: user._id, 
      email: user.email, 
      username: user.username 
    });

    // Debug: Check what's stored in the database
    console.log("🔍 Stored password hash:", user.password);
    console.log("🔍 Input password:", password);

    // Decrypt and compare password
    const decryptedBytes = CryptoJS.AES.decrypt(
      user.password,
      process.env.PASSWORD_SECRET
    );
    
    const decryptedPassword = decryptedBytes.toString(CryptoJS.enc.Utf8);
    
    console.log("🔍 Decrypted password:", decryptedPassword);

    if (password !== decryptedPassword) {
      console.log("❌ Password mismatch");
      return res.status(401).json({ 
        success: false,
        message: "Invalid credentials" 
      });
    }

    console.log("✅ Password matches!");

    // Generate JWT token
    const accessToken = jwt.sign(
      {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      process.env.TOKEN_SECRET,
      { expiresIn: "24h" }
    );

    console.log("✅ Token generated");

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      token: accessToken
    });

  } catch (err) {
    console.error("💥 ERROR in login controller:", err);
    res.status(500).json({ 
      success: false,
      message: "Internal server error" 
    });
  }
};

module.exports = { register, login };