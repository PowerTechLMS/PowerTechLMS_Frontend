<template>
	<div class="profile-page">
		<div class="profile-header card">
			<div class="avatar-wrap">
				<label
					for="avatar-upload"
					class="avatar-upload-label"
					:class="{ uploading: uploadingAvatar }"
				>
					<div
						v-if="avatarUrl"
						class="avatar-lg"
						:style="{
							backgroundImage: `url('${avatarUrl}')`,
							backgroundSize: 'cover',
							backgroundPosition: 'center',
							color: 'transparent',
						}"
					/>
					<div v-else class="avatar-lg">{{ initials }}</div>
					<div class="avatar-edit-overlay">
						<Loader2 v-if="uploadingAvatar" :size="20" class="spin" />
						<Camera v-else :size="20" />
						<span v-if="!uploadingAvatar" class="edit-text">Sửa ảnh</span>
					</div>
				</label>
				<input
					id="avatar-upload"
					type="file"
					hidden
					accept="image/*"
					@change="handleAvatarChange"
				/>
				<div class="avatar-badge">
					<Shield v-if="user?.role === 'Admin'" :size="14" />
					<GraduationCap v-else-if="user?.role === 'Instructor'" :size="14" />
					<User v-else :size="14" />
				</div>
			</div>
			<div class="profile-info">
				<h1 class="profile-name">
					{{ user?.fullName || user?.userName }}
				</h1>
				<div class="profile-meta">
					<span class="role-badge" :class="user?.role?.toLowerCase()">{{
						roleLabel
					}}</span>
					<span class="profile-email"
						><Mail :size="13" /> {{ user?.email }}</span
					>
				</div>
			</div>
		</div>

		<div class="stats-grid">
			<div v-for="s in stats" :key="s.label" class="stat-card card">
				<div class="stat-icon" :style="{ background: s.color }">
					<component :is="s.icon" :size="20" style="color: white" />
				</div>
				<div class="stat-body">
					<div class="stat-value">
						{{ s.value }}
					</div>
					<div class="stat-label">
						{{ s.label }}
					</div>
				</div>
			</div>
		</div>

		<div class="card profile-card">
			<h2 class="section-title"><User :size="18" /> Thông tin cá nhân</h2>
			<div class="profile-form">
				<div class="form-grid">
					<div class="form-group">
						<label class="form-label">Họ và tên</label>
						<div class="input-wrap">
							<User :size="15" class="input-icon" />
							<input
								v-model="profileForm.fullName"
								type="text"
								class="form-input with-icon"
							/>
						</div>
					</div>
					<div class="form-group">
						<label class="form-label">Email (Đăng nhập & Nhắc nhở)</label>
						<div class="input-wrap">
							<Mail :size="15" class="input-icon" />
							<input
								:value="profileForm.email"
								type="email"
								class="form-input with-icon"
								disabled
							/>
						</div>
					</div>
					<div class="form-group">
						<label class="form-label">Số điện thoại</label>
						<div class="input-wrap">
							<Phone :size="15" class="input-icon" />
							<input
								v-model="profileForm.phone"
								type="text"
								class="form-input with-icon"
								placeholder="SĐT liên hệ"
							/>
						</div>
					</div>
					<div class="form-group">
						<label class="form-label">Địa chỉ</label>
						<div class="input-wrap">
							<MapPin :size="15" class="input-icon" />
							<input
								v-model="profileForm.address"
								type="text"
								class="form-input with-icon"
								placeholder="Nơi ở hiện tại"
							/>
						</div>
					</div>
					<div class="form-group full-width">
						<label class="form-label">Tiểu sử (Bio)</label>
						<textarea
							v-model="profileForm.bio"
							class="form-input"
							rows="3"
							placeholder="Giới thiệu ngắn về bản thân..."
						/>
					</div>
				</div>
				<div class="form-actions">
					<button
						class="btn btn-primary mt-3"
						:disabled="savingProfile"
						@click="updateProfile"
					>
						<Loader2 v-if="savingProfile" :size="15" class="spin" />
						<Save v-else :size="15" />
						{{ savingProfile ? "Đang lưu..." : "Cập nhật thông tin" }}
					</button>
					<div
						v-if="profileMsg"
						class="pwd-msg"
						:class="{ error: profileError }"
					>
						{{ profileMsg }}
					</div>
				</div>
			</div>
		</div>

		<div class="card pwd-card">
			<h2 class="section-title"><KeyRound :size="18" /> Đổi mật khẩu</h2>
			<div class="pwd-form">
				<div class="form-group">
					<label class="form-label">Mật khẩu hiện tại</label>
					<div class="input-wrap">
						<Lock :size="15" class="input-icon" />
						<input
							v-model="pwd.current"
							type="password"
							class="form-input with-icon"
							placeholder="••••••••"
						/>
					</div>
				</div>
				<div class="form-group">
					<label class="form-label">Mật khẩu mới</label>
					<div class="input-wrap">
						<LockOpen :size="15" class="input-icon" />
						<input
							v-model="pwd.next"
							type="password"
							class="form-input with-icon"
							placeholder="Tối thiểu 6 ký tự"
						/>
					</div>
				</div>
				<div class="form-group">
					<label class="form-label">Xác nhận mật khẩu mới</label>
					<div class="input-wrap">
						<LockOpen :size="15" class="input-icon" />
						<input
							v-model="pwd.confirm"
							type="password"
							class="form-input with-icon"
							placeholder="Nhập lại mật khẩu mới"
						/>
					</div>
				</div>
				<button class="btn btn-primary" :disabled="changing" @click="changePwd">
					<Loader2 v-if="changing" :size="15" class="spin" />
					<Save v-else :size="15" />
					{{ changing ? "Đang lưu..." : "Lưu thay đổi" }}
				</button>
				<div v-if="pwdMsg" class="pwd-msg" :class="{ error: pwdError }">
					{{ pwdMsg }}
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
	GraduationCap,
	Mail,
	BookOpen,
	Award,
	CheckCircle2,
	KeyRound,
	Lock,
	LockOpen,
	Save,
	Loader2,
	Phone,
	MapPin,
	Camera,
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
const avatarUrl = computed(() => {
	if (!user.value?.avatar) return null;
	const url = user.value.avatar;
	const base = url.startsWith("http")
		? url
		: `${import.meta.env.VITE_API_URL || "http://localhost:5100"}${url}`;
	return `${base}?t=${authStore.avatarUpdateTime}`;
});
const roleLabel = computed(
	() =>
		({
			Admin: "Quản trị viên",
			Instructor: "Giảng viên",
			Employee: "Học viên",
		})[user.value?.role] || user.value?.role,
);

