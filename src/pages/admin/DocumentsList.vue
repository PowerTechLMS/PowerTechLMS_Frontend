<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { documentAPI } from "@/services/api";
import { toast } from "vue3-toastify";
import axios from "axios";
import mammoth from "mammoth";
import * as XLSX from "xlsx";
import {
	Search,
	FileText,
	History,
	Download,
	LayoutGrid,
	List,
	Filter,
	Pencil,
	Trash2,
	Plus,
	Eye,
	FileCode,
	Award,
	ChevronRight,
	Calendar,
	User,
	FileDigit,
	BarChart3,
	X,
} from "lucide-vue-next";

const router = useRouter();

const documents = ref<any[]>([]);
const loading = ref(true);

const isHistoryModalOpen = ref(false);
const targetDoc = ref<any | null>(null);
const versionHistory = ref<any[]>([]);
const loadingVersions = ref(false);

const isPreviewModalOpen = ref(false);
const previewUrl = ref("");
const previewTitle = ref("");
const previewExt = ref("");
const previewHtml = ref("");
const isRendering = ref(false);

const searchQuery = ref("");
const selectedFormat = ref("all");
const selectedTag = ref("all");
const viewMode = ref<"grid" | "list">("grid");

const allTags = computed(() => {
	const tagsSet = new Set<string>();
	documents.value.forEach(doc => {
		if (doc.tags) {
			doc.tags.split(',').forEach((t: string) => tagsSet.add(t.trim()));
		}
	});
	return Array.from(tagsSet).sort();
});

const fetchDocs = async () => {
	loading.value = true;
	try {
		const timestamp = new Date().getTime();
		const { data } = await documentAPI.getAll({
			page: 1,
			pageSize: 100,
			_t: timestamp,
			manage: true,
		});
		documents.value = data.items || data || [];
	} catch {
		toast.error("Không thể tải danh sách tài liệu.");
	} finally {
		loading.value = false;
	}
};

onMounted(() => {
	fetchDocs();
});

const filteredDocs = computed(() => {
	return documents.value.filter((doc) => {
		const title = doc.title || "";
		const tags = doc.tags || "";
		const fileName = doc.fileName || "";

		const matchesSearch =
			title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
			tags.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
			fileName.toLowerCase().includes(searchQuery.value.toLowerCase());

		const matchesFormat = selectedFormat.value === "all" || (() => {
			const ext = fileName.split(".").pop()?.toLowerCase();
			if (selectedFormat.value === "pdf") return ext === "pdf";
			if (selectedFormat.value === "word") return ["doc", "docx"].includes(ext || "");
			if (selectedFormat.value === "excel") return ["xls", "xlsx"].includes(ext || "");
			return true;
		})();

		const matchesTag = selectedTag.value === "all" || tags.toLowerCase().includes(selectedTag.value.toLowerCase());

		return matchesSearch && matchesFormat && matchesTag;
	});
});

const stats = computed(() => {
	const total = documents.value.length;
	const pdf = documents.value.filter((d) =>
		d.fileName?.toLowerCase().endsWith(".pdf"),
	).length;
	const docx = documents.value.filter(
		(d) =>
			d.fileName?.toLowerCase().endsWith(".doc") ||
			d.fileName?.toLowerCase().endsWith(".docx"),
	).length;
	const xlsx = documents.value.filter(
		(d) =>
			d.fileName?.toLowerCase().endsWith(".xls") ||
			d.fileName?.toLowerCase().endsWith(".xlsx"),
	).length;
	return { total, pdf, docx, xlsx };
});

const viewDocument = async (docId: number) => {
	const doc = documents.value.find((d) => d.id === docId);
	if (!doc) return;

	const ext = doc.fileName?.split(".").pop()?.toLowerCase() || "";
	const url = documentAPI.getPreviewUrl(docId);

	previewTitle.value = doc.title;
	previewExt.value = ext;
	previewUrl.value = url;
	previewHtml.value = "";
	isPreviewModalOpen.value = true;

	if (ext === "pdf") {
		return;
	}

	if (["docx", "doc", "xlsx", "xls"].includes(ext)) {
		isRendering.value = true;
		try {
			const token = localStorage.getItem("lms_token");
			const response = await axios.get(url, {
				responseType: "arraybuffer",
				headers: { Authorization: `Bearer ${token}` },
			});

			if (ext === "docx" || ext === "doc") {
				const result = await mammoth.convertToHtml({
					arrayBuffer: response.data,
				});
				previewHtml.value =
					result.value ||
					"<p class='text-center p-5'>Không có nội dung hiển thị.</p>";
			} else {
				const workbook = XLSX.read(new Uint8Array(response.data), {
					type: "array",
				});
				const firstSheetName = workbook.SheetNames[0];
				const worksheet = workbook.Sheets[firstSheetName];
				previewHtml.value = XLSX.utils.sheet_to_html(worksheet);
			}
		} catch {
			toast.error("Không thể tạo bản xem trước cho tệp này.");
			previewHtml.value =
				"<div class='text-center p-5'><p class='text-danger fw-bold'>Lỗi render tài liệu.</p></div>";
		} finally {
			isRendering.value = false;
		}
	}
};

const closePreview = () => {
	isPreviewModalOpen.value = false;
	previewUrl.value = "";
	previewTitle.value = "";
	previewHtml.value = "";
	isRendering.value = false;
};

