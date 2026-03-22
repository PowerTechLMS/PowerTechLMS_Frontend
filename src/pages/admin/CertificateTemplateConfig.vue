<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { courseAPI } from "@/services/api";
import {
	ArrowLeft,
	Palette,
	Type,
	Settings2,
	Save,
	Loader2,
	GraduationCap,
	Star,
	ChevronRight,
	Layout,
	MousePointer2,
	Award,
	ShieldCheck,
} from "lucide-vue-next";
import { toast } from "vue3-toastify";

const route = useRoute();
const router = useRouter();
const courseId = route.params.id as string;
const isLoading = ref(false);
const isSaving = ref(false);

const templateForm = ref({
	CourseId: parseInt(courseId),
	TemplateName: "Mẫu chứng chỉ Chuẩn 2026",
	UseBuiltInTemplate: true,
	TitleText: "CHỨNG NHẬN HOÀN THÀNH",
	BodyText: "Vì đã xuất sắc hoàn thành chương trình đào tạo chuyên môn",
	SignatureName: "LMS Administrator",
	SignatureTitle: "Giám đốc Đào tạo",
	PrimaryColor: "#d4af37",
});

onMounted(async () => {
	isLoading.value = true;
	try {
		const res = await courseAPI.getCertificateTemplate(courseId);
		if (res.data) {
			templateForm.value = {
				...templateForm.value,
				...res.data,
			};
		}
	} catch {
	} finally {
		isLoading.value = false;
	}
});

const saveTemplate = async () => {
	isSaving.value = true;
	try {
		await courseAPI.saveCertificateTemplate(courseId, templateForm.value);
		toast.success("Đã lưu cấu hình mẫu chứng chỉ thành công!");
		router.push("/admin/courses");
	} catch {
		toast.error("Có lỗi xảy ra khi lưu mẫu chứng chỉ.");
	} finally {
		isSaving.value = false;
	}
};
</script>

