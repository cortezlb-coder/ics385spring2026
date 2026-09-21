function ensureAuth(req, res, next) {
  if (!req.isAuthenticated()) {
    if (req.headers.accept?.includes("text/html") && !req.headers.accept.includes("application/json")) {
      return res.redirect("/login");
    }

    return res.status(401).json({ error: "Authentication required." });
  }

  return next();
}

module.exports = ensureAuth;
