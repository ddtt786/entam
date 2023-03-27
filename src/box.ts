import { tgz, gzip, gunzip } from "https://deno.land/x/compress@v0.4.4/mod.ts";
import { cwdurl } from "../cli.ts";
import { exists } from "./lib.ts";
import { path } from "https://deno.land/x/compress@v0.4.4/deps.ts";
import { sprite } from "./sprite.ts";
import { dirname } from "https://deno.land/std@0.181.0/path/mod.ts";
import { Table } from "https://deno.land/x/cliffy@v0.25.7/table/mod.ts";

export async function watch(boxurl: URL, watch: string) {
  if (watch == undefined) {
    console.error("watch 명령어 뒤에는 .ent 파일의 이름이 와야 합니다.");
    Deno.exit();
  }
  watch += ".ent";
  if (!(await exists(new URL(`./${watch}`, cwdurl)))) {
    console.error(`"${watch}" 파일이 없습니다.`);
    Deno.exit();
  }
  const data: BoxData = JSON.parse(
    new TextDecoder().decode(
      await Deno.readFile(new URL(`./data.json`, boxurl))
    )
  );
  data.watch = new URL(`./${watch}`, cwdurl).toString();
  Deno.writeFile(
    new URL(`./data.json`, boxurl),
    new TextEncoder().encode(JSON.stringify(data))
  );
  console.log(`"${watch}" 를 주시합니다.`);
}

export async function archive(boxurl: URL, flags: BoxFlags) {
  const data: BoxData = JSON.parse(
    new TextDecoder().decode(
      await Deno.readFile(new URL(`./data.json`, boxurl))
    )
  );
  if (data.watch == null) {
    console.error(
      `상자에서 주시하고 있는 파일이 없습니다.\nwatch 명령어를 사용하세요.`
    );
    Deno.exit();
  }
  const uuid = crypto.randomUUID();
  try {
    console.log(".ent 파일을 푸는 중...");
    await tgz.uncompress(
      path.fromFileUrl(new URL(data.watch)),
      path.fromFileUrl(new URL(boxurl).toString())
    );
    if (await exists(new URL("./temp/project.json", boxurl))) {
      Deno.renameSync(
        new URL("./temp/project.json", boxurl),
        new URL(`./${uuid}.json`, boxurl)
      );
      Deno.writeFileSync(
        new URL(`./${uuid}.json`, boxurl),
        gzip(Deno.readFileSync(new URL(`./${uuid}.json`, boxurl)))
      );
    } else {
      console.error("심각한 문제 : project.json 파일이 없습니다.");
      Deno.exit();
    }
  } catch (error) {
    console.error("아카이브를 만드는 데 실패하였습니다.");
    console.error(error);
    Deno.exit();
  }
  data.version.unshift({
    uuid: uuid,
    version:
      flags.version ?? (data.version[0] ? data.version[0].version : "0.0.1"),
    msg: flags.msg ?? "업데이트",
  });
  console.log("정보를 쓰는 중...");
  await Deno.writeFile(
    new URL(`./data.json`, boxurl),
    new TextEncoder().encode(JSON.stringify(data))
  );
  console.log("성공적으로 아카이브가 생성되었습니다.");
}

export function packaging(boxurl: URL, flags: BoxFlags) {
  if (!flags.uuid || typeof flags.uuid == "boolean") {
    console.error("패키징할 uuid를 지정해야 합니다.\n--uuid를 사용하세요.");
    Deno.exit();
  }
  try {
    const data: BoxData = JSON.parse(
      new TextDecoder().decode(
        Deno.readFileSync(new URL(`./data.json`, boxurl))
      )
    );
    data.version.forEach(({ uuid, version }) => {
      if (uuid == flags.uuid) {
        console.log("상자를 확인하는 중...");
        const tempPath = new URL(`file:///${Deno.makeTempDirSync()}/`);
        const targetData = JSON.parse(
          new TextDecoder().decode(
            gunzip(Deno.readFileSync(new URL(`./${uuid}.json`, boxurl)))
          )
        );
        console.log("리소스를 불러오는 중...");
        targetData.objects.forEach(({ sprite }: { sprite: sprite }) => {
          sprite.pictures.forEach(({ fileurl }) => {
            if (fileurl.slice(0, 4) == "temp") {
              Deno.mkdirSync(new URL(dirname(fileurl), tempPath), {
                recursive: true,
              });
              Deno.writeFileSync(
                new URL(fileurl, tempPath),
                Deno.readFileSync(new URL(fileurl, boxurl))
              );
            }
          });
          sprite.sounds.forEach(({ fileurl }) => {
            if (fileurl.slice(0, 4) == "temp") {
              Deno.mkdirSync(new URL(dirname(fileurl), tempPath), {
                recursive: true,
              });
              Deno.writeFileSync(
                new URL(fileurl, tempPath),
                Deno.readFileSync(new URL(fileurl, boxurl))
              );
            }
          });
        });
        console.log("코드를 불러오는 중...");
        Deno.writeTextFile(
          new URL("./temp/project.json", tempPath),
          JSON.stringify(targetData)
        );
        tgz
          .compress(
            path.fromFileUrl(new URL("./temp", tempPath)),
            path.fromFileUrl(new URL(`./v${version}_${uuid}.ent`, cwdurl))
          )
          .then(() => {
            Deno.removeSync(tempPath, { recursive: true });
            console.log(`./v${version}_${uuid}.ent 파일을 만들었습니다.`);
            Deno.exit();
          });
      }
    });
  } catch (error) {
    console.error(".ent 파일을 만드는 데 실패했습니다.");
    console.error(error);
    Deno.exit();
  }
}

export async function list(boxurl: URL, flags: BoxFlags) {
  const data: BoxData = JSON.parse(
    new TextDecoder().decode(
      await Deno.readFile(new URL(`./data.json`, boxurl))
    )
  );
  let list = [];
  if (flags.version) {
    list = data.version.filter(({ version }) => version == flags.version);
  } else {
    list = data.version;
  }
  if (flags.limit) {
    list = list.slice(0, Number(flags.limit));
  }

  const table: string[][] = [["version", "uuid", "message"]];
  list.forEach(({ version, uuid, msg }) => {
    table.push([version, uuid, msg]);
  });
  return new Table(...table).toString();
}

export async function boxlist(boxurl: URL, flags: BoxFlags) {
  let list = [];

  for await (const dirEntry of Deno.readDir(boxurl)) {
    list.push([dirEntry.name]);
  }

  if (flags.limit) {
    list = list.slice(0, Number(flags.limit));
  }

  return new Table(...list).toString();
}

export type BoxData = {
  watch: string;
  version: {
    uuid: string;
    version: string;
    msg: string;
  }[];
};

export type BoxFlags = {
  version: string;
  msg: string;
  limit: string;
  uuid: string;
};
