import fs from "fs";
import path from "path";
import { ensureDir, today } from "../lib/fsx";

/** ptr init [root] —— 初始化资产库骨架 */
export function runInit(root: string): void {
  ensureDir(root);
  ensureDir(path.join(root, "_pending"));

  const idxPath = path.join(root, "00-index.md");
  if (!fs.existsSync(idxPath)) {
    fs.writeFileSync(
      idxPath,
      `# 资产库索引\n\n> 由 \`ptr index\` 维护，勿手改。\n\n| id | kind | media | name | stars | what | tags |\n|---|---|---|---|---|---|---|\n`,
      "utf8"
    );
  }

  const manifestPath = path.join(root, "library.json");
  if (!fs.existsSync(manifestPath)) {
    fs.writeFileSync(
      manifestPath,
      JSON.stringify({ generated_at: today(), assets: [] }, null, 2),
      "utf8"
    );
  }

  const pendingReadme = path.join(root, "_pending", "README.md");
  if (!fs.existsSync(pendingReadme)) {
    fs.writeFileSync(
      pendingReadme,
      "# _pending\n\n未过门禁的采集物目录。补全 asset.md 的 `semantics.what` 与 `tags` 后运行 `ptr asset approve <id>` 通过门禁。\n",
      "utf8"
    );
  }

  console.log(`资产库已初始化：${root}`);
  console.log("结构：00-index.md · library.json · _pending/");
  console.log("提示：真实资产建议放独立目录（如 C:\\Users\\A\\aigc-library），或用环境变量 AIGC_LIBRARY_ROOT 指向它。");
}
