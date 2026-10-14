# T{NN}: {slug}

<!--
  模板规约：最小执行与验证单元，兼派发载体；路径 tasks/T{NN}-{slug}.md，每 task 一件。
  状态由工件推导：全部 sensor PASS = done（且语义，D32）；不设 task 级状态文件。
  一 task 一 commit（R17）：commit 独立可编译；重作 amend 归一；message 关联 task 编号。
-->

## 元信息

- depends_on: []        <!-- 依赖声明（DAG 边，分布式单源） -->
- chain:                <!-- 所属链（依赖图推导） -->
- 分支/执行者:           <!-- 链级，同链共用 -->

## 范围

<!-- 必填。涉改文件集（链间不相交、同链可重叠、含 spec 文件改动点）+ 统筹要点（引用 impl 章节号） -->

## guides（前馈，统筹阶段派发）

- guide: <spec 规则锚点 G#/AC# + 规约卷引用>  | type: 计算型（机械引用）
- guide: <架构意图与实现口径说明>              | type: 推断型（统筹撰写）

## sensors（反馈，task 级挂载）

<!-- 泛化 schema：名称/类型（计算型=CLI 命令；推断型=sidecar 会话）/验收口径（可验收）；
     一个工件可挂多个 sensor，且语义——全部满足才闭合 -->

- sensor: <验证命令或判定要求> | type: 计算型（CLI）
- sensor: <语义审查要求> | type: 推断型（sidecar 会话）

## sensor 判定

<!-- sensor 侧写最终结论，逐条对应声明；REJECT 时每问题给定位与可执行修订方向（J2/J3） -->

- [计算型] ：
- [推断型] ：
