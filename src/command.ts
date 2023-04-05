import { archive, archiveList, loadArchive } from "./archive.ts";
import { args } from "./args.ts";
import { boxList, createBox } from "./box.ts";
import { CommandError } from "./error.ts";

type Command = "create" | "list";
type BoxCommand = "list" | "load";
const command = args._[0] as Command;
const boxCommand = args._[1] as BoxCommand;

const commands = {
  async create() {
    const name = args._[1] as string;
    if (name) {
      await createBox(name, args.target!);
      Deno.exit();
    } else {
      throw new CommandError(
        "create 명령어 뒤에는 생성할 상자의 이름이 와야 합니다.",
        "entam create <box_name>"
      );
    }
  },
  async list() {
    await boxList();
    Deno.exit();
  },
};

const boxCommands = {
  name: command,
  async archive() {
    await archive(this.name, {
      tag: args.tag as string,
      message: args.message ?? "쿨한 업데이트",
    });
  },
  async list() {
    await archiveList(this.name);
  },
  async load() {
    if (!args.uuid) {
      throw new CommandError(
        "아카이브를 불러오려면 불러올 아카이브를 지정해야 합니다.",
        "entam <box_name> load --uuid <archive_uuid>"
      );
    }
    await loadArchive(this.name, args.uuid as string);
  },
};

export { command, boxCommand, commands, boxCommands };
export type { Command, BoxCommand };
