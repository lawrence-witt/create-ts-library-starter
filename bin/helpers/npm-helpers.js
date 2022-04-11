// @ts-check

const installCommand = (deps) => `npm install ${deps.join(" ")}`;

const installDevCommand = (deps) => `npm install -D ${deps.join(" ")}`;

const createScripts = (includeReact, includeJest) => {
  const exts = ["js", "ts", ...((includeReact && ["tsx"]) || []), "json"];

  const test = { test: "jest -c ./config/jest.config.ts" };

  return {
    prebuild: `${
      (includeJest && "npm run test && ") || ""
    }npm run lint && npm run prettier:check && npm run clean`,
    build: "npm run prebuild && rollup -c ./config/rollup.config.ts",
    ...((includeJest && test) || {}),
    clean: "rimraf ./dist",
    lint: `eslint ./src --ext ${exts.map((e) => `.${e}`).join(",")}`,
    prettier: `prettier -w ./**/*.{${exts.join(",")}}`,
    "prettier:check": `prettier -c ./**/*.{${exts.join(",")}}`,
  };
};

const mergePackage = (package, options = {}) => {
  const { name, includeReact, includeJest } = options;

  package.name = name;
  package.version = "0.1.0";
  package.description = "Created with create-ts-library-starter";
  package.main = "./dist/index.js";
  package.module = "./dist/index.esm.js";
  package.types = "./dist/types/index.d.ts";
  package.author = "";

  package.scripts = createScripts(includeReact, includeJest);

  delete package.bin;
  delete package.repository;

  return package;
};

const mergePackageLock = (package, name) => {
  package.name = name;
  package.version = "0.1.0";

  return package;
};

module.exports = { installCommand, installDevCommand, mergePackage, mergePackageLock };
