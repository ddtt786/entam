import * as path from "path";
import { tgz } from "https://deno.land/x/compress@v0.4.4/mod.ts";
import { BoxData, archiveData, boxData, boxDir } from "./box.ts";
import { ArchiveCreationError, LoadArchiveError } from "./error.ts";
import { exists } from "./lib.ts";
import { gzip } from "https://deno.land/x/compress@v0.4.4/zlib/deflate.ts";
import { Table } from "table";
import { args } from "./args.ts";
import { gt, lt } from "semver";

type ArchiveData = {
  tag: string;
  message: string;
  uuid?: string | null;
};

async function archive(name: string, info: ArchiveData) {
  const dir = boxDir(name);
  const data: BoxData = await boxData(name);

  if (!data.watch) {
    throw new ArchiveCreationError(
      `${name} 상자가 주시하고 있는 파일이 없습니다.`,
      `entam ${name} --watch <file_path>를 시도하세요.`
    );
  }

  console.log(
    `${path.basename(data.watch)} 파일의 정보를 가져오는 중입니다...`
  );
  const target = data.watch;
  await tgz.uncompress(target as string, path.join(dir));

  if (!(await exists(path.join(dir, "temp", "./project.json")))) {
    throw new ArchiveCreationError(
      `${path.basename(
        data.watch
      )} 파일에 project.json 정보가 없습니다.\n파일이 심각하게 손상됐을 수 있습니다.`
    );
  }

  const uuid = crypto.randomUUID();
  info.uuid = uuid;
  if (!info.tag) {
    if (data.list[0].tag) {
      info.tag = data.list[0].tag;
    } else {
      info.tag = "0.0.1";
    }
  }

  await Deno.rename(
    path.join(dir, "temp", "./project.json"),
    path.join(dir, `./${uuid}.json`)
  );
  await Deno.writeFile(
    path.join(dir, `./${uuid}.json`),
    gzip(await Deno.readFile(path.join(dir, `./${uuid}.json`)))
  );

  data.list.unshift(info);

  await Deno.writeFile(
    path.join(dir, `./data.json`),
    new TextEncoder().encode(JSON.stringify(data))
  );

  console.info("아카이브를 만들었습니다.");
}

async function loadArchive(name: string, uuid: string) {
  const dir = boxDir(name);
  const data: BoxData = await boxData(name);

  const target = data.list.filter((d) => d.uuid == uuid)[0];

  if (!target) {
    throw new LoadArchiveError(`${uuid} uuid를 가진 아카이브가 없습니다.`);
  }

  const project = await archiveData(name, uuid);

  type Sprite = {
    pictures: { fileurl: string }[];
    sounds: { fileurl: string }[];
  };

  const tempDir = await Deno.makeTempDir();

  console.log("리소스를 불러오는 중...");
  project.objects.forEach(({ sprite }: { sprite: Sprite }) => {
    sprite.pictures.forEach(async ({ fileurl }) => {
      if (fileurl.slice(0, 4) == "temp") {
        await Deno.mkdir(path.join(tempDir, path.dirname(fileurl)), {
          recursive: true,
        });
        await Deno.mkdir(path.join(tempDir, fileurl, "../../thumb"), {
          recursive: true,
        });
        await Deno.writeFile(
          path.join(tempDir, fileurl),
          await Deno.readFile(path.join(dir, fileurl))
        );
        await Deno.writeFile(
          path.format({
            dir: path.join(tempDir, fileurl, "../../thumb"),
            name: path.parse(fileurl).name,
            ext: ".png",
          }),
          await Deno.readFile(
            path.format({
              dir: path.join(dir, fileurl, "../../thumb"),
              name: path.parse(fileurl).name,
              ext: ".png",
            })
          )
        );
      }
    });
    sprite.sounds.forEach(async ({ fileurl }) => {
      if (fileurl.slice(0, 4) == "temp") {
        await Deno.mkdir(path.join(tempDir, path.dirname(fileurl)), {
          recursive: true,
        });
        await Deno.writeFile(
          path.join(tempDir, fileurl),
          await Deno.readFile(path.join(dir, fileurl))
        );
      }
    });
  });
  console.log("정보를 불러오는 중...");
  Deno.writeFile(
    path.join(tempDir, "temp", "./project.json"),
    new TextEncoder().encode(JSON.stringify(project))
  );
  console.log("ent 파일을 만드는 중...");
  await tgz.compress(
    path.join(tempDir, "temp"),
    path.join(
      Deno.cwd(),
      `./${path.parse(data.watch as string).name}_v${target.tag}.ent`
    )
  );
  await Deno.remove(tempDir, { recursive: true });
  console.info("아카이브를 불러왔습니다.");
}

async function archiveList(name: string) {
  const data: BoxData = await boxData(name);
  const table: Table = Table.from([["tag", "uuid", "message"]]);
  if (args.limit) {
    data.list = data.list.slice(0, Number(args.limit));
  }
  if (args.gt) {
    data.list = data.list.filter((d) => gt(d.tag, args.gt as string));
  }
  if (args.lt) {
    data.list = data.list.filter((d) => lt(d.tag, args.lt as string));
  }
  data.list.forEach(({ tag, message, uuid }) => {
    table.push([tag, uuid as string, message]);
  });
  table.render();
}

export { archive, loadArchive, archiveList };
export type { ArchiveData };
