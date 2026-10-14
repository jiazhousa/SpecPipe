---
name: spec-converge
description: 收敛与验收——全 task 闭合聚合、push 闭合检查、fence、归档、MR 准备。何时用：链上全部 task 闭合后的 Story/Issue 收尾。
---

# 收敛与验收

> 规约单源：06-charter「收敛清单」+ 02-process 收敛步 + 07-environment「fence 编排」「记忆三层」。

## Scope Guard

写归档与记忆（AGENTS.md 追加、验收报告）；不改 spec/impl/task 语义内容；不代 sensor 改判定。

## 前置检查

- `specp check all <topic目录>`：**0 FAIL 且全 task 闭合（闭合差集=0）**——这是 spec 验收关键；退出码 0 单独不充分（允许 WARN 的待判定此时应已清零）

## 执行步骤

1. **闭合聚合**：全 task 判定汇总；未闭合项定位到 task 退回 spec-task 重作
2. fence 全量（Story 收尾一次：全量测试/E2E；增量重跑三规则见 07-environment）
3. commit 语义核查（一 task 一 commit 对应、独立可编译）
4. 归档：spec/impl 已在项目内（specs/ 即快照）；AGENTS.md 追加 feature 记录（项目层记忆）
5. MR 准备：确认 spec delta 已含于 commits（spec-anchored 最后一道确认——git 分支即 delta 容器，MR diff 即 spec delta）
6. **收尾两步协议**：先全部判定落盘（含本阶段 sensors），后跑 `specp check all` 复核——解自指
7. 人工验收呈报用户（HITL）

## 工件与 CLI 协作

- 收敛清单六项：06-charter §5
- 判定差集与 DAG：`specp check all <topic目录>`

## sensor 挂载

- 全量 fence 与 CLI smoke = 计算型 sensor（命令输出为结论依据）
- 端到端可检查性（流程规范化/卡点可复查/工件链完整）= 推断型 sensor（sidecar，建议异家族）
