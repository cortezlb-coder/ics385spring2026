const mongoose = require('mongoose');

const amenitiesSchema = new mongoose.Schema({
  pool: { type: Boolean, required: true },
  lawn: { type: Boolean, required: true },
  BBQ: { type: Boolean, required: true },
  laundry: { type: Boolean, required: true }
});

const Amenities = mongoose.model('Amenities', amenitiesSchema);

module.exports = Amenities;
