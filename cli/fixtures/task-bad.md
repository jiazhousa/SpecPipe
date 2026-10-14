# T98: 反例夹具——guides 无锚点 + sensors 无类型标注

<!--
  反例夹具（T04）：元信息三字段齐全、判定节已凑齐（闭合差集=0），
  但 guides 两条均无 spec 锚点引用、sensors 两条均无「计算型|推断型」类型标注。
  预期：specp check task cli/fixtures/task-bad.md → 退出码 1；
  FAIL=guides 锚点×1 + sensors 类型×2（逐行点名），无其他问题。
-->

## 元信息
- depends_on: []
- chain: c1
- 分支/执行者: fixture / 夹具

## 范围
- 涉改文件集：`cli/fixtures/task-bad.md`（本夹具自身，反例构造）

## guides（前馈）
- guide: 把代码写对，把测试跑过 | type: 未标注
- guide: 保持结构简单，避免不必要的复杂度 | type: 未标注

## sensors（反馈）
- sensor: `node --check` 通过 | type: 未标注
- sensor: 冒烟脚本通过 | type: 未标注

## sensor 判定

- [计算型] 夹具不执行，占位判定凑齐闭合差集：**PASS**
- [计算型] 夹具不执行，占位判定凑齐闭合差集：**PASS**
