<template>
	<div class="profile-page-modern container-fluid px-4 py-4">
		<div class="row mb-5">
			<div class="col-12 text-start">
				<h1 class="fw-extra-bold text-dark-blue mb-1">Hồ Sơ Cá Nhân</h1>
				<p class="text-muted fs-15 opacity-75">
					Quản lý định danh và bảo mật tài khoản của bạn
				</p>
			</div>
		</div>

		<div class="row g-4 justify-content-center">
			<div class="col-xl-4 col-lg-5 order-2 order-lg-1">
				<div class="sticky-sidebar">
					<div class="card border-0 shadow-lg rounded-4 overflow-hidden mb-4">
						<div class="card-body p-5 text-center">
							<div class="avatar-box-wrap mx-auto shadow-sm">
								<img
									v-if="avatarUrl && !imageLoadError"
									:src="avatarUrl"
									class="avatar-img-primary"
									@error="handleImageError"
								/>
								<div v-else class="avatar-initials-primary">
									{{ initials }}
								</div>
								<label
									for="avatar-uploader"
									class="avatar-camera-trigger"
									title="Đổi ảnh đại diện"
								>
									<Camera :size="16" />
									<input
										id="avatar-uploader"
										type="file"
										hidden
										accept="image/*"
										@change="handleAvatarChange"
									/>
								</label>
								<span class="active-pulse"></span>
							</div>

							<h3 class="fw-bold mt-4 mb-1">
								{{ user?.fullName || user?.userName }}
							</h3>
							<div class="role-badge-standard mb-3">{{ roleLabel }}</div>

							<div class="member-info-badge">
								<Calendar :size="14" class="text-primary" />
								<span>Dành cho thành viên từ {{ createdAtFormatted }}</span>
							</div>
						</div>

						<div class="card-footer bg-light-soft border-0 p-4">
							<h6
								class="text-uppercase fs-11 fw-black text-muted tracking-wide mb-3 text-center"
							>
								Kết quả học tập
							</h6>
							<div class="row g-3">
								<div class="col-6">
									<div class="metric-block-v2 purple">
										<BookOpen :size="16" class="ic" />
										<div class="val">{{ statsData.learning }}</div>
										<div class="lab">Đang học</div>
									</div>
								</div>
								<div class="col-6">
									<div class="metric-block-v2 success">
										<CheckCircle2 :size="16" class="ic" />
										<div class="val">{{ statsData.completed }}</div>
										<div class="lab">Đã xong</div>
									</div>
								</div>
								<div class="col-12">
									<div class="metric-block-v2 amber">
										<Award :size="16" class="ic" />
										<div class="val">{{ statsData.certs }}</div>
										<div class="lab">Chứng chỉ được cấp</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div class="col-xl-8 col-lg-7 order-1 order-lg-2">
				<div class="card border-0 shadow-lg rounded-4 overflow-hidden mb-4">
					<div
						class="card-header border-0 bg-white px-4 py-4 d-flex align-items-center gap-2"
					>
						<div class="icon-header-wrap bg-primary-soft text-primary">
							<Settings2 :size="18" />
						</div>
						<h5 class="fw-bold mb-0">Thiết lập tài khoản & Tổ chức</h5>
					</div>

					<div class="card-body px-4 px-md-5 pb-5">
						<div v-if="profileMsg" class="mb-4 animate-fade-in">
							<div
								class="alert alert-soft-v2"
								:class="profileError ? 'alert-danger-v2' : 'alert-success-v2'"
							>
								<component
									:is="profileError ? AlertCircle : CheckCircle2"
									:size="18"
								/>
								<span>{{ profileMsg }}</span>
							</div>
						</div>

						<div class="form-section mb-5">
							<div class="section-title-wrap mb-4">
								<User :size="16" class="text-primary" />
								<h6 class="mb-0 text-uppercase tracking-wider fw-800 fs-11">
									Thông tin cá nhân
								</h6>
							</div>

							<div class="row g-4">
								<div class="col-md-6">
									<div class="form-group-modern">
										<label>Họ và tên</label>
										<div class="input-container">
											<User :size="18" class="in-icon" />
											<input
												v-model="profileForm.fullName"
												type="text"
												placeholder="Nhập tên của bạn"
											/>
										</div>
									</div>
								</div>
								<div class="col-md-6">
									<div class="form-group-modern">
										<label>Số điện thoại</label>
										<div class="input-container">
											<Phone :size="18" class="in-icon" />
											<input
												v-model="profileForm.phone"
												type="text"
												placeholder="Số điện thoại liên lạc"
											/>
										</div>
									</div>
								</div>
							</div>
						</div>

						<div class="form-section mb-5 pt-4 border-top">
							<div class="section-title-wrap mb-4">
								<Building2 :size="16" class="text-info" />
								<h6 class="mb-0 text-uppercase tracking-wider fw-800 fs-11">
									Thông tin tổ chức
								</h6>
							</div>
							<div class="row g-4">
								<div class="col-md-6">
									<div class="form-group-modern readonly">
										<label>Email định danh</label>
										<div class="input-container">
											<Mail :size="18" class="in-icon" />
											<input :value="user?.email" type="text" readonly />
										</div>
									</div>
								</div>
								<div class="col-md-6">
									<div class="form-group-modern readonly">
										<label>Vai trò hệ thống</label>
										<div class="input-container">
											<Shield :size="18" class="in-icon" />
											<input :value="user?.role" type="text" readonly />
										</div>
									</div>
								</div>
								<div class="col-md-6">
									<div class="form-group-modern readonly">
										<label>Phòng ban</label>
										<div class="input-container">
											<Building2 :size="18" class="in-icon" />
											<input
												:value="profileForm.department || 'Văn phòng'"
												type="text"
												readonly
											/>
										</div>
									</div>
								</div>
								<div class="col-md-6">
									<div class="form-group-modern readonly">
										<label>Chức danh</label>
										<div class="input-container">
											<Briefcase :size="18" class="in-icon" />
											<input
												:value="profileForm.position"
												type="text"
												readonly
											/>
										</div>
									</div>
								</div>
							</div>
							<div class="mt-3 fs-12 text-muted fst-italic">
								<Info :size="14" class="me-1" /> Thông tin tổ chức được đồng bộ
								từ Quản trị nhân sự.
							</div>
						</div>

						<div class="form-section pt-4 border-top">
							<div class="section-title-wrap mb-4">
								<Lock :size="16" class="text-danger" />
								<h6 class="mb-0 text-uppercase tracking-wider fw-800 fs-11">
									Thay đổi bảo mật
								</h6>
							</div>
							<div class="row g-3">
								<div class="col-12">
									<div class="form-group-modern">
										<label>Mật khẩu hiện tại</label>
										<div class="input-container">
											<Lock :size="18" class="in-icon" />
											<input
												v-model="pwd.current"
												type="password"
												placeholder="••••••••"
											/>
										</div>
									</div>
								</div>
								<div class="col-md-6">
									<div class="form-group-modern">
										<label>Mật khẩu mới</label>
										<div class="input-container">
											<LockOpen :size="18" class="in-icon" />
											<input
												v-model="pwd.next"
												type="password"
												placeholder="Mật khẩu cực mạnh"
											/>
										</div>
									</div>
								</div>
								<div class="col-md-6">
									<div class="form-group-modern">
										<label>Nhập lại mật khẩu</label>
										<div class="input-container">
											<LockOpen :size="18" class="in-icon" />
											<input
												v-model="pwd.confirm"
												type="password"
												placeholder="Xác nhận mã bảo mật"
											/>
										</div>
									</div>
								</div>
							</div>

							<div
								class="mt-5 d-flex flex-wrap align-items-center justify-content-between gap-3"
							>
								<div
									v-if="pwdMsg"
									class="status-alert"
									:class="{ err: pwdError }"
								>
									<component
										:is="pwdError ? AlertCircle : CheckCircle2"
										:size="14"
									/>
									<span>{{ pwdMsg }}</span>
								</div>
								<div class="spacer v-if='!pwdMsg' flex-grow-1"></div>
								<div class="d-flex gap-2">
									<button
										class="btn-outline-custom"
										@click="changePwd"
										:disabled="changing || !isPwdFormFilled"
									>
										<Loader2 v-if="changing" :size="16" class="spin" />
										<KeyRound v-else :size="16" />
										Cập nhật mật khẩu
									</button>
									<button
										class="btn-solid-primary"
										@click="updateProfile"
										:disabled="savingProfile"
									>
										<Loader2 v-if="savingProfile" :size="16" class="spin" />
										<Save v-else :size="16" />
										Lưu thay đổi hồ sơ
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import { progressAPI, certificateAPI, profileAPI } from "@/services/api";
import {
	User,
	Shield,
	Mail,
	CheckCircle2,
	Lock,
	LockOpen,
	Save,
	Loader2,
	Phone,
	Camera,
	Building2,
	Briefcase,
	Calendar,
	BookOpen,
	Award,
} from "lucide-vue-next";

