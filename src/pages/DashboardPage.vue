<script setup>
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import { dashboardAPI, certificateAPI, leaderboardAPI } from "@/services/api";
import {
	Award,
	AlertCircle,
	BookOpen,
	GraduationCap,
	Target,
	TrendingUp,
	Clock,
	User,
	Zap,
	Trophy,
	Star,
	FileText,
} from "lucide-vue-next";

const authStore = useAuthStore();

const loading = ref(true);
const certificates = ref([]);
const badges = ref([]);
const todayTasks = ref([]);
const weekMission = ref({
	totalTasks: 0,
	doneTasks: 0,
	xpEarned: 0,
	xpTarget: 0,
	mandatoryDone: 0,
	mandatoryTotal: 0,
	optionalDone: 0,
	optionalTotal: 0,
	weekLabel: "",
	status: "",
	skills: [],
});
const myCourses = ref([]);
const inProgressCourses = ref([]);
const testPractice = ref([]);

const chatOpen = ref(false);
const chatMessages = ref([]);
const chatInput = ref("");
const chatLoading = ref(false);
const chatScrollRef = ref(null);

async function sendChat() {
	if (!chatInput.value.trim() || chatLoading.value) return;

	const userMsg = { role: "user", content: chatInput.value };
	chatMessages.value.push(userMsg);
	chatInput.value = "";
	chatLoading.value = true;

	try {
		const res = await aiSuggestionAPI.chat(chatMessages.value);
		if (res.data && res.data.message) {
			chatMessages.value.push({ role: "assistant", content: res.data.message });
		} else {
			chatMessages.value.push({
				role: "assistant",
				content:
					"Tôi đã tìm kiếm nhưng không thấy khóa học nào phù hợp. Bạn có thể gửi yêu cầu đề xuất lên Cấp trên nhé!",
			});
		}
	} catch {
		chatMessages.value.push({
			role: "assistant",
			content: "Xin lỗi, tôi đang gặp lỗi kết nối. Hãy thử lại sau nhé!",
		});
	} finally {
		chatLoading.value = false;
		nextTick(() => {
			if (chatScrollRef.value) {
				chatScrollRef.value.scrollTop = chatScrollRef.value.scrollHeight;
			}
		});
	}
}
const learningProfile = ref({
	summary: [],
	predictedScore: 0,
	targetScore: 0,
	dept: "",
	entryScore: 3.0,
});
const hrMessages = ref([]);

const greeting = computed(() => {
	const h = new Date().getHours();
	if (h < 12) return "Chào buổi sáng";
	if (h < 18) return "Chào buổi chiều";
	return "Chào buổi tối";
});

const avatarUrl = computed(() => {
	if (!authStore.user?.avatar) return null;
	const url = authStore.user.avatar;
	const base = url.startsWith("http")
		? url
		: `${import.meta.env.VITE_API_URL || "http://localhost:5100"}${url}`;
	return `${base}?t=${authStore.avatarUpdateTime}`;
});

const activeCourse = computed(
	() => inProgressCourses.value[0] || myCourses.value[0] || null,
);
const missionPct = computed(() =>
	weekMission.value.totalTasks
		? Math.round(
				(weekMission.value.doneTasks / weekMission.value.totalTasks) * 100,
			)
		: 0,
);

const unreadMessages = computed(
	() => hrMessages.value.filter((m) => m.unread).length,
);

onMounted(async () => {
	loading.value = true;
	try {
		const [dashRes, cRes, bRes] = await Promise.all([
			dashboardAPI.getLearnerData(),
			certificateAPI.getMy(),
			leaderboardAPI.getMyBadges(),
		]);
		const d = dashRes.data || {};
		todayTasks.value = d.todayTasks || [];
		weekMission.value = { ...weekMission.value, ...(d.weekMission || {}) };
		myCourses.value = d.myCourses || [];
		inProgressCourses.value = (d.myCourses || []).filter(
			(c) => c.progressPercent > 0 && c.progressPercent < 100,
		);
		testPractice.value = d.testPractice || [];
		learningProfile.value = {
			...learningProfile.value,
			...(d.learningProfile || { summary: [] }),
		};
		hrMessages.value = d.hrMessages || [];
		certificates.value = cRes.data || [];
		badges.value = (bRes.data || []).filter((b) => b.isEarned);
	} catch {
	} finally {
		loading.value = false;
	}
});
</script>

