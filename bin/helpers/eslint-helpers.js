// @ts-check

const createEslintReactConfig = (common) => ({
  ...common,
  plugins: [...(common.plugins || []), "react-hooks"],
  extends: [...(common.extends || []), "plugin:react/recommended"],
  rules: {
    ...(common.rules || {}),
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "react/prop-types": "off",
  },
  settings: {
    ...(common.settings || {}),
    "import/resolver": {
      ...(common.settings["import/resolver"] || {}),
      node: {
        ...(common.settings["import/resolver"].node || {}),
        extensions: [...(common.settings["import/resolver"].node.extensions || []), ".tsx"],
      },
    },
    react: {
      pragma: "React",
      version: "detect",
    },
  },
});

module.exports = {
  createEslintReactConfig,
};
