<template>
	<div class="my-courses-page">
		<div class="page-header-premium mb-5">
			<div class="header-inner position-relative">
				<div class="header-icon-box pulse-glow me-3">
					<GraduationCap :size="32" class="animated-icon text-primary" />
				</div>
				<div>
					<h1 class="page-title">
						<span class="title-gradient">Khóa học của tôi</span>
					</h1>
					<p class="page-subtitle text-secondary fw-medium mb-0 mt-1">
						Tiếp tục hành trình chinh phục tri thức của bạn.
					</p>
				</div>
			</div>
		</div>

		<div class="stats-overview">
			<div
				v-for="stat in stats"
				:key="stat.label"
				class="stat-card glass-hover"
			>
				<div
					class="stat-icon-premium"
					:style="{
						background: stat.bg,
						color: stat.color,
						borderColor: stat.bg,
					}"
				>
					<component :is="stat.icon" :size="24" />
				</div>
				<div class="stat-info">
					<div class="stat-value">
						{{ stat.value }}
					</div>
					<div class="stat-label fw-bold">
						{{ stat.label }}
					</div>
				</div>
			</div>
		</div>

		<div v-if="featuredEnrollment" class="featured-section animate-slide-up">
			<div class="section-header">
				<h2 class="section-title fw-900">Tiếp tục học</h2>
			</div>
			<div
				class="featured-card glass transition-all"
				@click="$router.push(`/courses/${featuredEnrollment.courseId}`)"
			>
				<div
					class="featured-image"
					:style="
						featuredEnrollment.coverImageUrl
							? {
									backgroundImage: `url(${getFullMediaUrl(featuredEnrollment.coverImageUrl)})`,
								}
							: { background: 'var(--gradient-card)' }
					"
				>
					<div class="featured-overlay">
						<span class="badge-glass primary fw-bold shadow-sm">
							<Play :size="12" class="me-1" /> Đang học dở
						</span>
					</div>
				</div>
				<div class="featured-body">
					<div class="featured-meta">
						<span
							class="badge-glass"
							:class="
								(featuredEnrollment.courseLevel || featuredEnrollment.level) ===
								3
									? 'primary'
									: featuredEnrollment.isMandatory
										? 'danger'
										: 'primary'
							"
						>
							{{
								(featuredEnrollment.courseLevel || featuredEnrollment.level) ===
								3
									? "Tự chọn"
									: featuredEnrollment.isMandatory
										? "Bắt buộc"
										: "Tự chọn"
							}}
						</span>
					</div>
					<h3 class="featured-title title-gradient">
						{{ featuredEnrollment.courseTitle }}
					</h3>

					<div class="featured-progress-wrap">
						<div class="progress-info fw-bold">
							<span class="text-primary"
								>Đã hoàn thành
								{{ Math.round(featuredEnrollment.progressPercent || 0) }}%</span
							>
							<span class="progress-fraction"
								>{{ featuredEnrollment.completedLessons || 0 }}/{{
									featuredEnrollment.totalLessons || 0
								}}
								bài học</span
							>
						</div>
						<div class="progress-bar-glass">
							<div
								class="progress-fill-glow"
								:style="{
									width: (featuredEnrollment.progressPercent || 0) + '%',
								}"
							/>
						</div>
					</div>

					<button class="btn-neon mt-3">
						Tiếp tục ngay <ArrowRight :size="18" class="ms-1" />
					</button>
				</div>
			</div>
		</div>

		<div
			class="main-list-section animate-slide-up"
			style="animation-delay: 0.1s"
		>
			<div class="section-header">
				<h2 class="section-title fw-900">Tất cả khóa học</h2>
				<div class="filter-toolbar glass shadow-sm">
					<div class="filter-pills-wrapper">
						<div class="active-pill-bg" :style="activePillStyle" />
						<button
							v-for="(f, index) in filters"
							:key="f.id"
							ref="filterButtons"
							class="pill-btn"
							:class="{ active: activeFilter === f.id }"
							@click="setActiveFilter(f.id, index)"
						>
							{{ f.label }}
						</button>
					</div>
				</div>
			</div>

			<div v-if="loading" class="list-wrapper">
				<div
					v-for="i in 3"
					:key="i"
					class="skeleton-item glass animate-pulse"
				/>
			</div>

			<div v-else-if="filteredEnrollments.length" class="list-wrapper">
				<div
					v-for="(e, index) in filteredEnrollments"
					:key="e.id"
					class="enrollment-row glass-hover shadow-sm"
					:class="{ 'is-locked': e.isLocked }"
					:style="{ '--delay': index * 0.05 + 's' }"
					@click="e.isLocked ? null : $router.push(`/courses/${e.courseId}`)"
				>
					<div v-if="e.isLocked" class="lock-overlay">
						<span class="lock-message">
							<Lock :size="14" class="me-1" /> {{ e.lockReason }}
						</span>
					</div>
					<div class="row-icon">
						<div
							class="icon-box-soft"
							:class="{
								'is-completed': Math.round(e.progressPercent) >= 100,
								'is-locked-icon': e.isLocked,
							}"
						>
							<Lock v-if="e.isLocked" :size="22" />
							<CheckCircle
								v-else-if="Math.round(e.progressPercent) >= 100"
								:size="22"
							/>
							<BookMarked v-else :size="22" />
						</div>
					</div>
					<div class="row-main">
						<h4 class="course-name">
							{{ e.courseTitle }}
						</h4>
						<div class="course-meta-small">
							<span
								:class="
									(e.courseLevel || e.level) === 3
										? 'primary'
										: e.isMandatory
											? 'danger'
											: 'primary'
								"
								>{{
									(e.courseLevel || e.level) === 3
										? "Tự chọn"
										: e.isMandatory
											? "Bắt buộc"
											: "Tự chọn"
								}}</span
							>
							<span
								v-if="(e.courseLevel || e.level) === 1"
								class="badge-glass warning"
								>Cấp 1: Người mới</span
							>
							<span
								v-else-if="(e.courseLevel || e.level) === 2"
								class="badge-glass indigo"
								>Cấp 2: Chuyên ngành</span
							>
							<span
								v-else-if="(e.courseLevel || e.level) === 3"
								class="badge-glass success"
								>Cấp 3: Tự chọn</span
							>
							<span v-if="e.deadline" class="deadline-text fw-bold"
								>Hạn chót:
								{{ new Date(e.deadline).toLocaleDateString("vi-VN") }}</span
							>
						</div>
					</div>
					<div v-if="e.status !== 'Pending'" class="row-progress">
						<div class="progress-group">
							<span
								class="percent-label"
								:class="{
									'text-success': Math.round(e.progressPercent) >= 100,
								}"
								>{{ Math.round(e.progressPercent || 0) }}%</span
							>
							<div class="progress-mini">
								<div
									class="progress-mini-fill"
									:style="{ width: (e.progressPercent || 0) + '%' }"
									:class="{
										'bg-success': Math.round(e.progressPercent) >= 100,
									}"
								/>
							</div>
						</div>
					</div>
					<div class="row-action">
						<button class="btn-icon-soft" :disabled="e.isLocked">
							<Lock v-if="e.isLocked" :size="18" />
							<ChevronRight v-else :size="20" />
						</button>
					</div>
				</div>
			</div>

			<div v-else class="empty-state-premium glass animate-slide-up">
				<div class="empty-glow shadow-sm">
					<GraduationCap :size="56" class="text-primary" />
				</div>
				<h3 class="fw-900">Chưa có dữ liệu</h3>
				<p class="text-secondary mb-4">
					Không tìm thấy khóa học nào trong danh mục này.
				</p>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import { getFullMediaUrl } from "@/utils/media";
