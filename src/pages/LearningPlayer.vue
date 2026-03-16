<template>
	<div
		class="learning-player"
		:class="{ 'sidebar-collapsed': isSidebarCollapsed }"
	>
		<div v-if="loading" class="player-loading">
			<div class="loading-spinner"></div>
			<p>Đang tải bài học...</p>
		</div>

		<div v-else-if="error" class="player-error card glass">
			<AlertCircle
				:size="48"
				style="
					color: var(--danger-400);
					opacity: 0.6;
					margin-bottom: var(--space-md);
				"
			/>
			<h3>{{ error }}</h3>
			<button class="btn btn-primary" @click="$router.back()">
				← Quay lại
			</button>
		</div>

		<template v-else-if="lesson">
			<header class="player-header-bar glass">
				<div class="header-left">
					<button
						class="btn-icon btn-ghost"
						@click="$router.push(`/admin/courses`)"
						title="Thoát"
					>
						<X :size="20" />
					</button>
					<div class="course-info">
						<h1 class="course-name">{{ course?.title }}</h1>
						<div class="lesson-breadcrumb">
							<span>{{ activeModuleName }}</span>
							<ChevronRight :size="12" />
							<span class="active-lesson">{{ lesson?.title }}</span>
						</div>
					</div>
				</div>

				<div class="header-right">
					<div class="progress-stats">
						<div class="stats-text">
							Tiến độ:
							<span
								>{{ Math.round(courseProgress?.progressPercent || 0) }}%</span
							>
						</div>
						<div class="progress-mini-bar">
							<div
								class="progress-mini-fill"
								:style="{
									width: Math.round(courseProgress?.progressPercent || 0) + '%',
								}"
							></div>
						</div>
					</div>
					<button class="btn btn-secondary btn-sm" @click="toggleSidebar">
						<LayoutList :size="16" />
						<span class="hide-mobile">{{
							isSidebarCollapsed ? "Mở danh sách" : "Thu gọn"
						}}</span>
					</button>
				</div>
			</header>

			<div class="player-container">
				<aside
					class="player-sidebar glass"
					:class="{ collapsed: isSidebarCollapsed }"
				>
					<div class="sidebar-header">
						<h3>Nội dung khóa học</h3>
						<button
							class="btn-icon btn-ghost sm hide-desktop"
							@click="isSidebarCollapsed = true"
						>
							<X :size="16" />
						</button>
					</div>
					<div class="sidebar-content custom-scrollbar">
						<div
							v-for="(mod, mi) in course?.modules"
							:key="mod.id"
							class="module-group"
							:class="{ open: expandedModules.has(mod.id) }"
						>
							<div class="module-item" @click="toggleModule(mod.id)">
								<div class="module-meta">
									<span class="module-index">Chương {{ mi + 1 }}</span>
									<component
										:is="
											expandedModules.has(mod.id) ? ChevronDown : ChevronRight
										"
										:size="16"
									/>
								</div>
								<h4 class="module-title">{{ mod.title }}</h4>
								<div class="module-stats">{{ mod.lessons.length }} bài học</div>
							</div>

							<div class="lesson-list" v-show="expandedModules.has(mod.id)">
								<template v-for="l in mod.lessons" :key="l.id">
									<div
										class="lesson-item"
										:class="{
											active: l.id === lesson?.id && activeTab !== 'quiz',
											completed: isLessonDone(l.id),
											locked: !canAccess(l),
										}"
										@click="navigateLesson(l, 'overview')"
									>
										<div class="lesson-status">
											<CheckCircle
												v-if="isLessonDone(l.id)"
												:size="16"
												class="done-icon"
											/>
											<Circle v-else :size="16" class="todo-icon" />
										</div>
										<div class="lesson-info">
											<span class="l-title">{{ l.title }}</span>
											<div class="l-meta">
												<component
													:is="l.type === 'Video' ? Video : FileText"
													:size="12"
												/>
												<span>{{
													l.type === "Video"
														? formatTime(l.videoDurationSeconds)
														: "Bài đọc"
												}}</span>
											</div>
										</div>
									</div>

									<div
										v-if="l.hasQuiz"
										class="lesson-item quiz-sub-item"
										:class="{
											active: l.id === lesson?.id && activeTab === 'quiz',
											locked: !canAccess(l),
										}"
										@click="navigateLesson(l, 'quiz')"
									>
										<div class="lesson-status">
											<CheckCircle
												v-if="isLessonDone(l.id)"
												:size="14"
												class="done-icon"
											/>
											<HelpCircle v-else :size="14" class="todo-icon" />
										</div>
										<div class="lesson-info">
											<span class="l-title text-primary fw-medium"
												>Bài tập:
												{{ l.quiz?.title || "Củng cố kiến thức" }}</span
											>
											<div class="l-meta text-primary opacity-75">
												<HelpCircle :size="12" />
												<span
													>{{ l.quiz?.questions?.length || 0 }} câu hỏi</span
												>
											</div>
										</div>
									</div>
								</template>
							</div>
						</div>

						<div
							v-if="course?.finalQuizId"
							class="module-group"
							:class="{ active: $route.name === 'Quiz' }"
						>
							<div
								class="lesson-item quiz-item final-quiz-item"
								:class="{ completed: courseProgress?.quizPassed }"
								@click="router.push(`/quiz/${course.finalQuizId}`)"
							>
								<div class="lesson-status">
									<CheckCircle
										v-if="courseProgress?.quizPassed"
										:size="18"
										class="done-icon"
									/>
									<ClipboardList v-else :size="18" class="text-warning" />
								</div>
								<div class="lesson-info">
									<span class="l-title fw-bold text-dark"
										>Bài thi cuối khóa</span
									>
									<span class="l-meta text-warning fw-bold"
										>Kiểm tra tổng hợp</span
									>
								</div>
							</div>
						</div>
					</div>
				</aside>

				<main class="player-content">
					<div class="content-primary">
						<div class="video-theater glass">
							<div class="video-container" v-if="lesson?.type === 'Video'">
								<template v-if="isYouTubeUrl(lesson?.videoUrl)">
									<iframe
										:src="getEmbedUrl(lesson?.videoUrl)"
										frameborder="0"
										allow="
											accelerometer;
											autoplay;
											clipboard-write;
											encrypted-media;
											gyroscope;
											picture-in-picture;
										"
										allowfullscreen
										class="video-iframe"
									></iframe>
								</template>
								<template v-else>
									<div
										v-if="lesson?.videoStatus === 'Processing'"
										class="video-processing-state glass flex-center flex-column"
									>
										<div class="processing-glow mb-3"></div>
										<h3 class="processing-title">
											Bài giảng đang được xử lý...
										</h3>
										<p class="processing-sub">
											Vui lòng chờ giây lát, hệ thống đang tối ưu video cho bạn.
										</p>
									</div>
									<video
										v-else-if="lesson?.videoUrl"
										:src="
											lesson.videoStatus === 'Ready' &&
											lesson.videoUrl.endsWith('.m3u8')
												? null
												: getFullMediaUrl(lesson.videoUrl)
										"
										ref="videoRef"
										controls
										controlsList="nodownload"
										class="video-item"
										@timeupdate="onTimeUpdate"
										@loadedmetadata="onVideoLoaded"
										@seeking="onSeeking"
										@seeked="onSeeked"
									></video>
									<div v-else class="no-video">Chưa tải dữ liệu video</div>
								</template>
							</div>
							<div class="text-player card" v-else-if="lesson?.type === 'Text'">
								<div
									class="text-content-wrap custom-scrollbar"
									v-html="lesson?.content"
								></div>
							</div>
						</div>

						<div class="content-tabs-container glass" ref="tabsContainer">
							<div class="tabs-header">
								<button
									v-for="tab in availableTabs"
									:key="tab.id"
									class="tab-btn"
									:class="{ active: activeTab === tab.id }"
									@click="activeTab = tab.id"
								>
									<component :is="tab.icon" :size="16" />
									{{ tab.label }}
									<span
										v-if="tab.id === 'resources' && lesson?.attachments?.length"
										class="tab-badge"
									>
										{{ lesson.attachments.length }}
									</span>
								</button>
							</div>

							<div class="tab-content-area custom-scrollbar">
								<div
									v-if="activeTab === 'overview'"
									class="tab-pane animate-fade-in"
								>
									<div class="lesson-intro">
										<div class="intro-header">
											<h2>{{ lesson?.title }}</h2>

											<button
												v-if="!isCompleted && lesson?.type === 'Video'"
												class="btn btn-primary"
												@click="completeLesson"
												:disabled="savingProgress || !isVideoWatchedEnough"
											>
												<CheckCircle :size="16" />
												{{
													isVideoWatchedEnough
														? savingProgress
															? "Đang lưu..."
															: "Hoàn thành bài học"
														: "Hãy xem hết video để hoàn thành"
												}}
											</button>

											<button
												v-else-if="!isCompleted && lesson?.type !== 'Video'"
												class="btn btn-primary"
												@click="completeLesson"
												:disabled="savingProgress"
											>
												<CheckCircle :size="16" />
												{{
													savingProgress ? "Đang lưu..." : "Hoàn thành bài học"
												}}
											</button>

											<div v-else class="completed-msg">
												<CheckCircle :size="18" /> Đã hoàn thành
											</div>
										</div>
										<div
											class="lesson-desc"
											v-html="
												lesson?.description ||
												'Chưa có mô tả chi tiết cho bài học này.'
											"
										></div>
									</div>
								</div>

								<div
									v-if="activeTab === 'quiz'"
									class="tab-pane animate-fade-in"
								>
									<div
										v-if="!quizStarted && !quizResult"
										class="text-center py-5"
									>
										<HelpCircle :size="64" class="text-warning mb-3" />
										<h3 class="fw-bold mb-2 text-dark">
											{{ lesson?.quiz?.title || "Bài Tập Củng Cố" }}
										</h3>
										<p class="text-muted mb-4">
											Bạn có
											<strong
												>{{ lesson?.quiz?.questions?.length || 0 }} câu
												hỏi</strong
											>
											cần hoàn thành.<br />
											Điểm tối thiểu cần đạt:
											<strong>{{ lesson?.quiz?.passScore || 0 }} điểm</strong>.
										</p>
										<button
											class="btn btn-primary btn-lg"
											@click="startMiniQuiz"
										>
											<PlayCircle :size="20" class="me-2" /> Bắt Đầu Làm Bài
										</button>
									</div>

									<div
										v-else-if="quizStarted && !quizResult"
										class="quiz-active-area"
									>
										<div
											class="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3"
										>
											<h5 class="fw-bold text-primary m-0">Đang làm bài...</h5>
											<span class="text-muted fs-14"
												>Đã chọn: {{ Object.keys(selectedAnswers).length }} /
												{{ lesson?.quiz?.questions?.length }}</span
											>
										</div>

										<div
											v-for="(q, index) in lesson?.quiz?.questions"
											:key="q.id"
											class="card glass mb-4 p-4 border-0 shadow-sm"
										>
											<h6 class="fw-bold text-dark lh-base mb-4">
												<span class="text-primary me-2"
													>Câu {{ index + 1 }}:</span
												>
												{{ q.questionText }}
												<span class="badge bg-light text-muted ms-2 fw-normal"
													>{{ q.points }} điểm</span
												>
											</h6>

											<div class="options-list d-flex flex-column gap-2">
												<label
													v-for="(optText, optKey) in q.options"
													:key="optKey"
													class="opt-label d-flex align-items-center p-3 rounded border cursor-pointer transition-all"
													:class="{
														'bg-primary-light border-primary':
															selectedAnswers[q.id] === optKey,
													}"
												>
													<input
														type="radio"
														:name="'q_' + q.id"
														:value="optKey"
														v-model="selectedAnswers[q.id]"
														class="me-3 form-check-input"
														style="transform: scale(1.2)"
													/>
													<span class="fw-bold me-2">{{ optKey }}.</span>
													<span class="fs-15">{{ optText }}</span>
												</label>
											</div>
										</div>

										<div class="text-end mt-4">
											<button
												class="btn btn-success btn-lg px-5 shadow-sm"
												@click="submitMiniQuiz"
												:disabled="
													Object.keys(selectedAnswers).length <
													lesson?.quiz?.questions?.length
												"
											>
												<CheckCircle :size="20" class="me-2" /> Nộp Bài
											</button>
										</div>
									</div>

									<div v-else-if="quizResult" class="text-center py-5">
										<div
											v-if="quizResult.passed"
											class="congratulations-box p-4 rounded bg-success-light border border-success mb-4 d-inline-block w-100"
											style="max-width: 600px"
										>
											<h2 class="text-success fw-bold mb-3">
												Làm bài xuất sắc!
											</h2>
											<div class="fs-5 text-dark mb-2">
												Điểm của bạn:
												<strong class="fs-3">{{ quizResult.score }}</strong> /
												{{ quizResult.totalScore }}
											</div>
											<div
												class="d-flex justify-content-center gap-3 flex-wrap mt-3"
											>
												<button
													v-if="nextLesson"
													class="btn btn-outline-success px-4 fw-bold"
													@click="goToNextLesson"
												>
													Bài tiếp theo <ChevronRight :size="18" />
												</button>
											</div>
										</div>

										<div v-else>
											<Trophy :size="72" class="text-danger mb-3" />
											<h2 class="fw-black mb-2 text-danger">
												RẤT TIẾC, BẠN CHƯA ĐẠT!
											</h2>
											<div class="fs-5 text-muted mb-4">
												Điểm của bạn:
												<strong class="text-dark fs-3">{{
													quizResult.score
												}}</strong>
												/ {{ quizResult.totalScore }}
											</div>
											<div class="d-flex justify-content-center gap-3">
												<button
													class="btn btn-outline-danger px-4 fw-bold"
													@click="retryMiniQuiz"
												>
													<RotateCcw :size="18" class="me-2" /> Làm lại bài
												</button>
											</div>
										</div>
									</div>
								</div>

								<div
									v-if="activeTab === 'resources'"
									class="tab-pane animate-fade-in"
								>
									<div v-if="lesson?.attachments?.length" class="resource-list">
										<a
											v-for="att in lesson.attachments"
											:key="att.id"
											href="#"
											@click.prevent="downloadFile(att)"
											class="resource-item card"
											:style="
												isDownloading[att.id]
													? 'opacity: 0.6; pointer-events: none;'
													: ''
											"
										>
											<div class="res-icon">
												<div
													v-if="isDownloading[att.id]"
													class="dl-spinner"
												></div>
												<Paperclip :size="20" v-else />
											</div>
											<div class="res-info">
												<div class="res-name">{{ att.fileName }}</div>
												<div class="res-meta">
													<span
														v-if="isDownloading[att.id]"
														class="text-primary fw-bold"
														>Đang tải xuống...</span
													>
													<span v-else
														>{{ (att.fileSize / 1024).toFixed(1) }} KB</span
													>
												</div>
											</div>
											<Download
												:size="18"
												class="res-dl"
												v-if="!isDownloading[att.id]"
											/>
										</a>
									</div>
									<div v-else class="empty-state">
										<Paperclip :size="40" />
										<p>Không có tài nguyên đính kèm</p>
									</div>
								</div>

								<div v-if="activeTab === 'qa'" class="tab-pane animate-fade-in">
									<div class="qa-container">
										<div class="qa-input-box card glass">
											<textarea
												v-model="newQuestion"
												placeholder="Đặt câu hỏi về bài học này..."
											></textarea>
											<div class="qa-actions">
												<button
													class="btn btn-primary btn-sm"
													@click="postQuestion"
													:disabled="!newQuestion.trim()"
												>
													Gửi câu hỏi
												</button>
											</div>
										</div>

										<div class="qa-list" v-if="qaList.length">
											<div
												v-for="qa in qaList"
												:key="qa.id"
												class="qa-card card glass"
											>
												<div class="qa-main">
													<div
														class="user-avatar"
														:style="
															qa.userAvatar
																? {
																		backgroundImage: `url('${getAvatarUrl(qa.userAvatar)}')`,
																	}
																: {}
														"
													>
														{{ !qa.userAvatar ? qa.userName?.charAt(0) : "" }}
													</div>
													<div class="qa-body">
														<div class="qa-meta">
															<strong>{{ qa?.userName }}</strong>
															<span
																v-if="
																	qa?.userRole === 'Admin' ||
																	qa?.userRole === 'Instructor'
																"
																class="badge bg-primary ms-1"
																style="font-size: 9px; padding: 2px 6px"
																>GIẢNG VIÊN</span
															>
															• <span>{{ formatDate(qa?.createdAt) }}</span>
														</div>
														<p class="qa-text">{{ qa.content }}</p>
														<button
															class="reply-btn"
															@click="
																replyTo = replyTo === qa.id ? null : qa.id
															"
														>
															Trả lời
														</button>
													</div>
												</div>

												<div
													class="replies-section"
													v-if="qa.replies?.length || replyTo === qa.id"
												>
													<div
														v-if="replyTo === qa.id"
														class="reply-input-wrap"
													>
														<textarea
															v-model="replyContent"
															placeholder="Viết phản hồi..."
														></textarea>
														<button
															class="btn btn-primary btn-sm"
															@click="postReply(qa.id)"
														>
															Gửi
														</button>
													</div>
													<div
														v-for="reply in qa.replies"
														:key="reply.id"
														class="reply-item"
													>
														<div
															class="user-avatar sm"
															:style="
																reply.userAvatar
																	? {
																			backgroundImage: `url('${getAvatarUrl(reply.userAvatar)}')`,
																		}
																	: {}
															"
														>
															{{
																!reply.userAvatar
																	? reply.userName?.charAt(0)
																	: ""
															}}
														</div>
														<div class="qa-body">
															<div class="qa-meta">
																<strong>{{ reply?.userName }}</strong>
																<span
																	v-if="
																		reply?.userRole === 'Admin' ||
																		reply?.userRole === 'Instructor'
																	"
																	class="badge bg-primary ms-1"
																	style="font-size: 9px; padding: 2px 6px"
																	>GIẢNG VIÊN</span
																>
																•
																<span>{{ formatDate(reply?.createdAt) }}</span>
															</div>
															<p class="qa-text">{{ reply.content }}</p>
														</div>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>

								<div
									v-if="activeTab === 'notes'"
									class="tab-pane animate-fade-in"
								>
									<div class="notes-container">
										<div class="note-input card glass">
											<textarea
												v-model="newNote"
												placeholder="Ghi chú cá nhân (chỉ mình bạn thấy)..."
											></textarea>
											<button
												class="btn btn-secondary btn-sm"
												@click="saveNote"
												:disabled="!newNote.trim()"
											>
												Lưu ghi chú
											</button>
										</div>
										<div class="notes-list" v-if="notes.length">
											<div
												v-for="note in notes"
												:key="note.id"
												class="note-item card glass"
											>
												<div
													v-if="note.videoTimestampSeconds"
													class="note-time"
													@click="seekVideo(note.videoTimestampSeconds)"
												>
													<Video :size="12" />
													{{ formatTime(note.videoTimestampSeconds) }}
												</div>
												<p>{{ note.content }}</p>
												<button
													class="delete-note"
													@click="deleteNote(note.id)"
												>
													<Trash2 :size="14" />
												</button>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					<div class="content-footer-nav glass">
						<button
							class="btn btn-ghost"
							@click="navigatePrev"
							:disabled="!prevLesson"
						>
							<ChevronLeft :size="18" /> Bài trước
						</button>
						<div class="footer-lesson-info hide-mobile">
							Đang xem: <span>{{ lesson?.title }}</span>
						</div>
						<button
							class="btn btn-primary"
							@click="goToNextLesson"
							v-if="nextLesson"
						>
							Bài tiếp theo <ChevronRight :size="18" />
						</button>
						<button
							class="btn btn-success"
							v-else-if="course?.quizId"
							@click="router.push(`/quiz/${course.quizId}`)"
						>
							Làm bài thi cuối khóa <ClipboardList :size="18" />
						</button>
					</div>
				</main>
			</div>
		</template>

		<teleport to="body">
			<div v-if="showCourseCompletedModal" class="glass-modal-overlay">
				<div
					class="congratulations-box p-5 rounded bg-white text-center shadow-lg animate-slide-up"
					style="max-width: 500px; z-index: 9999"
				>
					<Award :size="80" class="text-success mb-3 animate-bounce mx-auto" />
					<h2 class="text-success fw-bold mb-3">🎉 HOÀN THÀNH KHÓA HỌC! 🎉</h2>
					<p class="text-secondary mb-4 fs-15">
						Bạn đã hoàn thành xuất sắc toàn bộ nội dung của khóa học này. Hệ
						thống đang tiến hành đánh giá và lưu trữ thành tích.
					</p>

					<div v-if="isIssuingCert" class="text-primary mb-4 fw-bold">
						<div class="spinner-border spinner-border-sm me-2"></div>
						Đang khởi tạo chứng chỉ...
					</div>

					<div class="d-flex justify-content-center gap-3 mt-4">
						<button
							class="btn btn-outline-secondary px-4 fw-bold"
							@click="showCourseCompletedModal = false"
						>
							Đóng lại
						</button>
						<button
							class="btn btn-success px-4 fw-bold shadow-sm"
							@click="$router.push('/certificates')"
							:disabled="isIssuingCert"
						>
							<Award :size="18" class="me-2" /> Xem Chứng Chỉ
						</button>
					</div>
				</div>
			</div>
		</teleport>
	</div>
