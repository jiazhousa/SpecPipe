# README —— SpecPipe：spec 驱动开发的工件制方法论

**Spec 哲学**：先规格后编码——规格是人（意图）与机器（执行）之间的接口协议；注意力稀缺，人的裁定只投放在放行点。本体系建立在该哲学之上（学习了 Spec Kit 等先例），哲学叙事不入仓。

**单仓模式**：方法论（七卷）+ 工件模板 + 审查规则语料 + skill 集 + CLI 同仓承载。本仓是规范体：消费者是 agent 与工具，不是人——不诠释哲学、不含平台适配内容；宿主挂载（`skills/`）与工具实现（`cli/`）按路线落地。

## 核心概念速览

- **工件三层（artifact）**：spec（业务规则）→ impl（统筹任务书）→ task（最小执行与验证单元）；一个 Story = 1 spec : 1 impl : N task
- **控制点**：guide（前馈）与 sensor（反馈）各分计算型（CLI 执行）与推断型（agent 判断）；guides 向下锚定，sensors 向上闭合
- **spec-anchored**：一切行为变更锚定在 spec 上，无裸改；仅当 MR 合入时 spec 随代码一并更新
- **流程是建议**：唯一强制性来自工件依赖——跳步不被拦截，但工件缺失使下一步自然受阻
- **CLI 三用途**：棕地冷启动 / 规则手册速查 / 工件合规检查；**CLI 与 skill 绑定**——既作为工具，也作为字典

## 术语表

> 术语对齐 Birgitta Böckeler《Harness Engineering for Coding Agent Users》（martinfowler.com，2026-04）。

| 术语 | 业界对应 | 含义 |
|---|---|---|
| 工件 | artifact | 工作流的标准化产出物（spec / impl / task） |
| harness | harness | agent 中模型之外的一切；本体系是为编码 agent 构建的用户侧外层 harness（outer harness） |
| guide | guide / feedforward control | 前馈控制：行动前注入的定向材料，提高首次正确概率 |
| sensor | sensor / feedback control | 反馈控制：行动后观测并促成自修正 |
| 计算型 | computational | 确定性、快速、可机械执行（CPU），结果可靠 |
| 推断型 | inferential | 语义分析与判断（AI review、LLM as judge），较慢且非确定 |
| 转向环 | steering loop | 人迭代 harness 的元过程：问题重复出现时改进 guides/sensors |
| sidecar 会话 | sidecar | 伴生于执行者但外置的 sensor 载体 |
| HITL 卡点 | human-in-the-loop gate | 必须由用户确认的环节 |
| 链 | task chain | 依赖连通的 task 集合；1 链 = 1 分支 + 1 执行者 |
| 执行者 | executor | 链的承载会话（形态宿主无关） |
| 统筹 | orchestration / planning | impl 层的职责：分治方案设计 |
| 收敛 | convergence | 收尾聚合阶段（全 task 闭合 + fence + 归档） |
| fence | test fence | 全量回归测试围栏 |
| 存放路由 | artifact residency | 工件存放位置规则（项目内 / 工作区） |
| 软门槛 | soft gate | 不拦截但使下一步自然受阻的工件依赖 |
| spec-anchored | spec-anchored | 一切行为变更锚定于 spec，经 MR 原子同步 |
| 棕地冷启动 | brownfield cold start | 存量项目首次接入本体系 |

## 卷导览（七卷）

| 卷 | 一句话职责 | 加载场景 |
|---|---|---|
| README | 本文件：定位与导览 | 首次接触本仓 |
| 01-principles | 原则总纲：spec-anchored、工件制边界、意图粒度、计算-推断分离 | 常读 |
| 02-process | 建议流程：需求分级（Epic/Story/Issue）与各路径建议步骤 | 任何需求进入时 |
| 03-artifacts | 工件规约：spec/impl/task 三层 schema、存放路由、依赖 DAG 与链、MR 锚定 | 产出/审阅任何工件时 |
| 04-control | 控制点体系：guide/sensor 矩阵、挂载与用途、sidecar、重作回路、闭合语义 | 挂载 sensor / 执行判定时 |
| 05-cli | CLI 契约：三用途、与 skill 的绑定关系、宿主关系 | 使用/实现 CLI 时 |
| 06-charter | 工件宪章：S/R/H 条款、三级 sensor 判定清单、评分与判例 | 组装检查清单时 |
| 07-environment | 环境与组合：Git 纪律、fence 编排、规则组合覆盖 | 进入编码阶段时 |
| templates/ | 工件模板（spec/impl/task） | 产出工件对格式有疑问时 |
| review-rules/ | 审查规则语料（21 件语言级规则 + system_rules.json 映射） | 推断型 sensor 逐文件审查时 |
| skills/ | skill 集八件（specpipe 先导入口 + 七件意图 skill；Agent Skills standard，薄适配——正文在卷） | agent 挂载时 |
| specs/ | Story 开发档案（工件制工件链实例） | 了解工作流实际形态时 |
