<template>
	<div class="essay-lesson">
		<div v-if="loading" class="text-center py-5">
			<div class="spinner-border text-warning" role="status"></div>
			<p class="mt-2 text-muted">Đang tải câu hỏi...</p>
		</div>

		<div
			v-else-if="!currentAttempt && !showHistory"
			class="start-essay-view card glass shadow-sm p-4 text-center"
		>
			<div class="icon-wrapper mb-3">
				<i class="fas fa-file-signature text-warning fa-3x"></i>
			</div>
			<h4 class="fw-bold">Bắt đầu bài tập tự luận</h4>
			<p class="text-muted mb-4">
				Bài tập này giúp bạn rèn luyện khả năng trình bày và tư duy. Câu trả lời
				của bạn sẽ được AI chấm điểm dựa trên kiến thức bài học.
			</p>

			<div class="essay-info-grid mb-4">
				<div class="info-item">
					<span class="label">Câu hỏi</span>
					<span class="value">{{ config.questions?.length || 0 }} câu</span>
				</div>
				<div class="info-item">
					<span class="label">Thời gian</span>
					<span class="value"
						>{{ config.timeLimitMinutes || "Không giới hạn" }} phút</span
					>
				</div>
				<div class="info-item">
					<span class="label">Điểm cần đạt</span>
					<span class="value text-warning fw-bold"
						>{{ config.passScore }} / 100</span
					>
				</div>
			</div>

			<div class="actions d-flex justify-content-center gap-3">
				<button
					class="btn btn-warning px-4 py-2 fw-bold text-white shadow-sm"
					@click="startNewAttempt"
					:disabled="isSubmitting"
				>
					BẮT ĐẦU LÀM BÀI
				</button>
				<button
					v-if="history.length > 0"
					class="btn btn-outline-secondary px-4 py-2 fw-bold"
					@click="showHistory = true"
				>
					XEM LỊCH SỬ ({{ history.length }})
				</button>
			</div>
		</div>

		<div
			v-else-if="currentAttempt"
			class="essay-attempt-view h-100 d-flex flex-column"
		>
			<div
				class="attempt-header glass p-3 mb-3 d-flex justify-content-between align-items-center rounded shadow-sm"
			>
				<div>
					<h5 class="m-0 fw-bold">
						<i class="fas fa-edit me-2 text-warning"></i>Lần làm bài #{{
							currentAttempt.attemptNumber || currentAttempt.id
						}}
					</h5>
					<small class="text-muted"
						>Đang trả lời {{ answers.length }} /
						{{ config.questions.length }} câu hỏi</small
					>
				</div>
				<div
					v-if="!resultData"
					class="header-right d-flex align-items-center gap-3"
				>
					<div v-if="isSavingDraft" class="text-warning small me-2">
						<i class="fas fa-spinner fa-spin me-1"></i>
						Đang lưu bản nháp...
					</div>
					<div v-else-if="lastSavedAt" class="text-muted small me-2">
						<i class="fas fa-check-circle text-success me-1"></i>
						Đã lưu {{ formatTimeAgo(lastSavedAt) }}
					</div>
					<div
						v-if="timeLeft !== null"
						class="timer-badge"
						:class="{ 'text-danger': timeLeft < 60 }"
					>
						<i class="fas fa-clock me-1"></i> {{ formatTime(timeLeft) }}
					</div>
					<button
						class="btn btn-outline-primary fw-bold"
						@click="saveDraftManual"
						:disabled="isSubmitting || isSavingDraft"
					>
						<i v-if="isSavingDraft" class="fas fa-spinner fa-spin me-1"></i>
						LƯU NHÁP
					</button>
					<button
						class="btn btn-primary fw-bold"
						@click="submitAttempt"
						:disabled="isSubmitting || !isFormValid"
					>
						<i v-if="isSubmitting" class="fas fa-spinner fa-spin me-2"></i>
						NỘP BÀI
					</button>
				</div>
				<div v-else class="header-right">
					<button
						class="btn btn-outline-secondary btn-sm fw-bold"
						@click="closeResult"
					>
						<i class="fas fa-times me-1"></i> THOÁT XEM KẾT QUẢ
					</button>
				</div>
			</div>

			<div class="questions-container custom-scrollbar flex-grow-1 pe-2">
				<div
					v-if="resultData && resultData.status !== 'Processing'"
					class="overall-result-card card glass mb-4 border-0 shadow-sm animate-zoom-in"
				>
					<div class="card-body p-4 text-center">
						<div class="d-flex justify-content-between align-items-center mb-3">
							<div class="text-start">
								<h4
									class="fw-bold mb-1"
									:class="
										resultData.totalScore >= (config.passScore || 50)
											? 'text-success'
											: 'text-danger'
									"
								>
									{{
										resultData.totalScore >= (config.passScore || 50)
											? "BÀI LÀM ĐẠT YÊU CẦU"
											: "BÀI LÀM CHƯA ĐẠT"
									}}
								</h4>
								<div class="text-muted small">
									Lần làm thứ {{ resultData.attemptNumber }} •
									{{ formatDate(resultData.submittedAt || new Date()) }}
								</div>
							</div>
							<div class="score-badge-large">
								<span class="score">{{ resultData.totalScore }}</span>
								<span class="sep">/</span>
								<span class="total">100</span>
							</div>
						</div>
						<div
							class="overall-feedback p-3 bg-light rounded text-start border-start border-4 border-primary"
						>
							<div class="fw-bold mb-2 small text-uppercase letter-spacing-1">
								<i class="fas fa-robot me-2 text-primary"></i>Nhận xét từ AI:
							</div>
							<div
								class="text-dark fs-14"
								v-html="renderMarkdown(resultData.aiFeedback)"
							></div>
						</div>
						<div class="mt-3 d-flex gap-2 justify-content-end">
							<button
								class="btn btn-warning text-white fw-bold px-4"
								@click="closeResult"
							>
								TIẾP TỤC
							</button>
							<button
								class="btn btn-outline-warning fw-bold px-4"
								@click="startNewAttempt"
							>
								LÀM LẠI
							</button>
						</div>
					</div>
				</div>

				<div
					v-if="isSubmitting && resultData?.status === 'Processing'"
					class="processing-card card glass mb-4 border-0 shadow-sm p-4 text-center"
				>
					<div class="spinner-grow text-warning mb-3" role="status"></div>
					<h5 class="fw-bold m-0">AI ĐANG CHẤM ĐIỂM...</h5>
					<p class="text-muted small m-0 mt-2">
						Vui lòng đợi trong giây lát, AI đang phân tích bài làm của bạn.
					</p>
				</div>
				<div
					v-for="(q, index) in config.questions"
					:key="q.id"
					class="question-card card glass mb-4 border-0 shadow-sm"
				>
					<div class="card-header bg-warning-light py-2 px-3 border-0">
						<span class="fw-bold text-warning-dark"
							>CÂU HỎI {{ index + 1 }}</span
						>
						<span class="float-end badge bg-white text-dark"
							>{{ q.weight }}% tỉ trọng</span
						>
					</div>
					<div class="card-body">
						<div class="question-content mb-3 fw-bold fs-16">
							{{ q.content }}
						</div>
						<div
							v-if="q.scoringCriteria"
							class="scoring-criteria mb-3 small p-2 bg-light rounded border-start border-4 border-warning"
						>
							<div class="fw-bold mb-1">
								<i class="fas fa-info-circle me-1"></i>Tiêu chí chấm điểm:
							</div>
							<div class="text-muted">{{ q.scoringCriteria }}</div>
						</div>
						<div class="answer-editor-wrapper">
							<div class="answer-label">
								<i class="fas fa-pen-nib me-2"></i>BÀI LÀM CỦA BẠN
							</div>
							<div class="answer-editor">
								<div
									v-if="isReadOnly"
									class="ql-container ql-snow border-0"
									style="min-height: 200px"
								>
									<div
										class="ql-editor p-0 text-dark fs-15"
										v-html="answers[index].content"
									></div>
								</div>
								<QuillEditor
									v-else
									v-model:content="answers[index].content"
									content-type="html"
									theme="snow"
									:toolbar="[
										['bold', 'italic', 'underline', 'strike'],
										[{ header: [1, 2, 3, false] }],
										[{ list: 'ordered' }, { list: 'bullet' }],
										['blockquote', 'code-block'],
										['clean'],
									]"
									placeholder="Nhập câu trả lời của bạn tại đây..."
									style="height: 350px"
								/>
							</div>
						</div>

						<div
							v-if="
								resultData &&
								resultData.answers &&
								resultData.answers.some((a) => a.questionId === q.id)
							"
							class="question-result-box mt-3 p-3 rounded-3 border-start border-4 animate-zoom-in"
							:class="
								resultData.answers.find((a) => a.questionId === q.id).aiScore >=
								50
									? 'border-success bg-success-light'
									: 'border-danger bg-danger-light'
							"
						>
							<div
								class="d-flex justify-content-between align-items-center mb-2"
							>
								<div class="fw-bold small text-uppercase">
									<i
										class="fas fa-check-circle me-1"
										:class="
											resultData.answers.find((a) => a.questionId === q.id)
												.aiScore >= 50
												? 'text-success'
												: 'text-danger'
										"
									></i>
									Phản hồi chi tiết
								</div>
								<div
									class="badge rounded-pill"
									:class="
										resultData.answers.find((a) => a.questionId === q.id)
											.aiScore >= 50
											? 'bg-success'
											: 'bg-danger'
									"
								>
									{{
										resultData.answers.find((a) => a.questionId === q.id)
											.aiScore
									}}
									/ 100
								</div>
							</div>
							<div class="ai-feedback-text text-dark fs-14 italic">
								{{
									resultData.answers.find((a) => a.questionId === q.id)
										.aiFeedback ||
									"AI không để lại nhận xét cụ thể cho câu này."
								}}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<div v-else-if="showHistory" class="essay-history-view">
			<div class="d-flex justify-content-between align-items-center mb-4">
				<h4 class="m-0 fw-bold">
					<i class="fas fa-history me-2 text-primary"></i>Lịch sử làm bài
				</h4>
				<button
					class="btn btn-outline-secondary btn-sm"
					@click="showHistory = false"
				>
					<i class="fas fa-arrow-left me-1"></i> Quay lại
				</button>
			</div>

			<div class="history-list">
				<div
					v-for="h in sortedHistory"
					:key="h.id"
					class="history-item card glass mb-3 shadow-none border hover-shadow"
					@click="viewAttemptDetail(h.id)"
				>
					<div
						class="card-body p-3 d-flex justify-content-between align-items-center"
					>
						<div class="d-flex align-items-center gap-3">
							<div
								class="score-circle"
								:class="h.totalScore >= config.passScore ? 'pass' : 'fail'"
							>
								{{ h.totalScore || 0 }}
							</div>
							<div>
								<div class="fw-bold text-dark">
									Lần làm thứ {{ h.attemptNumber }}
								</div>
								<small class="text-muted">{{ formatDate(h.startedAt) }}</small>
							</div>
						</div>
						<div class="status-badge">
							<span
								v-if="h.status === 'Completed'"
								class="badge"
								:class="
									h.totalScore >= config.passScore
										? 'bg-success-light text-success'
										: 'bg-danger-light text-danger'
								"
							>
								{{ h.totalScore >= config.passScore ? "ĐẠT" : "CHƯA ĐẠT" }}
							</span>
							<span v-else class="badge bg-light text-muted">{{
								h.status
							}}</span>
							<i class="fas fa-chevron-right ms-2 text-muted"></i>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from "vue";
