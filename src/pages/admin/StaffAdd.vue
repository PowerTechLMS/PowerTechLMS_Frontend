<script lang="ts" setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { userAPI } from '@/services/api';
import { ArrowLeft, UserPlus, IdCard, Mail, Lock, Eye, EyeOff, Camera, Shield, Save, Loader2, CheckCircle2 } from 'lucide-vue-next';
import { toast } from 'vue3-toastify';

const router = useRouter();
const submitting = ref(false);

const userForm = ref({
  fullName: "",
  email: "",
  password: "", 
  confirmPassword: "",
  role: "Employee", 
  avatarFile: null as File | null,
  avatarPreview: "", 
  isActive: true
});

const showPassword = ref(false);
const showConfirmPassword = ref(false);

const handleAvatarChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    const file = target.files[0];
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ảnh không được vượt quá 2MB");
      return;
    }
    userForm.value.avatarFile = file;
    
    const reader = new FileReader();
    reader.onload = (e) => userForm.value.avatarPreview = e.target?.result as string;
    reader.readAsDataURL(file);
  }
};

const triggerFileInput = () => document.getElementById('hiddenAvatarInput')?.click();

const submitForm = async () => {
  if (userForm.value.password !== userForm.value.confirmPassword) {
    toast.error("Mật khẩu xác nhận không khớp!");
    return;
  }
  
  submitting.value = true;
  try {
    let payload: any;
    if (userForm.value.avatarFile) {
        payload = new FormData();
        payload.append('FullName', userForm.value.fullName);
        payload.append('Email', userForm.value.email);
        payload.append('Password', userForm.value.password);
        payload.append('Role', userForm.value.role);
        payload.append('IsActive', String(userForm.value.isActive));
        payload.append('AvatarFile', userForm.value.avatarFile);
    } else {
        payload = {
            FullName: userForm.value.fullName,
            Email: userForm.value.email,
            Password: userForm.value.password,
            Role: userForm.value.role,
            IsActive: userForm.value.isActive
        };
    }

    await userAPI.create(payload);
    toast.success(`Đã tạo thành công nhân sự: ${userForm.value.fullName}`);
    router.push('/admin/staff'); 
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Lỗi khi tạo nhân sự");
    console.error(error);
  } finally {
    submitting.value = false;
  }
};
</script>

