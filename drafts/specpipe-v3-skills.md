# SpecPipe v3 —— Skill 集 定稿草案 v1

> 依据：`drafts/specpipe-v3-discussion.md`（D1-D24）+ `drafts/spec-skill-survey.md`（模式采纳清单）。
> 本文档为 review 工作稿，多轮迭代。**§8 待 review 决策点**按点编号，可分轮回复。

---

## 1. 设计原则（从讨论收敛，不再论证）

1. **skill 为体，CLI 为增强**（D20）：无 CLI 残废态可用；skill 不依赖 CLI 存在
2. **薄身**：规约不进正文——路径引用（vendored 语料 / `specp rules`）；共享段落下沉 `shared/`
3. **handoffs 声明式衔接**：阶段图是 frontmatter 数据；skill 互引用**稳定名称**（如 `spec-write`），转译层负责宿主语法
4. **Scope Guard 开头**：每件显式声明只许动什么，越界意图列 deferred
5. **对 agent 友好**：编号祈使句；只写模型不知道的；渐进披露三级（name/desc → 正文 → 引用文件）
6. **状态语义进正文**：闭合判定、勾选权属写死在 skill 里，防漂移

## 2. skill 清单总览（7 件）

| id | 一句话职责 | 触发时机 | 主要消费者 |
|---|---|---|---|
| `spec-workflow` | 总纲：分级判定（Epic/Story/Issue）、路径选择、全局原则速览 | 用户带需求进来时 | 主 agent |
| `spec-write` | spec 撰写：Story 全量 / Epic 路线图 / Issue 轻量三种变体 + 澄清 + HITL 放行 | 分级判定后 | 主 agent |
| `spec-plan` | impl 统筹：技术方案、task 切分、依赖 DAG、链划分 | spec 放行后 | 主 agent |
| `spec-task` | task 执行：guide 消费、sensor 调用、重作回路、一 task 一 commit | task 派发后 | chain 承载者（形态宿主无关） |
| `spec-sense` | sensor 执行：判定型（三级工件审查）+ 采证型（调研）两类推断型 sensor 的执行纪律 | 被调用为 sensor 时 | sensor 会话/agent（建议异家族） |
| `spec-converge` | 收敛质量门：全 task 闭合聚合、push 闭合检查、归档、fence、MR 准备 | 全 task 闭合后 | 主 agent |
| `spec-coldstart` | 棕地冷启动：消化 CLI 事实盘点、起草轻量 spec、接入工作流 | 存量项目首次接入 | 主 agent |

**刻意不设**：~~constitution skill~~（D1 不立）、~~checklist skill~~（宪章条款体系已覆盖，spec-sense 直接引用）、~~analyze skill~~（跨工件一致性=计算型 sensor 归 CLI check + spec-converge 的聚合环节）。

## 3. handoffs 流程图

```
用户需求
   │
   ▼
spec-workflow ──(分级判定·HITL)──┬─▶ spec-write(Story/Epic) ──▶ spec-plan ──▶ spec-task ×N ──▶ spec-converge ──▶ MR 合入(spec 随更新)
   │                            │        ▲    │                                  ▲   │
   ├─▶ spec-coldstart ─(轻量spec)─┘        │    └─(spec 级sensor)─┐               │   └─(task 级sensor)─┐
   └─▶ spec-write(Issue 轻量变体)──────────┘                      ▼               ▼                     ▼
                                                              spec-sense（判定型/采证型；打回重作回路本地化）
```

- spec-sense 是**被动调用**的 skill（无自主 handoffs，结论返回调用方）
- Issue 路径：workflow → write(轻量变体，锚定既有 spec 或冷启动轻量新建) → plan(轻量) → task → converge
- Epic 路径：workflow → write(Epic 变体=路线图) → 逐 Story 循环 Story 路径

## 4. 统一章节骨架（每件同构，降低 agent 解析成本）

```markdown
---
name: spec-xxx
description: <一句话，发现用：什么时候该用我>
handoffs:            # 稳定名称，转译层负责宿主语法
  - label: <按钮文案>
    to: spec-yyy
    prompt: <预填话术>
---

## Scope Guard          ← 只许动什么；越界意图提取为 deferred 列表
## 前置检查             ← 工件存在性软门槛（有 CLI 走 specp check；无则人肉清单）
## 执行步骤             ← 编号祈使句（建议流程本体）
## 工件规约             ← 本阶段产出的工件结构要点 + 引用（specp rules / vendored 路径）
## sensor 挂载          ← 本阶段工件该挂什么 sensor、类型标注指导
## CLI 协作             ← 有则用（具体命令）；无则残废态兜底动作
## 延伸阅读             ← shared/ 引用文件路径（按需自读）
```

