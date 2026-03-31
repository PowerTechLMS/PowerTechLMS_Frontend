<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, RouterLink } from "vue-router";
import { userAPI, userGroupAPI } from "@/services/api";
import {
	Users,
	Search,
	LayoutGrid,
	List,
	Plus,
	Pencil,
	Ban,
	User as UserIcon,
	CheckCircle,
	Mail,
	Shield,
	Layout,
	ChevronLeft,
	ChevronRight,
	UserCheck,
	UserMinus,
	FileUp,
} from "lucide-vue-next";
import { toast } from "vue3-toastify";

const router = useRouter();
const users = ref<any[]>([]);
const groups = ref<any[]>([]);
const loading = ref(true);
const viewMode = ref<"list" | "grid">("list");

const searchQuery = ref("");
const roleFilter = ref("All");
const statusFilter = ref("All");
const currentPage = ref(1);
const itemsPerPage = ref(12);

const defaultAvatar =
	"https://ui-avatars.com/api/?background=random&color=fff&name=";

const fetchUsers = async () => {
	loading.value = true;
	try {
		const res = await userAPI.getAll({ pageSize: 1500 });
		users.value = res.data.items || res.data;
	} catch {
		toast.error("Lỗi khi tải danh sách nhân sự");
	} finally {
		loading.value = false;
	}
};

const fetchGroups = async () => {
	try {
		const res = await userGroupAPI.getAll();
		groups.value = res.data.items || res.data;
	} catch {}
};

onMounted(() => {
	fetchUsers();
	fetchGroups();
});

const getAvatar = (name: string, avatarUrl: string | null) => {
	if (avatarUrl) {
		return avatarUrl.startsWith("http")
			? avatarUrl
			: `${import.meta.env.VITE_API_URL || "http://localhost:5100"}${avatarUrl}`;
	}
	return defaultAvatar + (name ? name.replace(/ /g, "+") : "User");
};

const getRoleDisplay = (role: string) => {
	const r = (role || "").toLowerCase();
	if (r === "admin") return { label: "ADMIN", class: "badge-glass danger" };
	if (r === "instructor")
		return { label: "Giảng Viên", class: "badge-glass info" };
	return { label: "Nhân Viên", class: "badge-glass primary" };
};

const editUser = (id: number) => router.push(`/admin/staff/edit/${id}`);
const viewProfile = (id: number) => router.push(`/admin/staff/profile/${id}`);

const toggleActive = async (user: any) => {
	const action = user.isActive ? "vô hiệu hóa" : "kích hoạt";
	if (confirm(`Bạn chắc chắn muốn ${action} tài khoản của ${user.fullName}?`)) {
		try {
			await userAPI.toggleActive(user.id);
			user.isActive = !user.isActive;
			toast.success(
				`${user.isActive ? "Đã kích hoạt" : "Đã vô hiệu hóa"} tài khoản`,
			);
		} catch {
			toast.error("Lỗi cập nhật trạng thái");
		}
	}
};

const totalStaff = computed(() => users.value.length);
const activeStaff = computed(
	() => users.value.filter((u) => u.isActive).length,
);
const inactiveStaff = computed(
	() => users.value.filter((u) => !u.isActive).length,
);

const filteredUsers = computed(() => {
	let result = [...users.value];

	if (searchQuery.value) {
		const q = searchQuery.value.toLowerCase();
		result = result.filter(
			(u) =>
				(u.fullName || "").toLowerCase().includes(q) ||
				(u.email || "").toLowerCase().includes(q),
		);
	}

	if (roleFilter.value !== "All") {
		result = result.filter(
			(u) => (u.role || "").toLowerCase() === roleFilter.value.toLowerCase(),
		);
	}

	if (statusFilter.value !== "All") {
		const wantActive = statusFilter.value === "Active";
		result = result.filter((u) => u.isActive === wantActive);
	}

	result.sort((a, b) => {
		const roleA = (a.role || "").toLowerCase();
		const roleB = (b.role || "").toLowerCase();
		if (roleA === "admin" && roleB !== "admin") return -1;
		if (roleB === "admin" && roleA !== "admin") return 1;
		return (a.fullName || "").localeCompare(b.fullName || "");
	});

	return result;
});

const totalPages = computed(
	() => Math.ceil(filteredUsers.value.length / itemsPerPage.value) || 1,
);

const paginatedUsers = computed(() => {
	const start = (currentPage.value - 1) * itemsPerPage.value;
	return filteredUsers.value.slice(start, start + itemsPerPage.value);
});

const handlePageChange = (page: number) => {
	if (page >= 1 && page <= totalPages.value) {
		currentPage.value = page;
	}
};

