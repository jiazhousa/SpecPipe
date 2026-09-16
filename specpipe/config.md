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
|------|--------|------|
| `provider` | `多 provider 混合，见下行各模型前缀` | 模型 provider（opencode 的 `provider/model` 前缀）；subagent 实际路由以 `opencode.json` 的 `agent` 段为准 |
| `builder_model` | `zhipuai-coding-plan/glm-5.3` | Oracle（主会话，有状态，调度者；`variant: high`；变量名沿用 builder_model 兼容既有配置；模型定义在 `agents/oracle.md` frontmatter） |
| `explorer_model` | `zhipuai-coding-plan/glm-5.3-flash` | Explorer（subagent，无状态，调研） |
| `checker_model` | `deepseek/deepseek-v4-flash` | Checker（subagent，无状态，审查；`variant: high`） |
| `builder_subagent_model` | `zhipuai-coding-plan/glm-5.3` | Builder（subagent，无状态，编码执行；`variant: high`） |
| `looker_model` | `zhipuai-coding-plan/glm-5.3-flash` | Looker（subagent，无状态，图片解析；原生多模态，输入支持 image/video/pdf）。**仅当 Oracle 模型不支持图片输入时部署**——本地 Oracle 默认 GLM-5.3（纯文本），图片解析交由 Looker |

> **注意**：subagent 的模型在 `opencode.json` 的 `agent` 段配置，json 会覆盖 markdown agent 的同名字段。agent 文件（`explorer.md`/`checker.md`/`builder.md`/`looker.md`）的 frontmatter **不写 model**，temperature 等推理参数同样以 opencode.json 为准。Oracle 在 `agents/oracle.md` 中配置 `model: zhipuai-coding-plan/glm-5.3` + `variant: high`；Builder 和 Checker 在 json 中均配置 `"variant": "high"`。本地 `opencode models --verbose` 已确认 GLM-5.3 与 DeepSeek V4 Flash 均提供 high variant，映射为 `reasoningEffort: high`。修改 subagent 模型时改 `opencode.json`，修改 Oracle 时改 `agents/oracle.md`，并同步更新本表。

## 外部调研工具（CLI）

| key | 默认值 | 说明 |
|-----|--------|------|
| `search_cli` | `tvly` | 网络搜索 CLI（Tavily 官方 `tvly`，认证走 `TAVILY_API_KEY`；超额报 usage limit 时降级用 `exa`） |
| `search_backup_cli` | `exa` | 网络搜索备选 CLI（Exa API 包装脚本 `~/.local/bin/exa`，key 内置，`EXA_API_KEY` 可覆盖） |
| `docs_cli` | `c7` | 技术文档查询 CLI（Context7 官方 API 包装脚本 `~/.local/bin/c7`；Context7 无官方 CLI） |

> 不再使用 MCP：`tvly` 为 pip 全局安装的官方 CLI，`exa` / `c7` 为 `~/.local/bin/` 下的独立 curl 脚本（仅依赖 curl + python3）。Explorer 的 bash 权限白名单仅放行这三个命令。

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
