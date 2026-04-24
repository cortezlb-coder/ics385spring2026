// Load environment variables from .env into process.env
require("dotenv").config();

const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const bcrypt = require("bcrypt");

const User = require("./models/User");
const { ensureAuthenticated } = require("./middleware/auth");

// Running this file sets up the LocalStrategy configuration.
require("./config/passport");

const app = express();

// Use a port from .env if available, otherwise default to 3000.
const PORT = process.env.PORT || 3000;

// Read required config values from environment variables.
const MONGO_URI = process.env.MONGO_URI;
const SESSION_SECRET = process.env.SESSION_SECRET;

if (!MONGO_URI || !SESSION_SECRET) {
  console.error("Missing MONGO_URI or SESSION_SECRET in environment variables.");
  process.exit(1);
}

// Connect to MongoDB before accepting requests.
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  });

// Parse form data from POST requests.
app.use(express.urlencoded({ extended: false }));

// Tell Express where to find EJS templates.
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Session middleware must run before Passport session support.
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

// Initialize Passport and connect it to Express sessions.
app.use(passport.initialize());
app.use(passport.session());

// Home route redirects users to the right page based on auth state.
app.get("/", (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect("/dashboard");
  }

  return res.redirect("/login");
});

// Show registration form.
app.get("/register", (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect("/dashboard");
  }

  return res.render("register", { message: null });
});

// Handle registration form submit.
app.post("/register", async (req, res) => {
  try {
    // Remove extra spaces from user input.
    const username = (req.body.username || "").trim();
    const email = (req.body.email || "").trim().toLowerCase();
    const password = req.body.password || "";

    // Basic server-side validation.
    if (!username || !email || !password) {
      return res.status(400).render("register", {
        message: "All fields are required.",
      });
    }

    if (password.length < 6) {
      return res.status(400).render("register", {
        message: "Password must be at least 6 characters.",
      });
    }

    // Check if username or email is already used.
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      return res.status(409).render("register", {
        message: "Username or email already exists.",
      });
    }

    // Hash password so we never store plain text passwords.
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      passwordHash,
    });

    // Log in immediately after successful registration.
    req.login(user, (loginError) => {
      if (loginError) {
        return res.status(500).render("register", {
          message: "Account created, but login failed. Please try logging in.",
        });
      }

      return res.redirect("/dashboard");
    });
  } catch (error) {
    console.error("Registration error:", error.message);
    return res.status(500).render("register", {
      message: "Something went wrong. Please try again.",
    });
  }
});

// Show login form.
app.get("/login", (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect("/dashboard");
  }

  return res.render("login", { message: null });
});

// Authenticate login using Passport LocalStrategy.
app.post("/login", (req, res, next) => {
  passport.authenticate("local", (error, user, info) => {
    if (error) {
      return next(error);
    }

    if (!user) {
      return res.status(401).render("login", {
        message: info?.message || "Login failed.",
      });
    }

    req.logIn(user, (loginError) => {
      if (loginError) {
        return next(loginError);
      }

      return res.redirect("/dashboard");
    });
  })(req, res, next);
});

// Protected route: only logged-in users can see this page.
app.get("/dashboard", ensureAuthenticated, (req, res) => {
  return res.render("dashboard", { user: req.user });
});

// Log out user and destroy session.
app.post("/logout", (req, res, next) => {
  req.logout((error) => {
    if (error) {
      return next(error);
    }

    req.session.destroy((sessionError) => {
      if (sessionError) {
        return next(sessionError);
      }

      res.clearCookie("connect.sid");
      return res.redirect("/login");
    });
  });
});

// Basic error handler so the app does not crash silently.
app.use((error, req, res, next) => {
  console.error("Unhandled server error:", error.message);

  if (res.headersSent) {
    return next(error);
  }

  return res.status(500).send("Server error");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
