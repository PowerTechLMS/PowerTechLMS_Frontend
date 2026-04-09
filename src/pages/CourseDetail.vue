<template>
	<div class="course-detail-page">
		<div v-if="loading" class="skeleton-container container">
			<div class="skeleton-hero glass mb-5" />
			<div class="row">
				<div class="col-lg-8">
					<div v-for="i in 3" :key="i" class="skeleton-module glass mb-3" />
				</div>
				<div class="col-lg-4">
					<div class="skeleton-sidebar glass" />
				</div>
			</div>
		</div>

		<div v-else-if="course" class="detail-container">
			<div class="course-hero-premium glass">
				<div
					class="hero-bg-overlay"
					:style="
						course.coverImageUrl
							? {
									backgroundImage: `url(${getFullMediaUrl(course.coverImageUrl)})`,
								}
							: { background: 'var(--gradient-card)' }
					"
				/>
				<div class="hero-content-wrapper container">
					<div class="hero-main-info animate-slide-up">
						<div class="d-flex gap-2 mb-3">
							<div
								v-if="course.categoryName"
								class="badge-glass primary fw-bold"
							>
								{{ course.categoryName }}
							</div>
							<div v-if="course.level === 1" class="badge-glass danger fw-bold">
								BẮT BUỘC (LEVEL 1)
							</div>
							<div
								v-else-if="course.level === 2"
								class="badge-glass success fw-bold"
							>
								CHUYÊN NGÀNH (LEVEL 2)
							</div>
							<div
								v-else-if="course.level === 3"
								class="badge-glass indigo fw-bold"
							>
								TỰ CHỌN (LEVEL 3)
							</div>
						</div>
						<h1 class="hero-title title-gradient">
							{{ course.title }}
						</h1>
						<div v-if="course.description" class="hero-desc-wrapper">
							<p class="hero-desc">
								{{ course.description }}
							</p>
						</div>

						<div
							v-if="
								(course.level === 2 && !isLevel1Completed && !isEnrolled) ||
								(course.level === 3 &&
									(!isLevel1Completed || !isLevel2Completed) &&
									!isEnrolled)
							"
							class="prerequisite-warning glass mb-4"
						>
							<Lock :size="20" class="text-danger" />
							<div class="warning-text">
								<div class="fw-bold">Yêu cầu hoàn thành cấp bậc trước</div>
								<div v-if="course.level === 2">
									Bạn cần hoàn thành tất cả các khóa học Cấp 1 để đăng ký khóa
									học này.
								</div>
								<div v-else-if="course.level === 3">
									Bạn cần hoàn thành tất cả các khóa học Cấp 1 và Cấp 2 để đăng
									ký khóa học này.
								</div>
							</div>
						</div>

						<div class="hero-meta-grid">
							<div class="meta-item-glass">
								<User :size="16" class="text-primary" />
								<span
									>👤 <strong>{{ course.createdByName }}</strong></span
								>
							</div>
							<div class="meta-item-glass">
								<BookOpen :size="16" class="text-success" />
								<span>📚 {{ totalLessons }} Bài học</span>
							</div>
							<div v-if="totalDuration > 0" class="meta-item-glass">
								<Clock :size="16" class="text-info" />
								<span>⏱ {{ formatDuration(totalDuration) }}</span>
							</div>
							<div class="meta-item-glass">
								<Users :size="16" class="text-warning" />
								<span>👥 {{ course.enrollmentCount }} Học viên</span>
							</div>
						</div>

						<div class="mobile-only mt-4">
							<button
								v-if="!isEnrolled"
								class="btn-neon w-100"
								:disabled="
									enrollStatus !== 'open' ||
									enrolling ||
									hasPendingEnrollment ||
									(course.level === 2 && !isLevel1Completed)
								"
								@click="handleEnroll"
							>
								<template v-if="hasPendingEnrollment">
									<Clock :size="18" /> Đang chờ duyệt
								</template>
								<template v-else-if="enrolling">
									<Loader2 :size="18" class="spin" /> Đang ghi danh...
								</template>
								<template
									v-else-if="
										(course.level === 2 && !isLevel1Completed) ||
										(course.level === 3 &&
											(!isLevel1Completed || !isLevel2Completed))
									"
								>
									<Lock :size="18" /> Chưa đủ điều kiện
								</template>
								<template v-else>
									<UserPlus :size="18" /> Đăng ký khóa học
								</template>
							</button>
						</div>
					</div>
				</div>
			</div>

			<div class="container mt-n5 position-relative z-2">
				<div class="row g-4">
					<div class="col-lg-8 animate-slide-up" style="animation-delay: 0.1s">
						<div class="curriculum-wrap">
							<div class="section-header-premium mb-4">
								<h2 class="section-title">NỘI DUNG KHÓA HỌC</h2>
								<span class="badge-glass dark"
									>{{ course.modules?.length || 0 }} Chương mục</span
								>
							</div>

							<div
								v-for="mod in course.modules"
								:key="mod.id"
								class="module-card glass mb-3"
							>
								<div
									class="module-header-premium"
									:class="{ 'is-active': expandedModules.has(mod.id) }"
									@click="toggleModule(mod.id)"
								>
									<div class="module-info-main">
										<div class="chevron-box">
											<ChevronRight
												:size="20"
												:class="{ rotated: expandedModules.has(mod.id) }"
											/>
										</div>
										<h3 class="module-title-text">
											{{ mod.title }}
										</h3>
									</div>

									<div class="module-meta-info">
										<span class="lesson-count-badge"
											>{{ mod.lessons.length }} bài học</span
										>
									</div>
								</div>

								<Transition name="expand">
									<div
										v-show="expandedModules.has(mod.id)"
										class="module-lessons-list"
									>
										<div
											v-for="lesson in mod.lessons"
											:key="lesson.id"
											class="lesson-row-premium"
											:class="{
												'is-completed': isLessonCompleted(lesson.id),
												'is-locked': !canAccessLesson(lesson),
												'is-preview': lesson.isFreePreview,
											}"
											@click="goToLesson(lesson)"
										>
											<div class="lesson-status-icon">
												<CheckCircle2
													v-if="isLessonCompleted(lesson.id)"
													:size="20"
													class="text-success"
												/>
												<div v-else class="type-icon-box">
													<Video v-if="lesson.type === 'Video'" :size="18" />
													<FileText
														v-else-if="lesson.type === 'Document'"
														:size="18"
													/>
													<ClipboardList
														v-else-if="lesson.type === 'Quiz'"
														:size="18"
													/>
													<FileText v-else :size="18" />
												</div>
											</div>

											<div class="lesson-content-main">
												<div class="lesson-title-row">
													<span class="lesson-title-text">
														<span class="play-indicator">▶</span>
														Bài học: {{ lesson.title }}
													</span>
													<span
														v-if="isLessonCompleted(lesson.id)"
														class="completed-tag"
														>✓ Đã hoàn thành</span
													>
												</div>
												<div class="lesson-tags-wrap">
													<span class="type-tag">
														<template v-if="lesson.type === 'Video'"
															>🎥 Video</template
														>
														<template v-else-if="lesson.type === 'Document'"
															>📄 Tài liệu</template
														>
														<template v-else-if="lesson.type === 'Quiz'"
															>📝 Quiz</template
														>
														<template v-else>📄 Bài học</template>
													</span>
													<span
														v-if="lesson.isFreePreview"
														class="badge-glass primary sm"
														>Xem thử</span
													>
													<span
														v-if="lesson.videoDurationSeconds > 0"
														class="duration-tag"
													>
														<Clock :size="12" class="me-1" />
														{{ formatDuration(lesson.videoDurationSeconds) }}
													</span>
												</div>
											</div>

											<div class="lesson-action-indicator">
												<Lock
													v-if="
														!canAccessLesson(lesson) && !lesson.isFreePreview
													"
													:size="16"
													class="text-tertiary"
												/>
												<div v-else class="play-btn-circle">
													<Play :size="14" fill="currentColor" />
												</div>
											</div>
										</div>
									</div>
								</Transition>
							</div>

							<div class="instructor-card-premium glass mt-5 mb-5 p-4">
								<h3 class="section-title mb-4">GIẢNG VIÊN</h3>
								<div class="instructor-profile">
									<div class="instructor-avatar">
										<img
											:src="`https://ui-avatars.com/api/?name=${course.createdByName}&background=random`"
											alt="Avatar"
										/>
									</div>
									<div class="instructor-details">
										<div class="instructor-name">
											{{ course.createdByName }}
										</div>
										<div class="instructor-dept">
											Giảng viên / Training Dept
										</div>
										<p v-if="course.instructorBio" class="instructor-bio">
											{{ course.instructorBio }}
										</p>
									</div>
								</div>
							</div>

							<div class="discussion-section glass p-4 mb-5">
								<div class="section-header-premium mb-4">
									<h3 class="section-title">THẢO LUẬN & HOẠT ĐỘNG</h3>
									<div class="d-flex gap-3">
										<span class="badge-glass dark"
											>👤 {{ course.enrollmentCount }} người đang học</span
										>
									</div>
								</div>
								<div class="discussion-placeholder">
									<MessageSquare :size="40" class="mb-3 opacity-20" />
									<p>Hãy chia sẻ kiến thức hoặc đặt câu hỏi để cùng tiến bộ!</p>
									<button class="btn-glass sm">THAM GIA THẢO LUẬN</button>
								</div>
							</div>
						</div>
					</div>

					<div class="col-lg-4 animate-slide-up" style="animation-delay: 0.2s">
						<div class="sticky-sidebar">
							<div class="enroll-card glass shadow-glow">
								<div
									class="card-image-preview"
									:style="
										course.coverImageUrl
											? {
													backgroundImage: `url(${getFullMediaUrl(course.coverImageUrl)})`,
												}
											: { background: 'var(--gradient-primary)' }
									"
								>
									<div
										v-if="isEnrolled && progress"
										class="progress-overlay-glass"
									>
										<div class="progress-info-mini">
											<span class="fw-bold"
												>{{ Math.round(progress.progressPercent) }}%</span
											>
											<span>Hoàn thành</span>
										</div>
										<div class="progress-bar-glass-sm">
											<div
												class="progress-fill-glow"
												:style="{ width: progress.progressPercent + '%' }"
											/>
										</div>
									</div>
								</div>

								<div class="card-body-premium p-4">
									<div class="status-price-row mb-4">
										<span v-if="!isEnrolled" class="huge-text-gradient"
											>MIỄN PHÍ</span
										>
										<span
											v-else-if="progress?.isCompleted"
											class="huge-text-gradient"
											>HOÀN THÀNH</span
										>
										<span v-else class="huge-text-gradient">ĐANG HỌC</span>
									</div>

									<div
										v-if="isEnrolled && progress"
										class="detailed-progress-box mb-4"
									>
										<div class="d-flex justify-content-between mb-2">
											<span class="label-premium">TIẾN ĐỘ HỌC TẬP</span>
											<span class="percent-premium"
												>{{ Math.round(progress.progressPercent) }}%</span
											>
										</div>
										<div class="progress-bar-premium mb-3">
											<div
												class="progress-fill-glow"
												:style="{ width: progress.progressPercent + '%' }"
											/>
										</div>
										<div class="stats-grid-mini">
											<div class="stat-item">
												<span class="stat-val"
													>{{
														lessonProgresses.filter((p) => p.isCompleted).length
													}}
													/ {{ totalLessons }}</span
												>
												<span class="stat-lbl">Bài học</span>
											</div>
											<div class="stat-item text-end">
												<span class="stat-val">
													{{
														progress.timeSpentMinutes > 0
															? progress.timeSpentMinutes
															: progress.progressPercent > 0
																? "Dưới 1"
																: "0"
													}}
												</span>
												<span class="stat-lbl">Phút đã học</span>
											</div>
										</div>
									</div>

									<div class="sidebar-actions gap-3 d-flex flex-column">
										<template v-if="!isEnrolled">
											<div
												v-if="enrollStatus !== 'open'"
												class="alert-glass warning mb-2"
											>
												<Calendar :size="16" />
												<small v-if="enrollStatus === 'not_started'"
													>Mở đăng ký:
													{{ formatDate(course.enrollStartDate) }}</small
												>
												<small v-else
													>Hết hạn đăng ký:
													{{ formatDate(course.enrollEndDate) }}</small
												>
											</div>
											<button
												class="btn-neon lg w-100"
												:disabled="
													enrollStatus !== 'open' ||
													enrolling ||
													hasPendingEnrollment ||
													(course.level === 2 && !isLevel1Completed)
												"
												@click="handleEnroll"
											>
												<template v-if="hasPendingEnrollment">
													<Clock :size="20" /> CHỜ PHÊ DUYỆT
												</template>
												<template v-else-if="enrolling">
													<Loader2 :size="20" class="spin" /> ĐANG XỬ LÝ...
												</template>
												<template
													v-else-if="
														(course.level === 2 && !isLevel1Completed) ||
														(course.level === 3 &&
															(!isLevel1Completed || !isLevel2Completed))
													"
												>
													<Lock :size="20" /> CHƯA ĐỦ ĐIỀU KIỆN
												</template>
												<template v-else>
													<UserPlus :size="20" /> ĐĂNG KÝ KHÓA HỌC
												</template>
											</button>
										</template>

										<template v-else-if="progress?.isCompleted">
											<button class="btn-neon lg w-100" @click="startLearning">
												<RotateCcw :size="20" /> XEM LẠI BÀI HỌC
											</button>
											<div class="d-flex gap-2">
												<button
													v-if="course?.finalQuizId"
													class="btn-glass flex-fill"
													@click="
														router.push({
															path: `/quiz/${course.finalQuizId}`,
															query: { courseId: route.params.id },
														})
													"
												>
													THI LẠI
												</button>
												<button
													class="btn-neon warning flex-fill"
													@click="router.push('/certificates')"
												>
													<Medal :size="18" /> XEM CHỨNG CHỈ
												</button>
											</div>
										</template>

										<button
											v-else-if="isEnrolled"
											class="btn-neon lg w-100"
											@click="startLearning"
										>
											<PlayCircle :size="20" />
											{{
												progress?.progressPercent > 0
													? "TIẾP TỤC HỌC"
													: "VÀO HỌC NGAY"
											}}
										</button>
									</div>

									<div v-if="isEnrolled" class="completion-requirements mt-4">
										<h4 class="mini-title mb-3">ĐIỀU KIỆN HOÀN THÀNH</h4>
										<ul class="req-list">
											<li
												:class="{
													completed: lessonProgresses.some(
														(p) => p.isCompleted,
													),
												}"
											>
												<CheckCircle2 :size="14" /> Video & Tài liệu
											</li>
											<li
												v-if="course?.finalQuizId"
												:class="{ completed: progress.quizPassed }"
											>
												<CheckCircle2 :size="14" /> Vượt qua bài kiểm tra cuối
												khóa
											</li>
										</ul>
									</div>

									<div class="gamification-box mt-4 p-3 glass">
										<div class="d-flex align-items-center gap-3">
											<div class="xp-badge">
												<Trophy :size="20" />
											</div>
											<div>
												<div class="fw-bold text-success">
													+{{ course.points || 0 }} XP
												</div>
												<div class="text-muted small">
													Củng cố hồ sơ đào tạo
												</div>
											</div>
										</div>
									</div>

									<ul class="course-features-list mt-4">
										<li><Check :size="14" /> Truy cập trọn đời</li>
										<li><Check :size="14" /> Chứng chỉ hoàn thành</li>
										<li><Check :size="14" /> Cập nhật nội dung mới</li>
									</ul>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<Transition name="toast">
			<div v-if="toast" class="toast-premium glass">
				<div class="toast-content">
					<Info :size="18" class="text-primary" />
					<span>{{ toast }}</span>
				</div>
			</div>
		</Transition>
	</div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { courseAPI, enrollmentAPI, progressAPI } from "@/services/api";
