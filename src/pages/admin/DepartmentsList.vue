<template>
  <div class="departments-page">
    <div class="page-header">
      <div class="header-content">
        <div class="header-icon-box pulse-glow">
          <Building2 :size="32" style="width: 32px; height: 32px;" />
        </div>
        <div>
          <h1 class="page-title-gradient">Sơ Đồ Tổ Chức & Phòng Ban</h1>
          <p class="page-desc">Quản lý cơ cấu nhân sự, tự động phân bổ khung lộ trình đào tạo theo từng bộ phận.</p>
        </div>
      </div>
      <div class="header-actions">
        <button @click="goToCreate" class="btn btn-primary btn-glow">
          <Plus :size="18" style="width: 18px; height: 18px;" />
          <span>Thêm Phòng Ban</span>
        </button>
      </div>
    </div>

    <div class="stats-grid">
      <div class="glass-stat-card">
        <div class="stat-icon-wrap primary-gradient">
            <Building2 :size="28" />
        </div>
        <div class="stat-info">
          <p class="stat-label">TỔNG SỐ PHÒNG BAN</p>
          <h3 class="stat-value">{{ stats.total }} <span class="stat-unit">bộ phận</span></h3>
        </div>
      </div>
      
      <div class="glass-stat-card">
        <div class="stat-icon-wrap info-gradient">
            <Users :size="28" />
        </div>
        <div class="stat-info">
          <p class="stat-label">QUY MÔ NHÂN SỰ</p>
          <h3 class="stat-value">{{ stats.totalMembers }} <span class="stat-unit">nhân viên</span></h3>
        </div>
      </div>
    </div>

    <div class="section-bar glass-card">
      <div class="bar-title">
         <Layout :size="20" class="title-icon" /> 
         <span>Danh sách Khối / Phòng ban</span>
      </div>
      <div class="glass-search inline">
        <Search :size="16" class="animated-icon" />
        <input type="text" v-model="searchQuery" @input="currentPage = 1" class="search-input-premium sm" placeholder="Tìm theo tên phòng ban, mã PB...">
      </div>
    </div>

    <div class="content-card glass-card">
      <div v-if="loading" class="loading-state custom-scrollbar">
        <div v-for="i in 5" :key="i" class="skeleton-row">
            <div class="skel-avatar"></div>
            <div class="skel-info">
                <div class="skel-line w-40"></div>
                <div class="skel-line w-70"></div>
            </div>
        </div>
      </div>

      <div v-else-if="filteredDepartments.length === 0" class="empty-state">
        <Building2 :size="64" class="empty-icon" />
        <h3>Chưa thiết lập cơ cấu tổ chức</h3>
        <p>Thêm phòng ban mới để bắt đầu phân bổ nhân sự và tự động hóa lộ trình đào tạo.</p>
      </div>

      <div v-else class="table-container custom-scrollbar">
        <table class="glass-table">
          <thead>
            <tr>
              <th width="80" class="text-center">MÃ PB</th>
              <th min-width="250">Thông tin Bộ phận</th>
              <th width="120" class="text-center">Trạng thái</th>
              <th width="140" class="text-center">Quy mô Nhân sự</th>
              <th width="160" class="text-center">Lộ trình áp dụng</th>
              <th width="140">Ngày thành lập</th>
              <th width="120" class="text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="dept in paginatedDepartments" :key="dept.id">
              
              <td class="text-center">
                 <span class="dept-id-badge">PB-{{ String(dept.id).padStart(3, '0') }}</span>
              </td>

              <td>
                <div class="dept-info-cell">
                  <h6 class="dept-name">{{ dept.name }}</h6>
                  <p class="dept-desc text-truncate" style="max-width: 250px;" :title="dept.description">
                    {{ dept.description || 'Chưa cập nhật chức năng nhiệm vụ.' }}
                  </p>
                </div>
              </td>

              <td class="text-center">
                 <span class="status-pill active-pill">
                    <CheckCircle :size="12" /> Hoạt động
                 </span>
              </td>

              <td class="text-center">
                <div class="member-count-badge mx-auto">
                  <Users :size="16" class="icon-primary" />
                  <strong>{{ dept.memberCount || 0 }}</strong>
                </div>
              </td>

              <td class="text-center">
                <div class="course-group-badge mx-auto" title="Số lượng khung lộ trình được tự động áp dụng">
                  <span class="cg-num">{{ dept.courseGroupCount || 0 }}</span>
                  <span class="cg-text">Lộ trình</span>
                </div>
              </td>

              <td>
                 <div class="fs-13 text-secondary d-flex align-items-center gap-2 fw-medium">
                    <Calendar :size="14" class="text-tertiary" /> 
                    {{ new Date(dept.createdAt).toLocaleDateString('vi-VN') }}
                 </div>
              </td>

              <td>
                <div class="action-buttons">
                  <button class="btn-ghost-icon view" title="Quản lý nhân sự & Tiến độ" @click="viewDepartment(dept.id)">
                      <Eye :size="16" />
                  </button>
                  <button class="btn-ghost-icon edit" title="Chỉnh sửa thông tin" @click="editDepartment(dept.id)">
                      <Pencil :size="16" />
                  </button>
                  <button class="btn-ghost-icon delete" title="Giải thể phòng ban" @click="deleteDepartment(dept)" :disabled="deletingId === dept.id">
                      <Loader2 v-if="deletingId === dept.id" :size="16" class="spinner-icon" />
                      <Trash2 v-else :size="16" />
                  </button>
                </div>
              </td>

            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="!loading && totalPages > 1" class="pagination-container">
        <div class="pagination-info">
          Hiển thị <strong>{{ (currentPage - 1) * itemsPerPage + 1 }}</strong> đến <strong>{{ Math.min(currentPage * itemsPerPage, filteredDepartments.length) }}</strong> trong tổng <strong>{{ filteredDepartments.length }}</strong> bộ phận
        </div>
        <div class="pagination-controls">
          <button class="page-nav-btn" :disabled="currentPage === 1" @click="handlePageChange(currentPage - 1)">
              <ChevronLeft :size="16" />
          </button>
          
          <button v-for="page in totalPages" :key="page" 
                  class="page-num-btn" :class="{ active: currentPage === page }" 
                  @click="handlePageChange(page)"
                  v-show="Math.abs(page - currentPage) <= 1 || page === 1 || page === totalPages">
              <span v-if="Math.abs(page - currentPage) > 1 && (page === 1 || page === totalPages)">...</span>
              <span v-else>{{ page }}</span>
          </button>
          
          <button class="page-nav-btn" :disabled="currentPage === totalPages" @click="handlePageChange(currentPage + 1)">
              <ChevronRight :size="16" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { userGroupAPI } from "@/services/api";
