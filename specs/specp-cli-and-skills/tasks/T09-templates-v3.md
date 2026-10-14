# T09: templates v3 重构（coldstart 骨架来源）

## 元信息
- depends_on: []
- chain: c1
- 分支/执行者: v3-drafts / 主会话统筹派发

## 范围
- 涉改文件集：`templates/`——删旧九件（v2 制），新建三件：`spec-template.md`（三要素结构：元信息/背景/目标与非目标/需求本身/主要影响/副作用/验收标准/决策记录）、`impl-template.md`（元信息+spec引用/技术方案/任务切分/涉改总清单/收尾清单）、`task-template.md`（元信息/范围/guides/sensors/sensor 判定）；README templates/ 行更新
- 统筹要点：模板=03-artifacts 结构表的具现，条款依据 06-charter §8（模板由宪章派生）；coldstart 的 spec 骨架引用本目录（T01 消费）

## guides（前馈）
- guide: spec G1/AC1（coldstart 依赖）+ 03-artifacts 三工件结构表 + 06-charter §2/§3/§4 结构项 | type: 计算型（机械引用）
- guide: 旧九件直接删除（git 历史保留）；审查报告模板的判定节格式并入 task-template 的 sensor 判定节 | type: 推断型（统筹撰写）

## sensors（反馈）
- sensor: 三件模板存在且章节与 03-artifacts 结构表逐节一致；旧九件已删 | type: 计算型（CLI）
- sensor: `[NEEDS CLARIFICATION]` 标记与只追加语义在模板中有体现 | type: 推断型（sidecar 会话）

## sensor 判定

- [计算型] 三件模板存在、章节与 03-artifacts 结构表逐节一致、旧九件已删：**PASS**（2026-10-14 人工核对；CLI 检查待 T02 上线后由 `specp check` 复核——链内自举时序，T08 收口 check all 兜底）
- [推断型] `[NEEDS CLARIFICATION]` 标记与决策表只追加语义在模板中有体现：**PASS**（spec-template 头注+决策节注释、impl/task 头注均含；语义充分性随 T08 sensor3 复核）
