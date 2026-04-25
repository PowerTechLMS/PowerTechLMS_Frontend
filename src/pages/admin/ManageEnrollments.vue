<script lang="ts" setup>
import { ref, onMounted, computed } from "vue";
import { enrollmentAPI, courseAPI, userAPI } from "@/services/api";
import { toast } from "vue3-toastify";
import {
	Search,
	Filter,
	CheckCircle,
	XCircle,
	UserPlus,
	Calendar,
	BookOpen,
	Clock,
	Check,
	X,
	LayoutGrid,
	List,
	RotateCcw,
	Plus,
} from "lucide-vue-next";

const enrollments = ref<any[]>([]);
const courses = ref<any[]>([]);
const users = ref<any[]>([]);
const loading = ref(true);
const searchQuery = ref("");
const statusFilter = ref("all");
const viewMode = ref<"table" | "grid">("table");

const isModalOpen = ref(false);
const submitting = ref(false);
const form = ref({
	userId: "",
	courseId: "",
});

const isRejectModalOpen = ref(false);
const rejectReason = ref("");
const currentRejectId = ref<number | null>(null);
const rejecting = ref(false);

const fetchData = async () => {
	loading.value = true;
	try {
		const [enrollRes, courseRes, userRes] = await Promise.all([
			enrollmentAPI.getAll({ page: 1, pageSize: 1000 }),
			courseAPI.getAll({ page: 1, pageSize: 1000 }),
			userAPI.getAll({ page: 1, pageSize: 1000 }),
		]);

		enrollments.value = enrollRes.data.items || enrollRes.data || [];
		courses.value = courseRes.data.items || courseRes.data || [];
		users.value = userRes.data.items || userRes.data || [];
	} catch {
		toast.error("Không thể tải dữ liệu ghi danh.");
	} finally {
		loading.value = false;
	}
};

let pollInterval: any = null;

onMounted(async () => {
	await fetchData();
	pollInterval = setInterval(fetchData, 30000);
});

import { onUnmounted } from "vue";
onUnmounted(() => {
	if (pollInterval) clearInterval(pollInterval);
});

const handleRefresh = () => {
	fetchData();
	toast.info("Đã cập nhật danh sách ghi danh mới nhất.");
};

const filteredEnrollments = computed(() => {
	const query = searchQuery.value.toLowerCase();
	return enrollments.value.filter((e) => {
		const userName = (
			e.fullName ||
			e.userFullName ||
			e.user?.fullName ||
			""
		).toLowerCase();
		const courseTitle = (e.courseTitle || e.course?.title || "").toLowerCase();

		const matchesSearch =
			!query || userName.includes(query) || courseTitle.includes(query);

		const status = (e.status || "").toLowerCase();
		const matchesStatus =
			statusFilter.value === "all" ||
			(statusFilter.value === "pending" && status === "pending") ||
			(statusFilter.value === "approved" && status === "approved");

		return matchesSearch && matchesStatus;
	});
});

const stats = computed(() => {
	const total = enrollments.value.length;
	const pending = enrollments.value.filter(
		(e) => (e.status || "").toLowerCase() === "pending",
	).length;
	const approved = enrollments.value.filter(
		(e) => (e.status || "").toLowerCase() === "approved",
	).length;
	return { total, pending, approved };
});

const handleApprove = async (id: number) => {
	try {
		await enrollmentAPI.approve(id, true);
		toast.success("Đã phê duyệt yêu cầu ghi danh.");
		fetchData();
	} catch {
		toast.error("Không thể phê duyệt yêu cầu.");
	}
};

const handleReject = (id: number) => {
	currentRejectId.value = id;
	rejectReason.value = "";
	isRejectModalOpen.value = true;
};

