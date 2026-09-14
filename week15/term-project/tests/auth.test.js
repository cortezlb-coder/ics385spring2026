process.env.NODE_ENV = "test";
process.env.SESSION_SECRET = "test-secret";

const request = require("supertest");
const app = require("../index");

test("AC-5: unauthenticated user cannot access admin dashboard", async () => {
  const res = await request(app).get("/admin/dashboard");

  expect(res.statusCode).toBe(401);
  expect(res.body.error).toBe("Authentication required.");
});

const bcrypt = require("bcrypt");
const User = require("../models/User");
const Property = require("../models/Property");

jest.mock("../models/User");
jest.mock("../models/Property");

test("AC-3: valid local login creates an authenticated session", async () => {
  const agent = request.agent(app);

  const passwordHash = await bcrypt.hash("Admin123!", 10);

  User.findOne.mockResolvedValue({
    _id: "123",
    username: "admin",
    passwordHash,
    role: "admin"
  });

  const res = await agent
    .post("/auth/login")
    .send({
      username: "admin",
      password: "Admin123!"
    });

  expect(res.statusCode).toBe(200);
  expect(res.body.message).toBe("Login successful.");
  expect(res.body.user.role).toBe("admin");
});

test("AC-6: authenticated admin can update property information", async () => {
  const agent = request.agent(app);

  const passwordHash = await bcrypt.hash("Admin123!", 10);

  User.findOne.mockResolvedValue({
    _id: "123",
    username: "admin",
    passwordHash,
    role: "admin"
  });

  await agent
    .post("/auth/login")
    .send({
      username: "admin",
      password: "Admin123!"
    });

  Property.findByIdAndUpdate.mockResolvedValue({
    _id: "property123",
    description: "Updated description"
  });

  const res = await agent
    .put("/admin/properties/property123")
    .send({
      description: "Updated description"
    });

  expect(res.statusCode).toBe(200);
  expect(res.body.message).toBe("Property updated.");
  expect(res.body.property.description).toBe("Updated description");
});

test("AC-7: logout ends the session and blocks protected routes", async () => {
  const agent = request.agent(app);

  const passwordHash = await bcrypt.hash("Admin123!", 10);

  User.findOne.mockResolvedValue({
    _id: "123",
    username: "admin",
    passwordHash,
    role: "admin"
  });

  await agent
    .post("/auth/login")
    .send({
      username: "admin",
      password: "Admin123!"
    });

  const logoutRes = await agent.post("/auth/logout");

  expect(logoutRes.statusCode).toBe(200);
  expect(logoutRes.body.message).toBe("Logout successful.");

  const protectedRes = await agent.get("/admin/dashboard");

  expect(protectedRes.statusCode).toBe(401);
});

