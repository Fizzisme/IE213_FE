import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss()],
    define: {
        global: 'globalThis',
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    build: {
        chunkSizeWarningLimit: 1200,
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        // CHỈ gom đúng lõi React bằng cách bọc dấu '/' để tránh bắt nhầm các thư viện khác
                        if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/react-router-dom/')) {
                            return 'vendor-react';
                        }

                        // Tách riêng các thư viện biểu đồ nặng nề
                        if (id.includes('echarts') || id.includes('zrender')) {
                            return 'vendor-charts';
                        }

                        // Bỏ qua việc ép các thư viện còn lại vào 'vendor-utils'.
                        // Vite sẽ tự động phân tích dependency graph và tự chia nhỏ chúng an toàn hơn!
                    }
                },
            },
        },
    },
});
