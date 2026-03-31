<template>
	<div class="course-about-premium">
		<div class="page-header-premium animate-fade-in">
			<div class="header-content">
				<div class="header-icon-box pulse-glow">
					<Layout :size="24" class="text-primary" />
				</div>
				<div class="header-titles">
					<div class="d-flex align-items-center gap-2 mb-1">
						<div class="badge-glass primary">TỔNG QUAN</div>
						<div class="badge-glass warning" v-if="courseData?.categoryName">
							<Bookmark :size="12" class="me-1" /> {{ courseData.categoryName }}
						</div>
						<div v-if="courseData?.level" class="badge-glass info">
							<Layers :size="12" class="me-1" />
							{{ getLevelLabel(courseData.level) }}
						</div>
					</div>
					<h1 class="title-gradient h4 mb-0">Thông Tin Khóa Học</h1>
				</div>
			</div>
			<div class="header-actions">
				<ol class="breadcrumb-glass">
					<li class="breadcrumb-item">
						<RouterLink to="/admin/courses">Danh sách</RouterLink>
					</li>
					<li class="breadcrumb-item active">Chi tiết</li>
				</ol>
			</div>
		</div>

		<div v-if="isLoading" class="container-fluid mt-4">
			<div class="row">
				<div class="col-lg-8">
					<div class="skeleton-banner glass mb-4"></div>
					<div class="skeleton-content glass p-4">
						<div class="skeleton-line w-50 mb-4"></div>
						<div class="skeleton-line w-100 mb-2"></div>
						<div class="skeleton-line w-100 mb-2"></div>
						<div class="skeleton-line w-75 mb-5"></div>
						<div
							v-for="i in 3"
							:key="i"
							class="skeleton-module-row glass mb-3"
						></div>
					</div>
				</div>
				<div class="col-lg-4">
					<div class="skeleton-sidebar glass p-4"></div>
				</div>
			</div>
		</div>

		<div v-else-if="courseData" class="container-fluid mt-4 pb-5">
			<div class="row g-4">
				<div class="col-xl-8 col-lg-8 animate-slide-up">
					<div class="preview-main-card glass overflow-hidden shadow-glow">
						<div class="preview-banner-container">
							<img
								v-if="courseData.coverImageUrl"
								:src="getImageUrl(courseData.coverImageUrl)"
								class="preview-banner"
							/>
							<div v-else class="preview-banner-placeholder">
								<ImageIcon :size="48" class="text-tertiary" />
								<span>Không có ảnh bìa</span>
							</div>
							<div class="banner-overlay"></div>
							<div class="banner-badge">
								<span
									class="badge-glass"
									:class="courseData.isPublished ? 'success' : 'warning'"
								>
									{{ courseData.isPublished ? "Đang xuất bản" : "Bản nháp" }}
								</span>
							</div>
						</div>

						<div class="preview-body p-4 p-md-5">
							<h2 class="preview-title mb-4 fw-black title-gradient">
								{{ courseData.title }}
							</h2>

							<div class="desc-section">
								<div class="section-tag mb-2">MÔ TẢ KHÓA HỌC</div>
								<p class="preview-desc text-secondary">
									{{
										courseData.description ||
										"Chưa có mô tả chi tiết cho khóa học này."
									}}
								</p>
							</div>

							<div class="course-meta-grid-premium mt-4 mb-5">
								<div class="meta-item-glass">
									<div class="m-icon red"><Calendar :size="18" /></div>
									<div class="m-data">
										<span class="m-label">ĐĂNG KÝ TỪ</span>
										<span class="m-value">{{
											formatDate(courseData.enrollStartDate)
										}}</span>
									</div>
								</div>
								<div class="meta-item-glass">
									<div class="m-icon red"><Calendar :size="18" /></div>
									<div class="m-data">
										<span class="m-label">HẠN ĐĂNG KÝ</span>
										<span class="m-value">{{
											formatDate(courseData.enrollEndDate)
										}}</span>
									</div>
								</div>
								<div class="meta-item-glass">
									<div class="m-icon purple"><Clock :size="18" /></div>
									<div class="m-data">
										<span class="m-label">HẠN HOÀN THÀNH</span>
										<span class="m-value">{{
											courseData.completionDeadlineDays
												? `${courseData.completionDeadlineDays} ngày sau ĐK`
												: formatDate(courseData.completionEndDate)
										}}</span>
									</div>
								</div>
								<div class="meta-item-glass">
									<div class="m-icon green"><Award :size="18" /></div>
									<div class="m-data">
										<span class="m-label">ĐIỂM ĐẠT</span>
										<span class="m-value text-success"
											>{{ courseData.passScore }}%</span
										>
									</div>
								</div>
							</div>

							<div class="sylllabus-section mt-5">
								<div
									class="d-flex justify-content-between align-items-center mb-4"
								>
									<h4 class="syllabus-title h5 mb-0">
										<CheckCircle :size="18" class="text-primary me-2" />Giáo
										trình chi tiết
									</h4>
									<span class="badge-glass dark"
										>{{ syllabus.length }} Chương</span
									>
								</div>

								<div class="accordion-syllabus">
									<div
										v-for="(module, index) in syllabus"
										:key="module.id"
										class="module-glass-card mb-3"
										:class="{ expanded: isModuleExpanded(module.id, index) }"
									>
										<div
											class="module-header p-4"
											@click="toggleModule(module.id)"
										>
											<div
												class="d-flex justify-content-between align-items-center w-100"
											>
												<div class="d-flex align-items-center gap-3">
													<div class="module-number">{{ index + 1 }}</div>
													<h5 class="mb-0 fw-bold">{{ module.title }}</h5>
												</div>
												<div class="d-flex align-items-center gap-3">
													<span class="badge-glass primary sm"
														>{{ module.lessons.length }} Bài</span
													>
													<ChevronUp
														v-if="isModuleExpanded(module.id, index)"
														:size="18"
														class="text-primary"
													/>
													<ChevronDown
														v-else
														:size="18"
														class="text-secondary"
													/>
												</div>
											</div>
										</div>

										<div
											v-show="isModuleExpanded(module.id, index)"
											class="module-content-wrap"
										>
											<div class="lessons-list">
												<div
													v-for="lesson in module.lessons"
													:key="lesson.id"
													class="lesson-glass-item"
												>
													<div class="lesson-info-box">
														<div class="lesson-type-icon">
															<PlayCircle
																v-if="lesson.type === 'Video'"
																:size="18"
																class="text-primary"
															/>
															<FileText v-else :size="18" class="text-info" />
														</div>
														<div class="lesson-text">
															<span
																class="lesson-title fw-semibold cursor-pointer"
																@click="goToLesson(lesson)"
																>{{ lesson.title }}</span
															>

															<div class="d-flex gap-2 mt-1 flex-wrap">
																<span
																	v-if="lesson.documents.length > 0"
																	class="doc-tag"
																>
																	<Paperclip :size="12" />
																	{{ lesson.documents.length }} Tài liệu
																</span>
																<span
																	v-if="lesson.hasQuiz"
																	class="doc-tag bg-warning-light text-warning-dark"
																>
																	<HelpCircle :size="12" /> Bài tập:
																	{{ lesson.quizQuestionCount }} câu |
																	{{ lesson.quizPassScore }}%
																</span>
															</div>
														</div>
													</div>

													<div class="lesson-actions-box">
														<button
															v-if="isEnrolled"
															class="badge-neon success me-3"
															@click="goToLesson(lesson)"
														>
															VÀO HỌC
														</button>
														<button
															v-else
															class="badge-neon warning me-3"
															@click="handleAction"
														>
															ĐĂNG KÝ
														</button>

														<span class="lesson-duration"
															><Clock :size="14" />
															{{ formatDuration(lesson.durationSeconds) }}</span
														>
													</div>
												</div>
											</div>
										</div>
									</div>

									<div
										v-if="courseData.finalQuiz"
										class="module-glass-card mt-4 border-success expanded"
									>
										<div class="module-header p-4 bg-success-light">
											<div
												class="d-flex justify-content-between align-items-center w-100"
											>
												<div class="d-flex align-items-center gap-3">
													<div class="module-number bg-success text-white">
														<Trophy :size="16" />
													</div>
													<div>
														<h5 class="mb-0 fw-bold text-success">
															{{
																courseData.finalQuiz.title ||
																"Bài thi cuối khóa lấy chứng chỉ"
															}}
														</h5>
														<div class="d-flex gap-3 mt-1">
															<span class="text-muted fs-12"
																><FileText :size="12" />
																{{ courseData.finalQuiz.questionCount }} câu bốc
																thi</span
															>
															<span class="text-muted fs-12"
																><Clock :size="12" />
																{{ courseData.finalQuiz.timeLimitMinutes }}
																phút</span
															>
															<span class="text-success fs-12 fw-bold"
																><Award :size="12" /> Đạt:
																{{ courseData.finalQuiz.passScore }}%</span
															>
														</div>
													</div>
												</div>
												<span class="badge-glass success sm">Bắt buộc</span>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div
					class="col-xl-4 col-lg-4 animate-slide-up"
					style="animation-delay: 0.1s"
				>
					<div class="sidebar-sticky">
						<div class="stat-card-premium glass p-4 shadow-glow">
							<div class="price-header text-center mb-4">
								<div class="huge-text-gradient">MIỄN PHÍ</div>
								<div class="text-muted small fw-bold">
									DÀNH CHO NHÂN VIÊN HỆ THỐNG
								</div>
							</div>

							<button class="btn-neon lg w-100 mb-4" @click="handleAction">
								<component
									:is="
										isEnrolled
											? PlayCircle
											: isElective
												? Bookmark
												: GraduationCap
									"
									:size="20"
								/>
								{{
									isEnrolled
										? "VÀO HỌC NGAY"
										: isElective
											? "ĐĂNG KÝ KHÓA HỌC"
											: "GHI DANH NGAY"
								}}
							</button>

							<div class="info-list-glass">
								<div class="info-row">
									<div class="info-label"><Bookmark :size="16" /> Danh mục</div>
									<div class="info-value fw-bold text-primary">
										{{ courseData.categoryName || "Chưa phân loại" }}
									</div>
								</div>
								<div class="info-row">
									<div class="info-label"><Clock :size="16" /> Thời lượng</div>
									<div class="info-value">{{ totalDurationFormatted }}</div>
								</div>
								<div class="info-row">
									<div class="info-label">
										<Layout :size="16" /> Tổng bài học
									</div>
									<div class="info-value">{{ totalLessonsCount }} Bài</div>
								</div>
								<div class="info-row" v-if="courseData.finalQuiz">
									<div class="info-label"><Trophy :size="16" /> Đánh giá</div>
									<div class="info-value text-success">
										Bài thi Final ({{ courseData.finalQuiz.passScore }}%)
									</div>
								</div>
								<div class="info-row">
									<div class="info-label"><Layers :size="16" /> Cấp độ</div>
									<div class="info-value">
										{{ getLevelLabel(courseData.level) }}
									</div>
								</div>
								<div class="info-row">
									<div class="info-label"><Users :size="16" /> Học viên</div>
									<div class="info-value">
										{{ courseData.enrollmentCount || 0 }}
									</div>
								</div>
								<div class="info-row">
									<div class="info-label"><User :size="16" /> Giảng viên</div>
									<div class="info-value">
										{{ courseData.createdByName || "Admin" }}
									</div>
								</div>
								<div class="info-row no-border">
									<div class="info-label">
										<CheckCircle :size="16" /> Đặc quyền
									</div>
									<div class="info-value text-success fw-bold">
										Chứng nhận hoàn thành
									</div>
								</div>
							</div>

							<div class="mt-4 pt-4 border-top border-light">
								<div
									class="d-flex align-items-center gap-2 text-muted fw-bold small"
								>
									<Globe :size="14" /> TRUY CẬP TRỌN ĐỜI
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<Transition name="modal">
			<div
				v-if="previewData.videoUrl"
				class="glass-modal-overlay"
				@click.self="previewData.videoUrl = ''"
			>
				<div class="glass-modal-container glass shadow-lg">
					<div class="glass-modal-header p-3 px-4">
						<div class="d-flex align-items-center gap-2">
							<PlayCircle :size="20" class="text-primary" />
							<h5 class="mb-0 fw-black small-caps text-white">
								{{ previewData.title }}
							</h5>
						</div>
						<button class="btn-close-glass" @click="previewData.videoUrl = ''">
							<X :size="20" />
						</button>
					</div>
					<div class="glass-modal-body bg-black">
						<div class="ratio ratio-16x9">
							<iframe
								v-if="previewData.isYoutube"
								:src="previewData.videoUrl"
								allowfullscreen
							></iframe>
							<video
								v-else
								:src="previewData.videoUrl"
								controls
								autoplay
							></video>
						</div>
					</div>
				</div>
			</div>
		</Transition>
	</div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import { RouterLink, useRouter, useRoute } from "vue-router";
