// 语料加载：rules 速查的唯一数据源（05-cli 用途②——CLI 携带方法论语料）。
// 语料 = 本仓（A 仓）根目录 01-07 规章卷 + README 术语表，文件清单硬编码白名单——
// 不做目录扫描，保证语料边界确定、可审计；后续扩展（review-rules）时在此清单追加。
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// 语料文件白名单（仓根相对路径，按目录顺序排列）
export const CORPUS_FILES = [
  '01-principles.md',
  '02-process.md',
  '03-artifacts.md',
  '04-control.md',
  '05-cli.md',
  '06-charter.md',
  '07-environment.md',
  'README.md',
];

/** CLI 所属仓根（cli/lib/corpus.mjs 向上两级）——语料与 templates 的定位基准 */
export function repoRoot() {
  return resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
}

/**
 * 加载全部语料。
 * 返回：[{ file, title, headings, entries }]
 *   - title：卷名（文件首个 `# ` 标题；缺失时回退文件名）
 *   - headings：全部 `## ` 级标题 [{ line, text }]（rules --list 消费）
 *   - entries：逐行条目 [{ line, text, section }]，section = 向上最近的 `## `
 *     标题（首个 `## ` 之前的行归属卷首，以 `# ` 卷名标注；命中行自身为 `## `
 *     标题时归属其本身）
 */
export function loadCorpus() {
  const root = repoRoot();
  return CORPUS_FILES.map((file) => {
    const raw = readFileSync(join(root, file), 'utf8');
    const lines = raw.split('\n');
    let title = file; // 无 `# ` 标题时的兜底
    let section = null; // 当前所属 ## 章节（null = 卷首，展示时用 title）
    const headings = [];
    const entries = [];
    lines.forEach((text, i) => {
      const line = i + 1;
      if (text.startsWith('# ') && section === null) {
        // 仅在进入首个 ## 之前遇到的首个 # 视为卷名（README 正文可能再现 # 的情况不覆盖，白名单语料已核实每卷单一 #）
        title = text.slice(2).trim();
      }
      if (text.startsWith('## ')) {
        section = text.slice(3).trim();
        headings.push({ line, text: section });
      }
      entries.push({ line, text, section });
    });
    return { file, title, headings, entries };
  });
}

/**
 * 按 --list 的卷名参数解析唯一语料文件（支持 `03` / `03-artifacts` / `03-artifacts.md` / `readme`）。
 * 命中返回文件名，未命中返回 null（调用方按用法错误处理）。
 */
export function resolveCorpusFile(name) {
  const normalized = String(name).toLowerCase().replace(/\.md$/, '');
  return (
    CORPUS_FILES.find((file) => {
      const base = file.toLowerCase().replace(/\.md$/, '');
      return base === normalized || base.slice(0, 2) === normalized;
    }) ?? null
  );
}
