<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { marked } from "marked";
import DOMPurify from "dompurify";
// @ts-ignore
import { plagiarismAPI, essayAdminAPI } from "@/services/api";
import { toast } from "vue3-toastify";

const props = defineProps<{
	sessions: any[];
	lessonId: number | null;
}>();

const emit = defineEmits<{
	close: [];
}>();

const isComparing = ref(false);
const compareResult = ref<any | null>(null);

const selectedAttemptA = ref<number | null>(null);
const selectedAttemptB = ref<number | null>(null);
const selectedQuestionId = ref<number | null>(null);

const questions = ref<any[]>([]);

const filteredSessionsB = computed(() => {
	if (!selectedAttemptA.value) return props.sessions;
	const sessionA = props.sessions.find((s) => s.id === selectedAttemptA.value);
	if (!sessionA) return props.sessions;
	return props.sessions.filter(
		(s) => s.lessonId === sessionA.lessonId && s.id !== sessionA.id,
	);
});

const fetchQuestions = async (lessonId: number) => {
	try {
		const res = await essayAdminAPI.getQuestionsByLesson(lessonId);
		questions.value = [
			{ id: 0, content: "--- Toàn bộ bài làm ---" },
			...res.data,
		];
		if (questions.value.length > 0) {
			selectedQuestionId.value = questions.value[0].id;
		}
	} catch {
		toast.error("Không thể tải danh sách câu hỏi.");
	}
};

watch(selectedAttemptA, (newVal) => {
	if (!newVal) {
		selectedAttemptB.value = null;
		selectedQuestionId.value = null;
		questions.value = [];
		return;
	}
	const sessionA = props.sessions.find((s) => s.id === newVal);
	const sessionB = props.sessions.find((s) => s.id === selectedAttemptB.value);
	if (sessionB && sessionB.lessonId !== sessionA?.lessonId) {
		selectedAttemptB.value = null;
		selectedQuestionId.value = null;
		questions.value = [];
	}
});

watch([selectedAttemptA, selectedAttemptB], async ([a, b]) => {
	if (a && b) {
		const sessionA = props.sessions.find((s) => s.id === a);
		if (sessionA) {
			await fetchQuestions(sessionA.lessonId);
		}
	} else {
		selectedQuestionId.value = null;
		questions.value = [];
	}
});

const runCompare = async () => {
	if (
		!selectedAttemptA.value ||
		!selectedAttemptB.value ||
		selectedQuestionId.value === null
	) {
		toast.warning("Vui lòng chọn đủ 2 học viên và 1 câu hỏi để so sánh.");
		return;
	}
	isComparing.value = true;
	try {
		const res = await plagiarismAPI.compare({
			attemptIdA: selectedAttemptA.value,
			attemptIdB: selectedAttemptB.value,
			questionId: selectedQuestionId.value,
		});
		compareResult.value = res.data;
	} catch {
		toast.error("Lỗi khi so sánh bài nộp.");
	} finally {
		isComparing.value = false;
	}
};

const buildHighlightedHtml = (
	text: string,
	segments: any[],
	side: "a" | "b",
) => {
	if (!text || !segments?.length) return escapeHtml(text);

	const chars = [...text];
	const marks = new Array(chars.length).fill(false);
	for (const seg of segments) {
		const start = side === "a" ? seg.startA : seg.startB;
		const end = side === "a" ? seg.endA : seg.endB;
		for (let i = start; i < end && i < chars.length; i++) {
			marks[i] = true;
		}
	}

	let result = "";
	let inMark = false;
	for (let i = 0; i < chars.length; i++) {
		const ch = escapeChar(chars[i]);
		if (marks[i] && !inMark) {
			result += `<mark class="plagiarism-mark">`;
			inMark = true;
		} else if (!marks[i] && inMark) {
			result += `</mark>`;
			inMark = false;
		}
		result += ch;
	}
	if (inMark) result += `</mark>`;
	return result;
};