import { courseAPI, enrollmentAPI, quizAPI } from "@/services/api";
import { toast } from "vue3-toastify";
import {
	ChevronUp,
	ChevronDown,
	PlayCircle,
	FileText,
	Paperclip,
	Clock,
	GraduationCap,
	Users,
	User,
	Image as ImageIcon,
	CheckCircle,
	Globe,
	Layout,
	X,
	HelpCircle,
	Trophy,
	Bookmark,
	Calendar,
	Award,
	Layers,
} from "lucide-vue-next";

const router = useRouter();
const route = useRoute();
const courseId = route.params.id as string;

const isLoading = ref(true);
const courseData = ref<any>(null);
const isEnrolled = ref(false);

const isElective = computed(() => {
	return courseData.value?.level === 3;
});

interface DocumentFile {
	id: number;
	fileName: string;
}
interface Lesson {
	id: number;
	title: string;
	type: "Video" | "Text";
	durationSeconds: number;
	isFreePreview: boolean;
	videoUrl: string;
	documents: DocumentFile[];
	hasQuiz: boolean;
	quizQuestionCount?: number;
	quizPassScore?: number;
}
interface Module {
	id: number;
	title: string;
	lessons: Lesson[];
}

const syllabus = ref<Module[]>([]);

const formatDuration = (seconds: number) => {
	if (!seconds || seconds === 0) return "00:00";
	const m = Math.floor(seconds / 60)
		.toString()
		.padStart(2, "0");
	const s = (seconds % 60).toString().padStart(2, "0");
	return `${m}:${s}`;
};

