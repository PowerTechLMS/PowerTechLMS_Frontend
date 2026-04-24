import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { useAuthStore } from "@/stores/auth";

class AdminAiHub {
	constructor() {
		this.connection = null;
		this.progressCallbacks = [];
	}

	start() {
		const authStore = useAuthStore();
		if (this.connection) return;

		const hubUrl = `${import.meta.env.VITE_API_URL || ""}/hubs/ai`;

		this.connection = new HubConnectionBuilder()
			.withUrl(hubUrl, {
				accessTokenFactory: () => authStore.token,
			})
			.configureLogging(LogLevel.Information)
			.withAutomaticReconnect()
			.build();

		this.connection.on("OnAiProgress", (progress) => {
			this.progressCallbacks.forEach((cb) => cb(progress));
		});

		this.connection.start().catch(() => {});
	}

	async joinThread(threadId) {
		if (this.connection) {
			await this.connection.invoke("JoinThread", threadId);
		}
	}

	onProgress(callback) {
		this.progressCallbacks.push(callback);
		return () => {
			this.progressCallbacks = this.progressCallbacks.filter(
				(cb) => cb !== callback,
			);
		};
	}

	stop() {
		if (this.connection) {
			this.connection.stop();
			this.connection = null;
		}
	}
}

export default new AdminAiHub();
