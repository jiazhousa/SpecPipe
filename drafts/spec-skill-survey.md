# 既有 spec-driven 开发类 agent skill 结构与写法调研报告

> 调研人：Explorer（SpecPipe）· 2026-10-13 · 时盒内完成 · Oracle 代落盘
> 方法：GitHub contents/raw API（exa/tvly extract）+ 双引擎搜索。所有文件级结论来自 main 分支 raw 内容实测抓取。

---

## ① github/spec-kit skill 源文件解剖（首要对标物）

### 1.1 仓库形态总览

spec-kit 的 skill **不是分散在各 agent 目录里的多份副本，而是「一份正典源 + CLI 转译分发」**：

```
templates/commands/*.md     ← skill 单一正典源（9 件，本节解剖对象）
templates/*.md              ← 工件模板（spec/plan/tasks/checklist/constitution 5 件）
scripts/{bash,powershell,python}/   ← 配套脚本，每脚本三语言变体（sh/ps/py）
src/specify_cli/            ← specify CLI
  └─ integrations/          ← INTEGRATION_REGISTRY：按目标 agent 转译安装
  └─ _agent_config.py       ← SCRIPT_TYPE_CHOICES = {sh, ps, py}
```

来源：https://api.github.com/repos/github/spec-kit/contents/templates 与 https://github.github.io/spec-kit/reference/integrations.html

### 1.2 skill 清单（templates/commands/，含实测文件大小）

| skill | 大小 | 职责 | 位置 |
|---|---|---|---|
| constitution.md | 9.8KB | 创建/更新项目原则（每项目一次） | https://raw.githubusercontent.com/github/spec-kit/main/templates/commands/constitution.md |
| specify.md | ~10KB | 自然语言→feature spec | .../templates/commands/specify.md |
| plan.md | ~8KB | spec→技术方案工件 | .../templates/commands/plan.md |
| tasks.md | 11.2KB | 方案→依赖排序任务清单 | .../templates/commands/tasks.md |
| implement.md | ~10KB | 按任务清单分阶段实现 | .../templates/commands/implement.md |
| converge.md | ~9KB | 意图 vs 代码现状差距→追加任务闭合 | .../templates/commands/converge.md |
| analyze.md | 11.4KB | 跨工件一致性分析（只读） | .../templates/commands/analyze.md |
| clarify.md | 19KB | spec 澄清问答 | .../templates/commands/clarify.md |
| checklist.md | 22KB | 生成自定义需求质量 checklist | .../templates/commands/checklist.md |

流程语义（README 原文）：**"Constitution once per project; specify → plan → tasks → implement → converge per feature"**；clarify/analyze/checklist 为可插增强；另有 bug-fixing 与 idea-assessment 两个独立 bundled extension 入口（README：https://raw.githubusercontent.com/github/spec-kit/main/README.md）。

### 1.3 单件 skill 完整解剖（以 specify/plan/implement 为准）

**frontmatter 三段式**（specify.md 实录）：

```yaml
---
description: Create or update the feature specification from a natural language feature description.
handoffs:
 - label: Build Technical Plan
   agent: speckit.plan
   prompt: Create a plan for the spec. I am building with...
 - label: Clarify Spec Requirements
   agent: speckit.clarify
   prompt: Clarify specification requirements
   send: true
scripts:            # （plan.md 实录；specify 无 scripts，靠 handoffs 驱动）
 sh: scripts/bash/setup-plan.sh --json
 ps: scripts/powershell/setup-plan.ps1 -Json
 py: scripts/python/setup_plan.py --json
---
```

- `description`：一句话发现用描述（宿主装载进系统提示的那一层）
- `handoffs`：**声明式阶段衔接**——label（按钮文案）/ agent（下游 skill id）/ prompt（预填话术）/ send（是否自动发送）。每个上游 skill 都把下游入口挂在 frontmatter 里
- `scripts`：sh/ps/py 三平台变体，正文中以 `{SCRIPT}` 占位符引用，CLI 安装期按目标环境解析为具体一条

**正文统一骨架**（9 件同构）：

