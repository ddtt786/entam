import { parse } from "flags";

const args = parse(Deno.args, {
  string: ["watch", "limit", "tag", "message", "uuid", "gt", "lt"],
  alias: {
    watch: ["w", "target"],
    limit: ["lim", "show"],
    tag: ["t"],
    message: ["m", "msg"],
    uuid: ["u"],
    gt: ["g"],
    lt: ["l"],
  },
});

export { args };
