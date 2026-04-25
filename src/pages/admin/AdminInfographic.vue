<script setup>
import { ref, watch, onMounted } from "vue";
import { courseAPI, adminAiAPI } from "@/services/api";
import { useAuthStore } from "@/stores/auth";
import {
	Sparkles,
	Image as ImageIcon,
	BookOpen,
	ChevronRight,
	Download,
	Loader2,
	AlertCircle,
	History,
	Plus,
	Trash2,
	X,
	FileText,
} from "lucide-vue-next";

const authStore = useAuthStore();
const activeTab = ref("create"); // 'create' or 'gallery'

// Create Tab State
const courses = ref([]);
const selectedCourseId = ref(null);
const selectedCourse = ref(null);
const selectedLessonIds = ref([]);
const isLoadingCourses = ref(false);
const isGenerating = ref(false);
const currentResult = ref(null);
const error = ref(null);

// Gallery Tab State
const savedInfographics = ref([]);
const isLoadingGallery = ref(false);
const totalInfographics = ref(0);
const galleryPage = ref(1);
const selectedInfographic = ref(null);

onMounted(async () => {
	await fetchCourses();
	await fetchGallery();
});

const fetchCourses = async () => {
	isLoadingCourses.value = true;
	try {
		const res = await courseAPI.getAll({ pageSize: 100 });
		courses.value = res.data.items;
	} catch {
		error.value = "Không thể tải danh sách khóa học.";
	} finally {
		isLoadingCourses.value = false;
	}
};

const fetchGallery = async () => {
	isLoadingGallery.value = true;
	try {
		const res = await adminAiAPI.getInfographics({
			page: galleryPage.value,
			pageSize: 12,
		});
		savedInfographics.value = res.data.items;
		totalInfographics.value = res.data.total;
	} catch {
		// Silent
	} finally {
		isLoadingGallery.value = false;
	}
};

watch(selectedCourseId, async (newId) => {
	selectedLessonIds.value = [];
	currentResult.value = null;
	error.value = null;
	if (!newId) {
		selectedCourse.value = null;
		return;
	}

	isLoadingCourses.value = true;
	try {
		const res = await courseAPI.getById(newId);
		selectedCourse.value = res.data;
	} catch {
		error.value = "Không thể tải chi tiết khóa học.";
	} finally {
		isLoadingCourses.value = false;
	}
});

const toggleLesson = (lessonId) => {
	const index = selectedLessonIds.value.indexOf(lessonId);
	if (index === -1) {
		selectedLessonIds.value.push(lessonId);
	} else {
		selectedLessonIds.value.splice(index, 1);
	}
};

const isLessonSelected = (lessonId) =>
	selectedLessonIds.value.includes(lessonId);

const generateInfographic = async () => {
	if (selectedLessonIds.value.length === 0) return;

	isGenerating.value = true;
	currentResult.value = null;
	error.value = null;

	try {
		const payload = {
			toolName: "generate_infographic",
			argumentsJson: JSON.stringify({ lessonIds: selectedLessonIds.value }),
			adminId: authStore.user.id,
		};

		const res = await adminAiAPI.executeTool(payload);

		if (res.data && res.data.success) {
			currentResult.value = res.data.data;
			await fetchGallery(); // Refresh gallery
		} else {
			error.value =
				res.data?.message || "Có lỗi xảy ra trong quá trình tạo Infographic.";
		}
	} catch {
		error.value = "Lỗi kết nối máy chủ AI.";
	} finally {
		isGenerating.value = false;
	}
};

const deleteInfographic = async (id) => {
	if (!confirm("Bạn có chắc chắn muốn xóa Infographic này?")) return;

	try {
		await adminAiAPI.deleteInfographic(id);
		await fetchGallery();
		if (selectedInfographic.value?.id === id) {
			selectedInfographic.value = null;
		}
	} catch {
		alert("Không thể xóa Infographic.");
	}
};

const downloadImage = (url, name) => {
	const link = document.createElement("a");
	link.href = url;
	link.download = name || "infographic.jpg";
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
};

