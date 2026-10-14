# T01: 反例夹具——依赖环成员 A

<!--
  反例夹具（T04）：T01→T02→T01 依赖环 + T02 悬空引用 T99（见 T02-loop-b.md）。
  两件结构自身合规（闭合），仅 DAG 层违规。
  预期：specp check task cli/fixtures/dag-bad/ → 退出码 1，点名环路径与悬空引用。
-->

## 元信息
- depends_on: [T02]
- chain: c1
- 分支/执行者: fixture / 夹具

## 范围
- 涉改文件集：`cli/fixtures/dag-bad/`（环+悬空引用反例，两件小文件）

## guides（前馈）
- guide: spec G1 锚点占位 | type: 计算型（机械引用）

## sensors（反馈）
- sensor: 夹具结构自检 | type: 计算型（CLI）

## sensor 判定

- [计算型] 夹具不执行，占位判定凑齐闭合差集：**PASS**