const openVersionHistory = async (doc: any) => {
	targetDoc.value = doc;
	isHistoryModalOpen.value = true;
	loadingVersions.value = true;

	try {
		const { data } = await documentAPI.getVersions(doc.id);
		versionHistory.value = data || [];
	} catch {
		toast.error("Không thể tải lịch sử phiên bản.");
	} finally {
		loadingVersions.value = false;
	}
};

const closeVersionHistory = () => {
	isHistoryModalOpen.value = false;
	setTimeout(() => {
		targetDoc.value = null;
		versionHistory.value = [];
	}, 300);
};

const editDocument = (docId: number) => {
	router.push(`/admin/documents/edit/${docId}`);
};

const deleteDocument = async (docId: number) => {
	if (!confirm("Bạn có chắc chắn muốn xóa tài liệu này?")) return;
	try {
		await documentAPI.delete(docId);
		toast.success("Đã xóa tài liệu thành công.");
		fetchDocs();
	} catch {
		toast.error("Lỗi khi xóa tài liệu.");
	}
};

const downloadVersion = (versionId: number) => {
	const url = documentAPI.getVersionDownloadUrl(versionId);
	window.open(url, "_blank");
};

const getFileIcon = (fileName: string) => {
	const ext = fileName?.split(".").pop()?.toLowerCase() || "";
	if (ext === "pdf")
		return {
			icon: FileDigit,
			color: "#ef4444",
			border: "rgba(239, 68, 68, 0.2)",
			bg: "rgba(239, 68, 68, 0.08)",
		};
	if (["docx", "doc"].includes(ext))
		return {
			icon: FileText,
			color: "#3b82f6",
			border: "rgba(59, 130, 246, 0.2)",
			bg: "rgba(59, 130, 246, 0.08)",
		};
	if (["xlsx", "xls"].includes(ext))
		return {
			icon: BarChart3,
			color: "#10b981",
			border: "rgba(16, 185, 129, 0.2)",
			bg: "rgba(16, 185, 129, 0.08)",
		};
	return {
		icon: FileCode,
		color: "#6366f1",
		border: "rgba(99, 102, 241, 0.2)",
		bg: "rgba(99, 102, 241, 0.08)",
	};
};
</script>

