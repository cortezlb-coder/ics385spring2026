const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const User = require("../models/User");

// LocalStrategy checks a username/email + password combination.
passport.use(
  new LocalStrategy(
    {
      // We use a custom field named "identifier" so users can enter username OR email.
      usernameField: "identifier",
      passwordField: "password",
    },
    async (identifier, password, done) => {
      try {
        // Normalize email-style input so comparisons are consistent.
        const normalized = identifier.trim().toLowerCase();

        // Find a user where either username matches OR email matches.
        const user = await User.findOne({
          $or: [{ username: identifier.trim() }, { email: normalized }],
        });

        if (!user) {
          return done(null, false, {
            message: "Invalid credentials.",
          });
        }

        // Compare plain password from form with the stored bcrypt hash.
        const isMatch = await bcrypt.compare(password, user.passwordHash);

        if (!isMatch) {
          return done(null, false, {
            message: "Invalid credentials.",
          });
        }

        // Success: pass the user object back to Passport.
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Save only user id in the session cookie payload.
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// For each request with a session, load full user details from MongoDB.
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});
