<template>
	<div class="app-layout">
		<div class="mobile-backdrop" :class="{ active: mobileMenuOpen }" @click="mobileMenuOpen = false" />

		<aside class="sidebar" :class="{ collapsed: sidebarCollapsed, 'mobile-open': mobileMenuOpen }">
			<div class="sidebar-header">
				<div v-show="!sidebarCollapsed" class="logo" @click="$router.push('/')">
					<img src="@/assets/images/logo.png" alt="Powertech Logo"
						style="max-height: 60px; width: auto; object-fit: contain; transform: scale(1.8); transform-origin: center;" />
				</div>
				<button class="btn-icon btn-ghost toggle-btn desktop-only"
					@click="sidebarCollapsed = !sidebarCollapsed">
					<ChevronLeft v-if="!sidebarCollapsed" :size="18" />
					<ChevronRight v-else :size="18" />
				</button>
				<button class="btn-icon btn-ghost mobile-close-btn mobile-only" @click="mobileMenuOpen = false">
					<X :size="18" />
				</button>
			</div>

			<div class="dlabnav">
				<div class="dlabnav-scroll custom-scrollbar">
					<ul id="menu" class="doc-metismenu">
						<li class="nav-label">CHUNG</li>

						<li>
							<RouterLink to="/" :class="{ active: $route.name === 'Dashboard' }"
								@click="mobileMenuOpen = false">
								<LayoutDashboard :size="20" class="nav-icon" />
								<span class="nav-text">Tổng quan</span>
							</RouterLink>
						</li>

						<li class="nav-label">HỌC TẬP</li>

						<li>
							<RouterLink to="/my-courses" :class="{ active: $route.path === '/my-courses' }"
								@click="mobileMenuOpen = false">
								<BookOpen :size="20" class="nav-icon" />
								<span class="nav-text">Khóa học của tôi</span>
							</RouterLink>
						</li>

						<li>
							<RouterLink to="/learning-paths" :class="{ active: $route.path === '/learning-paths' }"
								@click="mobileMenuOpen = false">
								<Route :size="20" class="nav-icon" />
								<span class="nav-text">Lộ trình học tập</span>
							</RouterLink>
						</li>

						<li class="nav-label">KHÁM PHÁ & TÀI NGUYÊN</li>

						<li>
							<RouterLink to="/courses" :class="{ active: $route.path === '/courses' }"
								@click="mobileMenuOpen = false">
								<Library :size="20" class="nav-icon" />
								<span class="nav-text">Thư viện khóa học</span>
							</RouterLink>
						</li>

						<li>
							<RouterLink to="/documents" :class="{ active: $route.path === '/documents' }"
								@click="mobileMenuOpen = false">
								<FolderOpen :size="20" class="nav-icon" />
								<span class="nav-text">Tài liệu nội bộ</span>
							</RouterLink>
						</li>

						<li>
							<RouterLink to="/certificates" :class="{ active: $route.path === '/certificates' }"
								@click="mobileMenuOpen = false">
								<Award :size="20" class="nav-icon" />
								<span class="nav-text">Chứng Chỉ Của Tôi</span>
							</RouterLink>
						</li>

						<li>
							<RouterLink to="/leaderboard" :class="{ active: $route.path.startsWith('/leaderboard') }"
								@click="mobileMenuOpen = false">
								<Trophy :size="20" class="nav-icon" />
								<span class="nav-text">Bảng xếp hạng</span>
							</RouterLink>
						</li>

						<template v-if="authStore.canManage">
							<li class="nav-label nav-label-admin">QUẢN LÝ</li>

							<li v-if="
								!sidebarCollapsed &&
								(authStore.isAdmin ||
									authStore.isInstructor ||
									authStore.hasAnyPermission(
										'course.view',
										'group.manage',
										'enrollment.view',
										'quiz.manage',
									))
							" class="admin-group-header">
								<span class="admin-group-pill pill-training">
									<GraduationCap :size="12" /> Đào tạo
								</span>
							</li>
							<li v-if="
								!sidebarCollapsed &&
								(authStore.isAdmin ||
									authStore.isInstructor ||
									authStore.hasAnyPermission(
										'course.view',
										'group.manage',
										'enrollment.view',
										'quiz.manage',
									))
							" class="admin-group-divider" />

							<li v-if="
								authStore.isAdmin ||
								authStore.isInstructor ||
								authStore.hasPermission('course.view')
							">
								<RouterLink to="/admin/courses" class="admin-nav-item"
									:class="{ active: $route.path === '/admin/courses' }"
									@click="mobileMenuOpen = false">
									<span class="admin-item-icon icon-training">
										<BookOpen :size="15" />
									</span>
									<span class="nav-text">Danh sách khoá học</span>
								</RouterLink>
							</li>

							<li v-if="
								authStore.isAdmin || authStore.hasPermission('group.manage')
							">
								<RouterLink to="/admin/coursegroup" class="admin-nav-item" :class="{
									active: $route.path.startsWith('/admin/coursegroup'),
								}" @click="mobileMenuOpen = false">
									<span class="admin-item-icon icon-training">
										<Route :size="15" />
									</span>
									<span class="nav-text">Khung Lộ trình</span>
								</RouterLink>
							</li>

							<li v-if="
								authStore.isAdmin ||
								authStore.isInstructor ||
								authStore.hasPermission('enrollment.view')
							">
								<RouterLink to="/admin/enrollments" class="admin-nav-item"
									:class="{ active: $route.path === '/admin/enrollments' }"
									@click="mobileMenuOpen = false">
									<span class="admin-item-icon icon-training">
										<Users :size="15" />
									</span>
									<span class="nav-text">Quản lý ghi danh</span>
								</RouterLink>
							</li>
							<li v-if="
								authStore.isAdmin ||
								authStore.isInstructor ||
								authStore.hasPermission('quiz.manage')
							">
								<RouterLink to="/admin/quiz-analysis" class="admin-nav-item"
									:class="{ active: $route.path === '/admin/quiz-analysis' }"
									@click="mobileMenuOpen = false">
									<span class="admin-item-icon icon-training">
										<BarChart3 :size="15" />
									</span>
									<span class="nav-text">Phân tích đề thi</span>
								</RouterLink>
							</li>

							<li v-if="
								!sidebarCollapsed &&
								(authStore.isAdmin ||
									authStore.hasAnyPermission(
										'user.manage',
										'doc.view',
										'doc.upload',
										'doc.delete',
										'certificate.view',
										'certificate.manage',
									))
							" class="admin-group-header">
								<span class="admin-group-pill pill-org">
									<Layout :size="12" /> Tổ chức
								</span>
							</li>
							<li v-if="
								!sidebarCollapsed &&
								(authStore.isAdmin ||
									authStore.hasAnyPermission(
										'user.manage',
										'doc.view',
										'doc.upload',
										'doc.delete',
										'certificate.view',
										'certificate.manage',
									))
							" class="admin-group-divider" />

							<li v-if="
								authStore.isAdmin || authStore.hasPermission('user.manage')
							">
								<RouterLink to="/admin/departments" class="admin-nav-item" :class="{
									active: $route.path.startsWith('/admin/departments'),
								}" @click="mobileMenuOpen = false">
									<span class="admin-item-icon icon-org">
										<Building2 :size="15" />
									</span>
									<span class="nav-text">Danh sách Phòng ban</span>
								</RouterLink>
							</li>
							<li v-if="
								authStore.isAdmin || authStore.hasPermission('user.manage')
							">
								<RouterLink to="/admin/staff" class="admin-nav-item"
									:class="{ active: $route.path.startsWith('/admin/staff') }"
									@click="mobileMenuOpen = false">
									<span class="admin-item-icon icon-org">
										<UserCog :size="15" />
									</span>
									<span class="nav-text">Quản trị Nhân sự</span>
								</RouterLink>
							</li>
							<li v-if="
								authStore.isAdmin ||
								authStore.hasAnyPermission(
									'user.manage',
									'doc.view',
									'doc.upload',
									'doc.delete',
								)
							">
								<RouterLink to="/admin/documents" class="admin-nav-item" :class="{
									active: $route.path.startsWith('/admin/documents'),
								}" @click="mobileMenuOpen = false">
									<span class="admin-item-icon icon-org">
										<FolderOpen :size="15" />
									</span>
									<span class="nav-text">Kho Tài liệu nội bộ</span>
								</RouterLink>
							</li>
							<li v-if="
								authStore.isAdmin ||
								authStore.hasAnyPermission(
									'certificate.view',
									'certificate.manage',
								)
							">
								<RouterLink to="/admin/certificates" class="admin-nav-item"
									:class="{ active: $route.path === '/admin/certificates' }"
									@click="mobileMenuOpen = false">
									<span class="admin-item-icon icon-org">
										<Award :size="15" />
									</span>
									<span class="nav-text">Quản lý Chứng chỉ</span>
								</RouterLink>
							</li>

							<li v-if="
								!sidebarCollapsed &&
								(authStore.isAdmin ||
									authStore.hasAnyPermission('report.view', 'role.manage'))
							" class="admin-group-header">
								<span class="admin-group-pill pill-system">
									<Shield :size="12" /> Hệ thống
								</span>
							</li>
							<li v-if="
								!sidebarCollapsed &&
								(authStore.isAdmin ||
									authStore.hasAnyPermission('report.view', 'role.manage'))
							" class="admin-group-divider" />

							<li v-if="
								authStore.isAdmin || authStore.hasPermission('report.view')
							">
								<RouterLink to="/admin/reports" class="admin-nav-item"
									:class="{ active: $route.path === '/admin/reports' }"
									@click="mobileMenuOpen = false">
									<span class="admin-item-icon icon-system">
										<PieChart :size="15" />
									</span>
									<span class="nav-text">Báo cáo &amp; Nhắc nhở</span>
								</RouterLink>
							</li>
							<li v-if="
								authStore.isAdmin || authStore.hasPermission('role.manage')
							">
								<RouterLink to="/admin/rbac" class="admin-nav-item"
									:class="{ active: $route.path === '/admin/rbac' }" @click="mobileMenuOpen = false">
									<span class="admin-item-icon icon-system">
										<KeyRound :size="15" />
									</span>
									<span class="nav-text">Phân quyền (RBAC)</span>
								</RouterLink>
							</li>
						</template>
					</ul>
				</div>
			</div>
		</aside>

		<main class="main-content" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
			<header class="main-header glass">
				<button class="btn-icon btn-ghost mobile-only" @click="mobileMenuOpen = !mobileMenuOpen">
					<Menu :size="22" />
				</button>

				<div class="header-search desktop-tablet-only">
					<Search :size="18" />
					<input type="text" placeholder="Tìm kiếm khóa học, tài liệu..." class="search-input" />
				</div>



				<div class="header-actions">
					<button class="btn-icon btn-ghost mobile-only">
						<Search :size="20" />
					</button>
					<button class="btn-icon btn-ghost" @click="toggleTheme">
						<Sun v-if="isDark" :size="20" />
						<Moon v-else :size="20" />
					</button>

					<NotificationDropdown v-if="authStore.isAuthenticated" />

					<div ref="userMenuRef" class="user-menu" @click="showUserMenu = !showUserMenu">
						<div class="user-avatar overflow-hidden">
							<img
								v-if="avatarUrl && !avatarError"
								:src="avatarUrl"
								@error="handleAvatarError"
								class="w-100 h-100 object-fit-cover"
							/>
							<span v-else>{{ authStore.user?.fullName?.charAt(0) }}</span>
						</div>
						<span class="user-name desktop-tablet-only">{{
							authStore.user?.fullName
						}}</span>
						<ChevronDown :size="14" class="desktop-tablet-only" />

						<Transition name="dropdown">
							<div v-if="showUserMenu" class="user-dropdown" @click.stop>
								<div class="dropdown-header">
									<div class="user-avatar lg overflow-hidden">
										<img
											v-if="avatarUrl && !avatarError"
											:src="avatarUrl"
											@error="handleAvatarError"
											class="w-100 h-100 object-fit-cover"
										/>
										<span v-else>{{
											authStore.user?.fullName?.charAt(0)
										}}</span>
									</div>
									<div>
										<div class="dropdown-name">
											{{ authStore.user?.fullName }}
										</div>
										<span class="badge" :class="'badge-' + roleBadge">{{
											authStore.user?.role
										}}</span>
									</div>
								</div>
								<div class="dropdown-divider" />
								<div class="dropdown-item" @click="
									$router.push('/profile');
								showUserMenu = false;
								">
									<User :size="16" /> Hồ sơ cá nhân
								</div>
								<div class="dropdown-item" @click="doLogout">
									<LogOut :size="16" /> Đăng xuất
								</div>
							</div>
						</Transition>
					</div>
				</div>
			</header>

			<div class="page-content">
				<router-view />
			</div>
		</main>
	</div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import NotificationDropdown from "@/components/NotificationDropdown.vue";
