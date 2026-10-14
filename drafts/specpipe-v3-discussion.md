# SpecPipe v3 演进讨论纪要（topic1：CLI 工具化与工件集重构）

> 会话：2026-10-13 起。两 topic：① OpenCodePipe 插件 CLI 工具化 + SpecPipe 内容拆解为可迁移 skill + CLI（含 checker 跨家族审查吸纳）；② OpenCode → Pi 迁移（非 piCodingAgent，功能面另议）。
> 本文档承载 topic1 的讨论决策链，收敛后转正式 spec。**一点一点进行，不求一次到位。**

---

## 一、总方向（已拍板，2026-10-13）

1. **三层解耦**：方法论（skill）↔ Agent 宿主解耦；CLI ↔ Agent 宿主解耦（CLI 不启动、不控制、不感知 agent）；流程步骤由宿主内 skill 承载，CLI 只管工件与脚手架
2. **管控对象换轨**：不控流程细节，**只控工件规约**（存在性/结构/质量/依赖），流程路径降级为 skill 建议
3. **CLI 零权限控制**：纯工具（类似 git，谁都能调）
4. **checker 跨家族吸纳为建议**：skill 层推荐「审查用异家族模型」+ doctor 检测提示，零强制
5. ~~**交付物落点**：B 仓（opencodepipe）内重构，main 迭代~~ → **推翻（D26）：A 仓收拢单仓模式**——SpecPipe 一个仓承载方法论+skill+CLI，B 仓退役/冻结
6. **对标**：github/spec-kit（2026-10 形态）——skill-first；管控=工件型软门槛；agent 解耦=integration 适配器
7. **雏形优先**：先跑通不做极致优化

## 二、现状基线（讨论前已存在的事实）

- **宪章 v5**（2026-10-10）：四类工件 + S/R/H 条款体系；CLI 定位=纯计算型 sensor（`specp stage/gate/init/doctor`）；M 类条款与 validate/check/review 已裁撤；模板刷新 pending specp-cli Story
- **review-rules 已收仓**：`configs/review-rules/` 21 件（2026-09-18）
- B 仓：ocp 五命令 + stage 插件（双形状）+ agents 五角色；check-tools 预留 Task.yaml 图论校验模块位
- A 仓 11 卷：07 状态机 / 06 工件（含 .stage 行）/ 10 组合覆盖
- ⚠️ 08-roles「平级互不调用」与 builder→sensor 通道冲突，待修订（adapter 落地形态后议）

## 三、已拍板决策汇总（D1-D18）

