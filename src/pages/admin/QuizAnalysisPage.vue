<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import DataTable from "datatables.net-vue3";
import DataTablesLib from "datatables.net";
import { reportAPI, courseAPI } from "@/services/api";
import { toast } from "vue3-toastify";
import {
	BookOpen,
	FileText,
	CheckCircle,
	AlertTriangle,
	Download,
	BarChart2,
} from "lucide-vue-next";

DataTable.use(DataTablesLib);

interface Course {
	id: number;
	title: string;
}

interface QuizOption {
	id: number;
	title: string;
	quizId: number;
}

interface QuestionStat {
	questionId: number;
	questionText: string;
	totalAttempts: number;
	wrongAnswers: number;
	errorRate: number;
}

const courses = ref<Course[]>([]);
const quizzes = ref<QuizOption[]>([]);
const selectedCourseId = ref<number | "">("");
const selectedQuizId = ref<number | "">("");

const quizData = ref<QuestionStat[]>([]);
const loadingStats = ref(false);

onMounted(async () => {
	try {
		const res = await courseAPI.getAll({ pageSize: 500 });
		courses.value = res.data.items || res.data;
	} catch {
		toast.error("Lỗi khi tải danh sách khóa học.");
	}
});

const onCourseSelect = async () => {
	quizzes.value = [];
	selectedQuizId.value = "";
	quizData.value = [];

	if (!selectedCourseId.value) return;

	try {
		const res = await courseAPI.getById(selectedCourseId.value as number);
		const courseDetail = res.data;
		const foundQuizzes: QuizOption[] = [];

		if (courseDetail.modules) {
			courseDetail.modules.forEach((m: any) => {
				if (m.lessons) {
					m.lessons.forEach((l: any) => {
						if ((l.type === "Quiz" || l.type === "MiniQuiz") && l.quizId) {
							foundQuizzes.push({ id: l.id, title: l.title, quizId: l.quizId });
						}
					});
				}
			});
		}
		quizzes.value = foundQuizzes;

		if (foundQuizzes.length === 0) {
			toast.info("Khóa học này chưa có bài kiểm tra nào.");
		}
	} catch {
		toast.error("Lỗi khi tải chi tiết khóa học.");
	}
};

const fetchAnalysis = async () => {
	if (!selectedQuizId.value) {
		toast.warning("Vui lòng chọn 1 đề thi để xem phân tích!");
		return;
	}

	loadingStats.value = true;
	try {
		const res = await reportAPI.getQuizAnalytics(
			selectedQuizId.value as number,
		);
		quizData.value = res.data || [];

		if (quizData.value.length === 0) {
			toast.info("Bài kiểm tra này chưa có ai làm thử.");
		}
	} catch {
		toast.error("Không thể tải báo cáo phân tích.");
	} finally {
		loadingStats.value = false;
	}
};

const totalQuestions = computed(() => quizData.value.length);

const avgScore = computed(() => {
	if (totalQuestions.value === 0) return 0;
	const sumRates = quizData.value.reduce(
		(acc, curr) => acc + (100 - curr.errorRate),
		0,
	);
	return (sumRates / totalQuestions.value).toFixed(1);
});

const hardestQuestion = computed(() => {
	if (quizData.value.length === 0) return null;
	return quizData.value.reduce((prev, current) =>
		prev.errorRate > current.errorRate ? prev : current,
	);
});

const exportExcel = () => {
	if (quizData.value.length === 0) {
		toast.warning("Không có dữ liệu để xuất!");
		return;
	}

	const headers = [
		"Mã Câu Hỏi",
		"Nội Dung",
		"Số Lượt Làm",
		"Tổng Số Lỗi",
		"Tỉ Lệ Sai (%)",
		"Tỉ Lệ Đúng (%)",
	];
	const rows = quizData.value.map((q) => [
		q.questionId,
		`"${q.questionText.replace(/"/g, '""')}"`,
		q.totalAttempts,
		q.wrongAnswers,
		q.errorRate.toFixed(1),
		(100 - q.errorRate).toFixed(1),
	]);

	const csvContent =
		"\ufeff" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
	const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.setAttribute("href", url);
	link.setAttribute(
		"download",
		`PhanTichDeThi_Quiz_${selectedQuizId.value}.csv`,
	);
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	toast.success("Đã xuất file báo cáo!");
};

