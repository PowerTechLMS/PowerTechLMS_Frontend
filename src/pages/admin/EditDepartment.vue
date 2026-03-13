<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
// @ts-ignore
import { userGroupAPI, userAPI, courseGroupAPI } from "@/services/api";
import { toast } from "vue3-toastify";
import { 
  Building2, ArrowLeft, Users, CheckCircle, Clock, Save,
  Settings, UserPlus, Search, Trash2, CalendarCheck, Loader2, BookOpen, Check
} from "lucide-vue-next";

const router = useRouter();
const route = useRoute();
const deptId = Number(route.params.id);

// --- 1. STATE ---
const form = ref({
  name: "",
  description: "",
  selectedCourseGroupIds: [] as number[], // ĐÃ SỬA: Dùng mảng để chọn nhiều lộ trình
  createdAt: "",
  updatedAt: "",
  isActive: true
});

const initialCourseGroupIds = ref<number[]>([]); // Lưu trạng thái ban đầu để so sánh khi lưu
const isSubmitting = ref(false);
const loading = ref(true);
const activeTab = ref('general');

const departmentMembers = ref<any[]>([]);
const courseGroups = ref<any[]>([]);
const allUsers = ref<any[]>([]);
const selectedUserIds = ref<number[]>([]);
const memberSearch = ref("");
const userSearch = ref("");

// --- 2. DATA FETCHING ---
const fetchData = async () => {
  loading.value = true;
  try {
    const [deptRes, cgRes, usersRes] = await Promise.all([
      userGroupAPI.getById(deptId),
      courseGroupAPI.getAll({ pageSize: 100 }).catch(() => ({ data: { items: [] } })),
      userAPI.getAll({ pageSize: 1000 })
    ]);

    const deptData = deptRes.data;
    form.value.name = deptData.name;
    form.value.description = deptData.description;
    form.value.createdAt = deptData.createdAt;
    form.value.updatedAt = deptData.updatedAt;
    form.value.isActive = !deptData.isDeleted; 
    
    // NẾU BACKEND TRẢ VỀ DANH SÁCH KHUNG LỘ TRÌNH ĐÃ GÁN
    form.value.selectedCourseGroupIds = deptData.courseGroupIds || []; 
    initialCourseGroupIds.value = [...form.value.selectedCourseGroupIds];

    departmentMembers.value = deptData.members || [];
    courseGroups.value = cgRes.data.items || cgRes.data;
    allUsers.value = usersRes.data.items || usersRes.data;

  } catch (error) {
    toast.error("Không thể tải thông tin phòng ban.");
    router.push('/admin/departments');
  } finally {
    loading.value = false;
  }
};

onMounted(fetchData);

// --- 3. COMPUTED ---
const filteredMembers = computed(() => {
  if (!memberSearch.value) return departmentMembers.value;
  const q = memberSearch.value.toLowerCase();
  return departmentMembers.value.filter(m => 
    m.fullName?.toLowerCase().includes(q) || 
    m.email?.toLowerCase().includes(q)
  );
});

