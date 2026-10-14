---
name: spec-workflow
description: spec 驱动开发的总纲与入口——需求进来先分级（Epic/Story/Issue），选路径，全局原则与工件全景速览。任何开发需求的第一站。
---

# SpecPipe 总纲：分级与路径选择

> 规约单源于本仓 01-07 卷：本 skill 只承载意图执行指导；规约细节用 `specp rules <关键词>` 速查（CLI 位于仓内 `cli/specp.mjs`），或直接读卷。

## Scope Guard

只做需求理解、分级判定与路径分流；不产工件、不改文件；分级结论经用户确认后才进入下游 skill。

## 前置检查

- 本项目是否已接入（specs/ 目录或工作流痕迹存在？）——未接入 → 引导 spec-coldstart
- 用户需求是否极简（单行改动、纯文档）→ 可不走流程，但须知会用户

## 执行步骤

1. 理解需求轮廓；必要时建议采证（调研=推断型 sensor，见 spec-sense）
2. 按分级标准判定 Epic / Story / Issue（判定表：`specp rules 分级`，正文 02-process「需求进入与分级」）
3. **HITL 卡点：分级结论呈用户确认**，允许升降级重判
4. 分流：Story/Epic → spec-write；Issue → spec-write（轻量锚定变体）；存量项目首次 → spec-coldstart

## 工件与 CLI 协作

- 工件全景（spec:impl:task = 1:1:N，guides/sensors 双向流）：`specp rules 工件三层`
- 全局原则速览（spec-anchored / 意图粒度 / 计算-推断分离）：读 01-principles.md
- 分级判定表与三路径：读 02-process.md

## sensor 挂载

本 skill 不产工件、无 sensor；下游工件（spec/impl/task）各自挂载。
