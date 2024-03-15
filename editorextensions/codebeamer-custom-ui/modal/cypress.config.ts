import { defineConfig } from 'cypress';

export default defineConfig({
	retries: {
		runMode: 1,
		openMode: 1,
	},

	projectId: '61hnzi',

	component: {
		devServer: {
			framework: 'react',
			bundler: 'vite',
		},
	},
});
