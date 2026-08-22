---
name: specpipe
description: 编码工作流 — Oracle（主会话调度者）驱动 spec→impl→coding→质量门全流程，用户只在访谈澄清、分级确认、审查不通过时参与。四角色架构：Oracle（主会话，调度者）+ Explorer（只读子代理调研）+ Checker（质量卡点子代理，写报告并更新状态）+ Builder（编码执行子代理，按 impl.md 任务书编码）；可选 Looker（视觉解析子代理，仅当 Oracle 模型不支持图片输入时部署）。
license: MIT
compatibility: opencode
metadata:
  author: starlex
  version: 1.0.0
  workflow: spec-impl-coding
---

# 编码工作流（SpecPipe）

Oracle（主会话调度者）驱动的编码流程。用户只需在**访谈澄清、分级确认、审查不通过**时参与，其余全自动推进。工作流根据需求规模自动分流为 Epic / Story / Issue 三条路径。

> **opencode 基底**：本 skill 基于 opencode 的四角色架构。**Oracle 是主会话**（有状态，承载状态机、用户访谈与任务调度，不直接编码）；Explorer/Checker/Builder 是**无状态 subagent**，三者平级、互不调用，均由 Oracle 通过 `task` 工具调用（`subagent_type` 取 agent 文件名：`explorer` / `checker` / `builder`），代理定义在 `~/.config/opencode/agents/`。另有**可选的 Looker**（视觉解析 subagent，`looker`）：仅当 Oracle 的模型不支持图片输入时部署，专职图片解析（详见「角色与协作模式」章节）。

> **路径约定**：本文档中所有工作流产出路径均使用 `{wf}/` 作为工作流根目录占位符，默认映射为 **`.specpipe/`**（项目根目录下，可在 `config.md` 中修改）：
> - `{wf}/plans/{topic}/spec.md` = `.specpipe/plans/{topic}/spec.md`
>
> **配置**：所有可配置项（角色模型、provider、工作流根目录、Git 分支策略等）集中在 `config.md`（本 skill 目录下，全局 `~/.config/opencode/skills/specpipe/config.md`）。**Builder 在进入工作流（S0 前）时用 read 工具加载 `config.md`，用配置值替换本文档中的 `{{key}}` 占位符**。默认值即作者个人配置。
>
> **按需文档加载**：本文档引用 `docs/quality-gate.md`、`docs/git-branch-guide.md` 等按需加载文档，路径为 `~/.config/opencode/skills/specpipe/docs/`。Builder/Checker 在进入对应环节时用 read 工具加载。

## 触发

当 Oracle 收到用户的开发需求时，**默认进入工作流**（不再仅以"功能级开发"为触发门槛，因为分级判定会自动区分 issue / story / epic）。

- 用户也可直接说"走编码工作流"显式触发
- 极简任务（单行改动、纯文档）Oracle 可自行判断不走工作流，但需知会用户

## 需求分级

Oracle 在 **S0 调研 + S1 前置访谈**完成后，基于调研产出和访谈结果判定需求规格级别。分级标准：

| 级别 | 判定特征 | 走哪条路径 |
|------|---------|-----------|
| **Epic** | 跨多模块、多团队协作；含 ≥3 个可独立交付的子需求；周期 >2 周；涉及架构演进或业务流程重构 | Epic 路径（E- 前缀） |
| **Story** | 单模块内完整功能；有明确业务规则和验收标准；周期 3 天-2 周；需 spec + impl 两阶段设计 | Story 路径（S- 前缀） |
| **Issue** | Bug fix、小功能性调整、单点优化；改动范围 ≤3 文件；无新业务规则引入；周期 ≤2 天 | Issue 路径（I- 前缀） |

**判定由 Oracle 自行完成**，不调用额外角色。判定后向用户说明级别和理由，并进入对应路径。

## 流程总览

```
S0 调研
 → S1 前置访谈（用户参与，定设想+范围+改动点）
 → S2 分级判定（统一调度点，允许等级重调整，用户确认）
  ──┬─ Epic  ─→ E-S3 → E-S4 → E-S5 → 用户放行 → 按路线图逐个 Story 从 S0 开始
    ├─ Story ─→ S-S3 → S-S4 → S-S5 → 用户放行 → S-S6 → S-S7 → S-S8 → S-S9 编码 → S-S10 质量门
    └─ Issue ─→ I-S3 Impl → I-S4 澄清 → I-S5 审查 → I-S6 编码 → I-S7 质量门
```

> **S2 是统一调度点** — 调研 + 访谈结束后，Oracle 做等级判定。若发现实际需求与初步判定不符，可在此时**提议升级或降级**，经用户确认后调整路径。详见后文「S2 分级判定」章节。

> **Issue 不走 spec 阶段** — Issue 级别的需求在 S1 前置访谈中就把改动点聊清楚，S2 确认后直接产出 Impl 文档 → 审查 → 编码 → 质量门。无 Spec 文档、无 Spec 审查。

> **质量门（S-S10 / I-S7）** 是所有编码路径的**终检环节**，在提交到远端前由 Checker 执行全面审查（7 项），通过后才推送分支。详见后文「质量门环节」章节。

---

## 公共环节

### S0 调研

Oracle 调用 **Explorer**（subagent，`task` 工具）执行：
- 任务 A：内部代码库调研（grep 搜索相关代码，理解现有实现）
- 任务 B：外部技术调研（`websearch` MCP + `context7` MCP 搜索技术文档，见「检索工具」）

Oracle 可在同一调研阶段**发起多个 Explorer 任务**（`task` 工具支持并行调用）。产出保留在对话上下文，不写文件。

**Explorer 调用模板**（Oracle 用 task 工具）：
```
task(
  subagent_type: "explorer",
  description: "S0 调研：{topic}",
  prompt: "调研需求：{需求描述}。任务 A：检索代码库相关实现；任务 B：用 websearch 和 context7 查外部技术方案。输出结构化调研结果。"
)
```

### S1 前置访谈（用户参与）

Oracle 基于调研产出，识别需求中的模糊点，**分批向用户提问**（每次 1-3 个问题），逐轮澄清。

**前置访谈的目的**是确定**用户的设想和改动范围**，为分级判定收集足够信息。对于 Issue 级别的需求（Bug fix、小调整），前置访谈需**聊清所有涉及的具体改动点**（哪些文件、什么改法、边界条件），因为 Issue 路径不设 Spec 阶段，访谈是确认需求的唯一环节。对于 Story/Epic 级别的需求，业务细节在 S-S4/E-S4 环节完成，前置访谈只需确定设想和范围。

访谈完成后进入 **S2 分级判定**。

### S2 分级判定（统一调度点，用户确认）

S2 是**统一调度点**——调研 + 访谈结束后，Oracle 做等级判定。此处**允许等级重调整**：

Oracle 基于 S0 调研 + S1 前置访谈结果，按上文"需求分级"表判定级别，向用户输出：

> **需求级别判定：[Epic / Story / Issue]**
> 判定理由：...
> 建议路径：[Epic 路径 / Story 路径 / Issue 路径]

