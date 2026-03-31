<template>
	<div class="certificates-list-page">
		<div class="page-header mb-5">
			<div class="header-content">
				<div class="header-icon-box pulse-glow">
					<Award
						:size="32"
						style="width: 32px; height: 32px"
						class="animated-icon"
					/>
				</div>
				<div>
					<div class="d-flex align-items-center gap-2 mb-1">
						<span class="badge-glass info fs-10 fw-bold">CHỨNG CHỈ</span>
						<span class="fs-12 text-tertiary d-flex align-items-center"
							><ChevronRight :size="12" class="mx-1" /> Danh sách cấp phát</span
						>
					</div>
					<h1 class="page-title-gradient">Quản lý Chứng chỉ đã cấp</h1>
					<p class="page-desc">
						Theo dõi, xác thực và quản lý tình trạng chứng chỉ hoàn thành khóa
						học của học viên.
					</p>
				</div>
			</div>

			<div class="header-actions">
				<ol class="breadcrumb-glass mb-0">
					<li class="breadcrumb-item">
						<a href="#" class="text-tertiary">Admin</a>
					</li>
					<li class="breadcrumb-item active text-primary fw-bold">Chứng chỉ</li>
				</ol>
			</div>
		</div>

		<div class="row g-4 mb-5">
			<div class="col-xl-4 col-md-6">
				<div class="glass-stat-card bg-primary-gradient">
					<div class="stat-icon-wrapper"><FileText :size="24" /></div>
					<div class="stat-info">
						<span class="stat-label">TỔNG CẤP PHÁT</span>
						<h3 class="stat-value">{{ totalIssued }}</h3>
					</div>
					<div class="stat-decoration"></div>
				</div>
			</div>
			<div class="col-xl-4 col-md-6">
				<div class="glass-stat-card bg-success-gradient">
					<div class="stat-icon-wrapper"><CheckCircle2 :size="24" /></div>
					<div class="stat-info">
						<span class="stat-label">HỢP LỆ (VALID)</span>
						<h3 class="stat-value">{{ totalValid }}</h3>
					</div>
					<div class="stat-decoration"></div>
				</div>
			</div>
			<div class="col-xl-4 col-md-12">
				<div class="glass-stat-card bg-danger-gradient">
					<div class="stat-icon-wrapper"><Ban :size="24" /></div>
					<div class="stat-info">
						<span class="stat-label">THU HỒI (REVOKED)</span>
						<h3 class="stat-value">{{ totalRevoked }}</h3>
					</div>
					<div class="stat-decoration"></div>
				</div>
			</div>
		</div>

		<div class="glass-content-card">
			<div
				class="glass-card-header-premium p-4 border-bottom-glass d-flex align-items-center justify-content-between flex-wrap gap-4"
			>
				<h5 class="fw-bold mb-0 d-flex align-items-center gap-2">
					<ShieldCheck :size="20" class="text-primary" /> Danh sách Chứng chỉ
				</h5>

				<div class="d-flex align-items-center gap-3 flex-wrap">
					<div class="tabs-glass-nav">
						<button
							class="tab-glass-btn"
							:class="{ active: statusFilter === 'All' }"
							@click="
								statusFilter = 'All';
								currentPage = 1;
							"
						>
							Tất cả
						</button>
						<button
							class="tab-glass-btn"
							:class="{ active: statusFilter === 'Valid' }"
							@click="
								statusFilter = 'Valid';
								currentPage = 1;
							"
						>
							Hợp lệ
						</button>
						<button
							class="tab-glass-btn"
							:class="{ active: statusFilter === 'Revoked' }"
							@click="
								statusFilter = 'Revoked';
								currentPage = 1;
							"
						>
							Thu hồi
						</button>
					</div>

					<div class="glass-search">
						<Search :size="18" class="text-tertiary" />
						<input
							type="text"
							v-model="searchQuery"
							placeholder="Tìm học viên, khóa học..."
							class="search-input-premium"
							@input="currentPage = 1"
						/>
					</div>
				</div>
			</div>

			<div class="glass-card-body p-0">
				<div v-if="loading" class="text-center py-5">
					<div class="premium-spinner mx-auto"></div>
					<p class="mt-3 text-muted fw-bold">Đang truy xuất dữ liệu...</p>
				</div>

				<div
					v-else-if="paginatedCerts.length === 0"
					class="empty-state-glass py-5"
				>
					<div class="empty-icon-box mb-4">
						<Award :size="64" class="opacity-20 animate-pulse" />
					</div>
					<h5 class="fw-bold text-primary">Chưa có chứng chỉ nào</h5>

					<p class="text-tertiary fs-14 mb-0">
						Hệ thống chưa ghi nhận dữ liệu khớp điều kiện.
					</p>
				</div>

				<div v-else class="table-responsive">
					<table class="glass-table-ui">
						<thead>
							<tr>
								<th class="ps-4">Học viên & Mã định danh</th>
								<th>Khóa Học</th>
								<th @click="toggleSort('score')" class="cursor-pointer">
									Điểm thi
								</th>
								<th @click="toggleSort('issueDate')" class="cursor-pointer">
									Ngày cấp
								</th>
								<th>Trạng thái</th>
								<th class="text-center pe-4">Thao tác</th>
							</tr>
						</thead>
						<tbody>
							<tr
								v-for="cert in paginatedCerts"
								:key="cert.id"
								:class="{ 'revoked-row': cert.status === 'Revoked' }"
							>
								<td class="ps-4">
									<div class="d-flex align-items-center gap-3">
										<div
											class="avatar-glass-sm bg-primary-100 text-primary fw-bold"
										>
											{{ cert.studentName?.charAt(0) }}
										</div>
										<div>
											<div
												class="fw-bold fs-14"
												style="color: var(--text-primary)"
											>
												{{ cert.studentName }}
											</div>

											<div class="fs-12 text-tertiary">
												<IdCard :size="12" /> {{ cert.certificateCode }}
											</div>
										</div>
									</div>
								</td>
								<td>
									<span class="fw-semi-bold text-primary fs-13">{{
										cert.courseName
									}}</span>
								</td>
								<td>
									<div class="score-badge-glass">{{ cert.score ?? 100 }}%</div>
								</td>
								<td>
									<div class="fs-13 text-secondary">
										{{ formatDate(cert.issueDate) }}
									</div>
								</td>

								<td>
									<span
										v-if="cert.status === 'Valid' || cert.status === 'Issued'"
										class="badge-status-premium success"
									>
										<CheckCircle2 :size="12" /> Hợp lệ
									</span>
									<span
										v-else-if="cert.status === 'Revoked'"
										class="badge-status-premium danger"
									>
										<Ban :size="12" /> Thu hồi
									</span>
									<span v-else class="badge-status-premium warning">{{
										cert.status
									}}</span>
								</td>

								<td class="pe-4">
									<div class="d-flex justify-content-center gap-1">
										<button
											class="btn-ghost-icon primary"
											@click="downloadPDF(cert.certificateCode)"
											:disabled="cert.status === 'Revoked'"
										>
											<Download :size="16" />
										</button>
										<button
											class="btn-ghost-icon info"
											@click="copyVerifyUrl(cert.certificateCode)"
										>
											<ExternalLink :size="16" />
										</button>
										<button
											v-if="cert.status !== 'Revoked'"
											class="btn-ghost-icon danger"
											@click="prepareRevoke(cert)"
										>
											<Ban :size="16" />
										</button>
									</div>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>

			<div
				class="glass-card-footer-premium p-4 border-top-glass d-flex justify-content-between align-items-center"
			>
				<div class="fs-13 text-tertiary">
					Hiển thị <strong>{{ filteredAndSortedCerts.length }}</strong> bản ghi
				</div>
				<div class="glass-pagination d-flex gap-1">
					<button
						class="pag-btn"
						:disabled="currentPage === 1"
						@click="currentPage--"
					>
						<ChevronLeft :size="16" />
					</button>
					<button class="pag-btn active">{{ currentPage }}</button>
					<button
						class="pag-btn"
						:disabled="currentPage === totalPages"
						@click="currentPage++"
					>
						<ChevronRight :size="16" />
					</button>
				</div>
			</div>
		</div>

		<teleport to="body">
			<div
				v-if="showRevokeModal"
				class="glass-modal-overlay"
				@click.self="showRevokeModal = false"
			>
				<div class="glass-modal-container slide-up">
					<div class="glass-modal-header danger p-4">
						<h5 class="fw-bold mb-0">Xác nhận thu hồi</h5>
						<button class="btn-close-glass" @click="showRevokeModal = false">
							<XCircle :size="20" />
						</button>
					</div>
					<div class="glass-modal-body p-4">
						<textarea
							v-model="revokeReasonInput"
							class="input-glass-ui"
							rows="4"
							placeholder="Lý do thu hồi..."
						></textarea>
					</div>
					<div class="glass-modal-footer p-4 d-flex justify-content-end gap-3">
						<button
							class="btn-glass-secondary"
							@click="showRevokeModal = false"
						>
							Hủy
						</button>
						<button
							class="btn-submit danger"
							@click="confirmRevoke"
							:disabled="isRevoking"
						>
							Xác nhận
						</button>
					</div>
				</div>
			</div>
		</teleport>
	</div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import { certificateAPI } from "@/services/api";
