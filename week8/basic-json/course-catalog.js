/*
=====================================================
ICS 385 - Week 8
Course Catalog Manager
Complete Version with Validation + Error Handling
=====================================================
*/

class CourseCatalogManager {

  constructor() {
    this.courseCatalog = null;
    this.filteredCourses = [];
    this.currentView = "all";
    this.activeFilters = {
      query: "",
      department: "all",
      credits: "all"
    };
    this.searchCache = new Map();
    this.initializeApp();
  }

  /*
  =====================================================
  INITIALIZE APP
  =====================================================
  */
  initializeApp() {
    try {
      this.setupEventListeners();
      this.loadSampleData();
    } catch (error) {
      this.handleJSONError("Application initialization", error);
    }
  }

  /*
  =====================================================
  LOAD SAMPLE JSON FILE
  =====================================================
  */
  async loadSampleData() {
    try {
      if (window.location.protocol === "file:") {
        this.loadCourseData(JSON.stringify(this.getFallbackCatalogData()));
        return;
      }

      const response = await fetch("./sample-data.json");

      if (!response.ok) {
        throw new Error("Could not load sample-data.json");
      }

      const jsonString = await response.text();
      this.loadCourseData(jsonString);
    } catch (error) {
      try {
        const fallbackData = this.getFallbackCatalogData();
        this.loadCourseData(JSON.stringify(fallbackData));
      } catch (fallbackError) {
        this.handleJSONError("Loading sample data", fallbackError);
      }
    }
  }

  /*
  =====================================================
  LOAD COURSE DATA (REQUIRED FUNCTION)
  =====================================================
  */
  loadCourseData(jsonString) {
    try {

      if (!jsonString || typeof jsonString !== "string") {
        throw new Error("Invalid input: JSON string required");
      }

      const data = JSON.parse(jsonString);

      this.validateCatalogStructure(data);

      this.courseCatalog = data;
      this.activeFilters = {
        query: "",
        department: "all",
        credits: "all"
      };
      this.searchCache.clear();
      this.filteredCourses = this.getAllCourses();

      this.displayAllCourses();
      this.displayStatistics();

      console.log("Course catalog loaded successfully");

    } catch (error) {
      this.handleJSONError("Parsing course data", error);
    }
  }

  /*
  =====================================================
  VALIDATE CATALOG STRUCTURE
  =====================================================
  */
  validateCatalogStructure(data) {
    const required = ["university", "semester", "departments", "metadata"];

    required.forEach(field => {
      if (!data.hasOwnProperty(field)) {
        throw new Error("Missing required fields: " + field);
      }
    });

    if (!Array.isArray(data.departments) || data.departments.length === 0) {
      throw new Error("Departments must be a non-empty array");
    }
  }

  /*
  =====================================================
  FLATTEN ALL COURSES
  =====================================================
  */
  getAllCourses() {
    if (!this.courseCatalog) return [];

    const allCourses = [];

    this.courseCatalog.departments.forEach(dept => {
      dept.courses.forEach(course => {
        allCourses.push({
          ...course,
          departmentCode: dept.code,
          departmentName: dept.name
        });
      });
    });

    return allCourses;
  }

  applyFilters() {
    const allCourses = this.getAllCourses();
    const { query, department, credits } = this.activeFilters;
    const normalizedQuery = query.trim().toLowerCase();
    const cacheKey = `${normalizedQuery}|${department}|${credits}`;

    if (this.searchCache.has(cacheKey)) {
      this.filteredCourses = this.searchCache.get(cacheKey);
      this.displayAllCourses();
      return;
    }

    let results = allCourses;

    if (department !== "all") {
      results = results.filter(course => course.departmentCode === department);
    }

    if (credits !== "all") {
      if (credits === "4+") {
        results = results.filter(course => course.credits >= 4);
      } else {
        results = results.filter(course => String(course.credits) === credits);
      }
    }

    if (normalizedQuery) {
      results = results.filter(course =>
        course.courseCode.toLowerCase().includes(normalizedQuery) ||
        course.title.toLowerCase().includes(normalizedQuery) ||
        course.description.toLowerCase().includes(normalizedQuery) ||
        course.instructor.name.toLowerCase().includes(normalizedQuery) ||
        course.topics.some(topic => topic.toLowerCase().includes(normalizedQuery)) ||
        course.departmentName.toLowerCase().includes(normalizedQuery)
      );
    }

    this.searchCache.set(cacheKey, results);
    this.filteredCourses = results;
    this.displayAllCourses();
  }