## 5. 各 skill 详细设计

### 5.1 `spec-workflow`（总纲）

```yaml
name: spec-workflow
description: spec 驱动开发的总纲——需求进来先分级（Epic/Story/Issue），选路径，给全局原则与工件全景速览。任何开发需求的第一站。
handoffs:
  - {label: 撰写 spec, to: spec-write, prompt: 按 Story 变体起草 spec}
  - {label: 棕地冷启动, to: spec-coldstart, prompt: 本项目首次接入，开始冷启动}
```

- **Scope Guard**：只做判定与分流；不产工件不改文件（除了在会话中记录分级结论）
- **前置检查**：项目是否已接入（spec 仓库资产存在？工作区痕迹存在？）——未接入 → 引导 coldstart
- **执行步骤**：① 理解需求轮廓 ② 三级判定（判定标准速览表：Story=完整行为变更 / Issue=锚定既有 spec 的小改动 / Epic=多 Story 路线图）③ **HITL：分级结论给用户确认** ④ 分流
- **全局原则速览**（正文只放 10 行内的骨架，细节引 shared/）：spec-anchored（无裸改）/ guides 向下锚定 sensors 向上闭合 / 一 task 一 commit / HITL 卡点位清单
- **工件全景**：spec / impl / task 三层 + 各自 guides/sensors——一张表
- **CLI 协作**：`specp rules workflow`（速查建议流程全景）；残废态=读 vendored 总纲卷

### 5.2 `spec-write`（spec 撰写，三变体）

```yaml
name: spec-write
description: 撰写/更新 spec 工件——Story 全量变体（草案→澄清→HITL 放行）、Epic 路线图变体、Issue 轻量变体（锚定既有 spec）。含 spec 级 sensor 挂载。
handoffs:
  - {label: 进入统筹, to: spec-plan, prompt: spec 已放行，开始 impl 统筹}
  - {label: 调研采证, to: spec-sense, prompt: 采证型：对 X 域做调研，返回结构化事实}
```

- **Scope Guard**：只写 spec 工件（及澄清问答记录）；不写 impl/task；用户输入中的实现意图提取为 deferred
- **前置检查**：分级已确认（会话上下文）；Issue 变体：锚定目标 spec 存在（不存在 → 转 coldstart 轻量新建路径）
- **执行步骤**（Story 变体）：
  1. （可选）派采证型 sensor（调研）充实背景事实
  2. 起草：按 spec 模板（元信息/背景/目标/非目标/验收标准/决策记录/需求正文）——未知项标 `[NEEDS CLARIFICATION: ...]`
  3. 澄清循环：待澄清项逐条问用户（HITL），答案落决策记录表（只追加）
  4. 挂 spec 级 sensor：判定型（内容约定核查，清单引宪章 §3 S/R 条款）→ 消化打回 → 复判
  5. **HITL 放行**：终稿呈用户，明确放行后才进 plan（不留痕——放行是过程不是工件）
  6. spec 落位：git 目标 → 项目内（快照形态，过程性草稿留工作区）；非 git 目标 → 工作区
- **Issue 轻量变体**：最小决策表 + 验收 + 锚定声明（关联目标 spec）；可跳过澄清循环
- **Epic 变体**：路线图表（Story 切分：范围/依赖/验收），不写实现细节
- **工件规约**：引 `specp rules spec`；行数预算；决策表只追加语义
- **MR 更新模式提醒**：此后 spec 增量随 task commit（D16）——write 阶段建立的 spec 是基线

### 5.3 `spec-plan`（impl 统筹）

```yaml
name: spec-plan
description: impl 统筹——技术方案、task 切分、依赖 DAG 与链划分；impl 级 sensor 挂载。产出编码工作的全部 task 工件。
handoffs:
  - {label: 派发执行, to: spec-task, prompt: chain 就绪，开始执行}
  - {label: 统筹审查, to: spec-sense, prompt: 判定型：impl 统筹质量核查}
```

