<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { userGroupAPI, groupAPI } from "@/services/api";
import { toast } from "vue3-toastify";
import {
	Building2,
	AlignLeft,
	Info,
	ArrowLeft,
	Save,
	X,
	Loader2,
	BookOpen,
	Check,
} from "lucide-vue-next";

const router = useRouter();

const form = ref({
	name: "",
	description: "",
	selectedCourseGroupIds: [] as number[],
});

const isSubmitting = ref(false);
const isLoadingCourseGroups = ref(false);
const availableCourseGroups = ref<any[]>([]);

const fetchCourseGroups = async () => {
	isLoadingCourseGroups.value = true;
	try {
		const res = await groupAPI.getCourseGroups(1, 100);
		availableCourseGroups.value = res.data.items || res.data;
	} catch {
		toast.error("Không thể tải danh sách Khung đào tạo");
	} finally {
		isLoadingCourseGroups.value = false;
	}
};

onMounted(() => {
	fetchCourseGroups();
});

const toggleCourseGroup = (id: number) => {
	const index = form.value.selectedCourseGroupIds.indexOf(id);
	if (index === -1) {
		form.value.selectedCourseGroupIds.push(id);
	} else {
		form.value.selectedCourseGroupIds.splice(index, 1);
	}
};

const submitForm = async () => {
	if (!form.value.name) {
		toast.error("Vui lòng nhập tên Nhóm/Phòng ban");
		return;
	}

	isSubmitting.value = true;
	try {
		const res = await userGroupAPI.create({
			name: form.value.name,
			description: form.value.description,
		});

		const newDepartmentId = res.data.id;

		if (form.value.selectedCourseGroupIds.length > 0) {
			const assignPromises = form.value.selectedCourseGroupIds.map((cgId) =>
				userGroupAPI.assignCourseGroup(newDepartmentId, cgId),
			);
			await Promise.all(assignPromises);
		}

		toast.success("Đã tạo phòng ban và gán lộ trình thành công!");
		router.push("/admin/departments");
	} catch (error: any) {
		toast.error(error.response?.data?.message || "Có lỗi xảy ra khi tạo nhóm!");
	} finally {
		isSubmitting.value = false;
	}
};

const cancel = () => {
	router.push("/admin/departments");
};
</script>

