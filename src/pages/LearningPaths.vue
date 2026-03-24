<template>
	<div class="learning-paths-page">
		<div class="container py-5 mt-4">
			<div class="page-header mb-5 animate-slide-up">
				<div class="d-flex align-items-center gap-4">
					<div class="header-icon-box pulse-glow">
						<Route :size="32" class="text-primary" />
					</div>
					<div>
						<div class="badge-glass primary fw-bold mb-2">CAREER GROWTH</div>
						<h1 class="page-title title-gradient">Lộ Trình Học Tập</h1>
						<p class="page-desc">
							Chương trình đào tạo được thiết kế bài bản giúp bạn chinh phục các
							kỹ năng chuyên môn.
						</p>
					</div>
				</div>
			</div>

			<div class="row g-4 mb-5 animate-slide-up" style="animation-delay: 0.1s">
				<div class="col-md-3">
					<div class="glass-stat-card primary">
						<div class="stat-icon">
							<Layers :size="24" />
						</div>
						<div class="stat-content">
							<div class="stat-label">TỔNG LỘ TRÌNH</div>
							<div class="stat-value">
								{{ learningPaths.length }}
							</div>
						</div>
					</div>
				</div>
				<div class="col-md-3">
					<div class="glass-stat-card info">
						<div class="stat-icon">
							<BookOpen :size="24" />
						</div>
						<div class="stat-content">
							<div class="stat-label">KHÓA HỌC TRONG LỘ TRÌNH</div>
							<div class="stat-value">
								{{ totalCoursesInPaths }}
							</div>
						</div>
					</div>
				</div>
				<div class="col-md-3">
					<div class="glass-stat-card success">
						<div class="stat-icon">
							<Award :size="24" />
						</div>
						<div class="stat-content">
							<div class="stat-label">CHỨNG CHỈ ĐANG CHỜ</div>
							<div class="stat-value">
								{{ totalPendingCertificates }}
							</div>
						</div>
					</div>
				</div>
				<div class="col-md-3">
					<div class="glass-stat-card secondary">
						<div class="stat-icon">
							<Zap :size="24" />
						</div>
						<div class="stat-content">
							<div class="stat-label">TIẾN ĐỘ (TRUNG BÌNH)</div>
							<div class="stat-value">{{ Math.round(overallProgress) }}%</div>
						</div>
					</div>
				</div>
			</div>

			<div v-if="loading" class="loading-wrap text-center py-5">
				<div class="premium-spinner mx-auto" />
				<p class="mt-3 text-muted fw-bold">Đang tải lộ trình của bạn...</p>
			</div>

			<div
				v-else-if="learningPaths.length === 0"
				class="empty-state text-center py-5 glass animate-slide-up"
			>
				<div class="empty-icon mb-4">
					<Route :size="64" class="opacity-20" />
				</div>
				<h3 class="fw-bold">Chưa có lộ trình nào được gán</h3>
				<p class="text-muted">
					Bộ phận nhân sự sẽ cập nhật lộ trình học tập cho bạn sớm thôi!
				</p>
				<button class="btn-neon mt-3" @click="$router.push('/courses')">
					KHÁM PHÁ THƯ VIỆN
				</button>
			</div>

			<div v-else class="paths-grid row g-4">
				<div
					v-for="(path, index) in learningPaths"
					:key="path.id"
					class="col-lg-6 col-xl-4 animate-slide-up"
					:style="{ animationDelay: 0.2 + index * 0.1 + 's' }"
				>
					<div class="path-card glass" @click="viewPathDetail(path.id)">
						<div class="path-card-header">
							<div class="path-icon-wrap">
								<div class="path-icon">
									<Route :size="24" />
								</div>
							</div>
							<div
								class="path-badge"
								:class="index % 2 === 0 ? 'primary' : 'info'"
							>
								LỘ TRÌNH {{ index + 1 }}
							</div>
						</div>

						<div class="path-card-body p-4">
							<h3 class="path-title mb-2">
								{{ path.name }}
							</h3>
							<p class="path-desc text-truncate-2">
								{{
									path.description ||
									"Chương trình đào tạo chuyên sâu dành cho nhân sự tiềm năng."
								}}
							</p>

							<div class="path-meta mt-4 py-3 border-top border-bottom">
								<div
									class="d-flex justify-content-between align-items-center mb-3"
								>
									<span class="meta-label">
										<BookOpen :size="14" class="me-1" />
										<strong>{{ path.courseCount || 0 }}</strong> Khóa học
									</span>
									<span class="meta-label">
										<Clock :size="14" class="me-1" />
										~{{ path.totalHours || 0 }} Giờ học
									</span>
								</div>

								<div class="path-progress-wrap">
									<div
										class="d-flex justify-content-between fs-12 fw-bold mb-2"
									>
										<span class="text-muted text-uppercase tracking-wider"
											>TIẾN ĐỘ HOÀN THÀNH</span
										>
										<span class="text-primary"
											>{{ getPathProgress(path) }}%</span
										>
									</div>
									<div class="premium-progress-bar">
										<div
											class="progress-fill"
											:style="{ width: getPathProgress(path) + '%' }"
										/>
									</div>
								</div>
							</div>

							<div
								class="path-card-footer mt-4 d-flex align-items-center justify-content-between"
							>
								<div class="avatars-group d-flex">
									<div
										v-for="i in 3"
										:key="i"
										class="mini-avatar"
										:style="{
											zIndex: 4 - i,
											transform: `translateX(${(i - 1) * -10}px)`,
										}"
									>
										<img
											:src="`https://i.pravatar.cc/100?u=${path.id + i}`"
											alt="user"
										/>
									</div>
									<div
										class="plus-more"
										:style="{ transform: `translateX(-20px)` }"
									>
										+12
									</div>
								</div>
								<button class="btn-path-action">
									<span>CHI TIẾT</span>
									<ChevronRight :size="16" />
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { courseGroupAPI, enrollmentAPI } from "@/services/api";
import {
	Route,
	Layers,
	BookOpen,
	Award,
	Clock,
	ChevronRight,
	Zap,
} from "lucide-vue-next";

