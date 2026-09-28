# 资产库模块 · LIBRARY.md（主协议 v0.1）

> 本文件是「资产库（library）」模块的主协议：把 AIGC 从业者的灵感与积累——平时看到的好内容、自己的优秀产出、随手记下的概念——沉淀为**可复用的个人资产**。
> 覆盖资产类型：图片 / 视频 / 文本 / 概念 / 故事 / 背景·世界观 / 人设 / 角色设计 / 风格 / 场景 / 材质 / 提示词 / 案例。
> 关联：`knowledge/assets.md`（插件接口契约）· `schema/plan.schema.json`（方案消费槽位）· 工作台看板（展示对接）· `library/sitegen.md`（一键展示站）。

---

## 1. 定位与一句话

**把"灵感和积累"变成"资产"，让资产在出图方案里被消费、在工作台里被展示、一键生成展示网站。**

- **文件夹即资产单元**：一个资产 = 一个文件夹（asset.md + media/ + variants/ + notes/），可搬运、可版本、可 Git。与工作台"预设 = 一个文件夹"同一哲学。
- **协议进 Skill，资产进用户目录**：本仓只定义协议（模型 / schema / 门禁 / 流程 / 生成器契约），用户的真实资产放在其指定的资产库根目录（如 `C:\Users\A\aigc-library`），不混入 Skill 仓。
- **不重做拆解**：抠图 / 拆层 / LoRA 训练 / 素材搜索继续走 `knowledge/assets.md` 的薄壳插件接口，本模块做的是**资产的组织、语义化、检索、消费与展示**。

## 2. 资产模型：介质轴 × 品类轴

一个资产必须同时落在两条轴上：

**介质轴（media）**：`image`（图片）/ `video`（视频）/ `text`（文本）/ `audio`（音频）/ `mixed`（混合）

**品类轴（kind）**（内容语义，超集覆盖原资产层 + 本模块新增）：

| kind | 中文 | 说明 | 典型消费槽位 |
|---|---|---|---|
| character | 角色 | 有视觉形象的角色（参考图 / 三视图 / LoRA） | reference_images / lora / character_card |
| persona | 人设 | 人物设定（性格 / 背景 / 动机 / 口头禅），文字为主 | character_card / prompt_text / story_context |
| chardesign | 角色设计 | 角色设计稿（概念稿 / 造型 / 配色 / 服装） | reference_images / style_weight |
| costume | 服饰 | 人设服饰参考（同一角色多套服装 / 造型细节） | reference_images / character_card |
| scene | 场景 | 环境场景图 / 空间设定 | reference_images / controlnet |
| worldview | 背景·世界观 | 世界观 / 背景设定文档（时间线 / 势力 / 规则） | story_context / prompt_text |
| style | 风格 | 画风 / 风格参考（光影 / 色调 / 质感） | style_weight / reference_images |
| shot | 镜头·摄影风格 | 镜头风格（焦段 / 构图 / 机位 / 运镜 / 景深），提示词或图文混合；对应传统影视"镜头编号预设" | prompt_text / controlnet / reference_images |
| concept | 概念 | 点子 / 创意 / 灵感片段（一句话或图文） | prompt_text / story_context |
| story | 故事 | 剧情 / 故事梗概 / 分镜 / 桥段 | story_context / prompt_text |
| material | 材质 | 材质参考（金属 / 布料 / 皮肤…） | reference_images / controlnet |
| object | 物体 | 道具 / 单体物体 | reference_images / controlnet |
| environment | 环境 | 氛围环境（光线 / 天气 / 时段） | reference_images / style_weight |
| prompt | 提示词 | 可复用的提示词模板 / 参数卡 | prompt_text / style_weight |
| case | 案例 | 需求 → 方案 → 结果 → 归因 的完整案例（进化回路产物） | reference_images / prompt_text |
| custom | 自定义 | 未归入以上类别的自定义资产 | — |

### 2.1 生成步骤 × 品类映射（"单人剧组"视角）

按文生图 / 多参考图生图的**准备步骤**组织资产——每一步对应传统剧组的一个"部门"，也是多参生图时的一组参考输入：

