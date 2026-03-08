# Hawaii Tourism Length of Stay Calculator

A web application to calculate and visualize average length of stay for Hawaii tourism data using MongoDB, Express.js, and vanilla JavaScript.

## Features

- Interactive web form to select visitor categories and locations
- Real-time calculation of average length of stay statistics
- Beautiful data visualizations with Chart.js
- RESTful API backend with MongoDB database
- Responsive design for mobile and desktop

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (running locally on port 27017)
- CSV data file: `Hawaii Tourism Data (from DBEDT Data Warehouse) (1).csv`

## Installation

1. Install dependencies:
```bash
cd hawaii-los-web
npm install
```

2. Make sure MongoDB is running:
```bash
# On macOS with Homebrew
brew services start mongodb-community

# Or manually
mongod
```

3. Import the CSV data into MongoDB:
```bash
npm run import
```

## Usage

1. Start the server:
```bash
npm start
```

2. Open your browser and navigate to:
```
http://localhost:3000
```

3. Use the web form to:
   - Select a visitor category (e.g., "All visitors by air")
   - Optionally select a specific location (or leave blank for all locations)
   - Click "Calculate" to see results

## API Endpoints

### GET /api/categories
Returns all available visitor categories.

### GET /api/locations
Returns all available locations.

### POST /api/calculate
Calculate average length of stay.

**Request Body:**
```json
{
  "category": "All visitors by air",
  "location": "LOS Statewide"  // optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "category": "All visitors by air",
    "location": "LOS Statewide",
    "statistics": {
      "average": 9.26,
      "min": {
        "value": 8.8,
        "year": "2019",
        "location": "LOS Statewide"
      },
      "max": {
        "value": 10.6,
        "year": "2020",
        "location": "LOS Statewide"
      },
      "dataPoints": 23
    },
    "chartData": [...]
  }
}
```

## Project Structure

```
hawaii-los-web/
├── models/
│   └── TourismData.js      # MongoDB schema
├── routes/
│   └── api.js              # API routes
├── public/
│   ├── index.html          # Main HTML page
│   ├── styles.css          # Styles
│   └── app.js              # Frontend JavaScript
├── scripts/
│   └── importData.js       # CSV import script
├── server.js               # Express server
├── package.json
├── .env                    # Environment variables
└── README.md
```

## Available Categories

- All visitors by air
- Hotel-only visitors
- First-time visitors
- Honeymoon visitors
- Condo-only visitors
- Repeat visitors
- Get-married visitors
- Timeshare-only visitors
- MCI visitors
- Rental house visitors
- B&B visitors
- Family visitors
- Visiting Friends/Relatives

## Available Locations

- LOS Statewide
- LOS on Oahu
- LOS on Maui
- LOS on Molokai
- LOS on Lanai
- LOS on Kauai
- LOS on Hawaii Island
- LOS in Hilo
- LOS in Kona

## Data Source

Hawaii Tourism Authority (via DBEDT Data Warehouse)
Data covers years 1999-2021

## Development

For development with auto-reload:
```bash
npm run dev
```

## Review Notes (Issues, Bugs, and Patterns)

### Fixed core security issues

- **Input validation added** in `routes/api.js` (lines 7-23, 56-57).
  - Before: `category` and `location` were used directly from request body.
  - Risk: bad input could be used in DB queries.

- **Error message leakage removed** in `routes/api.js` (lines 25-31, 39, 49, 149, 166).
  - Before: API returned raw `error.message` to clients.
  - Risk: internal details could be exposed.

- **Safer middleware defaults added** in `server.js` (lines 15, 34-38, 41-42).
  - Changes: disabled `x-powered-by`, added basic security headers, limited request body size.
  - Risk reduced: common web attack surface and oversized payload abuse.

- **CORS tightened with allowlist support** in `server.js` (lines 12, 17-31).
  - Note: if `ALLOWED_ORIGINS` is empty, current logic still allows all origins.
  - Recommendation: set `ALLOWED_ORIGINS` in production.

- **Debug endpoint blocked in production** in `routes/api.js` (lines 154-160).
  - `/api/data` now returns `403` when `NODE_ENV=production`.

### Noteworthy frontend patterns (standalone app)

- **No `response.ok` check after fetch** in `standalone/app.js` (line 28).
  - Pattern: app reads response text even on HTTP errors.
  - Recommendation: check `response.ok` before parsing.

- **User-facing raw error strings** in `standalone/app.js` (line 45).
  - Pattern: `error.message` is shown directly in UI.
  - Recommendation: show a generic message to users and keep full details in console.

- **Year column detection is broad** in `standalone/app.js` (line 69).
  - Pattern: `!isNaN(key)` accepts any numeric-like column name.
  - Recommendation: use a strict year check like `/^\\d{4}$/`.

- **Good chart lifecycle handling** in `standalone/app.js` (chart destroy/recreate pattern).
  - This is a good pattern that avoids duplicated chart instances and memory growth.

## License

ISC