import { 
    Building2, Users, Search, Plus, Eye, Pencil, Trash2, 
    Calendar, Layout, CheckCircle, ChevronLeft, ChevronRight, Loader2
} from "lucide-vue-next";
import { toast } from "vue3-toastify";

const router = useRouter();
const departments = ref<any[]>([]);
const loading = ref(true);
const deletingId = ref<number | null>(null);

const searchQuery = ref("");
const currentPage = ref(1);
const itemsPerPage = ref(10);

const fetchDepartments = async () => {
  loading.value = true;
  try {
    const res = await userGroupAPI.getAll({ pageSize: 1500 });
    departments.value = res.data.items || res.data;
  } catch (error) {
    toast.error("Lỗi khi tải danh sách bộ phận");
  } finally {
    loading.value = false;
  }
};

onMounted(fetchDepartments);

const stats = computed(() => ({
  total: departments.value.length,
  totalMembers: departments.value.reduce((sum: number, d: any) => sum + (d.memberCount || 0), 0)
}));

const filteredDepartments = computed(() => {
  let result = [...departments.value];
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter(d => 
       (d.name || '').toLowerCase().includes(q) || 
       (d.description || '').toLowerCase().includes(q) ||
       (`pb-${String(d.id).padStart(3, '0')}`).includes(q)
    );
  }
  result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  return result;
});

