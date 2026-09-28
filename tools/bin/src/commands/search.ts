import { Args } from "../main";
import { readManifest, collectManifest } from "../lib/collect";
import { ManifestAsset } from "../types";

/** ptr search <query> [--kind k] [--tag t] —— 关键词检索（id/name/what/tags/kind） */
export function runSearch(root: string, args: Args): void {
  const query = (args._[0] ?? "").toLowerCase().trim();
  const kind = typeof args.kind === "string" ? args.kind.toLowerCase() : "";
  const tag = typeof args.tag === "string" ? args.tag.toLowerCase() : "";

  let assets: ManifestAsset[];
  try {
    assets = readManifest(root).assets;
  } catch {
    assets = collectManifest(root).assets;
  }

  const hits = assets.filter((a) => {
    if (kind && a.kind.toLowerCase() !== kind) return false;
    if (tag && !(a.tags ?? []).some((t) => t.toLowerCase().includes(tag))) return false;
    if (!query) return true;
    const hay = [a.id, a.name, a.kind, a.semantics?.what ?? "", (a.tags ?? []).join(" ")]
      .join(" ")
      .toLowerCase();
    return hay.includes(query);
  });

  if (hits.length === 0) {
    console.log(`无命中${query ? `：${query}` : ""}`);
    return;
  }
  console.log(`${hits.length} 条命中：`);
  for (const a of hits) {
    console.log(`  ${a.id.padEnd(40)} ${a.kind.padEnd(12)} ${a.media.padEnd(6)} ★${a.stars ?? 0}`);
    console.log(`      ${(a.semantics?.what ?? "").slice(0, 60)}`);
  }
}
