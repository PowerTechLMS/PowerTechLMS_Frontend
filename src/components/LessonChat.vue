<script setup>
import { ref, onMounted, nextTick, watch } from "vue";
import { Send, Bot, MessageSquare, Loader2 } from "lucide-vue-next";
import { lessonChatAPI } from "@/services/api";
import { toast } from "vue3-toastify";
import { marked } from "marked";
import DOMPurify from "dompurify";

const props = defineProps({
	lessonId: {
		type: Number,
		required: true,
	},
	currentTimestamp: {
		type: Number,
		default: 0,
	},
});

const emit = defineEmits(["seek"]);

const messages = ref([]);
const newMessage = ref("");
const isLoading = ref(false);
const isSending = ref(false);
const chatContainer = ref(null);

const loadHistory = async () => {
	isLoading.value = true;
	try {
		const res = await lessonChatAPI.getAll(props.lessonId);
		messages.value = res.data;
		scrollToBottom();
	} catch {
	} finally {
		isLoading.value = false;
	}
};

const sendMessage = async () => {
	if (!newMessage.value.trim() || isSending.value) return;

	const messageText = newMessage.value.trim();
	const tempTimestamp = props.currentTimestamp;
	newMessage.value = "";
	isSending.value = true;

	const tempUserMsg = {
		id: Date.now(),
		userMessage: messageText,
		videoTimestamp: tempTimestamp,
		createdAt: new Date().toISOString(),
		isPending: true,
	};
	messages.value.push(tempUserMsg);
	scrollToBottom();

	try {
		const res = await lessonChatAPI.sendMessage({
			lessonId: props.lessonId,
			message: messageText,
			currentTimestamp: tempTimestamp,
		});

		const index = messages.value.findIndex((m) => m.id === tempUserMsg.id);
		if (index !== -1) {
			messages.value[index] = res.data;
		} else {
			messages.value.push(res.data);
		}
		scrollToBottom();
	} catch {
		messages.value = messages.value.filter((m) => m.id !== tempUserMsg.id);
		toast.error("Không thể gửi tin nhắn. Vui lòng thử lại.");
	} finally {
		isSending.value = false;
	}
};

const scrollToBottom = () => {
	nextTick(() => {
		if (chatContainer.value) {
			chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
		}
	});
};

const formatTime = (seconds) => {
	if (seconds === null || seconds === undefined) return "";
	const h = Math.floor(seconds / 3600);
	const m = Math.floor((seconds % 3600) / 60);
	const s = Math.floor(seconds % 60);
	if (h > 0)
		return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
	return `${m}:${String(s).padStart(2, "0")}`;
};

const parseResponse = (text) => {
	if (!text) return "";

	let html = marked.parse(text);

	const regex = /\[\[(\d{1,2}:?\d{0,2}:?\d{0,2})\]\]/g;
	html = html.replace(regex, (match, timeStr) => {
		const parts = timeStr.split(":").map(Number);
		let secs;
		if (parts.length === 3) secs = parts[0] * 3600 + parts[1] * 60 + parts[2];
		else if (parts.length === 2) secs = parts[0] * 60 + parts[1];
		else secs = parts[0];

		return `<span class="timestamp-link" data-time="${secs}"><i class="lucide-clock"></i> ${timeStr}</span>`;
	});

	return DOMPurify.sanitize(html);
};

const handleChatClick = (event) => {
	const target = event.target.closest(".timestamp-link");
	if (target) {
		const time = parseFloat(target.dataset.time);
		emit("seek", time);
	}
};

onMounted(loadHistory);

watch(() => props.lessonId, loadHistory);
</script>

