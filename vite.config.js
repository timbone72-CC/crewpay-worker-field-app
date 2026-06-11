import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  base: "/crewpay-worker-field-app/",
  build: {
    outDir: "dist",
  },
  plugins: [react()],
});
