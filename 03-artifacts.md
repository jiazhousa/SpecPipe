# 03-artifacts —— 工件规约

> **状态：骨架（批次 2 落地正文）** · 来源：原 06-artifacts 重写（工件制核心卷）
> 工件是 v3 的管理对象：spec / impl / task 三层，各挂 guides 与 sensors。

## 工件三层总览

- 基数：一个 Story = 1 spec : 1 impl : N task（D6）
- 双向流：guides 向下锚定，sensors 向上闭合

## spec 工件

- 定位：业务规则层，不涉足技术实现（R4 彻底化）
- 三变体：Story 全量 / Epic 路线图 / Issue 轻量（锚定声明+最小决策表+验收）
- 结构：元信息 / 背景 / 目标 / 非目标 / 验收标准 / 决策记录（只追加） / 需求正文
- 未知项标记协议：`[NEEDS CLARIFICATION: ...]`
- HITL 放行：不留痕（过程非工件）

## impl 工件

- 定位：统筹任务书层——技术方案 + task 切分 + 依赖统筹，「怎么分而治之」
- 结构：元信息+spec 引用 / 技术方案 / 涉改总清单 / 收尾清单

## task 工件

- 定位：最小执行与验证单元，兼派发载体（编码任务书与 task 合流）
- 结构：元信息（depends_on/chain/分支）/ 范围（含 spec 文件改动点）/ guides / sensors / sensor 判定
- 路径：`tasks/T{NN}-{slug}.md` 每 task 一件

## 双址路由

- 项目内（coding / git 管理目标）：结论、过程无关、快照
- 工作区（非 coding / 无 git 目标）：工作记录、过程性
- 流向：工作区草稿 → 定稿入项目 → MR 直接改项目内 spec（D15）

## 依赖 DAG 与链路

- depends_on 分布式声明（D11）；连通即同链：1 链 = 1 分支 + 1 承载者（D7）
- 菱形视同同链，不做跨分支合并（雏形优先）；链间才并行

## MR 锚定更新链路

- 仅当 MR 合入时才一并将 spec 更新（D9）；spec delta 随 task commit（D16）
- git 分支即 delta 容器，MR diff 即 spec delta（OpenSpec changes/ 机制不需要）

## topic 命名与追溯

- kebab-case 不带级别前缀；一 task 一 commit 对应关系
