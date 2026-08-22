# specpipe 配置

> 所有可配置项的默认值。**修改此文件即可定制工作流，无需改动 SKILL.md。**
> builder 在进入工作流（S0 前）时用 read 工具加载本文件，用配置值替换 SKILL.md 中的 `{{key}}` 占位符。
> 默认值即作者个人配置（gateway + 开源模型）。

## 工作流根目录

| key | 默认值 | 说明 |
|-----|--------|------|
| `wf` | `.specpipe` | 工作流产出根目录（项目根下），所有 `{wf}/` 路径由此派生 |

> **注意**：若修改 `wf`，需同步更新 `agents/checker.md` frontmatter 中 `permission.edit` 的路径白名单（`.specpipe/reviews/*` 与 `.specpipe/plans/*/.stage`）。

## 角色模型

| key | 默认值 | 说明 |
|-----|--------|------|
| `provider` | `gateway` | 模型 provider（opencode 的 `provider/model` 前缀） |
| `builder_model` | `glm-5.3`（variant `max`） | Oracle（主会话，有状态，调度者；变量名沿用 builder_model 兼容既有配置） |
| `explorer_model` | `deepseek-v4-flash`（variant `high`） | Explorer（subagent，无状态，调研） |
| `checker_model` | `deepseek-v4-flash`（variant `max`） | Checker（subagent，无状态，审查） |
| `builder_subagent_model` | `glm-5.3`（variant `high`） | Builder（subagent，无状态，编码执行） |
| `looker_model` | 不配置（可选） | Looker（subagent，无状态，图片解析）。**仅当 Oracle 模型不支持图片输入时部署**，配任意多模态模型（按各 provider 实际模型名，如 `qwen-3.8-max`、`kimi-k3`、`glm-5v-turbo` 等）；若 Oracle 本身是多模态模型则无需本角色 |

> **注意**：subagent 的模型在 `opencode.json` 的 `agent` 段配置（`"explorer": {"model": "...", "variant": "high", "temperature": 0.1}`、`"checker": {"model": "...", "variant": "max", "temperature": 0.1}`、`"builder": {"model": "...", "variant": "high", "temperature": 0.1}`，可选 `"looker": {"model": "<多模态模型>"}`），json 会覆盖 markdown agent 的同名字段。agent 文件（`explorer.md`/`checker.md`/`builder.md`/`looker.md`）的 frontmatter **不写 model**（variant/temperature 等推理参数同样以 opencode.json 为准）。修改角色模型时只需改 `opencode.json` 一处。

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