<template>
  <div class="staff-add-page">
    
    <!-- Premium Header -->
    <div class="dp-header">
      <div class="dp-header-content">
        <h1 class="dp-title">Thêm Nhân Sự Mới</h1>
        <p class="dp-subtitle">Tạo tài khoản và phân quyền truy cập hệ thống LMS.</p>
        <span class="dp-badge dp-badge-primary mt-2">Tài khoản mới</span>
      </div>
      <div class="dp-header-decoration"></div>
      
      <div class="dp-header-actions">
        <button @click="router.push('/admin/staff')" class="btn-back">
          <ArrowLeft :size="18" class="mr-2" /> Quay lại
        </button>
      </div>
    </div>

    <!-- MAIN FORM -->
    <form @submit.prevent="submitForm">
      <div class="dp-form-grid">
        
        <!-- Left Column: Authentication Info -->
        <div class="dp-card dp-card-left">
           <!-- Card Banner -->
           <div class="dp-card-banner info">
              <div class="banner-icon-wrap">
                 <IdCard :size="20" stroke-width="2.5" />
              </div>
              <div class="banner-text">
                 <h5 class="banner-title">Thông Tin Định Danh & Bảo Mật</h5>
              </div>
           </div>

           <div class="dp-card-body">
              <div class="form-row">
                 <!-- Full Name -->
                 <div class="form-group mb-4">
                    <label class="dp-label">Họ và tên <span class="text-danger">*</span></label>
                    <div class="dp-input-wrapper">
                       <input v-model="userForm.fullName" type="text" class="dp-input no-icon" placeholder="Nhập họ và tên đầy đủ..." required>
                       <div class="dp-input-focus"></div>
                    </div>
                 </div>

                 <!-- Email -->
                 <div class="form-group mb-5 pb-5 border-bottom">
                    <label class="dp-label">Email đăng nhập <span class="text-danger">*</span></label>
                    <div class="dp-input-wrapper with-icon">
                       <Mail :size="18" class="dp-input-icon" />
                       <input v-model="userForm.email" type="email" class="dp-input" placeholder="email@domain.com" required>
                       <div class="dp-input-focus"></div>
                    </div>
                 </div>

                 <!-- Passwords -->
                 <div class="password-grid g-4">
                    <div class="form-group m-0">
                       <label class="dp-label">Mật khẩu <span class="text-danger">*</span></label>
                       <div class="dp-input-wrapper with-icon with-action">
                          <Lock :size="18" class="dp-input-icon" />
                          <input v-model="userForm.password" :type="showPassword ? 'text' : 'password'" class="dp-input" placeholder="Tối thiểu 6 ký tự" required minlength="6">
                          <button type="button" class="dp-input-action" @click="showPassword = !showPassword" tabindex="-1">
                             <component :is="showPassword ? EyeOff : Eye" :size="18" />
                          </button>
                          <div class="dp-input-focus"></div>
                       </div>
                    </div>

                    <div class="form-group m-0">
                       <label class="dp-label">Xác nhận mật khẩu <span class="text-danger">*</span></label>
                       <div class="dp-input-wrapper with-icon with-action">
                          <Lock :size="18" class="dp-input-icon" />
                          <input v-model="userForm.confirmPassword" :type="showConfirmPassword ? 'text' : 'password'" class="dp-input" placeholder="Nhập lại mật khẩu" required minlength="6">
                          <button type="button" class="dp-input-action" @click="showConfirmPassword = !showConfirmPassword" tabindex="-1">
                             <component :is="showConfirmPassword ? EyeOff : Eye" :size="18" />
                          </button>
                          <div class="dp-input-focus"></div>
                       </div>
                    </div>
                 </div>

              </div>
           </div>
        </div>

        <!-- Right Column: Settings & Avatar -->
        <div class="dp-card dp-card-right d-flex flex-column">
           <!-- Card Banner -->
           <div class="dp-card-banner warning">
              <div class="banner-icon-wrap">
                 <Shield :size="20" stroke-width="2.5" />
              </div>
              <div class="banner-text">
                 <h5 class="banner-title">Hồ sơ & Phân Quyền</h5>
              </div>
           </div>

           <div class="dp-card-body d-flex flex-column flex-grow-1">
              <!-- Avatar Upload -->
              <div class="avatar-section">
                 <div class="avatar-uploader" @click="triggerFileInput">
                    <img v-if="userForm.avatarPreview" :src="userForm.avatarPreview" class="avatar-preview" />
                    <div v-else class="avatar-placeholder">
                       <Camera :size="32" class="opacity-50 mb-2" />
                       <span class="placeholder-text">Tải ảnh lên</span>
                    </div>
                    <div class="avatar-edit-badge">
                       <UserPlus :size="14" />
                    </div>
                 </div>
                 
                 <div class="avatar-info">
                    <h6 class="avatar-title">
                       Ảnh đại diện <CheckCircle2 v-if="userForm.avatarPreview" :size="16" class="text-success ml-2" />
                    </h6>
                    <p class="avatar-desc">Hỗ trợ JPG, PNG. Tối đa 2MB.</p>
                 </div>
                 <input type="file" id="hiddenAvatarInput" class="hidden-input" accept="image/*" @change="handleAvatarChange">
              </div>

              <!-- Role Selection -->
              <div class="form-group mb-5 flex-grow-1">
                 <label class="dp-label mb-3">Vai trò hệ thống <span class="text-danger">*</span></label>
                 <div class="role-grid">
                    <label class="role-card" :class="{'active-primary': userForm.role === 'Employee'}">
                       <input type="radio" v-model="userForm.role" value="Employee" class="hidden-input">
                       <span class="role-text">Nhân viên</span>
                    </label>
                    <label class="role-card" :class="{'active-info': userForm.role === 'Instructor'}">
                       <input type="radio" v-model="userForm.role" value="Instructor" class="hidden-input">
                       <span class="role-text">Giảng viên</span>
                    </label>
                    <label class="role-card" :class="{'active-danger': userForm.role === 'Admin'}">
                       <input type="radio" v-model="userForm.role" value="Admin" class="hidden-input">
                       <span class="role-text">Admin</span>
                    </label>
                 </div>
              </div>

              <!-- Status Toggle -->
              <div class="status-box" :class="userForm.isActive ? 'active' : 'inactive'">
                 <div class="status-info">
                    <h6 class="status-title">{{ userForm.isActive ? 'Đang kích hoạt' : 'Chưa kích hoạt' }}</h6>
                    <p class="status-desc">{{ userForm.isActive ? 'Tài khoản có thể đăng nhập.' : 'Kích hoạt để cấp quyền đăng nhập.' }}</p>
                 </div>
                 <label class="dp-switch">
                    <input type="checkbox" v-model="userForm.isActive">
                    <span class="slider round"></span>
                 </label>
              </div>

           </div>
        </div>
      </div>
      
      <!-- Global Actions -->
      <div class="dp-form-actions mt-4 pt-4 border-top text-right">
         <button type="submit" class="btn-action-submit" :disabled="submitting">
            <span v-if="submitting" class="spinner-border spinner-border-sm mr-2 text-white"></span>
            <Save v-else :size="18" class="mr-2" /> Lưu Tài Khoản
         </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
