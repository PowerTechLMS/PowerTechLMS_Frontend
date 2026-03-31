<template>
	<div ref="containerRef" class="notification-container">
		<button
			class="btn-icon btn-ghost position-relative"
			@click="toggleDropdown"
		>
			<Bell :size="20" />
			<span v-if="unreadCount > 0" class="notification-badge">{{
				unreadCount
			}}</span>
		</button>

		<Transition name="dropdown">
			<div v-if="isOpen" class="notification-dropdown glass shadow-lg">
				<div class="dropdown-header">
					<h3>Thông báo</h3>
					<button
						v-if="unreadCount > 0"
						class="btn-link"
						@click="markAllAsRead"
					>
						Đánh dấu tất cả đã đọc
					</button>
				</div>

				<div class="dropdown-divider" />

				<div class="notification-list custom-scrollbar">
					<div v-if="loading" class="loading-state">
						<Loader2 class="animate-spin" :size="24" />
					</div>
					<div v-else-if="notifications.length === 0" class="empty-state">
						<BellOff :size="32" class="opacity-20 mb-2" />
						<p>Không có thông báo nào</p>
					</div>
					<div
						v-for="item in notifications"
						v-else
						:key="item.id"
						class="notification-item"
						:class="{ unread: !item.isRead }"
						@click="handleNotificationClick(item)"
					>
						<div class="notification-icon" :class="getTypeClass(item.type)">
							<component :is="getIcon(item.type)" :size="16" />
						</div>
						<div class="notification-content">
							<div class="notification-title">
								{{ item.title }}
							</div>
							<div class="notification-message">
								{{ item.message }}
							</div>
							<div class="notification-time">
								{{ formatTime(item.createdAt) }}
							</div>
						</div>
						<div v-if="!item.isRead" class="unread-dot" />
					</div>
				</div>

				<div v-if="notifications.length > 0" class="dropdown-footer">
					<button class="btn-ghost btn-sm w-full" @click="isOpen = false">
						Đóng
					</button>
				</div>
			</div>
		</Transition>
	</div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useRouter } from "vue-router";
import {
	Bell,
	BellOff,
	Loader2,
	BookOpen,
	Route,
	CheckCircle,
	AlertCircle,
	Info,
} from "lucide-vue-next";
import { notificationAPI } from "@/services/api";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { useAuthStore } from "@/stores/auth";

dayjs.extend(relativeTime);
dayjs.locale("vi");

const router = useRouter();
const authStore = useAuthStore();
const isOpen = ref(false);
const loading = ref(false);
const notifications = ref([]);
const containerRef = ref(null);
const connection = ref(null);

const unreadCount = computed(() => {
	return notifications.value.filter((n) => !n.isRead).length;
});

const toggleDropdown = () => {
	isOpen.value = !isOpen.value;
	if (isOpen.value && notifications.value.length === 0) {
		fetchNotifications();
	}
};

const fetchNotifications = async () => {
	try {
		loading.value = true;
		const res = await notificationAPI.getAll();
		notifications.value = res.data;
	} catch {
	} finally {
		loading.value = false;
	}
};

const markAsRead = async (id) => {
	try {
		await notificationAPI.markAsRead(id);
		const item = notifications.value.find((n) => n.id === id);
		if (item) item.isRead = true;
	} catch {}
};

const markAllAsRead = async () => {
	const unreadItems = notifications.value.filter((n) => !n.isRead);
	await Promise.all(unreadItems.map((item) => markAsRead(item.id)));
};

const handleNotificationClick = async (item) => {
	if (!item.isRead) {
		await markAsRead(item.id);
	}

	isOpen.value = false;
	if (item.link) {
		router.push(item.link);
	}
};

const getIcon = (type) => {
	switch (type) {
		case "EnrollmentRequest":
			return AlertCircle;
		case "EnrollmentStatus":
			return CheckCircle;
		case "NewCourse":
			return BookOpen;
		case "NewLearningPath":
			return Route;
		case "Reminder":
			return Info;
		default:
			return Bell;
	}
};

const getTypeClass = (type) => {
	switch (type) {
		case "EnrollmentRequest":
			return "warning";
		case "EnrollmentStatus":
			return "success";
		case "NewCourse":
			return "primary";
		case "NewLearningPath":
			return "info";
		case "Reminder":
			return "danger";
		default:
			return "";
	}
};

const formatTime = (date) => {
	if (!date) return "";
	return dayjs(date).format("HH:mm DD/MM/YYYY");
};