<template>
	<div class="add-department-page">
		<div class="page-header">
			<div class="header-content">
				<div class="header-icon-box pulse-glow">
					<Building2
						:size="32"
						style="width: 32px; height: 32px; min-width: 32px"
					/>
				</div>
				<div>
					<h1 class="page-title-gradient">Thêm Nhóm/Phòng Ban Mới</h1>
					<p class="page-desc">
						Tạo một bộ phận mới trong công ty để phân bổ lộ trình khóa học.
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

		<div class="glass-card form-container">
			<div class="glass-card-banner">
				<div class="banner-icon-bg">
					<Building2
						:size="20"
						style="width: 20px; height: 20px; min-width: 20px"
					/>
				</div>
				<div class="banner-text">
					<h5 class="banner-title">Cơ cấu tổ chức</h5>
					<p class="banner-desc">
						Thiết lập thông tin định danh cho phòng ban này.
					</p>
				</div>
			</div>

			<div class="glass-card-body">
				<form @submit.prevent="submitForm">
					<div class="form-grid">
						<div class="full-width-col">
							<div class="glass-alert-info">
								<div class="alert-icon">
									<Info
										:size="20"
										style="width: 20px; height: 20px; min-width: 20px"
									/>
								</div>
								<div class="alert-content">
									<strong>Lưu ý:</strong> Khi bạn chọn
									<em>Khung lộ trình đào tạo</em>, toàn bộ nhân sự được thêm vào
									phòng ban này sẽ tự động được ghi danh vào các khóa học thuộc
									lộ trình đó.
								</div>
							</div>
						</div>

						<div class="full-width-col input-wrapper">
							<label class="premium-label">
								Tên Phòng ban/Nhóm <span class="required-star">*</span>
							</label>
							<div class="glass-input-group">
								<span class="input-icon"
									><Building2
										:size="18"
										style="width: 18px; height: 18px; min-width: 18px"
								/></span>
								<input
									type="text"
									class="glass-input"
									placeholder="Ví dụ: Phòng Kỹ thuật (IT), Khối Vận hành..."
									v-model="form.name"
									required
								/>
							</div>
						</div>

						<div class="full-width-col input-wrapper">
							<label class="premium-label">Mô tả (Mục đích bộ phận)</label>
							<div class="glass-input-group textarea-group">
								<span class="input-icon"
									><AlignLeft
										:size="18"
										style="width: 18px; height: 18px; min-width: 18px"
								/></span>
								<textarea
									class="glass-input"
									rows="3"
									placeholder="Ví dụ: Đội ngũ phụ trách bảo trì và phát triển tính năng phần mềm cốt lõi..."
									v-model="form.description"
								></textarea>
							</div>
						</div>

						<div
							class="full-width-col input-wrapper mt-2 border-top-glass pt-4"
						>
							<label class="premium-label d-flex align-items-center gap-2 mb-3">
								<BookOpen :size="16" class="text-primary" />
								Khung lộ trình đào tạo áp dụng tự động
							</label>

							<div
								v-if="isLoadingCourseGroups"
								class="d-flex align-items-center gap-2 text-tertiary fs-14"
							>
								<Loader2 :size="16" class="spinner-icon" /> Đang tải danh sách
								lộ trình...
							</div>

							<div
								v-else-if="availableCourseGroups.length === 0"
								class="text-muted fs-14 italic"
							>
								Chưa có khung lộ trình nào trong hệ thống. Bạn có thể gán sau.
							</div>

							<div v-else class="course-groups-grid">
								<div
									v-for="cg in availableCourseGroups"
									:key="cg.id"
									class="cg-select-card glass-hover"
									:class="{
										selected: form.selectedCourseGroupIds.includes(cg.id),
									}"
									@click="toggleCourseGroup(cg.id)"
								>
									<div class="cg-check-indicator">
										<Check
											v-if="form.selectedCourseGroupIds.includes(cg.id)"
											:size="14"
										/>
									</div>

									<div class="cg-info">
										<h6 class="cg-name">{{ cg.name }}</h6>
										<p class="cg-desc text-truncate" :title="cg.description">
											{{ cg.description || "Chưa có mô tả" }}
										</p>
										<span class="cg-count badge-glass fs-11"
											>{{ cg.courseCount || 0 }} khóa học</span
										>
									</div>
								</div>
							</div>
						</div>

						<div class="full-width-col form-actions-container">
							<div class="action-buttons-wrapper">
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
								<button
									type="submit"
									class="btn-submit"
									:disabled="isSubmitting"
								>
									<Loader2
										v-if="isSubmitting"
										:size="18"
										class="spinner-icon"
										style="width: 18px; height: 18px; min-width: 18px"
									/>
									<Save
										v-else
										:size="18"
										style="width: 18px; height: 18px; min-width: 18px"
									/>
									<span>Tạo Phòng ban</span>
								</button>
							</div>
						</div>
					</div>
				</form>
			</div>
		</div>
	</div>
</template>

<style scoped>
.add-department-page {
	padding-bottom: var(--space-2xl);
	color: var(--text-primary);
	box-sizing: border-box;
	animation: fadeIn 0.4s ease-out;
	max-width: 900px;
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
	background: var(--bg-secondary);
	color: var(--text-primary);
	border-color: var(--text-tertiary);
	transform: translateY(-2px);
}

.glass-card {
	background: var(--bg-card);
	backdrop-filter: blur(20px);
	border: 1px solid var(--border-color);
	border-radius: var(--radius-2xl);
	box-shadow: var(--shadow-sm);
	overflow: hidden;
}