<template>
	<div class="theme-provider">
		<div v-if="!loading" class="dash">
			<section class="top-bar">
				<div class="greet-box">
					<div
						v-if="avatarUrl"
						class="avatar"
						:style="`background-image:url('${avatarUrl}')`"
					/>
					<div v-else class="avatar avatar-init">
						{{ authStore.user?.fullName?.charAt(0) || "U" }}
					</div>
					<div class="greet-text">
						<h1>
							{{ greeting }},
							<span class="text-primary">{{
								authStore.user?.fullName || "Admin"
							}}</span>
						</h1>
						<p>Cùng hệ thống nâng cao năng lực mỗi ngày nhé!</p>
					</div>
				</div>
				<div class="top-actions">
					<div class="pill pill-glow">
						<span class="dot" />
						{{ weekMission.weekLabel || "Tuần hiện tại" }}
					</div>
				</div>
			</section>

			<section class="goal-banner">
				<div class="banner-content">
					<div class="banner-title">
						<Zap :size="18" class="icon-zap" /> Mục tiêu hôm nay
					</div>
					<p v-if="todayTasks.length === 0">
						Hôm nay bạn không có nhiệm vụ cụ thể nào. Hãy tiếp tục học khóa đang
						dở nhé!
					</p>
					<p v-else>
						Hôm nay bạn đang có {{ todayTasks.length }} nhiệm vụ chưa hoàn
						thành. Cùng nỗ lực nhé!
					</p>
				</div>
				<div class="banner-right">
					<div class="bot-bubble">
						Bắt tay vào làm nhiệm vụ đầu tiên thôi,
						<strong>{{
							authStore.user?.fullName?.split(" ").pop() || "Admin"
						}}</strong>
						ơi!
					</div>
					<span class="bot-emoji">🤖</span>
				</div>
			</section>

			<div class="main-layout">
				<div class="center-col">
					<section class="card weekly-card">
						<h2 class="card-title">Nhiệm vụ học tập tuần này</h2>
						<div class="mission-layout">
							<div class="mission-circle-box">
								<div class="circle-wrap">
									<svg viewBox="0 0 84 84">
										<circle class="circle-bg" cx="42" cy="42" r="33" />
										<circle
											class="circle-fill"
											cx="42"
											cy="42"
											r="33"
											:style="`stroke-dashoffset: ${207.3 - (207.3 * missionPct) / 100}; stroke-dasharray: 207.3;`"
										/>
									</svg>
									<div class="circle-content">
										<span class="pct">{{ missionPct }}%</span>
										<span class="lbl">tuần này</span>
									</div>
								</div>
								<div class="date-lbl">
									<Clock :size="12" /> {{ weekMission.weekLabel }}
								</div>
							</div>

							<div class="mission-details">
								<div class="detail-group">
									<h3>Tiến độ nhiệm vụ</h3>
									<div class="stat-line">
										<span><Trophy :size="14" /> XP tích lũy tuần này</span>
										<strong
											>{{ weekMission.xpEarned }} /
											{{ weekMission.xpTarget }} XP</strong
										>
									</div>
									<div class="stat-line">
										<span><Target :size="14" /> Đào tạo bắt buộc</span>
										<strong
											>{{ weekMission.mandatoryDone }}/{{
												weekMission.mandatoryTotal
											}}</strong
										>
									</div>
									<p class="stat-sub">
										• Hoàn thành: {{ weekMission.mandatoryDone }}/{{
											weekMission.mandatoryTotal
										}}
										nhiệm vụ
									</p>
									<div class="stat-line">
										<span><BookOpen :size="14" /> Học tập tự chọn</span>
										<strong
											>{{ weekMission.optionalDone }}/{{
												weekMission.optionalTotal
											}}</strong
										>
									</div>
								</div>

								<div class="skills-grid">
									<div
										v-for="skill in weekMission.skills"
										:key="skill.name"
										class="skill-bar-wrap"
									>
										<div class="skill-info">
											<span>{{ skill.name }}</span>
											<span :style="`color:${skill.color}`"
												>{{ skill.pct }}%</span
											>
										</div>
										<div class="bar-track">
											<div
												class="bar-fill"
												:style="`width:${skill.pct}%; background:${skill.color}`"
											/>
										</div>
									</div>
								</div>

								<div class="mission-footer">
									<p>{{ weekMission.status }} 💪</p>
									<button
										class="btn-primary"
										@click="
											$router.push(
												activeCourse
													? `/courses/${activeCourse.id}`
													: '/my-courses',
											)
										"
									>
										Tiếp tục học →
									</button>
								</div>
							</div>
						</div>
					</section>

					<section class="section-group">
						<div class="section-head">
							<h2 class="card-title">Khóa học ưu tiên</h2>
							<button class="link-btn" @click="$router.push('/my-courses')">
								Xem tất cả
							</button>
						</div>
						<div class="course-grid">
							<div
								v-for="c in myCourses.slice(0, 2)"
								:key="c.id"
								class="course-card"
								@click="$router.push(`/courses/${c.id}`)"
							>
								<div
									class="course-thumb"
									:style="`background: linear-gradient(135deg, ${c.thumbColor}, ${c.thumbColor2})`"
								>
									<span
										class="course-badge"
										:class="c.tag === 'Bắt buộc' ? 'bg-purple' : 'bg-blue'"
										>{{ c.tag }}</span
									>
									<GraduationCap :size="32" color="white" />
								</div>
								<div class="course-info">
									<h3>{{ c.title }}</h3>
									<div class="course-prog">
										<div class="mini-bar">
											<div
												class="mini-fill"
												:style="`width:${c.progressPercent}%`"
											/>
										</div>
										<span>{{ c.progressPercent }}%</span>
									</div>
									<div class="course-meta">
										<span><BookOpen :size="12" /> {{ c.units }} Bài</span>
										<span><Trophy :size="12" /> {{ c.cups }}</span>
									</div>
								</div>
							</div>
						</div>
					</section>

					<section class="section-group">
						<h2 class="card-title">Kiểm tra & Đánh giá</h2>
						<div class="quiz-list">
							<div v-for="t in testPractice" :key="t.id" class="quiz-item">
								<div
									class="quiz-icon"
									:style="`background:${t.cover}15; color:${t.cover}`"
								>
									<FileText :size="24" />
								</div>
								<div class="quiz-content">
									<span class="badge" :class="t.status">{{ t.badge }}</span>
									<h3>{{ t.title }}</h3>
									<p>{{ t.subtitle }}</p>
								</div>
								<button
									class="btn-outline"
									@click="$router.push('/my-courses')"
								>
									Thực hiện →
								</button>
							</div>
						</div>
					</section>
				</div>

				<aside class="side-col">
					<section class="card side-panel">
						<h3 class="side-title">Hồ sơ năng lực</h3>
						<p class="dept-text uppercase">
							PHÒNG BAN: {{ learningProfile.dept || "CHƯA PHÂN BỔ" }}
						</p>
						<div class="cap-stats">
							<div class="cap-item">
								<div class="cap-icon purple">
									<User :size="18" />
								</div>
								<span class="cap-lbl">Nhân viên</span>
								<strong class="cap-val">3.0</strong>
							</div>
							<div class="cap-item">
								<div class="cap-icon blue">
									<TrendingUp :size="18" />
								</div>
								<span class="cap-lbl">Dự kiến</span>
								<strong class="cap-val">{{
									learningProfile.predictedScore
								}}</strong>
							</div>
							<div class="cap-item">
								<div class="cap-icon green">
									<Target :size="18" />
								</div>
								<span class="cap-lbl">Mục tiêu</span>
								<strong class="cap-val">5.0</strong>
							</div>
						</div>
					</section>

					<section class="card side-panel">
						<h3 class="side-title">TÓM TẮT QUÁ TRÌNH HỌC</h3>
						<div class="summary-list">
							<div
								v-for="s in learningProfile.summary"
								:key="s.label"
								class="summary-item"
							>
								<span class="s-lbl">{{ s.label }}</span>
								<span class="s-val" :style="`color:${s.color}`">{{
									s.val
								}}</span>
							</div>
						</div>
					</section>

					<section class="card side-panel">
						<div class="panel-head">
							<h3 class="side-title">Nhắc nhở hệ thống</h3>
							<span class="notif-count">{{
								unreadMessages || hrMessages.length
							}}</span>
						</div>
						<p v-if="hrMessages.length === 0" class="panel-muted">
							Bạn không có thông báo mới.
						</p>
						<div v-else class="msg-list">
							<div
								v-for="m in hrMessages.slice(0, 3)"
								:key="m.id"
								class="msg-card"
								:class="{ unread: m.unread }"
							>
								<AlertCircle :size="14" class="msg-icon" />
								<div class="msg-body">
									<p>{{ m.msg }}</p>
									<span>{{ m.time }}</span>
								</div>
							</div>
						</div>
						<button class="btn-soft" @click="$router.push('/my-courses')">
							Đi tới khóa học
						</button>
					</section>

					<section v-if="badges.length" class="card side-panel">
						<h3 class="side-title">Huy hiệu đạt được</h3>
						<div class="badge-row">
							<div
								v-for="b in badges.slice(0, 3)"
								:key="b.badgeId"
								class="badge-box"
							>
								<div class="b-icon">
									<Star :size="18" />
								</div>
								<span>{{ b.badgeName }}</span>
							</div>
						</div>
					</section>

					<section v-if="certificates.length" class="card side-panel">
						<div class="panel-head">
							<h3 class="side-title">Chứng chỉ mới nhất</h3>
							<button
								class="link-btn-sm"
								@click="$router.push('/certificates')"
							>
								Tất cả
							</button>
						</div>
						<div class="cert-list">
							<div
								v-for="c in certificates.slice(0, 3)"
								:key="c.id"
								class="cert-item-mini"
							>
								<Award :size="14" class="c-icon" />
								<div class="c-info">
									<p>{{ c.courseTitle }}</p>
									<span>{{
										new Date(c.issuedAt).toLocaleDateString("vi-VN")
									}}</span>
								</div>
							</div>
						</div>
					</section>
				</aside>
			</div>
		</div>

		<!-- AI Suggestion Dialog -->
		<div v-if="chatOpen" class="ai-chat-overlay" @click.self="chatOpen = false">
			<div class="ai-chat-panel">
				<div class="chat-header">
					<div class="header-info">
						<Sparkles :size="20" class="text-accent" />
						<div>
							<h3>Trợ lý Tìm kiếm Khóa học</h3>
							<span>AI sẽ tìm khóa học phù hợp cho bạn</span>
						</div>
					</div>
					<button class="close-btn" @click="chatOpen = false">
						<X :size="20" />
					</button>
				</div>

				<div ref="chatScrollRef" class="chat-body">
					<div v-if="chatMessages.length === 0" class="welcome-chat">
						<div class="bot-icon"><Sparkles :size="32" /></div>
						<h2>Xin chào! Bạn đang muốn nâng cao kỹ năng gì?</h2>
						<p>
							Hãy nhập yêu cầu của bạn, ví dụ: "Tôi muốn học về lập trình Web"
							hoặc "Tìm khóa học kỹ năng giao tiếp".
						</p>
						<div class="quick-prompts">
							<button
								@click="
									chatInput = 'Tìm khóa học về lập trình';
									sendChat();
								"
							>
								💻 Lập trình
							</button>
							<button
								@click="
									chatInput = 'Tôi muốn học kỹ năng mềm';
									sendChat();
								"
							>
								🤝 Kỹ năng mềm
							</button>
							<button
								@click="
									chatInput = 'Gợi ý khóa học quản lý dự án';
									sendChat();
								"
							>
								📊 Quản lý dự án
							</button>
						</div>
					</div>

					<div
						v-for="(msg, idx) in chatMessages.filter(
							(m) => m.role !== 'system',
						)"
						:key="idx"
						class="chat-msg"
						:class="msg.role"
					>
						<div class="msg-bubble">
							<div class="msg-text">{{ msg.content }}</div>
						</div>
					</div>

					<div v-if="chatLoading" class="chat-msg assistant">
						<div class="msg-bubble typing">
							<span class="dot"></span><span class="dot"></span
							><span class="dot"></span>
						</div>
					</div>
				</div>

				<form class="chat-footer" @submit.prevent="sendChat">
					<input
						v-model="chatInput"
						placeholder="Nhập yêu cầu của bạn..."
						:disabled="chatLoading"
					/>
					<button type="submit" :disabled="!chatInput.trim() || chatLoading">
						<Send :size="18" />
					</button>
				</form>
			</div>
		</div>

		<div v-else class="dash-loading-screen">
			<div class="spinner" />
			<p>Đang tải dữ liệu học tập...</p>
		</div>
	</div>