**等级重调整场景**：
- **升级** — 初步判定为 Issue，但访谈中发现涉及 >3 文件或引入新业务规则 → Oracle 主动提议升级为 Story
- **升级** — 初步判定为 Story，但访谈中发现跨多模块、含多个可独立交付子需求 → 提议升级为 Epic
- **降级** — 初步判定为 Story/Epic，但访谈中发现实际改动范围很小 → 提议降级为 Issue
- **用户主动调整** — 用户对分级有异议，按用户意见调整

重调整时 Oracle 需说明**调整理由**（哪些事实与原级别判定标准不符），经用户确认后进入调整后的路径。

**此环节阻塞，Oracle 不自动推进。**

### 用户放行机制（适用于所有阻塞点）

工作流中有两处阻塞点需要**用户放行**：E-S5 后的 Epic Spec 放行、S-S5 后的 Story Spec 放行。Oracle 在阻塞状态下向用户输出审查通过的 spec 终稿摘要，并明确询问"是否放行进入下一阶段？"。

**放行判定规则**：
- 用户回复"放行"/"通过"/"同意"/"继续"/"OK"/"可以" 等肯定语义 → Oracle 判定为放行，推进流程
- 用户回复"修改"/"不改"/"有意见"/"等等" 等否定或犹豫语义 → Oracle 继续听取用户意见，根据反馈修改 spec 后重新提交审查（回到对应审查环节）
- 用户提出新的修改要求 → Oracle 修改 spec 后重新提交审查
- **不自动推进**：Oracle 不得在用户未明确回复时自行判定放行

---

## Epic 路径（E- 前缀）

适用于大型需求，需先产出 Epic 级规格文档（含 Story 路线图），审批后逐个 Story 独立走完整流程。

```
E-S3 构建 Epic Spec
 → E-S4 访谈与澄清（用户参与）
 → E-S5 Checker 审查 ──REJECT──→ 回到 E-S3
 → E-S5 PASS → 阻塞，等待用户放行
 → 用户放行 → Epic 流程结束，按路线图进入第一个 Story 的 S0
```

### E-S3 构建 Epic Spec

Oracle 产出 **Epic Spec 草案**，写入 `{wf}/plans/{topic}/epic-spec.md`，`.stage` → `EPIC_SPEC_DRAFT`。

Epic Spec 是宏观规格文档，描述整个 Epic 的目标、业务规则、验收标准和范围边界，**不涉及具体技术实现细节**（那是各 Story 的 spec/impl 职责）。其中包含 **Story 路线图**（Story 列表 + 优先级 + 依赖关系 + 交付顺序）。

Epic Spec 草案格式（≤200 行）：
```markdown
# Epic Spec: [需求标题]
## 背景 | 总体目标 | 范围边界 | 待澄清
## Story 路线图（建议）
```

### E-S4 访谈与澄清（用户参与）

Oracle 识别 Epic Spec 中的模糊点，**分批向用户提问**（每次 1-3 个问题），逐轮更新。澄清 Epic 级的业务规则、验收标准、范围边界，以及 Story 路线图的合理性。澄清完毕后产出 Epic Spec 终稿（≤500 行）。

Epic Spec 终稿格式：
```markdown
# Epic Spec: [需求标题]
## 背景 | 业务规则 | 验收标准 | 范围边界 | 关键风险
## Story 路线图
### Story 1: [标题] — 优先级 / 依赖 / 预估 / 范围摘要
### Story 2: ...
## 交付顺序与里程碑
```

### E-S5 Epic Spec 审查（轻量）

Oracle 将 `.stage` → `EPIC_SPEC_REVIEWING`，然后调用 **Checker**（subagent，`task` 工具）对 Epic Spec 终稿做轻量审查。审查项：

1. **范围边界** — 做什么、不做什么是否清晰？有无范围蔓延？
2. **致命遗漏** — 是否有明显未声明的核心依赖或架构级硬伤？
3. **Story 拆分合理性** — 路线图是否覆盖 Epic 全部范围？Story 粒度是否适中？依赖关系是否清晰？

报告由 Checker **直接写**至 `{wf}/reviews/{topic}-epic-spec-revision-{N}.md`（≤40 行），并更新 `.stage`。

**Checker 调用模板**（Builder 用 task 工具）：
```
task(
  subagent_type: "checker",
  description: "E-S5 审查 Epic Spec：{topic} revision {N}",
  prompt: "审查 Epic Spec 文档 @{wf}/plans/{topic}/epic-spec.md，当前 .stage 为 EPIC_SPEC_REVIEWING。按 Epic Spec 轻量审查清单检查。写报告至 {wf}/reviews/{topic}-epic-spec-revision-{N}.md，更新 .stage。stdout 返回 PASS/REJECT、报告路径、.stage 更新结果。"
)
```

- **# PASS** → `.stage` → `EPIC_SPEC_USER_AUDIT`，**阻塞等待用户放行**
- **# REJECT** → `.stage` 回退 `EPIC_SPEC_DRAFT`，回到 E-S3 由 Oracle 根据审查报告修改，修复后重新进入 E-S5 审查
- **# REJECT: SPEC_OVERTURN** → 知会用户，确认后 `.stage` 回退 `EPIC_SPEC_DRAFT`（若发现 Epic 方向性错误，Oracle 可建议回 S2 重新分级）
- **用户放行** → `.stage` → `EPIC_SPEC_APPROVED`，Epic 流程结束

### Epic 进度推进

用户放行后，按路线图中的交付顺序，**逐个 Story 从 S0 开始走完整 Story 路径**（每个 Story 独立 topic 目录，独立调研/spec/impl/审查）。

> **Epic 下 Story 的 S2 是确认性判定**：Epic Spec 已预分类各子需求为 Story 级，因此 Epic 下 Story 的 S2 不需要重新论证等级，仅确认"该子需求仍为 Story 级、范围未偏移"即可推进。若 S0/S1 发现该子需求实际超出 Story 范围，Oracle 应知会用户并评估是否回退 Epic Spec 重新拆分。

每个 Story 完成后，Oracle 更新 Epic 的 `epic-spec.md` 中对应 Story 的状态标记（如 ✅/🔄/⏳）。

**Epic 终检**：当所有 Story 均完成时，Oracle 在标记 `ALL_DONE` 前执行以下校验：
1. 每个 Story 的 `.stage` 均为 `DONE`（即各自质量门已通过）
2. `epic-spec.md` 中所有 Story 状态标记为 ✅
3. 若任一 Story 未达 `DONE`，继续推进该 Story 而非标记 `ALL_DONE`

校验通过后，Epic 的 `.stage` → `ALL_DONE`。

> **注**：Epic 下的每个 Story 走完整 Story 路径，各环节审查深度与独立 Story 一致，Epic Spec 不作为跳过审查的依据。

---

## Story 路径（S- 前缀）

适用于标准功能开发。两阶段设计（Spec + Impl），每阶段均有访谈澄清 + Checker 审查。

