<script setup>
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import { adminAiAPI } from "@/services/api";
import adminAiHub from "@/services/admin-ai-hub";
import { useAuthStore } from "@/stores/auth";
import { marked } from "marked";
import DOMPurify from "dompurify";

const authStore = useAuthStore();
const sessions = ref([]);
const currentSession = ref(null);
const messages = ref([]);
const newMessage = ref("");
const isLoading = ref(false);
const chatContainer = ref(null);
const activeTask = ref(null);
const isAiThinking = ref(false);
const sessionTasks = ref([]);
const showTasksDropdown = ref(false);

const parseMarkdown = (content) => {
	if (!content) return "";
	const html = marked.parse(content);
	return DOMPurify.sanitize(html);
};

onMounted(async () => {
	await fetchSessions();

	adminAiHub.start();
	adminAiHub.onProgress((progress) => {
		handleAiProgress(progress);
	});
});

onUnmounted(() => {
	adminAiHub.stop();
});

const fetchSessions = async () => {
	try {
		const res = await adminAiAPI.getSessions();
		sessions.value = res.data;
	} catch {}
};

const fetchSessionTasks = async (sessionId) => {
	try {
		const res = await adminAiAPI.getTasks(sessionId);
		sessionTasks.value = res.data;
	} catch {}
};

const fetchMessages = async (sessionId, showLoading = false) => {
	if (showLoading) isLoading.value = true;
	try {
		const res = await adminAiAPI.getMessages(sessionId);
		messages.value = res.data;
		scrollToBottom();
	} catch {
	} finally {
		if (showLoading) isLoading.value = false;
	}
};

const selectSession = async (session) => {
	if (currentSession.value?.id === session.id) {
		await fetchMessages(session.id, false);
		fetchSessionTasks(session.id);
		return;
	}

	currentSession.value = session;
	try {
		await fetchMessages(session.id, true);

		if (session.lastProgressJson) {
			try {
				activeTask.value = JSON.parse(session.lastProgressJson);
			} catch {
				activeTask.value = null;
			}
		} else {
			activeTask.value = null;
		}

		await adminAiHub.joinThread(session.threadId);
		fetchSessionTasks(session.id);
		scrollToBottom();
	} catch {
	} finally {
		isLoading.value = false;
	}
};

const createNewSession = async () => {
	try {
		const res = await adminAiAPI.createSession({
			title: "Phiên chat mới " + new Date().toLocaleTimeString(),
		});
		sessions.value.unshift(res.data);
		selectSession(res.data);
	} catch {}
};

const sendMessage = async () => {
	if (!newMessage.value.trim() || !currentSession.value) return;

	activeTask.value = null;
	const userMsg = {
		role: "user",
		content: newMessage.value,
		createdAt: new Date(),
	};
	messages.value.push(userMsg);
	const content = newMessage.value;
	newMessage.value = "";
	scrollToBottom();

	try {
		isAiThinking.value = true;
		const res = await adminAiAPI.sendMessage(currentSession.value.id, {
			message: content,
		});
		if (res.data) {
			await fetchMessages(currentSession.value.id, false);
		}
	} catch {
		messages.value.push({
			role: "assistant",
			content: "Có lỗi xảy ra. Xin vui lòng thử lại sau",
			createdAt: new Date(),
		});
	} finally {
		isAiThinking.value = false;
	}
};

const handleAiProgress = (progress) => {
	activeTask.value = progress;

	if (progress.status === "completed" || progress.status === "error") {
		setTimeout(async () => {
			await fetchSessions();
			await fetchMessages(currentSession.value.id, false);
			fetchSessionTasks(currentSession.value.id);
		}, 1000);
	} else if (progress.status === "running" || progress.status === "planned") {
		setTimeout(() => fetchSessionTasks(currentSession.value.id), 500);
	}
};

const approvePlan = async () => {
	if (!currentSession.value) return;
	newMessage.value = "Tôi đã phê duyệt kế hoạch, hãy thực hiện ngay!";
	await sendMessage();
};