| # | 决策 | 内容 |
|---|---|---|
| D1 | 项目宪法不立 | AGENTS.md 兼任原则载体，靠 10-composition 三层覆盖 |
| ~~D2~~ | ~~`.stage` 保留~~ | **推翻（三轮）：`.stage` 一并删除**——流程管控退场；进度=工件 + sensor 判定推导 |
| D3 | **spec / impl / task 三层拆分** | spec=业务规则层；impl=统筹任务书层；task=最小执行与验证单元 |
| ~~D4~~ | ~~spec 放行留痕~~ | **推翻（三轮）：放行不留痕**——HITL 仍是建议流程卡点，不落痕迹 |
| D5 | **guide/sensor × 计算型/推断型** | 前馈=guide、反馈=sensor；每控制点标注类型 |
| D6 | 基数规则 | 一个 Story = 1 spec : 1 impl : N task |
| D7 | 依赖与链路承载 | task DAG（depends_on 分布式声明）；**连通即同链：1 链 = 1 分支 + 1 builder**；菱形视同同链，不做跨分支合并（雏形优先）；链间才并行 |
| D8 | **sensor sidecar 模型** | guide 由 Oracle 派发；sensor 外置于 builder，builder→sensor 调用渠道必须提供 |
| D9 | **spec-anchored + MR 锚定更新链路** | Issue 必须关联 story 的 spec；仅当 MR 合入时才一并将 spec 更新 |
| D10 | **guide/sensor 全覆盖** | 所有任务类型纳入 guide/sensor 体系；调研型任务=推断型 sensor（观察采证） |
| D11 | 依赖声明权威位置 | 分布式：task 文件头部 depends_on，CLI 派生校验 |
| D12 | **sensor 挂载粒度 = task 级** | 每 task 完成即逐 sensor 判定闭合，不通过重新进行；sensor=把 story 末统一 checker 核查分散到每个 task |
| D13 | **重作回路本地化** | sensor 打回→builder 重处理→再判定（本地回路，**amend 归一 commit**，已确认）；builder 只向 oracle 汇报结果；中间迭代不留标准痕迹 |
| D14 | **锚定缺失→轻量 spec** | 朴素实现：新建轻量 spec；深度治理（完整重读+域对象重抽取）归**重构路径**——**重构必含 spec 重构（业务项目重构一般原则，已确认）**；棕地冷启动常态 |
| D15 | **spec 工件双址路由** | coding 任务 / git 管理目标 → spec 放**项目内**（结论、过程无关、快照）；非 coding 任务 / 无 git 目标 → 留**工作区**（工作记录、过程性） |
| D16 | **spec 更新入 task 范围 + 一 task 一 commit** | spec 文件改动点列入 task 范围（同 commit 携带）；一个 task 一个 commit |
| D17 | **sensor 三级挂载** | 管控退场但核查保留：**spec 级**（内容约定核查）+ **impl 级**（统筹质量核查——impl 不放任，防大量 task 返工）+ **task 级**（D12）；checker=推断型 sensor 的角色实现（跨家族建议）；检查清单源自宪章 S/R 条款 |
| D18 | **push 闭合检查 = 计算型 sensor** | 原 pre-push hook 转生：检查 spec 下挂载的**全部 task 是否闭合**，作为 **spec 验收关键** |
| D19 | **CLI 三用途**（重新审视拍板） | ① 棕地项目冷启动 ② 规则手册速查 ③ 工件合规检查的计算型 sensor——**多层次支持：spec/impl/task 工件都要检查**。~~guide 装配命令~~（Oracle 种子提案）出局；gate 并入 ③ |
| D20 | **doctor 删去 + 优雅降级原则** | 不做重量级插件：**没有 CLI、只有 skill 也应当能用——只是残废**；不强制侵占其他插件生态（最小宿主足迹）。skill 不依赖 CLI 存在，CLI 是增强非前提 |
| D21 | **worktree 移出核心** | git/worktree 操作交由外部 skill（git-master）控制——specp 保持最小命令面，与既有生态组合而非重复建设 |
| D22 | **role 体系删除** | role=prompt+指定model+权限集合：「指定 model」宿主耦合（很多 harness 壳不好用）、权限已解耦（D20）、prompt 可抽进 skill——role 定义本质也是预制 prompt。五角色退役，知识迁入 skill |
| D23 | **skill 按建议流程切分** | 双轴定义：建议流程（主轴）× 工件规约（内容）；章节与注入内容对 Agent 友好化（参照既有 spec skill 实践，调研行动项已挂）；skill 内引用 CLI 速查；**并行执行单元不绑定 subagent 机制**（chain 承载者形态宿主无关——独立会话/进程/多开皆可，方法论只管工件契约） |
| D24 | **分级保留** | Epic / Story / Issue 三级保留，建议流程承载于 skill（Issue=锚定 spec 的快速路径，Epic=路线图容器） |
| D25 | **意图粒度原则** | skill 按意图切分，不按操作主体切——不同意图不同 skill 合理，不同主体不同 skill 诡异（R1 拍板，原则入 skill 设计 §1.7） |
| D26 | **A 仓收拢（单仓模式）** | 一个仓=方法论+skill+CLI（speckit 模式）：skills/ 与 cli/ 落 SpecPipe A 仓；**推翻最初「B 仓内重构」落点**——B 仓退役/冻结，存量资产择优迁移；vendored 机制消失（同仓直引）；三层叙事收拢为 Spec 哲学→SpecPipe |
| D27 | **规约与 skill 归一** | 规章卷不是「规约+另有 skill 消费」两层——卷本身即 skill 正文，宿主挂载只是薄适配（frontmatter/目录约定）；删除「另行落地」的分裂表述 |
| D28 | **spec 三要素 + 副作用分级 + 逐项确认** | spec 内容重构为：需求本身（出发点+业务规则）/ 主要影响（用户期望流程的改动）/ **副作用**（用户未意识到的连带影响，分级：可兼容→spec 给兼容方案；破坏性→须用户放行）；放行从整体一次→**业务规则/主要影响/副作用逐项确认**（可经交互式访谈）；spec 不含实现细节、最小化人的注意力占用 |
| D29 | **sensor 分类收敛 + 泛化 schema 不分级** | ① 取消「采证型/判定型」说法——sensor 只分计算型（可被代码验证）/推断型（需 LLM+prompt 语义理解），采证/判定只是推断型的两种用途；② 取消三级挂载的规定性——sensor schema 泛化、可验收，任何工件通用；规约只约定工件长相，不约束 Agent 与工作流，经工件固化为实际 action |
| D30 | **spec 同步步** | spec 工作开始前获取最新 spec 内容矫正（同 git 开发前先 pull），解决端点不一致（spec 随 MR 演进，多端可能滞后） |
| D31 | **CLI 与 skill 绑定（推翻 D20 降级原则）** | 删除降级模式概念：skill 的可用性依赖 CLI——CLI 既作为**工具**（计算型控制点执行器），也作为**字典**（方法论语料载体，规则速查的数据源）；两者是绑定的整体，不可删减 |
| D32 | **多 sensor 挂载 + 且语义** | 一个工件可挂载多个 sensor；sensor 间是「且」（AND）关系——必须全部 sensor 验收口径同时满足才闭合，任一未通过即未闭合；不存在「或」式部分达标 |
| D33 | **构建 Story 启动（dogfood）** | specp CLI + skills 薄适配层构建立项：v3 工件制首个真实实例（specs/specp-cli-and-skills/）；验收宿主=本地 pi-coding-agent，OpenCode 指派最小 CRM 开发；**边界收敛：最终 target=spec-anchored 达成**；验收三 sensor=CLI 可用（计算）/skill 合规可加载（计算）/流程与链路可检查（推断） |
| D34 | **pi 模型路由（跨家族落位）** | GLM-5.3 承载统筹与执行（主会话），deepseek-flash 执行推断型 sensor（sidecar pi 会话）——跨家族 checker 吸纳在新架构的落位；pi provider/auth 由用户配置（HITL 前置） |