import {
	LayoutDashboard,
	BookOpen,
	Trophy,
	Library,
	Shield,
	Menu,
	Search,
	Sun,
	Moon,
	ChevronDown,
	LogOut,
	User,
	ChevronLeft,
	ChevronRight,
	Users,
	BarChart3,
	Building2,
	UserCog,
	FolderOpen,
	Route,
	X,
	Award,
	GraduationCap,
	Layout,
	PieChart,
	KeyRound,
} from "lucide-vue-next";

const authStore = useAuthStore();
const router = useRouter();
const sidebarCollapsed = ref(false);
const mobileMenuOpen = ref(false);
const showUserMenu = ref(false);
const isDark = ref(false);
const userMenuRef = ref(null);
const avatarError = ref(false);

const handleAvatarError = () => {
	avatarError.value = true;
};

const openGroups = ref({
	learning: false,
	resources: false,
	adminTraining: false,
	adminOrg: false,
	adminSystem: false,
});

/*
 * function toggleGroup(group) {
 *   openGroups.value[group] = !openGroups.value[group]
 * }
 */

const syncSidebarGroups = () => {
	const path = router.currentRoute.value.path;
	if (path === "/courses" || path.startsWith("/my-courses"))
		openGroups.value.learning = true;
	if (
		(path.startsWith("/documents") || path.startsWith("/certificates")) &&
		!path.startsWith("/admin")
	) {
		openGroups.value.resources = true;
	}

	if (path.startsWith("/admin")) {
		if (
			path.includes("/courses") ||
			path.includes("/enrollments") ||
			path.includes("/quiz-analysis") ||
			path.includes("/learning-paths")
		) {
			openGroups.value.adminTraining = true;
		}
		if (
			path.includes("/departments") ||
			path.includes("/admin/documents") ||
			path.includes("/admin/certificates") ||
			path.includes("/staff")
		) {
			openGroups.value.adminOrg = true;
		}
		if (path.includes("/reports") || path.includes("/rbac")) {
			openGroups.value.adminSystem = true;
		}
	}
};