</template>

<script setup>
import {
	ref,
	onMounted,
	computed,
	watch,
	nextTick,
	onBeforeUnmount,
} from "vue";
import { useRoute, useRouter } from "vue-router";
// @ts-ignore
import api, {
	courseAPI,
	progressAPI,
	qaAPI,
	noteAPI,
	lessonAPI,
	certificateAPI,
	quizAPI,
} from "@/services/api";
import {
	AlertCircle,
	CheckCircle,
	ChevronRight,
	ChevronLeft,
	ChevronDown,
	ClipboardList,
	Paperclip,
	MessageCircle,
	StickyNote,
	Trash2,
	Download,
	X,
	LayoutList,
	Video,
	FileText,
	Circle,
	Info,
	HelpCircle,
	Trophy,
	RotateCcw,
	Award,
	PlayCircle,
} from "lucide-vue-next";
import { toast } from "vue3-toastify";
import { useAuthStore } from "@/stores/auth";
import Hls from "hls.js";
import * as signalR from "@microsoft/signalr";

const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();

// Data
const course = ref(null);
const lesson = ref(null);
const lessonProgresses = ref([]);
const courseProgress = ref(null);
const qaList = ref([]);
const notes = ref([]);
const loading = ref(true);
const error = ref(null);
const savingProgress = ref(false);
const videoRef = ref(null);
const tabsContainer = ref(null);