import { enrollmentAPI } from "@/services/api";
import {
	GraduationCap,
	CheckCircle,
	ArrowRight,
	ChevronRight,
	BookOpen,
	Award,
	BarChart3,
	Play,
	BookMarked,
	Lock,
} from "lucide-vue-next";

const enrollments = ref([]);
const loading = ref(true);
const activeFilter = ref("learning");
const activeFilterIndex = ref(0);
const filterButtons = ref([]);
const activePillStyle = ref({ width: "0px", transform: "translate(0px, 0px)" });

const filters = [
	{ id: "learning", label: "Đang học" },
	{ id: "all", label: "Tất cả" },
	{ id: "completed", label: "Đã hoàn thành" },
	{ id: "mandatory", label: "Bắt buộc" },
];

const stats = computed(() => [
	{
		label: "Tổng khóa học",
		value: enrollments.value.length,
		icon: BookOpen,
		bg: "rgba(var(--primary-rgb), 0.1)",
		color: "var(--primary-600)",
	},
	{
		label: "Đang học",
		value: enrollments.value.filter(
			(e) => Math.round(e.progressPercent) < 100 && e.status !== "Pending",
		).length,
		icon: BarChart3,
		bg: "rgba(14, 165, 233, 0.1)",
		color: "#0ea5e9",
	},
	{
		label: "Hoàn thành",
		value: enrollments.value.filter((e) => Math.round(e.progressPercent) >= 100)
			.length,
		icon: CheckCircle,
		bg: "rgba(34, 197, 94, 0.1)",
		color: "#16a34a",
	},
	{
		label: "Chứng chỉ",
		value: enrollments.value.filter((e) => Math.round(e.progressPercent) >= 100)
			.length,
		icon: Award,
		bg: "rgba(168, 85, 247, 0.1)",
		color: "#9333ea",
	},
]);

