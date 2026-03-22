<template>
	<div class="reports-page">
		<div class="page-header">
			<div class="header-content">
				<div class="header-icon-box pulse-glow">
					<PieChart :size="32" />
				</div>
				<div>
					<h1 class="page-title-gradient">Báo cáo & Thống kê</h1>
					<p class="page-desc">
						Theo dõi tiến độ đào tạo và năng suất học viên với số liệu trực quan
					</p>
				</div>
			</div>
		</div>

		<div class="tabs-container">
			<div ref="tabsRef" class="tabs glass-tabs">
				<div class="tab-indicator" :style="indicatorStyle" />
				<button
					class="tab"
					:class="{ active: tab === 'training' }"
					@click="switchTab('training', $event)"
				>
					<TrendingUp :size="16" /> Tiến độ
				</button>
				<button
					class="tab"
					:class="{ active: tab === 'inactive' }"
					@click="switchTab('inactive', $event)"
				>
					<UserX :size="16" /> Lười học
				</button>
				<button
					class="tab"
					:class="{ active: tab === 'quiz' }"
					@click="switchTab('quiz', $event)"
				>
					<ClipboardList :size="16" /> Phân tích đề thi
				</button>
			</div>
		</div>

		<div class="tab-content-wrapper">
			<Transition name="fade-slide" mode="out-in">
				<div v-if="tab === 'training'" :key="'training'" class="tab-content">
					<div class="report-section glass-card">
						<div class="section-bar">
							<h2 class="section-title">Tiến độ Học tập</h2>
						</div>

						<div class="table-container custom-scrollbar">
							<div v-if="isLoadingTraining" class="text-center py-5">
								<Loader2
									class="spinner-icon mx-auto text-primary mb-2"
									:size="40"
								/>
								<p class="text-tertiary">Đang tổng hợp dữ liệu tiến độ...</p>
							</div>

							<table v-else-if="trainingReport.length > 0" class="glass-table">
								<thead>
									<tr>
										<th>Nhân viên</th>
										<th>Khóa học</th>
										<th>Tiến độ</th>
										<th>Trạng thái</th>
										<th>Hạn chót</th>
									</tr>
								</thead>
								<tbody>
									<tr
										v-for="r in trainingReport"
										:key="r.userId + '-' + r.courseId"
										:class="{ 'row-overdue': r.isOverdue }"
									>
										<td>
											<div class="user-cell">
												<div
													class="user-avatar"
													:style="{ background: getAvatarColor(r.fullName) }"
												>
													{{ getInitials(r.fullName) }}
												</div>
												<div class="user-info">
													<span class="u-name">{{ r.fullName }}</span>
													<span class="u-email">{{ r.email }}</span>
												</div>
											</div>
										</td>
										<td>
											<span class="cell-text font-bold">{{
												r.courseTitle
											}}</span>
										</td>
										<td style="min-width: 140px">
											<div class="progress-wrap">
												<div class="progress-bar-bg">
													<div
														class="progress-bar-fill"
														:class="getProgressColor(r.progressPercent)"
														:style="{ width: r.progressPercent + '%' }"
													/>
												</div>
												<span class="progress-pct"
													>{{ r.progressPercent }}%</span
												>
											</div>
										</td>
										<td>
											<span
												class="status-pill"
												:class="getStatusClass(r.status)"
											>
												<component :is="getStatusIcon(r.status)" :size="14" />
												{{ r.status }}
											</span>
										</td>
										<td>
											<div
												class="deadline-cell"
												:class="{ 'text-danger': r.isOverdue }"
											>
												<CalendarClock
													v-if="r.isOverdue"
													:size="14"
													class="inline-icon"
												/>
												{{
													r.deadline
														? new Date(r.deadline).toLocaleDateString("vi-VN")
														: "-"
												}}
											</div>
										</td>
									</tr>
								</tbody>
							</table>
							<div v-else class="empty-state">
								<FileSearch :size="48" class="empty-icon" />
								<h3>Chưa có dữ liệu tiến độ</h3>
								<p>Không tìm thấy thông tin học tập nào vào lúc này.</p>
							</div>
						</div>
					</div>
				</div>

				<div
					v-else-if="tab === 'inactive'"
					:key="'inactive'"
					class="tab-content"
				>
					<div class="report-section glass-card">
						<div class="section-bar">
							<h2 class="section-title">Danh sách Lười học</h2>
						</div>

						<div class="table-container custom-scrollbar">
							<div v-if="isLoadingInactive" class="text-center py-5">
								<Loader2
									class="spinner-icon mx-auto text-danger mb-2"
									:size="40"
								/>
								<p class="text-tertiary">
									Đang quét danh sách nhân sự lười học...
								</p>
							</div>

							<table v-else-if="inactiveReport.length > 0" class="glass-table">
								<thead>
									<tr>
										<th>Nhân viên</th>
										<th>Khóa học</th>
										<th>Lần cuối truy cập</th>
										<th>Mức độ</th>
									</tr>
								</thead>
								<tbody>
									<tr
										v-for="r in inactiveReport"
										:key="r.userId + '-' + r.courseId"
										class="row-warning"
									>
										<td>
											<div class="user-cell">
												<div
													class="user-avatar"
													:style="{ background: getAvatarColor(r.fullName) }"
												>
													{{ getInitials(r.fullName) }}
												</div>
												<div class="user-info">
													<span class="u-name">{{ r.fullName }}</span>
													<span class="u-email">{{ r.email }}</span>
												</div>
											</div>
										</td>
										<td>
											<span class="cell-text font-bold">{{
												r.courseTitle
											}}</span>
										</td>
										<td>
											<span class="cell-text">
												{{
													r.lastActiveDate
														? new Date(r.lastActiveDate).toLocaleDateString(
																"vi-VN",
															)
														: "Chưa từng truy cập"
												}}
											</span>
										</td>
										<td>
											<div class="alert-card danger-light">
												<AlertTriangle :size="14" />
												<span
													>Bỏ bê
													<strong>{{ r.inactiveDays }}</strong> ngày</span
												>
											</div>
										</td>
									</tr>
								</tbody>
							</table>
							<div v-else class="empty-state">
								<CheckCircle2 :size="48" class="empty-icon text-success" />
								<h3>Tuyệt vời!</h3>
								<p>Không có học viên nào lười học trong hệ thống.</p>
							</div>
						</div>
					</div>
				</div>

				<div v-else-if="tab === 'quiz'" :key="'quiz'" class="tab-content">
					<div class="report-section glass-card">
						<div class="section-bar quiz-bar">
							<h2 class="section-title">Phân tích Câu hỏi (Quiz)</h2>
							<div class="glass-search inline">
								<Search :size="16" class="animated-icon" />
								<input
									v-model.number="quizId"
									type="number"
									class="search-input-premium sm"
									placeholder="Nhập Quiz ID..."
									@keyup.enter="loadQuizAnalytics"
								/>
								<button
									class="btn btn-primary btn-glow btn-inline"
									@click="loadQuizAnalytics"
								>
									Lọc
								</button>
							</div>
						</div>

						<div class="table-container custom-scrollbar mt-4">
							<div v-if="isLoadingQuiz" class="text-center py-5">
								<Loader2
									class="spinner-icon mx-auto text-warning mb-2"
									:size="40"
								/>
								<p class="text-tertiary">
									Đang tính toán tỉ lệ trả lời đúng/sai...
								</p>
							</div>

							<table v-else-if="quizAnalytics.length > 0" class="glass-table">
								<thead>
									<tr>
										<th>Nội dung câu hỏi</th>
										<th>Tổng lượt trả lời</th>
										<th>Số lần sai</th>
										<th>Tỉ lệ sai (Cảnh báo)</th>
									</tr>
								</thead>
								<tbody>
									<tr v-for="q in quizAnalytics" :key="q.questionId">
										<td style="max-width: 300px">
											<div class="question-text" :title="q.questionText">
												{{ q.questionText }}
											</div>
										</td>
										<td>
											<span class="stat-badge neutral">{{
												q.totalAttempts
											}}</span>
										</td>
										<td>
											<span class="stat-badge warning">{{
												q.wrongAnswers
											}}</span>
										</td>
										<td style="min-width: 180px">
											<div class="error-rate-wrap">
												<span
													class="error-pct font-bold"
													:class="{ critical: q.errorRate > 50 }"
													>{{ q.errorRate.toFixed(1) }}%</span
												>
												<div class="error-bar-bg">
													<div
														class="error-bar-fill"
														:style="{ width: q.errorRate + '%' }"
														:class="{ 'high-error': q.errorRate > 50 }"
													/>
												</div>
											</div>
										</td>
									</tr>
								</tbody>
							</table>
							<div v-else class="empty-state">
								<BarChart3 :size="48" class="empty-icon" />
								<h3>Chưa có dữ liệu phân tích</h3>
								<p>Vui lòng nhập Quiz ID và nhấn nút Lọc để xem thống kê.</p>
							</div>
						</div>
					</div>
				</div>
			</Transition>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from "vue";
