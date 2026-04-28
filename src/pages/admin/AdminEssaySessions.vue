<template>
	<div class="container-fluid essay-admin">
		<div class="page-header mb-4">
			<div class="d-flex align-items-center gap-3">
				<div
					class="header-icon bg-warning-light text-warning rounded-circle p-3"
				>
					<i class="fas fa-file-signature fa-2x"></i>
				</div>
				<div>
					<h1 class="h3 mb-0 fw-bold">Quản lý bài làm Tự luận</h1>
					<p class="text-muted mb-0">
						Theo dõi, chấm điểm và đánh giá bài viết của học員
					</p>
				</div>
			</div>
		</div>

		<div class="glass-card shadow-sm border-0 rounded-4">
			<div
				class="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center flex-wrap gap-3"
			>
				<div class="search-box position-relative" style="width: 260px">
					<i
						class="fas fa-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"
					></i>
					<input
						v-model="searchQuery"
						type="text"
						class="form-control ps-5 rounded-pill border-light bg-light"
						placeholder="Tìm tên..."
					/>
				</div>
				<div class="filters d-flex gap-2 align-items-center">
					<select
						v-model="statusFilter"
						class="form-select border-light bg-light rounded-pill"
						style="width: 170px"
					>
						<option value="">Tất cả trạng thái</option>
						<option value="Processing">Đang chấm</option>
						<option value="Completed">Đã xong</option>
						<option value="Failed">Thất bại</option>
					</select>
					<button
						@click="openPlagiarism"
						class="btn btn-plagiarism rounded-pill shadow-sm fw-bold px-4"
						title="Kiểm tra đạo văn"
					>
						<i class="fas fa-shield-halved me-2 text-white"></i>Kiểm tra đạo văn
					</button>
					<button
						@click="loadSessions"
						class="btn btn-light rounded-circle shadow-sm"
						title="Làm mới"
					>
						<i class="fas fa-sync-alt" :class="{ 'fa-spin': isLoading }"></i>
					</button>
				</div>
			</div>

			<div class="table-responsive custom-scrollbar" style="max-height: 70vh">
				<table class="table table-hover align-middle mb-0">
					<thead class="bg-light sticky-top">
						<tr>
							<th class="ps-4">Học viên / Bài học</th>
							<th class="text-center">Trạng thái</th>
							<th class="text-center">Điểm số</th>
							<th class="text-center">Ngày nộp</th>
							<th class="text-center">Vi phạm</th>
							<th class="text-end pe-4">Thao tác</th>
						</tr>
					</thead>
					<tbody>
						<tr v-if="isLoading && sessions.length === 0">
							<td colspan="5" class="text-center py-5">
								<div class="spinner-border text-warning mb-2"></div>
								<p class="text-muted">Đang tải danh sách bài làm...</p>
							</td>
						</tr>
						<tr v-else-if="filteredSessions.length === 0">
							<td colspan="5" class="text-center py-5 text-muted italic">
								Không tìm thấy bài làm nào.
							</td>
						</tr>
						<tr
							v-for="s in filteredSessions"
							:key="s.id"
							class="transition-all"
						>
							<td class="ps-4">
								<div class="d-flex align-items-center gap-2 mb-1">
									<div
										class="avatar-sm bg-warning-light text-warning rounded-circle d-flex align-items-center justify-content-center fw-bold"
										style="width: 32px; height: 32px; font-size: 12px"
									>
										{{ s.userFullName?.charAt(0) || "?" }}
									</div>
									<div class="fw-bold text-dark">
										{{ s.userFullName || "N/A" }}
									</div>
								</div>
								<div class="text-muted small ps-5">
									<i class="fas fa-book-open me-1"></i> {{ s.lessonTitle }}
								</div>
							</td>
							<td class="text-center">
								<span
									:class="[
										'badge rounded-pill px-3 py-2',
										getStatusClass(s.status),
									]"
									style="font-size: 11px"
								>
									{{ getStatusLabel(s.status) }}
								</span>
							</td>
							<td class="text-center">
								<div
									v-if="s.totalScore !== null"
									class="d-flex flex-column align-items-center"
								>
									<div class="d-flex align-items-center gap-1">
										<span
											class="fw-bold fs-5"
											:class="
												s.totalScore >= s.passScore
													? 'text-success'
													: 'text-danger'
											"
											>{{ s.totalScore }}</span
										>
										<small class="text-muted">/100</small>
									</div>
									<div
										:class="
											s.totalScore >= s.passScore
												? 'text-success'
												: 'text-danger'
										"
										style="font-size: 10px; font-weight: bold"
									>
										{{ s.totalScore >= s.passScore ? "ĐẠT" : "CHƯA ĐẠT" }}
									</div>
								</div>
								<span v-else class="text-muted small italic">Chưa chấm</span>
							</td>
							<td class="text-center">
								{{ formatDate(s.submittedAt || s.startedAt) }}
							</td>
							<td class="text-center">
								<span
									v-if="s.violationCount > 0"
									class="badge bg-danger rounded-pill"
								>
									{{ s.violationCount }}
								</span>
								<span v-else class="text-muted small">0</span>
							</td>
							<td class="text-end pe-4">
								<button
									@click="viewDetail(s)"
									class="btn btn-sm btn-outline-warning border-0 rounded-circle me-1"
									title="Xem chi tiết"
								>
									<i class="fas fa-eye"></i>
								</button>
								<button
									@click="editScore(s)"
									class="btn btn-sm btn-outline-secondary border-0 rounded-circle"
									title="Sửa điểm"
								>
									<i class="fas fa-edit"></i>
								</button>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>

		<div
			v-if="selectedSession"
			class="modal-backdrop fade show"
			style="z-index: 1050"
		></div>
		<div
			v-if="selectedSession"
			class="modal fade show d-block"
			tabindex="-1"
			style="z-index: 1051"
		>
			<div
				class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable"
			>
				<div class="modal-content border-0 rounded-4 shadow-lg">
					<div
						class="modal-header border-bottom-0 pt-4 px-4 align-items-center"
					>
						<h5 class="modal-title fw-bold fs-4">
							{{
								isEditing ? "Chấm điểm bài tự luận" : "Chi tiết bài làm tự luận"
							}}
							#{{ selectedSession.id }}
						</h5>
						<button @click="closeModal" class="btn-close shadow-none"></button>
					</div>
					<div class="modal-body p-4 custom-scrollbar">
						<div class="row g-4">
							<div class="col-lg-8">
								<h6
									class="fw-bold text-muted text-uppercase small mb-3 border-bottom pb-2"
								>
									Nội dung bài làm
								</h6>
								<div
									v-for="(ans, idx) in selectedSession.answers"
									:key="ans.id"
									class="answer-item mb-4 bg-light p-3 rounded-4 border border-light"
								>
									<div
										class="d-flex justify-content-between align-items-center mb-2"
									>
										<div class="question-title fw-bold text-warning-dark">
											Câu {{ Number(idx) + 1 }}: {{ ans.questionContent }}
										</div>
										<div class="badge bg-white text-dark border">
											Tỉ trọng: {{ ans.weight }}%
											<span v-if="!isEditing">
												| AI chấm: {{ ans.aiScore }}/100
											</span>
										</div>
									</div>
									<div
										class="student-answer bg-white p-3 rounded-3 shadow-sm border border-light markdown-body mb-3"
										v-html="
											renderMarkdown(
												String(ans.userAnswer || ans.content || ''),
											)
										"
									></div>

									<div v-if="isEditing" class="p-3 bg-white rounded-3 border">
										<div class="mb-3" v-if="ans.scoringCriteria">
											<label class="form-label small fw-bold text-muted"
												>TIÊU CHÍ CHẤM ĐIỂM:</label
											>
											<div class="small p-2 bg-light rounded text-muted">
												{{ ans.scoringCriteria }}
											</div>
										</div>
										<div class="row g-3">
											<div class="col-md-3">
												<label class="form-label small fw-bold"
													>ĐIỂM SỐ (0-100):</label
												>
												<input
													type="number"
													class="form-control"
													v-model.number="ans.aiScore"
													min="0"
													max="100"
												/>
											</div>
											<div class="col-md-9">
												<label class="form-label small fw-bold"
													>GÓP Ý CHI TIẾT:</label
												>
												<input
													type="text"
													class="form-control"
													v-model="ans.aiFeedback"
													placeholder="Nhập góp ý cho câu này..."
												/>
											</div>
										</div>
									</div>

									<div
										v-else-if="ans.aiFeedback"
										class="ai-feedback-item small p-2 mt-2 bg-info-light rounded border border-info-subtle"
									>
										<strong><i class="fas fa-robot me-1"></i> Góp ý AI:</strong>
										{{ ans.aiFeedback }}
									</div>
								</div>
							</div>
							<div class="col-lg-4">
								<h6
									class="fw-bold text-muted text-uppercase small mb-3 border-bottom pb-2"
								>
									{{ isEditing ? "KẾT QUẢ CHẤM ĐIỂM" : "KẾT QUẢ AI CHẤM" }}
								</h6>
								<div class="result-card glass p-4 rounded-4 text-center mb-4">
									<div class="score-display mb-3">
										<div
											class="score-circle-big mx-auto mb-2"
											:class="
												computedTotalScore >= selectedSession.passScore
													? 'pass'
													: 'fail'
											"
										>
											<span class="score-num">{{ computedTotalScore }}</span>
											<span class="score-total">/100</span>
										</div>
										<div
											:class="
												computedTotalScore >= selectedSession.passScore
													? 'text-success'
													: 'text-danger'
											"
											class="fw-bold fs-5"
										>
											{{
												computedTotalScore >= selectedSession.passScore
													? "ĐẠT"
													: "CHƯA ĐẠT"
											}}
										</div>
									</div>
									<div class="mb-4">
										<label
											class="d-block fw-bold text-muted small mb-2 text-start"
											>NHẬN XÉT TỔNG QUÁT:</label
										>
										<textarea
											v-if="isEditing"
											class="form-control mb-2"
											v-model="selectedSession.aiFeedback"
											rows="5"
											placeholder="Nhập nhận xét tổng quát cho toàn bộ bài..."
										></textarea>
										<div
											v-else
											class="feedback-text text-start p-3 bg-white border border-light rounded-3 small custom-scrollbar markdown-body"
											style="max-height: 400px; overflow-y: auto"
											v-html="renderMarkdown(selectedSession.aiFeedback)"
										></div>
									</div>

									<div class="d-grid gap-2">
										<button
											v-if="isEditing"
											class="btn btn-success fw-bold text-white shadow-sm"
											@click="saveDetailScores"
											:disabled="isSaving"
										>
											<i
												class="fas fa-save me-2"
												:class="{ 'fa-spin': isSaving }"
											></i
											>LƯU KẾT QUẢ
										</button>
										<button
											v-else
											class="btn btn-warning fw-bold text-white shadow-sm"
											@click="startEditing"
										>
											<i class="fas fa-edit me-2"></i>CẬP NHẬT ĐIỂM
										</button>
										<button
											class="btn btn-light border fw-bold"
											@click="closeModal"
										>
											ĐÓNG
										</button>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>

	<PlagiarismDiffView
		v-if="isPlagiarismOpen"
		:sessions="plagiarismSessions"
		:lesson-id="plagiarismLessonId"
		@close="isPlagiarismOpen = false"
	/>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { essayAdminAPI } from "@/services/api";