const removeTask = async (taskId) => {
	if (!confirm("Bạn có muốn xóa bước này khỏi kế hoạch?")) return;
	try {
		await adminAiAPI.deleteTask(taskId);
		fetchSessionTasks(currentSession.value.id);
	} catch {
		alert("Không thể xóa tác vụ này.");
	}
};

const scrollToBottom = () => {
	nextTick(() => {
		if (chatContainer.value) {
			chatContainer.value.scrollTo({
				top: chatContainer.value.scrollHeight,
				behavior: "smooth",
			});
		}
	});
};

const formatTime = (date) => {
	return new Date(date).toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit",
	});
};

const renameSession = async (session) => {
	const newTitle = prompt("Nhập tên mới cho phiên chat:", session.title);
	if (!newTitle || newTitle === session.title) return;

	try {
		const res = await adminAiAPI.updateSession(session.id, {
			title: newTitle,
		});
		session.title = res.data.title;
	} catch {}
};

const deleteSession = async (session) => {
	if (!confirm(`Bạn có chắc chắn muốn xóa phiên chat "${session.title}"?`)) {
		return;
	}

	try {
		await adminAiAPI.deleteSession(session.id);
		sessions.value = sessions.value.filter((s) => s.id !== session.id);
		if (currentSession.value?.id === session.id) {
			currentSession.value =
				sessions.value.length > 0 ? sessions.value[0] : null;
			if (currentSession.value) {
				selectSession(currentSession.value);
			} else {
				messages.value = [];
			}
		}
	} catch {}
};
</script>

