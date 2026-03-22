<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import { reportAPI } from "@/services/api";
import {
	Users,
	AlertTriangle,
	Clock,
	Download,
	Bell,
	Mail,
	ChevronLeft,
	ChevronRight,
	Search,
	Calendar,
	CheckCircle,
} from "lucide-vue-next";
import { toast } from "vue3-toastify";

interface Slacker {
	userId: number;
	userName: string;
	email: string;
	courseId: number;
	courseTitle: string;
	enrolledAt: string;
	daysSinceEnroll: number;
}

const reportData = ref<Slacker[]>([]);
const loading = ref(true);
const searchQuery = ref("");
const currentPage = ref(1);
const itemsPerPage = ref(10);
const selectedUsers = ref<number[]>([]);

const fetchInactiveUsers = async () => {
	loading.value = true;
	try {
		const res = await reportAPI.getInactive();
		reportData.value = res.data;
	} catch {
		toast.error("Không thể tải báo cáo tiến độ");
	} finally {
		loading.value = false;
	}
};

onMounted(fetchInactiveUsers);

const totalInactive = computed(() => reportData.value.length);
const criticalRisk = computed(
	() => reportData.value.filter((u) => u.daysSinceEnroll > 30).length,
);
const moderateRisk = computed(
	() =>
		reportData.value.filter(
			(u) => u.daysSinceEnroll >= 15 && u.daysSinceEnroll <= 30,
		).length,
);

const filteredData = computed(() => {
	return reportData.value.filter(
		(u) =>
			u.userName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
			u.email.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
			u.courseTitle.toLowerCase().includes(searchQuery.value.toLowerCase()),
	);
});

const totalPages = computed(
	() => Math.ceil(filteredData.value.length / itemsPerPage.value) || 1,
);

const paginatedData = computed(() => {
	const start = (currentPage.value - 1) * itemsPerPage.value;
	return filteredData.value.slice(start, start + itemsPerPage.value);
});

const toggleSelectAll = (e: Event) => {
	const checked = (e.target as HTMLInputElement).checked;
	selectedUsers.value = checked ? paginatedData.value.map((u) => u.userId) : [];
};

const sendReminder = (user: Slacker) => {
	toast.success(`Đã gửi nhắc nhở tới ${user.userName}`);
};

const sendBulkReminder = () => {
	const count = criticalRisk.value;
	if (count === 0) {
		toast.info("Không có nhân viên rủi ro cao để nhắc nhở.");
		return;
	}
	toast.success(`Đã gửi rải rác nhắc nhở tới ${count} nhân viên nhóm Rủi ro!`);
};

const exportToCSV = () => {
	if (reportData.value.length === 0) {
		toast.error("Không có dữ liệu để xuất!");
		return;
	}

	const headers = [
		"Mã NV",
		"Tên Nhân Viên",
		"Email",
		"Khóa Học Tập",
		"Ngày Ghi Danh",
		"Số Ngày Bỏ Bê",
	];
	const rows = reportData.value.map((user) => [
		user.userId,
		`"${user.userName}"`,
		`"${user.email}"`,
		`"${user.courseTitle}"`,
		new Date(user.enrolledAt).toLocaleDateString("vi-VN"),
		user.daysSinceEnroll,
	]);

	const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join(
		"\n",
	);
	const blob = new Blob(["\ufeff" + csvContent], {
		type: "text/csv;charset=utf-8;",
	});
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.setAttribute("href", url);
	link.setAttribute(
		"download",
		`BaoCao_TienDoHocTap_${new Date().toISOString().split("T")[0]}.csv`,
	);
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
};
</script>