## 四、核心设计展开

### 4.1 控制点类型矩阵（2×2）

| | 计算型（确定性，可机械执行） | 推断型（语义判断） |
|---|---|---|
| **guide（前馈）** | 机械装配的定向材料：涉改文件集、基线 commit、spec 条目引用、验证命令 | 语义引导：架构意图、风险警示、实现口径、跨 task 协调说明 |
| **sensor（反馈）** | 确定性校验：编译、指定测试、fence、文件集漂移、**push 全 task 闭合检查** | 语义审查：代码审查、spec 符合性、设计对齐、调研采证 |

**类型决定载体与渠道**：计算型 → CLI（渠道=shell，计算外置于 builder 推理）；推断型 guide → Oracle 撰写；推断型 sensor → sidecar agent（渠道=宿主 agent 调用机制；**建议跨家族模型**）。

> **CLI = 一切计算型控制点的执行器 + 工件脚手架**；推断型控制点归 agent。guide/sensor 是 harness 的普适抽象。

### 4.2 三级挂载与双向流（D17 核心结构）

```
                    用户需求 + 调研结论（采证型 sensor 的产出）
                              │
                              ▼
  spec.md ◀── sensor：[推断型] 内容约定核查（checker，清单源自宪章 S/R）
      │                        HITL 卡点：用户放行（不留痕）
      ▼ guides（锚点）
  impl.md ◀── sensor：[推断型] 统筹质量核查（checker——防 task 返工级联）
      │
      ▼ guides（统筹要点）
  task × N ◀── sensors：[计算型] CLI + [推断型] sidecar（每 task 判定闭合）
      │                        重作回路本地化（amend 归一，oracle 只收结果）
      ▼
  push / spec 验收 ◀── sensor：[计算型] 全 task 闭合检查（原 hook 转生，D18）
      │
      ▼
  MR 合入 → spec 随之更新（D9）
```

