// 资产元数据类型（与 library/asset.schema.json 对齐）
export interface AssetMeta {
  id: string;
  kind: string;
  media: string;
  name: string;
  created_at: string;
  created_from: string;
  source: { origin: string; url?: string; license_note?: string };
  stars?: number;
  tags?: string[];
  semantics: { what: string; suitable_for: string[]; restrictions?: string };
  consumed_in?: string[];
  version: string;
  [key: string]: unknown;
}

// 索引产物（library.json 条目）
export interface ManifestAsset extends AssetMeta {
  folder: string;
  files: string[];
  thumb: string | null;
  body: string;
}

export interface Manifest {
  generated_at: string;
  assets: ManifestAsset[];
}
