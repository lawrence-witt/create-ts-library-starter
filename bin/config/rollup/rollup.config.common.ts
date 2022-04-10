const { defineConfig } = require("rollup");
const typescript = require("rollup-plugin-typescript2");
const { terser } = require("rollup-plugin-terser");

const config = defineConfig({
  input: "./src/index.ts",
  output: [
    {
      file: "./dist/index.esm.js",
      format: "esm",
      sourcemap: true,
    },
    {
      name: "bundle",
      file: "./dist/index.js",
      format: "umd",
      sourcemap: true,
    },
  ],
  plugins: [
    typescript({ useTsconfigDeclarationDir: true }),
    terser({
      format: {
        comments: false,
      },
    }),
  ],
});

module.exports = config;
