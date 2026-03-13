import axios from "axios";

const api = axios.create({
	baseURL: "/api",
});

api.interceptors.request.use((config) => {
	const token = localStorage.getItem("lms_token");
	if (token) config.headers.Authorization = `Bearer ${token}`;
	return config;
});

api.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401) {
			localStorage.removeItem("lms_token");
			localStorage.removeItem("lms_user");
			window.location.href = "/login";
		}
		return Promise.reject(error);
	},
);

// Auth
export const authAPI = {
	login: (data) => api.post("/auth/login", data),
	register: (data) => api.post("/auth/register", data),
};

// Courses
export const courseAPI = {
	getAll: (params) => api.get("/courses", { params }),
	getById: (id) => api.get(`/courses/${id}`),
	getPreview: (id) => api.get(`/courses/${id}/preview`),
	create: (data) => api.post("/courses", data),
	update: (id, data) => api.put(`/courses/${id}`, data),
	delete: (id) => api.delete(`/courses/${id}`),
	uploadCover: (id, formData) => api.post(`/courses/${id}/cover`, formData),
	getCertificateTemplate: (id) =>
		api.get(`/courses/${id}/certificate-template`),
	saveCertificateTemplate: (id, data) =>
		api.put(`/courses/${id}/certificate-template`, data),
};

// Modules
export const moduleAPI = {
	create: (courseId, data) => api.post(`/courses/${courseId}/modules`, data),
	update: (courseId, id, data) =>
		api.put(`/courses/${courseId}/modules/${id}`, data),
	delete: (courseId, id) => api.delete(`/courses/${courseId}/modules/${id}`),
	updateSortOrder: (courseId, items) =>
		api.put(`/courses/${courseId}/modules/sort-order`, { items }),
};

// Lessons
export const lessonAPI = {
	create: (moduleId, data) => api.post(`/modules/${moduleId}/lessons`, data),
	update: (moduleId, id, data) =>
		api.put(`/modules/${moduleId}/lessons/${id}`, data),
	delete: (moduleId, id) => api.delete(`/modules/${moduleId}/lessons/${id}`),
	updateSortOrder: (moduleId, items) =>
		api.put(`/modules/${moduleId}/lessons/sort-order`, { items }),
	uploadAttachment: (moduleId, lessonId, formData) =>
		api.post(`/modules/${moduleId}/lessons/${lessonId}/attachments`, formData),
	uploadVideo: (moduleId, lessonId, formData) =>
		api.post(`/modules/${moduleId}/lessons/${lessonId}/video`, formData),
	deleteAttachment: (moduleId, id) =>
		api.delete(`/modules/${moduleId}/lessons/attachments/${id}`),
	getAttachmentUrl: (moduleId, id) =>
		`/api/modules/${moduleId}/lessons/attachments/${id}/download`,
};

// Enrollments
export const enrollmentAPI = {
	enroll: (courseId) => api.post("/enrollments", { courseId }),
	adminEnroll: (data) => api.post("/enrollments/admin", data),
	approve: (id, approved) =>
		api.put(`/enrollments/${id}/approve`, { approved }),
	getMy: () => api.get("/enrollments/my"),
	getByCourse: (courseId) => api.get(`/enrollments/course/${courseId}`),
	getPending: () => api.get("/enrollments/pending"),
	getAll: (params) => api.get("/enrollments", { params }),
};

// Progress
export const progressAPI = {
	complete: (lessonId) => api.post("/progress/complete", { lessonId }),
	updateVideoPosition: (lessonId, positionSeconds, watchedPercent) =>
		api.put("/progress/video-position", {
			lessonId,
			positionSeconds,
			watchedPercent,
		}),
	getCourseProgress: (courseId) => api.get(`/progress/course/${courseId}`),
	getMyProgress: () => api.get("/progress/my"),
	getLessonProgresses: (courseId) => api.get(`/progress/lessons/${courseId}`),
	canAccess: (lessonId) => api.get(`/progress/can-access/${lessonId}`),
};

// Quizzes
export const quizAPI = {
	getById: (id) => api.get(`/quizzes/${id}`),
	create: (courseId, data) => api.post(`/quizzes/course/${courseId}`, data),
	createForLesson: (moduleId, lessonId, data) =>
		api.post(`/modules/${moduleId}/lessons/${lessonId}/quiz`, data),
	addQuestion: (quizId, data) => api.post(`/quizzes/${quizId}/questions`, data),
	start: (quizId) => api.post(`/quizzes/${quizId}/start`),
	saveDraft: (attemptId, questionId, selectedAnswer) =>
		api.put(`/quizzes/${attemptId}/draft`, { questionId, selectedAnswer }),
	updateTime: (attemptId, remainingSeconds) =>
		api.put(`/quizzes/${attemptId}/time`, { remainingSeconds }),
	submit: (attemptId, answers) =>
		api.post(`/quizzes/${attemptId}/submit`, { answers }),
	getResults: (quizId) => api.get(`/quizzes/${quizId}/results`),
};

// Certificates
export const certificateAPI = {
	issue: (courseId) => api.post(`/certificates/${courseId}`),
	getMy: () => api.get("/certificates/my"),
	verify: (code) => api.get(`/certificates/verify/${code}`),
	getAdmin: (params) => api.get(`/certificates/admin`, { params }),
	revoke: (id, reason) => api.put(`/certificates/${id}/revoke`, { reason }),
};

// Q&A
export const qaAPI = {
	create: (lessonId, data) => api.post(`/lessons/${lessonId}/qa`, data),
	getAll: (lessonId) => api.get(`/lessons/${lessonId}/qa`),
	delete: (lessonId, id) => api.delete(`/lessons/${lessonId}/qa/${id}`),
};