const availableUsers = computed(() => {
  const memberUserIds = new Set(departmentMembers.value.map(m => m.userId));
  let users = allUsers.value.filter(u => !memberUserIds.has(u.id));
  if (userSearch.value) {
    const q = userSearch.value.toLowerCase();
    users = users.filter(u => u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }
  return users;
});

const memberStats = computed(() => ({
  total: departmentMembers.value.length,
  done: 0,
  learning: departmentMembers.value.length,
  notStarted: 0
}));

const getAvatar = (name: string) => {
   return `https://ui-avatars.com/api/?background=random&color=fff&name=${name ? name.replace(/ /g, "+") : "User"}`;
};

// --- 4. ACTIONS ---
const toggleCourseGroup = (id: number) => {
  const index = form.value.selectedCourseGroupIds.indexOf(id);
  if (index === -1) {
    form.value.selectedCourseGroupIds.push(id);
  } else {
    form.value.selectedCourseGroupIds.splice(index, 1);
  }
};

const updateDepartment = async () => {
  isSubmitting.value = true;
  try {
    // 1. Cập nhật thông tin cơ bản
    await userGroupAPI.update(deptId, {
      name: form.value.name,
      description: form.value.description
    });

    // 2. Xử lý Gán / Gỡ Khung lộ trình
    const current = new Set(form.value.selectedCourseGroupIds);
    const initial = new Set(initialCourseGroupIds.value);

    const toAdd = [...current].filter(id => !initial.has(id));
    const toRemove = [...initial].filter(id => !current.has(id));

    const mappingPromises = [];
    toAdd.forEach(cgId => mappingPromises.push(userGroupAPI.assignCourseGroup(deptId, cgId)));
    toRemove.forEach(cgId => mappingPromises.push(userGroupAPI.removeCourseGroup(deptId, cgId)));

    if (mappingPromises.length > 0) {
        await Promise.all(mappingPromises);
        initialCourseGroupIds.value = [...form.value.selectedCourseGroupIds];
    }

    toast.success("Cập nhật phòng ban & Lộ trình thành công!");
  } catch (error) {
    console.error(error);
    toast.error("Lỗi cập nhật thông tin.");
  } finally {
    isSubmitting.value = false;
  }
};

// THÊM THÀNH VIÊN -> Backend sẽ tự động Enroll khóa học nhờ logic C# đã viết
const addSelectedMembers = async () => {
  if (selectedUserIds.value.length === 0) return;
  isSubmitting.value = true;
  try {
    const promises = selectedUserIds.value.map(uid => userGroupAPI.addUser(deptId, uid));
    await Promise.all(promises);
    toast.success(`Đã thêm ${selectedUserIds.value.length} nhân sự và gán lộ trình.`);
    selectedUserIds.value = [];
    userSearch.value = "";
    
    const deptRes = await userGroupAPI.getById(deptId);
    departmentMembers.value = deptRes.data.members || [];
  } catch (error) {
    toast.error("Lỗi khi thêm nhân sự.");
  } finally {
    isSubmitting.value = false;
  }
};

const removeMember = async (userId: number, userName: string) => {
  if (!confirm(`Bạn có chắc muốn gỡ ${userName} khỏi nhóm? (Các khóa học hiện tại sẽ không bị xóa)`)) return;
  try {
    await userGroupAPI.removeUser(deptId, userId);
    departmentMembers.value = departmentMembers.value.filter(m => m.userId !== userId);
    toast.success("Đã gỡ thành viên.");
  } catch (error) {
    toast.error("Lỗi khi gỡ thành viên.");
  }
};

const cancel = () => router.push('/admin/departments');
</script>

<template>
  <div class="edit-department-page">
    
    <div v-if="loading" class="loading-state h-50 d-flex flex-column align-items-center justify-content-center mt-5 pt-5">
      <div class="spinner"></div>
      <p class="mt-3 text-muted fw-medium fs-14">Đang tải dữ liệu phòng ban...</p>
    </div>

    <div v-else>
      <div class="page-header">
        <div class="header-content">
          <div class="header-icon-box pulse-glow">
            <Building2 :size="32" style="width: 32px; height: 32px; min-width: 32px;" />
          </div>
          <div>
            <span class="id-badge">MÃ PB: PB-{{ String(deptId).padStart(3, '0') }}</span>
            <h1 class="page-title-gradient">Cập nhật: {{ form.name }}</h1>
            <p class="page-desc">Quản lý cơ cấu, lộ trình tự động và nhân sự trực thuộc.</p>
          </div>
        </div>
        
        <div class="header-actions">
          <button @click="cancel" class="btn btn-outline">
            <ArrowLeft :size="18" style="width: 18px; height: 18px; min-width: 18px;" />
            <span>Quay lại</span>
          </button>
        </div>
      </div>

      <div class="stats-glass-grid">
        <div class="glass-stat-card primary">
           <div class="stat-icon-wrap"><Users :size="24" style="width: 24px; height: 24px; min-width: 24px;" /></div>
           <div class="stat-info">
             <p class="stat-label">Tổng Nhân sự</p>
             <h3 class="stat-value">{{ memberStats.total }}</h3>
           </div>
        </div>
        
        <div class="glass-stat-card success">
           <div class="stat-icon-wrap"><CheckCircle :size="24" style="width: 24px; height: 24px; min-width: 24px;" /></div>
           <div class="stat-info">
             <p class="stat-label">Hoàn thành</p>
             <h3 class="stat-value">{{ memberStats.done }}</h3>
           </div>
        </div>
        
        <div class="glass-stat-card info">
           <div class="stat-icon-wrap"><Loader2 :size="24" style="width: 24px; height: 24px; min-width: 24px;" /></div>
           <div class="stat-info">
             <p class="stat-label">Đang học</p>
             <h3 class="stat-value">{{ memberStats.learning }}</h3>
           </div>
        </div>
        
        <div class="glass-stat-card warning">
           <div class="stat-icon-wrap"><Clock :size="24" style="width: 24px; height: 24px; min-width: 24px;" /></div>
           <div class="stat-info">
             <p class="stat-label">Chưa bắt đầu</p>
             <h3 class="stat-value">{{ memberStats.notStarted }}</h3>
           </div>
        </div>
      </div>

      <div class="glass-content-card mt-4">
        
        <div class="tabs-glass-nav">
          <button class="tab-glass-btn" :class="{ active: activeTab === 'general' }" @click="activeTab = 'general'">
            <Settings :size="18" class="me-2" style="width: 18px; height: 18px; min-width: 18px;" />
            <span>Cơ cấu & Lộ trình</span>
          </button>
          <button class="tab-glass-btn" :class="{ active: activeTab === 'members' }" @click="activeTab = 'members'">
            <Users :size="18" class="me-2" style="width: 18px; height: 18px; min-width: 18px;" />
            <span>Quản lý Nhân sự</span>
            <span class="tab-badge ms-2">{{ departmentMembers.length }}</span>
          </button>
        </div>

        <div class="glass-card-body">
          <div class="tab-content">
            
            <div v-show="activeTab === 'general'" class="fade-in">
              <form @submit.prevent="updateDepartment">
                <div class="row g-5">
                  
                  <div class="col-lg-6 position-relative">
                    <h6 class="premium-section-title">
                      <Settings :size="16" class="me-2 text-primary" style="width: 16px; height: 16px; min-width: 16px;"/> 
                      Thông tin cơ bản
                    </h6>
                    
                    <div class="form-group">
                      <label class="premium-label">Tên Phòng ban/Nhóm <span class="text-danger">*</span></label>
                      <div class="glass-input-group">
                        <input type="text" class="glass-input" v-model="form.name" required>
                      </div>
                    </div>
                    
                    <div class="form-group mt-4">
                      <label class="premium-label">Mô tả nhiệm vụ</label>
                      <div class="glass-input-group textarea-group">
                        <textarea class="glass-input" rows="4" v-model="form.description"></textarea>
                      </div>
                    </div>

                    <div class="form-group mt-5">
                       <label class="premium-label mb-3">Trạng thái khối/phòng ban</label>
                       <div class="glass-status-toggle">
                          <label class="status-option" :class="{ 'active': form.isActive }">
                             <input type="radio" class="d-none" :value="true" v-model="form.isActive">
                             <span class="status-dot success"></span> Hoạt động
                          </label>
                          <label class="status-option" :class="{ 'active': !form.isActive }">
                             <input type="radio" class="d-none" :value="false" v-model="form.isActive">
                             <span class="status-dot danger"></span> Đã khóa/Ngừng
                          </label>
                       </div>
                    </div>

                    <div class="glass-meta-info mt-4">
                       <div class="meta-col"> 
                         <span class="meta-label">Ngày tạo:</span> 
                         <span class="meta-val">{{ form.createdAt ? new Date(form.createdAt).toLocaleString('vi-VN') : '---' }}</span> 
                       </div>
                       <div class="meta-col"> 
                         <span class="meta-label">Cập nhật lần cuối:</span> 
                         <span class="meta-val">{{ form.updatedAt ? new Date(form.updatedAt).toLocaleString('vi-VN') : '---' }}</span> 
                       </div>
                    </div>
                  </div>

                  <div class="col-lg-6 border-start-glass pl-lg-4">
                    <div class="glass-assignment-box">
                      <h6 class="ca-title">
                        <BookOpen :size="16" class="me-2" style="width: 16px; height: 16px; min-width: 16px;"/> 
                        Lộ trình học tập áp dụng
                      </h6>
                      <p class="ca-desc mb-3">Chọn các khung đào tạo. Bất kỳ nhân sự nào thuộc bộ phận này sẽ tự động được ghi danh vào tất cả khóa học của lộ trình được chọn.</p>
                      
                      <div v-if="courseGroups.length === 0" class="text-muted fs-14 italic text-center py-4">
                         Chưa có khung lộ trình nào trong hệ thống.
                      </div>

                      <div v-else class="course-groups-grid custom-scrollbar">
                         <div v-for="cg in courseGroups" :key="cg.id" 
                              class="cg-select-card glass-hover"
                              :class="{ 'selected': form.selectedCourseGroupIds.includes(cg.id) }"
                              @click="toggleCourseGroup(cg.id)">
                            
                            <div class="cg-check-indicator">
                               <Check v-if="form.selectedCourseGroupIds.includes(cg.id)" :size="14" />
                            </div>
                            
                            <div class="cg-info">
                               <h6 class="cg-name">{{ cg.name }}</h6>
                               <span class="cg-count badge-glass fs-11 mt-1">{{ cg.courseCount || 0 }} khóa học</span>
                            </div>
                         </div>
                      </div>
                    </div>
                  </div>

                  <div class="col-12 mt-5 form-footer-glass">
                    <div class="d-flex justify-content-end w-100">
                      <button type="submit" class="btn-submit" :disabled="isSubmitting">
                        <Loader2 v-if="isSubmitting" :size="18" class="spinner-icon me-2" style="width: 18px; height: 18px; min-width: 18px;" />
                        <Save v-else :size="18" class="me-2" style="width: 18px; height: 18px; min-width: 18px;" /> 
                        <span>Cập nhật & Lưu thay đổi</span>
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            <div v-show="activeTab === 'members'" class="fade-in">
              <div class="row g-4">
                 <div class="col-xl-4 col-lg-5">
                    <div class="glass-add-member-box">
                       <label class="premium-label text-primary mb-3 d-flex align-items-center">
                         <UserPlus :size="18" class="me-2" style="width: 18px; height: 18px; min-width: 18px;" /> 
                         Thêm nhân sự trực thuộc
                       </label>
                       
                       <div class="glass-search w-100 mb-3">
                         <Search :size="16" class="animated-icon" style="width: 16px; height: 16px; min-width: 16px;" />
                         <input type="text" class="search-input-premium sm" placeholder="Tìm người muốn gán..." v-model="userSearch">
                       </div>
                       
                       <div class="glass-user-list custom-scrollbar">
                         <div v-if="availableUsers.length === 0" class="empty-list-text text-muted text-center py-4">
                           Không có nhân viên ngoài nhóm.
                         </div>
                         
                         <label v-for="u in availableUsers" :key="u.id" class="glass-user-item">
                           <input type="checkbox" :value="u.id" v-model="selectedUserIds" class="user-checkbox">
                           <img :src="getAvatar(u.fullName)" class="user-avatar" />
                           <div class="user-info w-100 overflow-hidden">
                             <div class="user-name text-truncate">{{ u.fullName }}</div>
                             <div class="user-email text-truncate">{{ u.email }}</div>
                           </div>
                         </label>
                       </div>
                       
                       <button class="btn-submit w-100 mt-4 justify-content-center" @click="addSelectedMembers" :disabled="selectedUserIds.length === 0 || isSubmitting">
                         <Loader2 v-if="isSubmitting" :size="18" class="spinner-icon me-2" style="width: 18px; height: 18px; min-width: 18px;" />
                         <UserPlus v-else :size="18" class="me-2" style="width: 18px; height: 18px; min-width: 18px;" />
                         <span>Thêm {{ selectedUserIds.length > 0 ? selectedUserIds.length : '' }} thành viên</span>
                       </button>
                    </div>
                 </div>

                 <div class="col-xl-8 col-lg-7 d-flex flex-column">
                    <div class="glass-section-header px-0 border-0 mb-3 bg-transparent">
                       <div class="badge-group mb-2 mb-sm-0">
                          <span class="badge-glass primary">Tất cả: {{ memberStats.total }}</span>
                          <span class="badge-glass success">Hoàn thành: {{ memberStats.done }}</span>
                       </div>
                       <div class="glass-search inline">
                          <Search :size="16" class="animated-icon" style="width: 16px; height: 16px; min-width: 16px;" />
                          <input type="text" class="search-input-premium sm" placeholder="Tìm trong nhóm..." v-model="memberSearch">
                       </div>
                    </div>

                    <div class="table-container custom-scrollbar px-0">
                       <table class="glass-table custom-table mb-0 mt-0">
                          <thead>
                            <tr>
                              <th width="60" class="text-center">STT</th>
                              <th>Tên Nhân sự</th>
                              <th width="25%">Tiến độ tổng</th>
                              <th width="80" class="text-center">Gỡ</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr v-if="filteredMembers.length === 0">
                              <td colspan="4" class="text-center py-5 text-muted h-100">Không có nhân sự nào khớp bộ lọc.</td>
                            </tr>
                            <tr v-for="(m, idx) in filteredMembers" :key="m.userId">
                              <td class="text-center index-col">{{ idx + 1 }}</td>
                              <td>
                                <div class="d-flex align-items-center gap-3">
                                  <img :src="getAvatar(m.fullName)" class="avatar-glass" width="40" height="40" />
                                  <div class="user-info w-100">
                                    <div class="user-name text-dark">{{ m.fullName }}</div>
                                    <div class="user-email text-muted">{{ m.email }}</div>
                                    <div class="user-date mt-1 text-tertiary fs-11 d-flex align-items-center">
                                      <CalendarCheck :size="10" class="me-1"/>Ngày vào nhóm: {{ m.addedAt ? new Date(m.addedAt).toLocaleDateString('vi-VN') : '---' }}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td>
                                 <div class="d-flex justify-content-between align-items-center mb-1">
                                    <span class="fs-12 fw-bold text-primary">0%</span>
                                    <span class="status-pill offline-pill py-1 px-2 fs-10">Đang học</span>
                                 </div>
                                 <div class="progress-glass">
                                    <div class="progress-bar-fill" style="width: 0%;"></div>
                                 </div>
                              </td>
                              <td class="text-center pe-3">
                                <button class="btn-ghost-icon delete" @click="removeMember(m.userId, m.fullName)" title="Gỡ khỏi nhóm">
                                  <Trash2 :size="16" />
                                </button>
                              </td>
                            </tr>
                          </tbody>
                       </table>
                    </div>
                 </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Copy toàn bộ CSS cũ của bạn ở đây */
.edit-department-page { padding-bottom: var(--space-2xl); color: var(--text-primary); box-sizing: border-box; animation: fadeIn 0.4s ease-out; margin: 0 auto; max-width: 1280px; }
.fade-in { animation: fadeIn 0.3s ease-in-out; }

/* ===== Premium Header ===== */
.page-header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 30px; margin-bottom: 20px; flex-wrap: wrap; gap: var(--space-lg); border-bottom: 1px solid rgba(0,0,0,0.05); }
.header-content { display: flex; align-items: flex-start; gap: var(--space-xl); }
.header-icon-box { width: 64px; height: 64px; border-radius: 20px; background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(99, 102, 241, 0.05)); color: var(--primary-500); display: flex; align-items: center; justify-content: center; border: 1px solid rgba(99, 102, 241, 0.2); box-shadow: 0 8px 20px rgba(99, 102, 241, 0.15); flex-shrink: 0; }
.pulse-glow { animation: pulse-border 3s ease-in-out infinite; }
@keyframes pulse-border { 0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.2); } 50% { box-shadow: 0 0 0 15px rgba(99, 102, 241, 0); } 100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); } }