const tableData = computed(() => {
	return quizData.value.map((q, index) => {
		const correctRate = 100 - q.errorRate;

		let rateBarColor = "bg-success";
		let rateTextColor = "text-success";
		let glowClass = "glow-success";
		if (correctRate < 40) {
			rateBarColor = "bg-danger";
			rateTextColor = "text-danger";
			glowClass = "glow-danger";
		} else if (correctRate <= 70) {
			rateBarColor = "bg-warning";
			rateTextColor = "text-warning";
			glowClass = "glow-warning";
		}

		const rateBar = `
      <div class="d-flex align-items-center gap-3">
        <span class="fs-14 fw-800 ${rateTextColor}" style="width: 48px;">${correctRate.toFixed(1)}%</span>
        <div class="progress capsule-progress flex-grow-1 ${glowClass}">
            <div class="progress-bar ${rateBarColor}" style="width: ${correctRate}%;"></div>
        </div>
      </div>
    `;

		const errorString = `Sai ${q.wrongAnswers} lần (${q.errorRate.toFixed(1)}%)`;
		const mistakeUI =
			q.errorRate > 50
				? `<div class="badge-glass danger"><i class="fa fa-exclamation-triangle me-1" style="font-family: FontAwesome"></i> ${errorString}</div>`
				: `<div class="badge-glass warning text-dark"><i class="fa fa-info-circle me-1" style="font-family: FontAwesome"></i> ${errorString}</div>`;

		return [
			`<strong class="text-secondary fw-800">CÂU ${index + 1}</strong>`,
			`<div class="question-text-cell">
        <span class="fw-700 text-dark">${q.questionText}</span>
      </div>`,
			`<div class="text-center"><span class="badge-glass primary fw-800 fs-13 px-3 py-1">${q.totalAttempts}</span></div>`,
			rateBar,
			mistakeUI,
			`<button class="btn-ghost-glass text-primary fw-700 btn-sm w-100 justify-content-center" onclick="alert('Chức năng sửa câu hỏi đang được phát triển!')">
        Chỉnh sửa
      </button>`,
		];
	});
});
</script>

