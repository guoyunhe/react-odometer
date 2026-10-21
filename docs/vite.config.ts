import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig(({ command }) => ({
  root: 'docs',
  base: command === 'build' ? '/react-odometer/' : '/',
  plugins: [react()],
}));