const formatDate = (dateString: string) => {
	if (!dateString) return "Không giới hạn";
	const date = new Date(dateString);
	if (isNaN(date.getTime())) return "Không giới hạn";
	return date.toLocaleDateString("vi-VN");
};

const getLevelLabel = (level: number) => {
	switch (level) {
		case 1:
			return "Cấp 1: Người mới";
		case 2:
			return "Cấp 2: Phòng ban";
		case 3:
			return "Cấp 3: Tự chọn";
		default:
			return "Cấp 3: Tự chọn";
	}
};

const getImageUrl = (url: string) => {
	if (!url) return "";
	if (url.startsWith("http")) return url;
	return `${import.meta.env.VITE_API_URL || "http://localhost:5100"}${url.startsWith("/") ? "" : "/"}${url}`;
};

const totalLessonsCount = computed(() => {
	return syllabus.value.reduce((acc, mod) => acc + mod.lessons.length, 0);
});

const totalDurationFormatted = computed(() => {
	const totalSeconds = syllabus.value.reduce((acc, mod) => {
		return (
			acc + mod.lessons.reduce((lAcc, l) => lAcc + (l.durationSeconds || 0), 0)
		);
	}, 0);

	const h = Math.floor(totalSeconds / 3600);
	const m = Math.floor((totalSeconds % 3600) / 60);
	return h > 0 ? `${h} giờ ${m} phút` : `${m} phút`;
});

