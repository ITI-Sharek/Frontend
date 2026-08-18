import { defineConfig } from "vite";

import { tanstackStart } from "@tanstack/react-start/plugin/vite";

import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const config = defineConfig({
  server: { host: "0.0.0.0" },
  resolve: {
    tsconfigPaths: true,
    // Hooks require every component and renderer to use the same React runtime.
    // This is especially important with pnpm's isolated dependency layout.
    dedupe: ["react", "react-dom"],
  },
  plugins: [tailwindcss(), tanstackStart(), viteReact()],
});

export default config;