import {
	Award,
	ShieldCheck,
	Ban,
	Search,
	Download,
	ExternalLink,
	ChevronRight,
	ChevronLeft,
	IdCard,
	CheckCircle2,
	XCircle,
	FileText,
} from "lucide-vue-next";
import { toast } from "vue3-toastify";

const certificates = ref<any[]>([]);
const loading = ref(true);
const searchQuery = ref("");
const statusFilter = ref("All");
const currentPage = ref(1);
const itemsPerPage = ref(10);
const sortBy = ref("issueDate");
const sortDesc = ref(true);
const showRevokeModal = ref(false);
const targetCert = ref<any>(null);
const revokeReasonInput = ref("");
const isRevoking = ref(false);

onMounted(async () => {
	await fetchCertificates();
});

const fetchCertificates = async () => {
	loading.value = true;
	try {
		const res = await certificateAPI.getAdmin({ page: 1, pageSize: 1000 });
		certificates.value = res.data.items || [];
	} catch {
		toast.error("Lỗi tải dữ liệu");
	} finally {
		loading.value = false;
	}
};

const totalIssued = computed(() => certificates.value.length);
const totalValid = computed(
	() =>
		certificates.value.filter(
			(c) => c.status === "Valid" || c.status === "Issued",
		).length,
);
const totalRevoked = computed(
	() => certificates.value.filter((c) => c.status === "Revoked").length,
);