const router = useRouter();
const loading = ref(true);
const learningPaths = ref([]);
const myEnrollments = ref([]);

onMounted(async () => {
	loading.value = true;
	try {
		const [pathsRes, enrollRes] = await Promise.all([
			courseGroupAPI.getMy(),
			enrollmentAPI.getMy(),
		]);

		learningPaths.value = pathsRes.data.items || pathsRes.data || [];
		myEnrollments.value = enrollRes.data || [];
	} catch {
	} finally {
		loading.value = false;
	}
});

const totalCoursesInPaths = computed(() => {
	return learningPaths.value.reduce(
		(sum, path) => sum + (path.courseCount || 0),
		0,
	);
});

const totalPendingCertificates = computed(() => {
	return learningPaths.value.reduce(
		(sum, path) => sum + (path.pendingCertCount || 0),
		0,
	);
});

const overallProgress = computed(() => {
	if (learningPaths.value.length === 0) return 0;
	const total = learningPaths.value.reduce(
		(sum, path) => sum + getPathProgress(path),
		0,
	);
	return total / learningPaths.value.length;
});

const getPathProgress = (path) => {
	return path.progressPercent || 0;
};

const viewPathDetail = (id) => {
	router.push(`/learning-paths/${id}`);
};
</script>

<style scoped>
.learning-paths-page {
	min-height: 100vh;
	background: #f8fafc;
	padding-bottom: 5rem;
}

.title-gradient {
	background: linear-gradient(90deg, #1e293b, #4f46e5, #a855f7);
	-webkit-background-clip: text;
	background-clip: text;
	-webkit-text-fill-color: transparent;
	font-weight: 900;
	font-size: 2.5rem;
	letter-spacing: -1px;
}

.header-icon-box {
	width: 64px;
	height: 64px;
	border-radius: 20px;
	background: white;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 10px 30px rgba(79, 70, 229, 0.1);
	border: 1px solid rgba(79, 70, 229, 0.1);
}

.pulse-glow {
	animation: pulse-border 3s ease-in-out infinite;
}

@keyframes pulse-border {
	0% {
		box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.2);
	}
	50% {
		box-shadow: 0 0 0 15px rgba(79, 70, 229, 0);
	}
	100% {
		box-shadow: 0 0 0 0 rgba(79, 70, 229, 0);
	}
}

.badge-glass {
	padding: 6px 14px;
	border-radius: 30px;
	font-size: 11px;
	font-weight: 800;
	letter-spacing: 1px;
	display: inline-flex;
}

.badge-glass.primary {
	background: rgba(79, 70, 229, 0.1);
	color: #4f46e5;
}

.page-desc {
	font-size: 1.1rem;
	color: #64748b;
	max-width: 600px;
}

