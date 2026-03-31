<template>
	<div class="certs-page">
		<div class="page-header-premium animate-fade-in mb-5">
			<div class="header-inner">
				<div class="header-icon-box pulse-glow">
					<Award :size="32" class="animated-icon text-primary" />
				</div>
				<div class="header-info">
					<div class="d-flex align-items-center gap-2 mb-1">
						<span class="badge-glass primary text-primary">THÀNH TÍCH CÁ NHÂN</span>
					</div>
					<h1 class="title-gradient">Chứng Chỉ Của Tôi</h1>
					<p class="desc-text">
						Những thành tích và vinh danh bạn đã đạt được trong quá trình học
						tập.
					</p>
				</div>
			</div>
			<div class="header-actions">
				<button class="btn-glass-refresh" :disabled="loading" @click="fetchCertificates">
					<RotateCcw :size="16" :class="{ spin: loading }" />
					<span>{{ loading ? "Đang đồng bộ..." : "Làm mới dữ liệu" }}</span>
				</button>
			</div>
		</div>

		<div class="controls-bar mb-4 animate-slide-up">
			<div class="search-box glass">
				<Search :size="18" class="search-icon text-muted" />
				<input v-model="searchQuery" type="text" placeholder="Tìm kiếm chứng chỉ theo tên khóa học..." />
			</div>
			<div class="sort-box">
				<select v-model="sortOrder" class="glass-select">
					<option value="newest">Mới nhất</option>
					<option value="oldest">Cũ nhất</option>
				</select>
			</div>
		</div>

		<div v-if="loading" class="loading-state-luxe py-5">
			<div class="luxe-spinner mb-3" />
			<p class="text-secondary fw-bold">Đang kiểm tra chứng chỉ mới...</p>
		</div>

		<div v-else-if="filteredCerts.length > 0" class="certs-grid animate-slide-up" style="animation-delay: 0.1s">
			<div v-for="cert in filteredCerts" :key="cert.id" class="cert-card glass-hover">
				<div class="cert-card-header bg-gradient-emerald">
					<div v-if="isRecentlyIssued(cert.issuedAt)" class="new-cert-badge">
						NEW
					</div>
					<ShieldCheck :size="48" class="badge-icon text-white" />
				</div>

				<div class="cert-card-body">
					<h4 class="cert-title" :title="cert.courseTitle">
						{{ cert.courseTitle }}
					</h4>
					<p class="cert-user">
						<span class="text-secondary">Cấp cho:</span>
						<strong>{{ cert.userName }}</strong>
					</p>

					<div class="cert-meta">
						<div class="meta-item">
							<Calendar :size="14" class="text-primary" />
							<span>Cấp ngày:
								<strong>{{ formatDate(cert.issuedAt) }}</strong></span>
						</div>
						<div class="cert-code-chip">ID: {{ cert.certificateCode }}</div>
					</div>
				</div>

				<div class="cert-card-footer">
					<button class="btn btn-outline-primary btn-sm flex-fill fw-bold"
						@click="copyCertLink(cert.certificateCode)">
						<Copy :size="14" class="me-1" /> Link
					</button>
					<button class="btn btn-primary btn-sm flex-fill fw-bold shadow-sm"
						@click="viewCertificate(cert.certificateCode)">
						<ExternalLink :size="14" class="me-1" /> Xem Online
					</button>
				</div>
			</div>
		</div>

		<div v-else class="empty-state-premium py-5 mt-4 animate-slide-up">
			<div class="empty-icon-glass shadow-sm mb-4">
				<Medal :size="48" class="text-primary opacity-50" />
			</div>
			<h3 class="fw-800 text-dark">Chưa có chứng chỉ nào</h3>
			<p class="text-secondary mb-0">
				Hoàn thành khóa học để nhận chứng chỉ và chứng minh năng lực của bạn!
			</p>
			<button v-if="!loading" class="btn btn-primary mt-4 px-4 fw-bold" @click="fetchCertificates">
				<RotateCcw :size="16" class="me-2" /> Thử kiểm tra lại
			</button>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { certificateAPI } from "@/services/api";
import {
	Medal,
	Award,
	Copy,
	Search,
	ExternalLink,
	Calendar,
	RotateCcw,
	ShieldCheck,
} from "lucide-vue-next";
import { toast } from "vue3-toastify";

const certs = ref([]);
const loading = ref(true);
const searchQuery = ref("");
const sortOrder = ref("newest");

const fetchCertificates = async () => {
	loading.value = true;
	try {
		const { data } = await certificateAPI.getMy();
		certs.value = [...data];
		if (certs.value.length > 0)
			toast.success("Đã cập nhật danh sách chứng chỉ!");
	} catch {
		toast.error("Không thể kết nối máy chủ để lấy dữ liệu.");
	} finally {
		loading.value = false;
	}
};

onMounted(fetchCertificates);