import { QuillEditor } from "@vueup/vue-quill";
import "@vueup/vue-quill/dist/vue-quill.snow.css";
import { essayAPI } from "@/services/api";
import { toast } from "vue3-toastify";
import {
	htmlToMarkdown,
	markdownToHtml,
	renderMarkdown,
} from "@/utils/markdown";
import dayjs from "dayjs";

const props = defineProps<{
	lessonId: number;
	config: any;
	theme: "light" | "dark";
}>();

const emit = defineEmits(["completed"]);

const loading = ref(true);
const history = ref<any[]>([]);
const currentAttempt = ref<any>(null);
const showHistory = ref(false);
const showResult = ref(false);
const resultData = ref<any>(null);
const isSubmitting = ref(false);
const timeLeft = ref<number | null>(null);
const answers = ref<any[]>([]);

let timerInterval: any = null;

const isSavingDraft = ref(false);
const lastSavedAt = ref<Date | null>(null);
let autoSaveInterval: any = null;

const sortedHistory = computed(() => {
	return [...history.value].sort(
		(a, b) => dayjs(b.startedAt).unix() - dayjs(a.startedAt).unix(),
	);
});

const isFormValid = computed(() => {
	return answers.value.every((a) => a.content && a.content.trim().length > 10);
});

const isReadOnly = computed(() => {
	return isSubmitting.value || !!resultData.value;
});

