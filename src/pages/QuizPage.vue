<template>
	<div class="quiz-page">
		<div v-if="loading" class="quiz-loading">
			<div class="spinner-border text-primary" role="status">
				<span class="visually-hidden">Loading...</span>
			</div>
			<p class="mt-3">Đang chuẩn bị đề thi...</p>
		</div>

		<div v-else-if="error" class="quiz-error card p-5 text-center shadow-lg">
			<XCircle :size="64" class="text-danger mb-3 mx-auto" />
			<h2 class="fw-bold">{{ error }}</h2>
			<p class="text-secondary mt-2">
				Dữ liệu bài thi không khả dụng hoặc đã có lỗi xảy ra.
			</p>
			<button class="btn btn-primary mt-4 px-5" @click="$router.back()">
				← Quay lại
			</button>
		</div>

		<div v-else-if="quiz" class="quiz-wrapper animate-fade-in">
			<div class="quiz-header card-glass">
				<div class="quiz-info-nav">
					<button class="btn-back-sm" @click="$router.back()">
						<ChevronLeft :size="16" />
					</button>
					<div class="qi-text">
						<h1>{{ quiz.title || "Bài kiểm tra" }}</h1>
						<div class="quiz-meta-pills">
							<span class="meta-pill">
								{{ currentIndex + 1 }}/{{ quiz.questions?.length || 0 }} câu
							</span>
							<span
								v-if="timeLeft !== null"
								class="meta-pill timer-pill"
								:class="{ warning: timeLeft < 60 }"
							>
								<Timer :size="14" /> {{ formatTime(timeLeft) }}
							</span>
						</div>
					</div>
				</div>
				<div class="progress-bar-modern">
					<div
						class="progress-fill"
						:style="{
							width: quiz.questions?.length
								? ((currentIndex + 1) / quiz.questions.length) * 100 + '%'
								: '0%',
						}"
					/>
				</div>
			</div>

			<div v-if="!submitted && currentQuestion" class="quiz-body card">
				<div class="question">
					<h2 class="question-text">
						Câu {{ currentIndex + 1 }}: {{ currentQuestion.questionText }}
					</h2>
					<div class="options">
						<label
							v-for="opt in ['A', 'B', 'C', 'D']"
							:key="opt"
							class="option-item"
							:class="{ selected: answers[currentQuestion.questionId] === opt }"
						>
							<input
								v-model="answers[currentQuestion.questionId]"
								type="radio"
								:name="'q-' + currentQuestion.questionId"
								:value="opt"
								@change="saveDraft(currentQuestion.questionId, opt)"
							/>
							<span class="option-key">{{ opt }}</span>
							<span class="option-text">{{
								currentQuestion["option" + opt]
							}}</span>
						</label>
					</div>
				</div>

				<div class="question-dots">
					<button
						v-for="(q, i) in quiz.questions"
						:key="q.questionId"
						class="dot-btn"
						:class="{
							active: i === currentIndex,
							answered: answers[q.questionId],
						}"
						@click="currentIndex = i"
					>
						{{ i + 1 }}
					</button>
				</div>

				<div class="quiz-nav">
					<button
						class="btn btn-secondary"
						:disabled="currentIndex === 0"
						@click="currentIndex--"
					>
						← Trước
					</button>
					<button
						v-if="currentIndex < quiz.questions.length - 1"
						class="btn btn-primary"
						@click="currentIndex++"
					>
						Tiếp →
					</button>
					<button v-else class="btn btn-primary" @click="submitQuiz">
						Nộp bài
					</button>
				</div>
			</div>

			<div v-if="submitted && result" class="quiz-result card">
				<div
					class="result-header"
					:class="result.isPassed ? 'passed' : 'failed'"
				>
					<div class="result-icon">
						<PartyPopper
							v-if="result.isPassed"
							:size="52"
							style="color: var(--success-400)"
						/>
						<XCircle v-else :size="52" style="color: var(--danger-400)" />
					</div>
					<h2>
						{{
							result.isPassed
								? "Chúc mừng! Bạn đã đạt!"
								: "Rất tiếc, bạn chưa đạt."
						}}
					</h2>
					<div class="result-score">{{ result.score }}/10 điểm</div>
					<div class="result-detail">
						{{ result.correctAnswers }}/{{ result.totalQuestions }} câu đúng
					</div>
				</div>
				<div class="result-details">
					<div
						v-for="(d, i) in result.details"
						:key="i"
						class="result-item"
						:class="d.isCorrect ? 'correct' : 'wrong'"
					>
						<span class="result-q">Câu {{ i + 1 }}: {{ d.questionText }}</span>
						<div class="result-answers">
							<span
								>Bạn chọn:
								<strong>{{
									d.selectedAnswer
										? getOptionText(d.questionId, d.selectedAnswer)
										: "Bỏ trống"
								}}</strong></span
							>
							<span v-if="!d.isCorrect"
								>Đáp án đúng:
								<strong>{{
									getOptionText(d.questionId, d.correctAnswer)
								}}</strong></span
							>
							<span
								v-if="d.explanation && d.explanation.trim() !== ''"
								class="result-explanation"
								>Giải thích: <strong>{{ d.explanation }}</strong></span
							>
						</div>
					</div>
				</div>
				<div class="result-actions">
					<button
						v-if="result.isPassed && route.query.courseId"
						class="btn btn-success"
						@click="issueCert"
					>
						<Award :size="16" /> Nhận chứng chỉ
					</button>
					<button class="btn btn-ghost" @click="$router.back()">
						Quay lại
					</button>
				</div>
			</div>

			<div
				v-if="showCourseCompletedModal"
				class="modal fade show"
				style="display: block; background: rgba(0, 0, 0, 0.6); z-index: 9999"
			>
				<div class="modal-dialog modal-dialog-centered">
					<div
						class="modal-content border-0 shadow-lg"
						style="border-radius: 20px"
					>
						<div class="modal-body text-center p-5">
							<div class="mb-4">
								<PartyPopper :size="80" class="text-success" />
							</div>
							<h3 class="text-success fw-bold mt-3 mb-2">
								Bạn đã hoàn thành khóa học!
							</h3>
							<p class="text-muted px-4">
								Chúc mừng bạn đã vượt qua bài thi cuối cùng. Chứng chỉ của bạn
								đã được cấp tự động!
							</p>
							<div class="mt-4 d-flex justify-content-center gap-3">
								<button
									class="btn btn-secondary px-4 fw-bold"
									@click="showCourseCompletedModal = false"
								>
									Đóng & Xem kết quả
								</button>
								<button
									class="btn btn-success px-4 fw-bold shadow-sm"
									:disabled="isIssuingCert"
									@click="downloadCertificate"
								>
									<Award :size="18" class="me-2" /> Tải Chứng Chỉ
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
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { quizAPI, certificateAPI, progressAPI } from "@/services/api";
import {
	Timer,
	PartyPopper,
	XCircle,
	Award,
	ChevronLeft,
} from "lucide-vue-next";
import { toast } from "vue3-toastify";