const escapeHtml = (text: string) =>
	text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const escapeChar = (ch: string) => {
	if (ch === "&") return "&amp;";
	if (ch === "<") return "&lt;";
	if (ch === ">") return "&gt;";
	return ch;
};

const getSimilarityClass = (percent: number) => {
	if (percent >= 70) return "text-danger fw-bold";
	if (percent >= 40) return "text-warning fw-bold";
	return "text-success fw-bold";
};

const getSimilarityBadge = (percent: number) => {
	if (percent >= 70) return "bg-danger";
	if (percent >= 40) return "bg-warning text-dark";
	return "bg-success";
};

const renderAiReport = (text: string) => {
	if (!text) return "";
	return DOMPurify.sanitize(marked.parse(text) as string);
};
</script>

<template>
	<div class="plagiarism-overlay">
		<div class="plagiarism-modal">
			<div class="plagiarism-header">
				<div class="d-flex align-items-center gap-3">
					<div class="header-icon">
						<i class="fas fa-shield-halved"></i>
					</div>
					<div>
						<h4 class="mb-0 fw-bold">Kiểm tra Đạo văn</h4>
						<small class="text-white-50"
							>Phân tích trùng lặp bằng thuật toán Rabin-Karp & AI</small
						>
					</div>
				</div>
				<button class="btn-close-custom" @click="emit('close')">
					<i class="fas fa-times"></i>
				</button>
			</div>

			<div class="plagiarism-tabs">
				<div class="tab-btn active">
					<i class="fas fa-code-compare me-2"></i>So sánh & Phân tích đạo văn
				</div>
			</div>

			<div class="plagiarism-body custom-scrollbar">
				<div class="tab-content">
					<div class="compare-controls row g-3 mb-4">
						<div class="col-md-4">
							<label class="form-label small fw-bold text-muted"
								>HỌC VIÊN A</label
							>
							<select v-model="selectedAttemptA" class="form-select">
								<option :value="null">-- Chọn học viên A --</option>
								<option v-for="s in sessions" :key="s.id" :value="s.id">
									{{ s.userFullName }} (#{{ s.id }})
								</option>
							</select>
						</div>
						<div class="col-md-4">
							<label class="form-label small fw-bold text-muted"
								>HỌC VIÊN B</label
							>
							<select
								v-model="selectedAttemptB"
								class="form-select"
								:disabled="!selectedAttemptA"
							>
								<option :value="null">-- Chọn học viên B --</option>
								<option
									v-for="s in filteredSessionsB"
									:key="s.id"
									:value="s.id"
								>
									{{ s.userFullName }} (#{{ s.id }})
								</option>
							</select>
						</div>
						<div class="col-md-4">
							<label class="form-label small fw-bold text-muted">CÂU HỎI</label>
							<select
								v-model="selectedQuestionId"
								class="form-select"
								:disabled="!selectedAttemptA || !selectedAttemptB"
							>
								<option :value="null">-- Chọn câu hỏi --</option>
								<option v-for="q in questions" :key="q.id" :value="q.id">
									{{ q.content.substring(0, 60) }}...
								</option>
							</select>
						</div>
						<div class="col-12">
							<button
								class="btn btn-primary fw-bold px-4"
								:disabled="isComparing"
								@click="runCompare"
							>
								<i
									class="fas fa-code-compare me-2"
									:class="{ 'fa-spin': isComparing }"
								></i>
								{{ isComparing ? "Đang phân tích..." : "So sánh & phân tích" }}
							</button>
						</div>
					</div>

					<div v-if="compareResult" class="compare-result">
						<div
							class="similarity-banner"
							:class="getSimilarityClass(compareResult.similarityPercent)"
						>
							<div class="d-flex align-items-center justify-content-between">
								<div>
									<div class="fs-4 fw-black">
										{{ compareResult.similarityPercent.toFixed(1) }}%
									</div>
									<div class="small">Độ tương đồng tổng thể</div>
								</div>
								<div class="text-end">
									<div class="fw-bold">
										{{ compareResult.matchedSegments.length }} đoạn trùng lặp
									</div>
									<div class="small">được phát hiện</div>
								</div>
							</div>
						</div>

						<div class="diff-screen">
							<div class="diff-panel">
								<div class="diff-panel-header">
									<i class="fas fa-user-circle me-2"></i>
									{{ compareResult.studentNameA }} (Bài #{{
										compareResult.attemptIdA
									}})
								</div>
								<div
									class="diff-panel-body custom-scrollbar"
									v-html="
										buildHighlightedHtml(
											compareResult.textA,
											compareResult.matchedSegments,
											'a',
										)
									"
								></div>
							</div>

							<div class="diff-divider">
								<div class="diff-divider-inner">
									<i class="fas fa-arrows-left-right"></i>
								</div>
							</div>

							<div class="diff-panel">
								<div class="diff-panel-header right">
									<i class="fas fa-user-circle me-2"></i>
									{{ compareResult.studentNameB }} (Bài #{{
										compareResult.attemptIdB
									}})
								</div>
								<div
									class="diff-panel-body custom-scrollbar"
									v-html="
										buildHighlightedHtml(
											compareResult.textB,
											compareResult.matchedSegments,
											'b',
										)
									"
								></div>
							</div>
						</div>

						<div class="ai-report">
							<div class="ai-report-header">
								<i class="fas fa-gavel me-2"></i>
								BIÊN BẢN GHI NHẬN BẤT THƯỜNG - HỘI ĐỒNG KỶ LUẬT
							</div>
							<div
								class="ai-report-body markdown-body custom-scrollbar"
								v-html="renderAiReport(compareResult.aiReport)"
							></div>
						</div>
					</div>

					<div v-else-if="!isComparing" class="empty-state">
						<i class="fas fa-code-compare fa-4x mb-3 text-muted"></i>
						<p class="text-muted">
							Chọn 2 học viên và 1 câu hỏi, sau đó nhấn "So sánh & phân tích".
						</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
