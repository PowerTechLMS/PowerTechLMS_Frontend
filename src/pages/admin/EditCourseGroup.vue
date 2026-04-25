<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { courseGroupAPI, courseAPI } from "@/services/api";
import { toast } from "vue3-toastify";
import {
	Route,
	ArrowLeft,
	BookOpen,
	Save,
	Settings,
	Plus,
	Trash2,
	Loader2,
	GripVertical,
	CheckCircle,
} from "lucide-vue-next";

const router = useRouter();
const route = useRoute();
const pathId = Number(route.params.id);

const form = ref({ name: "", description: "" });
const isSubmitting = ref(false);
const loading = ref(true);

const pathCourses = ref<any[]>([]);
const allCourses = ref<any[]>([]);
const selectedCourseToAdd = ref("");
const selectedLevel = ref("all");

const levelOptions = [
	{ value: "all", label: "Tất cả cấp độ" },
	{ value: "1", label: "Cấp độ 1: Người mới" },
	{ value: "2", label: "Cấp độ 2: Phòng ban" },
	{ value: "3", label: "Cấp độ 3: Tự chọn" },
];

const fetchData = async () => {
	loading.value = true;
	try {
		const [pathRes, coursesRes] = await Promise.all([
			courseGroupAPI.getById(pathId),
			courseAPI.getAll({ pageSize: 1000 }),
		]);

		form.value.name = pathRes.data.name;
		form.value.description = pathRes.data.description;
		pathCourses.value = pathRes.data.courses || [];
		allCourses.value = coursesRes.data.items || coursesRes.data;
	} catch {
		toast.error("Lỗi tải thông tin lộ trình.");
		router.push("/admin/coursegroup");
	} finally {
		loading.value = false;
	}
};

onMounted(fetchData);

const availableCourses = computed(() => {
	const existingIds = new Set(pathCourses.value.map((c) => c.id));
	let results = allCourses.value.filter((c) => !existingIds.has(c.id));

	if (selectedLevel.value !== "all") {
		results = results.filter((c) => String(c.level) === selectedLevel.value);
	}

	return results;
});

const updatePath = async () => {
	isSubmitting.value = true;
	try {
		await courseGroupAPI.update(pathId, form.value);
		toast.success("Cập nhật thông tin thành công!");
		router.push("/admin/coursegroup");
	} catch {
		toast.error("Lỗi cập nhật.");
	} finally {
		isSubmitting.value = false;
	}
};

const addCourseToPath = async () => {
	if (!selectedCourseToAdd.value) return;
	isSubmitting.value = true;
	try {
		const courseId = Number(selectedCourseToAdd.value);
		await courseGroupAPI.addCourse(pathId, courseId);
		const pathRes = await courseGroupAPI.getById(pathId);
		pathCourses.value = pathRes.data.courses || [];
		selectedCourseToAdd.value = "";
		toast.success("Đã thêm khóa học vào lộ trình.");
	} catch {
		toast.error("Lỗi khi thêm khóa học.");
	} finally {
		isSubmitting.value = false;
	}
};

const removeCourse = async (courseId: number, title: string) => {
	if (!confirm(`Gỡ khóa học "${title}" khỏi lộ trình này?`)) return;
	try {
		await courseGroupAPI.removeCourse(pathId, courseId);
		pathCourses.value = pathCourses.value.filter((c) => c.id !== courseId);
		toast.success("Đã gỡ khóa học.");
	} catch {
		toast.error("Lỗi khi gỡ khóa học.");
	}
};
</script>

