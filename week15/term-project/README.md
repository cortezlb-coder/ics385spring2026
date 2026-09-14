# Maui Surf House Term Project

Maui Surf House is a simple full-stack vacation rental project for Australian surfers coming to Maui. The app focuses on a clear marketing page, easy booking flow, and basic property management so the property can be updated without extra steps.

## PRD Summary
- Project name: Maui Surf House
- Island: Maui
- Visitor segment: Australians coming to Maui to surf
- Main goal: make it easy to show the property, the surf-friendly amenities, and the next step to book

## Week 13 PRD Requirements

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

### Week 13 Dashboard Requirements
- The React page includes a dashboard section with three Chart.js visualizations.
- One chart shows DBEDT tourism trend data.
- One chart shows visitor spending trend data.
- One chart shows live OpenWeatherMap forecast data.
- The weather request uses `VITE_WEATHER_KEY`.

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
- Week 13: added the React dashboard, Chart.js visualizations, backend property loading, and weather integration.
- Week 14–15 (planned): wrap dashboard with Passport.js authentication, add local foods API integration, and add live surf cam feed to the dashboard.

## Project Structure
- `index.js`: Express app, MongoDB connection, and property routes.
- `models/Property.js`: Property and review schema.
- `seed.js`: Deletes old records and inserts the single Maui Surf House listing.
- `views/properties.ejs`: Simple rendered property page.
- `react-marketing/`: Vite + React marketing page for the PRD hero, about, amenities, and CTA sections.
- `react-marketing/`: Vite + React marketing page and dashboard for the PRD hero, about, amenities, CTA, charts, and weather.
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

## React Environment
- `VITE_WEATHER_KEY`: OpenWeatherMap API key.
- `VITE_LOCAL_FOODS_KEY`: (Week 14–15) API key for local restaurants/food integrations.
- `VITE_SURF_CAM_URL`: (Week 14–15) URL or API key for live surf cam feed.

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
- The dashboard renders three charts in the browser.
- The weather chart uses live OpenWeatherMap data when `VITE_WEATHER_KEY` is set.
- A visitor can reach a booking decision within 10 minutes on mobile without needing to read extra pages.
- When the admin updates property data in MongoDB, the updated value appears on the next page load and in the API response.
- `POST /properties/:id/reviews` rejects invalid ratings outside the 1 to 5 range and accepts valid submissions with status `201`.

## Reflection
Week 13 built a dashboard with three charts showing real Hawaii tourism data from DBEDT and live weather from OpenWeatherMap. The Dashboard component is modular and self-contained, so it can be wrapped with Passport.js authentication in Week 14 without any refactoring. It handles API failures gracefully by showing fallback data instead of breaking. I used Chart.js with react-chartjs-2 to render the visualizations, pulled annual aggregates from three CSV files you provided (Australian visitor arrivals, hotel occupancy, repeater rates), and wired up environment variables to keep API keys secure. Next, I'm planning to add admin authentication, a local foods API to show nearby restaurants, and a live surf cam feed to make the dashboard more useful for surfers planning their visit.

## Week 14d Updates (Login + Protected Admin Dashboard)

This checkpoint adds a full username/password login flow with role-based access for `admin` and `user` accounts.

### What Was Added
- Session-based authentication using `express-session`.
- Password hashing and verification using `bcrypt`.
- New `User` model in `models/User.js` with `username`, `passwordHash`, and `role` (`admin` or `user`).
- New auth endpoints:
	- `GET /auth/session` returns current auth state.
	- `POST /auth/login` validates username/password and creates session.
	- `POST /auth/logout` clears session.
- Admin-protected backend endpoints:
	- `GET /admin/dashboard` for admin metrics.
	- `PUT /admin/properties/:id` for admin property edits.

### React Login Screen Behavior
- A new login screen is shown before the dashboard content.
- Successful login stores session cookie and unlocks content by role.
- `admin` role sees full dashboard.
- `user` role can view marketing content but sees an access notice for admin-only dashboard data.
- A logout button clears the session and returns to login screen.

### Seeded Login Credentials
Run `npm run seed` to insert default accounts:
- Admin: `admin` / `Admin123!`
- User: `visitor` / `User123!`

### MongoDB Atlas User Collection
To see the hashed password in MongoDB Atlas, connect the app to your Atlas cluster with `MONGO_URI`, then run `npm run seed` again so the `User` collection is created and populated.

In Atlas, open your database and look for a `users` collection. Each user document should look like this:

```json
{
	"username": "admin",
	"passwordHash": "$2b$10$...bcrypt hash...",
	"role": "admin"
}
```

Use the app login form with the plain-text password `Admin123!` or `User123!`, but keep the Atlas document storing only the bcrypt hash in `passwordHash`. The seed script generates the hash automatically, so you do not need to type a hash by hand.

If the `User` collection does not appear in Atlas, rerun the seed script and refresh the Data Explorer.

### Environment Notes
Add these variables to `.env` for secure local development:

```env
MONGO_URI=your_mongodb_connection_string
SESSION_SECRET=change_this_to_a_long_random_secret
FRONTEND_ORIGIN=http://localhost:5173
```

`FRONTEND_ORIGIN` is used for credentialed CORS with the React app.

### Reflection Paragraph
One challenge I faced in Week 14d was keeping authentication stable across both the React frontend and the Express backend. During testing, the session appeared to work at login but sometimes failed after refresh, so I traced the full request flow between /auth/login, /auth/session, and the browser cookie behavior. I resolved that part by verifying session middleware settings, confirming frontend requests used credentials: include, and making sure the frontend and backend were running on the expected ports. I also ran into an Atlas database issue where seeding failed with querySrv ECONNREFUSED, which blocked the users collection from being created at first. After switching to a non-SRV Atlas URI with explicit shard hosts and reseeding, the data loaded correctly and Atlas showed user documents with bcrypt passwordHash values.
