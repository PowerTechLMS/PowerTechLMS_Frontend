<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import DataTable from "datatables.net-vue3";
import DataTablesLib from "datatables.net";
import { leaderboardAPI } from "@/services/api";
import { Trophy, Medal, Star, Award, Crown } from "lucide-vue-next";

DataTable.use(DataTablesLib);

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5100";

const getFullAvatarUrl = (url: string | null) => {
	if (!url) return "";
	const sUrl = String(url);
	return sUrl.startsWith("http") ? sUrl : `${API_BASE}${sUrl}`;
};

interface UserRank {
	rank: number;
	userName: string;
	avatar: string | null;
	completedCourses: number;
	totalScore: number;
	badges: any[];
}

const leaderboardData = ref<UserRank[]>([]);
const loading = ref(true);
const avatarErrors = ref<Record<string, boolean>>({});

const handleAvatarError = (userId: string | number) => {
	avatarErrors.value[userId] = true;
};

const fetchLeaderboard = async () => {
	loading.value = true;
	try {
		const response = await leaderboardAPI.get(50);
		leaderboardData.value = response.data || [];
	} catch {
		leaderboardData.value = [];
	} finally {
		loading.value = false;
	}
};

onMounted(() => {
	fetchLeaderboard();
});

const getAvatarStyle = (url: string | null) => {
	if (url) {
		const base = getFullAvatarUrl(url);
		return `background-image: url('${base}'); background-size: cover; background-position: center;`;
	}
	return "";
};

const getInitials = (name: string) =>
	name ? name.charAt(0).toUpperCase() : "?";

const top3 = computed(() => {
	const result = {
		top1: null as UserRank | null,
		top2: null as UserRank | null,
		top3: null as UserRank | null,
	};
	const data = leaderboardData.value;
	if (data.length > 0) result.top1 = data[0];
	if (data.length > 1) result.top2 = data[1];
	if (data.length > 2) result.top3 = data[2];
	return result;
});

const tableData = computed(() => {
	const data = leaderboardData.value;
	if (data.length <= 3) return [];

	const others = data.slice(3);
	return others.map((user) => {
		const rankBadge = `<div class="rank-badge-glass text-secondary fw-800">Hạng ${user.rank}</div>`;

		const avatarHtml = user.avatar
			? `<div class="avatar-glass minic shadow-sm me-3" style="${getAvatarStyle(user.avatar)}"></div>`
			: `<div class="avatar-glass minic shadow-sm me-3 bg-gradient-primary text-white">${getInitials(user.userName)}</div>`;

		const userHtml = `<div class="d-flex align-items-center">${avatarHtml}<span class="fw-700 fs-15">${user.userName}</span></div>`;

		const badgesHtml =
			`<div class="d-flex gap-2 flex-wrap">` +
			(user.badges || [])
				.map(
					(b) =>
						`<div class="badge-glass-soft shadow-sm px-2 py-1 d-flex align-items-center">${
							b.iconUrl
								? `<img src="${b.iconUrl}" style="height:14px;" class="me-1" />`
								: ""
						}<span class="fw-600 fs-12 text-secondary">${b.name || ""}</span></div>`,
				)
				.join("") +
			`</div>`;

		const completedHtml = `<div class="text-center"><div class="badge-glass primary text-primary fw-800 px-3 py-1">${user.completedCourses || 0}</div></div>`;

		const scoreHtml = `<div class="text-center"><div class="score-emerald-text fw-900 fs-16"><i class="fa fa-star text-warning me-1"></i>${(user.totalScore || 0).toLocaleString()}</div></div>`;

		return [
			`<div class="text-center">${rankBadge}</div>`,
			userHtml,
			badgesHtml,
			completedHtml,
			scoreHtml,
		];
	});
});
</script>

