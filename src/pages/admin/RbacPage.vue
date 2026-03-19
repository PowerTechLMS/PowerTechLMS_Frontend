<template>
	<div class="rbac-page">
		<div class="page-header">
			<div>
				<h1 class="page-title-gradient">
					<Shield :size="28" class="title-icon" /> Quản lý Phân quyền
				</h1>
				<p class="page-desc">
					Thiết lập Roles, Permissions và điều phối quyền truy cập hệ thống
				</p>
			</div>
		</div>

		<div class="tabs-container">
			<div class="tabs glass-tabs" ref="tabsRef">
				<div class="tab-indicator" :style="indicatorStyle"></div>
				<button
					class="tab"
					:class="{ active: tab === 'roles' }"
					@click="switchTab('roles', $event)"
				>
					<Users :size="16" /> Vai trò ({{ roles.length }})
				</button>
				<button
					class="tab"
					:class="{ active: tab === 'assign' }"
					@click="switchTab('assign', $event)"
				>
					<UserCheck :size="16" /> Gán quyền
				</button>
			</div>
		</div>

		<div class="tab-content-wrapper">
			<Transition name="fade-slide" mode="out-in">
				<!-- Roles Tab -->
				<div v-if="tab === 'roles'" class="tab-content" :key="'roles'">
					<div class="section-bar">
						<h2 class="section-title">Vai trò hệ thống</h2>
						<button
							class="btn btn-primary btn-glow"
							@click="showCreateRole = true"
						>
							<Plus :size="16" /> Tạo Role mới
						</button>
					</div>

					<div class="roles-grid">
						<div
							v-for="role in roles"
							:key="role.id"
							class="glass-card role-card-premium"
						>
							<div class="role-card-header">
								<div class="role-info-wrap">
									<div class="role-icon-box" :class="{ system: role.isSystem }">
										<ShieldCheck :size="24" />
									</div>
									<div>
										<div class="role-name-premium">
											{{ role.name }}
											<span v-if="role.isSystem" class="badge-system"
												>Hệ thống</span
											>
										</div>
										<p class="role-desc-premium">
											{{ role.description || "Không có mô tả" }}
										</p>
									</div>
								</div>
								<button
									v-if="!role.isSystem"
									class="btn-icon danger sm"
									@click="deleteRole(role.id)"
								>
									<Trash2 :size="16" />
								</button>
							</div>

							<div class="perm-container-premium custom-scrollbar">
								<div class="perm-stats">
									<span class="perm-badge"
										>{{ role.permissions?.length || 0 }} quyền năng</span
									>
								</div>
								<div
									v-for="cat in permCategories"
									:key="cat"
									class="perm-cat-group"
								>
									<div class="perm-cat-header">
										<span
											class="cat-dot"
											:style="{ background: getCatColor(cat) }"
										></span>
										{{ cat }}
									</div>
									<div class="perm-items-grid">
										<label
											v-for="p in permissionsByCategory[cat]"
											:key="p.id"
											class="perm-item-check"
											:class="{ active: role.permissions.includes(p.code) }"
										>
											<input
												type="checkbox"
												:checked="role.permissions.includes(p.code)"
												@change="togglePermission(role, p)"
											/>
											<span class="p-name">{{ p.name }}</span>
											<Transition name="scale">
												<Check
													v-if="role.permissions.includes(p.code)"
													:size="12"
													class="p-check-icon"
												/>
											</Transition>
										</label>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Assign Tab -->
				<div v-else-if="tab === 'assign'" class="tab-content" :key="'assign'">
					<div class="assign-layout">
						<div class="user-select-panel glass-card">
							<div class="panel-header">
								<h3 class="panel-title">Người dùng ({{ userTotal }})</h3>
								<div class="search-box glass-search">
									<Search :size="14" class="animated-icon" />
									<input
										v-model="userSearch"
										@input="debounceSearch"
										placeholder="Tìm tên/email..."
										class="search-input-premium sm"
									/>
								</div>
							</div>
							<div class="user-list-scroll custom-scrollbar">
								<div v-if="loadingUsers" class="loading-state-skeleton">
									<div v-for="i in 5" :key="i" class="user-skeleton">
										<div class="skel-avatar"></div>
										<div class="skel-info">
											<div class="skel-line w-70"></div>
											<div class="skel-line w-50"></div>
										</div>
									</div>
								</div>
								<div v-else-if="users.length === 0" class="empty-state sm">
									<Users :size="32" />
									<p>Không tìm thấy user</p>
								</div>
								<TransitionGroup name="list" tag="div" v-else>
									<div
										v-for="u in users"
										:key="u.id || u.Id"
										class="user-item"
										:class="{ active: assignedUser?.id === (u.id || u.Id) }"
										@click="selectUser(u)"
									>
										<div
											class="user-item-avatar"
											:style="
												u.avatar || u.Avatar
													? `background-image: url('${getAvatarUrl(u.avatar || u.Avatar)}')`
													: `background: ${getAvatarColor(u.fullName)}`
											"
										>
											{{ u.avatar || u.Avatar ? "" : getInitials(u.fullName) }}
										</div>
										<div class="user-item-info">
											<div class="user-item-name">{{ u.fullName }}</div>
											<div class="user-item-email">{{ u.email }}</div>
										</div>
										<ChevronRight :size="16" class="arrow" />
									</div>
								</TransitionGroup>
							</div>
							<div class="panel-footer" v-if="userTotal > userPageSize">
								<button
									class="btn-icon sm ghost"
									:disabled="userPage === 1"
									@click="
										userPage--;
										fetchUsers();
									"
								>
									<ChevronLeft :size="14" />
								</button>
								<span class="page-info"
									>{{ userPage }} /
									{{ Math.ceil(userTotal / userPageSize) }}</span
								>
								<button
									class="btn-icon sm ghost"
									:disabled="userPage >= Math.ceil(userTotal / userPageSize)"
									@click="
										userPage++;
										fetchUsers();
									"
								>
									<ChevronRight :size="14" />
								</button>
							</div>
						</div>

						<div class="role-assign-panel glass-card">
							<Transition name="fade-slide" mode="out-in">
								<div v-if="!assignedUser" class="no-selection" :key="'none'">
									<div class="no-selection-icon pulse-glow">
										<UserPlus :size="56" />
									</div>
									<h3>Chưa chọn người dùng</h3>
									<p>Hãy chọn người dùng để gán quyền</p>
								</div>
								<div v-else class="assign-content" :key="assignedUser.id">
									<div class="assign-header profile-card-layout">
										<div
											class="profile-bg-glow"
											:style="{
												background: getAvatarColor(
													assignedUser.fullName || assignedUser.userName,
												),
											}"
										></div>
										<div class="selected-user-detail">
											<div
												class="user-lg-avatar"
												:style="
													assignedUser.avatar || assignedUser.Avatar
														? `background-image: url('${getAvatarUrl(assignedUser.avatar || assignedUser.Avatar)}')`
														: `background: ${getAvatarColor(assignedUser.fullName || assignedUser.userName)}`
												"
											>
												{{
													assignedUser.avatar || assignedUser.Avatar
														? ""
														: getInitials(
																assignedUser.fullName || assignedUser.userName,
															)
												}}
											</div>
											<div class="user-meta-info">
												<h3 class="user-detail-name">
													{{ assignedUser.fullName || assignedUser.userName }}
												</h3>
												<p class="user-detail-email">
													{{ assignedUser.email }}
												</p>
												<div class="user-badges">
													<span
														class="user-detail-badge"
														v-if="assignedUser.role"
														>{{ assignedUser.role }}</span
													>
													<span class="user-detail-badge premium"
														>{{ selectedRoleIds.length }} Roles</span
													>
												</div>
											</div>
										</div>
									</div>
									<div class="roles-selection-box custom-scrollbar">
										<h4 class="box-title">
											<ShieldCheck :size="20" class="title-icon" /> Phân vai trò
											(Roles)
										</h4>
										<div class="roles-blocks-grid">
											<label
												v-for="role in roles"
												:key="role.id"
												class="role-block-card"
												:class="{ selected: selectedRoleIds.includes(role.id) }"
											>
												<input
													type="checkbox"
													:checked="selectedRoleIds.includes(role.id)"
													@change="toggleUserRole(role)"
													class="hidden-input"
												/>
												<div class="role-block-content">
													<div
														class="role-block-icon"
														:class="{ system: role.isSystem }"
													>
														<Shield :size="20" />
													</div>
													<div class="role-block-text">
														<span class="role-block-name">{{ role.name }}</span>
														<span class="role-block-desc">{{
															role.description
														}}</span>
													</div>
													<div class="role-block-check">
														<Transition name="scale"
															><div
																v-if="selectedRoleIds.includes(role.id)"
																class="check-circle"
															>
																<Check :size="14" /></div
														></Transition>
													</div>
												</div>
											</label>
										</div>
									</div>
									<div class="assign-actions">
										<button
											class="btn btn-primary btn-glow btn-lg w-full"
											@click="saveUserRoles"
											:disabled="savingRoles"
										>
											<Loader2
												v-if="savingRoles"
												:size="20"
												class="spinner-icon"
											/>
											<Save v-else :size="20" /> <span>Lưu thay đổi</span>
										</button>
									</div>
								</div>
							</Transition>
						</div>
					</div>
				</div>
			</Transition>
		</div>

		<!-- Create Role Modal -->
		<Transition name="modal-fade">
			<div
				v-if="showCreateRole"
				class="glass-modal-overlay"
				@click.self="showCreateRole = false"
			>
				<div class="glass-modal-content">
					<button class="modal-close" @click="showCreateRole = false">
						<X :size="20" />
					</button>
					<div class="modal-header">
						<div class="modal-icon-wrap"><Plus :size="24" /></div>
						<h3>Tạo Role mới</h3>
					</div>
					<div class="modal-body">
						<div class="input-group">
							<label>Tên vai trò <span class="required">*</span></label>
							<input
								v-model="newRole.name"
								class="premium-input"
								placeholder="VD: Content Moderator"
							/>
						</div>
						<div class="input-group">
							<label>Mô tả</label>
							<textarea
								v-model="newRole.description"
								class="premium-input textarea"
								placeholder="Mô tả..."
							></textarea>
						</div>
					</div>
					<div class="modal-footer">
						<button class="btn btn-ghost" @click="showCreateRole = false">
							Hủy
						</button>
						<button
							class="btn btn-primary btn-glow"
							@click="createRole"
							:disabled="!newRole.name || creatingRole"
						>
							<Loader2
								v-if="creatingRole"
								:size="16"
								class="spinner-icon"
							/><Check v-else :size="16" /> Khởi tạo
						</button>
					</div>
				</div>
			</div>
		</Transition>

		<!-- Floating Toast -->
		<Transition name="toast-slide">
			<div v-if="toast.show" class="floating-toast" :class="toast.type">
				<div class="toast-content">
					<component
						:is="toast.type === 'error' ? 'AlertCircle' : 'CheckCircle2'"
						:size="20"
					/>
					<span>{{ toast.msg }}</span>
				</div>
				<div
					class="toast-progress"
					:style="{ width: toast.progress + '%' }"
				></div>
			</div>
		</Transition>
	</div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from "vue";
