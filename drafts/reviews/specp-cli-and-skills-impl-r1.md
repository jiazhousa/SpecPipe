# 审查报告: specp-cli-and-skills（impl + tasks 统筹质量核查）— Revision 1

> - 审查类型：impl 级 sensor（推断型判定）
> - 判定对象：`specs/specp-cli-and-skills/` 之 spec.md / impl.md / tasks/T01〜T08.md（worktree `/home/starlex/project/specpipe`，v3-drafts@af37758）
> - 基准材料：01-principles / 02-process / 03-artifacts / 04-control / 05-cli / 06-charter（§5 impl 判定清单、J1-J5、R13-R17）/ 07-environment
> - 日期：2026-10-14｜性质：判定附件（引用路径应入工件判定节，见问题 12）
> - 落盘说明：checker 会话写权限不含 specpipe 仓内路径（V2 权限引擎），本报告先落 `~/doc/.specpipe/reviews/`，请 Oracle 迁移至 `specpipe/drafts/reviews/specp-cli-and-skills-impl-r1.md`

## 总体评价

**不通过（REJECT）**。统筹框架完整（结构齐全、DAG/链推导正确、引用类事实经核查均为真），但存在 1 个 critical 覆盖缺口（`specp coldstart` 用途无承载 task）与 1 个 high 级自检闭合循环问题（T08 判定写入与 `check all` 全绿互为前提），另有 3 个 medium、7 个 low，须修订后复审。

## 质量评分

**34 / 100**

| 档位 | 数量 | 扣分 |
|---|---|---|
| critical | 1 | −25（问题 1） |
| high | 1 | −12（问题 2） |
| medium | 3 | −15（问题 3/4/5） |
| low | 7 | −14（问题 6-12） |
| **合计** | 12 | **−66** |

## 审查方法（可复核）

只读审查，对被审对象零修改（J4）。实际核查动作：①B 仓 `~/project/opencodepipe/configs/review-rules/` 目录清点（21 件，含 system_rules.json，与 T03 陈述及 sensor 口径一致）；②B 仓 `cli/index.ts` 核实「手写路由先例」（命令表 + argv 解析 + 退出码 0/1/2，无框架，成立）；③`drafts/specpipe-v3-skills.md`（七件 + shared 四件）与 `drafts/specpipe-v3-discussion.md`（D27-D34，D33/D34 已落账于 af37758）逐条核对；④`templates/` 九件与 `README.md` / `drafts/TODO.md` 现状核对；⑤git 历史核对（8b9603a spec / af37758 impl+tasks）。

## 逐项检查结论（J1：不缺项不合并）

| # | 检查项 | 结论 | 关联 |
|---|---|---|---|
| 1 | 术语一致性（impl/task 对 spec 与卷） | ⚠ 基本一致，3 处微漂移 | 问题 9 |
| 2 | 范围对齐（对 spec 的覆盖与越界） | ✗ 覆盖有 1 处缺口；无越界 | 问题 1、4 |
| 3 | 改动点核查（路径/引用真实存在） | ⚠ 绝大多数为真，2 处表述与现状不符 | 问题 10、11 |
| 4 | 隐藏依赖 | ⚠ 主要依赖已声明；HITL 口径 2 处待收紧 | 问题 8 |
| 5 | 风险与处理 | ✓ 三项风险均有兜底；唯自检时序风险未覆盖 | 问题 2 |
| 6 | 回归面 | ✓ 纯新增 + 文档改动，无存量代码影响 | — |
| 7 | S(impl) 结构项（五节） | ✓ 齐全（元信息+spec 引用 / 技术方案 / 任务切分 / 涉改文件总清单 / 收尾清单） | — |
| 8 | R9 分层单源 | ✓ task 引 impl 节、spec 条目，无实质转录 | — |
| 9 | R10 链间不相交 / 链与连通一致 | ✓ 单链推导正确（见特别关注②） | — |
| 10 | R11 涉改总清单 = 各 task 文件集并集（含 spec 改动点） | ✗ 不通过 | 问题 3 |
| 11 | R12 发布顺序/兼容窗口/回滚/存量 | ✓ 无触发项；B 仓拷贝来源已声明冻结 | — |
| 12 | R13 guides 必含 spec 锚点（条目级） | ✗ 4/8 task 缺失 | 问题 5 |
| 13 | R14 sensors 类型 + 载体 | ✓ 8/8 task 全数标注（计算型（CLI）/推断型（sidecar 会话）） | — |
| 14 | R15 计算型 sensor 可直接执行 | ⚠ 基本通过，T07 一处例外 | 问题 8 |
| 15 | R16 依赖声明合法 | ✓ 引用存在、全图无环、单链声明一致 | — |
| 16 | R17 一 task 一 commit | ✓ 依 07 全局纪律 + T04 校验承载，未见冲突表述 | — |
| 17 | J5 判定落盘 | ✗ spec/impl 落盘位缺失 | 问题 12 |

