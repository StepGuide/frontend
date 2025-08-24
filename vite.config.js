import { fileURLToPath, URL } from "node:url";
import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [vue(), vueDevTools()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    build: {
      outDir: path.resolve(__dirname, env.VITE_OUT_DIR || "dist"),
      emptyOutDir: true,
    },
    server: {
      proxy: {
        "/api": "http://localhost:8080", // 개발용 proxy만 고정
      },
    },
  };
});
