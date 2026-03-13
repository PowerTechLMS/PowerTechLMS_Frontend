<template>
  <div class="premium-landing" :data-theme="theme">

    <!-- ── AMBIENT BG ── -->
    <div class="bg-canvas" aria-hidden="true">
      <div class="aurora aurora-1"></div>
      <div class="aurora aurora-2"></div>
      <div class="aurora aurora-3"></div>
      <div class="dot-grid"></div>
    </div>

    <!-- ═══════════════════ NAV ═══════════════════ -->
    <nav class="glass-nav">
      <div class="container nav-inner">
        <div class="logo-brand">
          <div class="logo-icon"><Zap :size="16" fill="currentColor" /></div>
          <span class="logo-name">EDU<span class="accent">POWER</span></span>
        </div>

        <div class="nav-pill-links">
          <a href="#features">Tính năng</a>
          <a href="#courses">Khóa học</a>
          <a href="#instructors">Giảng viên</a>
          <a href="#testimonials">Đánh giá</a>
        </div>

        <div class="nav-btns">
          <!-- Theme Toggle -->
          <button class="theme-toggle" @click="toggleTheme" :title="theme === 'dark' ? 'Chuyển Light' : 'Chuyển Dark'">
            <span class="toggle-track">
              <span class="toggle-thumb">
                <Sun v-if="theme === 'light'" :size="11" />
                <Moon v-else :size="11" />
              </span>
            </span>
          </button>
          <RouterLink to="/login" class="btn-ghost-nav">Đăng nhập</RouterLink>
          <RouterLink to="/login" class="btn-nav-cta">Bắt đầu <ChevronRight :size="13" /></RouterLink>
        </div>
      </div>
    </nav>

    <!-- ═══════════════════ HERO ═══════════════════ -->
    <header class="hero-section" id="hero">
      <div class="container">
        <div class="hero-center-badge animate-pop">
          <span class="badge-dot"></span>
          <span>Hệ thống đào tạo nội bộ phiên bản 2026</span>
        </div>

        <h1 class="hero-headline animate-slide-up">
          Học tập<br /><span class="text-gradient">Không Giới Hạn</span>
        </h1>

        <p class="hero-sub animate-slide-up" style="animation-delay:0.1s">
          Nền tảng tri thức dành riêng cho nhân sự EDUPOWER. Tích hợp AI, lộ trình cá nhân hóa và hệ thống chứng chỉ số chuẩn quốc tế.
        </p>

        <div class="hero-cta-row animate-slide-up" style="animation-delay:0.18s">
          <button @click="router.push('/login')" class="btn btn-primary btn-lg">
            TRẢI NGHIỆM NGAY <ArrowRight :size="16" />
          </button>
          <button @click="router.push('/login')" class="btn btn-secondary btn-lg">
            <Play :size="14" /> Xem demo
          </button>
        </div>

        <div class="hero-proof animate-slide-up" style="animation-delay:0.26s">
          <div class="avatar-stack">
            <img v-for="i in 4" :key="i" :src="`https://i.pravatar.cc/100?img=${i+10}`" />
          </div>
          <div class="proof-sep"></div>
          <span class="proof-text"><strong>{{ systemStats.totalStudents }}+</strong> nhân sự đang học</span>
          <div class="proof-sep"></div>
          <div class="proof-stars">
            <Star v-for="n in 5" :key="n" :size="12" fill="currentColor" />
            <span>4.9 / 5</span>
          </div>
        </div>

        <!-- BENTO GRID -->
        <div class="hero-bento animate-fade-in" style="animation-delay:0.35s">
          <div class="bento-card bento-a glass">
            <div class="bento-eyebrow">Tổng quan học tập</div>
            <div class="bento-stats-row">
              <div class="bs-item">
                <span class="bs-val" style="color:var(--primary-400)">{{ systemStats.totalCourses }}</span>
                <span class="bs-lbl">Khóa học</span>
              </div>
              <div class="bs-sep"></div>
              <div class="bs-item">
                <span class="bs-val" style="color:var(--accent-400)">86%</span>
                <span class="bs-lbl">Hoàn thành</span>
              </div>
              <div class="bs-sep"></div>
              <div class="bs-item">
                <span class="bs-val" style="color:var(--primary-300)">{{ systemStats.totalInstructors }}</span>
                <span class="bs-lbl">Giảng viên</span>
              </div>
            </div>
            <div class="bento-prog-list">
              <div class="bprog-item" v-for="(c, idx) in realCourses.slice(0,3)" :key="c.id">
                <div class="bprog-dot" :style="{background: getBentoColor(idx)}"></div>
                <span class="bprog-name">{{ c.title }}</span>
                <div class="progress-bar">
                  <div class="progress-bar-fill" :style="{width:(75-idx*15)+'%'}"></div>
                </div>
                <span class="bprog-pct">{{ 75-idx*15 }}%</span>
              </div>
            </div>
          </div>

          <div class="bento-card bento-b bento-gradient">
            <Trophy :size="22" style="color:rgba(255,255,255,0.9);margin-bottom:8px" />
            <div class="bc-title">E-Certificate</div>
            <div class="bc-sub">Chứng nhận blockchain</div>
            <div class="bc-verified">✓ Verified</div>
          </div>

          <div class="bento-card bento-c glass">
            <div class="bento-eyebrow">Tiến độ tuần</div>
            <div class="bc-bigval">+24%</div>
            <TrendingUp :size="20" style="color:var(--primary-400);margin-top:auto" />
          </div>

          <div class="bento-card bento-d glass">
            <Star :size="16" fill="var(--warning-400)" style="color:var(--warning-400)" />
            <div class="bc-bigval">4.9★</div>
            <div class="bc-sub-plain">Đánh giá TB</div>
          </div>

          <div class="bento-card bento-e glass">
            <Award :size="16" style="color:var(--accent-400)" />
            <div class="bc-bigval">3</div>
            <div class="bc-sub-plain">Chứng chỉ</div>
          </div>
        </div>
      </div>
    </header>

    <!-- ═══════════════════ COMPANIES ═══════════════════ -->
    <section class="companies-bar">
      <div class="container">
        <p class="companies-label">Được tin dùng bởi nhân sự các đơn vị</p>
        <div class="companies-logos">
          <div class="company-logo" v-for="b in ['Vingroup','FPT Software','Techcombank','Masan Group','VNG Corp','VinAI Research']" :key="b">{{ b }}</div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════ STATS ═══════════════════ -->
    <section class="stats-section">
      <div class="container">
        <div class="stats-grid">
          <div class="stat-item" v-for="s in proofStats" :key="s.label">
            <div class="stat-icon-wrap" :style="{background: s.bg}">
              <component :is="s.icon" :size="18" :style="{color: s.color}" />
            </div>
            <div class="stat-val">{{ s.val }}</div>
            <div class="stat-lbl">{{ s.label }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════ FEATURES ═══════════════════ -->
    <section class="section-gap" id="features">
      <div class="container">
        <div class="section-head">
          <div class="section-eyebrow">Tính năng nổi bật</div>
          <h2 class="section-title">Trải nghiệm học tập<br /><span class="text-gradient">khác biệt</span></h2>
        </div>
        <div class="features-asymmetric">
          <div class="feat-hero-card">
            <div class="feat-hero-glow"></div>
            <div class="feat-hero-content">
              <span class="badge badge-primary" style="background:rgba(255,255,255,0.15);color:white;border:1px solid rgba(255,255,255,0.2)">AI-powered</span>
              <h3 class="fhc-title">Lộ trình thông minh do AI điều phối</h3>
              <p class="fhc-desc">Hệ thống phân tích kỹ năng hiện tại, xác định điểm thiếu hụt và tự động xây dựng lộ trình học tập cá nhân hóa — chính xác đến từng bước.</p>
              <div class="fhc-tags">
                <span class="fhc-tag">Machine Learning</span>
                <span class="fhc-tag">Skill Graph</span>
                <span class="fhc-tag">Auto-recommend</span>
              </div>
            </div>
            <div class="fhc-network">
              <div class="net-center"><Target :size="12" /><span>Bạn</span></div>
              <div class="net-node n1"><BookOpen :size="10" /></div>
              <div class="net-node n2"><Award :size="10" /></div>
              <div class="net-node n3"><Star :size="10" /></div>
              <svg class="net-lines" viewBox="0 0 180 150" fill="none">
                <line x1="60" y1="75" x2="130" y2="28" stroke="rgba(165,180,252,0.4)" stroke-width="1" stroke-dasharray="4 3"/>
                <line x1="60" y1="75" x2="138" y2="90" stroke="rgba(192,132,252,0.4)" stroke-width="1" stroke-dasharray="4 3"/>
                <line x1="60" y1="75" x2="110" y2="128" stroke="rgba(165,180,252,0.3)" stroke-width="1" stroke-dasharray="4 3"/>
              </svg>
            </div>
          </div>

          <div class="feat-mini-stack">
            <div class="feat-mini" v-for="f in features.filter((_,i)=>i!==1)" :key="f.title">
              <div class="fm-icon-wrap">
                <component :is="f.icon" :size="17" />
              </div>
              <div class="fm-body">
                <div class="fm-num">{{ f.num }}</div>
                <h4 class="fm-title">{{ f.title }}</h4>
                <p class="fm-desc">{{ f.desc }}</p>
              </div>
              <span class="badge badge-primary fm-badge">{{ f.tag }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════ COURSES ═══════════════════ -->
    <section class="section-gap section-alt" id="courses">
      <div class="container">
        <div class="section-head-row">
          <div>
            <div class="section-eyebrow">Thư viện tri thức</div>
            <h2 class="section-title">Các khóa học mới nhất</h2>
          </div>
          <button @click="router.push('/login')" class="btn btn-secondary">Xem tất cả <ChevronRight :size="13" /></button>
        </div>
        <div class="courses-grid">
          <div class="course-card" v-for="(c, idx) in realCourses.slice(0, 4)" :key="c.id">
            <div class="cc-cover" :style="{background: getCoverGrad(idx)}">
              <img v-if="c.coverImageUrl" :src="getImageUrl(c.coverImageUrl)" class="cc-cover-img" />
              <div v-else class="cc-cover-icon"><BookOpen :size="26" /></div>
              <span class="cc-cat-badge">{{ c.categoryName || 'Chung' }}</span>
              <span class="cc-rating-badge"><Star :size="10" fill="var(--warning-400)" style="color:var(--warning-400)" /> 4.9</span>
            </div>
            <div class="cc-body">
              <span class="cc-edition">2026 EDITION</span>
              <h4 class="cc-title">{{ c.title }}</h4>
              <div class="cc-meta">
                <span><Users :size="10" /> {{ c.enrollmentCount }}</span>
                <span><BookOpen :size="10" /> {{ c.lessonCount }} bài</span>
                <span><Clock :size="10" /> Online</span>
              </div>
              <div class="cc-footer">
                <div class="cc-ins">
                  <div class="cc-avatar">{{ c.createdByName?.charAt(0) }}</div>
                  <span>{{ c.createdByName }}</span>
                </div>
                <button @click="router.push('/login')" class="btn btn-primary btn-sm">Tham gia</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════ INSTRUCTORS ═══════════════════ -->
    <section class="section-gap" id="instructors">
      <div class="container">
        <div class="section-head text-center">
          <div class="section-eyebrow">Đội ngũ chuyên gia</div>
          <h2 class="section-title">Học từ những <span class="text-gradient">người giỏi nhất</span></h2>
        </div>
        <div class="instructors-grid">
          <div class="ins-card" v-for="(ins, idx) in instructorCards" :key="ins.name">
            <div class="ins-top" :style="{background: getCoverGrad(idx)}">
              <div class="ins-avatar-ring">
                <div class="ins-avatar">{{ ins.name.charAt(0) }}</div>
              </div>
            </div>
            <div class="ins-body">
              <h4 class="ins-name">{{ ins.name }}</h4>
              <p class="ins-role">{{ ins.role }}</p>
              <p class="ins-company">{{ ins.company }}</p>
              <div class="ins-chips">
                <span class="badge badge-primary"><BookOpen :size="10" /> {{ ins.courses }}</span>
                <span class="badge badge-warning"><Star :size="10" /> {{ ins.rating }}</span>
                <span class="badge badge-primary"><Users :size="10" /> {{ ins.students }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════ TESTIMONIALS ═══════════════════ -->
    <section class="section-gap section-alt" id="testimonials">
      <div class="container">
        <div class="section-head text-center">
          <div class="section-eyebrow">Học viên nói gì</div>
          <h2 class="section-title">Hàng trăm người <span class="text-gradient">đã thay đổi</span></h2>
        </div>
        <div class="testimonials-grid">
          <div class="testi-card" v-for="t in testimonials" :key="t.name" :class="{'testi-featured': t.featured}">
            <div class="testi-quote-mark">"</div>
            <p class="testi-quote">{{ t.text }}</p>
            <div class="testi-footer">
              <div class="testi-stars">
                <Star v-for="n in 5" :key="n" :size="11" fill="var(--warning-400)" style="color:var(--warning-400)" />
              </div>
              <div class="testi-author">
                <img :src="`https://i.pravatar.cc/48?img=${t.img}`" class="testi-avatar" />
                <div>
                  <div class="testi-name">{{ t.name }}</div>
                  <div class="testi-role">{{ t.role }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════ CTA ═══════════════════ -->
    <section class="cta-section">
      <div class="cta-inner">
        <div class="cta-ring r1"></div>
        <div class="cta-ring r2"></div>
        <div class="cta-ring r3"></div>
        <div class="cta-content">
          <div class="section-eyebrow" style="color:var(--primary-300)">Bắt đầu ngay hôm nay</div>
          <h2 class="cta-headline">Sẵn sàng để<br /><em class="cta-em">bứt phá sự nghiệp?</em></h2>
          <p class="cta-sub">Hãy tham gia cùng {{ systemStats.totalStudents }} đồng nghiệp để cùng nhau xây dựng EDUPOWER vững mạnh.</p>
          <div class="cta-urgency">
            <span class="urgency-tag"><Check :size="12" /> Miễn phí 7 ngày</span>
            <span class="urgency-tag"><Check :size="12" /> Không cần thẻ</span>
            <span class="urgency-tag"><Check :size="12" /> Hủy bất cứ lúc nào</span>
          </div>
          <div class="cta-btns">
            <button @click="router.push('/login')" class="btn btn-cta-white btn-lg">BẮT ĐẦU MIỄN PHÍ <ArrowRight :size="16" /></button>
            <button @click="router.push('/login')" class="btn btn-cta-ghost btn-lg">Đăng nhập <ChevronRight :size="14" /></button>
          </div>
        </div>
        <div class="cta-pills">
          <div class="cta-pill" v-for="s in ctaPills" :key="s.label">
            <component :is="s.icon" :size="14" style="color:var(--primary-300)" />
            <span class="cp-val">{{ s.val }}</span>
            <span class="cp-lbl">{{ s.label }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════ FOOTER ═══════════════════ -->
    <footer class="landing-footer">
      <div class="container">
        <div class="footer-main">
          <div class="footer-brand">
            <div class="logo-brand mb-3">
              <div class="logo-icon"><Zap :size="15" fill="currentColor" /></div>
              <span class="logo-name">EDU<span class="accent">POWER</span></span>
            </div>
            <p class="footer-tagline">Nền tảng đào tạo nội bộ thế hệ mới cho nhân sự EDUPOWER.</p>
            <div class="footer-socials">
              <a href="#" class="fsocial"><Github :size="14" /></a>
              <a href="#" class="fsocial"><Linkedin :size="14" /></a>
            </div>
          </div>
          <div class="footer-col" v-for="col in footerCols" :key="col.h">
            <div class="footer-col-head">{{ col.h }}</div>
            <a href="#" class="footer-link" v-for="l in col.links" :key="l">{{ l }}</a>
          </div>
        </div>
        <div class="footer-bottom">
          <span class="footer-copy">© 2026 EDUPOWER LMS. Build with Precision.</span>
          <div class="footer-bottom-links">
            <a href="#" class="footer-link">Điều khoản</a>
            <a href="#" class="footer-link">Bảo mật</a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
// @ts-ignore
import { courseAPI } from '@/services/api';
import {
  Zap, ChevronRight, ArrowRight, Layout, Target, CheckCircle, Trophy,
  BookOpen, Users, Clock, Star, Award, TrendingUp, Check, Play,
  Github, Linkedin, Sun, Moon
} from 'lucide-vue-next';

const router = useRouter();
const isLoading = ref(true);
const realCourses = ref<any[]>([]);
const systemStats = ref({ totalCourses: 0, totalStudents: 0, totalInstructors: 0 });

// ── Theme toggle ──
const theme = ref<'dark' | 'light'>(
  (localStorage.getItem('lms-theme') as 'dark' | 'light') || 'dark'
);
const toggleTheme = () => {
  theme.value = theme.value === 'dark' ? 'light' : 'dark';
  localStorage.setItem('lms-theme', theme.value);
};

const features = [
  { num:'01', icon: Layout,      title: 'Giao diện trực quan', desc: 'Thiết kế tinh giản giúp bạn tập trung vào nội dung bài giảng.',         tag: 'UX/UI'      },
  { num:'02', icon: Target,      title: 'Lộ trình thông minh', desc: 'AI tự động phân tích kỹ năng còn thiếu để đề xuất khóa học phù hợp.',    tag: 'AI-powered' },
  { num:'03', icon: CheckCircle, title: 'Chứng chỉ số',        desc: 'Xác thực kỹ năng với hệ thống Blockchain nội bộ chuẩn quốc tế.',         tag: 'Blockchain'  },
  { num:'04', icon: Zap,         title: 'Tương tác 1:1',       desc: 'Thảo luận trực tiếp với giảng viên và đồng nghiệp ngay trong bài học.', tag: 'Live'       },
];

const testimonials = [
  { name: 'Trương Anh Khoa',  role: 'Product Manager · FPT Software', text: 'Khóa học AI của EDUPower giúp tôi ứng dụng ngay vào công việc. Sau 3 tháng tôi đã được thăng chức.',    img: 15, featured: false },
  { name: 'Nguyễn Thu Trang', role: 'Data Analyst · Vingroup',         text: 'Lộ trình AI đề xuất hoàn toàn phù hợp với mục tiêu của tôi. Giao diện trực quan, học rất dễ theo dõi.', img: 22, featured: true  },
  { name: 'Lê Công Đức',      role: 'Team Lead · VNG Corp',            text: 'Hệ thống chứng chỉ blockchain rất ấn tượng và được nhiều nhà tuyển dụng trong ngành công nhận.',        img: 30, featured: false },
];

const proofStats = [
  { val: '450+', label: 'Nhân sự học tập', icon: Users,    color: 'var(--primary-400)', bg: 'rgba(99,102,241,0.12)'  },
  { val: '24+',  label: 'Khóa học nội bộ', icon: BookOpen, color: 'var(--accent-400)',  bg: 'rgba(168,85,247,0.12)'  },
  { val: '24/7', label: 'Học tập mọi lúc', icon: Clock,    color: 'var(--info-400)',    bg: 'rgba(14,165,233,0.12)'  },
  { val: '98%',  label: 'Đánh giá 5 sao',  icon: Star,     color: 'var(--warning-400)', bg: 'rgba(245,158,11,0.12)' },
];

const ctaPills = [
  { val: '450+', label: 'Nhân sự',  icon: Users },
  { val: '24+',  label: 'Khóa học', icon: BookOpen },
  { val: '98%',  label: 'Hài lòng', icon: Star },
  { val: '24/7', label: 'Hỗ trợ',   icon: Award },
];

const footerCols = [
  { h: 'Sản phẩm', links: ['Tính năng', 'Khóa học', 'Lộ trình AI', 'Chứng chỉ số'] },
  { h: 'Hỗ trợ',   links: ['FAQ', 'Liên hệ', 'Hướng dẫn', 'Cộng đồng'] },
  { h: 'Công ty',  links: ['Về chúng tôi', 'Blog', 'Tuyển dụng', 'Đối tác'] },
];

const uniqueInstructors = computed(() => {
  const map = new Map();
  realCourses.value.forEach(c => {
    if (!c.createdByName) return;
    if (map.has(c.createdByName)) map.get(c.createdByName).count++;
    else map.set(c.createdByName, { name: c.createdByName, count: 1 });
  });
  return Array.from(map.values()).slice(0, 4);
});

const instructorCards = computed(() => {
  const enriched = [
    { role: 'AI Engineer',  company: 'FPT Software', rating: '4.9', students: '1.2k' },
    { role: 'Agile Coach',  company: 'Vingroup',     rating: '4.8', students: '980'  },
    { role: 'Data Lead',    company: 'VNG Corp',     rating: '4.9', students: '2.1k' },
    { role: 'HR Director',  company: 'Techcombank',  rating: '4.7', students: '750'  },
  ];
  return uniqueInstructors.value.map((ins, i) => ({ ...ins, courses: ins.count, ...enriched[i % enriched.length] }));
});

const getImageUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `http://localhost:5100${url.startsWith('/') ? '' : '/'}${url}`;
};

const getCoverGrad = (idx: number) => {
  const g = [
    'linear-gradient(135deg,var(--primary-600),var(--primary-400))',
    'linear-gradient(135deg,var(--accent-600),var(--accent-400))',
    'linear-gradient(135deg,var(--info-600),var(--info-400))',
    'linear-gradient(135deg,var(--primary-700),var(--accent-500))',
  ];
  return g[idx % g.length];
};

const getBentoColor = (idx: number) =>
  ['var(--primary-400)','var(--accent-400)','var(--info-400)'][idx % 3];

onMounted(async () => {
  try {
    const res = await courseAPI.getAll({ page: 1, pageSize: 20, isPublished: true });
    realCourses.value = res.data.items || [];
    systemStats.value.totalCourses     = res.data.totalCount || realCourses.value.length;
    systemStats.value.totalStudents    = realCourses.value.reduce((a, c) => a + (c.enrollmentCount || 0), 0);
    systemStats.value.totalInstructors = uniqueInstructors.value.length || 5;
    if (systemStats.value.totalStudents < 100) systemStats.value.totalStudents = 450;
    if (systemStats.value.totalCourses === 0)  systemStats.value.totalCourses  = 24;
  } catch (e) {
    console.error('Lỗi landing:', e);
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Clash+Display:wght@400;500;600;700&family=Cabinet+Grotesk:wght@400;500;700;800;900&display=swap');

/* ══════════════════════════════════════
   DARK THEME — mirrors global design system
══════════════════════════════════════ */
.premium-landing {
  /* Backgrounds */
  --bg-primary:    #0f0f23;
  --bg-secondary:  #1a1a3e;
  --bg-tertiary:   #252550;
  --bg-card:       rgba(30,30,70,0.65);
  --bg-card-hover: rgba(40,40,90,0.85);
  --bg-glass:      rgba(255,255,255,0.05);
  /* Text */
  --text-primary:   #f1f5f9;
  --text-secondary: #94a3b8;
  --text-tertiary:  #64748b;
  /* Borders */
  --border-color:       rgba(255,255,255,0.08);
  --border-color-hover: rgba(255,255,255,0.16);
  /* Gradients */
  --gradient-primary: linear-gradient(135deg, #6366f1, #a855f7, #ec4899);
  --gradient-card:    linear-gradient(135deg, rgba(99,102,241,0.1), rgba(168,85,247,0.05));
  /* Shadows */
  --shadow-sm:   0 1px 3px rgba(0,0,0,0.3);
  --shadow-md:   0 4px 12px rgba(0,0,0,0.4);
  --shadow-lg:   0 8px 32px rgba(0,0,0,0.5);
  --shadow-glow: 0 0 20px rgba(99,102,241,0.3);
  /* Primary palette */
  --primary-50:  #eef2ff; --primary-100: #e0e7ff; --primary-200: #c7d2fe;
  --primary-300: #a5b4fc; --primary-400: #818cf8; --primary-500: #6366f1;
  --primary-600: #4f46e5; --primary-700: #4338ca; --primary-800: #3730a3; --primary-900: #312e81;
  /* Accent */
  --accent-400: #c084fc; --accent-500: #a855f7; --accent-600: #9333ea;
  /* Info */
  --info-400: #38bdf8; --info-500: #0ea5e9; --info-600: #0284c7; --info-700: #0369a1;
  /* Semantic */
  --warning-400: #fbbf24; --warning-500: #f59e0b; --warning-600: #d97706; --warning-700: #b45309; --warning-800: #92400e;
  --success-400: #4ade80; --success-500: #22c55e;
  --danger-500: #ef4444;
  /* Radii */
  --radius-sm: 0.375rem; --radius-md: 0.5rem; --radius-lg: 0.75rem;
  --radius-xl: 1rem; --radius-2xl: 1.5rem; --radius-full: 9999px;
  /* Transitions */
  --transition-fast: 150ms cubic-bezier(0.4,0,0.2,1);
  --transition-base: 250ms cubic-bezier(0.4,0,0.2,1);
  --transition-slow: 350ms cubic-bezier(0.4,0,0.2,1);
  /* Spacing */
  --space-xs: 0.25rem; --space-sm: 0.5rem; --space-md: 1rem;
  --space-lg: 1.5rem; --space-xl: 2rem; --space-2xl: 3rem;
}

/* ══════════════════════════════════════
   LIGHT THEME
══════════════════════════════════════ */
.premium-landing[data-theme="light"] {
  --bg-primary:    #f8fafc;
  --bg-secondary:  #f1f5f9;
  --bg-tertiary:   #e2e8f0;
  --bg-card:       rgba(255,255,255,0.85);
  --bg-card-hover: rgba(255,255,255,0.98);
  --bg-glass:      rgba(255,255,255,0.65);
  --text-primary:   #0f172a;
  --text-secondary: #475569;
  --text-tertiary:  #94a3b8;
  --border-color:       rgba(0,0,0,0.07);
  --border-color-hover: rgba(0,0,0,0.14);
  --gradient-card: linear-gradient(135deg, rgba(99,102,241,0.05), rgba(168,85,247,0.02));
  --shadow-sm:   0 1px 3px rgba(0,0,0,0.08);
  --shadow-md:   0 4px 12px rgba(0,0,0,0.1);
  --shadow-lg:   0 8px 32px rgba(0,0,0,0.12);
  --shadow-glow: 0 0 20px rgba(99,102,241,0.15);
}

/* ══════════════════════════════════════
   BASE RESET
══════════════════════════════════════ */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.premium-landing {
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: 'Cabinet Grotesk', -apple-system, sans-serif;
  overflow-x: hidden;
  position: relative;
  transition: background var(--transition-slow), color var(--transition-slow);
}

/* ══════════════════════════════════════
   AMBIENT BACKGROUND
══════════════════════════════════════ */
.bg-canvas { position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; }
.aurora { position: absolute; border-radius: 50%; filter: blur(110px); mix-blend-mode: screen; transition: all 0.5s ease; }
.aurora-1 { width: 680px; height: 680px; top: -160px; right: -80px; background: rgba(99,102,241,0.22); }
.aurora-2 { width: 500px; height: 500px; bottom: 8%; left: -60px;  background: rgba(168,85,247,0.18); }
.aurora-3 { width: 350px; height: 350px; top: 42%; left: 36%;      background: rgba(236,72,153,0.1); }

.premium-landing[data-theme="light"] .aurora   { mix-blend-mode: multiply; }
.premium-landing[data-theme="light"] .aurora-1 { background: rgba(99,102,241,0.09); }
.premium-landing[data-theme="light"] .aurora-2 { background: rgba(168,85,247,0.07); }
.premium-landing[data-theme="light"] .aurora-3 { background: rgba(236,72,153,0.04); }

.dot-grid {
  position: absolute; inset: 0;
  background-image: radial-gradient(var(--border-color-hover) 1px, transparent 1px);
  background-size: 36px 36px; opacity: 0.55;
}

/* ══════════════════════════════════════
   LAYOUT UTILITIES
══════════════════════════════════════ */
.container { max-width: 1200px; margin: 0 auto; padding: 0 2rem; }
.section-gap { padding: 5.5rem 0; position: relative; z-index: 1; }
.section-alt { background: var(--bg-secondary); }
.text-center { text-align: center; }
.mb-3 { margin-bottom: 0.75rem; }

.section-eyebrow {
  font-size: 10px; font-weight: 800; letter-spacing: 3px;
  text-transform: uppercase; color: var(--primary-400); margin-bottom: 0.6rem;
}
.section-title {
  font-family: 'Clash Display', 'Cabinet Grotesk', sans-serif;
  font-size: 2.5rem; font-weight: 700; letter-spacing: -1.5px;
  line-height: 1.1; margin-bottom: 0.8rem; color: var(--text-primary);
}
.section-head { margin-bottom: 3rem; }
.section-head-row {
  display: flex; justify-content: space-between; align-items: flex-end;
  margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;
}
.text-gradient {
  background: var(--gradient-primary);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}

/* ══════════════════════════════════════
   DESIGN SYSTEM: CARD
══════════════════════════════════════ */
.card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  padding: var(--space-lg);
  transition: all var(--transition-base);
}
.card:hover {
  background: var(--bg-card-hover); border-color: var(--border-color-hover);
  box-shadow: var(--shadow-md); transform: translateY(-3px);
}
.glass {
  background: var(--bg-glass) !important;
  backdrop-filter: blur(16px) saturate(160%);
  -webkit-backdrop-filter: blur(16px) saturate(160%);
  border: 1px solid var(--border-color) !important;
}

/* ══════════════════════════════════════
   DESIGN SYSTEM: BUTTONS
══════════════════════════════════════ */
.btn {
  display: inline-flex; align-items: center; justify-content: center;
  gap: var(--space-sm); border-radius: var(--radius-md);
  font-weight: 700; font-size: 0.875rem;
  transition: all var(--transition-fast); white-space: nowrap;
  border: none; cursor: pointer; font-family: 'Cabinet Grotesk', sans-serif;
  position: relative; overflow: hidden; padding: 0.625rem 1.25rem;
}
.btn::after {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.12), transparent);
  opacity: 0; transition: opacity var(--transition-fast);
}
.btn:hover::after { opacity: 1; }

.btn-primary { background: var(--gradient-primary); color: white; box-shadow: var(--shadow-sm); }
.btn-primary:hover { box-shadow: var(--shadow-glow); transform: translateY(-1px); }

.btn-secondary {
  background: var(--bg-tertiary); color: var(--text-primary);
  border: 1px solid var(--border-color) !important;
}
.btn-secondary:hover { border-color: var(--border-color-hover) !important; background: var(--bg-card-hover); }

.btn-lg { padding: 0.85rem 1.8rem; font-size: 0.95rem; border-radius: var(--radius-lg); }
.btn-sm { padding: 0.35rem 0.85rem; font-size: 0.75rem; }

/* ══════════════════════════════════════
   DESIGN SYSTEM: BADGES
══════════════════════════════════════ */
.badge {
  display: inline-flex; align-items: center; gap: 3px;
  padding: 0.18rem 0.6rem; font-size: 0.72rem; font-weight: 700;
  border-radius: var(--radius-full); letter-spacing: 0.03em;
}
.badge-primary { background: rgba(99,102,241,0.15); color: var(--primary-400); }
.badge-warning  { background: rgba(245,158,11,0.15); color: var(--warning-400); }
.badge-success  { background: rgba(34,197,94,0.15);  color: var(--success-400); }

/* ══════════════════════════════════════
   DESIGN SYSTEM: PROGRESS BAR
══════════════════════════════════════ */
.progress-bar {
  width: 60px; height: 4px; flex-shrink: 0;
  background: var(--bg-tertiary); border-radius: var(--radius-full); overflow: hidden;
}
.progress-bar-fill {
  height: 100%; background: var(--gradient-primary);
  border-radius: var(--radius-full); transition: width var(--transition-slow);
}

/* ══════════════════════════════════════
   NAV
══════════════════════════════════════ */
.glass-nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
  padding: 0.85rem 0;
  background: color-mix(in srgb, var(--bg-primary) 78%, transparent);
  backdrop-filter: blur(24px) saturate(180%);
  border-bottom: 1px solid var(--border-color);
  transition: background var(--transition-slow);
}
.nav-inner { display: flex; align-items: center; justify-content: space-between; position: relative; }
.logo-brand { display: flex; align-items: center; gap: 8px; text-decoration: none; }
.logo-icon {
  width: 34px; height: 34px; background: var(--gradient-primary); color: white;
  border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: center;
  box-shadow: var(--shadow-glow);
}
.logo-name { font-family: 'Clash Display', sans-serif; font-weight: 700; font-size: 1.1rem; color: var(--text-primary); }
.accent { color: var(--primary-400); }

.nav-pill-links {
  position: absolute; left: 50%; transform: translateX(-50%);
  display: flex; background: var(--bg-glass); backdrop-filter: blur(12px);
  border: 1px solid var(--border-color); border-radius: var(--radius-full); padding: 4px;
}
.nav-pill-links a {
  color: var(--text-secondary); font-weight: 600; font-size: 13px;
  padding: 5px 16px; border-radius: var(--radius-full); text-decoration: none;
  transition: all var(--transition-fast);
}
.nav-pill-links a:hover { color: var(--primary-400); background: rgba(99,102,241,0.1); }

.nav-btns { display: flex; align-items: center; gap: 0.7rem; }
.btn-ghost-nav {
  color: var(--text-secondary); font-weight: 600; text-decoration: none;
  font-size: 14px; transition: color var(--transition-fast); padding: 6px 10px;
}
.btn-ghost-nav:hover { color: var(--primary-400); }
.btn-nav-cta {
  padding: 8px 18px; border-radius: var(--radius-lg);
  background: var(--gradient-primary); color: white;
  font-weight: 700; font-size: 13px; border: none; text-decoration: none;
  display: inline-flex; align-items: center; gap: 4px;
  transition: all var(--transition-fast); box-shadow: var(--shadow-sm);
  font-family: 'Cabinet Grotesk', sans-serif;
}
.btn-nav-cta:hover { box-shadow: var(--shadow-glow); transform: translateY(-1px); }

/* Theme Toggle */
.theme-toggle { background: none; border: none; cursor: pointer; padding: 3px; display: flex; align-items: center; }
.toggle-track {
  width: 44px; height: 24px; border-radius: var(--radius-full);
  background: var(--bg-tertiary); border: 1px solid var(--border-color);
  display: flex; align-items: center; padding: 2px;
  transition: all var(--transition-base);
}
.toggle-thumb {
  width: 20px; height: 20px; border-radius: 50%;
  background: var(--gradient-primary); display: flex; align-items: center;
  justify-content: center; color: white; box-shadow: var(--shadow-sm);
  transition: transform var(--transition-base);
}
.premium-landing[data-theme="light"] .toggle-thumb { transform: translateX(20px); }

/* ══════════════════════════════════════
   HERO
══════════════════════════════════════ */
.hero-section {
  position: relative; z-index: 1;
  padding-top: calc(64px + 5rem); padding-bottom: 4.5rem; text-align: center;
}
.hero-center-badge {
  display: inline-flex; align-items: center; gap: 8px;
  background: rgba(99,102,241,0.1); border: 1px solid rgba(99,102,241,0.25);
  border-radius: var(--radius-full); padding: 6px 16px; margin-bottom: 1.8rem;
  font-size: 12px; font-weight: 600; color: var(--primary-300);
}
.badge-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--primary-400); box-shadow: 0 0 0 3px rgba(99,102,241,0.25);
  animation: badge-pulse 2s ease infinite;
}
@keyframes badge-pulse {
  0%,100% { box-shadow: 0 0 0 3px rgba(99,102,241,0.25); }
  50%      { box-shadow: 0 0 0 6px rgba(99,102,241,0.08); }
}
.hero-headline {
  font-family: 'Clash Display', sans-serif;
  font-size: 5.5rem; font-weight: 700;
  line-height: 0.95; letter-spacing: -4px; margin-bottom: 1.4rem;
  color: var(--text-primary);
}
.hero-sub {
  font-size: 1.05rem; color: var(--text-secondary); line-height: 1.7;
  max-width: 490px; margin: 0 auto 2rem;
}
.hero-cta-row {
  display: flex; justify-content: center; align-items: center;
  gap: 12px; margin-bottom: 2.2rem; flex-wrap: wrap;
}
.hero-proof {
  display: inline-flex; align-items: center; gap: 14px;
  background: var(--bg-glass); backdrop-filter: blur(12px);
  border: 1px solid var(--border-color); border-radius: var(--radius-full);
  padding: 8px 20px; margin-bottom: 3.5rem;
  font-size: 12px; font-weight: 600; color: var(--text-secondary);
}
.avatar-stack { display: flex; }
.avatar-stack img { width: 26px; height: 26px; border-radius: 50%; border: 2px solid var(--bg-card); margin-left: -7px; object-fit: cover; }
.avatar-stack img:first-child { margin-left: 0; }
.proof-sep { width: 1px; height: 16px; background: var(--border-color); }
.proof-text strong { color: var(--text-primary); }
.proof-stars { display: flex; align-items: center; gap: 2px; color: var(--warning-400); }
.proof-stars span { font-size: 12px; font-weight: 700; color: var(--primary-300); margin-left: 4px; }

/* BENTO */
.hero-bento {
  max-width: 840px; margin: 0 auto;
  display: grid; grid-template-columns: 1.7fr 1fr 1fr; grid-template-rows: 1fr 1fr; gap: 12px;
}
.bento-card {
  border-radius: var(--radius-2xl) !important; padding: 1.3rem;
  transition: all var(--transition-base); text-align: left;
}
.bento-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg) !important; }
.bento-a { grid-column: 1; grid-row: 1 / 3; }
.bento-b { grid-column: 2; grid-row: 1; }
.bento-c { grid-column: 3; grid-row: 1; }
.bento-d { grid-column: 2; grid-row: 2; }
.bento-e { grid-column: 3; grid-row: 2; }
.bento-gradient { background: var(--gradient-primary) !important; border-color: transparent !important; }
.bento-eyebrow { font-size: 9px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: var(--primary-400); margin-bottom: 0.9rem; }
.bento-gradient .bento-eyebrow { color: rgba(255,255,255,0.55); }
.bento-stats-row { display: flex; align-items: center; margin-bottom: 1.1rem; }
.bs-item { flex: 1; text-align: center; }
.bs-val  { display: block; font-family: 'Clash Display', sans-serif; font-size: 1.6rem; font-weight: 700; letter-spacing: -1px; line-height: 1; }
.bs-lbl  { font-size: 9px; color: var(--text-tertiary); font-weight: 600; margin-top: 2px; }
.bs-sep  { width: 1px; height: 28px; background: var(--border-color); }
.bento-prog-list { display: flex; flex-direction: column; gap: 8px; }
.bprog-item  { display: flex; align-items: center; gap: 7px; }
.bprog-dot   { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
.bprog-name  { font-size: 11px; font-weight: 600; color: var(--text-secondary); flex: 1; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.bprog-pct   { font-size: 10px; font-weight: 700; color: var(--primary-400); width: 26px; text-align: right; flex-shrink: 0; }
.bc-title    { font-size: 14px; font-weight: 800; color: white; margin-bottom: 3px; }
.bc-sub      { font-size: 10px; color: rgba(255,255,255,0.55); margin-bottom: 10px; }
.bc-verified {
  display: inline-flex; align-items: center; background: rgba(255,255,255,0.18);
  color: white; font-size: 10px; font-weight: 700; padding: 4px 10px;
  border-radius: var(--radius-full); border: 1px solid rgba(255,255,255,0.25);
}
.bc-bigval {
  font-family: 'Clash Display', sans-serif;
  font-size: 2rem; font-weight: 700; letter-spacing: -1px;
  color: var(--primary-400); line-height: 1; margin: 4px 0;
}
.bc-sub-plain { font-size: 10px; color: var(--text-tertiary); font-weight: 600; }

/* ══════════════════════════════════════
   COMPANIES
══════════════════════════════════════ */
.companies-bar {
  position: relative; z-index: 1; padding: 2rem 0;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color);
}
.companies-label { font-size: 10px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: var(--text-tertiary); text-align: center; margin-bottom: 1.2rem; }
.companies-logos { display: flex; justify-content: center; align-items: center; gap: 2.5rem; flex-wrap: wrap; }
.company-logo { font-size: 13px; font-weight: 800; color: var(--text-tertiary); transition: var(--transition-fast); cursor: default; }
.company-logo:hover { color: var(--primary-400); }

/* ══════════════════════════════════════
   STATS
══════════════════════════════════════ */
.stats-section { position: relative; z-index: 1; padding: 4rem 0; background: var(--bg-secondary); }
.stats-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 2rem; max-width: 800px; margin: 0 auto; }
.stat-item { display: flex; flex-direction: column; align-items: center; gap: 7px; text-align: center; }
.stat-icon-wrap { width: 44px; height: 44px; border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: center; }
.stat-val { font-family: 'Clash Display', sans-serif; font-size: 2.1rem; font-weight: 700; letter-spacing: -2px; color: var(--text-primary); line-height: 1; }
.stat-lbl { font-size: 11px; color: var(--text-tertiary); font-weight: 600; }

