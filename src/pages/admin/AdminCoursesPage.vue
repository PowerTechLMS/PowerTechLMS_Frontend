<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import { RouterLink } from "vue-router";
// @ts-ignore
import { courseAPI } from '@/services/api';
import { 
  Plus, Search, Globe, FileText, Archive, Layers, 
  Users, BookOpen, Calendar, 
  Eye, Award, Pencil, Trash2, ChevronRight,
  CheckCircle2, PencilRuler, Info, LayoutGrid,
  MoreVertical, BookCheck, GraduationCap
} from 'lucide-vue-next';
import { toast } from 'vue3-toastify';

// Các state quản lý dữ liệu
const courses = ref<any[]>([]);
const totalStats = ref({ total: 0, published: 0, students: 0 }); // Lưu thống kê tổng từ Server
const isLoading = ref(true);
const searchQuery = ref("");
const currentFilter = ref('All');

// 1. Hàm lấy dữ liệu từ Backend
const fetchCourses = async () => {
  isLoading.value = true;
  try {
    const params: any = { 
      page: 1, 
      pageSize: 50, 
      search: searchQuery.value || null 
    };

    // Truyền filter xuống Backend (Dựa theo biến isPublished = true/false)
    if (currentFilter.value === 'Published') params.isPublished = true;
    if (currentFilter.value === 'Draft') params.isPublished = false;

    const response = await courseAPI.getAll(params);
    courses.value = response.data.items || response.data || [];
    
    // Cập nhật thống kê (Nếu chọn All thì mới đếm tổng)
    if (currentFilter.value === 'All' && !searchQuery.value) {
       totalStats.value = {
         total: response.data.totalCount || courses.value.length,
         published: courses.value.filter(c => c.isPublished).length,
         students: courses.value.reduce((acc, curr) => acc + (curr.enrollmentCount || 0), 0)
       };
    }
  } catch (error) {
    toast.error("Lỗi lấy danh sách khóa học");
  } finally {
    isLoading.value = false;
  }
};

// 2. Hàm format ngày tháng
const formatDate = (dateString: string) => {
  if (!dateString) return 'Chưa cập nhật';
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN');
};

// 3. Hàm chọn Tab Lọc
const setFilter = (status: string) => {
  currentFilter.value = status;
  fetchCourses(); 
};

// 4. Lắng nghe ô tìm kiếm (Dùng Enter để tìm cho nhẹ Server)
const handleSearch = () => {
  fetchCourses();
};

// 5. Hàm Xóa khóa học gọi API
const deleteCourse = async (id: number) => {
  if (confirm("Bạn có chắc chắn muốn xóa khóa học này không? Dữ liệu không thể khôi phục!")) {
    try {
      await courseAPI.delete(id);
      toast.success("Xóa khóa học thành công!");
      fetchCourses();
    } catch (error) {
      toast.error("Đã xảy ra lỗi khi xóa khóa học.");
    }
  }
};

onMounted(() => {
  fetchCourses();
});
</script>

