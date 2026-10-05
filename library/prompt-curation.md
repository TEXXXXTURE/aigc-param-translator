# 提示词资产策展规范 · prompt-curation.md（v0.1）

> **定位**：`kind=prompt` 资产的策展规则——**什么词条值得入库、怎么标注、怎么验证**。
> 依据：2026-10 调研「提示词资源与优化」（许可证门槛：只有 DiffusionDB CC0 可合法入库，中文词条是护城河）+ tools/experiment.md（A 协议：verified 判定口径）。
> 一句话：**词是主导变量——但"万能质量词"是毒药；词条必须按模型分组标注，验证状态必须诚实。**

## 1. 来源分级（许可证门槛，硬规则）

| 级别 | 来源 | 许可证 | 能否入库 |
|---|---|---|---|
| P0 种子源 | DiffusionDB | CC0，1400 万 prompt-图像对，可商用 | ✅ 可入库（须标 source_type=diffusiondb） |
| P1 参考源 | Lexica / PromptHero / Civitai（仅浏览参考） | 无许可 / 许可混乱 | ⛔ 只当灵感参考，不得直接入库为词条 |
| P2 禁入 | PromptBase（付费）/ JourneyDB（非商用）/ 任何付费词库 | 商用受限 | ⛔ 禁止 |
| P0+ 自产 | 方法实验（experiment）产出 / 实际使用验证 | 自有 | ✅ 最高价值（source_type=experiment） |

> 欧美词库对国内平台（即梦 / 可灵 / Seedream / 豆包）覆盖 ≈ 0 —— **自建中文词条 + 模型分组标注是差异化护城河**。

## 2. 词条条目格式（frontmatter 对齐 asset.schema.json）

```yaml
---
id: prompt.ancient_tree_city_zh
kind: prompt
media: text
name: 末日古树侵蚀城市（中文场景词）
created_at: 2026-10-05
created_from: curated          # manual|capture|generation|training|import；策展词条用 curated
source:
  origin: DiffusionDB 采样 #000001 / 中文策展 / 方法实验 exp.xxx
  url: ""
  license_note: CC0 可商用
stars: 3
tags: [场景, 中文词条, 末世, 巨物]
semantics:
  what: 一段可直接用于复杂场景生成的五段式中文提示词
  suitable_for: [prompt_text, style_weight]
  restrictions: 模型分组见 prompt_spec.model_group；质量词勿跨模型混用
prompt_spec:
  language: zh
  model_group: seedream, 即梦        # 实测有效的模型族，逗号分隔
  prompt_type: template               # template|single|negative|quality_modifier|style_prompt
  verified: verified_by_exp           # unverified|verified_by_exp|verified_by_use
  source_type: curated                # diffusiondb|curated|experiment|import
  tested_on: doubao-seedream-4-5-251128
  effective_range: 世界观场景 / 巨物感镜头
  notes: 结构词优先、质量词按模型分组；A 协议 exp.2026-10-05 验证结构崩坏率 30%→5%
version: 0.1.0
---
```

正文（自由结构，建议含）：
- **词条原文**（可直接复制进提示词槽位）
- **拆解**：哪部分管主体 / 环境 / 风格 / 光线 / 质量（五段式结构标注）
- **验证记录**：跑过什么实验 / 实际用过几次 / 结论

## 3. 策展流程（collect → classify → localize → verify → gate）

1. **采样**：DiffusionDB 按关键词过滤 + 随机采样 N 条（`tools/scripts/diffusiondb_sample.py`）→ 产出候选 JSONL。
2. **分类**：Agent 判 prompt_type（模板/单条/负面/质量修饰/风格），初判 model_group 与 effective_range。
3. **本地化（护城河步骤）**：英文词条译/重写为中文五段式结构；不直译堆砌，按中文审美习惯重组（主体→环境→风格→光线→质量）。
4. **验证**：能挂实验 → 走 A 协议（verified=verified_by_exp，≥2 同向案例）；未验证 → verified=unverified，标"待验证"。
5. **入库门禁**（沿用 LIBRARY.md §6 第 3 步 + 以下 prompt 专属项）：
   - [ ] prompt_spec 四必填齐全（language / model_group / prompt_type / verified）
   - [ ] verified=unverified 的条目必须显式标"待验证"，不得混入已验证区
   - [ ] 质量词（masterpiece/8k 类）已按模型分组标注，无"万能质量词串"
   - [ ] 来源分级通过（P0 / P0+；P1/P2 不入库）

## 4. 质量红线（写进门禁，一票否决）

1. **禁止万能质量词堆砌**："masterpiece, 8k, ultra-detailed" 无对照实证且随模型失效（Flux 类偏好自然语言长句）——词条必须按模型分组标注质量词用法。
2. **禁止跨平台混用结论**：即梦的词条不能直接标成 ComfyUI 有效，除非语义层确认（对齐 verifier.md 质量闸口）。
3. **禁止编造验证**：verified 只能来自 A 协议实验或真实使用记录；无记录一律 unverified。

## 5. 与 A 协议（tools/experiment.md）的衔接

- A 协议首批可测变量里"提示词样式 / 描述语言"两组实验，**产出即 prompt 资产**（source_type=experiment）。
- 实验结论（如"五段式构图达标率 +20%"）写回本类资产 notes + presets。
- verified 判定口径唯一来源：A 协议门禁（L1 合规 + L2 门禁 + ≥2 同向案例）或真实使用记录。
