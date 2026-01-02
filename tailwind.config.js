import preset from "./tailwind.preset.js";

export default {
	presets: [preset],
	content: ["./src/**/*.{js,ts,jsx,tsx}", "./index.html"],
	theme: {
		extend: {},
	},
	plugins: [],
};