```
## User Input          → ```text $ARGUMENTS ```，加一句 "You MUST consider the user input"
## Pre-Execution Checks → 扩展钩子检查（读 .specify/extensions.yml 的 hooks.before_<stage>，
                          optional=展示待选 / mandatory=必须执行并等待，condition 留给 HookExecutor）
## Outline（或 ## Goal + ## Operating Constraints）→ 编号祈使句执行步骤
```

**三类占位符协议**（这是跨 agent 适配的核心机关）：
- `$ARGUMENTS` —— 用户命令后输入
- `{SCRIPT}` —— 转译期替换为目标平台可执行脚本引用
- `__SPECKIT_COMMAND_SPECIFY__` —— 命令 id 宏，转译期替换为目标 agent 的调用语法（Claude `/speckit-specify`、Codex `$speckit-specify` 等），使 skill 正文内互相引用时语法随宿主自动正确（implement.md/checklist.md/analyze.md 内部互引全用此宏）

**关键注入方式：路径引用 + 脚本喂 JSON，不内嵌全文**。plan.md Outline 实录：

> 1. **Setup**: Run `{SCRIPT}` from repo root and parse JSON for FEATURE_SPEC, IMPL_PLAN, SPECS_DIR, BRANCH.
> 2. **Load context**: Read FEATURE_SPEC and `/memory/constitution.md`. Load IMPL_PLAN template (already copied).

即：setup 脚本负责建分支/拷模板/输出绝对路径 JSON → agent 解析 JSON → **用 read 自读模板与 constitution**。模板文件 `templates/spec-template.md` 全文（已读）内含填空协议：用户故事 P1/P2/P3 优先级 + Given/When/Then 验收场景 + `FR-xxx: System MUST ...` + `[NEEDS CLARIFICATION: ...]` 未知项标记 + `SC-xxx` 可度量成功标准。tasks.md 的 setup 脚本更进一步，直接返回 `TASKS_TEMPLATE_CONTENT`（模板内容走 JSON 喂入）。

**各 skill 边界语义摘录**（对 SpecPipe 最有参考价值的部分）：
- implement.md：checklist 是**只读 gate**——"scan checkbox state, report status, and ask before proceeding when needed; do NOT modify checklist files or markers"（tail 被截断，分阶段执行细节未确认）
- analyze.md：`## Operating Constraints` → "**STRICTLY READ-ONLY**: Do not modify any files. Output a structured analysis report. Offer an optional remediation plan (user must explicitly approve...)"；"Constitution Authority: The project constitution is **non-negotiable**"
- converge.md：以 spec/plan/tasks 为 "**sole source of intent**"，评估代码现状差距，"**append each piece of remaining work as a new, traceable task** at the bottom of tasks.md"
- constitution.md：**Scope Guard 节**——只许动 constitution 本身；用户输入混入实现意图时 "you MUST NOT execute them. Extract them as deferred intents instead"，完成后输出 Next Actions 列出被搁置的意图与建议命令
- checklist.md：开篇定义 **"Checklists are UNIT TESTS FOR REQUIREMENTS WRITING"**——校验需求质量（完备/清晰/一致/覆盖/边界），❌ 不是实现验证；checkbox 生命周期：`[x]` = 审查者判定需求质量达标 ≠ 实现完成；**本 skill 生成项禁止自标 `[x]`**

### 1.4 任务工件格式（templates/tasks-template.md 实录）

- 任务行语法：`[ID] [P?] [Story] Description`——`[P]`=可并行（不同文件、无依赖）、`[Story]`=归属用户故事（US1…）、描述必须含精确文件路径
- 阶段结构：Phase 1 Setup → Phase 2 Foundational（阻断性前置，"No user story work can begin until complete" + **Checkpoint** 验证行）→ Phase 3+ 按用户故事分组（每组内 Tests 可选先行→实现）→ Polish
- 每阶段带 `**Checkpoint**: ...` 可验证状态行——阶段完成的判定语义直接写在模板里

### 1.5 跨 agent 适配机制

