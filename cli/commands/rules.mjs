// specp rules —— 规则手册速查（05-cli 用途②）。
// 语料 = 仓根 01-07 卷 + README（cli/lib/corpus.mjs 白名单）；匹配 = 行级 includes
// 大小写不敏感，不分词；章节归属 = 向上最近的 ## 标题（corpus 预计算）。
// 退出码：0=成功（含"无命中"）；2=用法错误。本命令不产出 1（检查失败语义归 check 命令）。
import { loadCorpus, resolveCorpusFile } from '../lib/corpus.mjs';

/** `specp rules --list [卷名]`：列出各卷名 + 章节目录（## 级标题） */
function listVolumes(filter) {
  const corpus = loadCorpus();
  const selected = filter ? corpus.filter((item) => item.file === resolveCorpusFile(filter)) : corpus;
  if (selected.length === 0) {
    console.error(`用法错误：未知的卷名「${filter}」`);
    return 2;
  }
  for (const { file, title, headings } of selected) {
    console.log(`${file} —— ${title}`);
    if (headings.length === 0) {
      console.log('  （无 ## 级章节）');
      continue;
    }
    for (const heading of headings) {
      console.log(`  - ${heading.text}（L${heading.line}）`);
    }
  }
  return 0;
}

/** `specp rules <关键词>`：全文行级匹配，全部命中逐条列出（文件/行号/所在章节/该行内容） */
function searchKeyword(keyword) {
  const lowered = keyword.toLowerCase();
  const corpus = loadCorpus();
  let total = 0;
  const perFile = [];
  for (const { file, title, entries } of corpus) {
    const hits = entries.filter((entry) => entry.text.toLowerCase().includes(lowered));
    if (hits.length === 0) continue;
    total += hits.length;
    perFile.push(`${file} ×${hits.length}`);
    for (const { line, text, section } of hits) {
      console.log(`${file}:${line} [${section ?? title}] ${text.trim()}`);
    }
  }
  if (total === 0) {
    console.log(`无命中（关键词：「${keyword}」）`);
    return 0;
  }
  console.error(`—— 共 ${total} 处命中：${perFile.join('，')}`);
  return 0;
}

/**
 * 命令入口。
 * 用法：specp rules --list [卷名] | specp rules <关键词>
 * 返回退出码：0=成功；2=用法错误。
 */
export function main(args) {
  // 手写参数解析：--list（可跟可选卷名过滤）或单个关键词，二选一
  const positional = [];
  for (const arg of args) {
    if (arg === '--list' || arg === '-l') {
      positional.push('--list'); // -l 归一为 --list
    } else if (arg.startsWith('--')) {
      console.error(`用法错误：未知参数 ${arg}`);
      return 2;
    } else {
      positional.push(arg);
    }
  }
  const listIndex = positional.indexOf('--list');
  if (listIndex !== -1) {
    const rest = positional.filter((_, i) => i !== listIndex);
    if (rest.length > 1) {
      console.error('用法错误：--list 至多跟一个卷名');
      return 2;
    }
    return listVolumes(rest[0]);
  }
  if (positional.length === 0) {
    console.error('用法错误：需要 --list [卷名] 或一个关键词');
    console.error('用法：specp rules --list [卷名] | specp rules <关键词>');
    return 2;
  }
  if (positional.length > 1) {
    console.error('用法错误：至多一个关键词（多词检索请逐词查询）');
    return 2;
  }
  const keyword = positional[0];
  if (keyword.trim() === '') {
    console.error('用法错误：关键词不能为空白');
    return 2;
  }
  return searchKeyword(keyword);
}
