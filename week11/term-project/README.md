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

## Week 11 Update (Reviews + CRUD Routes + EJS UI)

This Week 11 update builds on Week 10 by embedding a Review schema in each `Property` document and connecting a simple EJS UI to MongoDB through Mongoose.

### What Was Added
- Embedded `Review` schema in `models/Property.js` with:
	- `guestName`
	- `rating` (1-5)
	- `comment`
	- `date`
- Express app in `index.js` connected to MongoDB using Mongoose.
- Basic EJS listing page in `views/properties.ejs` rendered at `/properties`.
- Postman collection exported and committed at:
	- `postman/week11-properties-routes.postman_collection.json`

### Week 11 Routes
- `GET /properties`
	- Lists properties.
	- Renders EJS for browser requests.
	- Returns JSON when `?format=json` is set.
	- Supports filtering:
		- `island=<value>`
		- `minRating=<1-5>` (uses Mongoose query operators `$gte` and `$lte`)
- `GET /properties/:id`
	- Returns one property by MongoDB `_id`.
- `POST /properties/:id/reviews`
	- Adds a review to a property.
	- Body example:

```json
{
	"guestName": "Ari",
	"rating": 5,
	"comment": "Amazing surf access and very clean stay."
}
```

### Week 11 Run Steps
1. Install dependencies:
	 `npm install`
2. Seed database:
	 `npm run seed`
3. Start app:
	 `npm start`
4. Open UI:
	 `http://localhost:3000/properties`

### Deliverables
- GitHub commit link: add this after pushing your Week 11 commit.
- Exported Postman collection JSON: committed in `postman/week11-properties-routes.postman_collection.json`.
