import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "");
	const target = env.VITE_API_URL || "http://127.0.0.1:5100";

	return {
		plugins: [vue()],
		server: {
			port: 5173,
			host: true,
			hmr: {
				host: "banhcauba.com",
			},
			proxy: {
				"/api": {
					target: target,
					changeOrigin: true,
					timeout: 600000,
					proxyTimeout: 600000,
				},
				"/uploads": {
					target: target,
					changeOrigin: true,
				},
				"/hubs": {
					target: target,
					changeOrigin: true,
					ws: true,
				},
			},
		},
		resolve: {
			alias: {
				"@": "/src",
			},
		},
	};
});
