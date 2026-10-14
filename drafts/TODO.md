# SpecPipe v3 —— TODO

> 工作分支：`v3-drafts` · 决策链：`drafts/specpipe-v3-discussion.md`（D1-D35）· 最后更新：2026-10-14

## ✅ 已完成（v3 主线）

- [x] 工件集与控制回路设计（D1-D32，含六次推翻修正）
- [x] A 仓重构：七卷工件制（review 闭环：5 issue 批+语言规范化+术语对齐 Harness Engineering+降级删除+多 sensor 且语义）
- [x] **Story specp-cli-and-skills 全链闭环**（T01-T09 全闭合，2026-10-14 验收通过）：
  - specp CLI 三用途（coldstart / rules 语料=七卷+README+review-rules 21 件 / check 三层+跨级）
  - skills 七件薄适配（Agent Skills standard，pi 实测加载）
  - templates v3 三件 / review-rules 迁入 / AGENTS.md 建立
  - **端到端验收：pi（GLM-5.3+deepseek-flash sidecar）开发 minimal-crm——6/6 HITL 卡点、重作回路真实迭代、check all 0F0W、fence 25/25、sensor3 终判 PASS 91——spec-anchored 达成（D35）**

## 📋 排队（后续迭代）

- [ ] sensor3 残留 low：统筹工件随派发 commit 入库（非收敛 commit）；specp check 输出快照/CI 化
- [ ] 一 task 一 commit 的 git log 机械对应检查（T04 缓做项，转向环观察）
- [ ] checker 效率沉淀：任务书内联材料模式固化（本轮实证零探索零 deny）
- [ ] B 仓（opencodepipe）退役收尾：README 归档声明
- [ ] drafts/ 去留决策（合并 main 时：设计取舍档案 vs 剔除）
- [ ] 合并 main 前的 README/导览终校

## 🗂 留档待激活

- [ ] handoffs 数据结构（R3 暂缓，待宿主支持）

## 🚀 topic2（独立轨道，缓行）

- [ ] OpenCode → Pi 迁移详谈（缓，2026-10-14 用户指示）——**但 pi 端到端已在本 Story 实证跑通**（GLM-5.3 主会话 + sidecar 模式），迁移的技术可行性问题已大部分消解，剩余主要是日常开发习惯迁移
- [ ] 调研素材：`specs/specp-cli-and-skills/pi-research.md`（含 catalog 更新注记）
