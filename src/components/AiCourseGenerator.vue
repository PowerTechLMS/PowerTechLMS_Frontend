<script setup>
import { ref, onUnmounted } from "vue";
import {
	Play,
	Loader2,
	AlertCircle,
	Search,
	Users,
	Info,
	X,
	ExternalLink,
} from "lucide-vue-next";
import * as signalR from "@microsoft/signalr";
import { aiAPI } from "@/services/api";

defineProps({
	show: Boolean,
});

const emit = defineEmits(["close", "generated"]);

const topic = ref("");
const targetAudience = ref("");
const additionalInfo = ref("");
const isGenerating = ref(false);
const jobId = ref(null);
const progress = ref(0);
const status = ref("");
const error = ref(null);

let connection = null;

const startGeneration = async () => {
	if (!topic.value) return;

	isGenerating.value = true;
	error.value = null;
	progress.value = 0;
	status.value = "Đang gửi yêu cầu...";

	try {
		const res = await aiAPI.generateCourse({
			topic: topic.value,
			targetAudience: targetAudience.value,
			additionalInfo: additionalInfo.value,
		});

		jobId.value = res.data.jobId;
		setupSignalR(res.data.jobId);
	} catch (err) {
		error.value =
			err.response?.data?.message ||
			err.message ||
			"Lỗi khi bắt đầu tạo khóa học.";
		isGenerating.value = false;
	}
};

const setupSignalR = (id) => {
	connection = new signalR.HubConnectionBuilder()
		.withUrl(`${import.meta.env.VITE_API_URL}/hubs/ai`)
		.withAutomaticReconnect()
		.build();

	connection.on("JobProgressUpdated", (data) => {
		progress.value = data.progress;
		status.value = data.status;

		if (data.isCompleted) {
			isGenerating.value = false;
			const result = JSON.parse(data.resultJson);
			emit("generated", result);
			cleanup();
		}

		if (data.isFailed) {
			isGenerating.value = false;
			error.value = data.errorMessage;
			cleanup();
		}
	});

	connection
		.start()
		.then(() => {
			connection.invoke("JoinJobGroup", id);
		})
		.catch(() => {});
};

const cleanup = () => {
	if (connection) {
		connection.stop();
		connection = null;
	}
};

onUnmounted(() => {
	cleanup();
});
</script>

<template>
	<teleport to="body">
		<div v-if="show" class="modal-overlay">
			<div class="glass-modal">
				<div class="modal-header">
					<h3 class="gradient-text">Tạo Cấu Trúc Khóa Học Bằng AI</h3>
					<button @click="emit('close')" class="close-btn">
						<X :size="20" />
					</button>
				</div>

				<div class="modal-body">
					<div v-if="!isGenerating && !error" class="input-form">
						<div class="input-group">
							<label><Search :size="16" /> Chủ đề khóa học</label>
							<input
								v-model="topic"
								placeholder="Ví dụ: Kỹ năng quản lý thời gian..."
								class="glass-input"
							/>
						</div>

						<div class="input-group">
							<label><Users :size="16" /> Đối tượng hướng đến</label>
							<input
								v-model="targetAudience"
								placeholder="Ví dụ: Nhân viên mới, Cấp quản lý..."
								class="glass-input"
							/>
						</div>

						<div class="input-group">
							<label><Info :size="16" /> Yêu cầu bổ sung</label>
							<textarea
								v-model="additionalInfo"
								placeholder="Ví dụ: Tập trung vào phương pháp Pomodoro, phong cách vui tươi..."
								class="glass-input"
								rows="3"
							></textarea>
						</div>

						<button @click="startGeneration" class="gen-btn" :disabled="!topic">
							<Play :size="18" /> Bắt đầu tạo ngay
						</button>
					</div>

					<div v-if="isGenerating" class="progress-view">
						<div class="loader-container">
							<Loader2 class="animate-spin" :size="48" />
						</div>
						<div class="progress-info">
							<h4>{{ status }}</h4>
							<div class="progress-bar-container">
								<div
									class="progress-bar"
									:style="{ width: progress + '%' }"
								></div>
							</div>
							<span>{{ progress }}%</span>
						</div>
						<p class="wait-msg">
							Quá trình này có thể mất 1-2 phút tùy thuộc vào độ phức tạp.
						</p>
						<div class="track-link-container">
							<router-link
								:to="'/admin/ai-tasks/' + jobId"
								class="track-link"
								target="_blank"
							>
								<ExternalLink :size="14" />
								<span>Mở trang theo dõi chi tiết (Cây tiến trình)</span>
							</router-link>
						</div>
					</div>

					<div v-if="error" class="error-view">
						<AlertCircle :size="48" class="text-danger" />
						<h4>Đã xảy ra lỗi</h4>
						<p>{{ error }}</p>
						<button
							@click="
								error = null;
								isGenerating = false;
							"
							class="retry-btn"
						>
							Thử lại
						</button>
					</div>
				</div>
			</div>
		</div>
	</teleport>
