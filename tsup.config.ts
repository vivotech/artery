import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/core/index.ts", "src/common/index.ts", "src/list/index.ts"],
  tsconfig: "./tsconfig.json",
  format: ["cjs", "esm"],
  // experimentalDts: true,
  splitting: false,
  target: "esnext",
  sourcemap: true,
  clean: true,
  dts: true,
});
