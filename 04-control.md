# 04-control —— 控制点体系

> **状态：骨架（批次 2 落地正文）** · 来源：新写 + 原 09-check-split 检查分流段并入
> guide/sensor 是 harness 的普适抽象：一切派发单元（编码/审查/调研/探针）都以它装配（D10）。

## guide/sensor 2×2 矩阵

- 前馈=guide（计算型：机械装配定向材料 / 推断型：语义引导）
- 反馈=sensor（计算型：确定性校验 / 推断型：语义审查与采证）
- 类型决定载体与渠道：计算型→CLI（shell 渠道）；推断型 guide→统筹者撰写；推断型 sensor→sidecar agent（D5）

## 三级挂载

- spec 级（内容约定核查）/ impl 级（统筹质量核查——防 task 返工级联）/ task 级（执行正确性核查）（D17）

## sidecar 模型与调用渠道

- sensor 外置于执行者，builder→sensor 调用渠道必须提供（D8）
- 挂载粒度=task 级（D12）；调用即独立实例，防跨 task 判断污染

## 重作回路

- 打回→重处理→再判定，本地化于执行者↔sensor；只报结果不报过程（D13）
- amend 归一 commit，保持一 task 一 commit 可追溯

## 闭合语义

- 全 sensor PASS = done；工件推导，无第二套状态机
- push 闭合检查（计算型 sensor，原 pre-hook 转生）：spec 下全部 task 闭合=spec 验收关键（D18）

## 检查分流（承接原 09 卷）

- 机械项（whitespace/行数/commit 格式/编译/测试）→ 计算型 sensor（CLI）
- 语义项（范围对齐/术语一致/隐藏依赖/风险/回归面）→ 推断型 sensor

## 跨家族建议

- 推断型 sensor 建议由异家族模型承载，防同盲区——skill 文字建议，零强制（D-总方向 4）

## 采证型 sensor

- 调研=推断型 sensor 的一种：对代码库/外部世界观察采证，产出结构化事实进入下游 guides
