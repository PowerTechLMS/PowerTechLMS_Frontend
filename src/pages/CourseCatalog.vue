<template>
	<div class="catalog-page">
		<div class="hero-section">
			<div class="hero-left">
				<div class="hero-badge badge-glass primary">E-Learning Excellence</div>
				<h1 class="hero-title">
					Khám Phá<br /><span class="highlight">Tri Thức</span>
				</h1>
				<p class="hero-subtitle">
					Bắt đầu hành trình phát triển bản thân với bộ sưu tập các khóa học
					chất lượng cao, được thiết kế bởi các chuyên gia hàng đầu.
				</p>

				<div class="hero-stats">
					<div v-for="s in heroStats" :key="s.label" class="hstat">
						<span class="hstat-val">{{ s.val }}</span>
						<span class="hstat-lbl">{{ s.label }}</span>
					</div>
				</div>
				<div class="hero-decoration-1" />
				<div class="hero-decoration-2" />
			</div>

			<div class="hero-right">
				<div class="search-panel glass">
					<p class="search-panel-label">Tìm khóa học phù hợp</p>
					<div class="hero-search-box">
						<Search :size="18" class="search-icon" />
						<input
							v-model="search"
							type="text"
							placeholder="Bạn muốn học gì hôm nay?"
							class="hero-search-input"
							@input="debounceFetch"
							@keyup.enter="fetchCourses"
						/>
						<button class="search-btn-neon" @click="fetchCourses">Tìm</button>
					</div>
					<div class="trending-tags">
						<span class="tag-label">Xu hướng:</span>
						<span
							v-for="tag in ['Kỹ năng mềm', 'Kỹ thuật', 'Lãnh đạo', 'Số hóa']"
							:key="tag"
							class="tag-item"
							@click="
								search = tag;
								activeCategory = null;
								fetchCourses();
							"
							>{{ tag }}</span
						>
					</div>

					<div class="quick-cats">
						<button
							v-for="cat in categories"
							:key="cat.id"
							class="quick-cat-btn"
							:class="{ active: activeCategory === cat.id }"
							@click="selectCategory(cat.id)"
						>
							{{ cat.name }}
						</button>
					</div>
				</div>
			</div>
		</div>

		<div class="main-layout">
			<aside class="sidebar glass">
				<div class="sb-section">
					<div class="sb-heading">Danh mục</div>
					<div class="sb-cat-list">
						<button
							v-for="cat in categories"
							:key="cat.id"
							class="sb-cat-btn"
							:class="{ active: activeCategory === cat.id }"
							@click="selectCategory(cat.id)"
						>
							<span
								class="sb-cat-dot"
								:style="{ background: catColors[cat.id] || '#94a3b8' }"
							/>
							{{ cat.name }}
							<span class="sb-cat-arrow"><ChevronRight :size="14" /></span>
						</button>
					</div>
				</div>

				<div class="sb-divider" />

				<div class="sb-section">
					<div class="sb-heading">Phòng ban</div>
					<div class="sb-department-filter">
						<select
							v-model="selectedDepartmentId"
							class="sb-select glass"
							@change="
								page = 1;
								fetchCourses();
							"
						>
							<option :value="null">Tất cả phòng ban</option>
							<option
								v-for="dept in departments"
								:key="dept.id"
								:value="dept.id"
							>
								{{ dept.name }}
							</option>
						</select>
					</div>
				</div>

				<div class="sb-divider" />

				<div class="sb-section">
					<div class="sb-heading">Sắp xếp theo</div>
					<div class="sb-sort-list">
						<button
							v-for="s in sortOptions"
							:key="s.val"
							class="sb-sort-btn"
							:class="{ active: sortBy === s.val }"
							@click="
								sortBy = s.val;
								fetchCourses();
							"
						>
							<component :is="s.icon" :size="15" />
							{{ s.label }}
						</button>
					</div>
				</div>

				<button class="sb-reset-btn" @click="resetFilters">
					<span>Xóa bộ lọc</span>
				</button>
			</aside>

			<div class="content-area">
				<div class="content-toolbar">
					<div class="toolbar-info">
						<span class="result-count">{{ courses.length }} khóa học</span>
						<span class="result-sep">·</span>
						<span class="result-label">{{
							activeCategory
								? categories.find((c) => c.id === activeCategory)?.name
								: "Tất cả"
						}}</span>
					</div>
					<div class="view-toggle">
						<button
							class="vt-btn"
							:class="{ active: viewMode === 'grid' }"
							@click="viewMode = 'grid'"
						>
							<LayoutGrid :size="16" />
						</button>
						<button
							class="vt-btn"
							:class="{ active: viewMode === 'list' }"
							@click="viewMode = 'list'"
						>
							<LayoutList :size="16" />
						</button>
					</div>
				</div>

				<div
					v-if="loading"
					:class="viewMode === 'grid' ? 'courses-grid' : 'courses-list'"
				>
					<div
						v-for="i in 6"
						:key="i"
						class="course-card-skeleton animate-pulse"
					>
						<div class="skeleton-cover" />
						<div class="skeleton-body">
							<div class="line h-4 w-3/4" />
							<div class="line h-3 w-full mt-3" />
							<div class="line h-3 w-1/2 mt-2" />
						</div>
					</div>
				</div>

				<div
					v-else-if="courses.length && viewMode === 'grid'"
					class="courses-grid"
				>
					<div
						v-for="(course, index) in courses"
						:key="course.id"
						class="course-card glass-hover"
						:style="{ '--delay': (index % 6) * 0.08 + 's' }"
						@click="$router.push(`/courses/${course.id}`)"
					>
						<div class="card-cover-wrap">
							<div
								class="card-cover"
								:style="
									course.coverImageUrl
										? { backgroundImage: `url(${course.coverImageUrl})` }
										: { background: getCardGradient(index) }
								"
							/>
							<div class="card-cover-overlay">
								<span class="badge-glass dark"
									><Play :size="11" class="me-1" />
									{{ course.lessonCount || 0 }} bài</span
								>
								<span
									class="badge-level"
									:class="'level-' + (course.level || 3)"
								>
									{{ getLevelBadgeLabel(course.level) }}
								</span>
							</div>
							<div class="card-hover-info">
								<div v-if="isLocked(course)" class="lock-overlay">
									<Lock :size="32" class="mb-2" />
									<span>{{ getLockMessage(course) }}</span>
								</div>
								<button v-else class="btn-white btn-sm">Xem chi tiết</button>
							</div>
						</div>
						<div
							class="card-content"
							:class="{ 'is-locked': isLocked(course) }"
						>
							<h3 class="card-title">
								{{ course.title }}
							</h3>
							<p class="card-desc">
								{{ course.description || "Chưa có mô tả cho khóa học này." }}
							</p>
							<div class="card-footer">
								<div class="author-info">
									<div class="mini-avatar">
										{{ course.createdByName?.charAt(0) || "U" }}
									</div>
									<span>{{ course.createdByName || "Ẩn danh" }}</span>
								</div>
								<div class="stat-info">
									<Users :size="13" /><span>{{
										course.enrollmentCount || 0
									}}</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div
					v-else-if="courses.length && viewMode === 'list'"
					class="courses-list"
				>
					<div
						v-for="(course, index) in courses"
						:key="course.id"
						class="course-list-item glass-hover"
						:style="{ '--delay': index * 0.06 + 's' }"
						@click="$router.push(`/courses/${course.id}`)"
					>
						<div
							class="list-cover"
							:style="
								course.coverImageUrl
									? { backgroundImage: `url(${course.coverImageUrl})` }
									: { background: getCardGradient(index) }
							"
						/>
						<div class="list-body">
							<div class="list-meta-top d-flex gap-2">
								<span class="badge-glass dark list-lessons"
									><Play :size="10" class="me-1" />{{
										course.lessonCount || 0
									}}
									bài học</span
								>
								<span
									class="badge-level sm"
									:class="'level-' + (course.level || 3)"
								>
									{{ getLevelBadgeLabel(course.level) }}
								</span>
							</div>
							<h3
								class="list-title"
								:class="{ 'text-muted': isLocked(course) }"
							>
								<Lock v-if="isLocked(course)" :size="14" class="me-1" />
								{{ course.title }}
							</h3>
							<p class="list-desc">
								{{ course.description || "Chưa có mô tả cho khóa học này." }}
							</p>
							<div class="list-footer">
								<div class="author-info">
									<div class="mini-avatar">
										{{ course.createdByName?.charAt(0) || "U" }}
									</div>
									<span>{{ course.createdByName || "Ẩn danh" }}</span>
								</div>
								<div class="stat-info">
									<Users :size="13" /><span>{{
										course.enrollmentCount || 0
									}}</span>
								</div>
							</div>
						</div>
						<div class="list-action">
							<button class="list-go-btn">
								Xem <ChevronRight :size="15" />
							</button>
						</div>
					</div>
				</div>

				<div v-else class="empty-state-premium">
					<div class="empty-illustration">
						<SearchX :size="56" class="text-primary opacity-50" />
					</div>
					<h3 class="fw-bold mt-3 mb-2">Không tìm thấy kết quả</h3>
					<p class="text-secondary pb-3">
						Chúng tôi không tìm thấy khóa học nào phù hợp với yêu cầu.
					</p>
					<button class="sb-reset-btn" @click="resetFilters">Xóa bộ lọc</button>
				</div>

				<div v-if="totalPages > 1" class="pagination-wrap">
					<button
						class="page-btn glass-btn"
						:disabled="page <= 1"
						@click="changePage(page - 1)"
					>
						<ChevronLeft :size="18" />
					</button>
					<div class="page-numbers">
						<button
							v-for="p in totalPages"
							:key="p"
							class="num-btn glass-btn"
							:class="{ active: p === page }"
							@click="changePage(p)"
						>
							{{ p }}
						</button>
					</div>
					<button
						class="page-btn glass-btn"
						:disabled="page >= totalPages"
						@click="changePage(page + 1)"
					>
						<ChevronRight :size="18" />
					</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { courseAPI, enrollmentAPI, userGroupAPI } from "@/services/api";
