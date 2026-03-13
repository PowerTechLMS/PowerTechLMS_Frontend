<template>
  <div class="users-page-container">
    <div class="glass-header">
      <div class="header-content">
        <div>
          <h1 class="text-glow">Quản lý Người dùng</h1>
          <p class="subtitle">Quản lý tài khoản, phân quyền và trạng thái hoạt động</p>
        </div>
      </div>

      <div class="search-section">
        <div class="glass-input-group">
          <Search :size="18" class="icon" />
          <input v-model="search" @input="debounceFetch" placeholder="Tìm theo tên hoặc email..." />
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Đang tải danh sách người dùng...</p>
    </div>

    <div v-else-if="users.length === 0" class="empty-state glass-card">
      <UsersIcon :size="64" class="empty-icon" />
      <h3>Không tìm thấy người dùng</h3>
      <p>Không có người dùng nào khớp với từ khóa tìm kiếm.</p>
    </div>

    <div v-else class="glass-card table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Người dùng</th>
            <th>Mật khẩu / Liên hệ</th>
            <th>Vai trò</th>
            <th>Phòng ban</th>
            <th>Trạng thái</th>
            <th class="text-right">Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id" class="table-row">
            <td>
              <div class="user-info">
                <div v-if="user.avatar" class="avatar" :style="{ backgroundImage: `url('${getAvatarUrl(user.avatar)}')`, backgroundSize: 'cover', backgroundPosition: 'center', color: 'transparent' }"></div>
                <div v-else class="avatar">{{ getInitials(user.fullName) }}</div>
                <div>
                  <div class="user-name">{{ user.fullName }}</div>
                  <div class="user-id">ID: {{ user.id }}</div>
                </div>
              </div>
            </td>
            <td>
              <div class="contact-info">
                <span class="email"><Mail :size="14"/> {{ user.email }}</span>
              </div>
            </td>
            <td>
              <div class="role-badge" :class="user.role.toLowerCase()">
                <Shield :size="14" /> {{ user.role }}
              </div>
            </td>
            <td>
              <div v-if="user.groupName" class="dept-badge">
                <Layout :size="14" /> {{ user.groupName }}
              </div>
              <span v-else class="text-muted fs-12 italic">Chưa gán</span>
            </td>
            <td>
              <div class="status-badge" :class="user.isActive ? 'active' : 'inactive'">
                <CheckCircle v-if="user.isActive" :size="14" />
                <XCircle v-else :size="14" />
                {{ user.isActive ? 'Đang hoạt động' : 'Đã vô hiệu hóa' }}
              </div>
            </td>
            <td class="actions-cell text-right">
              <div class="d-flex justify-content-end gap-2">
                <button class="btn btn-sm btn-outline-primary" @click="openAssignModal(user)" title="Gán phòng ban">
                  <UserPlus :size="14" />
                </button>
                <button 
                  class="btn btn-sm" 
                  :class="user.isActive ? 'btn-danger' : 'btn-success'"
                  @click="toggleActive(user)"
                  :disabled="togglingId === user.id"
                >
                  <Power :size="14" />
                  <span v-if="togglingId === user.id">...</span>
                  <span v-else>{{ user.isActive ? 'Khóa' : 'Mở' }}</span>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="pagination glass-card">
      <button class="page-btn" :disabled="page === 1" @click="page--; fetchUsers()">
        <ChevronLeft :size="18" />
      </button>
      <span class="page-info">Trang {{ page }} / {{ totalPages }}</span>
      <button class="page-btn" :disabled="page === totalPages" @click="page++; fetchUsers()">
        <ChevronRight :size="18" />
      </button>
    </div>

    <!-- Assign Department Modal -->
    <div v-if="showModal" class="modal-overlay">
      <div class="glass-card modal-content p-4">
        <h3 class="mb-4 d-flex align-items-center gap-2">
          <Layout :size="24" class="text-primary" />
          Gán Phòng ban cho {{ selectedUser?.fullName }}
        </h3>
        
        <div class="mb-4">
          <label class="form-label d-block mb-2">Chọn bộ phận / phòng ban:</label>
          <select v-model="targetGroupId" class="glass-select w-100 p-2 rounded-lg">
            <option :value="null">-- Chưa chọn --</option>
            <option v-for="group in groups" :key="group.id" :value="group.id">
              {{ group.name }}
            </option>
          </select>
        </div>

        <div class="d-flex justify-content-end gap-3 mt-4">
          <button class="btn btn-outline" @click="showModal = false">Hủy</button>
          <button class="btn btn-primary" :disabled="submitting || !targetGroupId" @click="assignUserToGroup">
            <span v-if="submitting">Đang xử lý...</span>
            <span v-else>Xác nhận gán</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { userAPI, userGroupAPI } from '@/services/api'
