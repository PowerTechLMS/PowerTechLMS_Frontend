<template>
  <div class="enrollments-page p-4">
    
    <div class="page-header-premium mb-5">
      <div class="header-inner">
        <div class="header-icon-box pulse-glow">
          <BookUp :size="32" class="animated-icon" />
        </div>
        <div class="header-info">
          <div class="d-flex align-items-center gap-2 mb-1">
             <span class="badge-glass primary">QUẢN TRỊ VIÊN</span>
          </div>
          <h1 class="title-gradient">Quản lý Ghi danh</h1>
          <p class="desc-text">Duyệt thẻ đăng ký, kiểm soát số lượng học viên và phân công đào tạo sự vụ.</p>
        </div>
      </div>
    </div>

    <div class="tabs-premium-nav mb-5">
       <button @click="activeTab = 'pending'" class="nav-tab-btn" :class="{ active: activeTab === 'pending' }">
          <div class="tab-index" :class="{ 'warning-pulse': pendingList.length > 0 }">
             <ClipboardList v-if="pendingList.length === 0" :size="16" />
             <span v-else>{{ pendingList.length }}</span>
          </div>
          <div class="tab-label">
             <span>Chờ phê duyệt</span>
             <small>Yêu cầu từ học viên</small>
          </div>
       </button>
       <button @click="activeTab = 'assign'" class="nav-tab-btn" :class="{ active: activeTab === 'assign' }">
          <div class="tab-index success"><UserPlus :size="16" /></div>
          <div class="tab-label">
             <span>Phân công đào tạo</span>
             <small>Gán khóa học bắt buộc</small>
          </div>
       </button>
    </div>

    <div class="main-content">
      <transition name="fade-slide" mode="out-in">
        <div v-if="activeTab === 'pending'" class="glass-panel" key="pending">
          
          <div class="panel-header-glass d-flex justify-content-between align-items-center mb-4">
            <h5 class="fw-800 text-secondary mb-0 d-flex align-items-center gap-2">
               <div class="s-icon-mini warning"><ClipboardList :size="16" /></div> 
               Danh sách chờ duyệt
            </h5>
            <button class="btn-ghost-glass" @click="loadPending">
              <RefreshCw :size="14" :class="{ spin: loadingPending }" /> Làm mới
            </button>
          </div>
          
          <div class="panel-body-glass">
            <div v-if="loadingPending" class="loading-state-luxe py-5">
              <div class="luxe-spinner"></div>
              <p>Đang tải dữ liệu ghi danh...</p>
            </div>
            
            <div v-else-if="!pendingList.length" class="empty-state-premium py-5">
              <div class="empty-icon-glass shadow-sm">
                <CheckCircle2 :size="48" class="text-success" />
              </div>
              <h3 class="mt-4 fw-800">Tất cả đã hoàn tất!</h3>
              <p class="text-secondary">Không có yêu cầu đăng ký nào đang chờ duyệt lúc này.</p>
            </div>
            
            <div v-else class="data-table-glass">
              <table class="table-premium">
                <thead>
                  <tr>
                    <th>HỌC VIÊN</th>
                    <th>KHÓA HỌC YÊU CẦU</th>
                    <th>THỜI GIAN ĐĂNG KÝ</th>
                    <th class="text-end">PHÊ DUYỆT</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in pendingList" :key="item.id">
                    <td>
                      <div class="user-request-cell">
                        <div class="avatar-glass shadow-sm">
                          <img v-if="item.userAvatar" :src="item.userAvatar" :alt="item.userName" class="avatar-img" />
                          <span v-else>{{ item.userName?.charAt(0)?.toUpperCase() || 'U' }}</span>
                        </div>
                        <div class="user-info">
                          <div class="user-name fw-700 text-dark">{{ item.userName || 'Người dùng ẩn' }}</div>
                          <div class="user-id text-secondary fs-12">Mã NV: {{ item.userId }}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div class="course-badge-glass shadow-sm">
                         <BookOpen :size="14" /> <span class="fw-600">{{ item.courseTitle || 'Khóa học không xác định' }}</span>
                      </div>
                    </td>
                    <td>
                      <div class="date-badge-glass">
                        <Calendar :size="14" />
                        <span class="fw-600">{{ item.enrolledAt ? new Date(item.enrolledAt).toLocaleDateString('vi-VN') : 'N/A' }}</span>
                      </div>
                    </td>
                    <td>
                      <div class="actions-cell justify-content-end">
                        <button class="btn-action-glow approve shadow-sm" @click="handleApprove(item.id, true)" title="Phê duyệt">
                          <Check :size="16" /> Phê duyệt
                        </button>
                        <button class="btn-action-glow reject shadow-sm" @click="handleApprove(item.id, false)" title="Từ chối">
                          <X :size="16" /> Từ chối
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div v-else-if="activeTab === 'assign'" class="glass-panel" key="assign">
           <div class="panel-header-glass d-flex justify-content-between align-items-center mb-4">
            <h5 class="fw-800 text-secondary mb-0 d-flex align-items-center gap-2">
               <div class="s-icon-mini success"><UserPlus :size="16" /></div> 
               Giao nhiệm vụ học tập
            </h5>
          </div>

          <div class="assign-studio-wrapper py-4">
            <div class="assign-form-card shadow-lg p-5">
               <div class="text-center mb-5">
                  <div class="s-icon-large mx-auto shadow-sm mb-3"><UserPlus :size="32" class="text-primary" /></div>
                  <h4 class="fw-900">Phân công đào tạo nội bộ</h4>
                  <p class="text-secondary small">Gán thông tin khóa học trực tiếp cho tài khoản nhân sự.</p>
               </div>

              <div class="glass-input-group mb-4">
                <label>Mã ID Nhân sự (Học viên) <span class="text-danger">*</span></label>
                <div class="input-ico-wrap">
                  <User :size="18" class="ico" />
                  <input v-model.number="assignForm.userId" type="number" class="luxe-input-ico shadow-sm" placeholder="Nhập mã nhân viên..." />
                </div>
              </div>

              <div class="glass-input-group mb-4">
                <label>Mã ID Khóa học (Giáo trình) <span class="text-danger">*</span></label>
                <div class="input-ico-wrap">
                  <BookOpen :size="18" class="ico" />
                  <input v-model.number="assignForm.courseId" type="number" class="luxe-input-ico shadow-sm" placeholder="VD: 15" />
                </div>
              </div>

              <div class="glass-input-group mb-4">
                <label>Hạn chót hoàn thành học tập <span class="text-secondary fs-12 fw-normal">(Tùy chọn)</span></label>
                <div class="input-ico-wrap">
                  <Calendar :size="18" class="ico" />
                  <input v-model="assignForm.deadline" type="date" class="luxe-input-ico shadow-sm" />
                </div>
              </div>

              <div class="toggle-card-premium mb-5 p-3 rounded-4 shadow-sm border">
                <div class="d-flex justify-content-between align-items-center">
                   <div>
                     <h6 class="fw-700 text-dark mb-1 d-flex align-items-center gap-2"><Lock :size="14" class="text-warning"/> Bắt buộc tham gia</h6>
                     <p class="text-secondary small mb-0">Học viên phải hoàn thành khóa học thay vì tự do lựa chọn.</p>
                   </div>
                   <div class="switch-premium">
                     <input v-model="assignForm.isMandatory" type="checkbox" id="sw-mandatory">
                     <label for="sw-mandatory" class="switch-label shadow-sm">
                        <div class="switch-ball"></div>
                     </label>
                   </div>
                </div>
              </div>

              <button class="btn-premium-action lg w-100 justify-content-center shadow-primary" @click="adminAssign" :disabled="assigning || !assignForm.userId || !assignForm.courseId">
                 <div v-if="assigning" class="spinner-border spinner-border-sm me-2"></div>
                 <UserPlus v-else :size="18" class="me-2" />
                 {{ assigning ? 'ĐANG PHÂN CÔNG...' : 'THỰC HIỆN PHÂN CÔNG' }}
              </button>

              <transition name="fade">
                <div class="assign-success-alert shadow-sm mt-4" v-if="assignSuccess">
                  <div class="success-icon-badge"><CheckCircle2 :size="18" /></div>
                  <div class="success-text fw-700">Đã gán khóa học thành công!</div>
                </div>
              </transition>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { enrollmentAPI } from '@/services/api'