const route = useRoute();
const router = useRouter();
const loading = ref(true);
const error = ref(null);
const quiz = ref(null);
const currentIndex = ref(0);
const answers = ref({});
const submitted = ref(false);
const result = ref(null);
const timeLeft = ref(null);
const paused = ref(false);
const showCourseCompletedModal = ref(false);
const isIssuingCert = ref(false);

const downloadCertificate = async () => {
	if (isIssuingCert.value) return;
	const courseId = route.query.courseId;
	if (!courseId) return;

	isIssuingCert.value = true;
	try {
		const { data } = await certificateAPI.issue(courseId);
		if (data && data.pdfUrl) {
			const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5100";
			const fullUrl = data.pdfUrl.startsWith("http")
				? data.pdfUrl
				: `${baseUrl}${data.pdfUrl}`;
			window.open(fullUrl, "_blank");
		} else {
			toast.info("Chứng chỉ đang được chuẩn bị. Vui lòng xem ở tab Chứng chỉ.");
		}
	} catch {
		toast.error("Không thể tải chứng chỉ lúc này.");
	} finally {
		isIssuingCert.value = false;
	}
};

let timer = null;

const currentQuestion = computed(() => {
	if (!quiz.value || !quiz.value.questions || quiz.value.questions.length === 0)
		return null;
	return quiz.value.questions[currentIndex.value];
});

