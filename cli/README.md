# specp CLI 简用说明

SpecPipe A 仓自带 CLI（`specp`），三用途（05-cli 契约）：**棕地项目冷启动**、**规则手册速查**、**工件合规检查**（建设中）。零 npm 依赖、ESM，要求 Node ≥18。

## 快速开始

```bash
node cli/specp.mjs --help            # 查看三用途与命令面
node cli/specp.mjs rules --list      # 列出语料各卷章节目录
node cli/specp.mjs rules sensor      # 全文关键词检索条款
node cli/specp.mjs coldstart --dir /path/to/project
```

## 命令

### `specp coldstart [--dir <path>]`（或 `specp coldstart [<path>]`）

对目标项目（默认当前目录）做两件事：

1. **脚手架铺设**（幂等，已存在一律跳过不覆盖）：
   - 创建 `specs/` 目录
   - 从 `templates/spec-template.md` 实例化 `specs/_skeleton/spec.md` 骨架（纯复制，不填充）
   - 无 `AGENTS.md` 时写一行占位提示
2. **项目事实盘点**：输出 JSON 到 **stdout**（人读进度/跳过提示走 stderr，stdout 可安全接 jq）：

```json
{
  "isGitRepo": true,
  "gitBranch": "main",
  "gitRemotes": ["origin"],
  "languageStacks": ["Node.js"],
  "existingDocs": ["specs", "AGENTS.md"],
  "specSkeletonCreated": true
}
```

| 字段 | 说明 |
|---|---|
| `isGitRepo` / `gitBranch` / `gitRemotes` | git 状态（shell out git；非仓库时 `false`/`null`/`[]`） |
| `languageStacks` | 语言栈探测（目标根目录特征文件：package.json/go.mod/pom.xml/pyproject.toml/Cargo.toml 等；只看根目录） |
| `existingDocs` | 既有 docs 盘点（`specs` / `docs` / `AGENTS.md` 中已存在者，**铺设前**快照） |
| `specSkeletonCreated` | 本次运行是否新建了 spec 骨架（重跑时为 `false`） |

### `specp rules --list [卷名]` / `specp rules <关键词>`

- 语料 = 本仓 01-07 规章卷 + README（`cli/lib/corpus.mjs` 硬编码白名单）。
- `--list`：列各卷名与章节目录（`##` 级标题）；可跟卷名过滤（如 `03` / `03-artifacts` / `readme`）。
- `<关键词>`：行级 includes 匹配（大小写不敏感，不分词），逐条输出 `文件:行号 [所在章节] 行内容`；无命中输出「无命中」。多条命中全部列出。
- 汇总行（命中数与分文件统计）走 stderr，不污染 stdout 管道。

## 退出码

全命令统一：`0` 成功（含 rules 无命中）；`1` 检查失败（check 命令交付后启用）或内部错误；`2` 用法错误（未知命令/未知参数/目录不存在等）。

## 开发说明

- 源码在 `cli/`：`specp.mjs`（入口+手写路由）、`commands/`（命令实现）、`lib/corpus.mjs`（语料加载）。
- 语法检查：`node --check cli/specp.mjs`（含全部命令/lib 模块）。
- 语料与 `templates/` 按 CLI 自身所在仓定位（与目标项目无关），随本仓分发。