- `specify init --integration <key>` 按 25+ agent 注册表分发：Claude Code → `.claude/skills/`、Codex/Zed/Docker Agent 共享 `.agents/skills/`、Copilot → `.github/skills/`（可 `--integration-options="--commands"` 回退旧 `.github/prompts` 布局）、Goose → `.goose/recipes/` YAML、Cursor/Gemini/Amp 等各自目录。来源：https://github.github.io/spec-kit/reference/integrations.html
- skills 形态 = 每个命令一个目录 `speckit-<name>/SKILL.md`；调用语法随宿主（`/speckit-*` vs `$speckit-*`）
- **适配是机械转译**：目录布局 + SKILL.md 文件名 + frontmatter 方言 + `{SCRIPT}`/`__SPECKIT_COMMAND_*__` 宏替换；**正文保持 agent 无关的祈使句 markdown**。转译逻辑在 `src/specify_cli/integrations/`（INTEGRATION_REGISTRY + `_helpers.py` 20KB 等，源码级细节未逐行核读，标注「未确认」部分）
- 共享目录陷阱（官方自注）：`.agents/skills` 被多 agent 共用，"Not multi-install safe by default"
- 脚本三变体选型确认自 `src/specify_cli/_agent_config.py`：`SCRIPT_TYPE_CHOICES = {sh, ps, py}`

---

## ② 社区实践扫描

### 2.1 OpenSpec（Fission-AI/OpenSpec）——「增量 spec」流派

来源：https://raw.githubusercontent.com/Fission-AI/OpenSpec/main/docs/overview.md（官网 https://openspec.dev/docs/overview）

- 目录制真相管理：`openspec/specs/`（系统**现状**行为真相，按 domain 分域 auth/payments/ui）+ `openspec/changes/`（一个变更一个文件夹：proposal→specs→design→tasks 全聚合一处）+ 完结归档 `changes/archive/` 并把 delta 合并回真相
- 核心机关 **delta specs**：变更内不重写全量 spec，只写 `ADDED`/`MODIFIED`/`REMOVED` 需求增量——"You describe the diff, not the destination"，面向存量系统编辑
- 工件链 "proposal ──► specs ──► design ──► tasks ──► implement"，定位 "enablers, not gates"（可回访不强制门禁）
- **与 speckit 差异**：OpenSpec 有持久的全系统 spec 真相层（speckit 的 spec 是 per-feature 一次性工件）；变更文件夹聚合制 vs speckit 的 specs/[branch]/ 目录制；无 constitution 对应物（overview 层面未见）；命令为 CLI（`openspec` CLI）+ 各 agent 的 instructions 文件挂载，非逐 agent SKILL.md 转译

### 2.2 Kiro（AWS）spec mode——「双入口 + 审批门」流派

来源：https://kiro.dev/docs/specs/feature-specs/

- 三工件：requirements.md / design.md / tasks.md；**requirements 用 EARS 语法**（WHEN/IF/WHILE…THE SYSTEM SHALL…）
- **双工作流变体**：Requirements-First（行为→设计→任务）与 Design-First（架构/伪代码→反推需求→任务，严格 NFR 场景）——同一功能两个入口方向；Quick Spec 变体三阶段自动跑、免审批门
- 默认逐阶段审批门（phase approval gates）+ 任务进度追踪
- **与 speckit 差异**：IDE 内建能力（非宿主无关 skill 集）；固化 EARS 需求语法；承认需求/design 孰先存在两种真实起点——Speckit 只支持 specify 先行

### 2.3 spec-workflow（MCP 路线）

搜索命中（pimzino spec-workflow MCP 等）但时间盒内未深入源码，仅标注存在第三条路线：以 MCP server 而非文件 skill 为载体、工具调用驱动工作流。**未确认细节**。（线索：https://github.com/pimzino/spec-workflow、https://www.augmentcode.com/tools/best-spec-driven-development-tools）

---

## ③ Anthropic 官方 Agent Skills 写法指南要点

来源：
- 工程文章（2025-10-16，2025-12-18 起成为开放标准）：https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills
- 官方 authoring best practices：https://docs.claude.com/en/docs/agents-and-tools/agent-skills/best-practices

