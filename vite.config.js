import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
	plugins: [vue()],
	server: {
		port: 5173,
		proxy: {
			"/api": {
				target: "http://127.0.0.1:5100",
				changeOrigin: true,
				timeout: 600000,
				proxyTimeout: 600000,
			},
			"/uploads": {
				target: "http://127.0.0.1:5100",
				changeOrigin: true,
			},
			"/hubs": {
				target: "http://127.0.0.1:5100",
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
});
