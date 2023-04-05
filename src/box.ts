import * as path from "path";
import { dataDir, exists } from "./lib.ts";
import { BoxCreationError, BoxDuplicateError } from "./error.ts";
import { Command, commands } from "./command.ts";
import { ArchiveData } from "./archive.ts";
import { tar } from "https://deno.land/x/compress@v0.4.4/mod.ts";
import { gunzip } from "https://deno.land/x/compress@v0.4.4/gzip/gzip.ts";

type BoxData = {
  watch: string | null;
  list: ArchiveData[];
};

function boxDir(name: string) {
  return path.join(dataDir, name as string);
}

async function boxData(name: string): Promise<BoxData> {
  return await JSON.parse(
    new TextDecoder().decode(
      await Deno.readFile(path.join(boxDir(name), "./data.json"))
    )
  );
}

async function archiveData(name: string, uuid: string) {
  return await JSON.parse(
    new TextDecoder().decode(
      await gunzip(
        await Deno.readFile(path.join(boxDir(name), `./${uuid}.json`))
      )
    )
  );
}

async function isBoxExists(name: string) {
  return await exists(boxDir(name));
}

function checkBoxName(name: string) {
  if (commands[name as Command]) {
    throw new BoxCreationError("상자의 이름은 entam 명령어일 수 없습니다.");
  }
}

async function createBox(name: string, watch: string) {
  checkBoxName(name);
  if (await isBoxExists(name)) {
    throw new BoxDuplicateError(name);
  }
  const dir = boxDir(name);
  await Deno.mkdir(dir);
  const data: BoxData = {
    watch: null,
    list: [],
  };
  if (watch) {
    data.watch = watch;
  } else {
    console.warn("watch flag를 지정하지 않았습니다.");
  }
  await Deno.writeFile(
    path.join(dir, "./data.json"),
    new TextEncoder().encode(JSON.stringify(data))
  );
  console.info(`${name} 상자가 생성되었습니다.`);
}

async function watch(name: string, target: string) {
  const dir = boxDir(name);
  try {
    const dataPath = path.join(dir, "./data.json");
    const data: BoxData = await boxData(name);

    data.watch = target;

    await Deno.writeFile(
      dataPath,
      new TextEncoder().encode(JSON.stringify(data))
    );
    console.info(
      `${name} 상자는 이제 ${path.basename(target)} 파일을 주시합니다.`
    );
    Deno.exit();
  } catch (err) {
    if (err instanceof Deno.errors.NotFound) {
      console.error(`${name} 상자에 정보 파일이 없습니다.`);
      const data = JSON.stringify({
        watch: null,
        list: [],
      });
      await Deno.writeFile(
        path.join(dir, "./data.json"),
        new TextEncoder().encode(data)
      );
      console.info(`${name} 상자에 정보 파일을 만들었습니다.`);
      await watch(name, target);
      Deno.exit();
    }
    console.error(err);
  }
}

export { boxDir, boxData, archiveData, isBoxExists, createBox, watch };
export type { BoxData, ArchiveData };
