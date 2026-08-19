# 质量门环节（S-S10 / I-S7，checker 全面审查）

**所有编码路径（Story / Issue）在提交到远端前必须经过质量门终检。** 质量门由 **checker** 在 `QUALITY_GATE` 状态一次性执行全面审查（原「编码后 check」与「质量门 4 项检查」合并），Builder 不再自查——checker 用不同模型交叉验证，把代码质量、实现一致性、commit、编译、测试、文档归档的所有问题一次性列出，Oracle 派发 Builder 修复后重新递交，全量重审直至 PASS。

`.stage` → `QUALITY_GATE`（Oracle 设置），checker 审查完成后：
- **PASS** → `.stage` → `DONE`
- **REJECT** → `.stage` → `WORKING`，Oracle 派发 Builder 修复后重新递交，全量重审

## 全面审查清单（7 项）

### 1. 实现与 impl 一致性

实际改动是否与 impl 文档描述一致。

### 2. 代码质量（OCR 流水线）

- **规则注入** — 根据变更文件后缀从 `~/.config/opencode/skills/specpipe/docs/review-rules/` 加载对应语言规则文档（映射见 `system_rules.json`，20 个语言规则 + `default.md` 兜底）
- **逐文件审查** — 对每个变更文件，结合 diff 与注入的语言规则逐项检查（死代码、逻辑错误、性能、线程安全等）
- **行级锚定** — 每条问题定位到具体代码行（existing_code 1~3 行 + start_line 行号）
- **事实校验** — 完成后自检，diff 能直接证伪的评论剔除（只做证伪不做验证），降低误报
- **精度优先** — 宁缺毋滥，只提确信是真缺陷的问题
- **评分** — critical -25 / high -12 / medium -5 / low -2，最低 0 分，质量评分 = max(0, 100 - 总扣分)

### 3. Commit 信息

- 用 `git log` 检查每个 commit 的 message 是否简洁清晰，符合 conventional commit 规范或项目既有风格

### 4. 整体编译

- 在 worktree 中执行编译命令（如 `mvn compile`），确认整体编译通过

### 5. 受影响模块测试（fence）

- **必须执行项目的测试围栏脚本**（如 `./scripts/run-test-fence.sh`），**不得以"无新增测试"为由跳过**。fence 是质量门的硬性卡点，即使本次改动未新增测试，也需执行 fence 确认既有测试未被破坏
- 若项目无 fence 脚本，则执行受影响模块的测试命令（如 `mvn test -pl <模块>`）
- **fence 结果摘要需附入审查报告**：包含总用例数/通过数/失败数/跳过数/耗时，格式示例：
  ```
  ## fence 结果
  - 单元测试：882 用例，760 通过，0 失败，122 跳过，71s
  - E2E 测试：106 用例，106 通过，0 失败，0 跳过，91s
  - 合计：988 用例，866 通过，0 失败
  ```

### 6. 测试覆盖与回归

- **新增测试覆盖** — 若 impl 文档声明了测试计划，确认新增测试已实现
- **既有测试回归** — 确认本次改动未破坏既有测试（fence 结果为依据）
- **失败处理** — 预期内行为变更（如接口签名调整）→ 提示 Builder 更新测试适配；意外回归 → 提示 Builder 修复代码
- **fence 失败用例逐一分析** — 若 fence 有失败用例，需逐一分析是否为本次改动引起的回归，不能笼统跳过

### 7. 文档归档与 AGENTS.md（Story / Epic 适用，Issue 跳过）

- **设计文档归档** — 确认 spec.md / impl.md（Epic 为 epic-spec.md）已归档在 `{wf}/plans/{topic}/`
- **AGENTS.md 记录** — 关键 feature 是否已追加到项目根 `AGENTS.md`（格式 `- [{日期}] {feature 名称}：{一句话描述}（详见 {wf}/plans/{topic}/）`）

## 执行方式

- checker 放开 bash 权限执行编译/测试命令（权限白名单见 `agents/checker.md`），builder 在 prompt 中传入 worktree 绝对路径
- 长时编译/测试用 tmux 运行，避免会话超时：
  ```bash
  tmux new-session -d -s qg-test "cd <worktree> && <测试命令> 2>&1 | tee {{tmp_dir}}/qg-test.log"
  tmux has-session -t qg-test 2>/dev/null && echo "测试运行中" || echo "测试完成"
  tmux capture-pane -t qg-test -p | tail -30   # 查看实时输出/结果
  tmux kill-session -t qg-test 2>/dev/null
  ```

## 质量门通过

7 项检查全部通过后：
1. checker 写审查报告 + 更新 `.stage` → `DONE`
2. checker stdout 回传 PASS 结论供 Oracle 决策
3. Oracle 提示用户「质量门通过，可以推送分支并创建 MR」，**不自动推送**（推送和 MR 由用户决定或用户明确要求时执行）

## 质量门失败

任一检查项失败：
- checker 写审查报告（列出所有问题）+ 更新 `.stage` → `WORKING`
- Oracle 对报告中的问题做最终判定：确信是真缺陷的派发 Builder 修复；确信是误判的可跳过（需在 `AGENTS.md` 追加时记录跳过原因）。宁缺毋滥——存疑的默认修复
- Oracle 派发 Builder 修复后重新递交 checker，**全量重审**（不增量，确保收敛）
- 连续 3 轮质量门失败 → 提示用户人工介入

## 质量门报告格式

```markdown
# 质量门审查报告: {topic} (Revision {N})
## 总体评价
[通过 / 不通过]
## 质量评分
{评分} / 100
## fence 结果
- 单元测试：{用例数} 用例，{通过数} 通过，{失败数} 失败，{跳过数} 跳过，{耗时}
- E2E 测试：{用例数} 用例，{通过数} 通过，{失败数} 失败，{跳过数} 跳过，{耗时}
- 合计：{总用例数} 用例，{总通过数} 通过，{总失败数} 失败
## 发现的问题
1. [问题] — 严重程度：critical/high/medium/low
   - 影响：[描述]
   - 建议：[修复建议]
## 结论
# PASS / # REJECT
状态：{审查前状态} → {审查后状态}
```