import { Search, Users as UsersIcon, Mail, Shield, Calendar, CheckCircle, XCircle, Power, ChevronLeft, ChevronRight, Layout, UserPlus } from 'lucide-vue-next'
import { toast } from 'vue3-toastify'

const users = ref([])
const loading = ref(true)
const search = ref('')
const page = ref(1)
const pageSize = ref(20)
const totalPages = ref(1)
let timer = null
const togglingId = ref(null)

// Group assignment state
const groups = ref([])
const showModal = ref(false)
const selectedUser = ref(null)
const targetGroupId = ref(null)
const submitting = ref(false)

async function fetchUsers() {
  loading.value = true
  try {
    const { data } = await userAPI.getAll({ 
      page: page.value, 
      pageSize: pageSize.value, 
      search: search.value || undefined 
    })
    users.value = data.items
    totalPages.value = Math.ceil(data.totalCount / pageSize.value)
  } catch (e) {
    console.error('Lỗi tải người dùng', e)
  } finally {
    loading.value = false
  }
}

async function fetchGroups() {
  try {
    const res = await userGroupAPI.getAll()
    groups.value = res.data.items || res.data
  } catch (e) {
    console.error('Lỗi tải danh sách phòng ban', e)
  }
}

async function toggleActive(user) {
  const action = user.isActive ? 'vô hiệu hóa' : 'kích hoạt'
  if (!confirm(`Bạn chắc chắn muốn ${action} tài khoản của ${user.fullName}?`)) return
  
  togglingId.value = user.id
  try {
    await userAPI.toggleActive(user.id)
    user.isActive = !user.isActive 
  } catch (e) {
    toast.error('Lỗi cập nhật trạng thái người dùng')
  } finally {
    togglingId.value = null
  }
}

function openAssignModal(user) {
  selectedUser.value = user
  targetGroupId.value = null
  showModal.value = true
}

async function assignUserToGroup() {
  if (!selectedUser.value || !targetGroupId.value) return
  submitting.value = true
  try {
    await userGroupAPI.addUser(targetGroupId.value, selectedUser.value.id)
    const groupName = groups.value.find(g => g.id === targetGroupId.value)?.name
    selectedUser.value.groupName = groupName
    toast.success(`Đã gán ${selectedUser.value.fullName} vào ${groupName}`)
    showModal.value = false
  } catch (e) {
    toast.error('Lỗi khi gán phòng ban')
  } finally {
    submitting.value = false
  }
}

function debounceFetch() {
  clearTimeout(timer)
  timer = setTimeout(() => { page.value = 1; fetchUsers() }, 300)
}

function getInitials(name) {
  if (!name) return 'U'
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
}
function getAvatarUrl(url) {
  if (!url) return null
  return url.startsWith('http') ? url : `${import.meta.env.VITE_API_URL || 'http://localhost:5100'}${url}`
}

onMounted(() => {
  fetchUsers()
  fetchGroups()
})
</script>

<style scoped>
.users-page-container {
  padding: var(--space-xl);
  min-height: 100vh;
  background: radial-gradient(circle at top right, rgba(99, 102, 241, 0.05), transparent);
}

.glass-header {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: var(--radius-2xl);
  padding: var(--space-2xl);
  margin-bottom: var(--space-2xl);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.text-glow {
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, var(--primary-600), var(--primary-400));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 0.5rem;
}

.subtitle { color: var(--text-secondary); font-size: 1.1rem; }

.search-section { width: 350px; }
.glass-input-group {
  display: flex; align-items: center; gap: var(--space-sm);
  background: rgba(255, 255, 255, 0.5); border: 1px solid var(--border-color);
  border-radius: var(--radius-lg); padding: 0 var(--space-md);
  transition: all 0.3s ease;
}
.glass-input-group:focus-within {
  border-color: var(--primary-400); background: white;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}
