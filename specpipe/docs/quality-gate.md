# 质量门环节（S-S10 / I-S7）

**所有编码路径（Story / Issue）在提交到远端前必须经过质量门终检。** 质量门在编码后 review 通过、本地 commit 已提交后执行，是推送到远端前的最后一道关卡。

`.stage` → `QUALITY_GATE`，builder agent 执行以下 4 项检查：

## 检查 1：Commit 信息与编译测试验证

- **Commit 信息** — 每个 commit 的 message 需简洁清晰，符合 conventional commit 规范或项目既有风格
- **逐 commit 编译验证** — 确保每个 commit 能独立编译通过（`git checkout <commit> && 编译` 或通过 `git rebase --exec` 批量验证）
- **逐 commit 测试验证** — 确保每个 commit 的所有测试用例通过
- **失败处理** — 若某 commit 编译/测试不过，builder agent 修复后用 `git commit --fixup` + `git rebase -i --autosquash` 整理，重新验证

## 检查 2：代码质量迭代审查

- builder agent 对 checker 的代码审查报告做最终判定
- 对于**确信是真缺陷的问题**，持续修改代码 + 重新递交 review，直到 review 无值得修改的问题
- 对于**误判**（builder agent 认为 review 的某条意见不成立），builder agent 可判定为误判并跳过该条，但需在 `AGENTS.md` 追加时记录跳过原因
- **判定原则**：builder agent 拥有最终裁量权，但宁缺毋滥——确信是误判才跳过，存疑的默认修复

## 检查 3：测试用例覆盖与回归检查

- **新增测试覆盖** — 检查本次改动是否需新增测试用例，若 impl 文档中声明了测试计划，确认已实现
- **既有测试影响** — 运行全量测试（或受影响模块的测试），确认本次改动未破坏既有测试用例
- **失败处理** — 若既有测试被破坏：
  - 若是**预期内行为变更**（如接口签名调整）→ 更新测试用例适配新行为
  - 若是**意外回归** → 修复代码使测试恢复通过
- 所有测试通过后方可通过本项检查

## 检查 4：设计文档归档与 AGENTS.md 记录（Story / Epic 级适用）

> **适用级别**：仅 Story 及以上级别（含 Epic 下 Story）。Issue 级别跳过本项检查。

- **设计文档上传** — 确认以下文档已正常产出并归档在 `{wf}/plans/{topic}/` 目录：
  - Story：`spec.md`、`impl.md`
  - Epic：`epic-spec.md` + 各 Story 的 `spec.md`、`impl.md`
  - Issue：`issue-impl.md`（作为流程内文档，质量门不强制检查归档，但确认已产出）
- **AGENTS.md 记录** — 对于关键 feature（builder agent 判定是否为"关键"），在项目根目录的 `AGENTS.md` 中追加一条记录：
  - 格式：`- [{日期}] {feature 名称}：{一句话描述}（详见 {wf}/plans/{topic}/）`
  - 记录该 feature 的存在、目的和文档位置，便于后续开发者和 AI agent 快速了解项目演进
  - 若 `AGENTS.md` 不存在，builder agent 创建之（含基本说明头部）

## 质量门通过

4 项检查全部通过后：
1. `.stage` → `DONE`（若此前未设置）
2. 若是关键 feature（builder agent 判定），在项目根 `AGENTS.md` 追加记录（见检查 4）
3. builder agent 提示用户"质量门通过，可以推送分支并创建 MR"，**不自动推送**（推送和 MR 由用户决定或用户明确要求时执行）

## 质量门失败

任一检查项失败：
- builder agent 修复后重新执行失败项及后续检查项
- 连续 3 轮质量门失败 → 提示用户人工介入