<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
// @ts-ignore
import { userGroupAPI, courseGroupAPI, enrollmentAPI } from "@/services/api"; 
import { toast } from "vue3-toastify";
import { 
  Building2, ArrowLeft, Users, BarChart3, CheckCircle, Clock, 
  Pencil, Search, Calendar, Info, LineChart, BookOpen
} from "lucide-vue-next";

const router = useRouter();
const route = useRoute();
const deptId = Number(route.params.id);

// --- 1. STATE ---
const department = ref<any>(null);
const allCourseGroups = ref<any[]>([]);
const memberProgresses = ref<any>({}); // State lưu tiến độ của từng nhân viên
const loading = ref(true);
const searchQuery = ref("");

// Pagination for members
const currentPage = ref(1);
const itemsPerPage = ref(10);

// --- 2. DATA FETCHING ---
const fetchDetails = async () => {
  loading.value = true;
  try {
    // Tải song song Chi tiết phòng ban và Danh sách Khung lộ trình
    const [deptRes, cgRes] = await Promise.all([
      userGroupAPI.getById(deptId),
      courseGroupAPI.getAll({ pageSize: 100 }).catch(() => ({ data: { items: [] } }))
    ]);

    department.value = deptRes.data;
    allCourseGroups.value = cgRes.data.items || cgRes.data;

    // --- TÍNH TOÁN TIẾN ĐỘ ---
    // Gọi API lấy toàn bộ Enrollment của hệ thống để quét tiến độ
    const enrollRes = await enrollmentAPI.getAll({ pageSize: 5000 }).catch(() => ({ data: { items: [] } }));
    const allEnrollments = enrollRes.data.items || enrollRes.data;

    const progressMap: any = {};
    
    // Khởi tạo map cho tất cả members
    if (department.value.members) {
      department.value.members.forEach((m: any) => {
        // Lọc các khóa học của user này
        const userCourses = allEnrollments.filter((e: any) => e.userId === m.userId);
        
        let avgProgress = 0;
        let status = 'Chưa bắt đầu';
        
        if (userCourses.length > 0) {
            // Tính trung bình tiến độ các khóa học
            const totalProgress = userCourses.reduce((sum: number, course: any) => sum + (course.progressPercent || 0), 0);
            avgProgress = totalProgress / userCourses.length;
            
            if (avgProgress === 100) status = 'Hoàn thành';
            else if (avgProgress > 0) status = 'Đang học';
        }

        progressMap[m.userId] = {
           avgProgress: Math.round(avgProgress),
           status: status,
           totalAssigned: userCourses.length
        };
      });
    }
    memberProgresses.value = progressMap;

  } catch (error) {
    console.error("LỖI CHI TIẾT:", error); // In lỗi ra F12 để xem
    toast.error("Không thể tải thông tin chi tiết phòng ban.");
    // router.push('/admin/departments'); // TẠM THỜI COMMENT DÒNG NÀY LẠI
  } finally {
    loading.value = false;
  }
};

onMounted(fetchDetails);

// --- 3. COMPUTED ---
const members = computed(() => department.value?.members || []);

// Lấy danh sách lộ trình đang áp dụng cho phòng ban này
const assignedCourseGroups = computed(() => {
  if (!department.value || !department.value.courseGroupIds) return [];
  const ids = department.value.courseGroupIds;
  return allCourseGroups.value.filter(cg => ids.includes(cg.id));
});

// Cập nhật Stats tự động dựa trên tiến độ thật
const stats = computed(() => {
  const total = members.value.length;
  if (total === 0) return { total: 0, avgProgress: 0, completed: 0, learning: 0 };

  let sumProgress = 0;
  let completedCount = 0;
  let learningCount = 0;

  Object.values(memberProgresses.value).forEach((p: any) => {
      sumProgress += p.avgProgress;
      if (p.status === 'Hoàn thành') completedCount++;
      if (p.status === 'Đang học') learningCount++;
  });

  return {
    total,
    avgProgress: Math.round(sumProgress / total), 
    completed: completedCount,   
    learning: learningCount 
  };
});

const filteredMembers = computed(() => {
  let result = [...members.value];
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter((m: any) => 
      (m.fullName || '').toLowerCase().includes(q) || 
      (m.email || '').toLowerCase().includes(q)
    );
  }
  return result;
});

