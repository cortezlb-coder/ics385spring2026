const express = require("express");
const { body, validationResult } = require("express-validator");
const Property = require("../models/Property");
const router = express.Router();

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

router.get("/", (req, res) => {
  res.redirect("/properties");
});

router.get("/login", (req, res) => {
  const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";
  res.redirect(`${FRONTEND_ORIGIN}/#login`);
});

// GET /properties
// Returns JSON for API clients and renders EJS for browser requests.
router.get("/properties", async (req, res) => {
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
router.get("/properties/:id", async (req, res) => {
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
router.post(
  "/properties/:id/reviews",
  [
    body("guestName").isString().trim().notEmpty().withMessage("guestName is required."),
    body("comment").isString().trim().notEmpty().withMessage("comment is required."),
    body("rating").isFloat({ min: 1, max: 5 }).withMessage("rating must be a number between 1 and 5.")
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array()[0].msg });
      }

      const { guestName, rating, comment } = req.body;
      const numericRating = Number(rating);

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
  }
);

module.exports = router;