<template>
	<div class="container-fluid py-4">
		<div class="row pb-4 mb-4 align-items-center border-bottom">
			<div class="col-sm-8">
				<h4 class="mb-1 fw-bold text-dark d-flex align-items-center gap-2">
					Báo cáo Tiến độ & Nhắc nhở
				</h4>
				<p class="mb-0 fs-14 text-muted">
					Theo dõi và đôn đốc các nhân viên đang có dấu hiệu bỏ bê đào tạo
					(Inactive Learners).
				</p>
			</div>
		</div>

		<div class="row g-4 mb-4">
			<div class="col-xl-4 col-md-6">
				<div
					class="card border-0 shadow-sm rounded-4 h-100 bg-white hover-translate-y transition-all overflow-hidden relative-card"
				>
					<div class="card-body p-4 d-flex flex-column position-relative z-1">
						<div class="d-flex align-items-center gap-3 mb-3">
							<div
								class="bg-secondary bg-opacity-10 text-secondary p-3 rounded-4 shadow-sm"
							>
								<Users
									:size="24"
									style="width: 24px; height: 24px; min-width: 24px"
								/>
							</div>
							<h6
								class="mb-0 text-uppercase fw-bold text-muted fs-13 tracking-wide"
							>
								Tổng tham gia & chưa xong
							</h6>
						</div>
						<div class="mt-auto d-flex align-items-baseline gap-2">
							<h2 class="mb-0 fw-black text-dark display-6">
								{{ totalInactive }}
							</h2>
							<span class="fs-14 fw-bold text-muted">Nhân viên</span>
						</div>
					</div>
					<div class="card-border-left bg-secondary"></div>
				</div>
			</div>

			<div class="col-xl-4 col-md-6">
				<div
					class="card border-0 shadow-sm rounded-4 h-100 bg-white hover-translate-y transition-all overflow-hidden relative-card"
				>
					<div class="card-body p-4 d-flex flex-column position-relative z-1">
						<div class="d-flex align-items-center gap-3 mb-3">
							<div
								class="bg-warning bg-opacity-10 text-warning p-3 rounded-4 shadow-sm"
							>
								<Clock
									:size="24"
									style="width: 24px; height: 24px; min-width: 24px"
								/>
							</div>
							<h6
								class="mb-0 text-uppercase fw-bold text-muted fs-13 tracking-wide"
							>
								Cảnh báo vừa (15-30 ngày)
							</h6>
						</div>
						<div class="mt-auto d-flex align-items-baseline gap-2">
							<h2 class="mb-0 fw-black text-warning display-6">
								{{ moderateRisk }}
							</h2>
							<span class="fs-14 fw-bold text-muted">Nhân viên</span>
						</div>
					</div>
					<div class="card-border-left bg-warning"></div>
				</div>
			</div>

			<div class="col-xl-4 col-md-12">
				<div
					class="card border-0 shadow-sm rounded-4 h-100 bg-white hover-translate-y transition-all overflow-hidden relative-card"
				>
					<div class="card-body p-4 d-flex flex-column position-relative z-1">
						<div class="d-flex align-items-center gap-3 mb-3">
							<div
								class="bg-danger bg-opacity-10 text-danger p-3 rounded-4 shadow-sm"
							>
								<AlertTriangle
									:size="24"
									style="width: 24px; height: 24px; min-width: 24px"
								/>
							</div>
							<h6
								class="mb-0 text-uppercase fw-bold text-muted fs-13 tracking-wide"
							>
								Rủi ro bỏ lớp (> 30 ngày)
							</h6>
						</div>
						<div class="mt-auto d-flex align-items-baseline gap-2">
							<h2 class="mb-0 fw-black text-danger display-6">
								{{ criticalRisk }}
							</h2>
							<span class="fs-14 fw-bold text-muted">Nhân viên</span>
						</div>
					</div>
					<div class="card-border-left bg-danger"></div>
				</div>
			</div>
		</div>

		<div class="card border-0 shadow-sm rounded-4 bg-white">
			<div
				class="card-header bg-transparent border-bottom px-4 py-4 d-flex flex-wrap justify-content-between align-items-center gap-3"
			>
				<h5 class="fw-bold mb-0 text-dark">Danh sách Học viên Chậm trễ</h5>

				<div class="d-flex flex-wrap align-items-center gap-3">
					<div class="search-box position-relative">
						<Search
							:size="18"
							class="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"
							style="width: 18px; height: 18px; min-width: 18px"
						/>
						<input
							v-model="searchQuery"
							type="text"
							class="form-control bg-light border-0 rounded-pill ps-5 pe-4 py-2"
							placeholder="Tìm kiếm học viên/khóa học..."
						/>
					</div>

					<div class="d-flex gap-2">
						<button
							class="btn btn-light fw-bold rounded-pill px-4 d-inline-flex align-items-center gap-2 export-btn border"
							@click="exportToCSV"
						>
							<Download
								:size="16"
								style="width: 16px; height: 16px; min-width: 16px"
							/>
							Xuất Báo Cáo
						</button>
						<button
							class="btn btn-danger fw-bold rounded-pill px-4 d-inline-flex align-items-center gap-2 btn-hover shadow-sm"
							@click="sendBulkReminder"
						>
							<Bell
								:size="16"
								style="width: 16px; height: 16px; min-width: 16px"
							/>
							Báo động Đỏ
						</button>
					</div>
				</div>
			</div>

			<div class="card-body p-0">
				<div v-if="loading" class="text-center py-5">
					<div class="spinner-border text-primary" role="status"></div>
					<p class="mt-3 text-muted fw-medium fs-14">
						Đang phân tích dữ liệu...
					</p>
				</div>

				<div v-else class="table-responsive">
					<table class="table table-hover align-middle mb-0 native-grid">
						<thead class="bg-light">
							<tr>
								<th class="ps-4" style="width: 40px">
									<input
										type="checkbox"
										class="form-check-input custom-check"
										@change="toggleSelectAll"
									/>
								</th>
								<th>Thông tin Nhân viên</th>
								<th>Khóa học đang học</th>
								<th>Ngày ghi danh</th>
								<th class="text-center">Số ngày bỏ bê</th>
								<th class="text-end pe-4">Hành động</th>
							</tr>
						</thead>
						<tbody>
							<tr v-if="paginatedData.length === 0">
								<td colspan="6" class="text-center py-5 text-muted">
									<CheckCircle
										:size="48"
										class="mb-3 opacity-25"
										style="width: 48px; height: 48px; min-width: 48px"
									/>
									<h6 class="fw-bold text-dark">Lớp học rất chăm chỉ!</h6>
									<p class="mb-0 fs-14">
										Không tìm thấy nhân viên nào phù hợp với tìm kiếm.
									</p>
								</td>
							</tr>
							<tr
								v-for="user in paginatedData"
								:key="user.userId"
								class="transition-all hover-bg"
							>
								<td class="ps-4">
									<input
										type="checkbox"
										class="form-check-input custom-check"
										:value="user.userId"
										v-model="selectedUsers"
									/>
								</td>
								<td>
									<div class="d-flex align-items-center gap-3 py-2">
										<div
											class="avatar-sm bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold"
										>
											{{ user.userName.charAt(0).toUpperCase() }}
										</div>
										<div>
											<h6 class="mb-1 fw-bold text-dark fs-14">
												{{ user.userName }}
											</h6>
											<span class="text-muted fs-12">{{ user.email }}</span>
										</div>
									</div>
								</td>
								<td>
									<span class="fw-bold text-dark fs-14">{{
										user.courseTitle
									}}</span>
								</td>
								<td>
									<div class="d-flex align-items-center gap-2 text-muted fs-14">
										<Calendar
											:size="14"
											style="width: 14px; height: 14px; min-width: 14px"
										/>
										{{ new Date(user.enrolledAt).toLocaleDateString("vi-VN") }}
									</div>
								</td>
								<td class="text-center">
									<span
										class="badge rounded-pill px-3 py-2 fw-bold fs-12 d-inline-flex align-items-center gap-1"
										:class="
											user.daysSinceEnroll > 30
												? 'bg-danger-subtle text-danger'
												: user.daysSinceEnroll >= 15
													? 'bg-warning-subtle text-warning-emphasis'
													: 'bg-info-subtle text-info'
										"
									>
										<Clock
											:size="12"
											style="width: 12px; height: 12px; min-width: 12px"
										/>
										{{ user.daysSinceEnroll }} Ngày
									</span>
								</td>
								<td class="text-end pe-4">
									<button
										class="btn btn-sm btn-light rounded-pill border fw-bold text-dark d-inline-flex align-items-center gap-2 px-3 hover-primary transition-all"
										@click="sendReminder(user)"
									>
										<Mail
											:size="14"
											style="width: 14px; height: 14px; min-width: 14px"
										/>
										Gửi nhắc nhở
									</button>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>

			<div
				v-if="!loading && filteredData.length > 0"
				class="card-footer bg-white border-top px-4 py-3 d-flex flex-wrap justify-content-between align-items-center"
			>
				<span class="text-muted fs-14">
					Hiển thị
					<span class="fw-bold text-dark">{{
						(currentPage - 1) * itemsPerPage + 1
					}}</span>
					đến
					<span class="fw-bold text-dark">{{
						Math.min(currentPage * itemsPerPage, filteredData.length)
					}}</span>
					trong tổng số
					<span class="fw-bold text-dark">{{ filteredData.length }}</span> kết
					quả
				</span>

				<div class="d-flex align-items-center gap-3 mt-3 mt-sm-0">
					<div class="d-flex align-items-center gap-2">
						<span class="text-muted fs-14">Hiển thị:</span>
						<select
							v-model="itemsPerPage"
							class="form-select form-select-sm border-0 bg-light rounded-3 fw-bold cursor-pointer"
							style="width: 70px"
							@change="currentPage = 1"
						>
							<option :value="5">5</option>
							<option :value="10">10</option>
							<option :value="20">20</option>
							<option :value="50">50</option>
						</select>
					</div>

					<div class="pagination-ui d-flex gap-1">
						<button
							class="btn btn-sm btn-light rounded-2 border px-2 text-muted hover-dark"
							:disabled="currentPage === 1"
							@click="currentPage--"
						>
							<ChevronLeft
								:size="16"
								style="width: 16px; height: 16px; min-width: 16px"
							/>
						</button>

						<button
							v-for="page in totalPages"
							:key="page"
							class="btn btn-sm rounded-2 fw-bold px-3 transition-all"
							:class="
								page === currentPage
									? 'btn-primary shadow-sm'
									: 'btn-light border text-muted hover-dark'
							"
							@click="currentPage = page"
							v-show="
								Math.abs(page - currentPage) <= 1 ||
								page === 1 ||
								page === totalPages
							"
						>
							{{ page }}
						</button>

						<button
							class="btn btn-sm btn-light rounded-2 border px-2 text-muted hover-dark"
							:disabled="currentPage === totalPages"
							@click="currentPage++"
						>
							<ChevronRight
								:size="16"
								style="width: 16px; height: 16px; min-width: 16px"
							/>
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
.fw-black {
	font-weight: 900;
}
.tracking-wide {
	letter-spacing: 0.05em;
}
.transition-all {
	transition: all 0.2s ease;
}
.cursor-pointer {
	cursor: pointer;
}