// Notes
export const noteAPI = {
	create: (lessonId, data) => api.post(`/lessons/${lessonId}/notes`, data),
	getAll: (lessonId) => api.get(`/lessons/${lessonId}/notes`),
	delete: (lessonId, id) => api.delete(`/lessons/${lessonId}/notes/${id}`),
};

// Leaderboard
export const leaderboardAPI = {
	get: (top = 10) => api.get("/leaderboard", { params: { top } }),
	getMyBadges: () => api.get("/leaderboard/badges"),
};

// Documents
export const documentAPI = {
	getAll: (params) => api.get("/documents", { params }),
	create: (formData) => api.post("/documents", formData),
	update: (id, data) => api.put(`/documents/${id}`, data),

	// === 4 HÀM NÀY LÀ BẮT BUỘC PHẢI CÓ CHO TRANG EDIT ===
	getById: (id) => api.get(`/documents/${id}`),
	getPermissions: (id) => api.get(`/documents/${id}/permissions`),
	updatePermissions: (id, data) =>
		api.put(`/documents/${id}/permissions`, data),
	clearPermissions: (id) => api.delete(`/documents/${id}/permissions`),
	// ====================================================

	addVersion: (id, formData) => api.post(`/documents/${id}/versions`, formData),
	getVersions: (id) => api.get(`/documents/${id}/versions`),
	delete: (id) => api.delete(`/documents/${id}`),
	getDownloadUrl: (id) => `/api/documents/${id}/download`,
	getVersionDownloadUrl: (versionId) =>
		`/api/documents/versions/${versionId}/download`,
};

// Reports
export const reportAPI = {
	getTraining: (courseId) =>
		api.get("/reports/training", { params: { courseId } }),
	getInactive: (days = 30) =>
		api.get("/reports/inactive", { params: { days } }),
	getQuizAnalytics: (quizId) => api.get(`/reports/quiz-analytics/${quizId}`),
};

// Users
export const userAPI = {
	getAll: (params) => api.get("/users", { params }),
	getById: (id) => api.get(`/users/${id}`),
	getReport: (id) => api.get(`/users/${id}/report`),
	create: (data) => api.post("/users", data),
	update: (id, data) => api.put(`/users/${id}`, data),
	toggleActive: (id) => api.put(`/users/${id}/toggle-active`),
	import: (formData) =>
		api.post("/users/import", formData, {
			headers: { "Content-Type": "multipart/form-data" },
		}),
};

// Profile
export const profileAPI = {
	get: () => api.get("/profile"),
	update: (data) => api.put("/profile", data),
	uploadAvatar: (formData) => api.post("/profile/avatar", formData),
	changePassword: (data) => api.put("/profile/password", data),
};

// User Groups (Phòng ban)
export const userGroupAPI = {
	getAll: (params) => api.get("/usergroups", { params }),
	getById: (id) => api.get(`/usergroups/${id}`),
	create: (data) => api.post("/usergroups", data),
	update: (id, data) => api.put(`/usergroups/${id}`, data),
	delete: (id) => api.delete(`/usergroups/${id}`),
	addUser: (groupId, userId) =>
		api.post(`/usergroups/${groupId}/users/${userId}`),
	removeUser: (groupId, userId) =>
		api.delete(`/usergroups/${groupId}/users/${userId}`),

	// [BỔ SUNG QUAN TRỌNG]: Gán khung lộ trình vào phòng ban
	assignCourseGroup: (departmentId, courseGroupId) =>
		api.post(`/usergroups/${departmentId}/course-groups/${courseGroupId}`),

	// [TÙY CHỌN BỔ SUNG]: Nếu bạn có tính năng gỡ khung lộ trình khỏi phòng ban
	removeCourseGroup: (departmentId, courseGroupId) =>
		api.delete(`/usergroups/${departmentId}/course-groups/${courseGroupId}`),
};

// Course Groups (Khung lộ trình đào tạo)
export const courseGroupAPI = {
	getAll: (params) => api.get("/coursegroups", { params }),
	getById: (id) => api.get(`/coursegroups/${id}`),
	create: (data) => api.post("/coursegroups", data),
	update: (id, data) => api.put(`/coursegroups/${id}`, data),
	delete: (id) => api.delete(`/coursegroups/${id}`),
	addCourse: (groupId, courseId, params) =>
		api.post(`/coursegroups/${groupId}/courses/${courseId}`, null, { params }),
	removeCourse: (groupId, courseId) =>
		api.delete(`/coursegroups/${groupId}/courses/${courseId}`),
};

// Alias để sử dụng tương thích với mã cũ trong component AddDepartment.vue
export const groupAPI = {
	getCourseGroups: (page = 1, pageSize = 100) =>
		api.get("/coursegroups", { params: { page, pageSize } }),
};

// RBAC
export const rbacAPI = {
	getRoles: () => api.get("/rbac/roles"),
	createRole: (data) => api.post("/rbac/roles", data),
	updateRolePermissions: (roleId, permissionIds) =>
		api.put(`/rbac/roles/${roleId}/permissions`, { permissionIds }),
	deleteRole: (roleId) => api.delete(`/rbac/roles/${roleId}`),
	getPermissions: () => api.get("/rbac/permissions"),
	getUserRoles: (userId) => api.get(`/rbac/users/${userId}/roles`),
	updateUserRoles: (userId, roleIds) =>
		api.put(`/rbac/users/${userId}/roles`, { roleIds }),
};

// --- DASHBOARD API ---
export const dashboardAPI = {
	getLearnerData: () => api.get("/dashboard/learner"),
};
export default api;
