# 07-environment —— 环境与组合

> **状态：骨架（批次 4 落地正文）** · 来源：原 10-composition 改写（worktree 纪律弱化为参考）
> 编码执行环境、Git 纪律、fence 编排与规则组合。

## Git 纪律

- 一 task 一 commit（D16）：chain 内多 task=多 commit 串行同分支；重作 amend 归一；commit 独立可编译
- 三分支策略（dev/rel/ms 三级格式）与 MR 语义（承接原 10 卷）
- cherry-pick 携带 spec delta：rel/ms 线自然同步，无需额外机制

## fence 编排

- 冻结后即启动（全量单测+E2E，Story 收尾一次）；增量重跑三规则（测试/注释/文档→不重跑；生产代码→重跑；fence 失败→修复后必重跑）
- fence=收敛阶段的计算型 sensor

## worktree（参考性）

- 独立 worktree 不污染主区——纪律建议；工具操作交外部 skill（如 git-master），本仓不提供命令（D21）
- 链与分支的对应关系见 03-artifacts

## 规则组合覆盖

- 加载顺序：本仓规章 → 项目规则（项目根 AGENTS.md）→ 用户规则（个人层）；后加载覆盖同名项
- 入仓筛选：「换人依然成立」测试
- 记忆三层：全局层 / 项目层（AGENTS.md feature 记录）/ 任务层（工件本体）——不设独立记忆文件