const paginatedMembers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return filteredMembers.value.slice(start, start + itemsPerPage.value);
});

const totalPages = computed(() => Math.ceil(filteredMembers.value.length / itemsPerPage.value) || 1);

const handlePageChange = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

const getAvatar = (name: string) => {
   return `https://ui-avatars.com/api/?background=random&color=fff&name=${name ? name.replace(/ /g, "+") : "User"}`;
};

const goBack = () => router.push('/admin/departments');
const goToEdit = () => router.push(`/admin/departments/edit/${deptId}`);
const viewProfile = (id: number) => router.push(`/admin/staff/profile/${id}`);

</script>

<template>
  <div class="departments-page">
    
    <div v-if="loading" class="text-center py-5 loading-state">
       <div class="spinner"></div>
       <p class="mt-3 text-muted fw-medium fs-14">Đang tải báo cáo bộ phận...</p>
    </div>

    <template v-else-if="department">
      
      <div class="page-header">
        <div class="header-content">
          <div class="header-icon-box pulse-glow">
            <Building2 :size="32" style="width: 32px; height: 32px; min-width: 32px;" />
          </div>
          <div>
            <h1 class="page-title-gradient">Tổng quan Phòng ban</h1>
            <p class="page-desc">Báo cáo nhân lực và Tiến độ đào tạo nội bộ.</p>
          </div>
        </div>
        <div class="header-actions">
          <button @click="goBack" class="btn btn-outline">
            <ArrowLeft :size="18" style="width: 18px; height: 18px; min-width: 18px;" />
            <span>Quay lại danh sách</span>
          </button>
        </div>
      </div>

      <div class="row g-4 mb-4 align-items-stretch">
        
        <div class="col-xl-7 col-lg-6">
          <div class="glass-hero-card h-100 position-relative overflow-hidden text-white">
            <div class="glass-bg-accent"></div>
            
            <div class="card-body p-4 p-md-5 d-flex flex-column justify-content-between h-100 z-1 position-relative">
              <div>
                <span class="badge-glass-white mb-3 text-uppercase tracking-wide">
                   <Building2 :size="12" class="me-1 mb-1" style="width: 12px; height: 12px; min-width: 12px;"/> 
                   Cơ cấu tổ chức
                </span>
                <h2 class="fw-bold mb-2">{{ department.name }}</h2>
                <p class="hero-desc">
                   {{ department.description || 'Chưa có mô tả định danh cho bộ phận này.' }}
                </p>

                <div class="assigned-cgs mt-4 pt-4 border-top border-light border-opacity-25">
                   <h6 class="fw-bold mb-3 fs-13 text-white opacity-75 d-flex align-items-center text-uppercase tracking-wide">
                      <BookOpen :size="16" class="me-2" /> Lộ trình đào tạo tự động:
                   </h6>
                   <div v-if="assignedCourseGroups.length === 0" class="fs-13 opacity-50 fst-italic">
                      Chưa gán lộ trình nào.
                   </div>
                   <div v-else class="d-flex flex-wrap gap-2">
                      <span v-for="cg in assignedCourseGroups" :key="cg.id" class="badge-glass-white outline">
                         {{ cg.name }}
                      </span>
                   </div>
                </div>

              </div>

              <div class="hero-metadata mt-4">
                <Info :size="32" class="opacity-75" style="width: 32px; height: 32px; min-width: 32px;" />
                <div>
                  <h6 class="fw-bold mb-1 fs-14">Thông tin quản lý hệ thống</h6>
                  <span class="fs-13 opacity-75 d-block">Mã định danh ID: <strong>#{{ department.id }}</strong> &bull; Tạo ngày: {{ new Date(department.createdAt).toLocaleDateString('vi-VN') }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-xl-5 col-lg-6">
          <div class="row g-3 h-100">
            <div class="col-sm-6">
              <div class="glass-stat-card h-100 p-4 position-relative overflow-hidden">
                <div class="d-flex align-items-center gap-3">
                  <div class="stat-icon-wrapper primary-gradient"><Users :size="24" style="width: 24px; height: 24px; min-width: 24px;"/></div>
                  <div>
                    <h3 class="stat-val">{{ stats.total }}</h3>
                    <p class="stat-label">Nhân sự</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="col-sm-6">
              <div class="glass-stat-card h-100 p-4 position-relative overflow-hidden">
                <div class="d-flex align-items-center gap-3">
                  <div class="stat-icon-wrapper info-gradient"><LineChart :size="24" style="width: 24px; height: 24px; min-width: 24px;"/></div>
                  <div>
                    <h3 class="stat-val">{{ stats.avgProgress }}%</h3>
                    <p class="stat-label">Tiến độ TB</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="col-sm-6">
              <div class="glass-stat-card h-100 p-4 position-relative overflow-hidden">
                <div class="d-flex align-items-center gap-3">
                  <div class="stat-icon-wrapper success-gradient"><CheckCircle :size="24" style="width: 24px; height: 24px; min-width: 24px;"/></div>
                  <div>
                    <h3 class="stat-val">{{ stats.completed }}</h3>
                    <p class="stat-label">Hoàn thành</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="col-sm-6">
              <div class="glass-stat-card h-100 p-4 position-relative overflow-hidden">
                <div class="d-flex align-items-center gap-3">
                  <div class="stat-icon-wrapper warning-gradient"><Clock :size="24" style="width: 24px; height: 24px; min-width: 24px;"/></div>
                  <div>
                    <h3 class="stat-val">{{ stats.learning }}</h3>
                    <p class="stat-label">Đang học</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="content-card glass-card mb-5">
        
        <div class="section-bar glass-section-header">
          <h5 class="bar-title mb-0">
             <Users :size="20" class="title-icon" style="width: 20px; height: 20px; min-width: 20px;" /> 
             <span>Danh sách Nhân viên</span>
             <span class="badge-count">{{ filteredMembers.length }}</span>
          </h5>
          
          <div class="glass-search inline">
            <Search :size="16" class="animated-icon" style="width: 16px; height: 16px; min-width: 16px;" />
            <input 
              v-model="searchQuery" 
              @input="currentPage = 1"
              type="text" 
              class="search-input-premium sm" 
              placeholder="Tìm tên nhân viên..."
            >
          </div>
        </div>

        <div class="table-container custom-scrollbar">
          <table class="glass-table custom-table mb-0">
            <thead>
              <tr>
                <th class="text-center" width="60">STT</th>
                <th>Thông tin Nhân sự</th>
                <th style="width: 30%;">Tiến độ tổng hợp</th>
                <th class="text-center">Trạng thái</th>
                <th class="text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filteredMembers.length === 0">
                <td colspan="5" class="text-center py-5">
                  <div class="empty-state">
                     <Search :size="48" class="empty-icon" style="width: 48px; height: 48px; min-width: 48px;" />
                     <p class="mb-0 fw-medium">Không tìm thấy thành viên nào.</p>
                  </div>
                </td>
              </tr>
              
              <tr v-for="(m, idx) in paginatedMembers" :key="m.userId">
                <td class="text-center index-col">{{ (currentPage - 1) * itemsPerPage + idx + 1 }}</td>
                
                <td>
                  <div class="d-flex align-items-center gap-3">
                    <img :src="getAvatar(m.fullName)" class="rounded-circle avatar-glass" width="42" height="42" />
                    <div class="lh-sm">
                      <div class="fw-bold text-dark fs-14">{{ m.fullName }}</div>
                      <div class="text-muted fs-13 mt-1">{{ m.email }}</div>
                    </div>
                  </div>
                </td>
                
                <td>
                  <div class="d-flex justify-content-between fs-11 fw-bold mb-2">
                     <span :class="memberProgresses[m.userId]?.avgProgress === 100 ? 'text-success' : 'text-primary'">
                        {{ memberProgresses[m.userId]?.avgProgress || 0 }}% 
                        <span class="text-muted fw-normal">({{ memberProgresses[m.userId]?.totalAssigned || 0 }} môn)</span>
                     </span>
                     <span class="text-muted d-flex align-items-center">
                        <Calendar :size="12" class="me-1" style="width: 12px; height: 12px; min-width: 12px;"/> 
                        Tham gia: {{ m.addedAt ? new Date(m.addedAt).toLocaleDateString('vi-VN') : '---' }}
                     </span>
                  </div>
                  <div class="progress-glass">
                    <div class="progress-bar-fill" 
                         :style="{ width: (memberProgresses[m.userId]?.avgProgress || 0) + '%' }"
                         :class="{ 'bg-success': memberProgresses[m.userId]?.avgProgress === 100 }">
                    </div>
                  </div>
                </td>
                
                <td class="text-center">
                  <span class="status-pill" 
                        :class="{
                          'offline-pill': memberProgresses[m.userId]?.status === 'Chưa bắt đầu',
                          'text-primary bg-primary bg-opacity-10 border border-primary border-opacity-25': memberProgresses[m.userId]?.status === 'Đang học',
                          'text-success bg-success bg-opacity-10 border border-success border-opacity-25': memberProgresses[m.userId]?.status === 'Hoàn thành'
                        }">
                     {{ memberProgresses[m.userId]?.status || 'Chưa bắt đầu' }}
                  </span>
                </td>
                
                <td class="text-center pe-3">
                  <button class="btn-ghost-icon view w-auto px-3 py-1 rounded-pill" @click="viewProfile(m.userId)" title="Xem báo cáo cá nhân">
                    <BarChart3 :size="16" style="width: 16px; height: 16px; min-width: 16px;" /> 
                    <span class="ms-1 fw-bold fs-13">Xem</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div v-if="totalPages > 1" class="pagination-container justify-content-center">
           <div class="pagination-controls gap-1">
             <button class="page-nav-btn" :disabled="currentPage === 1" @click="handlePageChange(currentPage - 1)">Trước</button>
             <button v-for="page in totalPages" :key="page" class="page-num-btn" :class="{ active: currentPage === page }" @click="handlePageChange(page)">
               {{ page }}
             </button>
             <button class="page-nav-btn" :disabled="currentPage === totalPages" @click="handlePageChange(currentPage + 1)">Sau</button>
           </div>
        </div>

        <div class="glass-footer">
          <p class="text-muted fs-13 mb-3">Chỉ có quản trị viên mới có quyền thêm/bớt nhân sự trực thuộc bộ phận.</p>
          <button class="btn btn-primary btn-glow" @click="goToEdit">
            <Pencil :size="18" style="width: 18px; height: 18px; min-width: 18px;" /> <span>Quản lý & Chỉnh sửa</span>
          </button>
        </div>
      </div>

    </template>
  </div>
