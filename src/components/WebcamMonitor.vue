<template>
	<div class="webcam-monitor-container">
		<video
			ref="videoRef"
			autoplay
			muted
			playsinline
			class="webcam-video-hidden"
		></video>

		<div v-if="isViolation || cameraError" class="monitoring-overlay">
			<div class="overlay-content">
				<div class="warning-icon">
					<i v-if="cameraError" class="fas fa-camera-slash"></i>
					<i v-else class="fas fa-users-slash"></i>
				</div>
				<h2 v-if="cameraError">YÊU CẦU TRUY CẬP CAMERA</h2>
				<h2 v-else>PHÁT HIỆN NHIỀU NGƯỜI</h2>

				<p v-if="cameraError">
					{{ cameraError }}. Bạn cần có Webcam và cấp quyền truy cập để có thể
					bắt đầu/tiếp tục bài làm này nhằm đảm bảo tính minh bạch.
				</p>
				<p v-else>
					Quy định yêu cầu chỉ có 1 người duy nhất thực hiện bài thi/bài tập
					này. Vui lòng đảm bảo chỉ có mình bạn trước camera để tiếp tục.
				</p>

				<div v-if="cameraError" class="mt-3">
					<button
						@click="startCamera"
						class="btn btn-warning rounded-pill px-4 fw-bold"
					>
						<i class="fas fa-sync-alt me-2"></i>Thử lại ngay
					</button>
				</div>
				<div v-else class="status-badge">
					{{ faceCount }} người đang xuất hiện
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";
import * as faceapi from "face-api.js";
import api from "@/services/api";

const props = defineProps<{
	active: boolean;
	sessionId?: number;
	sessionType?: "roleplay" | "essay";
}>();

const emit = defineEmits(["violation-start", "violation-end"]);

const videoRef = ref<HTMLVideoElement | null>(null);
const isViolation = ref(false);
const faceCount = ref(0);
const cameraError = ref<string | null>(null);
const modelsLoaded = ref(false);

let stream: MediaStream | null = null;
let detectionInterval: any = null;

const MODEL_URL =
	"https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js/weights/";

const loadModels = async () => {
	try {
		await Promise.all([faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL)]);
		modelsLoaded.value = true;
	} catch {
		cameraError.value = "Không thể tải mô hình nhận diện khuôn mặt.";
	}
};

const startCamera = async () => {
	cameraError.value = null;
	try {
		stream = await navigator.mediaDevices.getUserMedia({
			video: { width: 640, height: 480, frameRate: { max: 15 } },
			audio: false,
		});
		if (videoRef.value) {
			videoRef.value.srcObject = stream;
		}
		startDetection();
	} catch {
		cameraError.value =
			"Không thể truy cập Camera. Vui lòng cấp quyền và tải lại trang.";
	}
};

const stopCamera = () => {
	if (stream) {
		stream.getTracks().forEach((track) => track.stop());
		stream = null;
	}
	if (detectionInterval) {
		clearInterval(detectionInterval);
		detectionInterval = null;
	}
};

const startDetection = () => {
	if (detectionInterval) clearInterval(detectionInterval);

	detectionInterval = setInterval(async () => {
		if (
			!videoRef.value ||
			!modelsLoaded.value ||
			!props.active ||
			videoRef.value.readyState !== 4
		)
			return;

		const detections = await faceapi.detectAllFaces(
			videoRef.value,
			new faceapi.TinyFaceDetectorOptions({
				inputSize: 320,
				scoreThreshold: 0.3,
			}),
		);

		faceCount.value = detections.length;

		if (detections.length > 1) {
			if (!isViolation.value) {
				isViolation.value = true;
				emit("violation-start");

				if (props.sessionId && props.sessionType) {
					const endpoint =
						props.sessionType === "roleplay"
							? `/RolePlay/sessions/${props.sessionId}/increment-violation`
							: `/Essay/attempts/${props.sessionId}/increment-violation`;
					api.post(endpoint).catch(() => {});
				}
			}
		} else {
			if (isViolation.value) {
				isViolation.value = false;
				emit("violation-end");
			}
		}
	}, 1000);
};

onMounted(async () => {
	await loadModels();
	if (props.active) {
		await startCamera();
	}
});

onUnmounted(() => {
	stopCamera();
});

watch(
	() => props.active,
	(isActive) => {
		if (isActive) {
			startCamera();
		} else {
			stopCamera();
			isViolation.value = false;
		}
	},
);
</script>

<style scoped>
.webcam-monitor-container {
	position: fixed;
	bottom: 20px;
	right: 20px;
	z-index: 10000;
	pointer-events: none;
}

.webcam-video-hidden {
	width: 1px;
	height: 1px;
	opacity: 0;
	position: absolute;
}

.monitoring-overlay {
	position: fixed;
	top: 0;
	left: 0;
	width: 100vw;
	height: 100vh;
	background: rgba(0, 0, 0, 0.85);
	backdrop-filter: blur(8px);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 20000;
	pointer-events: all;
	color: white;
	text-align: center;
}

.overlay-content {
	max-width: 500px;
	padding: 40px;
	background: rgba(255, 255, 255, 0.05);
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 24px;
	animation: pulse 2s infinite ease-in-out;
}

.warning-icon {
	font-size: 80px;
	color: #ff4d4d;
	margin-bottom: 24px;
}

h2 {
	font-weight: 900;
	font-size: 28px;
	margin-bottom: 16px;
	letter-spacing: 1px;
}

p {
	font-size: 18px;
	line-height: 1.6;
	opacity: 0.9;
	margin-bottom: 30px;
}

.status-badge {
	display: inline-block;
	padding: 8px 20px;
	background: #ff4d4d;
	border-radius: 99px;
	font-weight: 700;
	font-size: 14px;
}

.camera-error-notice {
	position: fixed;
	bottom: 20px;
	right: 20px;
	background: #ff4d4d;
	color: white;
	padding: 10px 20px;
	border-radius: 8px;
	font-size: 12px;
	max-width: 200px;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

@keyframes pulse {
	0% {
		transform: scale(1);
	}
	50% {
		transform: scale(1.02);
	}
	100% {
		transform: scale(1);
	}
}
</style>