.plagiarism-overlay {
	position: fixed;
	inset: 0;
	background: rgba(0, 0, 0, 0.65);
	backdrop-filter: blur(6px);
	z-index: 2000;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 1rem;
}

.plagiarism-modal {
	width: 100%;
	max-width: 1400px;
	height: 90vh;
	background: #ffffff;
	border-radius: 20px;
	overflow: hidden;
	display: flex;
	flex-direction: column;
	box-shadow: 0 25px 60px rgba(0, 0, 0, 0.4);
}

.plagiarism-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 1.25rem 1.75rem;
	background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%);
	color: white;
	flex-shrink: 0;
}

.header-icon {
	width: 48px;
	height: 48px;
	background: rgba(255, 255, 255, 0.15);
	border-radius: 12px;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 1.4rem;
}

.btn-close-custom {
	width: 36px;
	height: 36px;
	background: rgba(255, 255, 255, 0.15);
	border: none;
	border-radius: 50%;
	color: white;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	transition: background 0.2s;
}

.btn-close-custom:hover {
	background: rgba(255, 255, 255, 0.3);
}

.plagiarism-tabs {
	display: flex;
	gap: 0;
	border-bottom: 1px solid #e2e8f0;
	flex-shrink: 0;
	background: #f8fafc;
	padding: 0.75rem 1.75rem 0;
}

.tab-btn {
	padding: 0.6rem 1.5rem;
	background: none;
	border: none;
	border-bottom: 3px solid transparent;
	cursor: pointer;
	font-weight: 600;
	color: #64748b;
	transition: all 0.2s;
	border-radius: 8px 8px 0 0;
}

.tab-btn.active {
	color: #4c1d95;
	border-bottom-color: #4c1d95;
	background: white;
}

.plagiarism-body {
	flex: 1;
	overflow-y: auto;
	padding: 1.5rem 1.75rem;
}

.tab-content {
	height: 100%;
}

