# T07 指派与观察记录（minimal-crm 端到端）

> 指派方：OpenCode（oracle 会话，扮演用户提出需求并行使 HITL 确认）；被指派方：pi @ ~/project/minimal-crm。
> 模型路由：主会话 = zai-coding-cn/glm-5.3（统筹+执行）；推断型 sensor = deepseek/deepseek-flash sidecar（跨家族，D34）。

## 注入方式（T05 采证落地）

- skills：`pi install <SpecPipe 仓路径> -l`（项目级包，`.pi/settings.json` → 本地路径原地加载，package.json pi 键 → skills/）
- CLI：`~/.local/bin/specp` wrapper → `node ~/project/specpipe/cli/specp.mjs`
- 项目上下文：minimal-crm/AGENTS.md（工作流约定 + 技术栈）
- 会话：`--session-id minimal-crm` 跨轮续会话；每轮 `pi -p` 单发，卡点处 pi 主动停等

## Stage 记录

| Stage | 内容 | 观察到的规约行为 | 卡点 |
|---|---|---|---|
| S1 分级 | 提出需求 → pi 加载 spec-workflow → 对照判定表 → 结论 Story（理由充分） | 未臆测、给判定依据 | 卡点 1 分级确认 ✅ |
| S2 spec 草案+澄清 | spec 同步 → 三要素草案（未知项标 NEEDS CLARIFICATION）→ **分轮逐项确认（8 问 3 轮）**；主动跑 `specp check spec` 自查 | 每问附选项与权衡；Q3 主动标注破坏性副作用需放行 | 卡点 2×2 轮 ✅ |
| S2.5 spec sensor | deepseek sidecar 判定：**REJECT 64（致命遗漏 Q7/Q8）→ pi 按业务未定出口拒绝臆测、回来问用户 → 修订 → PASS 88 → WARN 处置 → 终判 91** | 重作回路真实迭代两轮；业务决策权正确归于用户 | 卡点 3 ✅ |
| S3 终稿放行 | 90 行（预算 300）、副作用 5 条分级正确（SE3 破坏性已放行）、3 个默认提案显式呈确认 | 可兼容副作用附兼容方案 | 卡点 4 ✅ |
| S4 impl 统筹 | 技术方案（原子写/损坏报错/ISO8601）+ 4 task 单链 DAG + **impl sensor PASS 92（重作 1 轮）** + `specp check all` 全绿 | 一 task 一 commit 计划；分支纪律（dev/feat/*） | 卡点 5 派发确认 ✅ |
| S5 task 执行 | T01→T04（骨架存储/客户域/跟进域/文档验收），每 task 编码→计算型 sensor→推断型 sensor→单 commit | **已收敛**（2026-10-14）：5 commit（T01-T04+收敛）全落地；4 个非业务问题自愈（断言修正×2/锚定关键字对齐/AGENTS 归属）；fence 25/25；check all 0F0W | 卡点 6 ✅ |
| S6 人工验收 | Oracle 独立复验（check all 0F0W + fence 25/25 + 功能冒烟 + **deepseek sensor3 终判 PASS 91**）→ **通过**；证据落盘 minimal-crm `specs/minimal-crm-cli/acceptance.md`；pi 会话已闭环（无远端不 push） | 独立复验不信自报；sensor3 唯一 medium（卡点 6 证据）当场补齐 | ✅ |

## 验收 sensor 状态

- sensor2（计算型）：skill 结构合规 ✅ + **pi 加载验证 ✅**（`pi -p` 列出全部七件 spec-* skills）
- sensor1（计算型）：CLI 全程可用（pi 各 stage 主动调用 specp check/rules）——终验在 T08
- sensor3（推断型）：流程规范化/卡点可复查/工件链完整——本记录即复查材料；deepseek 终判在 T08