</template>

<style scoped>
.theme-provider {
	min-height: 100vh;
	background-color: var(--bg-primary);
	color: var(--text-primary);
	font-family: var(--font-family);
	transition: all var(--transition-base);
}

.dash {
	max-width: 1400px;
	margin: 0 auto;
	padding: 32px;
}

.top-bar {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 32px;
}

.greet-box {
	display: flex;
	align-items: center;
	gap: 16px;
}

.avatar {
	width: 56px;
	height: 56px;
	border-radius: 50%;
	background-size: cover;
	background-position: center;
	background-color: var(--primary-500);
	border: 3px solid var(--bg-card);
	box-shadow: 0 0 10px rgba(var(--primary-rgb), 0.2);
	flex-shrink: 0;
}

.avatar-init {
	display: flex;
	align-items: center;
	justify-content: center;
	color: #fff;
	font-weight: 700;
	font-size: 20px;
}

.greet-text h1 {
	font-size: 24px;
	font-weight: 700;
	margin: 0;
}

.empty-recommendation {
	padding: 2rem;
	text-align: center;
	border-radius: 16px;
	color: var(--text-sub);
	font-size: 14px;
	border: 1px dashed var(--border);
}

/* AI Chat Overlay */
.ai-chat-overlay {
	position: fixed;
	inset: 0;
	background: rgba(0, 0, 0, 0.5);
	backdrop-filter: blur(4px);
	z-index: 1000;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 20px;
}