const confirmReject = async () => {
	if (!currentRejectId.value) return;
	if (!rejectReason.value.trim()) {
		toast.warn("Vui lòng nhập lý do từ chối.");
		return;
	}

	rejecting.value = true;
	try {
		await enrollmentAPI.approve(
			currentRejectId.value,
			false,
			rejectReason.value,
		);
		toast.success("Đã từ chối yêu cầu ghi danh.");
		isRejectModalOpen.value = false;
		fetchData();
	} catch (error: any) {
		toast.error(error.response?.data?.message || "Lỗi khi từ chối yêu cầu.");
	} finally {
		rejecting.value = false;
	}
};

const openManualModal = () => {
	form.value = { userId: "", courseId: "" };
	isModalOpen.value = true;
};

const handleManualEnroll = async () => {
	if (!form.value.userId || !form.value.courseId) {
		toast.warn("Vui lòng chọn đầy đủ người dùng và khóa học.");
		return;
	}
	submitting.value = true;
	try {
		await enrollmentAPI.adminEnroll(form.value);
		toast.success("Ghi danh thành công.");
		isModalOpen.value = false;
		fetchData();
	} catch (error: any) {
		toast.error(error.response?.data?.message || "Lỗi khi ghi danh.");
	} finally {
		submitting.value = false;
	}
};

const getStatusBadge = (status: string) => {
	const s = (status || "").toLowerCase();
	if (s === "approved") {
		return { label: "Đã duyệt", class: "approved" };
	}
	if (s === "rejected") {
		return { label: "Từ chối", class: "rejected" };
	}
	return { label: "Chờ duyệt", class: "pending" };
};
</script>