</template>

<style scoped>
/* ===== Typography & Layout ===== */
.departments-page { padding-bottom: var(--space-2xl); color: var(--text-primary); box-sizing: border-box; animation: fadeIn 0.4s ease-out; }

/* ===== Premium Header ===== */
.page-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: var(--space-xl); flex-wrap: wrap; gap: var(--space-lg); }
.header-content { display: flex; align-items: center; gap: var(--space-xl); }
.header-icon-box { width: 64px; height: 64px; border-radius: 20px; background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(99, 102, 241, 0.05)); color: var(--primary-500); display: flex; align-items: center; justify-content: center; border: 1px solid rgba(99, 102, 241, 0.2); box-shadow: 0 8px 20px rgba(99, 102, 241, 0.15); flex-shrink: 0; }
.pulse-glow { animation: pulse-border 3s ease-in-out infinite; }
@keyframes pulse-border { 0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.2); } 50% { box-shadow: 0 0 0 15px rgba(99, 102, 241, 0); } 100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); } }

.page-title-gradient { font-size: 32px; font-weight: 800; letter-spacing: -0.02em; background: linear-gradient(90deg, var(--primary-600), var(--primary-400)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 8px; margin-top: 0; }
.page-desc { font-size: var(--font-size-base); color: var(--text-secondary); max-width: 600px; line-height: 1.5; margin: 0; }

.btn { display: inline-flex; align-items: center; gap: 8px; padding: 12px 24px; border-radius: var(--radius-full); font-weight: 700; font-size: var(--font-size-sm); cursor: pointer; transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); border: none; }
.btn-outline { background: transparent; color: var(--text-secondary); border: 1px solid var(--border-color); }
.btn-outline:hover { background: var(--bg-secondary); color: var(--text-primary); border-color: var(--text-tertiary); transform: translateY(-2px); }
.btn-primary { background: linear-gradient(135deg, var(--primary-600) 0%, var(--primary-500) 100%); color: white; box-shadow: 0 4px 15px rgba(99, 102, 241, 0.2); }
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4); }