const fileInput = ref<HTMLInputElement | null>(null);

const triggerImport = () => {
	fileInput.value?.click();
};

const handleImport = async (event: any) => {
	const file = event.target.files[0];
	if (!file) return;

	const formData = new FormData();
	formData.append("file", file);

	const id = toast.loading("Đang xử lý file Excel...");
	try {
		const { data } = await userAPI.import(formData);
		toast.update(id, {
			render: `Import thành công ${data.successCount} nhân viên!`,
			type: "success",
			isLoading: false,
			autoClose: 3000,
		});

		if (data.errors && data.errors.length > 0) {
			toast.info(`Có ${data.errors.length} dòng lỗi.`, { autoClose: 5000 });
		}

		fetchUsers();
	} catch {
		toast.update(id, {
			render: "Lỗi khi import file Excel.",
			type: "error",
			isLoading: false,
			autoClose: 3000,
		});
	} finally {
		event.target.value = "";
	}
};
</script>

<template>
	<div class="staff-list-page">
		<div class="page-header">
			<div class="header-content">
				<div class="header-icon-box pulse-glow">
					<Users
						:size="32"
						style="width: 32px; height: 32px; min-width: 32px"
					/>
				</div>
				<div>
					<h1 class="page-title-gradient">Quản lý Nhân sự</h1>
					<p class="page-desc">
						Điều hành hệ thống tài khoản ADMIN, Giảng Viên và Nhân Viên trong tổ
						chức.
					</p>
				</div>
			</div>

			<div class="header-actions">
				<button class="btn-outline-glass me-3" @click="triggerImport">
					<FileUp
						:size="18"
						style="width: 18px; height: 18px; min-width: 18px"
						class="me-2"
					/>
					<span>Import Excel</span>
				</button>
				<input
					type="file"
					ref="fileInput"
					class="d-none"
					accept=".xlsx, .xls"
					@change="handleImport"
				/>

				<RouterLink to="/admin/staff/new" class="btn-submit decoration-none">
					<Plus
						:size="18"
						style="width: 18px; height: 18px; min-width: 18px"
						class="me-2"
					/>
					<span>Thêm Nhân sự mới</span>
				</RouterLink>
			</div>
		</div>

		<div class="stats-glass-grid">
			<div class="glass-stat-card primary">
				<div class="stat-icon-wrap">
					<Users
						:size="24"
						style="width: 24px; height: 24px; min-width: 24px"
					/>
				</div>
				<div class="stat-info">
					<p class="stat-label">Tổng Nhân sự</p>
					<h3 class="stat-value">{{ totalStaff }}</h3>
				</div>
			</div>

			<div class="glass-stat-card success">
				<div class="stat-icon-wrap">
					<UserCheck
						:size="24"
						style="width: 24px; height: 24px; min-width: 24px"
					/>
				</div>
				<div class="stat-info">
					<p class="stat-label">Đang Hoạt động</p>
					<h3 class="stat-value">{{ activeStaff }}</h3>
				</div>
			</div>

			<div class="glass-stat-card danger">
				<div class="stat-icon-wrap">
					<UserMinus
						:size="24"
						style="width: 24px; height: 24px; min-width: 24px"
					/>
				</div>
				<div class="stat-info">
					<p class="stat-label">Đã vô hiệu hóa</p>
					<h3 class="stat-value">{{ inactiveStaff }}</h3>
				</div>
			</div>
		</div>

		<div class="glass-content-card mt-4">
			<div class="glass-controls-bar">
				<div
					class="d-flex align-items-center flex-wrap gap-4 w-100 justify-content-between"
				>
					<div class="d-flex align-items-center flex-wrap gap-3">
						<div class="glass-search">
							<Search
								:size="18"
								class="animated-icon"
								style="width: 18px; height: 18px; min-width: 18px"
							/>
							<input
								type="text"
								class="search-input-premium"
								placeholder="Tìm tên hoặc email..."
								v-model="searchQuery"
								@input="currentPage = 1"
							/>
						</div>

						<div class="tabs-glass-nav border-0 p-0 bg-transparent">
							<button
								class="tab-glass-btn"
								:class="{ active: roleFilter === 'All' }"
								@click="
									roleFilter = 'All';
									currentPage = 1;
								"
							>
								Tất cả
							</button>
							<button
								class="tab-glass-btn"
								:class="{ active: roleFilter === 'Admin' }"
								@click="
									roleFilter = 'Admin';
									currentPage = 1;
								"
							>
								ADMIN
							</button>
							<button
								class="tab-glass-btn"
								:class="{ active: roleFilter === 'Instructor' }"
								@click="
									roleFilter = 'Instructor';
									currentPage = 1;
								"
							>
								Giảng Viên
							</button>
							<button
								class="tab-glass-btn"
								:class="{ active: roleFilter === 'Employee' }"
								@click="
									roleFilter = 'Employee';
									currentPage = 1;
								"
							>
								Nhân Viên
							</button>
						</div>
					</div>

					<div class="d-flex align-items-center gap-3">
						<div class="glass-select-group">
							<span class="fs-12 fw-bold text-tertiary me-2">TRẠNG THÁI:</span>
							<select
								class="glass-select-ui"
								v-model="statusFilter"
								@change="currentPage = 1"
							>
								<option value="All">Tất cả</option>
								<option value="Active">Đang hoạt động</option>
								<option value="Inactive">Bị khóa</option>
							</select>
						</div>

						<div class="glass-view-toggle">
							<button
								class="view-btn"
								:class="{ active: viewMode === 'list' }"
								@click="viewMode = 'list'"
								title="Dạng danh sách"
							>
								<List
									:size="18"
									style="width: 18px; height: 18px; min-width: 18px"
								/>
							</button>
							<button
								class="view-btn"
								:class="{ active: viewMode === 'grid' }"
								@click="viewMode = 'grid'"
								title="Dạng lưới"
							>
								<LayoutGrid
									:size="18"
									style="width: 18px; height: 18px; min-width: 18px"
								/>
							</button>
						</div>
					</div>
				</div>
			</div>

			<div class="glass-card-body pt-0">
				<div v-if="loading" class="loading-state py-5 text-center">
					<div class="spinner"></div>
					<p class="mt-3 text-muted fw-semi-bold">
						Đang tải dữ liệu nhân sự...
					</p>
				</div>

				<div
					v-else-if="filteredUsers.length === 0"
					class="empty-state py-5 text-center"
				>
					<div class="empty-icon-wrap mb-3">
						<Users
							:size="48"
							class="text-tertiary"
							style="width: 48px; height: 48px; min-width: 48px"
						/>
					</div>
					<h5 class="fw-bold">Không tìm thấy kết quả</h5>
					<p class="text-muted">
						Hãy thử thay đổi từ khóa tìm kiếm hoặc bộ lọc.
					</p>
				</div>

				<div v-else-if="viewMode === 'list'" class="table-container fade-in">
					<table class="glass-table">
						<thead>
							<tr>
								<th class="ps-4">Hồ sơ</th>
								<th>Liên hệ</th>
								<th width="130">Vai trò</th>
								<th>Phòng ban</th>
								<th width="100">Trạng thái</th>
								<th class="text-center pe-4">Thao tác</th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="user in paginatedUsers" :key="user.id">
								<td class="ps-4">
									<div class="d-flex align-items-center gap-3">
										<div class="avatar-container">
											<img
												:src="getAvatar(user.fullName, user.avatar)"
												class="avatar-glass shadow-sm"
												:class="{ grayscale: !user.isActive }"
												width="44"
												height="44"
											/>
											<span
												class="status-indicator"
												:class="user.isActive ? 'active' : 'inactive'"
											></span>
										</div>
										<div class="user-info">
											<div class="user-name fw-bold">
												{{ user.fullName }}
											</div>

											<div class="user-metadata fs-11 text-tertiary">
												#{{ user.id }} • Tham gia:
												{{
													user.createdAt
														? new Date(user.createdAt).toLocaleDateString(
																"vi-VN",
															)
														: "---"
												}}
											</div>
										</div>
									</div>
								</td>
								<td>
									<div class="d-flex align-items-center fs-13 text-secondary">
										<Mail
											:size="14"
											class="me-2 text-primary"
											style="width: 14px; height: 14px"
										/>
										<span class="text-truncate" style="max-width: 180px">{{
											user.email
										}}</span>
									</div>
								</td>
								<td>
									<span
										:class="getRoleDisplay(user.role).class"
										style="white-space: nowrap"
									>
										{{ getRoleDisplay(user.role).label }}
									</span>
								</td>
								<td>
									<div
										class="d-flex align-items-center fs-14 font-medium"
										v-if="user.groupName"
									>

										<Layout
											:size="14"
											class="me-2 text-tertiary"
											style="width: 14px; height: 14px"
										/>
										{{ user.groupName }}
									</div>
									<span v-else class="fs-12 text-tertiary italic"
										>Chưa gán</span
									>
								</td>
								<td width="100">
									<span
										class="status-pill py-1 px-2 d-inline-flex align-items-center"
										:class="user.isActive ? 'success-pill' : 'offline-pill'"
										:title="user.isActive ? 'Đang hoạt động' : 'Đã khóa'"
									>
										<CheckCircle
											v-if="user.isActive"
											:size="14"
											style="width: 14px; height: 14px"
										/>
										<Ban v-else :size="14" style="width: 14px; height: 14px" />
										<span class="ms-1 fs-11 fw-bold">{{
											user.isActive ? "Active" : "Locked"
										}}</span>
									</span>
								</td>
								<td class="text-center pe-4">
									<div class="d-flex justify-content-center gap-1">
										<button
											class="btn-ghost-icon primary"
											@click="viewProfile(user.id)"
											title="Hồ sơ"
										>
											<UserIcon :size="16" style="width: 16px; height: 16px" />
										</button>
										<button
											class="btn-ghost-icon info"
											@click="editUser(user.id)"
											title="Chỉnh sửa"
										>
											<Pencil :size="16" style="width: 16px; height: 16px" />
										</button>
										<button
											class="btn-ghost-icon"
											:class="user.isActive ? 'danger' : 'success'"
											@click="toggleActive(user)"
											:title="user.isActive ? 'Khóa tài khóa' : 'Kích hoạt'"
										>
											<component
												:is="user.isActive ? Ban : CheckCircle"
												:size="16"
												style="width: 16px; height: 16px"
											/>
										</button>
									</div>
								</td>
							</tr>
						</tbody>
					</table>
				</div>

				<div v-else class="grid-layout fade-in">
					<div
						v-for="user in paginatedUsers"
						:key="user.id"
						class="premium-glass-card user-card"
					>
						<div
							class="card-top-decoration"
							:class="
								getRoleDisplay(user.role).label === 'ADMIN'
									? 'danger'
									: getRoleDisplay(user.role).label === 'Giảng Viên'
										? 'info'
										: 'primary'
							"
						></div>

						<div class="card-inner-body">
							<div
								class="d-flex justify-content-between align-items-start mb-3"
							>
								<span
									:class="getRoleDisplay(user.role).class"
									style="font-size: 10px; padding: 2px 10px"
									>{{ getRoleDisplay(user.role).label }}</span
								>
								<button
									class="btn-ghost-icon sm"
									:class="user.isActive ? 'danger' : 'success'"
									@click="toggleActive(user)"
								>
									<component
										:is="user.isActive ? Ban : CheckCircle"
										:size="14"
										style="width: 14px; height: 14px"
									/>
								</button>
							</div>

							<div class="text-center mb-4">
								<div class="avatar-xl-wrap mx-auto mb-3">
									<img
										:src="getAvatar(user.fullName, user.avatar)"
										class="avatar-glass xl shadow-md"
										:class="{ grayscale: !user.isActive }"
									/>
									<span
										class="status-indicator xl"
										:class="user.isActive ? 'active' : 'inactive'"
									></span>
								</div>
								<h5 class="fw-bold mb-1 text-truncate px-2">
									{{ user.fullName }}
								</h5>

								<div class="fs-12 text-tertiary mb-3 text-truncate">
									{{ user.email }}
								</div>
							</div>

							<div class="user-card-info mb-4">
								<div class="info-row">
									<Layout
										:size="14"
										class="text-tertiary"
										style="width: 14px; height: 14px"
									/>
									<span class="text-truncate">{{
										user.groupName || "Chưa gán bộ phận"
									}}</span>
								</div>
								<div class="info-row">
									<Shield
										:size="14"
										class="text-tertiary"
										style="width: 14px; height: 14px"
									/>
									<span>ID: #{{ user.id }}</span>
								</div>
							</div>

							<div class="card-actions-grid gap-2">
								<button
									class="btn-glass-action flex-grow-1"
									@click="viewProfile(user.id)"
								>
									<UserIcon
										:size="14"
										class="me-2"
										style="width: 14px; height: 14px"
									/>
									Hồ sơ
								</button>
								<button
									class="btn-glass-action flex-grow-1"
									@click="editUser(user.id)"
								>
									<Pencil
										:size="14"
										class="me-2"
										style="width: 14px; height: 14px"
									/>
									Sửa
								</button>
							</div>
						</div>
					</div>
				</div>

				<div v-if="totalPages > 1" class="glass-pagination mt-4">
					<div class="pagination-info text-tertiary fs-13">
						Đang xem
						<strong>{{ (currentPage - 1) * itemsPerPage + 1 }}</strong> -
						<strong>{{
							Math.min(currentPage * itemsPerPage, filteredUsers.length)
						}}</strong>
						trên tổng <strong>{{ filteredUsers.length }}</strong> nhân sự
					</div>
					<div class="pagination-controls">
						<button
							class="page-nav-btn"
							:disabled="currentPage === 1"
							@click="handlePageChange(currentPage - 1)"
						>
							<ChevronLeft :size="18" style="width: 18px; height: 18px" />
						</button>

						<div class="page-numbers d-flex gap-1">
							<button
								v-for="page in totalPages"
								:key="page"
								class="page-number-btn"
								:class="{ active: currentPage === page }"
								@click="handlePageChange(page)"
								v-show="
									page === 1 ||
									page === totalPages ||
									Math.abs(page - currentPage) <= 1
								"
							>
								{{ page }}
							</button>
						</div>

						<button
							class="page-nav-btn"
							:disabled="currentPage === totalPages"
							@click="handlePageChange(currentPage + 1)"
						>
							<ChevronRight :size="18" style="width: 18px; height: 18px" />
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
.staff-list-page {
	padding-bottom: var(--space-2xl);
	color: var(--text-primary);
	animation: fadeIn 0.4s ease-out;
	margin: 0 auto;
	max-width: 1400px;
}
.fade-in {
	animation: fadeIn 0.3s ease-in-out;
}
.grayscale {
	filter: grayscale(1) opacity(0.7);
}
.italic {
	font-style: italic;
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
@keyframes pulse-border {
	0% {
		box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.2);
	}
	50% {
		box-shadow: 0 0 0 15px rgba(99, 102, 241, 0);
	}
	100% {
		box-shadow: 0 0 0 0 rgba(99, 102, 241, 0);
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
	padding-bottom: 30px;
	margin-bottom: 20px;
	flex-wrap: wrap;
	gap: var(--space-lg);
	border-bottom: 1px solid var(--border-color);
}

.header-content {
	display: flex;
	align-items: flex-start;
	gap: var(--space-xl);
}
.header-icon-box {
	width: 64px;
	height: 64px;
	border-radius: 20px;
	background: linear-gradient(
		135deg,
		rgba(99, 102, 241, 0.15),
		rgba(99, 102, 241, 0.05)
	);
	color: var(--primary-500);
	display: flex;
	align-items: center;
	justify-content: center;
	border: 1px solid rgba(99, 102, 241, 0.2);
	box-shadow: 0 8px 20px rgba(99, 102, 241, 0.15);
	flex-shrink: 0;
}
.pulse-glow {
	animation: pulse-border 3s ease-in-out infinite;
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
	font-size: var(--font-size-base);
	color: var(--text-secondary);
	max-width: 600px;
	line-height: 1.5;
	margin: 0;
}

.btn-submit {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	height: 44px;
	padding: 0 28px;
	background: linear-gradient(
		135deg,
		var(--primary-600) 0%,
		var(--primary-500) 100%
	);
	color: white;
	border: none;
	border-radius: var(--radius-full);
	font-weight: 700;
	font-size: 14px;
	cursor: pointer;
	transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
	box-shadow: 0 4px 15px rgba(99, 102, 241, 0.2);
}
.btn-submit:hover {
	transform: translateY(-2px);
	box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4);
	color: white;
}
.decoration-none {
	text-decoration: none;
}