- **guides 向下锚定，sensors 向上闭合**：spec/impl/task 三级工件各自可挂 guides 与 sensors；前馈自上而下传递锚点，反馈自下而上逐级判定
- **管控与核查分离**：流程管控（状态门槛/阻塞点/留痕）全部退场；内容核查（sensor 判定）三级保留
- sensor 判定结果落在工件自身的判定节（附报告路径可选）——revision 报告退化为 sensor 附件，不再是独立工件类
- 采证型 sensor（调研）产出事实材料，进入下游 guides——推断型操作不只判定 pass/fail，也产出前置素材

### 4.3 task 工件 schema（v3）

路径：`plans/{topic}/tasks/T01-{slug}.md`，每 task 一件：

```markdown
# T01: {slug}

## 元信息
- depends_on: [T00]        # 依赖声明（分布式，DAG 边）
- chain: {chain-id}        # 所属执行链（依赖图推导）
- 分支/承载: {branch}       # 链路级，同链共用

## 范围
- 涉改文件集（链间不相交；同链可重叠；**含 spec 文件改动点**——D16）
- 统筹要点（引用 impl 章节号）

## guides（前馈，Oracle 派发）
- guide: spec 规则锚点 G3/G7     | type: 计算型（机械引用）
- guide: 架构意图与实现口径说明    | type: 推断型（Oracle 撰写）

## sensors（反馈，task 级挂载）
- sensor: 编译 + 指定单测通过     | type: 计算型（CLI）
- sensor: 代码审查 vs spec 规则   | type: 推断型（sidecar agent）

## sensor 判定（sensor 侧写最终结论）
- [计算型] 编译+单测：PASS（commit a1b2c3）
- [推断型] 审查：PASS 92/100（报告路径）
```

- task 状态走工件推导：全 sensor PASS = done；task 即派发载体
- spec.md / impl.md 同构地含 sensors 声明与判定节（D17）

### 4.4 依赖管理与链路模型

- depends_on 分布式声明 → 全局 DAG；CLI 图校验（无环/引用存在/链路划分一致）——接 B 仓「Task.yaml 图论校验模块位」
- 连通即同链（雏形不做跨分支合并）；链间并行；「文件集不相交」为链间自然结果（可作计算型 sensor 校验）
- 一 task 一 commit：chain 内多 task = 多 commit 串行同分支；重作 amend 归一

### 4.5 spec-anchored 与 MR 锚定更新链路（D9/D14/D15/D16）

**原则**：一切行为变更锚定在 spec 上——代码是真理，spec 是共识记录，两者经 MR 原子同步。

- **Issue 改造**：Issue 必须关联 story 的 spec，无裸改；锚定目标缺失 → 新建轻量 spec（棕地冷启动常态）
- **spec 深度治理**：完整重读 + 域对象重抽取 → 归重构路径，重构必含 spec 重构（业务项目一般原则）
- **更新时机**：仅当 MR 合入时才一并更新 spec
- **更新承载**：spec 文件改动点在 task 范围内，随 task commit 落地；rel/ms cherry-pick 自然携带
- **双址路由**：项目内（结论/快照）vs 工作区（工作记录/过程性）；流向=工作区草稿→定稿入项目→MR 直接改项目内 spec