```
S-S3 构建 Story Spec
 → S-S4 访谈与澄清（用户参与）
 → S-S5 Checker 审查 ──REJECT──→ 回到 S-S3
 → S-S5 PASS → 阻塞，等待用户放行
 → S-S6 构建 Story Impl
 → S-S7 访谈与澄清（用户参与）
 → S-S8 Checker 审查 ──REJECT──→ 回到 S-S6
 → S-S8 PASS → 不阻塞，直接进入 S-S9
 → S-S9 编码 → S-S10 质量门（Checker 全面审查）→ DONE
```

### S-S3 构建 Story Spec

Oracle 产出 spec 草案（≤100 行），写入 `{wf}/plans/{topic}/spec.md`，`.stage` → `SPEC_DRAFT`。

格式：
```markdown
# Spec: [需求标题]
## 背景 | 目标 | 范围 | 待澄清
```

### S-S4 访谈与澄清（用户参与）

前置访谈已完成设想与范围澄清，此处针对 **spec 草案中的业务细节待澄清项**做专项访谈——确认单个 Story 的所有业务规则、验收标准、边界条件。Oracle 分批向用户提问（每次 1-3 个问题），逐轮更新 spec。澄清完毕后产出 spec 终稿（≤300 行）。

终稿格式：
```markdown
# Spec: [需求标题]
## 背景 | 业务规则 | 验收标准 | 范围 | 关键风险
```

**这是 Story 路径中用户主要参与的环节。**

### S-S5 Spec 审查（轻量）

Oracle 将 `.stage` → `SPEC_REVIEWING`，然后调用 **Checker**（subagent）对 spec 终稿做**轻量审查**。此阶段 impl 尚未产出、无实际代码可参照，仅做快速 sanity check，**目标是挡住明显问题、快速放行进入 impl 阶段**，把关重心放在 S-S8。

轻量审查仅检查 2 项：

1. **范围边界** — 做什么、不做什么是否大致清晰？有无明显范围蔓延？
2. **致命遗漏** — 是否有明显未声明的核心依赖或架构级硬伤？

审查报告由 Checker **直接写**至 `{wf}/reviews/{topic}-spec-revision-{N}.md`（精简，≤30 行），并更新 `.stage`。

- **# PASS** → `.stage` → `SPEC_USER_AUDIT`，**阻塞等待用户放行**，放行后 `.stage` → `SPEC_APPROVED`，自动进入 S-S6
- **# REJECT** → `.stage` 回退 `SPEC_DRAFT`，回到 S-S3 由 Oracle 根据审查报告修改 spec，修复后重新进入 S-S5 审查
- **# REJECT: SPEC_OVERTURN** → 知会用户，确认后 `.stage` 回退 `SPEC_DRAFT`；若当前 Story 属于 Epic，需额外知会用户确认是否连锁回退 Epic Spec
- **N ≥ 3 轮 REJECT** → 提示用户人工裁决（可选：继续修改 / 回 S2 重新分级为 Issue / 放弃需求；重新分级时 Oracle 回 S2 向用户提议降级，经用户确认后清理已产出的 spec 文档并切换路径）

### S-S6 构建 Story Impl

Oracle 基于已通过的 spec 产出 impl 文档，写入 `{wf}/plans/{topic}/impl.md`，`.stage` → `IMPL_DRAFT`。

格式：
```markdown
# Impl: [需求标题]
## 技术方案 | 改动点 | 依赖 | 风险
```

> **行号标注规范**：impl 中定位代码位置时，优先用方法名/类名/注释等语义描述（如"advanceCustomer 方法末尾"、"receiveCustomerLog 方法之后"）。若附行号，仅作辅助参考，需标注"约"字（如"约 L2155"），因代码版本变动会导致行号偏移。审查时以语义定位为准，行号不作为审查基准。

### S-S7 访谈与澄清（用户参与）

impl 文档产出后，Oracle 识别 impl 中的技术决策模糊点（如多种实现方案的选择、兼容性处理方式、性能取舍等），**分批向用户提问**确认。此环节确保技术方案与用户预期一致后再进入审查。

### S-S8 Impl 审查（完整）

Oracle 将 `.stage` → `IMPL_REVIEWING`，然后调用 **Checker**（subagent）对 impl 做**完整审查**。此阶段已有 spec 终稿 + impl 文档 + 调研产出的相关代码上下文，Checker 需结合实际代码深入核查。这是把关重心。

完整审查按 6 项清单：

1. **术语一致性** — impl 与 spec 术语是否对齐？有无歧义？
2. **范围对齐** — impl 是否完整覆盖 spec 的业务规则与验收标准？有无遗漏/越界？
3. **改动点核查** — 结合实际代码逐项核对 impl 中列出的改动点，确认路径、类名、方法签名是否真实存在且匹配。**impl 中的行号标注为辅助定位，不作为审查基准**（代码版本变动会导致行号偏移，以方法名/注释/上下文描述定位为准）
4. **隐藏依赖** — 是否依赖未声明的外部系统/接口？是否调用了不存在的方法？
5. **风险与兜底** — 架构/性能/安全风险，异常分支、并发、事务、幂等等是否有兜底？
6. **回归面** — 改动是否波及既有功能？是否需要兼容处理？

审查报告由 Checker **直接写**至 `{wf}/reviews/{topic}-impl-revision-{N}.md`，并更新 `.stage`。

- **# PASS** → `.stage` → `IMPL_APPROVED`，**不阻塞，直接进入 S-S9**
- **# REJECT** → `.stage` 回退 `IMPL_DRAFT`，回到 S-S6 由 Oracle 根据审查报告修改 impl，修复后重新进入 S-S8 审查
- **# REJECT: SPEC_OVERTURN** → 知会用户，确认后 `.stage` 回退 `SPEC_DRAFT`；若当前 Story 属于 Epic，需额外知会用户确认是否连锁回退 Epic Spec

### S-S9 编码

Oracle 将 impl 描述的改动**派发给 Builder（subagent）执行**，自己不直接写码，负责任务切分、冲突调节与进度把控。

1. Oracle 置 `.stage` → `WORKING`
2. **环境检查**：按「编码环境（worktree）」章节创建 worktree，从 develop 分支拉取新分支（分支类型根据 Story 性质命名：`dev/feat/*`、`dev/fix/*`、`dev/refactor/*` 等，见 config.md）
3. **任务切分与派发**（Oracle 的核心调度工作）：
   - 按 impl.md 的改动点把编码工作切成**文件集不相交**的任务块（并行派发的前提，避免多 Builder 互踩同一文件）
   - 每个任务块的 prompt 遵循**任务书标准结构**：执行 impl.md 的哪些章节 + worktree 路径 + **最小验证命令**（如 `mvn compile -pl <模块>` / `-Dtest=<指定类>`，见「任务书标准」）
   - 可多块并行派发（`task` 工具并行调用 Builder）；串行小任务 Oracle 可酌情自己直接执行（如 3 文件以内的小改动，减少调度开销）
