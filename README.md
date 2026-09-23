<p align="center">
  <img src="assets/banner.svg" alt="AIGC Param Translator" width="100%">
</p>

<h1 align="center">AIGC 调参翻译器 · Param Translator</h1>

<p align="center">
  把「我要这种感觉」翻译成「该这么调参数，以及为什么」。<br>
  <b>预设管易用，原子参数管可控，解释让人真正懂。</b>
</p>

<p align="center">
  <img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-blue.svg">
  <img alt="Language" src="https://img.shields.io/badge/language-中文-blue.svg">
</p>

---

## 为什么做这个

工具层已经成熟（ComfyUI+MCP、即梦、可灵、豆包 API……），模型已经商品化，但 AIGC 从业者的产出上下限差距极大：同一底座，有人能出"让人想写小说的世界观图"，有人完全不行。

差距不在工具，在**人层**：方法论 × 资产 × 审美。而最大的断层是——

> **使用者有明确的"感觉"，但不知道它对应哪些参数、怎么调、调了会怎样。**

AIGC 调参翻译器就是补上这一层的 Skill：**需求 → 调参方案 → 参数解释 → 三路执行**。

---

## 核心理念

| 理念 | 含义 |
|---|---|
| **翻译而非生成** | 把需求翻译成参数方案；禁止模型自由发挥，参数可校验、可追溯 |
| **方案即唯一中间产物** | 结构化、可执行、可解释、可复用，每项改动带调整理由 |
| **预设管易用，原子参数管可控** | 命中预设后任一参数可单独覆盖，预设 ≠ 锁死 |
| **人必须懂参数** | 每项改动都能解释：是什么 / 为什么 / 预期效果 / 风险 |
| **执行三路兜底** | API 直连 → 读屏操控 → 人工指引，路由写死，永不卡死 |
| **两腿互为养料** | 读屏操作日志沉淀为指引库，反哺人工指引质量 |

---

## 快速开始

### 安装

```bash
git clone https://github.com/TEXXXXTURE/aigc-param-translator.git
# 将 aigc-param-translator 放入你的 Agent / Skill 加载目录
```

### 使用

AIGC 任务开始时，Skill 自动执行翻译循环：

1. **需求解析**：目标平台 / 风格 / 主体场景 / 硬约束 / 档位
2. **规则路由**：查 `routes/ROUTE.md` 命中预设（未命中走 00-default）
3. **槽位填充 + 校验**：按原子参数 Schema 填槽，越界即拒
4. **产出调参方案**：结构化中间产物，每项带调整理由
5. **解释**：四件套（是什么 / 为什么 / 预期效果 / 风险）
6. **执行路由**：有 API → 直连；可读屏 → 读屏操控；否则 → 人工指引
7. **交付**：快档（照抄参数表 + 最短指引）或 全档（完整说明书）
8. **校验沉淀**：出图结果回流，更新预设库与语义库

> 例："电商主图，白底，产品是保温杯，突出材质质感" → 命中 `01-ecommerce-hero`，产出带理由的方案与解释。
> "我要那种电影级赛博朋克海报，霓虹青紫调" → 命中 `02-cyberpunk-poster`。

### 定制：新增一个预设

```text
给 Agent 的指令：
"这是我经常做的 X 类型需求（附 2–3 个典型例子和常用参数）。请按 routes/presets/ 的格式
新建一张预设卡，我确认后写入。"
```

---

## 文件结构

```text
aigc-param-translator/
├── SKILL.md                 协议主文件：翻译循环 + 路由 + 解释 + 执行路由
├── PRD.md                   产品需求文档（架构决策全记录）
├── routes/
│   ├── ROUTE.md             预设路由表（Agent 查表处）
│   └── presets/             预设模板库（00 默认 + 01–06 场景）
├── schema/
│   ├── params.schema.json   原子参数 Schema（含语义字段）
│   └── plan.schema.json     调参方案中间产物 Schema
├── knowledge/
│   ├── params.md           ★ 参数语义库（解释器底座）
│   ├── exec-branches.md     执行层三分支路由与指引规范
│   └── assets.md            资产层：Schema + 插件接口 + 方案联动
├── tools/
│   ├── translator.md        翻译器工作流（路由 → 槽位 → 校验）
│   ├── explainer.md         解释器工作流（四件套 + 两档）
│   ├── planner.md           快档 / 全档输出规范
│   └── verifier.md          出图校验 + 案例沉淀（进化回路）
├── shared/
│   ├── safeguards.md        通用保真护栏
│   └── glossary.md          术语对照（原子参数 ↔ 平台字段）
└── assets/                  banner.svg / architecture.svg
```

---

## 架构

<p align="center">
  <img src="assets/architecture.svg" alt="Architecture" width="100%">
</p>

### 翻译循环

```text
自然语言需求
  ↓
需求解析（平台 / 风格 / 主体 / 约束 / 档位）
  ↓
规则路由 ──命中──▶ 读取预设模板（档位基底）
  │
  未命中 → 00-default 兜底
  ↓
LLM 槽位填充（只填 schema 槽位，带理由与置信度）
  ↓
参数校验（范围 / 依赖 / 平台映射；越界即拒）
  ↓
调参方案（唯一中间产物）
  ↓
解释器（是什么 / 为什么 / 预期效果 / 风险）
  ↓
执行路由（写死）：
  有 API ──▶ A 直连
  可读屏 ──▶ B computer use（每步验证，失败回退 C）
  否则/学习 ─▶ C 人工指引（方案 × 界面映射 × 语义库）
  ↓
交付（快档 / 全档）→ 出图校验 → 案例沉淀 → 更新预设库 / 语义库
```

---

## 路线图

- [x] M0：PRD 与架构定稿
- [x] M1：原子参数 Schema + 参数语义库（首批 ~24 参数）
- [x] M2：预设库（默认 + 6 个场景）
- [x] M3：翻译器 / 解释器 / 规划器工作流
- [ ] M4：执行层三分支实跑（先 C 后 B/A）
- [ ] M5：进化回路真实案例沉淀
- [ ] 扩展：更多平台映射（即梦 / 可灵 / 豆包 API 字段）
- [ ] 英文版 README

---

## License

[MIT](./LICENSE) © 2026 TEXXXXTURE

*把感觉翻译成参数，把参数解释成人话。*