import {
	Search,
	SearchX,
	ChevronLeft,
	ChevronRight,
	Play,
	Clock,
	LayoutGrid,
	LayoutList,
	Lock,
	TrendingUp,
	BookOpen,
	Users,
} from "lucide-vue-next";

const courses = ref([]);
const loading = ref(true);
const search = ref("");
const page = ref(1);
const totalPages = ref(1);
const sortBy = ref("newest");
const activeCategory = ref(null);
const selectedDepartmentId = ref(null);
const departments = ref([]);
const viewMode = ref("grid");

const completedCourseIds = ref([]);
const allLevel1Ids = ref([]);
const allLevel2Ids = ref([]);
const isLoggedIn = ref(!!localStorage.getItem("token"));

const categories = [
	{ id: null, name: "Tất cả" },
	{ id: 1, name: "Kỹ năng mềm" },
	{ id: 2, name: "Kỹ thuật" },
	{ id: 3, name: "Quy trình" },
	{ id: 4, name: "Lãnh đạo" },
	{ id: 5, name: "Số hóa" },
];

const heroStats = [
	{ val: "500+", label: "Học viên" },
	{ val: "24+", label: "Khóa học" },
	{ val: "98%", label: "Hài lòng" },
];
const catColors = {
	null: "#4f46e5",
	1: "#10b981",
	2: "#0ea5e9",
	3: "#f59e0b",
	4: "#4f46e5",
	5: "#a855f7",
};
const sortOptions = [
	{ val: "newest", label: "Mới nhất", icon: Clock },
	{ val: "popular", label: "Phổ biến nhất", icon: TrendingUp },
	{ val: "title", label: "Tên A-Z", icon: BookOpen },
];

