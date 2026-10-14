// specp coldstart —— 棕地项目冷启动（05-cli 用途①）。
// 职责边界（机械层）：脚手架铺设（specs/ 目录 + spec 骨架实例化 + AGENTS.md 提示）
// + 项目事实盘点（git 状态 / 语言栈 / 既有 docs）输出 JSON 到 stdout；
// 语义层（轻量 spec 起草、领域对象识别）归 agent，不在本命令内。
// 幂等：已存在的目标一律跳过不覆盖；人读提示走 stderr，stdout 只出 JSON（可安全接 jq）。
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, copyFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { repoRoot } from '../lib/corpus.mjs';

// 语言栈探测清单：根目录特征文件 → 栈名（顺序即输出顺序；命中去重）
const LANGUAGE_MARKERS = [
  ['package.json', 'Node.js'],
  ['go.mod', 'Go'],
  ['pom.xml', 'Java(Maven)'],
  ['build.gradle', 'Java(Gradle)'],
  ['build.gradle.kts', 'Java(Gradle)'],
  ['pyproject.toml', 'Python'],
  ['requirements.txt', 'Python'],
  ['setup.py', 'Python'],
  ['Cargo.toml', 'Rust'],
  ['composer.json', 'PHP'],
  ['Gemfile', 'Ruby'],
  ['CMakeLists.txt', 'C/C++(CMake)'],
];

const AGENTS_MD_HINT =
  '<!-- specp coldstart 占位：本文件登记本仓开发约定，agent 会话优先阅读；请替换为实际内容 -->';

/** 执行 git 子命令（target 为工作目录）；git 不可用或非仓库统一按"无事实"处理，不区分二者 */
function git(target, args) {
  const result = spawnSync('git', args, { cwd: target, encoding: 'utf8' });
  if (result.error || result.status !== 0) return null;
  return result.stdout.trim();
}

/** git 状态盘点：是否仓库 / 当前分支 / 远端名单 */
function detectGit(target) {
  const isRepo = git(target, ['rev-parse', '--is-inside-work-tree']) === 'true';
  if (!isRepo) return { isGitRepo: false, gitBranch: null, gitRemotes: [] };
  const branch = git(target, ['branch', '--show-current']);
  const remotes = git(target, ['remote']);
  return {
    isGitRepo: true,
    gitBranch: branch || null, // 分离 HEAD 等无分支名场景归 null
    gitRemotes: remotes ? remotes.split('\n').filter(Boolean) : [],
  };
}

/** 语言栈探测：目标根目录按文件名特征匹配（只看根目录，不做递归扫描，保证确定性） */
function detectLanguageStacks(target) {
  const stacks = [];
  for (const [marker, stack] of LANGUAGE_MARKERS) {
    if (existsSync(join(target, marker)) && !stacks.includes(stack)) stacks.push(stack);
  }
  // .NET：csproj/sln 无固定文件名，按扩展名扫根目录
  const dotnet = readdirSync(target, { withFileTypes: true }).some(
    (entry) => entry.isFile() && (entry.name.endsWith('.csproj') || entry.name.endsWith('.sln')),
  );
  if (dotnet) stacks.push('C#(.NET)');
  return stacks;
}

/** 既有 docs 盘点：specs/ 、docs/ 、AGENTS.md 存在性（存在才列入） */
function detectExistingDocs(target) {
  return ['specs', 'docs', 'AGENTS.md'].filter((name) => existsSync(join(target, name)));
}

/**
 * 命令入口。
 * 用法：specp coldstart [--dir <path>] 或 specp coldstart [<path>]
 * 返回退出码：0=成功；2=用法错误（目标目录不存在 / 参数不合法）。
 */
export function main(args) {
  // 手写参数解析：--dir <path> / --dir=<path> / 单个位置参数，三选一，多给即用法错误
  let dirFlag;
  const positional = [];
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--dir') {
      const value = args[i + 1];
      if (!value) {
        console.error('用法错误：--dir 需要一个路径参数');
        return 2;
      }
      dirFlag = value;
      i++;
    } else if (arg.startsWith('--dir=')) {
      dirFlag = arg.slice('--dir='.length);
    } else if (arg.startsWith('--')) {
      console.error(`用法错误：未知参数 ${arg}`);
      return 2;
    } else {
      positional.push(arg);
    }
  }
  if (dirFlag !== undefined && positional.length > 0) {
    console.error('用法错误：--dir 与位置参数不可同时使用');
    return 2;
  }
  if (positional.length > 1) {
    console.error('用法错误：至多一个目标目录参数');
    return 2;
  }
  const target = resolve(dirFlag ?? positional[0] ?? process.cwd());
  if (!existsSync(target)) {
    console.error(`用法错误：目标目录不存在：${target}`);
    return 2;
  }

  // 事实盘点先于脚手架（"既有 docs"语义 = 铺设前已存在的工件，铺完再盘会恒真失去信息量）
  const facts = {
    ...detectGit(target),
    languageStacks: detectLanguageStacks(target),
    existingDocs: detectExistingDocs(target),
    specSkeletonCreated: false,
  };

  // 脚手架三件：specs/ 目录 → specs/_skeleton/spec.md 骨架（复制模板，不填充）→ AGENTS.md 提示
  const hint = (action, item) => console.error(`[${action}] ${item}`);
  const specsDir = join(target, 'specs');
  if (existsSync(specsDir)) {
    hint('skip', 'specs/ 已存在，不覆盖');
  } else {
    mkdirSync(specsDir, { recursive: true });
    hint('create', 'specs/');
  }

  const skeletonPath = join(specsDir, '_skeleton', 'spec.md');
  if (existsSync(skeletonPath)) {
    hint('skip', 'specs/_skeleton/spec.md 已存在，不覆盖');
  } else {
    // 模板来源 = CLI 自身所在仓（语料/模板随 CLI 分发，与目标项目无关）
    const templatePath = join(repoRoot(), 'templates', 'spec-template.md');
    mkdirSync(join(specsDir, '_skeleton'), { recursive: true });
    copyFileSync(templatePath, skeletonPath);
    facts.specSkeletonCreated = true;
    hint('create', 'specs/_skeleton/spec.md（来源 templates/spec-template.md）');
  }

  const agentsPath = join(target, 'AGENTS.md');
  if (existsSync(agentsPath)) {
    hint('skip', 'AGENTS.md 已存在，不覆盖');
  } else {
    writeFileSync(agentsPath, AGENTS_MD_HINT + '\n', 'utf8');
    hint('create', 'AGENTS.md（一行占位提示）');
  }

  console.log(JSON.stringify(facts, null, 2));
  return 0;
}
