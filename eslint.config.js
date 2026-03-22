import { globalIgnores } from "eslint/config";
import globals from "globals";
import js from "@eslint/js";
import pluginVue from "eslint-plugin-vue";
import {
	defineConfigWithVueTs,
	vueTsConfigs,
} from "@vue/eslint-config-typescript";
import skipFormatting from "@vue/eslint-config-prettier/skip-formatting";

export default defineConfigWithVueTs([
	{
		name: "app/files-to-lint",
		files: ["**/*.{js,mjs,jsx,ts,tsx,vue}"],
	},

	globalIgnores([
		"**/dist/**",
		"**/dist-ssr/**",
		"**/coverage/**",
		"**/.agents/**",
	]),

	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
			},
		},
	},

	js.configs.recommended,
	...pluginVue.configs["flat/essential"],
	vueTsConfigs.recommended,
	skipFormatting,
	{
		rules: {
			"no-unused-vars": "off",
			"@typescript-eslint/no-unused-vars": [
				"warn",
				{
					args: "after-used",
					argsIgnorePattern: "^_",
				},
			],
			"@typescript-eslint/no-explicit-any": "off",
			"vue/block-lang": "off",
			"multiline-comment-style": ["error", "starred-block"],
			"no-multi-str": "error",
			"vue/html-comment-content-spacing": ["error", "always"],
			"vue/html-comment-content-newline": [
				"error",
				{
					singleline: "never",
					multiline: "always",
				},
			],
			"no-console": "error",
			"no-empty": ["error", { allowEmptyCatch: true }],
			"vue/multi-word-component-names": "off",
		},
	},
]);