function formatTime(s) {
	if (s == null) return "--:--";
	const m = Math.floor(s / 60);
	return `${m}:${String(s % 60).padStart(2, "0")}`;
}

function getOptionText(questionId, optionKey) {
	if (!quiz.value || !quiz.value.questions || !optionKey) return optionKey;
	const q = quiz.value.questions.find((x) => x.questionId === questionId);
	if (!q) return optionKey;
	const optText = q["option" + optionKey];
	return optText ? `${optionKey}. ${optText}` : optionKey;
}

function startTimer() {
	clearInterval(timer);
	if (timeLeft.value === null) return;
	paused.value = false;
	timer = setInterval(() => {
		if (timeLeft.value !== null) {
			timeLeft.value--;
			if (timeLeft.value <= 0) {
				clearInterval(timer);
				submitQuiz(true);
			}
		}
		if (timeLeft.value !== null && timeLeft.value % 30 === 0) {
			quizAPI.updateTime(quiz.value.attemptId, timeLeft.value || 0);
		}
	}, 1000);
}

function pauseTimer() {
	clearInterval(timer);
	paused.value = true;
	if (quiz.value && timeLeft.value !== null) {
		quizAPI.updateTime(quiz.value.attemptId, timeLeft.value);
	}
}

function handleVisibilityChange() {
	if (submitted.value) return;
	if (document.hidden) pauseTimer();
	else startTimer();
}

async function submitQuiz(isAuto = false) {
	if (!isAuto && !confirm("Bạn chắc chắn muốn nộp bài?")) return;
	clearInterval(timer);
	try {
		const answerList = Object.entries(answers.value).map(
			([questionId, selectedAnswer]) => ({
				questionId: parseInt(questionId),
				selectedAnswer,
			}),
		);
		const { data } = await quizAPI.submit(quiz.value.attemptId, answerList);

		result.value = data;
		submitted.value = true;

		if (data.isPassed && route.query.courseId) {
			try {
				const { data: cp } = await progressAPI.getCourseProgress(
					route.query.courseId,
				);
				if (cp.isCompleted) {
					showCourseCompletedModal.value = true;
					try {
						await certificateAPI.issue(route.query.courseId);
						toast.success(
							"Chúc mừng! Khóa học đã hoàn thành và chứng chỉ đã được cấp.",
						);
					} catch {}
				}
			} catch {}
		}
	} catch (e) {
		alert(e.response?.data?.message || "Lỗi nộp bài");
	}
}

async function issueCert() {
	try {
		await certificateAPI.issue(parseInt(route.query.courseId));
		router.push("/certificates");
	} catch (e) {
		alert(e.response?.data?.message || "Lỗi cấp chứng chỉ");
	}
}

async function saveDraft(questionId, selected) {
	try {
		await quizAPI.saveDraft(quiz.value.attemptId, questionId, selected);
	} catch {}
}

