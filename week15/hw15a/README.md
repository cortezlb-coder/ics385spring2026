# HW15A Google OAuth (Thursday)

Standalone Express authentication app using Google OAuth, Passport, and MongoDB.

## What This Demonstrates

- Google login with `passport-google-oauth20`
- OAuth callback handling with Google
- Session-based authentication with `express-session` and `connect-mongo`
- MongoDB storage for authenticated users
- Protected route (`/profile`) and POST logout flow

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a Google OAuth app in Google Cloud Console.

- Set the authorized redirect URI to:

```text
http://localhost:3000/auth/google/callback
```

3. Create `.env` from `.env.example` and set your values:

```env
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/15a
SESSION_SECRET=change_this_secret_value
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
```

4. Start MongoDB locally or point `MONGO_URI` to your Mongo instance.

5. Run the app:

```bash
npm run dev
```

6. Open:

- `http://localhost:3000/`
- `http://localhost:3000/profile` (after login)

## Project Structure

- `app.js`: main Express app, MongoDB connection, and session setup
- `config/passport.js`: Google strategy and user serialization
- `models/User.js`: Mongoose user schema
- `routes/auth.js`: Google login, callback, and logout routes
- `middleware/ensureAuth.js`: route guard for protected pages
- `views/*.ejs`: home and profile templates

## Notes for Class

- User information is stored in MongoDB after successful Google login.
- Each user document includes `googleId`, `email`, `displayName`, and `provider: "google"`.
- The Google callback URL must match exactly in Google Cloud Console.
- `SESSION_SECRET` signs the session cookie and should stay in `.env`.
- This project uses Google OAuth as the authentication provider instead of a local username/password login.

## Submission Checklist

- [x] Add a screenshot of the Google consent screen showing `ICS385 HW15A`.
- [x] Add a screenshot of `/profile` showing the email and Mongoose `_id`.
- [x] Add a screenshot of the MongoDB `15a.users` document.
- [x] Confirm `.env` is ignored and `.env.example` is committed.
- [x] Add a 100–150 word reflection.
- [x] Complete the AI Tools Used section.

## Reflection

For this assignment, I was able to see how google handles logins rather than the site handling the passwords themselves. I didn't realize all that goes in the background just to sign in with google but I can now recognize this when signing into apps now. Also seeing how see sessions are saved in the mongoDB and whos logged in seems like it can be a powerful tool in regulating traffic. The struggles I had was understanding how to navigate the google cloud oauth and creating a project from it. But after retreving the credentials it worked smoothly. I am excited to implement this into my term project and seeing admin vs user logins working. 

## AI Tools Used

GitHub Copilot was used to help inspect the assignment requirements, configure the Google OAuth flow, update the Express and Passport integration, and review the README. All generated changes were reviewed and tested locally.

## FAQ (From Class Questions)

### How do I sign in?

1. Open `http://localhost:3000/`.
2. Click the Google login button.
3. Sign in to your Google account.
4. You will be redirected to the protected profile page.

### What is `SESSION_SECRET` for?

- `SESSION_SECRET` signs the session cookie so it cannot be tampered with.
- It is not your Google password.
- Keep it in `.env` and never commit it to public repositories.

### How does Google login validation work?

Validation happens in a few steps:

- Route (`routes/auth.js`): starts the Google OAuth flow with Passport.
- Passport strategy (`config/passport.js`): receives Google profile data and checks for an email/user record.
- MongoDB (`models/User.js`): stores the auth data for the user.
- Protected route (`middleware/ensureAuth.js`): checks `req.isAuthenticated()` before allowing access.

### Where are users stored?

- Users are stored in MongoDB.
- Database name comes from `MONGO_URI`, currently `15a`.
- Collection is `users` (from the `User` model).
- Google profile data is stored such as `googleId`, `email`, `displayName`, `provider`, and `profilePhoto`.

### Where can I see all users?

Use either method:

1. MongoDB Compass
   - Connect to `mongodb://127.0.0.1:27017`
   - Open database `15a`
   - Open collection `users`

2. mongosh

```bash
mongosh "mongodb://127.0.0.1:27017/15a"
db.users.find().pretty()
```