watch(
	() => router.currentRoute.value.path,
	() => {
		syncSidebarGroups();
	},
);

watch(
	() => authStore.user?.avatar,
	() => {
		avatarError.value = false;
	},
);

const roleBadge = computed(() => {
	const role = authStore.user?.role;
	if (role === "Admin") return "danger";
	if (role === "Instructor") return "warning";
	return "primary";
});

const avatarUrl = computed(() => {
	if (!authStore.user?.avatar) return null;
	const url = authStore.user.avatar;
	const base = url.startsWith("http")
		? url
		: `${import.meta.env.VITE_API_URL || "http://localhost:5100"}${url}`;
	return `${base}?t=${authStore.avatarUpdateTime}`;
});

function toggleTheme() {
	isDark.value = !isDark.value;
	const theme = isDark.value ? "dark" : "light";
	document.documentElement.setAttribute("data-theme", theme);
	localStorage.setItem("lms_theme", theme);
}

function doLogout() {
	showUserMenu.value = false;
	authStore.logout();
	router.push("/login");
}

function handleClickOutside(e) {
	if (userMenuRef.value && !userMenuRef.value.contains(e.target))
		showUserMenu.value = false;
}

function handleResize() {
	if (window.innerWidth > 768) mobileMenuOpen.value = false;
}

