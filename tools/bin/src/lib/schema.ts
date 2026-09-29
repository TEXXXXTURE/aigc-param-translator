// 资产 Schema 常量与校验（镜像 library/asset.schema.json）
export const KINDS = [
  "character",
  "persona",
  "chardesign",
  "costume",
  "scene",
  "worldview",
  "style",
  "style_anchor",
  "shot",
  "camera_ref",
  "concept",
  "story",
  "material",
  "object",
  "environment",
  "prompt",
  "case",
  "custom",
] as const;

export const MEDIAS = ["image", "video", "text", "audio", "mixed"] as const;

export const FROM = ["manual", "capture", "generation", "training", "import"] as const;

export const SLOTS = [
  "reference_images",
  "ref_type",
  "lora",
  "controlnet",
  "style_weight",
  "prompt_text",
  "story_context",
  "character_card",
  "style_anchor",
  "camera_ref",
] as const;

export const KIND_PATTERN = new RegExp(
  `^(${KINDS.join("|")})\\.[a-z0-9_]+$`
);

/** 校验资产 meta，返回问题列表（空数组 = 通过） */
export function validateAsset(m: unknown): string[] {
  const errs: string[] = [];
  const o = m as Record<string, unknown>;

  for (const f of ["id", "kind", "media", "name", "created_at", "created_from", "version"]) {
    if (o[f] === undefined || o[f] === null || o[f] === "") errs.push(`缺少字段: ${f}`);
  }

  const src = o.source as Record<string, unknown> | undefined;
  if (!src || typeof src.origin !== "string" || src.origin === "")
    errs.push("缺少字段: source.origin（来源登记）");

  const sem = o.semantics as Record<string, unknown> | undefined;
  if (!sem) errs.push("缺少字段: semantics");
  else {
    if (typeof sem.what !== "string" || sem.what === "")
      errs.push("缺少字段: semantics.what（一句话说明，可检索性）");
    if (!Array.isArray(sem.suitable_for) || sem.suitable_for.length === 0)
      errs.push("缺少字段: semantics.suitable_for（至少一个消费槽位）");
    else {
      for (const s of sem.suitable_for) {
        if (!SLOTS.includes(s as never)) errs.push(`suitable_for 含未知槽位: ${s}`);
      }
    }
  }

  if (typeof o.id === "string") {
    if (!KIND_PATTERN.test(o.id))
      errs.push("id 不符合 <kind>.<name> 命名（小写点分，name 用下划线）");
    else if (typeof o.kind === "string" && o.id.split(".")[0] !== o.kind)
      errs.push("id 前缀与 kind 不一致");
  }
  if (typeof o.kind === "string" && !KINDS.includes(o.kind as never))
    errs.push(`kind 不在枚举中: ${o.kind}`);
  if (typeof o.media === "string" && !MEDIAS.includes(o.media as never))
    errs.push(`media 不在枚举中: ${o.media}`);
  if (typeof o.created_from === "string" && !FROM.includes(o.created_from as never))
    errs.push(`created_from 不在枚举中: ${o.created_from}`);
  if (
    o.stars !== undefined &&
    (typeof o.stars !== "number" || !Number.isInteger(o.stars) || o.stars < 0 || o.stars > 5)
  )
    errs.push("stars 需为 0–5 整数");
  if (typeof o.version === "string" && !/^\d+\.\d+\.\d+$/.test(o.version))
    errs.push("version 需为 SemVer（x.y.z）");
  if (typeof o.created_at === "string" && !/^\d{4}-\d{2}-\d{2}$/.test(o.created_at))
    errs.push("created_at 需为 YYYY-MM-DD");

  return errs;
}