<template>
  <div class="admin-courses-page p-4">
    
    <div class="page-header-premium mb-5">
      <div class="header-inner">
        <div class="header-icon-box pulse-glow">
          <BookOpen :size="32" class="animated-icon" />
        </div>
        <div class="header-info">
          <div class="d-flex align-items-center gap-2 mb-1">
             <span class="badge-glass primary">QUẢN TRỊ</span>
             <span class="breadcrumb-mini"><ChevronRight :size="12" /> Danh lục khóa học</span>
          </div>
          <h1 class="title-gradient">Quản Lý Khóa Học</h1>
          <p class="desc-text">Không gian dành cho Admin phân bổ và kiểm soát chất lượng giáo trình.</p>
        </div>
      </div>
      
      <div class="header-actions">
        <RouterLink to="/admin/courses/new" class="btn-premium-action">
          <Plus :size="20" /> Tạo khóa học mới
        </RouterLink>
      </div>
    </div>

    <div class="stats-grid mb-5">
       <div class="stat-glass-card primary">
          <div class="stat-icon"><LayoutGrid :size="24" /></div>
          <div class="stat-data">
             <span class="label">TỔNG KHÓA HỌC</span>
             <h3 class="value">{{ totalStats.total }}</h3>
          </div>
       </div>
       <div class="stat-glass-card success">
          <div class="stat-icon"><Globe :size="24" /></div>
          <div class="stat-data">
             <span class="label">ĐÃ XUẤT BẢN</span>
             <h3 class="value">{{ totalStats.published }}</h3>
          </div>
       </div>
       <div class="stat-glass-card warning">
          <div class="stat-icon"><Users :size="24" /></div>
          <div class="stat-data">
             <span class="label">TỔNG HỌC VIÊN</span>
             <h3 class="value">{{ totalStats.students.toLocaleString() }}</h3>
          </div>
       </div>
    </div>

    <div class="toolbar-glass-container mb-4">
       <div class="filter-tabs-glass">
          <button @click="setFilter('All')" class="tab-btn" :class="{ active: currentFilter === 'All' }">
             <Layers :size="16" /> Tất cả
          </button>
          <button @click="setFilter('Published')" class="tab-btn" :class="{ active: currentFilter === 'Published' }">
             <Globe :size="16" /> Xuất bản
          </button>
          <button @click="setFilter('Draft')" class="tab-btn" :class="{ active: currentFilter === 'Draft' }">
             <FileText :size="16" /> Bản nháp
          </button>
       </div>
       
       <div class="search-glass-box">
          <Search :size="18" class="search-icon" />
          <input v-model="searchQuery" @keyup.enter="handleSearch" type="text" placeholder="Nhập tên khóa học rồi Enter..." class="search-input">
       </div>
    </div>

    <div class="courses-main-container">
       <div v-if="isLoading" class="loading-box py-5">
          <div class="glass-spinner"></div>
          <p class="mt-3">Đang đồng bộ dữ liệu...</p>
       </div>

       <div v-else-if="courses.length === 0" class="empty-glass-state py-5">
          <div class="empty-icon-wrap mb-4">
             <BookOpen :size="64" />
          </div>
          <h4 class="fw-bold">Chưa có khóa học nào</h4>
          <p class="text-tertiary mb-4">Không tìm thấy dữ liệu phù hợp hoặc chưa có khóa học nào được tạo.</p>
          <RouterLink to="/admin/courses/new" class="btn-create-first">
             <Plus :size="18" /> Thêm khóa học đầu tiên
          </RouterLink>
       </div>

       <div v-else class="course-premium-grid">
          <div v-for="course in courses" :key="course.id" class="course-glass-card">
             <div class="card-image-wrap">
                <img :src="course.coverImageUrl || 'https://placehold.co/600x400/e2e8f0/64748b?text=Course+Cover'" class="card-img" alt="">
                <div class="card-overlay"></div>
                
                <div class="badge-stack">
                   <div class="status-badge" :class="course.isPublished ? 'published' : 'draft-warning'">
                      <CheckCircle2 v-if="course.isPublished" :size="12" />
                      <Info v-else :size="12" /> {{ course.isPublished ? 'ĐÃ XUẤT BẢN' : 'BẢN NHÁP (ẨN)' }}
                   </div>
                   <div class="status-badge mt-1" style="background: rgba(0,0,0,0.6); backdrop-filter: blur(4px);">
                       {{ course.categoryName || 'Chưa phân loại' }}
                   </div>
                </div>

                <button class="btn-card-delete" @click="deleteCourse(course.id)" title="Xóa khóa học">
                   <Trash2 :size="14" />
                </button>
             </div>

             <div class="card-body-content">
                <h3 class="course-title-card" :title="course.title">{{ course.title }}</h3>
                
                <div class="meta-pills-row">
                   <div class="meta-pill-item">
                      <div class="p-icon blue"><Users :size="12" /></div>
                      <div class="p-data">
                         <span class="p-label">Học viên</span>
                         <span class="p-val">{{ course.enrollmentCount || 0 }}</span>
                      </div>
                   </div>
                   <div class="meta-pill-item">
                      <div class="p-icon green"><BookCheck :size="12" /></div>
                      <div class="p-data">
                         <span class="p-label">Bài học</span>
                         <span class="p-val">{{ course.lessonCount || 0 }}</span>
                      </div>
                   </div>
                </div>

                <div class="footer-meta mt-3 pt-3 border-top">
                   <div class="instructor-tag">
                      <div class="i-avatar">{{ course.createdByName?.charAt(0) || 'A' }}</div>
                      <div class="i-info">
                         <span class="i-label">Giảng viên</span>
                         <span class="i-name">{{ course.createdByName || 'Admin' }}</span>
                      </div>
                   </div>
                   <div class="date-tag">
                      <span class="i-label">Ngày tạo</span>
                      <span class="i-name">{{ formatDate(course.createdAt) }}</span>
                   </div>
                </div>
             </div>

             <div class="card-action-bar-tri">
                <RouterLink :to="`/admin/courses/${course.id}/about`" target="_blank" class="act-btn" title="Xem dạng học viên"><Eye :size="18" /></RouterLink>
                <RouterLink :to="`/admin/courses/edit/${course.id}`" class="act-btn" title="Quản lý Chứng chỉ"><Award :size="18" /></RouterLink>
                <RouterLink :to="`/admin/courses/${course.id}edit`" class="act-btn" title="Chỉnh sửa nội dung"><Pencil :size="18" /></RouterLink>
             </div>
          </div>
       </div>
    </div>
  </div>
