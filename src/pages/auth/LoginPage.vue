<template>
	<div class="login-root">
		<div class="brand-panel">
			<div class="geo geo-1" />
			<div class="geo geo-2" />
			<div class="geo geo-3" />
			<div class="geo geo-4" />
			<div class="geo geo-5" />

			<div class="brand-content">
				<div class="brand-logo">
					<RouterLink to="/">
						<svg
							width="180"
							height="44"
							viewBox="0 0 220 56"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
							xmlns:xlink="http://www.w3.org/1999/xlink"
						>
							<path
								d="M79.6333 24.3V27.175H85.2583V30.9H79.6333V34.075H86.0083V38H74.7333V20.375H86.0083V24.3H79.6333ZM100.19 20.375C102.04 20.375 103.656 20.75 105.04 21.5C106.44 22.2333 107.515 23.2667 108.265 24.6C109.015 25.9333 109.39 27.4583 109.39 29.175C109.39 30.875 109.006 32.3917 108.24 33.725C107.49 35.0583 106.415 36.1083 105.015 36.875C103.631 37.625 102.023 38 100.19 38H93.2147V20.375H100.19ZM99.8147 33.675C101.248 33.675 102.373 33.2833 103.19 32.5C104.006 31.7167 104.415 30.6083 104.415 29.175C104.415 27.725 104.006 26.6083 103.19 25.825C102.373 25.025 101.248 24.625 99.8147 24.625H98.1147V33.675H99.8147ZM121.184 20.375V30.6C121.184 31.55 121.4 32.2833 121.834 32.8C122.284 33.3167 122.959 33.575 123.859 33.575C124.759 33.575 125.434 33.3167 125.884 32.8C126.35 32.2667 126.584 31.5333 126.584 30.6V20.375H131.484V30.6C131.484 32.2167 131.142 33.6 130.459 34.75C129.775 35.8833 128.842 36.7417 127.659 37.325C126.492 37.8917 125.192 38.175 123.759 38.175C122.325 38.175 121.042 37.8917 119.909 37.325C118.792 36.7417 117.909 35.8833 117.259 34.75C116.625 33.6167 116.309 32.2333 116.309 30.6V20.375H121.184ZM159.542 20.375V38H154.642V28.275L151.317 38H147.217L143.867 28.2V38H138.967V20.375H144.892L149.317 31.825L153.642 20.375H159.542ZM172.016 20.375V38H167.116V20.375H172.016ZM195.917 38H191.017L184.492 28.15V38H179.592V20.375H184.492L191.017 30.35V20.375H195.917V38Z"
								fill="#1a56db"
							/>
							<mask
								id="mask0_login"
								style="mask-type: alpha"
								maskUnits="userSpaceOnUse"
								x="0"
								y="0"
								width="64"
								height="56"
							>
								<rect
									width="63.871"
									height="55.8871"
									fill="url(#patternLogin)"
								/>
							</mask>
							<g mask="url(#mask0_login)">
								<rect
									x="0.798584"
									width="63.0726"
									height="55.8871"
									fill="currentColor"
								/>
							</g>

							<defs>
								<pattern
									id="patternLogin"
									patternContentUnits="objectBoundingBox"
									width="1"
									height="1"
								>
									<use
										xlink:href="#imageLogin"
										transform="scale(0.0125 0.0142857)"
									/>
								</pattern>
								<image
									id="imageLogin"
									width="80"
									height="70"
									xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABGCAMAAABsQOMZAAAAllBMVEUAAAD/jxb/jxb/jxb/jxb/jxb/jxb/jxb/jxb/jxb/jxb/jxb/jxb/jxb/jxb/jxb/jxb/jxb/jxb/jxb/jxb/jxb/jxb/jxb/jxb/jxb/jxb/jxb/jxb/jxb/jxb/jxb/jxb/jxb/jxb/jxb/jxb/jxb/jxb/jxb/jxb/jxb/jxb/jxb/jxb/jxb/jxb/jxb/jxb/jxZ2RtyAAAAAMXRSTlMA61rOUwajmEgztPfHuqiLdj0gGhXw38SukX5pVi0lC4VhQjgD2b+fck4pD/nm0uIIbztwLQAAAiBJREFUWMPt19uSojAUBeEoKigKqIACKqh4PnSv93+5YUprU0wwEMjFdFX/936SWIYd9tuPba5bG4XcTL8DGKwVcZvTHa+WewXcUAfyrF1b7oR/Wu7acEuUNJk25KYjfGhhNOB2xJWSK0nuwnEc2ZXgjCNqpK3qPt0YNTtsa3ArDRL5UQW31SDZ4Zx+5qInGuQ7canW3x7QsI7j8lzko0Ve6BY554GWeXZOxuEXFOQF89dhHHagKNO+MraC0hw2cw7quEeyZlndpxrOj/rsXW+sAuwV/sJHVSB1aUFOdGR1BcegVFqPrQnkXiPSjS9/d4xAjrQkF2u8ftUc5MlBfW6UcRzIN7RqcjvGxCB1FT8lDTqVYD/OBy4xZw3ZuzQWgZo1o6HL/sydiLsFB1e05C8guNJT2mYpp69pDk08IBWBWvEDrs2dlXd9Q1+YmAA6/SqwMKzekgJpBjPibGRVgvym3xwiTXtOO6wD9UBqOSXy/Hi92YhbDwAJkB9Wv88PM3S5sVYWpL9WVkzcfgDIg9TxTRK3BErALbKiKpCOJ2o6AUrB4SBrXwUS+V6LQRwHUmIwJ7fZNhHXBqQWxLUFqf8E9CDftwgMTWlPT5koN/Gl1hvQYabiJuCfYwX3PGrRk7nYBlWbeZK95M5DX7B19pXJl0bjcu7pxKxhxqjlVZlvE9wLnLVnbZs7dIvxkitTURotkPU835iyjEl2yv72U/sDJjPTtw93ZiUAAAAASUVORK5CYII="
								/>
							</defs>
						</svg>
					</RouterLink>
				</div>

				<div class="brand-headline">
					<h1>Nền tảng<br /><em>đào tạo</em><br />doanh nghiệp.</h1>
					<p>
						Quản lý lộ trình học tập, theo dõi tiến độ nhân viên và tự động hóa
						cấp phát khóa học theo phòng ban.
					</p>
				</div>

				<div class="brand-stats">
					<div class="stat-item">
						<span class="stat-num">465+</span>
						<span class="stat-desc">Học viên</span>
					</div>
					<div class="stat-divider" />
					<div class="stat-item">
						<span class="stat-num">12</span>
						<span class="stat-desc">Lộ trình</span>
					</div>
					<div class="stat-divider" />
					<div class="stat-item">
						<span class="stat-num">98%</span>
						<span class="stat-desc">Hoàn thành</span>
					</div>
				</div>
			</div>
		</div>

		<div class="form-panel">
			<div class="form-container">
				<div class="mobile-logo">
					<RouterLink to="/">
						<svg
							width="140"
							height="36"
							viewBox="0 0 220 56"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
							xmlns:xlink="http://www.w3.org/1999/xlink"
						>
							<path
								d="M79.6333 24.3V27.175H85.2583V30.9H79.6333V34.075H86.0083V38H74.7333V20.375H86.0083V24.3H79.6333ZM100.19 20.375C102.04 20.375 103.656 20.75 105.04 21.5C106.44 22.2333 107.515 23.2667 108.265 24.6C109.015 25.9333 109.39 27.4583 109.39 29.175C109.39 30.875 109.006 32.3917 108.24 33.725C107.49 35.0583 106.415 36.1083 105.015 36.875C103.631 37.625 102.023 38 100.19 38H93.2147V20.375H100.19ZM99.8147 33.675C101.248 33.675 102.373 33.2833 103.19 32.5C104.006 31.7167 104.415 30.6083 104.415 29.175C104.415 27.725 104.006 26.6083 103.19 25.825C102.373 25.025 101.248 24.625 99.8147 24.625H98.1147V33.675H99.8147ZM121.184 20.375V30.6C121.184 31.55 121.4 32.2833 121.834 32.8C122.284 33.3167 122.959 33.575 123.859 33.575C124.759 33.575 125.434 33.3167 125.884 32.8C126.35 32.2667 126.584 31.5333 126.584 30.6V20.375H131.484V30.6C131.484 32.2167 131.142 33.6 130.459 34.75C129.775 35.8833 128.842 36.7417 127.659 37.325C126.492 37.8917 125.192 38.175 123.759 38.175C122.325 38.175 121.042 37.8917 119.909 37.325C118.792 36.7417 117.909 35.8833 117.259 34.75C116.625 33.6167 116.309 32.2333 116.309 30.6V20.375H121.184ZM159.542 20.375V38H154.642V28.275L151.317 38H147.217L143.867 28.2V38H138.967V20.375H144.892L149.317 31.825L153.642 20.375H159.542ZM172.016 20.375V38H167.116V20.375H172.016ZM195.917 38H191.017L184.492 28.15V38H179.592V20.375H184.492L191.017 30.35V20.375H195.917V38Z"
								fill="#1a56db"
							/>
							<mask
								id="mask0_m"
								style="mask-type: alpha"
								maskUnits="userSpaceOnUse"
								x="0"
								y="0"
								width="64"
								height="56"
							>
								<rect width="63.871" height="55.8871" fill="url(#patternM)" />
							</mask>
							<g mask="url(#mask0_m)">
								<rect
									x="0.798584"
									width="63.0726"
									height="55.8871"
									fill="currentColor"
								/>
							</g>

							<defs>
								<pattern
									id="patternM"
									patternContentUnits="objectBoundingBox"
									width="1"
									height="1"
								>
									<use
										xlink:href="#imageMobile"
										transform="scale(0.0125 0.0142857)"
									/>
								</pattern>
								<image
									id="imageMobile"
									width="80"
									height="70"
									xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABGCAMAAABsQOMZAAAAllBMVEUAAAD/jxb/jxb/jxb/jxb/jxb/jxb/jxb/jxb/jxb/jxb/jxb/jxb/jxb/jxb/jxb/jxb/jxb/jxb/jxb/jxb/jxb/jxb/jxb/jxb/jxb/jxb/jxb/jxb/jxb/jxb/jxb/jxb/jxb/jxb/jxb/jxb/jxb/jxb/jxb/jxb/jxb/jxb/jxb/jxb/jxb/jxb/jxb/jxb/jxZ2RtyAAAAAMXRSTlMA61rOUwajmEgztPfHuqiLdj0gGhXw38SukX5pVi0lC4VhQjgD2b+fck4pD/nm0uIIbztwLQAAAiBJREFUWMPt19uSojAUBeEoKigKqIACKqh4PnSv93+5YUprU0wwEMjFdFX/936SWIYd9tuPba5bG4XcTL8DGKwVcZvTHa+WewXcUAfyrF1b7oR/Wu7acEuUNJk25KYjfGhhNOB2xJWSK0nuwnEc2ZXgjCNqpK3qPt0YNTtsa3ArDRL5UQW31SDZ4Zx+5qInGuQ7canW3x7QsI7j8lzko0Ve6BY554GWeXZOxuEXFOQF89dhHHagKNO+MraC0hw2cw7quEeyZlndpxrOj/rsXW+sAuwV/sJHVSB1aUFOdGR1BcegVFqPrQnkXiPSjS9/d4xAjrQkF2u8ftUc5MlBfW6UcRzIN7RqcjvGxCB1FT8lDTqVYD/OBy4xZw3ZuzQWgZo1o6HL/sydiLsFB1e05C8guNJT2mYpp69pDk08IBWBWvEDrs2dlXd9Q1+YmAA6/SqwMKzekgJpBjPibGRVgvym3xwiTXtOO6wD9UBqOSXy/Hi92YhbDwAJkB9Wv88PM3S5sVYWpL9WVkzcfgDIg9TxTRK3BErALbKiKpCOJ2o6AUrB4SBrXwUS+V6LQRwHUmIwJ7fZNhHXBqQWxLUFqf8E9CDftwgMTWlPT5koN/Gl1hvQYabiJuCfYwX3PGrRk7nYBlWbeZK95M5DX7B19pXJl0bjcu7pxKxhxqjlVZlvE9wLnLVnbZs7dIvxkitTURotkPU835iyjEl2yv72U/sDJjPTtw93ZiUAAAAASUVORK5CYII="
								/>
							</defs>
						</svg>
					</RouterLink>
				</div>

				<div class="form-header">
					<h2>Chào mừng trở lại</h2>
					<p>Đăng nhập để tiếp tục quản lý hệ thống đào tạo.</p>
				</div>

				<div
					v-if="error"
					class="alert alert-danger"
					style="
						color: #dc3545;
						background-color: var(--primary-light);
						border: 1px solid rgba(220, 53, 69, 0.2);
						border-radius: 8px;
						padding: 12px;
						font-size: 14px;
						margin-bottom: 20px;
					"
				>
					<i class="fa fa-exclamation-circle me-2" /> {{ error }}
				</div>


				<form class="login-form" @submit.prevent="handleSubmit">
					<div class="field-group">
						<label for="email">Tài khoản Email</label>
						<div class="input-wrap">
							<span class="input-icon">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
								>
									<path
										d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
									/>
									<polyline points="22,6 12,13 2,6" />
								</svg>
							</span>
							<input
								id="email"
								v-model="form.email"
								type="email"
								placeholder="Nhập email..."
								autocomplete="email"
								required
							/>
						</div>
					</div>

					<div class="field-group">
						<label for="dlabPassword">Mật khẩu</label>
						<div class="input-wrap">
							<span class="input-icon">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
								>
									<rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
									<path d="M7 11V7a5 5 0 0 1 10 0v4" />
								</svg>
							</span>
							<input
								id="dlabPassword"
								v-model="form.password"
								:type="show ? 'text' : 'password'"
								placeholder="Nhập mật khẩu"
								autocomplete="current-password"
								required
							/>
							<button
								type="button"
								class="toggle-pass"
								tabindex="-1"
								@click="show = !show"
							>
								<svg
									v-if="show"
									xmlns="http://www.w3.org/2000/svg"
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
								>
									<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
									<circle cx="12" cy="12" r="3" />
								</svg>
								<svg
									v-else
									xmlns="http://www.w3.org/2000/svg"
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
								>
									<path
										d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
									/>
									<line x1="1" y1="1" x2="23" y2="23" />
								</svg>
							</button>
						</div>
					</div>

					<div class="form-meta">
						<label class="remember-label">
							<input id="remember" v-model="rememberMe" type="checkbox" />
							<span class="checkmark" />
							<span>Ghi nhớ đăng nhập</span>
						</label>
						<a class="forgot-link" href="#">Quên mật khẩu?</a>
					</div>

					<button type="submit" class="btn-signin" :disabled="loading">
						<span v-if="loading">Đang chờ...</span>
						<span v-else>Đăng nhập</span>
						<span v-if="!loading" style="margin-left: 8px">&rarr;</span>
					</button>
				</form>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const authStore = useAuthStore();

