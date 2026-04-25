<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import {
	Sparkles,
	X,
	Loader2,
	CheckCircle2,
	AlertCircle,
	ExternalLink,
} from "lucide-vue-next";
import { aiAPI } from "@/services/api";
import * as signalR from "@microsoft/signalr";

const activeTasks = ref([]);
const isExpanded = ref(false);
let connection = null;

const fetchActiveTasks = async () => {
	try {
		const res = await aiAPI.getActiveTasks();
		activeTasks.value = res.data.map((t) => ({
			jobId: t.jobId,
			topic: t.topic,
			progress: t.progress,
			status: t.status,
			isCompleted: t.isCompleted,
			isFailed: t.isFailed,
		}));

		if (activeTasks.value.length > 0) {
			setupSignalR();
		}
	} catch {}
};

const setupSignalR = () => {
	if (connection) return;

	connection = new signalR.HubConnectionBuilder()
		.withUrl(`${import.meta.env.VITE_API_URL}/hubs/ai`)
		.withAutomaticReconnect()
		.build();

	connection.on("JobProgressUpdated", (data) => {
		const task = activeTasks.value.find((t) => t.jobId === data.jobId);
		if (task) {
			task.progress = data.progress;
			task.status = data.status;
			task.isCompleted = data.isCompleted;
			task.isFailed = data.isFailed;

			if (data.isCompleted || data.isFailed) {
				setTimeout(() => {
					activeTasks.value = activeTasks.value.filter(
						(t) => t.jobId !== data.jobId,
					);
				}, 10000);
			}
		} else if (!data.isCompleted && !data.isFailed) {
			activeTasks.value.push({
				jobId: data.jobId,
				topic: data.topic || "Đang xử lý...",
				progress: data.progress,
				status: data.status,
				isCompleted: data.isCompleted,
				isFailed: data.isFailed,
			});
		}
	});

	connection
		.start()
		.then(() => {
			activeTasks.value.forEach((t) => {
				connection.invoke("JoinJobGroup", t.jobId);
			});
		})
		.catch(() => {});
};

onMounted(() => {
	fetchActiveTasks();
	const interval = setInterval(fetchActiveTasks, 60000);
	onUnmounted(() => clearInterval(interval));
});

onUnmounted(() => {
	if (connection) {
		connection.stop();
	}
});
</script>

<template>
	<div class="ai-task-manager" v-if="activeTasks.length > 0">
		<div
			class="task-indicator"
			:class="{
				'has-active': activeTasks.some((t) => !t.isCompleted && !t.isFailed),
			}"
			@click="isExpanded = !isExpanded"
		>
			<div class="pulse-icon">
				<Sparkles :size="20" />
			</div>
			<div class="badge" v-if="activeTasks.length > 0">
				{{ activeTasks.length }}
			</div>
		</div>

		<transition name="slide-up">
			<div v-if="isExpanded" class="task-list glass-panel">
				<div class="list-header">
					<div class="title">
						<Sparkles :size="16" class="text-primary" />
						<span>Tiến độ AI</span>
					</div>
					<button @click="isExpanded = false" class="close-btn">
						<X :size="16" />
					</button>
				</div>
				<div class="list-body">
					<div v-for="task in activeTasks" :key="task.jobId" class="task-item">
						<div class="task-main">
							<div class="task-icon">
								<Loader2
									v-if="!task.isCompleted && !task.isFailed"
									class="animate-spin text-primary"
									:size="18"
								/>
								<CheckCircle2
									v-else-if="task.isCompleted"
									class="text-success"
									:size="18"
								/>
								<AlertCircle v-else class="text-danger" :size="18" />
							</div>
							<div class="task-content">
								<div class="task-topic">{{ task.topic }}</div>
								<div class="task-status">{{ task.status }}</div>
							</div>
							<div class="task-percent">{{ task.progress }}%</div>
							<div class="task-actions">
								<router-link
									:to="`/admin/ai-tasks/${task.jobId}`"
									class="detail-link"
									title="Xem chi tiết"
								>
									<ExternalLink :size="16" />
								</router-link>
							</div>
						</div>
						<div class="progress-container">
							<div
								class="progress-bar"
								:style="{ width: task.progress + '%' }"
								:class="{ completed: task.isCompleted, failed: task.isFailed }"
							></div>
						</div>
					</div>
				</div>
			</div>
		</transition>
	</div>
