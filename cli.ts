import * as path from "path";
import { dataDir } from "./src/lib.ts";
import { command, commands, boxCommands, boxCommand } from "./src/command.ts";
import { exists } from "./src/lib.ts";
import { args } from "./src/args.ts";
import { isBoxExists, watch } from "./src/box.ts";
import { BoxError } from "./src/error.ts";
import "./log.ts";
import { logError } from "./log.ts";

if (!(await exists(path.join(dataDir)))) {
  await Deno.mkdir(path.join(dataDir));
}

if (command) {
  if (commands[command]) {
    try {
      await commands[command]();
    } catch (error) {
      logError(error);
    }
  }
  if (await isBoxExists(command)) {
    if (boxCommand) {
      try {
        await boxCommands[boxCommand]();
      } catch (error) {
        logError(error);
      }
    } else {
      if (args.watch) {
        await watch(command, args.watch);
      }
    }
  } else {
    try {
      throw new BoxError(
        `${command} 상자가 없습니다.`,
        `entam create ${command} --watch <file_path>를 시도하세요.`
      );
    } catch (error) {
      logError(error);
    }
  }
}
