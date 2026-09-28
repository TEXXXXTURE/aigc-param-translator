import fs from "fs";
import path from "path";
import { Args } from "../main";
import { readManifest } from "../lib/collect";
import { ensureDir, listFiles, toPosix, mediaTypeOf } from "../lib/fsx";
import { escapeHtml } from "../lib/util";
import { ManifestAsset } from "../types";

/** ptr sitegen [root] [--out 目录] —— 一键生成静态展示站 */
export function runSitegen(root: string, args: Args): void {
  const manifest = readManifest(root);
  const out = typeof args.out === "string" ? path.resolve(args.out) : path.join(root, "_site");
  ensureDir(out);
  ensureDir(path.join(out, "asset"));

  for (const a of manifest.assets) writeDetailPage(root, out, a);
  writeIndexPage(root, out, manifest.assets);

  console.log(`展示站已生成：${out}`);
  console.log(`资产 ${manifest.assets.length} 条；入口：${path.join(out, "index.html")}`);
}

function writeIndexPage(root: string, out: string, assets: ManifestAsset[]): void {
  const kinds = [...new Set(assets.map((a) => a.kind))];
  const cards = assets
    .map((a) => {
      const thumb = a.thumb ? mediaRel(out, root, a, a.thumb) : null;
      const img = thumb
        ? `<img src="${escapeHtml(thumb)}" alt="${escapeHtml(a.name)}" loading="lazy">`
        : `<div class="ph">${escapeHtml(a.kind.slice(0, 2).toUpperCase())}</div>`;
      const tags = (a.tags ?? []).map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("");
      return `<a class="card" data-kind="${escapeHtml(a.kind)}" data-search="${escapeHtml([a.id, a.name, a.semantics?.what ?? ""].join(" ").toLowerCase())}" href="asset/${escapeHtml(a.id)}.html">
        <div class="thumb">${img}</div>
        <div class="body">
          <div class="row"><span class="badge">${escapeHtml(a.kind)}</span><span class="stars">${"★".repeat(Math.max(0, Math.min(5, a.stars ?? 0))) || "☆"}</span></div>
          <div class="name">${escapeHtml(a.name)}</div>
          <div class="what">${escapeHtml(a.semantics?.what ?? "")}</div>
          <div class="tags">${tags}</div>
        </div>
      </a>`;
    })
    .join("\n");

  const chips = kinds
    .map((k) => `<button class="chip" data-kind="${escapeHtml(k)}">${escapeHtml(k)}</button>`)
    .join("");

  const html = `<!DOCTYPE html>
<html lang="zh">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>我的 AIGC 资产库</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: system-ui, -apple-system, "Segoe UI", sans-serif; margin: 0; background: #f3f5f7; color: #1f2937; }
  header { background: #fff; border-bottom: 1px solid #e5e7eb; padding: 18px 22px; }
  h1 { margin: 0 0 4px; font-size: 20px; }
  .sub { color: #6b7280; font-size: 13px; }
  .bar { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin-top: 10px; }
  input[type=search] { flex: 1; min-width: 160px; padding: 7px 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; }
  .chip { padding: 5px 12px; border: 1px solid #d1d5db; border-radius: 999px; background: #fff; font-size: 13px; cursor: pointer; }
  .chip.on { background: #0f766e; color: #fff; border-color: #0f766e; }
  main { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 14px; padding: 20px 22px; }
  .card { background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden; text-decoration: none; color: inherit; display: flex; flex-direction: column; }
  .thumb { height: 150px; background: #eef1f4; display: flex; align-items: center; justify-content: center; }
  .thumb img { width: 100%; height: 100%; object-fit: cover; }
  .ph { font-size: 28px; color: #9ca3af; font-weight: 700; }
  .body { padding: 10px 12px; display: flex; flex-direction: column; gap: 4px; }
  .row { display: flex; justify-content: space-between; align-items: center; }
  .badge { font-size: 11px; background: #e0f2f1; color: #0f766e; padding: 2px 8px; border-radius: 999px; }
  .stars { font-size: 12px; color: #f59e0b; }
  .name { font-weight: 600; font-size: 14px; }
  .what { font-size: 12px; color: #6b7280; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .tags { margin-top: 4px; }
  .tag { font-size: 11px; background: #f3f4f6; padding: 1px 7px; border-radius: 999px; margin-right: 4px; color: #4b5563; }
  .empty { display: none; padding: 40px; text-align: center; color: #9ca3af; }
</style>
</head>
<body>
<header>
  <h1>我的 AIGC 资产库</h1>
  <div class="sub">${assets.length} 条资产 · 由 ptr sitegen 生成 · 协议：aigc-param-translator/library</div>
  <div class="bar">
    <input type="search" id="q" placeholder="搜索名称 / 描述 / 标签…" aria-label="搜索">
    <button class="chip on" data-kind="">全部</button>${chips}
  </div>
</header>
<main id="grid">${cards}</main>
<div class="empty" id="empty">无匹配资产</div>
<script>
(function () {
  var q = document.getElementById("q");
  var chips = document.querySelectorAll(".chip");
  var cards = document.querySelectorAll(".card");
  var empty = document.getElementById("empty");
  var kind = "";
  function apply() {
    var kw = (q.value || "").toLowerCase();
    var shown = 0;
    cards.forEach(function (c) {
      var ok = (!kind || c.getAttribute("data-kind") === kind) && (!kw || c.getAttribute("data-search").indexOf(kw) >= 0);
      c.style.display = ok ? "" : "none";
      if (ok) shown++;
    });
    empty.style.display = shown ? "none" : "block";
  }
  chips.forEach(function (c) {
    c.addEventListener("click", function () {
      kind = c.getAttribute("data-kind") || "";
      chips.forEach(function (x) { x.classList.toggle("on", x === c); });
      apply();
    });
  });
  q.addEventListener("input", apply);
})();
</script>
</body>
</html>`;
  fs.writeFileSync(path.join(out, "index.html"), html, "utf8");
}