.stats-glass-grid {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 24px;
	margin-bottom: 24px;
}
.glass-stat-card {
	position: relative;
	padding: 24px;
	border-radius: 24px;
	display: flex;
	align-items: center;
	background: var(--bg-card);
	backdrop-filter: blur(10px);
	border: 1px solid var(--border-color);
	transition: all 0.3s ease;
	box-shadow: var(--shadow-sm);
}

.glass-stat-card:hover {
	transform: translateY(-5px);
	box-shadow: 0 15px 35px rgba(0, 0, 0, 0.06);
}
.glass-stat-card.primary {
	border-bottom: 4px solid var(--primary-500);
}
.glass-stat-card.success {
	border-bottom: 4px solid var(--success-500);
}
.glass-stat-card.danger {
	border-bottom: 4px solid var(--danger-500);
}

.stat-icon-wrap {
	width: 52px;
	height: 52px;
	border-radius: 14px;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 20px;
	flex-shrink: 0;
}
.glass-stat-card.primary .stat-icon-wrap {
	background: rgba(99, 102, 241, 0.15);
	color: var(--primary-500);
}
.glass-stat-card.success .stat-icon-wrap {
	background: rgba(16, 185, 129, 0.15);
	color: var(--success-500);
}
.glass-stat-card.danger .stat-icon-wrap {
	background: rgba(239, 68, 68, 0.15);
	color: var(--danger-500);
}


