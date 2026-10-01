# 灵感源模块 · SOURCES.md（主协议 v0.1-draft）

> 本文件是「灵感源（sources）」模块的主协议：把 AIGC 工作里"找资产、找灵感"这一步变成**可检索的路由表**——什么需求 → 去哪个站 → 怎么用 → 能不能采。
> 与资产库（library）的关系：sources 是**上游路由**（去哪找），library 是**下游沉淀**（找到的入库）；采集执行仍走 library 五步工作流与 `knowledge/assets.md` 插件接口，本模块不做重复的搜图执行。

## 1. 定位与一句话

**帮 AIGC 使用者省下"找"的时间：需求 → 用途 → 站点 → 用法 → 采集动作，一条路由到底。**

- **差异化价值不是"有哪些网站"**（web 搜索 / 收藏夹都能给 URL），而是三件事：
  1. **用途路由**：什么需求该去哪个站（purpose / kind_targets）
  2. **使用技巧**：去了怎么用（search_hint：板块 / 关键词 / 登录墙）
  3. **版权分级**：能不能采、采了怎么挂（license / harvest → 决定采集动作）
- **站点是"指针"，不是"资产"**：单文件条目，**不进 folder-as-asset**（不建 media/ variants/）；个人收藏另走用户层。
- **两层存放**：skill 仓内置精选目录（公共知识，随仓分发，只读）+ 用户资产库 `sources/user-sources.yaml`（个人收藏，检索时合并，可覆盖）。

## 2. 存储形式（两层）

```text
skill 仓（内置，只读）
sources/
├── SOURCES.md          # 本协议
├── registry.yaml       # ★ 精选目录：每站一段 frontmatter 条目
└── sources.json        # 由 registry.yaml 生成的 manifest（检索 / 展示统一输入；当前手工同步草稿，后续由 ptr source index 生成）

用户资产库根（个人收藏层）
<aigc-library>/sources/
└── user-sources.yaml   # 个人收藏条目；检索时与内置层合并，用户层追加 / 覆盖
```

## 3. 条目 schema（字段草稿，待拍板）

```yaml
id: source.<slug>          # 点分命名，slug 限 ASCII
name: 站点名
purpose: 一句话：什么需求会来这
url: https://...
kind_targets: [kind...]    # 可从这里采哪些资产品类 → 直接挂资产库品类轴
access: open | login | api # 访问条件；登录墙 Agent 不硬闯
harvest: manual | download # manual=仅参考+存链接；download=可直接下载入库
license: 版权声明          # ★ 必填，版权护栏（资产库 §9 延伸）
search_hint: 怎么用：板块 / 关键词 / 入口
stars: 1-5
tags: [标签...]
last_checked: YYYY-MM-DD
status: draft | active     # draft=草稿待确认，active=已收录
```

## 4. 分类轴（用途轴，随收录扩充）

| 用途类 | 说明 | 当前条目 |
|---|---|---|
| 影视配色 / 帧参考 | 电影配色、空间、光影、构图帧级参考 | source.yeguozi |
| 资讯 / 教程 / 提示词知识站 | AIGC 行业资讯、提示词库、工作流规范 | source.mokeaigc |
| 概念 / 美术灵感 | 角色 / 场景概念图（ArtStation 类） | 待收录 |
| 提示词 / 模型社区 | Civitai / PromptHero 类 | 待收录 |
| 免费可商用素材 | 可直接下载入库的材质 / HDR / 贴图 | 待收录 |
| 3D 资产 | Sketchfab 类 | 待收录 |
| 摄影 / 运镜参考 | Film-Grab / Shotdeck 类 | 待收录 |

> 一条站点可落多个用途类，按 kind_targets 检索命中，不以分类目录嵌套。

## 5. 检索与调用

- **检索（Agent 推理 + CLI 确定性）**：需求 → 映射用途 / kind → `ptr source search <关键词|kind>`（内置 + 用户层合并，--json 输出）→ Agent 选 top 2-3 并带 search_hint 推荐。`ptr source search/list` 命令族为**待办**（拍板后落地，复用 ptr index/search 模式）。
- **调用三档**：
  1. 推荐：给站 + 用法（search_hint）
  2. 导航：browser 打开；先判 access，登录墙不硬闯
  3. 采集闭环：触发资产库五步（collect → structure → gate → index → consume），`source.url` 自动回填站点条目；license / harvest 决定动作——download 直采 / manual 只存链接

## 6. 触发规则（待接入 SKILL.md §6.x）

- 用户说"找灵感 / 找个参考站 / 这种风格去哪找 / 给我几个能采素材的站" → 检索本目录并推荐。
- 采集入库时：站点条目命中 → `asset.md.source.url` 回填 → kind 参考 kind_targets 建议。
- 无命中时：给出 web 搜索建议，并把新站收录申请记入待收录（不擅自扩内置目录）。

## 7. 更新纪律

- **精选不贪多**：目标 30-50 条（人工可维护量级），收录标准 = 人工验证过 + 有明确用途 + 能写清怎么用；不收录"看着像但没验证"的站。
- **防链接腐烂**：每条带 `last_checked`；Agent 每次实际使用站点时即时验证链接与登录状态，失效即更新或标记。
- **版权必填**：license 缺失的条目不得进入 active；不确定标"待确认"，不编造。
- **用户层优先**：内置层只读；个人收藏 / 修正写用户层，合并时用户层覆盖内置层。

## 8. 待办（拍板后执行）

1. `ptr source` 命令族（search / list / index → 生成 sources.json）
2. sources.json 接入 sitegen / 工作台（"灵感源"页，与 library.json 同构）
3. SOURCES.md 与 registry 接入 SKILL.md / README（§6 触发 + 文件结构）
4. 首批条目经用户确认后从 draft 转 active，再定内置于 GitHub 的发布方式
