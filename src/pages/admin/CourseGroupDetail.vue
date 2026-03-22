<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { courseGroupAPI } from "@/services/api";
import { toast } from "vue3-toastify";
import {
	Route,
	ArrowLeft,
	BookOpen,
	Layers,
	CheckCircle2,
	PlayCircle,
} from "lucide-vue-next";

const router = useRouter();
const route = useRoute();
const pathId = Number(route.params.id);

const learningPath = ref<any>(null);
const loading = ref(true);

onMounted(async () => {
	try {
		const res = await courseGroupAPI.getById(pathId);
		learningPath.value = res.data;
	} catch {
		toast.error("Không tìm thấy lộ trình");
		router.push("/admin/coursegroup");
	} finally {
		loading.value = false;
	}
});
</script>

<template>
	<div class="path-detail-page">
		<div v-if="loading" class="text-center py-5">
			<div class="spinner mx-auto mb-3" />
			<p class="text-muted fw-bold">Đang vẽ bản đồ học tập...</p>
		</div>

		<template v-else-if="learningPath">
			<div class="page-header mb-4">
				<button
					class="btn btn-outline border-0 px-0"
					@click="router.push('/admin/coursegroup')"
				>
					<ArrowLeft :size="18" class="me-2" /> Trở lại danh sách
				</button>
			</div>

			<div
				class="glass-hero-card mb-5 p-5 text-white position-relative overflow-hidden shadow-lg"
			>
				<div class="bg-gradient-overlay" />
				<div class="watermark-icon">
					<Route :size="240" stroke-width="1" />
				</div>

				<div class="position-relative z-1">
					<span class="badge-white-glass mb-3">LEARNING PATH</span>
					<h1 class="fw-bold mb-3 display-6">
						{{ learningPath.name }}
					</h1>
					<p class="fs-6 opacity-75 max-w-75 mb-0 lh-lg">
						{{
							learningPath.description ||
							"Chưa có mô tả chi tiết cho lộ trình này."
						}}
					</p>
				</div>
			</div>

			<h5 class="fw-bold text-dark mb-4 d-flex align-items-center">
				<Layers :size="22" class="text-primary me-2" />
				Bản đồ Khóa học
				<span
					class="badge bg-light text-primary border ms-2 rounded-pill px-3 py-1 fs-12"
					>{{ learningPath.courses?.length || 0 }} chặng</span
				>
			</h5>

			<div class="roadmap-container">
				<div
					v-if="!learningPath.courses || learningPath.courses.length === 0"
					class="empty-roadmap"
				>
					Lộ trình này chưa có khóa học nào được gán. Hãy vào mục chỉnh sửa để
					cấu hình.
				</div>

				<div v-else class="timeline-glass">
					<div
						v-for="(course, index) in learningPath.courses"
						:key="course.id"
						class="timeline-item"
					>
						<div class="tl-marker">
							<div class="tl-number">
								{{ index + 1 }}
							</div>
							<div
								v-if="index !== learningPath.courses.length - 1"
								class="tl-line"
							/>
						</div>

						<div class="tl-content w-100 ms-4 mb-4">
							<div class="glass-course-card p-4">
								<div
									class="d-flex justify-content-between align-items-start flex-wrap gap-3"
								>
									<div>
										<h5 class="fw-bold text-dark mb-2 fs-16">
											{{ course.title }}
										</h5>
										<p class="text-muted fs-14 mb-3" style="max-width: 600px">
											{{
												course.description ||
												"Khóa học đào tạo kỹ năng chuyên sâu trong lộ trình."
											}}
										</p>

										<div
											class="d-flex flex-wrap gap-3 fs-13 text-tertiary fw-medium mt-2"
										>
											<span class="badge-info-glass"
												><BookOpen :size="14" class="me-1" /> Học qua Video &
												Tài liệu</span
											>
											<span class="badge-success-glass"
												><CheckCircle2 :size="14" class="me-1" /> Điểm qua môn:
												{{ course.passScore || 5 }}/10</span
											>
										</div>
									</div>
									<button
										class="btn btn-primary rounded-pill"
										@click="router.push(`/admin/courses/${course.id}`)"
									>
										<PlayCircle :size="18" class="me-2" /> Vào học / Xem chi
										tiết
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</template>
	</div>
