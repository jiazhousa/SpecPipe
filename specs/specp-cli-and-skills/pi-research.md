# pi-coding-agent 扩展机制采证报告（T05，推断型 sensor 前置调研）

- **采证对象**：本机 npm 包 `@earendil-works/pi-coding-agent` **v0.84.1**（`/home/starlex/.nvm/versions/node/v24.14.0/lib/node_modules/@earendil-works/pi-coding-agent/`）
- **方法**：全部本机事实——包内 `docs/`（31 篇官方文档）+ `dist/` 源码 + `~/.pi/agent/` 配置实测；未跑任何模型调用，未改任何配置
- **采证会话**：Explorer（只读），Oracle 代落盘 2026-10-14

---

## 问1：扩展包形态（`pi install ./local/path`）

**结论**：本地路径包 = 写入 settings 的 packages 数组 + 原地加载（不复制），资源四类型齐全。

- 安装（docs/packages.md L22-39）：`pi install /absolute/path`、`pi install ./relative/path`；临时试用 `pi -e ./path`（当前 run 有效不落 settings）
- **本地路径语义**（packages.md L107-114）：写入 `~/.pi/agent/settings.json`（默认）或项目 `.pi/settings.json`（`-l`）的 `packages` 数组，相对路径相对 settings 文件解析；路径是文件则当单个 extension 加载，是目录则按 package rules 加载资源
- **包清单**（packages.md L120-133）：`package.json` 的 `pi` 键：
  ```json
  { "pi": { "extensions": ["./extensions"], "skills": ["./skills"],
            "prompts": ["./prompts"], "themes": ["./themes"] } }
  ```
  数组支持 glob 与 `!exclusions`
- **约定目录**（无 manifest 自动发现，packages.md L158-165）：`extensions/`→.ts/.js；`skills/`→递归 SKILL.md 目录 + 顶层 .md；`prompts/`→.md（斜杠命令模板）；`themes/`→.json
- settings 可对象形式过滤包资源（`{source, extensions, skills, prompts, themes}`，`!x` 排除/`+x` 强制/`[]` 全关，packages.md L190-216）
- 安装落点：npm 包→`~/.pi/agent/npm/`；git 包→`~/.pi/agent/git/<host>/<path>`；本地路径原地
- 本机现状：`~/.pi/agent/settings.json` packages = `["https://github.com/Unpained/coding-workflow", "npm:pi-loop-police"]`

## 问2：skills 支持

**结论**：**原生支持 Agent Skills standard**（agentskills.io），Claude Code SKILL.md 直接可用——SpecPipe skill 集最短路径。

- SKILL.md + YAML frontmatter（`name`/`description` 必填），**progressive disclosure**：启动只注入 name+description 进系统提示，匹配时 agent 用 read 工具加载全文（skills.md L64-71）
- **加载位置**（skills.md L24-41）：全局 `~/.pi/agent/skills/`、`~/.agents/skills/`；项目（需 trust）`.pi/skills/`、`.agents/skills/`（cwd 及祖先至 git 根）；包 skills/ 目录 / `pi.skills` 清单 / settings `skills` 数组 / CLI `--skill <path>`
- **直接复用其他 harness skills**（skills.md L43-62）：settings 加 `"skills": ["~/.claude/skills"]` 即注入
- `/skill:name [args]` 斜杠命令强制加载（skills.md L73-90）
- frontmatter（skills.md L137-149）：name（≤64，小写 a-z0-9 连字符）、description（≤1024）、license、compatibility、metadata、allowed-tools（实验）、disable-model-invocation（true=仅限命令调用）
- 校验：缺 description **不加载**；其余违规仅警告（skills.md L176-188）
- 备选注入：`--append-system-prompt`（text/file 多 flag）、AGENTS.md/APPEND_SYSTEM.md、扩展包 prompts

## 问3：provider/model 配置

**结论**：两 provider 均内置；⚠️ **模型 id 与 OpenCode 侧不同——GLM-5.3 须 models.json 自定义**。

- **auth**（providers.md L69-104）：

  | Provider | env | auth.json 键 |
  |---|---|---|
  | DeepSeek | `DEEPSEEK_API_KEY` | `deepseek` |
  | ZAI Coding Plan（全球） | `ZAI_API_KEY` | `zai` |
  | ZAI Coding Plan（中国） | `ZAI_CODING_CN_API_KEY` | `zai-coding-cn` |

  `/login` 存 `~/.pi/agent/auth.json`（0600）；**auth.json 优先于 env**；`--api-key` 最高；auth.json 值支持 `$ENV` 插值 / `!command` / 字面量