### 4.6 进度推导（最终形态）

- 推导链：spec.md 存在 → impl.md 存在 → tasks 存在 → task 逐个闭合（sensor 判定）→ commits（1:1）→ push 闭合检查（全 task 闭合=spec 验收关键）→ MR 合入（spec 随之更新）
- 「放行与否」不可推导——HITL 卡点保留在建议流程，不留痕迹（接受盲区）
- CLI 可输出的确定性事实：工件存在性 / task 闭合差集 / 依赖图健康 / spec 锚定完整性（涉改文件 ∈ 某 task 范围）

### 4.7 对宪章 v5 的冲击清单（更新版）

| 冲击点 | 内容 |
|---|---|
| 工件集重构 | spec / impl / task 三层，各挂 guides/sensors；revision 报告退化为 sensor 附件；.stage/.stage-history/放行留痕删除 |
| §2 条款体系 | S/R 条款保留——**作为三级 sensor 的检查清单源**（checker 判定依据）；R11-R13 改造为 sensor 判定规约 |
| §3/§4 结构项 | spec/impl 增 sensors 声明与判定节；impl 任务块内嵌 → task 工件 + DAG |
| §1 CLI 定位改写 | 「CLI 是计算型 sensor」→「CLI 是计算型控制点执行器」 |
| §1 spec 资产立场 | spec-anchored 机制化：锚定 + 轻量新建 + MR 同步 + 双址路由 |
| 07 状态机卷 | **整卷废除** |
| 05 Issue 路径 | Issue 锚定 spec |
| 08-roles | 平级规则修订（builder→sensor 通道）；checker 定位=推断型 sensor 角色实现（spec/impl/task 三级挂载） |
| 02/03/04 流程卷 | 强制链路 → 建议流程；审查环节 → sensor 调用 |
| B 仓存量 | stage 插件退役；**hook 转生为 push 闭合计算型 sensor**；check 五项随宪章 v6 重整 |

### 4.8 CLI 命令面（D19 三用途展开）

**用途定位取代命令清单**——CLI 的存在理由就三条：

**① 棕地项目冷启动**
- 场景：既有代码库（无 spec/无工作流痕迹）接入 SpecPipe——D14 已定「轻量 spec 新建是棕地冷启动常态」
- CLI 职责（机械层）：脚手架铺设（工作流目录/模板实例化/spec 骨架生成）+ **项目事实盘点**（git 状态/语言栈探测/既有 AGENTS.md 与 docs 盘点/模块清单——确定性事实，作为 agent 起草轻量 spec 的素材）
- 语义层归 agent+skill：轻量 spec 的内容起草、域对象识别是推断型工作

**② 规则手册速查**
- CLI 携带方法论语料（A 仓规章 + 宪章 + review-rules，vendored 机制延续），提供条款级查询
- 服务对象：skill 指导下的 agent（组装 sensor 清单时查宪章对应表）+ 推断型 sensor（checker 的检查条款文本）+ 人
- 架构意义：**skill 保持薄身，规则单源于 CLI 携带的语料**——方法论以 CLI 为分发载体，skill 只写「何时查什么」不复制内容

**③ 工件合规检查的计算型 sensor（多层次）**
- `spec 级`：必填章节存在性、行数预算、Issue 锚定完整性
- `impl 级`：必填章节、spec 引用存在性、任务切分与 DAG 合法性（无环/引用存在/链路划分）
- `task 级`：guides 必含 spec 锚点、sensors 必标类型、sensor 判定与声明一致性（闭合差集）、一 task 一 commit 对应
- `跨级`：依赖图健康、spec 锚定完整性（涉改文件 ∈ task 范围）、**push 闭合检查（D18：全 task 闭合=spec 验收关键）**
- ⚠️ **宪章 v5 判例部分回摆**：v5 曾裁撤 M 类结构断言与 check 命令（「结构检查归 agent」）——现边界重划：**结构合规=确定性事实，回归 CLI（工件级计算型 sensor）；语义质量（R 类内容质量）仍归推断型 sensor/checker**。回摆的正当性来自 D5 类型体系：计算/推断之分取代了 v5 笼统的结构/语义二分