// --- STATE QUẢN LÝ VIDEO (CHỐNG TUA & RESUME) ---
const maxWatchedTime = ref(0);
const lastSavedTime = ref(0);
const preSeekTime = ref(0);
const lastCurrentTime = ref(0); // Theo dõi thời gian xem liên tục
const isSeeking = ref(false);
const isVideoWatchedEnough = ref(false); // Cờ bật nút hoàn thành
let saveProgressInterval = null; // Timer lưu tiến độ

const currentModuleId = ref(null);
const isDownloading = ref({});
const showCourseCompletedModal = ref(false);
const isIssuingCert = ref(false);
const isSidebarCollapsed = ref(false);
const expandedModules = ref(new Set());
const activeTab = ref("overview");

// Dynamic Tabs
const availableTabs = computed(() => {
	const baseTabs = [
		{ id: "overview", label: "Tổng quan", icon: Info },
		{ id: "resources", label: "Tài nguyên", icon: Paperclip },
		{ id: "qa", label: "Hỏi đáp", icon: MessageCircle },
		{ id: "notes", label: "Ghi chú", icon: StickyNote },
	];
	if (lesson.value?.hasQuiz) {
		baseTabs.splice(1, 0, { id: "quiz", label: "Bài tập", icon: HelpCircle });
	}
	return baseTabs;
});