import {
	UserPlus,
	PlayCircle,
	ClipboardList,
	RotateCcw,
	ChevronRight,
	Video,
	FileText,
	CheckCircle2,
	Lock,
	Calendar,
	Clock,
	Loader2,
	BookOpen,
	Users,
	User,
	Play,
	Check,
	Info,
	MessageSquare,
	Trophy,
	Medal,
} from "lucide-vue-next";

const route = useRoute();
const router = useRouter();
import { getFullMediaUrl } from "@/utils/media";

const course = ref(null);

const progress = ref(null);
const lessonProgresses = ref([]);
const isEnrolled = ref(false);
const hasPendingEnrollment = ref(false);
const enrolling = ref(false);
const expandedModules = ref(new Set());
const loading = ref(true);
const toast = ref("");
let toastTimer = null;

function formatDuration(seconds) {
	if (!seconds || isNaN(seconds)) return "";
	if (seconds > 360000) return "-:--";

	const h = Math.floor(seconds / 3600);
	const m = Math.floor((seconds % 3600) / 60);
	const s = Math.floor(seconds % 60);

	if (h > 0) {
		return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
	}
	return `${m}:${s.toString().padStart(2, "0")}`;
}

const isLevel1Completed = ref(false);
const isLevel2Completed = ref(false);