const totalPages = computed(() => Math.ceil(filteredDepartments.value.length / itemsPerPage.value) || 1);
const paginatedDepartments = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return filteredDepartments.value.slice(start, start + itemsPerPage.value);
});

const handlePageChange = (page: number) => { if (page >= 1 && page <= totalPages.value) currentPage.value = page; };
const goToCreate = () => router.push('/admin/departments/add');
const viewDepartment = (id: number) => router.push(`/admin/departments/${id}`);
const editDepartment = (id: number) => router.push(`/admin/departments/edit/${id}`);

const deleteDepartment = async (dept: any) => {
  if (confirm(`Phòng ban "${dept.name}" đang có ${dept.memberCount} nhân viên. Giải thể phòng ban này sẽ không xóa nhân sự nhưng sẽ gỡ họ khỏi các lộ trình học tập thuộc phòng. Bạn chắc chắn chứ?`)) {
    deletingId.value = dept.id;
    try {
      await userGroupAPI.delete(dept.id);
      departments.value = departments.value.filter(d => d.id !== dept.id);
      toast.success("Giải thể bộ phận thành công!");
    } catch (error) {
      toast.error("Không thể giải thể bộ phận này!");
    } finally {
        deletingId.value = null;
    }
  }
};
</script>

<style scoped>
/* Typography & Layout */
.departments-page { padding-bottom: var(--space-2xl); color: var(--text-primary); box-sizing: border-box; animation: fadeIn 0.4s ease-out; }

.page-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: var(--space-xl); flex-wrap: wrap; gap: var(--space-lg); }
.header-content { display: flex; align-items: center; gap: var(--space-xl); }
.header-icon-box { width: 64px; height: 64px; border-radius: 20px; background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(99, 102, 241, 0.05)); color: var(--primary-500); display: flex; align-items: center; justify-content: center; border: 1px solid rgba(99, 102, 241, 0.2); box-shadow: 0 8px 20px rgba(99, 102, 241, 0.15); flex-shrink: 0; }
.pulse-glow { animation: pulse-border 3s ease-in-out infinite; }
@keyframes pulse-border { 0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.2); } 50% { box-shadow: 0 0 0 15px rgba(99, 102, 241, 0); } 100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); } }

.page-title-gradient { font-size: 32px; font-weight: 800; letter-spacing: -0.02em; background: linear-gradient(90deg, var(--primary-600), var(--primary-400)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 8px; }
.page-desc { font-size: var(--font-size-base); color: var(--text-secondary); max-width: 600px; line-height: 1.5; margin: 0; }

.btn { display: inline-flex; align-items: center; gap: 8px; padding: 12px 24px; border-radius: var(--radius-full); font-weight: 700; font-size: var(--font-size-sm); cursor: pointer; transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); border: none; }
.btn-primary { background: var(--primary-500); color: white; }
.btn-glow { box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3); }
.btn-glow:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4); }

/* Stats Grid */
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: var(--space-xl); margin-bottom: var(--space-xl); }
.glass-stat-card { background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(20px); border: 1px solid rgba(0, 0, 0, 0.05); border-radius: var(--radius-2xl); padding: var(--space-xl); display: flex; align-items: center; gap: var(--space-lg); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.03); transition: all 0.3s; position: relative; overflow: hidden; }
.glass-stat-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08); border-color: rgba(99, 102, 241, 0.2); }
.glass-stat-card::before { content: ''; position: absolute; inset: 0; border-radius: inherit; box-shadow: inset 0 0 0 1px transparent; transition: all 0.3s; pointer-events: none; }
.glass-stat-card:hover::before { box-shadow: inset 0 0 0 1px rgba(99, 102, 241, 0.2); }

