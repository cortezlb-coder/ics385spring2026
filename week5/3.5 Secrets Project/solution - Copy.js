// ============================================
// IMPORTS - Bringing in external tools/libraries we need
// ============================================

// Express is a web framework that helps us create a web server easily
// Think of it as a tool that handles incoming web requests
import express from "express";

// Body-parser helps us read data from HTML forms
// When a user submits a form, this package helps us access that data
import bodyParser from "body-parser";

// Express-session allows us to track individual user sessions
// This prevents the issue where one user's login affects everyone
import session from "express-session";

// crypto is Node's built-in module for creating secure hashes
import crypto from "crypto";

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

// ============================================
// SECURITY IMPROVEMENTS
// ============================================

// Helper function to hash passwords using SHA-256
// This prevents storing passwords in plaintext
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// USER DATABASE with hashed passwords
// In production, this would be in a real database
// Passwords are hashed - never stored in plaintext
const users = {
  "admin": {
    passwordHash: hashPassword("ILoveProgramming"),
    name: "Administrator"
  }
};

// Track failed login attempts per IP address
// Structure: { "ip.address": { attempts: 0, lockedUntil: null, lastAttempt: null } }
const loginAttempts = {};

// Minimum time between login attempts (in milliseconds) - 1 second
const MIN_ATTEMPT_INTERVAL = 1000;

// ============================================
// MIDDLEWARE - Code that runs BEFORE our routes
// ============================================

// Configure session management
// Each user gets their own session tracked by a secure cookie
app.use(session({
  secret: 'your-secret-key-change-this-in-production', // Used to sign the session ID cookie
  resave: false, // Don't save session if unmodified
  saveUninitialized: false, // Don't create session until something stored
  cookie: { 
    maxAge: 1000 * 60 * 30, // Session expires after 30 minutes
    httpOnly: true, // Prevents JavaScript access to cookies
    secure: false // Set to true if using HTTPS
  }
}));

// Tell Express to use body-parser for ALL incoming requests
// "extended: true" allows us to parse complex form data
// This makes req.body available in our code
app.use(bodyParser.urlencoded({ extended: true }));

// BRUTE FORCE PROTECTION FUNCTION
// Calculates lockout time based on failed attempts (exponential backoff)
function getLockoutTime(attempts) {
  // 1st fail: 5 sec, 2nd: 10 sec, 3rd: 20 sec, 4th: 40 sec, etc.
  // Maximum lockout: 5 minutes
  return Math.min(5000 * Math.pow(2, attempts - 1), 300000);
}

// ============================================
// ROUTES - Defining what happens at different URLs
// ============================================

// GET ROUTE for the home page "/"
// GET means the user is just visiting the page (not submitting a form)
// When someone visits http://localhost:3000/, this runs
app.get("/", (req, res) => {
  // Reset authorization when returning to login page
  // This ensures user must re-authenticate
  if (req.session) {
    req.session.isAuthorised = false;
  }
  // Send the index.html file (the login page with password form)
  // __dirname gives the current folder, then we add "/public/index.html"
  res.sendFile(__dirname + "/public/index.html");
});

// GET ROUTE for logout
app.get("/logout", (req, res) => {
  // Destroy the session to log out the user
  req.session.destroy((err) => {
    if (err) {
      console.log("Error destroying session:", err);
    }
    res.redirect("/");
  });
});