**正向核实（抽查为真的事实）**：spec/impl 结构对 03-artifacts 结构表齐全；8 件 task 五节结构齐全且判定节带「（执行后回填）」；review-rules 源路径 21 件属实；手写路由先例属实；`~/project/minimal-crm` 为未占用新路径；T01/T03/T07/T08 各有 spec 条目锚点（G1 / S3 / 验收标准 3+决策记录 / 验收标准 1-4）；T03 的 `ls | wc -l` = 21 口径与源目录一致。

## 特别关注结论（任务书 ①-⑤）

**① task 的 guides/sensors 是否符合 03-artifacts 泛化 schema**：基本符合。sensors 全部标注类型与载体（R14 通过），验收口径总体可执行（如「21 件」「退出码 1 且指出具体违规」「缺失章节名」均可机械核验）；guides 均带 type 标注。例外与缺口：T07 sensor1 含 CLI 不可判定项（问题 8）；R13 条目级锚点在 4 件 task 缺失（问题 5）。

**② DAG 与链划分声明一致性**：一致。全图连通性经 T07（依赖 T03/T04/T06）与 T01→T02→T04、T01→T03、T05→T06 汇聚于 T07→T08，推导为单链（chain: c1）正确；impl 所列执行序 T01→T02→{T03,T04}→T05→T06→T07→T08 为合法拓扑序。唯一提醒：T04 正夹具隐含 T03 先于 T04 判定（问题 6）。

**③ spec 验收标准与 tasks sensors 的覆盖**：三 sensor 均有承载 task——sensor2→T06、sensor3→T08、sensor1→T08（T01/T02/T04 有分段 smoke）；验收标准 1→T08 sensor1、2→T06 sensor2、3→T07/T08、4→T08 第三 sensor。**但 sensor1 全量与 T07 均依赖 `specp coldstart` 产物，而该能力无任何 task 承载（问题 1）——承载存在、产出链断裂**。

**④ 隐藏依赖与 HITL 卡点**：pi provider/auth 依赖链完整——spec 决策记录（「pi 侧 provider 配置与 auth 由用户完成」）+ T07 guide（「HITL 前置依赖……方可启动」）+ T07 sensor（检查「pi 配置就绪」）三层声明，软门槛下「未就绪则 task 不闭合、阻塞可见」成立。残留：就绪判定无具体验证命令、pi 安装/PATH 前置未列（问题 8）；模型 id 未证已由 T05 承接（合规）；Node 依赖（S1）与非 git 降级已声明。

**⑤ 自检循环依赖（重点判定）**：分三段，结论不一——
- **T02 正夹具（本 Story spec.md/impl.md）不构成循环**：spec/impl 级 check 只验必填章节/行数/引用/切分清单，不涉判定节与闭合差集；两文件已提交且结构当前即合规（目标/非目标为合并节，已由 T02 白名单说明覆盖），T02 可正常通过。
- **T04 正夹具需明确口径**：其 sensor 写「正夹具=tasks/T01-T03 已判定后全绿」——若按 `check all`/整目录口径，T04-T08 判定缺口使其恒红；须口径化为「仅对 T01-T03 跑」（问题 6）。
- **T08 存在真实的自指循环（high）**：T08 第三 sensor 的验收口径是「本 Story 自身工件 `specp check all` 全绿」，而 push 闭合检查要求「spec 下全部 task 闭合」——含 T08 自身全部 sensor 判定与 commit 对应。于是：先验证后写入不可能（写入前 T08 未闭合，check 必红）；只能「先写入后复核」，且该次 PASS 的成立性由判定本身参与构成（自证）。这不是逻辑矛盾（判定节只记最终结论，写后复跑全绿是可重放的不动点），但**作为字面验收口径，在「先验证后判定」纪律下不可满足**；无协议时执行者要么卡住、要么写出未经前置验证的 PASS。修订方向见问题 2。

## 问题清单（J2 定位 / J3 修订方向）

### 1 [critical] `specp coldstart` 用途无承载 task（G1/AC1/AC3 依赖断裂）

