# SpecPipe v3 —— TODO

> 工作分支：`v3-drafts` · 决策链：`drafts/specpipe-v3-discussion.md`（D1-D26）· 最后更新：2026-10-13

## ⏸ 待用户确认

- [ ] **P1-P4**（`drafts/specpipe-v3-restructure.md` §五）：7 卷制新结构 / 09 并入 04+06、02-05 收拢 / review-rules 落位 / 批次节奏

## 🔨 执行中

- [ ] **A 仓重构五批次**（P1-P4 确认后启动，每批一 commit 推远端）：
  - [ ] 批次 1：结构落地——删 07/08/09 与旧 02-05，立 7 卷新骨架，README 目录更新
  - [ ] 批次 2：核心三卷重写——01-principles / 03-artifacts / 04-control
  - [ ] 批次 3：02-process（四卷收拢）+ 06-charter v6（含 v5→v6 回摆判例）
  - [ ] 批次 4：05-cli + 07-environment + templates 重构 + review-rules 迁入
  - [ ] 批次 5：README 单仓叙事 + 交叉引用校对 + B 仓退役标记（可选）

## 📋 排队（A 仓重构完成后）

- [ ] **skill 正文撰写**：7 件 SKILL.md（workflow/write/plan/task/sense/converge/coldstart）+ shared/ 四件——按 `drafts/specpipe-v3-skills.md` 定稿 v1
- [ ] **cli/ 实现**（specp，后续 Story）：冷启动（脚手架+事实盘点）/ 规则速查（条款级查询）/ 工件检查（spec/impl/task 多层次计算型 sensor，含依赖 DAG 图论校验、push 闭合检查）
- [ ] **B 仓退役收尾**：README 归档声明、远端处置（若 B 仓有远端）

## 🗂 留档待激活

- [ ] handoffs 数据结构（R3 暂缓：OpenCode 无此机制+纯体验升级；skill 定稿 §5 各件 yaml 留档，待宿主支持时启用）

## 🚀 topic2（独立轨道）

- [ ] OpenCode → Pi 迁移详谈：Pi 能力面（subagent 机制？sensor 通道怎么落地？）→ 反向约束 skill/CLI 边界设计
- [ ] 调研素材：`~/project/AgenticTicketDesk/research/picore-migration/04-pi-facts-explorer1.md`（2026-10-10 复核版）

## ✅ 已完成

- [x] 工件集与控制回路设计（D1-D26，无悬置）
- [x] skill 定稿 v1 review（R1-R6 闭环：合一+意图粒度 / 总纲保留 / handoffs 暂缓 / sense 被动 / shared 四件 / A 仓收拢）
- [x] spec skill 调研（speckit 解剖+OpenSpec/Kiro 扫描+模式采纳清单）
- [x] 草案与重构方案上远端（v3-drafts：870c178 → 06e370c → b84c776）
