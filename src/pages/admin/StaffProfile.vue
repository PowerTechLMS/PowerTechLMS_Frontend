<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { userAPI } from "@/services/api";
import {
	ArrowLeft,
	Pencil,
	Mail,
	Shield,
	Calendar,
	IdCard,
	CheckCircle,
	Book,
	Layout,
	User as UserIcon,
	Clock,
} from "lucide-vue-next";
import { toast } from "vue3-toastify";

const route = useRoute();
const router = useRouter();
const userId = Number(route.params.id);

const loading = ref(true);
const userNotFound = ref(false);
const userProfile = ref<any>(null);
const stats = ref({
	enrolled: 0,
	completed: 0,
	certificates: 0,
});
const courses = ref<any[]>([]);

const defaultAvatar =
	"https://ui-avatars.com/api/?background=random&color=fff&name=";

const fetchData = async () => {
	loading.value = true;
	userNotFound.value = false;
	try {
		const [userRes, reportRes] = await Promise.all([
			userAPI.getById(userId),
			userAPI.getReport(userId),
		]);

		userProfile.value = userRes.data;
		stats.value = reportRes.data;
		courses.value = reportRes.data.courses || [];
	} catch (error: any) {
		if (error.response?.status === 404) {
			userNotFound.value = true;
		} else {
			toast.error("Lỗi khi tải thông tin hồ sơ");
		}
	} finally {
		loading.value = false;
	}
};

onMounted(fetchData);

const getAvatarUrl = () => {
	if (userProfile.value?.avatar) {
		return userProfile.value.avatar.startsWith("http")
			? userProfile.value.avatar
			: `${import.meta.env.VITE_API_URL || "http://localhost:5100"}${userProfile.value.avatar}`;
	}
	return (
		defaultAvatar + (userProfile.value?.fullName || "User").replace(/ /g, "+")
	);
};

const getRoleName = (role: string) => {
	if (!role) return "";
	const r = role.toLowerCase();
	if (r === "admin") return "Quản trị viên Hệ thống";
	if (r === "instructor") return "Giảng viên Nội bộ";
	return "Học viên / Nhân viên";
};

const goToEdit = () => {
	router.push(`/admin/staff/edit/${userId}`);
};
</script>

