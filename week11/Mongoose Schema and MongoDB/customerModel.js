const mongoose = require('mongoose');

// Define the customer schema
const customerSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  // Add any other fields as needed
});

// Create the customer model
const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;
