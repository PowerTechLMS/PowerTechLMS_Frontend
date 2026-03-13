<template>
  <div class="verify-page">
    <div class="bg-decor deco-1"></div>
    <div class="bg-decor deco-2"></div>

    <div class="verify-container">
      
      <div v-if="loading" class="verify-status-card glass animate-fade-in text-center py-5">
        <div class="premium-spinner mx-auto mb-4"></div>
        <h3 class="fw-bold text-dark">Đang kiểm tra dữ liệu...</h3>
        <p class="text-tertiary">Vui lòng chờ trong giây lát để hệ thống tra cứu mã xác thực.</p>
      </div>

      <div v-else-if="notFound" class="verify-status-card glass danger animate-fade-in text-center py-5">
        <div class="status-icon danger mx-auto mb-4">
          <XCircle :size="48" />
        </div>
        <h2 class="fw-bold text-danger mb-3">Chứng chỉ không hợp lệ</h2>
        <p class="text-secondary mb-4">Rất tiếc, mã xác thực <strong>{{ route.params.code }}</strong> không tồn tại trong hệ thống.</p>
        <button class="btn-glass-primary" @click="router.push('/')">
          <Home :size="18" class="me-2" /> Về trang chủ
        </button>
      </div>

      <div v-else-if="cert && cert.status === 'Revoked'" class="verify-status-card glass warning animate-fade-in text-center py-5">
        <div class="status-icon warning mx-auto mb-4">
          <AlertTriangle :size="48" />
        </div>
        <h2 class="fw-bold text-warning-700 mb-3">Chứng chỉ đã bị thu hồi</h2>
        <p class="text-secondary mb-4">Chứng chỉ mang mã <strong>{{ cert.certificateCode }}</strong> đã bị vô hiệu hóa bởi Ban Quản trị.</p>
        <button class="btn-glass-primary" @click="router.push('/')">
          <Home :size="18" class="me-2" /> Về trang chủ
        </button>
      </div>

      <div v-else-if="cert && (cert.status === 'Issued' || cert.status === 'Valid')" class="success-container animate-fade-in">
        
        <div class="status-banner valid mb-4 shadow-sm">
          <ShieldCheck :size="40" class="text-success flex-shrink-0" />
          <div class="text-start">
            <h3 class="fw-bold text-success mb-1">Xác Thực Thành Công!</h3>
            <p class="text-dark mb-0 fs-15">
              Hệ thống xác nhận mã <strong>{{ cert.certificateCode }}</strong> là hoàn toàn hợp lệ.
            </p>
          </div>
        </div>

        <div class="certificate-wrapper">
          <div class="cert-modern-container shadow-premium">
            <div class="cert-modern-border-outer">
              <div class="cert-modern-border-inner">
                
                <div class="cert-watermark">
                  <Award :size="300" :stroke-width="0.5" />
                </div>

                <div class="cert-content">
                  <div class="cert-header-icon">
                    <GraduationCap :size="42" />
                  </div>

                  <h1 class="cert-title">{{ templateConfig.TitleText }}</h1>
                  
                  <div class="cert-ornament-line">
                    <span class="line"></span>
                    <Star :size="12" class="star-icon" />
                    <span class="line"></span>
                  </div>

                  <p class="cert-presented-text">Giấy chứng nhận này được trân trọng trao tặng cho</p>
                  
                  <h2 class="cert-student-name">{{ cert.userName }}</h2>
                  
                  <p class="cert-body-text">{{ templateConfig.BodyText }}</p>
                  
                  <h3 class="cert-course-name">{{ cert.courseTitle }}</h3>

                  <div class="cert-footer">
                    <div class="cert-footer-col">
                      <p class="cert-val text-dark">{{ formatDate(cert.issuedAt) }}</p>
                      <div class="cert-signature-line"></div>
                      <p class="cert-label">NGÀY CẤP PHÁT</p>
                    </div>

                    <div class="cert-footer-col seal-col">
                      <div class="golden-seal">
                        <div class="golden-seal-inner">
                          <ShieldCheck :size="24" />
                          <span>OFFICIAL</span>
                        </div>
                      </div>
                      <div class="cert-id-tag">ID: {{ cert.certificateCode }}</div>
                    </div>

                    <div class="cert-footer-col">
                      <p class="cert-val signature-font">{{ templateConfig.SignatureName }}</p>
                      <div class="cert-signature-line"></div>
                      <p class="cert-label">{{ templateConfig.SignatureTitle }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="d-flex justify-content-center gap-3 mt-5">
          <button class="btn-premium-gradient" @click="downloadAsImage">
            <Download :size="18" class="me-2" /> Tải bản in (PDF)
          </button>
          <button class="btn-glass-secondary" @click="router.push('/')">
            <Home :size="18" class="me-2" /> Về trang chủ
          </button>
        </div>
      </div>

      <div v-else-if="cert" class="success-container animate-fade-in">
          <p class="text-muted">Đang hiển thị chứng chỉ (Status: {{ cert.status }})</p>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { certificateAPI } from '@/services/api'
import { 
  ShieldCheck, XCircle, AlertTriangle, GraduationCap, 
  Star, Download, Home, Award 
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()

const cert = ref(null)
const notFound = ref(false)
const loading = ref(true)

const templateConfig = ref({
  TitleText: "CHỨNG NHẬN HOÀN THÀNH",
  BodyText: "Vì đã xuất sắc hoàn thành chương trình đào tạo chuyên môn",
  SignatureName: "LMS Administrator",
  SignatureTitle: "Giám đốc Đào tạo",
  PrimaryColor: "#d4af37" 
})

onMounted(async () => {
  try {
    const code = route.params.code;
    const { data } = await certificateAPI.verify(code);
    
    if (data) {
      cert.value = data;
    } else {
      notFound.value = true;
    }
  } catch (error) {
    console.error("Lỗi xác thực:", error);
    notFound.value = true;
  } finally {
    loading.value = false;
  }
})

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `Ngày ${String(d.getDate()).padStart(2, '0')} tháng ${String(d.getMonth() + 1).padStart(2, '0')} năm ${d.getFullYear()}`
}

const downloadAsImage = () => {
  if (cert.value && cert.value.pdfUrl) {
    window.open(cert.value.pdfUrl, '_blank');
  } else {
    alert('Bản in PDF chất lượng cao đang được khởi tạo hoặc chưa có link. Vui lòng liên hệ Admin.');
  }
}
</script>

<style scoped>
/* Giữ nguyên toàn bộ CSS cao cấp của bạn */
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=Great+Vibes&family=Playfair+Display:ital,wght@0,400;0,700;1,700&display=swap');

.verify-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #f1f5f9; position: relative; overflow: hidden; padding: 3rem 1rem; }
.bg-decor { position: absolute; width: 600px; height: 600px; border-radius: 50%; filter: blur(120px); z-index: 0; opacity: 0.4; }
.deco-1 { top: -200px; left: -200px; background: rgba(99, 102, 241, 0.2); }
.deco-2 { bottom: -200px; right: -200px; background: rgba(212, 175, 55, 0.15); }
.verify-container { position: relative; z-index: 2; width: 100%; max-width: 1000px; display: flex; flex-direction: column; align-items: center; }
.verify-status-card { max-width: 500px; width: 100%; border-radius: 24px; background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(16px); border: 1px solid rgba(0,0,0,0.05); box-shadow: 0 20px 40px -10px rgba(0,0,0,0.08); padding: 3rem 2rem; }
.status-icon { width: 90px; height: 90px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.status-icon.danger { background: rgba(239, 68, 68, 0.1); color: #dc2626; }
.status-icon.warning { background: rgba(245, 158, 11, 0.1); color: #b45309; }
.success-container { width: 100%; display: flex; flex-direction: column; align-items: center; }
.status-banner { background: white; border: 1px solid rgba(16, 185, 129, 0.3); border-left: 6px solid #10b981; padding: 1.5rem 2rem; border-radius: 16px; display: flex; align-items: center; gap: 1.5rem; max-width: 600px; width: 100%; }
.certificate-wrapper { width: 100%; display: flex; justify-content: center; overflow-x: auto; padding: 10px; }
.cert-modern-container { width: 100%; max-width: 900px; min-width: 800px; background: #ffffff; aspect-ratio: 1.414 / 1; padding: 14px; position: relative; }
.shadow-premium { box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.3), 0 10px 25px rgba(0,0,0,0.1); }
.cert-modern-border-outer { width: 100%; height: 100%; border: 10px solid #0f172a; padding: 6px; background: white; }
.cert-modern-border-inner { width: 100%; height: 100%; border: 2px solid #d4af37; position: relative; background: radial-gradient(circle at center, #ffffff 50%, #fdfbf7 100%); padding: 30px; display: flex; flex-direction: column; justify-content: center; overflow: hidden; }
.cert-modern-border-inner::before, .cert-modern-border-inner::after { content: ''; position: absolute; width: 24px; height: 24px; border: 2px solid #d4af37; }
.cert-modern-border-inner::before { top: -12px; left: -12px; border-radius: 50%; background: white; }
.cert-modern-border-inner::after { bottom: -12px; right: -12px; border-radius: 50%; background: white; }
.cert-watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: #d4af37; opacity: 0.04; pointer-events: none; z-index: 0; }
.cert-content { position: relative; z-index: 2; text-align: center; height: 100%; display: flex; flex-direction: column; justify-content: center; }
.cert-header-icon { color: #d4af37; margin-bottom: 12px; }
.cert-title { font-family: 'Cinzel', serif; font-size: 38px; font-weight: 800; color: #0f172a; letter-spacing: 0.1em; margin-bottom: 12px; }
.cert-ornament-line { display: flex; align-items: center; justify-content: center; gap: 15px; margin-bottom: 20px; }
.cert-ornament-line .line { width: 80px; height: 1px; background: #d4af37; }
.cert-ornament-line .star-icon { color: #d4af37; fill: #d4af37; }
.cert-presented-text { font-family: 'Montserrat', sans-serif; font-size: 13px; color: #475569; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 15px; }
.cert-student-name { font-family: 'Great Vibes', 'Playfair Display', cursive; font-size: 60px; font-weight: 400; color: #d4af37; margin-bottom: 20px; line-height: 1.1; }
.cert-body-text { font-family: 'Playfair Display', serif; font-size: 16px; font-style: italic; color: #334155; margin-bottom: 12px; }
.cert-course-name { font-family: 'Cinzel', serif; font-size: 22px; font-weight: 700; color: #0f172a; margin-bottom: 25px; padding: 0 40px; }
.cert-footer { display: flex; justify-content: space-between; align-items: flex-end; padding: 0 20px; margin-top: auto; }
.cert-footer-col { flex: 1; text-align: center; }
.seal-col { flex: 0.8; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; transform: translateY(5px); }
.cert-val { font-size: 15px; font-weight: 600; color: #1e293b; margin-bottom: 6px; }
.signature-font { font-family: 'Great Vibes', cursive; font-size: 34px; font-weight: 400; color: #0f172a; transform: translateY(8px); margin-bottom: 0; }
.cert-signature-line { width: 160px; height: 1px; background: #0f172a; margin: 0 auto 6px auto; }
.cert-label { font-family: 'Montserrat', sans-serif; font-size: 10px; font-weight: 700; color: #64748b; letter-spacing: 0.1em; margin: 0;}
.golden-seal { width: 90px; height: 90px; border-radius: 50%; background: linear-gradient(135deg, #bf953f, #fcf6ba, #b38728, #fdbf59); padding: 4px; box-shadow: 0 5px 15px rgba(212, 175, 55, 0.4), inset 0 0 10px rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center; margin-bottom: 8px; }
.golden-seal-inner { width: 100%; height: 100%; border-radius: 50%; border: 1px dashed rgba(255,255,255,0.8); display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; text-shadow: 1px 1px 2px rgba(0,0,0,0.3); }
.golden-seal-inner span { font-family: 'Montserrat', sans-serif; font-size: 9px; font-weight: 800; letter-spacing: 0.1em; margin-top: 4px; }
.cert-id-tag { font-family: 'monospace'; font-size: 11px; color: #64748b; text-align: center; letter-spacing: 0.05em; }
.btn-premium-gradient { display: inline-flex; align-items: center; justify-content: center; height: 48px; padding: 0 28px; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: white; border: none; border-radius: 14px; font-weight: 700; font-size: 15px; cursor: pointer; transition: all 0.3s; box-shadow: 0 8px 25px rgba(15, 23, 42, 0.3); }
.btn-premium-gradient:hover { transform: translateY(-3px); box-shadow: 0 12px 35px rgba(15, 23, 42, 0.4); }
.btn-glass-primary { display: inline-flex; align-items: center; justify-content: center; height: 48px; padding: 0 28px; background: #6366f1; color: white; border: none; border-radius: 14px; font-weight: 700; font-size: 15px; transition: all 0.3s; box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3); }
.btn-glass-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4); }
.btn-glass-secondary { display: inline-flex; align-items: center; justify-content: center; height: 48px; padding: 0 28px; background: white; border: 1px solid rgba(0,0,0,0.1); border-radius: 14px; font-weight: 700; font-size: 15px; color: #64748b; transition: all 0.3s; }
.btn-glass-secondary:hover { background: rgba(0,0,0,0.02); color: #0f172a; }
.premium-spinner { width: 48px; height: 48px; border: 4px solid rgba(15, 23, 42, 0.1); border-top-color: #0f172a; border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@media (max-width: 850px) { .certificate-wrapper { justify-content: flex-start; } }
</style>