onMounted(async () => {
	loading.value = true;
	error.value = null;
	try {
		const { data } = await quizAPI.start(route.params.quizId);
		if (!data || !data.questions || data.questions.length === 0) {
			error.value = "Bài thi chưa có câu hỏi nào.";
			return;
		}
		quiz.value = data;
		if (data.remainingAttemptsToday !== undefined) {
			toast.info(
				`Bắt đầu làm bài. Bạn còn ${data.remainingAttemptsToday} lượt thi trong hôm nay.`,
			);
		}

		if (data.draftAnswers) {
			answers.value = { ...data.draftAnswers };
		}

		if (data.remainingSeconds !== null && data.remainingSeconds !== undefined) {
			timeLeft.value = data.remainingSeconds;
		} else if (data.timeLimitMinutes) {
			timeLeft.value = data.timeLimitMinutes * 60;
		} else {
			timeLeft.value = null;
		}

		startTimer();
		document.addEventListener("visibilitychange", handleVisibilityChange);
	} catch (e) {
		error.value = e.response?.data?.message || "Lỗi tải bài thi.";
		toast.error(error.value);
	} finally {
		loading.value = false;
	}
});

onUnmounted(() => {
	clearInterval(timer);
	document.removeEventListener("visibilitychange", handleVisibilityChange);
});
</script>

<style scoped>
.quiz-page {
	position: fixed;
	inset: 0;
	z-index: 1500;
	background: var(--bg-player, #f1f5f9);
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 40px 20px;
	overflow-y: auto;
}

.quiz-wrapper {
	width: 100%;
	max-width: 900px;
	margin: auto;
}

.card-glass {
	background: rgba(255, 255, 255, 0.7);
	backdrop-filter: blur(12px);
	border: 1px solid rgba(255, 255, 255, 0.3);
	border-radius: 20px;
	padding: var(--space-lg, 16px);
	margin-bottom: var(--space-lg, 16px);
	box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05);
}

.quiz-info-nav {
	display: flex;
	align-items: center;
	gap: 16px;
	margin-bottom: 20px;
}

.btn-back-sm {
	width: 36px;
	height: 36px;
	border-radius: 12px;
	border: 1px solid var(--border-color);
	background: white;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	transition: all 0.2s;
}

.btn-back-sm:hover {
	background: var(--bg-tertiary);
	transform: translateX(-2px);
}

.qi-text h1 {
	font-size: 20px;
	font-weight: 800;
	margin: 0 0 8px;
	color: var(--text-primary);
}

.quiz-meta-pills {
	display: flex;
	gap: 8px;
}

.meta-pill {
	background: rgba(0, 0, 0, 0.05);
	padding: 4px 12px;
	border-radius: 20px;
	font-size: 12px;
	font-weight: 600;
	color: var(--text-secondary);
	display: flex;
	align-items: center;
	gap: 6px;
}

.timer-pill {
	background: rgba(99, 102, 241, 0.1);
	color: var(--primary-500);
}

.timer-pill.warning {
	background: rgba(239, 68, 68, 0.1);
	color: var(--danger-500);
	animation: pulse 1s infinite alternate;
}

@keyframes pulse {
	from {
		opacity: 1;
	}
	to {
		opacity: 0.7;
	}
}

.progress-bar-modern {
	height: 8px;
	background: rgba(0, 0, 0, 0.05);
	border-radius: 4px;
	overflow: hidden;
}

