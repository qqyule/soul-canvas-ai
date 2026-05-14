/// <reference types="vitest" />

import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { defineConfig, type UserConfig } from 'vite'

type UserConfigWithTest = UserConfig & {
	test: Record<string, unknown>
}

// https://vite.dev/config/
const config = {
	plugins: [react()],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
	test: {
		globals: true,
		environment: 'node',
		include: ['src/**/*.{test,spec}.{ts,tsx}'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html'],
			include: ['src/db/**/*.ts'],
		},
	},
} satisfies UserConfigWithTest

export default defineConfig(config)