.relative-card {
	position: relative;
}
.card-border-left {
	position: absolute;
	left: 0;
	top: 0;
	bottom: 0;
	width: 4px;
	border-radius: 4px 0 0 4px;
}
.hover-translate-y:hover {
	transform: translateY(-4px);
	box-shadow:
		0 10px 15px -3px rgba(0, 0, 0, 0.1),
		0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
}

.native-grid th {
	color: #64748b;
	font-size: 0.75rem;
	font-weight: 700;
	text-transform: uppercase;
	letter-spacing: 0.05em;
	padding: 16px;
	border-bottom: 2px solid #e2e8f0;
}
.native-grid td {
	padding: 16px;
	color: #475569;
	border-bottom: 1px solid #f8fafc;
}
.hover-bg:hover td {
	background-color: #f8fafc;
}
.custom-check {
	transform: scale(1.1);
	cursor: pointer;
}

.search-box input:focus {
	box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}
.export-btn:hover {
	background-color: #f1f5f9;
	border-color: #cbd5e1 !important;
	color: #0f172a !important;
}
.btn-hover:hover {
	transform: translateY(-1px);
	box-shadow: 0 4px 12px rgba(220, 38, 38, 0.2) !important;
}
.hover-primary:hover {
	background-color: var(--bs-primary) !important;
	color: white !important;
	border-color: var(--bs-primary) !important;
}
.hover-dark:hover:not(:disabled) {
	background-color: #f1f5f9;
	color: #0f172a !important;
}

.avatar-sm {
	width: 36px;
	height: 36px;
	font-size: 14px;
}

.lucide,
svg {
	flex-shrink: 0;
}
.btn svg,
.badge svg,
.d-flex svg {
	min-width: auto;
}
</style>