/* ══════════════════════════════════════
   FEATURES
══════════════════════════════════════ */
.features-asymmetric { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 18px; }
.feat-hero-card {
  background: linear-gradient(140deg, var(--primary-600) 0%, var(--primary-800) 100%);
  border-radius: var(--radius-2xl); padding: 3rem;
  position: relative; overflow: hidden; min-height: 420px; display: flex; flex-direction: column;
}
.feat-hero-glow {
  position: absolute; width: 300px; height: 300px; border-radius: 50%;
  background: rgba(168,85,247,0.3); filter: blur(80px);
  top: -60px; right: -60px; pointer-events: none;
}
.feat-hero-content { position: relative; z-index: 1; display: flex; flex-direction: column; gap: 0.8rem; }
.fhc-title { font-family: 'Clash Display', sans-serif; font-size: 1.7rem; font-weight: 700; color: white; line-height: 1.15; letter-spacing: -0.5px; }
.fhc-desc  { font-size: 14px; color: rgba(255,255,255,0.62); line-height: 1.7; max-width: 320px; }
.fhc-tags  { display: flex; gap: 7px; flex-wrap: wrap; }
.fhc-tag   { padding: 4px 11px; border-radius: var(--radius-full); font-size: 10px; font-weight: 700; background: rgba(255,255,255,0.12); color: rgba(255,255,255,0.82); border: 1px solid rgba(255,255,255,0.18); }
/* Network visual */
.fhc-network { position: absolute; right: 2rem; bottom: 2rem; width: 150px; height: 140px; }
.net-center  { position: absolute; top: 38%; left: 8%; display: flex; align-items: center; gap: 5px; background: rgba(255,255,255,0.95); color: var(--primary-700); font-size: 11px; font-weight: 800; padding: 8px 13px; border-radius: var(--radius-full); box-shadow: var(--shadow-md); }
.net-node    { position: absolute; width: 28px; height: 28px; border-radius: 50%; background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.25); display: flex; align-items: center; justify-content: center; color: white; }
.n1 { top: 8%; left: 64%; } .n2 { top: 62%; left: 72%; } .n3 { top: 80%; left: 42%; }
.net-lines { position: absolute; inset: 0; width: 100%; height: 100%; }