import { rbacAPI, userAPI } from "@/services/api";
import {
	Shield,
	ShieldCheck,
	Users,
	Key,
	UserCheck,
	Plus,
	Check,
	Trash2,
	Search,
	Save,
	ChevronRight,
	ChevronLeft,
	UserPlus,
	SearchX,
	Loader2,
	X,
	AlertCircle,
	CheckCircle2,
} from "lucide-vue-next";

const tab = ref("roles");
const tabsRef = ref(null);
const indicatorStyle = ref({});

function switchTab(newTab, event) {
	tab.value = newTab;
	updateIndicator(event.currentTarget);
}
function updateIndicator(el) {
	if (el)
		indicatorStyle.value = {
			width: `${el.offsetWidth}px`,
			transform: `translateX(${el.offsetLeft}px)`,
		};
}
onMounted(() =>
	nextTick(() => updateIndicator(tabsRef.value?.querySelector(".tab.active"))),
);
watch(tab, () =>
	nextTick(() => updateIndicator(tabsRef.value?.querySelector(".tab.active"))),
);

const roles = ref([]);
const permissions = ref([]);
const showCreateRole = ref(false);
const newRole = ref({ name: "", description: "" });
const creatingRole = ref(false);
const toast = ref({ show: false, msg: "", type: "success", progress: 100 });
let toastTimer, progressTimer;