<template>
	<div class="container-fluid py-4">
		
		<div class="row pb-4 mb-4 align-items-center">
			<div class="col-sm-8 d-flex align-items-center gap-3">
				<button
					class="btn rounded-circle p-2 shadow-sm border-0 bg-secondary-subtle hover-zoom"
					@click="router.push('/admin/staff')"
				>

					<ArrowLeft :size="20" class="text-muted" />
				</button>
				<div>
					<h4 class="fw-bold mb-1">Hồ Sơ Nhân Sự</h4>

					<p class="mb-0 text-muted fs-14">
						Xem chi tiết thông tin định danh và tiến độ học tập thực tế.
					</p>
				</div>
			</div>
			<div class="col-sm-4 text-sm-end mt-3 mt-sm-0" v-if="userProfile">
				<button
					class="btn btn-primary fw-bold shadow-sm rounded-pill px-4 btn-hover d-inline-flex align-items-center gap-2"
					@click="goToEdit"
				>
					<Pencil :size="16" /> Chỉnh Sửa Hồ Sơ
				</button>
			</div>
		</div>

		
		<div v-if="loading" class="text-center py-5">
			<div class="spinner-border text-primary" role="status"></div>
			<p class="mt-3 text-muted fw-medium">Đang tải hồ sơ nhân sự...</p>
		</div>

		
		<div
			v-else-if="userNotFound"
			class="text-center py-5 card border-0 shadow-sm rounded-4 bg-card-ui"
		>

			<div class="bg-light rounded-circle d-inline-flex p-4 mb-3 mx-auto">
				<UserIcon :size="48" class="text-muted opacity-50" />
			</div>
			<h4 class="fw-bold mb-2">Không tìm thấy hồ sơ</h4>

			<p class="text-muted mb-4">
				Mã nhân sự #{{ userId }} không tồn tại hoặc đã bị xóa khỏi hệ thống.
			</p>
			<button
				class="btn btn-outline-primary fw-bold rounded-pill px-4 mx-auto"
				@click="router.push('/admin/staff')"
			>
				Quay lại danh sách
			</button>
		</div>

		
		<div v-else-if="userProfile" class="row g-4">
			
			<div class="col-xl-4 col-lg-5">
				<div
					class="card border-0 shadow-sm rounded-4 overflow-hidden mb-4 bg-card-ui"
				>

					
					<div class="profile-banner position-relative">
						<div class="banner-overlay"></div>
					</div>

					<div
						class="card-body text-center px-4 pb-4 px-sm-5 pt-0 position-relative"
					>
						<div class="avatar-wrap mx-auto">
							<img
								:src="getAvatarUrl()"
								class="profile-img shadow bg-card-ui p-1"
								:class="{ grayscale: !userProfile.isActive }"
							/>

							<div
								class="status-badge shadow-sm d-flex align-items-center justify-content-center border border-white border-2"
								:class="userProfile.isActive ? 'bg-success' : 'bg-danger'"
								title="Trạng thái hoạt động"
							>
								<CheckCircle
									v-if="userProfile.isActive"
									:size="12"
									class="text-white"
								/>
								<div
									v-else
									class="rounded-circle bg-white"
									style="width: 6px; height: 6px"
								></div>
							</div>
						</div>

						<h4 class="fw-bold mt-3 mb-1">

							{{ userProfile.fullName }}
						</h4>
						<p class="text-muted fs-14 mb-4 fw-medium">
							{{ getRoleName(userProfile.role) }}
						</p>

						<div class="d-flex flex-column gap-2 mt-4 px-2">
							<div
								class="d-flex align-items-center justify-content-between p-3 stat-box-premium primary"
							>
								<span
									class="fs-13 fw-bold text-uppercase"
									style="letter-spacing: 0.5px"
									>Đang học</span
								>
								<h4 class="mb-0 fw-black">{{ stats.enrolled }}</h4>
							</div>
							<div
								class="d-flex align-items-center justify-content-between p-3 stat-box-premium success"
							>
								<span
									class="fs-13 fw-bold text-uppercase"
									style="letter-spacing: 0.5px"
									>Hoàn thành</span
								>
								<h4 class="mb-0 fw-black">
									{{ stats.completed }}
								</h4>
							</div>
							<div
								class="d-flex align-items-center justify-content-between p-3 stat-box-premium warning"
							>
								<span
									class="fs-13 fw-bold text-uppercase"
									style="letter-spacing: 0.5px"
									>Chứng chỉ</span
								>
								<h4 class="mb-0 fw-black">
									{{ stats.certificates }}
								</h4>
							</div>
						</div>
					</div>
				</div>

				
				<div class="card border-0 shadow-sm rounded-4 bg-card-ui">
					<div class="card-header bg-transparent border-0 pt-4 pb-0 px-4">
						<h6 class="fw-bold mb-0 d-flex align-items-center gap-2">
							<IdCard :size="18" class="text-primary" /> Thông tin liên hệ

						</h6>
					</div>
					<div class="card-body p-4">
						<div class="d-flex flex-column gap-3">
							<div
								class="d-flex align-items-center gap-3 p-3 contact-info-card border-themed"
							>
								<div class="contact-icon-box text-primary">
									<Mail :size="20" />
								</div>
								<div class="overflow-hidden">
									<p class="contact-label mb-0">
										Email
									</p>
									<p class="contact-value mb-0 text-truncate">
										{{ userProfile.email }}
									</p>
								</div>
							</div>


							<div
								class="d-flex align-items-center gap-3 p-3 contact-info-card border-themed"
							>
								<div class="contact-icon-box text-info">
									<Shield :size="20" />
								</div>
								<div>
									<p class="contact-label mb-0">
										Quyền hạn
									</p>
									<p class="contact-value mb-0">{{ userProfile.role }}</p>
								</div>
							</div>


							<div
								class="d-flex align-items-center gap-3 p-3 contact-info-card border-themed"
							>
								<div class="contact-icon-box text-success">
									<Layout :size="20" />
								</div>
								<div>
									<p class="contact-label mb-0">
										Phòng ban
									</p>
									<p class="contact-value mb-0">
										{{ userProfile.groupName || "Chưa phân bổ" }}
									</p>
								</div>
							</div>


							<div
								class="d-flex align-items-center gap-3 p-3 contact-info-card border-themed"
							>
								<div class="contact-icon-box text-secondary">
									<Calendar :size="20" />
								</div>
								<div>
									<p class="contact-label mb-0">
										Tạo ngày
									</p>
									<p class="contact-value mb-0">
										{{
											userProfile.createdAt
												? new Date(userProfile.createdAt).toLocaleDateString(
														"vi-VN",
													)
												: "N/A"
										}}
									</p>
								</div>
							</div>

						</div>
					</div>
				</div>
			</div>

			
			<div class="col-xl-8 col-lg-7">
				<div
					class="card border-0 shadow-sm rounded-4 h-100 overflow-hidden bg-card-ui"
				>
					<div class="card-header bg-transparent border-bottom px-4 py-4">
						<h5 class="fw-bold mb-0 d-flex align-items-center gap-2">

							<Book :size="20" class="text-primary" /> Lộ trình & Lịch sử học
							tập
						</h5>
					</div>

					<div class="card-body p-4 p-md-5">
						<div v-if="courses.length > 0" class="d-flex flex-column gap-3">
							<div
								v-for="course in courses"
								:key="course.id"
								class="border rounded-4 p-4 transition-all course-card hover-shadow bg-card-ui"
							>

								<div
									class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-start mb-3 gap-3"
								>
									<div>
										<h6 class="fw-bold mb-1 fs-15">

											{{ course.title }}
										</h6>
										<span
											class="fs-13 text-muted d-flex align-items-center gap-1"
										>
											<Clock :size="12" /> Truy cập cuối:
											{{
												course.lastAccess
													? new Date(course.lastAccess).toLocaleString("vi-VN")
													: "---"
											}}
										</span>
									</div>
									<span
										class="badge rounded-pill fw-bold border px-3 py-2 text-nowrap"
										:class="
											course.progress >= 100
												? 'bg-success-subtle text-success border-success-subtle'
												: 'bg-primary-subtle text-primary border-primary-subtle'
										"
									>
										{{ course.progress >= 100 ? "Hoàn thành" : "Đang học" }}
									</span>
								</div>

								<div class="d-flex align-items-center gap-3 mt-4">
									<div
										class="progress flex-grow-1 bg-secondary-subtle shadow-inner"
										style="height: 8px; border-radius: 10px"
									>

										<div
											class="progress-bar rounded-pill"
											:class="
												course.progress >= 100 ? 'bg-success' : 'bg-primary'
											"
											:style="`width: ${course.progress}%`"
										></div>
									</div>
									<span
										class="fw-bold fs-14"
										style="min-width: 45px; text-align: right"
										>{{ course.progress }}%</span
									>

								</div>
							</div>
						</div>

						<div v-else class="text-center py-5">
							<div class="bg-secondary-subtle rounded-circle d-inline-flex p-4 mb-3">
								<Book :size="48" class="text-muted opacity-25" />
							</div>
							<h5 class="fw-bold mb-1">Chưa có khóa học nào</h5>

							<p class="text-muted">
								Nhân sự này chưa tham gia bất kỳ khóa học nào trên hệ thống.
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
.tracking-wide {
	letter-spacing: 0.05em;
}
.grayscale {
	filter: grayscale(1);
}
.transition-all {
	transition: all 0.2s ease;
}

