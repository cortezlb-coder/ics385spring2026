require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const bcrypt = require("bcrypt");
const session = require("express-session");
const Property = require("./models/Property");
const User = require("./models/User");

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "week14d-dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 1000 * 60 * 60 * 4
    }
  })
);

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

function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ error: "Authentication required." });
  }

  return next();
}

function requireAdmin(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ error: "Authentication required." });
  }

  if (req.session.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required." });
  }

  return next();
}

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

function buildPropertyFilter(queryParams) {
  const filter = {};

  if (queryParams.island) {
    filter.island = queryParams.island;
  }

  if (queryParams.minRating || queryParams.maxRating) {
    const min = Number(queryParams.minRating || 1);
    const max = Number(queryParams.maxRating || 5);

    if (Number.isNaN(min) || Number.isNaN(max)) {
      return { error: "minRating and maxRating must be numbers." };
    }

    const clampedMin = Math.max(1, Math.min(5, min));
    const clampedMax = Math.max(1, Math.min(5, max));

    filter.reviews = {
      $elemMatch: {
        rating: {
          $gte: clampedMin,
          $lte: clampedMax
        }
      }
    };
  }

  return { filter };
}

app.get("/auth/session", (req, res) => {
  if (!req.session.user) {
    return res.json({ authenticated: false });
  }

  return res.json({
    authenticated: true,
    user: req.session.user
  });
});

app.post("/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "username and password are required." });
    }

    const user = await User.findOne({ username: String(username).toLowerCase().trim() });

    if (!user) {
      return res.status(401).json({ error: "Invalid username or password." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid username or password." });
    }

    req.session.user = {
      id: String(user._id),
      username: user.username,
      role: user.role
    };

    return res.json({
      message: "Login successful.",
      user: req.session.user
    });
  } catch (err) {
    return res.status(500).json({ error: "Login failed.", details: err.message });
  }
});

app.post("/auth/logout", requireAuth, (req, res) => {
  req.session.destroy((destroyErr) => {
    if (destroyErr) {
      return res.status(500).json({ error: "Logout failed." });
    }

    res.clearCookie("connect.sid");
    return res.json({ message: "Logout successful." });
  });
});

// GET /properties
// Returns JSON for API clients and renders EJS for browser requests.
app.get("/properties", async (req, res) => {
  try {
    const { filter, error } = buildPropertyFilter(req.query);

    if (error) {
      return res.status(400).json({ error });
    }

    const properties = await Property.find(filter).sort({ name: 1 });

    if (req.query.format === "json" || !req.accepts("html")) {
      return res.json(properties);
    }

    return res.render("properties", {
      properties,
      filters: {
        island: req.query.island || "",
        minRating: req.query.minRating || ""
      }
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch properties.", details: err.message });
  }
});

// GET /properties/:id
app.get("/properties/:id", async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ error: "Property not found." });
    }

    return res.json(property);
  } catch (err) {
    return res.status(400).json({ error: "Invalid property ID.", details: err.message });
  }
});

app.get("/admin/dashboard", requireAdmin, async (req, res) => {
  try {
    const propertyCount = await Property.countDocuments();
    const reviewCount = await Property.aggregate([
      {
        $project: {
          reviewCount: { $size: "$reviews" }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$reviewCount" }
        }
      }
    ]);

    return res.json({
      message: "Admin dashboard data loaded.",
      metrics: {
        propertyCount,
        reviewCount: reviewCount[0]?.total || 0
      }
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to load admin dashboard.", details: err.message });
  }
});

app.put("/admin/properties/:id", requireAdmin, async (req, res) => {
  try {
    const allowedFields = [
      "name",
      "island",
      "type",
      "description",
      "amenities",
      "targetSegment",
      "imageURL"
    ];

    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const updatedProperty = await Property.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });

    if (!updatedProperty) {
      return res.status(404).json({ error: "Property not found." });
    }

    return res.json({ message: "Property updated.", property: updatedProperty });
  } catch (err) {
    return res.status(400).json({ error: "Failed to update property.", details: err.message });
  }
});

// POST /properties/:id/reviews
app.post("/properties/:id/reviews", async (req, res) => {
  try {
    const { guestName, rating, comment } = req.body;

    if (!guestName || !comment || rating === undefined) {
      return res
        .status(400)
        .json({ error: "guestName, rating, and comment are required." });
    }

    const numericRating = Number(rating);
    if (!Number.isFinite(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ error: "rating must be a number between 1 and 5." });
    }

    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ error: "Property not found." });
    }

    const newReview = {
      guestName,
      rating: numericRating,
      comment,
      date: new Date()
    };

    property.reviews.push(newReview);
    await property.save();

    return res.status(201).json({
      message: "Review added successfully.",
      propertyId: property._id,
      review: property.reviews[property.reviews.length - 1]
    });
  } catch (err) {
    return res.status(400).json({ error: "Unable to add review.", details: err.message });
  }
});

app.get("/", (req, res) => {
  res.redirect("/properties");
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
