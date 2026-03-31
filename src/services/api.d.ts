/*
 * Type stubs for @/services/api – allows TypeScript/VS Code to resolve the module
 * This fixes "Cannot find module '@/services/api'" errors without converting to TS
 */

declare module "@/services/api" {
	const authAPI: any;
	const userAPI: any;
	const courseAPI: any;
	const moduleAPI: any;
	const lessonAPI: any;
	const enrollmentAPI: any;
	const progressAPI: any;
	const quizAPI: any;
	const certificateAPI: any;
	const qaAPI: any;
	const noteAPI: any;
	const leaderboardAPI: any;
	const documentAPI: any;
	const reportAPI: any;
	const userGroupAPI: any;
	const rbacAPI: any;
	const dashboardAPI: any;
	const notificationAPI: any;
	const courseGroupAPI: any;
	export {
		authAPI,
		userAPI,
		courseAPI,
		moduleAPI,
		lessonAPI,
		enrollmentAPI,
		progressAPI,
		quizAPI,
		certificateAPI,
		qaAPI,
		noteAPI,
		leaderboardAPI,
		documentAPI,
		reportAPI,
		userGroupAPI,
		rbacAPI,
		dashboardAPI,
		notificationAPI,
		courseGroupAPI,
	};
}

declare module "@/components/ImportQuizModal.vue" {
	import type { DefineComponent } from "vue";
	const component: DefineComponent<
		Record<string, unknown>,
		Record<string, unknown>,
		any
	>;
	export default component;
}
