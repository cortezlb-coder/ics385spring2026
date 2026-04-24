require("dotenv").config();

const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("passport");

const User = require("./models/User");
const { ensureAuthenticated } = require("./middleware/auth");
require("./config/passport");

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;
const SESSION_SECRET = process.env.SESSION_SECRET;

if (!MONGODB_URI || !SESSION_SECRET) {
  console.error("Missing MONGODB_URI or SESSION_SECRET in .env");
  process.exit(1);
}

// Connect to MongoDB before starting the server.
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  });

// Parse form submissions from the login and registration pages.
app.use(express.urlencoded({ extended: false }));

// Tell Express where the EJS templates live.
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Store sessions in MongoDB so logins survive server restarts.
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: MONGODB_URI,
      collectionName: "sessions",
    }),
  })
);

// Initialize Passport and connect it to Express sessions.
app.use(passport.initialize());
app.use(passport.session());

// Show the home route as a simple redirect to the login page.
app.get("/", (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect("/profile");
  }

  return res.redirect("/login");
});

// Show the registration form.
app.get("/register", (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect("/profile");
  }

  return res.render("register", { message: null });
});

// Create a new user, hash the password, and send the user to login.
app.post("/register", async (req, res) => {
  try {
    const email = (req.body.email || "").trim().toLowerCase();
    const password = req.body.password || "";

    if (!email || !password) {
      return res.status(400).render("register", {
        message: "Email and password are required.",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).render("register", {
        message: "That email is already registered.",
      });
    }

    await User.create({
      email,
      password,
    });

    return res.redirect("/login");
  } catch (error) {
    console.error("Registration error:", error.message);
    return res.status(500).render("register", {
      message: "Something went wrong. Please try again.",
    });
  }
});

// Show the login form with optional message (e.g., after logout or redirect from protected route).
app.get("/login", (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect("/profile");
  }

  let message = null;
  if (req.query.message === "logged-out") {
    message = "You have been logged out successfully.";
  } else if (req.query.message === "login-required") {
    message = "Please log in to access that page.";
  }

  return res.render("login", { message });
});

// Use Passport local strategy for login with custom error handling.
app.post("/login", (req, res, next) => {
  passport.authenticate("local", (error, user) => {
    if (error) {
      console.error("Authentication error:", error.message);
      return res.status(500).render("login", {
        message: "Something went wrong. Please try again.",
      });
    }

    if (!user) {
      // Authentication failed: email not found or password incorrect.
      return res.status(401).render("login", {
        message: "Invalid email or password. Please try again.",
      });
    }

    // Log the user in and create a session.
    req.logIn(user, (loginError) => {
      if (loginError) {
        return next(loginError);
      }

      return res.redirect("/profile");
    });
  })(req, res, next);
});

// Protected route that shows the logged-in user's email and role.
app.get("/profile", ensureAuthenticated, (req, res) => {
  return res.render("profile", { user: req.user });
});

// Log the user out and send them back to the login page with a success message.
app.get("/logout", (req, res, next) => {
  req.logout((error) => {
    if (error) {
      return next(error);
    }

    req.session.destroy((sessionError) => {
      if (sessionError) {
        return next(sessionError);
      }

      res.clearCookie("connect.sid");
      // Redirect to login with a query parameter to display a logout success message.
      return res.redirect("/login?message=logged-out");
    });
  });
});

// Handle unexpected errors without crashing the app.
app.use((error, req, res, next) => {
  console.error("Unhandled error:", error.message);

  if (res.headersSent) {
    return next(error);
  }

  return res.status(500).send("Server error");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
