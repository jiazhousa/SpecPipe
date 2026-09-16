# 03-story-path —— Story 路径

本卷定义 Story 级需求（单模块内完整功能）的流程：两阶段设计（Spec + Impl），每阶段均有访谈澄清 + 审查者审查，编码后质量门终检。适用阶段：S2 判定为 Story 后加载。

```
S-S3 构建 Story Spec
 → S-S4 访谈与澄清（用户参与）
 → S-S5 审查者审查 ──REJECT──→ 回到 S-S3
 → S-S5 PASS → 阻塞，等待用户放行
 → S-S6 构建 Story Impl
 → S-S7 访谈与澄清（用户参与）
 → S-S8 审查者审查 ──REJECT──→ 回到 S-S6
 → S-S8 PASS → 不阻塞，直接进入 S-S9
 → S-S9 编码 → S-S10 质量门（审查者全面审查）→ DONE
```

## S-S3 构建 Story Spec

调度者产出 spec 草案（≤100 行），写入 `{wf}/plans/{topic}/spec.md`，`.stage` → `SPEC_DRAFT`。草案骨架见 `templates/spec-template.md`。

## S-S4 访谈与澄清（用户参与）

前置访谈已完成设想与范围澄清，此处针对 **spec 草案中的业务细节待澄清项**做专项访谈——确认单个 Story 的所有业务规则、验收标准、边界条件。调度者分批向用户提问（每次 1-3 个问题），逐轮更新 spec。澄清完毕后产出 spec 终稿（≤300 行），终稿骨架见 `templates/spec-template.md`。

**这是 Story 路径中用户主要参与的环节。**

## S-S5 Spec 审查（轻量）

调度者将 `.stage` → `SPEC_REVIEWING`，然后调用**审查者**（下级代理）对 spec 终稿做**轻量审查**。此阶段 impl 尚未产出、无实际代码可参照，仅做快速检查，**目标是挡住明显问题、快速放行进入 impl 阶段**，把关重心放在 S-S8。

轻量审查仅检查 2 项：**范围边界**、**致命遗漏**（清单详见 09-check-split.md）。

审查报告由审查者**直接写**至 `{wf}/reviews/{topic}-spec-revision-{N}.md`（精简，≤30 行），并更新 `.stage`。

- **# PASS** → `.stage` → `SPEC_USER_AUDIT`，**阻塞等待用户放行**，放行后 `.stage` → `SPEC_APPROVED`，自动进入 S-S6
- **# REJECT** → `.stage` 回退 `SPEC_DRAFT`，回到 S-S3 由调度者根据审查报告修改 spec，修复后重新进入 S-S5 审查
- **# REJECT: SPEC_OVERTURN** → 知会用户，确认后 `.stage` 回退 `SPEC_DRAFT`；若当前 Story 属于 Epic，需额外知会用户确认是否连锁回退 Epic Spec
- **# N ≥ 3 轮 REJECT** → 提示用户人工裁决（可选：继续修改 / 回 S2 重新分级为 Issue / 放弃需求；重新分级时调度者回 S2 向用户提议降级，经用户确认后清理已产出的 spec 文档并切换路径）

## S-S6 构建 Story Impl

调度者基于已通过的 spec 产出 impl 文档，写入 `{wf}/plans/{topic}/impl.md`，`.stage` → `IMPL_DRAFT`。骨架见 `templates/impl-template.md`。

impl 中定位代码位置时，优先用方法名/类名/注释等语义描述；附行号仅作辅助参考，不作为审查基准（行号标注规范详见 06-artifacts.md）。

## S-S7 访谈与澄清（用户参与）

impl 文档产出后，调度者识别 impl 中的技术决策模糊点（如多种实现方案的选择、兼容性处理方式、性能取舍等），**分批向用户提问**确认。此环节确保技术方案与用户预期一致后再进入审查。

## S-S8 Impl 审查（完整）

调度者将 `.stage` → `IMPL_REVIEWING`，然后调用**审查者**（下级代理）对 impl 做**完整审查**。此阶段已有 spec 终稿 + impl 文档 + 调研产出的相关代码上下文，审查者需结合实际代码深入核查。这是把关重心。

