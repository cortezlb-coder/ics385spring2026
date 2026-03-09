"use strict";

// Unified API client with caching, rate-limiting, timeout, and fallbacks.
class UnifiedApiClient {
	constructor(config) {
		// Save shared config from SecureConfig so this class knows API URLs, limits, and timeouts.
		this.config = config;
		// Cache helps us avoid repeated requests for the same data within a short time window.
		this.cache = new Map();
		// Stores last request times for visibility/debugging.
		this.requestTimestamps = new Map();
		// One rate-limiter per API service.
		this.rateLimiters = new Map();
		this.initializeRateLimiters();
	}

	initializeRateLimiters() {
		Object.keys(this.config.apis).forEach((service) => {
			this.rateLimiters.set(service, {
				requests: [],
				limit: this.config.apis[service].rateLimit.requests,
				period: this.config.apis[service].rateLimit.period,
			});
		});
	}

	async makeRequest(service, endpoint, params = {}, options = {}) {
		try {
			// 1) Stop request early if we already exceeded configured request limits.
			if (!this.checkRateLimit(service)) {
				throw new Error(`Rate limit exceeded for ${service}. Please wait.`);
			}

			const cacheKey = this.getCacheKey(service, endpoint, params);
			// 2) Return cached value when still fresh.
			if (!options.skipCache && this.isValidCache(cacheKey)) {
				console.log("Returning cached data for", service, endpoint);
				return this.cache.get(cacheKey).data;
			}

			// 3) Build request URL + headers based on service type.
			const requestConfig = this.buildRequest(service, endpoint, params, options);

			// 4) Add timeout protection so a slow API does not hang the app forever.
			const controller = new AbortController();
			const timeoutId = setTimeout(
				() => controller.abort(),
				this.config.apis[service].timeout
			);

			const response = await fetch(requestConfig.url, {
				...requestConfig.options,
				signal: controller.signal,
			});

			clearTimeout(timeoutId);

			if (!response.ok) {
				throw new Error(
					`${service} API error: ${response.status} - ${response.statusText}`
				);
			}

			const data = await response.json();
			// 5) Cache success + track request count/time for later checks.
			if (!options.skipCache) {
				this.cacheResponse(cacheKey, data);
			}
			this.updateRateLimit(service);
			this.requestTimestamps.set(service, Date.now());

			return data;
		} catch (error) {
			console.error("API request failed:", error);
			return this.handleApiError(service, endpoint, error);
		}
	}

	buildRequest(service, endpoint, params, options) {
		const apiConfig = this.config.apis[service];
		const isBackendRoute = endpoint.startsWith("/api/");
		let url = isBackendRoute ? endpoint : `${apiConfig.baseUrl}${endpoint}`;
		const headers = {
			"Content-Type": "application/json",
			...(options.headers || {}),
		};

		if (isBackendRoute) {
			if (Object.keys(params).length > 0) {
				url += `?${new URLSearchParams(params).toString()}`;
			}
			return {
				url,
				options: {
					method: options.method || "GET",
					headers,
				},
			};
		}

		switch (service) {
			case "openWeather": {
				// OpenWeather needs key + units in query params.
				const weatherParams = new URLSearchParams({
					...params,
					appid: apiConfig.key,
					units: "imperial",
				});
				url += `?${weatherParams.toString()}`;
				break;
			}
			case "rapidApi": {
				// RapidAPI sends auth using HTTP headers.
				headers["X-RapidAPI-Key"] = apiConfig.key;
				headers["X-RapidAPI-Host"] = apiConfig.host;
				break;
			}
			case "jokeApi": {
				// JokeAPI does not need auth key for this assignment route.
				if (Object.keys(params).length > 0) {
					url += `?${new URLSearchParams(params).toString()}`;
				}
				break;
			}
			default:
				throw new Error(`Unknown API service: ${service}`);
		}

		return {
			url,
			options: {
				method: options.method || "GET",
				headers,
			},
		};
	}

	checkRateLimit(service) {
		const limiter = this.rateLimiters.get(service);
		const now = Date.now();

		limiter.requests = limiter.requests.filter((time) => now - time < limiter.period);
		return limiter.requests.length < limiter.limit;
	}

	updateRateLimit(service) {
		this.rateLimiters.get(service).requests.push(Date.now());
	}

	getCacheKey(service, endpoint, params) {
		return `${service}:${endpoint}:${JSON.stringify(params)}`;
	}

	isValidCache(cacheKey) {
		if (!this.cache.has(cacheKey)) return false;
		const cached = this.cache.get(cacheKey);
		// Keep cache only while data age is less than configured expiry time.
		return Date.now() - cached.timestamp < this.config.app.cacheExpiry;
	}

	cacheResponse(cacheKey, data) {
		this.cache.set(cacheKey, {
			data,
			timestamp: Date.now(),
		});
	}

	handleApiError(service, endpoint, error) {
		console.error("API Error Details:", {
			service,
			endpoint,
			error: error.message,
			timestamp: new Date().toISOString(),
		});

		switch (service) {
			// Fallback objects keep the dashboard usable even when live APIs fail.
			case "openWeather":
				return {
					name: "Kahului",
					main: { temp: 78, humidity: 65 },
					weather: [{ description: "partly cloudy", icon: "02d" }],
					wind: { speed: 12 },
					error: true,
					message: "Weather data temporarily unavailable",
				};
			case "rapidApi":
				return {
					value:
						"Chuck Norris does not need the internet. The internet needs Chuck Norris.",
					error: true,
					message: "Chuck Norris jokes temporarily unavailable",
				};
			case "jokeApi":
				return {
					joke: "Why do programmers prefer dark mode? Because light attracts bugs!",
					error: true,
					message: "Programming jokes temporarily unavailable",
				};
			default:
				throw error;
		}
	}

	async getWeather(city = "Kahului") {
		// Requirement 1.2: use backend route so keys stay in server .env.
		return this.makeRequest("openWeather", "/api/weather", { city });
	}

	async getChuckNorrisJoke(forceRefresh = false) {
		const humor = await this.makeRequest(
			"rapidApi",
			"/api/humor",
			forceRefresh ? { fresh: "1", _t: Date.now().toString() } : {},
			{ skipCache: forceRefresh }
		);
		return humor.chuck;
	}

	async getProgrammingJoke(forceRefresh = false) {
		const humor = await this.makeRequest(
			"jokeApi",
			"/api/humor",
			forceRefresh ? { fresh: "1", _t: Date.now().toString() } : {},
			{ skipCache: forceRefresh }
		);
		return humor.programming;
	}

	async getAllJokes(forceRefresh = false) {
		try {
			// Requirement 1.1: backend already integrates JokeAPI + RapidAPI together.
			const result = await this.makeRequest(
				"jokeApi",
				"/api/humor",
				forceRefresh ? { fresh: "1", _t: Date.now().toString() } : {},
				{ skipCache: forceRefresh }
			);
			return {
				chuck: result.chuck || null,
				programming: result.programming || null,
			};
		} catch (error) {
			console.error("Failed to fetch jokes:", error);
			return { chuck: null, programming: null };
		}
	}
}

// Expose globally so dashboard.js can use it directly.
window.UnifiedApiClient = UnifiedApiClient;