.id-badge { display: inline-block; padding: 4px 12px; background: rgba(99, 102, 241, 0.1); color: var(--primary-600); border-radius: var(--radius-full); font-size: 11px; font-weight: 700; margin-bottom: 8px; border: 1px solid rgba(99, 102, 241, 0.2); letter-spacing: 0.05em; }
.page-title-gradient { font-size: 32px; font-weight: 800; letter-spacing: -0.02em; background: linear-gradient(90deg, var(--text-primary), var(--text-secondary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 4px; margin-top: 0; }
.page-desc { font-size: var(--font-size-base); color: var(--text-secondary); max-width: 600px; line-height: 1.5; margin: 0; }

.btn { display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; border-radius: var(--radius-full); font-weight: 600; font-size: 14px; cursor: pointer; transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); border: none; }
.btn-outline { background: transparent; color: var(--text-secondary); border: 1px solid var(--border-color); }
.btn-outline:hover { background: white; color: var(--text-primary); border-color: var(--text-tertiary); transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }

/* ===== Glass Stats Grid ===== */
.stats-glass-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 24px; }
.glass-stat-card { position: relative; padding: 20px 24px; border-radius: var(--radius-2xl); display: flex; align-items: center; overflow: hidden; transition: transform 0.3s ease, box-shadow 0.3s ease; background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(10px); border: 1px solid rgba(0, 0, 0, 0.05); box-shadow: 0 4px 15px rgba(0,0,0,0.02); }
.glass-stat-card:hover { transform: translateY(-4px); box-shadow: 0 12px 25px rgba(0,0,0,0.06); }
.glass-stat-card.primary { border-bottom: 3px solid var(--primary-500); }
.glass-stat-card.success { border-bottom: 3px solid var(--success-500); }
.glass-stat-card.info { border-bottom: 3px solid var(--info-500); }
.glass-stat-card.warning { border-bottom: 3px solid var(--warning-500); }

