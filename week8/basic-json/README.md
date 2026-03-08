# Week 8 JSON Project (Simple)

This project is a course catalog webpage.
It shows courses, lets users search/filter, and shows stats.

https://cortezlb-coder.github.io/week8JSONUHMC/

## How I used AI (step by step)

1. `sample-data.json`
- I asked AI to help build the JSON format.
- I checked and fixed field names.
- Pulled from UHMC catalog

2. `index.html`
- I asked AI to create the page layout.
- I kept IDs correct for JavaScript buttons and inputs.

3. `styles.css`
- I asked AI to style the page (cards, buttons, modal, responsive layout).
- I modeled it after a previous assignement

4. `course-catalog.js`
- I asked AI to build the app logic.
- It included load data, validate data, render cards, search/filter, modal, and export.
- I tested and fixed bugs.

## Issues I ran into

1. CSS not showing
- Cause: `styles.css` became empty.
- Fix: Restored the CSS file.

2. Buttons not working
- Cause: event listeners were missing/broken.
- Fix: Reconnected listeners for search, filters, clear, load, export, and modal close.

3. Courses not showing
- Cause: data was not loading correctly in some runs.
- Fix: Added fallback data loading.

## How to run

- Open `week8/basic-json/index.html` in browser.
- Use search, filters, and export buttons.

## What I learned

- JSON structure must match JavaScript exactly.
- Small file issues (empty files, wrong listeners) can break the page.
- AI helps speed up coding, but I still must test and debug myself.
- MAKE SNAPSHOTS IN BETWEEN
