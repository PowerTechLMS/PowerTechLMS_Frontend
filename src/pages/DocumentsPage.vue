<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { toast } from "vue3-toastify";
import {
	Search,
	FileText,
	FilePieChart,
	Clock,
	History,
	Download,
	LayoutGrid,
	List,
	X,
	FileCode,
	CheckCircle2,
	Users,
	Bot,
	Send,
	FileSpreadsheet,
	FileType,
} from "lucide-vue-next";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { documentAPI, documentChatAPI } from "@/services/api";

const documents = ref<any[]>([]);
const loading = ref(true);
const targetDoc = ref<any | null>(null);
const versionHistory = ref<any[]>([]);
const loadingVersions = ref(false);

const searchQuery = ref("");
const selectedTag = ref("");
const selectedFileType = ref("all");
const viewMode = ref<"grid" | "list">("grid");

const currentPage = ref(1);
const itemsPerPage = ref(20);
const totalRecords = ref(0);

const predefinedTags = {
	skills: {
		label: "Kỹ năng & Chuyên môn",
		colorClass: "tag-primary",
		icon: FileText,
		items: [
			"JavaScript",
			"ASP.NET Core",
			"Financial-Analysis",
			"ISO-9001",
			"Leadership",
			"Conflict-Resolution",
		],
	},
	compliance: {
		label: "Tuân thủ & Pháp lý",
		colorClass: "tag-danger",
		icon: CheckCircle2,
		items: [
			"PCCC",
			"HSE",
			"Data-Privacy",
			"GDPR",
			"Cyber-Security",
			"Code-of-Conduct",
		],
	},
	roles: {
		label: "Đối tượng & Phòng ban",
		colorClass: "tag-warning",
		icon: Users,
		items: [
			"Sales",
			"Engineering",
			"Human-Resources",
			"Customer-Success",
			"Intern",
			"Senior",
			"C-Suite",
		],
	},
};

import { useAuthStore } from "@/stores/auth";

const authStore = useAuthStore();

const fetchDocs = async () => {
	loading.value = true;
	try {
		const params: any = {
			page: currentPage.value,
			pageSize: itemsPerPage.value,
		};

		if (searchQuery.value) params.search = searchQuery.value;
		if (selectedTag.value) params.tag = selectedTag.value;

		if (authStore.isInstructor && !authStore.isAdmin) {
			params.manage = true;
		}

		const { data } = await documentAPI.getAll(params);
		let docs = data.items || [];

		if (selectedFileType.value !== "all") {
			docs = docs.filter((d: any) => {
				const ext = d.fileName?.split(".").pop()?.toLowerCase() || "";
				if (selectedFileType.value === "pdf") return ext === "pdf";
				if (selectedFileType.value === "word")
					return ["doc", "docx"].includes(ext);
				if (selectedFileType.value === "excel")
					return ["xls", "xlsx"].includes(ext);
				if (selectedFileType.value === "powerpoint")
					return ["ppt", "pptx"].includes(ext);
				return true;
			});
		}

		documents.value = docs;
		totalRecords.value = data.totalCount || 0;
	} catch {
		toast.error("Không thể tải danh sách tài liệu.");
	} finally {
		loading.value = false;
	}
};

onMounted(fetchDocs);

let searchTimeout: any = null;
const handleSearchInput = () => {
	clearTimeout(searchTimeout);
	searchTimeout = setTimeout(() => {
		currentPage.value = 1;
		fetchDocs();
	}, 500);
};

const filterByTag = (tag: string) => {
	if (selectedTag.value === tag) {
		selectedTag.value = "";
	} else {
		selectedTag.value = tag.trim();
	}
	currentPage.value = 1;
	fetchDocs();
};

const clearFilters = () => {
	searchQuery.value = "";
	selectedTag.value = "";
	selectedFileType.value = "all";
	currentPage.value = 1;
	fetchDocs();
};

const filterByFileType = (type: string) => {
	selectedFileType.value = type;
	currentPage.value = 1;
	fetchDocs();
};

const viewDocument = (docId: number) => {
	window.open(documentAPI.getDownloadUrl(docId), "_blank");
};

const openVersionHistory = async (doc: any) => {
	targetDoc.value = doc;
	loadingVersions.value = true;

	const modalEl = document.getElementById("versionModal");
	if (modalEl && (window as any).bootstrap) {
		new (window as any).bootstrap.Modal(modalEl).show();
	}

	try {
		const { data } = await documentAPI.getVersions(doc.id);
		versionHistory.value = data || [];
	} catch {
		toast.error("Không thể tải lịch sử phiên bản.");
	} finally {
		loadingVersions.value = false;
	}
};

const downloadVersion = (versionId: number) => {
	window.open(documentAPI.getVersionDownloadUrl(versionId), "_blank");
};