<template>
	<div class="enrollments-management-page">
		<div class="page-header mb-5">
			<div class="header-content-box">
				<div class="header-icon-glass pulse-glow">
					<UserPlus :size="32" class="text-primary" />
				</div>
				<div class="header-titles">
					<div class="breadcrumb-glass mb-2">
						<span class="badge-glass primary">HỆ THỐNG</span>
						<ChevronRight :size="14" class="separator" />
						<span class="curr-page">Quản lý Ghi danh</span>
					</div>
					<h1 class="page-main-title-gradient">Phê duyệt Ghi danh</h1>
					<p class="secondary-desc">
						Thực hiện phê duyệt yêu cầu học hoặc chủ động ghi danh cho học viên.
					</p>
				</div>
			</div>

			<div class="header-actions d-flex gap-3">
				<button
					@click="handleRefresh"
					class="btn-glass-secondary px-4 me-2"
					:disabled="loading"
					title="Làm mới dữ liệu"
				>
					<RotateCcw :size="20" :class="{ spin: loading }" />
				</button>
				<button @click="openManualModal" class="btn-premium-gradient">
					<Plus :size="20" class="me-2" /> Ghi danh học viên
				</button>
			</div>
		</div>

		<div class="stats-glass-grid mb-5">
			<div class="glass-stat-card">
				<div class="stat-icon-box blue">
					<BookOpen :size="24" />
				</div>
				<div class="stat-info">
					<h3 class="stat-value">{{ stats.total }}</h3>
					<p class="stat-label">Tổng lượt đăng ký</p>
				</div>
				<div class="stat-progress-line blue" :style="{ width: '100%' }"></div>
			</div>

			<div class="glass-stat-card">
				<div class="stat-icon-box warning">
					<Clock :size="24" />
				</div>
				<div class="stat-info">
					<h3 class="stat-value">{{ stats.pending }}</h3>
					<p class="stat-label">Chờ phê duyệt</p>
				</div>
				<div
					class="stat-progress-line warning"
					:style="{
						width: stats.total
							? (stats.pending / stats.total) * 100 + '%'
							: '0%',
					}"
				></div>
			</div>

			<div class="glass-stat-card">
				<div class="stat-icon-box success">
					<CheckCircle :size="24" />
				</div>
				<div class="stat-info">
					<h3 class="stat-value">{{ stats.approved }}</h3>
					<p class="stat-label">Đã cấp quyền</p>
				</div>
				<div
					class="stat-progress-line success"
					:style="{
						width: stats.total
							? (stats.approved / stats.total) * 100 + '%'
							: '0%',
					}"
				></div>
			</div>
		</div>

		<div class="glass-content-card">
			<div class="glass-controls-bar">
				<div class="filters-left">
					<div class="glass-search-box">
						<Search :size="18" class="search-icon" />
						<input
							type="text"
							v-model="searchQuery"
							placeholder="Tìm tên học viên hoặc tên khóa học..."
							class="glass-search-input"
						/>
					</div>

					<div class="status-tabs-glass">
						<button
							class="status-tab-btn"
							:class="{ active: statusFilter === 'all' }"
							@click="statusFilter = 'all'"
						>
							Tất cả
						</button>
						<button
							class="status-tab-btn"
							:class="{ active: statusFilter === 'pending' }"
							@click="statusFilter = 'pending'"
						>
							Đang chờ
						</button>
						<button
							class="status-tab-btn"
							:class="{ active: statusFilter === 'approved' }"
							@click="statusFilter = 'approved'"
						>
							Đã duyệt
						</button>
					</div>
				</div>

				<div class="view-mode-toggle shadow-sm">
					<button
						class="toggle-btn"
						:class="{ active: viewMode === 'table' }"
						@click="viewMode = 'table'"
					>
						<List :size="18" />
					</button>
					<button
						class="toggle-btn"
						:class="{ active: viewMode === 'grid' }"
						@click="viewMode = 'grid'"
					>
						<LayoutGrid :size="18" />
					</button>
				</div>
			</div>

			<div class="glass-card-body">
				<div v-if="loading" class="loading-overlay-glass py-5">
					<div class="premium-spinner"></div>
					<p class="mt-3 text-tertiary fw-bold">Đang đồng bộ dữ liệu...</p>
				</div>

				<template v-else-if="filteredEnrollments.length">
					<div v-if="viewMode === 'table'" class="table-container-fixed">
						<table class="glass-table-premium">
							<thead>
								<tr>
									<th class="ps-4">Thông tin học viên</th>
									<th>Khóa học đăng ký</th>
									<th>Thời gian</th>
									<th class="text-center">Trạng thái</th>
									<th class="text-end pe-4">Thao tác</th>
								</tr>
							</thead>
							<tbody>
								<tr v-for="e in filteredEnrollments" :key="e.id">
									<td class="ps-4">
										<div class="user-profile-cell">
											<div class="user-meta-info">
												<div class="name-text fw-bold">
													{{
														e.fullName ||
														e.userFullName ||
														e.user?.fullName ||
														"---"
													}}
												</div>
												<div class="email-text text-tertiary fs-11">
													{{
														e.email || e.userName || e.user?.userName || "---"
													}}
												</div>
											</div>
										</div>
									</td>
									<td>
										<div class="course-profile-cell">
											<div class="course-title-text fw-bold">
												{{ e.courseTitle || e.course?.title || "Khóa học" }}
											</div>
											<div class="course-id-text fs-11 text-tertiary">
												Mã: {{ e.courseId }}
											</div>
										</div>
									</td>
									<td>
										<div class="time-cell d-flex align-items-center gap-2">
											<Calendar :size="14" class="text-tertiary" />
											<span class="fs-12 text-secondary">{{
												new Date(e.enrolledAt).toLocaleDateString("vi-VN")
											}}</span>
										</div>
									</td>
									<td class="text-center">
										<span
											class="glass-status-badge"
											:class="getStatusBadge(e.status).class"
										>
											<span class="dot"></span>
											{{ getStatusBadge(e.status).label }}
										</span>
										<div
											v-if="e.status === 'Rejected' && e.rejectionReason"
											class="rejection-reason-text text-danger fs-10 mt-1"
										>
											Lý do: {{ e.rejectionReason }}
										</div>
									</td>
									<td class="text-end pe-4">
										<div class="action-cell-buttons">
											<template
												v-if="(e.status || '').toLowerCase() === 'pending'"
											>
												<button
													class="action-btn approve-btn"
													@click="handleApprove(e.id)"
													title="Duyệt tham gia"
												>
													<Check :size="18" />
												</button>
												<button
													class="action-btn reject-btn"
													@click="handleReject(e.id)"
													title="Từ chối"
												>
													<X :size="18" />
												</button>
											</template>
											<div
												v-else-if="
													(e.status || '').toLowerCase() === 'approved'
												"
												class="approved-tag text-success fw-bold fs-12"
											>
												<CheckCircle :size="14" /> ĐÃ DUYỆT
											</div>
											<div v-else class="text-danger fw-bold fs-12">
												<XCircle :size="14" /> TỪ CHỐI
											</div>
										</div>
									</td>
								</tr>
							</tbody>
						</table>
					</div>

					<!-- Grid View -->
					<div v-else class="grid-container-premium p-4">
						<div class="card-grid-layout">
							<div
								v-for="e in filteredEnrollments"
								:key="e.id"
								class="enrollment-card-glass"
							>
								<div class="card-header">
									<span class="v-date">{{
										new Date(e.enrolledAt).toLocaleDateString("vi-VN")
									}}</span>
									<div
										class="card-status"
										:class="getStatusBadge(e.status).class"
									></div>
								</div>

								<div class="card-user-profile mb-4">
									<div class="member-avatar-glass primary shadow-glow-sm">
										{{ (e.fullName || "U")[0].toUpperCase() }}
									</div>
									<div class="ms-3 overflow-hidden">
										<h4 class="member-name-text text-truncate mb-0">
											{{ e.fullName || "---" }}
										</h4>
										<div
											class="member-email-text text-tertiary fs-11 text-truncate"
										>
											{{ e.email || "---" }}
										</div>
									</div>
								</div>

								<div class="course-info-glass mt-3 p-3 rounded-4">
									<div class="course-label-tag mb-1">
										Cung cấp quyền truy cập:
									</div>
									<div class="course-title-bold text-truncate">
										{{ e.courseTitle || e.course?.title || "KH" }}
									</div>
								</div>

								<div class="card-footer-actions">
									<template v-if="(e.status || '').toLowerCase() === 'pending'">
										<button
											class="grid-card-btn primary"
											@click="handleApprove(e.id)"
										>
											<Check :size="16" /> Phê duyệt ngay
										</button>
										<button
											class="grid-card-btn outline"
											@click="handleReject(e.id)"
										>
											<X :size="16" /> Từ chối
										</button>
									</template>
									<div
										v-else-if="(e.status || '').toLowerCase() === 'approved'"
										class="grid-approved-state"
									>
										<CheckCircle :size="18" /> Đã ghi danh thành công
									</div>
									<div
										v-else
										class="grid-rejected-state text-danger fw-bold fs-13 d-flex flex-column align-items-center justify-content-center gap-1"
									>
										<div class="d-flex align-items-center gap-2">
											<XCircle :size="18" /> Đã từ chối
										</div>
										<div
											v-if="e.rejectionReason"
											class="reason-tooltip-glass fs-10 text-tertiary fw-medium"
										>
											Lý do: {{ e.rejectionReason }}
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</template>

				<div v-else class="glass-empty-state py-5">
					<div class="empty-icon-container mb-4">
						<BookOpen :size="64" class="text-tertiary opacity-25" />
					</div>
					<h4 class="fw-bold text-secondary">Không tìm thấy bản ghi</h4>
					<p class="text-tertiary fs-14">
						Hiện không có yêu cầu ghi danh nào khớp với tiêu chí của bạn.
					</p>
					<button
						class="btn-glass-outline mt-4"
						@click="
							searchQuery = '';
							statusFilter = 'all';
						"
					>
						Xóa bộ lọc
					</button>
				</div>
			</div>
		</div>

		<!-- Rejection Reason Modal -->
		<teleport to="body">
			<transition name="fade">
				<div
					v-if="isRejectModalOpen"
					class="modal-glass-overlay"
					@click="isRejectModalOpen = false"
				>
					<div class="modal-glass-container alert-style" @click.stop>
						<div class="modal-glass-header border-bottom-secondary p-4">
							<div class="d-flex align-items-center justify-content-between">
								<h5
									class="m-0 fw-bold d-flex align-items-center gap-2 text-danger"
								>
									<XCircle :size="22" /> Từ chối yêu cầu ghi danh
								</h5>
								<button
									class="btn-close-transparent"
									@click="isRejectModalOpen = false"
								>
									<X :size="20" />
								</button>
							</div>
						</div>

						<div class="modal-glass-body p-4">
							<div class="rejection-warning mb-4">
								<div class="warning-icon">
									<Filter :size="20" />
								</div>
								<div class="warning-msg">
									Bạn đang thực hiện từ chối yêu cầu tham gia khóa học. Học viên
									sẽ nhận được thông báo kèm lý do bạn cung cấp dưới đây.
								</div>
							</div>

							<div class="form-row-glass mb-2">
								<label class="form-label-premium"
									>Lý do từ chối <span class="text-danger">*</span></label
								>
								<textarea
									v-model="rejectReason"
									class="glass-input-premium textarea-fixed"
									placeholder="VD: Bạn không thuộc đối tượng của khóa học này, vui lòng hoàn thành khóa cơ bản trước..."
									rows="4"
								></textarea>
							</div>
							<p class="fs-11 text-tertiary italic">
								Lưu ý: Lý do này sẽ được gửi đến email và thông báo của học
								viên.
							</p>
						</div>

						<div
							class="modal-glass-footer p-4 border-top-secondary d-flex justify-content-end gap-3"
						>
							<button
								class="btn-glass-secondary px-4"
								@click="isRejectModalOpen = false"
							>
								Hủy bỏ
							</button>
							<button
								class="btn-danger-premium px-5"
								:disabled="rejecting || !rejectReason.trim()"
								@click="confirmReject"
							>
								<span
									v-if="rejecting"
									class="spinner-border spinner-border-sm me-2"
								></span>
								Xác nhận từ chối
							</button>
						</div>
					</div>
				</div>
			</transition>
		</teleport>

		<!-- Manual Enrollment Modal -->

		<teleport to="body">
			<transition name="fade">
				<div
					v-if="isModalOpen"
					class="modal-glass-overlay"
					@click="isModalOpen = false"
				>
					<div class="modal-glass-container" @click.stop>
						<div class="modal-glass-header border-bottom-secondary p-4">
							<div class="d-flex align-items-center justify-content-between">
								<h5 class="m-0 fw-bold d-flex align-items-center gap-2">
									<UserPlus :size="22" class="text-primary" /> Ghi danh thủ công
								</h5>
								<button
									class="btn-close-transparent"
									@click="isModalOpen = false"
								>
									<X :size="20" />
								</button>
							</div>
						</div>

						<div class="modal-glass-body p-4">
							<div class="form-row-glass mb-4">
								<label class="form-label-premium">Chọn thành viên</label>
								<select v-model="form.userId" class="glass-input-premium">
									<option value="">-- Tìm kiếm thành viên --</option>
									<option v-for="u in users" :key="u.id" :value="u.id">
										{{ u.fullName }} ({{ u.userName }})
									</option>
								</select>
							</div>

							<div class="form-row-glass mb-4">
								<label class="form-label-premium">Chọn khóa học</label>
								<select v-model="form.courseId" class="glass-input-premium">
									<option value="">-- Tìm kiếm khóa học --</option>
									<option v-for="c in courses" :key="c.id" :value="c.id">
										{{ c.title }}
									</option>
								</select>
							</div>

							<div class="system-note-glass">
								<Clock :size="16" class="mt-1" />
								<span
									>Lưu ý: Thao tác này sẽ tự động bỏ qua bước phê duyệt và cho
									phép người dùng truy cập khóa học ngay lập tức.</span
								>
							</div>
						</div>

						<div
							class="modal-glass-footer p-4 border-top-secondary d-flex justify-content-end gap-3"
						>
							<button
								class="btn-glass-secondary px-4"
								@click="isModalOpen = false"
							>
								Hủy bỏ
							</button>
							<button
								class="btn-primary-premium-gradient px-5"
								:disabled="submitting"
								@click="handleManualEnroll"
							>
								<span
									v-if="submitting"
									class="spinner-border spinner-border-sm me-2"
								></span>
								Cấp quyền truy cập
							</button>
						</div>
					</div>
				</div>
			</transition>
		</teleport>
	</div>