4. **进度把控与冲突调节**：收集各 Builder 报告；BLOCKED 项由 Oracle 决策（补充任务书 / 改方案 / 升级问用户）；并行 Builder 报告的文件级冲突由 Oracle 仲裁
5. **收尾统一验证**：全部任务块完成后，Oracle 统一执行全量验证（模块全量单测；**E2E / fence 按 Story 收尾一次的节奏执行**，不在单个任务块中重复跑）
6. **文档归档与 AGENTS.md**：Oracle 把 spec.md/impl.md 归档，关键 feature 追加到项目根 `AGENTS.md`
7. Oracle 整理 commit（本地 commit，每个 commit 能独立编译），置 `.stage` → `QUALITY_GATE`，递交 **Checker**（subagent）做全面审查，直至 PASS → `.stage` → `DONE`

> **任务书标准**（Oracle 派发 Builder 的 prompt 规范，详见「角色与协作模式」）：impl.md 是唯一事实源——prompt 不内嵌实现细节，只指定章节 + 验证命令 + 交付物。impl 写不清楚导致 Builder 做错，责任在 Oracle（文档质量），这倒逼 impl 阶段做实。

> **质量门全面审查**：此环节由 Checker 一次性执行 7 项审查（impl 一致性 + 代码质量 OCR 流水线 + commit 信息 + 整体编译 + 受影响模块测试 + 测试覆盖回归 + 文档归档），审查报告由 Checker **直接写**至 `{wf}/reviews/{topic}-quality-gate-revision-{N}.md`，并更新 `.stage`。

> **编码失败处理**：Builder 自验失败自行修复（报告 BLOCKED 前最多 3 次）；质量门 REJECT 时 Oracle 派发 Builder 修复后重新递交；连续 3 轮失败则提示用户人工介入。

---

## Issue 路径（I- 前缀）

适用于 Bug fix、小功能性调整、单点优化。**Issue 不走 Spec 阶段**——需求在 S1 前置访谈中已聊清所有改动点，S2 确认后直接产出 Impl 文档 → 审查 → 编码 → 质量门。

```
I-S3 构建 Issue Impl
 → I-S4 访谈与澄清（用户参与）
 → I-S5 Checker 审查 ──REJECT──→ 回到 I-S3
 → I-S5 PASS → 不阻塞，直接进入 I-S6
 → I-S6 编码 → I-S7 质量门（Checker 全面审查）→ DONE
```

### I-S3 构建 Issue Impl

Oracle 基于 S1 前置访谈中已确认的改动点，产出 **Issue Impl 文档**，写入 `{wf}/plans/{topic}/issue-impl.md`，`.stage` → `ISSUE_IMPL_DRAFT`。

Issue Impl 是精简版实现方案文档，描述具体技术方案和改动点。无需先产出 Spec 文档——S1 访谈的产出（改动点列表、影响范围、验证方式）直接作为 Impl 的输入。

Issue Impl 文档格式（≤80 行）：
```markdown
# Issue Impl: [标题]
## 问题/需求描述
## 根因分析（Bug 适用）
## 技术方案
## 改动点
- 文件1: 改动说明
- 文件2: 改动说明
## 影响范围
## 验证方式
## 依赖
## 风险
```

### I-S4 访谈与澄清（用户参与）

Oracle 识别 Issue Impl 中的技术决策模糊点（如多种实现方案的选择、兼容性处理方式等），**分批向用户提问**确认。此环节确保技术方案与用户预期一致后再进入审查。通常比 S-S7 更简短（问题更聚焦）。

**这是 Issue 路径中用户主要参与的环节**（S1 前置访谈之外，澄清技术方案细节的唯一环节）。

### I-S5 Issue Impl 审查（完整但精简）

Oracle 将 `.stage` → `ISSUE_IMPL_REVIEWING`，然后调用 **Checker**（subagent）对 Issue Impl 做**完整审查**。审查方法与 S-S8 相同（6 项清单），但范围更聚焦（改动文件 ≤3 个，审查深度适配 Issue 规模）。由于无独立 Spec 文档，"范围对齐"项以 S1 访谈确认的改动点为基准。

审查报告由 Checker **直接写**至 `{wf}/reviews/{topic}-issue-impl-revision-{N}.md`，并更新 `.stage`。

- **# PASS** → `.stage` → `ISSUE_IMPL_APPROVED`，**不阻塞，直接进入 I-S6**
- **# REJECT** → `.stage` 回退 `ISSUE_IMPL_DRAFT`，回到 I-S3 由 Oracle 根据审查报告修改 Issue Impl，修复后重新进入 I-S5 审查
- **# REJECT: SPEC_OVERTURN** → 知会用户，确认后 `.stage` 回退 `ISSUE_IMPL_DRAFT`；若发现改动范围超出 issue 级，Oracle 可建议回 S2 重新分级为 Story（流程同升级机制：清理 `.stage`，保留 issue-impl 作为决策参考，回 S2 重新分级）
- **N ≥ 3 轮 REJECT** → 提示用户人工裁决（可选：继续修改 / 升级为 Story 路径 / 放弃需求）

### I-S6 编码

同 S-S9 流程（Oracle 派发 Builder 执行，Issue 通常单任务块或 Oracle 直接执行）：

1. Oracle 置 `.stage` → `WORKING`
2. **环境检查**：按「编码环境（worktree）」章节创建 worktree，从 develop 分支拉取新分支（分支类型根据 Issue 性质命名：`dev/fix/*`、`dev/feat/*`、`dev/refactor/*` 等，见 config.md）
3. **派发编码**：改动 ≤3 文件的 Issue，Oracle 可直接自己执行（调度开销大于收益）；更大改动派发 Builder（任务书标准同 S-S9）
4. Oracle 整理 commit（本地 commit，每个 commit 能独立编译）
5. Oracle 置 `.stage` → `QUALITY_GATE`，递交 **Checker**（subagent）做全面审查，直至 PASS → `.stage` → `DONE`

> **质量门全面审查**：同 S-S9，Checker 一次性执行全面审查（Issue 跳过文档归档项）。审查报告由 Checker **直接写**至 `{wf}/reviews/{topic}-quality-gate-revision-{N}.md`，并更新 `.stage`。

> **升级机制**：若编码过程中 Builder 报告改动范围超出预期（如 >3 文件、引入新业务规则），Oracle 应**暂停编码派发**，主动向用户提示"发现超预期，建议升级为 Story 级"。用户确认升级后：
> 1. 清理当前 `.stage` 文件（`{wf}/plans/{topic}/.stage`）
> 2. 保留已产出的 `issue-impl.md` 作为 S2 决策的参考依据
> 3. 回 S2，基于 issue-impl + 当前代码状态重新分级为 Story
> 4. 确认后创建 Story 的 topic 目录和新的 `.stage` 文件，从 S0 开始

> **编码失败处理**：Builder 自验失败自行修复（报告 BLOCKED 前最多 3 次）；质量门 REJECT 时 Oracle 派发 Builder 修复后重新递交；连续 3 轮失败则提示用户人工介入或升级为 Story。

---

## 编码环境（worktree）

S-S9 / I-S6 编码前的**环境检查**环节，统一按此章节执行。所有编码在独立 git worktree 中进行，不污染主工作区。

### 前置检查

