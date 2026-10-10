import fs from "fs";
import path from "path";
import { Args } from "../main";
import { collectManifest, loadAsset, walkAssetDirs } from "../lib/collect";
import { today } from "../lib/fsx";
import { escapeHtml } from "../lib/util";

/** ptr index [root] —— 生成 00-index.md + library.json */
export function runIndex(root: string, _args: Args): void {
  const dirs = walkAssetDirs(root, false);
  if (dirs.length === 0) {
    console.log("（空）无正式资产；ptr asset approve 或手动放入 <kind>.<name>/ 后重跑");
  }

  const assets = dirs
    .map((d) => {
      try {
        return loadAsset(d, root);
      } catch (e) {
        console.error(`跳过无法解析的资产目录：${d}（${(e as Error).message}）`);
        return null;
      }
    })
    .filter((a): a is NonNullable<typeof a> => a !== null);

  const manifest = { generated_at: today(), assets };
  fs.writeFileSync(
    path.join(root, "library.json"),
    JSON.stringify(manifest, null, 2),
    "utf8"
  );

  const rows = assets
    .map(
      (a) =>
        `| ${escapeHtml(a.id)} | ${escapeHtml(a.kind)} | ${escapeHtml(a.media)} | ${escapeHtml(a.name)} | ★${a.stars ?? 0} | ${escapeHtml(a.semantics?.what ?? "")} | ${escapeHtml((a.tags ?? []).join(" / "))} |`
    )
    .join("\n");
  const idx = `# 资产库索引\n\n> 由 \`ptr index\` 生成（${today()}）。协议见 aigc-param-translator/library/LIBRARY.md\n\n共 ${assets.length} 条资产。\n\n| id | kind | media | name | stars | what | tags |\n|---|---|---|---|---|---|---|\n${rows}\n`;
  fs.writeFileSync(path.join(root, "00-index.md"), idx, "utf8");

  const byKind = new Map<string, number>();
  for (const a of assets) byKind.set(a.kind, (byKind.get(a.kind) ?? 0) + 1);
  const warn = assets.filter((a) => !a.semantics?.what || (a.tags ?? []).length === 0);

  console.log(`索引完成：${assets.length} 条资产`);
  console.log("分类：" + [...byKind.entries()].map(([k, n]) => `${k}×${n}`).join(" · "));
  if (warn.length > 0) {
    console.warn(`注意：${warn.length} 条缺 what 或 tags（可检索性不足）：${warn.map((a) => a.id).join(", ")}`);
  }
  console.log("已写入：library.json · 00-index.md");
}
