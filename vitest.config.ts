/// <reference types="vitest" />

import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig as defineVitestConfig } from "vitest/config";

export default defineVitestConfig({
	plugins: [react()],
	esbuild: {
		target: "es2020",
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	test: {
		globals: true,
		environment: "jsdom",
		setupFiles: "./src/test/setup.ts",
		include: ["src/**/*.test.{ts,tsx}"],
		coverage: {
			provider: "istanbul",
			reporter: ["text", "json", "html"],
			include: ["src/**/*.{ts,tsx}"],
			exclude: [
				"coverage/**",
				"dist/**",
				"**/[.]**",
				"packages/*/test?(s)/**",
				"**/*.d.ts",
				"**/virtual:*",
				"**/__x00__*",
				"**/\x00*",
				"cypress/**",
				"test?(s)/**",
				"test?(-*).?(c|m)[jt]s?(x)",
				"**/*{.,-}{test,spec}.?(c|m)[jt]s?(x)",
				"**/__tests__/**",
				"**/{karma,rollup,webpack,vite,vitest,jest,avajs,babel,nyc,cypress,tsup,build}.config.*",
				"**/vitest.{workspace,projects}.[jt]s?(x)",
				"**/.{eslint,mocha,prettier}rc.{?(c|m)js,yml}",
				"node_modules/**",
				"src/test/**",
				"examples/**",
			],
		},
	},
});
