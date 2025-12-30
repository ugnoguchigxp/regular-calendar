import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            // Force alias to local src to use live code
            'regular-calendar/styles': path.resolve(__dirname, '../../src/index.css'),
            'regular-calendar': path.resolve(__dirname, '../../src/index.ts'),
            '@': path.resolve(__dirname, '../../src'), // Resolution for internal library imports
            // Prevent duplicate React instances
            'react': path.resolve(__dirname, './node_modules/react'),
            'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
        },
    },
    server: {
        port: 5315,
        proxy: {
            '/api': {
                target: 'http://localhost:3006',
                changeOrigin: true,
            },
        },
    },
    optimizeDeps: {
        exclude: ['regular-calendar'],
    },
});