</template>

<style scoped>
.enrollments-management-page {
	padding-bottom: 4rem;
	animation: fadeIn 0.4s ease-out;
}

.page-main-title-gradient {
	font-size: 36px;
	font-weight: 800;
	letter-spacing: -0.02em;
	background: linear-gradient(135deg, var(--text-primary), var(--primary-600));
	background-clip: text;
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	margin-bottom: 8px;
}

.header-content-box {
	display: flex;
	align-items: center;
	gap: 24px;
}

.header-icon-glass {
	width: 64px;
	height: 64px;
	background: rgba(255, 255, 255, 0.05);
	border: 1px solid var(--border-color);
	border-radius: 20px;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05);
}

.breadcrumb-glass {
	display: flex;
	align-items: center;
	gap: 8px;
	font-size: 12px;
}
.curr-page {
	color: var(--text-tertiary);
	font-weight: 500;
}

.stats-glass-grid {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 24px;
}

.glass-stat-card {
	background: var(--bg-card);
	backdrop-filter: blur(24px);
	border-radius: 24px;
	border: 1px solid var(--border-color);
	padding: 24px;
	display: flex;
	align-items: center;
	gap: 20px;
	position: relative;
	overflow: hidden;
	transition: all 0.3s;
}
.glass-stat-card:hover {
	transform: translateY(-5px);
	border-color: var(--primary-400);
	box-shadow: 0 12px 24px -10px rgba(0, 0, 0, 0.1);
}