function showToast(msg, isError = false) {
	clearInterval(progressTimer);
	clearTimeout(toastTimer);
	toast.value = {
		show: true,
		msg,
		type: isError ? "error" : "success",
		progress: 100,
	};
	progressTimer = setInterval(() => {
		toast.value.progress -= 100 / (3500 / 35);
		if (toast.value.progress <= 0) clearInterval(progressTimer);
	}, 35);
	toastTimer = setTimeout(() => (toast.value.show = false), 3500);
}

const users = ref([]);
const userTotal = ref(0);
const userPage = ref(1);
const userPageSize = ref(10);
const userSearch = ref("");
const loadingUsers = ref(false);
const savingRoles = ref(false);
const assignedUser = ref(null);
const selectedRoleIds = ref([]);

let searchTimer;
function debounceSearch() {
	clearTimeout(searchTimer);
	searchTimer = setTimeout(() => {
		userPage.value = 1;
		fetchUsers();
	}, 500);
}

async function fetchUsers() {
	loadingUsers.value = true;
	try {
		const { data } = await userAPI.getAll({
			page: userPage.value,
			pageSize: userPageSize.value,
			search: userSearch.value,
		});
		users.value = data.items;
		userTotal.value = data.totalCount;
	} catch (e) {
		showToast("Lỗi tải danh sách người dùng", true);
	} finally {
		loadingUsers.value = false;
	}
}

async function selectUser(u) {
	const userId = u.id || u.Id || u.userId || u.UserId;
	if (!userId) return showToast("ID người dùng không hợp lệ", true);
	try {
		const { data } = await rbacAPI.getUserRoles(userId);
		// Đồng bộ hóa tất cả các biến thể ID về .id để component dễ sử dụng
		assignedUser.value = { ...data, id: userId, userId: userId };
		selectedRoleIds.value = roles.value
			.filter((r) => (data.roles || data.Roles || []).includes(r.name))
			.map((r) => r.id);
	} catch (e) {
		console.error("RBAC load error:", e);
		showToast("Lỗi tải thông tin quyền của người dùng", true);
	}
}

function getAvatarColor(name) {
	const colors = [
		"linear-gradient(135deg, #6366f1, #a855f7)",
		"linear-gradient(135deg, #3b82f6, #2dd4bf)",
		"linear-gradient(135deg, #f59e0b, #ef4444)",
		"linear-gradient(135deg, #10b981, #3b82f6)",
		"linear-gradient(135deg, #ec4899, #8b5cf6)",
	];
	let hash = 0;
	for (let i = 0; i < (name?.length || 0); i++)
		hash = name.charCodeAt(i) + ((hash << 5) - hash);
	return colors[Math.abs(hash) % colors.length];
}
function getAvatarUrl(url) {
	return !url
		? null
		: url.startsWith("http")
			? url
			: `${import.meta.env.VITE_API_URL || "http://localhost:5100"}${url}`;
}
function getInitials(name) {
	return !name
		? "U"
		: name
				.split(" ")
				.map((n) => n[0])
				.join("")
				.substring(0, 2)
				.toUpperCase();
}

const permCategories = computed(() => [
	...new Set(permissions.value.map((p) => p.category).filter(Boolean)),
]);
const permissionsByCategory = computed(() => {
	const map = {};
	for (const p of permissions.value) {
		const cat = p.category || "Other";
		if (!map[cat]) map[cat] = [];
		map[cat].push(p);
	}
	return map;
});
function getCatColor(cat) {
	return (
		{
			Course: "#6366f1",
			User: "#10b981",
			Role: "#f59e0b",
			Report: "#ef4444",
			System: "#8b5cf6",
			Group: "#ec4899",
			Certificate: "#0ea5e9", // Màu xanh dương cho chứng chỉ
		}[cat] || "#9ca3af"
	);
}

