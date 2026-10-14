// specp check —— 工件合规检查路由（05-cli 用途③）。
// 四检查层：spec / impl / task（单件或目录） / all（spec+impl+tasks 汇总，含跨级 spec 锚定完整性）。
// 输出（stdout）：每层一个检查块，逐项 `[FAIL|WARN] <规则名> <定位>`；目录态另有 `[INFO] <信息行>`
// （DAG 通过/chain 划分/push 闭合通过/锚定结果/跳过原因），块尾汇总「N 项 FAIL / M 项 WARN」。
// 退出码：0=通过（WARN 不影响）；1=存在 FAIL；2=用法错误（含文件不存在、task 目录内无 T*.md 工件）。
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { checkSpec } from '../lib/check-spec.mjs';
import { checkImpl } from '../lib/check-impl.mjs';
import { checkTask } from '../lib/check-task.mjs';
import { checkDag } from '../lib/check-dag.mjs';

const USAGE =
  '用法：specp check <spec|impl|task|all> <path>\n' +
  '  spec/impl：传工件 .md 文件路径\n' +
  '  task：传 task .md 文件（单件结构检查）或 task 目录（逐件 + DAG 引用存在/无环 + chain 划分 + push 闭合）\n' +
  '  all：传 topic 目录（其下 spec.md + impl.md + tasks/）或 spec.md/impl.md 文件（同目录兄弟件）；\n' +
  '       汇总三层并叠加跨级 spec 锚定完整性（git diff 涉改文件 ∈ task 涉改文件集，非 git 环境跳过）';

/** 单层检查执行：读文件 → 跑检查器 → 打印问题清单与汇总行；返回 { fails, warns } */
function runLayer(label, checker, filePath) {
  const problems = checker({ filePath, content: readFileSync(filePath, 'utf8') });
  console.log(`== ${label} 检查：${filePath} ==`);
  for (const { level, rule, where } of problems) {
    console.log(`[${level}] ${rule} ${where}`);
  }
  const fails = problems.filter((p) => p.level === 'FAIL').length;
  const warns = problems.length - fails;
  console.log(`—— ${fails} 项 FAIL / ${warns} 项 WARN`);
  return { fails, warns };
}

/** task 目录检查块：checkDag（逐件 + DAG/闭合 + 可选锚定）→ 打印问题/信息/汇总；返回 { fails, warns } */
function runTaskDir(dirPath, { withAnchoring }) {
  const { problems, infos, count } = checkDag({ dirPath, withAnchoring });
  console.log(`== task 层检查（目录，${count} 件）：${dirPath} ==`);
  for (const { level, rule, where } of problems) {
    console.log(`[${level}] ${rule} ${where}`);
  }
  for (const info of infos) {
    console.log(`[INFO] ${info}`);
  }
  const fails = problems.filter((p) => p.level === 'FAIL').length;
  console.log(`—— ${fails} 项 FAIL / ${problems.length - fails} 项 WARN`);
  return { fails, warns: problems.length - fails };
}

/** 目录内 task 工件（T*.md）计数：task 目录用法判定与 all 缺件判定共用 */
function countTaskFiles(dirPath) {
  return readdirSync(dirPath).filter((f) => /^T\d+.*\.md$/.test(f)).length;
}

/** all 的目标解析：topic 目录 → 其下 spec.md+impl.md（tasks/ 在主流程取用）；spec.md/impl.md 文件 → 同目录兄弟件 */
function resolveAllTargets(target) {
  const abs = resolve(target);
  if (!existsSync(abs)) return { error: `目标路径不存在：${target}` };
  if (statSync(abs).isDirectory()) {
    return { topicAbs: abs, layers: [['spec', join(abs, 'spec.md')], ['impl', join(abs, 'impl.md')]] };
  }
  const name = basename(abs);
  if (name === 'spec.md') return { topicAbs: dirname(abs), layers: [['spec', abs], ['impl', join(dirname(abs), 'impl.md')]] };
  if (name === 'impl.md') return { topicAbs: dirname(abs), layers: [['spec', join(dirname(abs), 'spec.md')], ['impl', abs]] };
  return { error: `all 的目标须为 topic 目录或 spec.md/impl.md 文件，收到：${target}` };
}

