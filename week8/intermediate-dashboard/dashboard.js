"use strict";

class CampusDashboard {
  constructor() {
    this.secureConfig = window.appConfig || null;
    this.config = this.secureConfig?.config || this.getFallbackConfig();

    // Requirement 1.1 + 1.3 + 1.4 + 1.5: central API client for integration/error/caching/rate limits.
    this.apiClient = new window.UnifiedApiClient(this.config);

    // Requirement 2.1: local in-memory model for course CRUD.
    this.courseCatalog = [];
    this.filteredCourses = [];

    this.refreshTimers = new Map();
    this.lastUpdated = new Map();

    // Requirement 2.4: live dashboard status from API health.
    this.serviceHealth = {
      weather: false,
      humor: false,
    };

    this.initialize();
  }

  getFallbackConfig() {
    return {
      apis: {
        openWeather: { rateLimit: { requests: 60, period: 60000 }, timeout: 5000 },
        rapidApi: { rateLimit: { requests: 100, period: 60000 }, timeout: 3000 },
        jokeApi: { rateLimit: { requests: 120, period: 60000 }, timeout: 3000 },
      },
      app: {
        name: "UH Maui Campus Dashboard",
        defaultCity: "Kahului",
        refreshInterval: 10 * 60 * 1000,
        cacheExpiry: 10 * 60 * 1000,
      },
      ui: { loadingDelay: 300 },
    };
  }

  async initialize() {
    try {
      this.createDashboardLayout();
      this.applyUserSettings();
      this.setupEventListeners();
      await this.initializeApiKeySetup();
      this.initializeSettingsModal();
      await this.loadInitialData();
      this.startAutoRefresh();
      this.showWelcomeMessage();
    } catch (error) {
      this.handleInitializationError(error);
    }
  }

  createDashboardLayout() {
    const hasTemplate =
      document.getElementById("dashboard-container") &&
      document.getElementById("weather-widget") &&
      document.getElementById("humor-widget");

    if (!hasTemplate) {
      throw new Error("index.html layout is missing required dashboard sections.");
    }
  }

  // Requirement 2.8: user preferences for refresh interval + city.
  applyUserSettings() {
    const storedCity = localStorage.getItem("dashboard_default_city");
    const storedRefresh = Number(localStorage.getItem("dashboard_refresh_interval_ms"));

    if (storedCity) this.config.app.defaultCity = storedCity;
    if (Number.isFinite(storedRefresh) && storedRefresh >= 60000) {
      this.config.app.refreshInterval = storedRefresh;
    }
  }

  initializeSettingsModal() {
    const cityInput = document.getElementById("settingsDefaultCity");
    const refreshInput = document.getElementById("settingsRefreshMinutes");

    if (cityInput) cityInput.value = this.config.app.defaultCity || "Kahului";
    if (refreshInput) {
      refreshInput.value = String(Math.round((this.config.app.refreshInterval || 600000) / 60000));
    }
  }

  setupEventListeners() {
    const searchInput = document.getElementById("courseSearch");
    const departmentFilter = document.getElementById("departmentFilter");
    const refreshWeatherBtn = document.getElementById("refreshWeatherBtn");
    const refreshHumorBtn = document.getElementById("refreshHumorBtn");
    const refreshAllBtn = document.getElementById("refreshAllBtn");

    const settingsBtn = document.getElementById("settingsBtn");
    const saveSettingsBtn = document.getElementById("saveSettingsBtn");
    const closeSettingsBtn = document.getElementById("closeSettingsModalBtn");

    const saveApiBtn = document.getElementById("saveApiKeysBtn");
    const closeApiModalBtn = document.getElementById("closeApiModalBtn");

    if (searchInput) {
      searchInput.addEventListener("input", () => this.applyCourseFilters());
    }

    if (departmentFilter) {
      departmentFilter.addEventListener("change", () => this.applyCourseFilters());
    }

    if (refreshWeatherBtn) {
      refreshWeatherBtn.addEventListener("click", () => this.refreshWeather());
    }

    if (refreshHumorBtn) {
      refreshHumorBtn.addEventListener("click", () => this.refreshHumor());
    }

    if (refreshAllBtn) {
      refreshAllBtn.addEventListener("click", () => this.refreshAllData());
    }

    if (settingsBtn) {
      settingsBtn.addEventListener("click", () => this.showSettingsModal());
    }

    if (saveSettingsBtn) {
      saveSettingsBtn.addEventListener("click", () => this.saveSettings());
    }

    if (closeSettingsBtn) {
      closeSettingsBtn.addEventListener("click", () => this.hideSettingsModal());
    }

    if (saveApiBtn) {
      saveApiBtn.addEventListener("click", () => this.saveApiKeys());
    }

    if (closeApiModalBtn) {
      closeApiModalBtn.addEventListener("click", () => {
        const modal = document.getElementById("apiKeyModal");
        if (modal) modal.style.display = "none";
      });
    }
  }

