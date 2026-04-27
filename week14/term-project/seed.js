require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Property = require("./models/Property");
const User = require("./models/User");

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
    const saltRounds = 10;
    const adminPasswordHash = await bcrypt.hash("Admin123!", saltRounds);
    const userPasswordHash = await bcrypt.hash("User123!", saltRounds);

    await Property.deleteMany({});
    console.log("Old properties deleted");

    await Property.insertMany(seedProperties);
    console.log("1 property inserted");

    await User.deleteMany({ username: { $in: ["admin", "visitor"] } });
    await User.insertMany([
      {
        username: "admin",
        passwordHash: adminPasswordHash,
        role: "admin"
      },
      {
        username: "visitor",
        passwordHash: userPasswordHash,
        role: "user"
      }
    ]);
    console.log("Default users inserted: admin and visitor");

    mongoose.connection.close();
    console.log("MongoDB connection closed");
  } catch (err) {
    console.log("Error seeding database:", err);
    mongoose.connection.close();
  }
}

// run it
seedDB();