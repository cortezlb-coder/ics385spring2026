# Hawaii Tourism LOS Calculator - Standalone Version

This is a standalone version that works without Node.js or MongoDB. It loads data directly from the CSV file using JavaScript.

#UPDATE 
2/22/2026
- Added AI comments and breakdown in order to understand the code
- Updated the data.csv to the most recent data
- AI GENERATED
Checked user input first (category and location).
Why: Stops bad or weird data from being used in database searches.

Hid detailed error messages from users.
Why: Keeps hackers from seeing technical details about the server.

Made CORS stricter (only trusted websites should call the API).
Why: Helps block random outside sites from using your backend.

Added basic security headers and removed Express fingerprint (x-powered-by).
Why: Gives extra browser protection and reveals less server info.

Limited request size to 10kb.
Why: Helps prevent spam/DoS requests with huge payloads.

Blocked debug data route in production (/api/data).
Why: Prevents exposing internal data on the live app.

## How to Use

1. **Open in Browser:**
   - Simply open `index.html` in any modern web browser
   - Or use a local web server (recommended for proper file loading)

2. **Using Python's Built-in Server:**
   ```bash
   cd ~/hawaii-los-web/standalone
   python3 -m http.server 8000
   ```
   Then open http://localhost:8000 in your browser

3. **Using PHP's Built-in Server:**
   ```bash
   cd ~/hawaii-los-web/standalone
   php -S localhost:8000
   ```
   Then open http://localhost:8000 in your browser

## Files

- `index.html` - Main HTML page with embedded CSS
- `app.js` - JavaScript application logic
- `data.csv` - Hawaii Tourism data (1999-2021)

## Features

- No installation required (except for running a web server)
- All processing done in the browser
- Uses PapaParse library for CSV parsing
- Uses Chart.js for data visualization
- Fully responsive design

## External Dependencies

The following libraries are loaded from CDN:
- Chart.js 4.4.0 - for charts
- PapaParse 5.4.1 - for CSV parsing

## Browser Compatibility

Works with all modern browsers that support:
- ES6 JavaScript
- Fetch API
- Canvas API (for charts)

Tested on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Data Source

Hawaii Tourism Authority (via DBEDT Data Warehouse)
