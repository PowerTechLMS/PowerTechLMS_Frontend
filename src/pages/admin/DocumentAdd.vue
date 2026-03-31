<script lang="ts" setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { documentAPI } from "@/services/api";
import { toast } from "vue3-toastify";
import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
import { X, Filter, Tag, CheckCircle2 } from "lucide-vue-next";

const router = useRouter();

const documentForm = ref({
	Title: "",
	Description: "",
	Tags: "",
	AccessStartDate: null as Date | null,
	AccessEndDate: null as Date | null,
	File: null as File | null,
	ChangeNote: "Bản phát hành đầu tiên",
});

const isSubmitting = ref(false);
const fileInfo = ref<{ name: string; size: string; ext: string } | null>(null);

const predefinedTags = {
	skills: {
		label: "Kỹ năng & Chuyên môn",
		colorClass: "tag-primary",
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
		label: "Đối tượng",
		colorClass: "tag-warning",
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
	format: {
		label: "Loại hình",
		colorClass: "tag-success",
		items: [
			"Video",
			"E-learning-SCORM",
			"Quiz",
			"PDF-Guide",
			"Micro-Learning",
			"Presentation",
		],
	},
};

const selectedTagsArray = ref<string[]>([]);
const customTagInput = ref("");

const toggleTag = (tag: string) => {
	const index = selectedTagsArray.value.indexOf(tag);
	if (index > -1) {
		selectedTagsArray.value.splice(index, 1);
	} else {
		selectedTagsArray.value.push(tag);
	}
	documentForm.value.Tags = selectedTagsArray.value.join(",");
};

const addCustomTag = () => {
	const tag = customTagInput.value.trim().replace(/\s+/g, "-");
	if (tag && !selectedTagsArray.value.includes(tag)) {
		selectedTagsArray.value.push(tag);
		documentForm.value.Tags = selectedTagsArray.value.join(",");
	}
	customTagInput.value = "";
};

const removeTag = (tag: string) => {
	selectedTagsArray.value = selectedTagsArray.value.filter((t) => t !== tag);
	documentForm.value.Tags = selectedTagsArray.value.join(",");
};

const onFileChange = (event: Event) => {
	const target = event.target as HTMLInputElement;
	const f = target.files && target.files.length > 0 ? target.files[0] : null;
	documentForm.value.File = f;

	if (f) {
		const ext = f.name.split(".").pop()?.toUpperCase() ?? "";
		const size =
			f.size > 1024 * 1024
				? (f.size / 1024 / 1024).toFixed(2) + " MB"
				: (f.size / 1024).toFixed(1) + " KB";
		fileInfo.value = { name: f.name, size, ext };
	} else {
		fileInfo.value = null;
	}
};

const submitAddForm = async () => {
	if (!documentForm.value.File) {
		toast.warning("Vui lòng chọn một tệp tài liệu để tải lên!");
		return;
	}

	isSubmitting.value = true;
	const formData = new FormData();
	formData.append("title", documentForm.value.Title);
	formData.append("description", documentForm.value.Description);
	formData.append("tags", documentForm.value.Tags);
	if (documentForm.value.AccessStartDate)
		formData.append(
			"accessStartDate",
			documentForm.value.AccessStartDate.toISOString(),
		);
	if (documentForm.value.AccessEndDate)
		formData.append(
			"accessEndDate",
			documentForm.value.AccessEndDate.toISOString(),
		);
	formData.append("file", documentForm.value.File);

	try {
		await documentAPI.create(formData);
		toast.success("Tải lên tài liệu thành công!");
		router.push("/admin/documents");
	} catch {
		toast.error("Lỗi khi tải lên tài liệu.");
	} finally {
		isSubmitting.value = false;
	}
};

const getExtColor = (ext: string) => {
	if (ext === "PDF") return "text-danger";
	if (["DOC", "DOCX"].includes(ext)) return "text-primary";
	if (["XLS", "XLSX"].includes(ext)) return "text-success";
	return "text-muted";
};

const getExtBg = (ext: string) => {
	if (ext === "PDF") return "bg-danger-light";
	if (["DOC", "DOCX"].includes(ext)) return "bg-primary-light";
	if (["XLS", "XLSX"].includes(ext)) return "bg-success-light";
	return "bg-light";
};
</script>

<template>
	<div class="container-fluid">
		<div class="row page-titles mx-0 mb-4">
			<div class="col-sm-6 p-md-0">
				<h4 class="text-dark fw-bold mb-1">Thêm mới Tài liệu</h4>
				<p class="mb-0 text-muted fs-13">
					Tải lên và phân phối tài liệu nội bộ cho toàn công ty.
				</p>
			</div>
			<div
				class="col-sm-6 p-md-0 justify-content-sm-end mt-2 mt-sm-0 d-flex align-items-center"
			>
				<ol class="breadcrumb mb-0">
					<li class="breadcrumb-item">
						<RouterLink to="/admin/documents" class="text-muted"
							>Kho tài liệu</RouterLink
						>
					</li>
					<li class="breadcrumb-item active">
						<a href="javascript:void(0);" class="text-primary fw-bold">Thêm mới</a>
					</li>

				</ol>
			</div>
		</div>

		<form @submit.prevent="submitAddForm">
			<div class="row g-4 mb-4">
				<div class="col-lg-7">
					<div class="card shadow-sm border-0 h-100" style="background: var(--bg-card) !important">
						<div class="card-header border-bottom py-3" style="background: var(--bg-card) !important; border-color: var(--border-color) !important">
							<p class="doc-section-label mb-0">Thông tin tài liệu</p>
						</div>
						<div class="card-body">
							<div class="form-group mb-3">
								<label class="form-label fw-bold fs-13" style="color: var(--text-primary) !important"
									>Tên tài liệu <span class="text-danger">*</span></label
								>
								<input
									v-model="documentForm.Title"
									type="text"
									class="form-control form-control-lg"
									style="background: var(--bg-secondary); color: var(--text-primary); border-color: var(--border-color)"
									required
								/>
							</div>
							<div class="form-group mb-3">
								<label class="form-label fw-bold fs-13" style="color: var(--text-primary) !important"
									>Mô tả chi tiết</label
								>
								<textarea
									v-model="documentForm.Description"
									class="form-control"
									style="background: var(--bg-secondary); color: var(--text-primary); border-color: var(--border-color)"
									rows="3"
								></textarea>
							</div>
							<div class="form-group mb-0">
								<label
									class="form-label fw-bold fs-13 text-uppercase mb-3 d-flex align-items-center gap-2"
									style="color: var(--text-primary) !important"
								>
									<Filter :size="16" class="text-primary" /> Thẻ phân loại
									(Tags)
								</label>


								<div
									class="selected-tags-display mb-3 p-3 rounded-3"
									:class="{ 'has-tags': selectedTagsArray.length > 0 }"
								>
									<div
										v-if="selectedTagsArray.length === 0"
										class="text-muted fs-12 fst-italic"
									>
										Vui lòng chọn các thẻ phía dưới...
									</div>
									<div v-else class="d-flex flex-wrap gap-2">
										<span
											v-for="tag in selectedTagsArray"
											:key="tag"
											class="tag-chip"
										>
											#{{ tag }}
											<button
												type="button"
												class="btn-remove-tag"
												@click="removeTag(tag)"
											>
												<X :size="12" />
											</button>
										</span>
									</div>
								</div>

								<div
									class="input-group mb-4 shadow-sm rounded-3 overflow-hidden border"
									style="border-color: var(--border-color) !important"
								>
									<span class="input-group-text border-0" style="background: var(--bg-secondary) !important"
										><Tag :size="16" class="text-muted"
									/></span>
									<input
										type="text"
										class="form-control border-0 fs-13"
										style="background: var(--bg-secondary); color: var(--text-primary)"
										placeholder="Nhập thẻ khác và nhấn Enter..."
										v-model="customTagInput"
										@keydown.enter.prevent="addCustomTag"
									/>
									<button
										type="button"
										class="btn btn-outline-primary border-0 fs-12 fw-bold"
										@click="addCustomTag"
									>
										THÊM
									</button>
								</div>


								<div
									class="tag-library p-3 rounded-4 bg-light-soft border-0 custom-scrollbar"
									style="max-height: 300px; overflow-y: auto"
								>
									<div
										class="mb-4"
										v-for="(group, key) in predefinedTags"
										:key="key"
									>
										<div
											class="mb-2 fs-10 fw-bold text-uppercase text-muted letter-spacing-1"
										>
											{{ group.label }}
										</div>
										<div class="d-flex flex-wrap gap-2">
											<span
												v-for="tag in group.items"
												:key="tag"
												class="suggested-pill"
												:class="[
													group.colorClass,
													{ active: selectedTagsArray.includes(tag) },
												]"
												@click="toggleTag(tag)"
											>
												<CheckCircle2
													v-if="selectedTagsArray.includes(tag)"
													:size="12"
													class="me-1"
												/>
												{{ tag }}
											</span>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div class="col-lg-5">
					<div class="card shadow-sm border-0 h-100" style="background: var(--bg-card) !important">
						<div class="card-header border-bottom py-3" style="background: var(--bg-card) !important; border-color: var(--border-color) !important">
							<p class="doc-section-label mb-0">File đính kèm</p>
						</div>

						<div class="card-body d-flex flex-column">
							<label
								for="fileInput"
								class="doc-upload-zone mb-3 d-flex flex-column align-items-center justify-content-center text-center"
							>
								<div v-if="!fileInfo">
									<i
										class="fa fa-cloud-upload fs-2 text-primary mb-2 d-block"
									></i>
									<p class="fw-bold fs-14 mb-1" style="color: var(--text-primary)">Nhấn để chọn file</p>
									<p class="text-muted fs-12 mb-0">Hỗ trợ PDF, DOCX, XLSX...</p>
								</div>

								<div v-else class="d-flex align-items-center gap-3 w-100 px-2">
									<div
										class="doc-file-ext-badge"
										:class="getExtBg(fileInfo.ext)"
									>
										<span
											:class="getExtColor(fileInfo.ext)"
											class="fw-bold fs-12"
											>{{ fileInfo.ext }}</span
										>
									</div>
									<div class="text-start flex-fill overflow-hidden">
										<p class="fw-bold mb-0 text-truncate" style="color: var(--text-primary)">
											{{ fileInfo.name }}
										</p>
										<small class="text-muted">{{ fileInfo.size }}</small>
									</div>

								</div>
								<input
									id="fileInput"
									type="file"
									class="d-none"
									@change="onFileChange"
									required
								/>
							</label>
						</div>
					</div>
				</div>
			</div>

			<div class="row g-4 mb-4">
				<div class="col-12">
					<div class="card shadow-sm border-0">
						<div class="card-header bg-white border-bottom py-3">
							<p class="doc-section-label mb-0">Quyền truy cập & Thời hạn</p>
						</div>
						<div class="card-body">
							<div class="row g-4">
								<div class="col-sm-6">
									<label class="form-label fw-bold fs-13" style="color: var(--text-primary) !important"
										>Ngày bắt đầu hiển thị</label
									>

									<VueDatePicker
										v-model="documentForm.AccessStartDate"
										:enable-time-picker="false"
										auto-apply
										placeholder="Hiển thị ngay"
									/>
								</div>
								<div class="col-sm-6">
									<label class="form-label fw-bold fs-13" style="color: var(--text-primary) !important"
										>Ngày gỡ bỏ</label
									>

									<VueDatePicker
										v-model="documentForm.AccessEndDate"
										:enable-time-picker="false"
										auto-apply
										placeholder="Vô thời hạn"
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div
				class="doc-action-bar d-flex justify-content-end gap-2 p-3 rounded shadow-sm sticky-bottom mt-4"
				style="background: var(--bg-card); border: 1px solid var(--border-color)"
			>

				<button
					type="button"
					class="btn btn-light border"
					@click="router.push('/admin/documents')"
				>
					Hủy bỏ
				</button>
				<button
					type="submit"
					class="btn btn-primary px-5 fw-bold"
					:disabled="isSubmitting"
				>
					<span
						v-if="isSubmitting"
						class="spinner-border spinner-border-sm me-2"
					></span>
					Tải lên & Lưu
				</button>
			</div>
		</form>
	</div>