.stat-icon-wrap { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-right: 16px; z-index: 2; flex-shrink: 0;}
.glass-stat-card.primary .stat-icon-wrap { background: var(--primary-50); color: var(--primary-600); }
.glass-stat-card.success .stat-icon-wrap { background: var(--success-50); color: var(--success-600); }
.glass-stat-card.info .stat-icon-wrap { background: var(--info-50); color: var(--info-600); }
.glass-stat-card.warning .stat-icon-wrap { background: var(--warning-50); color: var(--warning-600); }

.stat-info { z-index: 2; flex: 1; }
.stat-label { margin: 0 0 4px 0; font-size: 11px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em; color: var(--text-secondary); }
.stat-value { margin: 0; font-size: 24px; font-weight: 800; color: var(--text-primary); }

/* ===== Glass Content Card ===== */
.glass-content-card { background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(20px); border: 1px solid rgba(0, 0, 0, 0.05); border-radius: var(--radius-2xl); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.03); overflow: hidden; }

/* Tabs Nav */
.tabs-glass-nav { display: flex; gap: 8px; padding: 12px 24px; border-bottom: 1px solid rgba(0,0,0,0.05); background: rgba(249, 250, 251, 0.5); overflow-x: auto; scrollbar-width: thin; }
.tab-glass-btn { display: flex; align-items: center; padding: 10px 20px; background: transparent; color: var(--text-tertiary); border: none; border-radius: var(--radius-full); font-weight: 600; font-size: 14px; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
.tab-glass-btn:hover:not(.active) { background: rgba(0,0,0,0.03); color: var(--text-primary); }
.tab-glass-btn.active { background: white; color: var(--primary-600); box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid rgba(0,0,0,0.05); font-weight: 700; }
.tab-badge { background: rgba(0,0,0,0.05); color: var(--text-primary); padding: 2px 8px; border-radius: var(--radius-full); font-size: 11px; }
.tab-glass-btn.active .tab-badge { background: var(--primary-50); color: var(--primary-700); }

.glass-card-body { padding: 32px; }

/* Section Title */
.premium-section-title { display: flex; align-items: center; margin: 0 0 24px 0; font-size: 14px; font-weight: 700; text-transform: uppercase; color: var(--text-primary); letter-spacing: 0.05em; border-bottom: 1px solid rgba(0,0,0,0.05); padding-bottom: 12px; }
.premium-label { font-weight: 700; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary); display: block; margin-bottom: 8px; }

