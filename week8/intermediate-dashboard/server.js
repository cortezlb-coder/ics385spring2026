"use strict";

const express = require("express");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use(express.static(__dirname));

const cacheStore = new Map();

class SecureConfig {
  // Requirement 1.2: centralized secure configuration validation.
  static required = ["OPENWEATHER_API_KEY", "RAPIDAPI_KEY", "RAPIDAPI_HOST"];

  static missingKeys() {
    return this.required.filter((key) => !process.env[key]);
  }

  static status() {
    const missing = this.missingKeys();
    return {
      configured: missing.length === 0,
      missing,
      appName: process.env.APP_NAME || "UH Maui Campus Dashboard",
      defaultCity: process.env.DEFAULT_CITY || "Kahului",
      cacheDurationMs: Number(process.env.CACHE_DURATION) || 600000,
      apiTimeoutMs: Number(process.env.API_TIMEOUT) || 5000,
    };
  }
}

function getCached(cacheKey) {
  const entry = cacheStore.get(cacheKey);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cacheStore.delete(cacheKey);
    return null;
  }
  return entry.value;
}

function setCached(cacheKey, value, ttlMs) {
  // Requirement 1.4: cache responses to reduce API call volume.
  cacheStore.set(cacheKey, {
    value,
    expiresAt: Date.now() + ttlMs,
  });
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 5000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

async function getWeather(city) {
  const cacheKey = `weather:${city.toLowerCase()}`;
  const cached = getCached(cacheKey);
  if (cached) return { ...cached, cached: true };

  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) throw new Error("OPENWEATHER_API_KEY missing in .env");

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
      city
    )}&appid=${apiKey}&units=imperial`;
    const data = await fetchWithTimeout(url, {}, Number(process.env.API_TIMEOUT) || 5000);

    setCached(cacheKey, data, Number(process.env.CACHE_DURATION) || 600000);
    return data;
  } catch (error) {
    // Requirement 1.3 + 2.6: fallback keeps dashboard working if API fails.
    return {
      name: city,
      main: { temp: 78, humidity: 65 },
      weather: [{ description: "partly cloudy", icon: "02d" }],
      wind: { speed: 12 },
      error: true,
      message: `Weather fallback: ${error.message}`,
    };
  }
}

async function getProgrammingJoke(forceFresh = false) {
  const cacheKey = "joke:programming";
  const cached = forceFresh ? null : getCached(cacheKey);
  if (cached) return { ...cached, cached: true };

  try {
    const data = await fetchWithTimeout(
      "https://v2.jokeapi.dev/joke/Programming?type=single",
      {},
      Number(process.env.API_TIMEOUT) || 5000
    );
    setCached(cacheKey, data, 5 * 60 * 1000);
    return data;
  } catch (error) {
    return {
      joke: "Why do programmers prefer dark mode? Because light attracts bugs!",
      error: true,
      message: `Programming joke fallback: ${error.message}`,
    };
  }
}

async function getChuckJoke(forceFresh = false) {
  const cacheKey = "joke:chuck";
  const cached = forceFresh ? null : getCached(cacheKey);
  if (cached) return { ...cached, cached: true };

  try {
    const rapidKey = process.env.RAPIDAPI_KEY;
    const rapidHost = process.env.RAPIDAPI_HOST;
    if (!rapidKey || !rapidHost) {
      throw new Error("RapidAPI credentials missing in .env");
    }

    const data = await fetchWithTimeout(
      "https://matchilling-chuck-norris-jokes-v1.p.rapidapi.com/jokes/random",
      {
        headers: {
          "X-RapidAPI-Key": rapidKey,
          "X-RapidAPI-Host": rapidHost,
          accept: "application/json",
        },
      },
      Number(process.env.API_TIMEOUT) || 5000
    );
    setCached(cacheKey, data, 5 * 60 * 1000);
    return data;
  } catch (error) {
    return {
      value: "Chuck Norris does not need the internet. The internet needs Chuck Norris.",
      error: true,
      message: `Chuck Norris fallback: ${error.message}`,
    };
  }
}

app.get("/api/health", (_req, res) => {
  // Requirement 2.5: exposes safe config status without exposing secret values.
  res.json({
    ok: true,
    timestamp: new Date().toISOString(),
    config: SecureConfig.status(),
  });
});

app.get("/api/weather", async (req, res) => {
  // Requirement 1.1 + 2.2: weather integration endpoint.
  const city = String(req.query.city || process.env.DEFAULT_CITY || "Kahului").trim() || "Kahului";
  const data = await getWeather(city);
  res.json(data);
});

app.get("/api/humor", async (req, res) => {
  // Requirement 1.8: concurrent humor fetch using Promise.all.
  const forceFresh = String(req.query.fresh || "") === "1";
  const [chuck, programming] = await Promise.all([
    getChuckJoke(forceFresh),
    getProgrammingJoke(forceFresh),
  ]);
  res.json({ chuck, programming });
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