.feat-mini-stack { display: flex; flex-direction: column; gap: 12px; }
.feat-mini { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: 1.6rem; display: flex; align-items: flex-start; gap: 1rem; transition: all var(--transition-base); }
.feat-mini:hover { background: var(--bg-card-hover); border-color: var(--border-color-hover); transform: translateX(5px); box-shadow: var(--shadow-md); }
.fm-icon-wrap { width: 40px; height: 40px; border-radius: var(--radius-lg); flex-shrink: 0; background: var(--gradient-primary); color: white; display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-glow); }
.fm-body { flex: 1; }
.fm-num   { font-size: 9px; font-weight: 800; color: var(--primary-400); letter-spacing: 1px; margin-bottom: 2px; text-transform: uppercase; }
.fm-title { font-size: 14px; font-weight: 800; margin-bottom: 4px; color: var(--text-primary); }
.fm-desc  { font-size: 12px; color: var(--text-secondary); line-height: 1.6; }
.fm-badge { flex-shrink: 0; align-self: flex-start; }

/* ══════════════════════════════════════
   COURSES
══════════════════════════════════════ */
.courses-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; }
.course-card {
  background: var(--bg-card); border: 1px solid var(--border-color);
  border-radius: var(--radius-xl); overflow: hidden;
  transition: all var(--transition-base); display: flex; flex-direction: column;
}
.course-card:hover { background: var(--bg-card-hover); border-color: var(--border-color-hover); transform: translateY(-4px); box-shadow: var(--shadow-md); }
.cc-cover { height: 128px; position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center; }
.cc-cover-img { width: 100%; height: 100%; object-fit: cover; }
.cc-cover-icon { color: rgba(255,255,255,0.38); }
.cc-cat-badge { position: absolute; top: 10px; left: 10px; background: rgba(0,0,0,0.45); backdrop-filter: blur(8px); color: white; font-size: 9px; font-weight: 700; padding: 3px 8px; border-radius: var(--radius-full); }
.cc-rating-badge { position: absolute; top: 10px; right: 10px; background: rgba(255,255,255,0.9); color: var(--primary-700); font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: var(--radius-full); display: flex; align-items: center; gap: 3px; }
.cc-body { padding: 1rem; flex: 1; display: flex; flex-direction: column; gap: 4px; }
.cc-edition { font-size: 9px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: var(--primary-400); }
.cc-title { font-size: 13px; font-weight: 800; color: var(--text-primary); line-height: 1.35; margin-bottom: 4px; flex: 1; }
.cc-meta { display: flex; gap: 10px; }
.cc-meta span { display: inline-flex; align-items: center; gap: 3px; font-size: 10px; color: var(--text-tertiary); }
.cc-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 10px; border-top: 1px solid var(--border-color); margin-top: 4px; }
.cc-ins  { display: flex; align-items: center; gap: 6px; }
.cc-avatar { width: 22px; height: 22px; border-radius: 50%; background: var(--gradient-primary); color: white; font-size: 9px; font-weight: 800; display: flex; align-items: center; justify-content: center; }
.cc-ins span { font-size: 11px; color: var(--text-secondary); font-weight: 600; }