async function checkPrerequisites() {
	if (!course.value) return;
	try {
		const { data: enrollments } = await enrollmentAPI.getMy();
		const { data: allCourses } = await courseAPI.getAll({ pageSize: 1000 });
		const level1Ids = allCourses.items
			.filter((c) => c.level === 1)
			.map((c) => c.id);
		const level2Ids = allCourses.items
			.filter((c) => c.level === 2)
			.map((c) => c.id);
		const doneIds = enrollments
			.filter(
				(e) =>
					e.status === "Completed" ||
					e.status === "Finished" ||
					e.progressPercent >= 100,
			)
			.map((e) => e.courseId);

		isLevel1Completed.value =
			level1Ids.length === 0 || level1Ids.every((id) => doneIds.includes(id));
		isLevel2Completed.value =
			level2Ids.length === 0 || level2Ids.every((id) => doneIds.includes(id));
	} catch {}
}

function showToast(msg) {
	clearTimeout(toastTimer);
	toast.value = msg;
	toastTimer = setTimeout(() => (toast.value = ""), 4000);
}

const totalLessons = computed(
	() =>
		course.value?.modules?.reduce((sum, m) => sum + m.lessons.length, 0) || 0,
);

const totalDuration = computed(() => {
	if (!course.value?.modules) return 0;
	return course.value.modules.reduce((acc, mod) => {
		return (
			acc +
			mod.lessons.reduce(
				(lAcc, lesson) => lAcc + (lesson.videoDurationSeconds || 0),
				0,
			)
		);
	}, 0);
});