const formatTime = (seconds: number) => {
	const m = Math.floor(seconds / 60);
	const s = seconds % 60;
	return `${m}:${s < 10 ? "0" : ""}${s}`;
};

const formatDate = (date: string) => dayjs(date).format("HH:mm DD/MM/YYYY");

const formatTimeAgo = (date: Date) => dayjs(date).format("HH:mm:ss");

const loadHistory = async () => {
	try {
		const res = await essayAPI.getHistory(props.lessonId);
		history.value = res.data;
	} catch {
		//
	}
};

const startNewAttempt = async () => {
	isSubmitting.value = true;
	try {
		const res = await essayAPI.startAttempt(props.lessonId);
		currentAttempt.value = { ...res.data };
		answers.value = props.config.questions.map((q: any) => ({
			questionId: q.id,
			content: "",
		}));

		if (props.config.timeLimitMinutes || res.data.timeLimitMinutes) {
			const limit = res.data.timeLimitMinutes || props.config.timeLimitMinutes;
			timeLeft.value = limit * 60;
			startTimer();
		}

		if (autoSaveInterval) clearInterval(autoSaveInterval);
		autoSaveInterval = setInterval(saveDraft, 30000);

		showHistory.value = false;
		showResult.value = false;
	} catch (error: any) {
		const msg = error.response?.data?.message || "Không thể bắt đầu làm bài.";
		toast.error(msg);
	} finally {
		isSubmitting.value = false;
	}
};

