# Maui Surf House Term Project

Maui Surf House is a full-stack vacation rental site for Australian surfers visiting Maui: a public marketing page with a live dashboard, local + Google login, and an admin-protected property editor, all backed by MongoDB.

## Contents
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [API Routes](#api-routes)
- [Security](#security)
- [Seeded Accounts](#seeded-accounts)
- [PRD Summary](#prd-summary)
- [PRD v3 Acceptance Results](#prd-v3-acceptance-results)
- [Deployment Notes](#deployment-notes)
- [Week-by-Week Summary](#week-by-week-summary)

## Quick Start

### Requirements
- Node.js
- MongoDB Atlas or a local MongoDB instance

### Setup
1. Install dependencies:
	`npm install`
2. Copy `.env.example` to `.env`:

```powershell
Copy-Item .env.example .env
```

3. Set at least `MONGO_URI` and `SESSION_SECRET` in `.env`:

```env
MONGO_URI=your_mongodb_connection_string
SESSION_SECRET=change_this_to_a_long_random_secret
```

Connection string examples:
- Atlas: `mongodb+srv://<username>:<password>@<cluster-url>/<db-name>?retryWrites=true&w=majority`
- Local: `mongodb://127.0.0.1:27017/hawaii-properties`

4. (Optional) For Google login, create OAuth 2.0 credentials in Google Cloud Console, add `http://localhost:3000/auth/google/callback` as an authorized redirect URI, and set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_CALLBACK_URL` in `.env`.

### Run the backend
1. Seed the database: `npm run seed`
2. Start the server: `npm start`
3. Open: `http://localhost:3000/properties`

### Run the React marketing page
1. Install dependencies: `npm --prefix react-marketing install`
2. Start the dev server: `npm --prefix react-marketing run dev`
3. Build for production: `npm --prefix react-marketing run build`

React environment variable: `VITE_WEATHER_KEY` (OpenWeatherMap API key).

### Run tests
```powershell
npm test
```
Tests use mocked models and `NODE_ENV=test`, so they don't need a live MongoDB connection.

![npm test passing](docs/screenshots/npm-test-output.png)

## Project Structure
- `app.js`: Express app entry point. Sets up middleware (Helmet, sessions, Passport, CORS) and mounts the routers below.
- `middleware/ensureAuth.js`: blocks a request unless the user has an active session.
- `middleware/ensureAdmin.js`: blocks a request unless the user is a signed-in admin.
- `routes/auth.js`: `/auth/session`, `/auth/login`, `/auth/logout`, `/auth/google`, `/auth/google/callback`.
- `routes/public.js`: `/`, `/login`, `/properties`, `/properties/:id`, and posting a review.
- `routes/admin.js`: protected admin dashboard and property update routes.
- `models/Property.js`: Property and review schema.
- `models/User.js`: Local and Google user schema with role and email.
- `config/passport.js`: Local strategy (bcrypt check) and Google strategy, both registered together.
- `seed.js`: Deletes old records and inserts the single Maui Surf House listing plus two local users (each with an email so Google can link to the same account).
- `views/properties.ejs`: Simple rendered property page.
- `react-marketing/`: Vite + React marketing page and dashboard for the PRD hero, about, amenities, CTA, charts, and weather. Built to `react-marketing/dist` and served by Express when `NODE_ENV=production`.
- `docs/data-flow-diagram.md`: Mermaid data flow diagram for the frontend, backend, database, authentication, and dashboard integrations.
- `postman/week11-properties-routes.postman_collection.json`: API test collection.
- `tests/auth.test.js`: Jest and Supertest authentication and authorization tests.
- `.env`: Holds local database, session, frontend, and OAuth configuration.
- `.gitignore`: Excludes `node_modules`, `.env`, and `dist`.

## API Routes
| Route | What it does |
| --- | --- |
| `GET /auth/session` | Returns the current session state and signed-in user details. |
| `POST /auth/login` | Authenticates a local user and creates a session. |
| `POST /auth/logout` | Destroys the current session. |
| `GET /auth/google` | Starts Google OAuth when Google credentials are configured. |
| `GET /auth/google/callback` | Completes Google OAuth and redirects to the React frontend. |
| `GET /properties` | Lists properties. Add `?format=json` for JSON, otherwise renders the EJS page. Supports island and rating filters. |
| `GET /properties/:id` | Returns one property by MongoDB id. |
| `POST /properties/:id/reviews` | Adds a review with `guestName`, `rating`, and `comment`. |
| `GET /admin/dashboard` | Protected property and review metrics (admin only). |
| `PUT /admin/properties/:id` | Updates allowed property fields (admin only). |

## Security
- Helmet sets standard security headers on every response.
- express-validator checks and cleans input on `POST /auth/login` and `POST /properties/:id/reviews`.
- Session cookies are `httpOnly`, `sameSite: lax`, and `secure` in production.
- Local login and Google login both work for the same account: seeded local users have an email, so a Google sign-in with a matching verified email links to that same user instead of creating a duplicate.

## Seeded Accounts
Run `npm run seed` to insert default accounts:
- Admin: `admin` / `Admin123!`
- User: `visitor` / `User123!`

Both come with a placeholder email so Google sign-in can link to the same account. Passwords are stored as bcrypt hashes in the `users` collection — never as plain text.

**Demo only:** these are fixed, publicly documented credentials meant for local development and the class code review. Do not reuse this password anywhere else, and re-seed the live database with a private password before treating this as a real production app.

## PRD Summary
- Project: Maui Surf House, on Maui
- Visitor segment: Australians coming to Maui to surf
- Goal: make it easy to show the property, the surf-friendly amenities, and the next step to book
- Data model: one `Property` document (`name`, `island`, `type`, `description`, `amenities[]`, `targetSegment`, `imageURL`, `reviews[]`) with embedded `Review` subdocuments (`guestName`, `rating` 1–5, `comment`, `date`)
- Dashboard: three Chart.js visualizations (DBEDT tourism trend, visitor spending trend, live OpenWeatherMap forecast)
- Marketing content must highlight surfboard storage/rental, an outdoor shower, and optional Jeep/Tacoma rental

## PRD v3 Acceptance Results

| Criterion | What it checks | Result | Evidence |
| --- | --- | --- | --- |
| AC-1 Marketing page | Visiting the site shows the Maui property with an image, description, and surf amenities (board storage, outdoor shower, Jeep/Tacoma rental). | Pass | Public page shows the Maui property, image, description, and surf amenities. |
| AC-2 Visitor dashboard | The dashboard shows three charts (tourism, occupancy, weather) without needing to log in. | Pass | Public visitors can see visitor arrivals, hotel occupancy, and weather charts. |
| AC-3 Local login | A seeded username/password can log in and get a session cookie. | Pass | Admin login creates a session; automated authentication tests pass. |
| AC-4 Google login | Signing in with Google creates or reuses a user account. | Pass | Google OAuth redirects, authenticates, and persists Google users. |
| AC-5 Protected admin dashboard | Only a signed-in admin can reach `/admin/*` routes; everyone else is blocked. | Pass | Unauthenticated and non-admin requests cannot access admin routes. |
| AC-6 Property update | An admin edit to a property is saved and shows up on the next request. | Pass | Authenticated admin property update is covered by automated tests. |
| AC-7 Logout | Logging out ends the session so protected routes are blocked again. | Pass | Logout destroys the session and blocks protected routes afterward. |
| AC-8 Secret hygiene | Real secrets stay out of git; only placeholders are committed. | Pass | `.env` is ignored and `.env.example` contains placeholders and local URLs only. |

## Deployment Notes
This app now deploys as **one** Render Web Service: Express serves the API and, in production, serves the built React app from `react-marketing/dist` on the same origin. The separate React Static Site is no longer needed — delete it once this service is live and the Google callback URL points here.

- Build command: `npm install` (this runs `postinstall`, which builds `react-marketing`).
- Start command: `npm start`.
- Set `NODE_ENV=production`, `MONGO_URI`, `SESSION_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_CALLBACK_URL` (pointing at this same service's `/auth/google/callback`) in the Render dashboard.
- `FRONTEND_ORIGIN` and `VITE_API_BASE_URL` are no longer needed in production since the frontend and backend share one origin.

Fixes made while deploying to Render:
- **Google `redirect_uri_mismatch`:** registered the exact production callback in Google Cloud Console and Render.
- **Google callback HTTP 500:** accepted the email-verification profile fields returned by Google.
- **MongoDB duplicate username error:** new Google users originally had `username: null`, which conflicted with the unique `username` index. New Google users now receive a unique `google_<google-id>` username.
- **Cached session state:** added `Cache-Control: no-store` on `/auth/session` and `cache: "no-store"` in the React session fetch.
- **Logout reused the session:** logout now calls Passport's `req.logout()`, destroys the server session, and clears `connect.sid`.
- **Google silently reused the account:** Google login uses `prompt: "select_account"` so the user can choose an account after application logout.
- **`vite: not found` build failure:** `vite` lives in `react-marketing`'s devDependencies, and Render's `NODE_ENV=production` made `npm install` skip devDependencies. Fixed by using `npm install --include=dev --prefix react-marketing` in the `build` script.

## Week-by-Week Summary
- **Week 10:** First time connecting Express to MongoDB Atlas — set up a database user, wrote my first Mongoose schema, and got a seed script to load one property.
- **Week 11:** Learned how routes actually work by building `GET`/`POST` endpoints for properties and reviews, then used Postman to poke at each one and check the responses before wiring up any frontend.
- **Week 12:** Rebuilt the project around the real Maui Surf House PRD, trimmed the seed data down to one clean listing, and started the React marketing page from scratch.
- **Week 13:** Added a React dashboard with Chart.js and pulled in live weather from OpenWeatherMap — first real experience calling an outside API from the frontend.
- **Week 14:** Learned password hashing with bcrypt, sessions with `express-session`, and how to gate routes so only an admin role can hit certain endpoints.
- **Week 15:** Added Google login next to the local one with Passport, learned why Helmet and express-validator matter for security, split the one giant `app.js` file into routes/middleware/config, and got the whole thing deployed on Render.