1. **解剖**：skill = 目录 + `SKILL.md`；frontmatter 必填 `name` + `description`，可选捆绑任意资源文件（reference.md、脚本等）
2. **三级渐进披露**（progressive disclosure）：① 启动时仅 name/description 进系统提示（发现的判断依据）→ ② 判定相关后才读 SKILL.md 全文 → ③ 正文里链接的文件按需再读——配合代码执行实现"unbounded context"
3. **Concise is key**："The context window is a public good"——加载后每个 token 都与对话历史竞争
4. **默认假设模型已经聪明**：只写模型不知道的信息，逐段自问 "Does this paragraph justify its token cost?"
5. **自由度分级**（degrees of freedom）：高自由=纯文本启发式步骤（代码审查类）；中自由=带参数的模板/伪代码；低自由=固定脚本——按任务脆弱度选择

---

## ④ 提炼：对 Agent 友好的 skill 写法模式清单（可直接指导 SpecPipe skill 设计）

1. **一份正典 + 机械转译层**：skill 正文写 agent 无关的祈使句 markdown；一切宿主特异性（调用语法、挂载路径、frontmatter 方言）收进 CLI 转译与占位符宏。转译产物（目录名/SKILL.md/宏值）是纯机械映射，正文永不 fork
2. **frontmatter 承载「发现 + 衔接 + 执行」三职责**：`description` 给发现用；`handoffs`（下游 skill id + 预填 prompt + send 标志）把阶段图写成声明式数据而非正文说教；`scripts` 收多平台执行变体
3. **环境状态经脚本 JSON 喂入，不靠 agent 猜**：分支/路径/可用文档清单由 setup 脚本输出结构化 JSON（FEATURE_DIR、AVAILABLE_DOCS…），agent 只解析再行动——确定性状态一律走代码
4. **注入用「路径引用 + 自读」，不内嵌全文**：模板/规章放文件系统固定位置，skill 只写 "Read X"；让宿主渐进披露生效；特殊场景可双通道（脚本直接返回模板内容）
5. **占位符分三类各司其职**：用户输入（$ARGUMENTS）/ 环境脚本（{SCRIPT}）/ 同类互引（命令 id 宏，转译期替换，保证跨宿主互引语法恒正确）
6. **每个 skill 开头写 Scope Guard**：显式声明本 skill 只许动什么（constitution 只改规章、analyze STRICTLY READ-ONLY、converge 只许追加任务），越界意图提取为 deferred intents 列入 Next Actions 而非顺手执行
7. **gate 只读化**：质量门/检查点一律「扫描、报告、未过先问、禁止修改工件」——检查者与被执行物分离
8. **checkbox/状态语义写进 skill 正文**：`[x]` 谁有权打、代表什么（需求质量达标≠实现完成）、生成方禁止自标——防状态语义漂移
9. **需求质量校验与实现验证彻底分离**："unit tests for English" 模式：checklist 校验 spec 本身的完备/清晰/一致，与实现测试互不冒充
10. **token 纪律与自由度匹配**：只写模型不知道的；按任务脆弱度选高/中/低自由度表达（启发式文本 vs 带参模板 vs 固定脚本）；未知项用内置标记协议（`[NEEDS CLARIFICATION: ...]`）让不完整工件可被下游 skill 机器识别

---

## 结论与风险点

- **建议方案**：SpecPipe 拆分采用 speckit 同构——`skill 源卷（正典 markdown + frontmatter handoffs/scripts）+ 工件模板卷 + CLI 转译层（占位符宏 + 挂载适配）`；审查类 skill 全部 Scope Guard + 只读 gate 化；converge 式「差距→追加可追溯任务」可对应我们的 issue 补录/返工闭环
- **风险点**：① spec-kit 单件 skill 已膨胀至 10-22KB（checklist 22KB），与其自身宣称的 concise 原则张力明显——9 件 skill 的 Pre-Execution Checks 钩子段全文重复粘贴是主因，我们应把共享段落下沉为引用文件；② `__SPECKIT_COMMAND_*__` 宏依赖安装期转译，若我们的宿主无 CLI 安装环节需另设计互引语法；③ Anthropic 指南针对 Claude 系宿主，跨宿主（GLM 等）frontmatter 方言兼容性需在转译层自行验证

## 未确认项

- implement.md / checklist.md / spec-template.md 尾段（长文件尾部截断）
- `src/specify_cli/integrations/_helpers.py` 转译源码未逐行核读
- spec-workflow（MCP 路线）细节
