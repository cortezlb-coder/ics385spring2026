# Week 10 Term Project

Property schema and seed data setup for ICS 385.

## Project Focus
- Island: Maui
- Property type: Vacation rental
- Target segment: Australian surfers

## Project Structure
- `models/Property.js`: Mongoose schema and model for properties.
- `seed.js`: Connects to MongoDB, clears old data, and inserts 5 property documents.
- `.env`: Stores the MongoDB connection string.
- `.gitignore`: Excludes `node_modules` and `.env` from Git tracking.

## Requirements
- Node.js
- MongoDB (Atlas or local)

## Setup
1. Install dependencies:
	`npm install`
2. Add your connection string in `.env`:

```env
MONGO_URI=your_mongodb_connection_string
```

Examples:
- Atlas: `MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/<db-name>?retryWrites=true&w=majority`
- Local: `MONGO_URI=mongodb://127.0.0.1:27017/hawaii-properties`

## Run Seed Script
Use the command below to seed the database:

```bash
node seed.js
```

Expected console output:
- `Connected to MongoDB`
- `Old properties deleted`
- `5 properties inserted`
- `MongoDB connection closed`
