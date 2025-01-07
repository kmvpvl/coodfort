// vite.config.ts
/// <reference types="vitest" />
/// <reference types="vite/client" />

import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ command, mode, isSsrBuild, isPreview }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    server: {
      //  port: 4000
    },
    build: {
      sourcemap: true,
    },
    css: {
      devSourcemap: true,
    },
    define: {
      "process.env.SERVER_BASE_URL": JSON.stringify(env.SERVER_BASE_URL),
      "process.env.LANGUAGES": JSON.stringify(env.LANGUAGES),
      "process.env.MODE": JSON.stringify(mode),
    },
    plugins: [react()],
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: "./src/__test__/setup.ts",
      css: true,
    },
  };
});
