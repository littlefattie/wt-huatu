import { dts } from "rollup-plugin-dts";

const config = {
  input: "./build/src/index.d.ts",
  output: {
    format: "es",
    file: "./dist/wt-huatu.d.ts",
  },
  plugins: [dts()],
}

export default config;