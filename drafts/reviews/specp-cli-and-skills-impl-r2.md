# 审查报告: specp-cli-and-skills（impl r2 复判）— Revision 2

> - 审查类型：impl 级 sensor（推断型判定，r1 REJECT 后复审）
> - 判定对象：`specs/specp-cli-and-skills/` 之 spec.md / impl.md / tasks/T01〜T09.md（worktree `/home/starlex/project/specpipe`，v3-drafts@e296475）
> - 基准材料：r1 报告 `drafts/reviews/specp-cli-and-skills-impl-r1.md`（12 项）；01-principles / 03-artifacts / 04-control / 05-cli / 06-charter / 07-environment；drafts（TODO.md / specpipe-v3-skills.md / specpipe-v3-discussion.md，含 D33/D34 落账核对）
> - 日期：2026-10-14｜性质：判定附件（最终结论应回填 impl.md / spec.md 判定节）
> - 落盘说明：checker 会话写权限不含 specpipe 仓内路径（V2 权限引擎，`drafts/reviews/` 写入被拒），本报告落于 `~/doc/.specpipe/reviews/specp-cli-and-skills-impl-r2.md`，请 Oracle 迁移至 `specpipe/drafts/reviews/specp-cli-and-skills-impl-r2.md`

## 总体评价

**通过（PASS）**。r2（e296475）对 r1 的 critical / high 实现实质闭环：coldstart 承载（T09 新增 + T01 补）与 T08 两步协议（解自指）均按修订方向落地；medium 层 #4 完全闭环（T09 templates v3 承接）、#3 / #5 主体闭环。修订未引入 critical/high 级新问题——T09 加入后的 DAG/链声明经重推全图一致（9 件 chain 均 c1、执行序为合法拓扑序），T01 合并 coldstart 后粒度合理。残余 9 项均为 low 级文档细节（详见问题清单）：其中 3 项实质未处置（#9 / #10 / #11）、4 项部分闭环（#3 / #5 / #8 / #12）、2 项为本轮新发现（T08 范围文本未随 T09 同步；spec 判定节「已补齐」断言失真）。按宪章 §6 判定口径（无未处置 critical/high、无致命 medium）判 PASS。

## 质量评分

**82 / 100**

| 档位 | 数量 | 扣分 |
|---|---|---|
| critical | 0 | 0 |
| high | 0 | 0 |
| medium | 0（残差已降 low 级） | 0 |
| low | 9 | −18（D1–D9） |
| **合计** | 9 | **−18** |

## 审查方法（可复核）

只读审查（J4），对被审对象零修改。实际核查动作：①e296475 全量 diff（impl/spec/9 件 task，11 文件逐 hunk 核）；②r1 12 项逐条对照最新文本回链定位（含 grep 复核：D33/D34 落账位置、README 卷导览各行现状、templates/ 现存九件、草案 skill 命名前缀、「specp check story」与「残废态」残留、T08 范围文本）；③T09 加入后 DAG 连通性/链划分/执行序重推；④R11 涉改总清单 ↔ 各 task 文件集并集逐项对账。
**正向核实（抽查为真）**：T09 已同步进 impl 任务表/链划分/总清单（T01-T09）/执行序；T01 coldstart 文件集（`cli/commands/coldstart.mjs`）+ sensor（临时目录骨架与 facts JSON）齐备；四缺项文件（pi-research / dispatch-record / acceptance / AGENTS.md）已入总清单；T02/T04/T05/T06 锚点已补；T04 夹具口径与「spec 锚定完整性」已入范围；r1 报告已迁入仓内 `drafts/reviews/`（impl 判定引用路径正确）；T09 三件模板结构对 03-artifacts 三工件结构表逐节相符。

## r1 12 项逐条复核（J1：不缺项不合并）