// Inputs
const newQuestion = ref("");
const newNote = ref("");
const replyTo = ref(null);
const replyContent = ref("");

// Quiz State
const quizStarted = ref(false);
const quizResult = ref(null);
const selectedAnswers = ref({});
const isLoadingQuizDetails = ref(false);
let signalrConnection = null;

// Computed
const isCompleted = computed(() =>
	lessonProgresses.value.some(
		(lp) => lp.lessonId === lesson.value?.id && lp.isCompleted,
	),
);

const activeModuleName = computed(() => {
	const mod = course.value?.modules.find((m) =>
		m.lessons.some((l) => l.id === lesson.value?.id),
	);
	return mod?.title || "";
});

const nextLesson = computed(() => {
	if (!course.value || !lesson.value) return null;
	const allLessons = course.value.modules.flatMap((m) => m.lessons);
	const idx = allLessons.findIndex((l) => l.id === lesson.value.id);
	return idx < allLessons.length - 1 ? allLessons[idx + 1] : null;
});

const prevLesson = computed(() => {
	if (!course.value || !lesson.value) return null;
	const allLessons = course.value.modules.flatMap((m) => m.lessons);
	const idx = allLessons.findIndex((l) => l.id === lesson.value.id);
	return idx > 0 ? allLessons[idx - 1] : null;
});

function toggleSidebar() {
	isSidebarCollapsed.value = !isSidebarCollapsed.value;
}

function toggleModule(id) {
	if (expandedModules.value.has(id)) expandedModules.value.delete(id);
	else expandedModules.value.add(id);
}

// ══════════════════════════════════════════════════════
// 1. TƯ DUY LOAD DATA & CHẶN NHẢY CÓC (SEQUENTIAL LEARNING)
// ══════════════════════════════════════════════════════
async function loadData() {
	const { courseId, lessonId } = route.params;
	loading.value = true;
	error.value = null;

	try {
		// 1. Lấy Data Khóa Học & Tiến độ
		const [courseRes, progressRes] = await Promise.all([
			courseAPI.getById(courseId),
			progressAPI.getLessonProgresses(courseId),
		]);

		// Map dữ liệu Course
		if (courseRes.data.modules) {
			courseRes.data.modules = courseRes.data.modules.map((m) => ({
				...m,
				lessons: m.lessons.map((l) => {
					return {
						...l,
						hasQuiz: !!l.quizId,
						quizId: l.quizId,
						quiz: null,
					};
				}),
			}));
		}

		course.value = courseRes.data;
		lessonProgresses.value = progressRes.data;

		const allLessons = course.value.modules?.flatMap((m) => m.lessons) ?? [];
		const targetLesson = allLessons.find(
			(l) => String(l.id) === String(lessonId),
		);

		if (!targetLesson) {
			error.value = `Không tìm thấy bài học.`;
			return;
		}

		// 2. LOGIC CHẶN NHẢY CÓC (Kiểm tra quyền truy cập)
		if (!canAccess(targetLesson)) {
			toast.warning(
				"Bạn phải hoàn thành bài học trước đó mới được xem bài này!",
			);
			// Tìm bài học cuối cùng mà user có thể học (đang học dở)
			const lastAccessibleLesson = [...allLessons]
				.reverse()
				.find((l) => canAccess(l));
			if (lastAccessibleLesson) {
				router.replace(`/learn/${courseId}/${lastAccessibleLesson.id}`);
				return;
			}
		}

		// Gán lesson hiện tại
		lesson.value = targetLesson;

		// Tìm Module chứa bài học này để mở (Expand) menu
		const activeMod = course.value.modules.find((m) =>
			m.lessons.some((l) => l.id === lesson.value.id),
		);
		if (activeMod) {
			expandedModules.value.add(activeMod.id);
			currentModuleId.value = activeMod.id;
		}

		// Reset State Video
		maxWatchedTime.value = 0;
		lastSavedTime.value = 0;
		isVideoWatchedEnough.value =
			isCompleted.value || lesson.value.type !== "Video";
		if (saveProgressInterval) clearInterval(saveProgressInterval);

		// Xử lý các tab
		activeTab.value = route.query.tab || "overview";
		quizStarted.value = false;
		quizResult.value = null;
		selectedAnswers.value = {};

		await refreshProgress(false);
		loadQA();
		loadNotes();

		if (activeTab.value === "quiz" && lesson.value.hasQuiz) {
			await loadQuizDetails();
		}
	} catch (e) {
		error.value = "Lỗi tải dữ liệu.";
	} finally {
		loading.value = false;
		nextTick(() => {
			setupHls();
			setupSignalR();
		});
	}
}

function setupHls() {
	if (
		!videoRef.value ||
		!lesson.value?.videoUrl ||
		!lesson.value.videoUrl.endsWith(".m3u8")
	)
		return;

	const video = videoRef.value;
	const url = getFullMediaUrl(lesson.value.videoUrl);

	if (Hls.isSupported()) {
		const hls = new Hls();
		hls.loadSource(url);
		hls.attachMedia(video);
	} else if (video.canPlayType("application/vnd.apple.mpegurl")) {
		video.src = url;
	}
}

async function setupSignalR() {
	if (signalrConnection) return;

	signalrConnection = new signalR.HubConnectionBuilder()
		.withUrl("/hubs/video")
		.withAutomaticReconnect()
		.build();

	signalrConnection.on("VideoStatusUpdated", (lessonId, status, videoUrl) => {
		if (lesson.value && lesson.value.id === lessonId) {
			lesson.value.videoStatus = status;
			lesson.value.videoUrl = videoUrl;
			if (status === "Ready") {
				toast.success("Video đã xử lý xong! Bạn có thể xem ngay.");
				nextTick(() => setupHls());
			}
		}
	});

	try {
		await signalrConnection.start();
		if (lesson.value) {
			await signalrConnection.invoke("JoinLessonGroup", lesson.value.id);
		}
	} catch (err) {
		console.error("SignalR Connection Error: ", err);
	}
}