const startTimer = () => {
	if (timerInterval) clearInterval(timerInterval);
	timerInterval = setInterval(() => {
		if (timeLeft.value !== null && timeLeft.value > 0) {
			timeLeft.value--;
		} else {
			clearInterval(timerInterval);
			if (timeLeft.value === 0) {
				toast.warning("Hết thời gian làm bài! Hệ thống tự động nộp.");
				submitAttempt();
			}
		}
	}, 1000);
};

const submitAttempt = async () => {
	if (isSubmitting.value) return;
	isSubmitting.value = true;
	if (timerInterval) clearInterval(timerInterval);
	if (autoSaveInterval) clearInterval(autoSaveInterval);

	try {
		const markdownAnswers = answers.value.map((a) => ({
			questionId: a.questionId,
			content: htmlToMarkdown(a.content),
		}));

		const res = await essayAPI.submitAttempt(currentAttempt.value.id, {
			answers: markdownAnswers,
		});
		resultData.value = res.data;
		showResult.value = true;

		if (resultData.value.status === "Processing") {
			pollResult(currentAttempt.value.id);
		}
	} catch {
		toast.error("Gặp lỗi khi nộp bài.");
		isSubmitting.value = false;
	}
};

const saveDraft = async () => {
	if (!currentAttempt.value || isSubmitting.value || isSavingDraft.value)
		return;

	isSavingDraft.value = true;
	try {
		const markdownAnswers = answers.value.map((a) => ({
			questionId: a.questionId,
			content: htmlToMarkdown(a.content),
		}));

		await essayAPI.saveDraft(currentAttempt.value.id, {
			answers: markdownAnswers,
		});
		lastSavedAt.value = new Date();
	} catch {
	} finally {
		isSavingDraft.value = false;
	}
};

const saveDraftManual = async () => {
	await saveDraft();
	toast.success("Đã lưu bản nháp.");
};

const pollResult = async (id: number) => {
	const interval = setInterval(async () => {
		try {
			const res = await essayAPI.getAttemptDetail(id);
			if (res.data.status === "Completed" || res.data.status === "Failed") {
				resultData.value = res.data;
				clearInterval(interval);
				isSubmitting.value = false;
				loadHistory();
				if (res.data.totalScore >= (props.config.passScore || 50)) {
					emit("completed");
				}
				showResult.value = true;
			}
		} catch {
			clearInterval(interval);
			isSubmitting.value = false;
		}
	}, 3000);
};

