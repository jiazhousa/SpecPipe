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

- [计算型] `ls review-rules | wc -l` = 21（20 md + system_rules.json）：**PASS**（2026-10-14）
- [计算型] `specp rules` 命中迁入文档（"Dead Code" 命中 7 个语言规则文件、"@State" 命中 arkts.md；--list 含 20 条 review-rules 条目）：**PASS**（统筹侧复跑；语料动态并入，迁入件随目录走）
