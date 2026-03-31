/// <reference types="vite/client" />

declare module "*.vue" {
	import type { DefineComponent } from "vue";
	const component: DefineComponent<
		Record<string, unknown>,
		Record<string, unknown>,
		any
	>;
	export default component;
}

// Vite env type declarations – fixes "Property 'env' does not exist on type 'ImportMeta'"
interface ImportMeta {
	readonly env: ImportMetaEnv;
}

interface ImportMetaEnv {
	readonly VITE_API_URL: string;
	readonly MODE: string;
	readonly BASE_URL: string;
	readonly PROD: boolean;
	readonly DEV: boolean;
	readonly SSR: boolean;
	[key: string]: any;
}
