// server.js - WORKING VERSION
const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const path = require("path");
const app = express();
require("dotenv").config();

const port = process.env.PORT || 3000;

// CORS
app.use(cors());

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static("public"));

connectDB();

// API Routes
app.get("/api/test", (req, res) => {
  res.json({
    message: "Backend is working!",
    timestamp: new Date().toISOString(),
    port: port,
  });
});

app.use("/api/v1/auth", require("./routes/auth.route"));
app.use("/api/v1/user", require("./routes/user.route"));
app.use("/api/v1/products", require("./routes/product.route"));
app.use("/api/v1/cart", require("./routes/cart.route"));

// Serve specific HTML pages
app.get("/dashboard.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

app.get("/admin-dashboard.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin-dashboard.html"));
});

app.get("/profile.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "profile.html"));
});

app.get("/cart.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "cart.html"));
});

app.get("/shop.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "shop.html"));
});

app.get("/settings.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "settings.html"));
});

app.get("/orders.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "orders.html"));
});

app.get("/manage-products.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "manage-products.html"));
});

app.get("/manage-users.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "manage-users.html"));
});

// Serve main app for root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// SIMPLE CATCH-ALL HANDLER - Serve index.html for SPA routing
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(port, () => {
  console.log(`🚀 Server is running on http://localhost:${port}`);
  console.log(`📡 Test backend: http://localhost:${port}/api/test`);
  console.log(`👤 User Dashboard: http://localhost:${port}/dashboard.html`);
  console.log(
    `👑 Admin Dashboard: http://localhost:${port}/admin-dashboard.html`
  );
  console.log(`🌐 Main App: http://localhost:${port}/`);
});

// server.js - ADD THESE DEBUG ROUTES

// ... your existing code ...