const myProgress = ref([]);
const myCerts = ref([]);
const stats = computed(() => [
	{
		label: "Đang học",
		value: myProgress.value.filter((p) => p.progressPercent < 100).length,
		icon: BookOpen,
		color: "linear-gradient(135deg,#6366f1,#8b5cf6)",
	},
	{
		label: "Hoàn thành",
		value: myProgress.value.filter((p) => p.progressPercent >= 100).length,
		icon: CheckCircle2,
		color: "linear-gradient(135deg,#22c55e,#16a34a)",
	},
	{
		label: "Chứng chỉ",
		value: myCerts.value.length,
		icon: Award,
		color: "linear-gradient(135deg,#f59e0b,#d97706)",
	},
]);

const pwd = ref({ current: "", next: "", confirm: "" });
const changing = ref(false);
const pwdMsg = ref("");
const pwdError = ref(false);

const profileForm = ref({
	fullName: "",
	email: "",
	phone: "",
	address: "",
	bio: "",
	avatar: "",
});
const savingProfile = ref(false);
const profileMsg = ref("");
const profileError = ref(false);

const uploadingAvatar = ref(false);
async function handleAvatarChange(e) {
	const file = e.target.files[0];
	if (!file) return;

	uploadingAvatar.value = true;
	const formData = new FormData();
	formData.append("file", file);
	try {
		const { data } = await profileAPI.uploadAvatar(formData);
		authStore.updateProfileData({ ...user.value, avatar: data.avatar });
		profileForm.value.avatar = data.avatar;
		authStore.triggerAvatarRefresh();
	} catch (error) {
		alert(error.response?.data?.message || "Lỗi khi tải ảnh đại diện");
	} finally {
		uploadingAvatar.value = false;
		e.target.value = "";
	}
}

async function changePwd() {
	if (!pwd.value.current || !pwd.value.next) {
		pwdMsg.value = "Vui lòng điền đầy đủ";
		pwdError.value = true;
		return;
	}
	if (pwd.value.next !== pwd.value.confirm) {
		pwdMsg.value = "Mật khẩu xác nhận không khớp";
		pwdError.value = true;
		return;
	}
	if (pwd.value.next.length < 6) {
		pwdMsg.value = "Mật khẩu tối thiểu 6 ký tự";
		pwdError.value = true;
		return;
	}
	changing.value = true;
	try {
		const data = {
			currentPassword: pwd.value.current,
			newPassword: pwd.value.next,
		};
		await profileAPI.changePassword(data);
		pwdMsg.value = "Đổi mật khẩu thành công!";
		pwdError.value = false;
		pwd.value = { current: "", next: "", confirm: "" };
	} catch (e) {
		pwdMsg.value = e.response?.data?.message || "Lỗi";
		pwdError.value = true;
	} finally {
		changing.value = false;
	}
}

async function updateProfile() {
	savingProfile.value = true;
	try {
		const { data } = await profileAPI.update(profileForm.value);
		profileMsg.value = "Cập nhật thông tin thành công!";
		profileError.value = false;
		authStore.updateProfileData(data);
	} catch (e) {
		profileMsg.value = e.response?.data?.message || "Có lỗi xảy ra.";
		profileError.value = true;
	} finally {
		savingProfile.value = false;
		setTimeout(() => (profileMsg.value = ""), 3000);
	}
}

