import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/core/index.ts", "src/common/index.ts"],
  tsconfig: "./tsconfig.json",
  format: ["cjs", "esm"],
  target: "esnext",
  clean: true,
  dts: true,
});
