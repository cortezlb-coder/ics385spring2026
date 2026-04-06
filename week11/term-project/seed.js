require("dotenv").config();
const mongoose = require("mongoose");
const Property = require("./models/Property");

// connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("MongoDB connection error:", err));

// your 5 properties
const seedProperties = [
  {
    name: "Maui Shredding Stay",
    island: "Maui",
    type: "vacation rental",
    description: "A chill surf BNB near the beach made for Australian surfers visiting Maui.",
    amenities: [
      "WiFi",
      "Board rack",
      "Outdoor shower",
      "Parking",
      "Washer",
      "Toyota Tacoma rental available"
    ],
    targetSegment: "Australian surfers",
    imageURL: "https://example.com/maui-shredding-stay.jpg"
  },
  {
    name: "SouthSide Surf House",
    island: "Maui",
    type: "vacation rental",
    description: "Comfortable surf-friendly stay close to Kihei beaches and local food spots.",
    amenities: [
      "WiFi",
      "Kitchen",
      "Surfboard storage",
      "Air conditioning",
      "Free parking",
      "4Runner rental available"
    ],
    targetSegment: "Australian surfers",
    imageURL: "https://example.com/southside-surf-house.jpg"
  },
  {
    name: "Kihei Cruise House",
    island: "Maui",
    type: "vacation rental",
    description: "Relaxed Maui rental for surfers who want beach access and easy island living.",
    amenities: [
      "WiFi",
      "Beach towels",
      "Board rack",
      "Free parking",
      "Patio",
      "Jeep Wrangler rental available"
    ],
    targetSegment: "Australian surfers",
    imageURL: "https://example.com/kihei-cruise-house.jpg"
  },
  {
    name: "Barrels&Barrels BNB",
    island: "Maui",
    type: "vacation rental",
    description: "Laid-back vacation rental with surf gear storage and sunset views.",
    amenities: [
      "WiFi",
      "Outdoor shower",
      "Kitchen",
      "Board storage",
      "Smart TV",
      "Tacoma rental option"
    ],
    targetSegment: "Australian surfers",
    imageURL: "https://example.com/barrels-barrels-bnb.jpg"
  },
  {
    name: "Aloha Surf Nest",
    island: "Maui",
    type: "vacation rental",
    description: "Simple and stylish Maui stay for surfers looking to relax after long beach days.",
    amenities: [
      "WiFi",
      "Parking",
      "Outdoor seating",
      "Surfboard rack",
      "Washer and dryer",
      "4Runner or Jeep rental available"
    ],
    targetSegment: "Australian surfers",
    imageURL: "https://example.com/aloha-surf-nest.jpg"
  }
];

// seed function
async function seedDB() {
  try {
    await Property.deleteMany({});
    console.log("Old properties deleted");

    await Property.insertMany(seedProperties);
    console.log("5 properties inserted");

    mongoose.connection.close();
    console.log("MongoDB connection closed");
  } catch (err) {
    console.log("Error seeding database:", err);
    mongoose.connection.close();
  }
}

// run it
seedDB();