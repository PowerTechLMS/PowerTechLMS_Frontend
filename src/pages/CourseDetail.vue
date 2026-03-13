<template>
  <div class="course-detail-page">
    <!-- Loading State with Skeleton -->
    <div v-if="loading" class="skeleton-container container">
      <div class="skeleton-hero glass mb-5"></div>
      <div class="row">
        <div class="col-lg-8">
          <div v-for="i in 3" :key="i" class="skeleton-module glass mb-3"></div>
        </div>
        <div class="col-lg-4">
          <div class="skeleton-sidebar glass"></div>
        </div>
      </div>
    </div>

    <div v-else-if="course" class="detail-container">
      <!-- Hero Section -->
      <div class="course-hero-premium glass">
        <div class="hero-bg-overlay" :style="course.coverImageUrl ? { backgroundImage: `url(${course.coverImageUrl})` } : { background: 'var(--gradient-card)' }"></div>
        <div class="hero-content-wrapper container">
          <div class="hero-main-info animate-slide-up">
            <div class="badge-glass primary mb-3 fw-bold">KHÓA HỌC CHUYÊN SÂU</div>
            <h1 class="hero-title title-gradient">{{ course.title }}</h1>
            <p class="hero-desc">{{ course.description }}</p>
            
            <div class="hero-meta-grid">
              <div class="meta-item-glass">
                <User :size="16" class="text-primary" />
                <span>Bởi <strong>{{ course.createdByName }}</strong></span>
              </div>
              <div class="meta-item-glass">
                <BookOpen :size="16" class="text-success" />
                <span>{{ totalLessons }} bài học</span>
              </div>
              <div class="meta-item-glass">
                <Users :size="16" class="text-warning" />
                <span>{{ course.enrollmentCount }} học viên</span>
              </div>
            </div>

            <!-- Mobile Action Button -->
            <div class="mobile-only mt-4">
              <button v-if="!isEnrolled" class="btn-neon w-100" @click="handleEnroll" :disabled="enrollStatus !== 'open' || enrolling || hasPendingEnrollment">
                <template v-if="hasPendingEnrollment"><Clock :size="18" /> Đang chờ duyệt</template>
                <template v-else-if="enrolling"><Loader2 :size="18" class="spin" /> Đang ghi danh...</template>
                <template v-else><UserPlus :size="18" /> Đăng ký khóa học</template>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Layout Grid -->
      <div class="container mt-n5 position-relative z-2">
        <div class="row g-4">
          <!-- Left Column: Curriculum -->
          <div class="col-lg-8 animate-slide-up" style="animation-delay: 0.1s;">
            <div class="curriculum-wrap">
              <div class="section-header-premium mb-4">
                <h2 class="section-title">NỘI DUNG KHÓA HỌC</h2>
                <span class="badge-glass dark">{{ course.modules?.length || 0 }} Chương mục</span>
              </div>

              <div v-for="mod in course.modules" :key="mod.id" class="module-card glass mb-3">
                <div class="module-header-premium" @click="toggleModule(mod.id)" :class="{ 'is-active': expandedModules.has(mod.id) }">
                  <div class="module-info-main">
                    <div class="chevron-box">
                      <ChevronRight :size="20" :class="{ 'rotated': expandedModules.has(mod.id) }" />
                    </div>
                    <h3 class="module-title-text">{{ mod.title }}</h3>
                  </div>
                  <div class="module-meta-info">
                    <span class="lesson-count-badge">{{ mod.lessons.length }} bài học</span>
                  </div>
                </div>

                <Transition name="expand">
                  <div class="module-lessons-list" v-show="expandedModules.has(mod.id)">
                    <div 
                      v-for="lesson in mod.lessons" 
                      :key="lesson.id" 
                      class="lesson-row-premium"
                      :class="{ 
                        'is-completed': isLessonCompleted(lesson.id), 
                        'is-locked': !canAccessLesson(lesson), 
                        'is-preview': lesson.isFreePreview 
                      }"
                      @click="goToLesson(lesson)"
                    >
                      <div class="lesson-status-icon">
                        <CheckCircle2 v-if="isLessonCompleted(lesson.id)" :size="20" class="text-success-emerald" />
                        <Video v-else-if="lesson.type === 'Video'" :size="18" />
                        <FileText v-else :size="18" />
                      </div>
                      
                      <div class="lesson-content-main">
                        <span class="lesson-title-text">{{ lesson.title }}</span>
                        <div class="lesson-tags-wrap">
                          <span class="badge-glass primary sm" v-if="lesson.isFreePreview">Xem thử</span>
                          <span v-if="lesson.type === 'Video' && lesson.videoDurationSeconds" class="duration-tag">
                            <Clock :size="12" class="me-1" />
                            {{ Math.floor(lesson.videoDurationSeconds / 60) }}:{{ String(lesson.videoDurationSeconds % 60).padStart(2, '0') }}
                          </span>
                        </div>
                      </div>

                      <div class="lesson-action-indicator">
                        <Lock v-if="!canAccessLesson(lesson) && !lesson.isFreePreview" :size="16" class="text-tertiary" />
                        <ArrowRight v-else :size="16" class="hover-arrow" />
                      </div>
                    </div>
                  </div>
                </Transition>
              </div>
            </div>
          </div>

          <!-- Right Column: Sticky Sidebar -->
          <div class="col-lg-4 animate-slide-up" style="animation-delay: 0.2s;">
            <div class="sticky-sidebar">
              <div class="enroll-card glass shadow-glow">
                <div class="card-image-preview" :style="course.coverImageUrl ? { backgroundImage: `url(${course.coverImageUrl})` } : { background: 'var(--gradient-primary)' }">
                  <div v-if="isEnrolled && progress" class="progress-overlay-glass">
                    <div class="progress-info-mini">
                      <span class="fw-bold">{{ Math.round(progress.progressPercent) }}%</span>
                      <span>Hoàn thành</span>
                    </div>
                    <div class="progress-bar-glass-sm">
                      <div class="progress-fill-glow" :style="{ width: progress.progressPercent + '%' }"></div>
                    </div>
                  </div>
                </div>

                <div class="card-body-premium p-4">
                  <!-- Pricing or Status -->
                  <div class="status-price-row mb-4">
                    <span class="huge-text-gradient" v-if="!isEnrolled">MIỄN PHÍ</span>
                    <span class="huge-text-gradient" v-else>ĐÃ SỞ HỮU</span>
                  </div>

                  <!-- Actions -->
                  <div class="sidebar-actions gap-3 d-flex flex-column">
                    <template v-if="!isEnrolled">
                      <div v-if="enrollStatus !== 'open'" class="alert-glass warning mb-2">
                        <Calendar :size="16" />
                        <small v-if="enrollStatus === 'not_started'">Mở đăng ký: {{ formatDate(course.enrollStartDate) }}</small>
                        <small v-else>Hết hạn đăng ký: {{ formatDate(course.enrollEndDate) }}</small>
                      </div>
                      <button class="btn-neon lg w-100" @click="handleEnroll" :disabled="enrollStatus !== 'open' || enrolling || hasPendingEnrollment">
                        <template v-if="hasPendingEnrollment"><Clock :size="20" /> CHỜ PHÊ DUYỆT</template>
                        <template v-else-if="enrolling"><Loader2 :size="20" class="spin" /> ĐANG XỬ LÝ...</template>
                        <template v-else><UserPlus :size="20" /> ĐĂNG KÝ NGAY</template>
                      </button>
                    </template>

                    <template v-else-if="isAllCompleted && course.quizId">
                      <button class="btn-neon success lg w-100" @click="router.push({ path: `/quiz/${course.quizId}`, query: { courseId: route.params.id } })">
                        <ClipboardList :size="20" /> LÀM BÀI KIỂM TRA
                      </button>
                      <button class="btn-glass w-100" @click="startLearning">
                        <RotateCcw :size="18" /> XEM LẠI BÀI HỌC
                      </button>
                    </template>

                    <button v-else-if="isEnrolled" class="btn-neon lg w-100" @click="startLearning">
                      <PlayCircle :size="20" /> {{ progress?.progressPercent > 0 ? 'TIẾP TỤC HỌC' : 'BẮT ĐẦU HỌC' }}
                    </button>
                  </div>

                  <!-- Deadlines -->
                  <div v-if="isEnrolled && (course.completionDeadlineDays || course.completionEndDate)" class="deadline-box mt-4">
                    <div class="deadline-item-glass">
                      <Clock :size="16" />
                      <span v-if="course.completionEndDate">Hạn: {{ formatDate(course.completionEndDate) }}</span>
                      <span v-else>Hạn: {{ course.completionDeadlineDays }} ngày</span>
                    </div>
                  </div>

                  <ul class="course-features-list mt-4">
                    <li><Check :size="14" /> Truy cập trọn đời</li>
                    <li><Check :size="14" /> Chứng chỉ hoàn thành</li>
                    <li><Check :size="14" /> Cập nhật nội dung mới</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast Component -->
    <Transition name="toast">
      <div v-if="toast" class="toast-premium glass">
        <div class="toast-content">
          <Info :size="18" class="text-primary" />
          <span>{{ toast }}</span>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { courseAPI, enrollmentAPI, progressAPI } from '@/services/api'
