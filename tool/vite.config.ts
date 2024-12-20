import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ command, mode, isSsrBuild, isPreview }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    define: {
      "process.env.SERVER_BASE_URL": JSON.stringify(env.SERVER_BASE_URL),
      "process.env.LANGUAGES": JSON.stringify(env.LANGUAGES),
    },
    plugins: [react()],
  };
});