async function loadData() {
	try {
		const [r, p] = await Promise.all([
			rbacAPI.getRoles(),
			rbacAPI.getPermissions(),
		]);
		roles.value = r.data;
		permissions.value = p.data;
		if (tab.value === "assign") fetchUsers();
	} catch (e) {
		showToast(
			"Lỗi tải dữ liệu RBAC: " + (e.response?.data?.message || e.message),
			true,
		);
	}
}
watch(tab, (newTab) => {
	if (newTab === "assign" && users.value.length === 0) fetchUsers();
});

async function createRole() {
	creatingRole.value = true;
	try {
		await rbacAPI.createRole(newRole.value);
		showCreateRole.value = false;
		newRole.value = { name: "", description: "" };
		await loadData();
		showToast("Tạo Role thành công!");
	} catch (e) {
		showToast("Lỗi tạo role", true);
	} finally {
		creatingRole.value = false;
	}
}
async function deleteRole(id) {
	if (!confirm("Xóa Role này?")) return;
	try {
		await rbacAPI.deleteRole(id);
		await loadData();
		showToast("Đã xóa Role.");
	} catch (e) {
		showToast("Lỗi xóa role", true);
	}
}
async function togglePermission(role, perm) {
	const current = role.permissions.includes(perm.code);
	const permIds = permissions.value
		.filter((p) =>
			p.code === perm.code ? !current : role.permissions.includes(p.code),
		)
		.map((p) => p.id);
	try {
		const { data } = await rbacAPI.updateRolePermissions(role.id, permIds);
		role.permissions = data.permissions;
		showToast(`Đã cập nhật đặc quyền cho ${role.name}`);
	} catch (e) {
		showToast("Lỗi cập nhật", true);
	}
}
function toggleUserRole(role) {
	const idx = selectedRoleIds.value.indexOf(role.id);
	if (idx >= 0) selectedRoleIds.value.splice(idx, 1);
	else selectedRoleIds.value.push(role.id);
}
async function saveUserRoles() {
	if (!assignedUser.value) return;
	savingRoles.value = true;
	try {
		const userId = assignedUser.value.id || assignedUser.value.userId || assignedUser.value.UserId;
		if (!userId) throw new Error("userId is undefined");
		
		const { data } = await rbacAPI.updateUserRoles(
			userId,
			selectedRoleIds.value,
		);
		// Duy trì id để không bị undefined ở lần lưu sau
		assignedUser.value = { ...data, id: userId, userId: userId };
		showToast("Lưu phân quyền thành công!");
	} catch (e) {
		showToast("Lỗi cập nhật", true);
	} finally {
		savingRoles.value = false;
	}
}
onMounted(loadData);
</script>

<style scoped>
/* Typography & Layout */
.rbac-page {
	padding-bottom: var(--space-2xl);
	color: var(--text-primary);
}
.page-header {
	margin-bottom: var(--space-xl);
	display: flex;
	justify-content: space-between;
	align-items: flex-end;
}
.page-title-gradient {
	font-size: 32px;
	font-weight: 800;
	letter-spacing: -0.02em;
	color: var(--text-primary);
	display: flex;
	align-items: center;
	gap: 12px;
	margin-bottom: 8px;
}
.title-icon {
	color: var(--primary-500);
}
.page-desc {
	font-size: var(--font-size-base);
	color: var(--text-secondary);
	max-width: 600px;
}

/* Tabs */
.tabs-container {
	margin-bottom: var(--space-xl);
	display: flex;
}
.glass-tabs {
	background: #ffffff;
	border: 1px solid rgba(0, 0, 0, 0.05);
	border-radius: var(--radius-full);
	padding: 6px;
	display: inline-flex;
	position: relative;
	box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
}
.tab-indicator {
	position: absolute;
	top: 6px;
	left: 0;
	height: calc(100% - 12px);
	background: var(--primary-500);
	border-radius: var(--radius-full);
	transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
	box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
	z-index: 0;
}
.tab {
	position: relative;
	z-index: 1;
	padding: 10px 24px;
	border-radius: var(--radius-full);
	display: flex;
	align-items: center;
	gap: 8px;
	font-size: var(--font-size-sm);
	font-weight: 600;
	color: var(--text-secondary);
	text-transform: uppercase;
	letter-spacing: 0.05em;
	transition: color 0.3s;
	background: transparent;
	border: none;
	cursor: pointer;
}
.tab:hover {
	color: var(--text-primary);
}
.tab.active {
	color: white;
}

/* Utilities */
.glass-card {
	background: #ffffff;
	border: 1px solid rgba(0, 0, 0, 0.05);
	border-radius: var(--radius-2xl);
	box-shadow: 0 8px 32px rgba(0, 0, 0, 0.04);
}
.section-bar {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: var(--space-xl);
}
.section-title {
	font-size: var(--font-size-2xl);
	font-weight: 800;
	color: var(--text-primary);
	letter-spacing: -0.02em;
}
.btn-glow {
	box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
	transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
	display: inline-flex;
	align-items: center;
	gap: 8px;
	position: relative;
	overflow: hidden;
	border: none;
	cursor: pointer;
}
.btn-glow:hover:not(:disabled) {
	box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4);
	transform: translateY(-2px);
}
.spinner-icon {
	animation: spin 1s linear infinite;
}
@keyframes spin {
	100% {
		transform: rotate(360deg);
	}
}
.custom-scrollbar::-webkit-scrollbar {
	width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
	background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
	background: rgba(0, 0, 0, 0.05);
	border-radius: 10px;
	transition: background 0.3s;
}
.custom-scrollbar:hover::-webkit-scrollbar-thumb {
	background: rgba(0, 0, 0, 0.15);
}