/* ══════════════════════════════════════
   INSTRUCTORS
══════════════════════════════════════ */
.instructors-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; }
.ins-card { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-xl); overflow: hidden; transition: all var(--transition-base); }
.ins-card:hover { background: var(--bg-card-hover); border-color: var(--border-color-hover); transform: translateY(-4px); box-shadow: var(--shadow-md); }
.ins-top { height: 76px; position: relative; display: flex; justify-content: center; }
.ins-avatar-ring { position: absolute; bottom: -24px; width: 50px; height: 50px; border-radius: 50%; border: 3px solid var(--bg-card); box-shadow: var(--shadow-md); }
.ins-avatar { width: 100%; height: 100%; border-radius: 50%; background: var(--gradient-primary); color: white; display: flex; align-items: center; justify-content: center; font-family: 'Clash Display', sans-serif; font-size: 20px; font-weight: 700; }
.ins-body { padding: 2rem 1rem 1.3rem; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 3px; }
.ins-name    { font-size: 14px; font-weight: 800; color: var(--text-primary); }
.ins-role    { font-size: 11px; color: var(--primary-400); font-weight: 700; }
.ins-company { font-size: 11px; color: var(--text-tertiary); margin-bottom: 10px; }
.ins-chips   { display: flex; gap: 5px; flex-wrap: wrap; justify-content: center; }

