const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema({
  name: String,
  island: String,
  type: String,
  description: String,
  amenities: [String],
  targetSegment: String,
  imageURL: String
});

module.exports = mongoose.model("Property", propertySchema);