/* Form Inputs */
.form-group { margin-bottom: 20px; }
.glass-input-group { position: relative; display: flex; align-items: center; background: rgba(249, 250, 251, 0.5); border-radius: 12px; border: 1px solid rgba(0, 0, 0, 0.06); transition: all 0.3s; }
.glass-input-group:focus-within { background: #ffffff; border-color: var(--primary-400); box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1); }
.glass-input { width: 100%; padding: 12px 16px; background: transparent; border: none; border-radius: 12px; color: var(--text-primary); font-size: 14px; font-family: inherit; line-height: 1.5; outline: none; z-index: 1; resize: none; }

/* Status Toggle (Glass) */
.glass-status-toggle { display: flex; gap: 12px; flex-wrap: wrap; background: rgba(249,250,251,0.5); padding: 6px; border-radius: 16px; border: 1px solid rgba(0,0,0,0.05); }
.status-option { flex: 1; display: flex; align-items: center; justify-content: center; padding: 10px; border-radius: 12px; color: var(--text-tertiary); font-weight: 600; font-size: 13px; cursor: pointer; transition: all 0.2s; border: 1px solid transparent; }
.status-option:hover { color: var(--text-primary); }
.status-dot { width: 8px; height: 8px; border-radius: 50%; margin-right: 8px; background: var(--text-tertiary); transition: all 0.3s; }
.status-option.active { background: white; color: var(--text-primary); box-shadow: 0 2px 8px rgba(0,0,0,0.05); border-color: rgba(0,0,0,0.05); }
.status-option.active .status-dot.success { background: var(--success-500); box-shadow: 0 0 8px rgba(16, 185, 129, 0.4); }
.status-option.active .status-dot.danger { background: var(--danger-500); box-shadow: 0 0 8px rgba(239, 68, 68, 0.4); }

/* Meta Info Glass */
.glass-meta-info { display: flex; gap: 24px; padding: 16px 20px; background: rgba(0,0,0,0.02); border-radius: 12px; border: 1px dashed rgba(0,0,0,0.1); }
.meta-col { display: flex; flex-direction: column; gap: 4px; }
.meta-label { font-size: 11px; color: var(--text-tertiary); font-weight: 600; text-transform: uppercase; }
.meta-val { font-size: 13px; color: var(--text-primary); font-weight: 600; }

/* Course Groups Grid UI (Bản sao từ AddDepartment) */
.glass-assignment-box { background: rgba(99, 102, 241, 0.03); padding: 24px; border-radius: var(--radius-2xl); border: 1px solid rgba(99, 102, 241, 0.1); height: 100%; display: flex; flex-direction: column; }
.ca-title { margin: 0 0 12px 0; font-size: 14px; font-weight: 700; color: var(--primary-700); display: flex; align-items: center; text-transform: uppercase; letter-spacing: 0.05em; }
.ca-desc { font-size: 13px; color: var(--primary-600); opacity: 0.8; margin-bottom: 20px; line-height: 1.5; }
.border-start-glass { border-left: 1px dashed rgba(0,0,0,0.1); }

.course-groups-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
  padding-right: 8px;
}

