<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
// @ts-ignore
import { courseGroupAPI } from "@/services/api";
import { toast } from "vue3-toastify";
import { Route, ArrowLeft, BookOpen, Layers, CheckCircle2, PlayCircle } from "lucide-vue-next";

const router = useRouter();
const route = useRoute();
const pathId = Number(route.params.id);

const learningPath = ref<any>(null);
const loading = ref(true);

onMounted(async () => {
  try {
    const res = await courseGroupAPI.getById(pathId);
    learningPath.value = res.data;
  } catch (error) {
    toast.error("Không tìm thấy lộ trình");
    router.push('/learning-paths');
  } finally {
    loading.value = false;
  }
});

const goToCourse = (courseId: number) => {
  router.push(`/courses/${courseId}`);
};
</script>

<template>
  <div class="path-detail-page">
    <div v-if="loading" class="text-center py-5">
        <div class="spinner mx-auto mb-3"></div>
        <p class="text-muted fw-bold">Đang vẽ bản đồ học tập...</p>
    </div>

    <template v-else-if="learningPath">
      <div class="page-header mb-4">
        <button @click="router.push('/learning-paths')" class="btn btn-back border-0 px-0">
          <ArrowLeft :size="18" class="me-2" /> Trở lại danh sách lộ trình
        </button>
      </div>

      <div class="glass-hero-card mb-5 p-5 text-white position-relative overflow-hidden shadow-lg">
        <div class="bg-gradient-overlay"></div>
        <div class="watermark-icon">
          <Route :size="240" stroke-width="1" />
        </div>
        
        <div class="position-relative z-1">
          <span class="badge-white-glass mb-3">LEARNING PATH</span>
          <h1 class="fw-bold mb-3 display-6">{{ learningPath.name }}</h1>
          <p class="fs-6 opacity-75 max-w-75 mb-0 lh-lg">{{ learningPath.description || 'Chưa có mô tả chi tiết cho lộ trình này.' }}</p>
        </div>
      </div>

      <h5 class="fw-bold text-dark mb-4 d-flex align-items-center">
        <Layers :size="22" class="text-primary me-2" /> 
        Bản đồ Khóa học <span class="badge bg-light text-primary border ms-2 rounded-pill px-3 py-1 fs-12">{{ learningPath.courses?.length || 0 }} chặng</span>
      </h5>

      <div class="roadmap-container">
        <div v-if="!learningPath.courses || learningPath.courses.length === 0" class="empty-roadmap">
          Lộ trình này chưa có khóa học nào.
        </div>

        <div v-else class="timeline-glass">
          <div v-for="(course, index) in learningPath.courses" :key="course.id" class="timeline-item">
            <div class="tl-marker">
              <div class="tl-number">{{ Number(index) + 1 }}</div>
              <div class="tl-line" v-if="index !== learningPath.courses.length - 1"></div>
            </div>
            
            <div class="tl-content w-100 ms-4 mb-4">
               <div class="glass-course-card p-4">
                  <div class="d-flex justify-content-between align-items-start flex-wrap gap-3">
                    <div class="flex-grow-1">
                      <h5 class="fw-bold text-dark mb-2 fs-16">{{ course.title }}</h5>
                      <p class="text-muted fs-14 mb-3" style="max-width: 600px;">
                          {{ course.description || 'Khóa học đào tạo kỹ năng chuyên sâu trong lộ trình.' }}
                      </p>
                      
                      <div class="d-flex flex-wrap gap-3 fs-13 text-tertiary fw-medium mt-2">
                         <span class="badge-info-glass"><BookOpen :size="14" class="me-1"/> Học qua Video & Tài liệu</span>
                         <span class="badge-success-glass"><CheckCircle2 :size="14" class="me-1"/> Điểm đạt: {{ course.passScore || 50 }}/100</span>
                      </div>
                    </div>
                    <button class="btn btn-primary rounded-pill mt-auto" @click="goToCourse(course.id)">
                      <PlayCircle :size="18" class="me-2" /> Khám phá chặng này
                    </button>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.path-detail-page { padding-bottom: 50px; max-width: 1000px; margin: 0 auto; animation: fadeIn 0.4s ease-out; }

.btn-back { background: transparent; color: #64748b; transition: all 0.2s; font-weight: 600; }
.btn-back:hover { color: #4f46e5; transform: translateX(-4px); }

.spinner { width: 40px; height: 40px; border: 4px solid rgba(79, 70, 229, 0.2); border-top-color: #4f46e5; border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { 100% { transform: rotate(360deg); } }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

/* Hero Card */
.glass-hero-card { background: #0f172a; border-radius: 24px; z-index: 1; border: 1px solid rgba(255,255,255,0.1); }
.bg-gradient-overlay { position: absolute; inset: 0; background: linear-gradient(135deg, rgba(79, 70, 229, 0.85), rgba(15, 23, 42, 0.95)); z-index: 0; }
.watermark-icon { position: absolute; top: -20%; right: -5%; color: white; opacity: 0.05; z-index: 0; pointer-events: none; transform: rotate(-15deg); }
.badge-white-glass { display: inline-block; background: rgba(255,255,255,0.15); backdrop-filter: blur(10px); color: white; padding: 6px 16px; border-radius: 30px; font-weight: 800; font-size: 11px; letter-spacing: 0.1em; border: 1px solid rgba(255,255,255,0.2); }

/* Timeline UI */
.timeline-glass { position: relative; padding-top: 10px; }
.timeline-item { display: flex; align-items: stretch; }

.tl-marker { display: flex; flex-direction: column; align-items: center; width: 48px; flex-shrink: 0; }
.tl-number { width: 40px; height: 40px; background: linear-gradient(135deg, #6366f1, #4338ca); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 16px; z-index: 2; box-shadow: 0 0 0 4px rgba(99,102,241,0.15); border: 2px solid white; }
.tl-line { width: 2px; flex-grow: 1; background: linear-gradient(to bottom, #6366f1, rgba(99,102,241,0.1)); margin-top: 8px; margin-bottom: 8px; border-radius: 2px; }

/* Course Card in Timeline */
.glass-course-card { background: white; border: 1px solid rgba(0,0,0,0.06); border-radius: 20px; transition: all 0.3s; box-shadow: 0 4px 15px rgba(0,0,0,0.02); }
.glass-course-card:hover { transform: translateY(-3px) translateX(4px); box-shadow: 0 12px 30px rgba(99,102,241,0.1); border-color: rgba(99,102,241,0.2); }

.badge-info-glass { display: inline-flex; align-items: center; padding: 6px 14px; background: rgba(14, 165, 233, 0.08); color: #0369a1; border-radius: 12px; border: 1px solid rgba(14, 165, 233, 0.1); }
.badge-success-glass { display: inline-flex; align-items: center; padding: 6px 14px; background: rgba(16, 185, 129, 0.08); color: #047857; border-radius: 12px; border: 1px solid rgba(16, 185, 129, 0.1); }

.btn-primary { background: #4f46e5; border: none; color: white; font-weight: 700; font-size: 13px; padding: 12px 28px; display: inline-flex; align-items: center; transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.btn-primary:hover { background: #4338ca; transform: scale(1.05); box-shadow: 0 8px 20px rgba(79, 70, 229, 0.3); }

.empty-roadmap { padding: 50px; background: #f8fafc; border: 2px dashed #e2e8f0; border-radius: 24px; text-align: center; color: #64748b; font-weight: 500; }
</style>
