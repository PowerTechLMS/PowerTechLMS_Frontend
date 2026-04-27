<template>
	<div class="container-fluid role-play-admin">
		<div class="page-header mb-4">
			<div class="d-flex align-items-center gap-3">
				<div
					class="header-icon bg-primary-light text-primary rounded-circle p-3"
				>
					<i class="fas fa-robot fa-2x"></i>
				</div>
				<div>
					<h1 class="h3 mb-0 fw-bold">Quản lý Role Play Sessions</h1>
					<p class="text-muted mb-0">
						Theo dõi và đánh giá kết quả thực hành AI của học viên
					</p>
				</div>
			</div>
		</div>

		<div class="glass-card shadow-sm border-0 rounded-4 overflow-hidden">
			<div
				class="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center"
			>
				<div class="search-box position-relative" style="width: 300px">
					<i
						class="fas fa-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"
					></i>
					<input
						v-model="searchQuery"
						type="text"
						class="form-control ps-5 rounded-pill border-light bg-light"
						placeholder="Tìm tên học viên, ID..."
					/>
				</div>
				<div class="filters d-flex gap-2">
					<select
						v-model="statusFilter"
						class="form-select border-light bg-light rounded-pill"
					>
						<option value="">Tất cả trạng thái</option>
						<option value="InProgress">Đang diễn ra</option>
						<option value="Processing">Đang chấm điểm</option>
						<option value="Completed">Đã hoàn thành</option>
						<option value="Failed">Thất bại</option>
					</select>
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
							<th class="ps-4" style="width: 30%">Học viên</th>
							<th class="text-center" style="width: 15%">Trạng thái</th>
							<th class="text-center" style="width: 15%">Điểm số</th>
							<th class="text-center" style="width: 15%">Ngày thực hiện</th>
							<th class="text-center" style="width: 10%">Vi phạm</th>
							<th class="text-end pe-4" style="width: 15%">Thao tác</th>
						</tr>
					</thead>
					<tbody>
						<tr v-if="isLoading && sessions.length === 0">
							<td colspan="5" class="text-center py-5">
								<div class="spinner-border text-primary mb-2"></div>
								<p class="text-muted">Đang tải danh sách...</p>
							</td>
						</tr>
						<tr v-else-if="filteredSessions.length === 0">
							<td colspan="5" class="text-center py-5 text-muted italic">
								Không tìm thấy phiên thực hành nào.
							</td>
						</tr>
						<tr
							v-for="s in filteredSessions"
							:key="s.id"
							class="transition-all"
						>
							<td class="ps-4">
								<div class="d-flex align-items-center gap-2">
									<div
										class="avatar-sm bg-info-light text-info rounded-circle d-flex align-items-center justify-content-center fw-bold text-uppercase"
										style="width: 32px; height: 32px; font-size: 12px"
									>
										{{ s.userFullName ? s.userFullName.charAt(0) : "?" }}
									</div>
									<div class="user-info">
										<div class="fw-bold text-dark" style="font-size: 13px">
											{{ s.userFullName || "N/A" }}
										</div>
										<div class="text-muted" style="font-size: 11px">
											ID: #{{ s.userId }}
										</div>
									</div>
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
									v-if="s.score !== null && s.score !== undefined"
									class="score-pill d-flex flex-column align-items-center"
								>
									<div class="d-flex align-items-center gap-1">
										<span
											class="fw-bold fs-5"
											:class="
												s.score >= (s.passScore || 50)
													? 'text-success'
													: 'text-danger'
											"
											>{{ s.score }}</span
										>
										<small class="text-muted">/100</small>
									</div>
									<div
										:class="
											s.score >= (s.passScore || 50)
												? 'text-success'
												: 'text-danger'
										"
										style="font-size: 10px; font-weight: bold"
									>
										{{ s.score >= (s.passScore || 50) ? "ĐẠT" : "KHÔNG ĐẠT" }}
									</div>
								</div>
								<span v-else class="text-muted small italic">Chưa có</span>
							</td>
							<td class="text-center">{{ formatDate(s.createdAt) }}</td>
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
									class="btn btn-sm btn-outline-primary border-0 rounded-circle me-1"
									title="Xem chi tiết"
								>
									<i class="fas fa-eye"></i>
								</button>
								<button
									@click="editStatus(s)"
									class="btn btn-sm btn-outline-secondary border-0 rounded-circle"
									title="Sửa kết quả"
								>
									<i class="fas fa-edit"></i>
								</button>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>

		<!-- Detail Modal -->
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
				class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable"
			>
				<div class="modal-content border-0 rounded-4 shadow-lg">
					<div
						class="modal-header border-bottom-0 pt-4 px-4 align-items-center"
					>
						<h5 class="modal-title fw-bold fs-4">
							Phiên Role Play #{{ selectedSession.id }}
						</h5>
						<button
							@click="selectedSession = null"
							class="btn-close shadow-none"
						></button>
					</div>
					<div class="modal-body p-4 custom-scrollbar">
						<div class="row g-4 mb-4">
							<div class="col-md-7">
								<h6 class="fw-bold text-muted text-uppercase small mb-3">
									Lịch sử hội thoại
								</h6>
								<div
									class="chat-history p-3 bg-light rounded-4 border border-light"
									style="
										max-height: 500px;
										display: flex;
										flex-direction: column;
										gap: 1rem;
										overflow-y: auto;
									"
								>
									<div
										v-for="m in selectedSession.messages"
										:key="m.id"
										:class="['msg-admin', m.role]"
									>
										<div
											class="small fw-bold mb-1"
											:class="m.role === 'AI' ? 'text-primary' : 'text-success'"
										>
											{{
												m.role.toUpperCase() === "AI"
													? "🤖 AI Mentor"
													: "👤 Học viên"
											}}
										</div>
										<div
											class="p-3 bg-white rounded-3 shadow-sm border border-light markdown-body"
											v-html="renderMarkdown(m.content)"
										></div>
										<div
											class="text-end small text-muted mt-1"
											style="font-size: 10px"
										>
											{{ formatDate(m.createdAt, true) }}
										</div>
									</div>
								</div>
							</div>
							<div class="col-md-5">
								<h6 class="fw-bold text-muted text-uppercase small mb-3">
									Kết quả & Nhận xét
								</h6>
								<div
									class="result-sidebar glass p-3 rounded-4 sticky-top"
									style="top: 0"
								>
									<div class="mb-3 text-center">
										<div
											class="score-circle mx-auto mb-2"
											:class="
												selectedSession.score >=
												(selectedSession.passScore || 50)
													? 'border-success text-success'
													: 'border-danger text-danger'
											"
										>
											<span class="fs-1 fw-black">{{
												selectedSession.score ?? "?"
											}}</span>
											<small class="d-block text-muted">/ 100</small>
										</div>
										<div class="mb-2">
											<span
												v-if="selectedSession.score !== null"
												:class="
													selectedSession.score >=
													(selectedSession.passScore || 50)
														? 'badge bg-success'
														: 'badge bg-danger'
												"
												class="px-3 py-1"
											>
												{{
													selectedSession.score >=
													(selectedSession.passScore || 50)
														? "ĐẠT"
														: "KHÔNG ĐẠT"
												}}
											</span>
										</div>
										<div
											class="badge rounded-pill px-3"
											:class="getStatusClass(selectedSession.status)"
										>
											{{ getStatusLabel(selectedSession.status) }}
										</div>
									</div>
									<div class="feedback-area">
										<label class="fw-bold small text-primary mb-1"
											><i class="fas fa-comment-dots me-1"></i> Nhận xét từ
											AI:</label
										>
										<div
											class="p-3 bg-white border border-light rounded-3 small custom-scrollbar markdown-body"
											style="max-height: 250px; overflow-y: auto"
											v-html="renderMarkdown(selectedSession.feedback)"
										></div>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div class="modal-footer border-top-0 pb-4 px-4">
						<button
							@click="selectedSession = null"
							class="btn btn-light rounded-pill px-4 border"
						>
							Đóng
						</button>
						<button
							@click="editStatus(selectedSession)"
							class="btn btn-primary rounded-pill px-4"
						>
							Sửa kết quả
						</button>
					</div>
				</div>
			</div>
		</div>

		<!-- Edit Status Modal -->
		<div
			v-if="editingSession"
			class="modal-backdrop fade show"
			style="z-index: 1060"
		></div>
		<div
			v-if="editingSession"
			class="modal fade show d-block"
			tabindex="-1"
			style="z-index: 1061"
		>
			<div class="modal-dialog modal-dialog-centered">
				<div class="modal-content border-0 rounded-4 shadow-lg">
					<div class="modal-header border-bottom pb-3">
						<h5 class="modal-title fw-bold">
							Cập nhật kết quả phiên #{{ editingSession.id }}
						</h5>
						<button
							@click="editingSession = null"
							class="btn-close shadow-none"
						></button>
					</div>
					<div class="modal-body p-4">
						<div class="mb-3">
							<div class="d-flex justify-content-between align-items-center">
								<label class="form-label fw-bold small"
									>Điểm số (0 - 100)</label
								>
								<span
									v-if="editPayload.score !== null"
									:class="
										editPayload.score >= (editingSession.passScore || 50)
											? 'text-success'
											: 'text-danger'
									"
									class="fw-bold small"
								>
									{{
										editPayload.score >= (editingSession.passScore || 50)
											? "ĐẠT"
											: "KHÔNG ĐẠT"
									}}
								</span>
							</div>
							<input
								v-model.number="editPayload.score"
								type="number"
								min="0"
								max="100"
								step="1"
								class="form-control"
							/>
							<div class="text-muted fs-11 mt-1">
								Điểm sàn yêu cầu:
								<strong>{{ editingSession.passScore || 50 }}</strong>
							</div>
						</div>
						<div class="mb-0">
							<label class="form-label fw-bold small"
								>Nhận xét/Phản hồi (Markdown)</label
							>
							<textarea
								v-model="editPayload.feedback"
								class="form-control"
								rows="5"
								placeholder="Nhập nhận xét thủ công..."
							></textarea>
						</div>
					</div>
					<div class="modal-footer border-top p-3">
						<button
							@click="editingSession = null"
							class="btn btn-light rounded-pill px-4 border"
						>
							Hủy
						</button>
						<button
							@click="confirmUpdateStatus"
							class="btn btn-primary rounded-pill px-4"
							:disabled="isSaving"
						>
							<i v-if="isSaving" class="fas fa-spinner fa-spin me-2"></i>Lưu
							thay đổi
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { adminRolePlayAPI } from "@/services/api";
import { toast } from "vue3-toastify";
import { marked } from "marked";
import DOMPurify from "dompurify";