/* ===== Core Variables & Setup ===== */
.staff-add-page { padding: 0 0 var(--space-2xl) 0; animation: fadeIn 0.4s ease-out; margin: 0 auto; max-width: 1200px; }
.mr-1 { margin-right: 4px; } .mr-2 { margin-right: 8px; } .ml-2 { margin-left: 8px; }
.text-right { text-align: right; }
.text-danger { color: var(--danger-500); }
.text-success { color: var(--success-500); }
.hidden-input { display: none; }

/* ===== Header Premium ===== */
.dp-header { position: relative; margin-bottom: 24px; padding: 40px var(--space-2xl); background: linear-gradient(135deg, var(--primary-600) 0%, var(--primary-800) 100%); border-radius: var(--radius-2xl); color: white; overflow: hidden; box-shadow: 0 10px 30px rgba(79, 70, 229, 0.15); display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 20px; }
.dp-header-content { position: relative; z-index: 2; }
.dp-title { font-size: 2rem; font-weight: 800; margin-bottom: 8px; letter-spacing: -0.02em; color: white; }
.dp-subtitle { color: rgba(255, 255, 255, 0.85); font-size: var(--font-size-base); margin: 0; }
.dp-badge { display: inline-flex; align-items: center; padding: 4px 12px; border-radius: var(--radius-full); font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; border: 1px solid transparent; background: rgba(255,255,255,0.2); }
.dp-header-decoration { position: absolute; top: -50%; right: -5%; width: 400px; height: 400px; background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%); border-radius: 50%; z-index: 1; }
.dp-header-actions { position: relative; z-index: 2; margin-top: 10px; }

.btn-back { display: inline-flex; align-items: center; padding: 10px 20px; background: rgba(255,255,255,0.15); backdrop-filter: blur(8px); color: white; border: 1px solid rgba(255,255,255,0.2); border-radius: var(--radius-full); font-weight: 600; font-size: 14px; cursor: pointer; transition: all 0.3s; }
.btn-back:hover { background: white; color: var(--primary-700); transform: translateY(-2px); box-shadow: 0 4px 15px rgba(0,0,0,0.1); }

/* ===== Form Structure ===== */
.dp-form-grid { display: grid; grid-template-columns: 7fr 5fr; gap: 24px; align-items: stretch; }
.password-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