.stat-icon-box {
	width: 56px;
	height: 56px;
	border-radius: 16px;
	display: flex;
	align-items: center;
	justify-content: center;
}
.stat-icon-box.blue {
	background: rgba(59, 130, 246, 0.1);
	color: #3b82f6;
}
.stat-icon-box.warning {
	background: rgba(245, 158, 11, 0.1);
	color: #f59e0b;
}
.stat-icon-box.success {
	background: rgba(16, 185, 129, 0.1);
	color: #10b981;
}

.stat-value {
	font-size: 28px;
	font-weight: 800;
	color: var(--text-primary);
	line-height: 1;
}
.stat-label {
	font-size: 13px;
	color: var(--text-tertiary);
	margin-top: 4px;
}

.stat-progress-line {
	position: absolute;
	bottom: 0;
	left: 0;
	height: 3px;
	opacity: 0.6;
}
.stat-progress-line.blue {
	background: #3b82f6;
}
.stat-progress-line.warning {
	background: #f59e0b;
}
.stat-progress-line.success {
	background: #10b981;
}

.glass-content-card {
	background: var(--bg-card);
	backdrop-filter: blur(24px);
	border-radius: 32px;
	border: 1px solid var(--border-color);
	overflow: hidden;
	box-shadow: 0 20px 50px -12px rgba(0, 0, 0, 0.1);
}