| # | r1 项（档位） | 复核实况 | 结论 |
|---|---|---|---|
| 1 | critical：coldstart 无承载 task | T09 新建（templates v3，depends_on=[]，chain c1）+ T01 揽入 coldstart（文件集 + sensor + 统筹要点「骨架引用 templates/（T09 产物）」）；impl 任务表/链划分/总清单同步 | **闭环** |
| 2 | high：T08 自指循环 | T08 guide 增两步协议（①全 task 判定落盘 → ②`specp check all` 复核；含「check 只核对已落盘判定 vs 声明差集」的语义论证）；impl 收尾清单挂协议引用 | **闭环**（注：协议未显式含 commit 步骤与运行记录留存字样，建议执行时自然覆盖） |
| 3 | medium：R11 总清单≠并集 | 四文件已入总清单 ✓；残差：spec.md 仍未列（R11「含 spec 文件改动点」字面未满足）、统筹产出「非 task 集项」口径未注明、smoke/冒烟脚本载体仍未定 | ◐ 部分闭环（残差 low，见 D1） |
| 4 | medium：templates 旧制 / coldstart 骨架无源 | 采 r1 处置①：T09 承接（三件 v3 模板 + 删旧九件 + 06-charter §8 依据 + 骨架来源声明）；结构对照 03-artifacts 逐节相符；README templates 行语义已一致 | **闭环** |
| 5 | medium：R13 四件缺锚点 | T02「G1/AC1/AC4」、T04「G1/AC1/AC4」、T05「G2/G3/AC3」、T06「G2/AC2」已补 ✓；残差：T02/T04 未写明 guides 锚点匹配规则（白名单/正则/宽松边界） | ◐ 部分闭环（残差 low，见 D2） |
| 6 | low：T04 夹具口径与顺序 | guide 明「正夹具=T01-T03 已完成且判定已落盘的 tasks（执行时序保证）」；执行序展开为 T09→T01→T02→T03→T04→…，顺序歧义消除 | **闭环** |
| 7 | low：锚定完整性未纳入 check | T04 标题/表格行/范围（`check-dag.mjs` 含「git diff 涉改文件 ∈ task 范围」）已补 | **闭环**（注：impl「all/跨级」命令行文案未随同更新，微瑕） |
| 8 | low：HITL 口径两处 | T07 guide 补验证口径「`pi auth print` 输出两 provider 就绪或配置文件核对」；sensor2 改「卡点复查载体=pi 会话记录——卡点本身不落工件痕迹，01-principles」；残差：T08 清单「分级确认痕迹」未改、pi 安装/PATH 前置未明列 | ◐ 部分闭环（残差 low，见 D3） |
| 9 | low：归一消费与术语漂移（三处） | T06 新增「归一修正点清单」但未覆盖指示三点（命名前缀决策 / 命令面替换对照 / 残废态措辞删除）；impl T05 行「-p 与 rpc」仍与六问不一致 | **未闭环**（见 D4） |
| 10 | low：README 表述与现状不符 | 仍为「skills/cli/templates/review-rules 行转实现态」；cli 行实为新增（README 无该行）、review-rules 行无「规划中」可转；cli 行归属未明 | **未闭环**（见 D5） |
| 11 | low：决策链引用滞后 | spec 元信息仍「（D1-D32）」（讨论稿实含 D33/D34，且同文件决策记录表已引 D33/D34）；收尾「决策链补记」仅去具体化未标注已完成/移除 | **未闭环**（见 D6） |
| 12 | low：判定落盘位（J5） | spec 判定节（含 sensors 声明）✓；impl 判定节 ✓ 但「sensors（impl 级挂载）」声明节仍缺（判定记录暂无可对应的声明） | ◐ 部分闭环（残差 low，见 D7） |

## 问题清单（残差 × 7 + 新发现 × 2；J2 定位 / J3 修订方向）

> D1–D7 为 r1 项残差，D8–D9 为本轮新发现；均按 low 档 −2/项 计分。

### D1 [low｜r1#3 残差] 总清单与脚本载体遗留

- 定位：impl.md 涉改总清单新增行仍缺 `spec.md` 条目；「impl.md、tasks/…」未注明属统筹阶段产出、非 task 集项的处理口径；收尾清单「CLI smoke 脚本（正反夹具全跑）」与 T04 sensor「fixtures 冒烟脚本」所述脚本载体仍未入任何 task 文件集，也未改述为文档化命令清单。
- 影响：R11「含 spec 文件改动点」字面未满足；与 T04 实现的「涉改文件 ∈ task 范围」用于 dogfood 自检时的解释空间仍存。
- 建议：总清单补 `spec.md` 并列明统筹产出（planning 期修改的 spec/impl/drafts 文档）在锚定完整性校验中的处理口径（如通过 commit 归属豁免或单列）；烟测脚本明确为独立文件并入 T04/T08 文件集，或改称「文档化命令清单」。

### D2 [low｜r1#5 残差] 锚点匹配规则未定义

- 定位：T02/T04 统筹要点与 guide 均未写明「guides 含 spec 锚点」的匹配规则（T02 的「标题白名单」仅面向 spec 章节匹配，非 task 锚点）。
- 影响：R13 校验语义未冻结，T04 反夹具「task-bad.md 缺锚点」的判定阈值无依据，「校验语义独立于迁就现状」的意图未达成。
- 建议：T04 guide 写明匹配规则（建议条目级模式：`spec [A-Z]\d+` / `验收标准 \d` / `副作用 S\d` + 变体白名单，宽松边界显式声明）。

### D3 [low｜r1#8 残差] HITL 复查口径与 pi 前置

- 定位：T08 guide sensor3 清单首项仍为「分级确认痕迹」（与 01-principles「卡点不落痕迹」的措辞张力未消；r1 建议的改句未采用）；T05/T07 guide 未列「pi 已在 PATH（未就绪即停）」前置（T05 采证直接假设 `pi --help` 可执行）。
- 影响：T08 侧复查语义仍含混；pi 环境前提未显式化。
- 建议：T08 清单改「分级确认与放行过程经会话记录可复查（工件侧不落痕，符合 01-principles）」；T05/T07 guide 补 pi 安装/PATH 前置。另注：`pi auth print` 命令形式待 T05 采证确认。