const getFileIcon = (fileName: string) => {
	const ext = fileName?.split(".").pop()?.toLowerCase() || "";
	if (ext === "pdf")
		return {
			icon: FileType,
			color: "#ef4444",
			bg: "rgba(239, 68, 68, 0.1)",
			label: "PDF",
		};
	if (["docx", "doc"].includes(ext))
		return {
			icon: FileType,
			color: "#3b82f6",
			bg: "rgba(59, 130, 246, 0.1)",
			label: "WORD",
		};
	if (["xlsx", "xls"].includes(ext))
		return {
			icon: FileSpreadsheet,
			color: "#22c55e",
			bg: "rgba(34, 197, 94, 0.1)",
			label: "EXCEL",
		};
	if (["pptx", "ppt"].includes(ext))
		return {
			icon: FilePieChart,
			color: "#f59e0b",
			bg: "rgba(245, 158, 11, 0.1)",
			label: "PPT",
		};
	return {
		icon: FileCode,
		color: "#64748b",
		bg: "rgba(100, 116, 139, 0.1)",
		label: "FILE",
	};
};

const showChat = ref(false);
const chatLoading = ref(false);
const chatMessages = ref<any[]>([]);
const chatInput = ref("");
const chatScrollContainer = ref<HTMLElement | null>(null);

const openChat = async (doc: any) => {
	targetDoc.value = doc;
	showChat.value = true;
	chatMessages.value = [];
	chatLoading.value = true;
	try {
		const { data } = await documentChatAPI.getAll(doc.id);
		chatMessages.value = data || [];
		scrollToBottom();
	} catch {
		toast.error("Không thể tải lịch sử chat.");
	} finally {
		chatLoading.value = false;
	}
};

const sendChatMessage = async () => {
	if (!chatInput.value.trim() || !targetDoc.value || chatLoading.value) return;

	const userMsg = chatInput.value;
	chatInput.value = "";

	chatMessages.value.push({
		userMessage: userMsg,
		aiResponse: "Đang suy nghĩ...",
		isPending: true,
		createdAt: new Date().toISOString(),
	});

	scrollToBottom();

	try {
		const { data } = await documentChatAPI.sendMessage({
			documentId: targetDoc.value.id,
			message: userMsg,
		});
		chatMessages.value[chatMessages.value.length - 1] = data;
		scrollToBottom();
	} catch {
		toast.error("Lỗi khi gửi tin nhắn.");
		chatMessages.value.pop();
	}
};

const scrollToBottom = () => {
	setTimeout(() => {
		if (chatScrollContainer.value) {
			chatScrollContainer.value.scrollTop =
				chatScrollContainer.value.scrollHeight;
		}
	}, 100);
};

const renderMarkdown = (text: string) => {
	if (!text) return "";
	const rawHtml = marked.parse(text) as string;
	return DOMPurify.sanitize(rawHtml);
};
</script>