/* ══════════════════════════════════════
   TESTIMONIALS
══════════════════════════════════════ */
.testimonials-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; align-items: start; }
.testimonials-grid .testi-card:nth-child(2) { margin-top: 2rem; }
.testi-card { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: 1.8rem; display: flex; flex-direction: column; gap: 1.1rem; transition: all var(--transition-base); }
.testi-card:not(.testi-featured):hover { background: var(--bg-card-hover); border-color: var(--border-color-hover); transform: translateY(-3px); box-shadow: var(--shadow-md); }
.testi-featured { background: var(--gradient-primary) !important; border-color: transparent !important; }
.testi-quote-mark { font-size: 3.5rem; line-height: 1; color: var(--primary-400); font-family: Georgia, serif; height: 30px; }
.testi-featured .testi-quote-mark { color: rgba(255,255,255,0.3); }
.testi-quote { font-size: 13.5px; line-height: 1.75; color: var(--text-secondary); font-style: italic; flex: 1; }
.testi-featured .testi-quote { color: rgba(255,255,255,0.85); }
.testi-footer { display: flex; flex-direction: column; gap: 10px; }
.testi-stars  { display: flex; gap: 2px; }
.testi-author { display: flex; align-items: center; gap: 10px; }
.testi-avatar { width: 36px; height: 36px; border-radius: 50%; border: 2px solid var(--border-color); object-fit: cover; flex-shrink: 0; }
.testi-featured .testi-avatar { border-color: rgba(255,255,255,0.3); }
.testi-name { font-size: 13px; font-weight: 800; color: var(--text-primary); }
.testi-featured .testi-name { color: white; }
.testi-role { font-size: 11px; color: var(--text-tertiary); }
.testi-featured .testi-role { color: rgba(255,255,255,0.55); }