const featuredEnrollment = computed(() => {
	return (
		enrollments.value.find(
			(e) =>
				e.status === "Approved" &&
				Math.round(e.progressPercent) > 0 &&
				Math.round(e.progressPercent) < 100,
		) || null
	);
});

const level1Completed = computed(() => {
	const level1Enrollments = enrollments.value.filter(
		(e) => (e.courseLevel || e.level) === 1,
	);
	if (level1Enrollments.length === 0) return true;
	return level1Enrollments.every((e) => Math.round(e.progressPercent) >= 100);
});

const level2Completed = computed(() => {
	if (!level1Completed.value) return false;
	const level2Enrollments = enrollments.value.filter(
		(e) => (e.courseLevel || e.level) === 2,
	);
	if (level2Enrollments.length === 0) return true;
	return level2Enrollments.every((e) => Math.round(e.progressPercent) >= 100);
});

const filteredEnrollments = computed(() => {
	let list = enrollments.value;

	if (activeFilter.value === "learning")
		list = list.filter((e) => Math.round(e.progressPercent) < 100);
	else if (activeFilter.value === "completed")
		list = list.filter((e) => Math.round(e.progressPercent) >= 100);
	else if (activeFilter.value === "mandatory")
		list = list.filter((e) => e.isMandatory);

	const mappedList = list.map((e) => {
		let isLocked = false;
		let lockReason = "";
		const currentLevel = e.courseLevel || e.level;

		if (currentLevel === 2 && !level1Completed.value) {
			isLocked = true;
			lockReason = "Hoàn thành tất cả khóa học Cấp 1 để mở khóa";
		} else if (currentLevel === 3 && !level2Completed.value) {
			isLocked = true;
			lockReason = "Hoàn thành tất cả khóa học Cấp 2 để mở khóa";
		}

		return { ...e, isLocked, lockReason };
	});

	return mappedList.sort((a, b) => {
		const levelA = a.courseLevel || a.level || 0;
		const levelB = b.courseLevel || b.level || 0;
		return levelA - levelB;
	});
});

function setActiveFilter(id, index) {
	activeFilter.value = id;
	activeFilterIndex.value = index;
	updateActivePillPosition();
}

function updateActivePillPosition() {
	if (filterButtons.value && filterButtons.value[activeFilterIndex.value]) {
		const activeBtn = filterButtons.value[activeFilterIndex.value];
		activePillStyle.value = {
			width: `${activeBtn.offsetWidth}px`,
			height: `${activeBtn.offsetHeight}px`,
			transform: `translate(${activeBtn.offsetLeft}px, ${activeBtn.offsetTop}px)`,
		};
	}
}

onMounted(async () => {
	window.addEventListener("resize", updateActivePillPosition);
	try {
		const { data } = await enrollmentAPI.getMy();
		enrollments.value = data.filter(
			(e) => e.status === "Approved" || e.status === "Completed",
		);
		setTimeout(updateActivePillPosition, 100);
	} catch {
	} finally {
		loading.value = false;
	}
});

onUnmounted(() => {
	window.removeEventListener("resize", updateActivePillPosition);
});
</script>

