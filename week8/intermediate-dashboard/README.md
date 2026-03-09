# Week 8 Intermediate Dashboard (Simple)

This project is a campus dashboard webpage.
It combines local course data with live weather and joke APIs.

## How I used AI (step by step)

1. `sample-data.json` + `course-catalog.js`
- I pulled and adapted course data from my `week8/basic-json` project.
- I used `CourseCatalogAdapter` to flatten department data into dashboard-friendly course rows.

2. `index.html`
- I asked AI to build the dashboard layout.
- I kept IDs aligned with JavaScript methods (stats, weather widget, humor widget, settings, API modal).

3. `styles.css`
- I asked AI to style cards, buttons, modal, and responsive layout.
- I modeled it after my `week8/basic-json/styles.css` look.

4. `config.js`
- I used AI to set up secure config rules and app defaults.
- Frontend config now supports backend `.env` mode.

5. `api-client.js`
- I asked AI to build a unified API client.
- It includes error handling, timeout, caching, rate limiting, and backend `/api/*` calls.

6. `server.js`
- I used AI to add secure backend routes:
- `/api/health`, `/api/weather`, `/api/humor`
- It uses `.env` keys, caching, and fallback responses.

7. `dashboard.js`
- I asked AI to build the main dashboard logic.
- It includes CRUD (add/edit/delete), search/filter, settings, export JSON, weather refresh, and new jokes refresh.

## Issues I ran into

1. `npm start` failed
- Cause: command was run from wrong folder.
- Fix: run in `week8/intermediate-dashboard` or use:

```bash
npm --prefix "c:\ics385spring2026\week8\intermediate-dashboard" start
```

2. New Jokes did not change
- Cause: humor endpoint was cached.
- Fix: added force refresh path (`fresh=1`) to bypass cache when clicking New Jokes.

3. API key confusion
- Cause: `.env.example` was used like a real key file.
- Fix: real keys go in `.env`, placeholders stay in `.env.example`, and `.env` is ignored by git.

4. Course list was empty early on
- Cause: starter files were empty.
- Fix: imported JSON structure from `week8/basic-json` and adapted it.

## How to run

1. Open terminal in `week8/intermediate-dashboard`.
2. Install dependencies:

```bash
npm install
```

3. Create `.env` and add your real keys:

```env
OPENWEATHER_API_KEY=your_openweather_key
RAPIDAPI_KEY=your_rapidapi_key
RAPIDAPI_HOST=matchilling-chuck-norris-jokes-v1.p.rapidapi.com
DEFAULT_CITY=Kahului
CACHE_DURATION=600000
API_TIMEOUT=5000
PORT=3000
```

4. Start app:

```bash
npm start
```

5. Open `http://localhost:3000`.

## What I learned

- Keep API keys in `.env`, not in frontend files.
- Validate each API route one by one before combining them.
- Caching is good for performance, but some buttons need force refresh.
- Small ID mismatches between HTML and JS can break features.
- AI helps speed development, but I still need to test and debug each step.
- Save snapshots/commits frequently while building.
- got confused between the differences of .env vs .env.example, didnt realize you just have the example for the next user to follow and create their own .env
