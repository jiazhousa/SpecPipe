# SpecPipe v3 重构执行方案（工作流制 → 工件制）

> 依据：`drafts/specpipe-v3-discussion.md`（D1-D26）+ `drafts/specpipe-v3-skills.md`（skill 定稿 v1）。
> 目标：A 仓从工作流制（阶段链路+状态机+角色）重构为**工件制**（spec/impl/task 三层 + guide/sensor 控制点）；B 仓资产收敛迁入；单仓模式（方法论+skill+CLI）。

---

## 一、新卷结构（7 卷制）★待确认

| 新卷 | 内容 | 来源 |
|---|---|---|
| `01-principles.md` | 原则总纲：spec-anchored（无裸改）/ 工件制立场（管控退场、核查保留）/ 意图粒度 / 计算-推断分离 / HITL 卡点观 / 幸存硬条文（中文、最小验证、一 task 一 commit） | 01-general 改写 + 11-charter §1 立场段上移 |
| `02-process.md` | **建议流程**（轻量）：需求分级标准（Epic/Story/Issue）+ 各路径建议步骤（HITL 点标注）+ 降级原则 | 02+03+04+05 四卷收拢 |
| `03-artifacts.md` | 工件规约：spec/impl/task 三层 schema + 双址路由（项目内快照/工作区过程）+ 依赖 DAG 与链路模型 + MR 锚定更新链路 + topic 命名 + 放行不留痕说明 | 06-artifacts 重写 |
| `04-control.md` | 控制点体系：guide/sensor 2×2 矩阵 + 三级挂载 + sidecar 模型 + 重作回路 + 闭合语义（全 sensor PASS=done）+ 跨家族建议 + 检查分流（机械/语义） | 新写 + 09-check-split 检查分流段并入 |
| `05-cli.md` | CLI 契约：三用途（冷启动/规则速查/工件检查）+ 命令面 + 降级原则 + 代码落位 `cli/` 规划（含图论校验模块） | 新写 |
| `06-charter.md` | **宪章 v6**：S/R 条款体系（spec/impl/task 三级检查清单源）+ 判例机制（新增 v5→v6 回摆判例）+ 评分规则 + 审查清单（09 五类清单改造为 sensor 判定清单） | 11-charter 升级 + 09 审查清单/评分并入 |
| `07-environment.md` | 环境与组合：git 纪律（一 task 一 commit、三分支策略、MR 语义）/ fence 编排 / 规则组合覆盖（AGENTS.md 三层记忆） | 10-composition 改写（worktree 纪律弱化为参考——D21 交 git-master） |

**废除**：`07-state-machine.md`（状态机退场 D2）、`08-roles.md`（role 退役 D22，意图粒度 D25）；`09-check-split.md` 内容分流至 04/06 后删除；`02/03/04/05` 收拢为 02 后删除。

## 二、目录全景（重构后）

```
SpecPipe/
├── 01~07 卷（7 卷制，工件制组织）
├── templates/          ← 重构：spec/impl/task 三件为主（含 sensor 判定节）；五类审查报告模板退化为判定格式
├── review-rules/       ← B 仓迁入（21 件语言规则 + system_rules.json）★待确认落位
├── skills/             ← 后续 Story（7 件正典 + shared/，按 skill 定稿 v1）
├── cli/                ← 后续 Story（specp 三用途实现）
└── drafts/             ← 演进草案（保留）
```

## 三、B 仓资产迁移清单

| B 仓资产 | 去向 | 批次 |
|---|---|---|
| `configs/review-rules/` 21 件 | → A 仓 `review-rules/`（推断型 sensor 的语言级规则语料） | 4 |
| check-tools 图论校验预留位 | → `05-cli.md` 规划记录（依赖 DAG 校验） | 3（文档提及） |
| ocp CLI 五命令 | 不迁——`cli/` 按三用途重写（后续 Story） | — |
| stage 插件 / agents 五件 / vendored 机制 | 废弃（D2 / D22 / D26） | — |
| `.specpipe/` Story 档案 / B 仓 AGENTS.md 开发记忆 | 不迁——B 仓冻结保存历史 | — |
| fence 四步理念（typecheck/test/smoke/consistency） | 留档理念，`cli/` 开发时自建 | — |

## 四、执行批次（每批一 commit 推远端，按批 review）

| 批次 | 内容 | 产出量级 |
|---|---|---|
| **1 结构落地** | 删 07/08/09 与旧 02-05；立 7 卷新骨架（标题+目录+「本卷重构中」占位）；README 目录说明更新 | 骨架 |
| **2 核心三卷** | 01-principles / 03-artifacts / 04-control 全文重写（D1-D26 忠实翻译） | ~3×80 行 |
| **3 流程与宪章** | 02-process（四卷收拢为建议流程）+ 06-charter v6（含 v5→v6 回摆判例） | ~2×80 行 |
| **4 配套** | 05-cli + 07-environment + templates 重构（spec/impl/task 模板）+ review-rules 迁入 | 中 |
| **5 收尾** | README 重写（单仓叙事）+ 全卷交叉引用校对 + B 仓退役标记（其 README 加归档声明，可选） | 小 |

## 五、待确认决策点

| # | 决策点 | 我的倾向 |
|---|---|---|
| P1 | 新卷结构 7 卷制 + 各卷命名编号 | 如§一 |
| P2 | 09 并入 04/06、02-05 收拢为 02-process | 如§一 |
| P3 | review-rules 落 A 仓根 `review-rules/`（备选：`configs/review-rules/`） | 根目录（顶层可见性，与 templates/ 平级） |
| P4 | 批次节奏：每批一 commit 推远端、你按批 review | 如§四 |