const handleClickOutside = (e) => {
	if (containerRef.value && !containerRef.value.contains(e.target)) {
		isOpen.value = false;
	}
};

const startSignalR = async () => {
	if (connection.value) {
		await connection.value.stop().catch(() => {});
	}

	const hubUrl = `${import.meta.env.VITE_API_URL || "http://localhost:5100"}/hubs/notifications`;

	connection.value = new HubConnectionBuilder()
		.withUrl(hubUrl, {
			accessTokenFactory: () => authStore.token,
		})
		.configureLogging(LogLevel.Information)
		.withAutomaticReconnect()
		.build();

	connection.value.on("ReceiveNotification", (notification) => {
		notifications.value.unshift(notification);
	});

	try {
		await connection.value.start();
	} catch {}
};

onMounted(() => {
	fetchNotifications();
	startSignalR();
	document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
	if (connection.value) {
		connection.value.stop();
	}
	document.removeEventListener("click", handleClickOutside);
});
</script>

<style scoped>
.notification-container {
	position: relative;
	display: flex;
	align-items: center;
}

.notification-badge {
	position: absolute;
	top: 4px;
	right: 4px;
	background: var(--danger-500);
	color: white;
	font-size: 10px;
	padding: 2px 5px;
	border-radius: 10px;
	min-width: 16px;
	text-align: center;
	border: 2px solid var(--bg-primary);
}

.notification-dropdown {
	position: absolute;
	top: calc(100% + 10px);
	right: 0;
	width: 360px;
	background: var(--bg-secondary);
	border-radius: var(--radius-lg);
	border: 1px solid var(--border-color);
	z-index: 2000;
	display: flex;
	flex-direction: column;
	overflow: hidden;
}

.dropdown-header {
	padding: 1rem;
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.dropdown-header h3 {
	margin: 0;
	font-size: var(--font-size-md);
	font-weight: 600;
}

.btn-link {
	background: none;
	border: none;
	color: var(--primary);
	font-size: var(--font-size-xs);
	cursor: pointer;
	padding: 0;
}

.btn-link:hover {
	text-decoration: underline;
}

.notification-list {
	max-height: 400px;
	overflow-y: auto;
}

.notification-item {
	padding: 1rem;
	display: flex;
	gap: 12px;
	cursor: pointer;
	transition: background 0.2s;
	position: relative;
	border-bottom: 1px solid var(--border-color);
}

.notification-item:hover {
	background: var(--bg-tertiary);
}

.notification-item.unread {
	background: rgba(var(--primary-rgb), 0.1);
}

.notification-item:last-child {
	border-bottom: none;
}

.notification-icon {
	width: 32px;
	height: 32px;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
	background: var(--bg-tertiary);
}

.notification-icon.warning {
	background: rgba(245, 158, 11, 0.1);
	color: #f59e0b;
}
.notification-icon.success {
	background: rgba(16, 185, 129, 0.1);
	color: #10b981;
}
.notification-icon.primary {
	background: rgba(99, 102, 241, 0.1);
	color: #6366f1;
}
.notification-icon.info {
	background: rgba(59, 130, 246, 0.1);
	color: #3b82f6;
}
.notification-icon.danger {
	background: rgba(239, 68, 68, 0.1);
	color: #ef4444;
}

.notification-content {
	flex: 1;
	min-width: 0;
}

.notification-title {
	font-size: 13.5px;
	font-weight: 600;
	margin-bottom: 2px;
	color: var(--text-primary);
}

.notification-message {
	font-size: 12.5px;
	color: var(--text-secondary);
	line-height: 1.4;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
}

.notification-time {
	font-size: 11px;
	color: var(--text-tertiary);
	margin-top: 4px;
}

.unread-dot {
	width: 8px;
	height: 8px;
	background: var(--primary-500);
	border-radius: 50%;
	position: absolute;
	top: 1.5rem;
	right: 1rem;
}

.loading-state,
.empty-state {
	padding: 3rem 1rem;
	text-align: center;
	color: var(--text-tertiary);
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

.dropdown-footer {
	padding: 8px;
	border-top: 1px solid var(--border-color);
}

.dropdown-enter-active,
.dropdown-leave-active {
	transition:
		opacity 0.2s,
		transform 0.2s;
}

.dropdown-enter-from,
.dropdown-leave-to {
	opacity: 0;
	transform: translateY(-10px);
}
</style>