- **内置 catalog（pi-ai dist data 实测 v0.84.1）**：deepseek→`deepseek-v4-flash`、`deepseek-v4-pro`（baseUrl api.deepseek.com，openai-completions，thinkingFormat=deepseek，1M ctx）；zai/zai-coding-cn→`glm-4.7`、`glm-5-turbo`、`glm-5.2`、`glm-5.2-highspeed`（baseUrl `https://api.z.ai/api/coding/paas/v4`）
  ⚠️ **无 `deepseek-flash`、无 `glm-5.3`**——`--model deepseek-flash` 匹配失败
- **models.json 自定义**（docs/models.md，`~/.pi/agent/models.json`）：
  ```json
  { "providers": { "<name>": {
      "baseUrl": "...", "api": "openai-completions", "apiKey": "$MY_KEY",
      "models": [{ "id": "glm-5.3", "reasoning": true, "contextWindow": ..., "maxTokens": ...,
                   "compat": { "thinkingFormat": "zai" } }] } } }
  ```
  api 四选一：openai-completions / openai-responses / anthropic-messages / google-generative-ai；`compat.thinkingFormat: "zai"` 是 zai 系标配（本机 models.json 同款先例）
- **CLI**（usage.md L184-193）：`--provider`、`--model <pattern>`（`provider/id` 与 `:thinking` 后缀）、`--api-key`、`--thinking`、`--list-models [search]`
- 本机现状：settings defaultProvider=`gateway`（localhost:3000 中转，含 glm-5.2/deepseek-v4-flash/kimi-k2.7-code）、defaultThinkingLevel=high；auth.json 空
- 项目级 models.json：文档仅全局，**未确认**

## 问4：非交互调用（`pi -p`）

**结论**：单发即退；stdout 干净（仅最终助手文本）；错误 stderr+exit 1；无内置墙钟超时（外层自控）。

- 模式（usage.md L168-176）：`-p` 文本 / `--mode json`（JSON lines 事件流）/ `--mode rpc`
- **-p 源码行为**（dist/modes/print-mode.js）：取最后 assistant 消息全文写 stdout；error/aborted→stderr+exit 1；正常 0；SIGTERM→143；扩展错误也走 stderr——stdout 可安全管道解析
- piped stdin 并入初始 prompt：`cat x.md | pi -p "Summarize"`
- 超时：无 CLI flag；settings `retry.provider.timeoutMs`/`httpIdleTimeoutMs`（默认 300s）；外层调用方自控
- `-p` 默认落 session 文件；`--no-session` 纯 ephemeral

## 问5：上下文注入

**结论**：AGENTS.md 分层叠加（全局+祖先链）；--append-system-prompt text/file 可多 flag。

- AGENTS.md/CLAUDE.md（usage.md L98-108）：全局 `~/.pi/agent/AGENTS.md` + cwd 向上所有父目录 + 当前目录 layered 叠加；`AGENTS.override.md` 替代该目录层；`--no-context-files`/`-nc` 关闭
  ⚠️ 本机已有全局 `~/.pi/agent/AGENTS.md`（26KB）——sidecar 会带入，判定场景注意
- 系统提示文件：`.pi/SYSTEM.md`（项目）/`~/.pi/agent/SYSTEM.md`（全局）=替换；同位 `APPEND_SYSTEM.md`=追加
- `--append-system-prompt <text|文件路径>` 可多 flag，值间双换行分隔（CHANGELOG L1821）

## 问6：sidecar 可行性（独立判定会话）

**结论**：**可行**，一次 shell 调用即独立判定会话。

```bash
pi -p --no-session --provider deepseek --model deepseek-v4-flash \
   @context.md "审查以下变更，输出 PASS/REJECT 与理由..."
```

- 上下文三通道：`@file` 参数（含图片）/ stdin 管道 / prompt 内联
- 隔离：默认每次新 session；`--no-session` 不落盘；`--session`/`--fork` 续会话
- **只读判定**：`--tools read,grep,find,ls`（官方 Read-only mode 示例）或 `--no-tools`
- 事件级解析用 `--mode json`
- **纯净性建议**：sidecar 加 `--no-context-files --no-extensions --no-skills` + 显式 @file 喂材料——判定输入可控、token 可控

## 风险点与未确认项

1. **模型 id 命名差异（高影响）**：内置 catalog=`deepseek-v4-flash`/`glm-5.2`；GLM-5.3 须 models.json 自定义（pi catalog 是否将更新未确认）
2. zai 内置走 api.z.ai 全球端点；中国区用 zai-coding-cn；本机已有 gateway 中转形态可参考
3. 项目级 models.json 未确认（文档仅全局）
4. 全局 AGENTS.md 26KB 叠加语义注意
5. `pi --help` 本会话未跑（白名单）；CLI 结论以 docs+dist 源码交叉验证