// Hàm xác định quyền mở khóa bài học (Chặn nhảy cóc)
function canAccess(l) {
	if (authStore.user?.role === "Admin") return true;

	const allLessons = course.value.modules.flatMap((m) => m.lessons);
	const idx = allLessons.findIndex((x) => x.id === l.id);

	// Bài đầu tiên LUÔN mở, bài Học thử LUÔN mở
	if (idx === 0 || l.isFreePreview) return true;

	// Nếu là bài thứ 2 trở đi, bài LIỀN TRƯỚC (idx - 1) phải done mới mở
	return isLessonDone(allLessons[idx - 1].id);
}

function isLessonDone(id) {
	return lessonProgresses.value.some(
		(lp) => lp.lessonId === id && lp.isCompleted,
	);
}

// ══════════════════════════════════════════════════════
// 2. TƯ DUY XỬ LÝ VIDEO (RESUME & ANTI-SKIP)
// ══════════════════════════════════════════════════════
function onVideoLoaded(e) {
	const video = e.target;
	const currentProgress = lessonProgresses.value.find(
		(lp) => lp.lessonId === lesson.value?.id,
	);

	if (currentProgress) {
		if (currentProgress.isCompleted) {
			// 1. Đã hoàn thiện: Bắt đầu từ 0, thoải mái tua (skip logic do isCompleted override)
			video.currentTime = 0;
			maxWatchedTime.value = 0;
			lastCurrentTime.value = 0;
		} else {
			// 2. Chưa hoàn thiện: Bắt đầu từ videoPositionSeconds
			const resumeTime = currentProgress.videoPositionSeconds || 0;
			if (resumeTime > 0) {
				maxWatchedTime.value = resumeTime;
				lastCurrentTime.value = resumeTime;
				video.currentTime = resumeTime;
			}
		}
	} else {
		// 3. Chưa có trong mảng: Bắt đầu từ 0
		maxWatchedTime.value = 0;
		lastCurrentTime.value = 0;
	}

	// Thiết lập Auto-save tiến độ mỗi 10 giây
	saveProgressInterval = setInterval(() => {
		if (
			video.currentTime > 0 &&
			Math.abs(video.currentTime - lastSavedTime.value) > 5
		) {
			syncVideoProgress(video.currentTime, video.duration);
		}
	}, 10000);
}

// Khi user nhấn chuột lên thanh thời gian
function onSeeking(e) {
	if (!isSeeking.value) {
		// preSeekTime phải là vị trí TRƯỚC khi nhảy seek bar
		preSeekTime.value = lastCurrentTime.value;
	}
	isSeeking.value = true;
}

// Khi user buông chuột (Check chống tua)
function onSeeked(e) {
	const video = e.target;
	isSeeking.value = false;

	// 1. Nếu đã hoàn thành bài học: Không block gì cả
	if (isCompleted.value) return;

	// 2. Nếu là tua về (lùi thời gian): Cho phép thoải mái
	if (video.currentTime < preSeekTime.value) {
		lastCurrentTime.value = video.currentTime;
		return;
	}

	// 3. Nếu là tua nhanh NHƯNG không vượt quá mốc đã xem (+ 2s buffer): Cho phép
	if (video.currentTime <= maxWatchedTime.value + 2) {
		lastCurrentTime.value = video.currentTime;
		return;
	}

	// 4. Các trường hợp khác (Tua nhanh vượt quá mốc đã xem): Block và kéo về vị trí cũ
	toast.warning("Bạn không được phép tua qua nội dung chưa xem!");
	video.currentTime = preSeekTime.value;
}

function onTimeUpdate(e) {
	const video = e.target;
	const current = video.currentTime;

	// Cập nhật vị trí xem liên tục (giả định xem bt nếu increment nhỏ < 3s)
	if (!isSeeking.value && Math.abs(current - lastCurrentTime.value) < 3) {
		lastCurrentTime.value = current;
	}

	if (isSeeking.value) return;

	// Tránh race condition: Chỉ tăng maxWatchedTime nếu nhảy bước nhỏ (playback bình thường)
	if (current > maxWatchedTime.value) {
		if (current - maxWatchedTime.value < 3) {
			maxWatchedTime.value = current;
		}
	}

	// Điều kiện để bật nút Hoàn Thành (Xem được 95% thời lượng)
	if (
		!isCompleted.value &&
		video.duration > 0 &&
		current >= video.duration * 0.95
	) {
		isVideoWatchedEnough.value = true;
	}
}

function syncVideoProgress(currentSeconds, duration) {
	if (isCompleted.value || currentSeconds <= 0 || !duration) return;
	const percent = Math.floor((currentSeconds / duration) * 100);
	progressAPI.updateVideoPosition(
		lesson.value.id,
		Math.floor(currentSeconds),
		percent,
	);
	lastSavedTime.value = currentSeconds;
}

function seekVideo(seconds) {
	if (videoRef.value && seconds !== null) {
		// Ép nới lỏng maxWatchedTime để video cho phép seek đến Note
		if (seconds > maxWatchedTime.value) maxWatchedTime.value = seconds;
		videoRef.value.currentTime = seconds;
		videoRef.value.play();
		window.scrollTo({ top: 0, behavior: "smooth" });
	}
}

onBeforeUnmount(async () => {
	if (saveProgressInterval) clearInterval(saveProgressInterval);
	if (signalrConnection) {
		if (lesson.value)
			await signalrConnection.invoke("LeaveLessonGroup", lesson.value.id);
		await signalrConnection.stop();
	}
});

// ══════════════════════════════════════════════════════
// 3. TƯ DUY QUIZ
// ══════════════════════════════════════════════════════
async function loadQuizDetails() {
	if (!lesson.value || !lesson.value.quizId || lesson.value.quiz) return;

	isLoadingQuizDetails.value = true;
	try {
		const res = await quizAPI.getById(lesson.value.quizId);
		lesson.value.quiz = {
			title: res.data.title || "Bài kiểm tra nhanh",
			passScore: 5,
			questions: (res.data.questions || []).map((q) => ({
				id: q.id,
				questionText: q.questionText,
				options: { A: q.optionA, B: q.optionB, C: q.optionC, D: q.optionD },
				correctAnswer: q.correctAnswer,
				points: 1,
			})),
		};
	} catch (e) {
		console.error("Lỗi lấy chi tiết Quiz: ", e);
	} finally {
		isLoadingQuizDetails.value = false;
	}
}

watch(
	() => activeTab.value,
	async (newTab) => {
		if (newTab === "quiz" && lesson.value?.hasQuiz && !lesson.value?.quiz) {
			await loadQuizDetails();
		}
	},
);

watch(
	() => route.query.tab,
	(newTab) => {
		if (newTab && newTab !== activeTab.value) {
			activeTab.value = newTab;
			nextTick(() => {
				if (tabsContainer.value)
					tabsContainer.value.scrollIntoView({
						behavior: "smooth",
						block: "start",
					});
			});
		}
	},
);

function startMiniQuiz() {
	if (!lesson.value.quiz) return;
	quizStarted.value = true;
	quizResult.value = null;
	selectedAnswers.value = {};
}

function submitMiniQuiz() {
	const questions = lesson.value.quiz?.questions || [];
	const n = questions.length;
	if (n === 0) return;

	let correctCount = 0;
	questions.forEach((q) => {
		if (selectedAnswers.value[q.id] === q.correctAnswer) correctCount++;
	});

	const rawScore = (correctCount / n) * 10;
	const finalScore = Math.round(rawScore * 10) / 10;
	const passed = finalScore >= 5; // Pass bắt buộc là 5

	quizResult.value = { score: finalScore, totalScore: 10, passed: passed };

	if (passed && !isCompleted.value) completeLesson();
}