const previewData = ref({ title: "", videoUrl: "", isYoutube: false });

onMounted(async () => {
	isLoading.value = true;
	try {
		const res = await courseAPI.getById(courseId);
		courseData.value = res.data;

		if (courseData.value.modules && courseData.value.modules.length > 0) {
			const loadedModules = [];
			for (const m of courseData.value.modules) {
				const loadedLessons = [];
				for (const l of m.lessons || []) {
					const quizDetails = { questionCount: 0, passScore: 0 };
					if (l.quizId) {
						try {
							const qRes = await quizAPI.getById(l.quizId);
							quizDetails.questionCount = qRes.data.questions?.length || 0;
							quizDetails.passScore = qRes.data.passScore || 0;
						} catch {}
					}

					loadedLessons.push({
						id: l.id,
						title: l.title,
						type: l.type || "Video",
						durationSeconds:
							l.type === "Video"
								? l.videoDurationSeconds || 0
								: l.readingDurationSeconds || 0,
						isFreePreview: l.isFreePreview || false,
						videoUrl: l.videoUrl || "",
						documents: (l.attachments || []).map((d: any) => ({
							id: d.id,
							fileName: d.fileName || d.title || "Tài liệu",
						})),
						hasQuiz: !!l.quizId,
						quizQuestionCount: quizDetails.questionCount,
						quizPassScore: quizDetails.passScore,
					});
				}
				loadedModules.push({
					id: m.id,
					title: m.title,
					lessons: loadedLessons,
				});
			}
			syllabus.value = loadedModules;
		}

		if (courseData.value.finalQuizId) {
			try {
				const resQuiz = await quizAPI.getById(courseData.value.finalQuizId);
				courseData.value.finalQuiz = resQuiz.data;
			} catch {}
		}

		// Kiểm tra trạng thái ghi danh
		try {
			const enrollRes = await enrollmentAPI.getByCourse(courseId);
			if (enrollRes.data) {
				isEnrolled.value = true;
			}
		} catch {
			isEnrolled.value = false;
		}
	} catch (error: any) {
		toast.error("Không tìm thấy khóa học này!");
		if (error.response && error.response.status === 404) {
			router.push("/admin/courses");
		}
	} finally {
		isLoading.value = false;
	}
});

