# specpipe 配置（opencode 版）

> 所有可配置项的默认值。**修改此文件即可定制工作流，无需改动 SKILL.md。**
> builder 在进入工作流（S0 前）时用 read 工具加载本文件，用配置值替换 SKILL.md 中的 `{{key}}` 占位符。
> 默认值即作者个人配置（Gateway + 开源模型）。

## 工作流根目录

| key | 默认值 | 说明 |
|-----|--------|------|
| `wf` | `.specpipe` | 工作流产出根目录（项目根下），所有 `{wf}/` 路径由此派生 |

> **注意**：若修改 `wf`，需同步更新 `agents/checker.md` frontmatter 中 `permission.edit` 的路径白名单（`.specpipe/reviews/*` 与 `.specpipe/plans/*/.stage`）。

## 角色模型

| key | 默认值 | 说明 |
|-----|--------|------|
| `provider` | `Gateway` | 模型 provider（opencode 的 `provider/model` 前缀） |
| `builder_model` | `glm-5.2` | builder（主会话，有状态） |
| `explorer_model` | `deepseek-v4-flash` | explorer（subagent，无状态，调研） |
| `checker_model` | `kimi-k2.7-code` | checker（subagent，无状态，审查） |

> **注意**：subagent 的模型在 `opencode.json` 的 `agent` 段配置（`"explorer": {"model": "Gateway/deepseek-v4-flash"}`、`"checker": {"model": "Gateway/kimi-k2.7-code"}`），json 会覆盖 markdown agent 的同名字段。agent 文件（`explorer.md`/`checker.md`）的 frontmatter **不写 model**。修改角色模型时只需改 `opencode.json` 一处。

## 外部调研工具（MCP）

| key | 默认值 | 说明 |
|-----|--------|------|
| `search_mcp` | `websearch` | 网络搜索 MCP server（Tavily） |
| `docs_mcp` | `context7` | 技术文档查询 MCP server（Context7） |

> 两个 MCP 已配置在 `~/.config/opencode/opencode.json` 的 `mcp` 段，explorer 直接调用对应工具，无需额外 CLI。

## Git 分支策略

| key | 默认值 | 说明 |
|-----|--------|------|
| `main_branch` | `develop` | 开发主分支（编码分支从它拉出） |
| `release_branch` | `release` | 发布测试分支 |
| `master_branch` | `master` | 生产分支 |
| `feature_prefix` | `dev/feat` | 功能分支前缀 |
| `fix_prefix` | `dev/fix` | 修复分支前缀 |
| `chore_prefix` | `dev/chore` | 杂项分支前缀 |

## 临时目录

| key | 默认值 | 说明 |
|-----|--------|------|
| `tmp_dir` | `/tmp` | tmux 质量门日志的落盘目录 |
