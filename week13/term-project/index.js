require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const Property = require("./models/Property");

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  return next();
});

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