.scan-group-header {
	background: linear-gradient(135deg, #312e81, #4c1d95);
	color: white;
	padding: 0.75rem 1.25rem;
	border-radius: 10px 10px 0 0;
	font-weight: 600;
	font-size: 0.9rem;
}

.pair-card {
	background: #fff;
	border: 1px solid #e2e8f0;
	border-top: none;
	padding: 1rem 1.25rem;
	transition: background 0.15s;
}

.pair-card:last-child {
	border-radius: 0 0 10px 10px;
}

.pair-card:hover {
	background: #f8f5ff;
}

.student-avatar {
	width: 40px;
	height: 40px;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	font-weight: 800;
	font-size: 1rem;
	flex-shrink: 0;
}

.student-avatar.a {
	background: #dbeafe;
	color: #1d4ed8;
}

.student-avatar.b {
	background: #ffe4e6;
	color: #be123c;
}

.vs-badge {
	background: #f1f5f9;
	color: #475569;
	font-weight: 800;
	font-size: 0.75rem;
	padding: 0.2rem 0.5rem;
	border-radius: 6px;
}

.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 4rem 2rem;
	text-align: center;
	color: #94a3b8;
}

.similarity-banner {
	padding: 1.25rem 1.5rem;
	border-radius: 12px;
	margin-bottom: 1.25rem;
}

.similarity-banner.text-danger {
	background: linear-gradient(135deg, #fef2f2, #fee2e2);
	border: 1px solid #fca5a5;
}

.similarity-banner.text-warning {
	background: linear-gradient(135deg, #fffbeb, #fef3c7);
	border: 1px solid #fcd34d;
}

.similarity-banner.text-success {
	background: linear-gradient(135deg, #f0fdf4, #dcfce7);
	border: 1px solid #86efac;
}

.diff-screen {
	display: grid;
	grid-template-columns: 1fr 48px 1fr;
	gap: 0;
	border: 1px solid #e2e8f0;
	border-radius: 12px;
	overflow: hidden;
	margin-bottom: 1.5rem;
	min-height: 320px;
	max-height: 420px;
}

.diff-panel {
	display: flex;
	flex-direction: column;
	overflow: hidden;
}

.diff-panel-header {
	padding: 0.75rem 1rem;
	background: #1d4ed8;
	color: white;
	font-weight: 700;
	font-size: 0.85rem;
}

.diff-panel-header.right {
	background: #be123c;
	text-align: right;
}

.diff-panel-body {
	flex: 1;
	padding: 1rem;
	font-family: "Segoe UI", sans-serif;
	font-size: 0.9rem;
	line-height: 1.8;
	white-space: pre-wrap;
	word-break: break-word;
	overflow-y: auto;
	background: #fafafa;
}

.diff-divider {
	display: flex;
	align-items: center;
	justify-content: center;
	background: #f1f5f9;
	border-left: 1px dashed #cbd5e1;
	border-right: 1px dashed #cbd5e1;
	flex-direction: column;
}

.diff-divider-inner {
	background: #e2e8f0;
	border-radius: 50%;
	width: 32px;
	height: 32px;
	display: flex;
	align-items: center;
	justify-content: center;
	color: #64748b;
	font-size: 0.8rem;
}

.ai-report {
	border: 1px solid #c4b5fd;
	border-radius: 12px;
	overflow: hidden;
}

.ai-report-header {
	padding: 0.85rem 1.25rem;
	background: linear-gradient(135deg, #4c1d95, #6d28d9);
	color: white;
	font-weight: 700;
	font-size: 0.85rem;
	letter-spacing: 0.5px;
}

.ai-report-body {
	padding: 1.5rem;
	max-height: 400px;
	overflow-y: auto;
	background: #fdf8ff;
	font-size: 0.9rem;
	line-height: 1.7;
}
</style>

<style>
.plagiarism-mark {
	background-color: rgba(250, 204, 21, 0.55);
	border-bottom: 2px solid #f59e0b;
	border-radius: 2px;
	padding: 0 1px;
}
</style>
