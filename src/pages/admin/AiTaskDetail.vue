<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
	Loader2,
	AlertCircle,
	CheckCircle2,
	ChevronLeft,
	Sparkles,
	Clock,
	CircleDashed,
} from "lucide-vue-next";
import { aiAPI } from "@/services/api";
import * as signalR from "@microsoft/signalr";

const route = useRoute();
const router = useRouter();
const jobId = route.params.jobId;

const task = ref(null);
const loading = ref(true);
const error = ref(null);
let connection = null;

const statusClass = computed(() => {
	if (!task.value) return "";
	if (task.value.isCompleted) return "badge-success";
	if (task.value.isFailed) return "badge-danger";
	return "badge-primary";
});

const fetchTask = async () => {
	try {
		loading.value = true;
		const res = await aiAPI.getCourseProgress(jobId);
		task.value = res.data;
		if (!task.value.isCompleted && !task.value.isFailed) {
			setupSignalR();
		}
	} catch {
		error.value =
			"Không thể tải thông tin tác vụ. Có thể mã Job ID không hợp lệ.";
	} finally {
		loading.value = false;
	}
};

const getSubTaskIcon = (status) => {
	switch (status) {
		case "completed":
			return CheckCircle2;
		case "running":
			return Loader2;
		case "failed":
			return AlertCircle;
		default:
			return Clock;
	}
};

const setupSignalR = () => {
	if (connection) return;

	connection = new signalR.HubConnectionBuilder()
		.withUrl(`${import.meta.env.VITE_API_URL}/hubs/ai`)
		.withAutomaticReconnect()
		.build();

	connection.on("JobProgressUpdated", (data) => {
		if (data.jobId === jobId) {
			task.value.progress = data.progress;
			task.value.status = data.status;
			task.value.isFailed = data.isFailed;
			task.value.resultJson = data.resultJson;
			task.value.errorMessage = data.errorMessage;
			task.value.subTasks = data.subTasks;
		}
	});

	connection
		.start()
		.then(() => {
			connection.invoke("JoinJobGroup", jobId);
		})
		.catch(() => {});
};

const formatDate = (dateStr) => {
	if (!dateStr) return "";
	return new Date(dateStr).toLocaleString("vi-VN");
};

onMounted(fetchTask);

onUnmounted(() => {
	if (connection) {
		connection.stop();
	}
});
</script>

<template>
	<div class="ai-task-detail-page">
		<div class="header-nav">
			<button @click="router.back()" class="back-btn">
				<ChevronLeft :size="20" />
				<span>Quay lại</span>
			</button>
		</div>

		<div class="content-wrapper">
			<div v-if="loading" class="state-container">
				<Loader2 class="animate-spin text-primary" :size="48" />
				<p>Đang kết nối với AI Doctor...</p>
			</div>

			<div v-else-if="error" class="state-container error-card">
				<AlertCircle class="text-danger" :size="64" />
				<h2>Ối! Có lỗi xảy ra</h2>
				<p>{{ error }}</p>
				<button @click="router.push('/dashboard')" class="btn btn-primary">
					Về Dashboard
				</button>
			</div>

			<div v-else class="task-card glass-panel">
				<div class="card-header">
					<div class="topic-info">
						<div class="icon-box">
							<Sparkles
								:size="24"
								:class="{
									'animate-pulse': !task.isCompleted && !task.isFailed,
								}"
							/>
						</div>
						<div class="text-box">
							<h1>{{ task.topic }}</h1>
							<p>Tác vụ thiết kế cấu trúc bài giảng bằng AI</p>
						</div>
					</div>
					<div class="status-badge" :class="statusClass">
						{{ task.status }}
					</div>
				</div>

				<div class="card-body">
					<div class="progress-section">
						<div class="progress-labels">
							<span class="label">Tiến độ quy trình</span>
							<span class="value">{{ task.progress }}%</span>
						</div>
						<div class="progress-bar-outer">
							<div
								class="progress-bar-inner"
								:style="{ width: task.progress + '%' }"
								:class="{
									pulse: !task.isCompleted && !task.isFailed,
									completed: task.isCompleted,
									failed: task.isFailed,
								}"
							></div>
						</div>
					</div>

					<!-- Tree View chi tiết -->
					<div class="execution-tree">
						<h3 class="tree-title">Nhật ký thực thi chi tiết</h3>
						<div class="tree-nodes">
							<!-- Root node -->
							<div
								class="tree-node root"
								:class="
									task.isCompleted
										? 'completed'
										: task.isFailed
											? 'failed'
											: 'running'
								"
							>
								<div class="node-line"></div>
								<div class="node-icon">
									<CircleDashed
										v-if="!task.isCompleted && !task.isFailed"
										class="animate-spin"
										:size="18"
									/>
									<CheckCircle2 v-else-if="task.isCompleted" :size="18" />
									<AlertCircle v-else :size="18" />
								</div>
								<div class="node-content">
									<strong>Phân tích khóa học: {{ task.topic }}</strong>
								</div>
							</div>

							<!-- Danh sách các bước nhỏ (Sub Tasks) -->
							<div
								v-for="st in task.subTasks"
								:key="st.id"
								class="tree-node sub"
								:class="st.status"
							>
								<div class="node-line"></div>
								<div class="node-icon">
									<component
										:is="getSubTaskIcon(st.status)"
										:size="16"
										:class="{ 'animate-spin': st.status === 'running' }"
									/>
								</div>
								<div class="node-content">
									{{ st.message }}
								</div>
							</div>
						</div>
					</div>

					<div class="info-grid">
						<div class="info-item">
							<span class="label">Mã Job ID</span>
							<span class="value code">{{ task.jobId }}</span>
						</div>
						<div class="info-item">
							<span class="label">Khởi tạo lúc</span>
							<span class="value">{{ formatDate(task.createdAt) }}</span>
						</div>
					</div>

					<div v-if="task.isCompleted" class="result-action">
						<div class="success-banner">
							<CheckCircle2 :size="24" />
							<span
								>Chúc mừng! AI đã hoàn tất thiết kế khung khóa học cho
								bạn.</span
							>
						</div>
					</div>

					<div v-if="task.isFailed" class="error-banner">
						<AlertCircle :size="24" />
						<div class="error-msg">
							<strong>Lỗi thực thi:</strong>
							<p>{{ task.errorMessage }}</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