import { reportAPI } from "@/services/api";
import { toast } from "vue3-toastify";
import {
	BarChart3,
	PieChart,
	TrendingUp,
	UserX,
	ClipboardList,
	Search,
	FileSearch,
	CheckCircle2,
	CalendarClock,
	AlertTriangle,
	CheckCircle,
	Clock,
	PlayCircle,
	Loader2,
} from "lucide-vue-next";

const tab = ref("training");
const tabsRef = ref(null);
const indicatorStyle = ref({});

const trainingReport = ref([]);
const inactiveReport = ref([]);
const quizAnalytics = ref([]);
const quizId = ref(1);

const isLoadingTraining = ref(false);
const isLoadingInactive = ref(false);
const isLoadingQuiz = ref(false);

function switchTab(newTab, event) {
	tab.value = newTab;
	if (newTab === "training" && trainingReport.value.length === 0)
		loadTraining();
	else if (newTab === "inactive" && inactiveReport.value.length === 0)
		loadInactive();

	updateIndicator(event.currentTarget);
}

function updateIndicator(el) {
	if (el)
		indicatorStyle.value = {
			width: `${el.offsetWidth}px`,
			transform: `translateX(${el.offsetLeft}px)`,
		};
}

onMounted(() => {
	loadTraining();
	nextTick(() => updateIndicator(tabsRef.value?.querySelector(".tab.active")));
});