const loading = ref(false);
const error = ref("");
const show = ref(false);
const rememberMe = ref(false);

const form = reactive({ email: "", password: "" });

onMounted(() => {
	const getCookie = (name) => {
		const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
		if (match) return match[2];
		return null;
	};
	const savedEmail = getCookie("lms_remembered_email");
	if (savedEmail) {
		form.email = savedEmail;
		rememberMe.value = true;
	}
});

async function handleSubmit() {
	loading.value = true;
	error.value = "";
	try {
		await authStore.login(form.email, form.password, rememberMe.value);
		router.push("/dashboard");
	} catch (e) {
		error.value =
			e.response?.data?.message || "Đã xảy ra lỗi. Vui lòng thử lại.";
	} finally {
		loading.value = false;
	}
}
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400&family=DM+Sans:ital,wght@0,400;0,500;1,400&display=swap");

.login-root {
	--primary: #6366f1;
	--primary-light: rgba(99, 102, 241, 0.1);
	--primary-mid: rgba(99, 102, 241, 0.18);
	--text-dark: #1e293b;
	--text-muted: #64748b;
	--border: #e2e8f0;
	--bg-page: #f8fafc;
	--bg-card: #ffffff;
	--bg-panel: #f5f7ff;
	--shadow-sm: 0 1px 4px rgba(0, 0, 0, 0.07);
	--shadow-md: 0 4px 16px rgba(99, 102, 241, 0.1);
	color: var(--text-dark);

	display: flex;
	min-height: 100vh;
	font-family: "DM Sans", sans-serif;
	background: var(--bg-page);
}