.ai-chat-panel {
	width: 100%;
	max-width: 500px;
	height: 600px;
	background: var(--bg-card);
	border-radius: 24px;
	display: flex;
	flex-direction: column;
	box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.3);
	overflow: hidden;
	border: 1px solid var(--border);
}

.chat-header {
	padding: 20px;
	border-bottom: 1px solid var(--border);
	display: flex;
	justify-content: space-between;
	align-items: center;
	background: var(--bg-main);
}

.header-info {
	display: flex;
	align-items: center;
	gap: 12px;
}

.header-info h3 {
	margin: 0;
	font-size: 16px;
	font-weight: 700;
}

.header-info span {
	font-size: 12px;
	color: var(--text-sub);
}

.close-btn {
	background: none;
	border: none;
	color: var(--text-sub);
	cursor: pointer;
	padding: 4px;
	border-radius: 50%;
	transition: all 0.2s;
}

.close-btn:hover {
	background: rgba(255, 255, 255, 0.1);
	color: var(--text-main);
}

.chat-body {
	flex: 1;
	overflow-y: auto;
	padding: 24px;
	display: flex;
	flex-direction: column;
	gap: 16px;
}

.welcome-chat {
	text-align: center;
	padding: 40px 20px;
}

.bot-icon {
	width: 64px;
	height: 64px;
	background: var(--accent);
	color: white;
	border-radius: 20px;
	display: flex;
	align-items: center;
	justify-content: center;
	margin: 0 auto 20px;
	box-shadow: 0 10px 20px rgba(139, 92, 246, 0.3);
}

