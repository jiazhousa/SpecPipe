# Story specp-cli-and-skills 验收报告（T08）

> 验收日期：2026-10-14 · 验收方：Oracle 独立复验 + deepseek sensor3 终判 + 用户人工验收

## 验收标准逐条结论（spec AC1-AC4）

| AC | 内容 | 结论 | 证据 |
|---|---|---|---|
| AC1 | CLI 三用途 smoke + 正反夹具 + 退出码矩阵 | ✅ | help/rules/checkspec=0；spec-bad/impl-bad/task-bad/dag-bad=1（问题点名）；badcmd/坏目录=2；node --check 全过；coldstart 幂等（3 skip） |
| AC2 | skills 结构合规 + pi 加载 | ✅ | 七件 frontmatter/引用脚本核验过；`pi -p` 实测列出全部七件 spec-* skills |
| AC3 | pi 端到端（最小 CRM）：完整工件链 + check 全绿 + HITL 可复查 + 人工验收 | ✅ | minimal-crm：5+2 commit、check all 0F0W（DAG 无环 4/4 闭合、锚定 9/9）、fence 25/25、6 卡点全停等（dispatch-record）；sensor3 终判 PASS 91；验收通过（证据 minimal-crm `specs/minimal-crm-cli/acceptance.md`） |
| AC4 | 本 Story 自身工件 check 自检 | ✅ | 两步协议复核：判定全落盘后 `specp check all specs/specp-cli-and-skills/` = 0 FAIL / 0 WARN（见 T08 判定节） |

## 验收三 sensor 终态

- **sensor1（计算型）CLI 可用**：PASS——smoke 矩阵 11 项（见上）
- **sensor2（计算型）skill 合规可加载**：PASS——结构脚本核验 + pi 实测加载
- **sensor3（推断型）流程与链路可检查**：PASS 91/100——deepseek/deepseek-flash 跨家族终判：五链路齐备（流程规范化/卡点可复查/工件规范/完整链路/skill 消费证据）；1 medium（卡点 6 证据）+2 low，medium 已当场补齐（acceptance.md 落盘）

## 端到端量化观察（pi @ GLM-5.3 主会话 + deepseek-flash sidecar）

- HITL 卡点 6/6 真实停等，业务决策零臆测（8 问 3 轮逐项确认 + 3 默认提案显式呈批）
- 重作回路真实迭代：spec sensor REJECT 64→88→91（2 轮）；impl sensor 90→92（1 轮）；task sensor 4 次 sidecar 审查全 PASS
- specp 被主动消费：各 stage 结构自查 + 收敛 check all
- 非业务问题自愈 4 项（授权范围内），零升级打扰
- spec-anchored 达成：spec 增量随 commit 入库（收敛 commit 携带），锚定完整性 9/9

## 残留（低优先级，转后续迭代）

- impl/task 统筹工件宜随派发确认 commit 入库（sensor3 low——本次收敛 commit 才入库）
- specp check 输出快照/CI 化留痕（sensor3 low——本次人工快照已落 minimal-crm acceptance.md）
- 一 task 一 commit 的 git log 机械对应检查未实现（T04 口径裁决缓做项，转向环观察）

## 结论

**Story 验收通过**——spec-anchored 目标达成（边界收敛确认）；v3 工件制在异构 harness（pi）上完成首次全链路真实运转。