const cardGradients = [
	"linear-gradient(135deg,#4f46e5,#818cf8)",
	"linear-gradient(135deg,#9333ea,#c084fc)",
	"linear-gradient(135deg,#0ea5e9,#38bdf8)",
	"linear-gradient(135deg,#10b981,#34d399)",
	"linear-gradient(135deg,#f59e0b,#fcd34d)",
	"linear-gradient(135deg,#ef4444,#fca5a5)",
];
const getCardGradient = (idx) => cardGradients[idx % cardGradients.length];

let debounceTimer = null;

import { useAuthStore } from "@/stores/auth";

const authStore = useAuthStore();

async function fetchCourses() {
	loading.value = true;
	try {
		const params = {
			page: page.value,
			pageSize: 12,
			search: search.value || undefined,
			categoryId: activeCategory.value || undefined,
			userGroupId: selectedDepartmentId.value || undefined,
			isPublished: true,
			level: 3,
		};

		const { data } = await courseAPI.getAll(params);
		courses.value = data.items;
		totalPages.value = Math.ceil(data.totalCount / 12);

		level1CourseCount.value = courses.value.filter((c) => c.level === 1).length;
	} catch {
	} finally {
		loading.value = false;
	}
}

async function fetchUserProgress() {
	if (!isLoggedIn.value) return;
	try {
		const { data: allCourses } = await courseAPI.getAll({
			pageSize: 1000,
			isPublished: true,
		});
		allLevel1Ids.value = allCourses.items
			.filter((c) => c.level === 1)
			.map((c) => c.id);

		allLevel2Ids.value = allCourses.items
			.filter((c) => c.level === 2)
			.map((c) => c.id);

		const { data: myEnrollments } = await enrollmentAPI.getMy();
		completedCourseIds.value = myEnrollments
			.filter(
				(e) =>
					e.status === "Completed" ||
					e.status === "Finished" ||
					e.progressPercent >= 100,
			)
			.map((e) => e.courseId);
	} catch {}
}

function getLevelBadgeLabel(level) {
	switch (level) {
		case 1:
			return "Bắt buộc";
		case 2:
			return "Phòng ban";
		case 3:
		default:
			return "Tự chọn";
	}
}

function isLocked(course) {
	if (authStore.isInstructor || authStore.isAdmin) return false;
	if (course.level === 1) return false;
	if (!isLoggedIn.value) return true;

	const level1Done =
		allLevel1Ids.value.length === 0 ||
		allLevel1Ids.value.every((id) => completedCourseIds.value.includes(id));
	const level2Done =
		allLevel2Ids.value.length === 0 ||
		allLevel2Ids.value.every((id) => completedCourseIds.value.includes(id));

	if (course.level === 2) return !level1Done;
	if (course.level === 3) return !level1Done || !level2Done;

	return false;
}