.cg-select-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(249, 250, 251, 0.6);
  border: 1px solid rgba(0,0,0,0.06);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.cg-select-card:hover {
  background: #ffffff;
  border-color: rgba(99, 102, 241, 0.3);
  transform: translateY(-1px);
}

.cg-select-card.selected {
  background: rgba(99, 102, 241, 0.05);
  border-color: var(--primary-500);
}

.cg-check-indicator {
  width: 20px; height: 20px;
  border-radius: 6px;
  border: 1px solid rgba(0,0,0,0.2);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;
  color: white;
}

.cg-select-card.selected .cg-check-indicator {
  background: var(--primary-500);
  border-color: var(--primary-500);
}

.cg-info { flex: 1; display: flex; justify-content: space-between; align-items: center;}
.cg-name { margin: 0; font-size: 14px; font-weight: 600; color: var(--text-primary); }
.badge-glass { display: inline-block; padding: 4px 8px; border-radius: 8px; font-weight: 700; background: rgba(0,0,0,0.05); color: var(--text-secondary); border: 1px solid rgba(0,0,0,0.05); }

/* Bottom Save Row */
.form-footer-glass { padding-top: 24px; border-top: 1px dashed rgba(0,0,0,0.1); }
.btn-submit { display: inline-flex; align-items: center; gap: 8px; height: 44px; padding: 0 28px; background: linear-gradient(135deg, var(--primary-600) 0%, var(--primary-500) 100%); color: white; border: none; border-radius: var(--radius-full); font-weight: 700; font-size: 14px; cursor: pointer; transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); box-shadow: 0 4px 15px rgba(99, 102, 241, 0.2); }
.btn-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4); }
.btn-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; box-shadow: none; }

