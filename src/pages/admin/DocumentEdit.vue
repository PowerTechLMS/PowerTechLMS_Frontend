<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { documentAPI, userGroupAPI, rbacAPI, userAPI } from "@/services/api";
import { toast } from "vue3-toastify";
import {
	FileText,
	ArrowLeft,
	Save,
	ShieldAlert,
	Globe,
	Lock,
	Users,
	Briefcase,
	Building2,
	Loader2,
	Filter,
	X,
	UploadCloud,
	File,
} from "lucide-vue-next";

const router = useRouter();
const route = useRoute();
const docId = Number(route.params.id);

const activeTab = ref("general");
const isLoading = ref(true);
const isSubmitting = ref(false);

const selectedFile = ref<File | null>(null);
const changeNote = ref("");

const form = ref({
	title: "",
	description: "",
	tags: "",
	accessStartDate: "",
	accessEndDate: "",
	isPublic: true,
});

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
		items: ["Video", "E-learning-SCORM", "Quiz", "PDF-Guide", "Micro-Learning"],
	},
};

const selectedTagsArray = ref<string[]>([]);
const customTagInput = ref("");

const initTags = (tagsString: string) => {
	if (!tagsString) {
		selectedTagsArray.value = [];
		return;
	}
	selectedTagsArray.value = tagsString
		.split(",")
		.map((t) => t.trim())
		.filter((t) => t);
};

const toggleTag = (tag: string) => {
	const index = selectedTagsArray.value.indexOf(tag);
	if (index > -1) selectedTagsArray.value.splice(index, 1);
	else selectedTagsArray.value.push(tag);
	form.value.tags = selectedTagsArray.value.join(",");
};

const addCustomTag = () => {
	const tag = customTagInput.value.trim().replace(/\s+/g, "-");
	if (tag && !selectedTagsArray.value.includes(tag))
		selectedTagsArray.value.push(tag);
	customTagInput.value = "";
	form.value.tags = selectedTagsArray.value.join(",");
};

const removeTag = (tag: string) => {
	selectedTagsArray.value = selectedTagsArray.value.filter((t) => t !== tag);
	form.value.tags = selectedTagsArray.value.join(",");
};

const selectedRoles = ref<number[]>([]);
const selectedGroups = ref<number[]>([]);
const selectedUsers = ref<number[]>([]);

const allRoles = ref<any[]>([]);
const allGroups = ref<any[]>([]);
const allUsers = ref<any[]>([]);

const formatDateTimeForInput = (dateString: string) => {
	if (!dateString) return "";
	const d = new Date(dateString);
	return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
		.toISOString()
		.slice(0, 16);
};

const handleFileChange = (event: Event) => {
	const target = event.target as HTMLInputElement;
	if (target.files && target.files.length > 0) {
		selectedFile.value = target.files[0];
		toast.success(`Đã chọn file: ${selectedFile.value.name}`);
	} else {
		selectedFile.value = null;
	}
};

onMounted(async () => {
	isLoading.value = true;
	try {
		const docRes = await documentAPI.getById(docId);
		const doc = docRes.data;

		form.value.title = doc.title;
		form.value.description = doc.description;
		form.value.tags = doc.tags;
		initTags(doc.tags);
		form.value.accessStartDate = formatDateTimeForInput(doc.accessStartDate);
		form.value.accessEndDate = formatDateTimeForInput(doc.accessEndDate);

		const [permRes, rolesRes, groupsRes, usersRes] = await Promise.all([
			documentAPI.getPermissions(docId).catch(() => ({ data: [] })),
			rbacAPI.getRoles().catch(() => ({ data: [] })),
			userGroupAPI.getAll({ pageSize: 1500 }).catch(() => ({ data: [] })),
			userAPI.getAll({ pageSize: 2000 }).catch(() => ({ data: [] })),
		]);

		allRoles.value = rolesRes.data?.items || rolesRes.data || [];
		allGroups.value = groupsRes.data?.items || groupsRes.data || [];
		allUsers.value = usersRes.data?.items || usersRes.data || [];

		const perms = permRes.data || [];
		if (perms.length > 0) {
			form.value.isPublic = false;
			selectedRoles.value = perms
				.filter((p: any) => p.roleId)
				.map((p: any) => p.roleId);
			selectedGroups.value = perms
				.filter((p: any) => p.userGroupId)
				.map((p: any) => p.userGroupId);
			selectedUsers.value = perms
				.filter((p: any) => p.userId)
				.map((p: any) => p.userId);
		} else {
			form.value.isPublic = true;
		}
	} catch {
		toast.error("Không thể tải thông tin.");
	} finally {
		isLoading.value = false;
	}
});

