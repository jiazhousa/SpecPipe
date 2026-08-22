# SpecPipe

基于 [opencode](https://opencode.ai) 的编码工作流 skill（spec 驱动流水线）。Oracle（主会话调度者）自动驱动 **spec → impl → coding → 质量门** 全流程，用户只需在**访谈澄清、分级确认、审查不通过**时参与。需求按规模自动分流为 **Epic / Story / Issue** 三条路径。

## 架构

四角色协作（Oracle 主会话 + opencode 原生 subagent × 3），外加一个可选的视觉解析角色：

| 角色 | 模型 | 类型 | 职责 |
|------|------|------|------|
| **Oracle** | `glm-5.3`（variant `max`） | 主会话（有状态，调度者） | 工作流状态机、需求访谈与拆解、spec/impl 产出、任务切分与派发、冲突调节与进度把控。不直接编码 |
| **Explorer** | `deepseek-v4-flash`（variant `high`） | subagent（无状态，只读） | 代码库调研 + 外部技术调研 |
| **Checker** | `deepseek-v4-flash`（variant `max`） | subagent（无状态，可写 reviews/ 与 .stage、可执行编译/测试） | 质量卡点：全面审查 + 写报告 + 更新状态 |
| **Builder** | `glm-5.3`（variant `high`） | subagent（无状态，可并行） | 按 impl.md 任务书编码执行 + 最小自验 + 标准报告 |
| **Looker**（可选） | 任意多模态模型 | subagent（无状态，只读） | 图片解析：截图/设计稿/架构图/报错照片 → 结构化文字描述 |

> Explorer/Checker/Builder 三者平级、互不调用，所有流转经 Oracle；subagent 遇阻塞报告 BLOCKED 反馈 Oracle 决策。Oracle 按 impl.md 切分文件集不相交的任务块后可并行派发多个 Builder。

> **Looker 是否部署取决于 Oracle 的模型**：specpipe 只是工作流，不限定模型选型。Oracle 若是多模态模型（如 `qwen-3.8-max`、`kimi-k3` 等），可直接读图，Looker 无需存在；Oracle 若是纯文本模型（如 `glm-5.3`），凡涉及图片 Oracle 一律派发 Looker 解析（图片以文件绝对路径的文字形式传递，含"附件失败自动回退"约定——用户直接粘贴图片导致自动 read 报错时，Oracle 从报错参数提取路径转派 Looker）。

> 角色模型、provider、工作流根目录、Git 分支策略等全部可配置，见 `specpipe/config.md`。

## 工作流

需求按规模自动分流为三条路径：

- **Epic**（跨模块/多子需求）→ Epic Spec → 路线图 → 逐个 Story
- **Story**（单模块功能）→ Spec → 访谈 → 审查 → 放行 → Impl → 审查 → 编码 → 质量门
- **Issue**（Bug/小调整）→ Impl → 澄清 → 审查 → 编码 → 质量门

核心机制：

- **`.stage` 状态机** — 进度持久化到 `{wf}/plans/{topic}/.stage`，支持中断恢复
- **checker 直接写审查报告 + 更新状态** — 审计链完整可验证（报告记录状态转移）
- **质量门终检（checker 全面审查）** — 代码质量 OCR（规则注入 + 评分）、impl 一致性、commit 信息、整体编译、受影响模块测试、文档归档，一次性列出全部问题（长时检查用 tmux）
- **路径白名单写权限** — checker 的 `edit` 权限仅放行 `reviews/` 与 `.stage`，`bash` 仅放行只读 git + 编译/测试命令

## 安装

### 一键安装（推荐）

在 `opencode.json` 的 `skills.urls` 中注册，opencode 会自动拉取并缓存本 skill：

```json
{
  "skills": {
    "urls": ["https://raw.githubusercontent.com/jiazhousa/SpecPipe/main"]
  }
}
```

agent 文件（`oracle.md` 主会话 + `explorer.md`/`checker.md`/`builder.md` 三个 subagent，及可选的 `looker.md`）仍需手动复制（opencode 暂不支持 agent 远程安装）：

```bash
mkdir -p ~/.config/opencode/agents
cp agents/oracle.md agents/explorer.md agents/checker.md agents/builder.md ~/.config/opencode/agents/
# 可选：仅当 Oracle 模型不支持图片输入时部署 Looker
# cp agents/looker.md ~/.config/opencode/agents/
```

### 手动复制安装

```bash
# 1. skill
mkdir -p ~/.config/opencode/skills/specpipe
cp -r specpipe/* ~/.config/opencode/skills/specpipe/

# 2. agents（oracle 主会话 + 3 个 subagent）
mkdir -p ~/.config/opencode/agents
cp agents/oracle.md agents/explorer.md agents/checker.md agents/builder.md ~/.config/opencode/agents/
# 可选：仅当 Oracle 模型不支持图片输入时部署 Looker
# cp agents/looker.md ~/.config/opencode/agents/
```

重启 opencode 后生效。

**角色模型配置**：subagent 文件的 frontmatter 不写 model，模型统一在 `opencode.json` 的 `agent` 段配置（json 覆盖同名 markdown agent 的 model 字段）；Oracle 主会话的模型在 `agents/oracle.md` frontmatter 定义：

```json
{
  "agent": {
    "explorer": { "model": "gateway/deepseek-v4-flash", "variant": "high", "temperature": 0.1 },
    "checker": { "model": "gateway/deepseek-v4-flash", "variant": "max", "temperature": 0.1 },
    "builder": { "model": "gateway/glm-5.3", "variant": "high", "temperature": 0.1 },
    "looker": { "model": "<任意多模态模型>" }
  }
}
```

> `looker` 行可选：仅当 Oracle 模型不支持图片输入时配置（模型须支持 image 输入）。

### 项目级安装

```bash
mkdir -p .opencode/skills/specpipe .opencode/agents
cp -r specpipe/* .opencode/skills/specpipe/
cp agents/oracle.md agents/explorer.md agents/checker.md agents/builder.md .opencode/agents/
```

## 配置

所有可配置项集中在 `specpipe/config.md`，默认值即作者个人配置：

| 配置项 | 默认值 | 说明 |
|--------|--------|------|
| `wf` | `.specpipe` | 工作流产出根目录 |
| `provider` | `gateway` | 模型 provider |
| `builder_model` | `glm-5.3`（variant `max`） | Oracle 主会话模型（变量名沿用 builder_model 兼容既有配置） |
| `explorer_model` | `deepseek-v4-flash`（variant `high`） | Explorer subagent 模型 |
| `checker_model` | `deepseek-v4-flash`（variant `max`） | Checker subagent 模型 |
| `builder_subagent_model` | `glm-5.3`（variant `high`） | Builder subagent 模型 |
| `search_mcp` / `docs_mcp` | `websearch` / `context7` | 外部调研 MCP |
| `main_branch` / `release_branch` / `master_branch` | `develop` / `release` / `master` | Git 分支策略 |

## 环境要求

- [opencode](https://opencode.ai)
- **tmux**（质量门长时检查）
- `TAVILY_API_KEY`（`websearch` MCP 使用）
- MCP servers：`websearch`（Tavily）+ `context7`
- **external_directory 白名单**（worktree 编码所需）：

```json
{
  "permission": {
    "external_directory": {
      "~/.local/share/opencode/worktree/**": "allow"
    }
  }
}
```

## 使用

向 Oracle（主会话）提出开发需求即自动进入工作流，或显式说"走编码工作流"。

## License

[MIT](LICENSE)