</template>

<style scoped>
.path-detail-page {
	padding-bottom: 50px;
	max-width: 1000px;
	margin: 0 auto;
	animation: fadeIn 0.4s ease-out;
}
.btn-outline {
	background: transparent;
	color: var(--text-secondary);
	transition: all 0.2s;
	font-weight: 600;
}
.btn-outline:hover {
	color: var(--primary-600);
	transform: translateX(-4px);
}

.spinner {
	width: 40px;
	height: 40px;
	border: 4px solid rgba(79, 70, 229, 0.2);
	border-top-color: #4f46e5;
	border-radius: 50%;
	animation: spin 1s linear infinite;
}
@keyframes spin {
	100% {
		transform: rotate(360deg);
	}
}
@keyframes fadeIn {
	from {
		opacity: 0;
		transform: translateY(10px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

.glass-hero-card {
	background: #0f172a;
	border-radius: 24px;
	z-index: 1;
}
.bg-gradient-overlay {
	position: absolute;
	inset: 0;
	background: linear-gradient(
		135deg,
		rgba(79, 70, 229, 0.8),
		rgba(15, 23, 42, 0.9)
	);
	z-index: 0;
}
.watermark-icon {
	position: absolute;
	top: -20%;
	right: -5%;
	color: white;
	opacity: 0.05;
	z-index: 0;
	pointer-events: none;
	transform: rotate(-15deg);
}
.badge-white-glass {
	display: inline-block;
	background: rgba(255, 255, 255, 0.2);
	backdrop-filter: blur(10px);
	color: white;
	padding: 6px 16px;
	border-radius: 30px;
	font-weight: 800;
	font-size: 11px;
	letter-spacing: 0.1em;
	border: 1px solid rgba(255, 255, 255, 0.3);
}

.timeline-glass {
	position: relative;
	padding-top: 10px;
}
.timeline-item {
	display: flex;
	align-items: stretch;
}

.tl-marker {
	display: flex;
	flex-direction: column;
	align-items: center;
	width: 48px;
	flex-shrink: 0;
}
.tl-number {
	width: 40px;
	height: 40px;
	background: linear-gradient(135deg, var(--primary-500), var(--primary-600));
	color: white;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	font-weight: 800;
	font-size: 16px;
	z-index: 2;
	box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
	border: 2px solid white;
}
.tl-line {
	width: 2px;
	flex-grow: 1;
	background: rgba(99, 102, 241, 0.2);
	margin-top: 8px;
	margin-bottom: 8px;
	border-radius: 2px;
}

.glass-course-card {
	background: rgba(255, 255, 255, 0.8);
	backdrop-filter: blur(20px);
	border: 1px solid rgba(0, 0, 0, 0.06);
	border-radius: 20px;
	transition: all 0.3s;
	box-shadow: 0 4px 15px rgba(0, 0, 0, 0.02);
}
.glass-course-card:hover {
	transform: translateY(-2px) translateX(4px);
	box-shadow: 0 10px 25px rgba(99, 102, 241, 0.08);
	border-color: rgba(99, 102, 241, 0.2);
}

.badge-info-glass {
	display: inline-flex;
	align-items: center;
	padding: 6px 12px;
	background: rgba(14, 165, 233, 0.1);
	color: var(--info-700);
	border-radius: 12px;
	border: 1px solid rgba(14, 165, 233, 0.2);
}
.badge-success-glass {
	display: inline-flex;
	align-items: center;
	padding: 6px 12px;
	background: rgba(16, 185, 129, 0.1);
	color: var(--success-700);
	border-radius: 12px;
	border: 1px solid rgba(16, 185, 129, 0.2);
}

.btn-primary {
	background: var(--primary-600);
	border: none;
	color: white;
	font-weight: 600;
	font-size: 13px;
	padding: 10px 24px;
	display: inline-flex;
	align-items: center;
	transition: all 0.2s;
}
.btn-primary:hover {
	background: var(--primary-700);
	transform: translateY(-2px);
	box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.empty-roadmap {
	padding: 40px;
	background: white;
	border: 1px dashed rgba(0, 0, 0, 0.2);
	border-radius: 20px;
	text-align: center;
	color: var(--text-tertiary);
	font-style: italic;
}
</style>
