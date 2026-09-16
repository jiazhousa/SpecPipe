# 审查报告: {topic} (Revision {N})

<!--
  模板规约：Issue Impl 完整但精简审查报告（I-S5）。审查者直接写至 {wf}/reviews/{topic}-issue-impl-revision-{N}.md；行数不设硬上限。
  审查方法同 Impl 完整审查，范围聚焦（改动文件 ≤3 个，深度适配 Issue 规模）；Issue 无独立 Spec 文档，
  「范围对齐」以 S1 访谈确认的改动点为基准。审查清单 6 项：术语一致性 / 范围对齐 / 改动点核查 / 隐藏依赖 / 风险与兜底 / 回归面。
-->

## 总体评价

<!-- 必填，1 行：通过 / 不通过 -->

## 发现的问题

<!-- 每问题一条，无问题写「无」 -->
1. [问题] — 严重程度：critical/high/medium/low
   - 影响：[描述]
   - 建议：[修复建议]

## 结论

<!-- 必填，三选一 -->
# PASS / # REJECT / # REJECT: SPEC_OVERTURN

状态：{审查前状态} → {审查后状态}

<!--
  按转移表落定（落定前先校验 .stage 为 ISSUE_IMPL_REVIEWING，不一致则中止并提示调度者）：
  PASS → ISSUE_IMPL_APPROVED（不阻塞，直接进入编码）；REJECT → ISSUE_IMPL_DRAFT；SPEC_OVERTURN 经用户确认后回退，
  发现改动超出 Issue 级可建议回 S2 升级为 Story。
-->