/* Roles Tab */
.roles-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
	gap: var(--space-xl);
}
.role-card-premium {
	display: flex;
	flex-direction: column;
	height: 500px;
	transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
	position: relative;
	background: #ffffff;
	overflow: hidden;
}
.role-card-premium::before {
	content: "";
	position: absolute;
	inset: 0;
	border-radius: inherit;
	box-shadow: inset 0 0 0 1px transparent;
	transition: all 0.4s;
	pointer-events: none;
}
.role-card-premium:hover {
	transform: translateY(-6px);
	box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
}
.role-card-premium:hover::before {
	box-shadow: inset 0 0 0 1px rgba(99, 102, 241, 0.3);
}
.role-card-header {
	padding: var(--space-xl);
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	border-bottom: 1px solid rgba(0, 0, 0, 0.04);
	background: rgba(249, 250, 251, 1);
	border-top-left-radius: var(--radius-2xl);
	border-top-right-radius: var(--radius-2xl);
}
.role-info-wrap {
	display: flex;
	gap: var(--space-lg);
	align-items: center;
}
.role-icon-box {
	width: 52px;
	height: 52px;
	border-radius: 16px;
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
	box-shadow: 0 8px 16px rgba(99, 102, 241, 0.1);
}
.role-icon-box.system {
	background: linear-gradient(
		135deg,
		rgba(245, 158, 11, 0.15),
		rgba(245, 158, 11, 0.05)
	);
	color: var(--warning-600);
	border-color: rgba(245, 158, 11, 0.2);
	box-shadow: 0 8px 16px rgba(245, 158, 11, 0.1);
}
.role-name-premium {
	font-size: var(--font-size-xl);
	font-weight: 800;
	color: var(--text-primary);
	display: flex;
	align-items: center;
	gap: 10px;
}
.badge-system {
	font-size: 10px;
	padding: 4px 8px;
	background: rgba(245, 158, 11, 0.1);
	color: var(--warning-600);
	border-radius: 6px;
	text-transform: uppercase;
	font-weight: 800;
	border: 1px solid rgba(245, 158, 11, 0.2);
}
.role-desc-premium {
	font-size: var(--font-size-sm);
	color: var(--text-secondary);
	margin-top: 4px;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
}
.perm-container-premium {
	flex: 1;
	overflow-y: auto;
	padding: var(--space-xl);
}
.perm-stats {
	margin-bottom: var(--space-lg);
	display: flex;
	justify-content: flex-end;
}
.perm-badge {
	font-size: 11px;
	font-weight: 700;
	padding: 4px 10px;
	background: rgba(0, 0, 0, 0.03);
	border: 1px solid rgba(0, 0, 0, 0.05);
	border-radius: var(--radius-full);
	color: var(--text-secondary);
}
.perm-cat-group {
	margin-bottom: var(--space-xl);
}
.perm-cat-header {
	font-size: 12px;
	font-weight: 800;
	color: var(--text-secondary);
	text-transform: uppercase;
	margin-bottom: var(--space-md);
	display: flex;
	align-items: center;
	gap: 8px;
}
.cat-dot {
	width: 8px;
	height: 8px;
	border-radius: 50%;
	box-shadow: 0 0 8px currentColor;
}
.perm-items-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
	gap: 10px;
}
.perm-item-check {
	padding: 8px 12px;
	background: rgba(0, 0, 0, 0.02);
	border: 1px solid rgba(0, 0, 0, 0.05);
	border-radius: 10px;
	font-size: var(--font-size-xs);
	color: var(--text-secondary);
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: space-between;
	transition: all 0.2s;
	user-select: none;
}
.perm-item-check:hover {
	background: rgba(0, 0, 0, 0.04);
	border-color: rgba(0, 0, 0, 0.1);
	color: var(--text-primary);
}
.perm-item-check.active {
	background: rgba(16, 185, 129, 0.1);
	border-color: rgba(16, 185, 129, 0.3);
	color: #059669;
	font-weight: 600;
	box-shadow: 0 2px 8px rgba(16, 185, 129, 0.05);
}
.perm-item-check input {
	display: none;
}

/* Permissions Tab */
.glass-search {
	position: relative;
	width: 100%;
	max-width: 350px;
}
.search-input-premium {
	box-sizing: border-box;
	width: 100%;
	background: #ffffff;
	border: 1px solid rgba(0, 0, 0, 0.1);
	border-radius: var(--radius-full);
	padding: 12px 16px 12px 44px;
	font-size: var(--font-size-sm);
	color: var(--text-primary);
	outline: none;
	transition: all 0.3s;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
}
.search-input-premium.sm {
	padding: 10px 14px 10px 38px;
}
.search-input-premium:focus {
	border-color: var(--primary-400);
	box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}