.stat-label {
	margin: 0 0 6px 0;
	font-size: 11px;
	text-transform: uppercase;
	font-weight: 700;
	letter-spacing: 0.1em;
	color: var(--text-tertiary);
}
.stat-value {
	margin: 0;
	font-size: 28px;
	font-weight: 800;
	color: var(--text-primary);
	line-height: 1.1;
}

.btn-outline-glass {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	height: 44px;
	padding: 0 20px;
	background: var(--bg-secondary);
	backdrop-filter: blur(10px);
	border: 1px solid var(--border-color);
	border-radius: var(--radius-full);

	font-weight: 700;
	font-size: 14px;
	color: var(--text-secondary);
	cursor: pointer;
	transition: all 0.3s ease;
}
.btn-outline-glass:hover {
	background: var(--primary-50);
	color: var(--primary-600);
	border-color: var(--primary-200);
	transform: translateY(-2px);
}

.glass-content-card {
	background: var(--bg-card);
	backdrop-filter: blur(24px);
	border-radius: 32px;
	border: 1px solid var(--border-color);
	box-shadow: 0 20px 50px -15px rgba(0, 0, 0, 0.1);
	overflow: hidden;
}
.glass-controls-bar {
	padding: 24px 32px;
	border-bottom: 1px solid var(--border-color);
	background: rgba(255, 255, 255, 0.02);
}