const formatDate = (dateStr) => {
	return new Date(dateStr).toLocaleDateString("vi-VN", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
};

const getLessonTypeIcon = (type) => {
	if (type === "Video") return ImageIcon;
	return FileText;
};

const getFullUrl = (path) => {
	if (!path) return "";
	if (path.startsWith("http")) return path;
	const baseUrl = import.meta.env.VITE_API_URL || "";
	return baseUrl + path;
};
</script>

<template>
	<div class="infographic-page">
		<div class="page-header glass">
			<div class="header-left">
				<div class="icon-box">
					<Sparkles class="icon-magic" />
				</div>
				<div>
					<h1>Quản lý Infographic AI</h1>
					<p>Sáng tạo và lưu trữ tóm tắt kiến thức bằng hình ảnh</p>
				</div>
			</div>
			<div class="header-right tabs glass">
				<button
					class="tab-btn"
					:class="{ active: activeTab === 'create' }"
					@click="activeTab = 'create'"
				>
					<Plus :size="18" /> Tạo mới
				</button>
				<button
					class="tab-btn"
					:class="{ active: activeTab === 'gallery' }"
					@click="activeTab = 'gallery'"
				>
					<History :size="18" /> Thư viện
				</button>
			</div>
		</div>

		<div v-if="activeTab === 'create'" class="main-layout fade-in">
			<!-- Selector -->
			<aside class="selector-card glass">
				<div class="card-section">
					<label class="section-label"
						><BookOpen :size="16" /> Chọn Khóa học</label
					>
					<div
						v-if="isLoadingCourses && !courses.length"
						class="loading-inline"
					>
						<Loader2 class="spin" :size="16" /> Đang tải...
					</div>
					<select v-else v-model="selectedCourseId" class="modern-select">
						<option :value="null">-- Chọn một khóa học --</option>
						<option v-for="c in courses" :key="c.id" :value="c.id">
							{{ c.title }}
						</option>
					</select>
				</div>

				<div v-if="selectedCourse" class="course-content-tree custom-scrollbar">
					<div
						v-for="mod in selectedCourse.modules"
						:key="mod.id"
						class="module-group"
					>
						<h4 class="module-title">{{ mod.title }}</h4>
						<div class="lessons-list">
							<template v-for="ls in mod.lessons" :key="ls.id">
								<div
									v-if="ls.type === 'Video' || ls.type === 'Text'"
									class="lesson-item"
									:class="{ active: isLessonSelected(ls.id) }"
									@click="toggleLesson(ls.id)"
								>
									<div class="checkbox-box">
										<div
											class="inner-check"
											v-if="isLessonSelected(ls.id)"
										></div>
									</div>
									<div class="lesson-icon">
										<component :is="getLessonTypeIcon(ls.type)" :size="14" />
									</div>
									<span class="lesson-name">{{ ls.title }}</span>
								</div>
							</template>
						</div>
					</div>
				</div>
				<div v-else class="empty-selection">
					<AlertCircle :size="32" />
					<p>Vui lòng chọn một khóa học</p>
				</div>

				<div class="action-footer" v-if="selectedLessonIds.length > 0">
					<button
						@click="generateInfographic"
						class="btn-generate full-width"
						:disabled="isGenerating"
					>
						<template v-if="isGenerating">
							<Loader2 class="spin" /> Đang xử lý...
						</template>
						<template v-else>
							<Sparkles /> Tạo cho {{ selectedLessonIds.length }} bài học
						</template>
					</button>
				</div>
			</aside>

			<!-- Visual Area -->
			<main class="visual-container">
				<div
					v-if="!currentResult && !isGenerating"
					class="placeholder-state no-bg"
				>
					<div v-if="savedInfographics.length > 0" class="history-quick-view">
						<div class="section-header-history">
							<History :size="20" />
							<h3>Lịch sử gần đây</h3>
						</div>
						<div class="history-grid mini custom-scrollbar">
							<div
								v-for="img in savedInfographics.slice(0, 6)"
								:key="img.id"
								class="mini-item glass"
								@click="currentResult = img"
							>
								<img :src="getFullUrl(img.imageUrl)" />
								<div class="mini-meta">
									<span>{{ formatDate(img.createdAt) }}</span>
								</div>
							</div>
						</div>
						<button class="view-all-btn" @click="activeTab = 'gallery'">
							Xem tất cả thư viện <ChevronRight :size="16" />
						</button>
					</div>
					<div v-else class="empty-history-placeholder">
						<div class="hero-icon">
							<div class="icon-ring"></div>
							<ImageIcon :size="48" />
						</div>
						<h2>Bắt đầu sáng tạo</h2>
						<p>
							Chọn các bài giảng từ danh sách bên trái. AI sẽ tổng hợp kiến thức
							từ tất cả các bài đã chọn để tạo nên một Infographic duy nhất.
						</p>
					</div>
				</div>

				<div v-else class="working-area">
					<div v-if="error" class="error-box glass">
						<AlertCircle /> {{ error }}
					</div>

					<div v-if="isGenerating" class="generating-state glass flex-1">
						<div class="process-anim">
							<div class="dot"></div>
							<div class="dot"></div>
							<div class="dot"></div>
						</div>
						<h3>AI đang tổng hợp nội dung...</h3>
						<p>
							Chúng tôi đang xử lý dữ liệu từ {{ selectedLessonIds.length }} bài
							học để thiết kế bản phác thảo tối ưu.
						</p>
					</div>

					<div v-if="currentResult" class="result-display fade-in">
						<div class="result-header-actions">
							<button class="back-link" @click="currentResult = null">
								<ChevronRight class="rotate-180" /> Quay lại lịch sử
							</button>
						</div>
						<div class="image-wrapper glass image-main">
							<img
								:src="getFullUrl(currentResult.imageUrl)"
								alt="AI Generated Infographic"
								@click="downloadImage(getFullUrl(currentResult.imageUrl))"
							/>
							<button
								@click="downloadImage(getFullUrl(currentResult.imageUrl))"
								class="btn-download"
								title="Tải xuống"
							>
								<Download />
							</button>
						</div>
					</div>
				</div>
			</main>
		</div>

		<!-- Gallery Tab -->
		<div v-else class="gallery-layout fade-in">
			<div
				v-if="isLoadingGallery && !savedInfographics.length"
				class="loading-full glass"
			>
				<Loader2 class="spin" :size="48" />
				<p>Đang tải thư viện...</p>
			</div>

			<div v-else-if="!savedInfographics.length" class="empty-gallery glass">
				<ImageIcon :size="64" />
				<h3>Chưa có Infographic nào</h3>
				<p>
					Hãy bắt đầu tạo những hình ảnh tóm tắt đầu tiên của bạn ở tab "Tạo
					mới".
				</p>
				<button class="btn-generate mt-4" @click="activeTab = 'create'">
					<Plus /> Tạo ngay
				</button>
			</div>

			<div v-else class="gallery-grid custom-scrollbar">
				<div
					v-for="img in savedInfographics"
					:key="img.id"
					class="gallery-item glass"
					@click="selectedInfographic = img"
				>
					<div class="img-preview">
						<img :src="getFullUrl(img.imageUrl)" />
					</div>
					<div class="img-meta">
						<span class="img-date">{{ formatDate(img.createdAt) }}</span>
						<span class="lesson-count">{{ img.lessons?.length }} bài học</span>
					</div>
					<div class="item-actions">
						<button
							class="action-btn delete"
							@click.stop="deleteInfographic(img.id)"
						>
							<Trash2 :size="16" />
						</button>
					</div>
				</div>
			</div>
		</div>

		<!-- Image Detail Modal -->
		<div
			v-if="selectedInfographic"
			class="modal-overlay"
			@click="selectedInfographic = null"
		>
			<div class="modal-content glass" @click.stop>
				<button class="close-btn" @click="selectedInfographic = null">
					<X />
				</button>
				<div class="modal-body">
					<div class="modal-image">
						<img :src="getFullUrl(selectedInfographic.imageUrl)" />
						<button
							@click="downloadImage(getFullUrl(selectedInfographic.imageUrl))"
							class="btn-download-modal"
						>
							<Download /> Tải xuống bản gốc
						</button>
					</div>
					<div class="modal-info custom-scrollbar">
						<div class="info-section">
							<label>Ngày tạo</label>
							<span>{{ formatDate(selectedInfographic.createdAt) }}</span>
						</div>
						<div
							class="info-section"
							v-if="selectedInfographic.lessons?.length"
						>
							<label
								>Nguồn từ các bài học ({{
									selectedInfographic.lessons.length
								}})</label
							>
							<div class="source-list">
								<div
									v-for="ls in selectedInfographic.lessons"
									:key="ls.id"
									class="source-item"
								>
									<component :is="getLessonTypeIcon(ls.type)" :size="14" />
									<span>{{ ls.title }}</span>
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
.infographic-page {
	padding: 30px;
	height: calc(100vh - 64px);
	display: flex;
	flex-direction: column;
	gap: 25px;
	background: #f1f5f9;
	overflow: hidden;
}

.glass {
	background: rgba(255, 255, 255, 0.7);
	backdrop-filter: blur(12px);
	border: 1px solid rgba(255, 255, 255, 0.3);
	box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.05);
}

