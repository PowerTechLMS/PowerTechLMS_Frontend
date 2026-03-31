<template>
	<div class="coursegroup-page">
		<div class="page-header mb-5">
			<div class="header-content">
				<div class="header-icon-box pulse-glow">
					<Route
						:size="32"
						style="width: 32px; height: 32px"
						class="animated-icon"
					/>
				</div>
				<div>
					<div class="d-flex align-items-center gap-2 mb-1">
						<span class="badge-glass primary fs-10 fw-bold"
							>LEARNING PATHS</span
						>
					</div>
					<h1 class="page-title-gradient">Khung Lộ Trình Đào Tạo</h1>
					<p class="page-desc">
						Gom nhóm các khóa học thành lộ trình bài bản và tự động phân bổ theo
						Phòng ban.
					</p>
				</div>
			</div>

			<div class="header-actions">
				<button @click="goToCreate" class="btn btn-primary btn-glow">
					<Plus :size="18" style="width: 18px; height: 18px" />
					<span>Tạo Lộ trình mới</span>
				</button>
			</div>
		</div>

		<div class="row g-4 mb-5">
			<div class="col-md-4">
				<div class="glass-stat-card bg-primary-gradient">
					<div class="stat-icon-wrapper"><Route :size="24" /></div>
					<div class="stat-info">
						<span class="stat-label">TỔNG SỐ LỘ TRÌNH</span>
						<h3 class="stat-value">{{ stats.total }}</h3>
					</div>
					<div class="stat-decoration"></div>
				</div>
			</div>
			<div class="col-md-4">
				<div class="glass-stat-card bg-info-gradient">
					<div class="stat-icon-wrapper"><BookOpen :size="24" /></div>
					<div class="stat-info">
						<span class="stat-label">TỔNG KHÓA HỌC ÁP DỤNG</span>
						<h3 class="stat-value">{{ stats.totalCourses }}</h3>
					</div>
					<div class="stat-decoration"></div>
				</div>
			</div>
			<div class="col-md-4">
				<div class="glass-stat-card bg-success-gradient">
					<div class="stat-icon-wrapper"><Building2 :size="24" /></div>
					<div class="stat-info">
						<span class="stat-label">PHÒNG BAN ĐANG SỬ DỤNG</span>
						<h3 class="stat-value">{{ stats.totalDepartments }}</h3>
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
					<Layers :size="20" class="text-primary" /> Danh sách Lộ trình
				</h5>


				<div class="glass-search">
					<Search :size="18" class="text-tertiary" />
					<input
						type="text"
						v-model="searchQuery"
						placeholder="Tìm tên lộ trình..."
						class="search-input-premium"
						@input="currentPage = 1"
					/>
				</div>
			</div>

			<div class="glass-card-body p-0">
				<div v-if="loading" class="text-center py-5">
					<div class="premium-spinner mx-auto"></div>
					<p class="mt-3 text-muted fw-bold">Đang tải cấu trúc đào tạo...</p>
				</div>

				<div
					v-else-if="paginatedPaths.length === 0"
					class="empty-state-glass py-5"
				>
					<div class="empty-icon-box mb-4">
						<Route :size="64" class="opacity-20 animate-pulse" />
					</div>
					<h5 class="fw-bold">Chưa có Lộ trình nào</h5>

					<p class="text-tertiary fs-14 mb-0">
						Tạo lộ trình để nhóm các khóa học lại với nhau.
					</p>
				</div>

				<div v-else class="table-responsive">
					<table class="glass-table-ui">
						<thead>
							<tr>
								<th class="ps-4" width="80">MÃ LT</th>
								<th min-width="250">Thông tin Lộ trình</th>
								<th class="text-center">Số Khóa học</th>
								<th class="text-center">Áp dụng cho</th>
								<th>Ngày khởi tạo</th>
								<th class="text-center pe-4">Thao tác</th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="path in paginatedPaths" :key="path.id">
								<td class="ps-4">
									<span class="dept-id-badge"
										>PATH-{{ String(path.id).padStart(3, "0") }}</span
									>
								</td>

								<td>
									<div class="dept-info-cell">
										<h6 class="dept-name">{{ path.name }}</h6>
										<p
											class="dept-desc text-truncate"
											style="max-width: 300px"
											:title="path.description"
										>
											{{
												path.description || "Chưa cập nhật mục tiêu đào tạo."
											}}
										</p>
									</div>
								</td>

								<td class="text-center">
									<div class="course-group-badge info mx-auto">
										<BookOpen :size="14" class="me-1" />
										<span class="cg-num">{{ path.courseCount || 0 }}</span>
										<span class="cg-text">Khóa</span>
									</div>
								</td>

								<td class="text-center">
									<div
										class="course-group-badge primary mx-auto"
										title="Số lượng phòng ban tự động học lộ trình này"
									>
										<Building2 :size="14" class="me-1" />
										<span class="cg-num">{{ path.departmentCount || 0 }}</span>
										<span class="cg-text">Phòng</span>
									</div>
								</td>

								<td>
									<div
										class="fs-13 text-secondary fw-medium d-flex align-items-center gap-1"
									>
										<Calendar :size="14" class="text-tertiary" />
										{{ new Date(path.createdAt).toLocaleDateString("vi-VN") }}
									</div>
								</td>

								<td class="pe-4">
									<div class="action-buttons">
										<button
											class="btn-ghost-icon view"
											title="Chi tiết & Xếp thứ tự khóa học"
											@click="viewPath(path.id)"
										>
											<Eye :size="16" />
										</button>
										<button
											class="btn-ghost-icon edit"
											title="Chỉnh sửa thông tin"
											@click="editPath(path.id)"
										>
											<Pencil :size="16" />
										</button>
										<button
											class="btn-ghost-icon delete"
											title="Xóa lộ trình"
											@click="deletePath(path)"
											:disabled="deletingId === path.id"
										>
											<Loader2
												v-if="deletingId === path.id"
												:size="16"
												class="spinner-icon"
											/>
											<Trash2 v-else :size="16" />
										</button>
									</div>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>

			<div
				class="glass-card-footer-premium p-4 border-top-glass d-flex justify-content-between align-items-center flex-wrap gap-3"
				v-if="totalPages > 1"
			>
				<div class="fs-13 text-tertiary fw-medium">
					Hiển thị
					<span class="fw-bold"
						>{{ (currentPage - 1) * itemsPerPage + 1 }} -
						{{
							Math.min(currentPage * itemsPerPage, filteredPaths.length)
						}}</span
					>
					trên tổng
					<span class="fw-bold">{{ filteredPaths.length }}</span>

				</div>
				<div class="glass-pagination d-flex gap-1">
					<button
						class="pag-btn"
						:disabled="currentPage === 1"
						@click="currentPage--"
					>
						<ChevronLeft :size="16" />
					</button>
					<button
						v-for="page in totalPages"
						:key="page"
						class="pag-btn"
						:class="{ active: currentPage === page }"
						@click="currentPage = page"
					>
						{{ page }}
					</button>
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
	</div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { courseGroupAPI } from "@/services/api";
