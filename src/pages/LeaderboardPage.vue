<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import DataTable from "datatables.net-vue3";
import DataTablesLib from "datatables.net";
import { leaderboardAPI } from "@/services/api";
import { Trophy, Medal, Star, Award, Crown } from "lucide-vue-next";

DataTable.use(DataTablesLib);

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

const fetchLeaderboard = async () => {
	loading.value = true;
	try {
		const response = await leaderboardAPI.get(50);
		leaderboardData.value = response.data;
	} catch {
	} finally {
		loading.value = false;
	}
};

onMounted(() => {
	fetchLeaderboard();
});

const getAvatarStyle = (url: string | null) => {
	if (url) {
		const base = url.startsWith("http")
			? url
			: `${import.meta.env.VITE_API_URL || "http://localhost:5100"}${url}`;
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
	if (leaderboardData.value.length > 0) result.top1 = leaderboardData.value[0];
	if (leaderboardData.value.length > 1) result.top2 = leaderboardData.value[1];
	if (leaderboardData.value.length > 2) result.top3 = leaderboardData.value[2];
	return result;
});

const tableData = computed(() => {
	if (leaderboardData.value.length <= 3) return [];

	const others = leaderboardData.value.slice(3);
	return others.map((user) => {
		const rankBadge = `<div class="rank-badge-glass text-secondary fw-800">Hạng ${user.rank}</div>`;

		const avatarHtml = user.avatar
			? `<div class="avatar-glass minic shadow-sm me-3" style="${getAvatarStyle(user.avatar)}"></div>`
			: `<div class="avatar-glass minic shadow-sm me-3 bg-gradient-primary text-white">${getInitials(user.userName)}</div>`;

		const userHtml = `<div class="d-flex align-items-center">${avatarHtml}<span class="fw-700 text-dark fs-15">${user.userName}</span></div>`;

		const badgesHtml =
			`<div class="d-flex gap-2 flex-wrap">` +
			user.badges
				.map(
					(b) =>
						`<div class="badge-glass-soft shadow-sm px-2 py-1 d-flex align-items-center"><img src="${b.iconUrl}" style="height:14px;" class="me-1" v-if="${!!b.iconUrl}"/><span class="fw-600 fs-12 text-secondary">${b.name}</span></div>`,
				)
				.join("") +
			`</div>`;

		const completedHtml = `<div class="text-center"><div class="badge-glass primary text-primary fw-800 px-3 py-1">${user.completedCourses}</div></div>`;

		const scoreHtml = `<div class="text-center"><div class="score-emerald-text fw-900 fs-16"><i class="fa fa-star text-warning me-1"></i>${user.totalScore.toLocaleString()}</div></div>`;

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
			<h3 class="fw-800 text-dark">Bảng xếp hạng đang trống</h3>
			<p class="text-secondary">
				Chưa có đủ dữ liệu học tập để xếp hạng lúc này.
			</p>
		</div>

		<template v-else>
			<div class="podium-wrapper mb-5 mt-4">
				<div class="row gx-4 align-items-end justify-content-center">
					<div class="col-md-3" v-if="top3.top2">
						<div class="podium-card silver-glow text-center p-4">
							<div class="rank-crown silver"><Medal :size="24" /></div>
							<div
								class="avatar-glass lg mx-auto shadow-sm mb-3"
								:style="getAvatarStyle(top3.top2.avatar)"
								:class="{ 'bg-gradient-silver': !top3.top2.avatar }"
							>
								{{ !top3.top2.avatar ? getInitials(top3.top2.userName) : "" }}
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
									<span class="fw-800 text-dark">{{
										top3.top2.completedCourses
									}}</span>
								</div>
								<div class="stat-mini">
									<span class="d-block fs-11 text-secondary fw-700"
										>ĐIỂM SỐ</span
									>
									<span class="fw-800 text-silver">{{
										top3.top2.totalScore.toLocaleString()
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
							<div class="rank-crown gold"><Crown :size="36" /></div>
							<div
								class="avatar-glass xl mx-auto shadow-md mb-3"
								:style="getAvatarStyle(top3.top1.avatar)"
								:class="{ 'bg-gradient-gold': !top3.top1.avatar }"
							>
								{{ !top3.top1.avatar ? getInitials(top3.top1.userName) : "" }}
							</div>
							<h4
								class="fw-900 text-dark mb-1 text-truncate"
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
									<span class="fw-900 fs-18 text-dark">{{
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
										{{ top3.top1.totalScore.toLocaleString() }}</span
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
							<div class="rank-crown bronze"><Medal :size="24" /></div>
							<div
								class="avatar-glass lg mx-auto shadow-sm mb-3"
								:style="getAvatarStyle(top3.top3.avatar)"
								:class="{ 'bg-gradient-bronze': !top3.top3.avatar }"
							>
								{{ !top3.top3.avatar ? getInitials(top3.top3.userName) : "" }}
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
									<span class="fw-800 text-dark">{{
										top3.top3.completedCourses
									}}</span>
								</div>
								<div class="stat-mini">
									<span class="d-block fs-11 text-secondary fw-700"
										>ĐIỂM SỐ</span
									>
									<span class="fw-800 text-bronze">{{
										top3.top3.totalScore.toLocaleString()
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
					<h5 class="fw-800 text-dark mb-0 d-flex align-items-center gap-2">
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
	background: #f8fafc;
	color: #1e293b;
	font-family: "Inter", sans-serif;
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
	background: linear-gradient(90deg, #1e293b, #4f46e5);
	background-clip: text;
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	margin: 0;
	letter-spacing: -0.5px;
}
.desc-text {
	color: #64748b;
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
:deep(.badge-glass.warning) {
	background: linear-gradient(
		135deg,
		rgba(253, 230, 138, 0.5),
		rgba(252, 211, 77, 0.5)
	);
	border-color: rgba(245, 158, 11, 0.3);
}

.glass-panel {
	background: rgba(255, 255, 255, 0.85);
	backdrop-filter: blur(12px);
	border-radius: 24px;
	border: 1px solid white;
	box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.05);
}

.podium-wrapper {
	position: relative;
}
.podium-card {
	background: rgba(255, 255, 255, 0.9);
	backdrop-filter: blur(10px);
	border-radius: 24px;
	border: 1px solid white;
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
	background: linear-gradient(to bottom, #ffffff, #fffbeb);
}
.silver-glow {
	box-shadow: 0 15px 30px -5px rgba(148, 163, 184, 0.25);
	border: 1px solid rgba(148, 163, 184, 0.3);
	background: linear-gradient(to bottom, #ffffff, #f8fafc);
}
.bronze-glow {
	box-shadow: 0 15px 30px -5px rgba(180, 83, 9, 0.2);
	border: 1px solid rgba(180, 83, 9, 0.2);
	background: linear-gradient(to bottom, #ffffff, #fff7ed);
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
	background: white;
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

:deep(.text-gold) {
	color: #d97706;
}
:deep(.text-silver) {
	color: #64748b;
}
:deep(.text-bronze) {
	color: #c2410c;
}

:deep(.avatar-glass) {
	display: flex;
	align-items: center;
	justify-content: center;
	background: #f8fafc;
	font-weight: 800;
	color: white;
	overflow: hidden;
	border: 3px solid white;
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
	border: 2px solid white;
	box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

:deep(.bg-gradient-gold) {
	background: linear-gradient(135deg, #fcd34d, #f59e0b) !important;
}
:deep(.bg-gradient-silver) {
	background: linear-gradient(135deg, #cbd5e1, #94a3b8) !important;
}
:deep(.bg-gradient-bronze) {
	background: linear-gradient(135deg, #fdba74, #ea580c) !important;
}
:deep(.bg-gradient-primary) {
	background: linear-gradient(135deg, #818cf8, #4f46e5) !important;
}

:deep(.badge-glass.gold) {
	background: rgba(245, 158, 11, 0.15);
	color: #d97706;
	border-color: rgba(245, 158, 11, 0.3);
}
:deep(.badge-glass.silver) {
	background: rgba(148, 163, 184, 0.15);
	color: #64748b;
	border-color: rgba(148, 163, 184, 0.3);
}
:deep(.badge-glass.bronze) {
	background: rgba(234, 88, 12, 0.1);
	color: #c2410c;
	border-color: rgba(234, 88, 12, 0.2);
}

.divider-v {
	width: 1px;
	background: #e2e8f0;
	align-self: stretch;
	margin: 0 5px;
}
.flex-center {
	display: flex;
	align-items: center;
	justify-content: center;
}
.fill-warning {
	fill: #f59e0b;
}

:deep(.badge-glass-soft) {
	background: rgba(255, 255, 255, 0.8);
	border: 1px solid #f1f5f9;
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
	background: #f8fafc;
	border: 1px solid #e2e8f0;
	border-radius: 8px;
	padding: 4px 10px;
	font-size: 14px;
}

.loading-state-luxe,
.empty-state-premium {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	text-align: center;
}
.luxe-spinner {
	width: 40px;
	height: 40px;
	border: 4px solid rgba(79, 70, 229, 0.2);
	border-top-color: #4f46e5;
	border-radius: 50%;
	animation: spin 1s linear infinite;
}
@keyframes spin {
	100% {
		transform: rotate(360deg);
	}
}
.empty-icon-glass {
	width: 90px;
	height: 90px;
	border-radius: 50%;
	background: linear-gradient(
		135deg,
		rgba(79, 70, 229, 0.05),
		rgba(79, 70, 229, 0.02)
	);
	border: 1px solid rgba(79, 70, 229, 0.1);
	display: flex;
	align-items: center;
	justify-content: center;
}

:deep(.dt-container) {
	font-family: "Inter", system-ui, sans-serif;
	padding: 0;
	color: #1e293b;
}
:deep(.dt-layout-row) {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20px;
}
:deep(.dt-layout-row:last-child) {
	margin-bottom: 0;
	margin-top: 20px;
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
	color: #94a3b8;
	font-size: 11px;
	font-weight: 800;
	text-transform: uppercase;
	letter-spacing: 0.5px;
	padding: 10px 20px;
	border: none;
	text-align: left;
}
:deep(table.dataTable.luxe-table thead th.text-center) {
	text-align: center !important;
}
:deep(table.dataTable.luxe-table tbody td) {
	padding: 16px 20px;
	background: white;
	border-bottom: none;
	border-top: 1px solid #f8fafc;
	border-bottom: 1px solid #f8fafc;
	font-size: 14px;
	transition: 0.3s;
	vertical-align: middle;
}
:deep(table.dataTable.luxe-table tbody tr:hover td) {
	background: #f8fafc;
}
:deep(table.dataTable.luxe-table tbody td:first-child) {
	border-radius: 16px 0 0 16px;
	border-left: 1px solid #f8fafc;
}
:deep(table.dataTable.luxe-table tbody td:last-child) {
	border-radius: 0 16px 16px 0;
	border-right: 1px solid #f8fafc;
}

:deep(.dt-search input),
:deep(.dt-length select) {
	border: 1px solid #e2e8f0;
	border-radius: 12px;
	padding: 10px 16px;
	outline: none;
	font-size: 14px;
	font-weight: 600;
	background: #f8fafc;
	transition: 0.3s;
	color: #1e293b;
}
:deep(.dt-search input:focus),
:deep(.dt-length select:focus) {
	border-color: #4f46e5;
	background: white;
	box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
}
:deep(.dt-search input) {
	width: 300px;
	padding-left: 40px;
	background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='11' cy='11' r='8'%3E%3C/circle%3E%3Cline x1='21' y1='21' x2='16.65' y2='16.65'%3E%3C/line%3E%3C/svg%3E");
	background-repeat: no-repeat;
	background-position: 12px center;
}

:deep(.dt-paging .dt-paging-button) {
	padding: 8px 14px !important;
	border-radius: 10px !important;
	border: 1px solid transparent !important;
	background: transparent !important;
	color: #64748b !important;
	font-weight: 600;
	cursor: pointer;
	margin: 0 2px;
	transition: 0.3s;
}
:deep(.dt-paging .dt-paging-button:hover:not(.current):not(.disabled)) {
	background: #f1f5f9 !important;
	color: #1e293b !important;
}
:deep(.dt-paging .dt-paging-button.current) {
	background: linear-gradient(to bottom, #6366f1, #4f46e5) !important;
	color: white !important;
	box-shadow: 0 4px 10px rgba(79, 70, 229, 0.3);
	border: none !important;
}
:deep(.dt-paging .dt-paging-button.disabled) {
	color: #cbd5e1 !important;
	cursor: not-allowed;
}
</style>