.page-header {
	padding: 15px 30px;
	border-radius: 20px;
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.header-left {
	display: flex;
	align-items: center;
	gap: 20px;
}

.icon-box {
	width: 50px;
	height: 50px;
	background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
	border-radius: 14px;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 10px 20px rgba(99, 102, 241, 0.2);
}

.icon-magic {
	color: white;
	width: 24px;
	height: 24px;
}

h1 {
	font-size: 1.4rem;
	font-weight: 800;
	margin: 0;
	color: #1e293b;
}

.header-left p {
	margin: 4px 0 0;
	color: #64748b;
	font-size: 0.9rem;
}

.tabs {
	display: flex;
	padding: 6px;
	border-radius: 14px;
	gap: 4px;
}

.tab-btn {
	padding: 8px 16px;
	border-radius: 10px;
	border: none;
	background: transparent;
	color: #64748b;
	font-weight: 700;
	font-size: 0.9rem;
	display: flex;
	align-items: center;
	gap: 8px;
	cursor: pointer;
	transition: all 0.3s;
}

.tab-btn.active {
	background: white;
	color: #6366f1;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.main-layout,
.gallery-layout {
	display: flex;
	gap: 25px;
	flex: 1;
	overflow: hidden;
}

/* Sidebar Selector */
.selector-card {
	width: 380px;
	border-radius: 24px;
	display: flex;
	flex-direction: column;
	overflow: hidden;
}

.card-section {
	padding: 24px;
	border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.section-label {
	display: flex;
	align-items: center;
	gap: 8px;
	font-weight: 700;
	margin-bottom: 12px;
	color: #475569;
}

.modern-select {
	width: 100%;
	padding: 12px 16px;
	border-radius: 12px;
	border: 1px solid #e2e8f0;
	background: #fff;
	font-weight: 600;
	color: #1e293b;
	outline: none;
	transition: all 0.3s;
}

.modern-select:focus {
	border-color: #6366f1;
	box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}

.course-content-tree {
	flex: 1;
	padding: 10px 20px;
	overflow-y: auto;
}

.empty-selection {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	color: #94a3b8;
	gap: 15px;
	padding: 40px;
	text-align: center;
}

.empty-selection p {
	font-weight: 600;
	margin: 0;
}

.module-title {
	font-size: 0.85rem;
	font-weight: 800;
	color: #94a3b8;
	text-transform: uppercase;
	margin: 20px 0 10px 10px;
	letter-spacing: 0.5px;
}

.lessons-list {
	display: flex;
	flex-direction: column;
	gap: 4px;
}

.lesson-item {
	padding: 10px 12px;
	border-radius: 10px;
	display: flex;
	align-items: center;
	gap: 12px;
	cursor: pointer;
	transition: all 0.2s;
}

.lesson-item:hover:not(.disabled) {
	background: rgba(99, 102, 241, 0.05);
}

.lesson-item.active {
	background: white;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.lesson-item.disabled {
	opacity: 0.3;
	cursor: not-allowed;
}

.checkbox-box {
	width: 18px;
	height: 18px;
	border: 2px solid #cbd5e1;
	border-radius: 5px;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.2s;
}

.lesson-item.active .checkbox-box {
	border-color: #6366f1;
	background: #6366f1;
}

.inner-check {
	width: 8px;
	height: 8px;
	background: white;
	border-radius: 1px;
}

.lesson-icon {
	color: #64748b;
}

.lesson-item.active .lesson-icon {
	color: #6366f1;
}

.lesson-name {
	flex: 1;
	font-size: 0.9rem;
	font-weight: 600;
	color: #334155;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.action-footer {
	padding: 20px;
	background: white;
	border-top: 1px solid #f1f5f9;
}

.full-width {
	width: 100%;
	justify-content: center;
}

/* Visual Area */
.visual-container {
	flex: 1;
	display: flex;
	flex-direction: column;
	overflow: hidden;
}

.placeholder-state {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	border-radius: 24px;
	text-align: center;
	padding: 40px;
}

.placeholder-state.no-bg {
	background: transparent;
	border: none;
	box-shadow: none;
}

.history-quick-view {
	width: 100%;
	max-width: 900px;
}

.section-header-history {
	display: flex;
	align-items: center;
	gap: 10px;
	margin-bottom: 20px;
}

.section-header-history h3 {
	margin: 0;
	font-size: 1.1rem;
	font-weight: 800;
	color: #1e293b;
}

.history-grid.mini {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
	gap: 20px;
	max-height: 500px;
	overflow-y: auto;
	padding: 10px;
	margin-bottom: 30px;
	align-items: start;
}

.mini-item {
	position: relative;
	border-radius: 16px;
	overflow: hidden;
	cursor: pointer;
	transition: all 0.3s;
	aspect-ratio: 16/9;
}

.mini-item:hover {
	transform: translateY(-5px) scale(1.02);
	box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
}

.mini-item img {
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.mini-meta {
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	padding: 10px;
	background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
}

.mini-meta span {
	color: white;
	font-size: 0.75rem;
	font-weight: 600;
}

.view-all-btn {
	padding: 10px 20px;
	border: 1px solid #e2e8f0;
	background: white;
	color: #6366f1;
	font-weight: 700;
	border-radius: 12px;
	cursor: pointer;
	display: flex;
	align-items: center;
	gap: 8px;
	margin: 0 auto;
	transition: all 0.3s;
}

.view-all-btn:hover {
	background: #6366f1;
	color: white;
}

.empty-history-placeholder {
	display: flex;
	flex-direction: column;
	align-items: center;
}

.hero-icon {
	position: relative;
	margin-bottom: 30px;
	color: #6366f1;
}

.icon-ring {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	width: 100px;
	height: 100px;
	border: 2px dashed #cbd5e1;
	border-radius: 50%;
	animation: spin-anim 10s linear infinite;
}

.result-header-actions {
	margin-bottom: 10px;
}

.back-link {
	background: transparent;
	border: none;
	color: #64748b;
	font-weight: 700;
	display: flex;
	align-items: center;
	gap: 5px;
	cursor: pointer;
	transition: color 0.3s;
}

.back-link:hover {
	color: #6366f1;
}

.rotate-180 {
	transform: rotate(180deg);
}

.working-area {
	display: flex;
	flex-direction: column;
	gap: 20px;
	height: 100%;
}

.btn-generate {
	padding: 12px 24px;
	background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
	color: white;
	border: none;
	border-radius: 14px;
	font-weight: 700;
	display: flex;
	align-items: center;
	gap: 10px;
	cursor: pointer;
	transition: all 0.3s;
	box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
}

.btn-generate:hover:not(:disabled) {
	transform: translateY(-2px);
	box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4);
}

.btn-generate:disabled {
	opacity: 0.6;
	cursor: wait;
}

.result-display {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 20px;
	overflow-y: auto;
	padding-right: 5px;
}

.image-wrapper {
	position: relative;
	border-radius: 20px;
	padding: 15px;
	background: white;
	display: flex;
	align-items: center;
	justify-content: center;
}

.image-main {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	overflow: hidden;
}

.image-wrapper img {
	max-width: 100%;
	max-height: calc(100vh - 350px);
	object-fit: contain;
	border-radius: 12px;
	cursor: zoom-in;
	box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.btn-download {
	position: absolute;
	top: 30px;
	right: 30px;
	width: 44px;
	height: 44px;
	border-radius: 22px;
	background: rgba(255, 255, 255, 0.9);
	border: none;
	color: #1e293b;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
	transition: all 0.3s;
}

.btn-download:hover {
	background: #6366f1;
	color: white;
	transform: scale(1.1);
}

/* Gallery Layout */
.gallery-layout {
	flex-direction: column;
}

.gallery-grid {
	flex: 1;
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
	gap: 25px;
	padding-bottom: 20px;
	overflow-y: auto;
	align-items: start;
}

.gallery-item {
	position: relative;
	border-radius: 20px;
	padding: 12px;
	cursor: pointer;
	transition: all 0.3s;
}

.gallery-item:hover {
	transform: translateY(-8px);
	background: white;
	box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.img-preview {
	aspect-ratio: 16/9;
	border-radius: 14px;
	overflow: hidden;
	background: #f8fafc;
	margin-bottom: 12px;
}

.img-preview img {
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.img-meta {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.img-date {
	font-size: 0.8rem;
	color: #94a3b8;
	font-weight: 600;
}

.lesson-count {
	padding: 2px 8px;
	background: #f1f5f9;
	border-radius: 6px;
	font-size: 0.75rem;
	font-weight: 800;
	color: #475569;
}

.item-actions {
	position: absolute;
	top: 20px;
	right: 20px;
	display: flex;
	gap: 8px;
	opacity: 0;
	transition: opacity 0.3s;
}

.gallery-item:hover .item-actions {
	opacity: 1;
}

.action-btn {
	width: 32px;
	height: 32px;
	border-radius: 10px;
	border: none;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	backdrop-filter: blur(4px);
}

.action-btn.delete {
	background: rgba(239, 68, 68, 0.9);
	color: white;
}

/* Modal */
.modal-overlay {
	position: fixed;
	inset: 0;
	background: rgba(0, 0, 0, 0.4);
	backdrop-filter: blur(8px);
	z-index: 1000;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 40px;
}

.modal-content {
	width: 100%;
	max-width: 1200px;
	max-height: 90vh;
	border-radius: 30px;
	position: relative;
	overflow: hidden;
	background: white;
}

.close-btn {
	position: absolute;
	top: 20px;
	right: 20px;
	width: 40px;
	height: 40px;
	border-radius: 20px;
	background: #f8fafc;
	border: none;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 10;
}

.modal-body {
	display: flex;
	height: 90vh;
}

.modal-image {
	flex: 2;
	background: #1e293b;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 40px;
	position: relative;
}

.modal-image img {
	max-width: 100%;
	max-height: 100%;
	border-radius: 12px;
	box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
}

.btn-download-modal {
	margin-top: 25px;
	padding: 12px 24px;
	background: rgba(255, 255, 255, 0.1);
	color: white;
	border: 1px solid rgba(255, 255, 255, 0.2);
	border-radius: 12px;
	font-weight: 700;
	cursor: pointer;
	display: flex;
	align-items: center;
	gap: 10px;
}

.modal-info {
	flex: 1;
	background: white;
	padding: 40px;
	overflow-y: auto;
}

.info-section {
	margin-bottom: 30px;
}

.info-section label {
	display: block;
	font-size: 0.8rem;
	font-weight: 800;
	color: #94a3b8;
	text-transform: uppercase;
	margin-bottom: 8px;
}

.info-section span {
	font-size: 1.1rem;
	font-weight: 700;
	color: #1e293b;
}

.source-list {
	display: flex;
	flex-direction: column;
	gap: 10px;
}

.source-item {
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 10px;
	background: #f8fafc;
	border-radius: 10px;
	font-weight: 600;
	color: #475569;
}

.summary-text {
	line-height: 1.8;
	color: #334155;
	background: #f1f5f9;
	padding: 20px;
	border-radius: 16px;
	font-size: 0.95rem;
}

/* Animations */
.generating-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	border-radius: 24px;
	padding: 40px;
	text-align: center;
}

.process-anim {
	display: flex;
	gap: 10px;
	margin-bottom: 25px;
}

.dot {
	width: 12px;
	height: 12px;
	background: #6366f1;
	border-radius: 50%;
	animation: dotPulse 1.5s infinite ease-in-out;
}

.dot:nth-child(2) {
	animation-delay: 0.2s;
}
.dot:nth-child(3) {
	animation-delay: 0.4s;
}

@keyframes dotPulse {
	0%,
	100% {
		transform: scale(0.6);
		opacity: 0.4;
	}
	50% {
		transform: scale(1.2);
		opacity: 1;
	}
}

.spin {
	animation: spin-anim 1s linear infinite;
}
@keyframes spin-anim {
	from {
		transform: rotate(0deg);
	}
	to {
		transform: rotate(360deg);
	}
}

.fade-in {
	animation: fadeInUp 0.4s ease-out forwards;
}
@keyframes fadeInUp {
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
	width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
	background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
	background: #cbd5e1;
	border-radius: 10px;
}
</style>
