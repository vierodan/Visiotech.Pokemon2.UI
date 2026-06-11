import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig(function (_a) {
    var _b;
    var mode = _a.mode;
    var env = loadEnv(mode, '.', '');
    var proxyTarget = (_b = env.VITE_API_PROXY_TARGET) === null || _b === void 0 ? void 0 : _b.trim();
    return {
        plugins: [react()],
        server: {
            host: 'localhost',
            port: 5091,
            strictPort: true,
            proxy: proxyTarget
                ? {
                    '/api': {
                        target: proxyTarget,
                        changeOrigin: true,
                    },
                }
                : undefined,
        },
    };
});
