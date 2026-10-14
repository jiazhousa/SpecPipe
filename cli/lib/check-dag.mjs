// 目录级 DAG 与跨级检查（05-cli 用途③；规则依据 = 03-artifacts「依赖 DAG 与链」+ D32 闭合语义）。
// 在逐件 checkTask 之上叠加目录级检查，输入为 task 目录（内含 T*.md 工件）：
//   1. DAG 引用存在——depends_on 指向的 task 编号在目录内须有对应工件文件（FAIL，逐条点名悬空引用）
//   2. DAG 无环——Kahn 拓扑排序，残余即环成员；沿「未消解依赖边」回走提取一条具体环路径点名（FAIL）
//   3. chain 划分——无向连通分量即执行链（连通即同链，03-artifacts 链规则），信息项输出不判 FAIL；
//      分量内声明 chain 值不一致亦仅提示（链划分一致性的语义裁决留给统筹）
//   4. push 闭合（D32）——task 闭合 = 单件检查 0 FAIL 且闭合差集=0；有 FAIL 的未闭合 task 报 FAIL（阻断推送），
//      纯待判定（差集>0、无 FAIL）报 WARN——与 task 层差集 WARN 同口径，允许执行中工件不阻断在途检查
//   5. spec 锚定完整性（可选开启，check all 跨级语义）——`git diff --name-only <base>..HEAD` 涉改文件
//      （排除 specs/、drafts/ 工件自身）应命中某 task「涉改文件集」声明的路径片段（双向子串匹配）；
//      base 解析顺序（确定性）：① 本目录首条 commit 之父（topic 起点——锚定义务只及本 story 在途变更，
//      主线合并基若早于 topic 会把先行重构卷入 diff，故仅在 ② 其 diff 覆盖本目录时采用）
//      ③ HEAD~5；非 git 环境（git rev-parse 失败）输出提示并跳过（不 FAIL）
// API：checkDag({ dirPath, withAnchoring }) → { problems: [{ level, rule, where }], infos: [String], count }
import { readdirSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { checkTask, parseTaskArtifact } from './check-task.mjs';

/** task 文件名/编号的规范键（T02/T2 → t2），保证目录名与 depends_on 值可比 */
const fileKey = (file) => 't' + Number(file.match(/^T(\d+)/)[1]);
const idKey = (id) => 't' + Number(id.replace(/\D/g, ''));
const keyNum = (k) => Number(k.slice(1));
const byKeyNum = (a, b) => keyNum(a) - keyNum(b);

/** git 调用：status≠0（含 git 不存在）返回 null；成功返回 stdout 去首尾空白（空输出为 ''，可作 falsy 判定） */
function git(args, cwd) {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8' });
  if (r.status !== 0) return null;
  return r.stdout.trim();
}

/** spec 锚定完整性（约定见文件头注释第 5 条）：解析 base → diff 涉改文件 → 片段双向子串匹配 */
function specAnchoring(dirPath, tasks, problems, infos) {
  const label = 'spec 锚定完整性';
  const root = git(['rev-parse', '--show-toplevel'], dirPath);
  if (root === null) {
    infos.push(`${label}：非 git 环境（git rev-parse 失败），跳过（不判 FAIL）`);
    return;
  }
  // base 解析：① 本目录首条 commit 之父 ② 主线 merge-base（diff 须覆盖本目录）③ HEAD~5
  let base = null;
  let baseHow = '';
  const first = git(['log', '--reverse', '--format=%H', '--', '.'], dirPath);
  if (first) {
    const parent = git(['rev-parse', `${first.split('\n')[0]}^`], dirPath);
    if (parent) {
      base = parent;
      baseHow = '本目录首提交之父（topic 起点）';
    }
  }
  if (!base) {
    for (const ref of ['main', 'origin/main', 'master']) {
      const mb = git(['merge-base', ref, 'HEAD'], dirPath);
      const head = git(['rev-parse', 'HEAD'], dirPath);
      // 仅当合并基 ≠ HEAD（确有分叉）且其 diff 覆盖本目录（基线对本 topic 有意义）时采用
      if (mb && head && mb !== head && git(['diff', '--name-only', mb, 'HEAD', '--', '.'], dirPath)) {
        base = mb;
        baseHow = `merge-base ${ref} HEAD（diff 覆盖本目录）`;
        break;
      }
    }
  }
  if (!base) {
    const h5 = git(['rev-parse', 'HEAD~5'], dirPath);
    if (h5) {
      base = h5;
      baseHow = 'HEAD~5';
    }
  }
  if (!base) {
    infos.push(`${label}：无可用对比基（首提交父/merge-base/HEAD~5 均不可得），跳过`);
    return;
  }

  // 快照场景守卫：base..HEAD 区间内触碰本目录的 commit 数——仅 1 个（squash 合入主线/整仓快照）时，
  // diff 会混入 Story 之前的非 task 变更（如方法论卷撰写），锚定检查失去归因前提，降级 INFO 跳过。
  // 开发分支正常场景=多个 task commit 递进，检查照常执行；快照的合规证据以开发分支闭合判定为准。
  const rangeLog = git(['log', '--format=%H', `${base}..HEAD`, '--', '.'], dirPath);
  const touchCount = rangeLog ? rangeLog.split('\n').filter(Boolean).length : 0;
  if (touchCount === 1) {
    infos.push(
      `${label}：区间内仅 1 个 commit 触碰本目录（基线 ${base.slice(0, 7)}..HEAD）——快照/squash 合入场景，锚定义务不可按 task 归因，跳过（合规证据见开发分支闭合判定）`,
    );
    return;
  }

  // 涉改文件：diff 全集 → 排除 specs/、drafts/ 工件自身（路径为仓根相对）
  const diffOut = git(['diff', '--name-only', base, 'HEAD'], root);
  const changed = diffOut ? diffOut.split('\n').filter(Boolean) : [];
  const scope = changed.filter((p) => !p.startsWith('specs/') && !p.startsWith('drafts/'));
  // 片段池：全部 task 涉改文件集声明的路径片段；命中 = 双向子串（文件含片段前缀，或片段含文件名）
  const fragments = new Set();
  for (const t of tasks.values()) for (const f of t.parsed.fragments) fragments.add(f);
  const missed = scope.filter((p) => ![...fragments].some((f) => p.includes(f) || f.includes(p)));
  for (const p of missed) {
    problems.push({ level: 'FAIL', rule: 'spec 锚定', where: `${p}：未命中任何 task 涉改文件集（git diff ${base.slice(0, 7)}..HEAD）` });
  }
  infos.push(
    `${label}：base=${base.slice(0, 7)}（${baseHow}），diff 涉改 ${changed.length} 件，排除 specs/drafts 工件后 ${scope.length} 件，` +
      (missed.length === 0 ? '全部命中 task 涉改文件集' : `${missed.length} 件未锚定`),
  );
}

/** 目录级检查主入口（约定见文件头注释） */
export function checkDag({ dirPath, withAnchoring = false }) {
  const problems = [];
  const infos = [];
  const files = readdirSync(dirPath)
    .filter((f) => /^T\d+.*\.md$/.test(f))
    .sort((a, b) => Number(a.match(/^T(\d+)/)[1]) - Number(b.match(/^T(\d+)/)[1]) || a.localeCompare(b));

  // 逐件结构检查 + 解析（fails=单件 FAIL 数；diff=闭合差集，供 push 闭合汇总）
  const tasks = new Map(); // 规范键 → { id: 展示名, file, parsed, fails, diff }
  for (const file of files) {
    const filePath = join(dirPath, file);
    const content = readFileSync(filePath, 'utf8');
    const fileProblems = checkTask({ filePath, content });
    problems.push(...fileProblems);
    const parsed = parseTaskArtifact({ content });
    tasks.set(fileKey(file), {
      id: file.match(/^T\d+/)[0],
      file,
      parsed,
      fails: fileProblems.filter((p) => p.level === 'FAIL').length,
      diff: Math.max(0, parsed.sensorsCount - parsed.judgedCount),
    });
  }

  // 1. DAG 引用存在（悬空 depends_on 逐条点名）
  const depsOf = new Map(); // 规范键 → 目录内存在的依赖键集合
  for (const [key, t] of tasks) {
    const set = new Set();
    for (const dep of t.parsed.dependsOn) {
      const dk = idKey(dep);
      if (tasks.has(dk)) set.add(dk);
      else {
        problems.push({
          level: 'FAIL',
          rule: 'DAG 引用存在',
          where: `${join(dirPath, t.file)}：depends_on 指向 ${dep}，目录内无对应 task 工件`,
        });
      }
    }
    depsOf.set(key, set);
  }

  // 2. DAG 无环：Kahn 拓扑排序（入度=未消解依赖数）；残余即环成员，沿未消解依赖边回走提取环路径
  const dependents = new Map(); // 被依赖方 → 依赖它的键集合（反向边）
  const indeg = new Map();
  for (const key of tasks.keys()) {
    dependents.set(key, new Set());
    indeg.set(key, depsOf.get(key).size);
  }
  // 反向边：dependents[d] = 目录内依赖 d 的全部键
  for (const [key, set] of depsOf) for (const d of set) dependents.get(d).add(key);
  const queue = [...tasks.keys()].filter((k) => indeg.get(k) === 0);
  const order = [];
  while (queue.length > 0) {
    const u = queue.shift();
    order.push(u);
    for (const v of dependents.get(u)) {
      indeg.set(v, indeg.get(v) - 1);
      if (indeg.get(v) === 0) queue.push(v);
    }
  }
  const resolved = new Set(order);
  const leftover = [...tasks.keys()].filter((k) => !resolved.has(k));
  if (leftover.length > 0) {
    // 沿未消解依赖边回走：残余节点必有残余依赖（否则早已出序），有限图内必 revisit 成环
    const start = leftover.sort(byKeyNum)[0];
    const path = [start];
    const at = new Map([[start, 0]]);
    let cur = start;
    let cycle = null;
    while (cycle === null) {
      const next = [...depsOf.get(cur)].filter((d) => !resolved.has(d)).sort(byKeyNum)[0];
      if (at.has(next)) cycle = path.slice(at.get(next));
      else {
        at.set(next, path.length);
        path.push(next);
        cur = next;
      }
    }
    const names = cycle.map((k) => tasks.get(k).id);
    problems.push({
      level: 'FAIL',
      rule: 'DAG 无环',
      where: `${dirPath}：存在依赖环（${names.join(' → ')} → ${names[0]}，拓扑残余 ${leftover.length} 件 task）`,
    });
  }

  // DAG 校验行：全过时输出通过信息行（存在 FAIL 时上面的点名行即 DAG 校验输出）
  if (!problems.some((p) => p.rule.startsWith('DAG'))) {
    infos.push(`DAG 校验：${tasks.size} 件 task，依赖引用全部存在，拓扑无环`);
  }

  // 3. chain 划分：无向连通分量即执行链（连通即同链），信息项
  const adj = new Map(); // 无向邻接
  for (const key of tasks.keys()) adj.set(key, new Set());
  for (const [key, set] of depsOf) {
    for (const d of set) {
      adj.get(key).add(d);
      adj.get(d).add(key);
    }
  }
  const visited = new Set();
  const parts = [];
  for (const key of [...tasks.keys()].sort(byKeyNum)) {
    if (visited.has(key)) continue;
    const comp = [];
    const stack = [key];
    visited.add(key);
    while (stack.length > 0) {
      const u = stack.pop();
      comp.push(u);
      for (const v of adj.get(u)) {
        if (!visited.has(v)) {
          visited.add(v);
          stack.push(v);
        }
      }
    }
    comp.sort(byKeyNum);
    const declared = [...new Set(comp.map((k) => tasks.get(k).parsed.chain).filter(Boolean))];
    const declText =
      declared.length === 1
        ? `声明 chain：${declared[0]}`
        : declared.length > 1
          ? `声明不一致：${declared.join('/')}（连通即同链，建议归一）`
          : '未声明 chain';
    parts.push(`链${parts.length + 1}（${comp.length} task）：${comp.map((k) => tasks.get(k).id).join('、')}（${declText}）`);
  }
  infos.push(`chain 划分（连通即同链，信息项）：共 ${parts.length} 条链——${parts.join('；')}`);

  // 4. push 闭合（D32）：闭合 = 单件 0 FAIL 且差集=0；含 FAIL 者列 FAIL（阻断推送），纯待判定者列 WARN
  const entries = [...tasks.entries()].map(([k, t]) => ({ k, ...t }));
  const closed = entries.filter((t) => t.fails === 0 && t.diff === 0);
  const broken = entries.filter((t) => t.fails > 0);
  const pending = entries.filter((t) => t.fails === 0 && t.diff > 0);
  if (broken.length === 0 && pending.length === 0) {
    infos.push(`push 闭合：通过（${closed.length}/${tasks.size} task 闭合，可推送）`);
  } else {
    for (const t of broken) {
      problems.push({
        level: 'FAIL',
        rule: 'push 闭合',
        where: `${join(dirPath, t.file)}：存在 ${t.fails} 项 FAIL，未闭合（须先修复 task 层问题再复检）`,
      });
    }
    if (pending.length > 0) {
      const list = pending.map((t) => `${t.id}（${t.diff} 项待判定）`).join('、');
      problems.push({ level: 'WARN', rule: 'push 闭合', where: `${closed.length}/${tasks.size} task 闭合，待判定：${list}` });
    }
  }

  // 5. spec 锚定完整性（跨级，check all 语义下开启）
  if (withAnchoring) specAnchoring(dirPath, tasks, problems, infos);

  return { problems, infos, count: tasks.size };
}