const sessions = ref([]);
const isLoading = ref(false);
const isSaving = ref(false);
const searchQuery = ref("");
const statusFilter = ref("");

const selectedSession = ref(null);
const editingSession = ref(null);
const editPayload = ref({ status: "", score: 0, feedback: "" });

const loadSessions = async () => {
	isLoading.value = true;
	try {
		const res = await adminRolePlayAPI.getAllSessions();
		sessions.value = res.data;
	} catch {
		toast.error("Không thể tải danh sách sessions.");
	} finally {
		isLoading.value = false;
	}
};

onMounted(loadSessions);

const filteredSessions = computed(() => {
	return sessions.value
		.filter((s) => {
			const matchesStatus =
				!statusFilter.value || s.status === statusFilter.value;
			const search = searchQuery.value.toLowerCase();
			const matchesSearch =
				!search ||
				(s.userFullName && s.userFullName.toLowerCase().includes(search)) ||
				(s.lessonTitle && s.lessonTitle.toLowerCase().includes(search)) ||
				s.userId.toString().includes(search) ||
				s.lessonId.toString().includes(search);
			return matchesStatus && matchesSearch;
		})
		.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
});

const getStatusLabel = (s) => {
	const labels = {
		InProgress: "Đang diễn ra",
		Processing: "Đang chấm điểm",
		Completed: "Hoàn thành",
		Failed: "Thất bại",
	};
	return labels[s] || s;
};

