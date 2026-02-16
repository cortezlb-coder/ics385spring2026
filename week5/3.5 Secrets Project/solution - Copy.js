// ============================================
// IMPORTS - Bringing in external tools/libraries we need
// ============================================

// Express is a web framework that helps us create a web server easily
// Think of it as a tool that handles incoming web requests
import express from "express";

// Body-parser helps us read data from HTML forms
// When a user submits a form, this package helps us access that data
import bodyParser from "body-parser";

// These imports help us work with file paths
// dirname = gets the directory (folder) name
// fileURLToPath = converts a URL to a regular file path
import { dirname } from "path";
import { fileURLToPath } from "url";

// __dirname gives us the complete path to the current folder
// This is needed because we're using ES6 modules (import/export)
const __dirname = dirname(fileURLToPath(import.meta.url));

// ============================================
// SETUP - Configuring our application
// ============================================

// Create our Express application - this is our web server
const app = express();

// Port 3000 is the "door number" where our server will listen for requests
// You'll access the site at: http://localhost:3000
const port = 3000;

// This variable tracks whether the user entered the correct password
// Starts as false (user hasn't logged in yet)
var userIsAuthorised = false;

// ============================================
// MIDDLEWARE - Code that runs BEFORE our routes
// ============================================

// Tell Express to use body-parser for ALL incoming requests
// "extended: true" allows us to parse complex form data
// This makes req.body available in our code
app.use(bodyParser.urlencoded({ extended: true }));

// CUSTOM MIDDLEWARE FUNCTION
// Middleware is like a security checkpoint - it runs before the main route handler
// Parameters:
//   req = request (contains info about what the user sent)
//   res = response (what we'll send back to the user)
//   next = function to call when this middleware is done
function passwordCheck(req, res, next) {
  // Get the password from the form
  // req.body["password"] looks for a form field named "password"
  const password = req.body["password"];
  
  // Check if the password matches our secret password
  if (password === "ILoveProgramming") {
    // If correct, set userIsAuthorised to true
    userIsAuthorised = true;
  }
  
  // Call next() to move on to the next middleware or route handler
  // This is REQUIRED or the request will hang (never finish)
  next();
}

// Register our passwordCheck middleware with Express
// Now it will run for EVERY request that comes to our server
app.use(passwordCheck);

// ============================================
// ROUTES - Defining what happens at different URLs
// ============================================

// GET ROUTE for the home page "/"
// GET means the user is just visiting the page (not submitting a form)
// When someone visits http://localhost:3000/, this runs
app.get("/", (req, res) => {
  // Send the index.html file (the login page with password form)
  // __dirname gives the current folder, then we add "/public/index.html"
  res.sendFile(__dirname + "/public/index.html");
});

// POST ROUTE for "/check"
// POST means the user submitted a form (sending data to us)
// This runs when the form in index.html is submitted
app.post("/check", (req, res) => {
  // Check if the user entered the correct password
  // (passwordCheck middleware already checked and set userIsAuthorised)
  if (userIsAuthorised) {
    // If authorized, show them the secret page with hidden tips/secrets
    res.sendFile(__dirname + "/public/secret.html");
  } else {
    // If wrong password, send them back to the login page
    res.sendFile(__dirname + "/public/index.html");
    
    // Alternative way to send them back:
    // res.redirect("/") would send them to the "/" route above
  }
});

// ============================================
// START THE SERVER
// ============================================

// Tell the server to start listening for requests on port 3000
// The callback function runs once the server successfully starts
app.listen(port, () => {
  // Print a message to the console so we know the server is running
  console.log(`Listening on port ${port}`);
});

// ============================================
// HOW THE APP WORKS (FLOW):
// ============================================
// 1. User visits http://localhost:3000/
// 2. Server sends index.html (password form)
// 3. User types password and clicks Submit
// 4. Form sends POST request to /check with the password
// 5. passwordCheck middleware checks if password is "ILoveProgramming"
// 6. If correct: userIsAuthorised becomes true, secret.html is shown
// 7. If wrong: userIsAuthorised stays false, index.html is shown again
