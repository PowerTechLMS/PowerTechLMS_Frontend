<script lang="ts" setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { documentAPI, userGroupAPI, rbacAPI, userAPI } from "@/services/api";
import { toast } from "vue3-toastify";
import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
import {
	X,
	Filter,
	Tag,
	CheckCircle2,
	ShieldAlert,
	Loader2,
	Globe,
	Lock,
	Shield,
	Building2,
	Users as UsersIcon,
} from "lucide-vue-next";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const authStore = useAuthStore();

const isSubmitting = ref(false);
const isLoading = ref(false);
const activeTab = ref("general");

const isAdmin = computed(() => authStore.hasRole("Admin"));
const isInstructor = computed(
	() => authStore.hasRole("Instructor") && !isAdmin.value,
);
const fileInfo = ref<{ name: string; size: string; ext: string } | null>(null);

const documentForm = ref({
	Title: "",
	Description: "",
	Tags: "",
	AccessStartDate: null as Date | null,
	AccessEndDate: null as Date | null,
	File: null as File | null,
	ChangeNote: "Bản phát hành đầu tiên",
	isPublic: true,
});

const selectedRoles = ref<number[]>([]);
const selectedGroups = ref<number[]>([]);
const selectedUsers = ref<number[]>([]);

const allRoles = ref<any[]>([]);
const allGroups = ref<any[]>([]);
const allUsers = ref<any[]>([]);