.hover-zoom:hover {
	transform: scale(1.05);
}
.btn-hover:hover {
	transform: translateY(-1px);
	box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2) !important;
}
.stat-box-premium {
	border-radius: 16px;
	border: 1px solid transparent;
	transition: all 0.3s;
}
.stat-box-premium.primary {
	background: rgba(99, 102, 241, 0.15);
	color: #6366f1;
}
.stat-box-premium.success {
	background: rgba(16, 185, 129, 0.15);
	color: #10b981;
}
.stat-box-premium.warning {
	background: rgba(245, 158, 11, 0.15);
	color: #f59e0b;
}

:is([data-theme="dark"]) .stat-box-premium.primary {
	background: rgba(99, 102, 241, 0.25);
	color: #a5b4fc;
}
:is([data-theme="dark"]) .stat-box-premium.success {
	background: rgba(16, 185, 129, 0.25);
	color: #6ee7b7;
}
:is([data-theme="dark"]) .stat-box-premium.warning {
	background: rgba(245, 158, 11, 0.25);
	color: #fcd34d;
}

.hover-white-themed:hover {
	background-color: var(--bg-tertiary) !important;
	border-color: var(--border-color) !important;
	box-shadow: var(--shadow-sm);
	transform: translateX(2px);
}


.hover-shadow:hover {
	box-shadow: var(--shadow-md);
	transform: translateY(-2px);
	border-color: var(--primary-500) !important;
}

.bg-card-ui {
	background-color: var(--bg-card) !important;
}

.border-themed {
	border-color: var(--border-color) !important;
}



.profile-banner {
	height: 140px;
	background: linear-gradient(135deg, #2563eb 0%, #60a5fa 100%);
	overflow: hidden;
}
.banner-overlay {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: radial-gradient(
		circle at top right,
		rgba(255, 255, 255, 0.1) 0%,
		transparent 60%
	);
}
.avatar-wrap {
	position: relative;
	width: 130px;
	height: 130px;
	margin-top: -65px;
	z-index: 2;
}
.profile-img {
	width: 100%;
	height: 100%;
	border-radius: 50%;
	object-fit: cover;
}
.contact-info-card {
	background: var(--bg-secondary);
	border: 1px solid var(--border-color);
	border-radius: var(--radius-lg);
	transition: all 0.2s ease;
}
.contact-info-card:hover {
	background: var(--bg-tertiary);
	transform: translateX(4px);
}
.contact-icon-box {
	background: var(--bg-tertiary);
	padding: 10px;
	border-radius: 12px;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: var(--shadow-sm);
}
.contact-label {
	font-size: 10px;
	font-weight: 800;
	text-transform: uppercase;
	letter-spacing: 0.1em;
	color: var(--text-tertiary);
	margin-bottom: 2px !important;
}
.contact-value {
	font-size: 14px;
	font-weight: 700;
	color: var(--text-primary);
}

:is([data-theme="dark"]) .contact-value {
	color: #f8fafc;
}
:is([data-theme="dark"]) .contact-label {
	color: #94a3b8;
}

.status-badge {

	position: absolute;
	width: 22px;
	height: 22px;
	border-radius: 50%;
	bottom: 10px;
	right: 10px;
}


.shadow-inner {
	box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
}
</style>
