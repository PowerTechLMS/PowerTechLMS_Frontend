<script lang="ts" setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { courseGroupAPI, courseAPI } from "@/services/api";
import { toast } from "vue3-toastify";
import {
	Route,
	AlignLeft,
	ArrowLeft,
	Save,
	X,
	Loader2,
	Layers,
	BookOpen,
	Search,
	CheckCircle2,
} from "lucide-vue-next";

const router = useRouter();

const form = ref({
	name: "",
	description: "",
	selectedCourseIds: [] as number[],
});

const allCourses = ref<any[]>([]);
const isSubmitting = ref(false);
const isLoadingCourses = ref(true);
const searchQuery = ref("");
const selectedLevel = ref("all");

const levelOptions = [
	{ value: "all", label: "Tất cả cấp độ" },
	{ value: "1", label: "Cấp độ 1: Người mới" },
	{ value: "2", label: "Cấp độ 2: Phòng ban" },
	{ value: "3", label: "Cấp độ 3: Tự chọn" },
];

onMounted(async () => {
	isLoadingCourses.value = true;
	try {
		const res = await courseAPI.getAll({ pageSize: 1500 });
		allCourses.value = res.data.items || res.data;
	} catch {
		toast.error("Không thể tải danh sách khóa học. Vui lòng thử lại.");
	} finally {
		isLoadingCourses.value = false;
	}
});

const filteredCourses = computed(() => {
	let results = allCourses.value;

	if (searchQuery.value) {
		const q = searchQuery.value.toLowerCase();
		results = results.filter((c) => c.title?.toLowerCase().includes(q));
	}

	if (selectedLevel.value !== "all") {
		results = results.filter((c) => {
			return String(c.level) === selectedLevel.value;
		});
	}

	return results;
});

const toggleCourse = (id: number) => {
	const index = form.value.selectedCourseIds.indexOf(id);
	if (index === -1) {
		form.value.selectedCourseIds.push(id);
	} else {
		form.value.selectedCourseIds.splice(index, 1);
	}
};

const submitForm = async () => {
	if (!form.value.name) {
		toast.error("Vui lòng nhập tên Lộ trình đào tạo");
		return;
	}

	if (form.value.selectedCourseIds.length === 0) {
		const confirmNoCourse = confirm(
			"Bạn chưa chọn khóa học nào. Vẫn tiếp tục tạo lộ trình rỗng?",
		);
		if (!confirmNoCourse) return;
	}

	isSubmitting.value = true;
	try {
		const res = await courseGroupAPI.create({
			name: form.value.name,
			description: form.value.description,
		});

		const newPathId = res.data.id;

		if (form.value.selectedCourseIds.length > 0) {
			const assignPromises = form.value.selectedCourseIds.map((cId, index) =>
				courseGroupAPI.addCourse(newPathId, cId, { sortOrder: index + 1 }),
			);
			await Promise.all(assignPromises);
		}

		toast.success("Đã tạo Khung lộ trình & gán Khóa học thành công!");
		router.push("/admin/coursegroup");
	} catch (error: any) {
		toast.error(
			error.response?.data?.message || "Có lỗi xảy ra khi tạo lộ trình!",
		);
	} finally {
		isSubmitting.value = false;
	}
};

const cancel = () => router.push("/admin/coursegroup");
</script>

