import fs from "fs";
import path from "path";
import { Args } from "../main";
import { walkAssetDirs, loadAsset } from "../lib/collect";
import { validateAsset } from "../lib/schema";
import { splitFrontmatter } from "../lib/yaml";

/** ptr validate [asset目录|asset.md] —— 门禁校验；有任一问题 exit 1 */
export function runValidate(root: string, args: Args): void {
  const target = args._[0];
  if (target) {
    const p = path.resolve(target);
    const mdPath = fs.statSync(p).isDirectory() ? path.join(p, "asset.md") : p;
    if (!fs.existsSync(mdPath)) throw new Error(`未找到 asset.md：${p}`);
    const { meta } = splitFrontmatter(fs.readFileSync(mdPath, "utf8"));
    const errs = validateAsset(meta);
    report(path.basename(path.dirname(mdPath)), errs);
    return;
  }

  const dirs = walkAssetDirs(root, true);
  if (dirs.length === 0) {
    console.log("（空）无资产可校验");
    return;
  }
  let total = 0;
  let bad = 0;
  for (const d of dirs) {
    const a = loadAsset(d);
    const errs = validateAsset(a);
    total++;
    if (errs.length > 0) {
      bad++;
      report(a.id, errs);
    }
  }
  console.log(`校验完成：${total - bad}/${total} 通过` + (bad > 0 ? `，${bad} 条未通过门禁` : ""));
  if (bad > 0) process.exitCode = 1;
}

function report(id: string, errs: string[]): void {
  if (errs.length === 0) {
    console.log(`  ✓ ${id}`);
  } else {
    console.error(`  ✗ ${id}`);
    for (const e of errs) console.error(`      - ${e}`);
  }
}