| 步骤 | 剧组视角 | 要准备的资产 | 品类 | 消费槽位 |
|---|---|---|---|---|
| ① 定"拍什么" | 编剧 / 世界观 | 概念、背景故事、世界观 | concept · story · worldview | story_context / prompt_text |
| ② 定"谁" | 服装与造型 | 人设（性格/动机）+ 服饰参考 | persona · costume | character_card / reference_images |
| ③ 定"长什么样" | 造型设计 | 角色设计（三视图/造型稿） | chardesign | reference_images |
| ④ 定"在哪" | 美术 | 场景参考图、环境氛围 | scene · environment | reference_images |
| ⑤ 定"有什么" | 道具 | 场景内物件（抠图成独立资产） | object | reference_images / controlnet |
| ⑥ 定"什么画风" | 美术指导 | 图片风格参考 | style | style_weight / reference_images |
| ⑦ 定"怎么拍" | 摄影 | 镜头风格（焦段/构图/运镜提示词） | shot | prompt_text / controlnet |
| ⑧ 贯穿全流程 | 场记 / 制片 | 提示词模板、材质参考 | prompt · material | prompt_text |

> 语义边界：**style = 画面长得像什么**（美术维度），**shot = 镜头怎么拍**（摄影维度）。同一风格可配不同镜头，同一镜头可配不同风格——检索时按步骤二选一即可。
> 传统影视的"镜头编号 / 风格预设"在本文档体系里分两层：方案级（`routes/presets/` 预设卡，管档位与参数）+ 资产级（本模块 `shot` 品类，管提示词与参考图）。常用 `shot` 资产可反向沉淀成新预设卡。

## 3. 命名规范

- 资产 id = **`<kind>.<name>`**，小写点分；name 内单词用下划线。示例：`character.cyberpunk_nomad`、`story.the_last_train`、`style.neon_noir`。
- **文件夹名 = 资产 id**，同层平铺（不嵌套分类目录，分类靠 kind 前缀 + 索引检索）。
- 版本：`version` 字段用 SemVer（`0.1.0`）；资产内容迭代 +1，id 不变。
- 命名规范继承早期《资产库标准化规范》的点分范式（ptn./cmp./token. → 此处 kind.name）。

## 4. 目录结构（folder-as-asset）

```text
<资产库根>/
├── 00-index.md                  # 总索引：Agent 维护，每资产一行（id / kind / media / name / what / stars / tags）
├── library.json                 # 导出 manifest：sitegen 与工作台看板读这份（由 00-index + 各 asset.md 生成）
├── _pending/                    # 待入库：未过门禁的采集物（structured 后未 gate 通过）
└── <kind>.<name>/               # ★ 一个资产 = 一个文件夹
    ├── asset.md                 # ★ 资产主档：frontmatter（schema 见 library/asset.schema.json）+ 正文
    ├── media/                   # 媒体原件：原图 / 视频 / 文本 / 音频（文件名可带用途后缀，如 hero.png、ref-01.png）
    ├── variants/                # 变体：比例版 / 风格版 / LoRA 训练集 / 条件图（controlnet）
    └── notes/                   # 笔记：灵感来源 / 拆解要点 / 关联方案 / 待验证想法
```

## 5. asset.md 主档

**frontmatter**（字段完整定义见 `library/asset.schema.json`）：

```yaml
---
id: character.cyberpunk_nomad
kind: character                # 品类轴
media: image                   # 介质轴：image|video|text|audio|mixed
name: 赛博浪客
created_at: 2026-09-28         # ISO8601
created_from: capture          # manual|capture|generation|training|import
source:                        # 来源登记（版权护栏）
  origin: 电影《××》截图        # 或 网页URL / 作品名 / 自产出图
  url: ""
  license_note: 仅供个人学习参考，商用前需替换
stars: 3                       # 星标 1–5：高价值资产标记（对齐 Octo 星标心智）
tags: [赛博朋克, 人物, 氛围]
semantics:
  what: 一句话说明这个资产是什么
  suitable_for: [reference_images, lora, character_card]
  restrictions: 底模兼容 / 使用前提 / 版权归属
consumed_in: []                # 被哪些方案消费过（plan id 列表，进化回路写入）
version: 0.1.0
---
```

**正文**（自由结构，建议含）：说明 / 来源故事 / 拆解笔记（为什么有价值、可怎么用）/ 关联资产。

## 6. 采集入库工作流（collect → structure → gate → index → consume）