const viewAttemptDetail = async (id: number) => {
	loading.value = true;
	try {
		const res = await essayAPI.getAttemptDetail(id);
		resultData.value = res.data;

		currentAttempt.value = {
			id: res.data.id,
			status: res.data.status,
			startedAt: res.data.startedAt,
		};

		answers.value = props.config.questions.map((q: any) => {
			const existing = res.data.answers?.find(
				(a: any) => a.questionId === q.id,
			);
			return {
				questionId: q.id,
				content: existing ? markdownToHtml(existing.userAnswer) : "",
			};
		});

		showHistory.value = false;
		showResult.value = true;
	} catch {
		toast.error("Không thể tải chi tiết bài tự luận.");
	} finally {
		loading.value = false;
	}
};

const closeResult = () => {
	showResult.value = false;
	resultData.value = null;
	currentAttempt.value = null;
	showHistory.value = false;
	loadHistory();
};

const checkActiveAttempt = async () => {
	try {
		const res = await essayAPI.getActiveAttempt(props.lessonId);
		if (res.data && res.data.id) {
			currentAttempt.value = { ...res.data };
			answers.value = props.config.questions.map((q: any) => {
				const existing = res.data.answers?.find(
					(a: any) => a.questionId === q.id,
				);
				return {
					questionId: q.id,
					content: existing ? markdownToHtml(existing.content) : "",
				};
			});

			if (props.config.timeLimitMinutes || res.data.timeLimitMinutes) {
				const startedAt = dayjs(res.data.startedAt);
				const now = dayjs();
				const diffSeconds = now.diff(startedAt, "second");
				const limit =
					res.data.timeLimitMinutes || props.config.timeLimitMinutes;
				timeLeft.value = Math.max(0, limit * 60 - diffSeconds);
				startTimer();
			}

			if (autoSaveInterval) clearInterval(autoSaveInterval);
			autoSaveInterval = setInterval(saveDraft, 30000);
		} else {
			currentAttempt.value = null;
		}
	} catch {
		currentAttempt.value = null;
	}
};

onMounted(async () => {
	loading.value = true;
	try {
		await loadHistory();
		await checkActiveAttempt();
	} finally {
		loading.value = false;
	}
});

onUnmounted(() => {
	if (timerInterval) clearInterval(timerInterval);
	if (autoSaveInterval) clearInterval(autoSaveInterval);
});

watch(
	() => props.lessonId,
	async () => {
		if (timerInterval) clearInterval(timerInterval);
		if (autoSaveInterval) clearInterval(autoSaveInterval);
		currentAttempt.value = null;
		showHistory.value = false;
		showResult.value = false;
		resultData.value = null;

		loading.value = true;
		try {
			await loadHistory();
			await checkActiveAttempt();
		} finally {
			loading.value = false;
		}
	},
);
</script>

<style scoped>
.essay-lesson {
	height: 100%;
}

.card.glass {
	background: rgba(255, 255, 255, 0.7);
	backdrop-filter: blur(10px);
	border: 1px solid rgba(0, 0, 0, 0.05);
	border-radius: 16px;
}

.essay-info-grid {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 15px;
	background: rgba(0, 0, 0, 0.02);
	padding: 20px;
	border-radius: 12px;
}

.info-item {
	display: flex;
	flex-direction: column;
	align-items: center;
}

.info-item .label {
	font-size: 11px;
	text-transform: uppercase;
	color: #777;
	font-weight: 700;
	margin-bottom: 4px;
}

.info-item .value {
	font-size: 16px;
	font-weight: 800;
	color: #333;
}

.bg-warning-light {
	background-color: #fffdf5;
}

.text-warning-dark {
	color: #856404;
}

.question-card {
	overflow: hidden;
}

.timer-badge {
	background: rgba(0, 0, 0, 0.05);
	padding: 5px 12px;
	border-radius: 99px;
	font-weight: 700;
	font-variant-numeric: tabular-nums;
}

.score-circle {
	width: 45px;
	height: 45px;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	font-weight: 800;
	font-size: 18px;
}

.score-circle.pass {
	background: #ecfdf5;
	color: #10b981;
	border: 2px solid #10b981;
}

.score-circle.fail {
	background: #fef2f2;
	color: #ef4444;
	border: 2px solid #ef4444;
}