import {
	Route,
	BookOpen,
	Building2,
	Layers,
	Search,
	Plus,
	Eye,
	Pencil,
	Trash2,
	Calendar,
	ChevronLeft,
	ChevronRight,
	Loader2,
} from "lucide-vue-next";
import { toast } from "vue3-toastify";

const router = useRouter();

const learningPaths = ref<any[]>([]);
const loading = ref(true);
const deletingId = ref<number | null>(null);

const searchQuery = ref("");
const currentPage = ref(1);
const itemsPerPage = ref(10);

const fetchPaths = async () => {
	loading.value = true;
	try {
		const res = await courseGroupAPI.getAll({ pageSize: 1500 });
		learningPaths.value = res.data.items || res.data;
	} catch {
		toast.error("Lỗi khi tải danh sách lộ trình");
	} finally {
		loading.value = false;
	}
};

onMounted(fetchPaths);

const stats = computed(() => ({
	total: learningPaths.value.length,
	totalCourses: learningPaths.value.reduce(
		(sum: number, p: any) => sum + (p.courseCount || 0),
		0,
	),
	totalDepartments: learningPaths.value.reduce(
		(sum: number, p: any) => sum + (p.departmentCount || 0),
		0,
	),
}));

const filteredPaths = computed(() => {
	let result = [...learningPaths.value];
	if (searchQuery.value) {
		const q = searchQuery.value.toLowerCase();
		result = result.filter(
			(p) =>
				(p.name || "").toLowerCase().includes(q) ||
				(p.description || "").toLowerCase().includes(q) ||
				`path-${String(p.id).padStart(3, "0")}`.includes(q),
		);
	}
	return result;
});

