<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
// @ts-ignore
import { userAPI } from "@/services/api";
import {
	ArrowLeft,
	UserPlus,
	IdCard,
	Mail,
	Lock,
	Eye,
	EyeOff,
	Camera,
	Shield,
	Save,
	Loader2,
	CheckCircle2,
	UserCheck,
	ChevronRight,
	Pencil,
	AlertCircle,
	Users,
	Layout,
} from "lucide-vue-next";
import { toast } from "vue3-toastify";
import { userGroupAPI } from "@/services/api";

const router = useRouter();
const route = useRoute();
const userId = route.params.id as string;

const loading = ref(true);
const submitting = ref(false);
const showPassword = ref(false);
const showConfirmPassword = ref(false);

const userForm = ref({
	fullName: "",
	email: "",
	password: "",
	confirmPassword: "",
	role: "Employee",
	groupId: null as number | null,
	avatarFile: null as File | null,
	avatarPreview: "",
	isActive: true,
});

const departments = ref<any[]>([]);

const defaultAvatar =
	"https://ui-avatars.com/api/?background=random&color=fff&name=";

const fetchUserData = async () => {
	loading.value = true;
	try {
		const res = await userAPI.getById(userId);
		const data = res.data;
		userForm.value.fullName = data.fullName;
		userForm.value.email = data.email;
		userForm.value.role = data.role;
		userForm.value.isActive = data.isActive;
		userForm.value.groupId = data.groupId || null;

		if (data.avatar) {
			userForm.value.avatarPreview = data.avatar.startsWith("http")
				? data.avatar
				: `${import.meta.env.VITE_API_URL || "http://localhost:5100"}${data.avatar}`;
		}
	} catch (error) {
		toast.error("Không thể tải dữ liệu nhân sự");
		router.push("/admin/staff");
	} finally {
		loading.value = false;
	}
};

onMounted(async () => {
	fetchUserData();
	try {
		const res = await userGroupAPI.getAll();
		departments.value = res.data.items || res.data;
	} catch (error) {
		console.error("Lỗi tải phòng ban", error);
	}
});

const handleAvatarChange = (event: Event) => {
	const target = event.target as HTMLInputElement;
	if (target.files && target.files.length > 0) {
		const file = target.files[0];
		if (file.size > 2 * 1024 * 1024) {
			toast.error("Ảnh không được vượt quá 2MB");
			return;
		}
		userForm.value.avatarFile = file;

		const reader = new FileReader();
		reader.onload = (e) =>
			(userForm.value.avatarPreview = e.target?.result as string);
		reader.readAsDataURL(file);
	}
};

const triggerFileInput = () =>
	document.getElementById("hiddenAvatarEditInput")?.click();

const submitForm = async () => {
	if (userForm.value.password || userForm.value.confirmPassword) {
		if (userForm.value.password !== userForm.value.confirmPassword) {
			toast.error("Mật khẩu xác nhận không khớp!");
			return;
		}
	}

	submitting.value = true;
	try {
		let payload: any;
		if (userForm.value.avatarFile) {
			payload = new FormData();
			payload.append("FullName", userForm.value.fullName);
			payload.append("Email", userForm.value.email);
			if (userForm.value.password)
				payload.append("Password", userForm.value.password);
			payload.append("Role", userForm.value.role);
			payload.append("IsActive", String(userForm.value.isActive));
			if (userForm.value.groupId) {
				payload.append("GroupId", String(userForm.value.groupId));
			} else {
				payload.append("GroupId", "");
			}
			payload.append("AvatarFile", userForm.value.avatarFile);
		} else {
			payload = {
				fullName: userForm.value.fullName,
				email: userForm.value.email,
				role: userForm.value.role,
				isActive: userForm.value.isActive,
				groupId: userForm.value.groupId,
			};
			if (userForm.value.password) payload.password = userForm.value.password;
		}

		await userAPI.update(userId, payload);
		toast.success("Đã cập nhật dữ liệu thành công");
		router.push("/admin/staff");
	} catch (error: any) {
		toast.error(error.response?.data?.message || "Lỗi cập nhật dữ liệu");
	} finally {
		submitting.value = false;
	}
};
</script>