import { 
  BookOpen, BookUp, Calendar, UserPlus, User, Loader2, CheckCircle2,
  ClipboardList, Check, X, RefreshCw, Lock
} from 'lucide-vue-next'

const activeTab = ref('pending') // pending | assign
const pendingList = ref([])
const loadingPending = ref(false)

const assigning = ref(false)
const assignSuccess = ref(false)
const assignForm = reactive({ userId: null, courseId: null, deadline: '', isMandatory: false })

async function loadPending() {
  loadingPending.value = true
  try {
    const { data } = await enrollmentAPI.getPending()
    pendingList.value = data
  } catch (e) {
    console.error('Lỗi tải danh sách chờ', e)
  }
  loadingPending.value = false
}

async function handleApprove(id, isApproved) {
  if (!confirm(`Bạn chắc chắn muốn ${isApproved ? 'duyệt' : 'từ chối'} ghi danh này?`)) return
  try {
    await enrollmentAPI.approve(id, isApproved)
    loadPending()
  } catch (e) {
    alert(e.response?.data?.message || 'Lỗi duyệt thẻ')
  }
}

async function adminAssign() {
  if (!assignForm.userId || !assignForm.courseId) return;
  assigning.value = true
  assignSuccess.value = false
  try {
    await enrollmentAPI.adminEnroll({
      userId: assignForm.userId,
      courseId: assignForm.courseId,
      deadline: assignForm.deadline || null,
      isMandatory: assignForm.isMandatory
    })
    assignSuccess.value = true
    Object.assign(assignForm, { userId: null, courseId: null, deadline: '', isMandatory: false })
    setTimeout(() => assignSuccess.value = false, 3000)
  } catch (e) { alert(e.response?.data?.message || 'Lỗi gán') }
  finally { assigning.value = false }
}

