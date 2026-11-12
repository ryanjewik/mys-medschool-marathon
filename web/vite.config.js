import { defineConfig } from "vite";
import { mockApi } from "./dev/mock-api.js";

// npm run dev                                             -> fake in-memory API, no AWS needed
// API_TARGET=https://dxxxx.cloudfront.net npm run dev     -> the real deployed backend
const target = process.env.API_TARGET;

export default defineConfig({
  plugins: target ? [] : [mockApi()],
  server: target
    ? {
        proxy: {
          "/api": { target, changeOrigin: true },
          "/config.json": { target, changeOrigin: true },
        },
      }
    : {},
});