const handleSave = async () => {
	isSubmitting.value = true;
	try {
		await documentAPI.update(docId, {
			title: form.value.title,
			description: form.value.description,
			tags: form.value.tags,
			accessStartDate: form.value.accessStartDate || null,
			accessEndDate: form.value.accessEndDate || null,
		});

		if (selectedFile.value) {
			const formData = new FormData();
			formData.append("file", selectedFile.value);
			formData.append(
				"changeNote",
				changeNote.value || "Cập nhật phiên bản mới",
			);
			await documentAPI.addVersion(docId, formData);
		}

		if (!form.value.isPublic) {
			const permPayload = {
				roleIds: selectedRoles.value || [],
				groupIds: selectedGroups.value || [],
				userIds: selectedUsers.value || [],
			};
			await documentAPI.updatePermissions(docId, permPayload);
		} else {
			await documentAPI.clearPermissions(docId);
		}

		toast.success("Cập nhật tài liệu thành công!");

		setTimeout(() => {
			router.push("/admin/documents");
		}, 500);
	} catch (error: any) {
		toast.error(
			error.response?.data?.message ||
				"Có lỗi xảy ra khi lưu. Vui lòng thử lại.",
		);
	} finally {
		isSubmitting.value = false;
	}
};
</script>

<template>
	<div class="doc-edit-page">
		<div v-if="isLoading" class="text-center py-5">
			<Loader2 class="spinner-icon mx-auto text-primary" :size="40" />
		</div>

		<div v-else>
			<div class="page-header mb-4">
				<div class="d-flex align-items-center gap-3">
					<div class="icon-box-glass"><FileText :size="28" /></div>
					<div>
						<h2 class="fw-bold mb-1 fs-24">Chỉnh sửa Tài liệu</h2>
						<p class="text-tertiary fs-14 mb-0">
							Cập nhật nội dung, phiên bản mới và phân quyền.
						</p>
					</div>
				</div>
				<button
					@click="router.push('/admin/documents')"
					class="btn btn-outline"
				>
					<ArrowLeft :size="16" class="me-2" /> Quay lại
				</button>
			</div>

			<div class="glass-content-card">
				<div class="tabs-glass-nav px-4 pt-3 border-bottom-glass">
					<button
						class="tab-glass-btn pb-3"
						:class="{ active: activeTab === 'general' }"
						@click="activeTab = 'general'"
					>
						Thông tin & Tệp đính kèm
					</button>
					<button
						class="tab-glass-btn pb-3 d-flex align-items-center"
						:class="{ active: activeTab === 'security' }"
						@click="activeTab = 'security'"
					>
						<ShieldAlert
							:size="16"
							class="me-2"
							:class="form.isPublic ? 'text-success' : 'text-danger'"
						/>
						Quyền truy cập
					</button>
				</div>

				<div class="p-4">
					<div v-show="activeTab === 'general'" class="fade-in row g-5">
						<div class="col-lg-6">
							<div class="form-group mb-4">
								<label class="fw-bold fs-13 text-uppercase mb-2" style="color: var(--text-primary)"
									>Tên tài liệu <span class="text-danger">*</span></label
								>
								<input
									type="text"
									class="glass-input w-100"
									v-model="form.title"
									required
								/>
							</div>

							<div class="form-group mb-4">
								<label class="fw-bold fs-13 text-uppercase mb-2" style="color: var(--text-primary)"
									>Mô tả nội dung</label
								>
								<textarea
									class="glass-input w-100"
									rows="3"
									v-model="form.description"
								></textarea>
							</div>


							<div class="row g-3 mb-4">
								<div class="col-md-6">
									<label class="fw-bold fs-13 text-uppercase mb-2" style="color: var(--text-primary)"
										>Mở truy cập từ ngày</label
									>
									<input
										type="datetime-local"
										class="glass-input w-100"
										v-model="form.accessStartDate"
									/>
								</div>
								<div class="col-md-6">
									<label class="fw-bold fs-13 text-uppercase mb-2" style="color: var(--text-primary)"
										>Khóa vào ngày</label
									>
									<input
										type="datetime-local"
										class="glass-input w-100"
										v-model="form.accessEndDate"
									/>
								</div>
							</div>


							<div class="form-group border-top pt-4" style="border-color: var(--border-color) !important">
								<label
									class="fw-bold fs-13 text-uppercase mb-3 text-primary d-flex align-items-center gap-2"
								>
									<UploadCloud :size="16" /> Tải lên Phiên bản mới
								</label>

								<p class="fs-12 text-tertiary mb-3">
									Nếu bạn muốn thay thế file cũ, hãy tải file mới lên đây. Hệ
									thống sẽ tự động tạo Version mới (Lịch sử các file cũ vẫn được
									giữ lại).
								</p>

								<input
									type="file"
									class="d-none"
									id="fileUpload"
									@change="handleFileChange"
									accept=".pdf,.doc,.docx,.xls,.xlsx"
								/>
								<label
									for="fileUpload"
									class="upload-area glass-card p-4 text-center d-block cursor-pointer"
								>
									<File
										v-if="selectedFile"
										:size="32"
										class="text-primary mb-2"
									/>
									<UploadCloud v-else :size="32" class="text-tertiary mb-2" />
									<h6 class="fw-bold" style="color: var(--text-primary)">
										{{
											selectedFile ? selectedFile.name : "Nhấp để chọn file mới"
										}}
									</h6>
									<span class="fs-12 text-tertiary">{{
										selectedFile
											? `Cập nhật thành công`
											: "Hỗ trợ: PDF, Word, Excel"
									}}</span>
								</label>


								<div v-if="selectedFile" class="mt-3">
									<label class="fs-12 fw-bold text-tertiary mb-1"
										>Ghi chú thay đổi ở phiên bản này:</label
									>
									<input
										type="text"
										class="glass-input w-100 py-2 fs-13"
										v-model="changeNote"
										placeholder="Ví dụ: Cập nhật điều khoản 2.1..."
									/>
								</div>
							</div>
						</div>

						<div class="col-lg-6 border-start-glass" style="border-color: var(--border-color) !important">
							<label
								class="fw-bold fs-13 text-uppercase mb-3 d-flex align-items-center gap-2"
								style="color: var(--text-primary)"
							>
								<Filter :size="16" class="text-primary" /> Phân loại Thẻ (Tags)
							</label>


							<div class="selected-tags-box mb-3 p-3 rounded-3">
								<div
									v-if="selectedTagsArray.length === 0"
									class="text-muted fs-13 fst-italic"
								>
									Chưa có thẻ nào được chọn...
								</div>
								<div v-else class="d-flex flex-wrap gap-2">
									<span
										v-for="tag in selectedTagsArray"
										:key="tag"
										class="selected-tag-pill"
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

							<div class="glass-search mb-4 w-100 p-1 rounded-3">
								<input
									type="text"
									class="search-input-premium px-3"
									placeholder="Gõ thẻ mới và nhấn Enter..."
									v-model="customTagInput"
									@keydown.enter.prevent="addCustomTag"
								/>
								<button
									type="button"
									class="btn btn-primary btn-sm rounded-2 px-3"
									@click="addCustomTag"
								>
									Thêm
								</button>
							</div>

							<div
								class="tag-dictionary p-4 rounded-4 shadow-sm custom-scrollbar"
								style="max-height: 380px; overflow-y: auto; background: var(--bg-tertiary); border: 1px solid var(--border-color);"
							>
								<h6 class="fw-bold fs-12 text-tertiary mb-3 text-uppercase">
									Thư viện thẻ hệ thống
								</h6>

								<div
									class="mb-4"
									v-for="(group, key) in predefinedTags"
									:key="key"
								>
									<div
										class="mb-2 fs-11 fw-bold text-uppercase"
										:class="group.colorClass.replace('tag-', 'text-')"
									>
										{{ group.label }}
									</div>
									<div class="d-flex flex-wrap gap-2">
										<span
											v-for="tag in group.items"
											:key="tag"
											class="suggested-tag-pill"
											:class="[
												group.colorClass,
												{ active: selectedTagsArray.includes(tag) },
											]"
											@click="toggleTag(tag)"
										>
											{{ tag }}
										</span>
									</div>
								</div>
							</div>
						</div>
					</div>

					<div v-show="activeTab === 'security'" class="fade-in">
						<div
							class="glass-alert mb-5"
							:class="form.isPublic ? 'public-mode' : 'private-mode'"
						>
							<div
								class="d-flex justify-content-between align-items-center flex-wrap gap-4"
							>
								<div class="d-flex align-items-start gap-3">
									<div class="status-icon-box">
										<Globe v-if="form.isPublic" :size="24" />
										<Lock v-else :size="24" />
									</div>
									<div>
										<h5 class="fw-bold mb-1">
											{{
												form.isPublic
													? "Tài liệu Lưu hành chung (Public)"
													: "Tài liệu Nội bộ / Hạn chế (Private)"
											}}
										</h5>
										<p class="mb-0 fs-14 opacity-75">
											{{
												form.isPublic
													? "Tất cả nhân viên trong hệ thống đều có thể xem và tải tài liệu này."
													: "Chỉ những Vai trò, Phòng ban, hoặc Cá nhân được chỉ định bên dưới mới có thể truy cập."
											}}
										</p>
									</div>
								</div>

								<div class="form-check form-switch custom-switch">
									<input
										class="form-check-input"
										type="checkbox"
										role="switch"
										id="publicSwitch"
										v-model="form.isPublic"
									/>
									<label class="form-check-label fw-bold" for="publicSwitch">{{
										form.isPublic ? "Đang Mở" : "Đang Khóa"
									}}</label>
								</div>
							</div>
						</div>

						<div
							v-if="!form.isPublic"
							class="permissions-container animate-fade-up"
						>
							<div class="row g-4">
								<div class="col-md-4">
									<div class="perm-box glass-card p-4 h-100">
										<div class="d-flex align-items-center mb-3 text-primary">
											<Building2 :size="18" class="me-2" />
											<span class="fw-bold">Theo Phòng ban</span>
										</div>
										<div
											class="custom-scrollbar"
											style="max-height: 250px; overflow-y: auto"
										>
											<label
												v-for="g in allGroups"
												:key="g.id"
												class="d-flex align-items-center gap-2 mb-2 p-2 rounded hover-bg"
											>
												<input
													type="checkbox"
													:value="g.id"
													v-model="selectedGroups"
												/>
												<span class="fs-14 fw-medium">{{ g.name }}</span>
											</label>
										</div>
									</div>
								</div>

								<div class="col-md-4">
									<div class="perm-box glass-card p-4 h-100">
										<div class="d-flex align-items-center mb-3 text-success">
											<Briefcase :size="18" class="me-2" />
											<span class="fw-bold">Theo Vai trò (Role)</span>
										</div>
										<div
											class="custom-scrollbar"
											style="max-height: 250px; overflow-y: auto"
										>
											<label
												v-for="r in allRoles"
												:key="r.id"
												class="d-flex align-items-center gap-2 mb-2 p-2 rounded hover-bg"
											>
												<input
													type="checkbox"
													:value="r.id"
													v-model="selectedRoles"
												/>
												<span class="fs-14 fw-medium">{{ r.name }}</span>
											</label>
										</div>
									</div>
								</div>

								<div class="col-md-4">
									<div class="perm-box glass-card p-4 h-100">
										<div class="d-flex align-items-center mb-3 text-warning">
											<Users :size="18" class="me-2" />
											<span class="fw-bold">Cá nhân ngoại lệ</span>
										</div>
										<div
											class="custom-scrollbar"
											style="max-height: 250px; overflow-y: auto"
										>
											<label
												v-for="u in allUsers"
												:key="u.id"
												class="d-flex align-items-center gap-2 mb-2 p-2 rounded hover-bg"
											>
												<input
													type="checkbox"
													:value="u.id"
													v-model="selectedUsers"
												/>
												<span class="fs-14 fw-medium">{{ u.fullName }}</span>
											</label>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					<div
						class="mt-5 pt-4 border-top-glass d-flex justify-content-end gap-3"
					>
						<button
							class="btn btn-outline"
							@click="router.push('/admin/documents')"
						>
							Hủy bỏ
						</button>
						<button
							class="btn btn-primary"
							@click="handleSave"
							:disabled="isSubmitting"
						>
							<Loader2
								v-if="isSubmitting"
								:size="18"
								class="spinner-icon me-2"
							/>
							<Save v-else :size="18" class="me-2" /> Lưu & Cập nhật
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
.doc-edit-page {
	padding-bottom: 50px;
	max-width: 1200px;
	margin: 0 auto;
	color: var(--text-primary);
}
.fade-in {
	animation: fadeIn 0.3s;
}
.animate-fade-up {
	animation: fadeUp 0.4s ease-out;
}
.border-start-glass {
	border-left: 1px dashed rgba(0, 0, 0, 0.1);
	padding-left: 40px;
}

