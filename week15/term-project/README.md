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
This repo currently contains the Express, Mongoose, EJS, and React versions of the project. It has:
- A MongoDB property model in `models/Property.js`
- A seed script in `seed.js`
- Property routes and review posting in `index.js`
- Local session authentication and role-based admin protection
- Google OAuth login through Passport.js
- Automated authentication and authorization tests in `tests/auth.test.js`
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
- Week 14: added local login, sessions, bcrypt password hashing, role-based admin routes, and the protected admin dashboard.
- Week 15: added Google OAuth, finalized the PRD v3 authentication requirements, and added automated Jest/Supertest coverage for login, authorization, property updates, logout, and the Google login redirect.

## Project Structure
- `index.js`: Express app, MongoDB connection, and property routes.
- `models/Property.js`: Property and review schema.
- `models/User.js`: Local and Google user schema with role information.
- `routes/auth.js`: Google OAuth routes and Passport logout route.
- `config/passport.js`: Passport serialization and Google strategy configuration.
- `seed.js`: Deletes old records and inserts the single Maui Surf House listing.
- `views/properties.ejs`: Simple rendered property page.
- `react-marketing/`: Vite + React marketing page and dashboard for the PRD hero, about, amenities, CTA, charts, and weather.
- `docs/data-flow-diagram.md`: Mermaid data flow diagram for the frontend, backend, database, authentication, and dashboard integrations.
- `postman/week11-properties-routes.postman_collection.json`: API test collection.
- `tests/auth.test.js`: Jest and Supertest authentication and authorization tests.
- `.env`: Holds local database, session, frontend, and OAuth configuration.
- `.gitignore`: Excludes `node_modules` and `.env`.

## Requirements
- Node.js
- MongoDB Atlas or local MongoDB

## Setup
1. Install dependencies:
	`npm install`
2. Copy `.env.example` to `.env` and add your local values:

```powershell
Copy-Item .env.example .env
```

At minimum, configure `MONGO_URI` and `SESSION_SECRET`:

```env
MONGO_URI=your_mongodb_connection_string
SESSION_SECRET=change_this_to_a_long_random_secret
```

Examples:
- Atlas: `MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/<db-name>?retryWrites=true&w=majority`
- Local: `MONGO_URI=mongodb://127.0.0.1:27017/hawaii-properties`

For Google login, create OAuth 2.0 credentials in Google Cloud Console and add `http://localhost:3000/auth/google/callback` as an authorized redirect URI. Then set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_CALLBACK_URL` in `.env`.

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

## Run Tests
Run the backend authentication and authorization tests from the project directory:

```powershell
npm test
```

The tests use mocked models and `NODE_ENV=test`, so they do not require a live MongoDB connection.

## React Environment
- `VITE_WEATHER_KEY`: OpenWeatherMap API key.

## API Routes
- `GET /auth/session`
	- Returns the current session state and signed-in user details.
- `POST /auth/login`
	- Authenticates a seeded local user and creates a session.
- `POST /auth/logout`
	- Destroys the current local session.
- `GET /auth/google`
	- Starts Google OAuth when Google credentials are configured.
- `GET /auth/google/callback`
	- Completes Google OAuth and redirects to the React frontend.
- `GET /properties`
	- Lists properties.
	- Returns JSON with `?format=json`.
	- Renders the EJS page in a browser.
	- Supports island and rating filters.
- `GET /properties/:id`
	- Returns one property by MongoDB id.
- `POST /properties/:id/reviews`
	- Adds a review with `guestName`, `rating`, and `comment`.
- `GET /admin/dashboard`
	- Returns protected property and review metrics for admin users.
- `PUT /admin/properties/:id`
	- Updates allowed property fields for admin users.

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

## PRD v3 Acceptance Results

| Criterion | Result | Evidence |
| --- | --- | --- |
| AC-1 Marketing page | Pass | Public page shows the Maui property, image, description, and surf amenities. |
| AC-2 Visitor dashboard | Pass | Public visitors can see visitor arrivals, hotel occupancy, and weather charts. |
| AC-3 Local login | Pass | Admin login creates a session; automated authentication tests pass. |
| AC-4 Google login | Pass | Google OAuth redirects, authenticates, and persists Google users. |
| AC-5 Protected admin dashboard | Pass | Unauthenticated and non-admin requests cannot access admin routes. |
| AC-6 Property update | Pass | Authenticated admin property update is covered by automated tests. |
| AC-7 Logout | Pass | Logout destroys the session and blocks protected routes afterward. |
| AC-8 Secret hygiene | Pass | `.env` is ignored and `.env.example` contains placeholders and local URLs only. |

## Reflection
Week 13 built a dashboard with three charts showing Hawaii tourism data from DBEDT and live weather from OpenWeatherMap. The Dashboard component is modular and handles API failures with fallback data. Weeks 14 and 15 extended the project with bcrypt-based local authentication, Passport sessions, role-protected admin routes, Google OAuth, and automated tests. The main remaining maintenance work is to keep the README, environment template, and acceptance evidence synchronized as the project changes.

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
- Visitors can view the marketing page and dashboard charts without logging in.
- The top-right `Log in` link opens the login form.
- Successful login stores a session cookie and shows the signed-in user.
- Admin-only backend routes remain protected by role.
- A logout button clears the session and returns the page to visitor mode.

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

## Issues Found and Resolved During Render Deployment

The deployment and authentication flow required several fixes that are now documented for the final code review:

- **Google `redirect_uri_mismatch`:** registered the exact production callback in Google Cloud Console and Render: `https://ics385spring2026-a20r.onrender.com/auth/google/callback`.
- **Google callback HTTP 500:** accepted the email-verification profile fields returned by Google.
- **MongoDB duplicate username error:** new Google users originally had `username: null`, which conflicted with the unique `username` index. New Google users now receive a unique `google_<google-id>` username.
- **Frontend session returned unauthenticated:** configured production cookies for the separate Render frontend/backend origins and kept `credentials: "include"` on session requests.
- **Cached session state:** added `Cache-Control: no-store` on `/auth/session` and `cache: "no-store"` in the React session fetch.
- **Logout reused the session:** logout now calls Passport's `req.logout()`, destroys the server session, and clears `connect.sid`.
- **Google silently reused the account:** Google login uses `prompt: "select_account"` so the user can choose an account after application logout.
- **Stale frontend deployment:** redeployed the Static Site with root `week15/term-project/react-marketing`, build command `npm install && npm run build`, publish directory `dist`, and `VITE_API_BASE_URL` set to the live backend.
