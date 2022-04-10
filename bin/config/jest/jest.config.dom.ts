import type { Config } from "@jest/types";
import path from "path";

const config: Config.InitialOptions = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  testTimeout: 3000,
  setupFilesAfterEnv: [path.resolve(__dirname, "./setup-tests.ts")],
  roots: [path.resolve(__dirname, "../src")],
};

export default config;
