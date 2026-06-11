import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  base: "/crewpay-field-app/",
  build: {
    outDir: "dist",
  },
  plugins: [react()],
});
