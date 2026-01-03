import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
	plugins: [
		tailwindcss(),
		react(),
		dts({
			rollupTypes: true,
			tsconfigPath: "./tsconfig.build.json",
		}),
	],
	resolve: {
		alias: {
			"@": resolve(__dirname, "./src"),
		},
	},
	build: {
		lib: {
			entry: resolve(__dirname, "src/index.ts"),
			name: "RegularCalendar",
			fileName: "index",
			formats: ["es", "cjs"],
		},
		cssCodeSplit: false, // Bundle all CSS into a single file
		rollupOptions: {
			external: [
				"react",
				"react-dom",
				"react/jsx-runtime",
				"date-fns",
				"i18next",
				"react-i18next",
			],
			output: {
				globals: {
					react: "React",
					"react-dom": "ReactDOM",
				},
			},
		},
	},
});