function retryMiniQuiz() {
	quizStarted.value = false;
	quizResult.value = null;
}

// ══════════════════════════════════════════════════════
// 4. CÁC HÀM CƠ BẢN KHÁC
// ══════════════════════════════════════════════════════

async function completeLesson() {
	savingProgress.value = true;
	try {
		await progressAPI.complete(lesson.value.id);
		await refreshProgress(true);
		toast.success("Đã hoàn thành bài học!");
		if (nextLesson.value) setTimeout(goToNextLesson, 1500);
	} finally {
		savingProgress.value = false;
	}
}

async function refreshProgress(fetchLessonProgress = true) {
	try {
		const { data: cp } = await progressAPI.getCourseProgress(
			route.params.courseId,
		);
		courseProgress.value = cp;

		if (cp.isCompleted) {
			const storageKey = `modal_shown_${route.params.courseId}`;
			if (!sessionStorage.getItem(storageKey)) {
				showCourseCompletedModal.value = true;
				sessionStorage.setItem(storageKey, "true");
			}
		}

		if (fetchLessonProgress) {
			const { data: lp } = await progressAPI.getLessonProgresses(
				route.params.courseId,
			);
			lessonProgresses.value = lp;
		}
	} catch (error) {
		console.error("Lỗi đồng bộ:", error);
	}
}

async function triggerCourseCompletion() {
	showCourseCompletedModal.value = true;
	isIssuingCert.value = true;
	try {
		await certificateAPI.issue(route.params.courseId);
		toast.success("Chúc mừng! Chứng chỉ đã được cấp.");
	} catch (e) {
		console.error("Lỗi khi cấp chứng chỉ:", e);
	} finally {
		isIssuingCert.value = false;
	}
}

async function downloadFile(att) {
	if (isDownloading.value[att.id]) return;
	isDownloading.value[att.id] = true;
	try {
		const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5100";
		const absoluteUrl = `${baseUrl.replace(/\/$/, "")}/api/modules/${currentModuleId.value}/lessons/attachments/${att.id}/download`;
		const response = await api.get(absoluteUrl, { responseType: "blob" });
		const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
		const link = document.createElement("a");
		link.href = blobUrl;
		link.setAttribute("download", att.fileName);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		window.URL.revokeObjectURL(blobUrl);
	} catch (error) {
		alert("Không thể tải tài liệu.");
	} finally {
		isDownloading.value[att.id] = false;
	}
}

function navigateLesson(l, targetTab = "overview") {
	if (canAccess(l)) {
		router.push({
			path: `/learn/${route.params.courseId}/${l.id}`,
			query: { tab: targetTab },
		});
	}
}
function goToNextLesson() {
	if (nextLesson.value) navigateLesson(nextLesson.value, "overview");
}
function navigatePrev() {
	if (prevLesson.value) navigateLesson(prevLesson.value, "overview");
}

async function postQuestion() {
	if (!newQuestion.value.trim()) return;
	await qaAPI.create(lesson.value.id, { content: newQuestion.value });
	newQuestion.value = "";
	loadQA();
}

async function postReply(parentId) {
	if (!replyContent.value.trim()) return;
	await qaAPI.create(lesson.value.id, {
		content: replyContent.value,
		parentId,
	});
	replyContent.value = "";
	replyTo.value = null;
	loadQA();
}

async function saveNote() {
	if (!newNote.value.trim()) return;
	let timestamp = null;
	if (lesson.value?.type === "Video" && videoRef.value) {
		timestamp = Math.floor(videoRef.value.currentTime);
	}
	await noteAPI.create(lesson.value.id, {
		content: newNote.value,
		videoTimestampSeconds: timestamp,
	});
	newNote.value = "";
	loadNotes();
}

async function deleteNote(id) {
	await noteAPI.delete(lesson.value.id, id);
	loadNotes();
}

async function loadQA() {
	const { data } = await qaAPI.getAll(route.params.lessonId);
	qaList.value = data;
}

async function loadNotes() {
	const { data } = await noteAPI.getAll(route.params.lessonId);
	notes.value = data;
}

function isYouTubeUrl(url) {
	return url?.includes("youtube.com") || url?.includes("youtu.be");
}
function getFullMediaUrl(url) {
	return url?.startsWith("http")
		? url
		: `http://localhost:5100${url?.startsWith("/") ? "" : "/"}${url}`;
}
function getEmbedUrl(url) {
	if (!url) return "";
	const ytMatch = url.match(
		/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/,
	);
	return ytMatch ? `https://www.youtube.com/embed/${ytMatch[1]}` : url;
}
function formatTime(s) {
	return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
}
function formatDate(d) {
	return new Date(d).toLocaleDateString("vi-VN");
}
function getAvatarUrl(url) {
	return url?.startsWith("http")
		? url
		: `${import.meta.env.VITE_API_URL}${url}`;
}

onMounted(loadData);
watch(() => route.params.lessonId, loadData);
</script>