const handleAction = async () => {
	if (isEnrolled.value) {
		router.push(`/learn/${courseId}`);
		return;
	}

	await enrollCourse();
};

const goToLesson = (lesson: any) => {
	if (isEnrolled.value) {
		router.push(`/learn/${courseId}?lessonId=${lesson.id}`);
	} else {
		toast.info("Vui lòng đăng ký khóa học để bắt đầu bài học này.");
	}
};

const enrollCourse = async () => {
	try {
		await enrollmentAPI.enroll(courseId);
		isEnrolled.value = true;
		toast.success("Đăng ký khóa học thành công!");
		// Sau khi đăng ký xong mới cho vào học
		router.push(`/learn/${courseId}`);
	} catch (error: any) {
		toast.error(error.response?.data?.message || "Đã xảy ra lỗi khi đăng ký.");
	}
};

const expandedModules = ref<Record<number, boolean>>({});
const toggleModule = (moduleId: number) => {
	expandedModules.value[moduleId] = !expandedModules.value[moduleId];
};
const isModuleExpanded = (moduleId: number, index: number) => {
	if (expandedModules.value[moduleId] === undefined) {
		return index === 0;
	}
	return expandedModules.value[moduleId];
};
</script>

<style scoped>
.course-about-premium {
	min-height: 100vh;
}

.glass {
	background: var(--bg-card);
	backdrop-filter: blur(20px);
	-webkit-backdrop-filter: blur(20px);
	border: 1px solid var(--border-color);
}

