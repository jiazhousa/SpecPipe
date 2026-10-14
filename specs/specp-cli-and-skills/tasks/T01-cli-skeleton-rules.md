# T01: CLI 骨架 + coldstart + rules 速查

## 元信息
- depends_on: [T09]
- chain: c1（全图经 T07 连通，单链）
- 分支/执行者: v3-drafts / 主会话统筹派发

## 范围
- 涉改文件集：`cli/specp.mjs`（入口+路由）、`cli/commands/coldstart.mjs`（脚手架：specs/ 目录 + templates 实例化 spec 骨架 + AGENTS.md 提示；事实盘点：git 状态/语言栈探测/既有 docs 盘点 → JSON）、`cli/commands/rules.mjs`、`cli/lib/corpus.mjs`（语料加载）、`cli/README.md`
- 统筹要点：impl「CLI」节——手写路由、退出码 0/1/2、零依赖 ESM；coldstart 骨架引用 templates/（T09 产物）

## guides（前馈）
- guide: spec G1/AC1 + 05-cli 契约三用途①② | type: 计算型（机械引用）
- guide: 语料=01-07 卷+README 术语表；查询=关键词匹配+章节级输出（条款号/行号）；coldstart 事实盘点输出 JSON（git/语言栈/docs），语义起草归 agent | type: 推断型（统筹撰写）

## sensors（反馈）
- sensor: `node --check` 全模块 + `specp --help`/`rules --list`/`rules <词>` smoke（命中真实条款）+ `coldstart` 在临时目录产出骨架与 facts JSON | type: 计算型（CLI）
- sensor: 用法错误→退出码 2；未知查询→非崩溃输出 | type: 计算型（CLI）

## sensor 判定
（执行后回填）
