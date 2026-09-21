require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const dns = require("dns");
const path = require("path");
const helmet = require("helmet");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const passport = require("passport");
const authRoutes = require("./routes/auth");
const publicRoutes = require("./routes/public");
const adminRoutes = require("./routes/admin");

require("./config/passport");

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";

if (process.env.NODE_ENV === "production" && !process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET is required in production.");
}

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

dns.setServers(["1.1.1.1", "8.8.8.8"]);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const REACT_BUILD_PATH = path.join(__dirname, "react-marketing", "dist");

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        // properties.ejs uses an inline <style> block
        "style-src": ["'self'", "'unsafe-inline'"],
        // the React dashboard fetches live weather from OpenWeatherMap
        "connect-src": ["'self'", "https://api.openweathermap.org"]
      }
    }
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === "production") {
  // Serves the built React app if it's ever deployed from this same Express service.
  app.use(express.static(REACT_BUILD_PATH));
}
app.use(
  session({
    secret: process.env.SESSION_SECRET || "week14d-dev-secret",
    ...(process.env.NODE_ENV !== "test" && process.env.MONGO_URI
      ? {
          store: MongoStore.create({
            mongoUrl: process.env.MONGO_URI,
            collectionName: "sessions",
            ttl: 60 * 60 * 4
          })
        }
      : {}),
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      // Same origin now that Express serves the built React app, so "lax" works.
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 4
    }
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  const requestOrigin = req.headers.origin;
  if (!requestOrigin || requestOrigin === FRONTEND_ORIGIN) {
    res.setHeader("Access-Control-Allow-Origin", requestOrigin || FRONTEND_ORIGIN);
  }

  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  return next();
});

app.use(authRoutes);

if (process.env.NODE_ENV !== "test") {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("MongoDB connection error:", err));
}

app.use(publicRoutes);
app.use(adminRoutes);

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}


module.exports = app;