const authStore = useAuthStore();
const user = computed(() => authStore.user);

const initials = computed(() => {
	const name = user.value?.fullName || user.value?.userName || "?";
	return name
		.split(" ")
		.map((w) => w[0])
		.join("")
		.substring(0, 2)
		.toUpperCase();
});

const imageLoadError = ref(false);

const avatarUrl = computed(() => {
	if (!user.value?.avatar) return null;
	const url = user.value.avatar;
	const apiBase = import.meta.env.VITE_API_URL || "";

	// If starting with http, use as is
	if (url.startsWith("http")) return `${url}?t=${authStore.avatarUpdateTime}`;

	// Normalize basePath: ensure it doesn't end with slash if url starts with one
	let base = apiBase;
	if (base.endsWith("/") && url.startsWith("/")) {
		base = base.slice(0, -1);
	} else if (!base.endsWith("/") && !url.startsWith("/") && base) {
		base += "/";
	}

	return `${base}${url}?t=${authStore.avatarUpdateTime}`;
});

function handleImageError() {
	imageLoadError.value = true;
}

const roleLabel = computed(
	() =>
		({
			Admin: "Quản trị viên Hệ thống",
			Instructor: "Giảng viên Nội bộ",
			Employee: "Nhân viên chính thức",
		})[user.value?.role] || user.value?.role,
);