onMounted(() => {
	const savedTheme = localStorage.getItem("lms_theme");
	if (savedTheme) {
		isDark.value = savedTheme === "dark";
	} else {
		isDark.value = window.matchMedia("(prefers-color-scheme: dark)").matches;
	}
	document.documentElement.setAttribute(
		"data-theme",
		isDark.value ? "dark" : "light",
	);
	syncSidebarGroups();
	document.addEventListener("click", handleClickOutside);
	window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
	document.removeEventListener("click", handleClickOutside);
	window.removeEventListener("resize", handleResize);
});
</script>

<style scoped>
.app-layout {
	display: flex;
	min-height: 100vh;
}

.sidebar {
	width: var(--sidebar-width);
	background: var(--gradient-sidebar);
	border-right: 1px solid var(--border-color);
	display: flex;
	flex-direction: column;
	position: fixed;
	top: 0;
	left: 0;
	bottom: 0;
	z-index: 200;
	transition: all var(--transition-base);
	overflow: hidden;
	box-shadow: 4px 0 10px rgba(0, 0, 0, 0.02);
}

.sidebar.collapsed {
	width: 68px;
}

@media (max-width: 768px) {
	.sidebar {
		width: 0;
		transform: none;
		box-shadow: none;
	}

	.sidebar.mobile-open {
		width: 260px;
		transform: none;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
	}
}

