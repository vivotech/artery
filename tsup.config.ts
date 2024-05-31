import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/core/index.ts", "src/common/index.ts"],
  format: ["esm"], // Build for commonJS and ESmodules
  target: "node",
  clean: true,
});