import { toast } from "vue3-toastify";
import dayjs from "dayjs";
import { marked } from "marked";
import DOMPurify from "dompurify";
import PlagiarismDiffView from "@/components/PlagiarismDiffView.vue";

const sessions = ref<any[]>([]);
const isLoading = ref(false);
const searchQuery = ref("");
const statusFilter = ref("");
const selectedSession = ref<any>(null);

const filteredSessions = computed(() => {
	return sessions.value.filter((s) => {
		const matchSearch =
			(s.userFullName || "")
				.toLowerCase()
				.includes(searchQuery.value.toLowerCase()) ||
			(s.lessonTitle || "")
				.toLowerCase()
				.includes(searchQuery.value.toLowerCase());
		const matchStatus = !statusFilter.value || s.status === statusFilter.value;
		return matchSearch && matchStatus;
	});
});

const isEditing = ref(false);
const isSaving = ref(false);

const computedTotalScore = computed(() => {
	if (!selectedSession.value) return 0;
	const total = selectedSession.value.answers.reduce(
		(acc: number, ans: any) => {
			const score = Number(ans.aiScore) || 0;
			const weight = Number(ans.weight) || 0;
			return acc + (score * weight) / 100;
		},
		0,
	);
	return Math.round(total);
});

const loadSessions = async () => {
	isLoading.value = true;
	try {
		const res = await essayAdminAPI.getAllAttempts();
		sessions.value = res.data;
	} catch {
		toast.error("Không thể tải danh sách bài làm.");
	} finally {
		isLoading.value = false;
	}
};

