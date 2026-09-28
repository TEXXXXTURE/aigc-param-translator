import path from "path";
import { runInit } from "./commands/init";
import { runAsset } from "./commands/asset";
import { runValidate } from "./commands/validate";
import { runIndex } from "./commands/index";
import { runSearch } from "./commands/search";
import { runSitegen } from "./commands/sitegen";

export interface Args {
  _: string[];
  [flag: string]: string | string[] | boolean | undefined;
}

function parseArgv(argv: string[]): Args {
  const out: Record<string, unknown> = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const eq = a.indexOf("=");
      if (eq > 0) {
        out[a.slice(2, eq)] = a.slice(eq + 1);
      } else {
        const key = a.slice(2);
        const next = argv[i + 1];
        if (next !== undefined && !next.startsWith("--")) {
          out[key] = next;
          i++;
        } else {
          out[key] = true;
        }
      }
    } else {
      (out._ as string[]).push(a);
    }
  }
  return out as Args;
}

function resolveRoot(args: Args): string {
  if (typeof args.root === "string") return path.resolve(args.root);
  const env = process.env.AIGC_LIBRARY_ROOT;
  if (env) return path.resolve(env);
  return path.resolve(process.cwd(), "assets-library");
}

const HELP = `ptr —— AIGC 调参翻译器资产库 CLI（确定性操作）

用法：
  ptr init [--root 目录]                     初始化资产库骨架（00-index / library.json / _pending）
  ptr asset add <文件|URL|文本> --kind <k>    采集入库 → _pending 草稿
        [--name n] [--media m] [--tags a,b] [--from manual|capture]
  ptr asset ls [--root 目录]                  列出资产（含 _pending）
  ptr asset approve <id> [--root 目录]         过门禁：校验通过后移入正式目录
  ptr validate [资产目录|asset.md] [--root]    门禁校验（有任一问题退出码 1）
  ptr index [--root 目录]                     生成 00-index.md + library.json
  ptr search <关键词> [--kind k] [--tag t]    检索资产
  ptr sitegen [--root 目录] [--out 目录]       一键生成静态展示站（默认 <root>/_site）

根目录解析：--root 参数 > 环境变量 AIGC_LIBRARY_ROOT > ./assets-library
品类（kind）：character persona chardesign costume scene worldview style shot concept story material object environment prompt case custom
`;

export async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  if (argv.length === 0 || argv[0] === "--help" || argv[0] === "-h" || argv[0] === "help") {
    console.log(HELP);
    return;
  }
  const raw: Args = parseArgv(argv);
  const command = raw._[0];
  const rest: Args = { ...raw, _: raw._.slice(1) };

  try {
    switch (command) {
      case "init": {
        const root = typeof raw.root === "string" ? path.resolve(raw.root) : path.resolve(rest._[0] ?? "assets-library");
        runInit(root);
        break;
      }
      case "asset":
        await runAsset(resolveRoot(rest), rest);
        break;
      case "validate":
        runValidate(resolveRoot(rest), rest);
        break;
      case "index":
        runIndex(resolveRoot(rest), rest);
        break;
      case "search":
        runSearch(resolveRoot(rest), rest);
        break;
      case "sitegen":
        runSitegen(resolveRoot(rest), rest);
        break;
      default:
        console.error(`未知命令：${command}\n`);
        console.log(HELP);
        process.exitCode = 1;
    }
  } catch (e) {
    console.error(`错误：${(e as Error).message}`);
    process.exitCode = 1;
  }
}

main();
