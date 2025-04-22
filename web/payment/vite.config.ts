import UnoCSS from "unocss/vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig({
  define: {
    "process.env": {},
  },
  plugins: [react(), UnoCSS(), nodePolyfills()],
});
