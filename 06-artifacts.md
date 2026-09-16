# 06-artifacts —— 工件规范

> 本卷定义工作流全部标准工件的产出路径、写入者、行数上限与格式模板；适用于 Epic / Story / Issue 三路径全阶段。

## 工件产出表

| 产出 | 路径 | 写入者 |
|------|------|--------|
| Epic Spec（含 Story 路线图） | `{wf}/plans/{topic}/epic-spec.md` | 调度者 |
| Story Spec 草案/终稿 | `{wf}/plans/{topic}/spec.md` | 调度者 |
| Story Impl 文档 | `{wf}/plans/{topic}/impl.md` | 调度者 |
| Issue Impl 文档 | `{wf}/plans/{topic}/issue-impl.md` | 调度者 |
| Epic Spec 审查报告 | `{wf}/reviews/{topic}-epic-spec-revision-{N}.md`（≤40 行） | 审查者直接写 |
| Spec 审查报告 | `{wf}/reviews/{topic}-spec-revision-{N}.md`（≤30 行） | 审查者直接写 |
| Impl 审查报告 | `{wf}/reviews/{topic}-impl-revision-{N}.md` | 审查者直接写 |
| Issue Impl 审查报告 | `{wf}/reviews/{topic}-issue-impl-revision-{N}.md` | 审查者直接写 |
| 质量门全面审查报告 | `{wf}/reviews/{topic}-quality-gate-revision-{N}.md` | 审查者直接写 |
| 关键 feature 记录 | `AGENTS.md`（项目根目录） | 调度者 |
| 阶段状态 | `{wf}/plans/{topic}/.stage` | 调度者（流程推进）/ 审查者（审查落定） |
| 状态留痕 | `{wf}/plans/{topic}/.stage-history` | 审查工具（契约见 07-state-machine.md） |

> 审查报告由审查者**直接落盘**，调度者不代写——审计链完整可验证；各角色写权限边界见 08-roles.md。

## topic 命名与取值规则

- **命名**：`{topic}` 用 kebab-case，**不带级别前缀**（无 E-/S-/I- 等标识，级别由所处路径与状态名体现）
- **Epic 路径**：`{topic}` = epic 主题名（如 `crm-refactor`）
- **Epic 下 Story**：`{topic}` = story 主题名，与 Epic 目录**各自独立**（如 `crm-refactor-story-1`，不复用 Epic 目录）
- **独立 Story**：`{topic}` = story 主题名（如 `bd-score-panel`）
- **Issue**：`{topic}` = issue 主题名（如 `fix-login-bug`）
- **一致性**：同一 `{topic}` 在 `plans/`、`reviews/`、`.stage`、`.stage-history` 中取值一致；Issue 升级为 Story 时**新建** Story 的 topic 目录，原 issue 目录文件保留作决策参考

## 工件定义

> 每工件按五要素定义：目的 / 何时产出 / 产出者 / 行数上限 / 格式模板。

### Epic Spec（epic-spec.md）

- 目的：Epic 级宏观规格——目标、业务规则、验收标准、范围边界与 Story 路线图；**不涉及具体技术实现细节**（那是各 Story 的 spec/impl 职责）
- 何时产出：E-S3 草案 → E-S4 澄清后终稿
- 产出者：调度者
- 行数上限：草案 ≤200 行；终稿 ≤500 行
- 格式：`templates/epic-spec-template.md`

### Story Spec（spec.md）

- 目的：单 Story 的业务规则、验收标准、边界条件
- 何时产出：S-S3 草案 → S-S4 澄清后终稿
- 产出者：调度者
- 行数上限：草案 ≤100 行；终稿 ≤300 行
- 格式：`templates/spec-template.md`

### Story Impl（impl.md）

- 目的：技术方案与逐文件改动点，是编码任务书的**唯一事实源**
- 何时产出：S-S6（spec 放行后）
- 产出者：调度者
- 行数上限：不设硬上限，以改动点完备为准（可切分为文件集不相交的任务块）
- 格式：`templates/impl-template.md`

### Issue Impl（issue-impl.md）

- 目的：精简版实现方案；Issue 无 Spec 阶段，S1 访谈产出（改动点列表、影响范围、验证方式）直接作为其输入
- 何时产出：I-S3（S2 确认后）
- 产出者：调度者
- 行数上限：≤80 行
- 格式：`templates/issue-impl-template.md`

### 审查报告（五类）

- 目的：审查结论与问题清单落盘（PASS / REJECT / REJECT: SPEC_OVERTURN），是状态转移的依据
- 何时产出：各审查环节（Epic Spec / Spec / Impl / Issue Impl / 质量门）完成时
- 产出者：审查者直接写
- 行数上限：Epic Spec 报告 ≤40 行；Spec 报告 ≤30 行（轻量审查，快速放行）；Impl / Issue Impl / 质量门报告不设硬上限，问题完备优先
- 格式：`templates/review-epic-spec-template.md` 等五件（路径见工件产出表）；审查清单与深度分级见 09-check-split.md

### 记忆三层（AGENTS.md 体系）

记忆分三层，**不设独立记忆文件**：

- 全局层：全局配置目录下的 `AGENTS.md`——跨项目个人偏好/规则，静态维护
- 项目层：项目根 `AGENTS.md`——关键 feature 记录，质量门文档归档项通过时追加
- 任务层：`{wf}/plans/{topic}/` 下的 spec/impl 文档——任务态，随任务生灭

三层之外不设独立记忆文件：无跨会话记忆工具，不写专用记忆目录或记忆清单文件。

### 状态文件（.stage / .stage-history）

- `.stage`：当前阶段状态名，单行文件——状态链与转移规则见 07-state-machine.md
- `.stage-history`：状态变更留痕（JSONL），由审查工具按 07-state-machine.md 契约自动追加

## 审查轮次 {N} 计数

- N 从 1 开始，各审查类型（epic-spec / spec / impl / issue-impl / quality-gate）**独立计数**
- N 由审查者确定：清点 `{wf}/reviews/` 下已有的 `{topic}-{type}-revision-` 文件数 + 1

## 行号语义标注规范

- 工件中定位代码位置时，优先用方法名/类名/注释等**语义描述**（如「advanceCustomer 方法末尾」）
- 若附行号，仅作辅助参考，须标注「约」字（如「约 L2155」）——代码版本变动会导致行号偏移
- 审查时以语义定位为准，**行号不作为审查基准**

## organic 产物声明

- 流程中自然产生的过程性产物（等价核查底稿、临时清单等）为 organic 产物，本版不定义为标准工件，不纳入工件产出表管理。