- 读取 `.stage`，必须为 `IMPL_APPROVED`（Issue 为 `ISSUE_IMPL_APPROVED`）
- 不满足 → 拒绝执行："当前 topic 的 impl 审查尚未通过，请先完成 S-S8 / I-S5 审查"
- **同步主 worktree 到最新**：在项目 git 仓库根目录执行 `git fetch origin && git checkout {{main_branch}} && git pull origin {{main_branch}}`，确保主 worktree 代码与远端一致。此步骤确保后续 Checker 审查时用 read 工具读到的代码与 worktree 代码版本一致，避免因主 worktree 停留在旧分支导致 Checker 误判

### 创建 worktree

```bash
git worktree add -b $BRANCH ~/.local/share/opencode/worktree/$BRANCH
```

- 分支名使用 kebab-case，前缀按 config.md 的 Git 分支策略（`dev/feat/*`、`dev/fix/*`、`dev/chore/*`）
- worktree 路径：`~/.local/share/opencode/worktree/<branch>/`
- 需在项目 git 仓库根目录下执行

### 权限（external_directory）

worktree 目录位于项目根之外（`~/.local/share/opencode/worktree/`），**必须**在 `opencode.json` 中为 build 主代理配置 `external_directory` 白名单：

```json
{
  "permission": {
    "external_directory": {
      "~/.local/share/opencode/worktree/**": "allow"
    }
  }
}
```

否则 Builder 对 worktree 的读写会被权限拦截（默认 `ask`，逐次确认）。**若未配置，先完成配置再进入编码。**

> **为何不用 opencode 内置 worktree API**：opencode 的 `@opencode/Worktree` 服务（`/experimental/worktree`）虽能自动注册沙盒，但它属于 experimental API（CLI/TUI 无入口、命名规约 `opencode/{name}` 与本文分支规约不一致、接口可能变动），在 skill 中调用不稳。采用 bash `git worktree` + external_directory 白名单更简单可靠。

### 环境初始化

进入 worktree 后，自动检测并安装依赖（best-effort）：
1. `package.json` → `npm install`
2. `pom.xml` → `mvn compile`
3. `requirements.txt` → `pip install -r requirements.txt`
4. 失败 → 提示用户手动安装后继续

### 编码与同步

- 在当前会话中操作 worktree 目录，使用绝对路径（`~/.local/share/opencode/worktree/<branch>/`）或 `cd` 切换
- 同步回主仓库：`git add -A && git commit -m "feat: $TOPIC" && git push`

### 清理 worktree

```bash
git worktree remove ~/.local/share/opencode/worktree/$BRANCH --force
git branch -d $BRANCH
```

### 注意事项

- 每个 worktree 的依赖独立安装（node_modules 等不共享）
- 同步 AGENTS.md — `git pull` 获取最新项目规则
- 多个 worktree 修改同一文件时 git merge 可能冲突，优先人工裁决

---

## 质量门环节（S-S10 / I-S7，Checker 全面审查）

**所有编码路径在提交到远端前必须经过质量门终检**。质量门由 **Checker** 一次性执行全面审查（原「编码后 check」与「质量门 4 项检查」合并），Builder 不再自查——Checker 用不同模型交叉验证，把代码质量、实现一致性、commit、编译、测试、文档归档的所有问题一次性列出，Builder 修复后重新递交，全量重审直至 PASS。

`.stage` → `QUALITY_GATE`（Builder 设置），Checker 审查完成后：
- **PASS** → `.stage` → `DONE`
- **REJECT** → `.stage` → `WORKING`，Builder 修复后重新递交，全量重审

**Checker 全面审查清单（7 项）**：
1. **实现与 impl 一致性** — 实际改动是否与 impl 文档描述一致
2. **代码质量（OCR 流水线）** — 规则注入 + 逐文件审查 + 行级锚定 + 事实校验 + 精度优先，附质量评分（critical -25 / high -12 / medium -5 / low -2）
3. **commit 信息** — 每个 commit message 简洁清晰、符合项目既有风格
4. **整体编译通过** — 在 worktree 中执行编译命令（如 `mvn compile`）
5. **受影响模块测试（fence）** — **必须执行项目的测试围栏脚本（如 `./scripts/run-test-fence.sh`），不得以"无新增测试"为由跳过**。若项目无 fence 脚本，则执行受影响模块的测试命令（如 `mvn test -pl <模块>`）。fence 结果摘要需附入审查报告
6. **测试覆盖与回归** — 新增测试已实现，既有测试未破坏。fence 失败用例需逐一分析是回归还是预期行为变更
7. **文档归档与 AGENTS.md**（Story/Epic 适用，Issue 跳过）— spec/impl 已归档，关键 feature 已记录到项目根 `AGENTS.md`

> Checker 放开 bash 权限执行编译/测试命令，权限白名单见 `agents/checker.md`。

> **长时检查用 tmux**：质量门的测试/编译等长时命令在 tmux 中运行，可观测且不随会话中断：
> ```bash
> tmux new-session -d -s qg-test "cd <worktree> && <测试命令> 2>&1 | tee {{tmp_dir}}/qg-test.log"
> tmux has-session -t qg-test 2>/dev/null && echo "测试运行中" || echo "测试完成"
> tmux capture-pane -t qg-test -p | tail -30   # 查看实时输出/结果
> tmux kill-session -t qg-test 2>/dev/null
> ```

> **按需加载**：全面审查清单的详细说明见 `docs/quality-gate.md`，Checker 进入质量门审查时用 read 工具加载。

---

## 状态机

`{wf}/plans/{topic}/.stage`:

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

- **Builder 与 Checker 分工更新 `.stage`**：Builder 负责流程推进（DRAFT 创建、`*_REVIEWING` 标记、`WORKING`、`QUALITY_GATE` 标记、用户放行后 `SPEC_APPROVED`/`EPIC_SPEC_APPROVED`、`DONE`）；Checker 负责审查结果落定（PASS → 下一状态，REJECT → 回退 DRAFT / `WORKING`）

**Checker 状态转移表**（Checker 审查完成后更新 `.stage`）：

| 审查类型 | 审查前状态（Builder 设置） | PASS → | REJECT → |
|---|---|---|---|
| Epic Spec（E-S5） | `EPIC_SPEC_REVIEWING` | `EPIC_SPEC_USER_AUDIT` | `EPIC_SPEC_DRAFT` |
| Spec（S-S5） | `SPEC_REVIEWING` | `SPEC_USER_AUDIT` | `SPEC_DRAFT` |
| Impl（S-S8） | `IMPL_REVIEWING` | `IMPL_APPROVED` | `IMPL_DRAFT` |
| Issue Impl（I-S5） | `ISSUE_IMPL_REVIEWING` | `ISSUE_IMPL_APPROVED` | `ISSUE_IMPL_DRAFT` |
| 全面审查（质量门，S-S9/I-S6） | `QUALITY_GATE` | `DONE` | `WORKING`（Builder 修复 → 重新递交） |