<template>
	<div class="leaderboard-page p-4">
		<div class="page-header-premium mb-5">
			<div class="header-inner">
				<div class="header-icon-box pulse-glow">
					<Trophy :size="32" class="animated-icon text-primary" />
				</div>
				<div class="header-info">
					<div class="d-flex align-items-center gap-2 mb-1">
						<span class="badge-glass primary text-primary"
							>HỘI TRƯỜNG DANH VỌNG</span
						>
					</div>
					<h1 class="title-gradient">Bảng Vàng Thành Tích</h1>
					<p class="desc-text">
						Tôn vinh những cá nhân xuất sắc nhất trong phong trào học tập và
						phát triển nghiệp vụ.
					</p>
				</div>
			</div>
		</div>

		<div class="text-center py-5" v-if="loading">
			<div class="luxe-spinner mx-auto mb-3"></div>
			<p class="text-secondary fw-600">Đang tổng hợp thông tin xếp hạng...</p>
		</div>

		<div
			v-else-if="leaderboardData.length === 0"
			class="empty-state-premium py-5 mt-4"
		>
			<div class="empty-icon-glass shadow-sm mb-4">
				<Award :size="48" class="text-primary opacity-50" />
			</div>
			<h3 class="fw-800">Bảng xếp hạng đang trống</h3>

			<p class="text-secondary">
				Chưa có đủ dữ liệu học tập để xếp hạng lúc này.
			</p>
		</div>

		<template v-else>
			<div class="podium-wrapper mb-5 mt-4">
				<div class="row gx-4 align-items-end justify-content-center">
					<div class="col-md-3" v-if="top3.top2">
						<div class="podium-card silver-glow text-center p-4">
							<div class="rank-crown silver"><Medal :size="20" /></div>
							<div
								class="avatar-glass lg mx-auto shadow-sm mb-3 mt-3 overflow-hidden"
								:class="{ 'bg-gradient-silver': !top3.top2.avatar || avatarErrors[top3.top2.userName] }"
							>
								<img
									v-if="top3.top2.avatar && !avatarErrors[top3.top2.userName]"
									:src="getFullAvatarUrl(top3.top2.avatar)"
									@error="handleAvatarError(top3.top2.userName)"
									class="w-100 h-100 object-fit-cover"
								/>
								<span v-else>{{ getInitials(top3.top2.userName) }}</span>
							</div>
							<h5
								class="fw-800 text-dark mb-1 text-truncate"
								:title="top3.top2.userName"
							>
								{{ top3.top2.userName }}
							</h5>
							<div class="badge-glass silver text-silver mb-3">Á QUÂN 1</div>

							<div class="stats-row d-flex justify-content-center gap-3">
								<div class="stat-mini">
									<span class="d-block fs-11 text-secondary fw-700"
										>HOÀN THÀNH</span
									>
									<span class="fw-800">{{
										top3.top2.completedCourses
									}}</span>

								</div>
								<div class="stat-mini">
									<span class="d-block fs-11 text-secondary fw-700"
										>ĐIỂM SỐ</span
									>
									<span class="fw-800 text-silver">{{
										(top3.top2.totalScore || 0).toLocaleString()
									}}</span>
								</div>
							</div>
						</div>
					</div>

					<div class="col-md-4" v-if="top3.top1">
						<div
							class="podium-card gold-glow text-center p-4 pb-5 position-relative"
							style="z-index: 2"
						>
							<div class="rank-crown gold"><Crown :size="28" /></div>
							<div
								class="avatar-glass xl mx-auto shadow-md mb-3 mt-4 overflow-hidden"
								:class="{ 'bg-gradient-gold': !top3.top1.avatar || avatarErrors[top3.top1.userName] }"
							>
								<img
									v-if="top3.top1.avatar && !avatarErrors[top3.top1.userName]"
									:src="getFullAvatarUrl(top3.top1.avatar)"
									@error="handleAvatarError(top3.top1.userName)"
									class="w-100 h-100 object-fit-cover"
								/>
								<span v-else>{{ getInitials(top3.top1.userName) }}</span>
							</div>
							<h4
								class="fw-900 mb-1 text-truncate"
								:title="top3.top1.userName"
							>
								{{ top3.top1.userName }}
							</h4>
							<div class="badge-glass gold mb-4 fs-14 px-4 py-2">QUÁN QUÂN</div>

							<div class="stats-row d-flex justify-content-center gap-4">
								<div class="stat-mini">
									<span class="d-block fs-12 text-secondary fw-800"
										>HOÀN THÀNH</span
									>
									<span class="fw-900 fs-18">{{
										top3.top1.completedCourses
									}}</span>

								</div>
								<div class="divider-v"></div>
								<div class="stat-mini">
									<span class="d-block fs-12 text-secondary fw-800"
										>ĐIỂM SỐ</span
									>
									<span class="fw-900 fs-18 text-gold flex-center gap-1"
										><Star :size="16" class="text-warning fill-warning" />
										{{ (top3.top1.totalScore || 0).toLocaleString() }}</span
									>
								</div>
							</div>

							<div
								class="mt-4 pt-3 border-top border-light"
								v-if="top3.top1.badges && top3.top1.badges.length > 0"
							>
								<div class="d-flex gap-2 justify-content-center flex-wrap">
									<div
										v-for="b in top3.top1.badges.slice(0, 3)"
										:key="b.name"
										class="badge-glass-soft px-2 py-1 shadow-sm d-flex align-items-center"
									>
										<img
											:src="b.iconUrl"
											style="height: 14px"
											class="me-1"
											v-if="b.iconUrl"
										/>
										<span class="fw-700 fs-11 text-secondary">{{
											b.name
										}}</span>
									</div>
								</div>
							</div>
						</div>
					</div>

					<div class="col-md-3" v-if="top3.top3">
						<div class="podium-card bronze-glow text-center p-4">
							<div class="rank-crown bronze"><Medal :size="20" /></div>
							<div
								class="avatar-glass lg mx-auto shadow-sm mb-3 mt-3 overflow-hidden"
								:class="{ 'bg-gradient-bronze': !top3.top3.avatar || avatarErrors[top3.top3.userName] }"
							>
								<img
									v-if="top3.top3.avatar && !avatarErrors[top3.top3.userName]"
									:src="getFullAvatarUrl(top3.top3.avatar)"
									@error="handleAvatarError(top3.top3.userName)"
									class="w-100 h-100 object-fit-cover"
								/>
								<span v-else>{{ getInitials(top3.top3.userName) }}</span>
							</div>
							<h5
								class="fw-800 text-dark mb-1 text-truncate"
								:title="top3.top3.userName"
							>
								{{ top3.top3.userName }}
							</h5>
							<div class="badge-glass bronze text-bronze mb-3">Á QUÂN 2</div>

							<div class="stats-row d-flex justify-content-center gap-3">
								<div class="stat-mini">
									<span class="d-block fs-11 text-secondary fw-700"
										>HOÀN THÀNH</span
									>
									<span class="fw-800">{{
										top3.top3.completedCourses
									}}</span>

								</div>
								<div class="stat-mini">
									<span class="d-block fs-11 text-secondary fw-700"
										>ĐIỂM SỐ</span
									>
									<span class="fw-800 text-bronze">{{
										(top3.top3.totalScore || 0).toLocaleString()
									}}</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div class="glass-panel p-0 overflow-hidden" v-if="tableData.length > 0">
				<div
					class="panel-header-glass d-flex justify-content-between align-items-center p-4 border-bottom border-light"
				>
					<h5 class="fw-800 mb-0 d-flex align-items-center gap-2">
						Những gương mặt nổi bật khác
					</h5>
				</div>

				<div class="panel-body-glass p-4">
					<div class="table-responsive fix-overflow custom-dt-wrapper">
						<DataTable
							:data="tableData"
							id="leaderboardTable"
							class="display align-middle luxe-table"
							style="min-width: 900px; width: 100%"
							:options="{
								pageLength: 20,
								lengthMenu: [10, 20, 50, 100],
								ordering: false,
								language: {
									paginate: { next: '›', previous: '‹' },
									search: '',
									searchPlaceholder: 'Tìm nhân viên...',
									lengthMenu: 'Hiển thị _MENU_',
									info: 'Hiển thị _START_ - _END_ trên tổng _TOTAL_ nhân viên',
									infoEmpty: 'Hiển thị 0 - 0 trên tổng 0 nhân viên',
									emptyTable: 'Chưa có thông tin xếp hạng',
								},
							}"
						>
							<thead>
								<tr>
									<th class="text-center" style="width: 100px">THỨ HẠNG</th>
									<th>NHÂN VIÊN</th>
									<th>DANH HIỆU</th>
									<th class="text-center">KHÓA ĐÃ XONG</th>
									<th class="text-center">TỔNG ĐIỂM</th>
								</tr>
							</thead>
						</DataTable>
					</div>
				</div>
			</div>
		</template>
	</div>
