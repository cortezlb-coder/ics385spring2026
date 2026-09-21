const express = require("express");
const Property = require("../models/Property");
const requireAdmin = require("../middleware/ensureAdmin");
const router = express.Router();

router.get("/admin/dashboard", requireAdmin, async (req, res) => {
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

router.put("/admin/properties/:id", requireAdmin, async (req, res) => {
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

module.exports = router;