</template>

<style scoped>
.doc-section-label {
	font-size: 0.75rem;
	font-weight: 700;
	text-transform: uppercase;
	color: #6c757d;
	border-left: 3px solid #1a56db;
	padding-left: 0.6rem;
}
.doc-upload-zone {
	border: 2px dashed var(--border-color);
	border-radius: 12px;
	padding: 2rem 1rem;
	cursor: pointer;
	background: var(--bg-tertiary);
	min-height: 150px;
	transition: border-color 0.2s;
}

.doc-upload-zone:hover {
	border-color: #1a56db;
}
.doc-file-ext-badge {
	width: 3rem;
	height: 3rem;
	border-radius: 10px;
	display: flex;
	align-items: center;
	justify-content: center;
}
.bg-primary-light {
	background: rgba(59, 130, 246, 0.1);
}
.bg-danger-light {
	background: rgba(239, 68, 68, 0.1);
}
.bg-success-light {
	background: rgba(16, 185, 129, 0.1);
}
.fs-13 {
	font-size: 0.8125rem;
}
.fs-12 {
	font-size: 0.75rem;
}
.doc-action-bar {
	z-index: 10;
}

.bg-light-soft {
	background-color: var(--bg-tertiary);
}

.letter-spacing-1 {
	letter-spacing: 0.05em;
}

