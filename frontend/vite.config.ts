import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import { sentryVitePlugin } from '@sentry/vite-plugin';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const hasSentryReleaseConfig = Boolean(
    env.SENTRY_AUTH_TOKEN && env.SENTRY_ORG && env.SENTRY_PROJECT
  );

  return {
    build: {
      sourcemap: hasSentryReleaseConfig ? 'hidden' : false
    },
    plugins: [
      vue(),
      ...(hasSentryReleaseConfig
        ? [
            sentryVitePlugin({
              org: env.SENTRY_ORG,
              project: env.SENTRY_PROJECT,
              authToken: env.SENTRY_AUTH_TOKEN,
              url: env.SENTRY_URL || undefined,
              telemetry: false,
              release: {
                name: env.SENTRY_RELEASE || undefined
              }
            })
          ]
        : [])
    ],
    server: {
      port: 4173,
      host: '127.0.0.1',
      strictPort: true,
      allowedHosts: true,
      proxy: {
        '/api': {
          target: 'http://localhost:4000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    }
  };
});