<template>
	<div class="add-path-page">
		<div class="page-header">
			<div class="header-content">
				<div class="header-icon-box pulse-glow">
					<Route
						:size="32"
						style="width: 32px; height: 32px; min-width: 32px"
					/>
				</div>
				<div>
					<h1 class="page-title-gradient">Khởi tạo Lộ trình mới</h1>
					<p class="page-desc">
						Thiết lập thông tin và cấu trúc khóa học trong cùng một bước duy
						nhất.
					</p>
				</div>
			</div>
			<div class="header-actions">
				<button @click="cancel" class="btn btn-outline">
					<ArrowLeft
						:size="18"
						style="width: 18px; height: 18px; min-width: 18px"
					/>
					<span>Quay lại</span>
				</button>
			</div>
		</div>

		<form @submit.prevent="submitForm">
			<div class="row g-4">
				<div class="col-xl-5 col-lg-6">
					<div class="glass-card h-100">
						<div class="glass-card-banner">
							<div class="banner-icon-bg">
								<Layers :size="20" style="width: 20px; height: 20px" />
							</div>
							<div class="banner-text">
								<h5 class="banner-title">Thông tin Lộ trình</h5>
								<p class="banner-desc">
									Thiết lập nhận diện cho chương trình đào tạo.
								</p>
							</div>
						</div>

						<div class="glass-card-body p-4">
							<div class="form-group mb-4">
								<label class="premium-label"
									>Tên Lộ Trình / Learning Path
									<span class="text-danger">*</span></label
								>
								<div class="glass-input-group">
									<span class="input-icon"
										><Route :size="18" style="width: 18px; height: 18px"
									/></span>
									<input
										type="text"
										class="glass-input"
										placeholder="Ví dụ: Onboarding Nhân viên mới..."
										v-model="form.name"
										required
									/>
								</div>
							</div>

							<div class="form-group mb-0">
								<label class="premium-label"
									>Mục tiêu đào tạo (Mô tả chi tiết)</label
								>
								<div class="glass-input-group textarea-group">
									<span class="input-icon"
										><AlignLeft :size="18" style="width: 18px; height: 18px"
									/></span>
									<textarea
										class="glass-input"
										rows="8"
										placeholder="Mô tả nội dung và kỹ năng học viên sẽ đạt được sau khi hoàn thành chuỗi khóa học này..."
										v-model="form.description"
									></textarea>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div class="col-xl-7 col-lg-6">
					<div class="glass-card h-100 d-flex flex-column">
						<div
							class="glass-card-banner d-flex justify-content-between align-items-center flex-wrap gap-3"
						>
							<div class="d-flex align-items-center gap-3">
								<div class="banner-icon-bg info">
									<BookOpen :size="20" style="width: 20px; height: 20px" />
								</div>
								<div class="banner-text">
									<h5 class="banner-title">Chọn Khóa học thành phần</h5>
									<p class="banner-desc">
										Đã chọn:
										<strong class="text-primary">{{
											form.selectedCourseIds.length
										}}</strong>
										khóa học.
									</p>
								</div>
							</div>

							<div class="d-flex align-items-center gap-2">
								<div class="glass-search inline">
									<Search
										:size="16"
										class="text-tertiary"
										style="width: 16px; height: 16px; min-width: 16px"
									/>
									<input
										type="text"
										class="search-input-premium sm"
										placeholder="Tìm khóa học..."
										v-model="searchQuery"
									/>
								</div>

								<div class="glass-select-wrapper">
									<select v-model="selectedLevel" class="glass-select-sm">
										<option
											v-for="opt in levelOptions"
											:key="opt.value"
											:value="opt.value"
										>
											{{ opt.label }}
										</option>
									</select>
								</div>
							</div>
						</div>

						<div
							class="glass-card-body p-4 flex-grow-1 overflow-hidden d-flex flex-column"
						>
							<div v-if="isLoadingCourses" class="text-center py-5 m-auto">
								<Loader2
									:size="32"
									class="spinner-icon text-primary mb-2 mx-auto"
								/>
								<p class="text-muted fs-14 fw-medium">
									Đang tải thư viện khóa học...
								</p>
							</div>

							<div
								v-else-if="filteredCourses.length === 0"
								class="text-center py-5 m-auto opacity-50"
							>
								<BookOpen :size="48" class="mb-3 mx-auto" />
								<p class="fs-14 fw-medium">
									Không tìm thấy khóa học nào phù hợp.
								</p>
							</div>

							<div v-else class="courses-selection-list custom-scrollbar pe-2">
								<div class="row g-3">
									<div
										class="col-sm-6 col-12"
										v-for="c in filteredCourses"
										:key="c.id"
									>
										<label
											class="glass-course-select-card"
											:class="{
												selected: form.selectedCourseIds.includes(c.id),
											}"
										>
											<input
												type="checkbox"
												:value="c.id"
												class="d-none"
												@change="toggleCourse(c.id)"
												:checked="form.selectedCourseIds.includes(c.id)"
											/>

											<div class="card-check-circle">
												<CheckCircle2
													v-if="form.selectedCourseIds.includes(c.id)"
													:size="16"
												/>
											</div>

											<div class="course-thumb-wrapper">
												<img
													v-if="c.coverImageUrl"
													:src="c.coverImageUrl"
													class="course-thumb"
												/>
												<div v-else class="course-thumb-placeholder">
													<BookOpen :size="20" class="opacity-50" />
												</div>
											</div>

											<div class="course-info">
												<h6 class="course-title" :title="c.title">
													{{ c.title }}
												</h6>
												<div class="course-meta">
													<span class="badge-glass">ID: #{{ c.id }}</span>
												</div>
											</div>
										</label>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div class="col-12 mt-4">
					<div
						class="glass-footer-bar p-4 rounded-4 d-flex justify-content-end gap-3 align-items-center"
					>
						<span class="text-muted fs-13 fw-medium me-auto"
							>Hệ thống sẽ tự động liên kết các khóa học được chọn.</span
						>
						<button
							type="button"
							class="btn-cancel"
							@click="cancel"
							:disabled="isSubmitting"
						>
							<X
								:size="18"
								style="width: 18px; height: 18px; min-width: 18px"
							/>
							<span>Hủy bỏ</span>
						</button>
						<button type="submit" class="btn-submit" :disabled="isSubmitting">
							<Loader2
								v-if="isSubmitting"
								:size="18"
								class="spinner-icon me-2"
								style="width: 18px; height: 18px; min-width: 18px"
							/>
							<Save
								v-else
								:size="18"
								class="me-2"
								style="width: 18px; height: 18px; min-width: 18px"
							/>
							<span>Khởi tạo Lộ trình & Lưu</span>
						</button>
					</div>
				</div>
			</div>
		</form>
	</div>