> Checker 审查前先读 `.stage` 校验当前状态与上表「审查前状态」一致，不一致则中止并提示 Builder。
- 审查不通过 → 回退到前一个 DRAFT，Oracle 修复文档后重新提交审查（质量门全面审查例外：REJECT 回 `WORKING`，Oracle 派发 Builder 修复后重新递交）
- Impl 审查推翻 spec → 回退 `SPEC_DRAFT` / `ISSUE_IMPL_DRAFT`（Epic 下 Story 需评估是否连锁回退 Epic Spec）
- **S-S5 审查通过后阻塞** — `SPEC_USER_AUDIT` 状态下须用户放行才进入 S-S6
- **E-S5 审查通过后阻塞** — `EPIC_SPEC_USER_AUDIT` 状态下须用户放行才结束 Epic 流程
- **I-S5 审查通过后不阻塞** — `ISSUE_IMPL_APPROVED` 后直接进入编码（Issue 无 Spec 阶段，无用户放行环节）
- **S-S8 通过后不阻塞** — `IMPL_APPROVED` 后直接进入 S-S9 编码
- **质量门是终检（Checker 全面审查）** — `QUALITY_GATE` 状态下 Checker 一次性执行全面审查（代码质量 OCR + impl 一致性 + commit 信息 + 整体编译 + 受影响模块测试 + 测试覆盖回归 + 文档归档），PASS → `DONE`，REJECT → `WORKING`
- **Issue 编码中升级** — 若发现改动超预期，暂停编码，清理 `.stage` 文件，保留 issue-impl 作为参考，回 S2 重新分级
- **S2 统一调度点允许等级重调整** — 调研+访谈结束后，Oracle 可基于实际发现提议升级或降级，经用户确认后调整路径
- **SPEC_OVERTURN 回 S2 不重跑调研** — 任何阶段审查推翻 spec（或 Issue 编码中发现需升级）回 S2 时，**不重跑 S0/S1**，仅基于已有产出（spec/impl/issue-impl）和访谈结果重新论证等级。若已有产出不足以支撑新等级判定，Oracle 可补充定向调研（仅针对新等级的判定依据，非全量重跑）

### 中断恢复

工作流依赖 `.stage` 文件记录进度。若会话被中断（用户关闭终端、token 耗尽等），重新启动后 Oracle 按以下步骤恢复：

1. **检查 `{wf}/plans/{topic}/.stage`** — 读取当前阶段状态
2. **根据 `.stage` 值定位恢复点**：
   - `*_DRAFT` 状态 → 重新读取已产出的文档（spec/impl），继续当前阶段
   - `*_REVIEWING` 状态 → 重新调用 Checker 审查已有文档
   - `*_USER_AUDIT` 状态 → 向用户重新输出 spec 摘要并询问是否放行
   - `*_APPROVED` 状态 → 自动推进到下一阶段
   - `WORKING` 状态 → 检查 worktree 中代码变更状态与 Builder 任务书执行进度，继续派发/收尾
   - `QUALITY_GATE` 状态 → 重新调用 Checker 执行全面审查
   - `DONE` / `ALL_DONE` → 流程已完成，无需恢复
3. **无 `.stage` 文件** → 检查 `{wf}/plans/{topic}/` 目录是否存在 `issue-impl.md` 或 `spec.md`：
   - 若存在 — 可能是**升级后残留**（Issue 升级为 Story 时清理了 `.stage`），询问用户是否继续升级流程还是重新开始
   - 若不存在 — 视为新工作流，从 S0 开始

> **恢复前提**：`.stage` 和 `{wf}/plans/` 下的文档是恢复的依据。若这些文件丢失，无法恢复，需从头开始。Builder/Checker 在每次 `.stage` 变更后应确保文件已持久化。

---

## 角色与协作模式

### 四角色架构

| 角色 | 模型 | 类型 | 状态 | 流水线位置（上下游） | 职责 | 输入 | 输出 |
|------|------|------|------|----------------------|------|------|------|
| **Oracle**（调度者） | `{{builder_model}}`（{{provider}}） | 主会话（交互式） | **有状态**（会话 + `.stage`） | 顶点：用户 ↔ Oracle ↔ 三 subagent | 工作流状态机掌控、需求访谈与拆解、spec/impl 文档产出、任务切分与派发、冲突调节与进度把控、向用户汇报。**不直接编码**（串行小任务可酌情例外） | 用户需求、subagent 报告、`.stage` 状态 | 任务书、spec/impl 文档、dispatch 决策、用户汇报 |
| **Explorer**（调研者） | `{{explorer_model}}`（{{provider}}） | subagent（`task` 工具） | **无状态**（每次新建） | 上游 Oracle → 下游 Oracle | 内部代码库调研 + 外部技术调研（事实清单，区分事实/推断） | 调研任务书（需求 + 范围 + 代码库路径） | 结构化调研报告（带 文件:行号），不写文件 |
| **Checker**（检查者） | `{{checker_model}}`（{{provider}}） | subagent（`task` 工具） | **无状态**（每次新建） | 上游 Oracle（间接：Builder 产出被审）→ 下游 Oracle | 质量卡点：完成状态 check + 交付质量 check + 质量门全面审查（含编译/测试执行）+ 审查结果落定 | 审查任务书（类型 + 对象路径 + 基准材料） | 审查报告（reviews/ 落盘）+ `.stage` 更新 |
| **Builder**（构建者） | `{{builder_subagent_model}}`（{{provider}}） | subagent（`task` 工具） | **无状态**（每次新建，可并行） | 上游 Oracle → 下游 Oracle（产出终由 Checker 审） | 按 impl.md 任务书编码执行：读文档 → 写码 → 最小自验 → 报告。不做需求分析/方案设计/质量审查 | 编码任务书（impl.md 章节 + worktree + 验证命令） | 代码变更（worktree 内）+ 标准执行报告，不写文件 |
| **Looker**（视觉解析者，可选） | `{{looker_model}}`（多模态） | subagent（`task` 工具） | **无状态**（每次新建） | 上游 Oracle → 下游 Oracle | 图片解析：截图/设计稿/架构图/报错照片 → 结构化文字描述（含"无法确认项"，禁止编造）。**仅当 Oracle 模型不支持图片输入时部署**；Oracle 为多模态模型时无需本角色 | 解析任务书（图片绝对路径 + 解析目标） | 结构化图片描述，不写文件 |

> **角色定位说明**：
> - **Oracle 是有状态的调度者** — 主会话长期存在，承载 `.stage` 状态机、用户访谈、文档产出与任务调度。Oracle 的 context 花在调度决策、跨 Story 记忆与用户交互上，不被单个 Story 的代码细节塞满。spec/impl 设计、worktree/commit/归档等收尾工作由 Oracle 亲自完成（这些需要全局视野与有状态上下文）。
> - **Explorer/Checker/Builder 平级，互不调用** — 三者均只与 Oracle 通信；subagent 之间的任何流转（如 Builder 要 Checker 复核）都须经 Oracle 派发。subagent 遇到阻塞（依赖缺失/设计冲突/权限不足）时，在结果报告中标注 BLOCKED + 原因反馈 Oracle，由 Oracle 决策：拆任务 / 改方案 / 升级问用户。
> - **无状态 subagent** — 每次调用全新上下文，看不到 Oracle 的过程性思考，只看到显式传入的材料。这正是交叉验证的价值：Checker 用不同模型（kimi）审查 Builder（glm）的产出，避免单模型自审盲区。
> - **Builder 可并行** — Oracle 按 impl.md 预先切分**文件集不相交**的任务块后，可并行派发多个 Builder。文件级冲突由 Oracle 仲裁（预防优于仲裁：切分时保证不相交）。
> - **Looker 可选，取决于 Oracle 模型的模态** — specpipe 只是工作流，不限定模型选型。若 Oracle 的模型支持图片输入（如 qwen-3.8-max、kimi-k3 等多模态模型），Oracle 直接 `read` 读图自解，Looker 无需部署；若 Oracle 为纯文本模型（如 glm-5.3），凡涉及图片一律派发 Looker（视觉模型）解析，Oracle 只消费其结构化描述。图片以**文件绝对路径的文字形式**在任务书中传递。