  async initializeApiKeySetup() {
    // Requirement 2.5: validate backend env credentials via health endpoint.
    try {
      const response = await fetch("/api/health");
      if (!response.ok) throw new Error("Health check failed");

      const health = await response.json();
      if (!health?.config?.configured) {
        this.showApiKeySetupModal();
      }
    } catch (error) {
      console.warn("Could not validate backend API configuration:", error.message);
      this.showApiKeySetupModal();
    }
  }

  async loadInitialData() {
    this.showLoadingState();

    try {
      // Requirement 1.8 + 1.7: concurrent loading combines local JSON + live APIs.
      await Promise.all([this.loadCourseData(), this.loadWeatherData(), this.loadHumorData()]);
      this.updateDashboardStats();
    } catch (error) {
      console.error("Failed to load initial data:", error);
      this.showErrorState("Failed to load dashboard data.");
    } finally {
      this.hideLoadingState();
    }
  }

  async loadCourseData() {
    const storedCourses = localStorage.getItem("dashboard_courses");

    if (storedCourses) {
      try {
        const parsed = JSON.parse(storedCourses);
        if (Array.isArray(parsed)) {
          const adapted = window.CourseCatalogAdapter
            ? window.CourseCatalogAdapter.normalize(parsed)
            : parsed.map((course) => this.normalizeCourse(course));
          this.courseCatalog = adapted.map((course) => this.normalizeCourse(course));
          this.filteredCourses = [...this.courseCatalog];
          this.updateDepartmentFilterOptions();
          this.displayCourseWidget();
          return;
        }
      } catch (error) {
        console.warn("Stored course data parse failed, reloading defaults.", error);
      }
    }

    try {
      const response = await fetch("./sample-data.json");
      if (!response.ok) throw new Error("sample-data.json not available");

      const data = await response.json();
      const sourceCourses = window.CourseCatalogAdapter
        ? window.CourseCatalogAdapter.normalize(data)
        : Array.isArray(data)
        ? data
        : Array.isArray(data.courses)
        ? data.courses
        : [];
      this.courseCatalog = sourceCourses.map((course) => this.normalizeCourse(course));
    } catch (error) {
      console.warn("Using fallback course data:", error.message);
      this.courseCatalog = [
        this.normalizeCourse({
          code: "ICS 385",
          title: "Web Development and Administration",
          instructor: "TBA",
          department: "ICS",
          enrolled: 24,
          capacity: 30,
        }),
      ];
    }

    this.filteredCourses = [...this.courseCatalog];
    this.updateDepartmentFilterOptions();
    this.displayCourseWidget();
    this.saveCoursesToStorage();
  }

