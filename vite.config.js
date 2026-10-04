import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  root: "src/",
  build: {
    outDir: "../dist",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "src/index.html"),
        cookbook: resolve(__dirname, "src/cookbook/index.html"),
        request: resolve(__dirname, "src/request/index.html"),
      },
    },
  },
});