.glass-card-body {
	padding: 0 32px 32px 32px;
}

.glass-search {
	display: flex;
	align-items: center;
	background: var(--bg-secondary);
	border: 1px solid var(--border-color);
	border-radius: var(--radius-full);
	padding: 4px 18px;
	box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.01);
	transition: all 0.3s;
	width: 100%;
	max-width: 320px;
}
.glass-search:focus-within {
	border-color: var(--primary-400);
	box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}
.animated-icon {
	color: var(--text-tertiary);
	transition: color 0.3s;
	flex-shrink: 0;
}
.glass-search:focus-within .animated-icon {
	color: var(--primary-500);
}
.search-input-premium {
	flex: 1;
	border: none;
	background: transparent;
	padding: 10px 8px;
	font-size: 14px;
	outline: none;
	color: var(--text-primary);
	font-family: inherit;
}

.tabs-glass-nav {
	display: flex;
	gap: 8px;
	background: var(--bg-secondary);
	padding: 6px;
	border-radius: 16px;
	border: 1px solid var(--border-color);
}
.tab-glass-btn {
	border: none;
	background: transparent;
	padding: 8px 20px;
	font-size: 13px;
	font-weight: 600;
	color: var(--text-tertiary);
	border-radius: 12px;
	cursor: pointer;
	transition: all 0.2s;
	white-space: nowrap;
}
.tab-glass-btn:hover:not(.active) {
	color: var(--text-primary);
	background: var(--bg-tertiary);
}
.tab-glass-btn.active {
	background: var(--bg-card);
	color: var(--primary-600);
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
	border: 1px solid var(--border-color);
}