<template>
	<div class="documents-explorer-page">
		<div class="page-header mb-5">
			<div class="header-content">
				<div class="header-icon-box pulse-glow">
					<FileText
						:size="32"
						style="width: 32px; height: 32px; min-width: 32px"
					/>
				</div>
				<div>
					<div class="d-flex align-items-center gap-2 mb-1">
						<span class="badge-glass primary fs-10 fw-bold">KHO LƯU TRỮ</span>
						<span class="fs-12 text-tertiary d-flex align-items-center"
							><ChevronRight :size="12" class="mx-1" /> Tài liệu học tập</span
						>
					</div>
					<h1 class="page-title-gradient">Quản lý Kho tài liệu</h1>
					<p class="page-desc">
						Phân phối, điều phối và quản lý phiên bản tài nguyên học tập nội bộ.
					</p>
				</div>
			</div>

			<div class="header-actions">
				<button
					@click="router.push('/admin/documents/add')"
					class="btn-premium-gradient"
				>
					<Plus :size="20" style="width: 20px; height: 20px" class="me-2" /> Tải
					lên tài liệu
				</button>
			</div>
		</div>

		<div class="glass-content-card mb-4 overflow-visible">
			<div
				class="glass-controls-bar d-flex align-items-center justify-content-between flex-wrap gap-4"
			>
				<div class="d-flex align-items-center gap-4 flex-grow-1">
					<div class="glass-search">
						<Search
							:size="18"
							class="animated-icon me-2"
							style="width: 18px; height: 18px"
						/>
						<input
							type="text"
							v-model="searchQuery"
							placeholder="Tìm tên tệp, tiêu đề hoặc thẻ..."
							class="search-input-premium"
						/>
					</div>

					<div class="tabs-glass-nav border-0 p-0 bg-transparent flex-wrap">
						<button
							class="tab-glass-btn"
							:class="{ active: selectedFormat === 'all' }"
							@click="selectedFormat = 'all'"
						>
							Tất cả
						</button>
						<button
							class="tab-glass-btn"
							:class="{ active: selectedFormat === 'pdf' }"
							@click="selectedFormat = 'pdf'"
						>
							PDF
						</button>
						<button
							class="tab-glass-btn"
							:class="{ active: selectedFormat === 'word' }"
							@click="selectedFormat = 'word'"
						>
							Word
						</button>
						<button
							class="tab-glass-btn"
							:class="{ active: selectedFormat === 'excel' }"
							@click="selectedFormat = 'excel'"
						>
							Excel
						</button>
					</div>
				</div>

				<div class="view-mode-toggle">
					<button
						class="view-btn"
						:class="{ active: viewMode === 'grid' }"
						@click="viewMode = 'grid'"
					>
						<LayoutGrid :size="18" style="width: 18px; height: 18px" />
					</button>
					<button
						class="view-btn"
						:class="{ active: viewMode === 'list' }"
						@click="viewMode = 'list'"
					>
						<List :size="18" style="width: 18px; height: 18px" />
					</button>
				</div>
			</div>
		</div>

		<div class="row g-4 mb-5">
			<div class="col-xl-3 col-lg-4 desktop-only">
				<div class="glass-sidebar-card p-4 h-100 flex-column">
					<div class="sidebar-section-premium mb-4">
						<h6 class="sidebar-label mb-3">
							<Filter :size="14" class="me-2" /> ĐỊNH DẠNG TỆP
						</h6>
						<div class="explorer-nav-list">
							<div
								class="nav-item-glass"
								:class="{ active: selectedFormat === 'all' }"
								@click="selectedFormat = 'all'"
							>
								<LayoutGrid :size="18" class="me-3" />
								<span>Tất cả tài liệu</span>
								<span class="count-badge">{{ stats.total }}</span>
							</div>
							<div
								class="nav-item-glass"
								:class="{ active: selectedFormat === 'pdf' }"
								@click="selectedFormat = 'pdf'"
							>
								<FileDigit :size="18" class="me-3 text-danger" />
								<span>Tệp tin PDF</span>
								<span class="count-badge">{{ stats.pdf }}</span>
							</div>
							<div
								class="nav-item-glass"
								:class="{ active: selectedFormat === 'word' }"
								@click="selectedFormat = 'word'"
							>
								<FileText :size="18" class="me-3 text-primary" />
								<span>Văn bản Word</span>
								<span class="count-badge">{{ stats.docx }}</span>
							</div>
							<div
								class="nav-item-glass"
								:class="{ active: selectedFormat === 'excel' }"
								@click="selectedFormat = 'excel'"
							>
								<BarChart3 :size="18" class="me-3 text-success" />
								<span>Bảng tính Excel</span>
								<span class="count-badge">{{ stats.xlsx }}</span>
							</div>
						</div>
					</div>

					<div class="sidebar-section-premium mb-4" v-if="allTags.length">
						<h6 class="sidebar-label mb-3">
							<Award :size="14" class="me-2" /> CHỦ ĐỀ TÀI LIỆU
						</h6>
						<div class="tags-cloud-glass">
							<div 
								class="tag-item-btn" 
								:class="{ active: selectedTag === 'all' }"
								@click="selectedTag = 'all'"
							>
								#Tất-cả
							</div>
							<div 
								v-for="tag in allTags" 
								:key="tag"
								class="tag-item-btn"
								:class="{ active: selectedTag === tag }"
								@click="selectedTag = tag"
							>
								#{{ tag }}
							</div>
						</div>
					</div>

					<div class="info-card-premium mt-auto">
						<div class="d-flex align-items-center gap-2 mb-3">
							<div class="info-icon-box">
								<Award :size="18" />
							</div>
							<h6 class="fw-bold mb-0">Tình trạng tài liệu</h6>
						</div>
						<div class="info-row-glass">
							<span class="label">Sẵn dùng:</span>
							<span class="val">{{ stats.total }} tệp</span>
						</div>
						<div class="info-row-glass border-0">
							<span class="label">Cập nhật:</span>
							<span class="val text-primary fw-bold">Gần đây</span>
						</div>
					</div>
				</div>
			</div>

			<div class="col-xl-9 col-lg-8 col-md-12">
				<div v-if="loading" class="loading-state-glass py-5">
					<div class="premium-spinner"></div>
					<p class="mt-3 text-muted fw-bold">Đang tải kho tài liệu...</p>
				</div>

				<template v-else-if="filteredDocs.length">
					<div v-if="viewMode === 'grid'" class="explorer-grid fade-in">
						<div
							v-for="doc in filteredDocs"
							:key="doc.id"
							class="premium-glass-card doc-box"
						>
							<div class="doc-card-top p-4">
								<div class="d-flex justify-content-between align-items-start">
									<div
										class="doc-type-icon-box"
										:style="{
											backgroundColor: getFileIcon(doc.fileName).bg,
											color: getFileIcon(doc.fileName).color,
											borderColor: getFileIcon(doc.fileName).border,
										}"
									>
										<component
											:is="getFileIcon(doc.fileName).icon"
											:size="24"
											style="width: 24px; height: 24px"
										/>
									</div>
									<div class="doc-version-badge">
										v{{ doc.currentVersionNumber || 1 }}.0
									</div>
								</div>

								<div class="doc-content mt-4">
									<h3 class="doc-title-ui" @click="viewDocument(doc.id)">
										{{ doc.title }}
									</h3>
									<p class="doc-desc-ui text-truncate-2">
										{{ doc.description || "Chưa có mô tả tài liệu." }}
									</p>
								</div>

								<div class="doc-tags-row mt-3" v-if="doc.tags">
									<span
										v-for="tag in doc.tags.split(',')"
										:key="tag"
										class="tag-glass-ui"
										>#{{ tag.trim() }}</span
									>
								</div>
							</div>

							<div class="doc-card-footer-ui px-4 py-3 mt-auto">
								<div
									class="d-flex align-items-center justify-content-between mb-3 text-tertiary fs-11"
								>
									<span class="d-flex align-items-center"
										><Calendar :size="12" class="me-1" />
										{{
											new Date(doc.createdAt).toLocaleDateString("vi-VN")
										}}</span
									>
									<span class="d-flex align-items-center"
										><User :size="12" class="me-1" />
										{{ doc.uploadedByName || "Hệ thống" }}</span
									>
								</div>
								<div class="doc-actions-grid g-2">
									<button
										class="doc-act-btn view"
										@click="viewDocument(doc.id)"
										title="Xem"
									>
										<Eye :size="16" />
									</button>
									<button
										class="doc-act-btn edit"
										@click="editDocument(doc.id)"
										title="Sửa"
									>
										<Pencil :size="16" />
									</button>
									<button
										class="doc-act-btn history"
										@click="openVersionHistory(doc)"
										title="Lịch sử"
									>
										<History :size="16" />
									</button>
									<button
										class="doc-act-btn delete"
										@click="deleteDocument(doc.id)"
										title="Xóa"
									>
										<Trash2 :size="16" />
									</button>
								</div>
							</div>
						</div>
					</div>

					<div v-else class="glass-table-container fade-in">
						<table class="glass-table-ui">
							<thead>
								<tr>
									<th class="ps-4">Tài liệu</th>
									<th class="text-center">Phiên bản</th>
									<th>Người tải</th>
									<th>Ngày đăng</th>
									<th class="text-center pe-4">Thao tác</th>
								</tr>
							</thead>
							<tbody>
								<tr v-for="doc in filteredDocs" :key="doc.id">
									<td class="ps-4">
										<div class="d-flex align-items-center gap-3">
											<div
												class="doc-type-icon-sm"
												:style="{
													backgroundColor: getFileIcon(doc.fileName).bg,
													color: getFileIcon(doc.fileName).color,
												}"
											>
												<component
													:is="getFileIcon(doc.fileName).icon"
													:size="16"
												/>
											</div>
											<div>
												<div
													class="fw-bold fs-14 clickable-title"
													style="color: var(--text-primary)"
													@click="viewDocument(doc.id)"
												>
													{{ doc.title }}
												</div>
												<div class="fs-12 text-tertiary">
													{{ doc.fileName }}
												</div>
											</div>

										</div>
									</td>
									<td class="text-center">
										<span class="badge-v-ui"
											>v{{ doc.currentVersionNumber || 1 }}.0</span
										>
									</td>
									<td class="fs-13 fw-semi-bold">
										{{ doc.uploadedByName || "Hệ thống" }}
									</td>
									<td class="fs-12 text-tertiary">
										{{ new Date(doc.createdAt).toLocaleDateString("vi-VN") }}
									</td>
									<td class="text-center pe-4">
										<div class="d-flex justify-content-center gap-1">
											<button
												class="btn-ghost-icon primary"
												@click="viewDocument(doc.id)"
												title="Xem"
											>
												<Eye :size="16" />
											</button>
											<button
												class="btn-ghost-icon info"
												@click="editDocument(doc.id)"
												title="Sửa"
											>
												<Pencil :size="16" />
											</button>
											<button
												class="btn-ghost-icon warning"
												@click="openVersionHistory(doc)"
												title="Lịch sử"
											>
												<History :size="16" />
											</button>
											<button
												class="btn-ghost-icon danger"
												@click="deleteDocument(doc.id)"
												title="Xóa"
											>
												<Trash2 :size="16" />
											</button>
										</div>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</template>

				<div v-else class="glass-empty-state">
					<div class="empty-icon-box mb-4">
						<Search :size="40" class="text-tertiary opacity-50" />
					</div>
					<h4 class="fw-bold mb-2">Không tìm thấy tài liệu</h4>
					<p class="text-tertiary fs-14 mb-4">
						Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm của bạn.
					</p>
					<button
						class="btn-premium-gradient px-4"
						@click="router.push('/admin/documents/add')"
					>
						Tải lên tài liệu mới
					</button>
				</div>
			</div>
		</div>

		<teleport to="body">
			<div
				v-if="isHistoryModalOpen"
				class="custom-modal-overlay"
				@click="closeVersionHistory"
			>
				<div class="custom-modal-dialog glass-modal" @click.stop>
					<div class="modal-header border-bottom-glass py-4 px-4">
						<div class="flex-grow-1">
							<div class="d-flex align-items-center justify-content-between mb-1">
								<h5
									class="modal-title fw-bold d-flex align-items-center gap-2 mb-0"
									style="color: var(--text-primary)"
								>
									<History :size="22" class="text-primary" /> Lịch sử Phiên bản
								</h5>
								<button
									type="button"
									class="btn-close-premium"
									@click="closeVersionHistory"
								>
									<X :size="20" />
								</button>
							</div>
							<p v-if="targetDoc" class="text-tertiary fs-13 mb-0">
								Tài liệu: {{ targetDoc.title }}
							</p>
						</div>
					</div>

					<div class="modal-body p-4 scroll-glass">
						<div v-if="loadingVersions" class="text-center py-5">
							<div class="premium-spinner mx-auto"></div>
							<p class="mt-3 text-tertiary fs-13">
								Đang tải các phiên bản cũ...
							</p>
						</div>

						<div
							v-else-if="versionHistory.length === 0"
							class="text-center py-4 text-muted"
						>
							Chưa có lịch sử phiên bản nào được ghi nhận.
						</div>

						<div v-else class="glass-timeline">
							<div
								v-for="v in versionHistory"
								:key="v.id"
								class="timeline-step"
								:class="{
									active: v.versionNumber === targetDoc?.currentVersionNumber,
								}"
							>
								<div class="timeline-marker"></div>
								<div class="timeline-glass-card">
									<div
										class="d-flex justify-content-between align-items-center mb-2"
									>
										<span
											class="v-tag-ui"
											:class="{ current: v.versionNumber === targetDoc?.currentVersionNumber }"
										>
											<span class="v-tag-num">Phiên bản {{ v.versionNumber }}.0</span>
											<span
												v-if="v.versionNumber === targetDoc?.currentVersionNumber"
												class="v-tag-label"
											>
												(Hiện tại)
											</span>
										</span>
										<span class="v-date-ui">{{
											new Date(v.createdAt).toLocaleDateString("vi-VN")
										}}</span>
									</div>
									<h6 class="v-filename fw-bold mb-2 fs-15 text-white">
										{{ v.fileName }}
									</h6>
									<p class="v-note text-tertiary fs-13 mb-4">
										{{ v.changeNote || "Phiên bản đầu tiên" }}
									</p>
									<button
										class="btn-download-glass"
										@click="downloadVersion(v.id)"
									>
										<Download :size="14" class="me-2" />
										<span>Tải xuống bản này</span>
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</teleport>

		<teleport to="body">
			<div
				v-if="isPreviewModalOpen"
				class="preview-overlay"
				@click="closePreview"
			>
				<div class="preview-container glass-modal" @click.stop>
					<div class="preview-header">
						<div class="d-flex align-items-center gap-3">
							<div class="preview-icon"><FileText :size="20" /></div>
							<h6 class="mb-0 fw-bold">{{ previewTitle }}</h6>
						</div>
						<div class="d-flex align-items-center gap-2">
							<a
								:href="previewUrl.replace('preview=true', 'preview=false')"
								target="_blank"
								class="btn-download-sm"
								title="Tải xuống"
							>
								<Download :size="16" />
							</a>
							<button class="btn-close-preview" @click="closePreview">
								<X :size="20" />
							</button>
						</div>
					</div>
					<div class="preview-body">
						<div v-if="isRendering" class="rendering-state">
							<div class="premium-spinner border-primary"></div>
							<p class="mt-3 fw-bold text-primary">
								Đang kết xuất bản xem trước...
							</p>
						</div>
						<iframe
							v-else-if="previewExt === 'pdf'"
							:src="previewUrl"
							class="preview-iframe"
						></iframe>
						<div
							v-else
							class="preview-html-container scroll-glass"
							v-html="previewHtml"
						></div>
					</div>
				</div>
			</div>
		</teleport>
	</div>