/* ===== Hero Widget (Glass) ===== */
.glass-hero-card {
  background: linear-gradient(135deg, var(--primary-600), var(--primary-800));
  border-radius: var(--radius-2xl);
  box-shadow: 0 10px 30px rgba(79, 70, 229, 0.15);
  transition: all 0.4s ease;
}
.glass-hero-card:hover { transform: translateY(-4px); box-shadow: 0 15px 40px rgba(79, 70, 229, 0.25); }
.glass-bg-accent {
  position: absolute; top: -50%; right: -5%; width: 300px; height: 300px;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%);
  border-radius: 50%; z-index: 0; pointer-events: none;
}
.badge-glass-white {
  display: inline-flex; align-items: center; padding: 6px 12px;
  background: rgba(255, 255, 255, 0.15); border: 1px solid rgba(255, 255, 255, 0.2);
  color: white; border-radius: 20px; font-size: 11px; font-weight: 700;
  backdrop-filter: blur(10px);
}
.badge-glass-white.outline {
  background: transparent;
  border: 1px solid rgba(255,255,255,0.4);
  font-size: 12px;
  font-weight: 600;
  padding: 4px 12px;
}
.hero-desc { font-size: 15px; color: rgba(255, 255, 255, 0.8); line-height: 1.5; margin: 0; max-width: 90%; }
.hero-metadata {
  display: inline-flex; align-items: center; gap: 16px; padding: 12px 20px;
  border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.15); backdrop-filter: blur(10px); color: white;
}