.mobile-backdrop {
	display: none;
	position: fixed;
	inset: 0;
	background: rgba(0, 0, 0, 0.5);
	backdrop-filter: blur(2px);
	z-index: 190;
	opacity: 0;
	transition: opacity 0.3s ease;
}

@media (max-width: 768px) {
	.mobile-backdrop.active {
		display: block;
		opacity: 1;
	}
}

.sidebar-header {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: var(--space-md);
	height: 120px;
	flex-shrink: 0;
	overflow: visible;
	position: relative;
}

.sidebar.collapsed .sidebar-header {
	justify-content: center;
	padding: var(--space-md) 0;
}

.sidebar-header .toggle-btn,
.sidebar-header .mobile-close-btn {
	position: absolute;
	right: var(--space-md);
}

.sidebar.collapsed .toggle-btn {
	display: flex;
	margin: 0 auto;
	position: static;
}

.logo {
	display: flex;
	align-items: center;
	gap: var(--space-sm);
	cursor: pointer;
	min-width: 0;
	overflow: visible;
}

.logo-text {
	font-size: var(--font-size-xl);
	font-weight: 800;
	background: var(--gradient-primary);
	-webkit-background-clip: text;
	background-clip: text;
	-webkit-text-fill-color: transparent;
	white-space: nowrap;
	opacity: 1;
	max-width: 160px;
	transition:
		opacity var(--transition-base),
		max-width var(--transition-base);
}

.sidebar.collapsed .logo-text {
	opacity: 0;
	max-width: 0;
	pointer-events: none;
}

.sidebar.collapsed .logo {
	justify-content: center;
	width: 100%;
}

.sidebar.collapsed:hover .sidebar-header {
	justify-content: center;
}

.dlabnav {
	flex: 1;
	min-height: 0;
	display: flex;
	flex-direction: column;
}

.dlabnav-scroll {
	height: 100%;
	overflow-y: auto;
	overflow-x: hidden;
	padding: var(--space-sm) 0 var(--space-xl);
}

.dlabnav-scroll::-webkit-scrollbar {
	width: 4px;
}

.dlabnav-scroll::-webkit-scrollbar-track {
	background: transparent;
}

.dlabnav-scroll::-webkit-scrollbar-thumb {
	background: rgba(255, 255, 255, 0.1);
	border-radius: 10px;
}

.sidebar:hover .dlabnav-scroll::-webkit-scrollbar-thumb {
	background: rgba(255, 255, 255, 0.2);
}

ul.doc-metismenu {
	list-style: none;
	padding: 0;
	margin: 0;
	display: flex;
	flex-direction: column;
}

.nav-label {
	padding: 10px 24px 6px;
	font-size: 10.5px;
	font-weight: 700;
	color: #94a3b8;
	text-transform: uppercase;
	letter-spacing: 0.12em;
	display: flex;
	align-items: center;
	gap: 8px;
}

.nav-label::after {
	content: "";
	flex: 1;
	height: 1px;
	background: var(--border-color);
	margin-left: 4px;
	opacity: 0.6;
}

