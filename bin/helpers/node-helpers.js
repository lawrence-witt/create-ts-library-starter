// @ts-check

const { execSync } = require("child_process");
const readline = require("readline");

const exit = (error) => {
  process.exitCode = 1;
  throw error;
};

const runCommand = (command) => {
  try {
    execSync(`${command}`, { stdio: "inherit" });
  } catch (e) {
    console.error(`Failed to execute ${command}:`);
    exit(e);
  }
};

const runPrompt = async (query, options = []) => {
  const optionString = !options[0] ? "" : ` (${options.join(", ")}) `;
  const reader = readline.createInterface({ input: process.stdin, output: process.stdout });

  let result = await new Promise((resolve) => reader.question(`${query}${optionString}`, resolve));

  if (options[0] && !options.includes(result))
    exit(new Error(`${result} is not a valid option:${optionString}`));

  return result;
};

const writeExportJSONFile = (json) => "module.exports = " + JSON.stringify(json, null, 2) + ";";

module.exports = {
  exit,
  runCommand,
  runPrompt,
  writeExportJSONFile,
};