</template>

<style scoped>
.add-path-page {
	padding-bottom: var(--space-2xl);
	color: var(--text-primary);
	animation: fadeIn 0.4s ease-out;
	max-width: 1300px;
	margin: 0 auto;
}

.page-header {
	display: flex;
	justify-content: space-between;
	align-items: flex-end;
	margin-bottom: var(--space-xl);
	flex-wrap: wrap;
	gap: var(--space-lg);
}
.header-content {
	display: flex;
	align-items: center;
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
	box-shadow: 0 8px 20px rgba(99, 102, 241, 0.15);
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

.page-title-gradient {
	font-size: 32px;
	font-weight: 800;
	letter-spacing: -0.02em;
	background: linear-gradient(90deg, var(--primary-600), var(--primary-400));
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	margin-bottom: 8px;
	margin-top: 0;
}
.page-desc {
	font-size: var(--font-size-base);
	color: var(--text-secondary);
	max-width: 600px;
	line-height: 1.5;
	margin: 0;
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
.btn-outline {
	background: transparent;
	color: var(--text-secondary);
	border: 1px solid var(--border-color);
}
.btn-outline:hover {
	background: white;
	color: var(--text-primary);
	border-color: var(--text-tertiary);
	transform: translateY(-2px);
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.glass-card {
	background: var(--bg-card);
	backdrop-filter: blur(20px);
	border: 1px solid var(--border-color);
	border-radius: var(--radius-2xl);
	box-shadow: 0 8px 32px rgba(0, 0, 0, 0.03);
	overflow: hidden;
}

.glass-card-banner {
	background: var(--bg-secondary);
	padding: 20px 24px;
	border-bottom: 1px solid var(--border-color);
	display: flex;
	align-items: center;
	gap: 16px;
}

.banner-icon-bg {
	width: 40px;
	height: 40px;
	background: rgba(99, 102, 241, 0.1);
	color: var(--primary-600);
	border-radius: 12px;
	display: flex;
	align-items: center;
	justify-content: center;
}
.banner-icon-bg.info {
	background: rgba(14, 165, 233, 0.1);
	color: var(--info-600);
}
.banner-title {
	margin: 0 0 4px 0;
	font-size: 15px;
	font-weight: 700;
	color: var(--text-primary);
	text-transform: uppercase;
	letter-spacing: 0.05em;
}
.banner-desc {
	margin: 0;
	font-size: 13px;
	color: var(--text-secondary);
	line-height: 1.4;
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
.glass-input-group {
	position: relative;
	display: flex;
	align-items: center;
	background: var(--bg-tertiary);
	border-radius: 12px;
	border: 1px solid var(--border-color);
	transition: all 0.3s;
}
.glass-input-group:focus-within {
	background: var(--bg-card);
	border-color: var(--primary-400);
	box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}

.glass-input-group.textarea-group {
	align-items: flex-start;
}

.input-icon {
	position: absolute;
	left: 16px;
	color: var(--text-tertiary);
	z-index: 2;
	display: flex;
	align-items: center;
	height: 100%;
	transition: color 0.3s;
}
.glass-input-group.textarea-group .input-icon {
	height: auto;
	top: 16px;
}
.glass-input-group:focus-within .input-icon {
	color: var(--primary-500);
}

.glass-input {
	width: 100%;
	padding: 14px 16px 14px 46px;
	background: transparent;
	border: none;
	border-radius: 12px;
	color: var(--text-primary);
	font-size: 14px;
	font-family: inherit;
	line-height: 1.5;
	outline: none;
	z-index: 1;
	resize: none;
}
.glass-input::placeholder {
	color: var(--text-tertiary);
}

.glass-search.inline {
	display: flex;
	align-items: center;
	background: var(--bg-tertiary);
	border: 1px solid var(--border-color);
	border-radius: var(--radius-full);
	padding: 4px 16px;
	width: 250px;
	transition: all 0.3s;
}

.glass-search.inline:focus-within {
	border-color: var(--primary-400);
	box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}

.glass-select-wrapper {
	position: relative;
	min-width: 160px;
}
.glass-select-sm {
	width: 100%;
	background: var(--bg-tertiary);
	border: 1px solid var(--border-color);
	border-radius: var(--radius-full);
	padding: 8px 16px;
	font-size: 13px;
	font-weight: 600;
	color: var(--text-primary);
	outline: none;
	cursor: pointer;
	transition: all 0.3s;
	appearance: none;
	background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
	background-repeat: no-repeat;
	background-position: right 12px center;
}
.glass-select-sm:focus {
	border-color: var(--primary-400);
	box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}
.search-input-premium.sm {
	flex: 1;
	border: none;
	background: transparent;
	padding: 6px 8px;
	font-size: 13px;
	outline: none;
	color: var(--text-primary);
	min-width: 0;
}

.courses-selection-list {
	max-height: 500px;
	overflow-y: auto;
	padding-top: 4px;
	padding-bottom: 4px;
}

.glass-course-select-card {
	display: flex;
	align-items: center;
	gap: 12px;
	padding: 10px;
	background: var(--bg-card);
	border: 1px solid var(--border-color);
	border-radius: 16px;
	cursor: pointer;
	transition: all 0.2s;
	position: relative;
	box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
}

.glass-course-select-card:hover {
	border-color: var(--primary-300);
	transform: translateY(-2px);
	box-shadow: 0 6px 15px rgba(0, 0, 0, 0.05);
}

.glass-course-select-card.selected {
	background: rgba(99, 102, 241, 0.04);
	border-color: var(--primary-500);
	box-shadow: 0 4px 15px rgba(99, 102, 241, 0.1);
}

.card-check-circle {
	position: absolute;
	top: -8px;
	right: -8px;
	width: 24px;
	height: 24px;
	background: var(--bg-card);
	border: 2px solid var(--border-color);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	color: white;
	transition: all 0.2s;
	z-index: 5;
}

.glass-course-select-card.selected .card-check-circle {
	background: var(--primary-500);
	border-color: var(--primary-500);
}

.course-thumb-wrapper {
	width: 50px;
	height: 50px;
	border-radius: 10px;
	overflow: hidden;
	flex-shrink: 0;
	background: var(--bg-tertiary);
}
.course-thumb {
	width: 100%;
	height: 100%;
	object-fit: cover;
}
.course-thumb-placeholder {
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	color: var(--text-tertiary);
}

.course-info {
	flex: 1;
	overflow: hidden;
	display: flex;
	flex-direction: column;
	justify-content: center;
}
.course-title {
	margin: 0 0 6px 0;
	font-size: 13px;
	font-weight: 700;
	color: var(--text-primary);
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
	line-height: 1.3;
}
.badge-glass {
	display: inline-block;
	padding: 2px 6px;
	border-radius: 6px;
	font-size: 10px;
	font-weight: 700;
	background: rgba(0, 0, 0, 0.05);
	color: var(--text-secondary);
	border: 1px solid rgba(0, 0, 0, 0.05);
}

.glass-footer-bar {
	background: var(--bg-secondary);
	backdrop-filter: blur(20px);
	border: 1px solid var(--border-color);
	box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.02);
}

.btn-cancel,
.btn-submit {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	gap: 8px;
	height: 44px;
	padding: 0 24px;
	border-radius: var(--radius-full);
	font-weight: 700;
	font-size: 14px;
	cursor: pointer;
	transition: all 0.3s;
}
.btn-cancel {
	background: transparent;
	color: var(--text-secondary);
	border: 1px solid var(--border-color);
}
.btn-cancel:hover:not(:disabled) {
	background: var(--bg-secondary);
	color: var(--text-primary);
}

.btn-submit {
	background: linear-gradient(
		135deg,
		var(--primary-600) 0%,
		var(--primary-500) 100%
	);
	color: white;
	border: none;
	box-shadow: 0 4px 15px rgba(99, 102, 241, 0.2);
}
.btn-submit:hover:not(:disabled) {
	transform: translateY(-2px);
	box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4);
}
.btn-submit:disabled,
.btn-cancel:disabled {
	opacity: 0.6;
	cursor: not-allowed;
	transform: none;
	box-shadow: none;
}

.spinner-icon {
	animation: spin 1s linear infinite;
}
.lucide,
svg {
	flex-shrink: 0;
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

.custom-scrollbar::-webkit-scrollbar {
	height: 6px;
	width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
	background: transparent;
	border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
	background: rgba(0, 0, 0, 0.15);
	border-radius: 10px;
}

@media (max-width: 1024px) {
	.glass-card-banner {
		flex-direction: column;
		align-items: stretch;
	}
	.glass-search.inline {
		width: 100%;
	}
}
@media (max-width: 768px) {
	.page-header {
		flex-direction: column;
		align-items: stretch;
		text-align: center;
	}
	.header-content {
		flex-direction: column;
	}
	.header-actions {
		display: flex;
		justify-content: center;
		margin-top: 12px;
	}
	.glass-footer-bar {
		flex-direction: column;
		text-align: center;
	}
	.btn-cancel,
	.btn-submit {
		width: 100%;
	}
}

:is([data-bs-theme="dark"], [data-theme="dark"])
	.glass-course-select-card.selected {
	background: rgba(99, 102, 241, 0.2);
}
</style>