/*
 * const isAllCompleted = computed(() => {
 * 	const all = course.value?.modules?.flatMap((m) => m.lessons) ?? [];
 * 	return all.length > 0 && all.every((l) => isLessonCompleted(l.id));
 * });
 */

const enrollStatus = computed(() => {
	const c = course.value;
	if (!c) return "open";
	const now = new Date();
	if (c.enrollStartDate && now < new Date(c.enrollStartDate))
		return "not_started";
	if (c.enrollEndDate && now > new Date(c.enrollEndDate)) return "closed";
	return "open";
});

function formatDate(d) {
	if (!d) return "";
	return new Date(d).toLocaleDateString("vi-VN", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	});
}

function toggleModule(id) {
	if (expandedModules.value.has(id)) expandedModules.value.delete(id);
	else expandedModules.value.add(id);
}

function isLessonCompleted(lessonId) {
	return lessonProgresses.value.some(
		(lp) => lp.lessonId === lessonId && lp.isCompleted,
	);
}

function canAccessLesson(lesson) {
	if (lesson.isFreePreview) return true;
	if (!isEnrolled.value) return false;
	const allLessons = course.value.modules.flatMap((m) => m.lessons);
	const idx = allLessons.findIndex((l) => l.id === lesson.id);
	if (idx === 0) return true;
	return isLessonCompleted(allLessons[idx - 1].id);
}