const statsData = ref({
	learning: 0,
	completed: 0,
	certs: 0,
});

const createdAtFormatted = ref("N/A");

const pwd = ref({ current: "", next: "", confirm: "" });
const changing = ref(false);
const pwdMsg = ref("");
const pwdError = ref(false);

const isPwdFormFilled = computed(() => {
	return pwd.value.current.trim() !== "" && pwd.value.next.trim() !== "";
});

const profileForm = ref({
	fullName: "",
	email: "",
	phone: "",
	address: "",
	bio: "",
	avatar: "",
	department: "",
	position: "",
});

const savingProfile = ref(false);
const profileMsg = ref("");
const profileError = ref(false);
const uploadingAvatar = ref(false);

async function handleAvatarChange(e) {
	const file = e.target.files[0];
	if (!file) return;

	// Reset messages
	profileMsg.value = "Đang tải ảnh đại diện lên...";
	profileError.value = false;
	uploadingAvatar.value = true;

	const formData = new FormData();
	formData.append("file", file);

	try {
		const { data } = await profileAPI.uploadAvatar(formData);
		// Update store with full user data spread to prevent data loss
		authStore.updateProfileData({
			...user.value,
			avatar: data.avatar,
		});
		profileForm.value.avatar = data.avatar;
		imageLoadError.value = false;
		authStore.triggerAvatarRefresh();

		profileMsg.value = "Cập nhật ảnh đại diện thành công!";
		setTimeout(() => (profileMsg.value = ""), 4000);
	} catch (error) {
		profileMsg.value =
			error.response?.data?.message || "Lỗi khi tải ảnh lên. Vui lòng thử lại.";
		profileError.value = true;
	} finally {
		uploadingAvatar.value = false;
		if (e.target) e.target.value = "";
	}
}

async function changePwd() {
	if (!pwd.value.current || !pwd.value.next) {
		pwdMsg.value = "Vui lòng nhập mật khẩu đầy đủ";
		pwdError.value = true;
		return;
	}
	if (pwd.value.next !== pwd.value.confirm) {
		pwdMsg.value = "Mật khẩu xác nhận không khớp";
		pwdError.value = true;
		return;
	}

	changing.value = true;
	pwdMsg.value = "";
	try {
		const data = {
			currentPassword: pwd.value.current,
			newPassword: pwd.value.next,
		};
		await profileAPI.changePassword(data);
		pwdMsg.value = "Đã cập nhật mật khẩu mới!";
		pwdError.value = false;
		pwd.value = { current: "", next: "", confirm: "" };
		setTimeout(() => (pwdMsg.value = ""), 4000);
	} catch (e) {
		pwdMsg.value = e.response?.data?.message || "Lỗi khi đổi mật khẩu";
		pwdError.value = true;
	} finally {
		changing.value = false;
	}
}

