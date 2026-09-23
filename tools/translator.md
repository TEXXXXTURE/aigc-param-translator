# tools/translator.md — 翻译器工作流

> 输入：自然语言需求。输出：调参方案（schema/plan.schema.json 结构）。
> 核心纪律：**规则路由 → LLM 槽位填充 → 参数校验**，禁止自由发挥。

## 第 1 步 · 需求解析

从用户需求提取结构化要素：

| 要素 | 说明 | 缺失时 |
|---|---|---|
| 目标平台 | ComfyUI / 即梦 / 可灵 / 豆包 / SD WebUI / LiblibAI | 问一句；或按默认 ComfyUI 并标注 |
| 风格方向 | 写实 / 动漫 / 海报 / 摄影感… | 走 00-default，标注"未指定风格" |
| 主体与场景 | 谁 / 什么 / 在哪 | 写进 prompt 结构的主体段 |
| 硬约束 | 比例 / 数量 / 一致性要求 / 参考素材 / 文字内容 | 无则留空 |
| 档位 | quick（快） / full（全） | 默认 quick，解释异步补 |

## 第 2 步 · 规则路由

1. 打开 `routes/ROUTE.md`，按需求特征匹配预设卡。
2. 命中 → 读取 `routes/presets/xx.md`，以其档位为基底；多卡命中按"主体目标"取最贴切一张，其余特征作为覆盖项。
3. 未命中 → 00-default，meta.preset_hit=null 并注明。
4. 用户已提供参考素材 → 预设降级为"参考优先"模式（参考类参数以素材为准）。

## 第 3 步 · LLM 槽位填充

只允许填充 `schema/params.schema.json` registry 中定义的参数。每个填充项必须给出：

- `param`：registry 中的参数名（kebab-case）。
- `value`：具体值。
- `default`：该参数默认值（来自 registry）。
- `reason`：调整理由，**必须绑定需求原文**（"因为你要白底质感，CFG 降到 6"而不是"因为更专业"）。
- `confidence`：high / medium / low。
- `source`：预设 / 需求 / 平台文档 / 语义库 / 用户素材 / 待确认。

**禁止**：发明 registry 之外的参数名；跳过 reason；给"图"不给"方案"。

## 第 4 步 · 参数校验

逐项校验（对照 registry）：

1. **类型**：value 类型与注册表一致。
2. **范围**：数值在 range 内；枚举在枚举内。
3. **依赖**：
   - ControlNet 有类型 → 必须有条件图/预处理器说明；
   - LoRA 有值 → 检查底模兼容 + 触发词；
   - ref_type=content → reference_images 必须存在；
   - 套图 → 必须有种子/资产一致性策略。
4. **平台映射**：经 `shared/glossary.md` 映射为平台字段；未映射标"待补"。

**越界处理**：越界 → 拒绝该值并说明正确区间与原因（不静默修正）；整项无法校验 → confidence=low + source=待确认。

## 第 5 步 · 产出方案

按 `schema/plan.schema.json` 组装：

- meta：requirement / platform / mode / preset_hit / preset_note / created_at / revision=1
- preset：命中卡 + overrides（覆盖项列表）
- params：校验通过的填充项数组
- assets：检索到的资产引用（见 knowledge/assets.md 联动规则；无则空数组）
- explain：留空占位（解释器第 6 步填充）
- exec：按 knowledge/exec-branches.md 路由规则给 branch + reason
- risk：对 confidence=low 或已知坑的项给风险与缓解

## 校验清单（交付前自查）

- [ ] 是否只用了 registry 内的参数名
- [ ] 每个 params 项是否都有绑定需求的 reason
- [ ] 越界项是否拒绝并说明，而非静默修正
- [ ] 未核实项是否标"待确认"
- [ ] 平台映射是否执行（或标注待补）
- [ ] 参考素材是否触发"参考优先"模式
