import { resolve } from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
    plugins: [
        react(),
        dts({
            rollupTypes: true,
            tsconfigPath: './tsconfig.build.json',
        }),
    ],
    resolve: {
        alias: {
            '@': resolve(__dirname, './src'),
        },
    },
    build: {
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'RegularCalendar',
            fileName: 'index',
            formats: ['es', 'cjs'],
        },
        cssCodeSplit: false, // Bundle all CSS into a single file
        rollupOptions: {
            external: [
                'react',
                'react-dom',
                'react/jsx-runtime',
                'date-fns',
            ],
            output: {
                globals: {
                    react: 'React',
                    'react-dom': 'ReactDOM',
                },
            },
        },
    },
});