<template>
	<div class="certificate-config-page">
		<div class="page-header mb-5">
			<div class="header-content">
				<div class="header-icon-box pulse-glow">
					<Settings2
						:size="32"
						style="width: 32px; height: 32px"
						class="animated-icon"
					/>
				</div>
				<div>
					<div class="d-flex align-items-center gap-2 mb-1">
						<span class="badge-glass info fs-10 fw-bold">THIẾT KẾ PHÔI</span>
						<span class="fs-12 text-tertiary d-flex align-items-center"
							><ChevronRight :size="12" class="mx-1" /> Cấu hình phôi chứng
							chỉ</span
						>
					</div>
					<h1 class="page-title-gradient">Thiết kế Mẫu Chứng Chỉ</h1>
					<p class="page-desc">
						Tùy biến phôi chứng chỉ sẽ được cấp phát tự động cho học viên sau
						khi hoàn thành khóa học.
					</p>
				</div>
			</div>

			<div class="header-actions">
				<button @click="router.push('/admin/courses')" class="btn-glass-back">
					<ArrowLeft
						:size="18"
						style="width: 18px; height: 18px"
						class="me-2"
					/>
					Danh sách khóa học
				</button>
			</div>
		</div>

		<div v-if="isLoading" class="loading-state-premium py-5 text-center">
			<div class="premium-spinner mx-auto"></div>
			<p class="mt-3 text-muted fw-bold">Đang tải cấu hình chứng chỉ...</p>
		</div>

		<div v-else class="row g-5">
			<div class="col-xl-4 col-lg-5">
				<div class="glass-content-card h-100">
					<div class="glass-card-header-premium p-4 border-bottom-glass">
						<h5 class="fw-bold mb-0 d-flex align-items-center gap-2">
							<Palette :size="20" class="text-primary" /> Thông số hiển thị
						</h5>
					</div>

					<div class="glass-card-body p-4">
						<form @submit.prevent="saveTemplate">
							<div class="form-group-premium mb-4">
								<label class="label-premium mb-2">Tên mẫu chứng chỉ</label>
								<div class="input-glass-wrap">
									<input
										v-model="templateForm.TemplateName"
										type="text"
										class="input-glass-ui"
										placeholder="Mẫu chứng chỉ tiêu chuẩn..."
										required
									/>
									<div class="input-focus-glow"></div>
								</div>
							</div>

							<div class="form-group-premium mb-4">
								<label class="label-premium mb-2">Tiêu đề chính (Title)</label>
								<div class="input-glass-wrap with-icon">
									<Type :size="18" class="input-icon" />
									<input
										v-model="templateForm.TitleText"
										type="text"
										class="input-glass-ui"
										placeholder="XÁC NHẬN HOÀN THÀNH..."
										required
									/>
									<div class="input-focus-glow"></div>
								</div>
							</div>

							<div class="form-group-premium mb-4">
								<label class="label-premium mb-2">Nội dung mô tả (Body)</label>
								<div class="input-glass-wrap">
									<textarea
										v-model="templateForm.BodyText"
										class="input-glass-ui p-3"
										rows="3"
										placeholder="Đã xuất sắc hoàn thành..."
									></textarea>
									<div class="input-focus-glow"></div>
								</div>
								<p class="fs-11 text-tertiary mt-2">
									Các biến <b>[Tên học viên]</b>, <b>[Khóa học]</b> sẽ được điền
									tự động.
								</p>
							</div>

							<div class="row g-3 mb-4">
								<div class="col-6">
									<div class="form-group-premium">
										<label class="label-premium mb-2">Chức danh Ký</label>
										<div class="input-glass-wrap">
											<input
												v-model="templateForm.SignatureTitle"
												type="text"
												class="input-glass-ui sm"
												placeholder="Giám đốc..."
											/>
											<div class="input-focus-glow"></div>
										</div>
									</div>
								</div>
								<div class="col-6">
									<div class="form-group-premium">
										<label class="label-premium mb-2">Họ tên người Ký</label>
										<div class="input-glass-wrap">
											<input
												v-model="templateForm.SignatureName"
												type="text"
												class="input-glass-ui sm"
												placeholder="Nguyễn Văn A..."
											/>
											<div class="input-focus-glow"></div>
										</div>
									</div>
								</div>
							</div>

							<div class="form-group-premium mb-5">
								<label
									class="label-premium mb-3 d-flex align-items-center justify-content-between"
								>
									Màu sắc chủ đạo
									<span class="fs-10 badge-glass info">{{
										templateForm.PrimaryColor
									}}</span>
								</label>
								<div class="color-picker-glass">
									<input
										v-model="templateForm.PrimaryColor"
										type="color"
										class="color-input"
									/>
									<div
										class="color-preview-bar"
										:style="{ background: templateForm.PrimaryColor }"
									></div>
									<MousePointer2 :size="14" class="ms-auto me-3 opacity-50" />
								</div>
							</div>

							<button
								type="submit"
								class="btn-premium-gradient w-100"
								:disabled="isSaving"
							>
								<Loader2 v-if="isSaving" :size="20" class="spinner me-2" />
								<Save v-else :size="20" class="me-2" />
								Lưu cấu hình phôi
							</button>
						</form>
					</div>
				</div>
			</div>

			<div class="col-xl-8 col-lg-7">
				<div class="glass-content-card h-100 bg-premium-light">
					<div
						class="glass-card-header-premium p-4 border-bottom-glass d-flex align-items-center justify-content-between"
					>
						<h5 class="fw-bold mb-0 d-flex align-items-center gap-2">
							<Layout :size="20" class="text-primary" /> Live Preview
						</h5>
						<span class="badge-glass primary">A4 Landscape</span>
					</div>

					<div
						class="glass-card-body p-4 p-md-5 d-flex align-items-center justify-content-start justify-content-xxl-center overflow-auto"
						style="background-color: #f1f5f9"
					>
						<div
							class="cert-modern-container shadow-premium"
							:style="{ '--primary': templateForm.PrimaryColor }"
						>
							<div class="cert-modern-border-outer">
								<div class="cert-modern-border-inner">
									<div class="cert-watermark">
										<Award :size="300" :stroke-width="0.5" />
									</div>

									<div class="cert-content">
										<div class="cert-header-icon">
											<GraduationCap :size="42" />
										</div>

										<h1 class="cert-title">
											{{ templateForm.TitleText || "CHỨNG NHẬN HOÀN THÀNH" }}
										</h1>

										<div class="cert-ornament-line">
											<span class="line"></span>
											<Star :size="12" class="star-icon" />
											<span class="line"></span>
										</div>

										<p class="cert-presented-text">
											Giấy chứng nhận này được trân trọng trao tặng cho
										</p>

										<h2 class="cert-student-name">[Tên Học Viên Tự Động]</h2>

										<p class="cert-body-text">
											{{
												templateForm.BodyText ||
												"Vì đã xuất sắc hoàn thành chương trình đào tạo..."
											}}
										</p>

										<h3 class="cert-course-name">[Tên Khóa Học Tự Động]</h3>

										<div class="cert-footer">
											<div class="cert-footer-col">
												<p class="cert-val text-dark">11/03/2026</p>
												<div class="cert-signature-line"></div>
												<p class="cert-label">NGÀY CẤP PHÁT</p>
											</div>

											<div class="cert-footer-col seal-col">
												<div class="golden-seal">
													<div class="golden-seal-inner">
														<ShieldCheck :size="24" />
														<span>OFFICIAL</span>
													</div>
												</div>
												<div class="cert-id-tag">ID: [Mã Hệ Thống]</div>
											</div>

											<div class="cert-footer-col">
												<p class="cert-val signature-font">
													{{ templateForm.SignatureName || "Người Ký" }}
												</p>
												<div class="cert-signature-line"></div>
												<p class="cert-label">
													{{ templateForm.SignatureTitle || "Chức danh" }}
												</p>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=Great+Vibes&family=Montserrat:wght@400;600;700;800&family=Playfair+Display:ital,wght@0,400;0,700;1,700&display=swap");