.glass-input-group input { border: none; background: transparent; width: 100%; padding: 0.8rem 0; outline: none; font-size: 0.95rem; }
.icon { color: var(--text-tertiary); }

.table-container { padding: 0; overflow-x: auto; border-radius: var(--radius-xl); border: 1px solid var(--border-color); }
.data-table { width: 100%; border-collapse: collapse; text-align: left; }
.data-table th { padding: var(--space-lg); font-weight: 600; color: var(--text-secondary); background: var(--bg-tertiary); border-bottom: 2px solid var(--border-color); font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.5px; }
.data-table td { padding: var(--space-lg); border-bottom: 1px solid var(--border-color); vertical-align: middle; }
.table-row { transition: background 0.2s; }
.table-row:hover { background: rgba(255, 255, 255, 0.8); }

.user-info { display: flex; align-items: center; gap: var(--space-md); }
.avatar { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, var(--primary-400), var(--primary-600)); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1rem; }
.user-name { font-weight: 600; color: var(--text-primary); }
.user-id { font-size: 0.75rem; color: var(--text-tertiary); }

.contact-info { display: flex; flex-direction: column; gap: 4px; }
.email { font-size: 0.9rem; color: var(--text-secondary); display: flex; align-items: center; gap: 6px; }

.role-badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; }
.role-badge.admin { background: rgba(239, 68, 68, 0.1); color: var(--danger-600); }
.role-badge.instructor { background: rgba(59, 130, 246, 0.1); color: var(--primary-600); }
.role-badge.employee { background: rgba(16, 185, 129, 0.1); color: var(--success-600); }

.status-badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; }
.status-badge.active { background: rgba(34, 197, 94, 0.15); color: var(--success-600); }
.status-badge.inactive { background: rgba(239, 68, 68, 0.15); color: var(--danger-600); }

.dept-badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; background: rgba(99, 102, 241, 0.1); color: var(--primary-700); border-radius: 20px; font-size: 0.85rem; font-weight: 600; }

.pagination { display: flex; align-items: center; justify-content: center; gap: var(--space-lg); padding: var(--space-md); margin-top: var(--space-xl); border-radius: var(--radius-xl); }
.page-btn { background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: var(--radius-md); width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; color: var(--text-secondary); }
.page-btn:hover:not(:disabled) { border-color: var(--primary-400); color: var(--primary-600); background: var(--primary-50); }
.page-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.page-info { font-weight: 600; color: var(--text-secondary); }

/* Modal Styles */
.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.5); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center; z-index: 1000;
}
.modal-content { width: 100%; max-width: 500px; border: 1px solid rgba(255,255,255,0.4); }
.glass-select { background: rgba(255,255,255,0.5); border: 1px solid var(--border-color); outline: none; transition: border-color 0.3s; }
.glass-select:focus { border-color: var(--primary-400); }

.btn { padding: 8px 16px; border-radius: var(--radius-md); font-weight: 600; cursor: pointer; transition: all 0.2s; border: none; font-size: 0.9rem; }
.btn-primary { background: var(--primary-600); color: white; }
.btn-primary:hover:not(:disabled) { background: var(--primary-700); transform: translateY(-1px); }
.btn-outline { background: transparent; border: 1px solid var(--border-color); color: var(--text-secondary); }
.btn-outline:hover { background: var(--bg-tertiary); color: var(--text-primary); }
.btn-outline-primary { background: transparent; border: 1px solid var(--primary-400); color: var(--primary-600); }
.btn-outline-primary:hover { background: var(--primary-50); }

.loading-state { text-align: center; padding: 4rem; color: var(--text-secondary); }
.spinner { width: 40px; height: 40px; border: 4px solid rgba(99,102,241,0.1); border-top-color: var(--primary-500); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1rem; }
@keyframes spin { to { transform: rotate(360deg); } }

.gap-2 { gap: 0.5rem; }
.gap-3 { gap: 0.75rem; }
.italic { font-style: italic; }
.fs-12 { font-size: 0.75rem; }

@media (max-width: 1024px) {
  .glass-header { flex-direction: column; align-items: flex-start; gap: 1rem; }
  .search-section { width: 100%; }
}
</style>