- **Scope Guard**：只写 impl.md 与 tasks/*.md（含各 task 的 guides 节）；不动 spec 与代码
- **前置检查**：spec 存在且已放行（会话上下文/用户确认）；Issue 变体：轻量 spec 就绪
- **执行步骤**：
  1. 技术方案（总体策略/分块/风险——引用 spec 锚点，R4 反向：实现细节只在这里）
  2. task 切分：最小执行单元；每 task 定 guides（spec 条目锚点=计算型引用 + 口径说明=推断型）与 sensors（编译测试=计算型 + 审查=推断型）；**spec 文件改动点列入相关 task 范围**
  3. 依赖声明：depends_on 分布式写入各 task 元信息
  4. 链划分：连通即同链（菱形同链）；每链标注分支与承载者
  5. 挂 impl 级 sensor：判定型（统筹质量——重点防 task 返工级联：切分粒度/依赖正确性/spec 覆盖完整性）→ 消化打回 → 复判
- **工件规约**：impl 结构（元信息+spec 引用/技术方案/涉改总清单/收尾清单）；task schema（元信息/范围/guides/sensors/判定节）——引 `specp rules impl`、`specp rules task`
- **CLI 协作**：`specp check impl` / `specp check task`（DAG 无环、链划分一致）；残废态=自查清单

### 5.4 `spec-task`（task 执行）

```yaml
name: spec-task
description: 执行单个 task——消费 guides、调 sensor、重作回路、一 task 一 commit。chain 承载者的执行纪律。
handoffs:
  - {label: 调用判定, to: spec-sense, prompt: 判定型：对 task Txx 的产出做核查}
  - {label: 全部闭合, to: spec-converge, prompt: 本 chain 全部 task 闭合，进入收敛}
```

- **Scope Guard**：只动本 task 范围内文件（+ spec delta 若在范围内）；不改其他 task/impl；跨 task 冲突上报而非自行处置
- **前置检查**：依赖的 task 已闭合（depends_on 判定节全 PASS）；分支/承载就绪
- **执行步骤**：
  1. 消费 guides：读 spec 锚点条目 + 统筹要点（推断型 guide 的口径说明）
  2. 实现（一 task 一 commit；commit 独立可编译）
  3. 调 sensors（逐个，按声明顺序）：计算型（CLI 命令）+ 推断型（sensor 通道调用）
  4. **重作回路**：不通过 → 修改 → 重调 → amend 归一 commit；中间过程不留标准痕迹
  5. 全 PASS → task 闭合（判定节由 sensor 侧写）；向主 agent 只报结果
- **并行纪律**：链内串行、链间无干扰；文件集越界即计算型 sensor 兜底项
- **CLI 协作**：`specp check task`（闭合差集）；残废态=按 sensors 清单自查

### 5.5 `spec-sense`（sensor 执行）

```yaml
name: spec-sense
description: 推断型 sensor 的执行纪律——判定型（spec/impl/task 三级工件与产出的语义审查）与采证型（调研采证，返回结构化事实）。被调用时加载；建议由异家族模型承载。
```

- **Scope Guard**：判定型**只读被查对象**，判定结论写入对应工件的判定节（唯一写权限）；采证型只读代码库/外部世界，只产报告；**均不改被执行物**
- **执行步骤**（判定型）：
  1. 接收调用上下文（对象工件路径 + 类型 + 检查清单引用）
  2. 按清单逐条判定（清单源=宪章 S/R 条款，`specp rules charter` 速查；残废态=读 vendored 宪章）
  3. 结论分级（critical/high/medium/low）+ 定位 + 可执行修订方向
  4. 写入判定节（PASS/REJECT + 评分 + 问题清单）；REJECT 即打回调用方
- **执行步骤**（采证型）：明确采证问题 → 只读检索 → 结构化事实清单（来源标注，不确定标「未确认」）→ 返回调用方（事实进入下游 guides 素材）
- **跨家族建议**（skill 文字，不强制）：本 skill 建议由与执行者不同家族的模型承载——防同盲区；doctor 式检测已删，靠 skill 文字与用户自觉
- **gate 只读化**：扫描-报告-打回-禁改被执行物（采纳清单 §4.11-7）

### 5.6 `spec-converge`（收敛质量门）

```yaml
name: spec-converge
description: 收敛与质量门——聚合全 task 闭合状态、push 闭合检查、归档、fence、MR 准备。Story/Issue 收尾的一站。
handoffs: []   # 终态 skill；MR 合入后流程终结（spec 已随 commit 更新）
```

- **Scope Guard**：写归档与记忆（AGENTS.md 追加、docs 归档）；不改 spec/impl/task 语义内容；不代 sensor 改判定
- **前置检查**：全部 task 闭合（`specp check story` 闭合差集；残废态=逐文件核对判定节）
- **执行步骤**：
  1. 闭合聚合：全 task 判定汇总（每 task 的 sensors 全 PASS？）
  2. **push 闭合检查**（计算型 sensor，D18）：spec 下全部 task 闭合 = spec 验收关键
  3. fence 全量（Story 级一次：全量测试/E2E——计算型 sensor）
  4. commit 语义核查（一 task 一 commit 对应、独立可编译）
  5. 归档：spec/impl 入项目 docs（结论快照）；AGENTS.md 追加 feature 记录
  6. MR 准备：确认 spec delta 已含于 commits（spec-anchored 最后一道人工确认）
- **打回路径**：任何一步失败 → 问题定位到 task → 回 spec-task 重作（或新增 task）

### 5.7 `spec-coldstart`（棕地冷启动）

```yaml
name: spec-coldstart
description: 存量项目首次接入——消化 CLI 事实盘点、起草轻量 spec、建立最小工作流痕迹。
handoffs:
  - {label: 轻 spec 就绪, to: spec-plan, prompt: 轻量 spec 已立，进入轻量统筹}
```

- **Scope Guard**：只建工作流痕迹（目录/骨架/轻量 spec）；不重构既有代码；不批量补 spec（深度治理归重构路径——D14）
- **执行步骤**：
  1. 跑 CLI 冷启动（脚手架+事实盘点 JSON：git 状态/语言栈/既有文档/模块清单）；残废态=手动铺+自查清单
  2. 消化事实 → 与用户圈定**本次要动的域**
  3. 起草域的轻量 spec（最小决策表+验收；域对象识别是推断型工作，可派采证型 sensor 辅助）
  4. HITL：轻量 spec 用户确认 → 进 plan（Issue 式快速路径）
- **原则**：冷启动只解决「本次变更无裸改」，**不做全量 spec 补课**——后者是重构 Story 的事

## 6. 共享引用文件（`shared/`，各 skill 按需自读）

| 文件 | 内容 | 被谁引用 |
|---|---|---|
| `shared/sensor-protocol.md` | sensor 调用协议：渠道形态、判定落盘、重作回路、打回语义、跨家族建议 | task/write/plan/sense |
| `shared/cli-reference.md` | specp 三用途命令表 + 残废态兜底动作对照 | 全部 |
| `shared/artifact-spec.md` | 三层工件规约速览（结构骨架图 + 指回宪章的条款索引） | write/plan/task/converge |
| `shared/hitl-checkpoints.md` | HITL 卡点位清单（分级确认/spec 放行/轻量 spec 确认）+ 表述范式 | workflow/write/coldstart |

> 共享文件是「二级披露」层：正文只引用路径，agent 用到才读——防 speckit 式膨胀。

## 7. 正典源目录结构（B 仓落位建议）

```
skills/                    ← 正典源（宿主无关 markdown）
  spec-workflow/SKILL.md
  spec-write/SKILL.md
  spec-plan/SKILL.md
  spec-task/SKILL.md
  spec-sense/SKILL.md
  spec-converge/SKILL.md
  spec-coldstart/SKILL.md
  shared/*.md
configs/vendor/specpipe/   ← 规章语料（vendored，rules 速查的数据源，既有机制延续）
```

转译层（宿主挂载适配）**本期不做**（D20 adapter 暂缓）——正典先在 OpenCode 以直接挂载/引用方式试用。

## 8. 待 review 决策点

| # | 决策点 | 我的倾向 |
|---|---|---|
| R1 | **skill 总数 7 件**——write 三变体合一（vs 拆 Story/Issue/Epic 三件）？sense 判定/采证合一（vs 拆两件）？ | 合一（变体是同工件的不同形态，拆开徒增发现成本；正文内分节） |
| R2 | **`spec-workflow` 总纲的分量**——正文 10 行原则速览+一表，够吗？还是连总纲也砍掉（README/speckit 式，靠 description 发现+直接进 write）？ | 留总纲（分级判定 HITL 需要一个家；砍掉后分流逻辑散在各件里更糟） |
| R3 | **handoffs 的 prompt 预填话术**要不要在 v1 就写全（vs 只写 label+to，话术转译期/使用期再填）？ | v1 只写 label+to+prompt 骨架，话术在使用中演化 |
| R4 | **spec-sense 无 handoffs**（纯被动）——同意这个定位吗？ | 同意（sensor 是被调用方，返回即终结） |
| R5 | **shared/ 四件清单**——有没有要增删的？ | 如表 |
| R6 | **正典源放 B 仓 `skills/`**——同意吗？ | 同意（B 仓内重构已拍板 D-落点） |