  /*
  =====================================================
  DISPLAY COURSES (REQUIRED)
  =====================================================
  */
  displayAllCourses() {
    const container = document.getElementById("coursesContainer");
    container.innerHTML = "";

    if (this.filteredCourses.length === 0) {
      container.innerHTML = "<div class='no-results'>No courses found.</div>";
      return;
    }

    const fragment = document.createDocumentFragment();
    this.filteredCourses.forEach(course => {
      fragment.appendChild(this.createCourseCard(course));
    });
    container.appendChild(fragment);

    this.displayStatistics();
  }

  /*
  =====================================================
  CREATE COURSE CARD
  =====================================================
  */
  createCourseCard(course) {
    const percent = this.calculateEnrollmentStats(course);

    let status = "open";
    if (percent >= 90) status = "full";
    else if (percent >= 70) status = "filling";

    const card = document.createElement("div");
    card.className = "course-card";

    card.innerHTML = `
      <div class="course-header">
        <h3>${course.courseCode}</h3>
        <span>${course.credits} credits</span>
      </div>

      <h4>${course.title}</h4>
      <p>${course.description}</p>

      <div><strong>Instructor:</strong> ${course.instructor.name}</div>
      <div><strong>Schedule:</strong> ${course.schedule.days.join(", ")} ${course.schedule.time}</div>

      <div class="enrollment-info ${status}">
        ${course.schedule.enrolled}/${course.schedule.capacity}
        (${percent}%)
      </div>

      <button onclick="app.showCourseDetails('${course.courseCode}')">
        View Details
      </button>
    `;

    return card;
  }

  /*
  =====================================================
  SEARCH COURSES (REQUIRED)
  =====================================================
  */
  searchCourses(query) {
    this.activeFilters.query = query || "";
    this.applyFilters();
  }

  /*
  =====================================================
  FILTER BY DEPARTMENT (REQUIRED)
  =====================================================
  */
  filterByDepartment(code) {
    this.activeFilters.department = code;
    this.applyFilters();
  }

  /*
  =====================================================
  FILTER BY CREDITS (REQUIRED)
  =====================================================
  */
  filterByCredits(value) {
    this.activeFilters.credits = value;
    this.applyFilters();
  }

  /*
  =====================================================
  SHOW COURSE DETAILS (REQUIRED)
  =====================================================
  */
  showCourseDetails(courseCode) {

    const course =
      this.getAllCourses().find(c => c.courseCode === courseCode);

    if (!course) return;

    document.getElementById("modalBody").innerHTML = `
      <h2>${course.courseCode} - ${course.title}</h2>
      <p><strong>Description:</strong> ${course.description}</p>
      <p><strong>Instructor:</strong> ${course.instructor.name}</p>
      <p><strong>Email:</strong> ${course.instructor.email}</p>
      <p><strong>Location:</strong> ${course.schedule.location}</p>
      <p><strong>Topics:</strong> ${course.topics.join(", ")}</p>
    `;

    document.getElementById("courseModal")
      .classList.remove("hidden");
  }

  calculateEnrollmentStats(course) {
    if (!course || !course.schedule || !course.schedule.capacity) {
      return 0;
    }

    return Math.round(
      (course.schedule.enrolled / course.schedule.capacity) * 100
    );
  }

  /*
  =====================================================
  CALCULATE & DISPLAY STATS (REQUIRED)
  =====================================================
  */
  displayStatistics() {
    if (!this.courseCatalog) {
      return;
    }

    const totalCourses = this.filteredCourses.length;
    const totalDepartments = this.courseCatalog.departments.length;

    let avg = 0;

    if (totalCourses > 0) {
      avg = Math.round(
        this.filteredCourses.reduce((sum, course) => {
          return sum + this.calculateEnrollmentStats(course);
        }, 0) / totalCourses
      );
    }

    document.getElementById("totalCourses").textContent = totalCourses;
    document.getElementById("totalDepartments").textContent = totalDepartments;
    document.getElementById("averageEnrollment").textContent = avg + "%";
  }

