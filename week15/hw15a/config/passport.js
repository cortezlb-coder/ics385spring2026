const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;

        if (!email) {
          return done(new Error("Google account email is required."), false);
        }

        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          user = await User.findOne({ email });
        }

        if (!user) {
          user = await User.create({
            googleId: profile.id,
            displayName: profile.displayName,
            firstName: profile.name?.givenName || "",
            lastName: profile.name?.familyName || "",
            email,
            profilePhoto: profile.photos?.[0]?.value || "",
          });
        } else {
          user.googleId = profile.id;
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

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});
