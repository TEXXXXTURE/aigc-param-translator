// 极简 YAML 子集解析/序列化：只服务 asset.md frontmatter（标量 / 行内数组 / 两级嵌套对象）
// 不做通用 YAML：遇到无法解析的内容应报错而不是静默吞掉。

function unquote(s: string): string {
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    return s.slice(1, -1).replace(/\\"/g, '"');
  }
  return s;
}

function parseValue(raw: string): unknown {
  const v = raw.trim();
  if (v.startsWith("[") && v.endsWith("]")) {
    const inner = v.slice(1, -1);
    if (inner.trim() === "") return [];
    return inner
      .split(",")
      .map((s) => unquote(s.trim()))
      .filter((s) => s !== "");
  }
  if (v === "true") return true;
  if (v === "false") return false;
  if (/^-?\d+(\.\d+)?$/.test(v)) return Number(v);
  return unquote(v);
}

/** 解析 frontmatter（`---` 包裹的 YAML 子集） */
export function parseFrontmatter(text: string): Record<string, unknown> {
  const lines = text.split(/\r?\n/);
  const out: Record<string, unknown> = {};
  let section: string | null = null; // 当前两级嵌套的顶层 key
  for (const raw of lines) {
    if (raw.trim() === "" || raw.trim().startsWith("#")) continue;
    const indent = raw.length - raw.trimStart().length;
    const line = raw.trim();
    const colon = line.indexOf(":");
    if (colon < 0) continue; // 非 key: value 行（本子集不支持），跳过
    const key = line.slice(0, colon).trim();
    const val = line.slice(colon + 1).trim();
    if (val === "") {
      // 嵌套对象开始
      if (indent === 0) {
        section = key;
        out[key] = {} as Record<string, unknown>;
      } else if (section) {
        (out[section] as Record<string, unknown>)[key] = {} as Record<string, unknown>;
      }
      continue;
    }
    const parsed = parseValue(val);
    if (indent > 0 && section) {
      (out[section] as Record<string, unknown>)[key] = parsed;
    } else {
      out[key] = parsed;
      section = null;
    }
  }
  return out;
}

/** 提取 frontmatter 与正文 */
export function splitFrontmatter(md: string): {
  meta: Record<string, unknown>;
  body: string;
} {
  const cleaned = md.replace(/^\uFEFF/, "");
  const lines = cleaned.split(/\r?\n/);
  if (lines[0]?.trim() !== "---") {
    return { meta: {}, body: cleaned };
  }
  let end = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === "---") {
      end = i;
      break;
    }
  }
  if (end < 0) return { meta: {}, body: cleaned };
  const meta = parseFrontmatter(lines.slice(1, end).join("\n"));
  const body = lines.slice(end + 1).join("\n").trim();
  return { meta, body };
}

function quoteIfNeeded(s: string): string {
  if (s === "") return '""';
  if (
    /[:#\[\]{}"',&*!|>%@`]/.test(s) ||
    /^\s|\s$/.test(s) ||
    /^(true|false|null|yes|no|on|off|\d)/i.test(s)
  ) {
    return `"${s.replace(/"/g, '\\"')}"`;
  }
  return s;
}

/** 序列化资产 meta 为 YAML（与 parseFrontmatter 互逆） */
export function renderYaml(
  o: Record<string, unknown>,
  indent = 0
): string {
  const pad = "  ".repeat(indent);
  const lines: string[] = [];
  for (const [k, v] of Object.entries(o)) {
    if (v === undefined) continue;
    if (v === null) {
      lines.push(`${pad}${k}:`);
      continue;
    }
    if (Array.isArray(v)) {
      if (v.length === 0) lines.push(`${pad}${k}: []`);
      else
        lines.push(
          `${pad}${k}: [${v.map((x) => quoteIfNeeded(String(x))).join(", ")}]`
        );
    } else if (typeof v === "object") {
      lines.push(`${pad}${k}:`);
      lines.push(renderYaml(v as Record<string, unknown>, indent + 1));
    } else if (typeof v === "string") {
      lines.push(`${pad}${k}: ${quoteIfNeeded(v)}`);
    } else {
      lines.push(`${pad}${k}: ${String(v)}`);
    }
  }
  return lines.join("\n");
}
