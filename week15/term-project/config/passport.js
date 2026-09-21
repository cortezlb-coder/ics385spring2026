const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

// Only register Google OAuth when the required production or local settings exist.
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_CALLBACK_URL) {
  passport.use(
    new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Google gives us profile data after the user approves the login.
        const email = profile.emails?.[0]?.value;

        if (!email) {
          return done(new Error("Google account email is required."), false);
        }

        const emailVerified = profile._json?.email_verified ?? profile._json?.verified_email;
        if (emailVerified !== true) {
          return done(new Error("A verified Google account email is required."), false);
        }

        // First look for a user who has already used this Google account.
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          // If no Google ID matches, try linking Google to an existing local account.
          user = await User.findOne({ email });
        }

        if (!user) {
          // No match means this is a new user, so create a normal user account.
          user = await User.create({
            googleId: profile.id,
            username: `google_${profile.id}`,
            displayName: profile.displayName,
            firstName: profile.name?.givenName || "",
            lastName: profile.name?.familyName || "",
            email,
            provider: "google",
            role: "user",
            profilePhoto: profile.photos?.[0]?.value || "",
          });
        } else {
          // Keep an existing user's profile information current after Google login.
          user.googleId = profile.id;
          user.provider = "google";
          user.displayName = profile.displayName;
          user.firstName = profile.name?.givenName || user.firstName || "";
          user.lastName = profile.name?.familyName || user.lastName || "";
          user.email = email;
          user.profilePhoto = profile.photos?.[0]?.value || user.profilePhoto || "";
          await user.save();
        }

        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }
    )
  );
}

passport.serializeUser((user, done) => {
  // Store only the user's database ID inside the session cookie.
  done(null, String(user.id || user._id));
});

passport.deserializeUser(async (id, done) => {
  try {
    // On later requests, use the saved ID to load the complete user record.
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});
