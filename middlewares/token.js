// middlewares/token.js - IMPROVED VERSION
const jwt = require("jsonwebtoken");
const User = require("../models/user.model"); // Import User model

const verifyUser = async (req, res, next) => {
  try {
    const token = req.headers["x-auth-token"];
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: "No token provided" 
      });
    }

    const payload = jwt.verify(token, process.env.TOKEN_SECRET || 'fallback_secret');
    
    // Optional: Fetch fresh user data from database
    const user = await User.findById(payload.id).select('-password');
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: "User not found" 
      });
    }
    
    req.user = user; // Use fresh user data from DB
    next();
  } catch (error) {
    console.error("❌ Token verification error:", error);
    res.status(401).json({ 
      success: false,
      message: "Invalid token" 
    });
  }
};

const verifyAdmin = async (req, res, next) => {
  try {
    // First verify user token
    const token = req.headers["x-auth-token"];
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: "No token provided" 
      });
    }

    const payload = jwt.verify(token, process.env.TOKEN_SECRET || 'fallback_secret');
    
    // Fetch user from database to get latest role
    const user = await User.findById(payload.id).select('-password');
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: "User not found" 
      });
    }
    
    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: "Admin access required" 
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error("❌ Admin verification error:", error);
    res.status(401).json({ 
      success: false,
      message: "Invalid token" 
    });
  }
};

// Alternative: Chainable version (recommended)
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers["x-auth-token"];
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: "No token provided" 
      });
    }

    const payload = jwt.verify(token, process.env.TOKEN_SECRET || 'fallback_secret');
    const user = await User.findById(payload.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: "User not found" 
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ 
      success: false,
      message: "Invalid token" 
    });
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false,
      message: "Admin access required" 
    });
  }
  next();
};

module.exports = {
  verifyUser,
  verifyAdmin,
  verifyToken,
  requireAdmin
};