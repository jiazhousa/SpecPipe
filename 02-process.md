# 02-process —— 建议流程

> **状态：骨架（批次 3 落地正文）** · 来源：原 02-workflow / 03-story-path / 04-epic-path / 05-issue-path 四卷收拢
> 流程是**建议**不是管控：软门槛=工件存在性；每一步的强制力只来自「下一步需要上一步的工件」。

## 流程的性质

- 建议非管控（v3 总方向）：跳步不被拦截，但会因工件缺失而自然受阻
- 与 skill 的关系：本卷是方法论侧定义，skill 集是它的宿主消费形态

## 需求分级

- Epic / Story / Issue 三级保留（D24），判定标准（承接原 01-general 分级表，工件制语境重述）

## Story 路径（建议步骤）

- 分级确认（HITL）→ （可选）采证 sensor → spec 撰写（草案→澄清→spec 级 sensor→HITL 放行）→ impl 统筹（task 切分+DAG+链划分+impl 级 sensor）→ task 执行（chain 承载、guide 消费、sensor 判定、重作回路）→ 收敛（全 task 闭合聚合、push 闭合检查、fence、归档）→ MR 合入（spec 随更新）

## Issue 路径（锚定 spec 的快速路径）

- 锚定既有 spec（缺失→轻量新建，D14）→ 轻量统筹 → task 执行 → 收敛 → MR

## Epic 路径（路线图容器）

- Epic spec（Story 切分路线图）→ 逐 Story 走 Story 路径

## 降级原则

- 无 CLI 残废态可用（D20）：skill 为体、CLI 为增强
