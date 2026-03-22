<template>
	<div v-if="quiz" class="quiz-page">
		<div class="quiz-header card">
			<div class="quiz-info">
				<h1>{{ quiz.title || "Bài kiểm tra" }}</h1>
				<div class="quiz-meta">
					<span
						>{{ currentIndex + 1 }}/{{ quiz.questions?.length || 0 }} câu</span
					>
					<span
						v-if="timeLeft !== null"
						class="quiz-timer"
						:class="{ warning: timeLeft < 60 }"
					>
						<Timer :size="14" /> {{ formatTime(timeLeft) }}
						<span v-if="paused" class="pause-badge"
							><Pause :size="12" /> Tạm dừng</span
						>
					</span>
					<span v-else class="quiz-timer">
						<Timer :size="14" /> Không giới hạn
					</span>
				</div>
			</div>
			<div class="progress-bar">
				<div
					class="progress-bar-fill"
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
			<div class="result-header" :class="result.isPassed ? 'passed' : 'failed'">
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
				<button class="btn btn-ghost" @click="$router.back()">Quay lại</button>
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
							Chúc mừng bạn đã vượt qua bài thi cuối cùng. Chứng chỉ của bạn đã
							được cấp tự động!
						</p>
						<div class="mt-4 d-flex justify-content-center gap-3">
							<button
								class="btn btn-secondary px-4 fw-bold"
								@click="showCourseCompletedModal = false"
							>
								Đóng & Xem kết quả
							</button>
							<button
								class="btn btn-success px-4 fw-bold"
								@click="router.push('/certificates')"
							>
								Xem chứng chỉ
							</button>
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
import { Timer, Pause, PartyPopper, XCircle, Award } from "lucide-vue-next";
import { toast } from "vue3-toastify";

const route = useRoute();
const router = useRouter();
const quiz = ref(null);
const currentIndex = ref(0);
const answers = ref({});
const submitted = ref(false);
const result = ref(null);
const timeLeft = ref(null);
const paused = ref(false);
const showCourseCompletedModal = ref(false);
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
	try {
		const { data } = await quizAPI.start(route.params.quizId);
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
		toast.error(e.response?.data?.message || "Lỗi bắt đầu thi");
		router.back();
	}
});

onUnmounted(() => {
	clearInterval(timer);
	document.removeEventListener("visibilitychange", handleVisibilityChange);
});
</script>

<style scoped>
.quiz-header {
	margin-bottom: var(--space-lg);
}
.quiz-info {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: var(--space-md);
}
.quiz-info h1 {
	font-size: var(--font-size-xl);
	font-weight: 600;
}
.quiz-meta {
	display: flex;
	align-items: center;
	gap: var(--space-lg);
	font-size: var(--font-size-sm);
}
.quiz-timer {
	display: flex;
	align-items: center;
	gap: 4px;
	font-weight: 700;
	color: var(--primary-400);
	font-size: var(--font-size-lg);
}
.quiz-timer.warning {
	color: var(--danger-400);
	animation: pulse 1s infinite;
}
.pause-badge {
	display: inline-flex;
	align-items: center;
	gap: 2px;
	font-size: var(--font-size-xs);
	padding: 2px 8px;
	border-radius: var(--radius-full);
	background: rgba(245, 158, 11, 0.15);
	color: var(--warning-400);
	font-weight: 600;
}

.question-text {
	font-size: var(--font-size-lg);
	font-weight: 600;
	margin-bottom: var(--space-xl);
}
.options {
	display: flex;
	flex-direction: column;
	gap: var(--space-md);
}
.option-item {
	display: flex;
	align-items: center;
	gap: var(--space-md);
	padding: var(--space-md) var(--space-lg);
	border: 2px solid var(--border-color);
	border-radius: var(--radius-lg);
	cursor: pointer;
	transition: all var(--transition-fast);
}
.option-item:hover {
	border-color: var(--primary-400);
	background: rgba(99, 102, 241, 0.05);
}
.option-item.selected {
	border-color: var(--primary-500);
	background: rgba(99, 102, 241, 0.1);
}
.option-item input {
	display: none;
}
.option-key {
	width: 32px;
	height: 32px;
	border-radius: 50%;
	background: var(--bg-tertiary);
	display: flex;
	align-items: center;
	justify-content: center;
	font-weight: 700;
	font-size: var(--font-size-sm);
	flex-shrink: 0;
}
.option-item.selected .option-key {
	background: var(--primary-500);
	color: white;
}

.question-dots {
	display: flex;
	flex-wrap: wrap;
	gap: 6px;
	margin-top: var(--space-lg);
	padding-top: var(--space-md);
	border-top: 1px solid var(--border-color);
}
.dot-btn {
	width: 32px;
	height: 32px;
	border-radius: 50%;
	border: 2px solid var(--border-color);
	background: var(--bg-tertiary);
	font-size: var(--font-size-xs);
	font-weight: 600;
	cursor: pointer;
	transition: all var(--transition-fast);
	color: var(--text-secondary);
}
.dot-btn.active {
	border-color: var(--primary-500);
	background: var(--primary-500);
	color: white;
}
.dot-btn.answered {
	border-color: var(--success-400);
	background: rgba(34, 197, 94, 0.15);
	color: var(--success-400);
}
.dot-btn.answered.active {
	background: var(--primary-500);
	color: white;
}

.quiz-nav {
	display: flex;
	justify-content: space-between;
	margin-top: var(--space-xl);
}

.quiz-result {
	text-align: center;
}
.result-header {
	padding: var(--space-2xl);
	border-radius: var(--radius-xl);
	margin-bottom: var(--space-xl);
}
.result-header.passed {
	background: rgba(34, 197, 94, 0.1);
}
.result-header.failed {
	background: rgba(239, 68, 68, 0.1);
}
.result-icon {
	font-size: 4rem;
	margin-bottom: var(--space-md);
}
.result-score {
	font-size: var(--font-size-3xl);
	font-weight: 800;
	margin: var(--space-sm) 0;
}
.result-detail {
	color: var(--text-secondary);
}

.result-details {
	text-align: left;
	margin-bottom: var(--space-xl);
}
.result-item {
	padding: var(--space-md);
	border-radius: var(--radius-md);
	margin-bottom: var(--space-sm);
}
.result-item.correct {
	background: rgba(34, 197, 94, 0.08);
	border-left: 3px solid var(--success-400);
}
.result-item.wrong {
	background: rgba(239, 68, 68, 0.08);
	border-left: 3px solid var(--danger-400);
}
.result-q {
	font-size: var(--font-size-sm);
	font-weight: 500;
	display: block;
	margin-bottom: var(--space-xs);
}
.result-answers {
	display: flex;
	gap: var(--space-lg);
	font-size: var(--font-size-xs);
	color: var(--text-secondary);
}
</style>