const getStatusClass = (s) => {
	const classes = {
		InProgress: "bg-info text-white",
		Processing: "bg-warning text-dark",
		Completed: "bg-success text-white",
		Failed: "bg-danger text-white",
	};
	return classes[s] || "bg-secondary text-white";
};

const formatDate = (dateStr, includeTime = false) => {
	if (!dateStr) return "N/A";
	const date = new Date(dateStr);
	const options = { year: "numeric", month: "short", day: "numeric" };
	if (includeTime) {
		options.hour = "2-digit";
		options.minute = "2-digit";
	}
	return date.toLocaleString("vi-VN", options);
};

const renderMarkdown = (text) => {
	if (!text) return '<span class="text-muted italic">Trống</span>';
	return DOMPurify.sanitize(marked.parse(text));
};

const viewDetail = (session) => {
	selectedSession.value = session;
};

const editStatus = (session) => {
	editingSession.value = session;
	editPayload.value = {
		status: session.status,
		score: session.score || 0,
		feedback: session.feedback || "",
	};
};

const confirmUpdateStatus = async () => {
	if (editPayload.value.score < 0 || editPayload.value.score > 100) {
		toast.warning("Điểm số phải từ 0 đến 100");
		return;
	}
	isSaving.value = true;
	try {
		await adminRolePlayAPI.updateStatus(
			editingSession.value.id,
			editPayload.value,
		);
		toast.success("Cập nhật trạng thái thành công!");
		editingSession.value = null;
		selectedSession.value = null;
		loadSessions();
	} catch {
		toast.error("Lỗi khi cập nhật trạng thái.");
	} finally {
		isSaving.value = false;
	}
};
</script>

<style scoped>
.role-play-admin {
	padding-top: 1.5rem;
	padding-bottom: 2rem;
}
.glass-card {
	background: rgba(255, 255, 255, 0.8);
	backdrop-filter: blur(8px);
	border: 1px solid rgba(255, 255, 255, 0.3);
}
.bg-primary-light {
	background-color: rgba(99, 102, 241, 0.1);
}
.bg-info-light {
	background-color: rgba(6, 182, 212, 0.1);
}

.score-circle {
	width: 100px;
	height: 100px;
	border-radius: 50%;
	border: 5px solid #eee;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	line-height: 1;
}

.score-pill {
	display: inline-flex;
	align-items: center;
	gap: 4px;
}

.chat-history .msg-admin {
	max-width: 90%;
}
.chat-history .msg-admin.AI,
.chat-history .msg-admin.Ai {
	align-self: flex-start;
	margin-right: auto;
}
.chat-history .msg-admin.User {
	align-self: flex-end;
	margin-left: auto;
	text-align: right;
}
.chat-history .msg-admin.User .markdown-body {
	text-align: left;
}

.custom-scrollbar::-webkit-scrollbar {
	width: 4px;
	height: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
	background: #ccc;
	border-radius: 4px;
}

.transition-all {
	transition: all 0.2s;
}
.transition-all:hover {
	background-color: #f8fafc;
	transform: translateX(4px);
}
.fw-black {
	font-weight: 900;
}

.markdown-body {
	font-size: 0.9rem;
}
</style>