.title-gradient {
	background: linear-gradient(90deg, var(--text-primary), #4f46e5, #a855f7);
	background-clip: text;
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
}

.huge-text-gradient {
	font-size: 2.25rem;
	font-weight: 900;
	background: linear-gradient(135deg, #4f46e5, #a855f7);
	background-clip: text;
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
}

.badge-glass {
	padding: 5px 12px;
	border-radius: 30px;
	font-size: 11px;
	font-weight: 800;
	letter-spacing: 0.5px;
	display: inline-flex;
	align-items: center;
	text-transform: uppercase;
}
.badge-glass.primary {
	background: rgba(99, 102, 241, 0.1);
	color: #4f46e5;
}
.badge-glass.info {
	background: rgba(14, 165, 233, 0.1);
	color: #0ea5e9;
}
.badge-glass.success {
	background: rgba(16, 185, 129, 0.1);
	color: #10b981;
}

.badge-glass.warning {
	background: rgba(245, 158, 11, 0.1);
	color: #b45309;
}
.badge-glass.dark {
	background: rgba(0, 0, 0, 0.6);
	color: white;
}
.badge-glass.sm {
	scale: 0.85;
	transform-origin: center right;
}

.badge-neon {
	padding: 4px 10px;
	border-radius: 8px;
	font-size: 10px;
	font-weight: 900;
	border: none;
	cursor: pointer;
	transition: all 0.2s;
}
.badge-neon.success {
	background: #10b981;
	color: white;
	box-shadow: 0 4px 10px rgba(16, 185, 129, 0.3);
}
.badge-neon.success:hover {
	transform: scale(1.05);
	box-shadow: 0 6px 15px rgba(16, 185, 129, 0.4);
}

.course-meta-grid-premium {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
	gap: 15px;
}
.meta-item.doc-tag {
	display: inline-flex;
	align-items: center;
	gap: 4px;
	padding: 3px 10px;
	background: rgba(99, 102, 241, 0.1);
	color: #6366f1;
	border-radius: 6px;
	font-size: 11px;
	font-weight: 700;
	border: 1px solid rgba(99, 102, 241, 0.2);
}

:is([data-bs-theme="dark"], [data-theme="dark"]) .doc-tag {
	background: rgba(99, 102, 241, 0.2) !important;
	color: #818cf8 !important;
	border-color: rgba(99, 102, 241, 0.4) !important;
}

:is([data-bs-theme="dark"], [data-theme="dark"]) .doc-tag.bg-warning-light {
	background: rgba(245, 158, 11, 0.15) !important;
	color: #fbbf24 !important;
	border-color: rgba(245, 158, 11, 0.3) !important;
}
.meta-item-glass {
	display: flex;
	align-items: center;
	gap: 12px;
	padding: 15px;
	background: var(--bg-secondary);
	border: 1px solid var(--border-color);
	border-radius: 16px;
	backdrop-filter: blur(10px);
}

.m-icon {
	width: 36px;
	height: 36px;
	border-radius: 10px;
	display: flex;
	align-items: center;
	justify-content: center;
}
.m-icon.red {
	background: rgba(239, 68, 68, 0.1);
	color: #ef4444;
}
.m-icon.purple {
	background: rgba(139, 92, 246, 0.1);
	color: #8b5cf6;
}
.m-icon.green {
	background: rgba(16, 185, 129, 0.1);
	color: #10b981;
}

.m-label {
	display: block;
	font-size: 9px;
	font-weight: 800;
	color: #94a3b8;
	letter-spacing: 0.5px;
}
.m-value {
	font-size: 13px;
	font-weight: 700;
	color: var(--text-primary);
}

.page-header-premium {
	padding: 1.5rem 0;
	display: flex;
	justify-content: space-between;
	align-items: center;
	border-bottom: 1px solid rgba(0, 0, 0, 0.05);
	margin-bottom: 1rem;
}

.header-content {
	display: flex;
	align-items: center;
	gap: 1rem;
}
.header-icon-box {
	width: 50px;
	height: 50px;
	border-radius: 16px;
	background: var(--bg-card);
	border: 1px solid var(--border-color);
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 10px 25px rgba(0, 0, 0, 0.03);
}

.breadcrumb-glass {
	display: flex;
	gap: 8px;
	list-style: none;
	margin: 0;
	padding: 6px 16px;
	background: var(--bg-card);
	border-radius: 30px;
	border: 1px solid var(--border-color);
}

.breadcrumb-item a {
	color: #64748b;
	font-weight: 600;
	text-decoration: none;
}
.breadcrumb-item.active {
	color: #1e293b;
	font-weight: 800;
}

.preview-main-card {
	border-radius: 28px;
}
.preview-banner-container {
	height: 380px;
	position: relative;
	width: 100%;
}
.preview-banner {
	width: 100%;
	height: 100%;
	object-fit: cover;
}
.preview-banner-placeholder {
	width: 100%;
	height: 100%;
	background: #f1f5f9;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 1rem;
	color: #94a3b8;
	font-weight: 700;
}
.banner-overlay {
	position: absolute;
	inset: 0;
	background: linear-gradient(180deg, transparent 50%, rgba(0, 0, 0, 0.6) 100%);
}
.banner-badge {
	position: absolute;
	top: 20px;
	right: 20px;
	z-index: 2;
}
.preview-title {
	font-size: 2.25rem;
	line-height: 1.2;
	letter-spacing: -1px;
}
.section-tag {
	font-size: 11px;
	font-weight: 900;
	color: #94a3b8;
	letter-spacing: 2px;
}
.preview-desc {
	font-size: 1.05rem;
	line-height: 1.7;
	font-weight: 500;
}

.module-glass-card {
	border-radius: 20px;
	border: 1px solid rgba(0, 0, 0, 0.04);
	background: rgba(255, 255, 255, 0.4);
	overflow: hidden;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.module-glass-card.expanded {
	background: white;
	border-color: rgba(79, 70, 229, 0.2);
	box-shadow: 0 10px 30px rgba(0, 0, 0, 0.02);
}
.module-header {
	cursor: pointer;
	transition: background 0.2s;
}
.module-header:hover {
	background: rgba(255, 255, 255, 0.8);
}

.module-number {
	width: 32px;
	height: 32px;
	border-radius: 10px;
	background: #f1f5f9;
	color: #1e293b;
	display: flex;
	align-items: center;
	justify-content: center;
	font-weight: 900;
	font-size: 13px;
}

.lesson-glass-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 1.25rem 2rem;
	border-top: 1px solid rgba(0, 0, 0, 0.03);
	transition: all 0.2s;
}
.lesson-glass-item:hover {
	background: rgba(79, 70, 229, 0.02);
	padding-left: 2.5rem;
}

.lesson-info-box {
	display: flex;
	gap: 1rem;
	align-items: flex-start;
}
.lesson-type-icon {
	margin-top: 2px;
}
.lesson-text {
	display: flex;
	flex-direction: column;
}
.lesson-title {
	color: #334155;
	font-size: 0.95rem;
}

.doc-tag {
	font-size: 0.75rem;
	color: #64748b;
	font-weight: 700;
	background: #eff6ff;
	padding: 2px 8px;
	border-radius: 6px;
}
.bg-warning-light {
	background-color: #fffdf5 !important;
}
.text-warning-dark {
	color: #b45309 !important;
}
.bg-success-light {
	background-color: #f0fff4 !important;
}

.lesson-actions-box {
	display: flex;
	align-items: center;
}
.lesson-duration {
	font-size: 12px;
	font-weight: 700;
	color: var(--text-tertiary);
	display: flex;
	align-items: center;
	gap: 4px;
}

:is([data-bs-theme="dark"], [data-theme="dark"]) .lesson-duration {
	color: var(--text-secondary) !important;
}

.sidebar-sticky {
	position: sticky;
	top: 100px;
}
.stat-card-premium {
	border-radius: 28px;
	border: 1px solid white;
}
.info-list-glass {
	display: flex;
	flex-direction: column;
	gap: 4px;
}
.info-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 12px 0;
	border-bottom: 1px solid rgba(0, 0, 0, 0.03);
}
.info-row.no-border {
	border-bottom: none;
}
.info-label {
	display: flex;
	align-items: center;
	gap: 10px;
	color: var(--text-secondary);
	font-weight: 600;
}
.info-value {
	color: var(--text-primary);
	font-weight: 700;
}

:is([data-bs-theme="dark"], [data-theme="dark"]) .info-label {
	color: #94a3b8 !important;
}
:is([data-bs-theme="dark"], [data-theme="dark"]) .info-value {
	color: #f8fafc !important;
}

.btn-neon {
	padding: 0.9rem 1.5rem;
	border-radius: 16px;
	font-weight: 900;
	font-size: 0.9rem;
	border: none;
	color: white;
	background: linear-gradient(135deg, #6366f1, #4f46e5);
	box-shadow: 0 10px 20px rgba(79, 70, 229, 0.3);
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 12px;
	transition: all 0.3s;
}
.btn-neon:hover {
	transform: translateY(-3px);
	box-shadow: 0 15px 30px rgba(79, 70, 229, 0.4);
}

.glass-modal-overlay {
	position: fixed;
	inset: 0;
	z-index: 10000;
	background: rgba(15, 23, 42, 0.85);
	backdrop-filter: blur(25px);
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 20px;
}
.glass-modal-container {
	width: 100%;
	max-width: 900px;
	border-radius: 30px;
	overflow: hidden;
	background: #0f172a;
	border: 1px solid rgba(255, 255, 255, 0.1);
}

:is([data-bs-theme="dark"], [data-theme="dark"]) .doc-tag {
	background: rgba(99, 102, 241, 0.2) !important;
	color: #818cf8 !important;
	border-color: rgba(99, 102, 241, 0.4) !important;
}

:is([data-bs-theme="dark"], [data-theme="dark"]) .doc-tag.bg-warning-light {
	background: rgba(245, 158, 11, 0.15) !important;
	color: #fbbf24 !important;
	border-color: rgba(245, 158, 11, 0.3) !important;
}

:is([data-bs-theme="dark"], [data-theme="dark"])
	.stat-card-premium
	.text-muted {
	color: #a5b4fc !important;
	opacity: 0.8;
}

:is([data-bs-theme="dark"], [data-theme="dark"]) .meta-item-glass {
	background: rgba(30, 41, 59, 0.6);
	border-color: rgba(255, 255, 255, 0.08);
}

:is([data-bs-theme="dark"], [data-theme="dark"]) .module-glass-card {
	background: var(--bg-secondary) !important;
	border-color: var(--border-color) !important;
}

:is([data-bs-theme="dark"], [data-theme="dark"]) .lesson-glass-item:hover {
	background: var(--bg-tertiary);
}

.glass-modal-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}
.btn-close-glass {
	background: rgba(255, 255, 255, 0.1);
	border: none;
	color: white;
	width: 36px;
	height: 36px;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.2s;
}
.btn-close-glass:hover {
	background: #ef4444;
}

.skeleton-banner {
	height: 380px;
	width: 100%;
	border-radius: 28px;
	background: linear-gradient(90deg, #f1f5f9 25%, #f8fafc 50%, #f1f5f9 75%);
	background-size: 200% 100%;
	animation: shimmer 1.5s infinite;
}
.skeleton-line {
	height: 12px;
	border-radius: 6px;
	background: #e2e8f0;
}
.skeleton-module-row {
	height: 70px;
	border-radius: 16px;
	background: #f1f5f9;
}
.skeleton-sidebar {
	height: 450px;
	border-radius: 28px;
	background: #f1f5f9;
}
@keyframes shimmer {
	0% {
		background-position: -200% 0;
	}
	100% {
		background-position: 200% 0;
	}
}

.animate-fade-in {
	animation: fadeIn 0.6s ease-out forwards;
}
.animate-slide-up {
	animation: slideInUp 0.7s cubic-bezier(0.4, 0, 0.2, 1) backwards;
}
@keyframes fadeIn {
	from {
		opacity: 0;
	}
	to {
		opacity: 1;
	}
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

.modal-enter-active,
.modal-leave-active {
	transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.modal-enter-from,
.modal-leave-to {
	opacity: 0;
	scale: 0.9;
	transform: translateY(20px);
}
.small-caps {
	font-variant: small-caps;
	letter-spacing: 0.5px;
}
</style>
