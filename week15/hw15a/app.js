require("dotenv").config();

const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const { MongoStore } = require("connect-mongo");
const passport = require("passport");

const User = require("./models/User");
const authRoutes = require("./routes/auth");
const { ensureAuthenticated } = require("./middleware/ensureAuth");

require("./config/passport");

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;
const SESSION_SECRET = process.env.SESSION_SECRET;

if (!MONGO_URI || !SESSION_SECRET) {
  console.error("Missing MONGO_URI or SESSION_SECRET in env file.");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  });

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: MONGO_URI }),
    cookie: {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use(authRoutes);

app.get("/", (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect("/profile");
  }

  return res.render("home");
});

app.get("/profile", ensureAuthenticated, (req, res) => {
  res.render("profile", { user: req.user });
});

app.use((error, req, res, next) => {
  console.error("Server error:", error.message);

  if (res.headersSent) {
    return next(error);
  }

  return res.status(500).send("Something went wrong");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
