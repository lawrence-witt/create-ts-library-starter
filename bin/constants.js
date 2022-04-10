const DOM_ENVIRONMENTS = ["browser", "react"];
const ENVIRONMENTS = ["node", ...DOM_ENVIRONMENTS];
const BINARY_OPTIONS = ["y", "n"];

const REACT_DEPS = ["react"];
const REACT_DEV_DEPS = ["eslint-plugin-react", "eslint-plugin-react-hooks"];

const JEST_DEV_DEPS = ["ts-jest", "@types/jest"];
const JEST_DOM_DEV_DEPS = [
  ...JEST_DEV_DEPS,
  "@testing-library/jest-dom",
  "@testing-library/user-event",
];
const JEST_BROWSER_DEV_DEPS = [...JEST_DOM_DEV_DEPS, "@testing-library/dom"];
const JEST_REACT_DEV_DEPS = [...JEST_DOM_DEV_DEPS, "@testing-library/react"];

module.exports = {
  DOM_ENVIRONMENTS,
  ENVIRONMENTS,
  BINARY_OPTIONS,
  REACT_DEPS,
  REACT_DEV_DEPS,
  JEST_DEV_DEPS,
  JEST_BROWSER_DEV_DEPS,
  JEST_REACT_DEV_DEPS,
};