<template>
	<div class="edit-path-page">
		<div v-if="loading" class="text-center py-5">
			<Loader2 :size="40" class="spinner-icon mx-auto text-primary" />
			<p class="mt-3 text-muted fw-bold">Đang tải cấu trúc lộ trình...</p>
		</div>

		<div v-else>
			<div class="page-header mb-4">
				<div class="header-content">
					<div class="header-icon-box pulse-glow">
						<Route :size="32" style="width: 32px; height: 32px" />
					</div>
					<div>
						<span class="badge-glass primary mb-1"
							>MÃ: PATH-{{ String(pathId).padStart(3, "0") }}</span
						>
						<h1 class="page-title-gradient">Cấu hình: {{ form.name }}</h1>
						<p class="page-desc">
							Quản lý danh sách khóa học thuộc lộ trình này.
						</p>
					</div>
				</div>
				<button
					@click="router.push('/admin/coursegroup')"
					class="btn btn-outline"
				>
					<ArrowLeft :size="18" class="me-2" /> Quay lại
				</button>
			</div>

			<div class="glass-content-card mb-4">
				<div class="glass-card-header p-4 border-bottom-glass bg-light-glass">
					<h2 class="section-title">
						<Settings :size="20" class="me-2 text-primary" /> Thông tin chung
					</h2>
				</div>
				<div class="glass-card-body p-4">
					<div class="row g-4">
						<div class="col-lg-7">
							<form @submit.prevent="updatePath">
								<div class="form-group mb-4">
									<label class="premium-label"
										>Tên Lộ trình <span class="text-danger">*</span></label
									>
									<input
										type="text"
										class="glass-input w-100"
										v-model="form.name"
										required
									/>
								</div>
								<div class="form-group mb-4">
									<label class="premium-label">Mô tả mục tiêu đào tạo</label>
									<textarea
										class="glass-input w-100"
										rows="4"
										v-model="form.description"
									></textarea>
								</div>
								<div class="pt-2">
									<button
										type="submit"
										class="btn btn-primary"
										:disabled="isSubmitting"
									>
										<Loader2
											v-if="isSubmitting"
											:size="18"
											class="spinner-icon me-2"
										/>
										<Save v-else :size="18" class="me-2" /> Lưu thay đổi thông
										tin
									</button>
								</div>
							</form>
						</div>

						<div class="col-lg-5">
							<div class="path-stat-dashboard">
								<div class="stat-header mb-3">
									<h4
										class="fs-14 fw-bold text-muted text-uppercase letter-spacing-1"
									>
										Tóm tắt lộ trình
									</h4>
								</div>
								<div class="stat-grid">
									<div class="stat-item">
										<div class="stat-icon-bg primary">
											<BookOpen :size="20" />
										</div>
										<div class="stat-content">
											<div class="stat-value">{{ pathCourses.length }}</div>
											<div class="stat-label">Khóa học thành phần</div>
										</div>
									</div>

									<div class="stat-item">
										<div class="stat-icon-bg success">
											<CheckCircle :size="20" />
										</div>
										<div class="stat-content">
											<div class="stat-value">Active</div>
											<div class="stat-label">Trạng thái hệ thống</div>
										</div>
									</div>

									<div class="stat-item">
										<div class="stat-icon-bg warning">
											<Layers :size="20" />
										</div>
										<div class="stat-content">
											<div class="stat-value">
												{{
													selectedLevel === "all"
														? "Tất cả"
														: "Cấp " + selectedLevel
												}}
											</div>
											<div class="stat-label">Cấp độ đang lọc</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div class="glass-content-card">
				<div class="glass-card-header p-4 border-bottom-glass bg-light-glass">
					<h2 class="section-title">
						<BookOpen :size="20" class="me-2 text-primary" /> Cấu trúc Khóa học
						<span class="tab-badge ms-2">{{ pathCourses.length }}</span>
					</h2>
				</div>
				<div class="glass-card-body p-4">
					<div class="glass-add-box mb-4">
						<div class="flex-grow-1 d-flex gap-3 flex-wrap">
							<div style="flex: 1; min-width: 200px">
								<label class="premium-label text-primary mb-2"
									>Lọc theo cấp độ</label
								>
								<select class="glass-input w-100" v-model="selectedLevel">
									<option
										v-for="opt in levelOptions"
										:key="opt.value"
										:value="opt.value"
									>
										{{ opt.label }}
									</option>
								</select>
							</div>

							<div style="flex: 2; min-width: 300px">
								<label class="premium-label text-primary mb-2"
									>Thêm khóa học từ cấp độ đã chọn</label
								>
								<select class="glass-input w-100" v-model="selectedCourseToAdd">
									<option value="">-- Chọn khóa học từ kho lưu trữ --</option>
									<option
										v-for="c in availableCourses"
										:key="c.id"
										:value="c.id"
									>
										{{ c.title }}
									</option>
								</select>
							</div>
						</div>
						<button
							class="btn btn-primary"
							@click="addCourseToPath"
							:disabled="!selectedCourseToAdd || isSubmitting"
						>
							<Plus :size="18" class="me-2" /> Thêm khóa học
						</button>
					</div>

					<div class="table-container custom-scrollbar mt-4">
						<table class="glass-table custom-table mb-0 w-100">
							<thead>
								<tr>
									<th width="50" class="text-center">#</th>
									<th>Khóa học thành phần</th>
									<th width="150" class="text-center">Trạng thái</th>
									<th width="100" class="text-center">Gỡ</th>
								</tr>
							</thead>
							<tbody>
								<tr v-if="pathCourses.length === 0">
									<td colspan="4" class="text-center py-5 text-muted">
										Lộ trình này chưa có khóa học nào. Vui lòng thêm ở trên.
									</td>
								</tr>
								<tr v-for="(course, idx) in pathCourses" :key="course.id">
									<td class="text-center text-muted fw-bold">
										<div
											class="d-flex align-items-center justify-content-center gap-1"
										>
											<GripVertical :size="14" class="opacity-25" />
											{{ idx + 1 }}
										</div>
									</td>
									<td>
										<div class="fw-bold fs-14">
											{{ course.title }}
										</div>

										<div class="text-muted fs-12 mt-1">
											Mã khóa học: #{{ course.id }}
										</div>
									</td>
									<td class="text-center">
										<span class="badge-glass success"
											><CheckCircle :size="12" class="me-1" /> Đã liên kết</span
										>
									</td>
									<td class="text-center">
										<button
											class="btn-ghost-icon delete"
											@click="removeCourse(course.id, course.title)"
										>
											<Trash2 :size="18" />
										</button>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
