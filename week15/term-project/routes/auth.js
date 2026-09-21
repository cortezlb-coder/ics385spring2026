const express = require("express");
const passport = require("passport");
const { body, validationResult } = require("express-validator");
const requireAuth = require("../middleware/ensureAuth");
const router = express.Router();

router.get("/auth/session", (req, res) => {
  res.setHeader("Cache-Control", "no-store");

  if (!req.isAuthenticated()) {
    return res.json({ authenticated: false });
  }

  return res.json({
    authenticated: true,
    user: {
      id: req.user.id,
      username: req.user.username,
      displayName: req.user.displayName,
      email: req.user.email,
      role: req.user.role
    }
  });
});

router.post(
  "/auth/login",
  [
    body("username").isString().trim().notEmpty().withMessage("username is required."),
    body("password").isString().notEmpty().withMessage("password is required.")
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    return passport.authenticate("local", (authError, user, info) => {
      if (authError) {
        return res.status(500).json({ error: "Login failed.", details: authError.message });
      }

      if (!user) {
        return res.status(401).json({ error: info?.message || "Invalid username or password." });
      }

      return req.login(user, (loginError) => {
        if (loginError) {
          return res.status(500).json({ error: "Login failed.", details: loginError.message });
        }

        return res.json({
          message: "Login successful.",
          user: {
            id: String(user._id),
            username: user.username,
            role: user.role
          }
        });
      });
    })(req, res, next);
  }
);

router.post("/auth/logout", requireAuth, (req, res) => {
  req.logout((logoutErr) => {
    if (logoutErr) {
      return res.status(500).json({ error: "Logout failed." });
    }

    req.session.destroy((destroyErr) => {
      if (destroyErr) {
        return res.status(500).json({ error: "Logout failed." });
      }

      res.clearCookie("connect.sid");
      return res.json({ message: "Logout successful." });
    });
  });
});

router.get("/auth/google", (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_CALLBACK_URL) {
    return res.status(500).send("Google OAuth is not configured. Check the server .env file and restart the backend.");
  }

  return passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account"
  })(req, res, next);
});

router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.FRONTEND_ORIGIN || "http://localhost:5173"}/#login`,
    failureFlash: false,
  }),
  (req, res) => {
    res.redirect(process.env.FRONTEND_ORIGIN || "http://localhost:5173");
  }
);

module.exports = router;

