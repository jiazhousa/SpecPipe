# Git 分支策略（以 commit 为载体）

涉及分支创建、cherry-pick、MR 操作时遵循以下规范：

## 分支命名

`目标分支/性质/名称` 三级格式：

| 目标分支 | 性质 | 分支前缀 | 合入目标 | 操作 |
|---|---|---|---|---|
| dev | feat/fix/chore | `{{feature_prefix}}/*`、`{{fix_prefix}}/*`、`{{chore_prefix}}/*` | {{main_branch}} | 从 {{main_branch}} 拉出，正常开发 |
| rel | feat/fix/chore | `rel/feat/*`、`rel/fix/*`、`rel/chore/*` | {{release_branch}} | 从 {{release_branch}} 拉 cherry-pick 干净 commit |
| ms | feat/fix/chore | `ms/feat/*`、`ms/fix/*`、`ms/chore/*` | {{master_branch}} | 从 {{release_branch}}/{{master_branch}} 拉 cherry-pick 干净 commit |

## 工作流

1. **开发**：从 {{main_branch}} 拉出 `{{feature_prefix}}/xxx` 分支，在 worktree 中开发
2. **本地测试通过后**：整理 commit，确保每个 commit 能独立编译和通过测试
3. **推送 + MR**：推送 `{{feature_prefix}}/xxx` 到远端，创建合入 {{main_branch}} 的 MR
4. **发布测试环境**：从 {{release_branch}} 拉出 `rel/feat/xxx`，cherry-pick 干净 commit，创建合入 {{release_branch}} 的 MR
5. **发布生产**：从 {{release_branch}}/{{master_branch}} 拉出 `ms/feat/xxx`，cherry-pick 干净 commit，创建合入 {{master_branch}} 的 MR

## 注意事项

- CI 只关心 target 分支，不关心 source 分支
- 同一 feature 在 3 个环境有 3 个分支（dev/rel/ms 前缀区分），避免同名混淆（前缀可在 config.md 修改）
- 确保每个 commit 能独立编译和通过测试，避免协作冲突