  normalizeCourse(course) {
    return {
      id: course.id || `course-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      code: String(course.code || "N/A"),
      title: String(course.title || "Untitled Course"),
      instructor: String(course.instructor || "TBA"),
      department: String(course.department || String(course.code || "GEN").split(" ")[0] || "GEN"),
      enrolled: Number(course.enrolled || 0),
      capacity: Number(course.capacity || 0),
    };
  }

  saveCoursesToStorage() {
    localStorage.setItem("dashboard_courses", JSON.stringify(this.courseCatalog));
  }

  async loadWeatherData() {
    try {
      // Requirement 2.2: weather for Kahului (or user-selected default city).
      const city = this.config.app.defaultCity || "Kahului";
      const weatherData = await this.apiClient.getWeather(city);
      this.displayWeatherWidget(weatherData);
      this.lastUpdated.set("weather", Date.now());
      this.serviceHealth.weather = !weatherData.error;
    } catch (error) {
      console.error("Weather loading failed:", error);
      this.serviceHealth.weather = false;
      this.displayWeatherError();
    }
  }

  async loadHumorData() {
    return this.loadHumorDataWithMode(false);
  }

  async loadHumorDataWithMode(forceRefresh) {
    try {
      // Requirement 2.3: both JokeAPI programming joke + RapidAPI Chuck Norris fact.
      const jokes = await this.apiClient.getAllJokes(forceRefresh);
      this.displayHumorWidget(jokes);
      this.lastUpdated.set("humor", Date.now());
      this.serviceHealth.humor = Boolean(jokes.chuck || jokes.programming);
    } catch (error) {
      console.error("Humor loading failed:", error);
      this.serviceHealth.humor = false;
      this.displayHumorError();
    }
  }

  displayWeatherWidget(data) {
    const weatherContainer = document.getElementById("weather-widget");
    if (!weatherContainer) return;

    const isError = Boolean(data.error);
    weatherContainer.innerHTML = `
      <div class="widget-header">
        <h3>Campus Weather</h3>
        <span class="last-updated" data-service="weather">${this.getTimeAgo("weather")}</span>
      </div>
      <div class="weather-content ${isError ? "error-state" : ""}">
        <div class="location">${data.name || this.config.app.defaultCity || "Kahului"}</div>
        <div class="temperature">${Math.round(data.main?.temp ?? 0)}F</div>
        <div class="description">${data.weather?.[0]?.description || "unavailable"}</div>
        <div class="details">
          <span>Humidity: ${data.main?.humidity ?? "--"}%</span>
          <span>Wind: ${data.wind?.speed ?? "--"} mph</span>
        </div>
        ${isError ? `<div class="error-message">${data.message || "Weather unavailable"}</div>` : ""}
      </div>
    `;
  }

  displayHumorWidget(jokes) {
    const humorContainer = document.getElementById("humor-widget");
    if (!humorContainer) return;

    const chuckJoke = jokes.chuck
      ? jokes.chuck.value || jokes.chuck.joke || "Chuck Norris joke unavailable"
      : "Chuck Norris joke unavailable";

    const progJoke = jokes.programming
      ? jokes.programming.joke ||
        `${jokes.programming.setup || ""} ${jokes.programming.delivery || ""}`.trim() ||
        "Programming joke unavailable"
      : "Programming joke unavailable";

    humorContainer.innerHTML = `
      <div class="widget-header">
        <h3>Campus Humor</h3>
        <button id="innerRefreshHumorBtn" class="refresh-btn" type="button">New Jokes</button>
      </div>
      <div class="humor-content">
        <div class="joke-section">
          <h4>Chuck Norris Fact</h4>
          <p class="joke-text">${chuckJoke}</p>
        </div>
        <div class="joke-section">
          <h4>Programming Humor</h4>
          <p class="joke-text">${progJoke}</p>
        </div>
      </div>
    `;

    const innerBtn = document.getElementById("innerRefreshHumorBtn");
    if (innerBtn) {
      innerBtn.addEventListener("click", () => this.refreshHumor());
    }
  }

  // Requirement 2.1: full CRUD includes listing with edit/delete actions.
  displayCourseWidget() {
    const list = document.getElementById("coursesContainer") || document.getElementById("course-list");
    if (!list) return;

    if (!this.filteredCourses.length) {
      list.innerHTML = "<p>No matching courses found.</p>";
      return;
    }

    list.innerHTML = this.filteredCourses
      .map(
        (course) => `
          <div class="course-row" data-course-id="${course.id}">
            <strong>${course.code}</strong>
            <span>${course.title}</span>
            <span>${course.instructor}</span>
            <span>${course.department}</span>
            <span>${course.enrolled}/${course.capacity}</span>
            <div class="row-actions">
              <button class="small-btn edit-btn" data-id="${course.id}" type="button">Edit</button>
              <button class="small-btn delete-btn" data-id="${course.id}" type="button">Delete</button>
            </div>
          </div>
        `
      )
      .join("");

    list.querySelectorAll(".edit-btn").forEach((btn) => {
      btn.addEventListener("click", () => this.editCourse(btn.dataset.id));
    });

    list.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", () => this.deleteCourse(btn.dataset.id));
    });
  }

  updateDepartmentFilterOptions() {
    const select = document.getElementById("departmentFilter");
    if (!select) return;

    const previous = select.value || "all";
    const departments = [...new Set(this.courseCatalog.map((c) => c.department).filter(Boolean))].sort();

    select.innerHTML = `<option value="all">All Departments</option>${departments
      .map((dep) => `<option value="${dep}">${dep}</option>`)
      .join("")}`;

    if (departments.includes(previous)) {
      select.value = previous;
    }
  }

  applyCourseFilters() {
    const query = (document.getElementById("courseSearch")?.value || "").trim().toLowerCase();
    const department = document.getElementById("departmentFilter")?.value || "all";

    this.filteredCourses = this.courseCatalog.filter((course) => {
      const searchMatch =
        String(course.code).toLowerCase().includes(query) ||
        String(course.title).toLowerCase().includes(query) ||
        String(course.instructor).toLowerCase().includes(query);

      const departmentMatch = department === "all" ? true : course.department === department;
      return searchMatch && departmentMatch;
    });

    this.displayCourseWidget();
    this.updateDashboardStats();
  }

  addNewCourse() {
    const code = prompt("Course code (example: ICS 211):", "ICS 000");
    if (!code) return;

    const title = prompt("Course title:", "New Course");
    if (!title) return;

    const instructor = prompt("Instructor name:", "TBA") || "TBA";
    const department = prompt("Department (example: ICS, MATH):", code.split(" ")[0] || "GEN") || "GEN";
    const enrolled = Number(prompt("Enrolled students:", "0") || 0);
    const capacity = Number(prompt("Capacity:", "30") || 30);

    this.courseCatalog.push(
      this.normalizeCourse({
        code,
        title,
        instructor,
        department,
        enrolled,
        capacity,
      })
    );

    this.saveCoursesToStorage();
    this.updateDepartmentFilterOptions();
    this.applyCourseFilters();
  }

  editCourse(courseId) {
    const course = this.courseCatalog.find((item) => item.id === courseId);
    if (!course) return;

    const code = prompt("Edit course code:", course.code);
    if (!code) return;

    const title = prompt("Edit course title:", course.title);
    if (!title) return;

    const instructor = prompt("Edit instructor:", course.instructor) || course.instructor;
    const department = prompt("Edit department:", course.department) || course.department;
    const enrolled = Number(prompt("Edit enrolled students:", String(course.enrolled)) || course.enrolled);
    const capacity = Number(prompt("Edit capacity:", String(course.capacity)) || course.capacity);

    course.code = code;
    course.title = title;
    course.instructor = instructor;
    course.department = department;
    course.enrolled = enrolled;
    course.capacity = capacity;

    this.saveCoursesToStorage();
    this.updateDepartmentFilterOptions();
    this.applyCourseFilters();
  }

  deleteCourse(courseId) {
    const course = this.courseCatalog.find((item) => item.id === courseId);
    if (!course) return;

    const confirmed = confirm(`Delete ${course.code} - ${course.title}?`);
    if (!confirmed) return;

    this.courseCatalog = this.courseCatalog.filter((item) => item.id !== courseId);
    this.saveCoursesToStorage();
    this.updateDepartmentFilterOptions();
    this.applyCourseFilters();
  }

  // Requirement 2.4: dashboard stats from local data + API connection status.
  updateDashboardStats() {
    const totalCourses = this.filteredCourses.length;
    const totalStudents = this.filteredCourses.reduce((sum, c) => sum + Number(c.enrolled || 0), 0);

    const averageCapacity =
      totalCourses === 0
        ? 0
        : Math.round(
            this.filteredCourses.reduce((sum, c) => {
              const cap = Number(c.capacity || 0);
              const en = Number(c.enrolled || 0);
              return sum + (cap > 0 ? (en / cap) * 100 : 0);
            }, 0) / totalCourses
          );

    const apiStatus = this.serviceHealth.weather && this.serviceHealth.humor ? "Connected" : "Partial";

    const coursesEl = document.getElementById("total-courses");
    const studentsEl = document.getElementById("total-students");
    const capacityEl = document.getElementById("avg-capacity");
    const apiEl = document.getElementById("api-status");

    if (coursesEl) coursesEl.textContent = String(totalCourses);
    if (studentsEl) studentsEl.textContent = String(totalStudents);
    if (capacityEl) capacityEl.textContent = `${averageCapacity}%`;
    if (apiEl) apiEl.textContent = apiStatus;
  }

  // Requirement 1.8 + 2.2 + 2.3: automatic weather refresh and manual humor refresh.
  startAutoRefresh() {
    this.stopAutoRefresh();

    this.refreshTimers.set(
      "weather",
      setInterval(() => {
        this.loadWeatherData();
      }, this.config.app.refreshInterval || 10 * 60 * 1000)
    );

    this.refreshTimers.set(
      "time",
      setInterval(() => {
        this.updateTimeDisplays();
      }, 60 * 1000)
    );
  }

  stopAutoRefresh() {
    this.refreshTimers.forEach((timer) => clearInterval(timer));
    this.refreshTimers.clear();
  }

  updateTimeDisplays() {
    const weatherTime = document.querySelector('[data-service="weather"]');
    if (weatherTime) weatherTime.textContent = this.getTimeAgo("weather");
  }

  async refreshAllData() {
    await Promise.all([this.loadWeatherData(), this.loadHumorData()]);
    this.updateDashboardStats();
  }

  async refreshHumor() {
    const button = document.getElementById("refreshHumorBtn") || document.getElementById("innerRefreshHumorBtn");
    if (button) {
      button.textContent = "Loading...";
      button.disabled = true;
    }

    try {
      // Force fresh humor so New Jokes actually changes content.
      await this.loadHumorDataWithMode(true);
      this.updateDashboardStats();
    } finally {
      if (button) {
        button.textContent = "New Jokes";
        button.disabled = false;
      }
    }
  }

  async refreshWeather() {
    await this.loadWeatherData();
    this.updateDashboardStats();
  }

  // Requirement 2.7: export combined dashboard data as JSON.
  exportData() {
    const payload = {
      generatedAt: new Date().toISOString(),
      settings: {
        defaultCity: this.config.app.defaultCity,
        refreshIntervalMs: this.config.app.refreshInterval,
      },
      apiStatus: this.serviceHealth,
      weatherLastUpdated: this.lastUpdated.get("weather") || null,
      humorLastUpdated: this.lastUpdated.get("humor") || null,
      courses: this.courseCatalog,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "campus-dashboard-export.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  showApiKeySetupModal() {
    const modal = document.getElementById("apiKeyModal");
    if (modal) modal.style.display = "flex";
  }

  saveApiKeys() {
    const openWeatherKey = document.getElementById("openWeatherKey")?.value?.trim();
    const rapidApiKey = document.getElementById("rapidApiKey")?.value?.trim();

    const modal = document.getElementById("apiKeyModal");
    if (modal) modal.style.display = "none";

    if (openWeatherKey || rapidApiKey) {
      alert(
        "For security, add these keys to your .env file on the server, then restart npm start."
      );
    }
  }

  showSettingsModal() {
    const modal = document.getElementById("settingsModal");
    if (modal) modal.style.display = "flex";
  }

  hideSettingsModal() {
    const modal = document.getElementById("settingsModal");
    if (modal) modal.style.display = "none";
  }

  saveSettings() {
    const city = document.getElementById("settingsDefaultCity")?.value?.trim() || "Kahului";
    const refreshMinutes = Number(document.getElementById("settingsRefreshMinutes")?.value || 10);
    const safeMinutes = Number.isFinite(refreshMinutes) ? Math.max(1, refreshMinutes) : 10;

    this.config.app.defaultCity = city;
    this.config.app.refreshInterval = safeMinutes * 60 * 1000;

    localStorage.setItem("dashboard_default_city", city);
    localStorage.setItem("dashboard_refresh_interval_ms", String(this.config.app.refreshInterval));

    this.startAutoRefresh();
    this.loadWeatherData();
    this.hideSettingsModal();
  }

  showLoadingState() {
    const overlay = document.getElementById("loading-overlay");
    if (overlay) overlay.style.display = "flex";
  }

  hideLoadingState() {
    const overlay = document.getElementById("loading-overlay");
    if (overlay) overlay.style.display = "none";
  }

  showErrorState(message) {
    const container = document.getElementById("dashboard-container");
    if (!container) return;

    const banner = document.createElement("div");
    banner.className = "error-banner";
    banner.textContent = message;
    container.prepend(banner);
  }

  displayWeatherError() {
    this.displayWeatherWidget({
      name: this.config.app.defaultCity || "Kahului",
      main: { temp: 78, humidity: 65 },
      weather: [{ description: "weather unavailable" }],
      wind: { speed: 0 },
      error: true,
      message: "Could not load weather data.",
    });
  }

  displayHumorError() {
    this.displayHumorWidget({
      chuck: { value: "Chuck Norris joke unavailable." },
      programming: { joke: "Programming joke unavailable." },
    });
  }

  showWelcomeMessage() {
    console.log(`${this.config.app.name} is ready.`);
  }

  handleInitializationError(error) {
    console.error("Dashboard initialization failed:", error);
    const container = document.getElementById("dashboard-container") || document.body;
    container.innerHTML = `
      <div class="initialization-error">
        <h2>Dashboard Initialization Failed</h2>
        <p>${error.message}</p>
        <button onclick="location.reload()">Retry</button>
      </div>
    `;
  }

  getTimeAgo(service) {
    if (!this.lastUpdated.has(service)) return "Never";
    const minutes = Math.floor((Date.now() - this.lastUpdated.get(service)) / 60000);
    return minutes === 0 ? "Just now" : `${minutes} min ago`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.dashboard = new CampusDashboard();
});