.icon-box-glass {
	width: 56px;
	height: 56px;
	background: rgba(99, 102, 241, 0.1);
	color: var(--primary-600);
	border-radius: 16px;
	display: flex;
	align-items: center;
	justify-content: center;
}
.glass-content-card {
	background: var(--bg-card);
	backdrop-filter: blur(20px);
	border: 1px solid var(--border-color);
	border-radius: 24px;
	box-shadow: var(--shadow-sm);
}


.tabs-glass-nav {
	display: flex;
	gap: 24px;
}
.tab-glass-btn {
	background: transparent;
	border: none;
	color: var(--text-tertiary);
	font-weight: 600;
	font-size: 15px;
	position: relative;
}
.tab-glass-btn.active {
	color: var(--primary-600);
}
.tab-glass-btn.active::after {
	content: "";
	position: absolute;
	bottom: -1px;
	left: 0;
	right: 0;
	height: 3px;
	background: var(--primary-600);
	border-radius: 3px 3px 0 0;
}

.glass-input {
	width: 100%;
	padding: 12px 16px;
	background: var(--bg-secondary);
	border: 1px solid var(--border-color);
	border-radius: 12px;
	font-size: 14px;
	transition: all 0.3s;
	outline: none;
	color: var(--text-primary);
}
.glass-input:focus {
	background: var(--bg-card);
	border-color: var(--primary-400);
	box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}


