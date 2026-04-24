function ensureAuthenticated(req, res, next) {
  // Allow request only when a valid session exists.
  if (req.isAuthenticated()) {
    return next();
  }

  // Redirect to login page with a message explaining login is required.
  return res.redirect("/login?message=login-required");
}

module.exports = { ensureAuthenticated };