const viewDetail = async (session: any) => {
	try {
		const res = await essayAdminAPI.getAttemptDetail(session.id);
		selectedSession.value = res.data;
		isEditing.value = false;
	} catch {
		toast.error("Không thể tải chi tiết bài làm.");
	}
};

const startEditing = () => {
	isEditing.value = true;
};

const closeModal = () => {
	selectedSession.value = null;
	isEditing.value = false;
};

const editScore = async (session: any) => {
	await viewDetail(session);
	if (selectedSession.value) {
		isEditing.value = true;
	}
};

const saveDetailScores = async () => {
	if (!selectedSession.value) return;

	isSaving.value = true;
	try {
		const payload = {
			aiFeedback: selectedSession.value.aiFeedback,
			answers: selectedSession.value.answers.map((a: any) => ({
				questionId: a.questionId,
				score: a.aiScore,
				feedback: a.aiFeedback,
			})),
		};

		await essayAdminAPI.updateScore(selectedSession.value.id, payload);
		toast.success("Đã cập nhật điểm số thành công!");
		isEditing.value = false;
		loadSessions();
	} catch {
		toast.error("Lỗi khi cập nhật điểm số.");
	} finally {
		isSaving.value = false;
	}
};

const getStatusLabel = (status: string) => {
	const labels: Record<string, string> = {
		InProgress: "Đang làm",
		Processing: "Đang chấm",
		Completed: "Hoàn thành",
		Failed: "Lỗi",
	};
	return labels[status] || status;
};