.glass-stat-card {
	background: white;
	padding: 1.5rem;
	border-radius: 24px;
	display: flex;
	align-items: center;
	gap: 1.5rem;
	border: 1px solid rgba(0, 0, 0, 0.05);
	box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.glass-stat-card:hover {
	transform: translateY(-5px);
	box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
}

.stat-icon {
	width: 56px;
	height: 56px;
	border-radius: 16px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.glass-stat-card.primary .stat-icon {
	background: rgba(79, 70, 229, 0.1);
	color: #4f46e5;
}
.glass-stat-card.info .stat-icon {
	background: rgba(14, 165, 233, 0.1);
	color: #0ea5e9;
}
.glass-stat-card.success .stat-icon {
	background: rgba(16, 185, 129, 0.1);
	color: #10b981;
}

.stat-label {
	font-size: 0.75rem;
	font-weight: 800;
	color: #94a3b8;
	letter-spacing: 1px;
}

.stat-value {
	font-size: 1.5rem;
	font-weight: 900;
	color: #1e293b;
}

.path-card {
	background: white;
	border-radius: 28px;
	overflow: hidden;
	border: 1px solid rgba(0, 0, 0, 0.05);
	transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
	cursor: pointer;
	position: relative;
}

.path-card:hover {
	transform: translateY(-10px);
	box-shadow: 0 20px 50px rgba(0, 0, 0, 0.1);
	border-color: rgba(79, 70, 229, 0.2);
}

.path-card-header {
	height: 80px;
	background: linear-gradient(135deg, #f8fafc, #f1f5f9);
	padding: 1.5rem 2rem;
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.path-icon-wrap {
	width: 50px;
	height: 50px;
	background: white;
	border-radius: 14px;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
	margin-top: 2rem;
	border: 1px solid rgba(0, 0, 0, 0.05);
}

.path-icon {
	color: #4f46e5;
}

.path-badge {
	padding: 4px 12px;
	border-radius: 30px;
	font-size: 10px;
	font-weight: 800;
	letter-spacing: 0.5px;
}

.path-badge.primary {
	background: #4f46e5;
	color: white;
}
.path-badge.info {
	background: #0ea5e9;
	color: white;
}

.path-title {
	font-size: 1.5rem;
	font-weight: 800;
	color: #1e293b;
	letter-spacing: -0.5px;
}

.path-desc {
	font-size: 0.95rem;
	color: #64748b;
	line-height: 1.6;
}

.text-truncate-2 {
	display: -webkit-box;
	-webkit-line-clamp: 2;
	line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
}

.meta-label {
	font-size: 0.85rem;
	color: #64748b;
	display: flex;
	align-items: center;
}

.premium-progress-bar {
	height: 8px;
	background: #f1f5f9;
	border-radius: 10px;
	overflow: hidden;
}

.progress-fill {
	height: 100%;
	background: linear-gradient(90deg, #4f46e5, #a855f7);
	border-radius: 10px;
	box-shadow: 0 0 10px rgba(79, 70, 229, 0.3);
	transition: width 1s ease-out;
}

.mini-avatar {
	width: 32px;
	height: 32px;
	border-radius: 50%;
	border: 2px solid white;
	overflow: hidden;
}

.mini-avatar img {
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.plus-more {
	width: 32px;
	height: 32px;
	border-radius: 50%;
	background: #f1f5f9;
	color: #64748b;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 10px;
	font-weight: 800;
	border: 2px solid white;
}

.btn-path-action {
	background: #f8fafc;
	border: 1px solid rgba(0, 0, 0, 0.08);
	padding: 8px 16px;
	border-radius: 12px;
	font-weight: 800;
	font-size: 12px;
	color: #1e293b;
	display: flex;
	align-items: center;
	gap: 8px;
	transition: all 0.2s;
}

.path-card:hover .btn-path-action {
	background: #4f46e5;
	color: white;
	border-color: #4f46e5;
}

@keyframes slideInUp {
	from {
		opacity: 0;
		transform: translateY(30px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

.animate-slide-up {
	animation: slideInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) backwards;
}

.premium-spinner {
	width: 40px;
	height: 40px;
	border: 4px solid rgba(79, 70, 229, 0.1);
	border-top-color: #4f46e5;
	border-radius: 50%;
	animation: spin 1s linear infinite;
}

@keyframes spin {
	to {
		transform: rotate(360deg);
	}
}

.empty-state {
	border-radius: 30px;
	padding: 4rem;
	background: rgba(255, 255, 255, 0.5);
	border: 1px dashed rgba(0, 0, 0, 0.1);
}

.btn-neon {
	background: #4f46e5;
	color: white;
	border: none;
	padding: 0.8rem 2rem;
	border-radius: 14px;
	font-weight: 800;
	box-shadow: 0 8px 20px rgba(79, 70, 229, 0.3);
	transition: all 0.2s;
}

.btn-neon:hover {
	transform: translateY(-2px);
	box-shadow: 0 12px 25px rgba(79, 70, 229, 0.4);
}
</style>