</template>

<style scoped>
.ai-task-manager {
	position: fixed;
	right: 20px;
	bottom: 20px;
	z-index: 1000;
}

.task-indicator {
	width: 48px;
	height: 48px;
	background: var(--primary);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	color: white;
	cursor: pointer;
	box-shadow: 0 4px 15px rgba(var(--primary-rgb), 0.4);
	position: relative;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.task-indicator:hover {
	transform: scale(1.1);
}

.task-indicator.has-active .pulse-icon {
	animation: pulse 2s infinite;
}

@keyframes pulse {
	0% {
		transform: scale(1);
		opacity: 1;
	}
	50% {
		transform: scale(1.2);
		opacity: 0.8;
	}
	100% {
		transform: scale(1);
		opacity: 1;
	}
}

.badge {
	position: absolute;
	top: -5px;
	right: -5px;
	background: var(--danger);
	color: white;
	font-size: 10px;
	font-weight: bold;
	padding: 2px 6px;
	border-radius: 10px;
	border: 2px solid white;
}

.task-list {
	position: absolute;
	bottom: 60px;
	right: 0;
	width: 320px;
	max-height: 400px;
	display: flex;
	flex-direction: column;
	border-radius: 16px;
	overflow: hidden;
	box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

.glass-panel {
	background: rgba(255, 255, 255, 0.85);
	backdrop-filter: blur(15px);
	border: 1px solid rgba(255, 255, 255, 0.3);
}

.list-header {
	padding: 12px 16px;
	background: rgba(var(--primary-rgb), 0.05);
	border-bottom: 1px solid var(--border-color);
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.list-header .title {
	display: flex;
	align-items: center;
	gap: 8px;
	font-weight: 600;
	color: var(--text-dark);
}

.close-btn {
	background: none;
	border: none;
	color: var(--text-muted);
	cursor: pointer;
	padding: 4px;
	border-radius: 4px;
	display: flex;
	transition: all 0.2s;
}

.close-btn:hover {
	background: rgba(0, 0, 0, 0.05);
	color: var(--danger);
}

.list-body {
	padding: 8px;
	overflow-y: auto;
}

.task-item {
	padding: 12px;
	border-radius: 10px;
	transition: all 0.2s;
}

.task-item:hover {
	background: rgba(var(--primary-rgb), 0.03);
}

.task-main {
	display: flex;
	align-items: center;
	gap: 12px;
	margin-bottom: 8px;
}

.task-content {
	flex: 1;
	min-width: 0;
}

.task-topic {
	font-size: 13px;
	font-weight: 600;
	color: var(--text-dark);
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.task-status {
	font-size: 11px;
	color: var(--text-muted);
}

.task-percent {
	font-weight: 800;
	color: var(--primary);
	font-size: 14px;
	min-width: 40px;
	text-align: right;
}

.task-actions {
	display: flex;
	align-items: center;
	margin-left: 8px;
}

.detail-link {
	color: var(--text-muted);
	padding: 4px;
	border-radius: 4px;
	transition: all 0.2s;
	display: flex;
	align-items: center;
	justify-content: center;
}

.detail-link:hover {
	background: rgba(var(--primary-rgb), 0.1);
	color: var(--primary);
}

.progress-container {
	height: 4px;
	background: rgba(0, 0, 0, 0.05);
	border-radius: 2px;
	overflow: hidden;
}

.progress-bar {
	height: 100%;
	background: var(--primary);
	transition: width 0.3s ease;
}

.progress-bar.completed {
	background: var(--success);
}
.progress-bar.failed {
	background: var(--danger);
}

.slide-up-enter-active,
.slide-up-leave-active {
	transition: all 0.3s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
	transform: translateY(20px);
	opacity: 0;
}
</style>
