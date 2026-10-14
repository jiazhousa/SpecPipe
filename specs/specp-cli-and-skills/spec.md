# Spec: specp CLI 与 skills 薄适配层构建（specp-cli-and-skills）

## 元信息

- topic：`specp-cli-and-skills`
- 分级：Story
- 日期：2026-10-14
- 决策链引用：drafts/specpipe-v3-discussion.md（D1-D32）；本 spec 经 05-cli 契约与 drafts/specpipe-v3-skills.md 定稿派生

## 背景

v3 方法论七卷已定稿并通过逐章 review。仓库当前只有规范文本，缺少两块实现：① CLI（specp，三用途，05-cli 契约）② skills 宿主挂载层（规约与 skill 归一，D27）。最终验收方式已定：skill + CLI 注入本地 pi-coding-agent，由 OpenCode 指派一个真实功能开发，端到端验证 **spec-anchored** 目标达成（边界收敛：不追求全工作流迁移，只验收 spec-anchored 链路）。

## 目标 / 非目标

- G1 `specp` CLI 三用途可用（冷启动 / 规则速查 / 工件合规检查），退出码 0/1/2
- G2 skills 薄适配层建成并可被 pi 加载（规约与 skill 归一：正文在卷，挂载层只做适配）
- G3 三 sensor 定义并挂载，验收全链路可检查
- G4 pi 注入端到端验收通过：被指派的功能开发产出完整工件链，`specp check` 全绿
- 非目标：不做转译层多宿主适配（仅 pi 一例）；不做 review-rules 语料扩充之外的语言规则开发；不迁移 B 仓存量代码；不动七卷已定稿内容（发现的规约问题走判例/后续 issue）

## 需求本身

用户出发点：让 v3 方法论从文本变为可运行体系——skill 驱动 agent、CLI 作为工具与字典（D31 绑定），并在异构 harness（pi）上验证方法论的可移植性与 spec-anchored 有效性。

业务规则：

1. CLI 遵守 05-cli 契约：三用途别无其他；输出确定性事实；零权限控制；不感知 agent
2. skills 遵守归一原则（D27）：01-07 卷是唯一正文源，挂载层是薄适配（frontmatter / 目录约定 / 卷引用），不复制卷内容
3. sensor 遵守泛化 schema（D29/D32）：计算型/推断型两类、验收口径可验收、多 sensor 且关系
4. 本 Story 自身工件（specs/specp-cli-and-skills/ 下 spec/impl/tasks）即 v3 工件制的第一个真实实例——dogfood：结构合规由 `specp check` 自检
5. 验收三 sensor（用户定义，2026-10-14）：
   - **sensor1（计算型）**：CLI 工具能正常使用——`--help`、三用途命令 smoke、正反夹具判定、退出码
   - **sensor2（计算型）**：skill 符合 skill 规范、能被正常加载——结构合规检查 + pi 加载验证
   - **sensor3（推断型）**：skill 被加载并使用——流程规范化、卡点可复查、工件规范与完整链路可被检查（`specp check` 全绿 + 人工验收）

## 主要影响

- 仓库从纯规范体变为**规范 + 实现**体：新增 `cli/`（specp 实现）、`skills/`（挂载层）、`specs/`（本 Story dogfood 工件）
- README 与卷导览需同步实现态（skills/ 行从「规划中」变为实际）
- 后续 SpecPipe 仓自身开发将以 v3 工件制运行（本 Story 是第一个）

## 副作用

| # | 副作用 | 分级 | 兼容方案 |
|---|---|---|---|
| S1 | CLI 引入运行时依赖（Node） | 可兼容 | 零 npm 依赖实现；README 注明 Node ≥18（pi 本身经 npm 安装，宿主环境必具） |
| S2 | pi 扩展机制的形态未经采证，挂载层可能需适配 | 可兼容 | 采证 task 前置于 skills 实现；薄适配层隔离宿主特异性 |
| S3 | review-rules 未迁入，rules 速查语料不全 | 可兼容 | v1 语料 = 七卷 + 宪章；review-rules 迁入作为独立 task 并入本 Story |
| S4 | CLI 检查项与宪章条款可能漂移 | 可兼容 | 转向环：发现的分歧记判例（06-charter 附录 A），后续迭代 |
| S5 | 无破坏性副作用（纯新增建设，不动存量卷） | —— | —— |

## 验收标准

1. `specp --help` 与三用途子命令 smoke 全部通过；对正/反两类夹具工件，check 判定与预期一致（合规→退出码 0，违规→1 并输出问题清单）；用法错误→2
2. skills 挂载层结构合规（frontmatter 必填、卷引用路径有效）；pi 加载验证通过（`pi list` 或等价机制显示已挂载）
3. **端到端验收（最小 CRM 系统）**：新建 sandbox git 仓作为目标项目，注入 skill + CLI；由 OpenCode 指派 pi（GLM-5.3 主会话承载统筹与执行）完成「最小 CRM」功能开发——产出 spec→impl→tasks→commits 完整工件链；推断型 sensor 由 deepseek-flash 的 pi 会话执行（跨模型家族）；`specp check` 对该工件链全绿；HITL 卡点可复查；人工验收 PASS
4. 本 Story 自身工件（本 spec / impl / tasks）通过 `specp check` 自检全绿

## 决策记录

| 决策 | 结论 | 来源 |
|---|---|---|
| 验收宿主 = 本地 pi-coding-agent，OpenCode 指派开发 | 采纳 | 用户 2026-10-14；D33 |
| 边界收敛：最终 target = spec-anchored 达成 | 采纳 | 用户 2026-10-14；D33 |
| 三 sensor 定义（CLI 可用 / skill 合规可加载 / 流程与链路可检查） | 采纳为验收标准 1-3 | 用户 2026-10-14；D33 |
| 验收 topic = 构建最小 CRM 系统（sandbox 新仓，非本仓 templates 重构） | 采纳 | 用户 2026-10-14；D33 |
| 模型路由：GLM-5.3 承载统筹与执行（主会话），deepseek-flash 执行推断型 sensor（跨家族） | 采纳 | 用户 2026-10-14；D34 |
| pi 侧 provider 配置与 auth 由用户完成（HITL 前置依赖） | 依赖项 | 用户 2026-10-14；D34 |

## sensors（spec 级挂载）

- sensor: spec 三要素完备性与副作用分级正确性 | type: 推断型（sidecar 会话）| 验收口径：06-charter spec 判定清单（R1-R8、R18 适用项）

## sensor 判定（sensor 侧写最终结论）

- [推断型·spec 级核查] r1 随 impl 级一并核查（两 low 已修）；**r2 PASS 82/100**（2026-10-14，报告 `drafts/reviews/specp-cli-and-skills-impl-r2.md`；r1 的 spec 侧问题全部闭环，无新增 spec 侧问题）