**存量命令去留**（已定）：**doctor 删去**（D20——环境自检属 adapter 时代关注点；无 CLI 时 skill 仍可用，残废但能跑）；**worktree 移出核心**（D21——交 git-master skill）；`specp stage` 随状态机废除确定死亡。

**最终命令面 = 冷启动 + 规则速查 + 工件检查 三用途**，别无其他。

### 4.9 优雅降级原则（D20 展开）

**依赖方向：skill 为体，CLI 为增强**——skill 不依赖 CLI 存在：

| 能力 | skill+CLI（完整） | 仅 skill（残废态） |
|---|---|---|
| 规则手册 | `specp rules` 条款级速查 | 直接读 vendored 语料全文 |
| 工件合规 | 计算型 sensor 确定性检查 | agent 自查（推断型兜底计算型的活，慢、易错） |
| 冷启动 | 脚手架+事实盘点 | agent 手动铺目录/手写骨架 |
| push 闭合 | 计算型关卡 | 人工/agent 核对 |

- **不侵占其他插件生态**：宿主足迹最小化——只挂薄 skill，不抢占插件位、不要求宿主基础设施；对 Pi 迁移的意义=adapter 极薄（挂 skill 即用，CLI 走 shell 可达即用）
- 与 speckit 哲学同构：skill 在任何 agent 里都能跑，CLI 只是 setup+检查增强

### 4.10 skill 设计（D22/D23/D24）

**role 拆除的逻辑链**：role = prompt + 指定 model + 权限集合。指定 model → 宿主耦合（很多 harness 壳不好用）；权限集合 → 已解耦（D20）；prompt → 可抽进 skill。role 定义本质也是预制 prompt，那就直接用 skill 承载。五角色（oracle/builder/checker/explorer/looker）退役，其职责融入 skill 的建议流程描述：

| 原角色 | 新范式下的去向 |
|---|---|
| oracle | 主 agent 本体（skill 驱动的调度逻辑——建议流程各环节的编排指导） |
| builder | task 执行者（chain 承载者，形态宿主无关） |
| checker | 推断型 sensor 的执行指导（跨家族模型建议挂在 skill 文字里） |
| explorer | 采证型 sensor 的执行指导（调研任务=推断型 sensor） |
| looker | 视觉采证 sensor（同上，可选） |

**skill 内容双轴**：
- 主轴=建议流程：按流程阶段切 skill（对应 spec 撰写 / impl 统筹 / task 执行 / sensor 判定 / 收尾归档等，具体清单待调研后定）
- 内容轴=工件规约：每个流程 skill 内含对应工件的规约要点 + 宪章条款引用 + **CLI 速查指引**（`specp rules`/`specp check` 的使用时机）
- 分级（Epic/Story/Issue）保留在建议流程中；Issue=锚定 spec 的快速路径

**对 Agent 友好化**（调研已完成，见 4.11）：章节结构、注入内容（模板/规约/checklist 怎么进 skill）、指令密度、引用而非复制——参照既有 spec skill 实践整理

### 4.11 调研输入与模式采纳清单（报告：`drafts/spec-skill-survey.md`）

**speckit 解剖关键事实**：9 件 skill 单一正典源（`templates/commands/*.md`）+ CLI 机械转译（25+ 宿主注册表）；frontmatter 三段（description 发现 / handoffs 声明式阶段衔接 / scripts 多平台变体）；**注入=路径引用不内嵌**（setup 脚本输出 JSON 路径，agent 自读模板与 constitution）；占位符三类（$ARGUMENTS / {SCRIPT} / 命令 id 宏）。

