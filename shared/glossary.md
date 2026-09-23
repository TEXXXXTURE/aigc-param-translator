# shared/glossary.md — 术语对照（原子参数 ↔ 平台字段）

> 翻译器把原子参数映射到目标平台的实际字段/界面位置。未映射项必须标"待补"，不编造。

## 对照表

| 原子参数 | ComfyUI | SD WebUI | 即梦 | 可灵 | 豆包 API（Seedream） |
|---|---|---|---|---|---|
| base_model | checkpoint / base model | Stable Diffusion checkpoint | 平台默认/风格模型 | 平台默认 | 模型版本参数 |
| sampler | sampler_name (+scheduler) | Sampling method | 待补 | 待补 | 待补 |
| steps | steps | Sampling steps | 待补 | 待补 | 待补 |
| cfg | cfg | CFG Scale | 提示词强度（近似） | 待补 | 待补 |
| seed | seed | Seed | 待补 | 待补 | 待补 |
| batch_size | batch_size | Batch count | 生成数量 | 待补 | 生成数量 |
| width / height | width / height | Width / Height | 尺寸选择 | 比例/尺寸 | 尺寸参数 |
| aspect_ratio | 由 width/height 换算 | 由宽高换算 | 比例选择 | 比例选择 | 比例参数 |
| hires_fix | Hires.fix | Highres. fix | 待补 | 待补 | 待补 |
| upscale_scale | upscale_by | Upscaler scale | 待补 | 待补 | 待补 |
| denoise | denoise | Denoising strength | 待补 | 待补 | 待补 |
| prompt | positive prompt | Prompt | 描述词 | 提示词 | prompt |
| negative_prompt | negative prompt | Negative prompt | 待补 | 待补 | 待补 |
| tag_weight | (tag:1.2) 语法 | (tag:1.2) 语法 | 待补 | 待补 | 待补 |
| reference_images | Load Image / reference 节点 | img2img / ControlNet 图 | 参考图上传（≤10 张） | 参考素材（形象/环境/动态/声音分类） | 参考图参数 |
| ref_strength | IPAdapter weight（近似） | img2img denoise（近似） | 参考强度 | 参考程度 | 待补 |
| ref_type | IPAdapter mode | 参考模式 | 参考图类型选择 | 参考素材分类 | 待补 |
| controlnet_type | ControlNet type | ControlNet preprocessor | 待补 | 待补 | 待补 |
| controlnet_weight | controlnet strength | ControlNet Weight | 待补 | 待补 | 待补 |
| controlnet_range | start/end percent | ControlNet start/end | 待补 | 待补 | 待补 |
| lora | LoRA loader | Extra networks | 风格模型（待确认） | 待补 | 待补 |
| lora_weight | strength_model | Lora weight | 待补 | 待补 | 待补 |
| ip_adapter_weight | IPAdapter weight | 参考图权重（近似） | 参考强度（近似） | 待补 | 待补 |

## 使用规则

1. 翻译器映射时：同语义优先取已映射字段；"待补"项不进参数表（或进 risk 标注）。
2. 平台更新/新增字段 → 更新本表，更新后旧案例回流（tools/verifier.md）。
3. 映射近似项（标"近似"）必须在解释中注明"该平台无完全对应字段，用 X 近似"。
4. 新增平台 → 新增一列；未验证前整列标"待补"。
