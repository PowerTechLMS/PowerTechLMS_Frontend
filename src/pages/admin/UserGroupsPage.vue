<template>
	<div class="groups-page-container">
		<div class="glass-header">
			<div class="header-content">
				<div>
					<h1 class="text-glow">Nhóm Người dùng</h1>
					<p class="subtitle">Quản lý các nhóm người dùng và thành viên</p>
				</div>
				<button class="btn btn-primary create-btn" @click="openCreateModal">
					<Plus :size="18" /> Tạo nhóm mới
				</button>
			</div>
			<div class="search-section">
				<div class="glass-input-group">
					<Search :size="18" class="icon" />
					<input
						v-model="search"
						placeholder="Tìm kiếm nhóm..."
						@input="debounceFetch"
					/>
				</div>
			</div>
		</div>

		<div v-if="loading" class="loading-state">
			<div class="spinner" />
			<p>Đang tải...</p>
		</div>
		<div v-else-if="groups.length === 0" class="empty-state glass-card">
			<UsersIcon :size="64" class="empty-icon" />
			<h3>Chưa có nhóm nào</h3>
			<p>Bắt đầu bằng việc tạo một nhóm người dùng mới.</p>
		</div>
		<div v-else class="groups-grid">
			<div
				v-for="group in groups"
				:key="group.id"
				class="glass-card group-card"
				@click="viewDetail(group.id)"
			>
				<div class="group-header">
					<h3 class="group-name">
						{{ group.name }}
					</h3>
					<div class="actions" @click.stop>
						<button class="action-btn edit" @click="openEditModal(group)">
							<Edit2 :size="16" />
						</button>
						<button class="action-btn delete" @click="confirmDelete(group)">
							<Trash2 :size="16" />
						</button>
					</div>
				</div>
				<p class="group-desc">
					{{ group.description || "Không có mô tả" }}
				</p>
				<div class="group-meta">
					<span class="member-count"
						><UsersIcon :size="14" /> {{ group.memberCount }} thành viên</span
					>
					<span class="date"
						><Calendar :size="14" />
						{{ new Date(group.createdAt).toLocaleDateString("vi-VN") }}</span
					>
				</div>
			</div>
		</div>

		<div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
			<div class="glass-modal">
				<div class="modal-header">
					<h2>{{ editingId ? "Cập nhật nhóm" : "Tạo nhóm mới" }}</h2>
					<button class="close-btn" @click="showModal = false">
						<X :size="20" />
					</button>
				</div>
				<form class="modal-body" @submit.prevent="saveGroup">
					<div class="form-group">
						<label>Tên nhóm</label>
						<input v-model="formData.name" required class="glass-input" />
					</div>
					<div class="form-group">
						<label>Mô tả</label>
						<textarea v-model="formData.description" class="glass-input" />
					</div>
					<div class="modal-actions">
						<button
							type="button"
							class="btn btn-ghost"
							@click="showModal = false"
						>
							Hủy
						</button>
						<button type="submit" class="btn btn-primary" :disabled="saving">
							{{ saving ? "Đang lưu..." : "Lưu lại" }}
						</button>
					</div>
				</form>
			</div>
		</div>

		<div
			v-if="showDetailModal && selectedGroup"
			class="modal-overlay"
			@click.self="showDetailModal = false"
		>
			<div class="glass-modal large">
				<div class="modal-header">
					<div>
						<h2>{{ selectedGroup.name }}</h2>
						<p class="subtitle">Quản lý thành viên</p>
					</div>
					<button class="close-btn" @click="showDetailModal = false">
						<X :size="20" />
					</button>
				</div>

				<div class="modal-body detail-body">
					<div class="add-member-section glass-card">
						<h4>Thêm thành viên</h4>
						<div class="search-user-wrapper">
							<input
								v-model="userSearchQuery"
								placeholder="Tìm theo tên/email để thêm..."
								class="glass-input search-member"
								@input="debounceSearchUsers"
							/>
							<div v-if="userSearchResults.length > 0" class="search-results">
								<div
									v-for="user in userSearchResults"
									:key="user.id"
									class="result-item"
									@click="addUserToGroup(user.id)"
								>
									<span>{{ user.fullName }} ({{ user.email }})</span>
									<Plus :size="16" class="add-icon" />
								</div>
							</div>
						</div>
					</div>

					<div class="members-list">
						<h4>Thành viên hiện tại ({{ selectedGroup.members.length }})</h4>
						<div
							v-if="selectedGroup.members.length === 0"
							class="empty-state-small"
						>
							Nhóm chưa có thành viên nào.
						</div>
						<div
							v-for="member in selectedGroup.members"
							v-else
							:key="member.id"
							class="member-item glass-card"
						>
							<div class="member-info">
								<div
									v-if="member.avatar"
									class="avatar"
									:style="{
										backgroundImage: `url('${getAvatarUrl(member.avatar)}')`,
										backgroundSize: 'cover',
										backgroundPosition: 'center',
										color: 'transparent',
									}"
								/>
								<div v-else class="avatar">
									{{ getInitials(member.fullName) }}
								</div>
								<div>
									<strong>{{ member.fullName }}</strong>
									<div class="email text-sm">
										{{ member.email }}
									</div>
								</div>
							</div>
							<button
								class="btn btn-sm btn-danger"
								@click="removeUserFromGroup(member.id)"
							>
								Xoá
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { userGroupAPI, userAPI } from "@/services/api";
import {
	Plus,
	Search,
	Edit2,
	Trash2,
	X,
	Users as UsersIcon,
	Calendar,
} from "lucide-vue-next";