### D4 [low｜r1#9 未闭环] 归一修正点清单未覆盖指示三点

- 定位：T06 guide 清单（①卷唯一源 / ②shared 四件归并 / ③handoffs）未含——命名前缀决策（草案通篇 `spec-workflow`…`spec-coldstart` 前缀 vs impl/TODO/说明的无前缀「workflow/write/…」，决策记录仍缺）；命令面替换对照（草案引「`specp check story`」，impl 命令面无 story 子命令，需映射 all/闭合检查）；残废态措辞删除（D31 已推翻 D20 降级原则，草案 §2/§5 多处「残废态」表述仍在）。另 impl 任务表 T05 行「-p 与 rpc」与 T05 六问不一致（六问无 rpc 项）。
- 影响：T06 撰写正文仍存在把草案残留（尤其与 D31 冲突的「残废态」表述）带入 skill 的风险。
- 建议：清单补上述三点；impl T05 行改「-p 非交互 / sidecar 调用形态」与六问对齐。

### D5 [low｜r1#10 未闭环] README 表述与归属未修

- 定位：impl 总清单「`README.md`（skills/cli/templates/review-rules 行转实现态）」与 T03 范围「review-rules 行转实现态」维持原措辞；README 卷导览现状：无 `cli/` 行（需新增）、`review-rules/` 行无「规划中」标记、`skills/` 行含「（规划中）」（可从转）。
- 影响：表述失准，cli 行新增可能无人认领。
- 建议：改「新增 cli/ 行 + skills/ 行去『（规划中）』+ templates/review-rules 行措辞对齐实现态」，并明确 cli 行归属（T08 收尾或 T01 均可）。

### D6 [low｜r1#11 未闭环] 决策链引用未更新

- 定位：spec.md 元信息仍「决策链引用：drafts/specpipe-v3-discussion.md（D1-D32）」——讨论稿已含 D33/D34（其 L62-63），且同文件决策记录表来源栏已引 D33/D34。
- 影响：引用范围失真（r1 指定的一行修改未执行）。
- 建议：改「（D1-D34）」。

### D7 [low｜r1#12 残差] impl sensors 声明节仍缺

- 定位：impl.md 已建「sensor 判定」节 ✓，但无「sensors（impl 级挂载）」声明节（03-artifacts 泛化 schema 与 J5「逐条对应声明的 sensors」要求判定对应声明）。
- 影响：impl 级判定与声明的对应关系不完整（本报告结论亦无落盘声明可对应）。
- 建议：补声明（如「统筹质量核查｜type: 推断型（sidecar 会话）｜验收口径：impl 判定清单 J1-J5 + R9-R12」），并将本报告路径与结论回填判定节。

### D8 [low｜新发现①] T08 范围文本未随 T09 同步

- 定位：T08 范围「tasks/T01-T08 判定补全」——T09 加入后枚举未更新（对照 impl 总清单已改「tasks/T01-T09.md 及其判定」）。
- 影响：T09 判定回填的承载表述不一致（各 task 自回填惯例可兜底，但文本自相矛盾）。
- 建议：改「tasks/T01-T09 判定补全」或改述为「全部 task 判定补全」。

### D9 [low｜新发现②] spec 判定节断言失真

- 定位：spec.md「sensor 判定」节称「两 low（决策链 D 号引用、判定节缺）已随 r2 修订补齐」——其中「判定节缺」属实已补，但「决策链 D 号引用」实未补齐（见 D6）。
- 影响：J5 工件（判定节）出现与事实不符的断言，dogfood 场景下尤应注意记录准确性。
- 建议：随 D6 修订同步更正该句（如改「判定节已补；决策链引用随本轮修订补正」）。

## 特别关注（任务书两点）

**① T09 加入后的 DAG/链声明一致性**：一致。全图经 T07 连通（T09→T01→{T02→T04, T03}、T05→T06、{T03,T04,T06}→T07→T08），9 件 task chain 均为 c1；执行序 T09→T01→T02→T03→T04→T05→T06→T07→T08 为合法拓扑序（T05 可与 T01-T04 段交错成立）；impl 链划分句与任务表均同步。唯一瑕疵为 T08 范围枚举文本（D8）。

**② T01 范围膨胀后的粒度合理性**：合理。T01=骨架+coldstart+rules 三合一仍为单 commit 单元；文件集 5 件（specp.mjs / commands/{coldstart,rules}.mjs / lib/corpus.mjs / cli/README.md）与 sensors（骨架+命令面 smoke / 退出码 / coldstart 产物）覆盖完整，与 r1 建议的「并入 T01」方向一致，无需再拆。

## 结论

# PASS

**状态**：不适用（v3 工件制无状态文件；进度由工件推导）。建议：本报告结论回填 impl.md / spec.md 判定节（含 D7 声明节补充）；D1–D9 建议随执行期顺手修订（D6/D8 为一行级改动；D4 建议于 T06 执行前置补齐）。