</template>

<style scoped>
.leaderboard-page {
	min-height: 100vh;
	animation: fadeIn 0.5s ease-out;
	background: var(--bg-primary, #f8fafc);
	color: var(--text-primary, #1e293b);
	font-family: 'Inter', sans-serif;
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
	background: rgba(79, 70, 229, 0.1);
	color: #4f46e5;
	display: flex;
	align-items: center;
	justify-content: center;
	border: 1px solid rgba(79, 70, 229, 0.2);
}
.pulse-glow {
	animation: pulse 3s infinite;
}
@keyframes pulse {
	0% {
		box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.4);
	}
	70% {
		box-shadow: 0 0 0 10px rgba(79, 70, 229, 0);
	}
	100% {
		box-shadow: 0 0 0 0 rgba(79, 70, 229, 0);
	}
}
.title-gradient {
	font-size: 32px;
	font-weight: 900;
	background: linear-gradient(90deg, var(--text-primary), var(--primary-500));
	background-clip: text;
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	margin: 0;
	letter-spacing: -0.5px;
}

.desc-text {
	color: var(--text-secondary);
	margin-top: 4px;
	font-weight: 500;
}

:deep(.badge-glass) {
	padding: 4px 12px;
	border-radius: 20px;
	font-size: 11px;
	font-weight: 800;
	letter-spacing: 0.5px;
	display: inline-flex;
	align-items: center;
	border: 1px solid transparent;
}
:deep(.badge-glass.primary) {
	background: rgba(99, 102, 241, 0.1);
	color: #4f46e5;
	border-color: rgba(99, 102, 241, 0.2);
}

.glass-panel {
	background: var(--bg-secondary);
	backdrop-filter: blur(12px);
	border-radius: 24px;
	border: 1px solid var(--border-color);
	box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.05);
}

