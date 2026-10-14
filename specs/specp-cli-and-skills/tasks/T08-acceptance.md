# T08: 端到端验收 + 收敛归档

## 元信息
- depends_on: [T07]
- chain: c1
- 分支/执行者: v3-drafts / 主会话统筹

## 范围
- 涉改文件集：`specs/specp-cli-and-skills/acceptance.md`（验收报告）、tasks/T01-T09 判定补全、README/TODO/AGENTS.md 收尾更新
- 统筹要点：impl「收尾清单」节

## guides（前馈）
- guide: spec 验收标准 1-4 + 三 sensor 定义 | type: 计算型（机械引用）
- guide: 验收内容——①`specp check all` 对 minimal-crm 工件链全绿 ②sensor3 推断型：deepseek-flash 审查「流程规范化/卡点可复查/工件规范与完整链路」（清单：分级确认痕迹、spec 三要素与副作用处理、task 闭合链、commit 对应、skill 实际被消费的证据）③人工验收呈报用户 | type: 推断型（统筹撰写）
- guide: **收尾两步协议（解自指）**：①先全部 task 判定落盘（含本 task sensors 的执行与判定）②后跑 `specp check all` 复核——check 只核对「已落盘判定 vs 声明」差集，最后写入的判定自然使差集清零，判定写入与 check 通过不构成循环前提 | type: 推断型（统筹撰写）

## sensors（反馈）
- sensor: **验收 sensor1**——CLI smoke 全量（--help/三用途/正反夹具/退出码矩阵）| type: 计算型（CLI）
- sensor: **验收 sensor3**——流程与链路可检查性判定（deepseek-flash sidecar，上述清单）| type: 推断型（sidecar 会话）
- sensor: 本 Story 自身工件 `specp check all` 全绿（自举自检，验收标准 4）| type: 计算型（CLI）

## sensor 判定

- [计算型·验收 sensor1] CLI smoke 矩阵终验：help/rules/list/checkspec=0、四反夹具=1（点名）、badcmd/坏目录=2、node --check 全过、coldstart 幂等（3 skip）：**PASS**（2026-10-14）
- [计算型·验收 sensor3 前置+AC4] minimal-crm 工件链独立复验：check all 0F0W + fence 25/25 + 功能冒烟一致：**PASS**；**两步协议复核**：本 Story 全判定落盘后 `specp check all specs/specp-cli-and-skills/` 退出码 0（0 FAIL / 0 WARN——含 T01-T09 全闭合）：**PASS**
- [推断型·验收 sensor3] deepseek/deepseek-flash 跨家族终判：**PASS 91/100**（五链路逐项证据；1 medium 卡点 6 证据已补齐，2 low 转残留）——spec-anchored 目标达成
