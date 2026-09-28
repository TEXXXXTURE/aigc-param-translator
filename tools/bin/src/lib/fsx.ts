import fs from "fs";
import path from "path";

export function ensureDir(p: string): void {
  fs.mkdirSync(p, { recursive: true });
}

/** 目录名是否符合 <kind>.<name> 且内含 asset.md（= 正式资产文件夹） */
export function isAssetDir(dir: string): boolean {
  const base = path.basename(dir);
  return /^[a-z]+\.[a-z0-9_]+$/.test(base) && fs.existsSync(path.join(dir, "asset.md"));
}

const IMG = ["png", "jpg", "jpeg", "webp", "gif", "bmp", "svg", "avif", "heic"];
const VID = ["mp4", "mov", "webm", "mkv", "avi", "m4v"];
const AUD = ["mp3", "wav", "aac", "m4a", "ogg", "flac"];
const TXT = ["md", "txt", "markdown", "json", "yaml", "yml"];

export function mediaTypeOf(file: string): string {
  const ext = path.extname(file).toLowerCase().replace(".", "");
  if (IMG.includes(ext)) return "image";
  if (VID.includes(ext)) return "video";
  if (AUD.includes(ext)) return "audio";
  if (TXT.includes(ext)) return "text";
  return "mixed";
}

export function isImageFile(file: string): boolean {
  const ext = path.extname(file).toLowerCase().replace(".", "");
  return IMG.includes(ext);
}

export async function copyFile(src: string, dest: string): Promise<void> {
  fs.copyFileSync(src, dest);
}

export async function download(url: string, dest: string): Promise<void> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`下载失败 ${res.status}: ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(dest, buf);
}

export function listFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((n) => !n.startsWith("."))
    .map((n) => path.join(dir, n))
    .filter((p) => fs.statSync(p).isFile());
}

export function today(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function guessExtFromUrl(url: string): string {
  try {
    const p = new URL(url).pathname;
    const ext = path.extname(p).toLowerCase();
    if (ext && ext.length <= 5) return ext;
  } catch {
    /* ignore */
  }
  return ".bin";
}

/** 相对引用：从 site 内页面定位资产文件夹里的文件 */
export function relFromSiteToAsset(siteDir: string, assetDir: string, file: string): string {
  const from = path.resolve(siteDir);
  const target = path.resolve(assetDir, file);
  return toPosix(path.relative(from, target));
}

export function toPosix(p: string): string {
  return p.split(path.sep).join("/");
}
