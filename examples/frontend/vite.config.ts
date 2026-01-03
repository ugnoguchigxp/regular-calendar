import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [tailwindcss(), react()],
	resolve: {
		alias: [
			// Specific paths first
			{
				find: "regular-calendar/styles",
				replacement: path.resolve(__dirname, "../../src/index.css"),
			},
			{
				find: "regular-calendar",
				replacement: path.resolve(__dirname, "../../src/index.ts"),
			},
			{
				find: "@",
				replacement: path.resolve(__dirname, "../../src"),
			},
			// Fix react duplicates
			{
				find: "react",
				replacement: path.resolve(__dirname, "./node_modules/react"),
			},
			{
				find: "react-dom",
				replacement: path.resolve(__dirname, "./node_modules/react-dom"),
			},
		],
	},
	server: {
		port: 5315,
		proxy: {
			"/api": {
				target: "http://localhost:3006",
				changeOrigin: true,
			},
		},
	},
	optimizeDeps: {
		exclude: ["regular-calendar"],
	},
});