.nav-label-admin {
	color: rgba(var(--primary-rgb), 0.7);
}

.nav-label-admin::after {
	background: linear-gradient(to right,
			rgba(var(--primary-rgb), 0.3),
			transparent);
}

.sidebar.collapsed .nav-label {
	opacity: 0;
	height: 0;
	padding: 0;
	overflow: hidden;
}

ul.doc-metismenu>li>a {
	display: flex;
	align-items: center;
	padding: 10px 16px;
	margin: 2px 10px;
	font-size: 13.5px;
	font-weight: 500;
	color: var(--text-secondary);
	text-decoration: none;
	transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
	position: relative;
	border-radius: 10px;
	gap: 10px;
}

ul.doc-metismenu>li>a.router-link-active,
ul.doc-metismenu>li>a.active {
	color: var(--sidebar-text-active) !important;
	background-color: var(--sidebar-bg-active);
	font-weight: 600;
}

ul.doc-metismenu>li>a.router-link-active::before,
ul.doc-metismenu>li>a.active::before {
	content: "";
	position: absolute;
	left: -10px;
	top: 8px;
	bottom: 8px;
	width: 3px;
	background: var(--primary);
	border-radius: 0 3px 3px 0;
}

ul.doc-metismenu>li>a:hover:not(.active):not(.router-link-active) {
	background-color: rgba(var(--primary-rgb), 0.05);
	color: var(--text-primary);
}

.nav-icon {
	flex-shrink: 0;
	opacity: 0.75;
}

ul.doc-metismenu>li>a.active .nav-icon,
ul.doc-metismenu>li>a.router-link-active .nav-icon {
	opacity: 1;
}

.nav-text {
	flex: 1;
	white-space: nowrap;
	overflow: hidden;
	opacity: 1;
	max-width: 180px;
	transition:
		opacity var(--transition-base),
		max-width var(--transition-base);
}

.sidebar.collapsed .nav-text {
	opacity: 0;
	max-width: 0;
	pointer-events: none;
}

.doc-has-arrow::after {
	content: "";
	width: 6px;
	height: 6px;
	border-width: 1.5px 1.5px 0 0;
	border-style: solid;
	border-color: currentColor;
	opacity: 0.4;
	display: inline-block;
	transform: rotate(45deg);
	transition:
		transform 0.25s ease,
		margin-top 0.25s ease;
	position: absolute;
	right: 16px;
	top: 50%;
	margin-top: -4px;
	flex-shrink: 0;
}

.doc-metismenu li.mm-active>a.doc-has-arrow::after {
	transform: rotate(135deg);
	margin-top: -6px;
	opacity: 0.7;
}

.sidebar.collapsed .doc-has-arrow::after {
	display: none;
}

.doc-metismenu ul.doc-collapse {
	list-style: none;
	padding: 0;
	margin: 0 0 4px 20px;
	border-left: 1.5px solid var(--border-color);
	overflow: hidden;
	max-height: 0;
	display: block !important;
	transition:
		max-height 0.3s ease-in-out,
		padding 0.3s ease;
}

.doc-metismenu ul.doc-collapse.doc-in {
	max-height: 500px;
	padding: 2px 0;
}

.doc-metismenu ul li a {
	padding: 7px 14px;
	margin: 1px 10px;
	font-size: 13px;
	color: var(--text-secondary);
	display: block;
	transition: all 0.18s ease;
	position: relative;
	border-radius: 8px;
	text-decoration: none;
}

.doc-metismenu ul li a::after {
	display: none !important;
}

.doc-metismenu ul li a:hover,
.doc-metismenu ul li a.router-link-active,
.doc-metismenu ul li a.active {
	color: var(--sidebar-text-active);
	background: var(--sidebar-bg-active);
}

.doc-metismenu ul li a.router-link-active::before,
.doc-metismenu ul li a.active::before {
	content: "";
	position: absolute;
	left: -8px;
	top: 50%;
	transform: translateY(-50%);
	width: 5px;
	height: 5px;
	border-radius: 50%;
	background: var(--primary);
}