/**
 * 命令入口。
 * 用法：specp check <spec|impl|task|all> <path>
 * 返回退出码：0=通过；1=检查失败（存在 FAIL）；2=用法错误。
 */
export function main(args) {
  // 手写参数解析：无旗标，至多两个位置参数（检查层 + 路径）
  const positional = [];
  for (const arg of args) {
    if (arg.startsWith('--')) {
      console.error(`用法错误：未知参数 ${arg}`);
      console.error(USAGE);
      return 2;
    }
    positional.push(arg);
  }
  const [layer, target] = positional;
  if (positional.length > 2) {
    console.error('用法错误：至多两个参数（检查层 + 路径）');
    console.error(USAGE);
    return 2;
  }
  if (!layer) {
    console.error('用法错误：缺少检查层参数');
    console.error(USAGE);
    return 2;
  }
  if (!target) {
    console.error(`用法错误：缺少路径参数（${layer}）`);
    console.error(USAGE);
    return 2;
  }
  if (layer === 'spec' || layer === 'impl') {
    const abs = resolve(target);
    if (!existsSync(abs) || !statSync(abs).isFile()) {
      console.error(`用法错误：工件文件不存在：${target}`);
      return 2;
    }
    const { fails } = runLayer(layer, layer === 'spec' ? checkSpec : checkImpl, target);
    return fails > 0 ? 1 : 0;
  }
  if (layer === 'task') {
    const abs = resolve(target);
    if (!existsSync(abs)) {
      console.error(`用法错误：文件或目录不存在：${target}`);
      console.error(USAGE);
      return 2;
    }
    if (statSync(abs).isFile()) {
      const { fails } = runLayer('task', checkTask, target);
      return fails > 0 ? 1 : 0;
    }
    if (countTaskFiles(abs) === 0) {
      console.error(`用法错误：目录内未找到 task 工件（T*.md）：${target}`);
      console.error(USAGE);
      return 2;
    }
    // 目录态：逐件 + DAG/闭合；跨级锚定属 all 语义，此处不开（子目录/夹具单检不背全仓推送语境）
    const { fails } = runTaskDir(target, { withAnchoring: false });
    return fails > 0 ? 1 : 0;
  }
  if (layer === 'all') {
    const resolved = resolveAllTargets(target);
    if (resolved.error) {
      console.error(`用法错误：${resolved.error}`);
      console.error(USAGE);
      return 2;
    }
    // all = spec + impl + tasks（含跨级锚定）；缺失工件按 FAIL 计入（all 语义需要全部三件），非用法错误
    let totalFails = 0;
    let totalWarns = 0;
    for (const [name, filePath] of resolved.layers) {
      if (!existsSync(filePath)) {
        console.log(`== ${name} 检查：${filePath} ==`);
        console.log(`[FAIL] 文件存在 ${filePath}：all 检查需要该工件，但文件不存在`);
        console.log('—— 1 项 FAIL / 0 项 WARN');
        totalFails += 1;
        continue;
      }
      const { fails, warns } = runLayer(name, name === 'spec' ? checkSpec : checkImpl, filePath);
      totalFails += fails;
      totalWarns += warns;
    }
    const tasksDir = join(resolved.topicAbs, 'tasks');
    if (!existsSync(tasksDir) || countTaskFiles(tasksDir) === 0) {
      const detail = existsSync(tasksDir) ? '目录内无 T*.md 工件' : '目录不存在';
      console.log(`== task 层检查：${tasksDir} ==`);
      console.log(`[FAIL] tasks 目录 ${tasksDir}：${detail}（all 检查需要 task 工件）`);
      console.log('—— 1 项 FAIL / 0 项 WARN');
      totalFails += 1;
    } else {
      const { fails, warns } = runTaskDir(tasksDir, { withAnchoring: true });
      totalFails += fails;
      totalWarns += warns;
    }
    console.log(`== all 汇总：${totalFails} 项 FAIL / ${totalWarns} 项 WARN ==`);
    return totalFails > 0 ? 1 : 0;
  }
  console.error(`用法错误：未知的检查层「${layer}」（可用：spec / impl / task / all）`);
  console.error(USAGE);
  return 2;
}
