# 04-epic-path —— Epic 路径

本卷定义 Epic 级需求（跨多模块、多团队协作的大型需求）的流程：先产出 Epic 级规格文档（含 Story 路线图），审批后逐个 Story 独立走完整流程。适用阶段：S2 判定为 Epic 后加载；Story 推进阶段配合 03-story-path.md。

```
E-S3 构建 Epic Spec
 → E-S4 访谈与澄清（用户参与）
 → E-S5 审查者审查 ──REJECT──→ 回到 E-S3
 → E-S5 PASS → 阻塞，等待用户放行
 → 用户放行 → Epic 流程结束，按路线图进入第一个 Story 的 S0
```

## E-S3 构建 Epic Spec

调度者产出 **Epic Spec 草案**，写入 `{wf}/plans/{topic}/epic-spec.md`，`.stage` → `EPIC_SPEC_DRAFT`。

Epic Spec 是宏观规格文档，描述整个 Epic 的目标、业务规则、验收标准和范围边界，**不涉及具体技术实现细节**（那是各 Story 的 spec/impl 职责）。其中包含 **Story 路线图**（Story 列表 + 优先级 + 依赖关系 + 交付顺序）。

草案 ≤200 行，骨架见 `templates/epic-spec-template.md`。

## E-S4 访谈与澄清（用户参与）

调度者识别 Epic Spec 中的模糊点，**分批向用户提问**（每次 1-3 个问题），逐轮更新。澄清 Epic 级的业务规则、验收标准、范围边界，以及 Story 路线图的合理性。澄清完毕后产出 Epic Spec 终稿（≤500 行），终稿骨架见 `templates/epic-spec-template.md`。

## E-S5 Epic Spec 审查（轻量）

调度者将 `.stage` → `EPIC_SPEC_REVIEWING`，然后调用**审查者**（下级代理）对 Epic Spec 终稿做轻量审查。审查 3 项：**范围边界 / 致命遗漏 / Story 拆分合理性**（清单详见 09-check-split.md）。

报告由审查者**直接写**至 `{wf}/reviews/{topic}-epic-spec-revision-{N}.md`（≤40 行），并更新 `.stage`。

- **# PASS** → `.stage` → `EPIC_SPEC_USER_AUDIT`，**阻塞等待用户放行**
- **# REJECT** → `.stage` 回退 `EPIC_SPEC_DRAFT`，回到 E-S3 由调度者根据审查报告修改，修复后重新进入 E-S5 审查
- **# REJECT: SPEC_OVERTURN** → 知会用户，确认后 `.stage` 回退 `EPIC_SPEC_DRAFT`（若发现 Epic 方向性错误，调度者可建议回 S2 重新分级）
- **用户放行** → `.stage` → `EPIC_SPEC_APPROVED`，Epic 流程结束

## Epic 进度推进

用户放行后，按路线图中的交付顺序，**逐个 Story 从 S0 开始走完整 Story 路径**（每个 Story 独立 topic 目录，独立调研/spec/impl/审查）。

> **无依赖 Story 可并行（可选）**：路线图中标注「无依赖」且文件集不相交的 Story（如前后端边界清晰、各自独立 worktree），可**并行推进多条 Story 流水线**（各自独立 topic/.stage/worktree/执行者，Epic Spec 路线图在 E-S3 就标注哪些 Story 可并行）。代价是用户访谈会交织（多个 Story 的澄清/放行请求需按 topic 区分），调度复杂度上升——启用前需向用户说明并确认。有依赖关系的 Story 仍严格串行。

> **Epic 下 Story 的 S2 是确认性判定**：Epic Spec 已预分类各子需求为 Story 级，因此 Epic 下 Story 的 S2 不需要重新论证等级，仅确认"该子需求仍为 Story 级、范围未偏移"即可推进。若 S0/S1 发现该子需求实际超出 Story 范围，调度者应知会用户并评估是否回退 Epic Spec 重新拆分。

每个 Story 完成后，调度者更新 Epic 的 `epic-spec.md` 中对应 Story 的状态标记（如 ✅/🔄/⏳）。

**Epic 终检**：当所有 Story 均完成时，调度者在标记 `ALL_DONE` 前执行以下校验：

1. 每个 Story 的 `.stage` 均为 `DONE`（即各自质量门已通过）
2. `epic-spec.md` 中所有 Story 状态标记为 ✅
3. 若任一 Story 未达 `DONE`，继续推进该 Story 而非标记 `ALL_DONE`

校验通过后，Epic 的 `.stage` → `ALL_DONE`。

> **注**：Epic 下的每个 Story 走完整 Story 路径，各环节审查深度与独立 Story 一致，Epic Spec 不作为跳过审查的依据。