.sidebar.collapsed .doc-metismenu>li>a {
	padding: 10px 0;
	margin: 2px 8px;
	justify-content: center;
	gap: 0;
}

.sidebar.collapsed .doc-metismenu ul {
	display: none !important;
}

.main-content {
	flex: 1;
	margin-left: var(--sidebar-width);
	transition: margin-left var(--transition-base);
	display: flex;
	flex-direction: column;
	min-height: 100vh;
	min-width: 0;
}

.main-content.sidebar-collapsed {
	margin-left: 68px;
}

@media (max-width: 768px) {
	.main-content {
		margin-left: 0 !important;
	}
}

.main-header {
	height: var(--header-height);
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 var(--space-xl);
	position: sticky;
	top: 0;
	z-index: 1100;
	border-bottom: 1px solid var(--border-color);
	box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
}

@media (max-width: 768px) {
	.main-header {
		padding: 0 var(--space-md);
	}
}

.header-search {
	display: flex;
	align-items: center;
	gap: var(--space-sm);
	background: var(--bg-tertiary);
	border: 1px solid var(--border-color);
	border-radius: 99px;
	padding: 0.6rem 1.25rem;
	width: 500px;
	position: absolute;
	left: 50%;
	transform: translateX(-50%);
	transition: all 0.2s ease;
}

.header-search:focus-within {
	background: var(--bg-card);
	box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
	border-color: var(--primary);
}

@media (max-width: 1024px) {
	.header-search {
		width: 300px;
	}
}

.search-input {
	border: none;
	background: transparent;
	color: var(--text-primary);
	outline: none;
	width: 100%;
	font-size: var(--font-size-sm);
}

.search-input::placeholder {
	color: var(--text-tertiary);
}

.mobile-logo {
	display: flex;
	align-items: center;
	gap: 8px;
	cursor: pointer;
}

.mobile-logo-text {
	font-size: var(--font-size-lg);
	font-weight: 800;
	background: var(--gradient-primary);
	-webkit-background-clip: text;
	background-clip: text;
	-webkit-text-fill-color: transparent;
}

.header-actions {
	display: flex;
	align-items: center;
	gap: var(--space-sm);
	margin-left: auto;
}

.user-menu {
	display: flex;
	align-items: center;
	gap: var(--space-sm);
	cursor: pointer;
	position: relative;
	padding: 0.375rem 0.75rem;
	border-radius: var(--radius-full);
	transition: background var(--transition-fast);
}

.user-menu:hover {
	background: var(--bg-glass);
}

.user-avatar {
	width: 32px;
	height: 32px;
	border-radius: 50%;
	background: var(--gradient-primary);
	display: flex;
	align-items: center;
	justify-content: center;
	color: white;
	font-weight: 700;
	font-size: var(--font-size-sm);
	flex-shrink: 0;
}

.user-avatar.lg {
	width: 40px;
	height: 40px;
	font-size: var(--font-size-md);
}