onMounted(() => {
  loadPending()
})
</script>

<style scoped>
/* Page Base */
.enrollments-page { min-height: 100vh; animation: fadeIn 0.5s ease-out; background: #f8fafc; color: #1e293b; font-family: 'Inter', sans-serif; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

/* Premium Header */
.page-header-premium { display: flex; justify-content: space-between; align-items: center; }
.header-inner { display: flex; align-items: center; gap: 20px; }
.header-icon-box { width: 64px; height: 64px; border-radius: 20px; background: rgba(99, 102, 241, 0.1); color: #6366f1; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(99, 102, 241, 0.2); }
.pulse-glow { animation: pulse 3s infinite; }
@keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(99, 102, 241, 0); } 100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); } }
.title-gradient { font-size: 32px; font-weight: 800; background: linear-gradient(90deg, #1e293b, #6366f1); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0; }
.desc-text { color: #64748b; margin-top: 4px; font-weight: 500; }
.badge-glass { padding: 4px 12px; border-radius: 20px; font-size: 10px; font-weight: 900; letter-spacing: 0.5px; }
.badge-glass.primary { background: rgba(99, 102, 241, 0.1); color: #6366f1; }

/* Tabs Navigation */
.tabs-premium-nav { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; max-width: 800px; }
.nav-tab-btn { background: rgba(255,255,255,0.7); backdrop-filter: blur(10px); border: 1px solid white; border-radius: 20px; padding: 16px 24px; display: flex; align-items: center; gap: 16px; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); text-align: left; position: relative; overflow: hidden; box-shadow: 0 10px 30px -10px rgba(0,0,0,0.05); }
.nav-tab-btn:hover { border-color: #6366f1; transform: translateY(-2px); }
.nav-tab-btn.active { border-color: transparent; background: linear-gradient(135deg, #ffffff, #f5f3ff); box-shadow: 0 15px 35px -5px rgba(99, 102, 241, 0.2); }

.tab-index { width: 44px; height: 44px; border-radius: 14px; background: #f1f5f9; color: #64748b; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 16px; transition: all 0.3s; }
.nav-tab-btn.active .tab-index { background: #6366f1; color: white; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3); }
.nav-tab-btn.active .tab-index.success { background: #10b981; color: white; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3); }
.tab-index.warning-pulse { background: #fef3c7; color: #d97706; animation: warningPulse 2s infinite; }
@keyframes warningPulse { 0% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4); } 70% { box-shadow: 0 0 0 6px rgba(245, 158, 11, 0); } 100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); } }

.tab-label span { display: block; font-weight: 800; font-size: 16px; color: #334155; line-height: 1.2; }
.tab-label small { font-size: 13px; color: #94a3b8; font-weight: 600; }
.nav-tab-btn.active .tab-label span { color: #6366f1; }

/* Panels & Glass Containers */
.glass-panel { background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(12px); border-radius: 32px; border: 1px solid white; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.05); padding: 32px; }
.s-icon-mini { width: 32px; height: 32px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
.s-icon-mini.warning { background: rgba(245, 158, 11, 0.1); color: #d97706; }
.s-icon-mini.success { background: rgba(16, 185, 129, 0.1); color: #10b981; }

.btn-ghost-glass { padding: 8px 16px; border-radius: 12px; border: 1px solid #e2e8f0; background: white; font-size: 13px; font-weight: 700; color: #64748b; display: flex; align-items: center; gap: 8px; transition: 0.3s; cursor: pointer; }
.btn-ghost-glass:hover { background: #f8fafc; color: #1e293b; border-color: #cbd5e1; }

/* Spinners & Empty State */
.loading-state-luxe, .empty-state-premium { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
.loading-state-luxe p { margin-top: 16px; font-weight: 600; color: #64748b; }
.luxe-spinner { width: 40px; height: 40px; border: 4px solid rgba(99, 102, 241, 0.2); border-top-color: #6366f1; border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { 100% { transform: rotate(360deg); } }

.empty-icon-glass { width: 90px; height: 90px; border-radius: 50%; background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05)); border: 1px solid rgba(16, 185, 129, 0.2); display: flex; align-items: center; justify-content: center; }

/* Data Table */
.data-table-glass { overflow-x: auto; background: white; border-radius: 24px; border: 1px solid #f1f5f9; padding: 10px; }
.table-premium { width: 100%; border-collapse: separate; border-spacing: 0 8px; }
.table-premium th { padding: 12px 20px; font-size: 11px; font-weight: 800; color: #94a3b8; letter-spacing: 0.5px; border-bottom: 2px solid #f8fafc; }
.table-premium td { padding: 16px 20px; background: #fafafa; transition: 0.3s; }
.table-premium tr:hover td { background: #f8fafc; }
.table-premium td:first-child { border-radius: 16px 0 0 16px; }
.table-premium td:last-child { border-radius: 0 16px 16px 0; }

.user-request-cell { display: flex; align-items: center; gap: 14px; }
.avatar-glass { width: 44px; height: 44px; border-radius: 14px; background: linear-gradient(135deg, #f1f5f9, #e2e8f0); color: #64748b; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 16px; overflow: hidden; border: 2px solid white; }
.avatar-img { width: 100%; height: 100%; object-fit: cover; }

.course-badge-glass { display: inline-flex; align-items: center; gap: 8px; padding: 8px 14px; background: white; border-radius: 12px; border: 1px solid #f1f5f9; font-size: 13px; color: #4f46e5; }
.date-badge-glass { display: inline-flex; align-items: center; gap: 8px; font-size: 13px; color: #64748b; background: rgba(241, 245, 249, 0.5); padding: 6px 12px; border-radius: 10px; }

/* Action Buttons Grid */
.actions-cell { display: flex; gap: 10px; }
.btn-action-glow { padding: 8px 16px; border-radius: 12px; font-size: 13px; font-weight: 700; display: flex; align-items: center; gap: 6px; border: none; transition: 0.3s; cursor: pointer; }
.btn-action-glow.approve { background: rgba(16, 185, 129, 0.1); color: #10b981; }
.btn-action-glow.approve:hover { background: #10b981; color: white; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3) !important; }
.btn-action-glow.reject { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
.btn-action-glow.reject:hover { background: #ef4444; color: white; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3) !important; }

/* Assign Studio Form */
.assign-studio-wrapper { display: flex; justify-content: center; }
.assign-form-card { width: 100%; max-width: 500px; background: white; border-radius: 32px; border: 1px solid rgba(226, 232, 240, 0.6); }
.s-icon-large { width: 72px; height: 72px; border-radius: 24px; background: rgba(99, 102, 241, 0.05); display: flex; align-items: center; justify-content: center; }

/* Form Inputs Luxe */
.glass-input-group label { display: block; font-size: 13px; font-weight: 800; color: #64748b; margin-bottom: 8px; }
.input-ico-wrap { position: relative; }
.input-ico-wrap .ico { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: #94a3b8; transition: 0.3s; }
.luxe-input-ico { width: 100%; padding: 16px 20px 16px 48px; border-radius: 16px; border: 1px solid #e2e8f0; font-size: 15px; font-weight: 600; color: #1e293b; outline: none; transition: 0.3s; background: #fafafa; }
.luxe-input-ico:focus { border-color: #6366f1; background: white; box-shadow: 0 0 0 5px rgba(99, 102, 241, 0.1) !important; }
.luxe-input-ico:focus + .ico { color: #6366f1; }

/* Switch Toggle Premium */
.switch-premium { display: flex; align-items: center; }
.switch-premium input { display: none; }
.switch-label { width: 50px; height: 28px; background: #e2e8f0; border-radius: 15px; position: relative; cursor: pointer; transition: 0.3s; }
.switch-ball { width: 22px; height: 22px; background: white; border-radius: 50%; position: absolute; left: 3px; top: 3px; transition: 0.4s cubic-bezier(0.25, 0.8, 0.25, 1); box-shadow: 0 2px 5px rgba(0,0,0,0.2); }
.switch-premium input:checked + .switch-label { background: #10b981; }
.switch-premium input:checked + .switch-label .switch-ball { left: 25px; transform: scale(1.1); box-shadow: 0 2px 10px rgba(16, 185, 129, 0.4); }

/* Master Buttons */
.btn-premium-action { padding: 16px 28px; background: linear-gradient(135deg, #6366f1, #4f46e5); color: white; border-radius: 18px; font-weight: 800; font-size: 15px; display: flex; align-items: center; gap: 10px; border: none; transition: all 0.3s; cursor: pointer; letter-spacing: 0.5px; }
.btn-premium-action:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 15px 25px -5px rgba(99, 102, 241, 0.4) !important; }
.btn-premium-action:disabled { opacity: 0.7; cursor: not-allowed; }

/* Success Alert */
.assign-success-alert { display: flex; align-items: center; gap: 12px; padding: 16px; background: rgba(16, 185, 129, 0.1); border-radius: 16px; border: 1px solid rgba(16, 185, 129, 0.2); color: #10b981; }

.fade-slide-enter-active, .fade-slide-leave-active { transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
.fade-slide-enter-from { opacity: 0; transform: translateY(20px) scale(0.98); }
.fade-slide-leave-to { opacity: 0; transform: translateY(-20px) scale(0.98); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