.animated-icon {
	position: absolute;
	left: 16px;
	top: 50%;
	transform: translateY(-50%);
	color: var(--text-tertiary);
	transition: color 0.3s;
}
.search-input-premium:focus + .animated-icon,
.glass-search:focus-within .animated-icon {
	color: var(--primary-500);
}
.perm-grid-premium {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
	gap: var(--space-xl);
}
.perm-cat-card {
	display: flex;
	flex-direction: column;
	height: 400px;
	background: #ffffff;
}
.p-cat-header-main {
	padding: var(--space-lg) var(--space-xl);
	border-bottom: 1px solid rgba(0, 0, 0, 0.05);
	display: flex;
	justify-content: space-between;
	align-items: center;
	border-left: 4px solid var(--primary-500);
	background: rgba(249, 250, 251, 1);
	border-radius: inherit;
	border-bottom-left-radius: 0;
	border-bottom-right-radius: 0;
}
.p-cat-title {
	font-weight: 800;
	font-size: var(--font-size-base);
	color: var(--text-primary);
	display: flex;
	align-items: center;
	gap: 8px;
}
.p-cat-count {
	font-size: 12px;
	font-weight: 800;
	background: rgba(0, 0, 0, 0.05);
	padding: 4px 10px;
	border-radius: var(--radius-full);
	color: var(--text-secondary);
}
.p-list-premium {
	padding: var(--space-md);
	flex: 1;
	overflow-y: auto;
}
.p-row-premium {
	padding: 12px 16px;
	border-radius: 12px;
	transition: all 0.2s;
	border: 1px solid transparent;
	margin-bottom: 4px;
}
.p-row-premium:hover {
	background: rgba(0, 0, 0, 0.02);
	border-color: rgba(0, 0, 0, 0.05);
	transform: translateX(4px);
}
.p-code-box {
	display: flex;
	justify-content: space-between;
	align-items: center;
}
.p-name-main {
	font-size: var(--font-size-sm);
	color: var(--text-primary);
	font-weight: 600;
}
.p-code-tag {
	font-size: 11px;
	color: var(--primary-600);
	font-family: var(--font-mono);
	background: rgba(99, 102, 241, 0.1);
	padding: 4px 8px;
	border-radius: 6px;
	border: 1px solid rgba(99, 102, 241, 0.2);
	font-weight: 600;
}

/* Assign Tab */
.assign-layout {
	display: flex;
	gap: var(--space-xl);
	height: calc(100vh - 240px);
	min-height: 500px;
}
.user-select-panel {
	width: 340px;
	display: flex;
	flex-direction: column;
	overflow: hidden;
	background: #ffffff;
}
.panel-header {
	padding: var(--space-xl) var(--space-xl) var(--space-md) var(--space-xl);
	border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}
.panel-title {
	font-size: 13px;
	font-weight: 800;
	margin-bottom: var(--space-lg);
	text-transform: uppercase;
	letter-spacing: 0.1em;
	color: var(--text-secondary);
}
.user-list-scroll {
	flex: 1;
	overflow-y: auto;
	padding: var(--space-md);
}
.user-skeleton {
	display: flex;
	gap: 16px;
	align-items: center;
	padding: 12px;
	margin-bottom: 8px;
}
.skel-avatar {
	width: 44px;
	height: 44px;
	border-radius: 14px;
	background: rgba(0, 0, 0, 0.05);
	animation: pulse 1.5s infinite;
}
.skel-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 8px;
}
.skel-line {
	height: 12px;
	background: rgba(0, 0, 0, 0.05);
	border-radius: 6px;
	animation: pulse 1.5s infinite;
}
.w-70 {
	width: 70%;
}
.w-50 {
	width: 50%;
}
@keyframes pulse {
	0%,
	100% {
		opacity: 0.5;
	}
	50% {
		opacity: 1;
	}
}
.user-item {
	display: flex;
	align-items: center;
	gap: var(--space-md);
	padding: 10px 14px;
	border-radius: 12px;
	cursor: pointer;
	transition: all 0.3s;
	margin-bottom: 4px;
	border: 1px solid transparent;
	background: transparent;
}
.user-item:hover {
	background: rgba(0, 0, 0, 0.02);
	transform: translateX(6px);
}
.user-item.active {
	background: rgba(99, 102, 241, 0.08);
	border-color: rgba(99, 102, 241, 0.2);
	box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);
}
.user-item-avatar {
	width: 40px;
	height: 40px;
	border-radius: 12px;
	display: flex;
	align-items: center;
	justify-content: center;
	font-weight: 800;
	font-size: var(--font-size-base);
	color: white;
	flex-shrink: 0;
	box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
	background-size: cover;
}
.user-item-info {
	flex: 1;
	min-width: 0;
}
.user-item-name {
	font-size: var(--font-size-sm);
	font-weight: 700;
	margin-bottom: 4px;
	color: var(--text-primary);
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}
.user-item-email {
	font-size: 12px;
	color: var(--text-secondary);
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}
.user-item .arrow {
	color: var(--text-tertiary);
	opacity: 0;
	transform: translateX(-10px);
	transition: all 0.3s;
}
.user-item:hover .arrow {
	opacity: 0.5;
	transform: translateX(0);
}
.user-item.active .arrow {
	opacity: 1;
	transform: translateX(4px);
	color: var(--primary-500);
}
.role-assign-panel {
	flex: 1;
	display: flex;
	flex-direction: column;
	overflow: hidden;
	position: relative;
	background: #ffffff;
}
.no-selection {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	text-align: center;
	padding: var(--space-2xl);
}
.pulse-glow {
	width: 120px;
	height: 120px;
	background: rgba(99, 102, 241, 0.05);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	border: 1px dashed rgba(99, 102, 241, 0.3);
	margin-bottom: var(--space-xl);
	color: var(--primary-500);
	animation: pulse-border 2s infinite;
}
@keyframes pulse-border {
	0% {
		box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.2);
	}
	70% {
		box-shadow: 0 0 0 20px rgba(99, 102, 241, 0);
	}
	100% {
		box-shadow: 0 0 0 0 rgba(99, 102, 241, 0);
	}
}
.no-selection h3 {
	font-size: var(--font-size-xl);
	font-weight: 800;
	color: var(--text-primary);
	margin-bottom: 8px;
}
.no-selection p {
	color: var(--text-secondary);
	max-width: 300px;
	line-height: 1.5;
}
.assign-content {
	flex: 1;
	display: flex;
	flex-direction: column;
	height: 100%;
}