.upload-area {
	border: 2px dashed var(--border-color);
	transition: all 0.3s;
	background: var(--bg-tertiary);
}
.upload-area:hover {
	border-color: var(--primary-500);
	background: rgba(99, 102, 241, 0.05);
}

.cursor-pointer {
	cursor: pointer;
}

.selected-tags-box {
	background: rgba(99, 102, 241, 0.05);
	min-height: 54px;
	border: 1px dashed rgba(99, 102, 241, 0.3);
}
.selected-tag-pill {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	background: var(--primary-600);
	color: white;
	padding: 4px 12px;
	border-radius: 20px;
	font-size: 12px;
	font-weight: 600;
}
.btn-remove-tag {
	background: rgba(255, 255, 255, 0.2);
	border: none;
	color: white;
	width: 18px;
	height: 18px;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	padding: 0;
}

.glass-search {
	display: flex;
	align-items: center;
	background: var(--bg-secondary);
	border: 1px solid var(--border-color);
	border-radius: var(--radius-full);
	padding: 4px 16px;
	width: 100%;
}

.search-input-premium {
	flex: 1;
	border: none;
	background: transparent;
	font-size: 13px;
	outline: none;
}

.suggested-tag-pill {
	display: inline-block;
	padding: 4px 10px;
	border-radius: 6px;
	font-size: 11px;
	font-weight: 600;
	cursor: pointer;
	border: 1px solid transparent;
	background: rgba(0, 0, 0, 0.03);
	color: var(--text-secondary);
}
.suggested-tag-pill.tag-primary.active {
	background: rgba(59, 130, 246, 0.15);
	border-color: rgba(59, 130, 246, 0.3);
	color: #2563eb;
}
.suggested-tag-pill.tag-danger.active {
	background: rgba(239, 68, 68, 0.15);
	border-color: rgba(239, 68, 68, 0.3);
	color: #dc2626;
}
.suggested-tag-pill.tag-warning.active {
	background: rgba(245, 158, 11, 0.15);
	border-color: rgba(245, 158, 11, 0.3);
	color: #d97706;
}
.suggested-tag-pill.tag-success.active {
	background: rgba(16, 185, 129, 0.15);
	border-color: rgba(16, 185, 129, 0.3);
	color: #059669;
}