.user-name {
	font-size: var(--font-size-sm);
	font-weight: 500;
	color: var(--text-primary);
	max-width: 120px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.user-dropdown {
	position: absolute;
	top: calc(100% + 8px);
	right: 0;
	background: var(--bg-secondary);
	border: 1px solid var(--border-color);
	border-radius: var(--radius-lg);
	padding: var(--space-xs);
	min-width: 200px;
	box-shadow: var(--shadow-lg);
}

.dropdown-header {
	display: flex;
	align-items: center;
	gap: var(--space-sm);
	padding: 0.5rem 0.75rem;
}

.dropdown-name {
	font-size: var(--font-size-sm);
	font-weight: 600;
	color: var(--text-primary);
	margin-bottom: 4px;
}

.dropdown-divider {
	height: 1px;
	background: var(--border-color);
	margin: var(--space-xs) 0;
}

.dropdown-item {
	display: flex;
	align-items: center;
	gap: var(--space-sm);
	padding: 0.5rem 0.75rem;
	border-radius: var(--radius-md);
	font-size: var(--font-size-sm);
	color: var(--text-secondary);
	cursor: pointer;
	transition: all var(--transition-fast);
}

.dropdown-item:hover {
	background: var(--bg-glass);
	color: var(--text-primary);
}

.page-content {
	flex: 1;
	padding: var(--space-xl);
	animation: fadeIn 0.3s ease-out;
}

@media (max-width: 768px) {
	.page-content {
		padding: var(--space-md);
	}
}

.desktop-only {
	display: flex;
}

.mobile-only {
	display: none;
}

.desktop-tablet-only {
	display: flex;
}

@media (max-width: 768px) {
	.desktop-only {
		display: none !important;
	}

	.mobile-only {
		display: flex !important;
	}

	.desktop-tablet-only {
		display: none !important;
	}
}

@media (min-width: 769px) and (max-width: 1024px) {
	.desktop-only {
		display: none !important;
	}
}

.dropdown-enter-active,
.dropdown-leave-active {
	transition: all 0.15s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
	opacity: 0;
	transform: translateY(-6px) scale(0.97);
}

.admin-group-header {
	padding: 14px 16px 4px;
	list-style: none;
}

.admin-group-pill {
	display: inline-flex;
	align-items: center;
	gap: 5px;
	padding: 3px 10px 3px 7px;
	border-radius: 20px;
	font-size: 11px;
	font-weight: 700;
	letter-spacing: 0.04em;
	text-transform: uppercase;
}

.pill-training {
	background: rgba(var(--primary-rgb), 0.08);
	color: var(--primary-500);
	border: 1px solid rgba(var(--primary-rgb), 0.15);
}

.pill-org {
	background: rgba(71, 130, 160, 0.08);
	color: #7bafc8;
	border: 1px solid rgba(71, 130, 160, 0.15);
}

.pill-system {
	background: rgba(148, 163, 184, 0.08);
	color: #94a3b8;
	border: 1px solid rgba(148, 163, 184, 0.15);
}

.admin-group-divider {
	height: 0;
	margin: 0;
	list-style: none;
}

.admin-nav-item {
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 8px 14px;
	margin: 1px 10px;
	font-size: 13px;
	font-weight: 500;
	color: var(--text-secondary);
	text-decoration: none;
	border-radius: 9px;
	transition: all 0.18s ease;
	position: relative;
}

.admin-nav-item:hover {
	background: rgba(var(--primary-rgb), 0.05);
	color: var(--text-primary);
}

.admin-nav-item.active,
.admin-nav-item.router-link-active {
	color: var(--sidebar-text-active);
	background: var(--sidebar-bg-active);
	font-weight: 600;
}

.admin-nav-item.active::before,
.admin-nav-item.router-link-active::before {
	content: "";
	position: absolute;
	left: -10px;
	top: 6px;
	bottom: 6px;
	width: 3px;
	background: var(--primary);
	border-radius: 0 3px 3px 0;
}

.admin-item-icon {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 26px;
	height: 26px;
	border-radius: 7px;
	flex-shrink: 0;
	transition: all 0.18s ease;
}

.icon-training {
	background: rgba(var(--primary-rgb), 0.08);
	color: var(--primary-500);
}

.icon-org {
	background: rgba(71, 130, 160, 0.08);
	color: #7bafc8;
}

.icon-system {
	background: rgba(148, 163, 184, 0.08);
	color: #94a3b8;
}

.admin-nav-item.active .icon-training,
.admin-nav-item.router-link-active .icon-training {
	background: rgba(var(--primary-rgb), 0.15);
	color: var(--primary-600);
}

.admin-nav-item.active .icon-org,
.admin-nav-item.router-link-active .icon-org {
	background: rgba(71, 130, 160, 0.14);
	color: #a8d0e6;
}

.admin-nav-item.active .icon-system,
.admin-nav-item.router-link-active .icon-system {
	background: rgba(148, 163, 184, 0.13);
	color: #cbd5e1;
}

.admin-nav-item:hover .admin-item-icon {
	transform: scale(1.08);
}

.sidebar.collapsed .admin-nav-item {
	padding: 8px 0;
	margin: 1px 8px;
	justify-content: center;
	gap: 0;
}

.sidebar.collapsed .admin-nav-item .nav-text {
	display: none;
}

.sidebar.collapsed .admin-group-header,
.sidebar.collapsed .admin-group-divider {
	display: none;
}
</style>
