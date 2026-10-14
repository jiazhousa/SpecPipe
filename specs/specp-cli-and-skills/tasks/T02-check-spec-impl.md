# T02: check — spec 与 impl 层

## 元信息
- depends_on: [T01]
- chain: c1
- 分支/执行者: v3-drafts / 主会话统筹派发

## 范围
- 涉改文件集：`cli/commands/check.mjs`、`cli/lib/check-spec.mjs`、`cli/lib/check-impl.mjs`、`cli/fixtures/spec-bad.md`（反例：缺三要素章节）、`cli/fixtures/impl-bad.md`（反例：spec 引用不存在）
- 统筹要点：impl「CLI」check 节——spec 章节（三要素语义匹配白名单）/行数预算/Issue 锚定；impl 章节/引用存在/切分清单

## guides（前馈）
- guide: spec G1/AC1/AC4（check 属三用途③，本 Story 自检依赖）+ 03-artifacts「spec 工件」「impl 工件」结构表 + 06-charter §2/§3 结构项 | type: 计算型（机械引用）
- guide: 章节匹配用标题白名单（含变体，如「目标 / 非目标」合并节），不做模糊语义判断 | type: 推断型（统筹撰写）

## sensors（反馈）
- sensor: 正夹具=本 Story spec.md/impl.md → 退出码 0；反夹具 → 退出码 1 且问题清单含缺失章节名 | type: 计算型（CLI）
- sensor: `node --check` | type: 计算型（CLI）

## sensor 判定
（执行后回填）