/* ===== Glass Stat Cards ===== */
.glass-stat-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: var(--radius-2xl);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.03);
  transition: all 0.3s;
}
.glass-stat-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08); border-color: rgba(99, 102, 241, 0.15); }

.stat-icon-wrapper { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.primary-gradient { background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(96, 165, 250, 0.1)); color: #3b82f6; border: 1px solid rgba(59, 130, 246, 0.2); }
.info-gradient { background: linear-gradient(135deg, rgba(14, 165, 233, 0.15), rgba(56, 189, 248, 0.1)); color: #0ea5e9; border: 1px solid rgba(14, 165, 233, 0.2); }
.success-gradient { background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(52, 211, 153, 0.1)); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.2); }
.warning-gradient { background: linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(251, 191, 36, 0.1)); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.2); }

.stat-val { font-size: 24px; font-weight: 800; color: var(--text-primary); margin: 0; }
.stat-label { font-size: 12px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin: 4px 0 0 0; }

/* ===== Glass Card (Section) ===== */
.glass-card { background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(0, 0, 0, 0.05); border-radius: var(--radius-2xl); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.03); overflow: hidden; }

/* ===== Section Toolbar ===== */
.glass-section-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid rgba(0,0,0,0.05); flex-wrap: wrap; gap: 16px; background: rgba(249, 250, 251, 0.3); }
.bar-title { display: flex; align-items: center; gap: 10px; font-size: 18px; font-weight: 800; color: var(--text-primary); }
.title-icon { color: var(--primary-500); }
.badge-count { background: rgba(0,0,0,0.04); border: 1px solid rgba(0,0,0,0.05); color: var(--text-primary); padding: 4px 10px; border-radius: 20px; font-size: 13px; font-weight: 700; }

/* ===== Glass Search ===== */
.glass-search.inline { display: flex; align-items: center; background: #ffffff; border: 1px solid rgba(0,0,0,0.1); border-radius: var(--radius-full); padding: 4px 16px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02); width: 100%; max-width: 300px; box-sizing: border-box; transition: all 0.3s; }
.glass-search.inline:focus-within { border-color: var(--primary-400); box-shadow: 0 0 0 4px rgba(99,102,241,0.1); }
.animated-icon { color: var(--text-tertiary); transition: color 0.3s; }
.glass-search.inline:focus-within .animated-icon { color: var(--primary-500); }
.search-input-premium.sm { flex: 1; border: none; background: transparent; padding: 10px 8px; font-size: 14px; outline: none; color: var(--text-primary); min-width: 0; }
.search-input-premium::placeholder { color: var(--text-tertiary); }

/* ===== Table Content ===== */
.table-container { width: 100%; overflow-x: auto; padding: 0 24px; }
.glass-table { width: 100%; border-collapse: separate; border-spacing: 0 8px; min-width: 800px; padding-bottom: 16px; margin-top: 8px; }
.glass-table th { text-align: left; padding: 0 16px 16px 16px; font-size: 12px; font-weight: 700; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid rgba(0,0,0,0.05); white-space: nowrap; }
.glass-table td { padding: 16px; background: rgba(249, 250, 251, 0.5); border-top: 1px solid rgba(0,0,0,0.02); border-bottom: 1px solid rgba(0,0,0,0.02); transition: all 0.2s; vertical-align: middle; }
.glass-table td:first-child { border-left: 1px solid rgba(0,0,0,0.02); border-top-left-radius: 16px; border-bottom-left-radius: 16px; }
.glass-table td:last-child { border-right: 1px solid rgba(0,0,0,0.02); border-top-right-radius: 16px; border-bottom-right-radius: 16px; }
.glass-table tbody tr { transition: transform 0.2s, box-shadow 0.2s; }
.glass-table tbody tr:hover td { background: #ffffff; border-color: rgba(99, 102, 241, 0.1); }
.glass-table tbody tr:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.04); }