const filteredAndSortedCerts = computed(() => {
	let res = [...certificates.value];
	if (searchQuery.value) {
		const q = searchQuery.value.toLowerCase();
		res = res.filter(
			(c) =>
				c.studentName?.toLowerCase().includes(q) ||
				c.certificateCode?.toLowerCase().includes(q),
		);
	}
	if (statusFilter.value === "Valid")
		res = res.filter((c) => c.status === "Valid" || c.status === "Issued");
	if (statusFilter.value === "Revoked")
		res = res.filter((c) => c.status === "Revoked");
	return res;
});

const totalPages = computed(
	() =>
		Math.ceil(filteredAndSortedCerts.value.length / itemsPerPage.value) || 1,
);
const paginatedCerts = computed(() => {
	const start = (currentPage.value - 1) * itemsPerPage.value;
	return filteredAndSortedCerts.value.slice(start, start + itemsPerPage.value);
});

const toggleSort = (f: string) => {
	sortBy.value = f;
	sortDesc.value = !sortDesc.value;
};
const formatDate = (d: string) =>
	d ? new Date(d).toLocaleDateString("vi-VN") : "";
const copyVerifyUrl = (code: string) => {
	navigator.clipboard.writeText(`${window.location.origin}/verify/${code}`);
	toast.success("Đã sao chép link!");
};

const downloadPDF = (code: string) => {
	const c = certificates.value.find((x) => x.certificateCode === code);
	if (c && c.pdfUrl) {
		window.open(c.pdfUrl, "_blank");
	} else {
		toast.info("Đang khởi tạo bản in hoặc chưa có tệp đính kèm.");
	}
};

const prepareRevoke = (cert: any) => {
	targetCert.value = cert;
	showRevokeModal.value = true;
};
const confirmRevoke = async () => {
	isRevoking.value = true;
	try {
		await certificateAPI.revoke(targetCert.value.id, revokeReasonInput.value);
		await fetchCertificates();
		showRevokeModal.value = false;
		toast.success("Đã thu hồi");
	} catch {
		toast.error("Lỗi thu hồi");
	} finally {
		isRevoking.value = false;
	}
};
</script>