<style scoped>
/* ========================================================
   GIỮ NGUYÊN TOÀN BỘ CSS CSS CỦA BẠN (Đã Copy đầy đủ)
======================================================== */
.learning-player {
	background: var(--bg-primary);
	min-height: 100vh;
	display: flex;
	flex-direction: column;
	position: relative;
	overflow: hidden;
}
.player-header-bar {
	height: 60px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 var(--space-lg);
	z-index: 1000;
	border-bottom: 1px solid var(--border-color);
}
.header-left {
	display: flex;
	align-items: center;
	gap: var(--space-md);
}
.course-info {
	display: flex;
	flex-direction: column;
}
.course-name {
	font-size: var(--font-size-base);
	font-weight: 700;
	margin: 0;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	max-width: 400px;
}
.lesson-breadcrumb {
	display: flex;
	align-items: center;
	gap: 4px;
	font-size: 11px;
	color: var(--text-tertiary);
}
.active-lesson {
	color: var(--primary-400);
	font-weight: 500;
}
.header-right {
	display: flex;
	align-items: center;
	gap: var(--space-xl);
}
.progress-stats {
	display: flex;
	flex-direction: column;
	gap: 4px;
	width: 140px;
}
.stats-text {
	font-size: 10px;
	color: var(--text-secondary);
	text-align: right;
}
.stats-text span {
	color: var(--text-primary);
	font-weight: 700;
}
.progress-mini-bar {
	width: 100%;
	height: 4px;
	background: var(--bg-tertiary);
	border-radius: 2px;
	overflow: hidden;
}
.progress-mini-fill {
	height: 100%;
	background: var(--gradient-primary);
	transition: width 0.5s ease;
}
.player-container {
	flex: 1;
	display: flex;
	height: calc(100vh - 60px);
	position: relative;
}
.player-content {
	flex: 1;
	display: flex;
	flex-direction: column;
	overflow-y: auto;
	background: rgba(0, 0, 0, 0.2);
	scroll-behavior: smooth;
}
.content-primary {
	flex: 1;
	max-width: 1000px;
	margin: 0 auto;
	width: 100%;
	padding: var(--space-lg) var(--space-xl);
	display: flex;
	flex-direction: column;
	gap: var(--space-lg);
}
.video-theater {
	width: 100%;
	aspect-ratio: 16/9;
	background: #000;
	border-radius: var(--radius-lg);
	overflow: hidden;
	box-shadow: var(--shadow-lg);
}
.video-container,
.video-item,
.video-iframe {
	width: 100%;
	height: 100%;
	border: none;
}
.text-player {
	height: 100%;
	padding: var(--space-xl);
	display: flex;
	flex-direction: column;
}
.text-content-wrap {
	overflow-y: auto;
	font-size: var(--font-size-base);
	line-height: 1.8;
	color: var(--text-secondary);
}
.content-tabs-container {
	background: var(--bg-card);
	border-radius: var(--radius-lg);
	display: flex;
	flex-direction: column;
	overflow: hidden;
	min-height: 400px;
}
.tabs-header {
	display: flex;
	border-bottom: 1px solid var(--border-color);
	padding: 0 var(--space-md);
	background: rgba(255, 255, 255, 0.02);
}
.tab-btn {
	padding: var(--space-md) var(--space-lg);
	background: none;
	border: none;
	font-size: var(--font-size-sm);
	color: var(--text-tertiary);
	display: flex;
	align-items: center;
	gap: 8px;
	cursor: pointer;
	position: relative;
	transition: all var(--transition-fast);
	font-weight: 500;
}
.video-processing-state {
	height: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	background: #0a0a0a;
	color: #fff;
	text-align: center;
	padding: var(--space-xl);
}
.processing-glow {
	width: 80px;
	height: 80px;
	border-radius: 50%;
	background: var(--gradient-primary);
	filter: blur(20px);
	animation: pulse-glow 2s infinite alternate;
}
@keyframes pulse-glow {
	from {
		transform: scale(0.8);
		opacity: 0.5;
	}
	to {
		transform: scale(1.2);
		opacity: 0.8;
	}
}
.processing-title {
	font-weight: 900;
	margin-bottom: 8px;
	font-size: 24px;
}
.processing-sub {
	color: rgba(255, 255, 255, 0.6);
	font-size: 14px;
}
.flex-center {
	display: flex;
	align-items: center;
	justify-content: center;
}
.flex-column {
	flex-direction: column;
}
.tab-btn:hover {
	color: var(--text-primary);
}
.tab-btn.active {
	color: var(--primary-400);
	font-weight: 600;
}
.tab-btn.active::after {
	content: "";
	position: absolute;
	bottom: -1px;
	left: var(--space-lg);
	right: var(--space-lg);
	height: 3px;
	background: var(--primary-500);
	border-radius: 3px 3px 0 0;
}
.tab-badge {
	font-size: 10px;
	background: var(--bg-tertiary);
	padding: 1px 6px;
	border-radius: 10px;
}
.tab-content-area {
	padding: var(--space-xl);
	flex: 1;
	overflow-y: auto;
}
.intro-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: var(--space-lg);
}
.completed-msg {
	display: flex;
	align-items: center;
	gap: 6px;
	color: var(--success-400);
	font-weight: 600;
	font-size: var(--font-size-sm);
}
.opt-label {
	background: rgba(0, 0, 0, 0.02);
}
.opt-label:hover {
	background: rgba(99, 102, 241, 0.05);
	border-color: rgba(99, 102, 241, 0.3) !important;
}
.bg-primary-light {
	background-color: rgba(99, 102, 241, 0.1) !important;
	border-color: rgba(99, 102, 241, 0.5) !important;
}
.cursor-pointer {
	cursor: pointer;
}
.transition-all {
	transition: all 0.2s ease-in-out;
}
.animate-bounce {
	animation: bounce 2s infinite;
}
@keyframes bounce {
	0%,
	20%,
	50%,
	80%,
	100% {
		transform: translateY(0);
	}
	40% {
		transform: translateY(-20px);
	}
	60% {
		transform: translateY(-10px);
	}
}
.glass-modal-overlay {
	position: fixed;
	inset: 0;
	background: rgba(15, 23, 42, 0.4);
	backdrop-filter: blur(8px);
	z-index: 2000;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 20px;
	animation: fadeIn 0.3s ease;
}
.animate-slide-up {
	animation: slide-up 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
}
@keyframes slide-up {
	from {
		opacity: 0;
		transform: translateY(20px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}
.player-sidebar {
	width: 350px;
	border-left: 1px solid var(--border-color);
	display: flex;
	flex-direction: column;
	transition:
		transform 0.3s ease,
		width 0.3s ease;
	background: var(--bg-secondary);
}
.player-sidebar.collapsed {
	width: 0;
	transform: translateX(100%);
	overflow: hidden;
}
.sidebar-header {
	padding: var(--space-lg);
	border-bottom: 1px solid var(--border-color);
}
.sidebar-header h3 {
	font-size: var(--font-size-base);
	font-weight: 700;
	margin: 0;
}
.sidebar-content {
	flex: 1;
	overflow-y: auto;
	padding: var(--space-sm) 0;
}
.module-group {
	border-bottom: 1px solid var(--border-color);
}
.module-item {
	padding: var(--space-md) var(--space-lg);
	cursor: pointer;
	background: rgba(255, 255, 255, 0.02);
	transition: background 0.2s;
}
.module-item:hover {
	background: rgba(255, 255, 255, 0.05);
}
.module-meta {
	display: flex;
	align-items: center;
	justify-content: space-between;
	font-size: 11px;
	color: var(--text-tertiary);
	margin-bottom: 4px;
}
.module-title {
	font-size: var(--font-size-sm);
	font-weight: 600;
	margin: 0 0 4px 0;
}
.module-stats {
	font-size: 10px;
	color: var(--text-tertiary);
}
.lesson-list {
	background: rgba(0, 0, 0, 0.2);
}
.lesson-item {
	padding: var(--space-md) var(--space-lg);
	display: flex;
	gap: var(--space-md);
	cursor: pointer;
	transition: all 0.2s;
	border-left: 3px solid transparent;
}
.lesson-item:hover {
	background: rgba(99, 102, 241, 0.05);
}
.lesson-item.active {
	background: rgba(99, 102, 241, 0.1);
	border-left-color: var(--primary-500);
}
.lesson-item.locked {
	opacity: 0.5;
	filter: grayscale(1);
	cursor: not-allowed;
}
.quiz-sub-item {
	padding-left: 45px;
	background: rgba(0, 0, 0, 0.05);
	border-left: 2px solid rgba(255, 255, 255, 0.05);
}
.quiz-sub-item:hover {
	background: rgba(99, 102, 241, 0.05);
}
.quiz-sub-item.active {
	background: rgba(99, 102, 241, 0.15);
	border-left-color: var(--primary-500);
}
.final-quiz-item {
	background: rgba(245, 158, 11, 0.05);
	border-left: 3px solid transparent;
}
.final-quiz-item.active {
	background: rgba(245, 158, 11, 0.15);
	border-left-color: var(--warning-500);
}
.lesson-status {
	flex-shrink: 0;
	margin-top: 2px;
}
.done-icon {
	color: var(--success-400);
}
.todo-icon {
	color: var(--border-color);
}
.l-title {
	font-size: var(--font-size-sm);
	color: var(--text-primary);
	display: block;
	line-height: 1.4;
	margin-bottom: 4px;
}
.l-meta {
	display: flex;
	align-items: center;
	gap: 6px;
	font-size: 10px;
	color: var(--text-tertiary);
}
.qa-card {
	margin-bottom: var(--space-md);
	padding: var(--space-md);
}
.qa-main {
	display: flex;
	gap: var(--space-md);
}
.user-avatar {
	width: 36px;
	height: 36px;
	border-radius: 50%;
	background: var(--bg-tertiary);
	display: flex;
	align-items: center;
	justify-content: center;
	font-weight: 700;
	color: #fff;
	background-size: cover;
	background-position: center;
	border: 2px solid var(--border-color);
}
.user-avatar.sm {
	width: 28px;
	height: 28px;
	font-size: 10px;
}
.qa-body {
	flex: 1;
}
.qa-meta {
	font-size: 11px;
	color: var(--text-tertiary);
	margin-bottom: 4px;
	display: flex;
	align-items: center;
	gap: 4px;
	flex-wrap: wrap;
}
.qa-text {
	font-size: var(--font-size-sm);
	color: var(--text-secondary);
	line-height: 1.5;
	margin-bottom: 8px;
}
.reply-btn {
	background: none;
	border: none;
	color: var(--primary-400);
	font-size: 11px;
	font-weight: 600;
	cursor: pointer;
}
.replies-section {
	margin-top: var(--space-md);
	padding-left: var(--space-xl);
	border-left: 2px solid var(--border-color);
	display: flex;
	flex-direction: column;
	gap: var(--space-md);
}
.reply-item {
	display: flex;
	gap: var(--space-md);
}
.qa-input-box textarea {
	width: 100%;
	height: 80px;
	padding: var(--space-md);
	border-radius: var(--radius-md);
	background: var(--bg-tertiary);
	color: var(--text-primary);
	border: 1px solid var(--border-color);
	resize: none;
}
.qa-actions {
	margin-top: var(--space-sm);
	display: flex;
	justify-content: flex-end;
}
.content-footer-nav {
	height: 64px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 var(--space-xl);
	border-top: 1px solid var(--border-color);
	background: rgba(25, 25, 62, 0.8);
	backdrop-filter: blur(10px);
}
.footer-lesson-info {
	font-size: var(--font-size-sm);
	color: var(--text-tertiary);
}
.footer-lesson-info span {
	color: var(--text-primary);
	font-weight: 600;
	margin-left: var(--space-sm);
}
.resource-item {
	display: flex;
	align-items: center;
	gap: var(--space-md);
	padding: var(--space-md);
	cursor: pointer;
	transition: transform 0.2s;
}
.resource-item:hover {
	transform: translateX(5px);
}
.res-icon {
	color: var(--primary-400);
}
.res-info {
	flex: 1;
}
.res-name {
	font-size: var(--font-size-sm);
	font-weight: 600;
}
.res-meta {
	font-size: 10px;
	color: var(--text-tertiary);
}
.res-dl {
	color: var(--text-tertiary);
}
.dl-spinner {
	width: 18px;
	height: 18px;
	border: 2px solid rgba(99, 102, 241, 0.3);
	border-top-color: var(--primary-500);
	border-radius: 50%;
	animation: spin 1s linear infinite;
}
.custom-scrollbar::-webkit-scrollbar {
	width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
	background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
	background: var(--border-color);
	border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
	background: var(--text-tertiary);
}
@media (max-width: 1200px) {
	.player-sidebar {
		width: 300px;
	}
}
@media (max-width: 1024px) {
	.player-sidebar {
		position: fixed;
		top: 60px;
		right: 0;
		bottom: 0;
		z-index: 2000;
		transform: translateX(0);
	}
	.player-sidebar.collapsed {
		transform: translateX(100%);
	}
	.hide-mobile {
		display: none;
	}
}
@media (max-width: 768px) {
	.player-header-bar {
		padding: 0 var(--space-sm);
	}
	.course-name {
		max-width: 150px;
		font-size: var(--font-size-sm);
	}
	.content-primary {
		padding: var(--space-md);
	}
	.tabs-header {
		overflow-x: auto;
		white-space: nowrap;
	}
	.tab-btn {
		padding: var(--space-md);
	}
}
.qa-container {
	display: flex;
	flex-direction: column;
	gap: var(--space-xl);
}
.qa-input-box {
	padding: var(--space-lg);
	border-radius: var(--radius-lg);
}
.qa-input-box textarea {
	width: 100%;
	height: 100px;
	padding: var(--space-md);
	background: rgba(0, 0, 0, 0.2);
	border: 1px solid var(--border-color);
	border-radius: var(--radius-md);
	color: var(--text-primary);
	resize: none;
	margin-bottom: var(--space-sm);
}
.qa-actions {
	display: flex;
	justify-content: flex-end;
}
.qa-list {
	display: flex;
	flex-direction: column;
	gap: var(--space-lg);
}
.qa-card {
	padding: var(--space-lg);
	border-radius: var(--radius-lg);
}
.qa-main {
	display: flex;
	gap: var(--space-md);
}
.user-avatar {
	width: 40px;
	height: 40px;
	border-radius: 50%;
	background: var(--bg-tertiary);
	display: flex;
	align-items: center;
	justify-content: center;
	font-weight: 700;
	color: #fff;
	background-size: cover;
	background-position: center;
	border: 2px solid var(--border-color);
	flex-shrink: 0;
}
.user-avatar.sm {
	width: 32px;
	height: 32px;
	font-size: 12px;
}
.qa-body {
	flex: 1;
}
.qa-meta strong {
	color: var(--text-primary);
}
.qa-text {
	font-size: var(--font-size-sm);
	line-height: 1.6;
	color: var(--text-secondary);
	margin-bottom: var(--space-sm);
}
.reply-btn {
	background: none;
	border: none;
	color: var(--primary-400);
	font-size: 12px;
	font-weight: 600;
	cursor: pointer;
	padding: 0;
}
.replies-section {
	margin-top: var(--space-md);
	padding-left: var(--space-xl);
	border-left: 2px solid var(--border-color);
	display: flex;
	flex-direction: column;
	gap: var(--space-lg);
}
.reply-item {
	display: flex;
	gap: var(--space-md);
}
.reply-input-wrap {
	display: flex;
	flex-direction: column;
	gap: var(--space-xs);
	margin-bottom: var(--space-md);
}
.reply-input-wrap textarea {
	width: 100%;
	height: 60px;
	padding: var(--space-sm);
	background: rgba(0, 0, 0, 0.2);
	border: 1px solid var(--border-color);
	border-radius: var(--radius-md);
	color: var(--text-primary);
	resize: none;
}
.notes-container {
	display: flex;
	flex-direction: column;
	gap: var(--space-xl);
}
.note-input {
	padding: var(--space-lg);
	border-radius: var(--radius-lg);
	display: flex;
	flex-direction: column;
	gap: var(--space-sm);
}
.note-input textarea {
	width: 100%;
	height: 100px;
	padding: var(--space-md);
	background: rgba(0, 0, 0, 0.2);
	border: 1px solid var(--border-color);
	border-radius: var(--radius-md);
	color: var(--text-primary);
	resize: none;
}
.notes-list {
	display: flex;
	flex-direction: column;
	gap: var(--space-md);
}
.note-item {
	padding: var(--space-lg);
	border-radius: var(--radius-lg);
	position: relative;
	transition: transform 0.2s;
}
.note-item:hover {
	transform: translateX(5px);
}
.note-time {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	background: var(--primary-600);
	color: white;
	padding: 4px 10px;
	border-radius: 6px;
	font-size: 11px;
	font-weight: 700;
	cursor: pointer;
	margin-bottom: 8px;
	transition: all 0.2s;
}
.note-time:hover {
	background: var(--primary-500);
	box-shadow: 0 0 15px rgba(99, 102, 241, 0.4);
}
.note-item p {
	font-size: var(--font-size-sm);
	color: var(--text-secondary);
	line-height: 1.6;
	margin: 0;
}
.delete-note {
	position: absolute;
	top: var(--space-md);
	right: var(--space-md);
	background: none;
	border: none;
	color: var(--text-tertiary);
	cursor: pointer;
	opacity: 0;
	transition: opacity 0.2s;
}
.note-item:hover .delete-note {
	opacity: 1;
}
.delete-note:hover {
	color: var(--danger-400);
}
@keyframes spin {
	100% {
		transform: rotate(360deg);
	}
}
</style>