  /*
  =====================================================
  ADD NEW COURSE (REQUIRED)
  =====================================================
  */
  addNewCourse() {
    if (!this.courseCatalog || !Array.isArray(this.courseCatalog.departments)) {
      alert("Course data is not loaded yet.");
      return;
    }

    const departmentCode = (prompt("Enter department code (e.g., ICS, MATH, BUS):", "ICS") || "").trim().toUpperCase();
    const courseCode = (prompt("Enter course code:", "NEW 101") || "").trim();
    const title = (prompt("Enter course title:", "New Course") || "").trim();
    const description = (prompt("Enter description:", "Course description") || "").trim();
    const creditsInput = (prompt("Enter credits (1-6):", "3") || "").trim();
    const instructorName = (prompt("Enter instructor name:", "New Instructor") || "").trim();
    const instructorEmail = (prompt("Enter instructor email:", "new@hawaii.edu") || "").trim();
    const daysInput = (prompt("Enter schedule days separated by commas:", "Monday,Wednesday") || "").trim();
    const time = (prompt("Enter schedule time:", "1:00 PM - 2:15 PM") || "").trim();
    const location = (prompt("Enter location:", "Online") || "").trim();
    const capacityInput = (prompt("Enter capacity:", "25") || "").trim();
    const topicsInput = (prompt("Enter topics separated by commas:", "Sample Topic") || "").trim();

    if (!courseCode || !title || !description || !departmentCode) {
      alert("Course code, title, description, and department are required.");
      return;
    }

    const newCourse = {
      courseCode,
      title,
      credits: Number(creditsInput),
      description,
      prerequisites: [],
      instructor: {
        name: instructorName,
        email: instructorEmail,
        office: "TBD"
      },
      schedule: {
        days: daysInput.split(",").map(day => day.trim()).filter(Boolean),
        time,
        location,
        capacity: Number(capacityInput),
        enrolled: 0
      },
      isActive: true,
      topics: topicsInput.split(",").map(topic => topic.trim()).filter(Boolean),
      assignments: []
    };

    const validation = this.validateCourseData(newCourse);
    if (!validation.isValid) {
      alert("Cannot add course:\n" + validation.errors.join("\n"));
      return;
    }

    const targetDepartment = this.courseCatalog.departments.find(dept => dept.code === departmentCode);
    if (!targetDepartment) {
      alert("Department not found. Use an existing code from the dropdown.");
      return;
    }

    targetDepartment.courses.push(newCourse);

    if (this.courseCatalog.metadata) {
      this.courseCatalog.metadata.totalCourses = this.getAllCourses().length;
      this.courseCatalog.metadata.totalCreditsOffered += newCourse.credits;
    }

    this.searchCache.clear();
    this.applyFilters();
    alert("Course added successfully.");
  }

