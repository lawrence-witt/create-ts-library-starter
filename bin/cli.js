#!/usr/bin/env node

// @ts-check

const fs = require("fs");

const {
  cmd,
  exit,
  runCommand,
  runPrompt,
  writeExportJSONFile,
} = require("./helpers/node-helpers.js");

const {
  installCommand,
  installDevCommand,
  mergePackage,
  mergePackageLock,
} = require("./helpers/npm-helpers.js");

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

  /* Create the base */

  console.log("Cloning into repo...");
  runCommand(`git clone --depth 1 ${repository} ${directory}`);

  console.log("Installing base packages...");
  process.chdir(`${directory}`);
  runCommand(`npm install`);

  /* Configure user selections */

  const envResult = await runPrompt("Select a target environment for this library:", ENVIRONMENTS);
  const includeDOM = DOM_ENVIRONMENTS.includes(envResult);
  const includeReact = envResult === "react";

  if (includeReact) {
    console.log("Installing React dependencies...");
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

    const jestConfigLocation = `./bin/config/jest/jest.config.${jestEnvPath}.ts`;
    const jestConfigDestination = `./config/jest.config.ts`;

    const jestSetupLocation = `./bin/config/jest/setup-tests.ts`;
    const jestSetupDestination = `./config/setup-tests.ts`;

    console.log("Installing Jest dependencies...");
    runCommand(installDevCommand(jestDevDeps));

    console.log("Adding Jest configuration...");
    runCommand(cmd.mv(`${jestConfigLocation} ${jestConfigDestination}`));
    includeDOM && runCommand(cmd.mv(`${jestSetupLocation} ${jestSetupDestination}`));
  }

  /* Move other config files into the project */

  const rollupConfigLocation = `./bin/config/rollup/rollup.config.common.ts`;
  const rollupConfigDestination = `./config/rollup.config.ts`;

  console.log("Adding rollup configuration...");
  runCommand(cmd.mv(`${rollupConfigLocation} ${rollupConfigDestination}`));

  const tsConfig = {
    node: () => tsCommonConfig,
    browser: () => createTSBrowserConfig(tsCommonConfig, includeJest),
    react: () => createTSReactConfig(tsCommonConfig, includeJest),
  }[envResult]();

  console.log("Adding TypeScript configuration...");
  fs.writeFileSync(`./tsconfig.json`, JSON.stringify(tsConfig, null, 2));

  const eslintConfig = {
    node: () => eslintCommonConfig,
    browser: () => eslintCommonConfig,
    react: () => createEslintReactConfig(eslintCommonConfig),
  }[envResult]();

  console.log("Adding ESLint configuration...");
  fs.writeFileSync(`./.eslintrc.js`, writeExportJSONFile(eslintConfig));

  /* Clean up the output repo */

  console.log("Cleaning up...");
  runCommand("rm ./config/.gitkeep");
  runCommand(cmd.npmRun("rimraf ./bin"));

  console.log("Merging package details...");
  const mergedPackage = mergePackage(JSON.parse(fs.readFileSync(`./package.json`, "utf-8")), {
    name: directory,
    includeReact,
    includeJest,
  });

  const mergedPackageLock = mergePackageLock(
    JSON.parse(fs.readFileSync(`./package-lock.json`, "utf-8")),
    directory,
  );

  fs.writeFileSync(`./package.json`, JSON.stringify(mergedPackage, null, 2));
  fs.writeFileSync(`./package-lock.json`, JSON.stringify(mergedPackageLock, null, 2));

  console.log("Committing changes...");
  runCommand("git checkout --orphan initialisation");
  runCommand("git config --local core.autocrlf false");
  runCommand("git add -A");
  runCommand(`git commit -m "initialise new library with create-ts-library-starter"`);
  runCommand("git branch -D main");
  runCommand("git branch -m main");

  console.log("Project initialised.");
})();