watch(tab, () =>
	nextTick(() => updateIndicator(tabsRef.value?.querySelector(".tab.active"))),
);

async function loadTraining() {
	isLoadingTraining.value = true;
	try {
		const { data } = await reportAPI.getTraining();
		trainingReport.value = data || [];
	} catch {
		toast.error("Không thể tải báo cáo tiến độ.");
	} finally {
		isLoadingTraining.value = false;
	}
}

async function loadInactive() {
	isLoadingInactive.value = true;
	try {
		const { data } = await reportAPI.getInactive(30);
		inactiveReport.value = data || [];
	} catch {
		toast.error("Không thể tải danh sách lười học.");
	} finally {
		isLoadingInactive.value = false;
	}
}

async function loadQuizAnalytics() {
	if (!quizId.value) return;
	isLoadingQuiz.value = true;
	try {
		const { data } = await reportAPI.getQuizAnalytics(quizId.value);
		quizAnalytics.value = Array.isArray(data) ? data : data.items || [];
	} catch {
		toast.error("Không thể tải phân tích đề thi.");
	} finally {
		isLoadingQuiz.value = false;
	}
}

function getAvatarColor(name) {
	const colors = [
		"linear-gradient(135deg, #6366f1, #a855f7)",
		"linear-gradient(135deg, #3b82f6, #2dd4bf)",
		"linear-gradient(135deg, #f59e0b, #ef4444)",
		"linear-gradient(135deg, #10b981, #3b82f6)",
		"linear-gradient(135deg, #ec4899, #8b5cf6)",
	];
	let hash = 0;
	for (let i = 0; i < (name?.length || 0); i++)
		hash = name.charCodeAt(i) + ((hash << 5) - hash);
	return colors[Math.abs(hash) % colors.length];
}

function getInitials(name) {
	return !name
		? "U"
		: name
				.split(" ")
				.map((n) => n[0])
				.join("")
				.substring(0, 2)
				.toUpperCase();
}

function getProgressColor(pct) {
	if (pct < 30) return "danger";
	if (pct < 70) return "warning";
	return "success";
}

function getStatusClass(status) {
	switch (status) {
		case "Hoàn thành":
			return "pill-success";
		case "Đang học":
			return "pill-primary";
		default:
			return "pill-warning";
	}
}