/* ===== TAB 2: MEMBERS ===== */
.glass-add-member-box { background: rgba(249, 250, 251, 0.8); border-radius: 20px; padding: 20px; border: 1px solid rgba(0,0,0,0.05); }

/* Search Inputs Glass */
.glass-search { display: flex; align-items: center; background: #ffffff; border: 1px solid rgba(0,0,0,0.1); border-radius: var(--radius-full); padding: 4px 16px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02); transition: all 0.3s; }
.glass-search:focus-within { border-color: var(--primary-400); box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1); }
.glass-search.inline { width: 100%; max-width: 280px; }
.animated-icon { color: var(--text-tertiary); transition: color 0.3s; }
.glass-search:focus-within .animated-icon { color: var(--primary-500); }
.search-input-premium { flex: 1; border: none; background: transparent; padding: 10px 8px; font-size: 13px; outline: none; color: var(--text-primary); min-width: 0; }

/* User List Selection */
.glass-user-list { background: white; border-radius: 12px; border: 1px solid rgba(0,0,0,0.05); max-height: 350px; overflow-y: auto; padding: 8px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02); }
.glass-user-item { display: flex; align-items: center; gap: 12px; padding: 8px 12px; border-radius: 8px; cursor: pointer; transition: background 0.2s; }
.glass-user-item:hover { background: rgba(0,0,0,0.03); }
.user-checkbox { width: 16px; height: 16px; cursor: pointer; margin: 0; }
.user-avatar { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; }
.user-info { display: flex; flex-direction: column; }
.user-name { font-weight: 600; font-size: 13px; color: var(--text-primary); }
.user-email { font-size: 11px; color: var(--text-tertiary); }