<style scoped>
.my-courses-page {
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

.glass-hover {
	background: var(--bg-card);
	backdrop-filter: blur(12px);
	border: 1px solid var(--border-color);
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.glass-hover:hover {
	background: var(--bg-card-hover);
	transform: translateY(-4px);
	border-color: var(--primary);
	box-shadow: var(--shadow-lg);
}

.badge-glass {
	padding: 5px 14px;
	border-radius: 20px;
	font-size: 11.5px;
	font-weight: 800;
	letter-spacing: 0.5px;
	display: inline-flex;
	align-items: center;
	border: 1px solid transparent;
}
.badge-glass.primary {
	background: rgba(99, 102, 241, 0.9);
	color: #ffffff;
	border-color: rgba(255, 255, 255, 0.2);
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.badge-glass.success {
	background: rgba(34, 197, 94, 0.15);
	color: var(--success-400);
	border-color: rgba(34, 197, 94, 0.3);
}
.badge-glass.warning {
	background: rgba(245, 158, 11, 0.15);
	color: var(--warning-400);
	border-color: rgba(245, 158, 11, 0.3);
}
.badge-glass.danger {
	background: #ef4444;
	color: #fff;
	border-color: #dc2626;
	box-shadow: 0 2px 10px rgba(239, 68, 68, 0.4);
	font-weight: 900;
	text-transform: uppercase;
	font-size: 10px;
}

.page-header-premium {
	padding: 1rem 0;
	position: relative;
}
.header-inner {
	display: flex;
	align-items: center;
}
.header-icon-box {
	width: 64px;
	height: 64px;
	border-radius: 20px;
	background: rgba(79, 70, 229, 0.1);
	color: var(--primary);
	display: flex;
	align-items: center;
	justify-content: center;
	border: 1px solid rgba(79, 70, 229, 0.2);
}
.pulse-glow {
	animation: pulse 3s infinite;
}
.title-gradient {
	font-size: 2.8rem;
	font-weight: 900;
	background: linear-gradient(90deg, var(--primary-700), var(--primary-500));
	background-clip: text;
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
}

.header-decoration-bg {
	position: absolute;
	width: 200px;
	height: 200px;
	right: 0;
	top: -50px;
	background: radial-gradient(
		circle,
		rgba(99, 102, 241, 0.1) 0%,
		transparent 70%
	);
	z-index: -1;
	pointer-events: none;
}

.stats-overview {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
	gap: 1.5rem;
	margin-bottom: 3.5rem;
}
.stat-card {
	padding: 1.5rem;
	background: var(--bg-card);
	border: 1px solid var(--border-color);
	border-radius: 24px;
	display: flex;
	align-items: center;
	gap: 1.25rem;
}
.stat-icon-premium {
	width: 56px;
	height: 56px;
	border-radius: 18px;
	display: flex;
	align-items: center;
	justify-content: center;
	border-width: 1px;
	border-style: solid;
}
.stat-value {
	font-size: 2rem;
	font-weight: 900;
	line-height: 1;
	margin-bottom: 4px;
	color: var(--text-primary);
}
.stat-label {
	font-size: 0.9rem;
	color: var(--text-secondary);
	letter-spacing: 0.5px;
}

.featured-section {
	margin-bottom: 4rem;
}
.section-header {
	margin-bottom: 1.5rem;
	display: flex;
	align-items: center;
	justify-content: space-between;
}
.section-title {
	font-size: 1.5rem;
	letter-spacing: -0.5px;
	margin: 0;
	color: var(--text-primary);
}

.featured-card {
	display: grid;
	grid-template-columns: 380px 1fr;
	border-radius: 28px;
	overflow: hidden;
	background: var(--bg-card);
	border: 1px solid var(--border-color);
	box-shadow: var(--shadow-md);
	cursor: pointer;
}
.featured-card:hover {
	border-color: var(--primary);
	box-shadow: var(--shadow-lg);
}

.featured-image {
	height: 100%;
	min-height: 250px;
	background-size: cover;
	background-position: center;
	position: relative;
}
.featured-overlay {
	position: absolute;
	inset: 0;
	background: linear-gradient(135deg, rgba(30, 41, 59, 0.4), transparent);
	padding: 1.5rem;
}

.featured-body {
	padding: 3rem;
	display: flex;
	flex-direction: column;
	justify-content: center;
	background: transparent;
}
.featured-meta {
	display: flex;
	align-items: center;
	gap: 1rem;
	margin-bottom: 1rem;
}
.update-time {
	font-size: 0.9rem;
	color: #64748b;
	display: flex;
	align-items: center;
	gap: 6px;
	font-weight: 500;
}

.featured-title {
	font-size: 1.8rem;
	font-weight: 800;
	margin-bottom: 2rem;
	line-height: 1.3;
	color: var(--text-primary);
}

.featured-progress-wrap {
	margin-bottom: 2rem;
}
.progress-info {
	display: flex;
	justify-content: space-between;
	font-size: 0.95rem;
	margin-bottom: 0.8rem;
}
.progress-bar-glass {
	height: 12px;
	background: rgba(79, 70, 229, 0.1);
	border-radius: 20px;
	overflow: hidden;
	border: 1px solid var(--border-color);
}
.progress-fill-glow {
	height: 100%;
	background: var(--gradient-primary);
	border-radius: 20px;
}

.btn-neon {
	align-self: flex-start;
	padding: 0.8rem 2rem;
	border-radius: 16px;
	font-weight: 700;
	font-size: 1rem;
	border: none;
	color: white;
	background: var(--gradient-primary);
	box-shadow: var(--shadow-glow);
	display: flex;
	align-items: center;
	transition: all 0.3s;
}
.btn-neon:hover {
	transform: translateY(-2px);
	box-shadow: 0 8px 25px rgba(79, 70, 229, 0.4);
}

.btn-neon.outline {
	background: transparent;
	color: #4f46e5;
	border: 2px solid #4f46e5;
	box-shadow: none;
}
.btn-neon.outline:hover {
	background: rgba(79, 70, 229, 0.1);
}

.filter-toolbar {
	padding: 0.4rem;
	border-radius: 30px;
	background: var(--bg-card);
	border: 1px solid var(--border-color);
}
.filter-pills-wrapper {
	display: inline-flex;
	position: relative;
	border-radius: 20px;
}
.active-pill-bg {
	position: absolute;
	top: 0;
	left: 0;
	background: var(--gradient-primary);
	border-radius: 20px;
	transition:
		transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
		width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
	z-index: 1;
}
.pill-btn {
	padding: 0.6rem 1.25rem;
	border-radius: 20px;
	font-size: 0.95rem;
	font-weight: 600;
	border: none;
	background: transparent;
	color: var(--text-secondary);
	cursor: pointer;
	position: relative;
	z-index: 2;
	transition: color 0.3s ease;
	white-space: nowrap;
}
.pill-btn:hover:not(.active) {
	color: var(--primary-600);
}
.pill-btn.active {
	color: white;
}

.list-wrapper {
	display: flex;
	flex-direction: column;
	gap: 1.25rem;
}

.enrollment-row {
	background: var(--bg-card);
	border: 1px solid var(--border-color);
	display: flex;
	align-items: center;
	padding: 1.25rem 1.75rem;
	border-radius: 20px;
	gap: 1.5rem;
	cursor: pointer;
	animation: slideInUp 0.5s ease backwards var(--delay);
}
.enrollment-row:hover {
	background: var(--bg-card-hover);
	border-color: var(--primary);
	transform: translateX(4px);
}

.enrollment-row.is-locked {
	position: relative;
	cursor: not-allowed;
	opacity: 0.7;
	filter: grayscale(0.5);
	background: rgba(var(--bg-card-rgb), 0.5);
}
.enrollment-row.is-locked .badge-glass.danger {
	opacity: 1 !important;
	filter: grayscale(0) !important;
	transform: scale(1.05);
	box-shadow: 0 0 15px rgba(239, 68, 68, 0.6);
}
.enrollment-row.is-locked:hover {
	transform: none;
	border-color: var(--border-color);
}

.lock-overlay {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.03);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 10;
	border-radius: 20px;
}
.lock-message {
	background: var(--bg-card);
	padding: 6px 14px;
	border-radius: 30px;
	font-size: 11px;
	font-weight: 700;
	color: var(--text-tertiary);
	border: 1px solid var(--border-color);
	box-shadow: var(--shadow-sm);
	display: flex;
	align-items: center;
}

.icon-box-soft {
	width: 52px;
	height: 52px;
	border-radius: 16px;
	background: linear-gradient(
		135deg,
		rgba(79, 70, 229, 0.1),
		rgba(79, 70, 229, 0.05)
	);
	border: 1px solid rgba(79, 70, 229, 0.15);
	display: flex;
	align-items: center;
	justify-content: center;
	color: var(--primary-500);
}
.icon-box-soft.is-completed {
	background: linear-gradient(
		135deg,
		rgba(34, 197, 94, 0.15),
		rgba(34, 197, 94, 0.05)
	);
	border-color: rgba(34, 197, 94, 0.2);
	color: #16a34a;
}
.icon-box-soft.is-locked-icon {
	background: var(--bg-secondary);
	border-color: var(--border-color);
	color: var(--text-tertiary);
}

.row-main {
	flex: 1;
	min-width: 0;
}
.course-name {
	font-weight: 800;
	font-size: 1.15rem;
	margin-bottom: 0.5rem;
	color: var(--text-primary);
}
.course-meta-small {
	display: flex;
	align-items: center;
	gap: 1rem;
}
.deadline-text {
	font-size: 0.85rem;
	color: #64748b;
}

.row-progress {
	width: 160px;
}
.progress-group {
	text-align: right;
}
.percent-label {
	font-size: 1rem;
	font-weight: 800;
	color: var(--text-primary);
}
.progress-mini {
	height: 8px;
	background: rgba(79, 70, 229, 0.1);
	border-radius: 4px;
	margin-top: 6px;
	overflow: hidden;
}
.progress-mini-fill {
	height: 100%;
	background: var(--gradient-primary);
	border-radius: 4px;
}
.progress-mini-fill.bg-success {
	background: linear-gradient(90deg, #22c55e, #16a34a);
}

.btn-icon-soft {
	width: 40px;
	height: 40px;
	border-radius: 12px;
	border: none;
	background: var(--bg-tertiary);
	color: var(--text-secondary);
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.2s;
}
.enrollment-row:hover .btn-icon-soft {
	background: var(--primary-600);
	color: white;
	transform: translateX(5px);
}

.empty-state-premium {
	padding: 6rem 2rem;
	text-align: center;
	border-radius: 28px;
	border: 1px solid var(--border-color);
	display: flex;
	flex-direction: column;
	align-items: center;
}
.empty-state-premium .btn-neon {
	align-self: center;
}
.empty-glow {
	width: 100px;
	height: 100px;
	border-radius: 50%;
	background: var(--bg-card);
	border: 1px solid var(--border-color);
	display: flex;
	align-items: center;
	justify-content: center;
	margin: 0 auto 1.5rem;
}

.skeleton-item {
	height: 90px;
	border-radius: 20px;
	border: 1px solid var(--border-color);
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
@keyframes pulse {
	0% {
		box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.4);
	}
	70% {
		box-shadow: 0 0 0 10px rgba(79, 70, 229, 0);
	}
	100% {
		box-shadow: 0 0 0 0 rgba(79, 70, 229, 0);
	}
}
.animate-slide-up {
	animation: slideInUp 0.6s ease backwards;
}
.animate-pulse {
	animation: pulse_op 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
@keyframes pulse_op {
	0%,
	100% {
		opacity: 1;
	}
	50% {
		opacity: 0.6;
	}
}

@media (max-width: 1024px) {
	.featured-card {
		grid-template-columns: 1fr;
	}
	.featured-image {
		height: 220px;
	}
	.section-header {
		flex-direction: column;
		align-items: flex-start;
		gap: 1rem;
	}
}

@media (max-width: 768px) {
	.my-courses-page {
		padding: 0;
	}
	.title-gradient {
		font-size: 2rem;
	}
	.stats-overview {
		grid-template-columns: 1fr 1fr;
		gap: 12px;
	}
	.stat-card {
		padding: 16px;
		gap: 12px;
		flex-direction: column;
		align-items: flex-start;
	}
	.featured-body {
		padding: 20px;
	}
	.featured-meta {
		flex-wrap: wrap;
	}
	.featured-title {
		font-size: 1.4rem;
	}
	.progress-info {
		flex-direction: column;
		gap: 6px;
	}
	.btn-neon {
		width: 100%;
		justify-content: center;
	}
	.filter-toolbar {
		width: 100%;
		border-radius: 16px;
	}
	.filter-pills-wrapper {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		justify-content: center;
		width: 100%;
	}
	.pill-btn {
		font-size: 12.5px;
		padding: 8px 12px;
	}
	.enrollment-row {
		padding: 16px;
		gap: 16px;
	}
	.course-meta-small {
		flex-wrap: wrap;
		gap: 8px;
	}
	.enrollment-row {
		flex-wrap: wrap;
		position: relative;
	}
	.row-main {
		flex: 1;
		min-width: 0;
	}
	.row-progress {
		display: block;
		width: 100%;
		margin-top: 8px;
		padding-top: 12px;
		border-top: 1px dashed var(--border-color);
	}
	.progress-group {
		text-align: left;
		display: flex;
		align-items: center;
		gap: 16px;
	}
	.progress-mini {
		flex: 1;
		margin-top: 0;
	}
	.row-action {
		display: none;
	}
}
</style>