### 任务书标准（Oracle → Builder 的派发规范）

**impl.md 是唯一事实源**。任务书 prompt 不内嵌实现细节，只包含四要素：

```
1. 执行范围：impl.md 的哪些章节（如"决策 4/5 + 改动点 12-15"）
2. 工作目录：worktree 绝对路径
3. 验证命令：最小集（mvn compile -pl <模块> 或 -Dtest=<新增测试类>；前端只查语法）
   —— 不跑全量测试/E2E/fence，那些由 Oracle 在 Story 收尾统一执行
4. 交付物：Builder 标准报告（改动清单 + 自验结果 + BLOCKED 项 + 发现项）
```

impl 写不清楚导致 Builder 做错，责任在 Oracle（文档质量）——这倒逼 impl 阶段做实，也是把「设计」与「执行」分离的价值边界。

### subagent 调用规范（核心机制）

Oracle 通过 opencode 的 **`task` 工具**调用 Explorer/Checker/Builder（及可选的 Looker）。subagent 定义在 `~/.config/opencode/agents/`：
- **explorer.md** — Explorer 定义：只读（edit/bash deny）
- **checker.md** — Checker 定义：写权限白名单（仅 `.specpipe/reviews/*` 与 `.specpipe/plans/*/.stage`）+ bash 白名单（只读 git + 编译/测试）
- **builder.md** — Builder 定义：编码执行权限（edit/bash/write），按任务书最小自验
- **looker.md**（可选）— Looker 定义：只读视觉解析（仅 `read` 工具读图），仅当 Oracle 模型不支持图片输入时部署

**权限前提**：Oracle 调用 `task` 依赖 `permission.task`。若全局 `permission` 有 `"*": "ask"` 等收紧配置，需在 `opencode.json` 显式放行各 subagent：

```json
{
  "agent": {
    "build": {
      "permission": {
        "task": {
          "*": "deny",
          "explorer": "allow",
          "checker": "allow",
          "builder": "allow",
          "looker": "allow"
        }
      }
    }
  }
}
```

> `looker` 行仅在部署了 Looker 时需要；未部署可删。

默认（无收紧配置）无需声明，task 权限默认 allow。

**调用规则**：
1. **subagent_type**：`task` 工具第一个参数，取 `"explorer"`（Explorer）、`"checker"`（Checker）或 `"builder"`（Builder）——值为 agent 文件名（小写），角色名大写
2. **材料传递**：需要子代理读取的文件路径写进 prompt（用 `@` 前缀或直接说明路径）；Oracle 在任务描述中说明各文件角色
3. **权限边界**：
   - **Explorer**：只读（edit/bash deny），严禁写任何文件
   - **Checker**：只允许写 `{wf}/reviews/` 下的审查报告和 `{wf}/plans/{topic}/.stage`，严禁修改任何业务代码文件（路径白名单已在 agent 定义中强制）；可执行只读 git 命令与编译/测试命令（质量门全面审查用），严禁其他 bash 命令
   - **Builder**：在 worktree 范围内编码（edit/bash/write），按任务书的最小验证命令自验；严禁扩大验证范围（全量测试/E2E 由 Oracle 收尾统一跑）
4. **产出落盘**：Checker 直接写报告文件 + 更新 `.stage`；Builder 的产出是代码变更 + 标准报告（不写文件）；stdout 回传结论摘要供 Oracle 决策
5. **无状态含义**：每次调用都是全新上下文；Oracle 需把执行基准（impl.md 章节/代码 diff/spec）显式传入 prompt
6. **串行执行**：Oracle 一次可发起多个 Explorer/Builder 任务（`task` 并行调用，Builder 需文件集不相交），但 Checker 审查必须等编码/文档产出完成后再调用

**多任务并行**：多个独立任务并行发起 `task` 调用即可（opencode 原生支持并行），无需 tmux。Oracle 汇总各任务输出，仲裁冲突。

### 检索工具（Explorer 专用）

Explorer subagent 使用 opencode 已配置的 MCP 进行外部调研：

| MCP | 用途 | 说明 |
|-----|------|------|
| `{{search_mcp}}` | Tavily 网络搜索 | MCP server，名 `websearch`，无需额外 CLI |
| `{{docs_mcp}}` | 技术文档查询 | MCP server，名 `context7`，解析库 ID 后查文档 |

> 环境依赖：两个 MCP 已配置在 `~/.config/opencode/opencode.json` 的 `mcp` 段。Explorer 直接调用对应工具即可，无需安装 CLI。

---

## 关键规则

1. **Oracle 驱动全流程** — 无需用户手动调命令，Oracle 按阶段自动推进；编码执行派发给 Builder subagent
2. **Plan 阶段不编码** — spec+impl 均审查通过前不修改业务代码（Issue 路径无 spec，impl 审查通过前不编码）
3. **用户只在必要时参与** — 前置访谈（S1，定设想+范围+改动点）、分级确认与等级重调整（S2）、Epic Spec 澄清与放行（E-S4/E-S5）、Story Spec 澄清与放行（S-S4/S-S5）、Story Impl 澄清（S-S7）、Issue Impl 澄清（I-S4）、审查推翻 spec 决策（SPEC_OVERTURN）
4. **记忆分三层，无独立记忆文件** — ①全局层：`~/.config/opencode/AGENTS.md`（跨项目个人偏好/规则，静态维护）；②项目层：项目根 `AGENTS.md`（关键 feature 记录，质量门第 7 项文档归档时追加）；③任务层：`{wf}/plans/{topic}/` 下的 spec/impl 文档（任务态，随任务生灭）。不设 `save_memory` 工具、不写 `.opencode/memory/`、不写 MEMORY.md
5. **所有文档和记忆使用中文**
6. **S2 分级判定是必经环节且允许重调整** — 任何需求都需经过 S2 分级；S2 是统一调度点，Oracle 可基于调研+访谈的实际发现提议升级或降级，经用户确认后调整路径
7. **Epic 先有 Epic Spec 再拆 Story** — Epic 路径先产出 Epic 级规格文档（含 Story 路线图），放行后逐个 Story 从 S0 走完整 Story 路径
8. **Epic 下 Story 独立 topic** — 每个 Story 有独立的 spec/impl/审查/记忆，Epic Spec 是它们的总纲
9. **Issue 不走 Spec 阶段** — Issue 级别需求在 S1 前置访谈中聊清所有改动点，S2 确认后直接产出 Impl 文档；无 Spec 文档、无 Spec 审查
10. **Issue 可升级** — 编码中发现超预期，暂停并提示用户升级为 Story 级，重新分级
11. **两阶段审查深度不同**：
    - S-S5 Spec 审查 = **轻量审查**（impl 未产出，只做范围+致命遗漏 sanity check，≤30 行报告，快速放行）
    - E-S5 Epic Spec 审查 = **轻量审查**（+Story 拆分合理性检查，≤40 行报告）
    - S-S8 Impl 审查 = **完整审查**（已有 spec+impl+代码上下文，6 项清单深入核查，把关重心在此）
    - I-S5 Issue Impl 审查 = **完整但精简审查**（6 项清单，范围聚焦于 ≤3 文件，以 S1 访谈确认的改动点为基准，适配 Issue 规模）
    - S-S9/I-S6 质量门 = **全面审查**（Checker 一次性执行：impl 一致性 + 代码质量 OCR 流水线 + commit 信息 + 整体编译 + 受影响模块测试 + 测试覆盖回归 + 文档归档，附质量评分 critical -25 / high -12 / medium -5 / low -2）
