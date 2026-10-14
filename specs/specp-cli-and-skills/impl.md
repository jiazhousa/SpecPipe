# Impl: specp CLI 与 skills 薄适配层构建

## 元信息 + spec 引用

- 锚定 spec：`specs/specp-cli-and-skills/spec.md`（已逐项确认，2026-10-14）
- 统筹要点来源：05-cli 契约 / 03-artifacts 工件 schema / D27-D32 / drafts/specpipe-v3-skills.md（形态按归一原则修正）

## 技术方案

**总策略**：四块交付按 DAG 单链串行（依赖经 T07 汇聚连通，依 03-artifacts 链规则归一条链）——链分支 = 当前 `v3-drafts`（构建目标即本仓），执行者 = 主会话统筹（小任务直执，重任务派 builder 会话）。

**CLI（`cli/`）**：Node ≥18、零 npm 依赖、ESM 单包多文件，入口 `cli/specp.mjs`（`#!/usr/bin/env node`）。手写路由（承 B 仓手写路由先例，不引框架）：

- `specp coldstart [dir]`：脚手架（`specs/` 目录 + spec 骨架 + AGENTS.md 提示）+ 项目事实盘点 JSON（git 状态/语言栈探测/既有 docs 盘点）
- `specp rules <query>` / `specp rules --list [卷名]`：语料=01-07 卷+README 术语表+review-rules/（T03 后）；关键词匹配 + 章节级输出（条款号/行号引用）
- `specp check <spec|impl|task|all> [path]`：
  - spec：必填章节存在性（三要素结构语义匹配）、行数预算、Issue 锚定声明（元信息分级=Issue 时）
  - impl：必填章节、spec 引用文件存在、任务切分清单存在
  - task：元信息（depends_on/chain/分支）、guides 含 spec 锚点、sensors 类型标注、判定与声明一致性（闭合差集）、commit 对应（git log 匹配 task 编号，非 git 环境降级跳过）
  - all/跨级：DAG 校验（无环/引用存在/连通即同链一致性）、全 task 闭合（push 闭合检查）
  - 退出码 0/1/2；输出人类可读文本
- 夹具：`cli/fixtures/` 正反两组工件（正=本 Story 自身工件即天然夹具；反=构造缺章/缺锚点/带环 DAG 样例）

**skills（`skills/`）**：薄适配层——每 skill 一文件（或按 pi 扩展机制的目录形态，T05 采证定形）：frontmatter（name/description）+ 正文 = 意图执行指导 + 卷引用（指向 01-07 卷章节），正文永不复制卷内容。skill 清单按定稿 v1 七件（workflow/write/plan/task/sense/converge/coldstart），`shared/` 以卷内引用替代（归一后 shared 四件内容大部分已入卷，残留者并入对应 skill 或删）。

**review-rules 迁入**：`configs/review-rules/`（B 仓 21 件）→ 本仓 `review-rules/`；`specp rules` 查询路径纳入。

**验收（最小 CRM sandbox）**：新 git 仓（`~/project/minimal-crm`，验收期产物不入 A 仓）；`specp coldstart` 初始化；pi 项目级配置（`.pi/` 或 `pi install ./local`，按 T05 采证）；模型路由——主会话 `--provider zhipuai --model glm-5.3`（或采证确认的 model id），推断型 sensor 调用 `pi -p --provider deepseek --model deepseek-flash`（sidecar 渠道 = shell 起 pi 会话）；**前置 HITL：用户完成 pi 的 provider/auth 配置**。

## 任务切分

| task | 职责 | depends_on |
|---|---|---|
| T09 | templates v3 重构（spec/impl/task 三件；删旧九件；coldstart 骨架来源） | —— |
| T01 | CLI 骨架 + coldstart + rules 速查（语料=七卷+README） | T09 |
| T02 | check：spec + impl 层 | T01 |
| T03 | review-rules 迁入 + rules 语料扩展（链内可与 T02 换序，依赖只系 T01） | T01 |
| T04 | check：task 层 + DAG + 闭合差集 + push 闭合 + spec 锚定完整性（git 集成） | T02 |
| T05 | pi 扩展机制采证（extension 格式/skills 资源/provider 与模型配置/-p 与 rpc/sidecar 调用形态） | —— |
| T06 | skills 薄适配层实现（按采证形态）+ pi 加载验证（sensor2） | T05 |
| T07 | 最小 CRM sandbox 初始化 + pi 注入 + 用户 auth（HITL）+ 指派开发（GLM-5.3 主会话） | T03, T04, T06 |
| T08 | 端到端验收：工件链 `specp check` 全绿 + sensor3 推断型判定（deepseek-flash）+ 人工验收 + 收敛归档 | T07 |

链划分：T07 依赖 T03/T04/T06、T01 依赖 T09 → 全图连通 → **单链**（分支 `v3-drafts`，执行者=主会话统筹派发）；执行顺序 T09→T01→T02→T03→T04→T05→T06→T07→T08（链内依赖满足即可，T05 可与 T01-T04 段交错）。

## 涉改文件总清单

- 新增：`cli/`（specp.mjs + 命令模块 + lib + fixtures/）、`skills/`（七件 + 适配形态文件）、`review-rules/`（21 件迁入）、`AGENTS.md`（本仓新建，收尾 feature 记录）、`specs/specp-cli-and-skills/`（impl.md、tasks/T01-T09.md 及其判定、pi-research.md、dispatch-record.md、acceptance.md）
- 修改：`templates/`（删旧九件、建 v3 三件）、`README.md`（skills/cli/templates/review-rules 行转实现态）、`drafts/TODO.md`、`drafts/specpipe-v3-discussion.md`（D33/D34）
- 不动：01-07 卷正文（发现规约问题走判例/issue，spec 副作用 S4）

## 收尾清单

- fence：`node --check` 全模块 + CLI smoke 脚本（正反夹具全跑）+ **两步协议**收尾（先全判定落盘，后 `specp check all` 复核自身工件全绿——协议见 T08）
- 归档：工件已在仓内（specs/ 即项目内快照）；AGENTS.md 追加 feature 记录
- TODO 勾销；决策链补记

## 风险

- pi 扩展机制与预期形态不符（如无 skills 资源）→ 兜底 `--append-system-prompt` 注入卷内容路径 + AGENTS.md 约定（薄适配层隔离，S2 兼容方案）
- GLM-5.3/deepseek-flash 在 pi 的 provider/model id 命名未证 → T05 采证确认，auth 由用户完成（`pi auth print` 验证）
- check 的章节语义匹配（中文标题变体）误判 → 匹配规则白名单化 + 判例迭代

## sensor 判定（sensor 侧写最终结论）

- [推断型·impl 级统筹核查] **r1 REJECT 34/100 → r2 PASS 82/100**（2026-10-14，报告 `drafts/reviews/specp-cli-and-skills-impl-{r1,r2}.md`）。r1 12 项：完全闭环 5（critical/high/templates/夹具口径/锚定完整性）、部分闭环 4（残差 low）、未闭环 3（均 low）。**残差 5 项 low 处置**：随构建批次收口（T06 落实归一三点、T06/T09 各自更新 README 表述、D 号引用在收尾统一核对、T08 范围已同步 T09、spec 判定节断言已修正）

