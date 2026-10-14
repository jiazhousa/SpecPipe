# T03: review-rules 迁入 + rules 语料扩展

## 元信息
- depends_on: [T01]
- chain: c1
- 分支/执行者: v3-drafts / 主会话统筹派发

## 范围
- 涉改文件集：`review-rules/`（B 仓 `configs/review-rules/` 21 件 cp 迁入）、`cli/lib/corpus.mjs`（语料路径扩展）、README 卷导览 review-rules 行转实现态
- 统筹要点：impl「review-rules 迁入」节；B 仓源路径 `~/project/opencodepipe/configs/review-rules/`

## guides（前馈）
- guide: spec S3 兼容方案——v1 语料补全 | type: 计算型（机械引用）
- guide: 迁入=纯复制不改内容（B 仓冻结保存历史）；rules 查询对规则文档生效 | type: 推断型（统筹撰写）

## sensors（反馈）
- sensor: `ls review-rules | wc -l` = 21（含 system_rules.json）| type: 计算型（CLI）
- sensor: `specp rules <规则关键词>` 能命中迁入文档 | type: 计算型（CLI）

## sensor 判定
（执行后回填）