/* ══════════════════════════════════════
   CTA
══════════════════════════════════════ */
.cta-section { position: relative; z-index: 1; }
.cta-inner {
  position: relative; overflow: hidden;
  background: linear-gradient(140deg, #1e1b4b 0%, var(--primary-700) 50%, #312e81 100%);
  padding: 7rem 2rem 5rem; display: flex; flex-direction: column; align-items: center; text-align: center;
}
.cta-ring { position: absolute; border-radius: 50%; pointer-events: none; top: 50%; left: 50%; transform: translate(-50%,-50%); }
.r1 { width: 700px; height: 700px; border: 1px solid rgba(255,255,255,0.05); }
.r2 { width: 460px; height: 460px; border: 1px solid rgba(255,255,255,0.08); }
.r3 { width: 260px; height: 260px; border: 1px solid rgba(255,255,255,0.06); }
.cta-content { position: relative; z-index: 1; max-width: 560px; }
.cta-headline { font-family: 'Clash Display', sans-serif; font-size: 3.4rem; font-weight: 700; line-height: 1.1; letter-spacing: -2px; color: white; margin-bottom: 0.8rem; }
.cta-em  { font-style: italic; color: var(--primary-300); }
.cta-sub { font-size: 1rem; color: rgba(255,255,255,0.5); margin-bottom: 2rem; }
.cta-urgency { display: flex; justify-content: center; gap: 10px; margin-bottom: 2rem; flex-wrap: wrap; }
.urgency-tag { display: inline-flex; align-items: center; gap: 5px; font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.75); background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12); padding: 6px 14px; border-radius: var(--radius-full); }
.cta-btns { display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; }
.btn-cta-white { background: white !important; color: var(--primary-700) !important; font-weight: 800 !important; box-shadow: 0 10px 28px rgba(0,0,0,0.25) !important; }
.btn-cta-white:hover { transform: scale(1.04) translateY(-2px) !important; }
.btn-cta-ghost { background: rgba(255,255,255,0.1) !important; color: rgba(255,255,255,0.82) !important; border: 1px solid rgba(255,255,255,0.2) !important; }
.btn-cta-ghost:hover { background: rgba(255,255,255,0.18) !important; }
.cta-pills { display: flex; gap: 10px; margin-top: 3.5rem; position: relative; z-index: 1; flex-wrap: wrap; justify-content: center; }
.cta-pill { display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.08); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.12); border-radius: var(--radius-full); padding: 9px 18px; transition: var(--transition-fast); }
.cta-pill:hover { background: rgba(255,255,255,0.16); }
.cp-val { font-family: 'Clash Display', sans-serif; font-size: 1rem; font-weight: 700; color: white; letter-spacing: -0.5px; }
.cp-lbl { font-size: 11px; color: rgba(255,255,255,0.45); }

