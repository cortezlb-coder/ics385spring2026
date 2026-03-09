"use strict";

// Secure configuration management for the dashboard frontend.
// Note: In production, API keys should stay on the backend only.
class SecureConfig {
	constructor() {
		this.config = this.loadConfiguration();
		this.validateConfiguration();
	}

	loadConfiguration() {
		return {
			apis: {
				openWeather: {
					key: this.getSecureApiKey("openweather"),
					baseUrl: "https://api.openweathermap.org/data/2.5",
					endpoints: {
						current: "/weather",
						forecast: "/forecast",
					},
					rateLimit: {
						requests: 60,
						period: 60000,
					},
					timeout: 5000,
				},
				rapidApi: {
					key: this.getSecureApiKey("rapidapi"),
					host: "matchilling-chuck-norris-jokes-v1.p.rapidapi.com",
					baseUrl: "https://matchilling-chuck-norris-jokes-v1.p.rapidapi.com",
					endpoints: {
						random: "/jokes/random",
						categories: "/jokes/categories",
					},
					rateLimit: {
						requests: 100,
						period: 60000,
					},
					timeout: 3000,
				},
				jokeApi: {
					baseUrl: "https://v2.jokeapi.dev",
					endpoints: {
						joke: "/joke/Programming",
						categories: "/categories",
					},
					rateLimit: {
						requests: 120,
						period: 60000,
					},
					timeout: 3000,
				},
			},
			app: {
				name: "UH Maui Campus Dashboard",
				version: "1.0.0",
				defaultCity: "Kahului",
				refreshInterval: 10 * 60 * 1000,
				cacheExpiry: 10 * 60 * 1000,
				maxRetries: 3,
				retryDelay: 1000,
			},
			ui: {
				animationDuration: 300,
				toastDuration: 5000,
				modalTimeout: 10000,
				loadingDelay: 500,
			},
		};
	}

	getSecureApiKey(service) {
		// In this project, backend .env keys are preferred.
		// localStorage keys are optional and only used if present.
		const key = localStorage.getItem(`${service}_api_key`);
		return key || null;
	}

	validateConfiguration() {
		const required = ["openweather_api_key", "rapidapi_api_key"];
		const missing = required.filter((key) => !localStorage.getItem(key));

		if (missing.length > 0) {
			// Beginner note: backend .env keys can still power the app through /api endpoints.
			console.warn(
				`Optional localStorage keys not found: ${missing.join(
					", "
				)}. Using backend .env API integration.`
			);
		}
	}

	getApiConfig(service) {
		if (!this.config.apis[service]) {
			throw new Error(`Unknown API service: ${service}`);
		}
		return this.config.apis[service];
	}

	getAppConfig() {
		return this.config.app;
	}

	getUiConfig() {
		return this.config.ui;
	}
}

// Initialize configuration and expose globally for other frontend files.
let appConfig;
try {
	appConfig = new SecureConfig();
} catch (error) {
	console.error("Configuration error:", error.message);
	window.__configError = error.message;
}

window.SecureConfig = SecureConfig;
window.appConfig = appConfig;