function getStatusIcon(status) {
	switch (status) {
		case "Hoàn thành":
			return CheckCircle;
		case "Đang học":
			return PlayCircle;
		default:
			return Clock;
	}
}
</script>

<style scoped>
.reports-page {
	padding-bottom: var(--space-2xl);
	color: var(--text-primary);
	box-sizing: border-box;
}
.page-header {
	margin-bottom: var(--space-xl);
}
.header-content {
	display: flex;
	align-items: center;
	gap: var(--space-xl);
}
.header-icon-box {
	width: 64px;
	height: 64px;
	border-radius: 20px;
	background: linear-gradient(
		135deg,
		rgba(99, 102, 241, 0.15),
		rgba(99, 102, 241, 0.05)
	);
	color: var(--primary-500);
	display: flex;
	align-items: center;
	justify-content: center;
	border: 1px solid rgba(99, 102, 241, 0.2);
	box-shadow: 0 8px 20px rgba(99, 102, 241, 0.15);
	flex-shrink: 0;
}
.pulse-glow {
	animation: pulse-border 3s ease-in-out infinite;
}
@keyframes pulse-border {
	0% {
		box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.2);
	}
	50% {
		box-shadow: 0 0 0 15px rgba(99, 102, 241, 0);
	}
	100% {
		box-shadow: 0 0 0 0 rgba(99, 102, 241, 0);
	}
}

.page-title-gradient {
	font-size: 32px;
	font-weight: 800;
	letter-spacing: -0.02em;
	color: var(--text-primary);
	margin-bottom: 8px;
}
.page-desc {
	font-size: var(--font-size-base);
	color: var(--text-secondary);
	max-width: 600px;
	line-height: 1.5;
}

.tabs-container {
	margin-bottom: var(--space-xl);
	display: flex;
}
.glass-tabs {
	background: #ffffff;
	border: 1px solid rgba(0, 0, 0, 0.05);
	border-radius: var(--radius-full);
	padding: 6px;
	display: inline-flex;
	position: relative;
	box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
}
.tab-indicator {
	position: absolute;
	top: 6px;
	left: 0;
	height: calc(100% - 12px);
	background: var(--primary-500);
	border-radius: var(--radius-full);
	transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
	box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
	z-index: 0;
}
.tab {
	position: relative;
	z-index: 1;
	padding: 10px 24px;
	border-radius: var(--radius-full);
	display: flex;
	align-items: center;
	gap: 8px;
	font-size: var(--font-size-sm);
	font-weight: 600;
	color: var(--text-secondary);
	text-transform: uppercase;
	letter-spacing: 0.05em;
	transition: color 0.3s;
	background: transparent;
	border: none;
	cursor: pointer;
}
.tab:hover {
	color: var(--text-primary);
}
.tab.active {
	color: white;
}

.tab-content-wrapper {
	min-height: 500px;
}
.glass-card {
	background: #ffffff;
	border: 1px solid rgba(0, 0, 0, 0.05);
	border-radius: var(--radius-2xl);
	box-shadow: 0 8px 32px rgba(0, 0, 0, 0.04);
	padding: var(--space-2xl);
	overflow: hidden;
}
.section-bar {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: var(--space-xl);
}
.quiz-bar {
	flex-wrap: wrap;
	gap: var(--space-md);
}
.section-title {
	font-size: var(--font-size-xl);
	font-weight: 800;
	color: var(--text-primary);
}

.table-container {
	width: 100%;
	overflow-x: auto;
}
.glass-table {
	width: 100%;
	border-collapse: separate;
	border-spacing: 0 8px;
	min-width: 800px;
}
.glass-table th {
	text-align: left;
	padding: 16px;
	font-size: 13px;
	font-weight: 700;
	color: var(--text-tertiary);
	text-transform: uppercase;
	letter-spacing: 0.05em;
	border-bottom: 2px solid rgba(0, 0, 0, 0.05);
	white-space: nowrap;
	position: sticky;
	top: 0;
	z-index: 10;
	background: #ffffff;
}
.glass-table td {
	padding: 16px;
	font-size: var(--font-size-sm);
	background: rgba(249, 250, 251, 0.6);
	border-top: 1px solid rgba(0, 0, 0, 0.02);
	border-bottom: 1px solid rgba(0, 0, 0, 0.02);
	transition: all 0.3s;
}
.glass-table td:first-child {
	border-left: 1px solid rgba(0, 0, 0, 0.02);
	border-top-left-radius: 12px;
	border-bottom-left-radius: 12px;
}
.glass-table td:last-child {
	border-right: 1px solid rgba(0, 0, 0, 0.02);
	border-top-right-radius: 12px;
	border-bottom-right-radius: 12px;
}
.glass-table tbody tr {
	transition: all 0.3s;
}
.glass-table tbody tr:hover td {
	background: #ffffff;
	transform: translateY(-2px);
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
	border-color: rgba(99, 102, 241, 0.1);
}