.stat-icon-wrap { width: 56px; height: 56px; border-radius: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.primary-gradient { background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(96, 165, 250, 0.1)); color: #3b82f6; border: 1px solid rgba(59, 130, 246, 0.2); }
.info-gradient { background: linear-gradient(135deg, rgba(14, 165, 233, 0.15), rgba(56, 189, 248, 0.1)); color: #0ea5e9; border: 1px solid rgba(14, 165, 233, 0.2); }

.stat-info { display: flex; flex-direction: column; }
.stat-label { font-size: 13px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 4px 0; }
.stat-value { font-size: 28px; font-weight: 800; color: var(--text-primary); margin: 0; display: flex; align-items: baseline; gap: 4px; }
.stat-unit { font-size: 14px; font-weight: 600; color: var(--text-tertiary); }

/* Glass Cards */
.glass-card { background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(20px); border: 1px solid rgba(0, 0, 0, 0.05); border-radius: var(--radius-2xl); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.03); }

/* Section Bar */
.section-bar { display: flex; justify-content: space-between; align-items: center; padding: 16px 24px; margin-bottom: var(--space-xl); flex-wrap: wrap; gap: var(--space-md); }
.bar-title { display: flex; align-items: center; gap: 12px; font-size: 18px; font-weight: 800; color: var(--text-primary); }
.title-icon { color: var(--primary-500); }

/* Search */
.glass-search.inline { display: flex; align-items: center; background: #ffffff; border: 1px solid rgba(0,0,0,0.1); border-radius: var(--radius-full); padding: 4px 16px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02); width: 100%; max-width: 350px; box-sizing: border-box; transition: all 0.3s; }
.glass-search.inline:focus-within { border-color: var(--primary-400); box-shadow: 0 0 0 4px rgba(99,102,241,0.1); }
.animated-icon { color: var(--text-tertiary); transition: color 0.3s; }
.glass-search.inline:focus-within .animated-icon { color: var(--primary-500); }
.search-input-premium.sm { flex: 1; border: none; background: transparent; padding: 10px 8px; font-size: 14px; outline: none; color: var(--text-primary); min-width: 0; }

/* Table */
.content-card { padding: 0; overflow: hidden; }
.table-container { width: 100%; overflow-x: auto; padding: 0 24px; }
.glass-table { width: 100%; border-collapse: separate; border-spacing: 0 8px; min-width: 900px; padding-bottom: 16px; margin-top: 8px; }
.glass-table th { text-align: left; padding: 0 16px 16px 16px; font-size: 12px; font-weight: 700; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid rgba(0,0,0,0.05); white-space: nowrap; }
.glass-table td { padding: 20px 16px; background: rgba(249, 250, 251, 0.5); border-top: 1px solid rgba(0,0,0,0.02); border-bottom: 1px solid rgba(0,0,0,0.02); transition: all 0.2s; vertical-align: middle; }
.glass-table td:first-child { border-left: 1px solid rgba(0,0,0,0.02); border-top-left-radius: 16px; border-bottom-left-radius: 16px; }
.glass-table td:last-child { border-right: 1px solid rgba(0,0,0,0.02); border-top-right-radius: 16px; border-bottom-right-radius: 16px; }
.glass-table tbody tr:hover td { background: #ffffff; border-color: rgba(99, 102, 241, 0.1); }
.glass-table tbody tr:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.04); }

/* Custom badges and cells */
.dept-id-badge { display: inline-block; background: #f1f5f9; color: #475569; font-weight: 700; font-size: 12px; font-family: monospace; padding: 4px 10px; border-radius: 8px; border: 1px solid #e2e8f0; }

.dept-info-cell { display: flex; flex-direction: column; gap: 6px; }
.dept-name { margin: 0; font-size: 15px; font-weight: 700; color: var(--text-primary); }
.dept-desc { margin: 0; font-size: 13px; color: var(--text-secondary); line-height: 1.4; }

.status-pill { display: inline-flex; align-items: center; justify-content: center; gap: 4px; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
.active-pill { background: rgba(16, 185, 129, 0.1); color: #059669; border: 1px solid rgba(16, 185, 129, 0.2); }

.member-count-badge { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 6px 16px; background: rgba(0,0,0,0.02); border: 1px solid rgba(0,0,0,0.05); border-radius: var(--radius-full); font-size: 14px; color: var(--text-primary); }
.icon-primary { color: var(--primary-500); }

.course-group-badge { display: inline-flex; align-items: center; background: rgba(99, 102, 241, 0.05); border: 1px solid rgba(99, 102, 241, 0.2); border-radius: 12px; padding: 4px 10px; gap: 6px; }
.course-group-badge .cg-num { background: var(--primary-500); color: white; font-weight: 900; font-size: 13px; padding: 2px 8px; border-radius: 6px; min-width: 26px; text-align: center; }
.course-group-badge .cg-text { font-size: 12px; font-weight: 600; color: var(--primary-700); }

/* Action Buttons */
.action-buttons { display: flex; align-items: center; justify-content: center; gap: 6px; }
.btn-ghost-icon { width: 34px; height: 34px; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; border: 1px solid transparent; background: transparent; cursor: pointer; transition: all 0.2s; color: var(--text-tertiary); }
.btn-ghost-icon.view:hover { color: var(--primary-600); background: rgba(99, 102, 241, 0.1); border-color: rgba(99, 102, 241, 0.2); }
.btn-ghost-icon.edit:hover { color: var(--success-600); background: rgba(16, 185, 129, 0.1); border-color: rgba(16, 185, 129, 0.2); }
.btn-ghost-icon.delete:hover:not(:disabled) { color: var(--danger-600); background: rgba(239, 68, 68, 0.1); border-color: rgba(239, 68, 68, 0.2); }

/* Loaders */
.loading-state { padding: 40px 24px; display: flex; flex-direction: column; gap: 16px; }
.skeleton-row { display: flex; align-items: center; gap: 20px; padding: 16px; border-radius: 16px; background: rgba(249, 250, 251, 0.5); border: 1px solid rgba(0,0,0,0.02); }
.skel-avatar { width: 40px; height: 40px; border-radius: 12px; background: rgba(0,0,0,0.05); animation: pulse 1.5s infinite; }
.skel-info { flex: 1; display: flex; flex-direction: column; gap: 10px; }
.skel-line { height: 12px; background: rgba(0,0,0,0.05); border-radius: 6px; animation: pulse 1.5s infinite; }
.w-40 { width: 40%; } .w-70 { width: 70%; }
@keyframes pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
.spinner-icon { animation: spin 1s linear infinite; }
@keyframes spin { 100% { transform: rotate(360deg); } }

/* Pagination */
.pagination-container { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-top: 1px solid rgba(0,0,0,0.05); background: rgba(249, 250, 251, 0.3); flex-wrap: wrap; gap: 16px; }
.pagination-info { font-size: 14px; color: var(--text-secondary); }
.pagination-controls { display: flex; gap: 6px; align-items: center; }
.page-nav-btn, .page-num-btn { min-width: 36px; height: 36px; padding: 0 10px; border-radius: 10px; border: none; font-weight: 600; font-size: 14px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; background: transparent; color: var(--text-secondary); }
.page-nav-btn:not(:disabled):hover, .page-num-btn:hover { background: rgba(0,0,0,0.08); color: var(--text-primary); }
.page-num-btn.active { background: var(--primary-500); color: white; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3); }

@media (max-width: 768px) {
  .page-header { flex-direction: column; align-items: stretch; text-align: center; }
  .header-content { flex-direction: column; }
  .header-actions { display: flex; justify-content: center; }
  .section-bar { flex-direction: column; align-items: stretch; }
  .glass-search.inline { max-width: 100%; }
  .pagination-container { flex-direction: column; align-items: center; }
}
</style>