/* Profile Card Fixes */
.profile-card-layout {
	position: relative;
	padding: var(--space-xl) var(--space-2xl);
	overflow: hidden;
	background: linear-gradient(
		135deg,
		rgba(249, 250, 251, 1),
		rgba(243, 244, 246, 1)
	);
	border-bottom: 1px solid rgba(0, 0, 0, 0.05);
	display: flex;
	align-items: center;
	min-height: 120px;
}
.profile-bg-glow {
	position: absolute;
	top: -50%;
	left: -50px;
	right: 0;
	bottom: 0;
	width: 250px;
	height: 250px;
	opacity: 0.1;
	filter: blur(50px);
	z-index: 0;
	border-radius: 50%;
}
.selected-user-detail {
	position: relative;
	z-index: 1;
	display: flex;
	align-items: center;
	gap: var(--space-xl);
	width: 100%;
}
.user-lg-avatar {
	width: 72px;
	height: 72px;
	border-radius: 18px;
	display: flex;
	align-items: center;
	justify-content: center;
	font-weight: 800;
	font-size: 28px;
	color: white;
	box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
	border: 2px solid white;
	background-size: cover;
	flex-shrink: 0;
}
.user-meta-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: center;
}
.user-detail-name {
	font-size: 22px;
	font-weight: 800;
	margin-bottom: 4px;
	color: var(--text-primary);
	line-height: 1.2;
}
.user-detail-email {
	font-size: var(--font-size-sm);
	color: var(--text-secondary);
	margin-bottom: 8px;
}
.user-badges {
	display: flex;
	gap: 8px;
}
.user-detail-badge {
	padding: 4px 12px;
	background: rgba(0, 0, 0, 0.05);
	border: 1px solid rgba(0, 0, 0, 0.05);
	border-radius: var(--radius-full);
	color: var(--text-secondary);
	font-size: 11px;
	font-weight: 700;
	text-transform: uppercase;
}
.user-detail-badge.premium {
	background: rgba(99, 102, 241, 0.1);
	border-color: rgba(99, 102, 241, 0.2);
	color: var(--primary-600);
}

.roles-selection-box {
	flex: 1;
	padding: var(--space-2xl);
	overflow-y: auto;
}
.roles-blocks-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
	gap: var(--space-lg);
}
.role-block-card {
	position: relative;
	display: block;
	cursor: pointer;
}
.hidden-input {
	position: absolute;
	opacity: 0;
	cursor: pointer;
}
.role-block-content {
	display: flex;
	gap: 16px;
	padding: 20px;
	background: #ffffff;
	border: 1px solid rgba(0, 0, 0, 0.08);
	border-radius: var(--radius-xl);
	transition: all 0.3s;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
}
.role-block-card:hover .role-block-content {
	background: rgba(249, 250, 251, 1);
	border-color: rgba(99, 102, 241, 0.3);
	transform: translateY(-3px);
	box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
}
.role-block-card.selected .role-block-content {
	background: rgba(99, 102, 241, 0.04);
	border-color: var(--primary-500);
	box-shadow: 0 4px 20px rgba(99, 102, 241, 0.15);
}
.role-block-icon {
	width: 44px;
	height: 44px;
	border-radius: 12px;
	background: rgba(0, 0, 0, 0.04);
	color: var(--text-secondary);
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
	transition: all 0.3s;
}
.role-block-card.selected .role-block-icon {
	background: var(--primary-500);
	color: white;
	box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}
.role-block-text {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 4px;
	justify-content: center;
}
.role-block-name {
	font-weight: 800;
	font-size: var(--font-size-base);
	color: var(--text-primary);
}
.role-block-desc {
	font-size: 13px;
	color: var(--text-secondary);
	line-height: 1.4;
}
.check-circle {
	width: 22px;
	height: 22px;
	border-radius: 50%;
	background: var(--primary-500);
	color: white;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}
.assign-actions {
	padding: var(--space-xl) var(--space-2xl);
	border-top: 1px solid rgba(0, 0, 0, 0.05);
	background: rgba(249, 250, 251, 0.5);
	display: flex;
}
.btn-lg {
	padding: 14px 24px;
	font-size: var(--font-size-base);
}
.w-full {
	width: 100%;
	justify-content: center;
}