<template>
	<div class="explorer-container">
		<div class="page-header-premium animate-fade-in mb-5">
			<div class="header-inner">
				<div class="header-icon-box pulse-glow">
					<FileText :size="32" class="animated-icon text-primary" />
				</div>
				<div class="header-info">
					<div class="d-flex align-items-center gap-2 mb-1">
						<span class="badge-glass primary text-primary">KHO LƯU TRỮ</span>
					</div>
					<h1 class="title-gradient">Thư viện Tài Liệu</h1>
					<p class="desc-text">
						Khám phá và tải xuống các tài nguyên, biểu mẫu và giáo trình nội bộ.
					</p>
				</div>
			</div>
			<div class="header-actions">
				<div class="view-toggles">
					<button
						class="toggle-btn"
						:class="{ active: viewMode === 'grid' }"
						@click="viewMode = 'grid'"
					>
						<LayoutGrid :size="18" />
					</button>
					<button
						class="toggle-btn"
						:class="{ active: viewMode === 'list' }"
						@click="viewMode = 'list'"
					>
						<List :size="18" />
					</button>
				</div>
			</div>
		</div>

		<div class="search-bar-row animate-slide-up">
			<div class="search-box glass">
				<Search :size="18" class="search-icon" />
				<input
					type="text"
					v-model="searchQuery"
					@input="handleSearchInput"
					placeholder="Tìm tệp tin, từ khóa kỹ năng..."
				/>
			</div>

			<div class="file-type-tabs glass">
				<button
					class="type-tab"
					:class="{ active: selectedFileType === 'all' }"
					@click="filterByFileType('all')"
				>
					Tất cả
				</button>
				<button
					class="type-tab"
					:class="{ active: selectedFileType === 'pdf' }"
					@click="filterByFileType('pdf')"
				>
					<span class="dot pdf"></span> PDF
				</button>
				<button
					class="type-tab"
					:class="{ active: selectedFileType === 'word' }"
					@click="filterByFileType('word')"
				>
					<span class="dot word"></span> Word
				</button>
				<button
					class="type-tab"
					:class="{ active: selectedFileType === 'excel' }"
					@click="filterByFileType('excel')"
				>
					<span class="dot excel"></span> Excel
				</button>
			</div>
		</div>

		<div
			class="active-filters-row"
			v-if="selectedTag || selectedFileType !== 'all'"
		>
			<span class="fs-12 text-tertiary fw-bold text-uppercase me-2"
				>Bộ lọc đang bật:</span
			>
			<span v-if="selectedTag" class="filter-chip">
				<FileType :size="12" /> #{{ selectedTag }}
				<X
					:size="14"
					class="ms-1 cursor-pointer"
					@click="
						selectedTag = '';
						fetchDocs();
					"
				/>
			</span>
			<span v-if="selectedFileType !== 'all'" class="filter-chip info">
				<FileType :size="12" /> {{ selectedFileType.toUpperCase() }}
				<X
					:size="14"
					class="ms-1 cursor-pointer"
					@click="
						selectedFileType = 'all';
						fetchDocs();
					"
				/>
			</span>
			<button class="btn-clear-all" @click="clearFilters">Xóa tất cả</button>
		</div>

		<div class="explorer-layout animate-slide-up" style="animation-delay: 0.1s">
			<aside class="explorer-sidebar desktop-only">
				<div class="sidebar-category-card glass">
					<div
						class="category-group"
						v-for="(group, key) in predefinedTags"
						:key="key"
					>
						<div class="category-header">
							<component :is="group.icon" :size="16" />
							<span>{{ group.label }}</span>
						</div>
						<div class="category-items">
							<button
								v-for="tag in group.items"
								:key="tag"
								class="category-link"
								:class="{ active: selectedTag === tag }"
								@click="filterByTag(tag)"
							>
								{{ tag.replace(/-/g, " ") }}
							</button>
						</div>
					</div>
				</div>

				<div class="version-info-card glass mt-4">
					<div class="d-flex align-items-center gap-2 mb-2 text-primary">
						<Clock :size="16" />
						<span class="fw-bold fs-13">Quy định tải về</span>
					</div>
					<p class="fs-12 text-secondary mb-0">
						Tất cả tài liệu thuộc bản quyền nội bộ. Hệ thống tự động ghi lại
						lịch sử tải xuống của từng nhân sự.
					</p>
				</div>
			</aside>

			<main class="explorer-main">
				<div v-if="loading" class="loading-state">
					<div class="premium-loader"></div>
				</div>

				<div
					v-else-if="documents.length"
					:class="['doc-display-wrapper', viewMode]"
				>
					<div
						v-for="doc in documents"
						:key="doc.id"
						class="doc-card glass-hover animate-fade-in"
					>
						<div class="doc-card-top">
							<div
								class="doc-type-icon"
								:style="{
									backgroundColor: getFileIcon(doc.fileName).bg,
									color: getFileIcon(doc.fileName).color,
								}"
							>
								<component :is="getFileIcon(doc.fileName).icon" :size="24" />
							</div>
							<div class="d-flex flex-column align-items-end gap-1">
								<div class="doc-badge">v{{ doc.currentVersionNumber }}.0</div>
								<div
									class="format-badge"
									:style="{ backgroundColor: getFileIcon(doc.fileName).color }"
								>
									{{ getFileIcon(doc.fileName).label }}
								</div>
							</div>
						</div>

						<div class="doc-card-body">
							<h3
								class="doc-title"
								@click="viewDocument(doc.id)"
								:title="doc.title"
							>
								{{ doc.title }}
							</h3>
							<p class="doc-desc">
								{{ doc.description || "Không có mô tả cho tài liệu này." }}
							</p>

							<div class="doc-tags" v-if="doc.tags">
								<span
									v-for="tag in doc.tags.split(',')"
									:key="tag"
									class="tag-chip"
									@click.stop="filterByTag(tag.trim())"
								>
									#{{ tag.trim() }}
								</span>
							</div>
						</div>

						<div class="doc-card-footer">
							<div class="doc-meta">
								<span class="meta-item">
									<Download :size="12" />
									{{ (doc.fileSize / 1024).toFixed(1) }} KB
								</span>
								<span class="meta-item">
									<Clock :size="12" />
									{{ new Date(doc.createdAt).toLocaleDateString("vi-VN") }}
								</span>
							</div>
							<div class="doc-actions">
								<button
									class="action-btn"
									@click="viewDocument(doc.id)"
									title="Tải về"
								>
									<Download :size="16" />
								</button>
								<button
									class="action-btn chat-ai-btn premium-btn-ai"
									@click="openChat(doc)"
									title="Hỏi AI với Chatbot thông minh"
								>
									<Bot :size="16" />
									<span class="btn-label-ai">Hỏi AI</span>
								</button>
								<button
									class="action-btn"
									@click="openVersionHistory(doc)"
									title="Lịch sử"
								>
									<History :size="16" />
								</button>
							</div>
						</div>
					</div>
				</div>

				<div v-else class="empty-explorer glass">
					<Search :size="48" class="empty-icon" />
					<h3>Không tìm thấy tài liệu</h3>
					<p>
						Bạn chưa được cấp quyền truy cập tài liệu này hoặc từ khóa không
						chính xác.
					</p>
					<button class="btn btn-secondary btn-sm mt-3" @click="clearFilters">
						Xóa bộ lọc
					</button>
				</div>
			</main>
		</div>

		<div class="modal fade" id="versionModal" tabindex="-1" aria-hidden="true">
			<div class="modal-dialog modal-md modal-dialog-centered">
				<div class="modal-content border-0 shadow-lg premium-modal">
					<div class="modal-header border-0 pb-0">
						<h5 class="modal-title fw-bold">Lịch sử Phiên bản</h5>
						<button
							type="button"
							class="btn-close"
							data-bs-dismiss="modal"
							aria-label="Close"
						></button>
					</div>
					<div class="modal-body">
						<div v-if="targetDoc" class="target-doc-info mb-4">
							<h6 class="text-primary fw-bold">{{ targetDoc.title }}</h6>
							<p class="text-muted fs-12">
								Danh sách các phiên bản đã được cập nhật
							</p>
						</div>

						<div v-if="loadingVersions" class="text-center py-5">
							<div class="premium-loader mx-auto"></div>
						</div>

						<div v-else class="timeline">
							<div
								v-for="v in versionHistory"
								:key="v.id"
								class="timeline-item"
								:class="{
									active: v.versionNumber === targetDoc?.currentVersionNumber,
								}"
							>
								<div class="timeline-dot"></div>
								<div class="timeline-content">
									<div class="content-top">
										<span class="version-tag">v{{ v.versionNumber }}.0</span>
										<span class="version-date">{{
											new Date(v.createdAt).toLocaleDateString("vi-VN")
										}}</span>
									</div>
									<h4 class="version-filename">{{ v.fileName }}</h4>
									<p class="version-note">
										{{ v.changeNote || "Phiên bản gốc của tài liệu" }}
									</p>
									<button
										class="btn-download-mini"
										@click="downloadVersion(v.id)"
									>
										<Download :size="14" /> Tải phiên bản này
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Document AI Chat Overlay -->
		<div
			v-if="showChat"
			class="chat-overlay animate-fade-in"
			@click.self="showChat = false"
		>
			<div class="chat-container glass shadow-2xl animate-slide-up">
				<div class="chat-header">
					<div class="d-flex align-items-center gap-3">
						<div class="bot-avatar">
							<Bot :size="20" />
						</div>
						<div>
							<h5 class="mb-0 fs-16 fw-bold">Trợ lý AI Tài liệu</h5>
							<p class="mb-0 fs-11 text-secondary" v-if="targetDoc">
								Đang học từ: {{ targetDoc.title }}
							</p>
						</div>
					</div>
					<button class="btn-close-chat" @click="showChat = false">×</button>
				</div>

				<div class="chat-body" ref="chatScrollContainer">
					<div v-if="chatLoading" class="text-center py-4">
						<div class="premium-loader mx-auto scale-75"></div>
					</div>
					<div
						v-else-if="chatMessages.length === 0"
						class="empty-chat text-center py-5"
					>
						<Bot :size="40" class="text-tertiary mb-3 opacity-20" />
						<p class="text-secondary fs-13 px-4">
							Chào bạn! Tôi đã sẵn sàng hỗ trợ bạn tìm hiểu về tài liệu này. Hãy
							đặt câu hỏi bất kỳ nhé.
						</p>
					</div>
					<div v-else class="messages-list">
						<div
							v-for="(chat, index) in chatMessages"
							:key="index"
							class="chat-group"
						>
							<div class="message user">
								<div class="bubble">{{ chat.userMessage }}</div>
							</div>
							<div class="message bot">
								<div
									class="bubble ai-bubble markdown-body"
									v-html="renderMarkdown(chat.aiResponse)"
								></div>
							</div>
						</div>
					</div>
				</div>

				<div class="chat-footer">
					<div class="input-wrapper">
						<input
							v-model="chatInput"
							@keyup.enter="sendChatMessage"
							placeholder="Bạn muốn hỏi gì về tài liệu này?"
							:disabled="chatLoading"
						/>
						<button
							@click="sendChatMessage"
							class="send-btn"
							:disabled="!chatInput.trim()"
						>
							<Send :size="18" />
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
.explorer-container {
	padding: 2rem;
	max-width: var(--content-max-width);
	margin: 0 auto;
}

