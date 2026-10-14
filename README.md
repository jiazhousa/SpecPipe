# README —— 规章仓定位与卷导览

> **v3 重构进行中（`v3-drafts` 分支）**：本分支正从「工作流制」重构为「工件制」（spec/impl/task 三层 + guide/sensor 控制点，决策链见 `drafts/specpipe-v3-discussion.md`）。下方卷结构为重构目标骨架，正文按批次落地；`main` 分支仍是完整的 v2 规章。

**Spec 哲学**：先规格后编码——规格是人（意图）与机器（执行）之间的接口协议；注意力稀缺，人的裁定只投放在放行点。本仓工作流建立在该哲学之上（学习了 Spec Kit 等先例），哲学叙事不入仓。

本仓为**规范体**：定义编码工作流的流程、工件与协作规范，不诠释哲学、不承载可执行实现、不含平台适配内容；消费者是 agent 与工具，不是人。

## 卷导览（v3 工件制 · 七卷）

| 卷 | 一句话职责 | 加载场景 |
|---|---|---|
| README | 本文件：定位与导览 | 首次接触本仓 |
| 01-principles | 原则总纲：spec-anchored、工件制立场、意图粒度、计算-推断分离 | 常读 |
| 02-process | 建议流程：需求分级（Epic/Story/Issue）与各路径建议步骤 | 任何需求进入时 |
| 03-artifacts | 工件规约：spec/impl/task 三层 schema、双址路由、依赖 DAG 与链路、MR 锚定 | 产出/审阅任何工件时 |
| 04-control | 控制点体系：guide/sensor 矩阵、三级挂载、sidecar、重作回路、闭合语义 | 挂载 sensor / 执行判定时 |
| 05-cli | CLI 契约：三用途（冷启动/规则速查/工件检查）、降级原则 | 使用/实现 CLI 时 |
| 06-charter | 工件宪章 v6：S/R/H 条款、三级 sensor 判定清单、评分与判例 | 组装检查清单时 |
| 07-environment | 环境与组合：Git 纪律、fence 编排、规则组合覆盖 | 进入编码阶段时 |
| templates/ | 工件模板（v3 重构待落地） | 产出工件对格式有疑问时 |
| drafts/ | v3 演进草案（讨论纪要/ skill 定稿/调研/TODO） | 了解 v3 决策链时 |
| review-rules/ | 审查规则语料（B 仓迁入待落地，21 件语言规则） | 推断型 sensor 逐文件审查时 |

## 交接说明

v3 起为**单仓模式**（D26）：方法论 + skill + CLI 收拢本仓（`skills/`、`cli/` 按批次/后续 Story 落地）；原实现仓 OpenCodePipe 退役。v2 时期的安装交接说明见 `main` 分支。
