---
name: spec-plan
description: impl 统筹——技术方案、task 切分、依赖 DAG 与链划分；impl 级 sensor 挂载。何时用：spec 逐项确认完成后。
---

# Impl 统筹

> 规约单源：03-artifacts「impl 工件」「task 工件」「依赖 DAG 与链」+ 06-charter impl/task 条款（R9-R17）；模板 `templates/impl-template.md`、`templates/task-template.md`。

## Scope Guard

只写 impl.md 与 tasks/*.md（含各 task 的 guides 节）；不动 spec 与业务代码。

## 前置检查

- spec 已逐项确认（会话上下文/用户确认）；spec 文件存在

## 执行步骤

1. 技术方案：总体策略/分块/选型/关键时序；发布顺序、兼容窗口、回滚、存量数据必有对应章节（R12）
2. task 切分（最小执行单元）：每 task 定 guides 与 sensors（泛化 schema：名称/类型/验收口径/载体）；**spec 文件改动点列入相关 task 范围**（spec 增量随 commit）
3. 依赖声明：各 task 元信息 `depends_on`（分布式单源）
4. 链划分：连通即同链，1 链 = 1 分支 + 1 执行者；菱形归同链不做跨分支合并
5. 结构自查：`specp check all <topic目录>`（无环/引用/锚点/差集）
6. **impl 级 sensor**：统筹质量核查（推断型，建议异家族 sidecar）——重点防 task 返工级联（切分粒度/依赖正确性/spec 覆盖完整性）；调用模板同 spec-write（清单换 06-charter impl 判定清单 R9-R12）；REJECT → 修订重调，PASS → 派发执行（spec-task）

**Issue 轻量变体**：锚定既有 spec 后走精简 impl（1-2 task，通常单链）；技术方案可压缩为要点段，结构项不省。

## 工件与 CLI 协作

- task 工件 schema 与示例：03-artifacts「task 工件」
- 链规则与 MR 锚定更新链路：03-artifacts 对应节
- 涉改总清单 = 各 task 文件集并集 + spec 改动点（R11）

## sensor 挂载

见执行步骤 6；task 级 sensors 由各 task 工件自带。