.glass-controls-bar {
	padding: 24px 32px;
	border-bottom: 1px solid var(--border-color);
	display: flex;
	align-items: center;
	justify-content: space-between;
	background: rgba(255, 255, 255, 0.02);
}

.filters-left {
	display: flex;
	align-items: center;
	gap: 24px;
	flex: 1;
}

.glass-search-box {
	display: flex;
	align-items: center;
	gap: 12px;
	background: rgba(255, 255, 255, 0.03);
	border: 1.5px solid var(--border-color);
	padding: 0 18px;
	border-radius: 18px;
	width: 100%;
	max-width: 400px;
	transition: all 0.2s;
}
.glass-search-box:focus-within {
	border-color: var(--primary-400);
	background: var(--bg-card);
	box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.08);
}
.glass-search-input {
	border: none;
	background: transparent;
	padding: 14px 0;
	width: 100%;
	color: var(--text-primary);
	outline: none;
	font-size: 14px;
}

.status-tabs-glass {
	display: flex;
	padding: 4px;
	background: rgba(255, 255, 255, 0.03);
	border: 1.5px solid var(--border-color);
	border-radius: 16px;
}
.status-tab-btn {
	padding: 10px 24px;
	border-radius: 12px;
	border: none;
	background: transparent;
	color: var(--text-tertiary);
	font-size: 13px;
	font-weight: 700;
	transition: all 0.2s;
}
.status-tab-btn.active {
	background: white;
	color: var(--primary-600);
	box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}

