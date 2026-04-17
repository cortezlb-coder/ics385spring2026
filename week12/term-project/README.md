# Maui Surf House Term Project

Maui Surf House is a simple full-stack vacation rental project for Australian surfers coming to Maui. The app focuses on a clear marketing page, easy booking flow, and basic property management so the property can be updated without extra steps.

## PRD Summary
- Project name: Maui Surf House
- Island: Maui
- Visitor segment: Australians coming to Maui to surf
- Main goal: make it easy to show the property, the surf-friendly amenities, and the next step to book

## Week 12 PRD Requirements

### Data Model
The project uses one MongoDB property document as the source of truth for the marketing page and the backend API.

- Property schema
	- `name: String`
	- `island: String`
	- `type: String`
	- `description: String`
	- `amenities: String[]`
	- `targetSegment: String`
	- `imageURL: String`
	- `reviews: Review[]`
- Review schema
	- `guestName: String`
	- `rating: Number` between 1 and 5
	- `comment: String`
	- `date: Date`

### Data Flow
- The React marketing page requests property data from the Express backend.
- Express reads and writes MongoDB using the `Property` model.
- `GET /properties` returns the property list for the browser or JSON for API clients.
- `GET /properties/:id` returns one property document.
- `POST /properties/:id/reviews` saves a new review and returns the saved review data.
- `seed.js` loads one Maui Surf House listing so the site always starts with a known record.

### Component Data Requirements
Each component should receive explicit data fields instead of generic copy.

- Hero
	- `propertyName: String`
	- `island: String`
	- `featuredImageUrl: String`
	- `tagline: String`
	- `primaryCtaLabel: String`
	- `primaryCtaHref: String`
- About
	- `description: String`
	- `locationLabel: String`
	- `targetSegment: String`
- Amenities
	- `amenities: String[]`
	- `highlightCards: Array<{ title: String, description: String, mark: String }>`
- CTA
	- `headline: String`
	- `body: String`
	- `buttonLabel: String`
	- `buttonHref: String`
- Supporting pages
	- SplashPage: `headline: String`, `subheadline: String`, `primaryHref: String`
	- BookingPage: `checkIn: Date`, `checkOut: Date`, `guestCount: Number`, `contactName: String`, `contactEmail: String`, `phone: String`
	- CustomerDashboard: `customerName: String`, `bookings: Array<{ id: String, dates: String, status: String }>`
	- AdminDashboard: `property: Property`, `saveStatus: String`, `editFields: Object`

### Content Requirements
- The marketing page must highlight surfboard storage or board rental.
- The marketing page must highlight an outdoor shower.
- The marketing page must highlight optional Jeep or Tacoma rental.
- The site may also surface local food, surf cam, weather, and night events as supporting content.

## Current Repo Status
This repo currently contains the Express, Mongoose, and EJS version of the project. It already has:
- A MongoDB property model in `models/Property.js`
- A seed script in `seed.js`
- Property routes and review posting in `index.js`
- A browser view in `views/properties.ejs`
- A Postman collection in `postman/week11-properties-routes.postman_collection.json`
- A marketing page mock and screenshot in `docs/marketing-page.html` and `docs/marketing-page.png`
- A React marketing page in `react-marketing/` with a screenshot in `docs/react-marketing-page.png`
The older week folders are still in the repo too, so you can see the project growing little by little from week to week.

## Week-by-Week Changes
- Week 10: built the first backend version with the property model, seed data, and basic project setup.
- Week 11: added the property routes, review posting, filters, and the EJS page for the browser.
- Week 12: changed the project to match the Maui Surf House PRD, simplified the seed to one property, added the marketing page mock, and built the React marketing page with screenshots.

## Project Structure
- `index.js`: Express app, MongoDB connection, and property routes.
- `models/Property.js`: Property and review schema.
- `seed.js`: Deletes old records and inserts the single Maui Surf House listing.
- `views/properties.ejs`: Simple rendered property page.
- `react-marketing/`: Vite + React marketing page for the PRD hero, about, amenities, and CTA sections.
- `postman/week11-properties-routes.postman_collection.json`: API test collection.
- `.env`: Holds `MONGO_URI`.
- `.gitignore`: Excludes `node_modules` and `.env`.

## Requirements
- Node.js
- MongoDB Atlas or local MongoDB

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

## Run The App
1. Seed the database:
	`npm run seed`
2. Start the server:
	`npm start`
3. Open the site:
	`http://localhost:3000/properties`

## Run The React Marketing Page
1. Install the React dependencies:
	`npm --prefix react-marketing install`
2. Start the React preview server:
	`npm --prefix react-marketing run dev`
3. Build the React page:
	`npm --prefix react-marketing run build`

## API Routes
- `GET /properties`
	- Lists properties.
	- Returns JSON with `?format=json`.
	- Renders the EJS page in a browser.
	- Supports island and rating filters.
- `GET /properties/:id`
	- Returns one property by MongoDB id.
- `POST /properties/:id/reviews`
	- Adds a review with `guestName`, `rating`, and `comment`.

## Testable Acceptance Criteria
- `GET /properties` returns status `200` and includes one seeded property named `Maui Surf House` with `island` equal to `Maui`.
- `GET /properties?format=json` returns JSON that includes `name`, `island`, `type`, `description`, `amenities`, `targetSegment`, `imageURL`, and `reviews`.
- The Hero section renders the property name, the Maui location, one featured image placeholder or image URL, and a primary booking button.
- The Amenities section displays at least the three surf-focused amenities: surfboard storage or board rental, outdoor shower, and Jeep or Tacoma rental.
- A visitor can reach a booking decision within 10 minutes on mobile without needing to read extra pages.
- When the admin updates property data in MongoDB, the updated value appears on the next page load and in the API response.
- `POST /properties/:id/reviews` rejects invalid ratings outside the 1 to 5 range and accepts valid submissions with status `201`.

## Reflection
I built the Maui Surf House project around a simple surf rental idea for Australians visiting Maui. I started with an AI-made template, then kept building on it with my own changes so each week added more to the project instead of starting over. I kept the data model small, used Express and MongoDB for the backend, and used a plain EJS page so the property list is easy to review and run. For AI help, I used Copilot to start the template and help clean up the README and project notes.
