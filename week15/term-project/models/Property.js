const mongoose = require("mongoose");

// A review is embedded inside its property because reviews belong to one property.
const reviewSchema = new mongoose.Schema(
  {
    guestName: {
      type: String,
      required: true,
      trim: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      required: true,
      trim: true
    },
    date: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const propertySchema = new mongoose.Schema({
  // This document is the main source of content for the React marketing page.
  name: String,
  island: String,
  type: String,
  description: String,
  amenities: [String],
  targetSegment: String,
  imageURL: String,
  reviews: [reviewSchema]
});

module.exports = mongoose.model("Property", propertySchema);