- 定位：`spec.md` G1「specp CLI 三用途可用（冷启动 / 规则速查 / 工件合规检查）」与验收标准 1「三用途子命令 smoke 全部通过」；`impl.md` CLI 节已定义「`specp coldstart [dir]`：脚手架…+ 项目事实盘点 JSON」；`tasks/T07` sensor「`specp coldstart` 产物存在」；但 `tasks/T01`（CLI 骨架）涉改文件集仅 `cli/specp.mjs、cli/commands/rules.mjs、cli/lib/corpus.mjs、cli/README.md`，sensors 只测 `--help`/`rules`/退出码——**T01-T08 无任何 task 实现 coldstart 命令**（T06 中出现的 "coldstart" 是 skill 名 `spec-coldstart`，非 CLI 命令）。
- 影响：按现状执行，T07 首条 sensor 无法通过（冷启动产物不存在），T08 sensor1「三用途 smoke 全量」无法通过；AC1/AC3 被阻塞。且该缺口不被任何自有 check 覆盖（05-cli 跨级校验不检查 spec 目标↔task 覆盖），只能靠执行时暴露——正是本 sensor「防 task 返工级联」应拦截的 spec 覆盖完整性问题。
- 修订方向：将 `specp coldstart` 实现并入 T01（职责改「CLI 骨架（含 coldstart）+ rules 速查」，文件集加 `cli/commands/coldstart.mjs`、`cli/lib/facts.mjs`（拟）等，sensors 加 coldstart smoke：脚手架产物断言 + 事实盘点 JSON 字段断言）；或新立 T0x 并调整边界。同时在 impl 任务切分表同步。

### 2 [high] T08 自检闭合循环：判定写入与「check all 全绿」互为前提

- 定位：`tasks/T08` sensor「本 Story 自身工件 `specp check all` 全绿（dogfood 自检，验收标准 4）」；`impl.md` check 节「all/跨级：…全 task 闭合（push 闭合检查）」；04-control「push 闭合检查…核验 spec 下挂载的全部 task 均已闭合」；spec 验收标准 4 同构。另存在同族效应：check 的「一 task 一 commit 对应」要求 T08 自身 commit 先于最终全绿。
- 影响：见特别关注⑤第三段。字面口径下无法「先验证后判定」；严格纪律的执行者会卡住，宽松执行者会写下未经前置验证的 PASS（自证），两种情况都损害 dogfood 演示效力。
- 修订方向（二选一，均写回文档）：①两步协议写入 T08 统筹要点/impl 收尾清单——先跑 `check all` 记录差集恰为「T08 自身判定/commit」一项，补写判定并 commit 后复跑，差集空即验收证据（留运行记录）；②check 增加显式排除语义（如 `specp check all` 对当前 task 提供 `--exclude T08` 或等价），T08 sensor 文本随之为「除 T08 自身外的全量闭合 + 判定补全后终态复核全绿」。建议同时补充「判定写入后复跑」为收敛阶段标准动作。

### 3 [medium] 涉改总清单 ≠ 各 task 文件集并集（R11）

- 定位：`impl.md` 涉改文件总清单「新增：…`specs/specp-cli-and-skills/{impl.md, tasks/T01-T08.md 及其判定}`；修改：`README.md`…」——对照 task 文件集并集，缺 **`specs/…/pi-research.md`（T05 范围）、`specs/…/dispatch-record.md`（T07 范围）、`specs/…/acceptance.md`（T08 范围）、`AGENTS.md`（T08 范围）**；反向，`impl.md` 自身列入总清单但不属任何 task 范围（spec.md 亦未列入，与「含 spec 文件改动点」的核对关系未明）；另「fence：…CLI smoke 脚本」「T04 sensor：fixtures 冒烟脚本」所述脚本载体未入任何文件集与总清单。
- 影响：直接违反 R11；若后续按 05-cli 跨级项「涉改文件 ∈ task 范围」实现校验（问题 7），本 Story 自检将红——与 dogfood 目标冲突。
- 修订方向：补齐四个文件进总清单（并注明 impl.md/spec.md 属统筹阶段产出、非 task 集项的处理口径）；明确 smoke/冒烟脚本的载体（独立文件入某 task 文件集，或改为文档化命令清单）；同步 04 处文字。

### 4 [medium] `templates/` 与七卷不同步，且 coldstart「spec 骨架」来源未定义