/* ===== Card Styling ===== */
.dp-card { background: var(--bg-primary); border-radius: var(--radius-2xl); box-shadow: 0 10px 40px rgba(0,0,0,0.04); border: 1px solid var(--border-color); overflow: hidden; display: flex; flex-direction: column; }
.dp-card-body { padding: 40px; }

/* Banners */
.dp-card-banner { padding: 20px 32px; display: flex; align-items: center; gap: 16px; border-bottom: 1px solid var(--border-color); }
.dp-card-banner.info { background: var(--info-50); border-bottom-color: var(--info-100); }
.dp-card-banner.warning { background: var(--warning-50); border-bottom-color: var(--warning-100); }
.banner-icon-wrap { width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
.dp-card-banner.info .banner-icon-wrap { background: var(--info-500); }
.dp-card-banner.warning .banner-icon-wrap { background: var(--warning-500); }
.banner-title { margin: 0; font-size: 16px; font-weight: 700; color: var(--text-primary); }

/* ===== Inputs & Focus Ring ===== */
.dp-label { display: block; font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-tertiary); margin-bottom: 8px; }

.dp-input-wrapper { position: relative; background: var(--bg-secondary); border-radius: 12px; transition: all 0.3s; display: flex; align-items: center; }
.dp-input-icon { position: absolute; left: 16px; color: var(--text-tertiary); z-index: 2; transition: color 0.3s; pointer-events: none; }
.dp-input-action { position: absolute; right: 12px; background: transparent; border: none; color: var(--text-tertiary); cursor: pointer; z-index: 3; padding: 4px; border-radius: 50%; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
.dp-input-action:hover { color: var(--text-primary); background: var(--border-color); }

.dp-input { width: 100%; padding: 14px 16px; background: transparent; border: 1px solid transparent; border-radius: 12px; color: var(--text-primary); font-size: 15px; font-family: inherit; line-height: 1.5; transition: all 0.3s; position: relative; z-index: 1; outline: none; }
.dp-input-wrapper.with-icon .dp-input { padding-left: 44px; }
.dp-input-wrapper.with-action .dp-input { padding-right: 44px; }

.dp-input-focus { position: absolute; inset: -2px; border-radius: 14px; border: 2px solid var(--primary-400); opacity: 0; transform: scale(0.99); transition: all 0.3s ease; pointer-events: none; z-index: 0; box-shadow: 0 0 0 4px rgba(79,70,229,0.1); }

.dp-input:focus { background: white; }
.dp-input:focus ~ .dp-input-icon { color: var(--primary-500); }
.dp-input:focus ~ .dp-input-focus { opacity: 1; transform: scale(1); }

/* ===== Avatar Upload ===== */
.avatar-section { text-align: center; margin-bottom: 32px; padding-bottom: 32px; border-bottom: 1px solid var(--border-color); }
.avatar-uploader { position: relative; width: 140px; height: 140px; margin: 0 auto 16px auto; cursor: pointer; border-radius: 50%; transition: transform 0.3s; }
.avatar-uploader:hover { transform: scale(1.05); }
.avatar-preview { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; border: 4px solid white; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
.avatar-placeholder { width: 100%; height: 100%; border-radius: 50%; border: 2px dashed var(--border-color); background: var(--bg-secondary); display: flex; flex-direction: column; justify-content: center; align-items: center; color: var(--text-tertiary); box-shadow: inset 0 2px 5px rgba(0,0,0,0.02); }
.placeholder-text { font-size: 12px; font-weight: 600; }
.avatar-edit-badge { position: absolute; bottom: 4px; right: 4px; width: 36px; height: 36px; background: var(--primary-500); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.15); z-index: 2; transition: all 0.3s; }
.avatar-uploader:hover .avatar-edit-badge { transform: scale(1.1); background: var(--primary-600); }
.avatar-info { display: flex; flex-direction: column; align-items: center; }
.avatar-title { font-size: 15px; font-weight: 700; color: var(--text-primary); margin: 0 0 4px 0; display: flex; align-items: center; }
.avatar-desc { font-size: 12px; color: var(--text-tertiary); margin: 0; }

/* ===== Role Grid ===== */
.role-grid { display: flex; gap: 12px; flex-wrap: wrap; }
.role-card { flex: 1; min-width: 100px; position: relative; padding: 16px; border-radius: 12px; border: 1px solid var(--border-color); background: var(--bg-primary); text-align: center; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
.role-card:hover { background: var(--bg-secondary); border-color: #cbd5e1; }
.role-text { font-size: 14px; font-weight: 700; color: var(--text-secondary); transition: color 0.2s; }

.role-card.active-primary { background: var(--primary-50); border-color: var(--primary-400); box-shadow: 0 4px 10px rgba(59, 130, 246, 0.1); }
.role-card.active-primary .role-text { color: var(--primary-700); }
.role-card.active-info { background: var(--info-50); border-color: var(--info-400); box-shadow: 0 4px 10px rgba(14, 165, 233, 0.1); }
.role-card.active-info .role-text { color: var(--info-700); }
.role-card.active-danger { background: var(--danger-50); border-color: var(--danger-400); box-shadow: 0 4px 10px rgba(239, 68, 68, 0.1); }
.role-card.active-danger .role-text { color: var(--danger-700); }

/* ===== Status Switch ===== */
.status-box { display: flex; justify-content: space-between; align-items: center; padding: 20px; border-radius: 16px; transition: all 0.3s; border: 1px solid transparent; }
.status-box.active { background: var(--success-50); border-color: var(--success-200); }
.status-box.inactive { background: var(--bg-secondary); border-color: var(--border-color); }
.status-info { display: flex; flex-direction: column; gap: 4px; }
.status-title { margin: 0; font-size: 14px; font-weight: 700; color: var(--text-primary); transition: color 0.3s; }
.status-box.active .status-title { color: var(--success-700); }
.status-desc { margin: 0; font-size: 12px; color: var(--text-secondary); }
.status-box.active .status-desc { color: var(--success-600); opacity: 0.9; }

/* Custom Switch Toggle */
.dp-switch { position: relative; display: inline-block; width: 44px; height: 24px; flex-shrink: 0; margin: 0; }
.dp-switch input { opacity: 0; width: 0; height: 0; margin: 0; }
.slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #cbd5e1; transition: .4s; }
.slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: .4s; box-shadow: 0 2px 4px rgba(0,0,0,0.2); }
input:checked + .slider { background-color: var(--success-500); }
input:focus + .slider { box-shadow: 0 0 1px var(--success-500); }
input:checked + .slider:before { transform: translateX(20px); }
.slider.round { border-radius: 24px; }
.slider.round:before { border-radius: 50%; }

/* ===== Actions Output ===== */
.dp-form-actions { display: flex; justify-content: flex-end; }
.btn-action-submit { display: inline-flex; align-items: center; justify-content: center; height: 48px; padding: 0 32px; background: linear-gradient(135deg, var(--primary-600) 0%, var(--primary-500) 100%); color: white; border: none; border-radius: var(--radius-full); font-weight: 700; font-size: 15px; cursor: pointer; transition: all 0.3s; box-shadow: 0 4px 15px rgba(79,70,229,0.25); }
.btn-action-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(79,70,229,0.35); }
.btn-action-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; box-shadow: none; }

/* Settings */
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

/* Responsive */
@media (max-width: 1024px) {
  .password-grid { grid-template-columns: 1fr; }
}
@media (max-width: 768px) {
  .dp-header { padding: 30px 20px 40px 20px; text-align: center; justify-content: center; }
  .dp-header-actions { width: 100%; display: flex; justify-content: center; margin-top: 10px; }
  .dp-form-grid { grid-template-columns: 1fr; }
  .dp-card-body { padding: 24px; }
  .dp-form-actions { flex-direction: column; justify-content: stretch; margin-top: 20px; }
  .btn-action-submit { width: 100%; }
}
</style>
