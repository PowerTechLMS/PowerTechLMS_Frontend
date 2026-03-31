import { createRouter, createWebHashHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const APP_NAME = "EDUPOWER";

const routes = [
	{
		path: "/",
		name: "Root",
		redirect: "/login",
	},

	{
		path: "/login",
		name: "Login",
		component: () => import("@/pages/auth/LoginPage.vue"),
		meta: { guest: true, title: `Đăng nhập – ${APP_NAME}` },
	},

	{
		path: "/",
		component: () => import("@/layouts/MainLayout.vue"),
		meta: { requiresAuth: true },
		children: [
			{
				path: "dashboard",
				name: "Dashboard",
				component: () => import("@/pages/DashboardPage.vue"),
				meta: { title: `Dashboard – ${APP_NAME}` },
			},
			{
				path: "courses",
				name: "Courses",
				component: () => import("@/pages/CourseCatalog.vue"),
				meta: { title: `Khám phá Khóa học – ${APP_NAME}` },
			},
			{
				path: "courses/:id",
				name: "CourseDetail",
				component: () => import("@/pages/CourseDetail.vue"),
				meta: { title: `Chi tiết Khóa học – ${APP_NAME}` },
			},
			{
				path: "my-courses",
				name: "MyCourses",
				component: () => import("@/pages/MyCourses.vue"),
				meta: { title: `Khóa học của tôi – ${APP_NAME}` },
			},
			{
				path: "certificates",
				name: "Certificates",
				component: () => import("@/pages/CertificatesPage.vue"),
				meta: { title: `Chứng Chỉ Của Tôi – ${APP_NAME}` },
			},
			{
				path: "learning-paths",
				name: "LearningPaths",
				component: () => import("@/pages/LearningPaths.vue"),
				meta: { title: `Lộ trình học tập – ${APP_NAME}` },
			},
			{
				path: "learning-paths/:id",
				name: "LearningPathDetail",
				component: () => import("@/pages/LearningPathDetail.vue"),
				meta: { title: `Chi tiết lộ trình – ${APP_NAME}` },
			},
			{
				path: "leaderboard",
				name: "Leaderboard",
				component: () => import("@/pages/LeaderboardPage.vue"),
				meta: { title: `Bảng Xếp Hạng – ${APP_NAME}` },
			},
			{
				path: "documents",
				name: "Documents",
				component: () => import("@/pages/DocumentsPage.vue"),
				meta: { title: `Thư viện Tài liệu – ${APP_NAME}` },
			},
			{
				path: "profile",
				name: "Profile",
				component: () => import("@/pages/ProfilePage.vue"),
				meta: { title: `Hồ sơ cá nhân – ${APP_NAME}` },
			},

			{
				path: "admin/courses",
				name: "AdminCourses",
				component: () => import("@/pages/admin/AdminCoursesPage.vue"),
				meta: {
					roles: ["Admin", "Instructor"],
					title: `Quản lý Khóa học – ${APP_NAME}`,
				},
			},
			{
				path: "admin/courses/new",
				name: "CourseBuilder",
				component: () => import("@/pages/admin/CourseBuilder.vue"),
				meta: {
					roles: ["Admin", "Instructor"],
					title: `Tạo Khóa học – ${APP_NAME}`,
				},
			},
			{
				path: "admin/courses/:id/edit",
				name: "CourseEdit",
				component: () => import("@/pages/admin/CourseEditor.vue"),
				meta: {
					roles: ["Admin", "Instructor"],
					title: `Chỉnh sửa Khóa học – ${APP_NAME}`,
				},
			},
			{
				path: "admin/courses/:id/about",
				name: "CourseAbout",
				component: () => import("@/pages/admin/CourseAbout.vue"),
				meta: {
					roles: ["Admin", "Instructor"],
					title: `Xem trước – ${APP_NAME}`,
				},
			},
			{
				path: "admin/courses/:id/certificate",
				name: "CertificateTemplateConfig",
				component: () => import("@/pages/admin/CertificateTemplateConfig.vue"),
				meta: {
					roles: ["Admin", "Instructor"],
					title: `Thiết kế Mẫu Chứng chỉ – ${APP_NAME}`,
				},
			},
			{
				path: "admin/certificates",
				name: "AdminCertificates",
				component: () => import("@/pages/admin/CertificatesList.vue"),
				meta: {
					roles: ["Admin", "Instructor"],
					permissions: ["certificate.view", "certificate.manage"],
					title: `Quản lý Chứng chỉ – ${APP_NAME}`,
				},
			},
			{
				path: "admin/enrollments",
				name: "ManageEnrollments",
				component: () => import("@/pages/admin/ManageEnrollments.vue"),
				meta: {
					roles: ["Admin", "Instructor"],
					title: `Quản lý Ghi danh – ${APP_NAME}`,
				},
			},
			{
				path: "admin/reports",
				name: "Reports",
				component: () => import("@/pages/admin/InactiveReportPage.vue"),
				meta: {
					permissions: ["report.view"],
					title: `Báo cáo & Nhắc nhở – ${APP_NAME}`,
				},
			},
			{
				path: "admin/quiz-analysis",
				name: "QuizAnalysis",
				component: () => import("@/pages/admin/QuizAnalysisPage.vue"),
				meta: {
					permissions: ["report.view", "quiz.manage"],
					title: `Phân tích Đề thi – ${APP_NAME}`,
				},
			},
			{
				path: "admin/rbac",
				name: "RbacManagement",
				component: () => import("@/pages/admin/RbacPage.vue"),
				meta: {
					permissions: ["role.manage"],
					title: `Phân quyền RBAC – ${APP_NAME}`,
				},
			},
			{
				path: "admin/departments",
				name: "Departments",
				component: () => import("@/pages/admin/DepartmentsList.vue"),
				meta: {
					permissions: ["user.manage"],
					title: `Quản lý Phòng ban – ${APP_NAME}`,
				},
			},
			{
				path: "admin/departments/:id",
				name: "AboutDepartment",
				component: () => import("@/pages/admin/AboutDepartment.vue"),
				meta: {
					permissions: ["user.manage"],
					title: `Chi tiết Phòng ban – ${APP_NAME}`,
				},
			},
			{
				path: "admin/departments/add",
				name: "AddDepartment",
				component: () => import("@/pages/admin/AddDepartment.vue"),
				meta: {
					permissions: ["user.manage"],
					title: `Thêm Phòng ban – ${APP_NAME}`,
				},
			},
			{
				path: "admin/departments/edit/:id",
				name: "EditDepartment",
				component: () => import("@/pages/admin/EditDepartment.vue"),
				meta: {
					permissions: ["user.manage"],
					title: `Chỉnh sửa Phòng ban – ${APP_NAME}`,
				},
			},
			{
				path: "admin/coursegroup/",
				name: "CourseGroupList",
				component: () => import("@/pages/admin/CourseGroups.vue"),
				meta: {
					permissions: ["user.manage"],
					title: `Quản lý nhóm khóa học – ${APP_NAME}`,
				},
			},
			{
				path: "admin/coursegroup/add",
				name: "AddCourseGroup",
				component: () => import("@/pages/admin/AddCourseGroup.vue"),
				meta: {
					permissions: ["user.manage"],
					title: `Thêm Nhóm Khóa học – ${APP_NAME}`,
				},
			},
			{
				path: "admin/coursegroup/:id/edit",
				name: "EditCourseGroup",
				component: () => import("@/pages/admin/EditCourseGroup.vue"),
				meta: {
					permissions: ["user.manage"],
					title: `Chỉnh sửa Nhóm Khóa học – ${APP_NAME}`,
				},
			},
			{
				path: "admin/coursegroup/:id/about",
				name: "CourseGroupAbout",
				component: () => import("@/pages/admin/CourseGroupDetail.vue"),
				meta: {
					permissions: ["user.manage"],
					title: `Chi tiết Nhóm Khóa học – ${APP_NAME}`,
				},
			},
			{
				path: "admin/staff",
				name: "StaffList",
				component: () => import("@/pages/admin/StaffList.vue"),
				meta: {
					permissions: ["user.manage"],
					title: `Quản lý Nhân sự – ${APP_NAME}`,
				},
			},
			{
				path: "admin/staff/new",
				name: "StaffAdd",
				component: () => import("@/pages/admin/StaffAdd.vue"),
				meta: {
					permissions: ["user.manage"],
					title: `Thêm Nhân sự – ${APP_NAME}`,
				},
			},
			{
				path: "admin/staff/edit/:id",
				name: "StaffEdit",
				component: () => import("@/pages/admin/StaffEdit.vue"),
				meta: {
					permissions: ["user.manage"],
					title: `Chỉnh sửa Nhân sự – ${APP_NAME}`,
				},
			},
			{
				path: "admin/staff/profile/:id",
				name: "StaffProfile",
				component: () => import("@/pages/admin/StaffProfile.vue"),
				meta: {
					permissions: ["user.manage"],
					title: `Hồ sơ Nhân sự – ${APP_NAME}`,
				},
			},
			{
				path: "admin/documents",
				name: "AdminDocuments",
				component: () => import("@/pages/admin/DocumentsList.vue"),
				meta: {
					roles: ["Admin", "Instructor"],
					permissions: ["user.manage", "doc.view", "doc.upload", "doc.delete"],
					title: `Kho Tài Liệu – ${APP_NAME}`,
				},
			},
			{
				path: "admin/documents/add",
				name: "DocumentAdd",
				component: () => import("@/pages/admin/DocumentAdd.vue"),
				meta: {
					roles: ["Admin", "Instructor"],
					permissions: ["user.manage", "doc.upload"],
					title: `Thêm Tài Liệu – ${APP_NAME}`,
				},
			},
			{
				path: "admin/documents/edit/:id",
				name: "DocumentEdit",
				component: () => import("@/pages/admin/DocumentEdit.vue"),
				meta: {
					roles: ["Admin", "Instructor"],
					permissions: ["user.manage", "doc.upload", "doc.delete"],
					title: `Chỉnh sửa Tài Liệu – ${APP_NAME}`,
				},
			},
			{
				path: "learn/:courseId/:lessonId",
				name: "LearningPlayer",
				component: () => import("@/pages/LearningPlayer.vue"),
				meta: { title: `Đang học – ${APP_NAME}`, requiresAuth: true },
			},
			{
				path: "quiz/:quizId",
				name: "QuizPage",
				component: () => import("@/pages/QuizPage.vue"),
				meta: { title: `Làm bài kiểm tra – ${APP_NAME}`, requiresAuth: true },
			},
		],
	},
	{
		path: "/verify/:code",
		name: "VerifyCertificate",
		component: () => import("@/pages/VerifyCertificate.vue"),
		meta: { title: `Xác minh Chứng chỉ – ${APP_NAME}` },
	},
];

const router = createRouter({
	history: createWebHashHistory(),
	routes,
	scrollBehavior(to, from, savedPosition) {
		if (savedPosition) return savedPosition;
		return { top: 0, behavior: "smooth" };
	},
});

router.beforeEach((to, from, next) => {
	const auth = useAuthStore();
	auth.initAuth();

	if (to.meta.requiresAuth && !auth.isAuthenticated) {
		return next("/login");
	}


	if (to.meta.guest && auth.isAuthenticated) {
		return next("/dashboard");
	}

	if (to.meta.roles || to.meta.permissions) {
		let canAccess = false;

		if (to.meta.roles && to.meta.roles.some((r) => auth.hasRole(r))) {
			canAccess = true;
		}

		if (to.meta.permissions && auth.hasAnyPermission(...to.meta.permissions)) {
			canAccess = true;
		}

		if (!canAccess) {
			return next("/dashboard");
		}
	}

	next();
});

router.afterEach((to) => {
	document.title = to.meta.title || APP_NAME;
});

export default router;