function isRecentlyIssued(dateString) {
	const issuedDate = new Date(dateString);
	const now = new Date();
	const diffInHours = (now - issuedDate) / (1000 * 60 * 60);
	return diffInHours <= 24;
}

const filteredCerts = computed(() => {
	let result = [...certs.value];

	if (searchQuery.value) {
		const q = searchQuery.value.toLowerCase();
		result = result.filter((c) => c.courseTitle.toLowerCase().includes(q));
	}

	result.sort((a, b) => {
		const dateA = new Date(a.issuedAt).getTime();
		const dateB = new Date(b.issuedAt).getTime();
		return sortOrder.value === "newest" ? dateB - dateA : dateA - dateB;
	});

	return result;
});

function formatDate(dateString) {
	if (!dateString) return "N/A";
	return new Date(dateString).toLocaleDateString("vi-VN", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	});
}

async function copyCertLink(code) {
	try {
		await navigator.clipboard.writeText(
			`${window.location.origin}/#/verify/${code}`,
		);
		toast.info("Đã sao chép link xác thực!", {
			position: "bottom-center",
			autoClose: 2000,
		});
	} catch {
		toast.error("Không thể sao chép.");
	}
}

function viewCertificate(code) {
	window.open(`${window.location.origin}/#/verify/${code}`, "_blank");
}
</script>

<style scoped>
.certs-page {
	padding: 0;
	max-width: 1200px;
	margin: 0 auto;
}