const getStatusClass = (status: string) => {
	const classes: Record<string, string> = {
		InProgress: "bg-primary-light text-primary",
		Processing: "bg-info-light text-info",
		Completed: "bg-success-light text-success",
		Failed: "bg-danger-light text-danger",
	};
	return classes[status] || "bg-light text-dark";
};

const formatDate = (date: string) => dayjs(date).format("HH:mm DD/MM/YYYY");

const renderMarkdown = (text: string) => {
	if (!text) return "";
	return DOMPurify.sanitize(marked.parse(text) as string);
};

const isPlagiarismOpen = ref(false);
const plagiarismSessions = ref<any[]>([]);
const plagiarismLessonId = ref<number | null>(null);

const openPlagiarism = () => {
	const lessonIds = [...new Set(sessions.value.map((s: any) => s.lessonId))];
	plagiarismLessonId.value =
		lessonIds.length === 1
			? lessonIds[0]
			: (filteredSessions.value[0]?.lessonId ?? null);
	plagiarismSessions.value = filteredSessions.value;
	isPlagiarismOpen.value = true;
};

onMounted(loadSessions);
</script>

<style scoped>
.essay-admin {
	padding: 1.5rem;
}

.bg-warning-light {
	background-color: #fffbeb !important;
}
.text-warning-dark {
	color: #92400e !important;
}
.bg-primary-light {
	background-color: #eff6ff !important;
}
.bg-info-light {
	background-color: #f0f9ff !important;
}
.bg-success-light {
	background-color: #f0fdf4 !important;
}
.bg-danger-light {
	background-color: #fef2f2 !important;
}

.glass-card {
	background: rgba(255, 255, 255, 0.8);
	backdrop-filter: blur(10px);
	border: 1px solid rgba(0, 0, 0, 0.05);
}

.score-circle-big {
	width: 120px;
	height: 120px;
	border-radius: 50%;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	border: 6px solid #e2e8f0;
}

.score-circle-big.pass {
	border-color: #10b981;
	color: #10b981;
}
.score-circle-big.fail {
	border-color: #ef4444;
	color: #ef4444;
}

.score-num {
	font-size: 42px;
	font-weight: 900;
	line-height: 1;
}
.score-total {
	font-size: 14px;
	opacity: 0.6;
	font-weight: 700;
}

.transition-all {
	transition: all 0.2s;
}
.transition-all:hover {
	background-color: rgba(245, 158, 11, 0.05);
}

.markdown-body {
	font-size: 14px;
	line-height: 1.6;
}

.btn-plagiarism {
	background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
	color: white;
	border: none;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	display: flex;
	align-items: center;
	white-space: nowrap;
}

.btn-plagiarism:hover {
	transform: translateY(-2px);
	box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4);
	color: white;
	filter: brightness(1.1);
}

.btn-plagiarism:active {
	transform: translateY(0);
}

.btn-outline-violet {
	border-color: #7c3aed;
	color: #7c3aed;
}
.btn-outline-violet:hover {
	background-color: #7c3aed;
	color: white;
}
</style>