.index-col { font-weight: 700; color: var(--text-tertiary); font-size: 14px; }
.avatar-glass { border: 2px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }

/* ===== Progress Bar Glass ===== */
.progress-glass { height: 6px; background: rgba(0,0,0,0.04); border-radius: 10px; overflow: hidden; box-shadow: inset 0 1px 2px rgba(0,0,0,0.02); }
.progress-bar-fill { height: 100%; background: linear-gradient(90deg, var(--primary-500), var(--primary-400)); border-radius: 10px; transition: width 0.5s ease-out; }

/* ===== Status Pill ===== */
.status-pill { display: inline-flex; align-items: center; justify-content: center; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; text-align: center; }
.offline-pill { background: rgba(0,0,0,0.03); color: var(--text-secondary); border: 1px solid rgba(0,0,0,0.05); }

/* ===== Ghost Buttons ===== */
.btn-ghost-icon { display: inline-flex; align-items: center; justify-content: center; background: transparent; border: 1px solid transparent; cursor: pointer; transition: all 0.2s; color: var(--text-tertiary); }
.btn-ghost-icon.view:hover { color: var(--primary-600); background: rgba(99, 102, 241, 0.1); border-color: rgba(99, 102, 241, 0.2); transform: translateY(-2px); }

/* ===== Pagination ===== */
.pagination-container { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-top: 1px solid rgba(0,0,0,0.05); background: rgba(249, 250, 251, 0.3); flex-wrap: wrap; gap: 16px; }
.pagination-controls { display: flex; gap: 8px; align-items: center; }
.page-nav-btn, .page-num-btn { min-width: 36px; height: 36px; padding: 0 10px; border-radius: 10px; border: none; font-weight: 600; font-size: 14px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; background: transparent; color: var(--text-secondary); }
.page-nav-btn { background: rgba(0,0,0,0.03); }
.page-nav-btn:not(:disabled):hover { background: rgba(0,0,0,0.08); color: var(--text-primary); }
.page-nav-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.page-num-btn:hover { background: rgba(0,0,0,0.05); color: var(--text-primary); }
.page-num-btn.active { background: var(--primary-500); color: white; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3); }

/* ===== Glass Footer (Admin Panel) ===== */
.glass-footer { padding: 30px 24px; text-align: center; border-top: 1px solid rgba(0,0,0,0.05); background: rgba(249, 250, 251, 0.5); border-bottom-left-radius: inherit; border-bottom-right-radius: inherit; }

/* ===== Loading & Empty ===== */
.loading-state { display: flex; flex-direction: column; align-items: center; }
.spinner { width: 40px; height: 40px; border: 3px solid var(--primary-100); border-top-color: var(--primary-500); border-radius: 50%; animation: spin 1s linear infinite; }
.empty-state { display: flex; flex-direction: column; align-items: center; opacity: 0.6; }

/* SVGs global fix */
.lucide, svg { flex-shrink: 0; }

@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
@keyframes spin { 100% { transform: rotate(360deg); } }

/* Scrollbar */
.custom-scrollbar::-webkit-scrollbar { height: 8px; width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
.custom-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.2); }

@media (max-width: 768px) {
  .page-header { flex-direction: column; align-items: stretch; text-align: center; }
  .header-content { flex-direction: column; }
  .header-actions { display: flex; justify-content: center; margin-top: 12px; }
  .glass-section-header { flex-direction: column; align-items: stretch; }
  .glass-search.inline { max-width: 100%; margin-top: 12px; }
}
</style>