#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
DiffusionDB 种子采样脚本（提示词资产库 P0）
===========================================
从 DiffusionDB（CC0，1400 万 prompt-图像对，可商用）按关键词过滤 + 随机采样，
输出「策展候选 JSONL」——Agent 据此做分类 → 中文本地化 → 验证 → 入库。

用法：
  python diffusiondb_sample.py --tags "ancient tree,city,ruin" --limit 200 --out seed_candidates.jsonl
  python diffusiondb_sample.py --parquet path/to/part-0000.parquet --tags "sci-fi,mecha" --limit 50

依赖：
  方式 A（推荐，流式）：pip install datasets
  方式 B（降级，离线）：手动下载 parquet 后传 --parquet（无需 datasets，只需 pandas 或 pyarrow）
输出列（随数据源实际列名，缺失则省略）：prompt / width / height / sampler / cfg / seed / step / url
注意：
  - 输出仅为策展候选，license 为 CC0 可商用，但仍须在入库时登记 source_type=diffusiondb。
  - 词条须经 prompt-curation.md 策展流程（分类/本地化/验证/门禁）后才能入库，
    禁止把原始采样直接当「已验证词条」写入资产库。
"""

import argparse
import json
import random
import sys


def filter_and_sample(records, tags, limit, rand_seed):
    """对可迭代记录做关键词（OR）过滤 + 随机采样。"""
    rng = random.Random(rand_seed)
    lowered = [t.lower() for t in tags]
    hits = []
    for rec in records:
        prompt = str(rec.get("prompt", "") or "")
        if not prompt:
            continue
        pl = prompt.lower()
        if any(t in pl for t in lowered):
            hits.append(rec)
        if len(hits) >= limit * 10:  # 预采缓冲，再洗牌取样
            break
    rng.shuffle(hits)
    return hits[:limit]


def main():
    ap = argparse.ArgumentParser(description="DiffusionDB 种子采样 → 策展候选 JSONL")
    ap.add_argument("--tags", required=True,
                    help="关键词，逗号分隔（OR 匹配），如 'ancient tree,city,ruin'")
    ap.add_argument("--limit", type=int, default=100, help="采样条数（默认 100）")
    ap.add_argument("--out", default="seed_candidates.jsonl", help="输出文件路径")
    ap.add_argument("--seed", type=int, default=20261005, help="采样随机种子（可复现）")
    ap.add_argument("--parquet", default=None,
                    help="离线模式：本地 parquet 文件路径（方式 B）")
    ap.add_argument("--dataset", default="poloclub/diffusiondb",
                    help="HF 数据集名（默认 poloclub/diffusiondb）")
    args = ap.parse_args()

    tags = [t.strip() for t in args.tags.split(",") if t.strip()]
    if not tags:
        print("错误：--tags 为空", file=sys.stderr)
        sys.exit(1)

    out = args.out

    if args.parquet:
        # 方式 B：离线 parquet（需要 pandas 或 pyarrow）
        try:
            import pandas as pd
        except ImportError as e:
            print(f"错误：离线模式需要 pandas（pip install pandas）：{e}", file=sys.stderr)
            sys.exit(1)
        df = pd.read_parquet(args.parquet)
        recs = filter_and_sample(df.to_dict("records"), tags, args.limit, args.seed)
    else:
        # 方式 A：HF 流式（不下载全量）
        try:
            from datasets import load_dataset
        except ImportError as e:
            print(
                "错误：需要 datasets（pip install datasets），或用 --parquet 走离线模式。"
                f" 详情：{e}", file=sys.stderr)
            sys.exit(1)
        ds = load_dataset(args.dataset, split="train", streaming=True)
        recs = filter_and_sample(iter(ds), tags, args.limit, args.seed)

    keep = ["prompt", "width", "height", "sampler", "cfg", "seed", "step", "url"]
    with open(out, "w", encoding="utf-8") as f:
        for r in recs:
            row = {k: r.get(k) for k in keep if k in r}
            row["_source_type"] = "diffusiondb"
            row["_license"] = "CC0"
            row["_verified"] = "unverified"  # 策展候选一律未验证，见 prompt-curation.md
            f.write(json.dumps(row, ensure_ascii=False) + "\n")

    print(f"完成：{len(recs)} 条候选 → {out}")
    print("下一步：按 library/prompt-curation.md 策展流程（分类 → 中文本地化 → 验证 → 门禁）")


if __name__ == "__main__":
    main()