.result-modal-overlay {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background: rgba(255, 255, 255, 0.9);
	backdrop-filter: blur(5px);
	z-index: 100;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 20px;
}

.result-modal {
	width: 100%;
	max-width: 600px;
	max-height: 90vh;
	overflow-y: auto;
}

.final-score {
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-bottom: 25px;
}

.final-score .score-label {
	font-size: 12px;
	font-weight: 700;
	color: #777;
	letter-spacing: 1px;
}

.final-score .score-number {
	font-size: 56px;
	font-weight: 900;
	line-height: 1;
}

.final-score .total {
	font-size: 24px;
	opacity: 0.5;
}

.feedback-scroll {
	max-height: 250px;
	font-size: 14px;
	line-height: 1.6;
}

.hover-shadow:hover {
	transform: translateY(-2px);
	box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05) !important;
	cursor: pointer;
}

.animate-zoom-in {
	animation: zoomIn 0.3s ease-out forwards;
}

@keyframes zoomIn {
	from {
		transform: scale(0.9);
		opacity: 0;
	}
	to {
		transform: scale(1);
		opacity: 1;
	}
}

:is([data-bs-theme="dark"], [data-theme="dark"]) .card.glass {
	background: rgba(30, 41, 59, 0.7);
}

:is([data-bs-theme="dark"], [data-theme="dark"]) .bg-white {
	background-color: #1e293b !important;
}

:is([data-bs-theme="dark"], [data-theme="dark"]) .text-dark {
	color: #f1f5f9 !important;
}

:is([data-bs-theme="dark"], [data-theme="dark"]) .result-modal-overlay {
	background: rgba(15, 23, 42, 0.9);
}

.overall-result-card {
	background: linear-gradient(
		135deg,
		rgba(255, 255, 255, 0.9) 0%,
		rgba(248, 250, 252, 0.9) 100%
	);
	border-radius: 20px;
	overflow: hidden;
}

.score-badge-large {
	display: flex;
	align-items: baseline;
	gap: 2px;
	padding: 10px 20px;
	background: #f8fafc;
	border-radius: 12px;
	border: 1px solid rgba(0, 0, 0, 0.05);
}

.score-badge-large .score {
	font-size: 32px;
	font-weight: 900;
	color: #1e293b;
}

.score-badge-large .sep {
	font-size: 18px;
	color: #94a3b8;
	margin: 0 4px;
}

.score-badge-large .total {
	font-size: 18px;
	font-weight: 700;
	color: #64748b;
}

.question-result-box {
	transition: all 0.3s ease;
}

.bg-success-light {
	background-color: rgba(16, 185, 129, 0.05) !important;
}

.bg-danger-light {
	background-color: rgba(239, 68, 68, 0.05) !important;
}

.italic {
	font-style: italic;
}

.letter-spacing-1 {
	letter-spacing: 0.5px;
}

.fs-14 {
	font-size: 14px;
}

.processing-card {
	background: rgba(255, 251, 235, 0.5);
	border: 2px dashed #fcd34d !important;
}

:is([data-bs-theme="dark"], [data-theme="dark"]) .overall-result-card {
	background: linear-gradient(
		135deg,
		rgba(30, 41, 59, 0.8) 0%,
		rgba(15, 23, 42, 0.8) 100%
	);
}

:is([data-bs-theme="dark"], [data-theme="dark"]) .score-badge-large {
	background: rgba(0, 0, 0, 0.2);
}

:is([data-bs-theme="dark"], [data-theme="dark"]) .score-badge-large .score {
	color: #f1f5f9;
}

.answer-editor-wrapper {
	background: #fbfbfb;
	border: 1px solid rgba(0, 0, 0, 0.08);
	border-radius: 12px;
	padding: 20px;
	margin-bottom: 25px;
}

.answer-label {
	font-size: 11px;
	font-weight: 800;
	color: #6c757d;
	letter-spacing: 1px;
	margin-bottom: 12px;
	display: flex;
	align-items: center;
}

:is([data-bs-theme="dark"], [data-theme="dark"]) .answer-editor-wrapper {
	background: rgba(0, 0, 0, 0.2);
	border-color: rgba(255, 255, 255, 0.1);
}

:is([data-bs-theme="dark"], [data-theme="dark"]) .answer-label {
	color: #94a3b8;
}
</style>
