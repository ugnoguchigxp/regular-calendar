/** @type {import('tailwindcss').Config} */
import path from 'path';
import { fileURLToPath } from 'url';
import preset from '../../tailwind.preset.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
    presets: [
        preset
    ],
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        path.join(__dirname, '../../src/**/*.{js,ts,jsx,tsx}'), // Absolute path to library
    ],
    theme: {
        extend: {
            // Ensure font family matches main project if not covered by preset
            fontFamily: {
                sans: ['"メイリオ"', 'Helvetica', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