<template>
	<div class="quiz-analysis-page p-4">
		<div class="page-header-premium mb-5">
			<div class="header-inner">
				<div class="header-icon-box pulse-glow">
					<BarChart2 :size="32" class="animated-icon" />
				</div>
				<div class="header-info">
					<div class="d-flex align-items-center gap-2 mb-1">
						<span class="badge-glass primary">BÁO CÁO & THỐNG KÊ</span>
					</div>
					<h1 class="title-gradient">Phân Tích Đề Thi & Câu Hỏi</h1>
					<p class="desc-text">
						Đánh giá chất lượng câu hỏi, phát hiện các nội dung quá khó hoặc gây
						nhầm lẫn để cải tiến giáo trình.
					</p>
				</div>
			</div>
		</div>

		<div class="glass-panel mb-5">
			<div class="row align-items-end gx-4 row-gap-4">
				<div class="col-md-4">
					<label
						class="form-label text-secondary fw-800 fs-12 text-uppercase mb-2"
						>1. Chọn Khóa Học</label
					>
					<div class="select-ico-wrap">
						<BookOpen :size="16" class="ico" />
						<select
							class="luxe-select"
							v-model="selectedCourseId"
							@change="onCourseSelect"
						>
							<option value="">-- Chọn khóa học cần xem --</option>
							<option v-for="c in courses" :key="c.id" :value="c.id">
								{{ c.title }}
							</option>
						</select>
					</div>
				</div>
				<div class="col-md-4">
					<label
						class="form-label text-secondary fw-800 fs-12 text-uppercase mb-2"
						>2. Chọn Đề Thi (Quiz)</label
					>
					<div class="select-ico-wrap">
						<FileText :size="16" class="ico" />
						<select
							class="luxe-select"
							v-model="selectedQuizId"
							:disabled="!selectedCourseId || quizzes.length === 0"
						>
							<option value="">-- Đề thi / Bài đánh giá --</option>
							<option v-for="q in quizzes" :key="q.id" :value="q.quizId">
								{{ q.title }}
							</option>
						</select>
					</div>
				</div>
				<div class="col-md-4">
					<button
						class="btn-premium-action w-100 justify-content-center"
						@click="fetchAnalysis"
						:disabled="!selectedQuizId || loadingStats"
					>
						<div
							v-if="loadingStats"
							class="spinner-border spinner-border-sm me-2"
						></div>
						<BarChart2 v-else :size="18" class="me-2" />
						<span class="fw-800 letter-spacing-1">{{
							loadingStats ? "ĐANG TẢI..." : "XEM PHÂN TÍCH"
						}}</span>
					</button>
				</div>
			</div>
		</div>

		<div class="row mb-5 g-4" v-if="quizData.length > 0">
			<div class="col-xl-4 col-sm-4">
				<div class="glass-stat-card primary-glow bg-white p-4">
					<div class="d-flex align-items-center justify-content-between mb-2">
						<h6
							class="mb-0 text-secondary fw-800 fs-13 text-uppercase letter-spacing-1"
						>
							TỔNG SỐ CÂU HỎI
						</h6>
						<div class="stat-icon-box text-primary">
							<FileText :size="24" />
						</div>
					</div>
					<h2 class="stat-number text-primary">{{ totalQuestions }}</h2>
				</div>
			</div>
			<div class="col-xl-4 col-sm-4">
				<div class="glass-stat-card success-glow bg-white p-4">
					<div class="d-flex align-items-center justify-content-between mb-2">
						<h6
							class="mb-0 text-secondary fw-800 fs-13 text-uppercase letter-spacing-1"
						>
							TỈ LỆ ĐÚNG TRUNG BÌNH
						</h6>
						<div class="stat-icon-box text-success">
							<CheckCircle :size="24" />
						</div>
					</div>
					<h2 class="stat-number text-success">
						{{ avgScore }}<span class="fs-4 ms-1">%</span>
					</h2>
				</div>
			</div>
			<div class="col-xl-4 col-sm-4">
				<div class="glass-stat-card danger-glow bg-white p-4">
					<div class="d-flex align-items-center justify-content-between mb-2">
						<h6
							class="mb-0 text-secondary fw-800 fs-13 text-uppercase letter-spacing-1"
						>
							CÂU HỎI KHÓ NHẤT
						</h6>
						<div class="stat-icon-box text-danger">
							<AlertTriangle :size="24" />
						</div>
					</div>
					<div v-if="hardestQuestion" class="mt-2">
						<h6
							class="text-dark mb-2 text-truncate fw-800 fs-15"
							:title="hardestQuestion.questionText"
						>
							{{ hardestQuestion.questionText }}
						</h6>
						<div class="badge-glass danger d-inline-flex px-3 py-1">
							Tỉ lệ sai: {{ hardestQuestion.errorRate.toFixed(1) }}%
						</div>
					</div>
				</div>
			</div>
		</div>

		<div
			class="glass-panel p-0 overflow-hidden"
			v-if="quizData.length > 0 || loadingStats"
		>
			<div
				class="panel-header-glass d-flex justify-content-between align-items-center p-4 border-bottom border-light"
			>
				<h5 class="fw-800 text-dark mb-0 d-flex align-items-center gap-2">
					Chi tiết từng câu hỏi
				</h5>
				<button class="btn-ghost-gradient shadow-sm" @click="exportExcel">
					<Download :size="16" class="me-2" />
					<span class="fw-800">XUẤT BÁO CÁO</span>
				</button>
			</div>

			<div class="panel-body-glass p-4">
				<div class="text-center py-5" v-if="loadingStats">
					<div class="luxe-spinner mx-auto mb-3"></div>
					<p class="text-secondary fw-600">
						Đang tổng hợp dữ liệu, vui lòng chờ...
					</p>
				</div>

				<div class="table-responsive fix-overflow custom-dt-wrapper" v-else>
					<DataTable
						:data="tableData"
						id="quizAnalysisTable"
						class="display align-middle luxe-table"
						style="min-width: 1000px; width: 100%"
						:options="{
							pageLength: 20,
							order: [[3, 'asc']],
							language: {
								paginate: { next: 'Sau', previous: 'Trước' },
								searchPlaceholder: 'Tìm câu hỏi theo nội dung...',
							},
						}"
					>
						<thead>
							<tr>
								<th style="width: 80px">STT</th>
								<th>NỘI DUNG CÂU HỎI</th>
								<th class="text-center">SỐ LƯỢT LÀM</th>
								<th style="min-width: 180px">ĐỘ KHÓ & TỈ LỆ ĐÚNG</th>
								<th>PHÂN TÍCH LỖI</th>
								<th style="width: 120px" class="text-center">THAO TÁC</th>
							</tr>
						</thead>
					</DataTable>
				</div>
			</div>
		</div>

		<div
			class="empty-state-premium py-5 mt-4"
			v-if="quizData.length === 0 && !loadingStats"
		>
			<div class="empty-icon-glass shadow-sm mb-4">
				<BarChart2 :size="48" class="text-primary opacity-50" />
			</div>
			<h3 class="fw-800 text-dark">Chưa có dữ liệu hiển thị</h3>
			<p class="text-secondary">
				Vui lòng chọn <strong>Khóa học</strong> và <strong>Đề thi</strong> ở bộ
				lọc bên trên, sau đó ấn "Xem Phân tích".
			</p>
		</div>
	</div>