<style scoped>
.certificates-list-page {
	padding-bottom: var(--space-2xl);
	animation: fadeIn 0.4s ease-out;
}
.page-title-gradient {
	font-size: 32px;
	font-weight: 800;
	letter-spacing: -0.02em;
	background: linear-gradient(
		90deg,
		var(--text-primary),
		var(--text-secondary)
	);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	margin: 0 0 4px 0;
}
.page-desc {
	color: var(--text-secondary);
	font-size: 15px;
	max-width: 600px;
	margin-bottom: 0;
}

@keyframes fadeIn {
	from {
		opacity: 0;
		transform: translateY(10px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
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
@keyframes spin {
	100% {
		transform: rotate(360deg);
	}
}
@keyframes pulse-border {
	0% {
		box-shadow: 0 0 0 0 rgba(14, 165, 233, 0.2);
	}
	50% {
		box-shadow: 0 0 0 15px rgba(14, 165, 233, 0);
	}
	100% {
		box-shadow: 0 0 0 0 rgba(14, 165, 233, 0);
	}
}

.page-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	flex-wrap: wrap;
	gap: 20px;
}
.header-content {
	display: flex;
	align-items: center;
	gap: 24px;
}
.header-icon-box {
	width: 64px;
	height: 64px;
	border-radius: 20px;
	background: linear-gradient(
		135deg,
		rgba(14, 165, 233, 0.15),
		rgba(14, 165, 233, 0.05)
	);
	color: var(--info-500);
	display: flex;
	align-items: center;
	justify-content: center;
	border: 1px solid rgba(14, 165, 233, 0.2);
	box-shadow: 0 8px 20px rgba(14, 165, 233, 0.15);
	flex-shrink: 0;
}
.pulse-glow {
	animation: pulse-border 3s ease-in-out infinite;
}
.breadcrumb-glass {
	display: flex;
	align-items: center;
	list-style: none;
	background: var(--bg-secondary);
	padding: 8px 20px;
	border-radius: 14px;
	border: 1px solid var(--border-color);

	gap: 0;
}
.breadcrumb-item {
	display: flex;
	align-items: center;
	font-size: 13px;
}
.breadcrumb-item + .breadcrumb-item::before {
	content: "/";
	padding: 0 10px;
	color: var(--text-tertiary);
	opacity: 0.5;
}
.breadcrumb-item a {
	text-decoration: none;
	transition: color 0.2s;
}
.breadcrumb-item a:hover {
	color: var(--primary-600) !important;
}

.glass-stat-card {
	position: relative;
	padding: 28px;
	border-radius: 28px;
	color: white;
	overflow: hidden;
	height: 100%;
	transition: all 0.3s;
	box-shadow: 0 8px 25px -5px rgba(0, 0, 0, 0.1);
	border: 1px solid rgba(255, 255, 255, 0.15);
}
.glass-stat-card:hover {
	transform: translateY(-5px);
	box-shadow: 0 15px 35px -10px rgba(0, 0, 0, 0.2);
}
.stat-icon-wrapper {
	width: 48px;
	height: 48px;
	background: rgba(255, 255, 255, 0.2);
	backdrop-filter: blur(10px);
	color: white;
	border-radius: 14px;
	display: flex;
	align-items: center;
	justify-content: center;
	border: 1px solid rgba(255, 255, 255, 0.25);
	margin-bottom: 20px;
}
.stat-label {
	font-size: 11px;
	font-weight: 800;
	opacity: 0.85;
	letter-spacing: 0.1em;
	display: block;
	margin-bottom: 4px;
}
.stat-value {
	font-size: 28px;
	font-weight: 800;
	margin-bottom: 0;
	letter-spacing: -0.02em;
}
.stat-decoration {
	position: absolute;
	right: -20px;
	bottom: -20px;
	width: 120px;
	height: 120px;
	border-radius: 50%;
	background: rgba(255, 255, 255, 0.1);
	filter: blur(30px);
	pointer-events: none;
}

.bg-primary-gradient {
	background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
}
.bg-success-gradient {
	background: linear-gradient(135deg, #059669 0%, #10b981 100%);
}
.bg-danger-gradient {
	background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
}

.glass-content-card {
	background: var(--bg-card);
	backdrop-filter: blur(20px);
	border: 1px solid var(--border-color);
	border-radius: 28px;
	box-shadow: var(--shadow-sm);
	overflow: hidden;
}

.border-bottom-glass {
	border-bottom: 1px solid var(--border-color);
}

.border-top-glass {
	border-top: 1px solid var(--border-color);
}


.tabs-glass-nav {
	display: flex;
	gap: 6px;
	background: var(--bg-secondary);
	padding: 6px;
	border-radius: 16px;

	height: 48px;
	align-items: center;
}
.tab-glass-btn {
	border: none;
	background: transparent;
	padding: 0 20px;
	height: 36px;
	font-size: 13px;
	font-weight: 700;
	color: var(--text-tertiary);
	border-radius: 11px;
	transition: all 0.2s;
	display: flex;
	align-items: center;
	justify-content: center;
	white-space: nowrap;
}
.tab-glass-btn.active {
	background: var(--bg-card);
	color: var(--primary-600);
	box-shadow: var(--shadow-sm);
}


.glass-search {
	display: flex;
	align-items: center;
	background: var(--bg-card);
	border: 1px solid var(--border-color);
	border-radius: 16px;
	padding: 0 18px;

	width: 300px;
	height: 48px;
	transition: all 0.3s;
}
.glass-search:focus-within {
	border-color: var(--primary-300);
	box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}
.search-input-premium {
	flex: 1;
	border: none;
	background: transparent;
	padding: 0;
	height: 100%;
	font-size: 14px;
	outline: none;
	margin-left: 10px;
}

.glass-table-ui {
	width: 100%;
	border-collapse: separate;
	border-spacing: 0;
}
.glass-table-ui th {
	background: var(--bg-secondary);

	padding: 16px;
	font-size: 11px;
	font-weight: 800;
	color: var(--text-tertiary);
	text-transform: uppercase;
	border-bottom: 2px solid var(--border-color);
}

.glass-table-ui td {
	padding: 18px 16px;
	border-bottom: 1px solid var(--border-color);
	vertical-align: middle;
}

.glass-table-ui tbody tr {
	transition: all 0.2s;
}
.glass-table-ui tbody tr:hover td {
	background: var(--bg-tertiary);
}

.revoked-row td {
	opacity: 0.6;
}

.avatar-glass-sm {
	width: 36px;
	height: 36px;
	border-radius: 10px;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 14px;
}
.bg-primary-100 {
	background: rgba(99, 102, 241, 0.1);
}

.score-badge-glass {
	display: inline-flex;
	height: 32px;
	padding: 0 12px;
	border-radius: 8px;
	background: rgba(var(--score-color, 0, 0, 0), 0.08);
	color: var(--score-color);
	font-weight: 800;
	font-size: 13px;
	align-items: center;
	border: 1px solid rgba(var(--score-color, 0, 0, 0), 0.15);
}

.badge-status-premium {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	padding: 6px 14px;
	border-radius: 20px;
	font-size: 11px;
	font-weight: 700;
}
.badge-status-premium.success {
	background: rgba(16, 185, 129, 0.08);
	color: var(--success-600);
	border: 1px solid rgba(16, 185, 129, 0.1);
}
.badge-status-premium.danger {
	background: rgba(239, 68, 68, 0.08);
	color: var(--danger-600);
	border: 1px solid rgba(239, 68, 68, 0.1);
}

.btn-ghost-icon {
	width: 36px;
	height: 36px;
	border-radius: 10px;
	display: flex;
	align-items: center;
	justify-content: center;
	border: none;
	background: transparent;
	color: var(--text-tertiary);
	transition: all 0.2s;
}
.btn-ghost-icon:hover:not(:disabled) {
	background: rgba(0, 0, 0, 0.04);
	transform: scale(1.1);
}
.btn-ghost-icon.primary:hover {
	color: var(--primary-600);
}
.btn-ghost-icon.info:hover {
	color: var(--info-600);
}
.btn-ghost-icon.danger:hover {
	color: var(--danger-600);
}
.btn-ghost-icon:disabled {
	opacity: 0.3;
	cursor: not-allowed;
}

.pag-btn {
	width: 36px;
	height: 36px;
	border-radius: 10px;
	border: 1px solid rgba(0, 0, 0, 0.05);
	background: white;
	color: var(--text-secondary);
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.2s;
	font-weight: 600;
}
.pag-btn:hover:not(:disabled) {
	background: var(--primary-50);
	color: var(--primary-600);
	border-color: var(--primary-200);
}
.pag-btn.active {
	background: var(--primary-500);
	color: white;
	border-color: var(--primary-500);
	box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}
.pag-btn:disabled {
	opacity: 0.4;
	cursor: not-allowed;
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
.glass-modal-container {
	background: white;
	border-radius: 28px;
	width: 100%;
	max-width: 500px;
	overflow: hidden;
	box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
	border: 1px solid rgba(0, 0, 0, 0.05);
}
.slide-up {
	animation: slide-up 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.modal-icon-box {
	width: 48px;
	height: 48px;
	border-radius: 14px;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}
.bg-danger-soft {
	background: rgba(239, 68, 68, 0.08);
}
.btn-close-glass {
	width: 36px;
	height: 36px;
	border-radius: 50%;
	border: none;
	background: rgba(0, 0, 0, 0.05);
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.2s;
}
.btn-close-glass:hover {
	background: rgba(239, 68, 68, 0.1);
	color: var(--danger-600);
	transform: rotate(90deg);
}

.alert-glass.warning {
	background: rgba(245, 158, 11, 0.05);
	border: 1px solid rgba(245, 158, 11, 0.1);
	padding: 16px;
	border-radius: 16px;
}
.text-warning-700 {
	color: #b45309;
}

.label-premium {
	font-size: 11px;
	font-weight: 800;
	color: var(--text-tertiary);
	text-transform: uppercase;
	letter-spacing: 0.1em;
}
.input-glass-wrap {
	position: relative;
}
.input-glass-ui {
	width: 100%;
	padding: 12px 18px;
	border: 1px solid rgba(0, 0, 0, 0.08);
	border-radius: 16px;
	background: rgba(249, 250, 251, 0.5);
	outline: none;
	transition: all 0.3s;
}
.input-glass-ui:focus {
	background: white;
	border-color: var(--primary-300);
}
.input-focus-glow {
	position: absolute;
	inset: -3px;
	border-radius: 19px;
	border: 2px solid var(--primary-400);
	opacity: 0;
	transform: scale(0.98);
	transition: all 0.3s;
	pointer-events: none;
}
.input-glass-ui:focus + .input-focus-glow {
	opacity: 1;
	transform: scale(1);
	box-shadow: 0 0 0 6px rgba(99, 102, 241, 0.08);
}

.btn-glass-secondary {
	height: 48px;
	padding: 0 24px;
	border: 1px solid rgba(0, 0, 0, 0.1);
	background: white;
	border-radius: 18px;
	font-weight: 700;
	font-size: 14px;
	transition: all 0.2s;
}
.btn-glass-secondary:hover:not(:disabled) {
	background: rgba(0, 0, 0, 0.02);
}

.btn-submit {
	height: 48px;
	padding: 0 28px;
	border: none;
	border-radius: 18px;
	font-weight: 800;
	font-size: 14px;
	color: white;
	transition: all 0.3s;
	display: flex;
	align-items: center;
	justify-content: center;
}
.btn-submit.danger {
	background: linear-gradient(
		135deg,
		var(--danger-700) 0%,
		var(--danger-500) 100%
	);
	box-shadow: 0 8px 20px rgba(239, 68, 68, 0.25);
}
.btn-submit:hover:not(:disabled) {
	transform: translateY(-3px);
	box-shadow: 0 12px 30px rgba(239, 68, 68, 0.35);
}
.btn-submit:disabled {
	opacity: 0.6;
	cursor: not-allowed;
}

.premium-spinner {
	width: 40px;
	height: 40px;
	border: 4px solid rgba(79, 70, 229, 0.2);
	border-top-color: #4f46e5;
	border-radius: 50%;
	animation: spin 1s linear infinite;
}

.empty-state-glass {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	text-align: center;
	min-height: 300px;
}
.empty-icon-box {
	background: rgba(0, 0, 0, 0.02);
	width: 100px;
	height: 100px;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
}
.animate-pulse {
	animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
@keyframes pulse {
	0%,
	100% {
		opacity: 0.2;
	}
	50% {
		opacity: 0.1;
	}
}

@media (max-width: 1200px) {
	.page-header {
		justify-content: center;
		text-align: center;
	}
	.header-content {
		flex-direction: column;
		align-items: center;
	}
}
@media (max-width: 991px) {
	.glass-search {
		width: 100%;
		order: 1;
	}
	.tabs-glass-nav {
		order: 2;
		width: 100%;
	}
}
</style>