.selected-tags-display {
	background: var(--bg-card);
	border: 1px solid var(--border-color);
	min-height: 50px;
	transition: all 0.2s;
}

.selected-tags-display.has-tags {
	background: var(--bg-secondary);
	border-color: var(--primary-400);
}


.tag-chip {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	background: #1a56db;
	color: white;
	padding: 4px 12px;
	border-radius: 20px;
	font-size: 11px;
	font-weight: 600;
	box-shadow: 0 2px 4px rgba(26, 86, 219, 0.2);
}

.btn-remove-tag {
	background: rgba(255, 255, 255, 0.2);
	border: none;
	color: white;
	width: 16px;
	height: 16px;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	padding: 0;
	transition: all 0.2s;
}
.btn-remove-tag:hover {
	background: rgba(255, 255, 255, 0.4);
}

.suggested-pill {
	display: inline-flex;
	align-items: center;
	padding: 5px 12px;
	border-radius: 8px;
	font-size: 11px;
	font-weight: 600;
	cursor: pointer;
	background: var(--bg-card);
	color: var(--text-tertiary);
	border: 1px solid var(--border-color);
	transition: all 0.2s;
}

.suggested-pill:hover {
	border-color: #cbd5e1;
	background: #f8fafc;
}

.tag-primary.active {
	background: #eff6ff;
	border-color: #bfdbfe;
	color: #1e40af;
}
.tag-danger.active {
	background: #fef2f2;
	border-color: #fecaca;
	color: #991b1b;
}
.tag-warning.active {
	background: #fffbeb;
	border-color: #fde68a;
	color: #92400e;
}
.tag-success.active {
	background: #f0fdf4;
	border-color: #bbf7d0;
	color: #166534;
}

.custom-scrollbar::-webkit-scrollbar {
	width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
	background: #e2e8f0;
	border-radius: 4px;
}
</style>
