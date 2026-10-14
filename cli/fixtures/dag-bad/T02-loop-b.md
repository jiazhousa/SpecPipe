# T02: 反例夹具——依赖环成员 B + 悬空引用

## 元信息
- depends_on: [T01, T99]
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