import {
  UserPlus, PlayCircle, ClipboardList, RotateCcw,
  ChevronRight, Video, FileText, CheckCircle2, Lock, Calendar, Clock, Loader2,
  BookOpen, Users, User, ArrowRight, Play, Check, Info
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const course = ref(null)
const progress = ref(null)
const lessonProgresses = ref([])
const isEnrolled = ref(false)
const hasPendingEnrollment = ref(false)
const enrolling = ref(false)
const expandedModules = ref(new Set())
const loading = ref(true)
const toast = ref('')
let toastTimer = null

function showToast(msg) {
  clearTimeout(toastTimer)
  toast.value = msg
  toastTimer = setTimeout(() => toast.value = '', 4000)
}

const totalLessons = computed(() => course.value?.modules?.reduce((sum, m) => sum + m.lessons.length, 0) || 0)

const isAllCompleted = computed(() => {
  const all = course.value?.modules?.flatMap(m => m.lessons) ?? []
  return all.length > 0 && all.every(l => isLessonCompleted(l.id))
})

const enrollStatus = computed(() => {
  const c = course.value
  if (!c) return 'open'
  const now = new Date()
  if (c.enrollStartDate && now < new Date(c.enrollStartDate)) return 'not_started'
  if (c.enrollEndDate && now > new Date(c.enrollEndDate)) return 'closed'
  return 'open'
})

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function toggleModule(id) {
  if (expandedModules.value.has(id)) expandedModules.value.delete(id)
  else expandedModules.value.add(id)
}

function isLessonCompleted(lessonId) {
  return lessonProgresses.value.some(lp => lp.lessonId === lessonId && lp.isCompleted)
}

function canAccessLesson(lesson) {
  if (lesson.isFreePreview) return true
  if (!isEnrolled.value) return false
  const allLessons = course.value.modules.flatMap(m => m.lessons)
  const idx = allLessons.findIndex(l => l.id === lesson.id)
  if (idx === 0) return true
  return isLessonCompleted(allLessons[idx - 1].id)
}

function goToLesson(lesson) {
  if (canAccessLesson(lesson)) {
    router.push(`/learn/${route.params.id}/${lesson.id}`)
  }
}

function startLearning() {
  const allLessons = course.value?.modules?.flatMap(m => m.lessons) ?? []
  if (!allLessons.length) {
    showToast('Khóa học này chưa có bài học nào. Vui lòng liên hệ quản trị viên.')
    return
  }
  const nextLesson = allLessons.find(l => !isLessonCompleted(l.id)) || allLessons[0]
  if (nextLesson) router.push(`/learn/${route.params.id}/${nextLesson.id}`)
}

async function handleEnroll() {
  enrolling.value = true
  try {
    const response = await enrollmentAPI.enroll(parseInt(route.params.id))
    if (response.data && response.data.status === 'Pending') {
      hasPendingEnrollment.value = true
      showToast('Đăng ký thành công! Vui lòng chờ phê duyệt.')
    } else {
      isEnrolled.value = true
      showToast('Chúc mừng! Bạn đã ghi danh thành khóa học thành công.')
      setTimeout(() => startLearning(), 1000)
    }
  } catch (e) { 
    showToast(e.response?.data?.message || 'Lỗi ghi danh khóa học') 
  } finally { 
    enrolling.value = false 
  }
}

onMounted(async () => {
  const id = route.params.id
  loading.value = true
  try {
    const { data } = await courseAPI.getById(id)
    course.value = data
    course.value.modules?.forEach(m => expandedModules.value.add(m.id))

    try {
      const myEnrollmentsRes = await enrollmentAPI.getMy()
      const myEnrollment = myEnrollmentsRes.data.find(e => e.courseId === parseInt(id))
      
      if (myEnrollment) {
        if (myEnrollment.status === 'Pending') {
          hasPendingEnrollment.value = true
          isEnrolled.value = false
        } else {
          isEnrolled.value = true
          try {
            const progressRes = await progressAPI.getCourseProgress(id)
            progress.value = progressRes.data
            const lpRes = await progressAPI.getLessonProgresses(id)
            lessonProgresses.value = lpRes.data
          } catch (e) { console.error("Could not fetch course progress") }
        }
      } else {
        isEnrolled.value = false
      }
    } catch { isEnrolled.value = false }
  } catch (e) { console.error(e) }
  finally { loading.value = false }
})
</script>

<style scoped>
.course-detail-page {
  padding-bottom: 5rem;
  min-height: 100vh;
}

/* Glass & Premium Basics */
.glass {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.4);
}

