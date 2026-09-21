const express = require("express");
const passport = require("passport");
const router = express.Router();

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
    failureRedirect: "/",
    failureFlash: false,
  }),
  (req, res) => {
    res.redirect(process.env.FRONTEND_ORIGIN || "http://localhost:5173");
  }
);

router.post("/logout", (req, res, next) => {
  req.logout((error) => {
    if (error) {
      return next(error);
    }

    req.session.destroy((sessionError) => {
      if (sessionError) {
        return next(sessionError);
      }

      res.clearCookie("connect.sid");
      return res.redirect("/");
    });
  });
});

module.exports = router;