/* ══════════════════════════════════════
   FOOTER
══════════════════════════════════════ */
.landing-footer { background: var(--bg-secondary); padding: 4.5rem 0 0; position: relative; z-index: 1; border-top: 1px solid var(--border-color); }
.footer-main { display: grid; grid-template-columns: 210px repeat(3,1fr); gap: 3.5rem; margin-bottom: 3.5rem; }
.footer-tagline { font-size: 13px; color: #bac5d5; line-height: 1.6; max-width: 185px; margin: 0 0 1rem; }
.footer-socials { display: flex; gap: 7px; }
.fsocial { width: 32px; height: 32px; border-radius: var(--radius-md); background: var(--bg-glass); display: flex; align-items: center; justify-content: center; color: var(--text-tertiary); text-decoration: none; transition: var(--transition-fast); }
.fsocial:hover { background: rgba(99,102,241,0.15); color: var(--primary-400); }
.footer-col { display: flex; flex-direction: column; }
.footer-col-head { font-size: 10px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: #bac5d5; margin-bottom: 1.1rem; }
.footer-link { font-size: 13px; font-weight: 500; color:#bac5d5; text-decoration: none; margin-bottom: 0.6rem; transition: color var(--transition-fast); }
.footer-link:hover { color: var(--primary-400); }
.footer-bottom { border-top: 1px solid var(--border-color); padding: 1.4rem 0; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; color: #bac5d5; }
.footer-bottom-links { display: flex; gap: 1.5rem; }
.footer-copy { font-size: 12px; color: #bac5d5; }

/* ══════════════════════════════════════
   ANIMATIONS
══════════════════════════════════════ */
.animate-pop      { animation: popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) backwards; }
.animate-slide-up { animation: slideUp 0.85s cubic-bezier(0.2,0.8,0.2,1) backwards; }
.animate-fade-in  { animation: fadeIn 1s ease backwards; }
@keyframes popIn   { from { opacity:0; transform:scale(0.82); } to { opacity:1; transform:scale(1); } }
@keyframes slideUp { from { opacity:0; transform:translateY(32px); } to { opacity:1; transform:translateY(0); } }
@keyframes fadeIn  { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }

/* ══════════════════════════════════════
   RESPONSIVE
══════════════════════════════════════ */
@media (max-width: 1200px) {
  .courses-grid { grid-template-columns: repeat(2,1fr); }
  .instructors-grid { grid-template-columns: repeat(2,1fr); }
}
@media (max-width: 1024px) {
  .nav-pill-links { display: none; }
  .features-asymmetric { grid-template-columns: 1fr; }
  .hero-bento { grid-template-columns: 1fr 1fr 1fr; grid-template-rows: auto auto; }
  .bento-a { grid-column: 1 / 4; grid-row: 1; }
  .bento-b { grid-column: 1; grid-row: 2; } .bento-c { grid-column: 2; grid-row: 2; }
  .bento-d { grid-column: 3; grid-row: 2; } .bento-e { display: none; }
  .footer-main { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 768px) {
  .hero-headline { font-size: 3.5rem; letter-spacing: -3px; }
  .hero-bento { grid-template-columns: 1fr 1fr; }
  .bento-a { grid-column: 1 / 3; } .bento-d { display: none; }
  .testimonials-grid { grid-template-columns: 1fr; }
  .testimonials-grid .testi-card:nth-child(2) { margin-top: 0; }
  .stats-grid { grid-template-columns: repeat(2,1fr); }
  .cta-headline { font-size: 2.4rem; }
  .section-head-row { flex-direction: column; align-items: flex-start; }
  .courses-grid { grid-template-columns: 1fr; }
}
@media (max-width: 480px) {
  .hero-headline { font-size: 2.8rem; letter-spacing: -2px; }
  .hero-bento { grid-template-columns: 1fr; }
  .bento-a, .bento-b, .bento-c { grid-column: 1; grid-row: auto; }
  .instructors-grid { grid-template-columns: 1fr; }
  .footer-main { grid-template-columns: 1fr; }
  .hero-cta-row { flex-direction: column; }
  .btn-lg { width: 100%; justify-content: center; }
}
</style>