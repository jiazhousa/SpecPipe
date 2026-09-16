# 05-issue-path —— Issue 路径

本卷定义 Issue 级需求（Bug fix、小功能性调整、单点优化）的流程。**Issue 不走 Spec 阶段**——需求在 S1 前置访谈中已聊清所有改动点，S2 确认后直接产出 Impl 文档 → 审查 → 编码 → 质量门。适用阶段：S2 判定为 Issue 后加载。

```
I-S3 构建 Issue Impl
 → I-S4 访谈与澄清（用户参与）
 → I-S5 审查者审查 ──REJECT──→ 回到 I-S3
 → I-S5 PASS → 不阻塞，直接进入 I-S6
 → I-S6 编码 → I-S7 质量门（审查者全面审查）→ DONE
```

## I-S3 构建 Issue Impl

调度者基于 S1 前置访谈中已确认的改动点，产出 **Issue Impl 文档**，写入 `{wf}/plans/{topic}/issue-impl.md`，`.stage` → `ISSUE_IMPL_DRAFT`。

Issue Impl 是精简版实现方案文档，描述具体技术方案和改动点。无需先产出 Spec 文档——S1 访谈的产出（改动点列表、影响范围、验证方式）直接作为 Impl 的输入。

文档 ≤80 行，骨架见 `templates/issue-impl-template.md`。

## I-S4 访谈与澄清（用户参与）

调度者识别 Issue Impl 中的技术决策模糊点（如多种实现方案的选择、兼容性处理方式等），**分批向用户提问**确认。此环节确保技术方案与用户预期一致后再进入审查。通常比 S-S7 更简短（问题更聚焦）。

**这是 Issue 路径中用户主要参与的环节**（S1 前置访谈之外，澄清技术方案细节的唯一环节）。

## I-S5 Issue Impl 审查（完整但精简）

调度者将 `.stage` → `ISSUE_IMPL_REVIEWING`，然后调用**审查者**（下级代理）对 Issue Impl 做**完整审查**。审查方法与 S-S8 相同（6 项清单，见 09-check-split.md），但范围更聚焦（改动文件 ≤3 个，审查深度适配 Issue 规模）。由于无独立 Spec 文档，"范围对齐"项以 S1 访谈确认的改动点为基准。

审查报告由审查者**直接写**至 `{wf}/reviews/{topic}-issue-impl-revision-{N}.md`，并更新 `.stage`。

- **# PASS** → `.stage` → `ISSUE_IMPL_APPROVED`，**不阻塞，直接进入 I-S6**
- **# REJECT** → `.stage` 回退 `ISSUE_IMPL_DRAFT`，回到 I-S3 由调度者根据审查报告修改 Issue Impl，修复后重新进入 I-S5 审查
- **# REJECT: SPEC_OVERTURN** → 知会用户，确认后 `.stage` 回退 `ISSUE_IMPL_DRAFT`；若发现改动范围超出 issue 级，调度者可建议回 S2 重新分级为 Story（流程同下文升级机制）
- **# N ≥ 3 轮 REJECT** → 提示用户人工裁决（可选：继续修改 / 升级为 Story 路径 / 放弃需求）

## I-S6 编码

同 S-S9 流程（调度者派发执行者执行，Issue 通常单任务块或调度者直接执行）：

1. 调度者置 `.stage` → `WORKING`
2. **环境检查**：按 10-composition.md「编码环境规范」创建 worktree，从开发主分支拉取新分支（分支类型按 Issue 性质命名）
3. **派发编码**：改动 ≤3 文件的 Issue，调度者可直接自己执行（调度开销大于收益）；更大改动派发执行者（任务书标准同 S-S9，见 08-roles.md）
4. 调度者整理 commit（本地 commit，每个 commit 能独立编译）
5. **收尾验证与质量门并行**（同 S-S9 步骤 5/7）：代码冻结后在可持久化后台会话启动 fence（测试围栏），随即置 `.stage` → `QUALITY_GATE` 并派发**审查者**（下级代理）全面审查；汇合点核实 fence `summary.txt`，双 PASS → `.stage` → `DONE`；增量重跑规则见 S-S9 步骤 7

## I-S7 质量门

同 Story 质量门：审查者一次性执行 7 项全面审查（清单见 09-check-split.md），**Issue 跳过文档归档项**。**PASS** → `.stage` → `DONE`；**REJECT** → `.stage` → `WORKING`，修复后重新递交、全量重审。

> **升级机制**：若编码过程中执行者报告改动范围超出预期（如 >3 文件、引入新业务规则），调度者应**暂停编码派发**，主动向用户提示"发现超预期，建议升级为 Story 级"。用户确认升级后：
> 1. 清理当前 `.stage` 文件（`{wf}/plans/{topic}/.stage`）
> 2. 保留已产出的 `issue-impl.md` 作为 S2 决策的参考依据
> 3. 回 S2，基于 issue-impl + 当前代码状态重新分级为 Story
> 4. 确认后创建 Story 的 topic 目录和新的 `.stage` 文件，从 S0 开始

> **编码失败处理**：执行者自验失败自行修复（报告 BLOCKED 前最多 3 次）；质量门 REJECT 时调度者派发执行者修复后重新递交；连续 3 轮失败则提示用户人工介入或升级为 Story。