.welcome-chat h2 {
	font-size: 20px;
	margin-bottom: 12px;
}

.welcome-chat p {
	color: var(--text-sub);
	font-size: 14px;
	margin-bottom: 24px;
}

.quick-prompts {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
	justify-content: center;
}

.quick-prompts button {
	background: var(--bg-main);
	border: 1px solid var(--border);
	padding: 8px 16px;
	border-radius: 99px;
	font-size: 13px;
	cursor: pointer;
	transition: all 0.2s;
}

.quick-prompts button:hover {
	border-color: var(--accent);
	background: rgba(139, 92, 246, 0.1);
}

.chat-msg {
	display: flex;
	margin-bottom: 8px;
}

.chat-msg.user {
	justify-content: flex-end;
}

.msg-bubble {
	max-width: 80%;
	padding: 12px 16px;
	border-radius: 18px;
	font-size: 14px;
	line-height: 1.5;
}

.user .msg-bubble {
	background: var(--primary);
	color: white;
	border-bottom-right-radius: 4px;
}

.assistant .msg-bubble {
	background: var(--bg-main);
	border: 1px solid var(--border);
	border-bottom-left-radius: 4px;
}

.typing {
	display: flex;
	gap: 4px;
	padding: 12px 20px;
}

.typing .dot {
	width: 6px;
	height: 6px;
	background: var(--text-sub);
	border-radius: 50%;
	animation: bounce 1.4s infinite ease-in-out both;
}

.typing .dot:nth-child(1) {
	animation-delay: -0.32s;
}

.typing .dot:nth-child(2) {
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

.chat-footer {
	padding: 16px;
	background: var(--bg-main);
	border-top: 1px solid var(--border);
	display: flex;
	gap: 12px;
}

.chat-footer input {
	flex: 1;
	background: var(--bg-card);
	border: 1px solid var(--border);
	border-radius: 12px;
	padding: 10px 16px;
	color: var(--text-main);
	outline: none;
}

.chat-footer input:focus {
	border-color: var(--accent);
}

.chat-footer button {
	width: 42px;
	height: 42px;
	border-radius: 12px;
	background: var(--accent);
	border: none;
	color: white;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	transition: all 0.2s;
}

.chat-footer button:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}

.text-primary {
	color: var(--primary-500);
}

.greet-text p {
	color: var(--text-sub);
	font-size: 14px;
	margin: 4px 0 0;
}

.top-actions {
	display: flex;
	align-items: center;
	gap: 12px;
}

.pill {
	padding: 6px 14px;
	background: var(--bg-card);
	border: 1px solid var(--border);
	border-radius: 99px;
	font-size: 13px;
	font-weight: 600;
	display: flex;
	align-items: center;
	gap: 8px;
}

.pill-glow {
	color: var(--primary-500);
	border-color: rgba(var(--primary-rgb), 0.2);
}

.dot {
	width: 6px;
	height: 6px;
	background: currentColor;
	border-radius: 50%;
	animation: pulse 2s infinite;
}

@keyframes pulse {
	0% {
		transform: scale(0.9);
		opacity: 0.7;
	}
	50% {
		transform: scale(1.2);
		opacity: 1;
	}
	100% {
		transform: scale(0.9);
		opacity: 0.7;
	}
}