- 定位：`impl.md` coldstart「脚手架（`specs/` 目录 + spec 骨架 + AGENTS.md 提示）」未说骨架来源；05-cli 用途①含「模板实例化」；而 `templates/` 九件为 v2 旧制——`templates/spec-template.md` 头部「草案（S-S3，≤100 行）→ 终稿（S-S4 澄清后）」并引「06-artifacts.md」（现为 03-artifacts/06-charter），结构无元信息/三要素/决策记录；无 task 模板；`review-*` 五件对应已裁撤的审查报告工件类（03-artifacts：独立审查报告「不再是标准工件类」）。06-charter §8 要求「修改宪章时必须同步：模板、skill 条款对齐、CLI 检查项对齐」；讨论稿基线亦记「模板刷新 pending specp-cli Story」。
- 影响：若执行者顺手沿用 templates/ 产出 spec 骨架，minimal-crm 工件链将不通过 check（v3 结构校验），T07/T08 返工；宪章 §8 同步义务悬空未处置。
- 修订方向：二选一并落文——①本 Story 增收「templates 刷新」task（spec/impl/task 三件 v3 化 + 清 review-* 五件）；②在 spec 非目标/impl 中显式声明「templates 刷新归后续修订轮，本 Story coldstart 骨架内建 v3 结构（不读 templates/）」，coldstart 文件内注明骨架以 03-artifacts 结构表为准。

### 5 [medium] R13：T02/T04/T05/T06 的 guides 缺 Story spec 条目级锚点

- 定位：R13「guides 必含 spec 锚点（条目级引用）」；对照——T01「spec G1+05-cli」✓、T03「spec S3 兼容方案」✓、T07「spec 验收标准 3+决策记录」✓、T08「spec 验收标准 1-4」✓；而 **T02** guides 仅「03-artifacts…+06-charter §2/§3」、**T04** 仅「03-artifacts…+06-charter §4/§5 + D32」、**T05** 仅「采证问题清单（见 sensors）+只读采证说明」、**T06** 仅「drafts/specpipe-v3-skills.md+02-process」——均无 spec.md 条目引用。
- 影响：违反 R13；且与 T04 将实现的 check 项「guides 含 spec 锚点」及反夹具（「task-bad.md 缺锚点」）耦合：若匹配规则取「条目级模式」（忠实 R13），本 Story 自身 T02（含在 T04 正夹具 T01-T03 内）即红，T04 阻塞；若取宽松字符串存在性，则校验无实效。
- 修订方向：为四件各补一条 spec 锚点（建议：T02→G1+验收标准 1；T04→G1+验收标准 1/4；T05→副作用 S2+决策记录；T06→G2+验收标准 2）；并在 T02/T04 统筹要点写明 check 的锚点匹配规则（白名单/正则，含宽松边界），使校验语义独立于「迁就现状」的循环。

### 6 [low] T04 正夹具口径与 T03/T04 顺序需明示

- 定位：`tasks/T04` sensor「正夹具=tasks/T01-T03 已判定后全绿」；`impl.md`「执行顺序 T01→T02→{T03,T04}→…（链内依赖满足即可）」。
- 影响：夹具若按整目录/`check all` 口径运行，T04-T08 判定空缺将使其恒红；且夹具隐含 T03 须先于 T04 判定，与 {T03,T04} 并列表述不一致，执行者可能先做 T04 而卡在夹具。
- 修订方向：sensor 文本明确「仅对 T01-T03 运行（如 `specp check task` 指定这三件）」；执行序展开为「T01→T02→T03→T04→…」或在 T04 统筹要点注明「前置：T03 判定已回填」。

### 7 [low] 05-cli 跨级校验项「spec 锚定完整性（涉改文件 ∈ task 范围）」未纳入 check 清单

- 定位：05-cli 用途③跨级行「依赖图健康、spec 锚定完整性（涉改文件 ∈ task 范围）、push 闭合检查」；`impl.md` check 节 all/跨级仅「DAG 校验…、全 task 闭合」（依赖图与闭合在，锚定完整性缺）。
- 影响：CLI 契约覆盖缺一项；该缺失恰好掩盖了问题 3 的总清单失配。
- 修订方向：T04 补实现该项（校验方向：总清单 ⊆ 各 task 范围并集，双向或单向按 03-artifacts/R11 语义定）；先按问题 3 修复数据侧，否则自检红。或在 spec/impl 明示该项延后及理由。

### 8 [low] HITL 相关验收口径两处待收紧