async function updateProfile() {
	if (!profileForm.value.fullName) {
		profileMsg.value = "Họ tên không được để trống";
		profileError.value = true;
		return;
	}

	savingProfile.value = true;
	profileMsg.value = "";
	try {
		const { data } = await profileAPI.update({
			fullName: profileForm.value.fullName,
			phone: profileForm.value.phone,
			address: profileForm.value.address,
			bio: profileForm.value.bio,
			avatar: profileForm.value.avatar,
		});
		profileMsg.value = "Lưu hồ sơ thành công!";
		profileError.value = false;
		authStore.updateProfileData(data);
		setTimeout(() => (profileMsg.value = ""), 3000);
	} catch (e) {
		profileMsg.value = e.response?.data?.message || "Lỗi khi cập nhật hồ sơ.";
		profileError.value = true;
	} finally {
		savingProfile.value = false;
	}
}

onMounted(async () => {
	try {
		const { data: userProfile } = await profileAPI.get();

		const roleTranslations = {
			Admin: "Quản trị viên",
			Instructor: "Giảng viên",
			Employee: "Nhân viên",
		};

		profileForm.value = {
			fullName: userProfile.fullName,
			email: userProfile.email,
			phone: userProfile.phone || "",
			address: userProfile.address || "",
			bio: userProfile.bio || "",
			avatar: userProfile.avatar || "",
			department: userProfile.groupName || "",
			position:
				userProfile.position ||
				roleTranslations[userProfile.role] ||
				userProfile.role ||
				"",
		};

		if (userProfile.createdAt) {
			createdAtFormatted.value = new Date(
				userProfile.createdAt,
			).toLocaleDateString("vi-VN");
		}
	} catch {}

	try {
		const { data } = await progressAPI.getMyProgress();
		statsData.value.learning = data.filter(
			(p) => p.progressPercent < 100,
		).length;
		statsData.value.completed = data.filter(
			(p) => p.progressPercent >= 100,
		).length;
	} catch {}

	try {
		const { data } = await certificateAPI.getMy();
		statsData.value.certs = data.length;
	} catch {}
});
</script>

<style scoped>
/* 1. Layout & Core Structure */
.profile-page-modern {
	background-color: var(--bg-primary);
	min-height: 100vh;
	font-family: var(--font-family);
	color: var(--text-primary);
}

.text-dark-blue {
	color: var(--text-primary);
}
.fw-extra-bold {
	font-weight: 800;
}
.bg-primary-soft {
	background-color: var(--sidebar-bg-active);
}
.bg-light-soft {
	background-color: var(--bg-secondary);
}

.sticky-sidebar {
	position: sticky;
	top: 2rem;
	z-index: 10;
}

/* 2. Identity Card Styling */

.avatar-box-wrap {
	position: relative;
	width: 140px;
	height: 140px;
	margin: 0 auto;
	border-radius: 50%;
	background: var(--bg-card);
	padding: 6px;
	z-index: 5;
	border: 1px solid var(--border-color);
}

.avatar-img-primary,
.avatar-initials-primary {
	width: 100%;
	height: 100%;
	border-radius: 50%;
	object-fit: cover;
	display: block;
}

.avatar-initials-primary {
	display: flex;
	align-items: center;
	justify-content: center;
	background: var(--bg-tertiary);
	color: var(--primary-500);
	font-size: 36px;
	font-weight: 800;
}

.avatar-camera-trigger {
	position: absolute;
	bottom: 5px;
	right: 5px;
	width: 34px;
	height: 34px;
	background: var(--bg-card);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: var(--shadow-sm);
	cursor: pointer;
	color: var(--primary-500);
	transition: all var(--transition-fast);
	border: 1px solid var(--border-color);
}

.avatar-camera-trigger:hover {
	transform: scale(1.1);
	background: var(--primary-500);
	color: var(--text-inverse);
}

.active-pulse {
	position: absolute;
	top: 10px;
	right: 10px;
	width: 15px;
	height: 15px;
	background: var(--success-500);
	border: 3px solid var(--bg-card);
	border-radius: 50%;
}

.role-badge-standard {
	display: inline-block;
	padding: 5px 14px;
	background: var(--sidebar-bg-active);
	color: var(--primary-500);
	border-radius: 30px;
	font-size: 13px;
	font-weight: 700;
}

.member-info-badge {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 6px;
	font-size: 11px;
	color: var(--text-tertiary);
	font-weight: 600;
}

/* 3. Metrics/Achievements */
.metric-block-v2 {
	padding: 15px;
	border-radius: 16px;
	background: var(--bg-card);
	text-align: center;
	border: 1px solid var(--border-color);
	transition: all var(--transition-base);
}

