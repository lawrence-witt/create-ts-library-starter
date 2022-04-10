#!/usr/bin/env node

// @ts-check

const fs = require("fs");

const { exit, runCommand, runPrompt, writeExportJSONFile } = require("./helpers/node-helpers.js");
const { installCommand, installDevCommand, mergePackage } = require("./helpers/npm-helpers.js");
const { createTSBrowserConfig, createTSReactConfig } = require("./helpers/ts-helpers");
const { createEslintReactConfig } = require("./helpers/eslint-helpers");

const package = require("../package.json");

const tsCommonConfig = require("./config/typescript/tsconfig.common.json");
const eslintCommonConfig = require("./config/eslint/eslintrc.common.js");

const {
  DOM_ENVIRONMENTS,
  ENVIRONMENTS,
  BINARY_OPTIONS,
  REACT_DEPS,
  REACT_DEV_DEPS,
  JEST_DEV_DEPS,
  JEST_BROWSER_DEV_DEPS,
  JEST_REACT_DEV_DEPS,
} = require("./constants.js");

(async () => {
  const directory = process.argv[2];

  if (!directory) exit(new Error("No directory specified."));

  const repository = package?.repository?.url;

  if (!repository) exit(new Error("No repository url found."));

  runCommand(`git clone --depth 1 ${repository} ${directory}`);
  runCommand(`cd ${directory} && npm install`);

  const envResult = await runPrompt("Select a target environment for this library:", ENVIRONMENTS);
  const includeDOM = DOM_ENVIRONMENTS.includes(envResult);
  const includeReact = envResult === "react";

  if (includeReact) {
    runCommand(installCommand(REACT_DEPS));
    runCommand(installDevCommand(REACT_DEV_DEPS));
  }

  const jestResult = await runPrompt("Set up a Jest test runner for this library:", BINARY_OPTIONS);
  const includeJest = jestResult === "y";

  if (includeJest) {
    const jestDevDeps = {
      node: JEST_DEV_DEPS,
      browser: JEST_BROWSER_DEV_DEPS,
      react: JEST_REACT_DEV_DEPS,
    }[envResult];

    const jestEnvPath = includeDOM ? "dom" : "common";

    const jestConfigLocation = `./${directory}/bin/config/jest/jest.config.${jestEnvPath}.ts`;
    const jestConfigDestination = `./${directory}/config/jest.config.ts`;

    const jestSetupLocation = `./${directory}/bin/config/jest/setup-tests.ts`;
    const jestSetupDestination = `./${directory}/config/setup-tests.ts`;

    runCommand(installDevCommand(jestDevDeps));
    runCommand(`mv ${jestConfigLocation} ${jestConfigDestination}`);
    includeDOM && runCommand(`mv ${jestSetupLocation} ${jestSetupDestination}`);
  }

  const rollupConfigLocation = `./${directory}/bin/config/rollup/rollup.config.common.ts`;
  const rollupConfigDestination = `./${directory}/config/rollup.config.ts`;

  runCommand(`mv ${rollupConfigLocation} ${rollupConfigDestination}`);

  const tsConfig = {
    node: () => tsCommonConfig,
    browser: () => createTSBrowserConfig(tsCommonConfig, includeJest),
    react: () => createTSReactConfig(tsCommonConfig, includeJest),
  }[envResult]();

  fs.writeFileSync(`./${directory}/tsconfig.json`, JSON.stringify(tsConfig, null, 2));

  const eslintConfig = {
    node: () => eslintCommonConfig,
    browser: () => eslintCommonConfig,
    react: () => createEslintReactConfig(eslintCommonConfig),
  }[envResult]();

  fs.writeFileSync(`./${directory}/.eslintrc.js`, writeExportJSONFile(eslintConfig));

  const mergedPackage = mergePackage(package, {
    name: directory,
    includeReact,
    includeJest,
  });

  fs.writeFileSync(`./${directory}/package.json`, JSON.stringify(mergedPackage, null, 2));

  runCommand(`rm ./${directory}/config/.gitkeep`);
  runCommand(`cd ${directory} && rimraf ./bin`);
})();
