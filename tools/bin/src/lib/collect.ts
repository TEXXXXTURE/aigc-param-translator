import fs from "fs";
import path from "path";
import { ManifestAsset, Manifest } from "../types";
import { splitFrontmatter } from "./yaml";
import { listFiles, isImageFile, today, toPosix } from "./fsx";

/** 收集资产文件夹：兼容两种结构 —— 分层「<kind>/<name>/」与平铺「<kind>.<name>/」；可含 _pending */
export function walkAssetDirs(root: string, includePending = false): string[] {
  const dirs: string[] = [];
  if (!fs.existsSync(root)) return dirs;
  for (const entry of fs.readdirSync(root)) {
    if (entry.startsWith(".")) continue;
    const p = path.join(root, entry);
    if (!fs.statSync(p).isDirectory()) continue;
    if (entry === "_pending" || entry === "_site") continue;
    if (isAssetFolder(p)) {
      dirs.push(p);                       // 平铺结构（兼容旧布局）
      continue;
    }
    for (const sub of fs.readdirSync(p)) {
      // 再下一层：<kind>/<name>/（分层结构）
      if (sub.startsWith(".")) continue;
      const sp = path.join(p, sub);
      if (fs.statSync(sp).isDirectory() && isAssetFolder(sp)) dirs.push(sp);
    }
  }
  if (includePending) {
    const pending = path.join(root, "_pending");
    if (fs.existsSync(pending)) {
      for (const entry of fs.readdirSync(pending)) {
        if (entry.startsWith(".")) continue;
        const p = path.join(pending, entry);
        if (fs.statSync(p).isDirectory() && isAssetFolder(p)) dirs.push(p);
      }
    }
  }
  return dirs.sort();
}

/** 资产夹判定：含 asset.md 即可（分层后文件夹名是纯 name，不再带 kind 前缀） */
export function isAssetFolder(dir: string): boolean {
  return fs.existsSync(path.join(dir, "asset.md"));
}

/** 读取一个资产文件夹 → manifest 条目；解析失败抛错 */
export function loadAsset(dir: string, root?: string): ManifestAsset {
  const mdPath = path.join(dir, "asset.md");
  if (!fs.existsSync(mdPath)) throw new Error(`缺少 asset.md: ${dir}`);
  const md = fs.readFileSync(mdPath, "utf8");
  const { meta, body } = splitFrontmatter(md);
  const mediaFiles = listFiles(path.join(dir, "media"));
  const variantFiles = listFiles(path.join(dir, "variants"));
  const all = [...mediaFiles, ...variantFiles];
  const thumbFile = all.find((p) => isImageFile(p)) ?? null;
  const base = path.basename(dir);
  const parent = path.basename(path.dirname(dir));
  // 分层结构下文件夹名是纯 name，id 由「分类目录名 + 文件夹名」拼回
  const guessId = /^[a-z]+\.[a-z0-9_]+$/.test(base) ? base : `${parent}.${base}`;
  const id =
    typeof meta.id === "string" && meta.id ? meta.id : guessId;
  return {
    ...(meta as Record<string, unknown> as ManifestAsset),
    id,
    folder: root ? toPosix(path.relative(root, dir)) : base,
    files: all.map((p) => path.basename(p)),
    thumb: thumbFile ? path.basename(thumbFile) : null,
    body,
  };
}

/** 读 manifest（library.json）；不存在则现场收集 */
export function readManifest(root: string): Manifest {
  const manifestPath = path.join(root, "library.json");
  if (fs.existsSync(manifestPath)) {
    try {
      return JSON.parse(fs.readFileSync(manifestPath, "utf8")) as Manifest;
    } catch {
      /* 损坏则重建 */
    }
  }
  return collectManifest(root);
}

/** 现场收集并返回 manifest（不落盘） */
export function collectManifest(root: string): Manifest {
  const assets = walkAssetDirs(root)
    .map((dir) => {
      try {
        return loadAsset(dir);
      } catch {
        return null;
      }
    })
    .filter((a): a is ManifestAsset => a !== null);
  return { generated_at: today(), assets };
}
