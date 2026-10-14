---
name: spec-coldstart
description: 棕地项目冷启动——消化 CLI 事实盘点、起草轻量 spec、接入工作流。何时用：存量项目（无 spec/无工作流痕迹）首次接入。
---

# 棕地冷启动

> 规约单源：05-cli 用途①（冷启动）+ 03-artifacts「存放路由」+ 01-principles 立场 5（spec 深度治理归重构）。

## Scope Guard

只建工作流痕迹（脚手架/轻量 spec）；不重构既有代码；**不做全量 spec 补课**——深度治理（完整重读+领域模型重抽）归项目重构。

## 前置检查

- 目标项目已纳入 git 管理（coding 任务）→ 工件将入项目内；非 git 目标 → 留工作区

## 执行步骤

1. 跑 CLI 冷启动（机械层）：
   ```bash
   node <SpecPipe仓>/cli/specp.mjs coldstart --dir <目标项目>
   ```
   产出：specs/ 目录 + spec 骨架（templates 实例化）+ AGENTS.md 提示 + **事实盘点 JSON**（git 状态/语言栈/既有 docs——确定性事实）
2. 消化事实盘点，与用户圈定**本次要动的域**
3. 起草域的轻量 spec（最小决策表 + 验收 + 锚定声明 + 副作用分级）；域对象识别可派采证 sensor 辅助
4. **HITL：轻量 spec 呈用户确认**（锚定目标缺失新建须确认）
5. 进入 spec-plan（Issue 式快速路径：轻量统筹 → 1-2 task → 收敛 → MR）

## 工件与 CLI 协作

- 冷启动只解决「本次变更无裸改」；语料速查 `specp rules 冷启动`
- 后续 spec 增量随 task commit（MR 锚定更新链路，03-artifacts）
