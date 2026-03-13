<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
// @ts-ignore
import { dashboardAPI, certificateAPI, leaderboardAPI } from '@/services/api'
import {
  BookOpen, Award, Trophy, Zap, Clock, ChevronRight, ChevronDown,
  PlayCircle, Star, CheckCircle2, ArrowRight, Flame, Bell,
  CalendarDays, GraduationCap, Lock, Target, Users, MessageCircle,
  BarChart2, TrendingUp, Circle, AlertCircle, CheckCheck, FileText,
  Sparkles, BookMarked, ClipboardList, Layers
} from 'lucide-vue-next'

const authStore = useAuthStore()

// State Data (Nhận dữ liệu thật từ Backend)
const loading = ref(true)
const certificates = ref([])
const badges = ref([])

const todayTasks = ref([])
const weekMission = ref({ skills: [] })
const myCourses = ref([])
const inProgressCourses = ref([])
const testPractice = ref([])
const learningProfile = ref({ summary: [] })
const hrMessages = ref([])

/* ── computed ── */
const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return 'Chào buổi sáng'
  if (h < 18) return 'Chào buổi chiều'
  return 'Chào buổi tối'
})

const avatarUrl = computed(() => {
  if (!authStore.user?.avatar) return null
  const url = authStore.user.avatar
  const base = url.startsWith('http') ? url : `${import.meta.env.VITE_API_URL || 'http://localhost:5100'}${url}`
  return `${base}?t=${authStore.avatarUpdateTime}`
})

const missionPct = computed(() => {
  if (!weekMission.value.totalTasks) return 0;
  return Math.round((weekMission.value.doneTasks / weekMission.value.totalTasks) * 100);
})

/* SVG ring cho tiến độ tuần */
const R = 42, C = 2 * Math.PI * R
const missionOffset = computed(() => C - (missionPct.value / 100) * C)

/* ── DATA FETCHING (GỌI API BFF) ── */
onMounted(async () => {
  loading.value = true;
  try {
    const [dashRes, cRes, bRes] = await Promise.all([
      dashboardAPI.getLearnerData(), // API gom tổng hợp
      certificateAPI.getMy(),
      leaderboardAPI.getMyBadges(),
    ])
    
    // Đổ dữ liệu từ API C# vào State của Vue
    const d = dashRes.data;
    todayTasks.value = d.todayTasks || [];
    weekMission.value = d.weekMission || { skills: [] };
    myCourses.value = d.myCourses || [];
    inProgressCourses.value = (d.myCourses || []).filter(c => c.progressPercent > 0 && c.progressPercent < 100);
    testPractice.value = d.testPractice || [];
    learningProfile.value = d.learningProfile || { summary: [] };
    hrMessages.value = d.hrMessages || [];

    certificates.value = cRes.data || [];
    badges.value = (bRes.data || []).filter(b => b.isEarned);
    
  } catch (e) { 
    console.error("Lỗi tải Dashboard:", e);
  } finally { 
    loading.value = false;
  }
})
</script>