const groups = ref([]);
const loading = ref(true);
const search = ref("");
const page = ref(1);
const pageSize = ref(20);
let timer = null;

const showModal = ref(false);
const editingId = ref(null);
const saving = ref(false);
const formData = ref({ name: "", description: "" });

const showDetailModal = ref(false);
const selectedGroup = ref(null);
const userSearchQuery = ref("");
const userSearchResults = ref([]);
let searchTimer = null;

async function fetchGroups() {
	loading.value = true;
	try {
		const { data } = await userGroupAPI.getAll({
			page: page.value,
			pageSize: pageSize.value,
			search: search.value || undefined,
		});
		groups.value = data.items;
	} catch {
	} finally {
		loading.value = false;
	}
}

function debounceFetch() {
	clearTimeout(timer);
	timer = setTimeout(() => {
		page.value = 1;
		fetchGroups();
	}, 300);
}

function openCreateModal() {
	editingId.value = null;
	formData.value = { name: "", description: "" };
	showModal.value = true;
}

function openEditModal(group) {
	editingId.value = group.id;
	formData.value = { name: group.name, description: group.description };
	showModal.value = true;
}

async function saveGroup() {
	saving.value = true;
	try {
		if (editingId.value)
			await userGroupAPI.update(editingId.value, formData.value);
		else await userGroupAPI.create(formData.value);
		showModal.value = false;
		fetchGroups();
	} catch {
		alert("Lỗi lưu nhóm");
	} finally {
		saving.value = false;
	}
}

async function confirmDelete(group) {
	if (!confirm(`Xóa nhóm "${group.name}"?`)) return;
	try {
		await userGroupAPI.delete(group.id);
		fetchGroups();
	} catch {
		alert("Lỗi xóa nhóm");
	}
}

async function viewDetail(id) {
	try {
		const { data } = await userGroupAPI.getById(id);
		selectedGroup.value = data;
		userSearchQuery.value = "";
		userSearchResults.value = [];
		showDetailModal.value = true;
	} catch {
		alert("Lỗi tải chi tiết nhóm");
	}
}

async function debounceSearchUsers() {
	clearTimeout(searchTimer);
	searchTimer = setTimeout(async () => {
		if (!userSearchQuery.value) {
			userSearchResults.value = [];
			return;
		}
		try {
			const { data } = await userAPI.getAll({
				search: userSearchQuery.value,
				pageSize: 5,
			});
			const existingIds = new Set(selectedGroup.value.members.map((m) => m.id));
			userSearchResults.value = data.items.filter(
				(u) => !existingIds.has(u.id),
			);
		} catch {}
	}, 300);
}

