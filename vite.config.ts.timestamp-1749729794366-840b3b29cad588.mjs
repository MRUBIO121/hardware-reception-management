// vite.config.ts
import { defineConfig, loadEnv } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react/dist/index.mjs";
var vite_config_default = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  const apiUrl = env.VITE_API_URL || "http://localhost:3002/api";
  console.log(`Using API URL: ${apiUrl}`);
  const apiBaseUrl = apiUrl.endsWith("/api") ? apiUrl.substring(0, apiUrl.length - 4) : apiUrl;
  return {
    plugins: [react()],
    optimizeDeps: {
      exclude: ["lucide-react"]
    },
    define: {
      // Make environment variables available to the client
      "import.meta.env.VITE_API_URL": JSON.stringify(apiUrl)
    },
    server: {
      proxy: {
        "/api": {
          target: apiBaseUrl,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
          configure: (proxy, _options) => {
            proxy.on("error", (err, _req, _res) => {
              console.log("proxy error", err);
            });
            proxy.on("proxyReq", (proxyReq, req, _res) => {
              console.log("Sending Request:", req.method, req.url);
            });
            proxy.on("proxyRes", (proxyRes, req, _res) => {
              console.log("Received Response:", proxyRes.statusCode, req.url);
            });
          }
        }
      }
    },
    build: {
      // Generate sourcemaps for better debugging
      sourcemap: true,
      // Ensure we show any warnings during build
      reportCompressedSize: true
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcsIGxvYWRFbnYgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiB7XG4gIC8vIExvYWQgZW52IHZhcmlhYmxlc1xuICBjb25zdCBlbnYgPSBsb2FkRW52KG1vZGUsIHByb2Nlc3MuY3dkKCkpO1xuICBcbiAgLy8gR2V0IEFQSSBVUkwgZnJvbSBlbnZpcm9ubWVudCBvciB1c2UgZGVmYXVsdFxuICBjb25zdCBhcGlVcmwgPSBlbnYuVklURV9BUElfVVJMIHx8ICdodHRwOi8vbG9jYWxob3N0OjMwMDIvYXBpJztcbiAgY29uc29sZS5sb2coYFVzaW5nIEFQSSBVUkw6ICR7YXBpVXJsfWApO1xuICBcbiAgLy8gVGhlIGJhc2UgVVJMIGZvciB0aGUgQVBJIHdpdGhvdXQgdGhlIC9hcGkgcGF0aFxuICBjb25zdCBhcGlCYXNlVXJsID0gYXBpVXJsLmVuZHNXaXRoKCcvYXBpJykgXG4gICAgPyBhcGlVcmwuc3Vic3RyaW5nKDAsIGFwaVVybC5sZW5ndGggLSA0KSBcbiAgICA6IGFwaVVybDtcbiAgXG4gIHJldHVybiB7XG4gICAgcGx1Z2luczogW3JlYWN0KCldLFxuICAgIG9wdGltaXplRGVwczoge1xuICAgICAgZXhjbHVkZTogWydsdWNpZGUtcmVhY3QnXSxcbiAgICB9LFxuICAgIGRlZmluZToge1xuICAgICAgLy8gTWFrZSBlbnZpcm9ubWVudCB2YXJpYWJsZXMgYXZhaWxhYmxlIHRvIHRoZSBjbGllbnRcbiAgICAgICdpbXBvcnQubWV0YS5lbnYuVklURV9BUElfVVJMJzogSlNPTi5zdHJpbmdpZnkoYXBpVXJsKSxcbiAgICB9LFxuICAgIHNlcnZlcjoge1xuICAgICAgcHJveHk6IHtcbiAgICAgICAgJy9hcGknOiB7XG4gICAgICAgICAgdGFyZ2V0OiBhcGlCYXNlVXJsLFxuICAgICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcbiAgICAgICAgICByZXdyaXRlOiAocGF0aCkgPT4gcGF0aC5yZXBsYWNlKC9eXFwvYXBpLywgJycpLFxuICAgICAgICAgIGNvbmZpZ3VyZTogKHByb3h5LCBfb3B0aW9ucykgPT4ge1xuICAgICAgICAgICAgcHJveHkub24oJ2Vycm9yJywgKGVyciwgX3JlcSwgX3JlcykgPT4ge1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZygncHJveHkgZXJyb3InLCBlcnIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBwcm94eS5vbigncHJveHlSZXEnLCAocHJveHlSZXEsIHJlcSwgX3JlcykgPT4ge1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZygnU2VuZGluZyBSZXF1ZXN0OicsIHJlcS5tZXRob2QsIHJlcS51cmwpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBwcm94eS5vbigncHJveHlSZXMnLCAocHJveHlSZXMsIHJlcSwgX3JlcykgPT4ge1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZygnUmVjZWl2ZWQgUmVzcG9uc2U6JywgcHJveHlSZXMuc3RhdHVzQ29kZSwgcmVxLnVybCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9LFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICBidWlsZDoge1xuICAgICAgLy8gR2VuZXJhdGUgc291cmNlbWFwcyBmb3IgYmV0dGVyIGRlYnVnZ2luZ1xuICAgICAgc291cmNlbWFwOiB0cnVlLFxuICAgICAgLy8gRW5zdXJlIHdlIHNob3cgYW55IHdhcm5pbmdzIGR1cmluZyBidWlsZFxuICAgICAgcmVwb3J0Q29tcHJlc3NlZFNpemU6IHRydWVcbiAgICB9XG4gIH07XG59KTsiXSwKICAibWFwcGluZ3MiOiAiO0FBQXlOLFNBQVMsY0FBYyxlQUFlO0FBQy9QLE9BQU8sV0FBVztBQUdsQixJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFFLEtBQUssTUFBTTtBQUV4QyxRQUFNLE1BQU0sUUFBUSxNQUFNLFFBQVEsSUFBSSxDQUFDO0FBR3ZDLFFBQU0sU0FBUyxJQUFJLGdCQUFnQjtBQUNuQyxVQUFRLElBQUksa0JBQWtCLE1BQU0sRUFBRTtBQUd0QyxRQUFNLGFBQWEsT0FBTyxTQUFTLE1BQU0sSUFDckMsT0FBTyxVQUFVLEdBQUcsT0FBTyxTQUFTLENBQUMsSUFDckM7QUFFSixTQUFPO0FBQUEsSUFDTCxTQUFTLENBQUMsTUFBTSxDQUFDO0FBQUEsSUFDakIsY0FBYztBQUFBLE1BQ1osU0FBUyxDQUFDLGNBQWM7QUFBQSxJQUMxQjtBQUFBLElBQ0EsUUFBUTtBQUFBO0FBQUEsTUFFTixnQ0FBZ0MsS0FBSyxVQUFVLE1BQU07QUFBQSxJQUN2RDtBQUFBLElBQ0EsUUFBUTtBQUFBLE1BQ04sT0FBTztBQUFBLFFBQ0wsUUFBUTtBQUFBLFVBQ04sUUFBUTtBQUFBLFVBQ1IsY0FBYztBQUFBLFVBQ2QsU0FBUyxDQUFDLFNBQVMsS0FBSyxRQUFRLFVBQVUsRUFBRTtBQUFBLFVBQzVDLFdBQVcsQ0FBQyxPQUFPLGFBQWE7QUFDOUIsa0JBQU0sR0FBRyxTQUFTLENBQUMsS0FBSyxNQUFNLFNBQVM7QUFDckMsc0JBQVEsSUFBSSxlQUFlLEdBQUc7QUFBQSxZQUNoQyxDQUFDO0FBQ0Qsa0JBQU0sR0FBRyxZQUFZLENBQUMsVUFBVSxLQUFLLFNBQVM7QUFDNUMsc0JBQVEsSUFBSSxvQkFBb0IsSUFBSSxRQUFRLElBQUksR0FBRztBQUFBLFlBQ3JELENBQUM7QUFDRCxrQkFBTSxHQUFHLFlBQVksQ0FBQyxVQUFVLEtBQUssU0FBUztBQUM1QyxzQkFBUSxJQUFJLHNCQUFzQixTQUFTLFlBQVksSUFBSSxHQUFHO0FBQUEsWUFDaEUsQ0FBQztBQUFBLFVBQ0g7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBLE9BQU87QUFBQTtBQUFBLE1BRUwsV0FBVztBQUFBO0FBQUEsTUFFWCxzQkFBc0I7QUFBQSxJQUN4QjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