:is([data-bs-theme="dark"], [data-theme="dark"]) .login-root {
	--text-dark: #e2e8f0;
	--text-muted: #94a3b8;
	--border: rgba(255, 255, 255, 0.1);
	--bg-page: #0f172a;
	--bg-card: #1e293b;
	--bg-panel: #111827;
	--shadow-sm: 0 1px 4px rgba(0, 0, 0, 0.4);
	--shadow-md: 0 4px 16px rgba(0, 0, 0, 0.5);
}


.brand-panel {
	position: relative;
	flex: 0 0 48%;
	background: var(--bg-panel);
	border-right: 1px solid var(--border);
	overflow: hidden;
	display: flex;
	align-items: center;
	padding: 3.5rem;
}

.geo {
	position: absolute;
	border-radius: 50%;
	animation: float 9s ease-in-out infinite;
}
.geo-1 {
	width: 480px;
	height: 480px;
	background: var(--primary);
	opacity: 0.06;
	top: -180px;
	right: -140px;
	animation-delay: 0s;
}
.geo-2 {
	width: 280px;
	height: 280px;
	background: var(--primary);
	opacity: 0.05;
	bottom: -90px;
	left: -90px;
	animation-delay: -2.5s;
}
.geo-3 {
	width: 110px;
	height: 110px;
	border: 2px solid var(--primary);
	background: transparent;
	opacity: 0.18;
	bottom: 170px;
	right: 70px;
	border-radius: 14px;
	transform: rotate(25deg);
	animation-delay: -4s;
}
.geo-4 {
	width: 60px;
	height: 60px;
	background: var(--primary);
	opacity: 0.08;
	top: 210px;
	left: 50px;
	border-radius: 12px;
	transform: rotate(15deg);
	animation-delay: -1s;
}
.geo-5 {
	width: 36px;
	height: 36px;
	border: 2px solid var(--primary);
	background: transparent;
	opacity: 0.22;
	top: 130px;
	right: 190px;
	border-radius: 8px;
	transform: rotate(45deg);
	animation-delay: -3s;
}

