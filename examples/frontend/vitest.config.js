import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
	plugins: [react()],
	test: {
		globals: true,
		environment: "happy-dom",
		setupFiles: "./src/test/setup.ts",
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html"],
			exclude: [
				"node_modules/",
				"src/test/",
				"**/*.d.ts",
				"**/*.config.*",
				"**/dist/**",
				"**/build/**",
			],
		},
	},
	resolve: {
		alias: {
			"regular-calendar/styles": path.resolve(__dirname, "../../src/index.css"),
			"regular-calendar": path.resolve(__dirname, "../../src/index.ts"),
			"@": path.resolve(__dirname, "../../src"),
		},
	},
});
