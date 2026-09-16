# 审查报告: {topic} (Revision {N})

<!--
  模板规约：Epic Spec 轻量审查报告（E-S5）。审查者直接写至 {wf}/reviews/{topic}-epic-spec-revision-{N}.md，全文 ≤40 行。
  审查清单 3 项：①范围边界——做什么/不做什么是否清晰，有无范围蔓延；②致命遗漏——有无未声明的核心依赖或架构级硬伤；
  ③Story 拆分合理性——路线图是否覆盖 Epic 全部范围、Story 粒度是否适中、依赖关系是否清晰。
  轮次 N 计数见 06-artifacts.md；审查深度分级见 09-check-split.md。
-->

## 总体评价

<!-- 必填，1 行：通过 / 不通过 -->

## 发现的问题

<!-- 按清单逐项核对；每问题一条，无问题写「无」。问题须可证伪，精度优先（宁缺毋滥） -->
1. [问题] — 严重程度：critical/high/medium/low
   - 影响：[描述]
   - 建议：[修复建议]

## 结论

<!-- 必填，三选一 -->
# PASS / # REJECT / # REJECT: SPEC_OVERTURN

状态：{审查前状态} → {审查后状态}

<!--
  按转移表落定（落定前先校验 .stage 为 EPIC_SPEC_REVIEWING，不一致则中止并提示调度者）：
  PASS → EPIC_SPEC_USER_AUDIT（阻塞等用户放行）；REJECT → EPIC_SPEC_DRAFT；SPEC_OVERTURN 经用户确认后回退草案。
-->
