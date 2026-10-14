---
name: specpipe
description: SpecPipe 体系的显式入口（先导）——注入工作流上下文、检查项目接入状态、路由到七件意图 skill。何时用：会话中显式启用 SpecPipe 模式（/skill:specpipe 或明确说「用 SpecPipe 开始」）。
---

# SpecPipe 先导入口

> 本 skill 是体系的显式注入点：加载即建立工作流上下文，然后按意图路由——自身不产工件、不做业务判断。规约单源于仓内 01-07 卷。

## Scope Guard

只做三件事：注入上下文、检查接入状态、路由到意图 skill；不写文件、不替代任何意图 skill 的职责。

## 执行步骤

1. **建立语境**：读 `README.md`（术语表）与 `01-principles.md`（立场与原则）——掌握 spec-anchored / 工件三层 / guide-sensor / 计算-推断分离四组核心概念
2. **检查项目接入**：当前项目是否有 `specs/` 目录或工件痕迹——
   - 已接入 → 报告现有 topic 与闭合状态（可跑 `specp check all <topic 目录>`）
   - 未接入（存量项目）→ 引导 `spec-coldstart`
3. **路由**（按用户当前意图，报告路由结果后交接）：

| 意图 | 去向 |
|---|---|
| 新开发需求进入 | spec-workflow（分级判定） |
| 撰写/更新 spec | spec-write |
| 技术方案与 task 切分 | spec-plan |
| 执行单个 task | spec-task |
| 被调用为 sensor（审查/调研） | spec-sense |
| Story/Issue 收尾 | spec-converge |
| 存量项目首次接入 | spec-coldstart |

4. **CLI 提示**：`specp` 命令可用（规则速查 `specp rules <关键词>` / 工件检查 `specp check` / 冷启动 `specp coldstart`）；不可用时按仓内路径 `node <仓>/cli/specp.mjs` 调用