<template>
	<div class="admin-ai-container">
		<aside class="chat-sidebar">
			<div class="sidebar-header">
				<h3 class="sidebar-header-title">Admin AI Sessions</h3>
				<button @click="createNewSession" class="btn-new-chat">
					<i class="fas fa-plus"></i> Chat mới
				</button>
			</div>
			<div class="session-list">
				<div
					v-for="s in sessions"
					:key="s.id"
					:class="['session-item', { active: currentSession?.id === s.id }]"
					@click="selectSession(s)"
				>
					<div class="session-info">
						<span class="session-title">{{ s.title }}</span>
						<span class="session-date">{{ formatTime(s.createdAt) }}</span>
					</div>
					<div class="session-actions">
						<button @click.stop="renameSession(s)" class="btn-icon">
							<i class="fas fa-edit"></i>
						</button>
						<button @click.stop="deleteSession(s)" class="btn-icon delete">
							<i class="fas fa-trash"></i>
						</button>
					</div>
				</div>
			</div>
		</aside>

		<main class="chat-main">
			<header class="chat-header" v-if="currentSession">
				<div class="header-main-info">
					<div class="header-info">
						<h2>{{ currentSession.title }}</h2>
						<span class="status-badge" :class="activeTask?.status || 'idle'">
							{{ activeTask?.message || "Sẵn sàng trợ giúp" }}
						</span>
					</div>

					<div
						class="task-dropdown-wrapper"
						v-if="
							sessionTasks.length > 0 &&
							sessionTasks.some((t) => !t.isCompleted)
						"
					>
						<button
							class="btn-task-toggle"
							@click="showTasksDropdown = !showTasksDropdown"
							:class="{ active: showTasksDropdown }"
						>
							<i class="fas fa-tasks"></i>
							<span
								class="task-count-badge"
								v-if="sessionTasks.some((t) => !t.isCompleted)"
							>
								{{ sessionTasks.filter((t) => !t.isCompleted).length }}
							</span>
							Tiến trình tác vụ
							<i
								class="fas"
								:class="showTasksDropdown ? 'fa-chevron-up' : 'fa-chevron-down'"
							></i>
						</button>

						<transition name="fade-slide">
							<div class="task-dropdown-menu" v-if="showTasksDropdown">
								<div class="dropdown-header">
									<span>Nhật ký tác vụ</span>
									<span class="task-summary"
										>Số task còn lại:
										{{
											sessionTasks.filter((t) => !t.isCompleted).length
										}}</span
									>
								</div>
								<div class="task-items-list">
									<div
										v-for="task in sessionTasks.filter((t) => !t.isCompleted)"
										:key="task.id"
										class="task-dropdown-item"
										:class="{
											completed: task.isCompleted,
											failed: task.isFailed,
											running: !task.isCompleted && !task.isFailed,
											planned:
												task.status === 'planned' || task.status === 'planned',
										}"
									>
										<div class="item-icon">
											<i
												class="fas"
												:class="{
													'fa-check-circle': task.isCompleted,
													'fa-exclamation-circle': task.isFailed,
													'fa-spinner fa-spin':
														!task.isCompleted &&
														!task.isFailed &&
														task.status !== 'planned',
													'fa-clock': task.status === 'planned',
												}"
											></i>
										</div>
										<div class="item-content">
											<div class="item-topic">{{ task.topic }}</div>
											<div class="item-status">{{ task.status }}</div>
											<div
												class="item-progress-bar"
												v-if="
													!task.isCompleted &&
													!task.isFailed &&
													task.status !== 'planned'
												"
											>
												<div
													class="fill"
													:style="{ width: task.progress + '%' }"
												></div>
											</div>
										</div>
										<div class="item-actions" v-if="task.status === 'planned'">
											<button
												@click.stop="removeTask(task.id)"
												class="btn-remove-task"
												title="Xóa bước này"
											>
												<i class="fas fa-times"></i>
											</button>
										</div>
									</div>
								</div>
								<div
									v-if="
										sessionTasks.length > 0 &&
										sessionTasks.every((t) => t.isCompleted)
									"
									class="empty-tasks"
								>
									<i class="fas fa-check-double"></i>
									<span>Tất cả tác vụ đã hoàn thành</span>
								</div>
								<div
									class="dropdown-footer"
									v-if="sessionTasks.some((t) => t.status === 'planned')"
								>
									<button @click="approvePlan" class="btn-approve-all">
										<i class="fas fa-play"></i> Bắt đầu thực thi kế hoạch
									</button>
								</div>
							</div>
						</transition>
					</div>
				</div>
			</header>

			<div v-if="!currentSession" class="welcome-screen">
				<div class="welcome-content">
					<div class="welcome-icon">
						<i class="fas fa-robot"></i>
					</div>
					<h2>Chào mừng quay trở lại, {{ authStore.user?.fullName }}</h2>
					<p>
						Hãy chọn một phiên trò chuyện ở bên trái hoặc tạo mới để bắt đầu
						quản trị hệ thống bằng AI.
					</p>
					<button @click="createNewSession" class="btn-create-welcome">
						<i class="fas fa-plus"></i> Bắt đầu phiên chat mới
					</button>
				</div>
			</div>

			<div class="chat-messages" ref="chatContainer" v-if="currentSession">
				<div v-if="isLoading" class="loading-overlay">
					<div class="spinner"></div>
					<span>Đang tải lịch sử...</span>
				</div>

				<template v-else>
					<div
						v-for="(msg, idx) in messages"
						:key="idx"
						class="message-wrapper"
						:class="msg.role"
					>
						<div class="message-bubble" :class="msg.role">
							<div
								class="message-content"
								v-html="parseMarkdown(msg.content)"
							></div>
							<div class="message-time">
								{{
									new Date(msg.createdAt).toLocaleTimeString([], {
										hour: "2-digit",
										minute: "2-digit",
									})
								}}
							</div>
						</div>
					</div>

					<div v-if="isAiThinking" class="message-wrapper assistant">
						<div class="message-bubble assistant typing">
							<div class="typing-indicator">
								<span></span>
								<span></span>
								<span></span>
							</div>
							<div v-if="activeTask" class="task-hint">
								{{ activeTask.detail || activeTask.step }}
							</div>
						</div>
					</div>
				</template>
			</div>

			<div class="chat-input-area" v-if="currentSession">
				<transition name="fade">
					<div
						v-if="activeTask && activeTask.status === 'running'"
						class="progress-stepper"
					>
						<div class="stepper-content">
							<div class="ai-processing-animation">
								<div class="dot"></div>
								<div class="line"></div>
								<div class="dot"></div>
							</div>
							<div class="progress-details">
								<span class="progress-step">{{ activeTask.step }}</span>
								<span class="progress-msg">{{
									activeTask.detail || "Đang xử lý..."
								}}</span>
							</div>
						</div>
					</div>
				</transition>

				<div
					class="input-wrapper"
					:class="{
						disabled:
							isAiThinking || (activeTask && activeTask.status === 'running'),
					}"
				>
					<textarea
						v-model="newMessage"
						@keydown.enter.prevent="sendMessage"
						placeholder="Nhập yêu cầu quản trị..."
						rows="2"
						:disabled="
							isAiThinking || (activeTask && activeTask.status === 'running')
						"
					></textarea>
					<button
						@click="sendMessage"
						:disabled="
							!newMessage.trim() ||
							isAiThinking ||
							(activeTask && activeTask.status === 'running')
						"
						class="btn-send"
					>
						<i class="fas fa-paper-plane"></i>
					</button>
				</div>
			</div>

			<div v-else class="empty-state">
				<i class="fas fa-robot animate-bounce"></i>
				<h2>Chọn hoặc tạo phiên chat để bắt đầu</h2>
				<p>
					Tôi có thể giúp ông quản lý nhân sự, khóa học và phân tích dữ liệu LMS
					mạnh mẽ hơn.
				</p>
			</div>
		</main>
	</div>