<template>
	<div class="lesson-chat-component">
		<div
			ref="chatContainer"
			class="chat-messages custom-scrollbar"
			@click="handleChatClick"
		>
			<div v-if="isLoading" class="chat-loading">
				<Loader2 class="spinner" :size="24" />
				<p>Đang tải lịch sử trò chuyện...</p>
			</div>
			<div v-else-if="messages.length === 0" class="chat-empty">
				<div class="empty-icon glass">
					<MessageSquare :size="32" />
				</div>
				<h4>Hỏi đáp thông minh với AI</h4>
				<p>
					Đặt câu hỏi về nội dung bài học bằng tiếng Việt. AI sẽ giúp bạn tóm
					tắt hoặc giải thích các đoạn khó trong video.
				</p>
			</div>
			<template v-else>
				<div
					v-for="msg in messages"
					:key="msg.id"
					class="message-wrapper"
					:class="msg.aiResponse ? 'ai-wrapper' : 'user-wrapper'"
				>
					<!-- User Message -->
					<div
						class="message user-message glass"
						:class="{ 'is-pending': msg.isPending }"
					>
						<div class="message-header">
							<span class="sender-name">Bạn</span>
							<span v-if="msg.videoTimestamp" class="msg-time">
								tại {{ formatTime(msg.videoTimestamp) }}
							</span>
						</div>
						<p class="message-body">{{ msg.userMessage }}</p>
					</div>

					<!-- AI Response -->
					<div v-if="msg.aiResponse" class="message ai-message glass highlight">
						<div class="message-header">
							<div class="ai-badge">
								<Bot :size="14" />
								<span>AI TRỢ LÝ</span>
							</div>
						</div>
						<div
							class="message-body"
							v-html="parseResponse(msg.aiResponse)"
						></div>
					</div>
				</div>
			</template>

			<div v-if="isSending" class="message-wrapper ai-wrapper">
				<div class="message ai-message glass processing">
					<div class="typing-indicator">
						<span></span>
						<span></span>
						<span></span>
					</div>
					<p>AI đang suy nghĩ...</p>
				</div>
			</div>
		</div>

		<div class="chat-input-area glass">
			<div class="input-wrapper">
				<textarea
					v-model="newMessage"
					placeholder="Nhập câu hỏi về bài học..."
					@keydown.enter.prevent="sendMessage"
				></textarea>
				<button
					class="send-btn"
					:disabled="!newMessage.trim() || isSending"
					@click="sendMessage"
				>
					<Send v-if="!isSending" :size="20" />
					<Loader2 v-else class="spinner" :size="20" />
				</button>
			</div>
			<div class="input-hint">
				Dùng Enter để gửi câu hỏi. AI sẽ trả lời dựa trên nội dung bài giảng.
			</div>
		</div>
	</div>
</template>

<style scoped>
.lesson-chat-component {
	display: flex;
	flex-direction: column;
	height: 100%;
	background: transparent;
	overflow: hidden;
}

.chat-messages {
	flex: 1;
	overflow-y: auto;
	padding: 1.5rem;
	display: flex;
	flex-direction: column;
	gap: 1.5rem;
}

.chat-loading,
.chat-empty {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	text-align: center;
	height: 100%;
	color: var(--text-secondary);
}

.empty-icon {
	width: 64px;
	height: 64px;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 1.5rem;
	background: rgba(255, 255, 255, 0.1);
	border: 1px solid rgba(255, 255, 255, 0.2);
	color: var(--primary-400);
}

.chat-empty h4 {
	color: var(--text-primary);
	margin-bottom: 0.5rem;
	font-weight: 700;
}

.chat-empty p {
	max-width: 300px;
	font-size: 0.9rem;
	line-height: 1.5;
}

.message-wrapper {
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
	max-width: 90%;
}

.user-wrapper {
	align-self: flex-end;
}

.ai-wrapper {
	align-self: flex-start;
}

.message {
	padding: 1rem;
	border-radius: 1rem;
	position: relative;
	transition: all 0.3s ease;
}

.user-message {
	background: var(--primary-500);
	color: white;
	border-bottom-right-radius: 0.25rem;
}

.user-message.is-pending {
	opacity: 0.6;
	background: var(--primary-400);
	cursor: wait;
}

