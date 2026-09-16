# 审查报告: {topic} (Revision {N})

<!--
  模板规约：Spec 轻量审查报告（S-S5）。审查者直接写至 {wf}/reviews/{topic}-spec-revision-{N}.md，全文 ≤30 行（精简、快速放行）。
  审查清单 2 项：①范围边界——做什么/不做什么是否大致清晰，有无明显范围蔓延；②致命遗漏——有无明显未声明的核心依赖或架构级硬伤。
  此阶段 impl 尚未产出、无实际代码可参照，仅快速把关，把关重心在 Impl 审查。
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
  按转移表落定（落定前先校验 .stage 为 SPEC_REVIEWING，不一致则中止并提示调度者）：
  PASS → SPEC_USER_AUDIT（阻塞等用户放行）；REJECT → SPEC_DRAFT；SPEC_OVERTURN 经用户确认后回退，Epic 下 Story 需评估连锁回退 Epic Spec。
-->