.metric-block-v2:hover {
	transform: translateY(-3px);
	box-shadow: var(--shadow-md);
	border-color: var(--primary-300);
}

.metric-block-v2 .ic {
	margin-bottom: 8px;
	opacity: 0.8;
}
.metric-block-v2 .val {
	font-size: 22px;
	font-weight: 800;
	line-height: 1;
	margin-bottom: 4px;
	color: var(--text-primary);
}
.metric-block-v2 .lab {
	font-size: 10px;
	font-weight: 700;
	text-transform: uppercase;
	color: var(--text-tertiary);
}

.metric-block-v2.purple {
	color: var(--primary-500);
}
.metric-block-v2.success {
	color: var(--success-500);
}
.metric-block-v2.amber {
	color: var(--warning-500);
}

/* 4. Settings Form Styling */
.icon-header-wrap {
	width: 36px;
	height: 36px;
	border-radius: 10px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.section-title-wrap {
	display: flex;
	align-items: center;
	gap: 10px;
	color: var(--text-primary);
}

.form-group-modern {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.form-group-modern label {
	font-size: 11px;
	font-weight: 800;
	color: var(--text-tertiary);
	text-transform: uppercase;
	letter-spacing: 0.05em;
}

.input-container {
	position: relative;
	width: 100%;
}

.input-container .in-icon {
	position: absolute;
	left: 15px;
	top: 50%;
	transform: translateY(-50%);
	color: var(--text-tertiary);
}

.input-container input {
	width: 100%;
	padding: 12px 15px 12px 45px;
	border: 1px solid var(--border-color);
	border-radius: 12px;
	font-size: 14px;
	font-weight: 500;
	transition: all var(--transition-fast);
	background: var(--bg-tertiary);
	color: var(--text-primary);
}

.input-container input:focus {
	outline: none;
	border-color: var(--primary-500);
	background: var(--bg-card);
	box-shadow: 0 0 0 4px rgba(var(--primary-rgb), 0.1);
}

.form-group-modern.readonly .input-container input {
	background: var(--bg-secondary);
	color: var(--text-tertiary);
	cursor: not-allowed;
	border-style: dashed;
}

/* 5. Alerts & Feedbacks */
.alert-soft-v2 {
	display: flex;
	align-items: center;
	gap: 12px;
	padding: 16px;
	border-radius: 12px;
	font-weight: 600;
	border: 1px solid transparent;
}

.alert-success-v2 {
	background: var(--success-50);
	color: var(--success-600);
	border-color: rgba(var(--success-500), 0.1);
}
.alert-danger-v2 {
	background: var(--danger-50);
	color: var(--danger-600);
	border-color: rgba(var(--danger-500), 0.1);
}

.status-alert {
	display: flex;
	align-items: center;
	gap: 8px;
	font-size: 13px;
	font-weight: 700;
	color: var(--success-500);
}

.status-alert.err {
	color: var(--danger-500);
}

/* 6. Buttons */
.btn-solid-primary {
	padding: 12px 24px;
	background: var(--gradient-primary);
	color: var(--text-inverse);
	border: none;
	border-radius: 12px;
	font-weight: 700;
	display: flex;
	align-items: center;
	gap: 10px;
	transition: all var(--transition-base);
}

.btn-solid-primary:hover:not(:disabled) {
	transform: translateY(-2px);
	box-shadow: var(--shadow-glow);
}

.btn-outline-custom {
	padding: 12px 24px;
	background: var(--bg-card);
	color: var(--text-secondary);
	border: 1px solid var(--border-color);
	border-radius: 12px;
	font-weight: 700;
	display: flex;
	align-items: center;
	gap: 10px;
	transition: all var(--transition-base);
}

.btn-outline-custom:hover:not(:disabled) {
	background: var(--bg-secondary);
	border-color: var(--border-color-hover);
	color: var(--text-primary);
}

.btn-outline-custom:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}

/* 7. Utilities */
.animate-fade-in {
	animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
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

.spin {
	animation: spin 1s linear infinite;
}
@keyframes spin {
	from {
		transform: rotate(0deg);
	}
	to {
		transform: rotate(360deg);
	}
}

/* Mobile Adjustments */
@media (max-width: 991px) {
	.sticky-sidebar {
		position: static;
	}
	.avatar-box-wrap {
		margin-top: 0;
	}
}
</style>