<template>
	<div class="staff-edit-page">
		<!-- Premium Header -->
		<div class="page-header mb-4">
			<div class="header-content">
				<div class="header-icon-box pulse-glow">
					<Pencil
						:size="32"
						style="width: 32px; height: 32px; min-width: 32px"
					/>
				</div>
				<div>
					<div class="d-flex align-items-center gap-2 mb-1">
						<span class="badge-glass primary fs-10 fw-bold"
							>ID: #{{ userId }}</span
						>
						<span class="fs-12 text-tertiary d-flex align-items-center"
							><ChevronRight :size="12" class="mx-1" /> Chỉnh sửa hồ sơ</span
						>
					</div>
					<h1 class="page-title-gradient">Chỉnh Sửa Nhân Sự</h1>
					<p class="page-desc">
						Cập nhật thông tin định danh, bảo mật và quyền hạn tài khoản.
					</p>
				</div>
			</div>

			<div class="header-actions">
				<button @click="router.push('/admin/staff')" class="btn-glass-back">
					<ArrowLeft
						:size="18"
						style="width: 18px; height: 18px"
						class="me-2"
					/>
					Quay lại
				</button>
			</div>
		</div>

		<!-- MAIN LOADING -->
		<div v-if="loading" class="loading-state py-5 text-center mt-5">
			<div class="spinner"></div>
			<p class="mt-3 text-muted fw-semi-bold">Đang tải dữ liệu nhân sự...</p>
		</div>

		<!-- MAIN FORM -->
		<form v-else @submit.prevent="submitForm" class="fade-in">
			<div class="row g-4">
				<!-- Left Column: Primary Info -->
				<div class="col-lg-7">
					<div class="glass-content-card h-100">
						<div class="glass-card-header">
							<div class="d-flex align-items-center gap-3">
								<div class="header-dot primary"></div>
								<h5 class="fw-bold mb-0">Thông tin cơ bản & Bảo mật</h5>
							</div>
						</div>

						<div class="glass-card-body pt-0">
							<!-- Full Name -->
							<div class="form-group-premium mb-4">
								<label class="label-premium"
									>Họ và tên <span class="text-danger">*</span></label
								>
								<div class="input-glass-wrap">
									<input
										v-model="userForm.fullName"
										type="text"
										class="input-glass-ui"
										placeholder="Nhập họ và tên đầy đủ..."
										required
									/>
									<div class="input-focus-glow"></div>
								</div>
							</div>

							<!-- Email -->
							<div class="form-group-premium mb-4">
								<label class="label-premium"
									>Email đăng nhập <span class="text-danger">*</span></label
								>
								<div class="input-glass-wrap with-icon">
									<Mail
										:size="18"
										class="input-icon"
										style="width: 18px; height: 18px"
									/>
									<input
										v-model="userForm.email"
										type="email"
										class="input-glass-ui"
										placeholder="example@email.com"
										required
									/>
									<div class="input-focus-glow"></div>
								</div>
							</div>

							<!-- Password Section -->
							<div class="password-change-box mt-5 p-4 rounded-4">
								<div class="d-flex align-items-center gap-2 mb-3 text-danger">
									<Lock :size="16" style="width: 16px; height: 16px" />
									<h6 class="fw-bold mb-0 text-uppercase fs-12 tracking-wider">
										Đổi mật khẩu (Tùy chọn)
									</h6>
								</div>
								<p class="fs-12 text-tertiary mb-4">
									Chỉ nhập nếu bạn muốn thay đổi mật khẩu đăng nhập cho nhân sự
									này.
								</p>

								<div class="row g-3">
									<div class="col-md-6">
										<label class="label-premium sm">Mật khẩu mới</label>
										<div class="input-glass-wrap with-action">
											<input
												v-model="userForm.password"
												:type="showPassword ? 'text' : 'password'"
												class="input-glass-ui sm"
												placeholder="Mật khẩu mới"
											/>
											<button
												type="button"
												class="input-action-btn"
												@click="showPassword = !showPassword"
												tabindex="-1"
											>
												<component
													:is="showPassword ? EyeOff : Eye"
													:size="18"
													style="width: 18px; height: 18px"
												/>
											</button>
											<div class="input-focus-glow"></div>
										</div>
									</div>
									<div class="col-md-6">
										<label class="label-premium sm">Xác nhận mật khẩu</label>
										<div class="input-glass-wrap with-action">
											<input
												v-model="userForm.confirmPassword"
												:type="showConfirmPassword ? 'text' : 'password'"
												class="input-glass-ui sm"
												placeholder="Xác nhận lại"
											/>
											<button
												type="button"
												class="input-action-btn"
												@click="showConfirmPassword = !showConfirmPassword"
												tabindex="-1"
											>
												<component
													:is="showConfirmPassword ? EyeOff : Eye"
													:size="18"
													style="width: 18px; height: 18px"
												/>
											</button>
											<div class="input-focus-glow"></div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Right Column: Avatar & Permissions -->
				<div class="col-lg-5">
					<div class="glass-content-card h-100">
						<div class="glass-card-header">
							<div class="d-flex align-items-center gap-3">
								<div class="header-dot warning"></div>
								<h5 class="fw-bold mb-0">Hồ sơ & Phân Quyền</h5>
							</div>
						</div>

						<div class="glass-card-body pt-0">
							<!-- Avatar Uploader -->
							<div class="avatar-premium-uploader mb-5">
								<div class="uploader-circle" @click="triggerFileInput">
									<img
										v-if="userForm.avatarPreview"
										:src="userForm.avatarPreview"
										class="preview-img"
									/>
									<div v-else class="placeholder-content">
										<Camera :size="32" class="mb-2 text-tertiary" />
										<span class="fs-11 fw-bold text-tertiary">TẢI ẢNH</span>
									</div>
									<div class="edit-overlay">
										<Pencil :size="20" color="white" />
									</div>
								</div>
								<div class="uploader-info mt-3">
									<h6 class="fw-bold mb-1 fs-14">Ảnh đại diện nhân sự</h6>
									<p class="fs-11 text-tertiary">
										PNG, JPG tối đa 2MB. Tỉ lệ 1:1 là tốt nhất.
									</p>
									<input
										type="file"
										id="hiddenAvatarEditInput"
										class="d-none"
										accept="image/*"
										@change="handleAvatarChange"
									/>
								</div>
							</div>

							<!-- Department Selection -->
							<div class="form-group-premium mb-4">
								<label class="label-premium">Phòng ban / Bộ phận</label>
								<div class="input-glass-wrap with-icon">
									<Layout
										:size="18"
										class="input-icon"
										style="width: 18px; height: 18px"
									/>
									<select v-model="userForm.groupId" class="input-glass-ui">
										<option :value="null">-- Không thuộc bộ phận nào --</option>
										<option
											v-for="dept in departments"
											:key="dept.id"
											:value="dept.id"
										>
											{{ dept.name }}
										</option>
									</select>
									<div class="input-focus-glow"></div>
								</div>
								<p class="fs-11 text-tertiary mt-2">
									Chuyển đổi phòng ban sẽ áp dụng lộ trình học tập mới của phòng đó.
								</p>
							</div>

							<!-- Status Box (Moved up since Role is removed) -->
							<div
								class="premium-status-box mt-auto"
								:class="userForm.isActive ? 'active' : 'inactive'"
							>
								<div class="status-content">
									<div class="d-flex align-items-center gap-2 mb-1">
										<div class="status-dot"></div>
										<h6 class="fw-bold mb-0 fs-13">
											{{
												userForm.isActive
													? "Tài khoản hoạt động"
													: "Tài khoản bị khóa"
											}}
										</h6>
									</div>
									<p class="fs-11 mb-0 opacity-75">
										{{
											userForm.isActive
												? "Nhân sự có quyền truy cập hệ thống."
												: "Nhân sự không thể đăng nhập."
										}}
									</p>
								</div>
								<label class="glass-switch">
									<input type="checkbox" v-model="userForm.isActive" />
									<span class="switch-slider"></span>
								</label>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Footer Actions -->
			<div
				class="form-footer-actions mt-5 pt-4 d-flex justify-content-end gap-3 border-top"
			>
				<button
					type="button"
					@click="router.push('/admin/staff')"
					class="btn-glass-secondary"
				>
					Hủy thay đổi
				</button>
				<button
					type="submit"
					class="btn-submit decoration-none"
					:disabled="submitting || loading"
				>
					<Loader2 v-if="submitting" :size="18" class="me-2 spinner" />
					<Save
						v-else
						:size="18"
						class="me-2"
						style="width: 18px; height: 18px"
					/>
					<span>Lưu tất cả thay đổi</span>
				</button>
			</div>
		</form>
	</div>