function writeDetailPage(root: string, out: string, a: ManifestAsset): void {
  const assetDir = path.join(root, a.folder);
  const base = toPosix(path.relative(path.join(out, "asset"), assetDir)); // ../../<folder>
  const thumb = a.thumb ? `${base}/media/${a.thumb}` : null;

  const mediaFiles = listFiles(path.join(assetDir, "media")).map((p) => path.basename(p));
  const variantFiles = listFiles(path.join(assetDir, "variants")).map((p) => path.basename(p));
  const notes = listFiles(path.join(assetDir, "notes")).map((p) => path.basename(p));

  const embed = (f: string, sub: string): string => {
    const t = mediaTypeOf(f);
    const rel = `${base}/${sub}/${f}`;
    if (t === "image") return `<img src="${escapeHtml(rel)}" alt="${escapeHtml(f)}" loading="lazy">`;
    if (t === "video") return `<video src="${escapeHtml(rel)}" controls preload="metadata"></video>`;
    if (t === "audio") return `<audio src="${escapeHtml(rel)}" controls></audio>`;
    return `<a href="${escapeHtml(rel)}" target="_blank">${escapeHtml(f)}</a>`;
  };

  const gallery = [
    ...mediaFiles.map((f) => embed(f, "media")),
    ...variantFiles.map((f) => embed(f, "variants")),
  ].join("\n");

  const bodyHtml = (a.body || "")
    .split(/\n\s*\n/)
    .map((p) => `<p>${escapeHtml(p).replace(/\n/g, "<br>")}</p>`)
    .join("\n");

  const html = `<!DOCTYPE html>
<html lang="zh">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(a.name)} · 我的 AIGC 资产库</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: system-ui, -apple-system, "Segoe UI", sans-serif; margin: 0; background: #f3f5f7; color: #1f2937; }
  .wrap { max-width: 860px; margin: 0 auto; padding: 20px 18px; }
  a.back { color: #0f766e; text-decoration: none; font-size: 14px; }
  h1 { font-size: 22px; margin: 10px 0 2px; }
  .meta { font-size: 13px; color: #6b7280; margin-bottom: 14px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; background: #fff; border-radius: 8px; overflow: hidden; }
  td { padding: 7px 10px; border-bottom: 1px solid #f3f4f6; vertical-align: top; }
  td.k { width: 130px; color: #6b7280; font-weight: 600; }
  .gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 10px; margin: 14px 0; }
  .gallery img, .gallery video { width: 100%; border-radius: 8px; background: #e5e7eb; }
  .gallery audio { width: 100%; }
  .body { background: #fff; border-radius: 8px; padding: 14px 16px; font-size: 14px; line-height: 1.7; margin-top: 14px; }
  .tag { font-size: 11px; background: #e0f2f1; color: #0f766e; padding: 2px 8px; border-radius: 999px; margin-right: 4px; }
  .badge { font-size: 11px; background: #e8f0fe; color: #1e40af; padding: 2px 8px; border-radius: 999px; }
</style>
</head>
<body>
<div class="wrap">
  <a class="back" href="../index.html">← 返回资产库</a>
  <h1>${escapeHtml(a.name)}</h1>
  <div class="meta"><span class="badge">${escapeHtml(a.kind)}</span> · ${escapeHtml(a.media)} · ★${a.stars ?? 0} · ${escapeHtml(a.created_at)}</div>
  <table>
    <tr><td class="k">id</td><td>${escapeHtml(a.id)}</td></tr>
    <tr><td class="k">是什么</td><td>${escapeHtml(a.semantics?.what ?? "")}</td></tr>
    <tr><td class="k">可进槽位</td><td>${escapeHtml((a.semantics?.suitable_for ?? []).join(" / "))}</td></tr>
    <tr><td class="k">限制</td><td>${escapeHtml(a.semantics?.restrictions ?? "")}</td></tr>
    <tr><td class="k">标签</td><td>${(a.tags ?? []).map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("")}</td></tr>
    <tr><td class="k">来源</td><td>${escapeHtml(a.source?.origin ?? "")}${a.source?.url ? ` · <a href="${escapeHtml(a.source.url)}" target="_blank">链接</a>` : ""}${a.source?.license_note ? ` · ${escapeHtml(a.source.license_note)}` : ""}</td></tr>
    <tr><td class="k">被方案消费</td><td>${escapeHtml((a.consumed_in ?? []).join(" / ") || "—")}</td></tr>
  </table>
  ${gallery ? `<div class="gallery">${gallery}</div>` : ""}
  ${notes.length ? `<p style="font-size:13px;color:#6b7280;">笔记：${notes.map((n) => `<a href="${escapeHtml(`${base}/notes/${n}`)}" target="_blank">${escapeHtml(n)}</a>`).join(" · ")}</p>` : ""}
  <div class="body">${bodyHtml || "<p>（暂无正文说明）</p>"}</div>
</div>
</body>
</html>`;
  fs.writeFileSync(path.join(out, "asset", `${a.id}.html`), html, "utf8");
}

function mediaRel(pageDir: string, root: string, a: ManifestAsset, file: string): string {
  return toPosix(path.relative(pageDir, path.join(root, a.folder, "media", file)));
}