async function addUserToGroup(userId) {
	try {
		await userGroupAPI.addUser(selectedGroup.value.id, userId);
		userSearchQuery.value = "";
		userSearchResults.value = [];
		await viewDetail(selectedGroup.value.id);
		fetchGroups();
	} catch {
		alert("Lỗi thêm thành viên");
	}
}

async function removeUserFromGroup(userId) {
	if (!confirm("Xoá thành viên này khỏi nhóm?")) return;
	try {
		await userGroupAPI.removeUser(selectedGroup.value.id, userId);
		await viewDetail(selectedGroup.value.id);
		fetchGroups();
	} catch {
		alert("Lỗi xoá thành viên");
	}
}

function getInitials(name) {
	return name
		? name
				.split(" ")
				.map((n) => n[0])
				.join("")
				.substring(0, 2)
				.toUpperCase()
		: "U";
}
function getAvatarUrl(url) {
	if (!url) return null;
	return url.startsWith("http")
		? url
		: `${import.meta.env.VITE_API_URL || ""}${url}`;
}

onMounted(fetchGroups);
</script>

<style scoped>
.groups-page-container {
	padding: var(--space-xl);
	min-height: 100vh;
	background: radial-gradient(
		circle at top right,
		rgba(99, 102, 241, 0.05),
		transparent
	);
}
.glass-header {
	background: rgba(255, 255, 255, 0.7);
	backdrop-filter: blur(12px);
	border: 1px solid rgba(255, 255, 255, 0.3);
	border-radius: var(--radius-2xl);
	padding: var(--space-2xl);
	margin-bottom: var(--space-2xl);
	display: flex;
	justify-content: space-between;
	align-items: center;
}
.header-content {
	display: flex;
	justify-content: space-between;
	width: 100%;
	align-items: center;
}
.text-glow {
	font-size: 2.5rem;
	font-weight: 800;
	background: linear-gradient(135deg, var(--primary-600), var(--primary-400));
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
}
.subtitle {
	color: var(--text-secondary);
}
.search-section {
	width: 300px;
	margin-left: var(--space-xl);
}
.glass-input-group {
	display: flex;
	align-items: center;
	gap: var(--space-sm);
	background: rgba(255, 255, 255, 0.5);
	border: 1px solid var(--border-color);
	border-radius: var(--radius-lg);
	padding: 0 var(--space-md);
}
.glass-input-group input {
	border: none;
	background: transparent;
	width: 100%;
	padding: 0.8rem 0;
	outline: none;
}

.groups-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
	gap: var(--space-xl);
}
.group-card {
	padding: var(--space-xl);
	cursor: pointer;
	border: 1px solid var(--border-color);
	transition: all 0.3s;
}
.group-card:hover {
	transform: translateY(-4px);
	border-color: var(--primary-300);
	box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
}
.group-header {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	margin-bottom: var(--space-sm);
}
.group-name {
	font-size: 1.2rem;
	font-weight: 700;
	color: var(--text-primary);
	margin: 0;
}
.actions {
	display: flex;
	gap: 8px;
}
.action-btn {
	background: var(--bg-secondary);
	border: none;
	width: 32px;
	height: 32px;
	border-radius: 8px;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	color: var(--text-secondary);
	transition: 0.2s;
}
.action-btn.edit:hover {
	background: var(--primary-50);
	color: var(--primary-600);
}
.action-btn.delete:hover {
	background: var(--danger-50);
	color: var(--danger-600);
}
.group-desc {
	color: var(--text-secondary);
	font-size: 0.9rem;
	margin-bottom: var(--space-lg);
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
}
.group-meta {
	display: flex;
	justify-content: space-between;
	color: var(--text-tertiary);
	font-size: 0.85rem;
	padding-top: var(--space-md);
	border-top: 1px solid var(--border-color);
}
.group-meta span {
	display: flex;
	align-items: center;
	gap: 6px;
}

