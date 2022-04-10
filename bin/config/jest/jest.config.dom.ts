import type { Config } from "@jest/types";
import path from "path";

const config: Config.InitialOptions = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  testTimeout: 3000,
  setupFilesAfterEnv: [path.resolve("./config/setup-tests.ts")],
  roots: [path.resolve("./src")],
};

export default config;
