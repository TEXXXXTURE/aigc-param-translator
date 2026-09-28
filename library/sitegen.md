# sitegen · 一键展示站生成器契约（v0.1）

> 目的：把资产库根目录变成**一个静态展示网站**——首页画廊 + 品类筛选 + 详情页。展示站 = 工作台看板外部化的最小实现：不依赖工作台即可用，工作台看板将来绑定同一份 `library.json`。

## 1. 输入 / 输出

- **输入**：资产库根目录（含 `00-index.md` 与各 `asset.md`，或直接生成 `library.json`）。
- **输出**：一个自包含静态站：
  - `index.html` —— 画廊首页（缩略图网格 + 按 kind / media / tag 筛选）
  - `asset/<id>.html` —— 每个资产的详情页（media 原件、语义、来源、消费记录）
  - 全部 CSS/JS 内联或随目录携带，不依赖外网 CDN（离线可开）。

## 2. 生成步骤（Agent 执行）

1. 读 `00-index.md` + 各 `asset.md` → 生成 `library.json`（manifest 契约见 LIBRARY.md §8.1）。
2. 缩略图：`media/` 主图生成小尺寸 thumb（用现成图像工具；失败降级用原图直链）。
3. 按静态站模板渲染 `index.html` + `asset/*.html`。
4. 交付：独立 HTML 文件（可双击打开）或发布链接（用户指定位置 / gh-pages）。

## 3. 页面内容（最少可理解）

- **首页**：标题（"我的 AIGC 资产库"）+ 资产总数 / 分类计数；缩略图网格（thumb + name + kind 徽标 + stars）；筛选条（kind / media / tag，纯前端过滤）。
- **详情页**：media 原件展示（图 / 视频可播放 / 文本全文）；semantics.what；tags；source（含版权备注）；suitable_for 槽位徽标；consumed_in 记录；notes 折叠区。

## 4. 边界

- **只读不写**：生成器不得修改资产库内任何 `asset.md` / 媒体文件（例外：允许写入/刷新 `library.json`）。
- **版权**：站点只做展示，不额外主张归属；`source` 中的备注原样呈现。
- **失败降级**：无缩略图 → 显示占位；JS 失效 → 静态 HTML 仍完整可读。

## 5. 落地形态（待拍板）

- 当前为契约文档。可选落地一个零依赖 `library/sitegen.py`（标准库即可，Windows/Linux 通吃），实现"一条命令生成整站"。
- 若你已有工作台展示方案，本契约可与工作台看板绑定共用同一 `library.json`，避免两套格式。