<template>
  <div class="dash" v-if="!loading">

    <div class="greet-row">
      <div class="greet-avatar-wrap">
        <div
          v-if="avatarUrl"
          class="greet-avatar"
          :style="`background-image:url('${avatarUrl}')`"
        ></div>
        <div v-else class="greet-avatar greet-avatar-init">
          {{ authStore.user?.fullName?.charAt(0) || 'U' }}
        </div>
      </div>
      <div class="greet-text">
        <h1 class="greet-title">
          {{ greeting }},
          <span class="greet-name">{{ authStore.user?.fullName || 'bạn' }}</span>
        </h1>
        <p class="greet-sub">Cùng hệ thống nâng cao năng lực mỗi ngày nhé!</p>
      </div>
    </div>

    <div class="body-grid">

      <div class="col-main">

        <div class="card-goals">
          <div class="goals-bubble">
            <Sparkles :size="14" />
            Bắt tay vào làm nhiệm vụ đầu tiên thôi,
            <strong>{{ authStore.user?.fullName?.split(' ').pop() || 'bạn' }} ơi!</strong>
          </div>
          <div class="goals-mascot" aria-hidden="true">🤖</div>

          <div class="goals-inner">
            <div class="goals-header">
              <Flame :size="18" class="goals-fire" />
              <span class="goals-title">Mục tiêu hôm nay</span>
            </div>

            <div class="task-list">
              <div v-if="todayTasks.length === 0" class="text-white opacity-75 fs-14 italic">
                 Hôm nay bạn không có nhiệm vụ cụ thể nào. Hãy tiếp tục học khóa đang dang dở nhé!
              </div>

              <div
                v-else
                v-for="t in todayTasks"
                :key="t.id"
                class="task-item"
                :class="{ done: t.done, locked: t.locked }"
              >
                <div class="task-icon">
                  <CheckCheck v-if="t.done"   :size="18" class="ic-done" />
                  <Lock       v-else-if="t.locked" :size="15" class="ic-lock" />
                  <Circle     v-else           :size="18" class="ic-circle" />
                </div>
                <div class="task-body">
                  <p class="task-name">{{ t.title }}</p>
                  <p class="task-sub">{{ t.sub }}</p>
                </div>
                <div class="task-right">
                  <span class="task-prog" v-if="t.progress">⭐ {{ t.progress }}</span>
                  <button class="btn-start" v-if="!t.done && !t.locked" @click="$router.push('/my-courses')">
                    Bắt đầu <ArrowRight :size="14" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section class="section">
          <div class="section-hd">
            <h2 class="section-title">Nhiệm vụ học tập tuần này</h2>
          </div>

          <div class="mission-card">
            <div class="mc-left">
              <div class="mc-ring-wrap">
                <svg viewBox="0 0 100 100" class="mc-ring-svg">
                  <circle cx="50" cy="50" r="42" stroke="rgba(129,140,248,.12)" stroke-width="9" fill="none"/>
                  <circle
                    cx="50" cy="50" r="42"
                    stroke="url(#mgr)"
                    stroke-width="9"
                    stroke-linecap="round"
                    fill="none"
                    :stroke-dasharray="C"
                    :stroke-dashoffset="missionOffset"
                    transform="rotate(-90 50 50)"
                    class="mc-arc"
                  />
                  <defs>
                    <linearGradient id="mgr" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                      <stop stop-color="#818cf8"/>
                      <stop offset="1" stop-color="#a78bfa"/>
                    </linearGradient>
                  </defs>
                </svg>
                <div class="mc-ring-center">
                  <span class="mc-pct">{{ missionPct }}%</span>
                  <span class="mc-pct-lbl">tuần này</span>
                </div>
              </div>
              <div class="mc-week-label">
                <CalendarDays :size="13" />
                {{ weekMission.weekLabel }}
              </div>
            </div>

            <div class="mc-right">
              <h3 class="mc-title">Tiến độ nhiệm vụ</h3>

              <div class="mc-row">
                <span class="mc-row-label">
                  <Trophy :size="14" class="ic-amber"/> XP tích lũy tuần này
                </span>
                <span class="mc-row-val amber-val">{{ weekMission.xpEarned }} / {{ weekMission.xpTarget }} XP</span>
              </div>
              <div class="mc-prog-bar">
                <div class="mc-bar-fill amber-fill" :style="`width:${Math.round((weekMission.xpEarned/weekMission.xpTarget)*100)}%`"></div>
              </div>

              <div class="mc-row mt-sm">
                <span class="mc-row-label">
                  <AlertCircle :size="14" class="ic-red"/> Đào tạo bắt buộc
                </span>
                <span class="mc-row-val red-val">{{ weekMission.mandatoryDone }}/{{ weekMission.mandatoryTotal }}</span>
              </div>
              <div class="mc-prog-bar">
                <div class="mc-bar-fill red-fill" :style="`width:${Math.round((weekMission.mandatoryDone/weekMission.mandatoryTotal)*100)}%`"></div>
              </div>
              <div class="mc-sub-bullets">
                <span class="mc-bullet done-bullet">● Hoàn thành: {{ weekMission.mandatoryDone }}/{{ weekMission.mandatoryTotal }} nhiệm vụ</span>
              </div>

              <div class="mc-row mt-sm">
                <span class="mc-row-label">
                  <BookMarked :size="14" class="ic-green"/> Học tập tự chọn
                </span>
                <span class="mc-row-val green-val">{{ weekMission.optionalDone }}/{{ weekMission.optionalTotal }}</span>
              </div>
              <div class="mc-prog-bar">
                <div class="mc-bar-fill green-fill" :style="`width:${Math.round((weekMission.optionalDone/weekMission.optionalTotal)*100)}%`"></div>
              </div>

              <div class="mc-skills">
                <div v-for="sk in weekMission.skills" :key="sk.name" class="mc-skill-row">
                  <span class="mc-skill-name">{{ sk.name }}</span>
                  <div class="mc-skill-track">
                    <div class="mc-skill-fill" :style="`width:${sk.pct}%;background:${sk.color}`"></div>
                  </div>
                  <span class="mc-skill-pct" :style="`color:${sk.color}`">{{ sk.pct }}%</span>
                </div>
              </div>

              <div class="mc-status" :class="weekMission.statusType">
                {{ weekMission.status }}
              </div>

              <button class="btn-continue" @click="$router.push('/my-courses')">
                Tiếp tục học <ArrowRight :size="15" />
              </button>
            </div>
          </div>
        </section>

        <section class="section">
          <div class="section-hd">
            <h2 class="section-title">Khóa học ưu tiên</h2>
            <button class="link-more" @click="$router.push('/my-courses')">Xem tất cả</button>
          </div>

          <div class="course-cards" v-if="myCourses.length">
            <div
              v-for="c in myCourses"
              :key="c.id"
              class="course-card"
              @click="$router.push(`/courses/${c.id}`)"
            >
              <div class="cc-thumb" :style="`background:linear-gradient(135deg,${c.thumbColor},${c.thumbColor2})`">
                <GraduationCap :size="28" class="cc-thumb-icon"/>
                <span class="cc-tag">{{ c.tag }}</span>
              </div>
              <div class="cc-body">
                <p class="cc-title" :title="c.title">{{ c.title }}</p>
                <div class="cc-prog-row">
                  <div class="cc-prog-track"><div class="cc-prog-fill" :style="`width:${c.progressPercent}%`"></div></div>
                  <span class="cc-prog-pct">{{ Math.round(c.progressPercent) }}%</span>
                </div>
                <div class="cc-meta-row">
                  <span class="cc-stat"><BookOpen :size="12"/> {{ c.units }} Bài</span>
                  <span class="cc-stat"><Trophy :size="12"/> {{ c.cups }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div v-else class="text-center py-4 border rounded-3 bg-light">
             <p class="text-muted mb-0 fs-14">Bạn chưa ghi danh khóa học nào.</p>
          </div>
        </section>

        <section class="section">
          <div class="section-hd">
            <h2 class="section-title">Kiểm tra & Đánh giá</h2>
          </div>

          <div class="quiz-list" v-if="testPractice.length">
            <div v-for="t in testPractice" :key="t.id" class="quiz-item">
              <div class="qi-cover" :style="`background:${t.cover}`">
                <FileText :size="22" class="qi-icon"/>
              </div>
              <div class="qi-body">
                <div class="qi-top">
                  <span class="qi-badge" :class="t.status">{{ t.badge }}</span>
                </div>
                <p class="qi-title">{{ t.title }}</p>
                <p class="qi-sub">{{ t.subtitle }}</p>
              </div>
              <button class="btn-quiz" @click="$router.push('/my-courses')">
                Thực hiện <ArrowRight :size="14"/>
              </button>
            </div>
          </div>

          <div v-else class="text-center py-4 border rounded-3 bg-light">
             <p class="text-muted mb-0 fs-14">Bạn đã hoàn thành mọi bài thi được giao.</p>
          </div>
        </section>

      </div><div class="col-rail">

        <div class="rail-card">
          <div class="rc-hd">
            <h3 class="rc-title">Hồ sơ năng lực</h3>
          </div>

          <p class="rc-label">Phòng ban: {{ learningProfile.dept }}</p>
          <div class="level-track">
            <div class="lt-step done">
              <div class="lt-dot"><CheckCircle2 :size="14"/></div>
              <span class="lt-lbl">{{ learningProfile.entry }}</span>
              <span class="lt-score entry-score">{{ learningProfile.entryScore }}</span>
            </div>
            <div class="lt-line done"></div>
            <div class="lt-step current">
              <div class="lt-dot current-dot"><Circle :size="14"/></div>
              <span class="lt-lbl">Dự kiến</span>
              <span class="lt-score current-score">{{ learningProfile.predictedScore }}</span>
            </div>
            <div class="lt-line"></div>
            <div class="lt-step">
              <div class="lt-dot target-dot"><Target :size="14"/></div>
              <span class="lt-lbl">Mục tiêu</span>
              <span class="lt-score target-score">{{ learningProfile.targetScore }}</span>
            </div>
          </div>

          <p class="rc-label mt-md">Tóm tắt quá trình học</p>
          <div class="summary-list">
            <div v-for="s in learningProfile.summary" :key="s.label" class="sl-row">
              <span class="sl-label">{{ s.label }}</span>
              <span class="sl-val" :style="`color:${s.color}`">{{ s.val }}</span>
            </div>
          </div>
        </div>

        <div class="rail-card">
          <div class="rc-hd">
            <h3 class="rc-title">Nhắc nhở Hệ thống</h3>
            <span class="notif-count">{{ hrMessages.length }}</span>
          </div>

          <div v-if="hrMessages.length" class="msg-list">
            <div v-for="m in hrMessages" :key="m.id" class="msg-item" :class="{unread: m.unread}">
              <div class="msg-from-icon"><AlertCircle :size="14"/></div>
              <div class="msg-body">
                <p class="msg-from">{{ m.from }}</p>
                <p class="msg-text">{{ m.msg }}</p>
                <p class="msg-time">{{ m.time }}</p>
              </div>
            </div>
          </div>
          <p class="rc-empty" v-else>Bạn không có deadline khóa học nào quá hạn.</p>

          <button class="btn-view-detail" @click="$router.push('/my-courses')">
            Đi tới Khóa học
          </button>
        </div>

        <div class="rail-card" v-if="badges.length">
          <div class="rc-hd">
            <h3 class="rc-title">Huy hiệu đạt được</h3>
          </div>
          <div class="badge-grid">
            <div v-for="b in badges.slice(0,6)" :key="b.badgeId" class="badge-item" :title="b.badgeName">
              <div class="badge-circle"><Star :size="16"/></div>
              <span class="badge-name">{{ b.badgeName?.slice(0,10) }}</span>
            </div>
          </div>
        </div>

        <div class="rail-card" v-if="certificates.length">
          <div class="rc-hd">
            <h3 class="rc-title">Chứng chỉ mới nhất</h3>
            <button class="link-more" @click="$router.push('/certificates')">Tất cả</button>
          </div>
          <div class="cert-list">
            <div v-for="c in certificates.slice(0,3)" :key="c.id" class="cert-item">
              <div class="cert-icon"><Award :size="15"/></div>
              <div class="cert-info">
                <p class="cert-name" :title="c.courseTitle">{{ c.courseTitle }}</p>
                <p class="cert-date">{{ new Date(c.issuedAt).toLocaleDateString('vi-VN') }}</p>
              </div>
            </div>
          </div>
        </div>

      </div></div></div>

  <div class="dash-loading" v-else>
    <div class="loader"></div>
    <p>Đang kết nối kho dữ liệu...</p>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap');

/* ── Reset / Root ── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --fnt: 'Be Vietnam Pro', system-ui, sans-serif;
  --in:  #818cf8; --in-l: rgba(129,140,248,.09);
  --gr:  #10b981; --gr-l: rgba(16,185,129,.09);
  --am:  #f59e0b; --am-l: rgba(245,158,11,.09);
  --vi:  #a78bfa; --vi-l: rgba(167,139,250,.09);
  --rd:  #ef4444; --rd-l: rgba(239,68,68,.09);
  --bl:  #3b82f6; --bl-l: rgba(59,130,246,.09);
  --card: var(--bg-card, #ffffff);
  --border: var(--border-color, #e5e7eb);
  --t1: var(--text-primary,  #111827);
  --t2: var(--text-secondary,#6b7280);
  --t3: var(--text-tertiary, #9ca3af);
  --bg2: var(--bg-secondary, #f9fafb);
  --bg3: var(--bg-tertiary,  #f3f4f6);
  --shadow: 0 1px 4px rgba(0,0,0,.06), 0 4px 16px rgba(0,0,0,.04);
}

.dash {
  font-family: var(--fnt);
  padding: 1.5rem 2rem 3rem;
  max-width: 1340px;
  margin: 0 auto;
  animation: fadeIn .35s ease-out;
}

/* ════════════════════════════
   GREETING
════════════════════════════ */
.greet-row {
  display: flex; align-items: center; gap: 1rem;
  margin-bottom: 1.5rem;
}
.greet-avatar-wrap { flex-shrink: 0; }
.greet-avatar {
  width: 52px; height: 52px;
  border-radius: 50%;
  background-size: cover; background-position: center;
  border: 2.5px solid var(--in);
  box-shadow: 0 0 0 3px rgba(129,140,248,.15);
}
.greet-avatar-init {
  background: linear-gradient(135deg, #818cf8, #a78bfa) !important;
  display: flex; align-items: center; justify-content: center;
  color: #ffffff !important;
  -webkit-text-fill-color: #ffffff !important;
  font-size: 1.2rem; font-weight: 800;
  text-shadow: 0 1px 4px rgba(0,0,0,.2);
}
.greet-title {
  font-size: 1.35rem; font-weight: 800;
  color: var(--text-primary, #111827); letter-spacing: -.02em; line-height: 1.25;
}
.greet-name {
  background: linear-gradient(120deg, #818cf8, #a78bfa);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.greet-sub { font-size: .875rem; color: var(--text-secondary, #6b7280); margin-top: 3px; }

/* ════════════════════════════
   BODY GRID
════════════════════════════ */
.body-grid {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 1.5rem;
  align-items: start;
}
@media(max-width:1100px){ .body-grid { grid-template-columns: 1fr; } }

.col-main { display: flex; flex-direction: column; gap: 1.5rem; }
.col-rail  { display: flex; flex-direction: column; gap: 1.25rem; }

/* ════════════════════════════
   CARD: MỤC TIÊU HÔM NAY
════════════════════════════ */
.card-goals {
  position: relative;
  background: linear-gradient(135deg, #4f46e5 0%, #818cf8 50%, #7c3aed 100%);
  border-radius: 20px;
  padding: 1.5rem 1.75rem;
  overflow: hidden;
  box-shadow: 0 8px 28px rgba(79,70,229,.3);
}

/* dot pattern overlay */
.card-goals::before {
  content: '';
  position: absolute; inset: 0;
  background-image: radial-gradient(rgba(255,255,255,.06) 1px, transparent 1px);
  background-size: 22px 22px;
  pointer-events: none;
}

.goals-bubble {
  position: absolute;
  top: 1.1rem; right: 6rem;
  background: rgba(17,24,39,.75);
  backdrop-filter: blur(8px);
  color: #fff;
  font-size: 12px; font-weight: 500;
  padding: 7px 13px;
  border-radius: 12px;
  max-width: 260px;
  line-height: 1.45;
  border: 1px solid rgba(255,255,255,.12);
  display: flex; align-items: flex-start; gap: 6px;
  z-index: 2;
}

.goals-mascot {
  position: absolute;
  top: .75rem; right: 1.25rem;
  font-size: 2.8rem;
  z-index: 2;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,.3));
}

.goals-inner { position: relative; z-index: 2; }

.goals-header {
  display: flex; align-items: center; gap: .5rem;
  margin-bottom: 1.1rem;
}
.goals-fire { color: #fbbf24; }
.goals-title {
  font-size: 1rem; font-weight: 700; color: #fff; letter-spacing: -.01em;
}

.task-list { display: flex; flex-direction: column; gap: .6rem; }

.task-item {
  display: flex; align-items: center; gap: .875rem;
  background: rgba(255,255,255,.1);
  border: 1px solid rgba(255,255,255,.12);
  border-radius: 13px;
  padding: .875rem 1rem;
  backdrop-filter: blur(4px);
  transition: background .18s;
}
.task-item:hover:not(.locked) { background: rgba(255,255,255,.16); }
.task-item.done  { opacity: .65; }
.task-item.locked { opacity: .5; cursor: default; }

.task-icon { width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.ic-done   { color: #4ade80; }
.ic-lock   { color: #94a3b8; }
.ic-circle { color: rgba(255,255,255,.5); }

.task-body { flex: 1; min-width: 0; }
.task-name { font-size: .9rem; font-weight: 600; color: #fff; margin-bottom: 2px; }
.task-sub  { font-size: 12px; color: rgba(255,255,255,.65); }

.task-right { display: flex; align-items: center; gap: .75rem; flex-shrink: 0; }
.task-prog  { font-size: 12px; font-weight: 600; color: rgba(255,255,255,.8); }

.btn-start {
  display: inline-flex; align-items: center; gap: 5px;
  padding: .4rem 1.1rem;
  background: #ffffff !important;
  color: #6366f1 !important;
  -webkit-text-fill-color: #6366f1 !important;
  font-family: var(--fnt); font-size: .8rem; font-weight: 800;
  border: none; border-radius: 9px; cursor: pointer;
  transition: all .18s; white-space: nowrap;
  box-shadow: 0 2px 10px rgba(0,0,0,.2);
}
.btn-start:hover { background: #eef2ff !important; transform: scale(1.04); box-shadow: 0 4px 14px rgba(0,0,0,.22); }

/* ════════════════════════════
   SECTION WRAPPER
════════════════════════════ */
.section {}
.section-hd {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: .875rem;
}
.section-title {
  font-size: 1.05rem; font-weight: 700; color: var(--text-primary, #111827); letter-spacing: -.015em;
}
.link-more {
  font-size: 13px; font-weight: 500; color: var(--in);
  background: none; border: none; cursor: pointer; font-family: var(--fnt);
  padding: 0; transition: opacity .15s;
}
.link-more:hover { opacity: .75; }

/* ════════════════════════════
   MISSION CARD (replaces Study Plan)
════════════════════════════ */
.mission-card {
  display: flex; gap: 2rem;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 1.75rem;
  box-shadow: var(--shadow);
}
@media(max-width:700px){ .mission-card { flex-direction: column; gap: 1.25rem; } }

/* Left: ring */
.mc-left {
  display: flex; flex-direction: column; align-items: center; gap: .75rem;
  flex-shrink: 0;
}
.mc-ring-wrap {
  position: relative; width: 110px; height: 110px;
}
.mc-ring-svg { width: 100%; height: 100%; }
.mc-arc { transition: stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1); }
.mc-ring-center {
  position: absolute; inset: 0;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
}
.mc-pct     { font-size: 1.4rem; font-weight: 800; color: var(--t1); line-height: 1; }
.mc-pct-lbl { font-size: 11px; color: var(--t3); font-weight: 500; margin-top: 2px; }
.mc-week-label {
  display: flex; align-items: center; gap: 5px;
  font-size: 11.5px; font-weight: 500; color: var(--t2);
  text-align: center;
}

/* Right: details */
.mc-right { flex: 1; min-width: 0; }
.mc-title {
  font-size: .95rem; font-weight: 700; color: var(--text-primary, #111827); margin-bottom: .875rem;
}

.mc-row {
  display: flex; align-items: center; justify-content: space-between; gap: .5rem;
  margin-bottom: .35rem;
}
.mc-row.mt-sm { margin-top: .875rem; }
.mc-row-label {
  display: flex; align-items: center; gap: 5px;
  font-size: 12.5px; font-weight: 500; color: var(--t2);
}
.mc-row-val { font-size: 12.5px; font-weight: 700; }
.amber-val { color: var(--am); }
.red-val   { color: var(--rd); }
.green-val { color: var(--gr); }

.mc-prog-bar {
  height: 7px; background: var(--bg3); border-radius: 99px; overflow: hidden; margin-bottom: 4px;
}
.mc-bar-fill {
  height: 100%; border-radius: 99px;
  transition: width 1.1s cubic-bezier(.4,0,.2,1);
}
.amber-fill { background: linear-gradient(90deg,var(--am),#fcd34d); }
.red-fill   { background: linear-gradient(90deg,var(--rd),#f87171); }
.green-fill { background: linear-gradient(90deg,var(--gr),#34d399); }

.mc-sub-bullets {
  display: flex; flex-direction: column; gap: 2px; margin-bottom: .25rem;
}
.mc-bullet { font-size: 11.5px; font-weight: 500; }
.done-bullet { color: var(--gr); }
.plan-bullet { color: var(--bl); }

/* skill bars */
.mc-skills { margin-top: .875rem; display: flex; flex-direction: column; gap: .5rem; }
.mc-skill-row {
  display: flex; align-items: center; gap: .625rem;
}
.mc-skill-name {
  width: 145px; font-size: 12px; color: var(--t2); font-weight: 500; flex-shrink: 0;
}
.mc-skill-track {
  flex: 1; height: 5px; background: var(--bg3); border-radius: 99px; overflow: hidden;
}
.mc-skill-fill {
  height: 100%; border-radius: 99px; transition: width 1.1s ease-out;
}
.mc-skill-pct {
  width: 34px; text-align: right; font-size: 11.5px; font-weight: 700;
}

.mc-status {
  margin-top: .875rem; margin-bottom: .875rem;
  font-size: 12.5px; font-weight: 500; color: var(--t2);
  padding: .5rem .875rem; border-radius: 9px;
  background: var(--bg2); border-left: 3px solid var(--gr);
}
.mc-status.ok   { border-left-color: var(--gr); color: var(--gr); background: var(--gr-l); }
.mc-status.warn { border-left-color: var(--am); color: #92400e; background: var(--am-l); }

.btn-continue {
  display: inline-flex; align-items: center; justify-content: center; gap: 7px;
  width: 100%; padding: .7rem;
  background: linear-gradient(135deg, #818cf8, #a78bfa) !important;
  color: #ffffff !important;
  -webkit-text-fill-color: #ffffff !important;
  font-family: var(--fnt); font-size: .9rem; font-weight: 700;
  border: none; border-radius: 12px; cursor: pointer;
  box-shadow: 0 3px 14px rgba(129,140,248,.4);
  transition: all .2s; letter-spacing: -.01em;
  text-shadow: 0 1px 3px rgba(0,0,0,.15);
}
.btn-continue:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(129,140,248,.5); }

/* icon helpers */
.ic-amber { color: var(--am); }
.ic-red   { color: var(--rd); }
.ic-green { color: var(--gr); }

/* ════════════════════════════
   COURSE CARDS
════════════════════════════ */
.course-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}
@media(max-width:900px){ .course-cards { grid-template-columns: repeat(2,1fr); } }
@media(max-width:560px){ .course-cards { grid-template-columns: 1fr; } }

.course-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all .2s ease;
  box-shadow: var(--shadow);
}
.course-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 28px rgba(0,0,0,.1);
  border-color: rgba(129,140,248,.25);
}
.cc-thumb {
  height: 100px; width: 100%;
  display: flex; align-items: center; justify-content: center;
  position: relative;
}
.cc-thumb-icon { color: rgba(255,255,255,.85); }
.cc-tag {
  position: absolute; top: 8px; left: 8px;
  font-size: 10.5px; font-weight: 700; color: rgba(255,255,255,.9);
  background: rgba(0,0,0,.28); padding: 2px 8px; border-radius: 99px;
  backdrop-filter: blur(4px);
  text-transform: uppercase; letter-spacing: .05em;
}
.cc-body { padding: .875rem; }
.cc-title {
  font-size: .85rem; font-weight: 700; color: var(--t1);
  line-height: 1.35; margin-bottom: .5rem;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.cc-meta-row {
  display: flex; align-items: center; gap: .875rem;
}
.cc-stat {
  display: flex; align-items: center; gap: 4px;
  font-size: 11.5px; font-weight: 600; color: var(--t3);
}
.cc-prog-row {
  display: flex; align-items: center; gap: .5rem; margin-bottom: .375rem;
}
.cc-prog-track { flex:1; height: 4px; background: var(--bg3); border-radius: 99px; overflow: hidden; }
.cc-prog-fill  { height: 100%; background: linear-gradient(90deg,var(--in),var(--vi)); border-radius: 99px; }
.cc-prog-pct   { font-size: 11px; font-weight: 700; color: var(--in); min-width: 30px; text-align: right; }

/* ════════════════════════════
   QUIZ / TEST SECTION
════════════════════════════ */
.quiz-list { display: flex; flex-direction: column; gap: .75rem; }

.quiz-item {
  display: flex; align-items: center; gap: 1rem;
  padding: 1rem 1.1rem;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 14px;
  box-shadow: var(--shadow);
  transition: all .18s;
}
.quiz-item:hover { border-color: rgba(129,140,248,.2); transform: translateX(2px); }

.qi-cover {
  width: 52px; height: 64px; border-radius: 10px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.qi-icon { color: rgba(255,255,255,.9); }

.qi-body { flex: 1; min-width: 0; }
.qi-top  { margin-bottom: 4px; }
.qi-badge {
  display: inline-block; font-size: 10.5px; font-weight: 700;
  padding: 2px 9px; border-radius: 99px;
  text-transform: uppercase; letter-spacing: .04em;
}
.qi-badge.doing { background: var(--bl-l); color: var(--bl); }
.qi-badge.new   { background: var(--gr-l); color: var(--gr); }
.qi-badge.done  { background: var(--bg3); color: var(--t3); }

.qi-title { font-size: .9rem; font-weight: 700; color: var(--t1); margin-bottom: 3px; }
.qi-sub   { font-size: 12px; color: var(--t3); }

.btn-quiz {
  display: inline-flex; align-items: center; gap: 5px;
  padding: .5rem 1.25rem; flex-shrink: 0;
  background: linear-gradient(135deg, #818cf8, #a78bfa) !important;
  color: #ffffff !important;
  -webkit-text-fill-color: #ffffff !important;
  font-family: var(--fnt); font-size: .8rem; font-weight: 700;
  border: none; border-radius: 10px; cursor: pointer;
  box-shadow: 0 2px 10px rgba(129,140,248,.35); transition: all .18s;
  text-shadow: 0 1px 3px rgba(0,0,0,.15);
}
.btn-quiz:hover { transform: scale(1.04); box-shadow: 0 4px 14px rgba(129,140,248,.45); }

/* ════════════════════════════
   RIGHT RAIL CARDS
════════════════════════════ */
.rail-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 18px;
  padding: 1.25rem 1.35rem;
  box-shadow: var(--shadow);
}
.rc-hd {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: .875rem;
}
.rc-title { font-size: .9rem; font-weight: 700; color: var(--t1); }
.notif-count {
  background: var(--rd); color: #fff;
  font-size: 11px; font-weight: 700;
  padding: 2px 8px; border-radius: 99px;
}
.rc-label {
  font-size: 12px; font-weight: 700; text-transform: uppercase;
  letter-spacing: .07em; color: var(--t3); margin-bottom: .625rem;
}
.rc-label.mt-md { margin-top: 1rem; }

/* Level Track */
.level-track {
  display: flex; align-items: center; gap: 0;
  padding: .25rem 0 .75rem;
}
.lt-step {
  display: flex; flex-direction: column; align-items: center; gap: 4px; flex: 1;
}
.lt-dot {
  width: 28px; height: 28px; border-radius: 50%;
  background: var(--bg3); border: 2px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  color: var(--t3);
}
.lt-step.done .lt-dot { background: var(--gr-l); border-color: var(--gr); color: var(--gr); }
.current-dot { background: var(--in-l) !important; border-color: var(--in) !important; color: var(--in) !important; }
.target-dot  { background: var(--am-l) !important; border-color: var(--am) !important; color: var(--am) !important; }

.lt-line {
  flex: 1; height: 2px; background: var(--border); margin-top: -24px; z-index: 0;
  align-self: center; margin-left: -4px; margin-right: -4px;
}
.lt-line.done { background: var(--gr); }

.lt-lbl   { font-size: 11px; font-weight: 600; color: var(--t3); margin-top: 2px; }
.lt-score { font-size: 1rem; font-weight: 800; }
.entry-score   { color: var(--gr); }
.current-score { color: var(--in); }
.target-score  { color: var(--am); }

/* Summary list */
.summary-list { display: flex; flex-direction: column; gap: .375rem; }
.sl-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: .45rem 0;
  border-bottom: 1px solid var(--border);
}
.sl-row:last-child { border-bottom: none; }
.sl-label { font-size: 12.5px; color: var(--t2); }
.sl-val   { font-size: 13px; font-weight: 700; }

/* HR messages */
.msg-list { display: flex; flex-direction: column; gap: .5rem; margin-bottom: .75rem; }
.msg-item {
  display: flex; gap: .625rem;
  padding: .65rem .75rem;
  border-radius: 11px;
  background: var(--bg2);
  border: 1px solid var(--border);
}
.msg-item.unread { background: rgba(239,68,68,.05); border-color: rgba(239,68,68,.18); }
.msg-from-icon {
  width: 28px; height: 28px; border-radius: 50%;
  background: var(--rd-l); color: var(--rd);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.msg-body { flex: 1; }
.msg-from { font-size: 11.5px; font-weight: 700; color: var(--t1); margin-bottom: 2px; }
.msg-text { font-size: 12px; color: var(--t2); line-height: 1.45; margin-bottom: 3px; }
.msg-time { font-size: 11px; color: var(--t3); }
.rc-empty { font-size: 12.5px; color: var(--t3); margin-bottom: .75rem; }

.btn-view-detail {
  display: block; width: 100%;
  padding: .6rem;
  background: rgba(129,140,248,.1) !important;
  color: #6366f1 !important;
  -webkit-text-fill-color: #6366f1 !important;
  font-family: var(--fnt); font-size: .84rem; font-weight: 700;
  border: 1.5px solid rgba(129,140,248,.25); border-radius: 11px;
  cursor: pointer; text-align: center; transition: all .18s;
}
.btn-view-detail:hover {
  background: #818cf8 !important;
  color: #ffffff !important;
  -webkit-text-fill-color: #ffffff !important;
  border-color: transparent;
}

/* Badges */
.badge-grid {
  display: grid; grid-template-columns: repeat(3,1fr); gap: .75rem;
}
.badge-item { display: flex; flex-direction: column; align-items: center; gap: 5px; }
.badge-circle {
  width: 44px; height: 44px; border-radius: 12px;
  background: var(--vi-l); color: var(--vi);
  border: 1.5px solid rgba(167,139,250,.18);
  display: flex; align-items: center; justify-content: center;
  transition: all .18s;
}
.badge-item:hover .badge-circle { background: var(--vi); color: #fff; transform: scale(1.08); box-shadow: 0 4px 12px rgba(167,139,250,.3); }
.badge-name { font-size: 10.5px; color: var(--t3); font-weight: 500; text-align: center; }

/* Certs */
.cert-list { display: flex; flex-direction: column; gap: .375rem; }
.cert-item { display: flex; align-items: center; gap: .625rem; padding: .45rem 0; border-bottom: 1px solid var(--border); }
.cert-item:last-child { border-bottom: none; }
.cert-icon { width: 28px; height: 28px; border-radius: 8px; background: var(--am-l); color: var(--am); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.cert-info { flex: 1; min-width: 0; }
.cert-name { font-size: .82rem; font-weight: 600; color: var(--t1); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cert-date { font-size: 11px; color: var(--t3); }

/* ════════════════════════════
   LOADING
════════════════════════════ */
.dash-loading {
  height: 60vh; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 1rem;
}
.dash-loading p { font-size: 13px; color: var(--t3); }
.loader {
  width: 36px; height: 36px;
  border: 3px solid var(--border); border-top-color: var(--in);
  border-radius: 50%; animation: spin .85s linear infinite;
}

/* ════════════════════════════
   ANIMATIONS
════════════════════════════ */
@keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
@keyframes spin   { to { transform:rotate(360deg) } }

/* ════════════════════════════
   RESPONSIVE
════════════════════════════ */
@media(max-width:768px){
  .dash { padding: 1rem 1rem 2.5rem; }
  .goals-bubble { display: none; }
  .goals-mascot { display: none; }
  .task-right .btn-start { display: none; }
  .course-cards { grid-template-columns: repeat(2,1fr); }
  .mc-left { display: none; }
}
@media(max-width:480px){
  .course-cards { grid-template-columns: 1fr; }
}
</style>