/* Modal */
.glass-modal-overlay {
	position: fixed;
	inset: 0;
	background: rgba(15, 23, 42, 0.4);
	backdrop-filter: blur(8px);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1000;
}
.glass-modal-content {
	background: #ffffff;
	border: 1px solid rgba(0, 0, 0, 0.1);
	border-radius: var(--radius-2xl);
	width: 100%;
	max-width: 500px;
	position: relative;
	box-shadow: 0 24px 48px rgba(0, 0, 0, 0.1);
}
.modal-close {
	position: absolute;
	top: 20px;
	right: 20px;
	background: transparent;
	border: none;
	color: var(--text-tertiary);
	cursor: pointer;
	transition: all 0.2s;
	border-radius: 50%;
	padding: 4px;
}
.modal-close:hover {
	color: var(--text-primary);
	background: rgba(0, 0, 0, 0.05);
}
.modal-header {
	padding: 32px 32px 20px;
	text-align: center;
}
.modal-icon-wrap {
	width: 56px;
	height: 56px;
	background: rgba(99, 102, 241, 0.1);
	color: var(--primary-600);
	border-radius: 16px;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 16px;
	border: 1px solid rgba(99, 102, 241, 0.1);
}
.modal-header h3 {
	font-size: 24px;
	font-weight: 800;
	color: var(--text-primary);
}
.modal-body {
	padding: 0 32px 24px;
	display: flex;
	flex-direction: column;
	gap: 20px;
}
.input-group label {
	display: block;
	font-size: 13px;
	font-weight: 700;
	color: var(--text-secondary);
	margin-bottom: 8px;
}
.required {
	color: var(--danger-500);
}
.premium-input {
	width: 100%;
	padding: 12px 16px;
	background: #ffffff;
	border: 1px solid rgba(0, 0, 0, 0.1);
	border-radius: var(--radius-lg);
	color: var(--text-primary);
	font-size: var(--font-size-base);
	transition: all 0.3s;
	box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.02);
}
.premium-input:focus {
	border-color: var(--primary-500);
	box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
	outline: none;
}
.premium-input.textarea {
	resize: vertical;
	min-height: 100px;
	font-family: inherit;
}
.modal-footer {
	padding: 20px 32px;
	background: rgba(249, 250, 251, 1);
	border-top: 1px solid rgba(0, 0, 0, 0.05);
	display: flex;
	justify-content: flex-end;
	gap: 12px;
	border-bottom-left-radius: var(--radius-2xl);
	border-bottom-right-radius: var(--radius-2xl);
}
.btn-ghost {
	background: transparent;
	color: var(--text-secondary);
	border: 1px solid transparent;
	padding: 8px 16px;
	border-radius: var(--radius-lg);
	cursor: pointer;
}
.btn-ghost:hover {
	background: rgba(0, 0, 0, 0.05);
	color: var(--text-primary);
}

/* Toast */
.floating-toast {
	position: fixed;
	bottom: 32px;
	left: 50%;
	transform: translateX(-50%);
	background: #ffffff;
	border: 1px solid rgba(0, 0, 0, 0.08);
	border-radius: 16px;
	color: var(--text-primary);
	box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
	z-index: 10000;
	overflow: hidden;
	display: flex;
	flex-direction: column;
	min-width: 300px;
}
.floating-toast.error {
	border-color: rgba(239, 68, 68, 0.3);
}
.floating-toast.error .toast-icon {
	color: var(--danger-500);
}
.floating-toast.success .toast-icon {
	color: var(--success-500);
}
.toast-content {
	padding: 16px 20px;
	display: flex;
	align-items: center;
	gap: 12px;
	font-weight: 600;
}
.toast-progress {
	height: 4px;
	background: var(--primary-500);
	width: 100%;
}
.floating-toast.error .toast-progress {
	background: var(--danger-500);
}

/* Transitions */
.list-enter-active,
.list-leave-active {
	transition: all 0.3s ease;
}
.list-enter-from,
.list-leave-to {
	opacity: 0;
	transform: translateX(-20px);
}
.fade-slide-enter-active,
.fade-slide-leave-active {
	transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.fade-slide-enter-from {
	opacity: 0;
	transform: translateY(20px);
}
.fade-slide-leave-to {
	opacity: 0;
	transform: translateY(-20px);
}
.modal-fade-enter-active,
.modal-fade-leave-active {
	transition: all 0.3s;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
	opacity: 0;
}
.modal-fade-enter-active .glass-modal-content,
.modal-fade-leave-active .glass-modal-content {
	transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.modal-fade-enter-from .glass-modal-content {
	transform: scale(0.95);
	opacity: 0;
}
.modal-fade-leave-to .glass-modal-content {
	transform: scale(0.95);
	opacity: 0;
}
.scale-enter-active,
.scale-leave-active {
	transition: all 0.2s;
}
.scale-enter-from,
.scale-leave-to {
	opacity: 0;
	transform: scale(0.5);
}
.toast-slide-enter-active,
.toast-slide-leave-active {
	transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.toast-slide-enter-from,
.toast-slide-leave-to {
	opacity: 0;
	transform: translate(-50%, 30px) scale(0.95);
}

@media (max-width: 1024px) {
	.assign-layout {
		flex-direction: column;
		height: auto;
		min-height: 0;
	}
	.user-select-panel {
		width: 100%;
		height: 400px;
	}
	.profile-card-layout {
		flex-direction: column;
		text-align: center;
	}
	.selected-user-detail {
		flex-direction: column;
		gap: var(--space-md);
	}
	.user-badges {
		justify-content: center;
	}
}
</style>