.glass-select-group {
	display: flex;
	align-items: center;
}
.glass-select-ui {
	padding: 7px 32px 7px 16px;
	background: var(--bg-card)
		url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%236366f1' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3e%3c/svg%3e")
		no-repeat right 12px center/10px 10px;
	border: 1px solid var(--border-color);
	border-radius: 12px;
	font-size: 13px;
	font-weight: 700;
	color: var(--primary-600);
	appearance: none;
	outline: none;
	cursor: pointer;
	transition: all 0.3s;
	box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}
.glass-select-ui:focus {
	border-color: var(--primary-400);
	box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
	background-color: var(--bg-tertiary);
}


.glass-view-toggle {
	display: flex;
	background: var(--bg-secondary);
	border: 1px solid var(--border-color);
	border-radius: 12px;
	padding: 4px;
	gap: 4px;
}
.view-btn {
	width: 36px;
	height: 36px;
	display: flex;
	align-items: center;
	justify-content: center;
	border: none;
	background: transparent;
	border-radius: 9px;
	color: var(--text-tertiary);
	cursor: pointer;
	transition: all 0.2s;
}
.view-btn:hover:not(.active) {
	color: var(--text-primary);
	background: var(--bg-tertiary);
}
.view-btn.active {
	background: var(--bg-card);
	color: var(--primary-600);
	box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}

.table-container {
	border-radius: 20px;
	overflow: hidden;
	background: transparent;
}
.glass-table {
	width: 100%;
	border-collapse: separate;
	border-spacing: 0;
	min-width: 900px;
}
.glass-table th {
	padding: 20px 16px;
	background: rgba(255, 255, 255, 0.03);
	text-align: left;
	font-size: 11px;
	font-weight: 800;
	text-transform: uppercase;
	letter-spacing: 0.12em;
	color: var(--text-tertiary);
	border-bottom: 1px solid var(--border-color);
}
.glass-table td {
	padding: 18px 12px;
	background: transparent;
	border-bottom: 1px solid rgba(255, 255, 255, 0.05);
	vertical-align: middle;
	transition: all 0.2s ease;
}
.glass-table tbody tr:hover td {
	background: rgba(255, 255, 255, 0.03);
}
.glass-table tbody tr:last-child td {
	border-bottom: none;
}

