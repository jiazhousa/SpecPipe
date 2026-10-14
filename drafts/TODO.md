# SpecPipe v3 —— TODO

> 工作分支：`v3-drafts` · 决策链：`drafts/specpipe-v3-discussion.md`（D1-D26）· 最后更新：2026-10-14

## ⏸ 待用户确认

- [x] ~~**P1-P4**~~ ✅ 全部确认（2026-10-14）

## 🔨 执行中

- [ ] **7 卷正文逐章 review** ← 当前（用户进行中，耗时较长；意见将以 issue 形式反馈）
  - review 期间的修订约定：每条 issue → 对应修订 commit 推远端，可追溯
- [ ] **A 仓重构**（review 通过后继续）：
  - [x] 批次 1：结构落地（2026-10-14）
  - [x] 7 卷正文填充 + 独立版本化重述 + 语言规范化（2026-10-14，624 行）
  - [ ] review 后：templates 重构（spec/impl/task 模板）+ review-rules 迁入（21 件）
  - [ ] 收尾：README 校对 + B 仓退役标记（可选）+ drafts/ 去留决策（合并 main 时）

## 📋 排队（A 仓重构完成后）

- [ ] **skill 正文撰写**：7 件 SKILL.md（workflow/write/plan/task/sense/converge/coldstart）+ shared/ 四件——按 `drafts/specpipe-v3-skills.md` 定稿 v1
- [ ] **cli/ 实现**（specp，后续 Story）：冷启动（脚手架+事实盘点）/ 规则速查（条款级查询）/ 工件检查（spec/impl/task 多层次计算型 sensor，含依赖 DAG 图论校验、push 闭合检查）
- [ ] **B 仓退役收尾**：README 归档声明、远端处置（若 B 仓有远端）

## 🗂 留档待激活

- [ ] handoffs 数据结构（R3 暂缓：OpenCode 无此机制+纯体验升级；skill 定稿 §5 各件 yaml 留档，待宿主支持时启用）

## 🚀 topic2（独立轨道，缓行）

- [ ] OpenCode → Pi 迁移详谈（**缓**，2026-10-14 用户指示）：Pi 能力面（subagent 机制？sensor 通道怎么落地？）→ 反向约束 skill/CLI 边界设计
- [ ] 调研素材：`~/project/AgenticTicketDesk/research/picore-migration/04-pi-facts-explorer1.md`（2026-10-10 复核版）

## ✅ 已完成

- [x] 工件集与控制回路设计（D1-D26，无悬置）
- [x] skill 定稿 v1 review（R1-R6 闭环：合一+意图粒度 / 总纲保留 / handoffs 暂缓 / sense 被动 / shared 四件 / A 仓收拢）
- [x] spec skill 调研（speckit 解剖+OpenSpec/Kiro 扫描+模式采纳清单）
- [x] 草案与重构方案上远端（v3-drafts：870c178 → 06e370c → b84c776 → f00641a）