</template>

<style scoped>
.admin-ai-container {
	display: flex;
	height: calc(100vh - 120px);
	margin: 20px;
	background: rgba(255, 255, 255, 0.4);
	backdrop-filter: blur(15px);
	border: 1px solid rgba(255, 255, 255, 0.2);
	border-radius: 20px;
	overflow: hidden;
	color: #1f2937;
	box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.1);
}

.chat-sidebar {
	width: 300px;
	background: rgba(255, 255, 255, 0.3);
	border-right: 1px solid rgba(0, 0, 0, 0.05);
	display: flex;
	flex-direction: column;
}

.sidebar-header {
	padding: 20px;
	border-bottom: 1px solid rgba(0, 0, 0, 0.05);
	color: #111827;
}

.sidebar-header-title {
	font-weight: 700;
	margin-bottom: 5px;
}

.btn-new-chat {
	width: 100%;
	margin-top: 15px;
	padding: 10px;
	background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
	border: none;
	border-radius: 8px;
	color: white;
	font-weight: 600;
	cursor: pointer;
	transition: transform 0.2s;
}

.btn-new-chat:hover {
	transform: translateY(-2px);
	box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

.session-list {
	flex: 1;
	overflow-y: auto;
	padding: 10px;
}

.session-item {
	padding: 15px;
	margin-bottom: 8px;
	border-radius: 10px;
	cursor: pointer;
	transition: all 0.3s;
	background: rgba(0, 0, 0, 0.02);
	color: #4b5563;
}

.session-item:hover,
.session-item.active {
	background: rgba(99, 102, 241, 0.1);
	border-left: 4px solid #6366f1;
	color: #1e1b4b;
}

.session-title {
	font-weight: 600;
	display: block;
}

.session-date {
	font-size: 11px;
	opacity: 0.7;
}

.chat-main {
	flex: 1;
	display: flex;
	flex-direction: column;
	background: #f8fafc;
	position: relative;
}

.chat-header {
	padding: 15px 25px;
	background: white;
	border-bottom: 1px solid rgba(0, 0, 0, 0.05);
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.header-main-info {
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 20px;
}

.header-info h2 {
	font-size: 18px;
	font-weight: 700;
	color: #111827;
	margin-bottom: 4px;
}

.task-dropdown-wrapper {
	position: relative;
	z-index: 100;
}

.btn-task-toggle {
	display: flex;
	align-items: center;
	gap: 10px;
	background: #f1f5f9;
	border: 1px solid #e2e8f0;
	padding: 8px 16px;
	border-radius: 12px;
	font-size: 14px;
	font-weight: 600;
	color: #475569;
	cursor: pointer;
	transition: all 0.3s;
	position: relative;
}

.btn-task-toggle:hover,
.btn-task-toggle.active {
	background: #fff;
	border-color: #6366f1;
	color: #6366f1;
	box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1);
}

.task-count-badge {
	position: absolute;
	top: -8px;
	left: -8px;
	background: #ef4444;
	color: white;
	font-size: 10px;
	width: 18px;
	height: 18px;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	border: 2px solid white;
}

.task-dropdown-menu {
	position: absolute;
	top: calc(100% + 10px);
	right: 0;
	width: 320px;
	background: white;
	border-radius: 16px;
	border: 1px solid rgba(0, 0, 0, 0.05);
	box-shadow:
		0 10px 25px -5px rgba(0, 0, 0, 0.1),
		0 8px 10px -6px rgba(0, 0, 0, 0.1);
	overflow: hidden;
}

.dropdown-header {
	padding: 15px 20px;
	background: #f8fafc;
	border-bottom: 1px solid #f1f5f9;
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.dropdown-header span {
	font-weight: 700;
	font-size: 14px;
	color: #1e293b;
}

.task-summary {
	font-size: 11px;
	color: #64748b;
	background: #fff;
	padding: 2px 8px;
	border-radius: 10px;
	border: 1px solid #e2e8f0;
}

.task-items-list {
	max-height: 400px;
	overflow-y: auto;
	padding: 10px;
}

.task-dropdown-item {
	display: flex;
	gap: 12px;
	padding: 12px;
	border-radius: 12px;
	transition: background 0.2s;
	margin-bottom: 5px;
}

.task-dropdown-item:hover {
	background: #f8fafc;
}

.item-icon {
	font-size: 18px;
	margin-top: 2px;
}

.task-dropdown-item.completed .item-icon {
	color: #22c55e;
}
.task-dropdown-item.failed .item-icon {
	color: #ef4444;
}
.task-dropdown-item.running .item-icon {
	color: #3b82f6;
}
.task-dropdown-item.planned .item-icon {
	color: #94a3b8;
}

.item-content {
	flex: 1;
	min-width: 0;
}

.item-topic {
	font-size: 13px;
	font-weight: 600;
	color: #334155;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.item-status {
	font-size: 11px;
	color: #64748b;
	margin-top: 2px;
}

.item-progress-bar {
	height: 4px;
	background: #f1f5f9;
	border-radius: 2px;
	margin-top: 8px;
	overflow: hidden;
}

.item-progress-bar .fill {
	height: 100%;
	background: #6366f1;
	transition: width 0.3s ease;
}

.item-actions {
	display: flex;
	align-items: center;
}

.btn-remove-task {
	background: none;
	border: none;
	color: #ef4444;
	cursor: pointer;
	padding: 5px;
	border-radius: 50%;
	transition: background 0.2s;
	opacity: 0.6;
}

.btn-remove-task:hover {
	background: rgba(239, 68, 68, 0.1);
	opacity: 1;
}

.dropdown-footer {
	padding: 10px;
	background: #f8fafc;
	border-top: 1px solid #f1f5f9;
}

.btn-approve-all {
	width: 100%;
	padding: 8px;
	background: #10b981;
	color: white;
	border: none;
	border-radius: 8px;
	font-weight: 600;
	cursor: pointer;
	transition: background 0.2s;
}

.btn-approve-all:hover {
	background: #059669;
}

.empty-tasks {
	padding: 30px 20px;
	text-align: center;
	color: #64748b;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 10px;
}

.empty-tasks i {
	font-size: 24px;
	color: #22c55e;
}

.empty-tasks span {
	font-size: 13px;
	font-weight: 500;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
	transition: all 0.3s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
	opacity: 0;
	transform: translateY(-10px);
}

.status-badge {
	font-size: 12px;
	padding: 4px 10px;
	border-radius: 20px;
	background: rgba(0, 0, 0, 0.05);
	color: #6b7280;
}

.status-badge.running {
	background: rgba(59, 130, 246, 0.1);
	color: #2563eb;
	border: 1px solid #3b82f6;
}

.chat-messages {
	flex: 1;
	overflow-y: auto;
	padding: 25px;
	display: flex;
	flex-direction: column;
	gap: 20px;
}

.message-bubble {
	max-width: 80%;
	padding: 15px 20px;
	border-radius: 20px;
	position: relative;
	line-height: 1.6;
}

.message-bubble.user {
	align-self: flex-end;
	background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
	color: white;
	border-bottom-right-radius: 4px;
}

.message-bubble.user a {
	color: #e0e7ff;
	text-decoration: underline;
	font-weight: 500;
}

.message-bubble.assistant {
	align-self: flex-start;
	background: white;
	color: #1f2937;
	border-bottom-left-radius: 4px;
	border: 1px solid rgba(0, 0, 0, 0.05);
	box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.message-bubble.assistant a {
	color: #4f46e5;
	text-decoration: underline;
}

.message-time {
	display: block;
	font-size: 10px;
	opacity: 0.5;
	margin-top: 5px;
	text-align: right;
}

.plan-card {
	background: #f8fafc;
	padding: 15px;
	border-radius: 12px;
	border: 1px solid #e2e8f0;
	margin-bottom: 10px;
	color: #1e293b;
}

.plan-steps {
	list-style: none;
	padding: 0;
	margin: 10px 0;
}

.plan-steps li {
	padding: 8px 0;
	border-bottom: 1px solid #f1f5f9;
	font-size: 14px;
	color: #334155;
}

.btn-approve {
	background: #10b981;
	color: white;
	border: none;
	padding: 8px 16px;
	border-radius: 6px;
	font-weight: 600;
	cursor: pointer;
	width: 100%;
	margin-top: 10px;
}

.chat-input-area {
	padding: 20px;
	border-top: 1px solid rgba(0, 0, 0, 0.05);
	background: rgba(255, 255, 255, 0.5);
}

.input-wrapper {
	display: flex;
	gap: 15px;
	background: white;
	border-radius: 15px;
	padding: 10px 15px;
	border: 1px solid rgba(0, 0, 0, 0.1);
	box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
}

textarea {
	flex: 1;
	background: transparent;
	border: none;
	color: #1f2937;
	resize: none;
	font-family: inherit;
	font-size: 15px;
	padding: 5px;
}

textarea::placeholder {
	color: #9ca3af;
}

textarea:focus {
	outline: none;
}

.btn-send {
	background: #6366f1;
	color: white;
	border: none;
	width: 45px;
	height: 45px;
	border-radius: 12px;
	cursor: pointer;
	transition: background 0.3s;
}

.input-wrapper.disabled {
	background: #f1f5f9;
	opacity: 0.7;
	cursor: not-allowed;
}

textarea:disabled {
	cursor: not-allowed;
}

.btn-send:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}

.progress-stepper {
	margin-bottom: 15px;
	background: white;
	border: 1px solid #bfdbfe;
	padding: 12px;
	border-radius: 12px;
	display: flex;
	align-items: center;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.pulse-dot {
	width: 10px;
	height: 10px;
	background: #3b82f6;
	border-radius: 50%;
	margin-right: 12px;
	box-shadow: 0 0 0 rgba(59, 130, 246, 0.4);
	animation: pulse 1.5s infinite;
}

.progress-msg {
	color: #1e40af;
	font-weight: 600;
	font-size: 14px;
}

@keyframes pulse {
	0% {
		transform: scale(0.95);
		box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
	}
	70% {
		transform: scale(1);
		box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
	}
	100% {
		transform: scale(0.95);
		box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
	}
}

.empty-state {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	opacity: 0.8;
	text-align: center;
	padding: 40px;
	color: #4b5563;
}

.empty-state i {
	font-size: 64px;
	margin-bottom: 20px;
	color: #6366f1;
}

.empty-state h2 {
	color: #111827;
	font-weight: 700;
}

::-webkit-scrollbar {
	width: 6px;
}
::-webkit-scrollbar-thumb {
	background: rgba(0, 0, 0, 0.1);
	border-radius: 10px;
}

.message-wrapper {
	display: flex;
	flex-direction: column;
	margin-bottom: 20px;
}

.message-wrapper.user {
	align-items: flex-end;
}

.message-wrapper.assistant {
	align-items: flex-start;
}

.typing-indicator {
	display: flex;
	gap: 4px;
	padding: 8px 4px;
}

.typing-indicator span {
	width: 8px;
	height: 8px;
	background: #6366f1;
	border-radius: 50%;
	animation: bounce 1.4s infinite ease-in-out both;
}

.typing-indicator span:nth-child(1) {
	animation-delay: -0.32s;
}
.typing-indicator span:nth-child(2) {
	animation-delay: -0.16s;
}

@keyframes bounce {
	0%,
	80%,
	100% {
		transform: scale(0);
	}
	40% {
		transform: scale(1);
	}
}

.task-hint {
	font-size: 0.85rem;
	color: #6366f1;
	font-style: italic;
	margin-top: 4px;
	white-space: nowrap;
}

.welcome-screen {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	text-align: center;
	background: rgba(255, 255, 255, 0.4);
	backdrop-filter: blur(10px);
}

.welcome-content {
	max-width: 400px;
	padding: 40px;
}

.welcome-icon {
	font-size: 4rem;
	color: #6366f1;
	margin-bottom: 20px;
	animation: float 3s infinite ease-in-out;
}

.welcome-content h2 {
	font-size: 1.8rem;
	margin-bottom: 15px;
	color: #1e293b;
}

.welcome-content p {
	color: #64748b;
	line-height: 1.6;
	margin-bottom: 25px;
}

.btn-create-welcome {
	padding: 12px 24px;
	border-radius: 12px;
	border: none;
	background: #6366f1;
	color: white;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.3s ease;
	display: flex;
	align-items: center;
	gap: 8px;
	margin: 0 auto;
}

.btn-create-welcome:hover {
	background: #4f46e5;
	transform: translateY(-2px);
	box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

@keyframes float {
	0%,
	100% {
		transform: translateY(0);
	}
	50% {
		transform: translateY(-15px);
	}
}

.progress-stepper {
	position: absolute;
	top: -70px;
	left: 20px;
	right: 20px;
	background: rgba(255, 255, 255, 0.7);
	backdrop-filter: blur(12px);
	border: 1px solid rgba(99, 102, 241, 0.2);
	border-radius: 16px;
	padding: 12px 20px;
	z-index: 10;
	box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05);
}

.stepper-content {
	display: flex;
	align-items: center;
	gap: 15px;
}

.ai-processing-animation {
	display: flex;
	align-items: center;
	gap: 5px;
}

.ai-processing-animation .dot {
	width: 8px;
	height: 8px;
	background: #6366f1;
	border-radius: 50%;
	animation: pulse 1.5s infinite;
}

.ai-processing-animation .line {
	width: 20px;
	height: 2px;
	background: rgba(99, 102, 241, 0.2);
}

.progress-details {
	display: flex;
	flex-direction: column;
}

.progress-step {
	font-size: 0.75rem;
	font-weight: 700;
	text-transform: uppercase;
	color: #6366f1;
	letter-spacing: 0.05em;
}

.progress-msg {
	font-size: 0.9rem;
	color: #1e293b;
	font-weight: 500;
}

.fade-enter-active,
.fade-leave-active {
	transition:
		opacity 0.5s ease,
		transform 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
	opacity: 0;
	transform: translateY(10px);
}

@keyframes pulse {
	0%,
	100% {
		opacity: 1;
		transform: scale(1);
	}
	50% {
		opacity: 0.5;
		transform: scale(0.8);
	}
}

.message-bubble.typing {
	display: flex;
	flex-direction: column;
	min-width: 120px;
}

.session-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 15px;
	margin-bottom: 8px;
	border-radius: 12px;
	cursor: pointer;
	transition: all 0.3s ease;
	background: rgba(255, 255, 255, 0.4);
	border: 1px solid rgba(255, 255, 255, 0.4);
}

.session-item:hover {
	background: rgba(255, 255, 255, 0.8);
	transform: translateX(4px);
}

.session-item.active {
	background: rgba(99, 102, 241, 0.1);
	border-color: #6366f1;
}

.session-actions {
	display: flex;
	gap: 6px;
	opacity: 0;
	transition: opacity 0.3s ease;
}

.session-item:hover .session-actions {
	opacity: 1;
}

.btn-icon {
	width: 28px;
	height: 28px;
	border-radius: 6px;
	border: none;
	background: transparent;
	color: #64748b;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	transition: all 0.2s ease;
}

.btn-icon:hover {
	background: #f1f5f9;
	color: #6366f1;
}

.btn-icon.delete:hover {
	background: #fee2e2;
	color: #ef4444;
}
</style>