</template>

<style scoped>
.modal-overlay {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 9999;
	backdrop-filter: blur(5px);
}

.glass-modal {
	background: rgba(255, 255, 255, 0.9);
	width: 500px;
	max-width: 90%;
	border-radius: 16px;
	box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
	overflow: hidden;
	border: 1px solid rgba(255, 255, 255, 0.3);
}

.modal-header {
	padding: 20px;
	display: flex;
	justify-content: space-between;
	align-items: center;
	border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.gradient-text {
	background: linear-gradient(90deg, #6366f1, #a855f7);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	font-weight: 700;
	margin: 0;
}

.close-btn {
	background: none;
	border: none;
	cursor: pointer;
	color: #666;
	transition: color 0.2s;
}

.close-btn:hover {
	color: #000;
}

.modal-body {
	padding: 24px;
}

.input-group {
	margin-bottom: 20px;
}

.input-group label {
	display: flex;
	align-items: center;
	gap: 8px;
	font-weight: 600;
	margin-bottom: 8px;
	color: #374151;
}

.glass-input {
	width: 100%;
	padding: 12px 16px;
	background: #f9fafb;
	border: 1px solid #e5e7eb;
	border-radius: 8px;
	outline: none;
	transition: all 0.2s;
}

.glass-input:focus {
	border-color: #6366f1;
	box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}

.gen-btn {
	width: 100%;
	padding: 14px;
	background: linear-gradient(90deg, #6366f1, #a855f7);
	color: white;
	border: none;
	border-radius: 8px;
	font-weight: 600;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 8px;
	cursor: pointer;
	transition:
		transform 0.2s,
		opacity 0.2s;
}

.gen-btn:hover {
	transform: translateY(-2px);
	opacity: 0.9;
}

.gen-btn:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}

.progress-view {
	text-align: center;
	padding: 20px 0;
}

.loader-container {
	margin-bottom: 24px;
	color: #6366f1;
}

.progress-info h4 {
	margin-bottom: 16px;
	color: #4b5563;
}

.progress-bar-container {
	height: 8px;
	background: #e5e7eb;
	border-radius: 4px;
	overflow: hidden;
	margin-bottom: 8px;
}

.progress-bar {
	height: 100%;
	background: linear-gradient(90deg, #6366f1, #a855f7);
	transition: width 0.3s;
}

.wait-msg {
	font-size: 12px;
	color: #9ca3af;
	margin-top: 16px;
	margin-bottom: 24px;
}

.track-link-container {
	border-top: 1px dashed #e5e7eb;
	padding-top: 16px;
}

.track-link {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	color: #6366f1;
	text-decoration: none;
	font-size: 13px;
	font-weight: 500;
	transition: all 0.2s;
	padding: 8px 16px;
	background: rgba(99, 102, 241, 0.05);
	border-radius: 6px;
}

.track-link:hover {
	background: rgba(99, 102, 241, 0.1);
	transform: translateY(-1px);
}

.error-view {
	text-align: center;
	padding: 20px 0;
}

.error-view h4 {
	margin-top: 16px;
	color: #ef4444;
}

.retry-btn {
	margin-top: 20px;
	padding: 8px 24px;
	border: 1px solid #ef4444;
	background: transparent;
	color: #ef4444;
	border-radius: 6px;
	cursor: pointer;
}

.animate-spin {
	animation: spin 1s linear infinite;
}

@keyframes spin {
	from {
		transform: rotate(0deg);
	}
	to {
		transform: rotate(360deg);
	}
}
</style>
