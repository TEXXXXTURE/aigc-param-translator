import fs from "fs";
import path from "path";
import { Args } from "../main";
import { ensureDir, today, mediaTypeOf, copyFile, download, guessExtFromUrl } from "../lib/fsx";
import { slugify } from "../lib/util";
import { KINDS, validateAsset } from "../lib/schema";
import { renderYaml, splitFrontmatter } from "../lib/yaml";
import { AssetMeta } from "../types";
import { walkAssetDirs, loadAsset } from "../lib/collect";

/** 子命令入参：main 已将 "asset" 前缀剥离，args._ = [子命令, ...] */
export async function runAsset(root: string, args: Args): Promise<void> {
  const sub = args._[0] ?? "";
  if (sub === "add") return add(root, args);
  if (sub === "ls") return ls(root);
  if (sub === "approve") return approve(root, args);
  throw new Error("用法：ptr asset add|ls|approve");
}

async function add(root: string, args: Args): Promise<void> {
  const src = args._[1];
  if (!src) throw new Error("用法：ptr asset add <本地文件|URL|文本> --kind <k> [--name n] [--media m] [--tags a,b] [--from manual|capture]");
  const kind = typeof args.kind === "string" ? args.kind : "";
  if (!KINDS.includes(kind as never)) throw new Error(`--kind 必填且需在枚举内：${KINDS.join("/")}`);

  const isFile = fs.existsSync(src);
  const isUrl = /^https?:\/\//i.test(src);

  let name = typeof args.name === "string" ? args.name : "";
  if (!name) {
    if (isFile) name = path.basename(src, path.extname(src));
    else if (isUrl) name = new URL(src).hostname.replace(/^www\./, "");
    else name = "idea";
  }

  const media = typeof args.media === "string" ? args.media : isFile ? mediaTypeOf(src) : isUrl ? "mixed" : "text";
  const slug = slugify(name) || "asset_" + Date.now();
  const id = `${kind}.${slug}`;
  const dir = path.join(root, "_pending", id);
  ensureDir(dir);
  ensureDir(path.join(dir, "media"));

  let copied: string | null = null;
  if (isFile) {
    const target = path.join(dir, "media", path.basename(src));
    await copyFile(src, target);
    copied = path.basename(src);
  } else if (isUrl) {
    const fname = slugify(name) + guessExtFromUrl(src);
    await download(src, path.join(dir, "media", fname));
    copied = fname;
  } else {
    fs.writeFileSync(path.join(dir, "media", "idea.txt"), src, "utf8");
    copied = "idea.txt";
  }

  const tags = typeof args.tags === "string" ? args.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];
  const created_from = typeof args.from === "string" ? args.from : isUrl ? "capture" : isFile ? "capture" : "manual";
  const meta: AssetMeta = {
    id,
    kind,
    media,
    name,
    created_at: today(),
    created_from,
    source: {
      origin: isUrl ? src : isFile ? `本地文件: ${src}` : "灵感笔记",
      url: isUrl ? src : "",
      license_note: "",
    },
    stars: 0,
    tags,
    semantics: { what: "", suitable_for: [] },
    consumed_in: [],
    version: "0.1.0",
  };

  const md = `---\n${renderYaml(meta as Record<string, unknown>)}\n---\n\n# ${name}\n\n（待补充说明：这个资产是什么、为什么有价值、怎么用；补全 semantics.what 与 tags 后通过门禁）\n`;
  fs.writeFileSync(path.join(dir, "asset.md"), md, "utf8");

  console.log(`草稿已写入：${dir}`);
  if (copied) console.log(`媒体原件：media/${copied}`);
  console.log(`下一步：补全 asset.md 的 semantics.what 与 tags → ptr asset approve ${id}`);
}

function ls(root: string): void {
  const rows = walkAssetDirs(root, true)
    .map((d) => {
      try {
        return loadAsset(d);
      } catch {
        return null;
      }
    })
    .filter((a): a is NonNullable<typeof a> => a !== null);
  if (rows.length === 0) {
    console.log("（空）资产库暂无资产；ptr asset add 或手动放入 <kind>.<name>/ 文件夹");
    return;
  }
  console.log(`${rows.length} 条资产：`);
  for (const a of rows) {
    console.log(`  ${a.id.padEnd(40)} ${a.kind.padEnd(12)} ${a.media.padEnd(6)} ★${a.stars ?? 0}  ${(a.semantics?.what ?? "").slice(0, 42)}`);
  }
}

function approve(root: string, args: Args): void {
  const id = args._[1];
  if (!id) throw new Error("用法：ptr asset approve <id>");
  const pendingDir = path.join(root, "_pending", id);
  const assetMd = path.join(pendingDir, "asset.md");
  if (!fs.existsSync(assetMd)) throw new Error(`未在 _pending/ 找到资产 ${id}；如已在正式目录则无需 approve`);

  const md = fs.readFileSync(assetMd, "utf8");
  const { meta } = splitFrontmatter(md);
  const errs = validateAsset(meta);
  if (errs.length > 0) {
    console.error(`门禁未通过（${errs.length} 项），资产留在 _pending/：`);
    for (const e of errs) console.error("  - " + e);
    process.exitCode = 1;
    return;
  }
  const dest = path.join(root, id);
  if (fs.existsSync(dest)) throw new Error(`正式目录已存在同名资产：${id}`);
  fs.renameSync(pendingDir, dest);
  console.log(`已通过门禁：${id} → 正式目录`);
  console.log("运行 ptr index 更新索引 / manifest");
}