const totalPages = computed(
	() => Math.ceil(filteredPaths.value.length / itemsPerPage.value) || 1,
);
const paginatedPaths = computed(() => {
	const start = (currentPage.value - 1) * itemsPerPage.value;
	return filteredPaths.value.slice(start, start + itemsPerPage.value);
});

const goToCreate = () => router.push("/admin/coursegroup/add");
const viewPath = (id: number) => router.push(`/admin/coursegroup/${id}/about`);
const editPath = (id: number) => router.push(`/admin/coursegroup/${id}/edit`);

const deletePath = async (path: any) => {
	if (
		confirm(
			`Bạn có chắc muốn xóa lộ trình "${path.name}"? Lộ trình này sẽ bị gỡ khỏi các phòng ban đang áp dụng.`,
		)
	) {
		deletingId.value = path.id;
		try {
			await courseGroupAPI.delete(path.id);
			learningPaths.value = learningPaths.value.filter((p) => p.id !== path.id);
			toast.success("Xóa lộ trình thành công!");
		} catch {
			toast.error("Không thể xóa lộ trình này!");
		} finally {
			deletingId.value = null;
		}
	}
};
</script>

<style scoped>
.coursegroup-page {
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
	background-clip: text;
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
@keyframes spin {
	100% {
		transform: rotate(360deg);
	}
}
@keyframes pulse-border {
	0% {
		box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.2);
	}
	50% {
		box-shadow: 0 0 0 15px rgba(99, 102, 241, 0);
	}
	100% {
		box-shadow: 0 0 0 0 rgba(99, 102, 241, 0);
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
		rgba(99, 102, 241, 0.15),
		rgba(99, 102, 241, 0.05)
	);
	color: var(--primary-500);
	display: flex;
	align-items: center;
	justify-content: center;
	border: 1px solid rgba(99, 102, 241, 0.2);
	box-shadow: 0 8px 20px rgba(99, 102, 241, 0.15);
	flex-shrink: 0;
}
.pulse-glow {
	animation: pulse-border 3s ease-in-out infinite;
}

.badge-glass {
	padding: 4px 12px;
	border-radius: 20px;
	font-size: 11px;
	font-weight: 800;
	letter-spacing: 0.5px;
	display: inline-flex;
	align-items: center;
	border: 1px solid transparent;
}
.badge-glass.primary {
	background: rgba(99, 102, 241, 0.1);
	color: var(--primary-600);
	border-color: rgba(99, 102, 241, 0.2);
}

