<script lang="ts" setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { documentAPI } from "@/services/api";
import { toast } from "vue3-toastify";
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';

const router = useRouter();

// --- 1. STATE ---
const documentForm = ref({
  Title: "",
  Description: "",
  Tags: "",
  AccessStartDate: null as Date | null,
  AccessEndDate: null as Date | null,
  File: null as File | null,
  ChangeNote: "Bản phát hành đầu tiên"
});

const isSubmitting = ref(false);
const fileInfo = ref<{ name: string; size: string; ext: string } | null>(null);

// --- 2. HANDLERS ---
const onFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const f = (target.files && target.files.length > 0) ? target.files[0] : null;
  documentForm.value.File = f;
  
  if (f) {
    const ext = f.name.split('.').pop()?.toUpperCase() ?? '';
    const size = f.size > 1024 * 1024
      ? (f.size / 1024 / 1024).toFixed(2) + ' MB'
      : (f.size / 1024).toFixed(1) + ' KB';
    fileInfo.value = { name: f.name, size, ext };
  } else {
    fileInfo.value = null;
  }
};

const submitAddForm = async () => {
  if (!documentForm.value.File) {
    toast.warning("Vui lòng chọn một tệp tài liệu để tải lên!");
    return;
  }

  isSubmitting.value = true;
  const formData = new FormData();
  formData.append('title', documentForm.value.Title);
  formData.append('description', documentForm.value.Description);
  formData.append('tags', documentForm.value.Tags);
  if (documentForm.value.AccessStartDate) formData.append('accessStartDate', documentForm.value.AccessStartDate.toISOString());
  if (documentForm.value.AccessEndDate) formData.append('accessEndDate', documentForm.value.AccessEndDate.toISOString());
  formData.append('file', documentForm.value.File);

  try {
    await documentAPI.create(formData);
    toast.success("Tải lên tài liệu thành công!");
    router.push('/admin/documents');
  } catch (error) {
    toast.error("Lỗi khi tải lên tài liệu.");
  } finally {
    isSubmitting.value = false;
  }
};

const getExtColor = (ext: string) => {
  if (ext === 'PDF') return 'text-danger';
  if (['DOC', 'DOCX'].includes(ext)) return 'text-primary';
  if (['XLS', 'XLSX'].includes(ext)) return 'text-success';
  return 'text-muted';
};

const getExtBg = (ext: string) => {
  if (ext === 'PDF') return 'bg-danger-light';
  if (['DOC', 'DOCX'].includes(ext)) return 'bg-primary-light';
  if (['XLS', 'XLSX'].includes(ext)) return 'bg-success-light';
  return 'bg-light';
};
</script>