.ai-message {
	background: rgba(255, 255, 255, 0.8);
	color: var(--text-primary);
	border-bottom-left-radius: 0.25rem;
	border: 1px solid rgba(15, 23, 42, 0.05);
}

.ai-message.highlight {
	border-left: 4px solid var(--primary-400);
}

.message-header {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	margin-bottom: 0.5rem;
	font-size: 0.75rem;
	font-weight: 600;
	opacity: 0.8;
}

.ai-badge {
	display: flex;
	align-items: center;
	gap: 0.25rem;
	background: var(--primary-50, #eef2ff);
	color: var(--primary-600);
	padding: 2px 8px;
	border-radius: 100px;
	text-transform: uppercase;
	letter-spacing: 0.5px;
}

.msg-time {
	opacity: 0.7;
	font-style: italic;
}

.message-body {
	font-size: 0.95rem;
	line-height: 1.6;
	word-break: break-word;
}

.message-body strong {
	color: var(--primary-700);
	font-weight: 700;
}

.message-body ul {
	margin: 0.5rem 0;
	padding-left: 1.25rem;
}

.message-body li {
	margin-bottom: 0.25rem;
}

.message-body :deep(p) {
	margin-bottom: 0.5rem;
}
.message-body :deep(ul),
.message-body :deep(ol) {
	margin-bottom: 0.75rem;
	padding-left: 1.25rem;
}
.message-body :deep(h3) {
	font-size: 1.1rem;
	margin-top: 1rem;
	margin-bottom: 0.5rem;
	font-weight: 700;
}

.chat-input-area {
	padding: 1.5rem;
	border-top: 1px solid var(--border-color);
	background: rgba(255, 255, 255, 0.5);
	backdrop-filter: blur(10px);
}

.input-wrapper {
	display: flex;
	gap: 0.75rem;
	background: white;
	padding: 0.5rem;
	border-radius: 1rem;
	border: 1px solid var(--border-color);
	box-shadow: var(--shadow-sm);
	transition: all 0.3s ease;
}

.input-wrapper:focus-within {
	border-color: var(--primary-400);
	box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}

textarea {
	flex: 1;
	border: none;
	background: transparent;
	padding: 0.5rem;
	resize: none;
	height: 48px;
	font-family: inherit;
	font-size: 0.95rem;
	color: var(--text-primary);
}

textarea:focus {
	outline: none;
}

.send-btn {
	width: 48px;
	height: 48px;
	border-radius: 0.75rem;
	background: var(--primary-500);
	color: white;
	border: none;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	transition: all 0.2s ease;
}

.send-btn:hover:not(:disabled) {
	background: var(--primary-600);
	transform: translateY(-2px);
}

.send-btn:disabled {
	background: var(--bg-tertiary);
	color: var(--text-tertiary);
	cursor: not-allowed;
}

.input-hint {
	font-size: 0.7rem;
	color: var(--text-tertiary);
	margin-top: 0.75rem;
	text-align: center;
}

.spinner {
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

:deep(.timestamp-link) {
	color: var(--primary-600);
	background: var(--primary-50);
	padding: 1px 6px;
	border-radius: 4px;
	font-weight: 600;
	cursor: pointer;
	display: inline-flex;
	align-items: center;
	gap: 4px;
	margin: 0 2px;
	border-bottom: 1px dashed var(--primary-400);
}

:deep(.timestamp-link:hover) {
	background: var(--primary-100);
	text-decoration: none;
}

.typing-indicator {
	display: flex;
	gap: 4px;
	margin-bottom: 0.5rem;
}

.typing-indicator span {
	width: 6px;
	height: 6px;
	background: var(--primary-400);
	border-radius: 50%;
	display: block;
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

.processing {
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	padding: 1rem 1.5rem;
}

.processing p {
	margin: 0;
	font-size: 0.9rem;
	font-style: italic;
	color: var(--text-secondary);
}
</style>