.table-container-fixed {
	padding: 8px;
}
.glass-table-premium {
	width: 100%;
	border-collapse: separate;
	border-spacing: 0;
}
.glass-table-premium th {
	padding: 20px 16px;
	color: var(--text-tertiary);
	font-size: 11px;
	font-weight: 800;
	text-transform: uppercase;
	letter-spacing: 0.12em;
	border-bottom: 2px solid var(--border-color);
}
.glass-table-premium td {
	padding: 20px 16px;
	border-bottom: 1px solid rgba(255, 255, 255, 0.05);
	vertical-align: middle;
	background: transparent;
}
.glass-table-premium tbody tr:hover td {
	background: rgba(255, 255, 255, 0.02);
}

.user-profile-cell {
	display: flex;
	align-items: center;
	gap: 14px;
}
.profile-avatar-glass {
	width: 42px;
	height: 42px;
	background: var(--gradient-primary);
	color: white;
	border-radius: 14px;
	display: flex;
	align-items: center;
	justify-content: center;
	font-weight: 800;
	font-size: 16px;
}

.glass-status-badge {
	padding: 6px 16px;
	border-radius: 100px;
	font-size: 11px;
	font-weight: 800;
	display: inline-flex;
	align-items: center;
	gap: 6px;
}
.glass-status-badge.pending {
	background: rgba(245, 158, 11, 0.1);
	color: #f59e0b;
}
.glass-status-badge.pending .dot {
	width: 6px;
	height: 6px;
	background: #f59e0b;
	border-radius: 50%;
	box-shadow: 0 0 8px #f59e0b;
}
.glass-status-badge.approved {
	background: rgba(16, 185, 129, 0.1);
	color: #10b981;
}
.glass-status-badge.approved .dot {
	width: 6px;
	height: 6px;
	background: #10b981;
	border-radius: 50%;
	box-shadow: 0 0 8px #10b981;
}

.action-btn {
	width: 38px;
	height: 38px;
	border-radius: 12px;
	border: 1px solid var(--border-color);
	background: rgba(255, 255, 255, 0.05);
	color: var(--text-secondary);
	margin-left: 8px;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	transition: all 0.2s;
}
.action-btn.approve-btn:hover {
	background: #10b981;
	color: white;
	border-color: #10b981;
	transform: scale(1.1);
}
.action-btn.reject-btn:hover {
	background: #ef4444;
	color: white;
	border-color: #ef4444;
	transform: scale(1.1);
}

.enrollment-card-glass {
	background: rgba(255, 255, 255, 0.02);
	border: 1px solid var(--border-color);
	border-radius: 24px;
	padding: 24px;
	position: relative;
	transition: all 0.3s;
}
.enrollment-card-glass:hover {
	border-color: var(--primary-400);
	transform: translateY(-6px);
}