**模式采纳清单**（对照我们的设计）：

| 模式 | 我们的落点 | 状态 |
|---|---|---|
| 一份正典 + 机械转译层 | 完全对齐 skill 层+adapter 方向（D20 最小足迹） | ✅ 已隐含，显式确认 |
| frontmatter handoffs（声明式阶段衔接） | 建议流程的阶段图写成 frontmatter 数据，skill 互引不靠正文说教 | 🟡 建议采纳 |
| 注入=路径引用 + 自读 | 完全对齐「skill 薄身 + CLI 速查」（D19②）——规约不进 skill 正文，`specp rules`/读 vendored 语料 | ✅ 已隐含 |
| Scope Guard（每 skill 开头声明只许动什么） | 采纳——每件 skill 显式边界 + 越界意图列入 deferred | 🟡 建议采纳 |
| gate 只读化（扫描-报告-先问-禁改） | 对齐 sensor 判定不改被执行物（D17） | ✅ 已隐含 |
| 状态语义写进正文（谁有权打勾、代表什么） | 对齐 sensor 判定规约——闭合语义=全 sensor PASS 写进 skill | ✅ 已隐含 |
| 共享段落下沉引用文件 | 采纳——规避 speckit 单件 10-22KB 膨胀病（钩子段重复粘贴） | 🟡 建议采纳 |
| 互引语法 | speckit 用转译期宏；我们残废态（无 CLI）需兜底——**skill 互引用稳定名称而非宿主调用语法** | 🟡 待设计 |
| `[NEEDS CLARIFICATION]` 式标记协议 | 可采纳进 spec 模板（未知项机器可识别） | 🟡 备选 |

**OpenSpec delta spec 流派的评估**：OpenSpec 用 `changes/` 文件夹写 ADDED/MODIFIED/REMOVED 增量、归档时合并回真相 spec。**我们大概率不需要这套机制**——我们的 spec 在 git 仓内、task commit 直改 spec 于 feature 分支、MR 合入才进主线：**git 分支本身就是 delta 容器，MR diff 即 spec delta，天然可审阅**。OpenSpec 需要 changes/ 是因为它的归档合并不走 git。备记录，不采纳（除非未来出现非 git 目标的 spec 管理）。

**Kiro 双入口**（Requirements-First / Design-First）：注记录——我们的建议流程目前只走 spec 先行；Issue 快速路径已是事实上的第二入口。暂不扩展。



## 五、待确认点 / 行动项

1. ~~【行动项·调研】既有 spec skill 结构学习~~ ✅ 已完成（报告 `drafts/spec-skill-survey.md`，模式采纳清单见 4.11）
2. ~~4.11 采纳清单四个 🟡 项~~ ✅ 已确认采纳（2026-10-13）
3. ~~skill 定稿 v1 review（R1-R6）~~ ✅ 全部闭环（2026-10-13：合一+意图粒度原则 / 总纲保留 / handoffs 暂缓 / sense 被动确认 / shared 无异议 / **A 仓收拢单仓模式 D26**）

## 六、后续讨论路线图

1. ~~工件集定义~~（D1-D26 已定）
2. ~~spec-anchored 细化~~ / ~~状态机终局~~ / ~~CLI 命令面~~ / ~~role 命运与 skill 切分~~ / ~~spec skill 调研~~ / ~~skill 定稿 review~~（已收）
3. **下一步两候选**（待用户选）：
   a. **A/B 仓修订策略**：宪章 v6（含 v5 判例回摆）、06 卷重写、模板刷新、07/08 卷废除、02-05 卷建议流程化、B 仓退役节奏与资产迁移清单（D26 收拢后的新格局）
   b. **skill 正文开写**：按定稿草案撰写 7 件 SKILL.md 正文 + shared/ 四件（写作执行活，可边写边审）
4. （衔接 topic2）Pi 能力面详谈 → 反向约束 skill/CLI 边界与 sensor 通道设计