.goal-banner {
	background: var(--gradient-primary);
	border-radius: 24px;
	padding: 24px 32px;
	color: #ffffff;
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 32px;
}
.banner-title {
	display: flex;
	align-items: center;
	gap: 8px;
	font-weight: 700;
	text-transform: uppercase;
	letter-spacing: 1px;
	font-size: 12px;
	margin-bottom: 8px;
}

.ai-helper-promo {
	background: var(--bg-card);
	border: 2px solid rgba(139, 92, 246, 0.3);
	border-radius: 20px;
	padding: 24px;
	margin-bottom: 32px;
	position: relative;
	overflow: hidden;
}
.ai-helper-promo::before {
	content: "";
	position: absolute;
	top: -50%;
	left: -50%;
	width: 200%;
	height: 200%;
	background: radial-gradient(
		circle,
		rgba(139, 92, 246, 0.05) 0%,
		transparent 70%
	);
	pointer-events: none;
}
.promo-content {
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 24px;
}
.promo-text h3 {
	margin: 0 0 4px;
	font-size: 18px;
	font-weight: 700;
}
.promo-text p {
	margin: 0;
	color: var(--text-sub);
	font-size: 14px;
}
.btn-glow {
	box-shadow: 0 0 15px rgba(139, 92, 246, 0.4);
	border: none;
	padding: 12px 24px;
}
.btn-glow:hover {
	box-shadow: 0 0 25px rgba(139, 92, 246, 0.6);
	transform: translateY(-2px);
}

.icon-zap {
	color: #fbbf24;
}

.banner-content p {
	font-size: 16px;
	margin: 0;
	opacity: 0.95;
}

.banner-right {
	display: flex;
	align-items: center;
	gap: 16px;
}

.bot-bubble {
	background: rgba(0, 0, 0, 0.2);
	padding: 10px 16px;
	border-radius: 16px;
	font-size: 13px;
	max-width: 260px;
	line-height: 1.4;
}

.bot-emoji {
	font-size: 32px;
}

.main-layout {
	display: grid;
	grid-template-columns: 1fr 320px;
	gap: 32px;
}

.card {
	background: var(--bg-card);
	border-radius: 24px;
	padding: 32px;
	border: 1px solid var(--border);
	box-shadow: var(--shadow);
	margin-bottom: 24px;
}

.card-title {
	font-size: 18px;
	font-weight: 700;
	margin: 0 0 24px;
}

.section-group {
	margin-bottom: 40px;
}
.section-head {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20px;
}

.mission-layout {
	display: flex;
	gap: 48px;
}

.mission-circle-box {
	flex-shrink: 0;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 16px;
}

.circle-wrap {
	width: 150px;
	height: 150px;
	position: relative;
}

.circle-wrap svg {
	transform: rotate(-90deg);
	width: 100%;
	height: 100%;
}

.circle-bg {
	fill: none;
	stroke: var(--bg-main);
	stroke-width: 8;
}

.circle-fill {
	fill: none;
	stroke: var(--primary-500);
	stroke-width: 8;
	stroke-linecap: round;
	transition: stroke-dashoffset 0.8s ease;
}

.circle-content {
	position: absolute;
	inset: 0;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
}

.circle-content .pct {
	font-size: 28px;
	font-weight: 800;
	line-height: 1;
}

.circle-content .lbl {
	font-size: 10px;
	text-transform: uppercase;
	color: var(--text-sub);
	margin-top: 4px;
}

.date-lbl {
	display: flex;
	align-items: center;
	gap: 6px;
	font-size: 11px;
	color: var(--text-sub);
	background: var(--bg-main);
	padding: 4px 12px;
	border-radius: 99px;
}

.mission-details {
	flex: 1;
}
.detail-group h3 {
	font-size: 15px;
	margin: 0 0 16px;
	color: var(--text-main);
}
.stat-line {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 12px;
	font-size: 14px;
}
.stat-line span {
	display: flex;
	align-items: center;
	gap: 8px;
	color: var(--text-sub);
}
.stat-sub {
	font-size: 12px;
	color: var(--text-sub);
	margin: -8px 0 16px 24px;
}

.skills-grid {
	display: flex;
	flex-direction: column;
	gap: 12px;
	margin: 24px 0;
}
.skill-info {
	display: flex;
	justify-content: space-between;
	font-size: 13px;
	font-weight: 600;
	margin-bottom: 6px;
}
.bar-track {
	height: 6px;
	background: var(--bg-main);
	border-radius: 3px;
	overflow: hidden;
}
.bar-fill {
	height: 100%;
	border-radius: 3px;
	transition: width 0.6s ease;
}

.mission-footer {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-top: 24px;
	padding-top: 24px;
	border-top: 1px dotted var(--border);
}

