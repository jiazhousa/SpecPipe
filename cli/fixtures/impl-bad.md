# Impl: 反例夹具——spec 引用不存在

<!--
  反例夹具（T02）：结构完整，仅锚定 spec 指向不存在路径。
  预期：specp check impl → 退出码 1；FAIL=spec 引用文件不存在×1，其余检查全过。
-->

## 元信息 + spec 引用

- 锚定 spec：`specs/_nonexistent_/spec.md`
- 统筹要点来源：T02 任务书

## 技术方案

反例夹具：验证锚定 spec 引用存在性检查（三基准候选解析后均不存在 → FAIL）。

## 任务切分

| task | 职责 | depends_on |
|---|---|---|
| F01 | 反例占位 | —— |

## 涉改文件总清单

- cli/fixtures/impl-bad.md

## 收尾清单

- 无（反例夹具）

## sensors（impl 级挂载）

- sensor: check impl 反例判定 | type: 计算型（CLI）

## sensor 判定

- [计算型] 预期退出码 1（spec 引用 FAIL）。