.progress-fill {
	height: 100%;
	background: linear-gradient(90deg, #4f46e5, #6366f1);
	transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.quiz-body {
	background: white;
	border-radius: 24px;
	padding: 32px;
	margin-bottom: 24px;
	border: 1px solid var(--border-color);
	box-shadow: var(--shadow-md);
}

.question-text {
	font-size: 20px;
	font-weight: 700;
	line-height: 1.5;
	margin-bottom: 32px;
	color: var(--text-primary);
}

.options {
	display: grid;
	grid-template-columns: 1fr;
	gap: 16px;
}

.option-item {
	display: flex;
	align-items: center;
	gap: 16px;
	padding: 16px 20px;
	border: 2px solid var(--border-color);
	border-radius: 16px;
	cursor: pointer;
	transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.option-item:hover {
	border-color: var(--primary-300);
	background: rgba(99, 102, 241, 0.02);
	transform: translateY(-2px);
}

.option-item.selected {
	border-color: var(--primary-500);
	background: rgba(99, 102, 241, 0.06);
	box-shadow: 0 4px 20px rgba(99, 102, 241, 0.1);
}

.option-item input {
	display: none;
}

.option-key {
	width: 36px;
	height: 36px;
	border-radius: 12px;
	background: var(--bg-tertiary);
	display: flex;
	align-items: center;
	justify-content: center;
	font-weight: 700;
	color: var(--text-secondary);
	flex-shrink: 0;
	transition: all 0.2s;
}

.option-item.selected .option-key {
	background: var(--primary-500);
	color: white;
	transform: scale(1.1);
}

.option-text {
	font-size: 16px;
	font-weight: 500;
	color: var(--text-secondary);
}

.option-item.selected .option-text {
	color: var(--text-primary);
}

.question-dots {
	display: flex;
	flex-wrap: wrap;
	gap: 10px;
	margin-top: 40px;
	padding-top: 24px;
	border-top: 1px solid var(--border-color);
}

.dot-btn {
	width: 32px;
	height: 32px;
	border-radius: 10px;
	border: 1.5px solid var(--border-color);
	background: white;
	font-size: 12px;
	font-weight: 700;
	cursor: pointer;
	transition: all 0.2s;
	color: var(--text-tertiary);
}

.dot-btn.active {
	border-color: var(--primary-500);
	background: var(--primary-500);
	color: white;
	transform: scale(1.1);
}

.dot-btn.answered {
	border-color: var(--success-400);
	color: var(--success-500);
}

.dot-btn.answered:not(.active) {
	background: rgba(34, 197, 94, 0.08);
}

.quiz-nav {
	display: flex;
	justify-content: space-between;
	margin-top: 32px;
}

.quiz-result {
	background: white;
	border-radius: 24px;
	overflow: hidden;
}

.result-header {
	padding: 48px 32px;
	text-align: center;
}

.result-header.passed {
	background: linear-gradient(180deg, rgba(34, 197, 94, 0.1) 0%, white 100%);
}

.result-header.failed {
	background: linear-gradient(180deg, rgba(239, 68, 68, 0.1) 0%, white 100%);
}

.result-icon {
	margin-bottom: 24px;
}

.result-score {
	font-size: 48px;
	font-weight: 900;
	margin: 8px 0;
	color: var(--text-primary);
}

.result-detail {
	font-size: 16px;
	color: var(--text-secondary);
	font-weight: 600;
}

.result-details {
	padding: 0 32px 32px;
}

.result-item {
	padding: 20px;
	border-radius: 16px;
	margin-bottom: 16px;
	border: 1px solid var(--border-color);
}

.result-item.correct {
	background: rgba(34, 197, 94, 0.02);
	border-left: 4px solid var(--success-400);
}

.result-item.wrong {
	background: rgba(239, 68, 68, 0.02);
	border-left: 4px solid var(--danger-400);
}

.result-q {
	font-size: 15px;
	font-weight: 700;
	display: block;
	margin-bottom: 12px;
}

.result-answers {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 12px;
	font-size: 13px;
}

.result-explanation {
	grid-column: span 2;
	background: rgba(0, 0, 0, 0.03);
	padding: 10px;
	border-radius: 8px;
	margin-top: 8px;
}

.result-actions {
	padding: 24px 32px;
	border-top: 1px solid var(--border-color);
	display: flex;
	justify-content: center;
	gap: 16px;
}

.quiz-loading,
.quiz-error {
	padding: 100px 20px;
	text-align: center;
}

@media (max-width: 768px) {
	.quiz-page {
		padding: 12px;
	}
	.quiz-body {
		padding: 20px;
	}
	.question-text {
		font-size: 17px;
	}
	.result-answers {
		grid-template-columns: 1fr;
	}
	.result-actions {
		flex-direction: column;
	}
}
</style>