.row-overdue td {
	background: linear-gradient(to right, rgba(239, 68, 68, 0.05), transparent);
	border-color: rgba(239, 68, 68, 0.1);
}
.row-overdue:hover td {
	border-color: rgba(239, 68, 68, 0.3);
	box-shadow: 0 4px 12px rgba(239, 68, 68, 0.05);
}
.row-warning td {
	background: linear-gradient(to right, rgba(245, 158, 11, 0.05), transparent);
}

.user-cell {
	display: flex;
	align-items: center;
	gap: 12px;
}
.user-avatar {
	width: 40px;
	height: 40px;
	border-radius: 12px;
	display: flex;
	align-items: center;
	justify-content: center;
	color: white;
	font-weight: 700;
	font-size: 14px;
	box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
	flex-shrink: 0;
}
.user-info {
	display: flex;
	flex-direction: column;
}
.u-name {
	font-weight: 700;
	color: var(--text-primary);
}
.u-email {
	font-size: 12px;
	color: var(--text-secondary);
}

.cell-text {
	color: var(--text-secondary);
}
.font-bold {
	font-weight: 600;
	color: var(--text-primary);
}
.progress-wrap {
	display: flex;
	align-items: center;
	gap: 12px;
}
.progress-bar-bg {
	flex: 1;
	height: 8px;
	background: rgba(0, 0, 0, 0.05);
	border-radius: 10px;
	overflow: hidden;
}
.progress-bar-fill {
	height: 100%;
	border-radius: 10px;
	transition: width 1s cubic-bezier(0.25, 1, 0.5, 1);
}
.progress-bar-fill.success {
	background: linear-gradient(90deg, #10b981, #34d399);
}
.progress-bar-fill.warning {
	background: linear-gradient(90deg, #f59e0b, #fbbf24);
}
.progress-bar-fill.danger {
	background: linear-gradient(90deg, #ef4444, #f87171);
}
.progress-pct {
	font-weight: 700;
	font-size: 12px;
	min-width: 36px;
	text-align: right;
}

.status-pill {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	padding: 4px 12px;
	border-radius: 20px;
	font-size: 12px;
	font-weight: 700;
}
.pill-success {
	background: rgba(16, 185, 129, 0.1);
	color: #059669;
	border: 1px solid rgba(16, 185, 129, 0.2);
}
.pill-primary {
	background: rgba(99, 102, 241, 0.1);
	color: #4f46e5;
	border: 1px solid rgba(99, 102, 241, 0.2);
}
.pill-warning {
	background: rgba(245, 158, 11, 0.1);
	color: #d97706;
	border: 1px solid rgba(245, 158, 11, 0.2);
}

.deadline-cell {
	display: flex;
	align-items: center;
	gap: 6px;
	font-weight: 500;
}
.text-danger {
	color: #dc2626;
	font-weight: 700;
}
.inline-icon {
	color: inherit;
}

.alert-card.danger-light {
	display: inline-flex;
	align-items: center;
	gap: 8px;
	background: rgba(239, 68, 68, 0.1);
	border: 1px solid rgba(239, 68, 68, 0.2);
	color: #b91c1c;
	padding: 6px 12px;
	border-radius: 8px;
	font-size: 13px;
	font-weight: 500;
}

.question-text {
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	font-weight: 500;
	color: var(--text-primary);
}
.stat-badge {
	padding: 4px 12px;
	border-radius: 8px;
	font-weight: 700;
	font-size: 13px;
}
.stat-badge.neutral {
	background: rgba(0, 0, 0, 0.05);
	color: var(--text-secondary);
	border: 1px solid rgba(0, 0, 0, 0.05);
}
.stat-badge.warning {
	background: rgba(245, 158, 11, 0.1);
	color: #d97706;
	border: 1px solid rgba(245, 158, 11, 0.2);
}

.error-rate-wrap {
	display: flex;
	align-items: center;
	gap: 12px;
}
.error-pct {
	width: 45px;
	font-size: 13px;
}
.error-pct.critical {
	color: #dc2626;
}
.error-bar-bg {
	flex: 1;
	height: 6px;
	background: rgba(0, 0, 0, 0.05);
	border-radius: 10px;
	overflow: hidden;
	display: flex;
	flex-direction: row-reverse;
}
.error-bar-fill {
	height: 100%;
	background: linear-gradient(270deg, #ef4444, #fca5a5);
	border-radius: 10px;
	transition: width 1s ease-out;
}
.error-bar-fill.high-error {
	background: linear-gradient(270deg, #b91c1c, #ef4444);
}

.glass-search.inline {
	display: flex;
	align-items: center;
	background: #ffffff;
	border: 1px solid rgba(0, 0, 0, 0.1);
	border-radius: var(--radius-full);
	padding: 4px;
	padding-left: 16px;
	box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
	width: 100%;
	max-width: 400px;
	box-sizing: border-box;
}
.glass-search.inline:focus-within {
	border-color: var(--primary-400);
	box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}
.search-input-premium.sm {
	flex: 1;
	border: none;
	background: transparent;
	padding: 10px 12px 10px 8px;
	font-size: 14px;
	outline: none;
	color: var(--text-primary);
	box-shadow: none;
	min-width: 0;
}
.btn-inline {
	border-radius: var(--radius-full);
	padding: 8px 24px;
	font-weight: 600;
	cursor: pointer;
	border: none;
	white-space: nowrap;
}
.btn-primary {
	background: var(--primary-500);
	color: white;
}
.btn-glow {
	box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
	transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.btn-glow:hover {
	transform: translateY(-2px);
	box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
}
.animated-icon {
	color: var(--text-tertiary);
}
.glass-search.inline:focus-within .animated-icon {
	color: var(--primary-500);
}

.empty-state {
	padding: 60px 20px;
	text-align: center;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	color: var(--text-secondary);
}
.empty-icon {
	color: var(--text-tertiary);
	margin-bottom: 20px;
	opacity: 0.5;
}
.empty-icon.text-success {
	color: #10b981;
	opacity: 0.8;
}
.empty-state h3 {
	font-size: 20px;
	font-weight: 800;
	color: var(--text-primary);
	margin-bottom: 8px;
}
.empty-state p {
	font-size: 14px;
	max-width: 400px;
	line-height: 1.5;
}

.custom-scrollbar::-webkit-scrollbar {
	height: 8px;
}
.custom-scrollbar::-webkit-scrollbar-track {
	background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
	background: rgba(0, 0, 0, 0.1);
	border-radius: 10px;
}
.custom-scrollbar:hover::-webkit-scrollbar-thumb {
	background: rgba(0, 0, 0, 0.2);
}

.mt-4 {
	margin-top: 1rem;
}
.mb-2 {
	margin-bottom: 0.5rem;
}
.text-tertiary {
	color: var(--text-tertiary);
}
.spinner-icon {
	animation: spin 1s linear infinite;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
	transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.fade-slide-enter-from {
	opacity: 0;
	transform: translateY(20px);
}
.fade-slide-leave-to {
	opacity: 0;
	transform: translateY(-20px);
	position: absolute;
	width: 100%;
}

@media (max-width: 768px) {
	.header-content {
		flex-direction: column;
		align-items: flex-start;
		gap: 16px;
	}
	.tabs-container {
		overflow-x: auto;
		padding-bottom: 8px;
		margin-bottom: 16px;
	}
	.glass-search.inline {
		max-width: 100%;
	}
}

.lucide {
	flex-shrink: 0;
}
.empty-icon {
	flex-shrink: 0;
	min-width: 48px;
	min-height: 48px;
	display: inline-flex;
	justify-content: center;
}
.empty-icon svg {
	width: 48px !important;
	height: 48px !important;
}
.status-pill svg {
	width: 14px !important;
	height: 14px !important;
}
@keyframes spin {
	100% {
		transform: rotate(360deg);
	}
}
</style>