</template>

<style scoped>
/* ===== Core Typography & Animations ===== */
.staff-edit-page {
	padding-bottom: var(--space-2xl);
	color: var(--text-primary);
	animation: fadeIn 0.4s ease-out;
	margin: 0 auto;
	max-width: 1100px;
}
.fade-in {
	animation: fadeIn 0.3s ease-in-out;
}
.tracking-wider {
	letter-spacing: 0.1em;
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
@keyframes spin {
	100% {
		transform: rotate(360deg);
	}
}

/* ===== Premium Header ===== */
.page-header {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	padding-bottom: 24px;
	flex-wrap: wrap;
	gap: var(--space-lg);
	border-bottom: 1px solid rgba(0, 0, 0, 0.05);
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
	font-size: var(--font-size-base);
	color: var(--text-secondary);
	max-width: 500px;
	line-height: 1.5;
	margin: 0;
}

.btn-glass-back {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	height: 42px;
	padding: 0 20px;
	background: rgba(255, 255, 255, 0.8);
	backdrop-filter: blur(8px);
	color: var(--text-secondary);
	border: 1px solid rgba(0, 0, 0, 0.1);
	border-radius: 14px;
	font-weight: 700;
	font-size: 13px;
	cursor: pointer;
	transition: all 0.3s;
}
.btn-glass-back:hover {
	background: white;
	color: var(--primary-600);
	border-color: var(--primary-200);
	transform: translateX(-4px);
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

/* ===== Glass Content Card ===== */
.glass-content-card {
	background: rgba(255, 255, 255, 0.9);
	backdrop-filter: blur(20px);
	border: 1px solid rgba(0, 0, 0, 0.05);
	border-radius: 28px;
	box-shadow: 0 8px 32px rgba(0, 0, 0, 0.03);
	overflow: hidden;
	display: flex;
	flex-direction: column;
}
.glass-card-header {
	padding: 28px 32px;
}
.header-dot {
	width: 8px;
	height: 8px;
	border-radius: 50%;
}
.header-dot.primary {
	background: var(--primary-500);
	box-shadow: 0 0 10px var(--primary-300);
}
.header-dot.warning {
	background: var(--warning-500);
	box-shadow: 0 0 10px var(--warning-300);
}
.glass-card-body {
	padding: 0 32px 32px 32px;
	flex-grow: 1;
	display: flex;
	flex-direction: column;
}

/* ===== Form Premium Elements ===== */
.label-premium {
	display: block;
	font-weight: 700;
	font-size: 11px;
	text-transform: uppercase;
	letter-spacing: 0.1em;
	color: var(--text-tertiary);
	margin-bottom: 10px;
}
.label-premium.sm {
	font-size: 10px;
}

.input-glass-wrap {
	position: relative;
	width: 100%;
}
.input-glass-ui {
	width: 100%;
	padding: 12px 18px;
	background: rgba(249, 250, 251, 0.7);
	border: 1px solid rgba(0, 0, 0, 0.06);
	border-radius: 16px;
	font-size: 15px;
	color: var(--text-primary);
	transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
	outline: none;
}
.input-glass-ui.sm {
	padding: 10px 16px;
	font-size: 14px;
	border-radius: 12px;
}
.input-glass-ui:focus {
	background: white;
	border-color: var(--primary-300);
}

.input-focus-glow {
	position: absolute;
	inset: -2px;
	border-radius: 18px;
	border: 2px solid var(--primary-400);
	opacity: 0;
	transform: scale(0.98);
	transition: all 0.3s ease;
	pointer-events: none;
}
.input-glass-ui:focus + .input-focus-glow {
	opacity: 1;
	transform: scale(1);
	box-shadow: 0 0 0 6px rgba(99, 102, 241, 0.08);
}

.input-glass-wrap.with-icon .input-icon {
	position: absolute;
	left: 16px;
	top: 50%;
	transform: translateY(-50%);
	color: var(--text-tertiary);
	transition: color 0.3s;
	z-index: 2;
}
.input-glass-wrap.with-icon .input-glass-ui {
	padding-left: 46px;
}
.input-glass-wrap:focus-within .input-icon {
	color: var(--primary-500);
}

.input-glass-wrap.with-action .input-action-btn {
	position: absolute;
	right: 10px;
	top: 50%;
	transform: translateY(-50%);
	width: 34px;
	height: 34px;
	border: none;
	background: transparent;
	color: var(--text-tertiary);
	border-radius: 10px;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 2;
	transition: all 0.2s;
}
.input-glass-wrap.with-action .input-action-btn:hover {
	background: rgba(0, 0, 0, 0.05);
	color: var(--text-primary);
}
.input-glass-wrap.with-action .input-glass-ui {
	padding-right: 46px;
}

/* Password Box */
.password-change-box {
	background: rgba(239, 68, 68, 0.03);
	border: 1px solid rgba(239, 68, 68, 0.1);
}

/* ===== Avatar Premium Uploader ===== */
.avatar-premium-uploader {
	display: flex;
	align-items: center;
	gap: 24px;
	padding: 20px;
	background: rgba(249, 250, 251, 0.5);
	border: 1px dashed rgba(0, 0, 0, 0.1);
	border-radius: 20px;
}
.uploader-circle {
	position: relative;
	width: 90px;
	height: 90px;
	border-radius: 50%;
	background: white;
	border: 3px solid white;
	box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
	cursor: pointer;
	overflow: hidden;
	flex-shrink: 0;
}
.preview-img {
	width: 100%;
	height: 100%;
	object-fit: cover;
}
.placeholder-content {
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	background: #fbfcfe;
}
.edit-overlay {
	position: absolute;
	inset: 0;
	background: rgba(0, 0, 0, 0.3);
	display: flex;
	align-items: center;
	justify-content: center;
	opacity: 0;
	transition: opacity 0.3s;
}
.uploader-circle:hover .edit-overlay {
	opacity: 1;
}

/* ===== Role Selection Grid ===== */
.role-selection-grid {
	display: flex;
	flex-direction: column;
	gap: 10px;
}
.role-radio-card {
	display: flex;
	align-items: center;
	gap: 14px;
	padding: 14px 20px;
	background: white;
	border: 1px solid rgba(0, 0, 0, 0.06);
	border-radius: 16px;
	cursor: pointer;
	transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.role-radio-card:hover {
	transform: translateX(5px);
	border-color: rgba(0, 0, 0, 0.1);
	background: rgba(249, 250, 251, 0.5);
}
.role-icon {
	color: var(--text-tertiary);
	transition: all 0.3s;
	flex-shrink: 0;
}
.role-label {
	font-size: 14px;
	font-weight: 700;
	color: var(--text-secondary);
	transition: all 0.3s;
}

.role-radio-card.active {
	border-color: currentColor;
	background: rgba(currentColor, 0.05);
	box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}
.role-radio-card.active.danger {
	color: var(--danger-600);
	border-color: var(--danger-300);
	background: rgba(239, 68, 68, 0.05);
}
.role-radio-card.active.info {
	color: var(--info-600);
	border-color: var(--info-300);
	background: rgba(14, 165, 233, 0.05);
}
.role-radio-card.active.primary {
	color: var(--primary-600);
	border-color: var(--primary-300);
	background: rgba(99, 102, 241, 0.05);
}

.role-radio-card.active .role-icon,
.role-radio-card.active .role-label {
	color: inherit;
}

/* ===== Premium Status Box ===== */
.premium-status-box {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 20px;
	border-radius: 20px;
	transition: all 0.4s;
}
.premium-status-box.active {
	background: rgba(16, 185, 129, 0.08);
	border: 1px solid rgba(16, 185, 129, 0.15);
	color: var(--success-700);
}
.premium-status-box.inactive {
	background: rgba(0, 0, 0, 0.03);
	border: 1px solid rgba(0, 0, 0, 0.05);
	color: var(--text-secondary);
}

.status-dot {
	width: 8px;
	height: 8px;
	border-radius: 50%;
	background: currentColor;
}
.premium-status-box.active .status-dot {
	box-shadow: 0 0 10px var(--success-500);
}

/* Glass Switch */
.glass-switch {
	position: relative;
	width: 48px;
	height: 26px;
	flex-shrink: 0;
}
.glass-switch input {
	opacity: 0;
	width: 0;
	height: 0;
}
.switch-slider {
	position: absolute;
	cursor: pointer;
	inset: 0;
	background: #cbd5e1;
	transition: 0.4s;
	border-radius: 34px;
}
.switch-slider:before {
	position: absolute;
	content: "";
	height: 20px;
	width: 20px;
	left: 3px;
	bottom: 3px;
	background: white;
	transition: 0.4s;
	border-radius: 50%;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
input:checked + .switch-slider {
	background: var(--success-500);
}
input:checked + .switch-slider:before {
	transform: translateX(22px);
}

/* ===== Footer Actions & Loading ===== */
.btn-glass-secondary {
	height: 48px;
	padding: 0 24px;
	background: transparent;
	border: 1px solid rgba(0, 0, 0, 0.1);
	color: var(--text-secondary);
	border-radius: var(--radius-full);
	font-weight: 700;
	font-size: 14px;
	cursor: pointer;
	transition: all 0.2s;
}
.btn-glass-secondary:hover {
	background: rgba(0, 0, 0, 0.03);
	color: var(--text-primary);
}

.btn-submit {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	height: 48px;
	padding: 0 32px;
	background: linear-gradient(
		135deg,
		var(--success-600) 0%,
		var(--success-500) 100%
	);
	color: white;
	border: none;
	border-radius: var(--radius-full);
	font-weight: 700;
	font-size: 15px;
	cursor: pointer;
	transition: all 0.3s;
	box-shadow: 0 4px 15px rgba(16, 185, 129, 0.25);
}
.btn-submit:hover:not(:disabled) {
	transform: translateY(-2px);
	box-shadow: 0 8px 25px rgba(16, 185, 129, 0.35);
	color: white;
}
.btn-submit:disabled {
	opacity: 0.6;
	cursor: not-allowed;
}

.spinner {
	width: 40px;
	height: 40px;
	border: 4px solid rgba(99, 102, 241, 0.1);
	border-top-color: var(--primary-600);
	border-radius: 50%;
	animation: spin 1s linear infinite;
	margin: 0 auto;
}

/* Responsive */
@media (max-width: 991px) {
	.page-header {
		text-align: center;
		justify-content: center;
		padding: 20px;
	}
	.header-content {
		flex-direction: column;
		align-items: center;
	}
	.header-actions {
		width: 100%;
		display: flex;
		justify-content: center;
	}
	.btn-glass-back {
		transform: none !important;
	}
}
@media (max-width: 768px) {
	.glass-card-body {
		padding: 0 20px 24px 20px;
	}
	.form-footer-actions {
		flex-direction: column;
	}
	.btn-submit,
	.btn-glass-secondary {
		width: 100%;
	}
}
</style>