.ai-task-detail-page {
	padding: 40px 20px;
	min-height: 100vh;
	background:
		radial-gradient(
			circle at top right,
			rgba(var(--primary-rgb), 0.05),
			transparent
		),
		radial-gradient(
			circle at bottom left,
			rgba(var(--secondary-rgb), 0.05),
			transparent
		);
}

.header-nav {
	max-width: 800px;
	margin: 0 auto 20px;
}

.back-btn {
	display: flex;
	align-items: center;
	gap: 6px;
	background: none;
	border: none;
	color: var(--text-muted);
	cursor: pointer;
	font-weight: 500;
	transition: color 0.2s;
}

.back-btn:hover {
	color: var(--primary);
}

.content-wrapper {
	max-width: 800px;
	margin: 0 auto;
}

.state-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 100px 40px;
	text-align: center;
	gap: 20px;
}

.error-card {
	background: white;
	border-radius: 20px;
	box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
}

.task-card {
	border-radius: 24px;
	overflow: hidden;
}

.glass-panel {
	background: rgba(255, 255, 255, 0.9);
	backdrop-filter: blur(20px);
	border: 1px solid rgba(255, 255, 255, 0.4);
	box-shadow: 0 20px 50px rgba(0, 0, 0, 0.05);
}

.card-header {
	padding: 40px;
	border-bottom: 1px solid rgba(0, 0, 0, 0.05);
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
}

.topic-info {
	display: flex;
	gap: 20px;
}

.icon-box {
	width: 56px;
	height: 56px;
	background: var(--primary);
	color: white;
	border-radius: 16px;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 8px 16px rgba(var(--primary-rgb), 0.3);
}

.text-box h1 {
	font-size: 24px;
	margin: 0 0 4px 0;
	color: var(--text-dark);
}

.text-box p {
	margin: 0;
	color: var(--text-muted);
	font-size: 14px;
}

.status-badge {
	padding: 6px 16px;
	border-radius: 30px;
	font-size: 12px;
	font-weight: 700;
	text-transform: uppercase;
}

.badge-primary {
	background: rgba(var(--primary-rgb), 0.1);
	color: var(--primary);
}
.badge-success {
	background: rgba(var(--success-rgb), 0.1);
	color: var(--success);
}
.badge-danger {
	background: rgba(var(--danger-rgb), 0.1);
	color: var(--danger);
}

.card-body {
	padding: 40px;
}

.progress-section {
	margin-bottom: 30px;
}

