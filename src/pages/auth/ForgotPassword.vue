<script lang="ts" setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { authAPI } from "@/services/api";
import {
	Mail,
	KeyRound,
	Lock,
	ArrowLeft,
	SendHorizontal,
	CheckCircle2,
} from "lucide-vue-next";
import { toast } from "vue3-toastify";

const router = useRouter();
const step = ref(1);
const loading = ref(false);

const form = ref({
	email: "",
	otp: "",
	newPassword: "",
	confirmPassword: "",
});

const handleSendOtp = async () => {
	if (!form.value.email) {
		toast.error("Vui lòng nhập email!");
		return;
	}
	loading.value = true;
	try {
		await authAPI.forgotPassword({ email: form.value.email });
		toast.success("Mã OTP đã được gửi đến email của bạn.");
		step.value = 2;
	} catch (error: any) {
		toast.error(error.response?.data?.message || "Lỗi khi gửi mã OTP");
	} finally {
		loading.value = false;
	}
};

const handleVerifyOtp = async () => {
	if (!form.value.otp) {
		toast.error("Vui lòng nhập mã OTP!");
		return;
	}
	loading.value = true;
	try {
		await authAPI.verifyOtp({ email: form.value.email, otp: form.value.otp });
		step.value = 3;
	} catch (error: any) {
		toast.error(error.response?.data?.message || "Mã OTP không chính xác");
	} finally {
		loading.value = false;
	}
};

const handleResetPassword = async () => {
	if (form.value.newPassword !== form.value.confirmPassword) {
		toast.error("Mật khẩu xác nhận không khớp!");
		return;
	}
	if (form.value.newPassword.length < 6) {
		toast.error("Mật khẩu phải từ 6 ký tự trở lên!");
		return;
	}
	loading.value = true;
	try {
		await authAPI.resetPassword({
			email: form.value.email,
			otp: form.value.otp,
			newPassword: form.value.newPassword,
		});
		toast.success("Đặt lại mật khẩu thành công!");
		step.value = 4;
	} catch (error: any) {
		toast.error(error.response?.data?.message || "Lỗi khi đặt lại mật khẩu");
	} finally {
		loading.value = false;
	}
};
</script>

<template>
	<div class="forgot-password-page">
		<div class="auth-card glass-card">
			<button @click="router.push('/')" class="btn-back">
				<ArrowLeft :size="18" />
			</button>

			<!-- Step 1: Request OTP -->
			<div v-if="step === 1" class="step-container fadeIn">
				<div class="header">
					<div class="icon-box">
						<Mail :size="32" />
					</div>
					<h1>Quên mật khẩu?</h1>
					<p>Đừng lo lắng, hãy nhập email của bạn để nhận mã OTP khôi phục.</p>
				</div>

				<div class="form-group">
					<label>Email của bạn</label>
					<div class="input-wrapper">
						<Mail :size="18" class="input-icon" />
						<input
							v-model="form.email"
							type="email"
							placeholder="example@gmail.com"
							@keyup.enter="handleSendOtp"
						/>
					</div>
				</div>

				<button class="btn-primary" @click="handleSendOtp" :disabled="loading">
					<span
						v-if="loading"
						class="spinner-border spinner-border-sm mr-2"
					></span>
					Gửi mã OTP <SendHorizontal :size="18" class="ml-2" />
				</button>
			</div>

			<!-- Step 2: Verify OTP -->
			<div v-if="step === 2" class="step-container fadeIn">
				<div class="header">
					<div class="icon-box warning">
						<KeyRound :size="32" />
					</div>
					<h1>Xác thực OTP</h1>
					<p>
						Mã OTP đã được gửi đến <strong>{{ form.email }}</strong
						>. Vui lòng kiểm tra hộp thư.
					</p>
				</div>

				<div class="form-group">
					<label>Mã OTP (6 chữ số)</label>
					<div class="input-wrapper">
						<KeyRound :size="18" class="input-icon" />
						<input
							v-model="form.otp"
							type="text"
							maxlength="6"
							placeholder="______"
							style="text-align: center; letter-spacing: 4px; font-weight: 800"
							@keyup.enter="handleVerifyOtp"
						/>
					</div>
				</div>

				<button
					class="btn-primary"
					@click="handleVerifyOtp"
					:disabled="loading"
				>
					<span
						v-if="loading"
						class="spinner-border spinner-border-sm mr-2"
					></span>
					Tiếp tục
				</button>
				<button class="btn-ghost mt-3" @click="step = 1">Gửi lại mã</button>
			</div>

			<!-- Step 3: New Password -->
			<div v-if="step === 3" class="step-container fadeIn">
				<div class="header">
					<div class="icon-box success">
						<Lock :size="32" />
					</div>
					<h1>Mật khẩu mới</h1>
					<p>Hãy thiết lập mật khẩu mới cho tài khoản của bạn.</p>
				</div>

				<div class="form-group">
					<label>Mật khẩu mới</label>
					<div class="input-wrapper">
						<Lock :size="18" class="input-icon" />
						<input
							v-model="form.newPassword"
							type="password"
							placeholder="Tối thiểu 6 ký tự"
							@keyup.enter="handleResetPassword"
						/>
					</div>
				</div>

				<div class="form-group">
					<label>Xác nhận mật khẩu</label>
					<div class="input-wrapper">
						<Lock :size="18" class="input-icon" />
						<input
							v-model="form.confirmPassword"
							type="password"
							placeholder="Nhập lại mật khẩu"
							@keyup.enter="handleResetPassword"
						/>
					</div>
				</div>

				<button
					class="btn-primary"
					@click="handleResetPassword"
					:disabled="loading"
				>
					<span
						v-if="loading"
						class="spinner-border spinner-border-sm mr-2"
					></span>
					Đổi mật khẩu
				</button>
			</div>

			<!-- Step 4: Success -->
			<div v-if="step === 4" class="step-container fadeIn text-center">
				<div class="success-mark">
					<CheckCircle2 :size="80" color="#10b981" />
				</div>
				<h1 class="mt-4">Thành công!</h1>
				<p>
					Mật khẩu của bạn đã được thay đổi. Giờ đây bạn có thể đăng nhập bằng
					mật khẩu mới.
				</p>
				<button class="btn-primary mt-4" @click="router.push('/')">
					Quay lại Đăng nhập
				</button>
			</div>
		</div>
	</div>