12. **S-S8 / I-S5 通过后不阻塞** — Impl 审查通过后直接进入编码，无须用户再次确认
13. **编码必须在新 worktree + 新分支** — S-S9 和 I-S6 均需创建 git worktree，从 develop 拉取新分支（feature/fix/refactor），不直接在 develop 上编码
14. **质量门是所有编码路径的终检** — S-S10 / I-S7 由 Checker 在 `QUALITY_GATE` 状态一次性执行全面审查（impl 一致性、代码质量 OCR、commit 信息、整体编译、受影响模块测试、测试覆盖回归、文档归档），PASS → `DONE`，REJECT → `WORKING` 修复后全量重审
15. **本地独立代码审查（LCR）** — 用户说"审查代码"、"review 代码"、"代码质量审查"等（非功能开发语境）时，Oracle 不走 specpipe 状态机，直接：①获取 git diff（`git diff` / `git diff --staged` / `git diff <from>..<to>`，按用户意图选择）；②以 `LOCAL_CODE_REVIEWING` 标记调用 Checker；③Checker 按逐文件审查 + 规则注入 + 行级锚定 + 事实校验的 OCR 流水线产出报告，**直接写**至 `{wf}/reviews/local-code-review-{YYYYMMDD-HHMM}.md`；④不推进任何 `.stage`，不写 PASS/REJECT 标记，仅输出报告供用户参考。**规则注入的规则库**位于 `~/.config/opencode/skills/specpipe/docs/review-rules/`（`system_rules.json` 做文件后缀 → 规则文档映射，含 20 个语言规则 + `default.md` 兜底，来源：獬豸 v1.5.3 `conf/ocr/rules/rule_docs/`）

## 文件产出

| 产出 | 路径 | 写入者 |
|------|------|--------|
| Epic Spec + Story 路线图 | `{wf}/plans/{topic}/epic-spec.md` | Builder |
| Story Spec 草案/终稿 | `{wf}/plans/{topic}/spec.md` | Builder |
| Story Impl 文档 | `{wf}/plans/{topic}/impl.md` | Builder |
| Issue Impl 文档 | `{wf}/plans/{topic}/issue-impl.md` | Builder |
| Epic Spec 审查报告 | `{wf}/reviews/{topic}-epic-spec-revision-{N}.md`（≤40 行） | Checker 直接写 |
| Spec 审查报告 | `{wf}/reviews/{topic}-spec-revision-{N}.md`（≤30 行） | Checker 直接写 |
| Impl 审查报告 | `{wf}/reviews/{topic}-impl-revision-{N}.md` | Checker 直接写 |
| Issue Impl 审查报告 | `{wf}/reviews/{topic}-issue-impl-revision-{N}.md` | Checker 直接写 |
| 质量门全面审查报告 | `{wf}/reviews/{topic}-quality-gate-revision-{N}.md` | Checker 直接写 |
| 本地独立代码审查报告 | `{wf}/reviews/local-code-review-{YYYYMMDD-HHMM}.md` | Checker 直接写 |
| 关键 feature 记录 | `AGENTS.md`（项目根目录） | Builder |
| 状态 | `{wf}/plans/{topic}/.stage` | Builder（流程推进）/ Checker（审查结果） |

> **subagent 权限约定**：Explorer 为只读 subagent（edit/bash deny），严禁写任何文件；Checker 可写（`edit` 白名单），但**只允许写 `{wf}/reviews/` 下的审查报告和 `{wf}/plans/{topic}/.stage`**，严禁修改业务代码。审查报告由 Checker 直接落盘，Builder 不再代写——审计链完整可验证。

> **Issue 路径产出文件**：I-S3 的 Issue Impl 写入 `{wf}/plans/{topic}/issue-impl.md`（Issue 无 Spec 文档）。

> **审查轮次 `{N}` 计数规则**：N 从 1 开始，各审查类型（epic-spec / spec / impl / issue-impl / quality-gate）独立计数。**N 由 Checker 确定**：`list` 工具列 `{wf}/reviews/` 下 `{topic}-{type}-revision-` 文件数 + 1。

> **`{topic}` 取值规则**：
> - **Epic 路径**：`{topic}` = epic-topic（如 `crm-refactor`）
> - **Epic 下 Story**：`{topic}` = story-topic（如 `crm-refactor-story-1`），与 Epic 目录独立
> - **独立 Story**：`{topic}` = story-topic（如 `bd-score-panel`）
> - **Issue**：`{topic}` = issue-topic（如 `fix-login-bug`）

## Git 分支策略

编码时从 {{main_branch}} 拉取新分支（`{{feature_prefix}}/*` / `{{fix_prefix}}/*` / `{{chore_prefix}}/*`），提交远端时创建合入 {{main_branch}} 的 MR。发布测试/生产时分别从 {{release_branch}}/{{master_branch}} 拉 `rel/*` / `ms/*` 分支 cherry-pick。

> **按需加载**：分支命名规范、工作流和注意事项详见 `docs/git-branch-guide.md`，涉及分支创建/cherry-pick/MR 操作时 Oracle 用 read 工具加载。

## 安装与文件清单

> **安装**：本 skill 为全局安装，位于 `~/.config/opencode/skills/specpipe/`（SKILL.md + config.md + docs/）。配套 subagent 定义在 `~/.config/opencode/agents/`（explorer.md、checker.md、builder.md）。外部调研使用 opencode 已配置的 MCP：`websearch`（Tavily）+ `context7`。**角色模型、provider、工作流根目录等可配置项见 `config.md`**。环境要求：`TAVILY_API_KEY`（websearch MCP 使用，已在 `~/.config/opencode/opencode.json` 配置）；**tmux**（质量门长时检查的前置依赖，`apt install tmux` / `brew install tmux`）。
