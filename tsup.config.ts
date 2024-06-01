import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/core/index.ts", "src/common/index.ts"],
  tsconfig: "./tsconfig.json",
  format: ["cjs"],
  target: "esnext",
  clean: true,
  dts: true,
});