function goToLesson(lesson) {
	if (isEnrolled.value || lesson.isFreePreview) {
		router.push(`/learn/${route.params.id}/${lesson.id}`);
	} else {
		showToast("Vui lòng đăng ký khóa học này để bắt đầu bài học.");
	}
}

function startLearning() {
	const allLessons = course.value?.modules?.flatMap((m) => m.lessons) ?? [];
	if (!allLessons.length) {
		showToast(
			"Khóa học này chưa có bài học nào. Vui lòng liên hệ quản trị viên.",
		);
		return;
	}
	const nextLesson =
		allLessons.find((l) => !isLessonCompleted(l.id)) || allLessons[0];
	if (nextLesson) router.push(`/learn/${route.params.id}/${nextLesson.id}`);
}

async function handleEnroll() {
	const isLocked =
		(course.value.level === 2 && !isLevel1Completed.value) ||
		(course.value.level === 3 &&
			(!isLevel1Completed.value || !isLevel2Completed.value));
	if (isLocked) {
		showToast(
			"Bạn phải hoàn thành tất cả các khóa học cấp bậc trước khi đăng ký.",
		);
		return;
	}
	const cId = parseInt(String(route.params.id));
	if (isNaN(cId)) return;
	enrolling.value = true;
	try {
		const response = await enrollmentAPI.enroll(cId);
		if (response.data && response.data.status === "Pending") {
			hasPendingEnrollment.value = true;
			showToast("Đăng ký thành công! Vui lòng chờ phê duyệt.");
		} else {
			isEnrolled.value = true;
			showToast("Chúc mừng! Bạn đã ghi danh thành khóa học thành công.");
		}
	} catch {}
}

onMounted(async () => {
	const id = route.params.id;
	loading.value = true;
	try {
		const { data } = await courseAPI.getById(id);
		course.value = data;
		course.value.modules?.forEach((m) => expandedModules.value.add(m.id));

		try {
			const myEnrollmentsRes = await enrollmentAPI.getMy();
			const myEnrollment = myEnrollmentsRes.data.find(
				(e) => e.courseId === parseInt(id),
			);

			if (myEnrollment) {
				if (myEnrollment.status === "Pending") {
					hasPendingEnrollment.value = true;
					isEnrolled.value = false;
				} else if (myEnrollment.status === "Rejected") {
					hasPendingEnrollment.value = false;
					isEnrolled.value = false;
				} else {
					isEnrolled.value = true;
					try {
						const progressRes = await progressAPI.getCourseProgress(id);
						progress.value = progressRes.data;
						const lpRes = await progressAPI.getLessonProgresses(id);
						lessonProgresses.value = lpRes.data;
					} catch {}
				}
			} else {
				isEnrolled.value = false;
			}
		} catch {
			isEnrolled.value = false;
		}

		await checkPrerequisites();
	} catch {
	} finally {
		loading.value = false;
	}
});
</script>

<style scoped>
.course-detail-page {
	padding-bottom: 5rem;
	min-height: 100vh;
}

:root {
	--glass-bg: rgba(255, 255, 255, 0.7);
	--glass-border: rgba(255, 255, 255, 0.4);
	--card-text: #1e293b;
	--muted-text: #64748b;
	--bg-lesson: rgba(255, 255, 255, 0.4);
	--bg-lesson-hover: #ffffff;
	--border-color: rgba(0, 0, 0, 0.05);
	--instructor-bg: rgba(255, 255, 255, 0.5);
}

:is([data-bs-theme="dark"], [data-theme="dark"]) .course-detail-page {
	--glass-bg: rgba(16, 24, 40, 0.8);
	--glass-border: rgba(255, 255, 255, 0.1);
	--card-text: #f8fafc;
	--muted-text: #94a3b8;
	--bg-lesson: rgba(30, 41, 59, 0.6);
	--bg-lesson-hover: #1e293b;
	--border-color: rgba(255, 255, 255, 0.1);
	--instructor-bg: rgba(30, 41, 59, 0.8);
}

.glass {
	background: var(--glass-bg);
	backdrop-filter: blur(20px);
	-webkit-backdrop-filter: blur(20px);
	border: 1px solid var(--glass-border);
}