.avatar-lg-glass {
	width: 56px;
	height: 56px;
	background: var(--bg-tertiary);
	border-radius: 18px;
	display: flex;
	align-items: center;
	justify-content: center;
	font-weight: 800;
	font-size: 22px;
	color: var(--primary-500);
	margin-bottom: 12px;
}

.grid-card-btn {
	padding: 12px;
	border-radius: 14px;
	font-weight: 700;
	font-size: 13px;
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 8px;
	transition: all 0.2s;
}
.grid-card-btn.primary {
	background: var(--primary-500);
	color: white;
	border: none;
}
.grid-card-btn.outline {
	background: transparent;
	border: 1px solid var(--border-color);
	color: var(--text-tertiary);
	margin-top: 10px;
}

.btn-premium-gradient {
	background: var(--gradient-primary);
	color: white;
	padding: 12px 28px;
	border-radius: 16px;
	font-weight: 800;
	border: none;
	box-shadow: 0 10px 20px -10px rgba(99, 102, 241, 0.5);
	transition: all 0.3s;
}
.btn-premium-gradient:hover {
	transform: translateY(-2px);
	filter: brightness(1.1);
	box-shadow: 0 15px 30px -10px rgba(99, 102, 241, 0.6);
}

.modal-glass-overlay {
	position: fixed;
	inset: 0;
	background: rgba(15, 23, 42, 0.4);
	backdrop-filter: blur(12px);
	z-index: 2000;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 24px;
}
.modal-glass-container {
	width: 100%;
	max-width: 580px;
	background: var(--bg-card);
	border: 1px solid var(--border-color);
	border-radius: 36px;
	box-shadow: 0 40px 80px -20px rgba(0, 0, 0, 0.4);
	overflow: hidden;
}

.glass-input-premium {
	width: 100%;
	padding: 14px 20px;
	background: rgba(255, 255, 255, 0.03);
	border: 1.5px solid var(--border-color);
	border-radius: 16px;
	color: var(--text-primary);
	outline: none;
	appearance: none;
	background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
	background-repeat: no-repeat;
	background-position: right 16px center;
	background-size: 18px;
}

.system-note-glass {
	background: rgba(59, 130, 246, 0.08);
	color: #3b82f6;
	padding: 16px 20px;
	border-radius: 16px;
	font-size: 13px;
	display: flex;
	gap: 12px;
	line-height: 1.5;
}

:is([data-theme="dark"], [data-bs-theme="dark"]) .status-tab-btn.active {
	background: rgba(255, 255, 255, 0.1);
	color: white;
}
:is([data-theme="dark"], [data-bs-theme="dark"]) .glass-input-premium {
	background-color: rgba(0, 0, 0, 0.2);
}

.textarea-fixed {
	resize: none;
	min-height: 120px;
}

.rejection-warning {
	display: flex;
	gap: 16px;
	padding: 16px;
	background: rgba(239, 68, 68, 0.08);
	border-radius: 16px;
	color: #ef4444;
	line-height: 1.5;
	font-size: 13px;
}

.btn-danger-premium {
	background: linear-gradient(135deg, #ef4444, #b91c1c);
	color: white;
	border: none;
	padding: 12px 28px;
	border-radius: 16px;
	font-weight: 700;
	box-shadow: 0 10px 20px -10px rgba(239, 68, 68, 0.5);
	transition: all 0.3s;
}
.btn-danger-premium:hover:not(:disabled) {
	transform: translateY(-2px);
	filter: brightness(1.1);
	box-shadow: 0 15px 30px -10px rgba(239, 68, 68, 0.6);
}
.btn-danger-premium:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}

.modal-glass-container.alert-style {
	border-color: rgba(239, 68, 68, 0.3);
}

.rejection-reason-text {
	max-width: 150px;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}
.rejection-reason-text:hover {
	white-space: normal;
	overflow: visible;
}
</style>
