# HW14-B Passport.js Username & Email Authentication

Standalone Express authentication app using Passport LocalStrategy and bcrypt.

## What This Demonstrates

- Register with `email` and `password`
- Password hashing with `bcrypt`
- Login using email plus password
- Session-based authentication with `express-session` + `connect-mongo`
- Protected route (`/profile`) and logout flow

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from `.env.example` and set your values:

```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/hw14b_auth
SESSION_SECRET=replace_with_long_random_secret
```

3. Start MongoDB locally or connect to your Atlas database.

4. Run the app:

```bash
npm run dev
```

5. Open:

- `http://localhost:3000/register`
- `http://localhost:3000/login`
- `http://localhost:3000/profile` (after login)

## Project Structure

- `index.js`: main Express app, auth routes, session setup
- `config/passport.js`: LocalStrategy logic (email + password)
- `models/User.js`: Mongoose user schema
- `middleware/auth.js`: route guard for protected pages
- `views/*.ejs`: register/login/profile templates

## Notes for Class

- Passwords are never stored in plain text.
- LocalStrategy returns generic login failure responses to avoid leaking account info.
- This project is standalone so you can copy the pattern into your term project later.

## FAQ (From Class Questions)

### How do I sign in?

1. Register first at `http://localhost:3000/register`.
2. After registering, go to `http://localhost:3000/login` if needed.
3. Enter your email and password.
4. Successful login sends you to `/profile`.

### What is `SESSION_SECRET` for?

- `SESSION_SECRET` signs the session cookie so it cannot be tampered with.
- It is not your login password.
- Keep it in `.env` and never commit it to public repositories.

### How does login validation work?

Validation happens in a few steps:

- Register route: checks required fields before creating a user.
- Passport LocalStrategy: finds user by email and compares password using `bcrypt.compare()`.
- Protected routes: checks `req.isAuthenticated()` before allowing access.

### Where are users stored?

- Users are stored in MongoDB.
- Database name comes from `MONGODB_URI`, currently `hw14b_auth`.
- Collection is `users` (from the `User` model).
- Passwords are saved as bcrypt hashes, not plain text.

### Where can I see all users?

Use either method:

1. MongoDB Compass
   - Connect to `mongodb://127.0.0.1:27017`
   - Open database `hw14b_auth`
   - Open collection `users`

2. mongosh

```bash
mongosh "mongodb://127.0.0.1:27017/hw14b_auth"
db.users.find().pretty()
```

### What screenshots do I need?

Capture one screenshot for each test scenario:

1. Register a new user and show the MongoDB document with the bcrypt hash.
2. Log in with correct credentials and show `/profile` with the user's email.
3. Log in with the wrong password and show the redirect back to `/login`.
4. Visit `/profile` while logged out and show the redirect to `/login`.
5. Log out and show that `/profile` is inaccessible again.

### What should I write for the bcrypt reflection?

Bcrypt protects user passwords by turning the real password into a hashed version before it gets saved in MongoDB. That means the app never stores the plain text password, so even if someone looks at the database, they only see the hash. When a user logs in, bcrypt compares the password they type with the stored hash to make sure they match. This makes the login system much safer and helps protect user accounts.