  /*
  =====================================================
  VALIDATE COURSE DATA (REQUIRED)
  =====================================================
  */
  validateCourseData(course) {

    const errors = [];

    const requiredStrings = ["courseCode", "title", "description"];

    requiredStrings.forEach(field => {
      if (
        !course[field] ||
        typeof course[field] !== "string" ||
        course[field].trim().length === 0
      ) {
        errors.push("Missing or invalid " + field);
      }
    });

    if (
      !course.credits ||
      !Number.isInteger(course.credits) ||
      course.credits < 1 ||
      course.credits > 6
    ) {
      errors.push("Credits must be an integer between 1 and 6");
    }

    if (!course.instructor || typeof course.instructor !== "object") {
      errors.push("Instructor information is required");
    } else {

      if (!course.instructor.name || !course.instructor.email) {
        errors.push("Instructor name and email are required");
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (
        course.instructor.email &&
        !emailRegex.test(course.instructor.email)
      ) {
        errors.push("Invalid instructor email format");
      }
    }

    if (!course.schedule || typeof course.schedule !== "object") {
      errors.push("Schedule information is required");
    } else {

      if (!Array.isArray(course.schedule.days) ||
          course.schedule.days.length === 0) {
        errors.push("Schedule days must be a non-empty array");
      }

      if (typeof course.schedule.capacity !== "number" ||
          course.schedule.capacity < 1) {
        errors.push("Schedule capacity must be a positive number");
      }

      if (typeof course.schedule.enrolled !== "number" ||
          course.schedule.enrolled < 0) {
        errors.push("Schedule enrolled must be a non-negative number");
      }

      if (course.schedule.enrolled > course.schedule.capacity) {
        errors.push("Enrolled students cannot exceed capacity");
      }
    }

    if (!Array.isArray(course.topics) || course.topics.length === 0) {
      errors.push("At least one topic is required");
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  /*
  =====================================================
  EXPORT JSON (REQUIRED)
  =====================================================
  */
  exportToJSON() {
    const dataStr = JSON.stringify(this.courseCatalog, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "course-catalog.json";
    link.click();
  }

  /*
  =====================================================
  ERROR HANDLING (REQUIRED)
  =====================================================
  */
  handleJSONError(operation, error) {

    let userMessage = "An error occurred";

    if (error instanceof SyntaxError) {
      userMessage = "Invalid JSON format. Check your structure.";
    }
    else if (error.message.includes("Missing required fields")) {
      userMessage = "Data validation failed: " + error.message;
    }
    else if (error.message.toLowerCase().includes("network")) {
      userMessage = "Network error. Check connection.";
    }
    else {
      userMessage = operation + " failed: " + error.message;
    }

    console.error("JSON Operation Error:", {
      operation,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });

    alert(userMessage);
  }

  /*
  =====================================================
  EVENT LISTENERS
  =====================================================
  */
  setupEventListeners() {

    document.getElementById("searchInput")
      .addEventListener("input", e =>
        this.searchCourses(e.target.value));

    document.getElementById("departmentFilter")
      .addEventListener("change", e =>
        this.filterByDepartment(e.target.value));

    document.getElementById("creditsFilter")
      .addEventListener("change", e =>
        this.filterByCredits(e.target.value));

    document.getElementById("clearSearchBtn")
      .addEventListener("click", () => {
        document.getElementById("searchInput").value = "";
        document.getElementById("departmentFilter").value = "all";
        document.getElementById("creditsFilter").value = "all";
        this.activeFilters = { query: "", department: "all", credits: "all" };
        this.searchCache.clear();
        this.applyFilters();
      });

    document.getElementById("loadSampleBtn")
      .addEventListener("click", () =>
        this.loadSampleData());

    document.getElementById("addCourseBtn")
      .addEventListener("click", () =>
        this.addNewCourse());

    document.getElementById("exportBtn")
      .addEventListener("click", () =>
        this.exportToJSON());

    document.querySelector(".close-btn")
      .addEventListener("click", () =>
        document.getElementById("courseModal")
          .classList.add("hidden"));
  }

  getFallbackCatalogData() {
    return {
      university: "University of Hawaii Maui College",
      semester: "Spring 2026",
      lastUpdated: "2026-03-03",
      departments: [
        {
          code: "ICS",
          name: "Information and Computer Sciences",
          chair: "Dr. Debasis Bhattacharya",
          courses: [
            {
              courseCode: "ICS 385",
              title: "Web Development and Administration",
              credits: 3,
              description: "Detailed knowledge of web page authoring and server-side programming.",
              prerequisites: ["ICS 320"],
              instructor: {
                name: "Dr. Debasis Bhattacharya",
                email: "debasis@hawaii.edu",
                office: "Kaaike 114"
              },
              schedule: {
                days: ["Tuesday"],
                time: "4:30 PM - 5:45 PM",
                location: "Online (Zoom)",
                capacity: 25,
                enrolled: 18
              },
              isActive: true,
              topics: ["HTML", "CSS", "JavaScript", "Node.js"],
              assignments: []
            },
            {
              courseCode: "ICS 101",
              title: "Digital Tools for the Information World",
              credits: 3,
              description: "Introduction to digital literacy and productivity tools.",
              prerequisites: [],
              instructor: {
                name: "Prof. Alan Kim",
                email: "alan.kim@hawaii.edu",
                office: "Kaaike 110"
              },
              schedule: {
                days: ["Monday", "Wednesday"],
                time: "9:00 AM - 10:15 AM",
                location: "Kaaike 203",
                capacity: 30,
                enrolled: 27
              },
              isActive: true,
              topics: ["Digital Literacy", "Cloud Tools"],
              assignments: []
            },
            {
              courseCode: "ICS 169",
              title: "Introduction to Information Security",
              credits: 3,
              description: "Fundamentals of cybersecurity and secure systems.",
              prerequisites: [],
              instructor: {
                name: "Dr. Laura Chen",
                email: "laura.chen@hawaii.edu",
                office: "Kaaike 118"
              },
              schedule: {
                days: ["Thursday"],
                time: "1:00 PM - 3:45 PM",
                location: "Kaaike 210",
                capacity: 28,
                enrolled: 20
              },
              isActive: true,
              topics: ["Network Security", "Threat Analysis"],
              assignments: []
            }
          ]
        },
        {
          code: "MATH",
          name: "Mathematics",
          chair: "Dr. Robert Johnson",
          courses: [
            {
              courseCode: "MATH 140",
              title: "Calculus I",
              credits: 4,
              description: "Limits, derivatives, and applications of derivatives.",
              prerequisites: ["MATH 135"],
              instructor: {
                name: "Dr. Sarah Wilson",
                email: "sarah.wilson@hawaii.edu",
                office: "AC 201"
              },
              schedule: {
                days: ["Monday", "Wednesday", "Friday"],
                time: "10:00 AM - 10:50 AM",
                location: "AC 105",
                capacity: 30,
                enrolled: 25
              },
              isActive: true,
              topics: ["Limits", "Derivatives", "Integration"],
              assignments: []
            },
            {
              courseCode: "MATH 115",
              title: "Introduction to Statistics and Probability",
              credits: 3,
              description: "Descriptive and inferential statistics concepts.",
              prerequisites: [],
              instructor: {
                name: "Prof. Emily Torres",
                email: "emily.torres@hawaii.edu",
                office: "AC 204"
              },
              schedule: {
                days: ["Tuesday", "Thursday"],
                time: "11:00 AM - 12:15 PM",
                location: "AC 108",
                capacity: 35,
                enrolled: 29
              },
              isActive: true,
              topics: ["Probability", "Hypothesis Testing"],
              assignments: []
            }
          ]
        },
        {
          code: "BUS",
          name: "Business",
          chair: "Dr. Maria Lopez",
          courses: [
            {
              courseCode: "BUS 120",
              title: "Principles of Business",
              credits: 3,
              description: "Introduction to business operations and management.",
              prerequisites: [],
              instructor: {
                name: "Prof. Jason Lee",
                email: "jason.lee@hawaii.edu",
                office: "Pilina 301"
              },
              schedule: {
                days: ["Monday", "Wednesday"],
                time: "2:00 PM - 3:15 PM",
                location: "Pilina 105",
                capacity: 40,
                enrolled: 35
              },
              isActive: true,
              topics: ["Management", "Marketing", "Finance"],
              assignments: []
            },
            {
              courseCode: "BUS 125",
              title: "Starting a Business",
              credits: 3,
              description: "Fundamentals of entrepreneurship and business planning.",
              prerequisites: [],
              instructor: {
                name: "Dr. Rachel Wong",
                email: "rachel.wong@hawaii.edu",
                office: "Pilina 302"
              },
              schedule: {
                days: ["Tuesday"],
                time: "6:00 PM - 8:45 PM",
                location: "Pilina 210",
                capacity: 25,
                enrolled: 21
              },
              isActive: true,
              topics: ["Entrepreneurship", "Market Research"],
              assignments: []
            },
            {
              courseCode: "BUS 130",
              title: "Business Communication: Oral",
              credits: 3,
              description: "Professional oral communication for business settings.",
              prerequisites: [],
              instructor: {
                name: "Prof. Daniel Cruz",
                email: "daniel.cruz@hawaii.edu",
                office: "Pilina 220"
              },
              schedule: {
                days: ["Thursday"],
                time: "3:00 PM - 5:45 PM",
                location: "Pilina 120",
                capacity: 30,
                enrolled: 24
              },
              isActive: true,
              topics: ["Public Speaking", "Presentations"],
              assignments: []
            }
          ]
        }
      ],
      metadata: {
        totalCourses: 8,
        totalDepartments: 3,
        totalCreditsOffered: 25,
        academicYear: "2025-2026"
      }
    };
  }
}

/*
=====================================================
START APPLICATION
=====================================================
*/
document.addEventListener("DOMContentLoaded", () => {
  window.app = new CourseCatalogManager();
});