.btn-glass-refresh {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 10px 20px;
	background: white;
	border: 1px solid #e2e8f0;
	border-radius: 14px;
	color: #64748b;
	font-weight: 700;
	font-size: 13px;
	cursor: pointer;
	transition: all 0.3s;
	box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.btn-glass-refresh:hover {
	background: #f8fafc;
	color: #4f46e5;
	border-color: #818cf8;
	transform: translateY(-2px);
}

.btn-glass-refresh:disabled {
	opacity: 0.6;
	cursor: not-allowed;
	transform: none;
}

.spin {
	animation: rotate 1.5s linear infinite;
}

@keyframes rotate {
	from {
		transform: rotate(0deg);
	}

	to {
		transform: rotate(360deg);
	}
}

.new-cert-badge {
	position: absolute;
	top: 15px;
	left: 15px;
	background: #ef4444;
	color: white;
	font-size: 10px;
	font-weight: 900;
	padding: 4px 8px;
	border-radius: 6px;
	box-shadow: 0 4px 10px rgba(239, 68, 68, 0.3);
	z-index: 5;
}

.page-header-premium {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.header-inner {
	display: flex;
	align-items: center;
	gap: 20px;
}

.header-icon-box {
	width: 64px;
	height: 64px;
	border-radius: 20px;
	background: rgba(79, 70, 229, 0.1);
	color: #4f46e5;
	display: flex;
	align-items: center;
	justify-content: center;
	border: 1px solid rgba(79, 70, 229, 0.2);
}

.pulse-glow {
	animation: pulse 3s infinite;
}

@keyframes pulse {
	0% {
		box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.4);
	}

	70% {
		box-shadow: 0 0 0 10px rgba(79, 70, 229, 0);
	}

	100% {
		box-shadow: 0 0 0 0 rgba(79, 70, 229, 0);
	}
}

.title-gradient {
	font-size: 32px;
	font-weight: 900;
	background: linear-gradient(90deg, #1e293b, #4f46e5);
	background-clip: text;
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	margin: 0;
	letter-spacing: -0.5px;
}

.desc-text {
	color: #64748b;
	margin-top: 4px;
	font-weight: 500;
	font-size: 15px;
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
	color: #4f46e5;
	border-color: rgba(99, 102, 241, 0.2);
}

.controls-bar {
	display: flex;
	gap: 1.5rem;
	align-items: center;
}

.search-box.glass {
	flex-grow: 1;
	display: flex;
	align-items: center;
	padding: 0.75rem 1.25rem;
	background: white;
	border: 1px solid #e2e8f0;
	border-radius: 14px;
	transition: all 0.3s ease;
}

.search-box.glass:focus-within {
	border-color: #4f46e5;
	box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
}

.search-box input {
	border: none;
	background: transparent;
	outline: none;
	width: 100%;
	color: #1e293b;
	font-size: 0.95rem;
	font-weight: 500;
}

.sort-box .glass-select {
	padding: 0.75rem 1.25rem;
	padding-right: 2.5rem;
	background: white;
	border: 1px solid #e2e8f0;
	border-radius: 14px;
	color: #1e293b;
	font-weight: 600;
	cursor: pointer;
	outline: none;
	appearance: none;
	background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
	background-repeat: no-repeat;
	background-position: right 1rem center;
	background-size: 1em;
}

.certs-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
	gap: 1.5rem;
}

.cert-card.glass-hover {
	background: rgba(255, 255, 255, 0.85);
	backdrop-filter: blur(12px);
	border: 1px solid #e2e8f0;
	border-radius: 20px;
	display: flex;
	flex-direction: column;
	overflow: hidden;
	transition: all 0.3s;
}

.cert-card.glass-hover:hover {
	transform: translateY(-5px);
	border-color: #818cf8;
	box-shadow: 0 20px 40px -10px rgba(79, 70, 229, 0.15);
}

.cert-card-header {
	height: 120px;
	display: flex;
	align-items: center;
	justify-content: center;
	position: relative;
}

.bg-gradient-emerald {
	background: linear-gradient(135deg, #0d9488, #059669);
}

.bg-gradient-emerald::after {
	content: "";
	position: absolute;
	inset: 0;
	background: radial-gradient(circle at top right,
			rgba(255, 255, 255, 0.2),
			transparent 50%);
}

.cert-card-body {
	padding: 1.5rem;
	flex-grow: 1;
	display: flex;
	flex-direction: column;
}

.cert-title {
	font-size: 1.15rem;
	font-weight: 700;
	color: #1e293b;
	margin-bottom: 0.5rem;
	min-height: 3.2em;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
}

.cert-meta {
	margin-top: auto;
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
}

.meta-item {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	font-size: 0.85rem;
	color: #64748b;
}

.cert-code-chip {
	align-self: flex-start;
	background: #f1f5f9;
	border: 1px solid #e2e8f0;
	color: #475569;
	font-size: 0.75rem;
	font-weight: 700;
	padding: 0.35rem 0.75rem;
	border-radius: 8px;
	font-family: monospace;
}

.cert-card-footer {
	padding: 1.25rem 1.5rem;
	border-top: 1px solid #f1f5f9;
	display: flex;
	gap: 0.75rem;
	background: #f8fafc;
}

.loading-state-luxe,
.empty-state-premium {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	text-align: center;
}

.luxe-spinner {
	width: 40px;
	height: 40px;
	border: 4px solid rgba(79, 70, 229, 0.2);
	border-top-color: #4f46e5;
	border-radius: 50%;
	animation: spin 1s linear infinite;
}

.empty-icon-glass {
	width: 90px;
	height: 90px;
	border-radius: 50%;
	background: linear-gradient(135deg,
			rgba(79, 70, 229, 0.05),
			rgba(79, 70, 229, 0.02));
	border: 1px solid rgba(79, 70, 229, 0.1);
	display: flex;
	align-items: center;
	justify-content: center;
}

.animate-fade-in {
	animation: fadeIn 0.8s ease-out forwards;
}

.animate-slide-up {
	animation: slideInUp 0.6s ease-out forwards;
	opacity: 0;
}

@keyframes slideInUp {
	from {
		opacity: 0;
		transform: translateY(20px);
	}

	to {
		opacity: 1;
		transform: translateY(0);
	}
}

@keyframes fadeIn {
	from {
		opacity: 0;
	}

	to {
		opacity: 1;
	}
}

@media (max-width: 768px) {
	.page-header-premium {
		flex-direction: column;
		align-items: flex-start;
		gap: 16px;
	}

	.header-inner {
		flex-direction: column;
		align-items: flex-start;
		gap: 16px;
	}

	.header-icon-box {
		width: 48px;
		height: 48px;
		border-radius: 14px;
	}

	.title-gradient {
		font-size: 26px;
	}

	.desc-text {
		font-size: 14px;
	}

	.controls-bar {
		flex-direction: column;
		align-items: stretch;
		gap: 12px;
	}

	.search-box.glass,
	.glass-select {
		width: 100%;
	}

	.certs-grid {
		grid-template-columns: 1fr;
		gap: 1rem;
	}

	.cert-card-header {
		height: 100px;
	}

	.cert-card-body {
		padding: 1.25rem;
	}

	.cert-card-footer {
		padding: 1rem 1.25rem;
	}
}

/* Dark Mode Overrides */
[data-theme="dark"] .btn-glass-refresh,
[data-theme="dark"] .search-box.glass,
[data-theme="dark"] .sort-box .glass-select {
	background-color: var(--bg-tertiary);
	border-color: var(--border-color);
	color: var(--text-primary);
}

[data-theme="dark"] .btn-glass-refresh:hover {
	background-color: var(--bg-secondary);
	border-color: var(--primary-500);
}

[data-theme="dark"] .cert-card.glass-hover {
	background-color: var(--bg-secondary);
	border-color: var(--border-color);
}

[data-theme="dark"] .cert-title {
	color: var(--text-primary);
}

[data-theme="dark"] .cert-code-chip {
	background-color: var(--bg-tertiary);
	border-color: var(--border-color);
	color: var(--text-secondary);
}

[data-theme="dark"] .cert-card-footer {
	background-color: var(--bg-tertiary);
	border-top-color: var(--border-color);
}

[data-theme="dark"] .btn-outline-primary {
	border-color: var(--primary-500);
	color: var(--primary-400);
}

[data-theme="dark"] .btn-outline-primary:hover {
	background-color: rgba(99, 102, 241, 0.1);
}
</style>