.glass-card-banner {
	background: var(--bg-tertiary);
	padding: 24px 32px;
	display: flex;
	align-items: center;
	gap: 16px;
	border-bottom: 1px solid var(--border-color);
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
.banner-title {
	margin: 0 0 4px 0;
	font-size: 16px;
	font-weight: 700;
	color: var(--text-primary);
}
.banner-desc {
	margin: 0;
	font-size: 14px;
	color: var(--text-secondary);
	line-height: 1.4;
}

.glass-card-body {
	padding: 40px 32px;
}
.form-grid {
	display: grid;
	gap: 24px;
}
.full-width-col {
	grid-column: 1 / -1;
}

.border-top-glass {
	border-top: 1px solid var(--border-color);
}


.glass-alert-info {
	display: flex;
	gap: 16px;
	align-items: flex-start;
	padding: 16px 20px;
	background: rgba(99, 102, 241, 0.05);
	border-radius: 12px;
	border: 1px solid rgba(99, 102, 241, 0.1);
	color: var(--primary-700);
}
.alert-icon {
	flex-shrink: 0;
	margin-top: 2px;
	color: var(--primary-600);
}
.alert-content {
	font-size: 14px;
	line-height: 1.6;
}
.alert-content strong {
	font-weight: 700;
	color: var(--primary-800);
}
.alert-content em {
	font-style: normal;
	font-weight: 600;
	text-decoration: underline;
	text-decoration-color: var(--primary-300);
}

.input-wrapper {
	display: flex;
	flex-direction: column;
	gap: 8px;
}
.premium-label {
	font-weight: 700;
	font-size: 13px;
	text-transform: uppercase;
	letter-spacing: 0.05em;
	color: var(--text-secondary);
}
.required-star {
	color: var(--danger-500);
	margin-left: 2px;
}

.glass-input-group {
	position: relative;
	display: flex;
	align-items: center;
	background: var(--bg-secondary);
	border-radius: 12px;
	border: 1px solid var(--border-color);
	transition: all 0.3s;
}

.glass-input-group:focus-within {
	background: var(--bg-tertiary);
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
	transition: color 0.3s;
	display: flex;
	align-items: center;
	justify-content: center;
	height: 100%;
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
	font-size: 15px;
	font-family: inherit;
	line-height: 1.5;
	outline: none;
	z-index: 1;
	resize: none;
}
.glass-input::placeholder {
	color: var(--text-tertiary);
}

.course-groups-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
	gap: 16px;
}

.cg-select-card {
	display: flex;
	align-items: flex-start;
	gap: 12px;
	padding: 16px;
	background: var(--bg-secondary);
	border: 1px solid var(--border-color);
	border-radius: 14px;
	cursor: pointer;
	transition: all 0.2s;
}


.cg-select-card:hover {
	background: var(--bg-tertiary);
	border-color: rgba(99, 102, 241, 0.3);
	transform: translateY(-2px);
	box-shadow: var(--shadow-sm);
}


.cg-select-card.selected {
	background: rgba(99, 102, 241, 0.05);
	border-color: var(--primary-500);
	box-shadow: 0 0 0 1px var(--primary-500);
}

.cg-check-indicator {
	width: 20px;
	height: 20px;
	border-radius: 6px;
	border: 1px solid rgba(0, 0, 0, 0.2);
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
	transition: all 0.2s;
	color: white;
}

.cg-select-card.selected .cg-check-indicator {
	background: var(--primary-500);
	border-color: var(--primary-500);
}

.cg-info {
	flex: 1;
	overflow: hidden;
}
.cg-name {
	margin: 0 0 4px 0;
	font-size: 14px;
	font-weight: 700;
	color: var(--text-primary);
}
.cg-desc {
	margin: 0 0 8px 0;
	font-size: 12px;
	color: var(--text-tertiary);
}
.badge-glass {
	display: inline-block;
	padding: 2px 8px;
	border-radius: 6px;
	font-weight: 700;
	background: var(--bg-secondary);
	color: var(--text-secondary);
	border: 1px solid var(--border-color);
}


.form-actions-container {
	padding-top: 32px;
	margin-top: 8px;
	border-top: 1px solid var(--border-color);
	display: flex;
	justify-content: flex-end;
}

.action-buttons-wrapper {
	display: flex;
	gap: 16px;
}

.btn-cancel,
.btn-submit {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	gap: 8px;
	height: 48px;
	padding: 0 28px;
	border-radius: var(--radius-full);
	font-weight: 700;
	font-size: 15px;
	cursor: pointer;
	transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
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

.lucide,
svg {
	flex-shrink: 0;
}
.spinner-icon {
	animation: spin 1s linear infinite;
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
	.glass-card-banner,
	.glass-card-body {
		padding: 20px;
	}
	.course-groups-grid {
		grid-template-columns: 1fr;
	}
	.action-buttons-wrapper {
		flex-direction: column-reverse;
		width: 100%;
	}
	.btn-cancel,
	.btn-submit {
		width: 100%;
	}
}
</style>