onMounted(async () => {
	try {
		const { data: userProfile } = await profileAPI.get();
		profileForm.value = {
			fullName: userProfile.fullName,
			email: userProfile.email,
			phone: userProfile.phone || "",
			address: userProfile.address || "",
			bio: userProfile.bio || "",
			avatar: userProfile.avatar || "",
		};
	} catch {}
	try {
		const { data } = await progressAPI.getMyProgress();
		myProgress.value = data;
	} catch {}
	try {
		const { data } = await certificateAPI.getMy();
		myCerts.value = data;
	} catch {}
});
</script>

<style scoped>
.profile-page {
	display: flex;
	flex-direction: column;
	gap: var(--space-xl);
}

.profile-header {
	display: flex;
	align-items: center;
	gap: var(--space-xl);
	padding: var(--space-xl);
}
.avatar-wrap {
	position: relative;
	flex-shrink: 0;
}
.avatar-upload-label {
	cursor: pointer;
	position: relative;
	display: block;
	border-radius: 50%;
	overflow: hidden;
	width: 80px;
	height: 80px;
}
.avatar-edit-overlay {
	position: absolute;
	inset: 0;
	background: rgba(0, 0, 0, 0.5);
	color: white;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	opacity: 0;
	transition: 0.2s;
	font-size: 11px;
	font-weight: 500;
}
.avatar-upload-label:hover .avatar-edit-overlay,
.avatar-upload-label.uploading .avatar-edit-overlay {
	opacity: 1;
}
.edit-text {
	margin-top: 4px;
}
.avatar-lg {
	width: 80px;
	height: 80px;
	border-radius: 50%;
	background: var(--gradient-primary);
	display: flex;
	align-items: center;
	justify-content: center;
	color: white;
	font-size: var(--font-size-2xl);
	font-weight: 700;
}
.avatar-badge {
	position: absolute;
	bottom: 0;
	right: 0;
	width: 24px;
	height: 24px;
	border-radius: 50%;
	background: var(--bg-secondary);
	border: 2px solid var(--border-color);
	display: flex;
	align-items: center;
	justify-content: center;
	color: var(--primary-400);
}
.profile-name {
	font-size: var(--font-size-2xl);
	font-weight: 700;
	margin-bottom: var(--space-sm);
}
.profile-meta {
	display: flex;
	align-items: center;
	gap: var(--space-md);
	flex-wrap: wrap;
}
.role-badge {
	padding: 3px 12px;
	border-radius: var(--radius-full);
	font-size: var(--font-size-xs);
	font-weight: 600;
	text-transform: uppercase;
}
.role-badge.admin {
	background: rgba(239, 68, 68, 0.15);
	color: var(--danger-400);
}
.role-badge.instructor {
	background: rgba(99, 102, 241, 0.15);
	color: var(--primary-400);
}
.role-badge.employee {
	background: rgba(34, 197, 94, 0.12);
	color: var(--success-400);
}
.profile-email {
	display: flex;
	align-items: center;
	gap: 5px;
	font-size: var(--font-size-sm);
	color: var(--text-secondary);
}

.stats-grid {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: var(--space-lg);
}
.stat-card {
	display: flex;
	align-items: center;
	gap: var(--space-md);
	padding: var(--space-lg);
}
.stat-icon {
	width: 48px;
	height: 48px;
	border-radius: var(--radius-lg);
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}
.stat-value {
	font-size: var(--font-size-2xl);
	font-weight: 800;
	line-height: 1;
}
.stat-label {
	font-size: var(--font-size-xs);
	color: var(--text-secondary);
	margin-top: 2px;
}

.pwd-card,
.profile-card {
	padding: var(--space-xl);
	margin-top: var(--space-xl);
}
.section-title {
	display: flex;
	align-items: center;
	gap: var(--space-sm);
	font-size: var(--font-size-lg);
	font-weight: 600;
	margin-bottom: var(--space-xl);
}
.pwd-form,
.profile-form {
	display: flex;
	flex-direction: column;
	gap: var(--space-md);
}
.form-grid {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: var(--space-md);
}
.full-width {
	grid-column: 1 / -1;
}
.mt-3 {
	margin-top: 12px;
}
.input-wrap {
	position: relative;
}
.input-icon {
	position: absolute;
	left: 12px;
	top: 50%;
	transform: translateY(-50%);
	color: var(--text-tertiary);
}
.with-icon {
	padding-left: 38px !important;
}
.btn {
	display: inline-flex;
	align-items: center;
	gap: 6px;
}
.spin {
	animation: spin 0.8s linear infinite;
}
@keyframes spin {
	to {
		transform: rotate(360deg);
	}
}
.pwd-msg {
	font-size: var(--font-size-sm);
	color: var(--success-400);
	padding: var(--space-sm);
}
.pwd-msg.error {
	color: var(--danger-400);
}

@media (max-width: 768px) {
	.stats-grid {
		grid-template-columns: 1fr;
	}
	.profile-header {
		flex-direction: column;
		text-align: center;
	}
}
</style>