> **执行载体**：推理（解读素材 / 补全语义 / 判断槽位）走本协议由 Agent 执行；确定性动作（建目录 / 拷贝 / 门禁校验 / 索引 / 检索 / 展示站）交给内置 CLI `ptr`（`tools/bin/`，见 README「CLI 工具：ptr」）。二者互补：Agent 判断"是什么、放哪、怎么用"，CLI 保证"结构正确、可检索、可展示"。

### 第 1 步 · 采集 collect
输入可为：URL（网页 / 视频页 / 图片链接）、本地文件、随手文本、出图结果、案例。
→ 文件落 `media/`；纯文本概念直接进正文；来源一并记录。

### 第 2 步 · 结构化 structure
Agent 读取素材，提取 frontmatter 草稿（kind / media / name / what / tags / suitable_for / source），**交给用户确认后再落盘**（沿用"只填槽不发挥"）。
无法确定的字段标"待确认"，不编造。

### 第 3 步 · 入库门禁 gate（不过门禁不进正式目录）
- [ ] id 符合 `<kind>.<name>` 点分命名
- [ ] frontmatter 必需字段齐全（id/kind/media/name/created_at/semantics.what/source）
- [ ] 有 `what`（一句话）和 ≥1 个 tag（可检索性）
- [ ] 来源已登记（含版权备注）
- [ ] 有至少一个 `suitable_for` 槽位（或显式标注"暂不消费"）
→ 通过 → 移入正式目录并建索引；未通过 → 留在 `_pending/` 并写明缺什么。

### 第 4 步 · 建索引 index
更新 `00-index.md`；按需生成 `library.json` manifest（sitegen / 看板消费）。

### 第 5 步 · 消费 consume
- 调参方案生成时（翻译循环第 3–5 步）：按需求类型调 `search_asset` → 命中写入 `plan.assets[]` → 解释器说明"为什么用这个资产"。
- 文本类资产（persona / story / worldview / concept / prompt）→ 注入提示词上下文槽位。
- 展示层：读 `library.json` → 工作台看板 / 一键展示站。

## 7. 与调参方案联动（消费槽位扩展）

原 `plan.schema.json` 的 `asset_ref.slot` 枚举扩展为：

`reference_images` / `ref_type` / `lora` / `controlnet` / `style_weight` / `prompt_text` / `story_context` / `character_card`

- 需求提"同一角色 / 同一产品 / 同一画风 / 沿用世界观 / 沿用这个人设"→ 必须检索对应资产；无命中时明确提示"建议先建资产"，并标注一致性风险。
- 引用必须带 `reason`；资产归属登记在 `source`，引用不主张归属（护栏：只组织与引用）。

## 8. 展示层（工作台 + 一键展示站）

### 8.1 manifest 契约（library.json）
由 `00-index.md` + 各 `asset.md` 生成，字段：`assets[] = { id, kind, media, name, what, tags, stars, thumb, files[], consumed_in[] }`。
**这是工作台看板与展示站的统一输入**；工作台看板绑定该输出类型即可展示（工作台开发前先定契约）。

### 8.2 一键展示站（sitegen）
契约见 `library/sitegen.md`：输入资产库根 → 输出静态站（首页画廊 + 品类筛选 + 详情页）→ 交付独立 HTML 或发布链接。**展示站 = 工作台看板外部化的最小实现**，不依赖工作台即可用。

### 8.3 工作台对接（将来）
- 看板窗口绑定输出类型 `library.json`；资产详情 = 看板内容页。
- 前端只声明与展示，无业务逻辑（遵守工作台 PRD 四条硬边界）。

## 9. 边界与护栏

- **协议进 Skill 仓，资产进用户资产库根**；Skill 不内置任何用户素材（示例资产除外，且显式标注"示例"）。
- 版权：只组织与引用，不主张归属；`source` 必填；引用他人素材须保留来源。
- 不替代审美：资产只提供"可复用的参考与上下文"，不承诺"用了就好"。
- 未核实字段标"待确认"，不编造来源 / 用途 / 效果。

## 10. 给 Agent 的执行指令

- **触发**：用户说"收藏 / 存进资产库 / 这是我的人设 / 把这个设为背景 / 以后出图都用这个风格 / 以后都用这种镜头机位"等 → 走采集入库工作流。
- **调参时**：方案生成前先检索资产（character / style / worldview / persona…），命中即引用并解释。
- **展示**：用户要求"展示我的资产 / 生成资产网站" → 按 `sitegen.md` 执行。