.title-gradient {
  background: linear-gradient(90deg, #1e293b, #4f46e5, #a855f7);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.huge-text-gradient {
  font-size: 2rem;
  font-weight: 900;
  background: linear-gradient(135deg, #4f46e5, #a855f7);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Badges */
.badge-glass {
  padding: 6px 14px;
  border-radius: 30px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1px;
  text-transform: uppercase;
  display: inline-flex;
  align-items: center;
}
.badge-glass.primary { background: rgba(99, 102, 241, 0.1); color: #4f46e5; border: 1px solid rgba(99, 102, 241, 0.2); }
.badge-glass.dark { background: rgba(0, 0, 0, 0.5); color: white; backdrop-filter: blur(8px); }

/* Hero Section */
.course-hero-premium {
  position: relative;
  border-radius: 0 0 40px 40px;
  overflow: hidden;
  margin-bottom: 2rem;
  min-height: 450px;
  display: flex;
  align-items: center;
  border: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
}

.hero-bg-overlay {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  filter: blur(60px) brightness(0.7);
  transform: scale(1.1);
  z-index: 1;
}

.hero-bg-overlay::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0.4) 100%);
}

.hero-content-wrapper {
  position: relative;
  z-index: 2;
  padding-top: 2rem;
  padding-bottom: 5rem;
}

.hero-main-info { max-width: 800px; }

.hero-title {
  font-size: 3.5rem;
  font-weight: 900;
  line-height: 1.1;
  margin-bottom: 1.5rem;
  letter-spacing: -2px;
  color: white;
}

.hero-desc {
  font-size: 1.15rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 2.5rem;
  line-height: 1.6;
  font-weight: 500;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.hero-meta-grid {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.meta-item-glass {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 8px 16px;
  border-radius: 12px;
  color: white;
  font-size: 0.9rem;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

/* Curriculum Section */
.section-header-premium {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.section-title {
  font-size: 1.25rem;
  font-weight: 900;
  color: #1e293b;
  letter-spacing: 2px;
}

.module-card {
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.3s;
}

.module-header-premium {
  padding: 1.25rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: background 0.3s;
}

.module-header-premium:hover { background: rgba(255, 255, 255, 0.8); }
.module-header-premium.is-active { background: rgba(79, 70, 229, 0.03); border-bottom: 1px solid rgba(0,0,0,0.05); }

.module-info-main { display: flex; align-items: center; gap: 12px; }
.chevron-box {
  width: 28px; height: 28px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  background: rgba(0,0,0,0.05);
  transition: all 0.3s;
}
.chevron-box .rotated { transform: rotate(90deg); color: #4f46e5; }

.module-title-text { font-size: 1.1rem; font-weight: 800; color: #1e293b; margin: 0; }
.lesson-count-badge { font-size: 0.8rem; font-weight: 700; color: #64748b; background: #f1f5f9; padding: 4px 10px; border-radius: 8px; }

/* Lesson Rows */
.lesson-row-premium {
  display: flex;
  align-items: center;
  padding: 1rem 1.5rem;
  gap: 1.25rem;
  cursor: pointer;
  border-bottom: 1px solid rgba(0,0,0,0.03);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.lesson-row-premium:last-child { border-bottom: none; }
.lesson-row-premium:hover { background: white; padding-left: 2rem; }

.lesson-status-icon {
  width: 36px; height: 36px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  background: #f8fafc; color: #64748b;
}

.text-success-emerald { color: #10b981; }

.lesson-content-main { flex: 1; display: flex; flex-direction: column; }
.lesson-title-text { font-size: 0.95rem; font-weight: 600; color: #475569; }
.is-completed .lesson-title-text { color: #94a3b8; text-decoration: none; font-style: italic; }

.lesson-tags-wrap { display: flex; align-items: center; gap: 12px; margin-top: 4px; }
.duration-tag { font-size: 0.8rem; color: #94a3b8; font-weight: 600; display: flex; align-items: center; }

.lesson-action-indicator { opacity: 0; transition: opacity 0.2s; }
.lesson-row-premium:hover .lesson-action-indicator { opacity: 1; color: #4f46e5; }
.is-locked { opacity: 0.5; cursor: not-allowed; }
.is-locked .lesson-action-indicator { opacity: 1; }

/* Sticky Sidebar */
.sticky-sidebar { position: sticky; top: 100px; }

.enroll-card {
  border-radius: 28px;
  overflow: hidden;
  border: 1px solid white;
}

.card-image-preview {
  height: 200px;
  background-size: cover;
  background-position: center;
  position: relative;
}

.progress-overlay-glass {
  position: absolute; inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(8px);
  display: flex; flex-direction: column;
  justify-content: center; padding: 2rem;
  color: white;
}

.progress-info-mini { display: flex; justify-content: space-between; font-size: 0.9rem; margin-bottom: 8px; }
.progress-bar-glass-sm { height: 6px; background: rgba(255,255,255,0.2); border-radius: 10px; overflow: hidden; }
.progress-fill-glow { height: 100%; background: linear-gradient(90deg, #6366f1, #a855f7); box-shadow: 0 0 10px rgba(99, 102, 241, 0.5); border-radius: 10px; }

.btn-neon {
  padding: 0.9rem 1.5rem;
  border-radius: 16px;
  font-weight: 800; font-size: 0.95rem;
  border: none; color: white;
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  box-shadow: 0 8px 20px rgba(79, 70, 229, 0.3);
  display: flex; align-items: center; justify-content: center; gap: 10px;
  transition: all 0.3s;
}
.btn-neon:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 12px 25px rgba(79, 70, 229, 0.4); }
.btn-neon.success { background: linear-gradient(135deg, #10b981, #059669); box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3); }

.btn-glass {
  background: rgba(0,0,0,0.05);
  border: 1px solid rgba(0,0,0,0.1);
  padding: 0.8rem; border-radius: 14px;
  font-weight: 700; color: #475569;
  transition: all 0.2s;
}
.btn-glass:hover { background: rgba(0,0,0,0.08); }

.deadline-item-glass {
  display: flex; align-items: center; gap: 8px;
  background: rgba(234, 179, 8, 0.08); color: #b45309;
  padding: 10px 16px; border-radius: 14px; font-weight: 700; font-size: 0.85rem;
}

.course-features-list { list-style: none; padding: 0; margin: 0; }
.course-features-list li { display: flex; align-items: center; gap: 10px; font-size: 0.9rem; color: #64748b; margin-bottom: 12px; font-weight: 600; }
.course-features-list li svg { color: #10b981; }

/* Toast */
.toast-premium {
  position: fixed; bottom: 2rem; right: 2rem;
  padding: 1rem 1.5rem; border-radius: 20px;
  z-index: 1000; box-shadow: 0 15px 40px rgba(0,0,0,0.1);
}
.toast-content { display: flex; align-items: center; gap: 12px; font-weight: 700; color: #1e293b; }

/* Skeletons */
.skeleton-hero { height: 400px; border-radius: 0 0 40px 40px; }
.skeleton-module { height: 80px; border-radius: 20px; }
.skeleton-sidebar { height: 500px; border-radius: 28px; }

/* Transitions & Animations */
.expand-enter-active, .expand-leave-active { transition: all 0.3s ease; max-height: 1000px; }
.expand-enter-from, .expand-leave-to { max-height: 0; opacity: 0; overflow: hidden; }

@keyframes slideInUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-slide-up { animation: slideInUp 0.7s cubic-bezier(0.4, 0, 0.2, 1) backwards; }

.spin { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

@media (max-width: 991px) {
  .hero-title { font-size: 2.5rem; }
  .course-hero-premium { min-height: 350px; }
  .sticky-sidebar { position: static; margin-top: 2rem; }
  .mt-n5 { margin-top: -3rem !important; }
}
</style>