- 定位：①`tasks/T07` sensor「sandbox 初始化检查——`specp coldstart` 产物存在、pi 配置就绪（用户 auth 完成）、skill 加载确认 | type: 计算型（CLI）」——「pi 配置就绪（用户 auth 完成）」非 specp CLI 可判定项，未给验证命令（R15 存疑）；且 pi 本地安装/PATH 未被任何 guide 列为前置（T05 直接假设 `pi --help` 可执行）。②`tasks/T08` 清单含「分级确认痕迹」，而 01-principles 明确「卡点不落痕迹，不记录、不可推导」；宜明确其复查口径为会话记录（T07 sensor 已有「会话记录可复查卡点」表述）。
- 影响：卡点就绪与痕迹复查的可验证性含混，弱化 ④ 项「流程上有卡点保障」的落点。
- 修订方向：①T07 sensor 该分项改为可执行验证命令（如「以最小 pi 调用冒烟（`pi -p` 或等价）验证 provider/auth 就绪」），或在 guide 中补「pi 安装与 PATH 前置（未就绪即停）」；②T08 清单改「分级确认与放行过程经会话记录可复查（工件侧不落痕，符合 01-principles）」。

### 9 [low] 归一消费与术语微漂移（三处）

- 定位：①技能命名——impl「skill 清单按定稿 v1 七件（workflow/write/plan/task/sense/converge/coldstart）」，草案为 `spec-workflow`…`spec-coldstart`（spec- 前缀），前缀去留未见决策记录；②草案 §5.6 引「`specp check story`」，impl 命令面无 story 子命令（对应语义为 all/闭合检查），T06「按归一修正消费」未列具体修正点清单；③impl 任务切分表 T05 行「（…/-p 与 rpc/sidecar 调用形态）」的 "rpc" 未见于 T05 六问。
- 影响：T06 撰写正文时依赖泛说明「按归一修正」，存在把草案残留（含 D31 已推翻的「残废态」措辞）带入 skill 的风险。
- 修订方向：在 T06 统筹要点或 guide 附「归一修正点清单」（命名前缀决策、命令面替换对照、残废态措辞删除）；修正 impl T05 行与六问一致。

### 10 [low] README 表述与现状不符（改动点核查）

- 定位：impl 总清单「`README.md`（skills/cli 行转实现态）」——README 卷导览**无 `cli/` 行**（需新增，非「转」）；T03 范围「README 卷导览 review-rules 行转实现态」——该行现为「审查规则语料（语言级规则）」**无「规划中」标记**可转。
- 影响：轻量表述失准，执行时易漏（README cli 行可能无人认领，虽可并入 T08 收尾）。
- 修订方向：改为「新增 cli/ 行 + skills/ 行去『（规划中）』+ review-rules 行措辞对齐实现态」；在 T03/T06/T08 间明确 root README 各行的归属。

### 11 [low] 决策链引用滞后（D33/D34 已落账）

- 定位：`spec.md` 元信息「决策链引用：drafts/specpipe-v3-discussion.md（D1-D32）」——D33/D34 已于 af37758 落账；impl「修改：…drafts/specpipe-v3-discussion.md（D33/D34）」与收尾「决策链 D33/D34 补记」在该既成事实下表述滞后。
- 影响：引用范围失真；收尾清单「补记」将误导执行者以为未完成。
- 修订方向：spec 元信息改「D1-D34」；impl 相应措辞改为「已随本 Story 落账（af37758）」并从收尾清单移除或标注已完成。

### 12 [low] spec/impl 判定节落盘位缺失（J5）

- 定位：J5「判定落盘：最终结论写入工件判定节（逐条对应声明的 sensors）；独立报告仅作附件（引用路径）」；`spec.md` 有「sensors（spec 级挂载）」但无「sensor 判定」节；`impl.md` 无 sensors 声明亦无判定节；T08 范围只排「tasks/T01-T08 判定补全」，spec/impl 判定不在任何范围；本报告（impl 级 sensor 结论）因此无落盘位。
- 影响：首个 dogfood 实例未展示 spec/impl 级的判定落盘形态；sensor 结论仅存于 drafts/reviews 附件，追溯链弱。
- 修订方向：impl.md 补「sensors（impl 级挂载）」与「sensor 判定」节（回填本报告路径与结论）；spec.md 补「sensor 判定」节（spec 级 sensor 判定结论）；T08 范围可加「spec/impl 判定节回填」；或明示采用「判定仅落附件」的简化口径并记录理由。

## 结论

# REJECT

修订方向已随各问题给出（J3）。建议修订后 r2 复审，重点复核：F1 coldstart 任务归属、F2 自检协议拍板、F3/F4/F5 三项与自检 red 耦合的修订、F12 判定落盘位。本报告为判定附件，引用路径应在修订时写入 impl 判定节。

状态：不适用（v3 工件制无状态文件；进度由工件推导）