.modal-overlay {
	position: fixed;
	inset: 0;
	background: rgba(0, 0, 0, 0.5);
	backdrop-filter: blur(4px);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1000;
}
.glass-modal {
	background: white;
	border-radius: var(--radius-2xl);
	width: 100%;
	max-width: 500px;
	padding: var(--space-2xl);
}
.glass-modal.large {
	max-width: 600px;
	max-height: 85vh;
	display: flex;
	flex-direction: column;
}
.modal-header {
	display: flex;
	justify-content: space-between;
	border-bottom: 1px solid var(--border-color);
	padding-bottom: var(--space-md);
	margin-bottom: var(--space-lg);
}
.modal-header h2 {
	font-size: 1.5rem;
	margin: 0;
}
.close-btn {
	background: none;
	border: none;
	cursor: pointer;
	color: var(--text-tertiary);
}
.close-btn:hover {
	color: var(--text-primary);
}
.form-group {
	margin-bottom: var(--space-lg);
}
.form-group label {
	display: block;
	margin-bottom: 0.5rem;
	font-weight: 500;
}
.glass-input {
	width: 100%;
	padding: 0.75rem;
	border: 1px solid var(--border-color);
	border-radius: var(--radius-md);
	background: var(--bg-tertiary);
}
.modal-actions {
	display: flex;
	justify-content: flex-end;
	gap: var(--space-md);
	margin-top: var(--space-xl);
}

.detail-body {
	overflow-y: auto;
	padding-right: 4px;
}
.add-member-section {
	padding: var(--space-md);
	margin-bottom: var(--space-xl);
	background: var(--bg-secondary);
}
.add-member-section h4 {
	margin-top: 0;
	margin-bottom: var(--space-md);
}
.search-user-wrapper {
	position: relative;
}
.search-results {
	position: absolute;
	top: 100%;
	left: 0;
	right: 0;
	background: white;
	border: 1px solid var(--border-color);
	border-radius: var(--radius-md);
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	max-height: 200px;
	overflow-y: auto;
	z-index: 10;
	margin-top: 4px;
}
.result-item {
	padding: var(--space-sm) var(--space-md);
	display: flex;
	justify-content: space-between;
	cursor: pointer;
	border-bottom: 1px solid var(--border-color);
	align-items: center;
}
.result-item:hover {
	background: var(--primary-50);
}
.add-icon {
	color: var(--primary-600);
}

.members-list h4 {
	margin-top: 0;
	margin-bottom: var(--space-md);
}
.member-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: var(--space-md);
	margin-bottom: var(--space-sm);
	background: white;
	border: 1px solid var(--border-color);
}
.member-info {
	display: flex;
	align-items: center;
	gap: var(--space-md);
}
.avatar {
	width: 36px;
	height: 36px;
	border-radius: 50%;
	background: var(--primary-100);
	color: var(--primary-700);
	display: flex;
	align-items: center;
	justify-content: center;
	font-weight: bold;
}
.text-sm {
	font-size: 0.85rem;
	color: var(--text-secondary);
}
.btn-sm {
	padding: 4px 12px;
	font-size: 0.85rem;
}
.btn-danger {
	background: rgba(239, 68, 68, 0.1);
	color: var(--danger-600);
	border: none;
	cursor: pointer;
	border-radius: 4px;
}
.btn-danger:hover {
	background: var(--danger-500);
	color: white;
}

.empty-state {
	text-align: center;
	padding: 4rem;
	color: var(--text-secondary);
}
.empty-state-small {
	text-align: center;
	padding: 2rem;
	color: var(--text-tertiary);
	font-style: italic;
}
.spinner {
	width: 30px;
	height: 30px;
	border: 3px solid rgba(99, 102, 241, 0.2);
	border-top-color: var(--primary-500);
	border-radius: 50%;
	animation: spin 1s linear infinite;
	margin: 0 auto;
}
@keyframes spin {
	to {
		transform: rotate(360deg);
	}
}

@media (max-width: 768px) {
	.header-content {
		flex-direction: column;
		align-items: flex-start;
		gap: 1rem;
	}
	.search-section {
		width: 100%;
		margin: 1rem 0 0 0;
	}
}
</style>