.huge-text-gradient {
	font-size: 2rem;
	font-weight: 900;
	background: linear-gradient(135deg, #6366f1, #a855f7);
	background-clip: text;
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
}

.badge-glass {
	padding: 6px 14px;
	border-radius: 30px;
	font-size: 11px;
	font-weight: 800;
	letter-spacing: 1px;
	text-transform: uppercase;
	display: inline-flex;
	align-items: center;
}
.badge-glass.primary {
	background: rgba(99, 102, 241, 0.15);
	color: #6366f1;
	border: 1px solid rgba(99, 102, 241, 0.3);
}
.badge-glass.success {
	background: rgba(16, 185, 129, 0.15);
	color: #10b981;
	border: 1px solid rgba(16, 185, 129, 0.3);
}
.badge-glass.danger {
	background: rgba(239, 68, 68, 0.15);
	color: #ef4444;
	border: 1px solid rgba(239, 68, 68, 0.3);
}
.badge-glass.warning {
	background: rgba(245, 158, 11, 0.15);
	color: #f59e0b;
	border: 1px solid rgba(245, 158, 11, 0.3);
}
.badge-glass.info {
	background: rgba(6, 182, 212, 0.15);
	color: #06b6d4;
	border: 1px solid rgba(6, 182, 212, 0.3);
}
.badge-glass.dark {
	background: rgba(0, 0, 0, 0.5);
	color: white;
	backdrop-filter: blur(8px);
}

.course-hero-premium {
	position: relative;
	border-radius: 0 0 40px 40px;
	overflow: hidden;
	margin-bottom: 2rem;
	min-height: 380px;
	display: flex;
	align-items: center;
	border: none;
	border-bottom: 1px solid rgba(255, 255, 255, 0.3);
}

.hero-bg-overlay {
	position: absolute;
	inset: 0;
	background-size: cover;
	background-position: center;
	filter: blur(40px) brightness(0.6);
	transform: scale(1.1);
	z-index: 1;
}

.hero-bg-overlay::after {
	content: "";
	position: absolute;
	inset: 0;
	background: linear-gradient(
		to top,
		rgba(15, 23, 42, 0.8) 0%,
		rgba(15, 23, 42, 0.3) 100%
	);
}

.hero-content-wrapper {
	position: relative;
	z-index: 2;
	padding-top: 2rem;
	padding-bottom: 5rem;
}

.hero-main-info {
	max-width: 800px;
}

.hero-title {
	font-size: 3.5rem;
	font-weight: 900;
	line-height: 1.1;
	margin-bottom: 1.5rem;
	letter-spacing: -2px;
	background: linear-gradient(90deg, #ffffff, #818cf8, #c084fc);
	background-clip: text;
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
}

.hero-desc-wrapper {
	max-width: 650px;
	background: rgba(255, 255, 255, 0.05);
	padding: 1.5rem;
	border-radius: 20px;
	border: 1px solid rgba(255, 255, 255, 0.1);
	margin-bottom: 2.5rem;
	backdrop-filter: blur(5px);
}
.hero-desc {
	font-size: 1.15rem;
	color: rgba(255, 255, 255, 0.95);
	margin-bottom: 0;
	line-height: 1.6;
	font-weight: 500;
}

.hero-meta-grid {
	display: flex;
	gap: 1.5rem;
	flex-wrap: wrap;
}

.meta-item-glass {
	display: flex;
	align-items: center;
	gap: 8px;
	background: rgba(255, 255, 255, 0.1);
	backdrop-filter: blur(10px);
	padding: 8px 16px;
	border-radius: 12px;
	color: white;
	font-size: 0.9rem;
	border: 1px solid rgba(255, 255, 255, 0.15);
}

.section-header-premium {
	display: flex;
	justify-content: space-between;
	align-items: center;
}
.section-title {
	font-size: 1.25rem;
	font-weight: 900;
	color: var(--card-text);
	letter-spacing: 2px;
}

.module-card {
	border-radius: 20px;
	overflow: hidden;
	transition: all 0.3s;
}

.module-header-premium {
	padding: 1.25rem 1.5rem;
	display: flex;
	justify-content: space-between;
	align-items: center;
	cursor: pointer;
	transition: background 0.3s;
}

.module-header-premium:hover {
	background: rgba(99, 102, 241, 0.05);
}
.module-header-premium.is-active {
	background: rgba(79, 70, 229, 0.03);
	border-bottom: 1px solid var(--border-color);
}

.module-info-main {
	display: flex;
	align-items: center;
	gap: 12px;
}
.chevron-box {
	width: 28px;
	height: 28px;
	border-radius: 8px;
	display: flex;
	align-items: center;
	justify-content: center;
	background: rgba(0, 0, 0, 0.05);
	transition: all 0.3s;
}
.chevron-box .rotated {
	transform: rotate(90deg);
	color: #4f46e5;
}

.module-title-text {
	font-size: 1.1rem;
	font-weight: 800;
	color: var(--card-text);
	margin: 0;
}
.lesson-count-badge {
	font-size: 0.8rem;
	font-weight: 700;
	color: var(--muted-text);
	background: var(--border-color);
	padding: 4px 10px;
	border-radius: 8px;
}

.lesson-row-premium {
	display: flex;
	align-items: center;
	padding: 1.25rem 1.5rem;
	gap: 1.25rem;
	cursor: pointer;
	border-bottom: 1px solid var(--border-color);
	transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
	background: var(--bg-lesson);
}

.lesson-row-premium:last-child {
	border-bottom: none;
}
.lesson-row-premium:hover {
	background: var(--bg-lesson-hover);
	transform: translateX(8px);
}

.type-icon-box {
	width: 38px;
	height: 38px;
	border-radius: 12px;
	display: flex;
	align-items: center;
	justify-content: center;
	background: var(--border-color);
	color: var(--muted-text);
	transition: all 0.3s;
}

.lesson-row-premium:hover .type-icon-box {
	background: #4f46e5;
	color: white;
}

.lesson-title-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.completed-tag {
	font-size: 0.75rem;
	font-weight: 700;
	color: #10b981;
	background: rgba(16, 185, 129, 0.1);
	padding: 2px 8px;
	border-radius: 6px;
}

.type-tag {
	font-size: 0.75rem;
	font-weight: 700;
	color: var(--muted-text);
	text-transform: uppercase;
	letter-spacing: 0.5px;
}

.hover-play {
	color: #4f46e5;
	transform: scale(0.9);
	transition: all 0.2s;
}
.lesson-row-premium:hover .hover-play {
	transform: scale(1.2);
}

.instructor-profile {
	display: flex;
	gap: 1.5rem;
	align-items: center;
}
.instructor-avatar img {
	width: 80px;
	height: 80px;
	border-radius: 20px;
	object-fit: cover;
	border: 3px solid var(--glass-border);
	box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.instructor-name {
	font-size: 1.25rem;
	font-weight: 800;
	color: var(--card-text);
}

.instructor-dept {
	color: #4f46e5;
	font-weight: 700;
	font-size: 0.9rem;
	margin-bottom: 0.5rem;
}
.instructor-bio {
	color: var(--muted-text);
	font-size: 0.95rem;
	margin: 0;
	line-height: 1.5;
}

.discussion-placeholder {
	text-align: center;
	padding: 3rem;
	color: #94a3b8;
	font-weight: 600;
}

.detailed-progress-box {
	background: var(--bg-lesson);
	padding: 1.25rem;
	border-radius: 20px;
	border: 1px solid var(--glass-border);
}

.label-premium {
	font-size: 0.8rem;
	font-weight: 800;
	color: var(--muted-text);
	letter-spacing: 1px;
}

.percent-premium {
	font-weight: 900;
	color: #4f46e5;
}
.progress-bar-premium {
	height: 10px;
	background: #e2e8f0;
	border-radius: 20px;
	overflow: hidden;
}
.stats-grid-mini {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 1rem;
}
.stat-val {
	display: block;
	font-weight: 800;
	color: var(--card-text);
	font-size: 1.1rem;
}
.stat-lbl {
	font-size: 0.75rem;
	font-weight: 700;
	color: var(--muted-text);
}

.mini-title {
	font-size: 0.9rem;
	font-weight: 900;
	color: var(--card-text);
	letter-spacing: 1px;
}

.req-list {
	list-style: none;
	padding: 0;
	margin: 0;
}
.req-list li {
	display: flex;
	align-items: center;
	gap: 10px;
	font-size: 0.85rem;
	font-weight: 600;
	color: var(--muted-text);
	margin-bottom: 8px;
}

.req-list li.completed {
	color: #10b981;
}

.xp-badge {
	width: 45px;
	height: 45px;
	border-radius: 14px;
	background: linear-gradient(135deg, #f59e0b, #d97706);
	color: white;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 5px 15px rgba(245, 158, 11, 0.3);
}

.btn-neon.warning {
	background: linear-gradient(135deg, #f59e0b, #d97706);
	box-shadow: 0 8px 20px rgba(245, 158, 11, 0.3);
}

.play-indicator {
	color: #4f46e5;
	font-size: 0.8rem;
	margin-right: 4px;
	opacity: 0.7;
}
.play-btn-circle {
	width: 32px;
	height: 32px;
	border-radius: 50%;
	background: #4f46e5;
	color: white;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 4px 10px rgba(79, 70, 229, 0.3);
	transition: all 0.2s;
}
.lesson-row-premium:hover .play-btn-circle {
	transform: scale(1.15);
	background: #4338ca;
}

.other-item-mini {
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 8px 12px;
	border-radius: 10px;
	font-size: 0.85rem;
	font-weight: 600;
	color: #475569;
	margin-bottom: 8px;
	transition: all 0.2s;
	cursor: pointer;
}
.other-item-mini:hover {
	background: white;
	color: #4f46e5;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.tiny-progress-bar {
	height: 4px;
	background: rgba(0, 0, 0, 0.05);
	border-radius: 10px;
	overflow: hidden;
}
.tiny-fill {
	height: 100%;
	background: #10b981;
}

.fw-600 {
	font-weight: 600;
}

.btn-glass.flex-fill {
	display: flex;
	align-items: center;
	justify-content: center;
}

.lesson-action-indicator {
	opacity: 1;
}

.sticky-sidebar {
	position: sticky;
	top: 100px;
}

.enroll-card {
	border-radius: 28px;
	overflow: hidden;
	border: 1px solid var(--glass-border);
}

.card-image-preview {
	height: 200px;
	background-size: cover;
	background-position: center;
	position: relative;
}

.progress-overlay-glass {
	position: absolute;
	inset: 0;
	background: linear-gradient(
		to top,
		rgba(15, 23, 42, 0.9),
		rgba(15, 23, 42, 0.2)
	);
	display: flex;
	flex-direction: column;
	justify-content: center;
	padding: 2rem;
	color: white;
}

.progress-info-mini {
	display: flex;
	justify-content: space-between;
	font-size: 0.9rem;
	margin-bottom: 8px;
}
.progress-bar-glass-sm {
	height: 6px;
	background: rgba(255, 255, 255, 0.2);
	border-radius: 10px;
	overflow: hidden;
}
.progress-fill-glow {
	height: 100%;
	background: linear-gradient(90deg, #6366f1, #a855f7);
	box-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
	border-radius: 10px;
}

.btn-neon {
	padding: 0.9rem 1.5rem;
	border-radius: 16px;
	font-weight: 800;
	font-size: 0.95rem;
	border: none;
	color: white;
	background: linear-gradient(135deg, #6366f1, #4f46e5);
	box-shadow: 0 8px 20px rgba(79, 70, 229, 0.3);
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 10px;
	transition: all 0.3s;
}
.btn-neon:hover:not(:disabled) {
	transform: translateY(-3px);
	box-shadow: 0 12px 25px rgba(79, 70, 229, 0.4);
}
.btn-neon.success {
	background: linear-gradient(135deg, #10b981, #059669);
	box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
}

.btn-glass {
	background: var(--border-color);
	border: 1px solid var(--glass-border);
	padding: 0.8rem;
	border-radius: 14px;
	font-weight: 700;
	color: var(--card-text);
	transition: all 0.2s;
}

.btn-glass:hover {
	background: rgba(0, 0, 0, 0.08);
}

.deadline-item-glass {
	display: flex;
	align-items: center;
	gap: 8px;
	background: rgba(234, 179, 8, 0.08);
	color: #b45309;
	padding: 10px 16px;
	border-radius: 14px;
	font-weight: 700;
	font-size: 0.85rem;
}

.course-features-list {
	list-style: none;
	padding: 0;
	margin: 0;
}
.course-features-list li {
	display: flex;
	align-items: center;
	gap: 10px;
	font-size: 0.9rem;
	color: #64748b;
	margin-bottom: 12px;
	font-weight: 600;
}
.course-features-list li svg {
	color: #10b981;
}

.toast-premium {
	position: fixed;
	bottom: 2rem;
	right: 2rem;
	padding: 1rem 1.5rem;
	border-radius: 20px;
	z-index: 1000;
	box-shadow: 0 15px 40px rgba(0, 0, 0, 0.1);
}
.toast-content {
	display: flex;
	align-items: center;
	gap: 12px;
	font-weight: 700;
	color: #1e293b;
}

.skeleton-hero {
	height: 400px;
	border-radius: 0 0 40px 40px;
}
.skeleton-module {
	height: 80px;
	border-radius: 20px;
}
.skeleton-sidebar {
	height: 500px;
	border-radius: 28px;
}

.expand-enter-active,
.expand-leave-active {
	transition: all 0.3s ease;
	max-height: 1000px;
}
.expand-enter-from,
.expand-leave-to {
	max-height: 0;
	opacity: 0;
	overflow: hidden;
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
	animation: slideInUp 0.7s cubic-bezier(0.4, 0, 0.2, 1) backwards;
}

.spin {
	animation: spin 1s linear infinite;
}
@keyframes spin {
	from {
		transform: rotate(0deg);
	}
	to {
		transform: rotate(360deg);
	}
}

.prerequisite-warning {
	padding: 1.25rem;
	border-radius: 16px;
	display: flex;
	gap: 1rem;
	align-items: center;
	border: 1px solid rgba(239, 68, 68, 0.3) !important;
	background: rgba(239, 68, 68, 0.05) !important;
}
.warning-text {
	color: white;
	line-height: 1.4;
}
.warning-text .fw-bold {
	font-size: 1.1rem;
	margin-bottom: 2px;
}

@media (max-width: 991px) {
	.hero-title {
		font-size: 2.5rem;
	}
	.course-hero-premium {
		min-height: 350px;
	}
	.sticky-sidebar {
		position: static;
		margin-top: 2rem;
	}
	.mt-n5 {
		margin-top: -3rem !important;
	}
}
</style>