完整审查按 6 项清单：**术语一致性 / 范围对齐 / 改动点核查 / 隐藏依赖 / 风险与兜底 / 回归面**（详见 09-check-split.md）。

审查报告由审查者**直接写**至 `{wf}/reviews/{topic}-impl-revision-{N}.md`，并更新 `.stage`。

- **# PASS** → `.stage` → `IMPL_APPROVED`，**不阻塞，直接进入 S-S9**
- **# REJECT** → `.stage` 回退 `IMPL_DRAFT`，回到 S-S6 由调度者根据审查报告修改 impl，修复后重新进入 S-S8 审查
- **# REJECT: SPEC_OVERTURN** → 知会用户，确认后 `.stage` 回退 `SPEC_DRAFT`；若当前 Story 属于 Epic，需额外知会用户确认是否连锁回退 Epic Spec

## S-S9 编码

调度者将 impl 描述的改动**派发给执行者（下级代理）执行**，自己不直接写码，负责任务切分、冲突调节与进度把控。

1. 调度者置 `.stage` → `WORKING`
2. **环境检查**：按 10-composition.md「编码环境规范」创建 worktree，从开发主分支拉取新分支（分支类型按 Story 性质命名）
3. **任务切分与派发**（调度者的核心调度工作）：
   - 按 impl.md 的改动点把编码工作切成**文件集不相交**的任务块（并行派发的前提，避免多个执行者互踩同一文件）
   - 每个任务块遵循**任务书标准**：执行范围（impl.md 章节）+ 工作目录（worktree 路径）+ 最小验证命令 + 交付物（见 08-roles.md）
   - 可多块并行派发（下级代理调用机制支持并行）；串行小任务调度者可酌情自己直接执行（如 3 文件以内的小改动，减少调度开销）
4. **进度把控与冲突调节**：收集各执行者报告；BLOCKED 项由调度者决策（补充任务书 / 改方案 / 升级问用户）；并行执行者报告的文件级冲突由调度者仲裁
5. **收尾统一验证（fence 后台化，与质量门并行）**：全部任务块完成后即代码事实冻结，调度者**立即在可持久化后台会话启动 fence**（测试围栏：全量单测 + E2E，按 Story 收尾一次的节奏，不在单个任务块中重复跑），**不阻塞等待**——同时继续步骤 6/7；fence 结论由调度者在**汇合点**（审查者审查完成时）核实 `test-fence-reports/summary.txt`
6. **文档归档与 AGENTS.md**：调度者把 spec.md/impl.md 归档，关键 feature 追加到项目根 `AGENTS.md`
7. 调度者整理 commit（本地 commit，每个 commit 能独立编译），置 `.stage` → `QUALITY_GATE`，**随即派发审查者**（与后台 fence 并行）做全面审查。**汇合点**：审查者与 fence 均完成 → 双 PASS → `.stage` → `DONE`；任一失败按下述增量重跑规则处理后重新汇合：
   - 审查者 REJECT + 修复仅涉测试代码/注释/文档 → fence 不重跑，审查者复审新 diff 即可
   - 修复涉及生产代码 → fence 重跑（可持久化后台会话）+ 审查者复审，再次汇合
   - fence REJECT → 修复后 fence 必重跑（串行模式下同样如此，并行未引入额外成本）

fence 编排细则（后台会话操作与日志落盘）见 10-composition.md。

## S-S10 质量门

所有 Story 在提交到远端前必须经过质量门终检：审查者在 `QUALITY_GATE` 状态一次性执行 7 项全面审查（impl 一致性 / 代码质量 / commit 信息 / 整体编译 / 受影响模块测试 / 测试覆盖回归 / 文档归档，清单见 09-check-split.md）。**PASS** → `.stage` → `DONE`；**REJECT** → `.stage` → `WORKING`，修复后重新递交、全量重审。`DONE` 的前置条件 = 审查者 PASS **且** 调度者汇合核实 fence PASS。

> **编码失败处理**：执行者自验失败自行修复（报告 BLOCKED 前最多 3 次）；质量门 REJECT 时调度者派发执行者修复后重新递交；连续 3 轮失败则提示用户人工介入。