@keyframes float {
	0%,
	100% {
		transform: translateY(0px);
	}
	50% {
		transform: translateY(-16px);
	}
}
.geo-3,
.geo-4,
.geo-5 {
	animation-name: floatRotate;
}
@keyframes floatRotate {
	0%,
	100% {
		transform: translateY(0px) rotate(25deg);
	}
	50% {
		transform: translateY(-10px) rotate(33deg);
	}
}

.brand-content {
	position: relative;
	z-index: 2;
	color: inherit;
	max-width: 440px;
	animation: slideUp 0.65s ease both;
}

@keyframes slideUp {
	from {
		opacity: 0;
		transform: translateY(28px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

.brand-logo {
	margin-bottom: 3rem;
}

.brand-headline h1 {
	font-family: "Be Vietnam Pro", sans-serif;
	font-size: 2.7rem;
	font-weight: 900;
	line-height: 1.22;
	margin-bottom: 1.1rem;
	color: var(--text-dark);
	letter-spacing: -0.01em;
}
.brand-headline h1 em {
	font-style: normal;
	color: var(--primary);
}
.brand-headline p {
	font-size: 0.97rem;
	line-height: 1.68;
	color: var(--text-muted);
	max-width: 370px;
	margin-bottom: 2.5rem;
}

.brand-stats {
	display: flex;
	align-items: center;
	gap: 0;
	background: var(--bg-card);
	border-radius: 14px;
	border: 1px solid var(--border);
	box-shadow: var(--shadow-md);
	width: fit-content;
	overflow: hidden;
}
.stat-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 1rem 1.5rem;
}
.stat-num {
	font-family: "Be Vietnam Pro", sans-serif;
	font-size: 1.45rem;
	font-weight: 800;
	color: var(--primary);
	line-height: 1;
}
.stat-desc {
	font-size: 0.7rem;
	color: var(--text-muted);
	margin-top: 0.3rem;
	text-transform: uppercase;
	letter-spacing: 0.07em;
	font-weight: 600;
}
.stat-divider {
	width: 1px;
	height: 40px;
	background: var(--border);
	flex-shrink: 0;
}

.form-panel {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	background: var(--bg-page);
	padding: 3rem 2rem;
}

.form-container {
	width: 100%;
	max-width: 480px;
	background: var(--bg-card);
	border-radius: 18px;
	border: 1px solid var(--border);
	box-shadow: 0 2px 20px rgba(26, 86, 219, 0.08);
	padding: 3rem 2.75rem;
	animation: fadeIn 0.55s ease 0.15s both;
}
@keyframes fadeIn {
	from {
		opacity: 0;
		transform: translateY(16px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

.mobile-logo {
	display: none;
	justify-content: center;
	margin-bottom: 1.75rem;
}

.form-header {
	margin-bottom: 2rem;
	padding-bottom: 1.5rem;
	border-bottom: 1px solid var(--border);
}
.form-header h2 {
	font-family: "Be Vietnam Pro", sans-serif;
	font-size: 1.85rem;
	font-weight: 800;
	color: var(--text-dark);
	margin-bottom: 0.4rem;
	letter-spacing: -0.01em;
}
.form-header p {
	color: var(--text-muted);
	font-size: 0.95rem;
}

.login-form {
	display: flex;
	flex-direction: column;
	gap: 1.35rem;
}

.field-group label {
	display: block;
	font-size: 0.82rem;
	font-weight: 700;
	color: var(--text-dark);
	margin-bottom: 0.5rem;
	text-transform: uppercase;
	letter-spacing: 0.06em;
}
.input-wrap {
	position: relative;
	display: flex;
	align-items: center;
}
.input-wrap input {
	width: 100%;
	height: 52px;
	border: 1.5px solid var(--border);
	border-radius: 10px;
	padding: 0 48px 0 44px;
	font-size: 0.97rem;
	font-family: "DM Sans", sans-serif;
	background: var(--bg-page);

	color: var(--text-dark);
	transition:
		border-color 0.18s,
		box-shadow 0.18s,
		background 0.18s;
	outline: none;
}
.input-wrap input:focus {
	background: var(--bg-card);

	border-color: var(--primary);
	box-shadow: 0 0 0 3px var(--primary-light);
}
.input-icon {
	position: absolute;
	left: 13px;
	color: #b0bac8;
	font-size: 0.85rem;
	pointer-events: none;
	transition: color 0.18s;
	display: flex;
	align-items: center;
}
.input-wrap:focus-within .input-icon {
	color: var(--primary);
}

.toggle-pass {
	position: absolute;
	right: 11px;
	background: none;
	border: none;
	cursor: pointer;
	color: #b0bac8;
	font-size: 0.85rem;
	padding: 4px;
	transition: color 0.18s;
	line-height: 1;
	display: flex;
	align-items: center;
}
.toggle-pass:hover {
	color: var(--primary);
}

.tab-switch {
	display: flex;
	background: #f1f5f9;
	border-radius: var(--radius-md);
	padding: 4px;
	margin-bottom: 1.5rem;
}

.tab-switch button {
	flex: 1;
	padding: 0.5rem;
	border-radius: var(--radius-sm);
	font-size: 0.9rem;
	font-weight: 600;
	color: var(--text-muted);
	background: transparent;
	border: none;
	transition: all 0.2s;
	cursor: pointer;
}

.tab-switch button.active {
	background: var(--bg-card);

	color: var(--primary);
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.form-meta {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-top: 0.15rem;
}
.remember-label {
	display: flex;
	align-items: center;
	gap: 0.45rem;
	cursor: pointer;
	font-size: 0.85rem;
	color: var(--text-muted);
	user-select: none;
}
.remember-label input[type="checkbox"] {
	width: 15px;
	height: 15px;
	accent-color: var(--primary);
	cursor: pointer;
}
.forgot-link {
	font-size: 0.85rem;
	color: var(--primary);
	font-weight: 600;
	text-decoration: none;
	transition: opacity 0.18s;
}
.forgot-link:hover {
	opacity: 0.72;
}

.btn-signin {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 0.55rem;
	width: 100%;
	height: 54px;
	background: var(--primary);
	color: white;
	border: none;
	border-radius: 10px;
	font-family: "Be Vietnam Pro", sans-serif;
	font-size: 1rem;
	font-weight: 700;
	cursor: pointer;
	margin-top: 0.6rem;
	transition:
		background 0.18s,
		box-shadow 0.18s,
		transform 0.12s;
	box-shadow: 0 3px 12px rgba(26, 86, 219, 0.28);
	letter-spacing: 0.02em;
}
.btn-signin:hover:not(:disabled) {
	background: #1648c4;
	box-shadow: 0 6px 20px rgba(26, 86, 219, 0.36);
	transform: translateY(-1px);
}
.btn-signin:active:not(:disabled) {
	transform: translateY(0);
}
.btn-signin:disabled {
	background: #a0b8e6;
	cursor: not-allowed;
	box-shadow: none;
}

.form-footer {
	text-align: center;
	margin-top: 1.5rem;
	padding-top: 1.25rem;
	border-top: 1px solid var(--border);
	font-size: 0.87rem;
	color: var(--text-muted);
}

.form-footer a {
	color: var(--primary);
	font-weight: 700;
	text-decoration: none;
}
.form-footer a:hover {
	text-decoration: underline;
}

@media (max-width: 900px) {
	.brand-panel {
		display: none;
	}
	.form-panel {
		background: var(--bg-page);
		padding: 2rem 1rem;
	}
	.mobile-logo {
		display: flex;
	}
	.form-container {
		max-width: 440px;
		padding: 2.5rem 1.75rem;
	}
	.form-header h2 {
		font-size: 1.6rem;
	}
}
</style>
