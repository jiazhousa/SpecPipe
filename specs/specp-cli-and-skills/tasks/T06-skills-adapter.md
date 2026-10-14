# T06: skills 薄适配层 + pi 加载验证

## 元信息
- depends_on: [T05]
- chain: c1
- 分支/执行者: v3-drafts / 主会话统筹派发

## 范围
- 涉改文件集：`skills/`（七件 SKILL.md：workflow/write/plan/task/sense/converge/coldstart——Agent Skills standard 形态）、`package.json`（pi 键→skills 目录）、README skills/ 行转实现态、`05-cli.md`（用途①盘点项对齐实现——「模块清单」移除，M2 三方对齐）
- 统筹要点：impl「skills」节——薄适配：frontmatter（name/description）+ 意图执行指导 + 卷引用；正文永不复制卷内容（D27）

## guides（前馈）
- guide: spec G2/AC2 + drafts/specpipe-v3-skills.md 定稿 v1 的七件职责与章节骨架（按归一修正消费）+ 02-process 各路径 | type: 计算型（机械引用）
- guide: skill 正文写意图执行指导（祈使句/Scope Guard/CLI 协作点），规约细节一律「specp rules <主题>」或卷引用；sensor 调用指导写明 sidecar 渠道（shell 起 pi 会话，模型家族建议）。**归一修正点清单**：①卷为唯一正文源，skill 不复制卷内容 ②定稿草案的 shared/ 四件不再独立——sensor-protocol→04 卷已含、cli-reference→05 卷已含、artifact-spec→03 卷已含、hitl-checkpoints→02 卷已含，skill 内以卷引用替代 ③handoffs 不做（R3 决议），互引用稳定名称 | type: 推断型（统筹撰写）

## sensors（反馈）
- sensor: **验收 sensor2**——skill 结构合规（frontmatter 必填/卷引用路径存在）+ pi 加载验证（`pi list` 或采证确认的等价机制显示挂载）| type: 计算型（CLI）
- sensor: 每件 skill 的意图指导与卷内容一致（无复制、无矛盾）| type: 推断型（sidecar 会话）

## sensor 判定

- [计算型·验收 sensor2 前半] 七件 SKILL.md 结构合规（frontmatter name/description 必填、name=目录名且小写连字符、description ≤1024）+ 引用路径全部有效：**PASS**（2026-10-14 脚本核验）；**pi 实际加载验证移至 T07 注入时执行**（T07 sensor 含此项）
- [推断型] **r1 REJECT 79/100 → r2 PASS 98/100**（2026-10-14，sidecar 两轮；r1：3M（README 行/模块清单三方漂移/package.json 未入集）+3L；r2 六项全处置+sidecar 模型 id 更新为 deepseek-flash（catalog 更新连带）；残留 1 low=快照类文档旧口径，已按建议补 pi-research 注记收口）。sidecar 调度改进同期落地：任务书内联材料+精确锚点（checker 零探索零 deny）
