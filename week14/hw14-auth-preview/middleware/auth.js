function ensureAuthenticated(req, res, next) {
  // Passport adds isAuthenticated() to each request.
  // If true, the user is logged in and can continue.
  if (req.isAuthenticated()) {
    return next();
  }

  // If not logged in, send user to login page.
  return res.redirect("/login");
}

module.exports = {
  ensureAuthenticated,
};
