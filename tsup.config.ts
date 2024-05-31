import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/core/index.ts", "src/common/index.ts"],
  format: ["cjs"],
  target: "esnext",
  clean: true,
  dts: true,
});