/* Table Elements */
.glass-section-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
.badge-group { display: flex; gap: 8px; }
.badge-glass.primary { background: rgba(99, 102, 241, 0.1); color: var(--primary-700); }
.badge-glass.success { background: rgba(16, 185, 129, 0.1); color: var(--success-700); }

.table-container { width: 100%; overflow-x: auto; background: white; border: 1px solid rgba(0,0,0,0.05); border-radius: 16px; }
.glass-table { width: 100%; border-collapse: separate; border-spacing: 0; min-width: 600px; }
.glass-table th { text-align: left; padding: 12px 16px; font-size: 11px; font-weight: 700; color: var(--text-tertiary); text-transform: uppercase; border-bottom: 2px solid rgba(0,0,0,0.05); background: rgba(249, 250, 251, 0.5); white-space: nowrap; }
.glass-table td { padding: 12px 16px; border-bottom: 1px solid rgba(0,0,0,0.03); vertical-align: middle; transition: background 0.2s; }
.glass-table tbody tr:hover td { background: rgba(249, 250, 251, 0.8); }

.index-col { font-weight: 700; color: var(--text-tertiary); font-size: 13px; }
.avatar-glass { width: 40px; height: 40px; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.05); border-radius: 50%; object-fit: cover; aspect-ratio: 1/1; flex-shrink: 0; }

/* Progress & Status */
.progress-glass { height: 6px; background: rgba(0,0,0,0.04); border-radius: 10px; overflow: hidden; box-shadow: inset 0 1px 2px rgba(0,0,0,0.02); }
.progress-bar-fill { height: 100%; background: linear-gradient(90deg, var(--info-500), var(--info-400)); border-radius: 10px; transition: width 0.5s ease-out; }
.status-pill { display: inline-flex; align-items: center; justify-content: center; border-radius: 20px; font-weight: 600; text-align: center; }
.offline-pill { background: rgba(0,0,0,0.03); color: var(--text-secondary); border: 1px solid rgba(0,0,0,0.05); }

/* Ghost Buttons */
.btn-ghost-icon { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 50%; background: transparent; border: 1px solid transparent; cursor: pointer; transition: all 0.2s; color: var(--text-tertiary); }
.btn-ghost-icon.delete:hover { color: var(--danger-600); background: rgba(239, 68, 68, 0.1); border-color: rgba(239, 68, 68, 0.2); transform: scale(1.05); }

/* Utilities */
.spinner-icon, .spinner { animation: spin 1s linear infinite; }
.spinner { width: 40px; height: 40px; border: 3px solid var(--primary-100); border-top-color: var(--primary-500); border-radius: 50%; }
@keyframes spin { 100% { transform: rotate(360deg); } }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

/* Scrollbar */
.custom-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; border-radius: 10px;}
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 10px; }

@media (max-width: 1024px) {
  .stats-glass-grid { grid-template-columns: repeat(2, 1fr); }
  .border-start-glass { border-left: none; padding-left: 0 !important; margin-top: 20px; border-top: 1px dashed rgba(0,0,0,0.1); padding-top: 20px; }
}
@media (max-width: 768px) {
  .page-header { flex-direction: column; align-items: stretch; text-align: center; }
  .header-content { flex-direction: column; align-items: center; }
  .header-actions { display: flex; justify-content: center; margin-top: 10px; }
  .stats-glass-grid { grid-template-columns: 1fr; }
  .glass-card-body { padding: 20px; }
  .tabs-glass-nav { padding: 12px 20px; }
}
</style>