.mission-footer p {
	font-size: 14px;
	color: var(--text-sub);
	margin: 0;
}

.btn-primary {
	background: var(--primary);
	color: #fff;
	border: none;
	padding: 10px 24px;
	border-radius: 12px;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.2s;
}
.btn-primary:hover {
	transform: translateY(-2px);
	box-shadow: var(--shadow-glow);
}

.course-grid {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 20px;
}
.course-card {
	background: var(--bg-card);
	border-radius: 20px;
	overflow: hidden;
	border: 1px solid var(--border);
	cursor: pointer;
	transition: all 0.2s;
}
.course-card:hover {
	transform: translateY(-4px);
	box-shadow: var(--shadow);
}

.course-thumb {
	height: 120px;
	display: flex;
	align-items: center;
	justify-content: center;
	position: relative;
}

.course-badge {
	position: absolute;
	top: 12px;
	left: 12px;
	font-size: 10px;
	font-weight: 700;
	padding: 4px 10px;
	border-radius: 8px;
	color: #fff;
}

.bg-purple {
	background: #8b5cf6;
}
.bg-blue {
	background: #3b82f6;
}

.course-info {
	padding: 20px;
}
.course-info h3 {
	font-size: 16px;
	margin: 0 0 12px;
	font-weight: 700;
}

.course-prog {
	display: flex;
	align-items: center;
	gap: 10px;
	margin-bottom: 12px;
}
.mini-bar {
	flex: 1;
	height: 6px;
	background: var(--bg-main);
	border-radius: 3px;
	overflow: hidden;
}
.mini-fill {
	height: 100%;
	background: var(--primary);
}
.course-prog span {
	font-size: 11px;
	font-weight: 700;
	color: var(--text-sub);
}

.course-meta {
	display: flex;
	gap: 16px;
	font-size: 12px;
	color: var(--text-sub);
}
.course-meta span {
	display: flex;
	align-items: center;
	gap: 4px;
}

.quiz-list {
	display: flex;
	flex-direction: column;
	gap: 12px;
}
.quiz-item {
	background: var(--bg-card);
	padding: 16px;
	border-radius: 16px;
	border: 1px solid var(--border);
	display: flex;
	align-items: center;
	gap: 20px;
}

.quiz-icon {
	width: 50px;
	height: 50px;
	border-radius: 12px;
	display: flex;
	align-items: center;
	justify-content: center;
}
.quiz-content {
	flex: 1;
}
.quiz-content h3 {
	font-size: 15px;
	margin: 4px 0;
}
.quiz-content p {
	font-size: 12px;
	color: var(--text-sub);
	margin: 0;
}

.badge {
	font-size: 9px;
	font-weight: 700;
	text-transform: uppercase;
	padding: 2px 8px;
	border-radius: 6px;
}
.badge.done {
	background: rgba(34, 197, 94, 0.1);
	color: #22c55e;
}
.badge.doing {
	background: rgba(59, 130, 246, 0.1);
	color: #3b82f6;
}
.badge.new {
	background: rgba(99, 102, 241, 0.1);
	color: var(--primary);
}

.btn-outline {
	background: transparent;
	border: 1px solid var(--border);
	color: var(--primary);
	padding: 8px 16px;
	border-radius: 10px;
	font-size: 12px;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.2s;
}
.btn-outline:hover {
	background: var(--border);
}

.side-panel {
	padding: 24px;
}
.side-title {
	font-size: 13px;
	font-weight: 800;
	text-transform: uppercase;
	letter-spacing: 1px;
	color: var(--text-main);
	margin: 0 0 16px;
}
.dept-text {
	font-size: 11px;
	color: var(--text-sub);
	margin-bottom: 20px;
	font-weight: 600;
}
.cap-stats {
	display: flex;
	justify-content: space-between;
}
.cap-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 6px;
}
.cap-icon {
	width: 36px;
	height: 36px;
	border-radius: 10px;
	display: flex;
	align-items: center;
	justify-content: center;
}
.cap-icon.purple {
	background: rgba(168, 85, 247, 0.1);
	color: #a855f7;
}
.cap-icon.blue {
	background: rgba(59, 130, 246, 0.1);
	color: #3b82f6;
}
.cap-icon.green {
	background: rgba(16, 185, 129, 0.1);
	color: #10b981;
}
.cap-lbl {
	font-size: 10px;
	color: var(--text-sub);
}
.cap-val {
	font-size: 16px;
	font-weight: 700;
}

.summary-list {
	display: flex;
	flex-direction: column;
	gap: 12px;
}
.summary-item {
	display: flex;
	justify-content: space-between;
	font-size: 13px;
	font-weight: 500;
}
.s-lbl {
	color: var(--text-sub);
}
.s-val {
	font-weight: 700;
}