.section-title {
	font-size: 18px;
	font-weight: 700;
	margin: 0;
	display: flex;
	align-items: center;
	color: var(--text-primary);
}
.bg-light-glass {
	background: rgba(0, 0, 0, 0.02);
}
.border-bottom-glass {
	border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.edit-path-page {
	padding-bottom: var(--space-2xl);
	animation: fadeIn 0.4s ease-out;
	max-width: 1100px;
	margin: 0 auto;
	color: var(--text-primary);
}
.fade-in {
	animation: fadeIn 0.3s ease-in-out;
}

.page-header {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	padding-bottom: 24px;
	border-bottom: 1px solid rgba(0, 0, 0, 0.05);
	flex-wrap: wrap;
	gap: var(--space-lg);
}
.header-content {
	display: flex;
	align-items: flex-start;
	gap: var(--space-xl);
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
	flex-shrink: 0;
}
.pulse-glow {
	animation: pulse-border 3s ease-in-out infinite;
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

.badge-glass {
	display: inline-block;
	padding: 4px 12px;
	border-radius: var(--radius-full);
	font-size: 11px;
	font-weight: 700;
	letter-spacing: 0.05em;
	border: 1px solid transparent;
}
.badge-glass.primary {
	background: rgba(99, 102, 241, 0.1);
	color: var(--primary-600);
	border-color: rgba(99, 102, 241, 0.2);
}
.badge-glass.success {
	background: rgba(16, 185, 129, 0.1);
	color: var(--success-700);
	border-color: rgba(16, 185, 129, 0.2);
	display: flex;
	align-items: center;
	justify-content: center;
	width: max-content;
	margin: 0 auto;
}

.page-title-gradient {
	font-size: 28px;
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
	font-size: 14px;
	color: var(--text-secondary);
	margin: 0;
}

.btn {
	display: inline-flex;
	align-items: center;
	gap: 8px;
	padding: 10px 20px;
	border-radius: var(--radius-full);
	font-weight: 600;
	font-size: 14px;
	cursor: pointer;
	transition: all 0.3s;
	border: none;
}
.btn-outline {
	background: transparent;
	color: var(--text-secondary);
	border: 1px solid var(--border-color);
}
.btn-outline:hover {
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}
.btn-primary {
	background: linear-gradient(
		135deg,
		var(--primary-600) 0%,
		var(--primary-500) 100%
	);
	color: white;
	box-shadow: 0 4px 15px rgba(99, 102, 241, 0.2);
}
.btn-primary:hover:not(:disabled) {
	transform: translateY(-2px);
	box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4);
}
.btn-primary:disabled {
	opacity: 0.6;
	cursor: not-allowed;
}

.glass-content-card {
	background: var(--bg-card);
	backdrop-filter: blur(20px);
	border: 1px solid var(--border-color);
	border-radius: var(--radius-2xl);
	box-shadow: 0 8px 32px rgba(0, 0, 0, 0.03);
	overflow: hidden;
}

.premium-label {
	font-weight: 700;
	font-size: 12px;
	text-transform: uppercase;
	letter-spacing: 0.05em;
	color: var(--text-secondary);
	display: block;
	margin-bottom: 8px;
}
.glass-input {
	width: 100%;
	padding: 12px 16px;
	background: var(--bg-tertiary);
	border: 1px solid var(--border-color);
	border-radius: 12px;
	color: var(--text-primary);
	font-size: 14px;
	transition: all 0.3s;
	outline: none;
}
.glass-input:focus {
	background: var(--bg-card);
	border-color: var(--primary-400);
	box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}

.path-stat-dashboard {
	height: 100%;
	background: var(--bg-secondary);
	border: 1px solid var(--border-color);
	border-radius: 20px;
	padding: 24px;
	display: flex;
	flex-direction: column;
}
.stat-grid {
	display: flex;
	flex-direction: column;
	gap: 16px;
}
.stat-item {
	display: flex;
	align-items: center;
	gap: 16px;
	padding: 12px;
	background: var(--bg-card);
	border-radius: 12px;
	border: 1px solid var(--border-color);
	transition: all 0.3s;
}
.stat-item:hover {
	transform: translateX(5px);
	border-color: var(--primary-300);
}
.stat-icon-bg {
	width: 44px;
	height: 44px;
	border-radius: 10px;
	display: flex;
	align-items: center;
	justify-content: center;
}
.stat-icon-bg.primary {
	background: rgba(99, 102, 241, 0.1);
	color: var(--primary-600);
}
.stat-icon-bg.success {
	background: rgba(16, 185, 129, 0.1);
	color: var(--success-600);
}
.stat-icon-bg.warning {
	background: rgba(245, 158, 11, 0.1);
	color: var(--warning-600);
}

.stat-content {
	flex: 1;
}
.stat-value {
	font-size: 18px;
	font-weight: 800;
	color: var(--text-primary);
	line-height: 1.2;
}
.stat-label {
	font-size: 11px;
	font-weight: 700;
	color: var(--text-tertiary);
	text-transform: uppercase;
	letter-spacing: 0.05em;
}

.glass-add-box {
	background: rgba(99, 102, 241, 0.03);
	border: 1px dashed rgba(99, 102, 241, 0.3);
	border-radius: 16px;
	padding: 20px;
	display: flex;
	gap: 16px;
	align-items: flex-end;
	flex-wrap: wrap;
}

.table-container {
	width: 100%;
	overflow-x: auto;
	background: var(--bg-card);
	border: 1px solid var(--border-color);
	border-radius: 16px;
}

.glass-table {
	width: 100%;
	border-collapse: separate;
	border-spacing: 0;
	min-width: 600px;
}
.glass-table th {
	text-align: left;
	padding: 12px 16px;
	font-size: 11px;
	font-weight: 700;
	color: var(--text-tertiary);
	text-transform: uppercase;
	border-bottom: 2px solid var(--border-color);
	background: var(--bg-secondary);
}

.glass-table td {
	padding: 16px;
	border-bottom: 1px solid var(--border-color);
	vertical-align: middle;
}

.btn-ghost-icon {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 36px;
	height: 36px;
	border-radius: 10px;
	background: transparent;
	border: 1px solid transparent;
	cursor: pointer;
	transition: all 0.2s;
	color: var(--text-tertiary);
}
.btn-ghost-icon.delete:hover {
	color: var(--danger-600);
	background: rgba(239, 68, 68, 0.1);
	border-color: rgba(239, 68, 68, 0.2);
}

.border-top-glass {
	border-top: 1px solid rgba(0, 0, 0, 0.05);
}
.spinner-icon {
	animation: spin 1s linear infinite;
}
@keyframes spin {
	100% {
		transform: rotate(360deg);
	}
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
</style>