</template>

<style scoped>
.forgot-password-page {
	min-height: 100vh;
	display: flex;
	align-items: center;
	justify-content: center;
	background: linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%);
	position: relative;
	overflow: hidden;
	padding: 20px;
}

.forgot-password-page::before {
	content: "";
	position: absolute;
	width: 300px;
	height: 300px;
	background: rgba(59, 130, 246, 0.05);
	border-radius: 50%;
	top: -100px;
	right: -100px;
	filter: blur(80px);
}

.glass-card {
	background: rgba(255, 255, 255, 0.8);
	backdrop-filter: blur(20px);
	border: 1px solid rgba(255, 255, 255, 0.5);
	box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.05);
}

.auth-card {
	width: 100%;
	max-width: 440px;
	padding: 40px;
	border-radius: 24px;
	position: relative;
	z-index: 10;
}

.btn-back {
	position: absolute;
	top: 20px;
	left: 20px;
	width: 36px;
	height: 36px;
	border-radius: 10px;
	background: #f1f5f9;
	border: none;
	color: #64748b;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	transition: all 0.2s;
}
.btn-back:hover {
	background: #e2e8f0;
	color: #1e293b;
}

.header {
	text-align: center;
	margin-bottom: 32px;
}
.icon-box {
	width: 72px;
	height: 72px;
	border-radius: 20px;
	background: rgba(59, 130, 246, 0.1);
	color: #3b82f6;
	display: flex;
	align-items: center;
	justify-content: center;
	margin: 0 auto 20px;
}
.icon-box.warning {
	background: rgba(245, 158, 11, 0.1);
	color: #f59e0b;
}
.icon-box.success {
	background: rgba(16, 185, 129, 0.1);
	color: #10b981;
}

h1 {
	font-size: 24px;
	font-weight: 800;
	color: #1e293b;
	margin-bottom: 12px;
}
p {
	color: #64748b;
	font-size: 14px;
	line-height: 1.6;
}

.form-group {
	margin-bottom: 24px;
}
label {
	display: block;
	font-size: 13px;
	font-weight: 700;
	color: #475569;
	margin-bottom: 8px;
	text-transform: uppercase;
	letter-spacing: 0.05em;
}

.input-wrapper {
	position: relative;
	background: #ffffff;
	border-radius: 12px;
	border: 1px solid #e2e8f0;
	transition: all 0.3s;
}
.input-wrapper:focus-within {
	border-color: #3b82f6;
	box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}
.input-icon {
	position: absolute;
	left: 16px;
	top: 50%;
	transform: translateY(-50%);
	color: #94a3b8;
	pointer-events: none;
}
input {
	width: 100%;
	padding: 14px 16px 14px 48px;
	background: transparent;
	border: none;
	color: #1e293b;
	font-size: 15px;
	outline: none;
}
input::placeholder {
	color: #cbd5e1;
}

.btn-primary {
	width: 100%;
	padding: 14px;
	background: #3b82f6;
	color: white;
	border: none;
	border-radius: 12px;
	font-weight: 700;
	cursor: pointer;
	transition: all 0.3s;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.2);
}
.btn-primary:hover {
	background: #2563eb;
	transform: translateY(-2px);
	box-shadow: 0 12px 20px -5px rgba(59, 130, 246, 0.3);
}
.btn-primary:disabled {
	opacity: 0.7;
	cursor: not-allowed;
	transform: none;
	box-shadow: none;
}

.btn-ghost {
	background: transparent;
	border: none;
	color: #3b82f6;
	font-weight: 600;
	font-size: 14px;
	cursor: pointer;
}

.success-mark {
	animation: bounceIn 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
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
.fadeIn {
	animation: fadeIn 0.4s ease-out;
}

@keyframes bounceIn {
	0% {
		transform: scale(0);
		opacity: 0;
	}
	50% {
		transform: scale(1.2);
	}
	100% {
		transform: scale(1);
		opacity: 1;
	}
}

.ml-2 {
	margin-left: 8px;
}
.mr-2 {
	margin-right: 8px;
}
</style>