.panel-head {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 16px;
}
.notif-count {
	background: var(--bg-main);
	font-size: 10px;
	font-weight: 700;
	padding: 2px 8px;
	border-radius: 6px;
}

.msg-list {
	display: flex;
	flex-direction: column;
	gap: 10px;
}
.msg-card {
	display: flex;
	gap: 12px;
	padding: 10px;
	border-radius: 12px;
	background: var(--bg-main);
}
.msg-card.unread {
	border-left: 3px solid var(--primary);
}
.msg-icon {
	color: var(--text-sub);
	margin-top: 2px;
}
.msg-body p {
	font-size: 12px;
	margin: 0;
	line-height: 1.4;
	color: var(--text-main);
}
.msg-body span {
	font-size: 10px;
	color: var(--text-sub);
}

.btn-soft {
	width: 100%;
	border: none;
	background: rgba(99, 102, 241, 0.05);
	color: var(--primary);
	padding: 10px;
	border-radius: 10px;
	margin-top: 16px;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.2s;
}
.btn-soft:hover {
	background: rgba(99, 102, 241, 0.1);
}

.badge-row {
	display: flex;
	gap: 12px;
}
.badge-box {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 6px;
}
.b-icon {
	width: 44px;
	height: 44px;
	background: var(--bg-main);
	border-radius: 12px;
	display: flex;
	align-items: center;
	justify-content: center;
	color: var(--text-sub);
}
.badge-box span {
	font-size: 9px;
	color: var(--text-sub);
	font-weight: 600;
	text-align: center;
}

.cert-list {
	display: flex;
	flex-direction: column;
	gap: 12px;
}
.cert-item-mini {
	display: flex;
	gap: 10px;
	align-items: flex-start;
}
.c-info p {
	font-size: 12px;
	margin: 0;
	font-weight: 600;
	line-height: 1.3;
}
.c-info span {
	font-size: 10px;
	color: var(--text-sub);
}

.link-btn,
.link-btn-sm {
	background: none;
	border: none;
	color: var(--text-sub);
	font-weight: 600;
	cursor: pointer;
}
.link-btn {
	font-size: 13px;
}
.link-btn-sm {
	font-size: 11px;
}

.dash-loading-screen {
	height: 100vh;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 16px;
}
.spinner {
	width: 40px;
	height: 40px;
	border: 4px solid var(--border);
	border-top-color: var(--primary);
	border-radius: 50%;
	animation: spin 0.8s linear infinite;
}
@keyframes spin {
	to {
		transform: rotate(360deg);
	}
}

@media (max-width: 1024px) {
	.main-layout {
		grid-template-columns: 1fr;
	}
	.side-col {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 24px;
	}
}

@media (max-width: 768px) {
	.dash {
		padding: 16px;
	}
	.card {
		padding: 20px;
	}
	.side-panel {
		padding: 20px;
	}
	.top-bar {
		flex-direction: column;
		align-items: flex-start;
		gap: 16px;
		margin-bottom: 24px;
	}
	.top-actions {
		width: 100%;
		display: flex;
		justify-content: flex-start;
	}
	.goal-banner {
		flex-direction: column;
		gap: 20px;
		padding: 20px;
		text-align: center;
		margin-bottom: 24px;
	}
	.banner-content {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.banner-title {
		justify-content: center;
	}
	.banner-right {
		width: 100%;
		justify-content: center;
	}
	.bot-bubble {
		max-width: 100%;
		text-align: center;
	}
	.side-col {
		grid-template-columns: 1fr;
	}
	.mission-layout {
		flex-direction: column;
		gap: 24px;
		align-items: center;
	}
	.mission-details {
		width: 100%;
	}
	.stat-line {
		flex-direction: column;
		align-items: flex-start;
		gap: 4px;
	}
	.stat-sub {
		margin-left: 0;
	}
	.mission-footer {
		flex-direction: column;
		gap: 16px;
		align-items: stretch;
		text-align: center;
	}
	.btn-primary {
		width: 100%;
	}
	.circle-wrap {
		width: 180px;
		height: 180px;
	}
	.circle-content .pct {
		font-size: 36px;
	}
	.circle-content .lbl {
		font-size: 12px;
	}
	.course-grid {
		grid-template-columns: 1fr;
	}
	.course-info {
		padding: 16px;
	}
	.quiz-item {
		flex-direction: column;
		align-items: flex-start;
		gap: 12px;
	}
	.quiz-item button {
		width: 100%;
	}
	.badge-row {
		flex-wrap: wrap;
	}
	.ai-chat-panel {
		height: 90vh;
		border-radius: 16px;
	}
}
</style>
