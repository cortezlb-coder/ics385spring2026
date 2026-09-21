function ensureAdmin(req, res, next) {
  if (!req.isAuthenticated()) {
    if (req.headers.accept?.includes("text/html") && !req.headers.accept.includes("application/json")) {
      return res.redirect("/login");
    }

    return res.status(401).json({ error: "Authentication required." });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required." });
  }

  return next();
}

module.exports = ensureAdmin;