onMounted(async () => {
	isLoading.value = true;
	try {
		const [rolesRes, groupsRes, usersRes] = await Promise.all([
			rbacAPI.getRoles().catch(() => ({ data: [] })),
			userGroupAPI.getAll({ pageSize: 1500 }).catch(() => ({ data: [] })),
			userAPI.getAll({ pageSize: 2000 }).catch(() => ({ data: [] })),
		]);

		allRoles.value = rolesRes.data?.items || rolesRes.data || [];
		allGroups.value = groupsRes.data?.items || groupsRes.data || [];
		allUsers.value = usersRes.data?.items || usersRes.data || [];
	} catch {
		toast.error("Không thể tải dữ liệu phân quyền.");
	} finally {
		isLoading.value = false;
	}
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
		const res = await documentAPI.create(formData);
		const newDocId = res.data.id;

		if (!documentForm.value.isPublic && newDocId) {
			const permPayload = {
				roleIds: selectedRoles.value || [],
				groupIds: selectedGroups.value || [],
				userIds: selectedUsers.value || [],
			};
			await documentAPI.updatePermissions(newDocId, permPayload);
		}

		toast.success("Tải lên tài liệu thành công!");
		router.push("/admin/documents");
	} catch (error: any) {
		toast.error(error.response?.data?.message || "Lỗi khi tải lên tài liệu.");
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
	<div class="doc-add-page">
		<div v-if="isLoading" class="text-center py-5">
			<Loader2 class="spinner-icon mx-auto text-primary" :size="40" />
		</div>

		<div v-else>
			<div class="page-header mb-4">
				<div class="d-flex align-items-center gap-3">
					<div class="icon-box-glass"><Tag :size="28" /></div>
					<div>
						<h2 class="fw-bold mb-1 fs-24 text-dark">Thêm mới Tài liệu</h2>
						<p class="text-muted fs-14 mb-0">
							Tải lên và phân phối tài liệu nội bộ cho hệ thống.
						</p>
					</div>
				</div>
				<button
					@click="router.push('/admin/documents')"
					class="btn btn-outline"
				>
					Quay lại
				</button>
			</div>

			<form @submit.prevent="submitAddForm">
				<div class="glass-content-card">
					<div class="tabs-glass-nav px-4 pt-3 border-bottom-glass">
						<button
							type="button"
							class="tab-glass-btn pb-3"
							:class="{ active: activeTab === 'general' }"
							@click="activeTab = 'general'"
						>
							Thông tin & Tệp đính kèm
						</button>
						<button
							type="button"
							class="tab-glass-btn pb-3 d-flex align-items-center"
							:class="{ active: activeTab === 'security' }"
							@click="activeTab = 'security'"
						>
							<ShieldAlert
								:size="16"
								class="me-2"
								:class="documentForm.isPublic ? 'text-success' : 'text-danger'"
							/>
							Quyền truy cập
						</button>
					</div>

					<div class="p-4 p-md-5">
						<div v-show="activeTab === 'general'" class="fade-in">
							<div class="row g-5">
								<div class="col-lg-7">
									<div class="form-group mb-4">
										<label
											class="form-label fw-bold fs-13 text-uppercase text-muted mb-2"
										>
											Tên tài liệu <span class="text-danger">*</span>
										</label>
										<input
											v-model="documentForm.Title"
											type="text"
											class="glass-input w-100"
											required
											placeholder="Nhập tiêu đề tài liệu..."
										/>
									</div>

									<div class="form-group mb-4">
										<label
											class="form-label fw-bold fs-13 text-uppercase text-muted mb-2"
										>
											Mô tả nội dung
										</label>
										<textarea
											v-model="documentForm.Description"
											class="glass-input w-100"
											rows="4"
											placeholder="Tóm tắt ngắn gọn nội dung tài liệu..."
										></textarea>
									</div>

									<div class="row g-3 mb-4">
										<div class="col-md-6">
											<label
												class="form-label fw-bold fs-13 text-uppercase text-muted mb-2"
												>Ngày bắt đầu</label
											>
											<VueDatePicker
												v-model="documentForm.AccessStartDate"
												:enable-time-picker="false"
												auto-apply
												placeholder="Hiển thị ngay"
											/>
										</div>
										<div class="col-md-6">
											<label
												class="form-label fw-bold fs-13 text-uppercase text-muted mb-2"
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

									<div class="form-group mb-0">
										<label
											class="form-label fw-bold fs-13 text-uppercase text-muted mb-3 d-flex align-items-center gap-2"
										>
											<Filter :size="16" class="text-primary" /> Phân loại Thẻ
											(Tags)
										</label>

										<div
											class="selected-tags-box mb-3 p-3 rounded-3"
											:class="{ 'has-tags': selectedTagsArray.length > 0 }"
										>
											<div
												v-if="selectedTagsArray.length === 0"
												class="text-muted fs-13 fst-italic"
											>
												Nhấp chọn các gợi ý bên dưới hoặc tự nhập...
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
											class="tag-library p-3 rounded-4 custom-scrollbar"
											style="
												max-height: 250px;
												overflow-y: auto;
												background: var(--bg-tertiary);
											"
										>
											<div
												class="mb-4"
												v-for="(group, key) in predefinedTags"
												:key="key"
											>
												<div
													class="mb-2 fs-11 fw-bold text-uppercase text-muted"
												>
													{{ group.label }}
												</div>
												<div class="d-flex flex-wrap gap-2">
													<span
														v-for="tag in group.items"
														:key="tag"
														class="suggested-pill-glass"
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

								<div class="col-lg-5">
									<div class="upload-section sticky-top" style="top: 20px">
										<label
											class="form-label fw-bold fs-13 text-uppercase text-muted mb-3 d-flex align-items-center gap-2"
										>
											<UploadCloud :size="16" /> Tải lên Tài liệu
											<span class="text-danger">*</span>
										</label>

										<input
											id="fileUpload"
											type="file"
											class="d-none"
											@change="onFileChange"
											required
										/>
										<label
											for="fileUpload"
											class="upload-area-premium p-5 text-center d-flex flex-column align-items-center justify-content-center cursor-pointer mb-4"
										>
											<div v-if="!fileInfo" class="upload-placeholder">
												<UploadCloud
													:size="48"
													class="text-primary mb-3 opacity-50"
												/>
												<h6 class="fw-bold mb-1 text-dark">Nhấp để chọn tệp</h6>
												<p class="text-muted small mb-0">
													PDF, Word, Excel (Max 50MB)
												</p>
											</div>
											<div
												v-else
												class="file-info-active d-flex align-items-center gap-3"
											>
												<div
													class="file-ext-icon"
													:class="getExtBg(fileInfo.ext)"
												>
													<span
														:class="getExtColor(fileInfo.ext)"
														class="fw-bold"
														>{{ fileInfo.ext }}</span
													>
												</div>
												<div class="text-start">
													<div
														class="fw-bold text-dark text-truncate"
														style="max-width: 200px"
													>
														{{ fileInfo.name }}
													</div>
													<div class="text-muted small">
														{{ fileInfo.size }}
													</div>
												</div>
											</div>
										</label>

										<div class="form-group">
											<label class="form-label fw-bold fs-12 text-tertiary mb-2"
												>Ghi chú cho phiên bản này:</label
											>
											<input
												v-model="documentForm.ChangeNote"
												type="text"
												class="glass-input w-100 py-2 fs-13"
												placeholder="Ví dụ: Bản nháp đầu tiên..."
											/>
										</div>
									</div>
								</div>
							</div>
						</div>

						<div v-show="activeTab === 'security'" class="fade-in">
							<div
								class="glass-alert mb-5"
								:class="documentForm.isPublic ? 'public-mode' : 'private-mode'"
							>
								<div
									class="d-flex justify-content-between align-items-center flex-wrap gap-4"
								>
									<div class="d-flex align-items-start gap-4">
										<div class="status-icon-box shadow-sm">
											<Globe v-if="documentForm.isPublic" :size="24" />
											<Lock v-else :size="24" />
										</div>
										<div>
											<h5 class="fw-bold mb-1 text-dark">
												{{
													documentForm.isPublic
														? "Tài liệu Lưu hành chung (Public)"
														: "Tài liệu Nội bộ / Hạn chế (Private)"
												}}
											</h5>
											<p class="mb-0 fs-14 text-muted">
												{{
													documentForm.isPublic
														? "Tất cả nhân viên trong hệ thống đều có thể xem và tải tài liệu này."
														: "Chỉ những Vai trò, Phòng ban, hoặc Cá nhân được chỉ định bên dưới mới có thể truy cập."
												}}
											</p>
										</div>
									</div>

									<div class="form-check form-switch custom-switch-premium">
										<input
											class="form-check-input"
											type="checkbox"
											role="switch"
											id="publicSwitch"
											v-model="documentForm.isPublic"
										/>
										<label
											class="form-check-label fw-bold ms-2"
											for="publicSwitch"
											>{{
												documentForm.isPublic ? "Đang Mở" : "Đang Khóa"
											}}</label
										>
									</div>
								</div>
							</div>

							<div
								v-if="!documentForm.isPublic"
								class="permissions-container animate-fade-up"
							>
								<div class="row g-4">
									<div v-if="!isInstructor" class="col-md-6">
										<div class="perm-box glass-card-nested p-4 h-100">
											<div class="d-flex align-items-center mb-4 text-primary">
												<Shield :size="20" class="me-2" />
												<span class="fw-bold fs-16"
													>Phân quyền theo Vai trò</span
												>
											</div>
											<div
												class="custom-scrollbar px-1"
												style="max-height: 350px; overflow-y: auto"
											>
												<div class="row g-2">
													<div v-for="r in allRoles" :key="r.id" class="col-12">
														<label class="perm-item-label hvr-primary">
															<input
																type="checkbox"
																class="form-check-input me-3"
																:value="r.id"
																v-model="selectedRoles"
															/>
															<span class="fs-14 fw-semibold text-dark">{{
																r.name
															}}</span>
														</label>
													</div>
												</div>
											</div>
										</div>
									</div>

									<div :class="isInstructor ? 'col-12' : 'col-md-6'">
										<div class="perm-box glass-card-nested p-4 h-100">
											<div class="d-flex align-items-center mb-4 text-primary">
												<Building2 :size="20" class="me-2" />
												<span class="fw-bold fs-16"
													>Phân quyền theo Phòng ban</span
												>
											</div>
											<div
												class="custom-scrollbar px-1"
												style="max-height: 350px; overflow-y: auto"
											>
												<div class="row g-2">
													<div
														v-for="g in allGroups"
														:key="g.id"
														class="col-12"
													>
														<label class="perm-item-label hvr-info">
															<input
																type="checkbox"
																class="form-check-input me-3"
																:value="g.id"
																v-model="selectedGroups"
															/>
															<span class="fs-14 fw-semibold text-dark">{{
																g.name
															}}</span>
														</label>
													</div>
												</div>
											</div>
										</div>
									</div>

									<div v-if="!isInstructor" class="col-12 mt-4">
										<div class="perm-box glass-card-nested p-4">
											<div class="d-flex align-items-center mb-4 text-primary">
												<UsersIcon :size="20" class="me-2" />
												<span class="fw-bold fs-16"
													>Chỉ định đích danh Người dùng</span
												>
											</div>
											<div
												class="custom-scrollbar px-1"
												style="max-height: 400px; overflow-y: auto"
											>
												<div class="row g-3">
													<div
														v-for="u in allUsers"
														:key="u.id"
														class="col-md-6 col-lg-4 col-xl-3"
													>
														<label
															class="perm-item-label user-item hvr-warning"
														>
															<input
																type="checkbox"
																class="form-check-input me-3"
																:value="u.id"
																v-model="selectedUsers"
															/>
															<div class="d-flex flex-column overflow-hidden">
																<span
																	class="fs-13 fw-bold text-dark text-truncate"
																	>{{ u.fullName }}</span
																>
																<span class="fs-11 text-muted text-truncate">{{
																	u.email
																}}</span>
															</div>
														</label>
													</div>
												</div>
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
								type="button"
								class="btn btn-light-glass px-4"
								@click="router.push('/admin/documents')"
							>
								Hủy bỏ
							</button>
							<button
								type="submit"
								class="btn btn-neon-premium px-5"
								:disabled="isSubmitting"
							>
								<Loader2
									v-if="isSubmitting"
									:size="18"
									class="spinner-icon me-2"
								/>
								<CheckCircle2 v-else :size="18" class="me-2" />
								Lưu & Tải lên
							</button>
						</div>
					</div>
				</div>
			</form>
		</div>
	</div>
</template>

<style scoped>
.doc-add-page {
	padding: 24px 0 60px;
	max-width: 1200px;
	margin: 0 auto;
}

.fade-in {
	animation: fadeIn 0.3s ease-out;
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
	border-radius: 28px;
	box-shadow: var(--shadow-md);
	overflow: hidden;
}

.tabs-glass-nav {
	display: flex;
	gap: 32px;
	padding-bottom: 0;
}

.tab-glass-btn {
	background: transparent;
	border: none;
	color: var(--text-tertiary);
	font-weight: 700;
	font-size: 15px;
	position: relative;
	transition: all 0.2s;
	padding: 12px 4px;
}

.tab-glass-btn.active {
	color: var(--primary-600);
}

.tab-glass-btn.active::after {
	content: "";
	position: absolute;
	bottom: -2px;
	left: 0;
	right: 0;
	height: 4px;
	background: var(--primary-600);
	border-radius: 4px 4px 0 0;
	box-shadow: 0 -2px 10px rgba(99, 102, 241, 0.3);
}

.glass-input {
	padding: 14px 18px;
	background: var(--bg-secondary);
	border: 1px solid var(--border-color);
	border-radius: 14px;
	font-size: 14px;
	transition: all 0.3s;
	outline: none;
	color: var(--text-primary);
}

.glass-input:focus {
	background: var(--bg-card);
	border-color: var(--primary-500);
	box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}

.upload-area-premium {
	border: 2px dashed var(--border-color);
	border-radius: 20px;
	background: var(--bg-tertiary);
	transition: all 0.3s;
}

.upload-area-premium:hover {
	border-color: var(--primary-500);
	background: rgba(99, 102, 241, 0.05);
	transform: translateY(-2px);
}

.file-ext-icon {
	width: 48px;
	height: 48px;
	border-radius: 12px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.selected-tags-box {
	background: rgba(99, 102, 241, 0.05);
	min-height: 54px;
	border: 1px dashed rgba(99, 102, 241, 0.3);
	margin-bottom: 16px;
}

.selected-tag-pill {
	display: inline-flex;
	align-items: center;
	padding: 6px 14px;
	background: var(--primary-600);
	color: white;
	border-radius: 20px;
	font-size: 12px;
	font-weight: 600;
	gap: 8px;
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
	padding: 0;
	transition: all 0.2s;
}

.btn-remove-tag:hover {
	background: rgba(255, 255, 255, 0.4);
}

.glass-search {
	display: flex;
	background: var(--bg-secondary);
	border: 1px solid var(--border-color);
}

.search-input-premium {
	flex: 1;
	background: transparent;
	border: none;
	outline: none;
	color: var(--text-primary);
	font-size: 13px;
}

.suggested-pill-glass {
	padding: 6px 14px;
	border-radius: 10px;
	font-size: 12px;
	font-weight: 600;
	cursor: pointer;
	background: var(--bg-card);
	border: 1px solid var(--border-color);
	color: var(--text-tertiary);
	transition: all 0.2s;
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

.glass-alert {
	padding: 24px;
	border-radius: 20px;
	border: 1px solid transparent;
}

.public-mode {
	background: rgba(16, 185, 129, 0.05);
	border-color: rgba(16, 185, 129, 0.2);
}
.private-mode {
	background: rgba(239, 68, 68, 0.03);
	border-color: rgba(239, 68, 68, 0.1);
}

.status-icon-box {
	width: 56px;
	height: 56px;
	background: white;
	border-radius: 18px;
	display: flex;
	align-items: center;
	justify-content: center;
	color: var(--primary-600);
}

.custom-switch-premium .form-check-input {
	width: 50px;
	height: 26px;
	cursor: pointer;
}

.glass-card-nested {
	background: var(--bg-tertiary);
	border: 1px solid var(--border-color);
	border-radius: 20px;
}

.perm-item-label {
	display: flex;
	align-items: center;
	padding: 12px 16px;
	border-radius: 12px;
	background: var(--bg-card);
	border: 1px solid var(--border-color);
	cursor: pointer;
	transition: all 0.2s;
}

.hvr-primary:hover {
	border-color: var(--primary-400);
	background: rgba(99, 102, 241, 0.05);
}
.hvr-info:hover {
	border-color: #06b6d4;
	background: rgba(6, 182, 212, 0.05);
}
.hvr-warning:hover {
	border-color: #f59e0b;
	background: rgba(245, 158, 11, 0.05);
}

.btn-light-glass {
	background: var(--bg-secondary);
	border: 1px solid var(--border-color);
	font-weight: 600;
	color: var(--text-secondary);
	border-radius: 12px;
}
.btn-neon-premium {
	background: var(--primary-600);
	color: white;
	font-weight: 700;
	border-radius: 12px;
	box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
	border: none;
	transition: all 0.3s;
}
.btn-neon-premium:hover {
	background: var(--primary-700);
	transform: translateY(-2px);
	box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
}

.custom-scrollbar::-webkit-scrollbar {
	width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
	background: rgba(0, 0, 0, 0.1);
	border-radius: 10px;
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
		transform: translateY(10px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}
</style>