</template>

<style scoped>
/* Giữ nguyên toàn bộ CSS của bạn ở đây - chỉ thêm 1 class mới */
.admin-courses-page { min-height: 100vh; animation: fadeIn 0.5s ease-out; }

/* Header Styling */
.page-header-premium { display: flex; justify-content: space-between; align-items: center; }
.header-inner { display: flex; align-items: center; gap: 20px; }
.header-icon-box { width: 64px; height: 64px; border-radius: 20px; background: rgba(99, 102, 241, 0.1); color: #6366f1; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(99, 102, 241, 0.2); }
.pulse-glow { animation: pulse 3s infinite; }
@keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(99, 102, 241, 0); } 100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); } }

.title-gradient { font-size: 32px; font-weight: 800; background: linear-gradient(90deg, #1e293b, #64748b); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.desc-text { color: #64748b; margin-top: 4px; }
.badge-glass { padding: 4px 12px; border-radius: 20px; font-size: 10px; font-weight: 800; background: rgba(99, 102, 241, 0.1); color: #6366f1; }
.breadcrumb-mini { font-size: 12px; color: #94a3b8; display: flex; align-items: center; gap: 4px; }

.btn-premium-action { display: flex; align-items: center; gap: 8px; padding: 12px 24px; background: #6366f1; color: white !important; border-radius: 14px; font-weight: 700; text-decoration: none; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.3); }
.btn-premium-action:hover { transform: translateY(-2px); box-shadow: 0 15px 25px -5px rgba(99, 102, 241, 0.4); }

.status-badge.draft-warning {
  background: #64748b; 
  border: 1px solid rgba(255,255,255,0.2);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.course-glass-card:has(.draft-warning) .card-img {
  filter: grayscale(0.5);
  opacity: 0.8;
}

/* Stats Grid */
.stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.stat-glass-card { display: flex; align-items: center; gap: 20px; padding: 24px; border-radius: 24px; background: white; border: 1px solid rgba(0,0,0,0.05); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
.stat-glass-card.primary { background: linear-gradient(135deg, #4f46e5, #6366f1); color: white; }
.stat-glass-card.success { background: linear-gradient(135deg, #059669, #10b981); color: white; }
.stat-glass-card.warning { background: linear-gradient(135deg, #d97706, #f59e0b); color: white; }

.stat-icon { width: 48px; height: 48px; border-radius: 12px; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; }
.stat-data .label { font-size: 10px; font-weight: 800; opacity: 0.8; letter-spacing: 0.05em; }
.stat-data .value { font-size: 28px; font-weight: 800; margin: 0; }

/* Toolbar */
.toolbar-glass-container { display: flex; justify-content: space-between; align-items: center; }
.filter-tabs-glass { display: flex; gap: 6px; background: #f1f5f9; padding: 6px; border-radius: 16px; }
.tab-btn { padding: 8px 20px; font-size: 13px; font-weight: 700; color: #64748b; border: none; background: transparent; border-radius: 11px; display: flex; align-items: center; gap: 8px; transition: all 0.2s; }
.tab-btn.active { background: white; color: #4f46e5; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }

.search-glass-box { display: flex; align-items: center; background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 12px 20px; width: 320px; }
.search-icon { color: #94a3b8; }
.search-input { border: none; outline: none; margin-left: 12px; font-size: 14px; width: 100%; }

/* Grid Cards */
.course-premium-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; }
.course-glass-card { background: white; border-radius: 24px; border: 1px solid rgba(0,0,0,0.05); overflow: hidden; transition: all 0.3s; display: flex; flex-direction: column; }
.course-glass-card:hover { transform: translateY(-5px); box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); }

.card-image-wrap { position: relative; height: 180px; }
.card-img { width: 100%; height: 100%; object-fit: cover; }
.card-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.4), transparent); }

.badge-stack { position: absolute; top: 12px; left: 12px; }
.status-badge { padding: 6px 14px; border-radius: 10px; font-size: 10px; font-weight: 800; display: flex; align-items: center; gap: 6px; color: white; }
.status-badge.published { background: #10b981; }
.status-badge.draft { background: #6366f1; }

.btn-card-delete { position: absolute; top: 12px; right: 12px; background: rgba(255,255,255,0.9); border: none; color: #ef4444; width: 32px; height: 32px; border-radius: 10px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; cursor: pointer; }
.btn-card-delete:hover { background: #ef4444; color: white; }

.card-body-content { padding: 20px; flex: 1; }
.course-title-card { font-size: 18px; font-weight: 800; margin-bottom: 16px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; height: 50px; color: #1e293b; }

.meta-pills-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.meta-pill-item { display: flex; align-items: center; gap: 10px; padding: 10px; background: #f8fafc; border-radius: 14px; }
.p-icon { width: 24px; height: 24px; border-radius: 6px; display: flex; align-items: center; justify-content: center; }
.p-icon.blue { background: rgba(99, 102, 241, 0.1); color: #6366f1; }
.p-icon.green { background: rgba(16, 185, 129, 0.1); color: #10b981; }
.p-label { display: block; font-size: 9px; color: #94a3b8; text-transform: uppercase; font-weight: 800; }
.p-val { font-size: 13px; font-weight: 800; color: #1e293b; }

.footer-meta { display: flex; justify-content: space-between; align-items: center; }
.instructor-tag { display: flex; align-items: center; gap: 8px; }
.i-avatar { width: 28px; height: 28px; border-radius: 50%; background: #e2e8f0; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; color: #64748b; }
.i-label { font-size: 9px; color: #94a3b8; text-transform: uppercase; font-weight: 700; }
.i-name { font-size: 12px; font-weight: 700; color: #475569; display: block; }

.card-action-bar-tri { display: grid; grid-template-columns: repeat(3, 1fr); border-top: 1px solid #f1f5f9; background: #f8fafc; }
.act-btn { height: 48px; border: none; background: transparent; display: flex; align-items: center; justify-content: center; color: #94a3b8; transition: all 0.2s; text-decoration: none; }
.act-btn:hover { color: #4f46e5; background: white; }

/* Empty state */
.empty-glass-state { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
.empty-icon-wrap { background: #f1f5f9; width: 120px; height: 120px; border-radius: 60px; display: flex; align-items: center; justify-content: center; color: #cbd5e1; }
.btn-create-first { padding: 12px 24px; background: #6366f1; color: white; border-radius: 12px; text-decoration: none; font-weight: 700; display: inline-flex; align-items: center; gap: 8px; }

/* Animations */
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

/* Global spinner */
.glass-spinner { margin: 0 auto; width: 40px; height: 40px; border: 4px solid #f1f5f9; border-top-color: #6366f1; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { 100% { transform: rotate(360deg); } }

/* Responsive adjustments */
@media (max-width: 1024px) {
  .stats-grid { grid-template-columns: 1fr; }
  .toolbar-glass-container { flex-direction: column; align-items: stretch; gap: 16px; }
  .search-glass-box { width: 100%; }
}
</style>