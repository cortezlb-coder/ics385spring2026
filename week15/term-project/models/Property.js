const mongoose = require("mongoose");

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