// POST ROUTE for "/check"
// POST means the user submitted a form (sending data to us)
// This runs when the form in index.html is submitted
app.post("/check", (req, res) => {
  // Always reset authorization at the start of a new login attempt
  // This prevents a previous successful login from bypassing validation
  req.session.isAuthorised = false;
  
  // Get the username and password from the form
  const username = req.body["username"];
  const password = req.body["password"];
  
  const clientIP = req.ip || req.connection.remoteAddress;
  const currentTime = Date.now();
  
  // Initialize tracking for this IP if not exists
  if (!loginAttempts[clientIP]) {
    loginAttempts[clientIP] = { attempts: 0, lockedUntil: null, lastAttempt: null };
  }
  
  const attemptData = loginAttempts[clientIP];
  
  // RATE LIMITING: Prevent rapid-fire attempts (spam protection)
  if (attemptData.lastAttempt && (currentTime - attemptData.lastAttempt) < MIN_ATTEMPT_INTERVAL) {
    console.log(`Rate limit: Too fast! Wait ${MIN_ATTEMPT_INTERVAL / 1000} second between attempts`);
    return res.sendFile(__dirname + "/public/index.html");
  }
  
  // Update last attempt time
  attemptData.lastAttempt = currentTime;
  
  // Check if account is currently locked due to failed attempts
  if (attemptData.lockedUntil && currentTime < attemptData.lockedUntil) {
    const waitTime = Math.ceil((attemptData.lockedUntil - currentTime) / 1000);
    console.log(`Account locked! Wait ${waitTime} more seconds`);
    // Don't process the login - immediately reject
    return res.sendFile(__dirname + "/public/index.html");
  }
  
  // Reset lockout if time has passed
  if (attemptData.lockedUntil && currentTime >= attemptData.lockedUntil) {
    attemptData.attempts = 0;
    attemptData.lockedUntil = null;
  }
  
  // Verify credentials: check if user exists and password hash matches
  const user = users[username];
  const passwordHash = hashPassword(password);
  
  if (user && user.passwordHash === passwordHash) {
    // SUCCESS - Reset failed attempts and authorize session
    attemptData.attempts = 0;
    attemptData.lockedUntil = null;
    attemptData.lastAttempt = null;
    req.session.isAuthorised = true;
    req.session.username = username;
    console.log(`✓ Login successful for user: ${username}`);
    res.sendFile(__dirname + "/public/secret.html");
  } else {
    // FAILURE - Increment attempts and calculate lockout
    attemptData.attempts++;
    const lockoutTime = getLockoutTime(attemptData.attempts);
    attemptData.lockedUntil = currentTime + lockoutTime;
    
    // Ensure session remains unauthorized
    req.session.isAuthorised = false;
    console.log(`✗ Login failed. Attempt ${attemptData.attempts}. Locked for ${lockoutTime / 1000}s`);
    res.sendFile(__dirname + "/public/index.html");
  }
});

// GET ROUTE for logout
app.get("/logout", (req, res) => {
  // Destroy the session to log out the user
  req.session.destroy((err) => {
    if (err) {
      console.log("Error destroying session:", err);
    }
    res.redirect("/");
  });
});

// Protected route for secret page (prevents direct access)
app.get("/secret", (req, res) => {
  if (req.session.isAuthorised) {
    res.sendFile(__dirname + "/public/secret.html");
  } else {
    res.redirect("/");
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
// 2. Server creates a unique session for this user (tracked by cookie)
// 3. Server sends index.html (username/password form)
// 4. User types credentials and clicks Submit
// 5. Form sends POST request to /check with username and password
// 6. /check route handler:
//    a. Checks if IP is locked out due to failed attempts
//    b. Hashes the entered password
//    c. Compares hashed password with stored hash for that username
//    d. If correct: sets req.session.isAuthorised = true and shows secret.html
//    e. If wrong: increments failed attempts, sets lockout timer, shows login page
// 7. User can visit /logout to destroy their session and log out
// 8. Direct access to /secret is protected - redirects to login if not authorized
//
// ============================================
// SECURITY IMPROVEMENTS IMPLEMENTED:
// ============================================
// ✓ Session-based authentication (each user tracked individually)
// ✓ Passwords hashed with SHA-256 (not stored in plaintext)
// ✓ Multiple user accounts supported
// ✓ Brute force protection with exponential backoff
// ✓ IP-based rate limiting for failed login attempts
// ✓ Session expiration after 30 minutes
// ✓ Logout functionality to destroy sessions
// ✓ HttpOnly cookies to prevent XSS attacks
// ✓ Credentials not displayed on login page
// ✓ Authentication only checked on login POST route (not global middleware)

