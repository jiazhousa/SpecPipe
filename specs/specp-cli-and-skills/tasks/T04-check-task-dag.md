# T04: check — task 层 + DAG + 闭合差集 + push 闭合

## 元信息
- depends_on: [T02]
- chain: c1
- 分支/执行者: v3-drafts / 主会话统筹派发

## 范围
- 涉改文件集：`cli/lib/check-task.mjs`、`cli/lib/check-dag.mjs`（含 spec 锚定完整性：git diff 涉改文件 ∈ task 范围）、`cli/fixtures/task-bad.md`（反例：缺锚点/缺类型标注）、`cli/fixtures/dag-bad/`（反例：带环依赖）
- 统筹要点：impl check 节——task 元信息/guides 锚点/sensors 类型/判定一致；DAG 无环+引用存在；闭合差集；push 闭合（git log 匹配 task 编号，非 git 环境降级跳过并提示）

## guides（前馈）
- guide: spec G1/AC1/AC4（闭合差集与 push 闭合）+ 03-artifacts「task 工件」结构 +「依赖 DAG 与链」+ 06-charter §4/§5 | type: 计算型（机械引用）
- guide: D32 且语义——闭合=全部 sensor 有 PASS 判定；「声明 sensors vs 已有判定」差集输出。**夹具口径**：正夹具=T01-T03 已完成且判定已落盘的 tasks（执行时序保证）；反夹具=构造样例 | type: 推断型（统筹撰写）

## sensors（反馈）
- sensor: 正夹具=tasks/T01-T03 已判定后全绿；反夹具（缺锚点/带环 DAG）→ 退出码 1 且指出具体违规 | type: 计算型（CLI）
- sensor: `node --check` + fixtures 冒烟脚本 | type: 计算型（CLI）

## sensor 判定

- [计算型] 正夹具（T01 单件 0 FAIL；all 对本 Story 0 FAIL/6 WARN=T04-T08 待判定属预期，DAG 无环+chain c1×9+锚定 47 件全命中）；反夹具（task-bad 缺锚点/缺类型、dag-bad 环+悬空引用）→ 退出码 1 点名：**PASS**（2026-10-14，统筹侧独立复跑；commit 4be304e）
- [计算型] `node --check` + fixtures 冒烟：**PASS**
- 口径裁决（统筹）：①push 闭合分层——含 FAIL 的未闭合报 FAIL、纯待判定报 WARN（与 task 层差集 WARN 同级）②spec 锚定完整性挂 all 跨级③**一 task 一 commit 的 git log 机械对应检查缓做**（commit message 含多 task 编号有误报面，转向环观察后定口径——记 T08 收尾复核项）
