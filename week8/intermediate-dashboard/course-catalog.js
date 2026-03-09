"use strict";

// Beginner helper class that converts nested department JSON into a flat course list.
// This file is adapted from the Week 8 basic-json project structure.
class CourseCatalogAdapter {
	static normalize(rawData) {
		// Supports two shapes:
		// 1) flat array of courses
		// 2) object with departments[].courses[] (from basic-json)
		if (Array.isArray(rawData)) {
			return rawData.map((course) => this.normalizeFlatCourse(course));
		}

		if (rawData && Array.isArray(rawData.departments)) {
			return this.flattenDepartmentCatalog(rawData);
		}

		return [];
	}

	static flattenDepartmentCatalog(catalog) {
		const courses = [];

		catalog.departments.forEach((department) => {
			(department.courses || []).forEach((course) => {
				courses.push({
					id: `${department.code}-${course.courseCode}`,
					code: course.courseCode,
					title: course.title,
					instructor: course.instructor?.name || "TBA",
					department: department.code,
					enrolled: Number(course.schedule?.enrolled || 0),
					capacity: Number(course.schedule?.capacity || 0),
					credits: Number(course.credits || 0),
					location: course.schedule?.location || "TBA",
					description: course.description || "",
					raw: course,
				});
			});
		});

		return courses;
	}

	static normalizeFlatCourse(course) {
		return {
			id: course.id || `course-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
			code: String(course.code || course.courseCode || "N/A"),
			title: String(course.title || "Untitled Course"),
			instructor: String(course.instructor || course.instructor?.name || "TBA"),
			department: String(course.department || String(course.code || "GEN").split(" ")[0] || "GEN"),
			enrolled: Number(course.enrolled || course.schedule?.enrolled || 0),
			capacity: Number(course.capacity || course.schedule?.capacity || 0),
			credits: Number(course.credits || 0),
			location: String(course.location || course.schedule?.location || "TBA"),
			description: String(course.description || ""),
			raw: course,
		};
	}
}

window.CourseCatalogAdapter = CourseCatalogAdapter;