.execution-tree {
	margin-bottom: 40px;
	padding: 20px;
	background: rgba(0, 0, 0, 0.02);
	border-radius: 16px;
	border: 1px solid rgba(0, 0, 0, 0.05);
}

.tree-title {
	font-size: 14px;
	font-weight: 700;
	color: var(--text-dark);
	margin-bottom: 20px;
	text-transform: uppercase;
	letter-spacing: 1px;
}

.tree-nodes {
	display: flex;
	flex-direction: column;
	gap: 0;
}

.tree-node {
	display: flex;
	gap: 12px;
	padding: 12px 0;
	position: relative;
	align-items: center;
}

.node-line {
	position: absolute;
	left: 8px;
	top: -12px;
	bottom: 12px;
	width: 2px;
	background: rgba(0, 0, 0, 0.1);
	z-index: 1;
}

.tree-node.root .node-line {
	display: none;
}

.tree-node.sub {
	margin-left: 20px;
}

.node-icon {
	width: 20px;
	height: 20px;
	display: flex;
	align-items: center;
	justify-content: center;
	background: white;
	border-radius: 50%;
	z-index: 2;
	position: relative;
}

.completed .node-icon {
	color: var(--success);
}
.running .node-icon {
	color: var(--primary);
}
.failed .node-icon {
	color: var(--danger);
}
.waiting .node-icon {
	color: var(--text-muted);
}

.node-content {
	font-size: 14px;
	color: var(--text-dark);
}

.waiting .node-content {
	color: var(--text-muted);
}

.info-grid {
	display: flex;
	justify-content: space-between;
	margin-bottom: 12px;
}

.progress-labels .label {
	color: var(--text-muted);
	font-size: 14px;
}
.progress-labels .value {
	color: var(--primary);
	font-weight: 800;
	font-size: 18px;
}

.progress-bar-outer {
	height: 12px;
	background: rgba(0, 0, 0, 0.05);
	border-radius: 6px;
	overflow: hidden;
	margin-bottom: 12px;
}

.progress-bar-inner {
	height: 100%;
	background: var(--primary);
	border-radius: 6px;
	transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.progress-bar-inner.completed {
	background: var(--success);
}
.progress-bar-inner.failed {
	background: var(--danger);
}

.pulse {
	animation: bar-pulse 2s infinite;
}

@keyframes bar-pulse {
	0% {
		opacity: 1;
	}
	50% {
		opacity: 0.7;
	}
	100% {
		opacity: 1;
	}
}

.hint {
	font-size: 12px;
	color: var(--text-muted);
	font-style: italic;
	text-align: center;
}

.info-grid {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 20px;
	padding: 20px;
	background: rgba(0, 0, 0, 0.02);
	border-radius: 12px;
	margin-bottom: 40px;
}

.info-item {
	display: flex;
	flex-direction: column;
	gap: 4px;
}

.info-item .label {
	font-size: 11px;
	text-transform: uppercase;
	letter-spacing: 0.5px;
	color: var(--text-muted);
}
.info-item .value {
	font-size: 14px;
	color: var(--text-dark);
	font-weight: 500;
}
.info-item .code {
	font-family: monospace;
}

.result-action {
	animation: fade-in 0.5s;
}

@keyframes fade-in {
	from {
		opacity: 0;
		transform: translateY(10px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

.success-banner {
	display: flex;
	align-items: center;
	gap: 12px;
	background: rgba(var(--success-rgb), 0.05);
	padding: 16px;
	border-radius: 12px;
	color: var(--success);
	font-weight: 500;
	margin-bottom: 20px;
}

.btn-apply {
	width: 100%;
	padding: 16px;
	background: var(--primary);
	color: white;
	border: none;
	border-radius: 12px;
	font-weight: 700;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 12px;
	cursor: pointer;
	box-shadow: 0 10px 25px rgba(var(--primary-rgb), 0.3);
	transition: all 0.3s;
}

.btn-apply:hover {
	transform: translateY(-2px);
	box-shadow: 0 15px 30px rgba(var(--primary-rgb), 0.4);
}

.error-banner {
	display: flex;
	gap: 16px;
	padding: 20px;
	background: rgba(var(--danger-rgb), 0.05);
	border-radius: 12px;
	color: var(--danger);
}

.error-msg h1 {
	font-size: 16px;
	margin: 0 0 4px 0;
}
.error-msg p {
	margin: 0;
	font-size: 14px;
	line-height: 1.5;
}
</style>
