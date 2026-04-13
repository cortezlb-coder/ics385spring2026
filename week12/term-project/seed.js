require("dotenv").config();
const mongoose = require("mongoose");
const Property = require("./models/Property");

// connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("MongoDB connection error:", err));

// single Maui Surf House property
const seedProperties = [
  {
    name: "Maui Surf House",
    island: "Maui",
    type: "vacation rental",
    description: "A surf-friendly vacation stay in Kihei for Australians visiting Maui.",
    amenities: [
      "WiFi",
      "Surfboard storage",
      "Outdoor shower",
      "Parking",
      "Washer",
      "Jeep or Tacoma rental available"
    ],
    targetSegment: "Australian surfers",
    imageURL: "https://example.com/maui-surf-house.jpg"
  }
];

// seed function
async function seedDB() {
  try {
    await Property.deleteMany({});
    console.log("Old properties deleted");

    await Property.insertMany(seedProperties);
    console.log("1 property inserted");

    mongoose.connection.close();
    console.log("MongoDB connection closed");
  } catch (err) {
    console.log("Error seeding database:", err);
    mongoose.connection.close();
  }
}

// run it
seedDB();