</template>

<style scoped>
.documents-explorer-page {
	padding-bottom: 3rem;
	animation: fadeIn 0.4s ease-out;
}
.page-title-gradient {
	font-size: 32px;
	font-weight: 800;
	letter-spacing: -0.02em;
	background: linear-gradient(90deg, var(--text-primary), var(--text-secondary));
	background-clip: text;
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
.clickable-title:hover {
	color: var(--primary-600);
	cursor: pointer;
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
.btn-premium-gradient {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	height: 48px;
	padding: 0 24px;
	background: linear-gradient(
		135deg,
		var(--primary-600) 0%,
		var(--primary-500) 100%
	);
	color: white;
	border: none;
	border-radius: 16px;
	font-weight: 700;
	font-size: 15px;
	cursor: pointer;
	transition: all 0.3s;
	box-shadow: 0 4px 15px rgba(99, 102, 241, 0.25);
}
.btn-premium-gradient:hover {
	transform: translateY(-3px);
	box-shadow: 0 8px 25px rgba(99, 102, 241, 0.35);
}

.glass-content-card {
	background: var(--bg-card);
	backdrop-filter: blur(24px);
	border-radius: 32px;
	border: 1px solid var(--border-color);
	box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.1);
}
.glass-controls-bar {
	padding: 24px 32px;
	border-bottom: 1px solid var(--border-color);
	background: rgba(255, 255, 255, 0.02);
}

.glass-search {
	display: flex;
	align-items: center;
	background: var(--bg-secondary);
	border: 1px solid var(--border-color);
	border-radius: 16px;
	padding: 4px 18px;
	transition: all 0.3s;
	width: 320px;
}
.glass-search:focus-within {
	border-color: var(--primary-400);
	box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}
.search-input-premium {
	flex: 1;
	border: none;
	background: transparent;
	padding: 10px 0;
	font-size: 14px;
	outline: none;
	color: var(--text-primary);
}
.animated-icon {
	color: var(--text-tertiary);
	transition: color 0.3s;
}
.glass-search:focus-within .animated-icon {
	color: var(--primary-500);
}

.tabs-glass-nav {
	display: flex;
	gap: 8px;
	background: var(--bg-secondary);
	padding: 4px;
	border-radius: 14px;
}
.tab-glass-btn {
	border: none;
	background: transparent;
	padding: 8px 18px;
	font-size: 13px;
	font-weight: 700;
	color: var(--text-tertiary);
	border-radius: 10px;
	transition: all 0.2s;
}
.tab-glass-btn.active {
	background: var(--bg-card);
	color: var(--primary-600);
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.view-mode-toggle {
	display: flex;
	gap: 6px;
	background: var(--bg-secondary);
	padding: 4px;
	border-radius: 14px;
}
.view-btn {
	width: 38px;
	height: 38px;
	border: none;
	background: transparent;
	color: var(--text-tertiary);
	border-radius: 10px;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.2s;
}
.view-btn.active {
	background: var(--bg-card);
	color: var(--primary-600);
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.glass-sidebar-card {
	background: var(--bg-card);
	backdrop-filter: blur(20px);
	border: 1px solid var(--border-color);
	border-radius: 24px;
	box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
	display: flex;
}
.sidebar-label {
	font-size: 11px;
	font-weight: 800;
	color: var(--text-tertiary);
	letter-spacing: 0.1em;
}
.nav-item-glass {
	display: flex;
	align-items: center;
	padding: 12px 16px;
	border-radius: 12px;
	cursor: pointer;
	color: var(--text-secondary);
	font-size: 14px;
	font-weight: 600;
	transition: all 0.2s;
	margin-bottom: 4px;
}
.nav-item-glass:hover {
	background: var(--bg-secondary);
	color: var(--text-primary);
}
.nav-item-glass.active {
	background: var(--bg-card);
	color: var(--primary-600);
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}
.count-badge {
	margin-left: auto;
	font-size: 10px;
	font-weight: 800;
	background: var(--bg-secondary);
	padding: 2px 8px;
	border-radius: 20px;
	color: var(--text-tertiary);
}
.nav-item-glass.active .count-badge {
	background: var(--primary-50);
	color: var(--primary-600);
}

.info-card-premium {
	background: var(--bg-card);
	border: 1px solid var(--border-color);
	border-radius: 20px;
	padding: 20px;
	box-shadow: 0 4px 15px rgba(0, 0, 0, 0.02);
}
.info-icon-box {
	width: 32px;
	height: 32px;
	border-radius: 8px;
	background: var(--primary-50);
	color: var(--primary-600);
	display: flex;
	align-items: center;
	justify-content: center;
}
.info-row-glass {
	display: flex;
	justify-content: space-between;
	padding: 10px 0;
	border-bottom: 1px dashed var(--border-color);
	font-size: 13px;
}
.info-row-glass .label {
	color: var(--text-tertiary);
}
.info-row-glass .val {
	font-weight: 700;
	color: var(--text-primary);
}

.explorer-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
	gap: 20px;
}
.premium-glass-card {
	background: var(--bg-card);
	border: 1px solid var(--border-color);
	border-radius: 24px;
	height: 100%;
	display: flex;
	flex-direction: column;
	transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.premium-glass-card:hover {
	transform: translateY(-8px);
	box-shadow: 0 20px 40px rgba(0, 0, 0, 0.06);
	border-color: var(--primary-200);
}

.doc-type-icon-box {
	width: 48px;
	height: 48px;
	border-radius: 14px;
	border: 1px solid transparent;
	display: flex;
	align-items: center;
	justify-content: center;
}
.doc-version-badge {
	font-size: 10px;
	font-weight: 800;
	background: var(--bg-secondary);
	padding: 4px 10px;
	border-radius: 8px;
}

.doc-title-ui {
	font-size: 16px;
	font-weight: 800;
	line-height: 1.4;
	color: var(--text-primary);
	cursor: pointer;
	transition: color 0.2s;
	margin-bottom: 8px;
}
.doc-title-ui:hover {
	color: var(--primary-600);
}
.doc-desc-ui {
	font-size: 13px;
	color: var(--text-secondary);
	line-height: 1.5;
	margin-bottom: 0;
}
.text-truncate-2 {
	display: -webkit-box;
	-webkit-line-clamp: 2;
	line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
}

.tag-glass-ui {
	font-size: 10px;
	font-weight: 700;
	color: var(--primary-600);
	background: var(--primary-50);
	padding: 2px 10px;
	border-radius: 6px;
}

.doc-card-footer-ui {
	background: var(--bg-secondary);
	border-top: 1px solid var(--border-color);
	border-radius: 0 0 24px 24px;
}
.doc-actions-grid {
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	gap: 6px;
}
.doc-act-btn {
	height: 36px;
	border: 1px solid var(--border-color);
	background: var(--bg-card);
	color: var(--text-tertiary);
	border-radius: 10px;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.2s;
}
.doc-act-btn:hover {
	color: white;
	transform: translateY(-2px);
	cursor: pointer;
}
.doc-act-btn.view:hover {
	background: #10b981;
	border-color: #10b981;
}
.doc-act-btn.edit:hover {
	background: #3b82f6;
	border-color: #3b82f6;
}
.doc-act-btn.history:hover {
	background: #f59e0b;
	border-color: #f59e0b;
}
.doc-act-btn.delete:hover {
	background: #ef4444;
	border-color: #ef4444;
}

.glass-table-container {
	background: var(--bg-card);
	border: 1px solid var(--border-color);
	border-radius: 20px;
	overflow: hidden;
}
.glass-table-ui {
	width: 100%;
	border-collapse: separate;
	border-spacing: 0;
}
.glass-table-ui th {
	background: var(--bg-secondary);
	padding: 16px;
	font-size: 11px;
	font-weight: 800;
	color: var(--text-tertiary);
	text-transform: uppercase;
	border-bottom: 2px solid var(--border-color);
}
.glass-table-ui td {
	padding: 16px;
	background: var(--bg-secondary);
	border-top: 1px solid var(--border-color);
	border-bottom: 1px solid var(--border-color);
	vertical-align: middle;
	transition: background 0.2s;
}
.glass-table-ui tbody tr:hover td {
	background: var(--bg-tertiary);
}
.doc-type-icon-sm {
	width: 32px;
	height: 32px;
	border-radius: 8px;
	display: flex;
	align-items: center;
	justify-content: center;
}
.badge-v-ui {
	background: var(--bg-secondary);
	padding: 4px 10px;
	border-radius: 10px;
	font-size: 10px;
	font-weight: 800;
}
.btn-ghost-icon {
	width: 34px;
	height: 34px;
	border-radius: 10px;
	display: flex;
	align-items: center;
	justify-content: center;
	background: transparent;
	border: none;
	color: var(--text-tertiary);
	cursor: pointer;
	transition: all 0.2s;
}
.btn-ghost-icon:hover {
	background: var(--bg-secondary);
	transform: scale(1.1);
}
.btn-ghost-icon.primary:hover {
	color: #10b981;
}
.btn-ghost-icon.info:hover {
	color: #3b82f6;
}
.btn-ghost-icon.warning:hover {
	color: #f59e0b;
}
.btn-ghost-icon.danger:hover {
	color: #ef4444;
}

.custom-modal-overlay {
	position: fixed;
	inset: 0;
	background: rgba(15, 23, 42, 0.4);
	backdrop-filter: blur(8px);
	z-index: 2000;
	display: flex;
	align-items: center;
	justify-content: center;
	animation: fadeIn 0.3s ease;
	padding: 20px;
}
.custom-modal-dialog {
	width: 100%;
	max-width: 500px;
	background: var(--bg-card);
	backdrop-filter: blur(20px);
	border-radius: 28px;
	box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
	animation: slideUp 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
	overflow: hidden;
	display: flex;
	flex-direction: column;
	max-height: 90vh;
}
@keyframes slideUp {
	from {
		opacity: 0;
		transform: translateY(40px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

.border-bottom-glass {
	border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}
.btn-close-premium {
	background: transparent;
	border: none;
	color: var(--text-tertiary);
	transition: all 0.2s;
	cursor: pointer;
	padding: 5px;
	border-radius: 8px;
	display: flex;
}
.btn-close-premium:hover {
	color: var(--text-primary);
	background: rgba(255, 255, 255, 0.05);
}

.scroll-glass {
	overflow-y: auto;
}
.scroll-glass::-webkit-scrollbar {
	width: 4px;
}
.scroll-glass::-webkit-scrollbar-thumb {
	background: rgba(0, 0, 0, 0.1);
	border-radius: 10px;
}

.glass-timeline {
	position: relative;
	padding-left: 20px;
}
.glass-timeline::before {
	content: "";
	position: absolute;
	left: 0;
	top: 0;
	bottom: 0;
	width: 2px;
	background: rgba(0, 0, 0, 0.05);
}
.timeline-step {
	position: relative;
	padding-bottom: 24px;
}
.timeline-marker {
	position: absolute;
	left: -27px;
	top: 8px;
	width: 14px;
	height: 14px;
	border-radius: 50%;
	background: transparent;
	border: 3.5px solid rgba(255, 255, 255, 0.2);
	z-index: 2;
}
.timeline-step.active .timeline-marker {
	border-color: var(--white);
	background: transparent;
	box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}
.glass-modal {
	background: var(--bg-card);
	border: 1px solid var(--border-color);
	border-radius: 28px;
	box-shadow: var(--shadow-2xl);
	overflow: hidden;
}

.timeline-step.active .timeline-glass-card {
	border-color: var(--primary-200);
	box-shadow: 0 8px 20px rgba(0, 0, 0, 0.04);
}

.timeline-glass-card {
	background: rgba(255, 255, 255, 0.03);
	border: 1px solid var(--border-color);
	border-radius: 20px;
	padding: 24px;
	transition: all 0.3s;
}

.v-tag-ui {
	font-size: 11px;
	padding: 5px 16px;
	border-radius: var(--radius-full, 100px);
	display: inline-flex;
	align-items: center;
	gap: 6px;
	white-space: nowrap;
	background: rgba(255, 255, 255, 0.05);
	color: var(--text-tertiary);
}
.v-tag-ui.current {
	background: #ffffff;
	box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}
.v-tag-ui.current .v-tag-num {
	color: #1e293b;
	font-weight: 800;
}
.v-tag-ui.current .v-tag-label {
	color: #64748b;
	font-weight: 500;
}
.v-tag-num {
	font-weight: 700;
}
.v-date-ui {
	font-size: 11px;
	color: var(--text-tertiary);
}
.btn-download-glass {
	background: rgba(0, 0, 0, 0.03);
	border: none;
	padding: 8px 16px;
	border-radius: 10px;
	font-size: 12px;
	font-weight: 700;
	color: var(--text-secondary);
	transition: all 0.2s;
	cursor: pointer;
}
.btn-download-glass:hover {
	background: var(--primary-500);
	color: white;
}

.preview-overlay {
	position: fixed;
	inset: 0;
	background: rgba(15, 23, 42, 0.85);
	backdrop-filter: blur(10px);
	z-index: 2100;
	display: flex;
	align-items: center;
	justify-content: center;
	animation: fadeIn 0.3s ease;
	padding: 24px;
}
.preview-container {
	width: 100%;
	max-width: 1200px;
	height: 90vh;
	background: #f8fafc;
	border-radius: 20px;
	overflow: hidden;
	display: flex;
	flex-direction: column;
	box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}
.preview-header {
	height: 64px;
	background: white;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 24px;
	border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}
.preview-icon {
	width: 40px;
	height: 40px;
	background: var(--primary-50);
	color: var(--primary-600);
	border-radius: 12px;
	display: flex;
	align-items: center;
	justify-content: center;
}
.preview-body {
	flex: 1;
	background: #f1f5f9;
	overflow: hidden;
	position: relative;
}
.preview-iframe {
	width: 100%;
	height: 100%;
	border: none;
	background: white;
}
.btn-close-preview {
	background: rgba(0, 0, 0, 0.05);
	border: none;
	width: 36px;
	height: 36px;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.2s;
	cursor: pointer;
}
.btn-close-preview:hover {
	background: rgba(239, 68, 68, 0.1);
	color: var(--danger-600);
}
.btn-download-sm {
	width: 36px;
	height: 36px;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	background: var(--primary-50);
	color: var(--primary-600);
	transition: all 0.2s;
	text-decoration: none;
}
.btn-download-sm:hover {
	background: var(--primary-100);
	transform: translateY(-2px);
}

.rendering-state {
	height: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	background: white;
}

.preview-html-container {
	height: 100%;
	overflow-y: scroll;
	background: white;
	padding: 60px 80px;
	max-width: 1000px;
	margin: 0 auto;
	user-select: none;
	pointer-events: auto;
	box-shadow: 0 0 50px rgba(0, 0, 0, 0.1);
}

.preview-html-container::-webkit-scrollbar {
	width: 10px;
}
.preview-html-container::-webkit-scrollbar-track {
	background: #f1f5f9;
}
.preview-html-container::-webkit-scrollbar-thumb {
	background: #cbd5e1;
	border-radius: 10px;
	border: 2px solid #f1f5f9;
}
.preview-html-container::-webkit-scrollbar-thumb:hover {
	background: #94a3b8;
}

.preview-html-container :deep(table) {
	min-width: 100%;
	border-collapse: collapse;
	margin-bottom: 30px;
	font-size: 13px;
	border: 1px solid #e2e8f0;
}
.preview-html-container :deep(th),
.preview-html-container :deep(td) {
	border: 1px solid #e2e8f0;
	padding: 10px 14px;
	text-align: left;
}
.preview-html-container :deep(tr:nth-child(even)) {
	background: #f8fafc;
}
.preview-html-container :deep(thead) {
	background: #f1f5f9;
	font-weight: bold;
}

.preview-html-container :deep(h1) {
	font-size: 26px;
	font-weight: 800;
	margin-bottom: 24px;
	color: #1e293b;
	border-bottom: 2px solid #f1f5f9;
	padding-bottom: 12px;
}
.preview-html-container :deep(p) {
	line-height: 1.8;
	margin-bottom: 16px;
	color: #334155;
	font-size: 15px;
}
.preview-html-container :deep(img) {
	max-width: 100%;
	height: auto;
	border-radius: 8px;
	margin: 20px 0;
}

.premium-spinner {
	width: 44px;
	height: 44px;
	border: 4px solid var(--primary-50);
	border-top-color: var(--primary-500);
	border-radius: 50%;
	animation: spin 1s linear infinite;
}
.loading-state-glass {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
}
.glass-empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 100px 40px;
	background: rgba(255, 255, 255, 0.5);
	border: 2px dashed rgba(0, 0, 0, 0.05);
	border-radius: 32px;
}

@media (max-width: 1200px) {
	.desktop-only {
		display: none;
	}
}
@media (max-width: 768px) {
	.page-header {
		justify-content: center;
		text-align: center;
	}
	.header-content {
		flex-direction: column;
		align-items: center;
	}
	.glass-search {
		width: 100%;
	}
}

:is([data-bs-theme="dark"], [data-theme="dark"]) .doc-title-ui {
	color: #f8fafc !important;
}

:is([data-bs-theme="dark"], [data-theme="dark"]) .clickable-title {
	color: #f8fafc !important;
}

:is([data-bs-theme="dark"], [data-theme="dark"]) .text-dark {
	color: #f8fafc !important;
}

:is([data-bs-theme="dark"], [data-theme="dark"]) .glass-table-ui th {
	border-bottom-color: var(--border-color);
}

:is([data-bs-theme="dark"], [data-theme="dark"]) .nav-item-glass {
	color: var(--text-tertiary);
}

:is([data-bs-theme="dark"], [data-theme="dark"]) .nav-item-glass:hover {
	background: var(--bg-tertiary);
}

:is([data-bs-theme="dark"], [data-theme="dark"]) .premium-glass-card {
	background: var(--bg-secondary);
	border-color: var(--border-color);
}

:is([data-bs-theme="dark"], [data-theme="dark"]) .glass-modal {
	background: var(--bg-card);
	border-color: var(--border-color);
}

:is([data-bs-theme="dark"], [data-theme="dark"]) .border-bottom-glass {
	border-bottom-color: var(--border-color);
}

:is([data-bs-theme="dark"], [data-theme="dark"]) .timeline-glass-card {
	background: var(--bg-tertiary);
	border-color: var(--border-color);
}

:is([data-bs-theme="dark"], [data-theme="dark"]) .preview-header {
	background: var(--bg-card);
	border-bottom-color: var(--border-color);
}

:is([data-bs-theme="dark"], [data-theme="dark"]) .preview-body {
	background: #1e293b;
}

:is([data-bs-theme="dark"], [data-theme="dark"]) .tag-glass-ui {
	background: var(--bg-tertiary);
	border-color: var(--border-color);
	color: var(--text-secondary);
}

.tags-cloud-glass {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
	padding: 4px;
}
.tag-item-btn {
	padding: 6px 12px;
	border-radius: 10px;
	font-size: 12px;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.2s;
	background: rgba(0, 0, 0, 0.04);
	color: var(--text-secondary);
	border: 1px solid transparent;
}
.tag-item-btn:hover {
	background: rgba(99, 102, 241, 0.1);
	color: #6366f1;
}
.tag-item-btn.active {
	background: #6366f1;
	color: white;
	box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

:is([data-bs-theme="dark"], [data-theme="dark"]) .tag-item-btn {
	background: rgba(255, 255, 255, 0.05);
	color: var(--text-tertiary);
}
:is([data-bs-theme="dark"], [data-theme="dark"]) .tag-item-btn:hover {
	background: rgba(99, 102, 241, 0.2);
	color: #818cf8;
}
:is([data-bs-theme="dark"], [data-theme="dark"]) .tag-item-btn.active {
	background: #6366f1;
	color: white;
}
</style>

