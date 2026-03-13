<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
// @ts-ignore
import { documentAPI } from "@/services/api";
import { toast } from "vue3-toastify";
import { 
  Search, FileText, FilePieChart, FileImage, 
  Clock, History, Download, LayoutGrid, List, Filter,
  ChevronRight, FileCode, CheckCircle2, X
} from 'lucide-vue-next';

// --- 1. STATE ---
const documents = ref<any[]>([]);
const loading = ref(true);
const targetDoc = ref<any | null>(null);
const versionHistory = ref<any[]>([]);
const loadingVersions = ref(false);

// State cho Server-side Searching & Filtering
const searchQuery = ref("");
const selectedTag = ref(""); // Dùng để lọc theo hệ thống Tag mới
const viewMode = ref<'grid' | 'list'>('grid');

// Phân trang
const currentPage = ref(1);
const itemsPerPage = ref(20);
const totalRecords = ref(0);

// Danh mục Tag hệ thống (Dùng chung bộ từ điển với Admin)
const predefinedTags = {
  skills: { label: 'Kỹ năng & Chuyên môn', colorClass: 'tag-primary', icon: 'FileText', items: ['JavaScript', 'ASP.NET Core', 'Financial-Analysis', 'ISO-9001', 'Leadership', 'Conflict-Resolution'] },
  compliance: { label: 'Tuân thủ & Pháp lý', colorClass: 'tag-danger', icon: 'CheckCircle2', items: ['PCCC', 'HSE', 'Data-Privacy', 'GDPR', 'Cyber-Security', 'Code-of-Conduct'] },
  roles: { label: 'Đối tượng & Phòng ban', colorClass: 'tag-warning', icon: 'Users', items: ['Sales', 'Engineering', 'Human-Resources', 'Customer-Success', 'Intern', 'Senior', 'C-Suite'] }
};

// --- 2. DATA FETCHING (SERVER-SIDE) ---
const fetchDocs = async () => {
  loading.value = true;
  try {
    const params: any = { 
      page: currentPage.value, 
      pageSize: itemsPerPage.value 
    };
    
    if (searchQuery.value) params.search = searchQuery.value;
    if (selectedTag.value) params.tag = selectedTag.value;

    const { data } = await documentAPI.getAll(params);
    documents.value = data.items || [];
    totalRecords.value = data.totalCount || 0;
  } catch (error) {
    toast.error("Không thể tải danh sách tài liệu.");
  } finally {
    loading.value = false;
  }
};

onMounted(fetchDocs);

// --- 3. DEBOUNCE TÌM KIẾM ---
let searchTimeout: any = null;
const handleSearchInput = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    currentPage.value = 1;
    fetchDocs();
  }, 500);
};

// --- 4. FILTERING HANDLERS ---
const filterByTag = (tag: string) => {
  if (selectedTag.value === tag) {
    selectedTag.value = ""; // Click lại để bỏ chọn
  } else {
    selectedTag.value = tag.trim();
  }
  currentPage.value = 1;
  fetchDocs();
};

const clearFilters = () => {
  searchQuery.value = "";
  selectedTag.value = "";
  currentPage.value = 1;
  fetchDocs();
};

// --- 5. STATS COMPUTED ---
const stats = computed(() => {
  // Tính tổng số lượng hiện tại đang hiển thị
  const total = documents.value.length;
  const pdf = documents.value.filter(d => d.fileName?.toLowerCase().endsWith('.pdf')).length;
  const docx = documents.value.filter(d => d.fileName?.toLowerCase().endsWith('.doc') || d.fileName?.toLowerCase().endsWith('.docx')).length;
  const xlsx = documents.value.filter(d => d.fileName?.toLowerCase().endsWith('.xls') || d.fileName?.toLowerCase().endsWith('.xlsx')).length;
  return { total, pdf, docx, xlsx };
});

// --- 6. ACTION HANDLERS ---
const viewDocument = (docId: number) => {
  window.open(documentAPI.getDownloadUrl(docId), '_blank');
};