// DEBUG ROUTES - Add these before the catch-all handler
app.get("/api/debug/users", async (req, res) => {
  try {
    const User = require("./models/user.model");
    const users = await User.find({});

    console.log("📊 ALL USERS IN DATABASE:");
    users.forEach((user) => {
      console.log(
        `👤 ${user.email} - ${user.username} - ${user.role} - Password: ${
          user.password ? "***" : "MISSING"
        }`
      );
    });

    res.json({
      total: users.length,
      users: users.map((u) => ({
        id: u._id,
        email: u.email,
        username: u.username,
        role: u.role,
        hasPassword: !!u.password,
        createdAt: u.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: error.message });
  }
});

// Test password encryption/decryption
app.post("/api/debug/test-crypto", (req, res) => {
  const CryptoJS = require("crypto-js");
  const { password } = req.body;

  console.log("🔐 Testing crypto with secret:", process.env.PASSWORD_SECRET);

  // Encrypt
  const encrypted = CryptoJS.AES.encrypt(
    password,
    process.env.PASSWORD_SECRET
  ).toString();
  console.log("🔐 Encrypted:", encrypted);

  // Decrypt
  const decryptedBytes = CryptoJS.AES.decrypt(
    encrypted,
    process.env.PASSWORD_SECRET
  );
  const decrypted = decryptedBytes.toString(CryptoJS.enc.Utf8);
  console.log("🔐 Decrypted:", decrypted);

  res.json({
    original: password,
    encrypted: encrypted,
    decrypted: decrypted,
    matches: password === decrypted,
    secretLength: process.env.PASSWORD_SECRET?.length,
  });
});

// Test login directly
app.post("/api/debug/test-login", async (req, res) => {
  try {
    const User = require("./models/user.model");
    const CryptoJS = require("crypto-js");
    const { email, password } = req.body;

    console.log("🔐 Testing login for:", email);

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    console.log("✅ User found:", user.email);
    console.log("🔐 Stored password hash:", user.password);

    // Decrypt password
    const decryptedBytes = CryptoJS.AES.decrypt(
      user.password,
      process.env.PASSWORD_SECRET
    );
    const decryptedPassword = decryptedBytes.toString(CryptoJS.enc.Utf8);

    console.log("🔐 Input password:", password);
    console.log("🔐 Decrypted password:", decryptedPassword);

    const passwordMatches = password === decryptedPassword;

    res.json({
      success: passwordMatches,
      userExists: true,
      passwordMatches: passwordMatches,
      inputPassword: password,
      decryptedPassword: decryptedPassword,
      message: passwordMatches
        ? "Password matches!"
        : "Password does not match",
    });
  } catch (error) {
    console.error("Debug login error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ... your existing catch-all handler ...
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ... rest of your server.js

// Add to server.js - DEBUG ROUTES FOR USER MANAGEMENT

// Debug: Check user routes
app.get("/api/debug/user-routes", async (req, res) => {
  try {
    const User = require("./models/user.model");
    const users = await User.find({}).select("-password");

    console.log("📊 User management debug:");
    console.log(`Total users: ${users.length}`);

    res.json({
      userRoutesWorking: true,
      totalUsers: users.length,
      users: users,
      endpoints: {
        getAllUsers: "GET /api/v1/user/all",
        updateRole: "PUT /api/v1/user/:id/role",
        deleteUser: "DELETE /api/v1/user/:id",
      },
    });
  } catch (error) {
    console.error("User routes debug error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Test user creation
app.post("/api/debug/create-test-users", async (req, res) => {
  try {
    const User = require("./models/user.model");
    const CryptoJS = require("crypto-js");

    // Create test users
    const testUsers = [
      {
        username: "admin_user",
        email: "admin@test.com",
        password: CryptoJS.AES.encrypt(
          "admin123",
          process.env.PASSWORD_SECRET
        ).toString(),
        role: "admin",
      },
      {
        username: "regular_user",
        email: "user@test.com",
        password: CryptoJS.AES.encrypt(
          "user123",
          process.env.PASSWORD_SECRET
        ).toString(),
        role: "user",
      },
    ];

    // Clear existing test users
    await User.deleteMany({
      email: { $in: ["admin@test.com", "user@test.com"] },
    });

    // Create new test users
    const createdUsers = await User.insertMany(testUsers);

    res.json({
      message: "Test users created",
      users: createdUsers.map((u) => ({
        id: u._id,
        username: u.username,
        email: u.email,
        role: u.role,
      })),
    });
  } catch (error) {
    console.error("Create test users error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Add this to your server.js - COMPREHENSIVE DEBUG
app.get("/api/debug/full-routes-check", (req, res) => {
  const fs = require("fs");
  const path = require("path");

  const debugInfo = {
    serverRunning: true,
    port: process.env.PORT || 3000,
    routesPath: path.join(__dirname, "routes"),
    routesExist: fs.existsSync(path.join(__dirname, "routes")),
    authRouteExists: fs.existsSync(
      path.join(__dirname, "routes", "auth.route.js")
    ),
    userRouteExists: fs.existsSync(
      path.join(__dirname, "routes", "user.route.js")
    ),
  };

  // Check if route files can be loaded
  try {
    const authRoute = require("./routes/auth.route");
    debugInfo.authRouteLoaded = true;
    debugInfo.authRouteExports = Object.keys(authRoute);
  } catch (error) {
    debugInfo.authRouteLoaded = false;
    debugInfo.authRouteError = error.message;
  }

  try {
    const userRoute = require("./routes/user.route");
    debugInfo.userRouteLoaded = true;
    debugInfo.userRouteExports = Object.keys(userRoute);
  } catch (error) {
    debugInfo.userRouteLoaded = false;
    debugInfo.userRouteError = error.message;
  }

  // List all registered routes
  const routes = [];
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods),
      });
    } else if (middleware.name === "router") {
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          routes.push({
            path: handler.route.path,
            methods: Object.keys(handler.route.methods),
          });
        }
      });
    }
  });

  debugInfo.registeredRoutes = routes;

  console.log("🔧 FULL ROUTES DEBUG:");
  console.log("Server running on port:", debugInfo.port);
  console.log("Auth route exists:", debugInfo.authRouteExists);
  console.log("Auth route loaded:", debugInfo.authRouteLoaded);
  console.log("Registered routes:", routes);

  res.json(debugInfo);
});