.podium-wrapper {
	position: relative;
}
.podium-card {
	background: var(--bg-secondary);
	backdrop-filter: blur(10px);
	border-radius: 24px;
	border: 1px solid var(--border-color);
	box-shadow: 0 15px 35px -10px rgba(0, 0, 0, 0.08);
	transition: 0.4s;
	position: relative;
}

.podium-card:hover {
	transform: translateY(-5px);
}

.gold-glow {
	margin-bottom: 20px;
	box-shadow: 0 20px 40px -5px rgba(245, 158, 11, 0.25);
	border: 2px solid rgba(245, 158, 11, 0.3);
}
.silver-glow {
	box-shadow: 0 15px 30px -5px rgba(148, 163, 184, 0.25);
	border: 1px solid rgba(148, 163, 184, 0.3);
}
.bronze-glow {
	box-shadow: 0 15px 30px -5px rgba(180, 83, 9, 0.2);
	border: 1px solid rgba(180, 83, 9, 0.2);
}

.rank-crown {
	position: absolute;
	top: -20px;
	left: 50%;
	transform: translateX(-50%);
	width: 44px;
	height: 44px;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 50%;
	background: var(--bg-secondary);
	box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}
.rank-crown.gold {
	width: 56px;
	height: 56px;
	top: -28px;
	color: #f59e0b;
	box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);
	border: 2px solid #fde68a;
}
.rank-crown.silver {
	color: #94a3b8;
	border: 2px solid #e2e8f0;
}
.rank-crown.bronze {
	color: #b45309;
	border: 2px solid #fed7aa;
}

