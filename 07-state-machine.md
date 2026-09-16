# 07-state-machine —— 状态机

> 本卷定义 `.stage` / `.stage-history` 的格式契约、三路径状态链、转移规则与中断恢复；适用于全流程状态管理。

## 状态文件

- **`.stage`**：`{wf}/plans/{topic}/.stage`，单行文件，内容为当前状态名（如 `SPEC_DRAFT`）
- **`.stage-history`**：`{wf}/plans/{topic}/.stage-history`，状态变更留痕（JSONL，工件表见 06-artifacts.md）。每次 `.stage` 变更由审查工具自动追加一行：

```jsonl
{"ts": "2026-09-16T21:00:00+08:00", "topic": "bd-score-panel", "from": "SPEC_REVIEWING", "to": "SPEC_USER_AUDIT", "actor": "审查者"}
```

- 字段：`ts` 时间戳 / `topic` 主题名 / `from` 变更前状态 / `to` 变更后状态 / `actor` 操作角色
- `actor` ∈ {调度者, 审查者}，与下方职责分工一致——留痕契约由工具实现方落地，代理不手写

## 三路径状态链

**Epic 路径：**

```
EPIC_SPEC_DRAFT → EPIC_SPEC_REVIEWING → EPIC_SPEC_USER_AUDIT [阻塞等用户放行] → EPIC_SPEC_APPROVED → （逐个 Story 从 S0 进入 Story 路径）→ ALL_DONE
```

**Story 路径：**

```
SPEC_DRAFT → SPEC_REVIEWING → SPEC_USER_AUDIT [阻塞等用户放行] → SPEC_APPROVED → IMPL_DRAFT → IMPL_REVIEWING → IMPL_APPROVED → WORKING → QUALITY_GATE → DONE
```

**Issue 路径：**

```
ISSUE_IMPL_DRAFT → ISSUE_IMPL_REVIEWING → ISSUE_IMPL_APPROVED [不阻塞] → WORKING → QUALITY_GATE → DONE
```

## 状态更新职责分工

- **调度者与审查者分工更新 `.stage`**：调度者负责流程推进（DRAFT 创建、`*_REVIEWING` 标记、`WORKING`、`QUALITY_GATE` 标记、用户放行后 `SPEC_APPROVED`/`EPIC_SPEC_APPROVED`、终检双 PASS 后 `DONE`）；审查者负责审查结果落定（PASS → 下一状态，REJECT → 回退 DRAFT / `WORKING`，按下方转移表执行）

**审查者状态转移表**（审查者审查完成后更新 `.stage`）：

| 审查类型 | 审查前状态（调度者设置） | PASS → | REJECT → |
|---|---|---|---|
| Epic Spec（E-S5） | `EPIC_SPEC_REVIEWING` | `EPIC_SPEC_USER_AUDIT` | `EPIC_SPEC_DRAFT` |
| Spec（S-S5） | `SPEC_REVIEWING` | `SPEC_USER_AUDIT` | `SPEC_DRAFT` |
| Impl（S-S8） | `IMPL_REVIEWING` | `IMPL_APPROVED` | `IMPL_DRAFT` |
| Issue Impl（I-S5） | `ISSUE_IMPL_REVIEWING` | `ISSUE_IMPL_APPROVED` | `ISSUE_IMPL_DRAFT` |
| 全面审查（质量门，S-S9/I-S6） | `QUALITY_GATE` | `DONE` | `WORKING`（执行者修复 → 重新递交） |

## 状态规则

> 审查者审查前先读 `.stage` 校验当前状态与上表「审查前状态」一致，不一致则中止并提示调度者。

- 审查不通过 → 回退到前一个 DRAFT，调度者修复文档后重新提交审查（质量门全面审查例外：REJECT 回 `WORKING`，调度者派发执行者修复后重新递交）
- Impl 审查推翻 spec → 回退 `SPEC_DRAFT` / `ISSUE_IMPL_DRAFT`（Epic 下 Story 需评估是否连锁回退 Epic Spec）
- **S-S5 审查通过后阻塞** — `SPEC_USER_AUDIT` 状态下须用户放行才进入 S-S6
- **E-S5 审查通过后阻塞** — `EPIC_SPEC_USER_AUDIT` 状态下须用户放行才结束 Epic 流程
- **I-S5 审查通过后不阻塞** — `ISSUE_IMPL_APPROVED` 后直接进入编码（Issue 无 Spec 阶段，无用户放行环节）
- **S-S8 通过后不阻塞** — `IMPL_APPROVED` 后直接进入 S-S9 编码
- **质量门是终检（审查者全面审查）** — `QUALITY_GATE` 状态下审查者一次性执行全面审查（实现与 impl 一致性 + 代码质量 + commit 信息 + 整体编译 + 受影响模块测试 + 测试覆盖回归 + 文档归档），PASS → `DONE`，REJECT → `WORKING`。测试围栏（fence）由调度者后台并行启动，`DONE` 的前置条件 = 审查者 PASS **且** 调度者汇合核实 fence PASS
- **Issue 编码中升级** — 若发现改动超预期，暂停编码，清理 `.stage` 文件，保留 issue-impl 作为参考，回 S2 重新分级
- **S2 统一调度点允许等级重调整** — 调研+访谈结束后，调度者可基于实际发现提议升级或降级，经用户确认后调整路径
- **SPEC_OVERTURN 回 S2 不重跑调研** — 任何阶段审查推翻 spec（或 Issue 编码中发现需升级）回 S2 时，**不重跑 S0/S1**，仅基于已有产出（spec/impl/issue-impl）和访谈结果重新论证等级。若已有产出不足以支撑新等级判定，调度者可补充定向调研（仅针对新等级的判定依据，非全量重跑）

## 中断恢复

会话中断（用户关闭终端、上下文耗尽等）后重启，调度者按以下步骤恢复：

1. **检查 `{wf}/plans/{topic}/.stage`** — 读取当前阶段状态
2. **按状态定位恢复点**（七类）：
   - `*_DRAFT` → 重新读取已产出的文档（spec/impl），继续当前阶段
   - `*_REVIEWING` → 重新调用审查者审查已有文档
   - `*_USER_AUDIT` → 向用户重新输出 spec 摘要并询问是否放行
   - `*_APPROVED` → 自动推进到下一阶段
   - `WORKING` → 检查 worktree 中代码变更状态与执行者任务书执行进度，继续派发/收尾
   - `QUALITY_GATE` → 重新调用审查者执行全面审查
   - `DONE` / `ALL_DONE` → 流程已完成，无需恢复
3. **无 `.stage` 文件** → 检查 `{wf}/plans/{topic}/` 目录是否存在 `issue-impl.md` 或 `spec.md`：
   - 若存在 — 可能是**升级后残留**（Issue 升级为 Story 时清理了 `.stage`），询问用户是否继续升级流程还是重新开始
   - 若不存在 — 视为新工作流，从 S0 开始

> **恢复前提**：`.stage` 与 `{wf}/plans/` 下的文档是恢复的依据，若丢失则无法恢复、需从头开始。调度者与审查者在每次 `.stage` 变更后应确保文件已持久化（留痕同步写入 `.stage-history`）。