.page-header-premium {
	display: flex;
	justify-content: space-between;
	align-items: center;
	flex-wrap: wrap;
	gap: 20px;
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

.view-toggles {
	display: flex;
	background: var(--bg-tertiary);
	padding: 4px;
	border-radius: 10px;
	border: 1px solid var(--border-color);
}
.toggle-btn {
	width: 36px;
	height: 36px;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 8px;
	color: var(--text-secondary);
	background: transparent;
	transition: all 0.2s;
	border: none;
}
.toggle-btn.active {
	background: white;
	color: var(--primary-500);
	box-shadow: var(--shadow-sm);
}

.search-bar-row {
	display: flex;
	flex-wrap: wrap;
	gap: 1.5rem;
	margin-bottom: 2.5rem;
	align-items: center;
}
.search-box {
	flex-grow: 1;
	display: flex;
	align-items: center;
	padding: 0.75rem 1.25rem;
	background: var(--bg-card);
	border: 1px solid var(--border-color);
	border-radius: 14px;
	max-width: 500px;
	transition: all 0.3s;
}
.search-box:focus-within {
	border-color: var(--primary-400);
	box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}
.search-icon {
	color: var(--text-tertiary);
	margin-right: 0.75rem;
}
.search-box input {
	border: none;
	background: transparent;
	outline: none;
	width: 100%;
	color: var(--text-primary);
	font-size: 0.95rem;
}
.active-filter-chip {
	animation: fadeIn 0.3s ease-out;
}

.explorer-layout {
	display: grid;
	grid-template-columns: 280px 1fr;
	gap: 2.5rem;
}
@media (max-width: 900px) {
	.explorer-layout {
		grid-template-columns: 1fr;
	}
}

.sidebar-section {
	background: var(--bg-card);
	border: 1px solid var(--border-color);
	border-radius: 18px;
	padding: 1.25rem;
}
.section-label {
	font-size: 0.75rem;
	font-weight: 700;
	color: var(--text-tertiary);
	text-transform: uppercase;
	letter-spacing: 0.05em;
	display: flex;
	align-items: center;
	gap: 0.5rem;
}

.filter-nav {
	list-style: none;
	padding: 0;
	margin: 0;
	display: flex;
	flex-direction: column;
	gap: 0.25rem;
}
.filter-nav.tags-list li {
	padding: 0.5rem 1rem;
	border-radius: 10px;
	cursor: pointer;
	color: var(--text-secondary);
	font-size: 0.85rem;
	font-weight: 600;
	transition: all 0.2s;
}
.filter-nav.tags-list li:hover {
	background: rgba(var(--primary-rgb), 0.04);
	color: var(--text-primary);
	transform: translateX(4px);
}
.filter-nav.tags-list li.active {
	background: var(--primary-500);
	color: white;
	box-shadow: 0 4px 10px rgba(99, 102, 241, 0.2);
}
.tag-hash {
	opacity: 0.5;
	margin-right: 6px;
}

/* Redesigned File Type Tabs (Horizontal) */
.file-type-tabs {
	display: flex;
	padding: 6px;
	gap: 6px;
	border-radius: var(--radius-lg);
	background: var(--bg-card);
	border: 1px solid var(--border-color);
}
.type-tab {
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 10px 18px;
	border-radius: 10px;
	font-size: 13px;
	font-weight: 700;
	color: var(--text-secondary);
	background: transparent;
	border: none;
	cursor: pointer;
	transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.type-tab:hover {
	background: var(--bg-secondary);
	color: var(--text-primary);
}
.type-tab.active {
	background: var(--primary-500);
	color: white;
	box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
}
.type-tab.active .dot {
	border: 1px solid white;
}

.active-filters-row {
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	gap: 10px;
	margin-bottom: 20px;
	padding: 0 4px;
}
.filter-chip {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	padding: 6px 14px;
	background: rgba(99, 102, 241, 0.08);
	border: 1px solid rgba(99, 102, 241, 0.15);
	border-radius: var(--radius-full);
	color: var(--primary-700);
	font-size: 13px;
	font-weight: 700;
}
.filter-chip.info {
	background: rgba(14, 165, 233, 0.08);
	border-color: rgba(14, 165, 233, 0.15);
	color: var(--info-700);
}
.btn-clear-all {
	background: transparent;
	border: none;
	color: var(--text-tertiary);
	font-size: 12px;
	font-weight: 700;
	text-decoration: underline;
	cursor: pointer;
	padding: 4px 8px;
}

/* Sidebar Category Card */
.sidebar-category-card {
	padding: 0;
	overflow: hidden;
	background: var(--bg-card);
	border: 1px solid var(--border-color);
	border-radius: 20px;
}
.category-group {
	border-bottom: 1px solid var(--border-color);
}
.category-group:last-child {
	border-bottom: none;
}
.category-header {
	padding: 16px 20px;
	background: var(--bg-secondary);
	font-size: 12px;
	font-weight: 800;
	color: var(--text-tertiary);
	text-transform: uppercase;
	letter-spacing: 0.05em;
	display: flex;
	align-items: center;
	gap: 10px;
	border-bottom: 1px solid var(--border-color);
}
.category-items {
	padding: 8px;
	display: flex;
	flex-direction: column;
	gap: 2px;
}
.category-link {
	width: 100%;
	text-align: left;
	padding: 10px 14px;
	border-radius: 10px;
	font-size: 13px;
	font-weight: 600;
	color: var(--text-secondary);
	background: transparent;
	border: none;
	cursor: pointer;
	transition: all 0.2s;
}
.category-link:hover {
	background: var(--bg-secondary);
	color: var(--primary-600);
	padding-left: 18px;
}
.category-link.active {
	background: rgba(99, 102, 241, 0.05);
	color: var(--primary-600);
	font-weight: 700;
}

.version-info-card {
	padding: 20px;
	border-radius: 20px;
	border: 1px solid var(--border-color);
	background: linear-gradient(
		135deg,
		var(--bg-card) 0%,
		var(--bg-secondary) 100%
	);
}

.dot {
	width: 10px;
	height: 10px;
	border-radius: 50%;
}
.dot.pdf {
	background: #ef4444;
}
.dot.word {
	background: #3b82f6;
}
.dot.excel {
	background: #22c55e;
}

.format-badge {
	padding: 2px 8px;
	border-radius: 6px;
	font-size: 9px;
	font-weight: 800;
	color: white;
	text-transform: uppercase;
	letter-spacing: 0.5px;
}

.info-box-mini {
	padding: 1.5rem;
	border-radius: 18px;
	background: var(--bg-card);
	border: 1px solid var(--border-color);
	border-left: 4px solid var(--primary-500);
}
.info-title {
	font-size: 0.9rem;
	font-weight: 700;
	margin-bottom: 0.5rem;
	display: flex;
	align-items: center;
	gap: 0.5rem;
	color: var(--text-primary);
}
.info-box-mini p {
	font-size: 0.85rem;
	color: var(--text-secondary);
	line-height: 1.5;
	margin: 0;
}

.doc-display-wrapper.grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
	gap: 1.5rem;
}
.doc-display-wrapper.list {
	display: flex;
	flex-direction: column;
	gap: 1rem;
}

.doc-card {
	background: var(--bg-card);
	border: 1px solid var(--border-color);
	border-radius: 20px;
	padding: 1.5rem;
	display: flex;
	flex-direction: column;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.doc-card:hover {
	transform: translateY(-5px);
	border-color: var(--primary-400);
	box-shadow: var(--shadow-lg);
}

.doc-card-top {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	margin-bottom: 1.25rem;
}
.doc-type-icon {
	width: 52px;
	height: 52px;
	border-radius: 14px;
	display: flex;
	align-items: center;
	justify-content: center;
}
.doc-badge {
	font-size: 0.7rem;
	font-weight: 700;
	background: var(--bg-tertiary);
	color: var(--text-primary);
	padding: 0.25rem 0.6rem;
	border-radius: 6px;
	border: 1px solid var(--border-color);
}

.doc-card-body {
	flex-grow: 1;
}
.doc-title {
	font-size: 1.1rem;
	font-weight: 700;
	color: var(--text-primary);
	margin-bottom: 0.5rem;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
	line-height: 1.4;
	cursor: pointer;
	transition: color 0.2s;
}
.doc-title:hover {
	color: var(--primary-500);
}
.doc-desc {
	font-size: 0.85rem;
	color: var(--text-secondary);
	margin-bottom: 1rem;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
	line-height: 1.5;
}

.doc-tags {
	display: flex;
	flex-wrap: wrap;
	gap: 0.4rem;
	margin-top: 0.5rem;
}
.tag-chip {
	font-size: 0.725rem;
	font-weight: 600;
	color: var(--primary-600);
	background: rgba(var(--primary-rgb), 0.08);
	padding: 0.2rem 0.6rem;
	border-radius: 6px;
	cursor: pointer;
	transition: all 0.2s;
}
.tag-chip:hover {
	background: var(--primary-500);
	color: white;
}

.doc-card-footer {
	margin-top: 1.5rem;
	padding-top: 1rem;
	border-top: 1px solid var(--border-color);
	display: flex;
	justify-content: space-between;
	align-items: center;
}
.doc-meta {
	display: flex;
	flex-direction: column;
	gap: 0.25rem;
}
.meta-item {
	font-size: 0.75rem;
	color: var(--text-tertiary);
	display: flex;
	align-items: center;
	gap: 0.35rem;
}

.doc-actions {
	display: flex;
	gap: 0.5rem;
}
.action-btn {
	width: 32px;
	height: 32px;
	border-radius: 8px;
	display: flex;
	align-items: center;
	justify-content: center;
	background: var(--bg-tertiary);
	color: var(--text-secondary);
	transition: all 0.2s;
	border: none;
}
.action-btn:hover {
	background: var(--primary-500);
	color: white;
	transform: scale(1.1);
}

.list .doc-card {
	flex-direction: row;
	align-items: center;
	padding: 1rem 1.5rem;
}
.list .doc-card-top {
	margin-bottom: 0;
	margin-right: 1.5rem;
}
.list .doc-card-footer {
	margin-top: 0;
	padding-top: 0;
	border-top: none;
	margin-left: auto;
	flex-direction: row;
	gap: 2rem;
}
.list .doc-meta {
	flex-direction: row;
	gap: 1rem;
}
.list .doc-desc {
	display: none;
}

.premium-modal {
	border-radius: 24px;
	background: var(--bg-primary);
}
.timeline {
	position: relative;
	padding-left: 2rem;
}
.timeline::before {
	content: "";
	position: absolute;
	left: 3px;
	top: 0;
	bottom: 0;
	width: 2px;
	background: var(--border-color);
}
.timeline-item {
	position: relative;
	margin-bottom: 2rem;
}
.timeline-item:last-child {
	margin-bottom: 0;
}
.timeline-dot {
	position: absolute;
	left: -29px;
	top: 4px;
	width: 12px;
	height: 12px;
	border-radius: 50%;
	background: white;
	border: 3px solid var(--border-color);
	z-index: 1;
}
.timeline-item.active .timeline-dot {
	border-color: var(--primary-500);
	background: var(--primary-500);
}
.timeline-content {
	background: var(--bg-card);
	border: 1px solid var(--border-color);
	padding: 1.25rem;
	border-radius: 16px;
	transition: all 0.2s;
}
.timeline-item.active .timeline-content {
	border-color: var(--primary-400);
	background: rgba(var(--primary-rgb), 0.02);
}
.content-top {
	display: flex;
	gap: 1rem;
	align-items: center;
	margin-bottom: 0.5rem;
}
.version-tag {
	font-size: 0.7rem;
	font-weight: 700;
	color: var(--primary-500);
	background: rgba(var(--primary-rgb), 0.1);
	padding: 0.2rem 0.5rem;
	border-radius: 4px;
}
.version-date {
	font-size: 0.75rem;
	color: var(--text-tertiary);
}
.version-filename {
	font-size: 0.95rem;
	font-weight: 600;
	color: var(--text-primary);
	margin-bottom: 0.25rem;
}
.version-note {
	font-size: 0.85rem;
	color: var(--text-secondary);
	line-height: 1.5;
	margin-bottom: 1rem;
}
.btn-download-mini {
	background: transparent;
	border: 1px solid var(--border-color);
	color: var(--text-secondary);
	font-size: 0.75rem;
	font-weight: 600;
	padding: 0.4rem 0.8rem;
	border-radius: 8px;
	display: flex;
	align-items: center;
	gap: 0.4rem;
	transition: all 0.2s;
}
.btn-download-mini:hover {
	background: var(--bg-tertiary);
	color: var(--text-primary);
	border-color: var(--text-tertiary);
}

.empty-explorer {
	text-align: center;
	padding: 5rem 2rem;
	border-radius: 20px;
	color: var(--text-secondary);
}
.empty-icon {
	opacity: 0.2;
	margin-bottom: 1.5rem;
}
.loading-state {
	height: 50vh;
	display: flex;
	align-items: center;
	justify-content: center;
}
.animate-fade-in {
	animation: fadeIn 0.8s ease-out forwards;
}
.animate-slide-up {
	animation: slideInUp 0.6s ease-out forwards;
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
.premium-loader {
	width: 40px;
	height: 40px;
	border: 3px solid var(--border-color);
	border-top-color: var(--primary-500);
	border-radius: 50%;
	animation: spin 1s linear infinite;
}
@keyframes spin {
	to {
		transform: rotate(360deg);
	}
}

@media (max-width: 768px) {
	.desktop-only {
		display: none;
	}
	.search-bar-row {
		flex-direction: column;
		align-items: stretch;
	}
}

.chat-ai-btn {
	width: auto !important;
	padding: 0 12px !important;
	gap: 6px;
	background: rgba(139, 92, 246, 0.1) !important;
	color: #8b5cf6 !important;
	border: 1px solid rgba(139, 92, 246, 0.2) !important;
}
.chat-ai-btn:hover {
	background: #8b5cf6 !important;
	color: white !important;
	box-shadow: 0 0 15px rgba(139, 92, 246, 0.4);
}
.btn-label-ai {
	font-size: 11px;
	font-weight: 700;
	letter-spacing: 0.2px;
}
.premium-btn-ai {
	position: relative;
	overflow: hidden;
}
.premium-btn-ai::after {
	content: "";
	position: absolute;
	top: -50%;
	left: -50%;
	width: 200%;
	height: 200%;
	background: linear-gradient(
		45deg,
		transparent,
		rgba(255, 255, 255, 0.3),
		transparent
	);
	transform: rotate(45deg);
	animation: shine 3s infinite;
}
@keyframes shine {
	0% {
		left: -100%;
	}
	100% {
		left: 100%;
	}
}

.chat-overlay {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(15, 23, 42, 0.4);
	backdrop-filter: blur(4px);
	z-index: 9999;
	display: flex;
	align-items: center;
	justify-content: flex-end;
	padding-right: 2rem;
}

.chat-container {
	width: 440px;
	height: 600px;
	background: white;
	border-radius: 24px;
	display: flex;
	flex-direction: column;
	overflow: hidden;
	box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.chat-header {
	padding: 1.25rem 1.5rem;
	background: linear-gradient(90deg, #4f46e5, #8b5cf6);
	color: white;
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.bot-avatar {
	width: 40px;
	height: 40px;
	background: rgba(255, 255, 255, 0.2);
	border-radius: 12px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.btn-close-chat {
	background: rgba(255, 255, 255, 0.1);
	border: none;
	width: 28px;
	height: 28px;
	border-radius: 50%;
	color: white;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 20px;
	transition: all 0.2s;
}
.btn-close-chat:hover {
	background: rgba(255, 255, 255, 0.3);
}

.chat-body {
	flex-grow: 1;
	overflow-y: auto;
	padding: 1.5rem;
	background: #f8fafc;
}

.messages-list {
	display: flex;
	flex-direction: column;
	gap: 1.5rem;
}

.message {
	display: flex;
	flex-direction: column;
}

.message.user {
	align-items: flex-end;
}

.message.bot {
	align-items: flex-start;
}

.bubble {
	max-width: 85%;
	padding: 0.75rem 1rem;
	border-radius: 14px;
	font-size: 14px;
	line-height: 1.5;
	position: relative;
}

.message.user .bubble {
	background: #4f46e5;
	color: white;
	border-bottom-right-radius: 2px;
}

.message.bot .bubble {
	background: white;
	color: #1e293b;
	border: 1px solid #e2e8f0;
	border-bottom-left-radius: 2px;
}

.ai-bubble {
	white-space: pre-line;
}

.chat-footer {
	padding: 1.25rem;
	background: white;
	border-top: 1px solid #f1f5f9;
}

.input-wrapper {
	display: flex;
	background: #f1f5f9;
	border-radius: 12px;
	padding: 4px;
	border: 1px solid transparent;
	transition: all 0.2s;
}
.input-wrapper:focus-within {
	border-color: #4f46e5;
	background: white;
}

.input-wrapper input {
	flex-grow: 1;
	border: none;
	background: transparent;
	padding: 0.5rem 0.75rem;
	outline: none;
	font-size: 14px;
}

.send-btn {
	width: 36px;
	height: 36px;
	border-radius: 8px;
	background: #4f46e5;
	color: white;
	border: none;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.2s;
}
.send-btn:hover:not(:disabled) {
	background: #4338ca;
	transform: scale(1.05);
}
.send-btn:disabled {
	opacity: 0.5;
	background: #94a3b8;
}

@media (max-width: 480px) {
	.chat-overlay {
		padding-right: 0;
	}
	.chat-container {
		width: 100%;
		height: 100%;
		border-radius: 0;
	}
}

/* Markdown Styles */
.markdown-body :deep(p) {
	margin-bottom: 0.5rem;
}
.markdown-body :deep(ul),
.markdown-body :deep(ol) {
	margin-bottom: 0.5rem;
	padding-left: 1.25rem;
}
.markdown-body :deep(li) {
	margin-bottom: 0.25rem;
}
.markdown-body :deep(h1),
.markdown-body :deep(h2),
.markdown-body :deep(h3) {
	margin-top: 1rem;
	margin-bottom: 0.5rem;
	font-weight: 700;
	font-size: 1.1rem;
}
.markdown-body :deep(strong) {
	font-weight: 800;
	color: #4f46e5;
}
.markdown-body :deep(code) {
	background: rgba(0, 0, 0, 0.05);
	padding: 0.2rem 0.4rem;
	border-radius: 4px;
	font-family: monospace;
}
</style>
