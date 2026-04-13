import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    base: '/Vehicle-Spareparts-AI/',
    plugins: [react()],
    resolve: {
      alias: {
        'react-native': 'react-native-web',
        'expo-file-system': resolve(__dirname, 'web-shims/expo-file-system.ts'),
      },
      extensions: ['.web.tsx', '.web.ts', '.web.jsx', '.web.js', '.tsx', '.ts', '.jsx', '.js'],
    },
    define: {
      'process.env.EXPO_PUBLIC_SUPABASE_URL': JSON.stringify(
        env.EXPO_PUBLIC_SUPABASE_URL || env.VITE_SUPABASE_URL || ''
      ),
      'process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY': JSON.stringify(
        env.EXPO_PUBLIC_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY || ''
      ),
      'process.env.EXPO_PUBLIC_GEMINI_API_KEY': JSON.stringify(
        env.EXPO_PUBLIC_GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || ''
      ),
    },
    optimizeDeps: {
      include: ['react-native-web'],
    },
  };
});