<template>
  <div class="container-fluid">
    <div class="row page-titles mx-0 mb-4">
      <div class="col-sm-6 p-md-0">
        <h4 class="text-dark fw-bold mb-1">Thêm mới Tài liệu</h4>
        <p class="mb-0 text-muted fs-13">Tải lên và phân phối tài liệu nội bộ cho toàn công ty.</p>
      </div>
      <div class="col-sm-6 p-md-0 justify-content-sm-end mt-2 mt-sm-0 d-flex align-items-center">
        <ol class="breadcrumb mb-0">
          <li class="breadcrumb-item"><RouterLink to="/admin/documents" class="text-muted">Kho tài liệu</RouterLink></li>
          <li class="breadcrumb-item active"><a href="javascript:void(0);" class="text-dark fw-bold">Thêm mới</a></li>
        </ol>
      </div>
    </div>

    <form @submit.prevent="submitAddForm">
      <div class="row g-4 mb-4">
        <div class="col-lg-7">
          <div class="card shadow-sm border-0 h-100">
            <div class="card-header bg-white border-bottom py-3">
              <p class="doc-section-label mb-0">Thông tin tài liệu</p>
            </div>
            <div class="card-body">
              <div class="form-group mb-3">
                <label class="form-label fw-bold text-dark fs-13">Tên tài liệu <span class="text-danger">*</span></label>
                <input v-model="documentForm.Title" type="text" class="form-control form-control-lg" required />
              </div>
              <div class="form-group mb-3">
                <label class="form-label fw-bold text-dark fs-13">Mô tả chi tiết</label>
                <textarea v-model="documentForm.Description" class="form-control" rows="3"></textarea>
              </div>
              <div class="form-group mb-0">
                <label class="form-label fw-bold text-dark fs-13">Thẻ phân loại (Tags)</label>
                <input v-model="documentForm.Tags" type="text" class="form-control" placeholder="VD: HR, TechSplit..." />
                <small class="text-muted fs-12 mt-1 d-block">Dùng dấu phẩy để phân cách nhiều tag.</small>
              </div>
            </div>
          </div>
        </div>

        <div class="col-lg-5">
          <div class="card shadow-sm border-0 h-100">
            <div class="card-header bg-white border-bottom py-3">
              <p class="doc-section-label mb-0">File đính kèm</p>
            </div>
            <div class="card-body d-flex flex-column">
              <label for="fileInput" class="doc-upload-zone mb-3 d-flex flex-column align-items-center justify-content-center text-center">
                <div v-if="!fileInfo">
                  <i class="fa fa-cloud-upload fs-2 text-primary mb-2 d-block"></i>
                  <p class="fw-bold text-dark mb-1">Nhấn để chọn file</p>
                  <p class="text-muted fs-12 mb-0">Hỗ trợ PDF, DOCX, XLSX...</p>
                </div>
                <div v-else class="d-flex align-items-center gap-3 w-100 px-2">
                  <div class="doc-file-ext-badge" :class="getExtBg(fileInfo.ext)">
                    <span :class="getExtColor(fileInfo.ext)" class="fw-bold fs-12">{{ fileInfo.ext }}</span>
                  </div>
                  <div class="text-start flex-fill overflow-hidden">
                    <p class="fw-bold text-dark mb-0 text-truncate">{{ fileInfo.name }}</p>
                    <small class="text-muted">{{ fileInfo.size }}</small>
                  </div>
                </div>
                <input id="fileInput" type="file" class="d-none" @change="onFileChange" required />
              </label>
            </div>
          </div>
        </div>
      </div>

      <div class="row g-4 mb-4">
        <div class="col-12">
          <div class="card shadow-sm border-0">
            <div class="card-header bg-white border-bottom py-3">
              <p class="doc-section-label mb-0">Quyền truy cập & Thời hạn</p>
            </div>
            <div class="card-body">
              <div class="row g-4">
                <div class="col-sm-6">
                  <label class="form-label fw-bold text-dark fs-13">Ngày bắt đầu hiển thị</label>
                  <VueDatePicker v-model="documentForm.AccessStartDate" :enable-time-picker="false" auto-apply placeholder="Hiển thị ngay" />
                </div>
                <div class="col-sm-6">
                  <label class="form-label fw-bold text-dark fs-13">Ngày gỡ bỏ</label>
                  <VueDatePicker v-model="documentForm.AccessEndDate" :enable-time-picker="false" auto-apply placeholder="Vô thời hạn" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="doc-action-bar d-flex justify-content-end gap-2 bg-white p-3 rounded shadow-sm sticky-bottom mt-4">
        <button type="button" class="btn btn-light border" @click="router.push('/admin/documents')">Hủy bỏ</button>
        <button type="submit" class="btn btn-primary px-5 fw-bold" :disabled="isSubmitting">
          <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2"></span>
          Tải lên & Lưu
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.doc-section-label { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: #6c757d; border-left: 3px solid #1a56db; padding-left: 0.6rem; }
.doc-upload-zone { border: 2px dashed #c9d6e3; border-radius: 12px; padding: 2rem 1rem; cursor: pointer; background: #f8fbff; min-height: 150px; transition: border-color 0.2s; }
.doc-upload-zone:hover { border-color: #1a56db; }
.doc-file-ext-badge { width: 3rem; height: 3rem; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
.bg-primary-light { background: rgba(59, 130, 246, 0.1); }
.bg-danger-light { background: rgba(239, 68, 68, 0.1); }
.bg-success-light { background: rgba(16, 185, 129, 0.1); }
.fs-13 { font-size: 0.8125rem; }
.fs-12 { font-size: 0.75rem; }
.doc-action-bar { z-index: 10; }
</style>