.btn {
	display: inline-flex;
	align-items: center;
	gap: 8px;
	padding: 12px 24px;
	border-radius: var(--radius-full);
	font-weight: 700;
	font-size: var(--font-size-sm);
	cursor: pointer;
	transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
	border: none;
}
.btn-primary {
	background: var(--primary-500);
	color: white;
}
.btn-glow {
	box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
}
.btn-glow:hover {
	transform: translateY(-2px);
	box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4);
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
.bg-info-gradient {
	background: linear-gradient(135deg, #0284c7 0%, #38bdf8 100%);
}
.bg-success-gradient {
	background: linear-gradient(135deg, #059669 0%, #10b981 100%);
}

.glass-content-card {
	background: var(--bg-secondary);
	backdrop-filter: blur(20px);
	border: 1px solid var(--border-color);
	border-radius: 28px;
	box-shadow: 0 8px 32px rgba(0, 0, 0, 0.03);
	overflow: hidden;
}
.border-bottom-glass {
	border-bottom: 1px solid var(--border-color);
}
.border-top-glass {
	border-top: 1px solid var(--border-color);
}

.glass-search {
	display: flex;
	align-items: center;
	background: var(--bg-tertiary);
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
	letter-spacing: 0.05em;
	border-bottom: 2px solid var(--border-color);
}
.glass-table-ui td {
	padding: 18px 16px;
	border-bottom: 1px solid var(--border-color);
	vertical-align: middle;
	color: var(--text-primary);
}
.glass-table-ui tbody tr:hover td {
	background: var(--bg-tertiary);
}


.dept-id-badge {
	display: inline-block;
	background: var(--bg-tertiary);
	color: var(--text-tertiary);
	font-weight: 700;
	font-size: 12px;
	font-family: monospace;
	padding: 4px 10px;
	border-radius: 8px;
	border: 1px solid var(--border-color);
}


.dept-info-cell {
	display: flex;
	flex-direction: column;
	gap: 6px;
}
.dept-name {
	margin: 0;
	font-size: 15px;
	font-weight: 700;
	color: var(--text-primary);
}
.dept-desc {
	margin: 0;
	font-size: 13px;
	color: var(--text-secondary);
	line-height: 1.4;
}

.course-group-badge {
	display: inline-flex;
	align-items: center;
	border-radius: 12px;
	padding: 4px 10px;
	gap: 6px;
	font-weight: 600;
	font-size: 12px;
}
.course-group-badge.info {
	background: rgba(14, 165, 233, 0.08);
	border: 1px solid rgba(14, 165, 233, 0.2);
	color: var(--info-700);
}
.course-group-badge.info .cg-num {
	background: var(--info-500);
	color: white;
}
.course-group-badge.primary {
	background: rgba(99, 102, 241, 0.05);
	border: 1px solid rgba(99, 102, 241, 0.2);
	color: var(--primary-700);
}
.course-group-badge.primary .cg-num {
	background: var(--primary-500);
	color: white;
}

.course-group-badge .cg-num {
	font-weight: 900;
	font-size: 12px;
	padding: 2px 6px;
	border-radius: 6px;
	min-width: 24px;
	text-align: center;
}

.action-buttons {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 8px;
}
.btn-ghost-icon {
	width: 36px;
	height: 36px;
	border-radius: 10px;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	border: 1px solid transparent;
	background: transparent;
	cursor: pointer;
	transition: all 0.2s;
	color: var(--text-tertiary);
}
.btn-ghost-icon.view:hover {
	color: var(--primary-600);
	background: rgba(99, 102, 241, 0.1);
	border-color: rgba(99, 102, 241, 0.2);
}
.btn-ghost-icon.edit:hover {
	color: var(--success-600);
	background: rgba(16, 185, 129, 0.1);
	border-color: rgba(16, 185, 129, 0.2);
}
.btn-ghost-icon.delete:hover:not(:disabled) {
	color: var(--danger-600);
	background: rgba(239, 68, 68, 0.1);
	border-color: rgba(239, 68, 68, 0.2);
}

.pag-btn {
	width: 36px;
	height: 36px;
	border-radius: 10px;
	border: 1px solid var(--border-color);
	background: var(--bg-secondary);
	color: var(--text-secondary);
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.2s;
	font-weight: 600;
}
.pag-btn:hover:not(:disabled) {
	background: var(--bg-tertiary);
	color: var(--primary-500);
	border-color: var(--primary-500);
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

.premium-spinner {
	width: 40px;
	height: 40px;
	border: 4px solid rgba(79, 70, 229, 0.2);
	border-top-color: var(--primary-500);
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
	background: var(--bg-tertiary);
	width: 100px;
	height: 100px;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
}

:is([data-bs-theme="dark"], [data-theme="dark"]) .glass-stat-card {
	border-color: rgba(255, 255, 255, 0.05);
}
</style>

