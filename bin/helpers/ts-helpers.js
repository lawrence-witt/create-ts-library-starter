// @ts-check

const createTSBrowserConfig = (common, includeJest = false) => ({
  ...common,
  compilerOptions: {
    ...common.compilerOptions,
    lib: ["dom", "es2015"],
  },
  include: [...(common.include || []), ...((includeJest && ["./config/setup-tests.ts"]) || [])],
});

const createTSReactConfig = (common, includeJest = false) =>
  ((browser) => ({
    ...browser,
    compilerOptions: {
      ...browser.compilerOptions,
      jsx: "react",
    },
    exclude: [...(common.exclude || []), ...((includeJest && ["./src/**/*.tsx"]) || [])],
  }))(createTSBrowserConfig(common, includeJest));

module.exports = {
  createTSBrowserConfig,
  createTSReactConfig,
};
