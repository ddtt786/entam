import chalk from "chalk";
import { BoxError, CommandError } from "./src/error.ts";

console.info = (...data) => {
  console.log(`${chalk.blue.bold("info")}:`, ...data);
};

console.warn = (...data) => {
  console.log(`${chalk.yellow.bold("warn")}:`, ...data);
};

console.error = (...data) => {
  console.log(`${chalk.red.bold("error")}:`, ...data);
};

function logError(error: Error) {
  if (error instanceof CommandError) {
    logCommandError(error);
  }
  if (error instanceof BoxError) {
    logBoxError(error);
  }
  console.error(error);
  Deno.exit();
}

function logCommandError(error: CommandError) {
  console.error(
    `${error.message}${error.usage ? "\n\nUsage: " + error.usage : ""}`
  );
  Deno.exit();
}

function logBoxError(error: BoxError) {
  console.error(error.message);
  if (error.hint) console.info(error.hint);
  Deno.exit();
}

export { logError };