function getLockMessage(_course) {
	const level1Done =
		allLevel1Ids.value.length === 0 ||
		allLevel1Ids.value.every((id) => completedCourseIds.value.includes(id));
	if (!level1Done) return "Cần hoàn thành Cấp 1 để mở";
	return "Cần hoàn thành Cấp 2 để mở";
}

function debounceFetch() {
	clearTimeout(debounceTimer);
	debounceTimer = setTimeout(() => {
		page.value = 1;
		fetchCourses();
	}, 500);
}

function selectCategory(catId) {
	activeCategory.value = catId;
	page.value = 1;
	fetchCourses();
}

function changePage(p) {
	if (p < 1 || p > totalPages.value) return;
	page.value = p;
	window.scrollTo({ top: 400, behavior: "smooth" });
	fetchCourses();
}

async function fetchDepartments() {
	try {
		const { data } = await userGroupAPI.getAll({ pageSize: 1234 });
		departments.value = data.items;
	} catch {}
}

function resetFilters() {
	search.value = "";
	activeCategory.value = null;
	selectedDepartmentId.value = null;
	page.value = 1;
	fetchCourses();
}

onMounted(async () => {
	await Promise.all([fetchCourses(), fetchUserProgress(), fetchDepartments()]);
});
</script>

<style scoped>
.catalog-page {
	padding-bottom: 5rem;
	max-width: var(--content-max-width, 1400px);
	margin: 0 auto;
}

.glass {
	background: var(--bg-card);
	backdrop-filter: blur(16px);
	-webkit-backdrop-filter: blur(16px);
	border: 1px solid var(--border-color);
}

.badge-glass {
	padding: 3px 10px;
	border-radius: 20px;
	font-size: 10px;
	font-weight: 800;
	letter-spacing: 0.5px;
	display: inline-flex;
	align-items: center;
	border: 1px solid transparent;
}
.badge-glass.primary {
	background: rgba(99, 102, 241, 0.1);
	color: #4f46e5;
	border-color: rgba(99, 102, 241, 0.2);
}
.badge-glass.success {
	background: rgba(34, 197, 94, 0.15);
	color: #15803d;
	border-color: rgba(34, 197, 94, 0.3);
}
.badge-glass.warning {
	background: rgba(245, 158, 11, 0.15);
	color: #b45309;
	border-color: rgba(245, 158, 11, 0.3);
}
.badge-glass.danger {
	background: #ef4444;
	color: #ffffff;
	border-color: #dc2626;
	box-shadow: 0 0 10px rgba(239, 68, 68, 0.4);
	font-weight: 900;
	text-transform: uppercase;
}
.badge-glass.dark {
	background: rgba(0, 0, 0, 0.5);
	color: white;
	border-color: rgba(255, 255, 255, 0.2);
	backdrop-filter: blur(4px);
}

.hero-section {
	display: grid;
	grid-template-columns: 1fr 420px;
	gap: 2.5rem;
	margin-bottom: 2.5rem;
	align-items: center;
	position: relative;
	padding: 4rem 0 3rem;
}

.hero-left {
	position: relative;
	z-index: 1;
}

.hero-badge {
	margin-bottom: 1.25rem;
	padding: 5px 14px;
	font-size: 11px;
	letter-spacing: 1.5px;
	text-transform: uppercase;
	border-radius: 30px;
	display: inline-flex;
	align-items: center;
}