.certificate-config-page {
	padding-bottom: 3rem;
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
	-webkit-text-fill-color: transparent;
	margin: 0 0 4px 0;
}
.page-desc {
	color: var(--text-secondary);
	font-size: 15px;
	margin-bottom: 0;
	max-width: 600px;
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

.page-header {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	flex-wrap: wrap;
	gap: 20px;
}
.header-content {
	display: flex;
	align-items: flex-start;
	gap: 24px;
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
	transition: all 0.3s;
}
.btn-glass-back:hover {
	background: white;
	color: var(--primary-600);
	transform: translateX(-4px);
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.glass-content-card {
	background: rgba(255, 255, 255, 0.9);
	backdrop-filter: blur(20px);
	border: 1px solid rgba(0, 0, 0, 0.05);
	border-radius: 28px;
	box-shadow: 0 8px 32px rgba(0, 0, 0, 0.03);
	overflow: hidden;
}
.bg-premium-light {
	background:
		radial-gradient(circle at top right, rgba(99, 102, 241, 0.03), transparent),
		rgba(255, 255, 255, 0.95);
}
.border-bottom-glass {
	border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.label-premium {
	font-size: 11px;
	font-weight: 800;
	color: var(--text-tertiary);
	text-transform: uppercase;
	letter-spacing: 0.1em;
	display: block;
}
.input-glass-wrap {
	position: relative;
}
.input-glass-ui {
	width: 100%;
	padding: 12px 18px;
	border: 1px solid rgba(0, 0, 0, 0.08);
	border-radius: 16px;
	background: rgba(249, 250, 251, 0.5);
	outline: none;
	transition: all 0.3s;
	font-size: 15px;
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
	inset: -3px;
	border-radius: 19px;
	border: 2px solid var(--primary-400);
	opacity: 0;
	transform: scale(0.98);
	transition: all 0.3s;
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
	z-index: 2;
	width: 18px;
	height: 18px;
}
.input-glass-wrap.with-icon .input-glass-ui {
	padding-left: 46px;
}

.color-picker-glass {
	position: relative;
	display: flex;
	align-items: center;
	background: white;
	border: 1px solid rgba(0, 0, 0, 0.08);
	border-radius: 16px;
	padding: 8px;
	cursor: pointer;
	height: 52px;
	overflow: hidden;
}
.color-input {
	position: absolute;
	inset: 0;
	opacity: 0;
	width: 100%;
	height: 100%;
	cursor: pointer;
	z-index: 5;
}
.color-preview-bar {
	width: 44px;
	height: 100%;
	border-radius: 10px;
	border: 1px solid rgba(0, 0, 0, 0.1);
	transition: background 0.3s;
}

.btn-premium-gradient {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	height: 52px;
	padding: 0 24px;
	background: linear-gradient(
		135deg,
		var(--primary-600) 0%,
		var(--primary-500) 100%
	);
	color: white;
	border: none;
	border-radius: 16px;
	font-weight: 800;
	font-size: 15px;
	cursor: pointer;
	transition: all 0.3s;
	box-shadow: 0 8px 25px rgba(99, 102, 241, 0.3);
}
.btn-premium-gradient:hover:not(:disabled) {
	transform: translateY(-3px);
	box-shadow: 0 12px 35px rgba(99, 102, 241, 0.4);
}

.premium-spinner {
	width: 44px;
	height: 44px;
	border: 4px solid var(--primary-50);
	border-top-color: var(--primary-500);
	border-radius: 50%;
	animation: spin 1s linear infinite;
}

.cert-modern-container {
	width: 100%;
	max-width: 900px;
	min-width: 800px;
	background: #ffffff;
	aspect-ratio: 1.414 / 1;
	padding: 14px;
	position: relative;

	--primary-color-fallback: #d4af37;
}
.shadow-premium {
	box-shadow:
		0 25px 50px -12px rgba(15, 23, 42, 0.3),
		0 10px 25px rgba(0, 0, 0, 0.1);
}

.cert-modern-border-outer {
	width: 100%;
	height: 100%;
	border: 10px solid #0f172a;
	padding: 6px;
	background: white;
}

.cert-modern-border-inner {
	width: 100%;
	height: 100%;
	border: 2px solid var(--primary, var(--primary-color-fallback));
	position: relative;
	background: radial-gradient(circle at center, #ffffff 50%, #fdfbf7 100%);
	padding: 30px;
	display: flex;
	flex-direction: column;
	justify-content: center;
	overflow: hidden;
}

.cert-modern-border-inner::before,
.cert-modern-border-inner::after {
	content: "";
	position: absolute;
	width: 24px;
	height: 24px;
	border: 2px solid var(--primary, var(--primary-color-fallback));
}
.cert-modern-border-inner::before {
	top: -12px;
	left: -12px;
	border-radius: 50%;
	background: white;
}
.cert-modern-border-inner::after {
	bottom: -12px;
	right: -12px;
	border-radius: 50%;
	background: white;
}

.cert-watermark {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	color: var(--primary, var(--primary-color-fallback));
	opacity: 0.04;
	pointer-events: none;
	z-index: 0;
}

.cert-content {
	position: relative;
	z-index: 2;
	text-align: center;
	height: 100%;
	display: flex;
	flex-direction: column;
	justify-content: center;
}

.cert-header-icon {
	color: var(--primary, var(--primary-color-fallback));
	margin-bottom: 12px;
}

.cert-title {
	font-family: "Cinzel", serif;
	font-size: 38px;
	font-weight: 800;
	color: #0f172a;
	letter-spacing: 0.1em;
	margin-bottom: 12px;
}

.cert-ornament-line {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 15px;
	margin-bottom: 20px;
}
.cert-ornament-line .line {
	width: 80px;
	height: 1px;
	background: var(--primary, var(--primary-color-fallback));
}
.cert-ornament-line .star-icon {
	color: var(--primary, var(--primary-color-fallback));
	fill: var(--primary, var(--primary-color-fallback));
}

.cert-presented-text {
	font-family: "Montserrat", sans-serif;
	font-size: 13px;
	color: #475569;
	letter-spacing: 0.1em;
	text-transform: uppercase;
	margin-bottom: 15px;
}

.cert-student-name {
	font-family: "Great Vibes", "Playfair Display", cursive;
	font-size: 60px;
	font-weight: 400;
	color: var(--primary, var(--primary-color-fallback));
	margin-bottom: 20px;
	line-height: 1.1;
}

.cert-body-text {
	font-family: "Playfair Display", serif;
	font-size: 16px;
	font-style: italic;
	color: #334155;
	margin-bottom: 12px;
}

.cert-course-name {
	font-family: "Cinzel", serif;
	font-size: 22px;
	font-weight: 700;
	color: #0f172a;
	margin-bottom: 25px;
	padding: 0 40px;
}

.cert-footer {
	display: flex;
	justify-content: space-between;
	align-items: flex-end;
	padding: 0 20px;
	margin-top: auto;
}

.cert-footer-col {
	flex: 1;
	text-align: center;
}

.seal-col {
	flex: 0.8;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: flex-end;
	transform: translateY(5px);
}

.cert-val {
	font-size: 15px;
	font-weight: 600;
	color: #1e293b;
	margin-bottom: 6px;
}
.signature-font {
	font-family: "Great Vibes", cursive;
	font-size: 34px;
	font-weight: 400;
	color: #0f172a;
	transform: translateY(8px);
	margin-bottom: 0;
}

.cert-signature-line {
	width: 160px;
	height: 1px;
	background: #0f172a;
	margin: 0 auto 6px auto;
}
.cert-label {
	font-family: "Montserrat", sans-serif;
	font-size: 10px;
	font-weight: 700;
	color: #64748b;
	letter-spacing: 0.1em;
	margin: 0;
}

.golden-seal {
	width: 90px;
	height: 90px;
	border-radius: 50%;
	background: linear-gradient(135deg, #bf953f, #fcf6ba, #b38728, #fdbf59);
	padding: 4px;
	box-shadow:
		0 5px 15px rgba(212, 175, 55, 0.4),
		inset 0 0 10px rgba(0, 0, 0, 0.1);
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 8px;
}
.golden-seal-inner {
	width: 100%;
	height: 100%;
	border-radius: 50%;
	border: 1px dashed rgba(255, 255, 255, 0.8);
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	color: white;
	text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}
.golden-seal-inner span {
	font-family: "Montserrat", sans-serif;
	font-size: 9px;
	font-weight: 800;
	letter-spacing: 0.1em;
	margin-top: 4px;
}

.cert-id-tag {
	font-family: "monospace";
	font-size: 11px;
	color: #64748b;
	text-align: center;
	letter-spacing: 0.05em;
}

@media (max-width: 991px) {
	.page-header {
		justify-content: center;
		text-align: center;
	}
	.header-content {
		flex-direction: column;
		align-items: center;
	}
}
</style>
