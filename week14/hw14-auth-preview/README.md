# HW14 Auth Preview (Thursday)

Standalone Express authentication app using Passport LocalStrategy and bcrypt.

## What This Demonstrates

- Register with `username`, `email`, and `password`
- Password hashing with `bcrypt`
- Login using **username OR email** plus password
- Session-based authentication with `express-session` + `passport`
- Protected route (`/dashboard`) and logout flow

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from `.env.example` and set your values:

```env
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/hw14_auth_preview
SESSION_SECRET=change_this_secret_value
```

3. Start MongoDB locally (or point `MONGO_URI` to your Mongo instance).

4. Run the app:

```bash
npm run dev
```

5. Open:

- `http://localhost:3000/register`
- `http://localhost:3000/login`
- `http://localhost:3000/dashboard` (after login)

## Project Structure

- `index.js`: main Express app, auth routes, session setup
- `config/passport.js`: LocalStrategy logic (username/email + password)
- `models/User.js`: Mongoose user schema
- `middleware/auth.js`: route guard for protected pages
- `views/*.ejs`: register/login/dashboard templates

## Notes for Class

- Passwords are never stored in plain text.
- LocalStrategy returns generic "Invalid credentials" to avoid leaking account info.
- This project is standalone so you can copy the pattern into your term project later.

## FAQ (From Class Questions)

### How do I sign in?

1. Register first at `http://localhost:3000/register`.
2. After registering, you will be logged in automatically.
3. For future logins, use `http://localhost:3000/login`.
4. Enter either your username or email, plus your password.

### What is `SESSION_SECRET` for?

- `SESSION_SECRET` signs the session cookie so it cannot be tampered with.
- It is not your login password.
- Keep it in `.env` and never commit it to public repositories.

### How does login validation work?

Validation happens in a few steps:

- Register route (`index.js`): checks required fields, password length, and duplicate users.
- Passport LocalStrategy (`config/passport.js`): finds user by username/email and compares password using `bcrypt.compare()`.
- Protected routes (`middleware/auth.js`): checks `req.isAuthenticated()` before allowing access.

### Where are users stored?

- Users are stored in MongoDB.
- Database name comes from `MONGO_URI`, currently `hw14_auth_preview`.
- Collection is `users` (from the `User` model).
- Passwords are saved as `passwordHash` (bcrypt hash), not plain text.

### Where can I see all users?

Use either method:

1. MongoDB Compass
	- Connect to `mongodb://127.0.0.1:27017`
	- Open database `hw14_auth_preview`
	- Open collection `users`

2. mongosh

```bash
mongosh "mongodb://127.0.0.1:27017/hw14_auth_preview"
db.users.find().pretty()
```


