import { parse } from "https://deno.land/std@0.181.0/flags/mod.ts";
import { exists } from "./src/lib.ts";
import { BoxFlags, archive, list, packaging, watch } from "./src/box.ts";

export const cwdurl = new URL(`file:///${Deno.cwd()}/`);
export const evmurl = localStorage.getItem("url") ?? "";

switch (Deno.args[0]) {
  case "init":
    await init();
    break;
  case "create":
    if (evmurl == "") {
      console.error("init 명령어를 실행하셨나요?");
      Deno.exit();
    }
    await create(Deno.args[1]);
    break;
  default:
    if (Deno.args[0] == undefined) {
      console.log("❤ entam");
      Deno.exit();
    }
    if (evmurl == "") {
      console.error("init 명령어를 실행하셨나요?");
      Deno.exit();
    }
    {
      const box = Deno.args[0];
      const boxurl = new URL(`./${box}/`, evmurl);
      if (!(await exists(new URL("./data.json", boxurl)))) {
        console.error(`"${box}" 상자가 없거나 손상되었습니다.`);
        Deno.exit();
      }
      const flags: BoxFlags = parse(Deno.args, {
        string: ["data", "version", "n"],
      });
      switch (Deno.args[1]) {
        case "archive":
          await archive(boxurl, flags);
          break;

        case "list":
          console.log(await list(boxurl, flags));
          break;

        case "watch":
          await watch(boxurl, Deno.args[2]);
          break;

        case "pack":
          packaging(boxurl, flags);
          break;
        case undefined:
          console.error("아무 일도 일어나지 않았네요.");
          break;

        default:
          console.error(`"${Deno.args[1]}" 라는 명령어는 없습니다.`);
      }
    }
    break;
}

async function init() {
  try {
    await Deno.mkdir(".entam");
    console.log(new URL("./.entam/", cwdurl).toString());
    localStorage.setItem("url", new URL("./.entam/", cwdurl).toString());
  } catch (_) {
    console.log(
      "init을 할 수 없습니다.\n.entam 폴더가 이미 있는지 확인하세요."
    );
  }
}

async function create(dir: string) {
  try {
    const path = new URL(`./${dir}/`, evmurl);
    await Deno.mkdir(path);
    Deno.writeFile(
      new URL("./data.json", path.toString()),
      new TextEncoder().encode(
        JSON.stringify({
          watch: null,
          version: [],
        })
      )
    );
    console.log(`${dir} 상자를 만들었습니다.`);
  } catch (_) {
    console.log(
      `상자를 만들 수 없습니다. 이미 ${dir} 이름의 상자가 있을 수 있습니다.`
    );
  }
}