:deep(.text-gold) { color: #d97706; }
:deep(.text-silver) { color: #64748b; }
:deep(.text-bronze) { color: #c2410c; }

:deep(.avatar-glass) {
	display: flex;
	align-items: center;
	justify-content: center;
	background: var(--bg-tertiary);
	font-weight: 800;
	color: white;
	overflow: hidden;
	border: 3px solid var(--border-color);
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
	flex-shrink: 0;
}
:deep(.avatar-glass.xl) {
	width: 90px;
	height: 90px;
	border-radius: 24px;
	font-size: 32px;
}
:deep(.avatar-glass.lg) {
	width: 70px;
	height: 70px;
	border-radius: 20px;
	font-size: 24px;
}
:deep(.avatar-glass.minic) {
	width: 44px;
	height: 44px;
	margin: 0;
	border-radius: 14px;
	font-size: 16px;
	border: 2px solid var(--border-color);
}

:deep(.bg-gradient-gold) { background: linear-gradient(135deg, #fcd34d, #f59e0b) !important; }
:deep(.bg-gradient-silver) { background: linear-gradient(135deg, #cbd5e1, #94a3b8) !important; }
:deep(.bg-gradient-bronze) { background: linear-gradient(135deg, #fdba74, #ea580c) !important; }
:deep(.bg-gradient-primary) { background: linear-gradient(135deg, #818cf8, #4f46e5) !important; }

:deep(.badge-glass.gold) {
	background: rgba(245, 158, 11, 0.15);
	color: #d97706;
	border-color: rgba(245, 158, 11, 0.3);
}

.divider-v {
	width: 1px;
	background: var(--border-color);
	align-self: stretch;
	margin: 0 5px;
}

:deep(.badge-glass-soft) {
	background: var(--bg-tertiary);
	border: 1px solid var(--border-color);
	border-radius: 8px;
}

:deep(.score-emerald-text) {
	background: linear-gradient(135deg, #0d9488, #059669);
	background-clip: text;
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
}
:deep(.rank-badge-glass) {
	display: inline-block;
	background: var(--bg-tertiary);
	border: 1px solid var(--border-color);
	border-radius: 8px;
	padding: 4px 10px;
	font-size: 14px;
}

.luxe-spinner {
	width: 40px;
	height: 40px;
	border: 4px solid rgba(79, 70, 229, 0.2);
	border-top-color: #4f46e5;
	border-radius: 50%;
	animation: spin 1s linear infinite;
}
@keyframes spin { 100% { transform: rotate(360deg); } }

:deep(.dt-container) {
	font-family: 'Inter', system-ui, sans-serif;
	padding: 0;
	color: var(--text-primary);
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
	color: var(--text-tertiary);
	font-size: 11px;
	font-weight: 800;
	text-transform: uppercase;
	letter-spacing: 0.5px;
	padding: 10px 20px;
	border: none;
}
:deep(table.dataTable.luxe-table tbody td) {
	padding: 16px 20px;
	background: var(--bg-secondary);
	border-bottom: 1px solid var(--border-color);
	border-top: 1px solid var(--border-color);
	font-size: 14px;
	transition: 0.3s;
	vertical-align: middle;
}
:deep(table.dataTable.luxe-table tbody tr:hover td) {
	background: var(--bg-tertiary);
}

:deep(table.dataTable.luxe-table tbody td:first-child) {
	border-radius: 16px 0 0 16px;
	border-left: 1px solid var(--border-color);
}
:deep(table.dataTable.luxe-table tbody td:last-child) {
	border-radius: 0 16px 16px 0;
	border-right: 1px solid var(--border-color);
}

:deep(.dt-search input),
:deep(.dt-length select) {
	border: 1px solid var(--border-color);
	border-radius: 12px;
	padding: 10px 16px;
	outline: none;
	font-size: 14px;
	font-weight: 600;
	background: var(--bg-tertiary);
	transition: 0.3s;
	color: var(--text-primary);
}

:deep(.dt-paging .dt-paging-button) {
	padding: 8px 14px !important;
	border-radius: 10px !important;
	border: 1px solid transparent !important;
	background: transparent !important;
	color: var(--text-secondary) !important;
	font-weight: 600;
	cursor: pointer;
	margin: 0 2px;
	transition: 0.3s;
}
:deep(.dt-paging .dt-paging-button.current) {
	background: linear-gradient(to bottom, #6366f1, #4f46e5) !important;
	color: white !important;
	box-shadow: 0 4px 10px rgba(79, 70, 229, 0.3);
}

/* Theme Adaptation */
:is([data-bs-theme="dark"], [data-theme="dark"]) .leaderboard-page {
	background: var(--bg-primary);
}
:is([data-bs-theme="dark"], [data-theme="dark"]) .podium-card {
	box-shadow: none;
}
</style>
