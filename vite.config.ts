import react from "@vitejs/plugin-react";
import dns from "dns";
import path from "path";
import { defineConfig, loadEnv } from "vite";

// Improve localhost resolution
dns.setDefaultResultOrder("verbatim");

// Dynamic port configuration
export default defineConfig(({ mode }) => {
  // Load env variables
  const env = loadEnv(mode, process.cwd(), "");
  
  // Get port from environment or use default
  const PORT = parseInt(env.PORT || "0", 10) || 5173;
  
  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    server: {
      port: PORT,
      strictPort: false, // Allow fallback to next available port
      host: true, // Listen on all addresses including LAN
      open: true, // Auto-open browser
    },
    preview: {
      port: PORT,
      strictPort: false,
      host: true,
    },
    build: {
      outDir: "dist",
    },
    publicDir: "public",
  };
});