const openVersionHistory = async (doc: any) => {
  targetDoc.value = doc;
  loadingVersions.value = true;
  
  const modalEl = document.getElementById('versionModal');
  if (modalEl && (window as any).bootstrap) {
      new (window as any).bootstrap.Modal(modalEl).show();
  }

  try {
    const { data } = await documentAPI.getVersions(doc.id);
    versionHistory.value = data || [];
  } catch (error) {
    toast.error("Không thể tải lịch sử phiên bản.");
  } finally {
    loadingVersions.value = false;
  }
};

const downloadVersion = (versionId: number) => {
  window.open(documentAPI.getVersionDownloadUrl(versionId), '_blank');
};

const getFileIcon = (fileName: string) => {
  const ext = fileName?.split('.').pop()?.toLowerCase() || '';
  if (ext === 'pdf') return { icon: FileText, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' };
  if (['docx', 'doc'].includes(ext)) return { icon: FileText, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' };
  if (['xlsx', 'xls'].includes(ext)) return { icon: FilePieChart, color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)' };
  return { icon: FileCode, color: '#64748b', bg: 'rgba(100, 116, 139, 0.1)' };
};
</script>

<template>
  <div class="explorer-container">
    <div class="page-header-premium animate-fade-in mb-5">
      <div class="header-inner">
        <div class="header-icon-box pulse-glow">
          <FileText :size="32" class="animated-icon text-primary" />
        </div>
        <div class="header-info">
          <div class="d-flex align-items-center gap-2 mb-1">
             <span class="badge-glass primary text-primary">KHO LƯU TRỮ</span>
          </div>
          <h1 class="title-gradient">Thư viện Tài Liệu</h1>
          <p class="desc-text">Khám phá và tải xuống các tài nguyên, biểu mẫu và giáo trình nội bộ.</p>
        </div>
      </div>
      <div class="header-actions">
        <div class="view-toggles">
          <button class="toggle-btn" :class="{ active: viewMode === 'grid' }" @click="viewMode = 'grid'"><LayoutGrid :size="18" /></button>
          <button class="toggle-btn" :class="{ active: viewMode === 'list' }" @click="viewMode = 'list'"><List :size="18" /></button>
        </div>
      </div>
    </div>

    <div class="search-bar-row animate-slide-up">
      <div class="search-box glass">
        <Search :size="18" class="search-icon" />
        <input type="text" v-model="searchQuery" @input="handleSearchInput" placeholder="Tìm kiếm tên tài liệu, từ khóa..." />
      </div>
      
      <div v-if="selectedTag" class="active-filter-chip">
         <span class="fs-13 text-tertiary me-2">Đang lọc theo thẻ:</span>
         <span class="badge bg-primary d-inline-flex align-items-center px-3 py-2 rounded-pill">
            #{{ selectedTag }}
            <button @click="clearFilters" class="btn-close btn-close-white ms-2" style="font-size: 0.5rem;"></button>
         </span>
      </div>
    </div>

    <div class="explorer-layout animate-slide-up" style="animation-delay: 0.1s;">
      
      <aside class="explorer-sidebar desktop-only">
        
        <div class="sidebar-section glass mb-4" v-for="(group, key) in predefinedTags" :key="key">
          <h3 class="section-label mb-3">
             <component :is="group.icon" :size="14" /> {{ group.label }}
          </h3>
          <ul class="filter-nav tags-list">
            <li v-for="tag in group.items" :key="tag" 
                :class="{ active: selectedTag === tag }" 
                @click="filterByTag(tag)">
              <div class="d-flex align-items-center w-100">
                 <span class="tag-hash">#</span>
                 <span class="tag-name">{{ tag.replace(/-/g, ' ') }}</span>
              </div>
            </li>
          </ul>
        </div>

        <div class="info-box-mini glass mt-4">
          <h4 class="info-title"><Clock :size="16" /> Cập nhật mới</h4>
          <p>Thư viện được phân quyền tự động dựa trên vị trí công việc của bạn.</p>
        </div>
      </aside>

      <main class="explorer-main">
        <div v-if="loading" class="loading-state">
          <div class="premium-loader"></div>
        </div>

        <div v-else-if="documents.length" :class="['doc-display-wrapper', viewMode]">
          <div v-for="doc in documents" :key="doc.id" class="doc-card glass-hover animate-fade-in">
            <div class="doc-card-top">
              <div class="doc-type-icon" :style="{ backgroundColor: getFileIcon(doc.fileName).bg, color: getFileIcon(doc.fileName).color }">
                <component :is="getFileIcon(doc.fileName).icon" :size="24" />
              </div>
              <div class="doc-badge">v{{ doc.currentVersionNumber }}.0</div>
            </div>
            
            <div class="doc-card-body">
              <h3 class="doc-title" @click="viewDocument(doc.id)" :title="doc.title">{{ doc.title }}</h3>
              <p class="doc-desc">{{ doc.description || 'Không có mô tả cho tài liệu này.' }}</p>
              
              <div class="doc-tags" v-if="doc.tags">
                <span v-for="tag in doc.tags.split(',')" :key="tag" class="tag-chip" @click.stop="filterByTag(tag.trim())">
                   #{{ tag.trim() }}
                </span>
              </div>
            </div>

            <div class="doc-card-footer">
              <div class="doc-meta">
                <span class="meta-item"><Download :size="12" /> {{ (doc.fileSize / 1024).toFixed(1) }} KB</span>
                <span class="meta-item"><Clock :size="12" /> {{ new Date(doc.createdAt).toLocaleDateString('vi-VN') }}</span>
              </div>
              <div class="doc-actions">
                <button class="action-btn" @click="viewDocument(doc.id)" title="Tải về"><Download :size="16" /></button>
                <button class="action-btn" @click="openVersionHistory(doc)" title="Lịch sử"><History :size="16" /></button>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="empty-explorer glass">
          <Search :size="48" class="empty-icon" />
          <h3>Không tìm thấy tài liệu</h3>
          <p>Bạn chưa được cấp quyền truy cập tài liệu này hoặc từ khóa không chính xác.</p>
          <button class="btn btn-secondary btn-sm mt-3" @click="clearFilters">Xóa bộ lọc</button>
        </div>
      </main>
    </div>

    <div class="modal fade" id="versionModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-md modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg premium-modal">
          <div class="modal-header border-0 pb-0">
            <h5 class="modal-title fw-bold">Lịch sử Phiên bản</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div v-if="targetDoc" class="target-doc-info mb-4">
              <h6 class="text-primary fw-bold">{{ targetDoc.title }}</h6>
              <p class="text-muted fs-12">Danh sách các phiên bản đã được cập nhật</p>
            </div>

            <div v-if="loadingVersions" class="text-center py-5">
              <div class="premium-loader mx-auto"></div>
            </div>

            <div v-else class="timeline">
              <div v-for="v in versionHistory" :key="v.id" class="timeline-item" :class="{ active: v.versionNumber === targetDoc?.currentVersionNumber }">
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                  <div class="content-top">
                    <span class="version-tag">v{{ v.versionNumber }}.0</span>
                    <span class="version-date">{{ new Date(v.createdAt).toLocaleDateString('vi-VN') }}</span>
                  </div>
                  <h4 class="version-filename">{{ v.fileName }}</h4>
                  <p class="version-note">{{ v.changeNote || 'Phiên bản gốc của tài liệu' }}</p>
                  <button class="btn-download-mini" @click="downloadVersion(v.id)">
                    <Download :size="14" /> Tải phiên bản này
                  </button>
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
.explorer-container { padding: 2rem; max-width: var(--content-max-width); margin: 0 auto; }

/* Premium Header */
.page-header-premium { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px;}
.header-inner { display: flex; align-items: center; gap: 20px; }
.header-icon-box { width: 64px; height: 64px; border-radius: 20px; background: rgba(79, 70, 229, 0.1); color: #4f46e5; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(79, 70, 229, 0.2); }
.pulse-glow { animation: pulse 3s infinite; }
@keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(79, 70, 229, 0); } 100% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0); } }
.title-gradient { font-size: 32px; font-weight: 900; background: linear-gradient(90deg, #1e293b, #4f46e5); background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0; letter-spacing: -0.5px; }
.desc-text { color: #64748b; margin-top: 4px; font-weight: 500; font-size: 15px; }

.badge-glass { padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 800; letter-spacing: 0.5px; display: inline-flex; align-items: center; border: 1px solid transparent; }
.badge-glass.primary { background: rgba(99, 102, 241, 0.1); color: #4f46e5; border-color: rgba(99, 102, 241, 0.2); }

.view-toggles { display: flex; background: var(--bg-tertiary); padding: 4px; border-radius: 10px; border: 1px solid var(--border-color); }
.toggle-btn { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: 8px; color: var(--text-secondary); background: transparent; transition: all 0.2s; border: none;}
.toggle-btn.active { background: white; color: var(--primary-500); box-shadow: var(--shadow-sm); }

/* Search Row */
.search-bar-row { display: flex; flex-wrap: wrap; gap: 1.5rem; margin-bottom: 2.5rem; align-items: center; }
.search-box { flex-grow: 1; display: flex; align-items: center; padding: 0.75rem 1.25rem; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 14px; max-width: 500px; transition: all 0.3s; }
.search-box:focus-within { border-color: var(--primary-400); box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1); }
.search-icon { color: var(--text-tertiary); margin-right: 0.75rem; }
.search-box input { border: none; background: transparent; outline: none; width: 100%; color: var(--text-primary); font-size: 0.95rem; }
.active-filter-chip { animation: fadeIn 0.3s ease-out; }

/* Explorer Layout */
.explorer-layout { display: grid; grid-template-columns: 280px 1fr; gap: 2.5rem; }
@media (max-width: 900px) { .explorer-layout { grid-template-columns: 1fr; } }

/* Sidebar Tags */
.sidebar-section { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 18px; padding: 1.25rem; }
.section-label { font-size: 0.75rem; font-weight: 700; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 0.5rem; }

.filter-nav { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.25rem; }
.filter-nav.tags-list li { padding: 0.5rem 1rem; border-radius: 10px; cursor: pointer; color: var(--text-secondary); font-size: 0.85rem; font-weight: 600; transition: all 0.2s; }
.filter-nav.tags-list li:hover { background: rgba(var(--primary-rgb), 0.04); color: var(--text-primary); transform: translateX(4px); }
.filter-nav.tags-list li.active { background: var(--primary-500); color: white; box-shadow: 0 4px 10px rgba(99,102,241,0.2); }
.tag-hash { opacity: 0.5; margin-right: 6px; }

.info-box-mini { padding: 1.5rem; border-radius: 18px; background: var(--bg-card); border: 1px solid var(--border-color); border-left: 4px solid var(--primary-500); }
.info-title { font-size: 0.9rem; font-weight: 700; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem; color: var(--text-primary); }
.info-box-mini p { font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5; margin: 0; }

/* Main Main */
.doc-display-wrapper.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; }
.doc-display-wrapper.list { display: flex; flex-direction: column; gap: 1rem; }

/* Doc Card (Grid) */
.doc-card { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 20px; padding: 1.5rem; display: flex; flex-direction: column; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.doc-card:hover { transform: translateY(-5px); border-color: var(--primary-400); box-shadow: var(--shadow-lg); }

.doc-card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.25rem; }
.doc-type-icon { width: 52px; height: 52px; border-radius: 14px; display: flex; align-items: center; justify-content: center; }
.doc-badge { font-size: 0.7rem; font-weight: 700; background: var(--bg-tertiary); color: var(--text-primary); padding: 0.25rem 0.6rem; border-radius: 6px; border: 1px solid var(--border-color); }

.doc-card-body { flex-grow: 1; }
.doc-title { font-size: 1.1rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.5rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.4; cursor: pointer; transition: color 0.2s;}
.doc-title:hover { color: var(--primary-500); }
.doc-desc { font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.5; }

.doc-tags { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-top: 0.5rem; }
.tag-chip { font-size: 0.725rem; font-weight: 600; color: var(--primary-600); background: rgba(var(--primary-rgb), 0.08); padding: 0.2rem 0.6rem; border-radius: 6px; cursor: pointer; transition: all 0.2s;}
.tag-chip:hover { background: var(--primary-500); color: white; }

.doc-card-footer { margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; }
.doc-meta { display: flex; flex-direction: column; gap: 0.25rem; }
.meta-item { font-size: 0.75rem; color: var(--text-tertiary); display: flex; align-items: center; gap: 0.35rem; }

.doc-actions { display: flex; gap: 0.5rem; }
.action-btn { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; background: var(--bg-tertiary); color: var(--text-secondary); transition: all 0.2s; border: none; }
.action-btn:hover { background: var(--primary-500); color: white; transform: scale(1.1); }

/* List Mode tweaks */
.list .doc-card { flex-direction: row; align-items: center; padding: 1rem 1.5rem; }
.list .doc-card-top { margin-bottom: 0; margin-right: 1.5rem; }
.list .doc-card-footer { margin-top: 0; padding-top: 0; border-top: none; margin-left: auto; flex-direction: row; gap: 2rem; }
.list .doc-meta { flex-direction: row; gap: 1rem; }
.list .doc-desc { display: none; }

/* Timeline Modal */
.premium-modal { border-radius: 24px; background: var(--bg-primary); }
.timeline { position: relative; padding-left: 2rem; }
.timeline::before { content: ""; position: absolute; left: 3px; top: 0; bottom: 0; width: 2px; background: var(--border-color); }
.timeline-item { position: relative; margin-bottom: 2rem; }
.timeline-item:last-child { margin-bottom: 0; }
.timeline-dot { position: absolute; left: -29px; top: 4px; width: 12px; height: 12px; border-radius: 50%; background: white; border: 3px solid var(--border-color); z-index: 1; }
.timeline-item.active .timeline-dot { border-color: var(--primary-500); background: var(--primary-500); }
.timeline-content { background: var(--bg-card); border: 1px solid var(--border-color); padding: 1.25rem; border-radius: 16px; transition: all 0.2s; }
.timeline-item.active .timeline-content { border-color: var(--primary-400); background: rgba(var(--primary-rgb), 0.02); }
.content-top { display: flex; gap: 1rem; align-items: center; margin-bottom: 0.5rem; }
.version-tag { font-size: 0.7rem; font-weight: 700; color: var(--primary-500); background: rgba(var(--primary-rgb), 0.1); padding: 0.2rem 0.5rem; border-radius: 4px; }
.version-date { font-size: 0.75rem; color: var(--text-tertiary); }
.version-filename { font-size: 0.95rem; font-weight: 600; color: var(--text-primary); margin-bottom: 0.25rem; }
.version-note { font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5; margin-bottom: 1rem; }
.btn-download-mini { background: transparent; border: 1px solid var(--border-color); color: var(--text-secondary); font-size: 0.75rem; font-weight: 600; padding: 0.4rem 0.8rem; border-radius: 8px; display: flex; align-items: center; gap: 0.4rem; transition: all 0.2s; }
.btn-download-mini:hover { background: var(--bg-tertiary); color: var(--text-primary); border-color: var(--text-tertiary); }

/* Utils */
.empty-explorer { text-align: center; padding: 5rem 2rem; border-radius: 20px; color: var(--text-secondary); }
.empty-icon { opacity: 0.2; margin-bottom: 1.5rem; }
.loading-state { height: 50vh; display: flex; align-items: center; justify-content: center; }
.animate-fade-in { animation: fadeIn 0.8s ease-out forwards; }
.animate-slide-up { animation: slideInUp 0.6s ease-out forwards; }
@keyframes slideInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.premium-loader { width: 40px; height: 40px; border: 3px solid var(--border-color); border-top-color: var(--primary-500); border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 768px) {
  .desktop-only { display: none; }
  .search-bar-row { flex-direction: column; align-items: stretch; }
}
</style>
