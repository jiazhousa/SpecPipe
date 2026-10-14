# SpecPipe 仓开发记忆（AGENTS.md）

> 项目层记忆：关键 feature 记录。规约正文见 01-07 卷；CLI 契约 05-cli；工件模板 templates/。

## 开发约定

- 分支：`v3-drafts`（v3 工件制重构+实现主线）；仓自身开发走 v3 工作流（工件入 `specs/{topic}/`，一 task 一 commit）
- CLI：`node cli/specp.mjs`（或全局 `specp` wrapper @ ~/.local/bin）；零 npm 依赖，Node ≥18
- skills：`skills/spec-*/SKILL.md`（Agent Skills standard），宿主挂载经 `package.json` pi 键或各宿主 skills 目录

## Feature 记录

- **specp-cli-and-skills**（2026-10-14 验收通过，AC1-AC4 全绿）：specp CLI 三用途（coldstart/rules/check 三层+跨级）+ skills 七件薄适配层 + review-rules 21 件迁入 + templates v3 三件。端到端验收：pi（GLM-5.3 主会话 + deepseek-flash sidecar）被指派开发 minimal-crm（~/project/minimal-crm），全程 6 HITL 卡点停等、重作回路真实迭代（spec 64→91 / impl 90→92）、check all 0F0W、fence 25/25、sensor3 终判 PASS 91——**spec-anchored 在异构 harness 首次全链路实证**。档案：specs/specp-cli-and-skills/（spec/impl/tasks T01-T09/dispatch-record/acceptance/pi-research）

**合入 main 后转向环补修两笔**（squash 合入揭出）：①锚定检查的快照场景守卫——squash 后 base..HEAD 区间仅 1 commit，diff 混入 Story 前变更失去 task 归因前提，降级 INFO 跳过（开发分支照常检查）②涉改片段裸 token 解析（仅反引号 span 时 T08 的 AGENTS.md 声明漏解析）。**教训：commit 前跑 check 时新增文件尚未入 diff——闭合复验必须在 commit 之后**（AGENTS.md 假绿即此因）。

## 后续排队（2026-10-14）

- B 仓（opencodepipe）退役——用户自行处理
- 统筹工件随派发 commit 入库 / specp check 输出快照 CI 化 / task-commit 机械对应检查——低优先迭代
- topic2 正式迁移（待议）：评估 Pi + SpecPipe 作为日常主力（OpenCode 是否仍必需）——pi 端到端已实证可行