</template>

<style scoped>
.quiz-analysis-page {
	min-height: 100vh;
	animation: fadeIn 0.5s ease-out;
	background: transparent;
	color: #1e293b;
	font-family: "Inter", sans-serif;
}
@keyframes fadeIn {
	from {
		opacity: 0;
		transform: translateY(10px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

.page-header-premium {
	display: flex;
	justify-content: space-between;
	align-items: center;
}
.header-inner {
	display: flex;
	align-items: center;
	gap: 20px;
}
.header-icon-box {
	width: 64px;
	height: 64px;
	border-radius: 20px;
	background: rgba(99, 102, 241, 0.1);
	color: #6366f1;
	display: flex;
	align-items: center;
	justify-content: center;
	border: 1px solid rgba(99, 102, 241, 0.2);
}
.pulse-glow {
	animation: pulse 3s infinite;
}
@keyframes pulse {
	0% {
		box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4);
	}
	70% {
		box-shadow: 0 0 0 10px rgba(99, 102, 241, 0);
	}
	100% {
		box-shadow: 0 0 0 0 rgba(99, 102, 241, 0);
	}
}
.title-gradient {
	font-size: 32px;
	font-weight: 800;
	background: linear-gradient(90deg, #1e293b, #6366f1);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	margin: 0;
}
.desc-text {
	color: #64748b;
	margin-top: 4px;
	font-weight: 500;
}
.badge-glass {
	padding: 4px 12px;
	border-radius: 20px;
	font-size: 11px;
	font-weight: 800;
	letter-spacing: 0.5px;
	display: inline-flex;
	align-items: center;
	border: 1px solid transparent;
}
.badge-glass.primary {
	background: rgba(99, 102, 241, 0.1);
	color: #4f46e5;
	border-color: rgba(99, 102, 241, 0.2);
}
.badge-glass.success {
	background: rgba(16, 185, 129, 0.1);
	color: #10b981;
	border-color: rgba(16, 185, 129, 0.2);
}
.badge-glass.warning {
	background: rgba(245, 158, 11, 0.1);
	color: #d97706;
	border-color: rgba(245, 158, 11, 0.2);
}
.badge-glass.danger {
	background: rgba(239, 68, 68, 0.1);
	color: #ef4444;
	border-color: rgba(239, 68, 68, 0.2);
}

.glass-panel {
	background: rgba(255, 255, 255, 0.85);
	backdrop-filter: blur(12px);
	border-radius: 24px;
	border: 1px solid white;
	box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.05);
	padding: 32px;
}
.select-ico-wrap {
	position: relative;
}
.select-ico-wrap .ico {
	position: absolute;
	left: 16px;
	top: 50%;
	transform: translateY(-50%);
	color: #64748b;
	pointer-events: none;
	z-index: 2;
	transition: 0.3s;
}
.luxe-select {
	width: 100%;
	padding: 14px 20px 14px 44px;
	border-radius: 14px;
	border: 1px solid #e2e8f0;
	font-size: 14px;
	font-weight: 600;
	color: #1e293b;
	outline: none;
	transition: 0.3s;
	background: #f8fafc;
	appearance: none;
	cursor: pointer;
}
.luxe-select:focus {
	border-color: #6366f1;
	background: white;
	box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}
.luxe-select:focus + .ico {
	color: #6366f1;
}

.btn-premium-action {
	padding: 14px 24px;
	background: linear-gradient(135deg, #6366f1, #4f46e5);
	color: white;
	border-radius: 14px;
	display: flex;
	align-items: center;
	border: none;
	transition: all 0.3s;
	cursor: pointer;
}
.btn-premium-action:hover:not(:disabled) {
	transform: translateY(-3px);
	box-shadow: 0 10px 20px -5px rgba(99, 102, 241, 0.4);
}
.btn-premium-action:disabled {
	opacity: 0.7;
	cursor: not-allowed;
}

.btn-ghost-gradient {
	padding: 8px 20px;
	border-radius: 12px;
	background: white;
	border: 1px solid #e2e8f0;
	text-transform: uppercase;
	font-size: 12px;
	display: flex;
	align-items: center;
	transition: 0.3s;
	color: #4f46e5;
	cursor: pointer;
}
.btn-ghost-gradient:hover {
	border-color: #6366f1;
	background: #6366f1;
	color: white;
	transform: translateY(-2px);
	box-shadow: 0 10px 15px -5px rgba(99, 102, 241, 0.2);
}

.glass-stat-card {
	border-radius: 24px;
	border: 1px solid white;
	box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.08);
	transition: 0.4s;
	position: relative;
	overflow: hidden;
	z-index: 1;
}
.glass-stat-card::before {
	content: "";
	position: absolute;
	inset: 0;
	background: radial-gradient(
		circle at top right,
		rgba(255, 255, 255, 0.8),
		transparent 70%
	);
	z-index: -1;
}
.glass-stat-card:hover {
	transform: translateY(-5px);
}
.primary-glow:hover {
	box-shadow: 0 20px 40px -10px rgba(99, 102, 241, 0.2);
	border-color: rgba(99, 102, 241, 0.2);
}
.success-glow:hover {
	box-shadow: 0 20px 40px -10px rgba(16, 185, 129, 0.2);
	border-color: rgba(16, 185, 129, 0.2);
}
.danger-glow:hover {
	box-shadow: 0 20px 40px -10px rgba(239, 68, 68, 0.2);
	border-color: rgba(239, 68, 68, 0.2);
}

.stat-icon-box {
	width: 44px;
	height: 44px;
	border-radius: 14px;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #f8fafc;
}
.primary-glow .stat-icon-box {
	background: rgba(99, 102, 241, 0.1);
}
.success-glow .stat-icon-box {
	background: rgba(16, 185, 129, 0.1);
}
.danger-glow .stat-icon-box {
	background: rgba(239, 68, 68, 0.1);
}

.stat-number {
	font-size: 42px;
	font-weight: 900;
	letter-spacing: -1px;
	margin: 0;
	line-height: 1;
	text-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.loading-state-luxe,
.empty-state-premium {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	text-align: center;
}
.luxe-spinner {
	width: 40px;
	height: 40px;
	border: 4px solid rgba(99, 102, 241, 0.2);
	border-top-color: #6366f1;
	border-radius: 50%;
	animation: spin 1s linear infinite;
}
@keyframes spin {
	100% {
		transform: rotate(360deg);
	}
}
.empty-icon-glass {
	width: 90px;
	height: 90px;
	border-radius: 50%;
	background: linear-gradient(
		135deg,
		rgba(99, 102, 241, 0.05),
		rgba(99, 102, 241, 0.02)
	);
	border: 1px solid rgba(99, 102, 241, 0.1);
	display: flex;
	align-items: center;
	justify-content: center;
}

:deep(.dt-container) {
	font-family: "Inter", system-ui, sans-serif;
	padding: 0;
	color: #1e293b;
}
:deep(.dt-layout-row) {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20px;
}
:deep(.dt-layout-row:last-child) {
	margin-bottom: 0;
	margin-top: 20px;
}

:deep(table.dataTable.luxe-table) {
	border-collapse: separate !important;
	border-spacing: 0 8px !important;
	width: 100% !important;
	margin: 0 !important;
	border: none;
}
:deep(table.dataTable.luxe-table thead th) {
	background: transparent;
	color: #94a3b8;
	font-size: 11px;
	font-weight: 800;
	text-transform: uppercase;
	letter-spacing: 0.5px;
	padding: 10px 20px;
	border: none;
	text-align: left;
}
:deep(table.dataTable.luxe-table tbody td) {
	padding: 16px 20px;
	background: white;
	border-bottom: none;
	border-top: 1px solid #f8fafc;
	border-bottom: 1px solid #f8fafc;
	font-size: 14px;
	transition: 0.3s;
}
:deep(table.dataTable.luxe-table tbody tr:hover td) {
	background: #f8fafc;
}
:deep(table.dataTable.luxe-table tbody td:first-child) {
	border-radius: 16px 0 0 16px;
	border-left: 1px solid #f8fafc;
}
:deep(table.dataTable.luxe-table tbody td:last-child) {
	border-radius: 0 16px 16px 0;
	border-right: 1px solid #f8fafc;
}

:deep(.capsule-progress) {
	height: 8px;
	border-radius: 10px;
	background: #f1f5f9;
	overflow: visible;
	border: 1px solid rgba(0, 0, 0, 0.05);
}
:deep(.capsule-progress .progress-bar) {
	border-radius: 10px;
	position: relative;
}
:deep(.capsule-progress.glow-success .progress-bar) {
	box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);
	background-color: #10b981 !important;
}
:deep(.capsule-progress.glow-warning .progress-bar) {
	box-shadow: 0 2px 8px rgba(245, 158, 11, 0.4);
	background-color: #f59e0b !important;
}
:deep(.capsule-progress.glow-danger .progress-bar) {
	box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
	background-color: #ef4444 !important;
}

:deep(.question-text-cell) {
	max-width: 350px;
	white-space: normal;
	line-height: 1.5;
}

:deep(.btn-ghost-glass) {
	padding: 6px 14px;
	border-radius: 10px;
	border: 1px solid #e2e8f0;
	background: white;
	display: inline-flex;
	align-items: center;
	gap: 6px;
	transition: 0.3s;
	cursor: pointer;
}
:deep(.btn-ghost-glass:hover) {
	background: #f8fafc;
	border-color: #cbd5e1;
	transform: translateY(-1px);
}

:deep(.dt-search input),
:deep(.dt-length select) {
	border: 1px solid #e2e8f0;
	border-radius: 12px;
	padding: 10px 16px;
	outline: none;
	font-size: 14px;
	font-weight: 600;
	background: #f8fafc;
	transition: 0.3s;
	color: #1e293b;
}
:deep(.dt-search input:focus),
:deep(.dt-length select:focus) {
	border-color: #6366f1;
	background: white;
	box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}
:deep(.dt-search input) {
	width: 300px;
	padding-left: 40px;
	background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='11' cy='11' r='8'%3E%3C/circle%3E%3Cline x1='21' y1='21' x2='16.65' y2='16.65'%3E%3C/line%3E%3C/svg%3E");
	background-repeat: no-repeat;
	background-position: 12px center;
}

:deep(.dt-paging .dt-paging-button) {
	padding: 8px 14px !important;
	border-radius: 10px !important;
	border: 1px solid transparent !important;
	background: transparent !important;
	color: #64748b !important;
	font-weight: 600;
	cursor: pointer;
	margin: 0 2px;
	transition: 0.3s;
}
:deep(.dt-paging .dt-paging-button:hover:not(.current):not(.disabled)) {
	background: #f1f5f9 !important;
	color: #1e293b !important;
}
:deep(.dt-paging .dt-paging-button.current) {
	background: #6366f1 !important;
	color: white !important;
	box-shadow: 0 4px 10px rgba(99, 102, 241, 0.3);
	border: none !important;
}
:deep(.dt-paging .dt-paging-button.disabled) {
	color: #cbd5e1 !important;
	cursor: not-allowed;
}
</style>