.hero-title {
	font-size: 3.8rem;
	font-weight: 900;
	line-height: 1.05;
	margin-bottom: 1.25rem;
	color: var(--text-primary);
	letter-spacing: -2px;
}
.hero-title .highlight {
	background: linear-gradient(90deg, #4f46e5, #a855f7);
	background-clip: text;
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
}

.hero-subtitle {
	font-size: 1rem;
	color: var(--text-secondary);
	line-height: 1.7;
	margin-bottom: 2rem;
	max-width: 480px;
}

.hero-stats {
	display: flex;
	gap: 2.5rem;
}
.hstat {
	display: flex;
	flex-direction: column;
	gap: 2px;
}
.hstat-val {
	font-size: 1.6rem;
	font-weight: 900;
	color: var(--text-primary);
	letter-spacing: -1px;
}
.hstat-lbl {
	font-size: 11px;
	font-weight: 600;
	color: var(--text-tertiary);
	text-transform: uppercase;
	letter-spacing: 1px;
}

.hero-decoration-1,
.hero-decoration-2 {
	position: absolute;
	width: 350px;
	height: 350px;
	border-radius: 50%;
	filter: blur(100px);
	z-index: 0;
	opacity: 0.12;
	pointer-events: none;
}
.hero-decoration-1 {
	top: -100px;
	left: -100px;
	background: #4f46e5;
}
.hero-decoration-2 {
	bottom: -100px;
	left: 200px;
	background: #a855f7;
}

.hero-right {
	position: relative;
	z-index: 2;
}

.search-panel {
	border-radius: 24px;
	padding: 2rem;
	box-shadow: 0 20px 50px rgba(79, 70, 229, 0.1);
	display: flex;
	flex-direction: column;
	gap: 1.25rem;
}

.search-panel-label {
	font-size: 13px;
	font-weight: 700;
	color: var(--text-tertiary);
	letter-spacing: 1px;
	text-transform: uppercase;
	margin: 0;
}

.hero-search-box {
	display: flex;
	align-items: center;
	padding: 6px 6px 6px 14px;
	border-radius: 16px;
	border: 1.5px solid var(--border-color);
	background: var(--bg-tertiary);
	transition: all 0.3s;
	gap: 8px;
}
.hero-search-box:focus-within {
	border-color: #4f46e5;
	box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.12);
}
.search-icon {
	color: var(--text-tertiary);
	flex-shrink: 0;
}
.hero-search-input {
	flex: 1;
	background: transparent;
	border: none;
	outline: none;
	color: var(--text-primary);
	font-size: 0.95rem;
	font-weight: 500;
}
.search-btn-neon {
	padding: 0.7rem 1.4rem;
	border-radius: 12px;
	font-weight: 800;
	font-size: 0.9rem;
	border: none;
	color: white;
	background: linear-gradient(135deg, #6366f1, #4f46e5);
	box-shadow: 0 4px 14px rgba(79, 70, 229, 0.35);
	transition: all 0.3s;
	cursor: pointer;
	white-space: nowrap;
}
.search-btn-neon:hover {
	transform: translateY(-2px);
	box-shadow: 0 8px 20px rgba(79, 70, 229, 0.4);
}

.trending-tags {
	display: flex;
	align-items: center;
	gap: 0.75rem;
	font-size: 0.88rem;
	flex-wrap: wrap;
}
.tag-label {
	color: var(--text-tertiary);
	font-weight: 600;
	flex-shrink: 0;
}
.tag-item {
	color: var(--text-secondary);
	cursor: pointer;
	font-weight: 600;
	transition: color 0.2s;
}
.tag-item:hover {
	color: #4f46e5;
}

.quick-cats {
	display: flex;
	gap: 8px;
	flex-wrap: wrap;
	padding-top: 0.25rem;
	border-top: 1px solid var(--border-color);
}
.quick-cat-btn {
	padding: 5px 14px;
	border-radius: 30px;
	border: 1.5px solid var(--border-color);
	background: var(--bg-tertiary);
	color: var(--text-secondary);
	font-size: 12px;
	font-weight: 700;
	cursor: pointer;
	transition: all 0.2s;
}
.quick-cat-btn:hover {
	border-color: #4f46e5;
	color: #4f46e5;
}
.quick-cat-btn.active {
	background: rgba(79, 70, 229, 0.08);
	border-color: #4f46e5;
	color: #4f46e5;
}

.main-layout {
	display: grid;
	grid-template-columns: 240px 1fr;
	gap: 2rem;
	align-items: start;
}

.sidebar {
	border-radius: 20px;
	padding: 1.5rem;
	position: sticky;
	top: 80px;
	display: flex;
	flex-direction: column;
	gap: 0;
}

.sb-section {
	padding: 0.75rem 0;
}
.sb-heading {
	font-size: 10px;
	font-weight: 800;
	letter-spacing: 2px;
	text-transform: uppercase;
	color: var(--text-tertiary);
	margin-bottom: 0.9rem;
}
.sb-divider {
	height: 1px;
	background: var(--border-color);
	margin: 0.25rem 0;
}

.sb-cat-list {
	display: flex;
	flex-direction: column;
	gap: 2px;
}
.sb-cat-btn {
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 9px 12px;
	border-radius: 12px;
	border: none;
	background: transparent;
	color: var(--text-secondary);
	font-size: 13px;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.2s;
	text-align: left;
	width: 100%;
}
.sb-cat-btn:hover {
	background: rgba(79, 70, 229, 0.05);
	color: #4f46e5;
}
.sb-cat-btn.active {
	background: rgba(79, 70, 229, 0.08);
	color: #4f46e5;
}
.sb-cat-dot {
	width: 8px;
	height: 8px;
	border-radius: 50%;
	flex-shrink: 0;
}
.sb-cat-arrow {
	margin-left: auto;
	color: var(--text-tertiary);
}
.sb-cat-btn.active .sb-cat-arrow {
	color: #4f46e5;
}

.sb-sort-list {
	display: flex;
	flex-direction: column;
	gap: 2px;
}
.sb-sort-btn {
	display: flex;
	align-items: center;
	gap: 9px;
	padding: 8px 12px;
	border-radius: 12px;
	border: none;
	background: transparent;
	color: var(--text-secondary);
	font-size: 13px;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.2s;
	width: 100%;
	text-align: left;
}
.sb-sort-btn:hover {
	background: rgba(79, 70, 229, 0.05);
	color: #4f46e5;
}
.sb-sort-btn.active {
	background: rgba(79, 70, 229, 0.08);
	color: #4f46e5;
}

.sb-level-list {
	display: flex;
	flex-direction: column;
	gap: 8px;
}
.sb-checkbox {
	display: flex;
	align-items: center;
	gap: 10px;
	font-size: 13px;
	font-weight: 600;
	color: var(--text-secondary);
	cursor: pointer;
}
.sb-checkbox input {
	display: none;
}
.sb-checkbox-box {
	width: 16px;
	height: 16px;
	border-radius: 5px;
	border: 2px solid var(--border-color);
	background: var(--bg-primary);
	flex-shrink: 0;
	transition: all 0.2s;
}
.sb-checkbox input:checked ~ .sb-checkbox-box {
	background: linear-gradient(135deg, #6366f1, #4f46e5);
	border-color: transparent;
}

.sb-reset-btn {
	margin-top: 1.25rem;
	padding: 10px;
	border-radius: 12px;
	border: 1.5px solid var(--border-color);
	background: transparent;
	color: var(--text-secondary);
	font-size: 13px;
	font-weight: 700;
	cursor: pointer;
	transition: all 0.2s;
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 6px;
}
.sb-reset-btn:hover {
	border-color: #ef4444;
	color: #ef4444;
	background: rgba(239, 68, 68, 0.04);
}

.content-area {
	min-width: 0;
}

.content-toolbar {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 1.5rem;
	padding: 0.75rem 1.25rem;
	background: var(--bg-card);
	border-radius: 14px;
	border: 1px solid var(--border-color);
	backdrop-filter: blur(10px);
}
.toolbar-info {
	display: flex;
	align-items: center;
	gap: 8px;
}
.result-count {
	font-size: 14px;
	font-weight: 800;
	color: var(--text-primary);
}
.result-sep {
	color: var(--text-tertiary);
}
.result-label {
	font-size: 13px;
	font-weight: 600;
	color: var(--text-secondary);
}
.view-toggle {
	display: flex;
	gap: 4px;
}
.vt-btn {
	width: 34px;
	height: 34px;
	border-radius: 10px;
	border: 1.5px solid var(--border-color);
	background: var(--bg-primary);
	color: var(--text-tertiary);
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	transition: all 0.2s;
}
.vt-btn:hover {
	border-color: #4f46e5;
	color: #4f46e5;
}
.vt-btn.active {
	background: rgba(79, 70, 229, 0.08);
	border-color: #4f46e5;
	color: #4f46e5;
}

.courses-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
	gap: 1.5rem;
	margin-bottom: 2.5rem;
}

.course-card.glass-hover {
	background: var(--bg-card);
	backdrop-filter: blur(12px);
	border: 1px solid var(--border-color);
	border-radius: 20px;
	display: flex;
	flex-direction: column;
	overflow: hidden;
	cursor: pointer;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
	animation: slideInUp 0.5s ease backwards;
	animation-delay: var(--delay);
}
.course-card.glass-hover:hover {
	transform: translateY(-7px);
	border-color: #818cf8;
	box-shadow: 0 20px 40px rgba(79, 70, 229, 0.13);
}

.card-cover-wrap {
	position: relative;
	height: 180px;
	overflow: hidden;
}
.card-cover {
	width: 100%;
	height: 100%;
	background-size: cover;
	background-position: center;
	transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}
.course-card:hover .card-cover {
	transform: scale(1.07);
}
.card-cover-overlay {
	position: absolute;
	inset: 0;
	background: linear-gradient(
		to top,
		rgba(15, 23, 42, 0.75) 0%,
		transparent 55%
	);
	display: flex;
	justify-content: space-between;
	align-items: flex-end;
	padding: 1rem;
	z-index: 2;
}
.card-hover-info {
	position: absolute;
	inset: 0;
	background: rgba(30, 41, 59, 0.38);
	backdrop-filter: blur(4px);
	display: flex;
	align-items: center;
	justify-content: center;
	opacity: 0;
	transition: opacity 0.3s;
	z-index: 3;
}
.course-card:hover .card-hover-info {
	opacity: 1;
}
.btn-white {
	background: var(--bg-primary);
	color: var(--text-primary);
	border: none;
	border-radius: 10px;
	padding: 0.55rem 1.1rem;
	font-weight: 700;
	font-size: 13px;
	cursor: pointer;
	transition: transform 0.2s;
}
.btn-white:hover {
	transform: scale(1.04);
}

.card-content {
	padding: 1.25rem;
	flex: 1;
	display: flex;
	flex-direction: column;
}
.card-title {
	font-size: 1.05rem;
	font-weight: 800;
	margin-bottom: 0.6rem;
	color: var(--text-primary);
	line-height: 1.4;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
}
.card-desc {
	font-size: 0.88rem;
	color: var(--text-secondary);
	line-height: 1.6;
	margin-bottom: 1.25rem;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
}
.card-footer {
	margin-top: auto;
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding-top: 1rem;
	border-top: 1px solid var(--border-color);
}
.author-info {
	display: flex;
	align-items: center;
	gap: 8px;
	font-size: 0.88rem;
	font-weight: 600;
	color: var(--text-primary);
}
.mini-avatar {
	width: 26px;
	height: 26px;
	border-radius: 50%;
	background: linear-gradient(135deg, #6366f1, #a855f7);
	display: flex;
	align-items: center;
	justify-content: center;
	color: white;
	font-weight: 800;
	font-size: 11px;
	flex-shrink: 0;
}
.stat-info {
	display: flex;
	align-items: center;
	gap: 5px;
	font-size: 0.88rem;
	font-weight: 600;
	color: var(--text-tertiary);
}

.courses-list {
	display: flex;
	flex-direction: column;
	gap: 12px;
	margin-bottom: 2.5rem;
}

.course-list-item {
	background: var(--bg-card);
	backdrop-filter: blur(12px);
	border: 1px solid var(--border-color);
	border-radius: 18px;
	display: flex;
	align-items: stretch;
	overflow: hidden;
	cursor: pointer;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	animation: slideInUp 0.5s ease backwards;
	animation-delay: var(--delay);
}
.course-list-item:hover {
	transform: translateX(4px);
	border-color: #818cf8;
	box-shadow: 0 8px 30px rgba(79, 70, 229, 0.1);
}
.list-cover {
	width: 140px;
	flex-shrink: 0;
	background-size: cover;
	background-position: center;
	position: relative;
}
.list-level-badge {
	position: absolute;
	bottom: 10px;
	left: 10px;
}
.list-body {
	flex: 1;
	padding: 1.1rem 1.25rem;
	display: flex;
	flex-direction: column;
	min-width: 0;
}
.list-meta-top {
	margin-bottom: 6px;
}
.list-lessons {
	font-size: 10px;
}
.list-title {
	font-size: 1rem;
	font-weight: 800;
	color: var(--text-primary);
	margin-bottom: 5px;
	line-height: 1.35;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}
.list-desc {
	font-size: 13px;
	color: var(--text-secondary);
	line-height: 1.55;
	margin-bottom: 0.75rem;
	display: -webkit-box;
	-webkit-line-clamp: 1;
	line-clamp: 1;
	-webkit-box-orient: vertical;
	overflow: hidden;
}
.list-footer {
	margin-top: auto;
	display: flex;
	align-items: center;
	gap: 1.5rem;
}
.list-action {
	padding: 0 1.25rem;
	display: flex;
	align-items: center;
}
.list-go-btn {
	padding: 8px 16px;
	border-radius: 12px;
	border: 1.5px solid var(--border-color);
	background: var(--bg-primary);
	color: var(--text-secondary);
	font-size: 13px;
	font-weight: 700;
	cursor: pointer;
	transition: all 0.2s;
	display: flex;
	align-items: center;
	gap: 4px;
	white-space: nowrap;
}
.list-go-btn:hover {
	border-color: #4f46e5;
	color: #4f46e5;
	background: rgba(79, 70, 229, 0.05);
}

.course-card-skeleton {
	border-radius: 20px;
	border: 1px solid var(--border-color);
	overflow: hidden;
	height: 360px;
	background: var(--bg-primary);
}
.skeleton-cover {
	height: 180px;
	background: linear-gradient(
		90deg,
		var(--bg-tertiary),
		var(--border-color),
		var(--bg-tertiary)
	);
	background-size: 200% 100%;
	animation: shimmer 2s infinite;
}
.skeleton-body {
	padding: 1.25rem;
}
.line {
	border-radius: 4px;
	background: var(--border-color);
}
.h-4 {
	height: 1rem;
}
.h-3 {
	height: 0.75rem;
}
.w-3\/4 {
	width: 75%;
}
.w-full {
	width: 100%;
}
.w-1\/2 {
	width: 50%;
}
.mt-2 {
	margin-top: 0.5rem;
}
.mt-3 {
	margin-top: 0.75rem;
}

.empty-state-premium {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	text-align: center;
	padding: 5rem 2rem;
	background: var(--bg-card);
	backdrop-filter: blur(12px);
	border-radius: 24px;
	border: 1px solid var(--border-color);
	box-shadow: 0 8px 30px rgba(0, 0, 0, 0.02);
}
.empty-illustration {
	width: 80px;
	height: 80px;
	border-radius: 50%;
	background: rgba(79, 70, 229, 0.04);
	border: 1px solid rgba(79, 70, 229, 0.1);
	display: flex;
	align-items: center;
	justify-content: center;
}
.text-primary {
	color: #4f46e5;
}
.opacity-50 {
	opacity: 0.5;
}
.fw-bold {
	font-weight: 800;
}
.text-secondary {
	color: var(--text-secondary);
}

.pagination-wrap {
	display: flex;
	justify-content: center;
	align-items: center;
	gap: 8px;
	margin-top: 3rem;
}
.page-numbers {
	display: flex;
	gap: 6px;
}
.glass-btn {
	min-width: 40px;
	height: 40px;
	padding: 0 12px;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 12px;
	border: 1.5px solid var(--border-color);
	background: var(--bg-card);
	color: var(--text-primary);
	font-weight: 700;
	font-size: 13px;
	transition: all 0.2s;
	cursor: pointer;
}
.glass-btn:hover:not(:disabled) {
	border-color: #4f46e5;
	color: #4f46e5;
	background: rgba(79, 70, 229, 0.05);
}
.glass-btn.active {
	background: linear-gradient(135deg, #6366f1, #4f46e5);
	border-color: transparent;
	color: white;
	box-shadow: 0 6px 14px rgba(79, 70, 229, 0.3);
}
.glass-btn:disabled {
	opacity: 0.35;
	cursor: not-allowed;
}

@keyframes slideInUp {
	from {
		opacity: 0;
		transform: translateY(20px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}
@keyframes shimmer {
	0% {
		background-position: -200% 0;
	}
	100% {
		background-position: 200% 0;
	}
}
@keyframes pulse {
	0%,
	100% {
		opacity: 1;
	}
	50% {
		opacity: 0.6;
	}
}
.animate-pulse {
	animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@media (max-width: 1100px) {
	.main-layout {
		grid-template-columns: 200px 1fr;
		gap: 1.5rem;
	}
}
@media (max-width: 900px) {
	.hero-section {
		grid-template-columns: 1fr;
		padding: 2.5rem 0 2rem;
	}
	.hero-right {
		max-width: 560px;
	}
	.hero-title {
		font-size: 3rem;
	}
	.main-layout {
		grid-template-columns: 1fr;
	}
	.sidebar {
		position: static;
	}
}
@media (max-width: 600px) {
	.hero-title {
		font-size: 2.4rem;
		letter-spacing: -1.5px;
	}
	.hero-stats {
		gap: 1.5rem;
	}
	.courses-grid {
		grid-template-columns: 1fr;
	}
	.list-cover {
		width: 100px;
	}
	.content-toolbar {
		flex-wrap: wrap;
		gap: 0.75rem;
	}
}

.badge-level {
	padding: 2px 8px;
	border-radius: 4px;
	font-size: 10px;
	font-weight: 800;
	text-transform: uppercase;
	letter-spacing: 0.5px;
	margin-left: auto;
}
.badge-level.sm {
	font-size: 9px;
	padding: 1px 6px;
	margin-left: 0;
}
.badge-level.level-1 {
	background: rgba(239, 68, 68, 0.1);
	color: #ef4444;
	border: 1px solid rgba(239, 68, 68, 0.2);
}
.badge-level.level-2 {
	background: rgba(34, 197, 94, 0.1);
	color: #22c55e;
	border: 1px solid rgba(34, 197, 94, 0.2);
}

.lock-overlay {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	color: white;
	text-align: center;
	gap: 4px;
	padding: 1rem;
	position: absolute;
	inset: 0;
	background: rgba(15, 23, 42, 0.6);
	backdrop-filter: blur(4px);
	z-index: 10;
}
.lock-overlay span {
	font-size: 11px;
	font-weight: 700;
	opacity: 0.9;
	line-height: 1.2;
}

.card-content.is-locked {
	opacity: 0.6;
	pointer-events: none;
}
.text-muted {
	color: var(--text-tertiary) !important;
}
.sb-select {
	width: 100%;
	padding: 10px 14px;
	border-radius: 12px;
	border: 1.5px solid var(--border-color);
	font-size: 13px;
	font-weight: 500;
	color: var(--text-primary);
	cursor: pointer;
	transition: all 0.2s;
	appearance: none;
	background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
	background-repeat: no-repeat;
	background-position: right 12px center;
	padding-right: 40px;
}

.sb-select:focus {
	border-color: #4f46e5;
	box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
	outline: none;
}

.sb-select option {
	background: var(--bg-secondary);
	color: var(--text-primary);
}
</style>