.text-primary {
	color: #2563eb !important;
}
.text-danger {
	color: #dc2626 !important;
}
.text-warning {
	color: #d97706 !important;
}
.text-success {
	color: #059669 !important;
}

.glass-alert {
	padding: 24px 30px;
	border-radius: 20px;
}
.public-mode {
	background: rgba(16, 185, 129, 0.05);
	border: 1px solid rgba(16, 185, 129, 0.2);
	color: var(--success-800);
}
.public-mode .status-icon-box {
	background: var(--success-500);
	color: white;
	border-radius: 50%;
	padding: 12px;
}
.private-mode {
	background: rgba(239, 68, 68, 0.05);
	border: 1px solid rgba(239, 68, 68, 0.2);
	color: var(--danger-800);
}
.private-mode .status-icon-box {
	background: var(--danger-500);
	color: white;
	border-radius: 50%;
	padding: 12px;
}
.custom-switch .form-check-input {
	width: 3em;
	height: 1.5em;
	cursor: pointer;
}
.custom-switch .form-check-input:checked {
	background-color: var(--success-500);
	border-color: var(--success-500);
}

.btn {
	display: inline-flex;
	align-items: center;
	padding: 10px 24px;
	border-radius: 12px;
	font-weight: 600;
	font-size: 14px;
	transition: all 0.2s;
}
.btn-outline {
	background: transparent;
	border: 1px solid var(--border-color);
	color: var(--text-secondary);
}
.btn-primary {
	background: linear-gradient(135deg, var(--primary-600), var(--primary-500));
	color: white;
	border: none;
	box-shadow: 0 4px 15px rgba(99, 102, 241, 0.2);
}
.btn-primary:hover:not(:disabled) {
	transform: translateY(-2px);
}
.spinner-icon {
	animation: spin 1s linear infinite;
}

@keyframes fadeIn {
	from {
		opacity: 0;
	}
	to {
		opacity: 1;
	}
}
@keyframes fadeUp {
	from {
		opacity: 0;
		transform: translateY(20px);
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

.custom-scrollbar::-webkit-scrollbar {
	width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
	background: rgba(0, 0, 0, 0.15);
	border-radius: 4px;
}

@media (max-width: 992px) {
	.border-start-glass {
		border-left: none;
		padding-left: 0 !important;
		margin-top: 30px;
		border-top: 1px dashed rgba(0, 0, 0, 0.1);
		padding-top: 30px;
	}
}
</style>