.avatar-container {
	position: relative;
	flex-shrink: 0;
}
.avatar-glass {
	width: 44px;
	height: 44px;
	border-radius: 16px;
	border: 2px solid rgba(255, 255, 255, 0.1);
	box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
	object-fit: cover;
	aspect-ratio: 1/1;
	flex-shrink: 0;
	transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.avatar-glass:hover {
	transform: scale(1.1) rotate(2deg);
}
.avatar-glass.xl {
	width: 80px;
	height: 80px;
}
.status-indicator {
	position: absolute;
	bottom: -2px;
	right: -2px;
	width: 14px;
	height: 14px;
	border-radius: 50%;
	border: 3px solid var(--bg-secondary);
	z-index: 2;
}
.status-indicator.xl {
	width: 18px;
	height: 18px;
	bottom: 4px;
	right: 4px;
	border-width: 3px;
}
.status-indicator.active {
	background: var(--success-500);
	box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
}
.status-indicator.inactive {
	background: var(--danger-500);
}

.badge-glass {
	display: inline-flex;
	align-items: center;
	padding: 4px 14px;
	border-radius: var(--radius-full);
	font-size: 11px;
	font-weight: 700;
	text-transform: uppercase;
	letter-spacing: 0.05em;
	border: 1px solid transparent;
}
.badge-glass.primary {
	background: rgba(99, 102, 241, 0.1);
	color: var(--primary-700);
	border-color: rgba(99, 102, 241, 0.15);
}
.badge-glass.info {
	background: rgba(14, 165, 233, 0.1);
	color: var(--info-700);
	border-color: rgba(14, 165, 233, 0.15);
}
.badge-glass.danger {
	background: rgba(239, 68, 68, 0.1);
	color: var(--danger-700);
	border-color: rgba(239, 68, 68, 0.15);
}

.status-pill {
	border-radius: var(--radius-full);
	font-size: 12px;
	font-weight: 700;
	border: 1px solid transparent;
}
.success-pill {
	background: rgba(16, 185, 129, 0.08);
	color: var(--success-700);
	border-color: rgba(16, 185, 129, 0.15);
}
.offline-pill {
	background: rgba(0, 0, 0, 0.03);
	color: var(--text-tertiary);
	border-color: rgba(0, 0, 0, 0.05);
}
.pill-dot {
	width: 6px;
	height: 6px;
	border-radius: 50%;
}
.success-pill .pill-dot {
	background: var(--success-500);
	box-shadow: 0 0 8px var(--success-500);
}
.offline-pill .pill-dot {
	background: var(--text-tertiary);
}

.btn-ghost-icon {
	width: 36px;
	height: 36px;
	border-radius: 10px;
	border: 1px solid transparent;
	background: transparent;
	color: var(--text-tertiary);
	cursor: pointer;
	transition: all 0.2s;
	display: flex;
	align-items: center;
	justify-content: center;
}
.btn-ghost-icon.primary:hover {
	color: var(--primary-600);
	background: rgba(99, 102, 241, 0.08);
	border-color: rgba(99, 102, 241, 0.15);
	transform: translateY(-2px);
}
.btn-ghost-icon.info:hover {
	color: var(--info-600);
	background: rgba(14, 165, 233, 0.08);
	border-color: rgba(14, 165, 233, 0.15);
	transform: translateY(-2px);
}
.btn-ghost-icon.danger:hover {
	color: var(--danger-600);
	background: rgba(239, 68, 68, 0.08);
	border-color: rgba(239, 68, 68, 0.15);
	transform: translateY(-2px);
}
.btn-ghost-icon.success:hover {
	color: var(--success-600);
	background: rgba(16, 185, 129, 0.08);
	border-color: rgba(16, 185, 129, 0.15);
	transform: translateY(-2px);
}
.btn-ghost-icon.sm {
	width: 28px;
	height: 28px;
	border-radius: 8px;
}

.grid-layout {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
	gap: 24px;
}
.premium-glass-card {
	background: var(--bg-card);
	border-radius: 24px;
	border: 1px solid var(--border-color);
	overflow: hidden;
	transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
	box-shadow: 0 4px 15px rgba(0, 0, 0, 0.02);
	display: flex;
	flex-direction: column;
	position: relative;
}
.premium-glass-card:hover {
	transform: translateY(-8px);
	box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
	border-color: rgba(99, 102, 241, 0.1);
}

.card-top-decoration {
	height: 6px;
	width: 100%;
	position: absolute;
	top: 0;
	left: 0;
}
.card-top-decoration.primary {
	background: linear-gradient(90deg, var(--primary-400), var(--primary-600));
}
.card-top-decoration.info {
	background: linear-gradient(90deg, var(--info-400), var(--info-600));
}
.card-top-decoration.danger {
	background: linear-gradient(90deg, var(--danger-400), var(--danger-600));
}

.card-inner-body {
	padding: 24px;
	flex-grow: 1;
	display: flex;
	flex-direction: column;
}
.avatar-xl-wrap {
	position: relative;
	width: fit-content;
}
.shadow-md {
	box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.user-card-info {
	background: var(--bg-secondary);
	border-radius: 16px;
	padding: 12px;

	display: flex;
	flex-direction: column;
	gap: 8px;
}
.info-row {
	display: flex;
	align-items: center;
	gap: 10px;
	font-size: 13px;
	color: var(--text-secondary);
}

.card-actions-grid {
	display: flex;
}
.btn-glass-action {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 38px;
	border: 1px solid var(--border-color);
	background: var(--bg-secondary);

	border-radius: 12px;
	font-size: 13px;
	font-weight: 700;
	color: var(--text-secondary);
	cursor: pointer;
	transition: all 0.2s;
}
.btn-glass-action:hover {
	background: var(--primary-50);
	color: var(--primary-600);
	border-color: rgba(99, 102, 241, 0.2);
}

.glass-pagination {
	display: flex;
	justify-content: space-between;
	align-items: center;
	flex-wrap: wrap;
	gap: 20px;
	padding: 24px;
	border-top: 1px solid var(--border-color);
}

.pagination-controls {
	display: flex;
	align-items: center;
	gap: 12px;
}
.page-nav-btn {
	width: 40px;
	height: 40px;
	display: flex;
	align-items: center;
	justify-content: center;
	border: 1px solid var(--border-color);
	background: rgba(255, 255, 255, 0.05);
	border-radius: 12px;
	color: var(--text-tertiary);
	cursor: pointer;
	transition: all 0.2s;
}
.page-nav-btn:hover:not(:disabled) {
	color: var(--primary-600);
	border-color: var(--primary-300);
	background: var(--bg-card);
	shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}
.page-nav-btn:disabled {
	opacity: 0.4;
	cursor: not-allowed;
}

.page-number-btn {
	min-width: 40px;
	height: 40px;
	padding: 0 14px;
	border: 1px solid transparent;
	background: transparent;
	font-size: 14px;
	font-weight: 700;
	color: var(--text-tertiary);
	border-radius: 12px;
	cursor: pointer;
	transition: all 0.2s;
}
.page-number-btn:hover:not(.active) {
	background: var(--bg-tertiary);
	color: var(--text-primary);
}

.page-number-btn.active {
	background: var(--primary-600);
	color: white;
	box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.spinner {
	width: 44px;
	height: 44px;
	border: 4px solid rgba(99, 102, 241, 0.1);
	border-top-color: var(--primary-600);
	border-radius: 50%;
	animation: spin 1s linear infinite;
	margin: 0 auto;
}
.empty-icon-wrap {
	width: 100px;
	height: 100px;
	border-radius: 50%;
	background: var(--bg-secondary);

	display: flex;
	align-items: center;
	justify-content: center;
	margin: 0 auto;
}

.lucide,
svg {
	flex-shrink: 0;
}

.table-container::-webkit-scrollbar {
	height: 6px;
	width: 6px;
}
.table-container::-webkit-scrollbar-track {
	background: transparent;
}
.table-container::-webkit-scrollbar-thumb {
	background: rgba(0, 0, 0, 0.1);
	border-radius: 10px;
}
.table-container:hover::-webkit-scrollbar-thumb {
	background: rgba(0, 0, 0, 0.2);
}

@media (max-width: 1200px) {
	.stats-glass-grid {
		grid-template-columns: 1fr;
	}
}
@media (max-width: 991px) {
	.glass-controls-bar {
		flex-direction: column;
		align-items: stretch;
	}
	.tabs-glass-nav {
		overflow-x: auto;
		scrollbar-width: none;
	}
	.grid-layout {
		grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
	}
}
@media (max-width: 768px) {
	.page-header {
		text-align: center;
		justify-content: center;
		padding: 20px;
	}
	.header-content {
		flex-direction: column;
		align-items: center;
	}
	.header-actions {
		width: 100%;
		display: flex;
		justify-content: center;
	}
	.glass-card-body {
		padding: 0 20px 20px 20px;
	}
	.glass-pagination {
		flex-direction: column;
		text-align: center;
	}
}

</style>

