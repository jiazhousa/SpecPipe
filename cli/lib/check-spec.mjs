// spec 工件结构合规检查（05-cli 用途③ spec 级；结构依据 = 03-artifacts「spec 工件」结构表）。
// 全部为机械检查，输出确定性事实，不做语义判断：
//   1. 必填章节存在性——## 级标题白名单匹配（含标题变体；「目标与非目标」合并/分立均可）
//   2. 判定节存在性——缺失仅 WARN（允许执行前工件，判定由 sensor 执行后回填）
//   3. Issue 锚定声明——元信息「分级」含 Issue 时，须有「锚定：<目标 spec 路径>」字段
//   4. 行数预算——含 [NEEDS CLARIFICATION 即草案（Story ≤100 行），否则终稿（≤300 行）；
//      Epic 草案 ≤200 / 终稿 ≤500；Issue 轻量不设（均见 03-artifacts）
// API：checkSpec({ filePath, content }) → [{ level: 'FAIL'|'WARN', rule, where }]，空数组 = 全过。

// 必填章节白名单：[章节名, 归一化标题的可接受子串集合]（归一化 = 标题剥离全部空白后子串匹配）
const REQUIRED_SECTIONS = [
  ['元信息', ['元信息']],
  ['背景', ['背景']],
  ['需求本身', ['需求本身']],
  ['主要影响', ['主要影响']],
  ['副作用', ['副作用']],
  ['验收标准', ['验收']],
  ['决策记录', ['决策']],
];

// 行数预算（03-artifacts）：[草案上限, 终稿上限]，按元信息分级取用；issue=null 表示不设
const LINE_BUDGET = { story: [100, 300], epic: [200, 500], issue: null };

/** 解析 ## 级标题 → [{ line, text, norm }]；norm = 剥离全部空白后的标题（含全角空格） */
function parseHeadings(content) {
  const headings = [];
  content.split('\n').forEach((text, i) => {
    if (!text.startsWith('## ')) return;
    const raw = text.slice(3).trim();
    headings.push({ line: i + 1, text: raw, norm: raw.replace(/\s/g, '') });
  });
  return headings;
}

/** 取白名单首个命中节的正文行数组（标题行之后、下一 ## 标题之前）；节缺失返回 null */
function sectionBody(content, headings, whitelist) {
  const hit = headings.find((h) => whitelist.some((w) => h.norm.includes(w)));
  if (!hit) return null;
  const lines = content.split('\n');
  const body = [];
  // hit.line 为 1 基行号，作 0 基索引恰指向标题行的下一行
  for (let i = hit.line; i < lines.length; i++) {
    if (lines[i].startsWith('## ')) break;
    body.push(lines[i]);
  }
  return body;
}

/** 元信息分级取值：「分级：」冒号后的文本（节/行缺失返回空串，调用方按缺省口径处理） */
function parseGrade(metaBody) {
  const line = (metaBody ?? []).find((l) => /分级[：:]/.test(l));
  if (!line) return '';
  return line.slice(line.search(/分级[：:]/)).replace(/^分级[：:]/, '').trim();
}

/** spec 结构检查主入口（约定见文件头注释） */
export function checkSpec({ filePath, content }) {
  const problems = [];
  const headings = parseHeadings(content);
  const where = (detail) => `${filePath}：${detail}`;

  // 1a. 必填章节存在性（「目标与非目标」单列三形态判定，见 1b）
  for (const [name, whitelist] of REQUIRED_SECTIONS) {
    if (!headings.some((h) => whitelist.some((w) => h.norm.includes(w)))) {
      problems.push({ level: 'FAIL', rule: '必填章节', where: where(`缺失「${name}」节（## 级标题白名单匹配）`) });
    }
  }
  // 1b. 目标与非目标：合并节（如「目标 / 非目标」「目标与非目标」）、单独「目标」、分立「目标」+「非目标」均可。
  //     判定口径 = 剥离全部「非目标」子串后仍含「目标」（仅有「非目标」节不满足——其标题本身含「目标」子串，须排除）。
  if (!headings.some((h) => h.norm.replaceAll('非目标', '').includes('目标'))) {
    problems.push({ level: 'FAIL', rule: '必填章节', where: where('缺失「目标与非目标」节（合并节或分立均可）') });
  }

  // 2. 判定节存在性（WARN 级：允许执行前工件）
  if (!headings.some((h) => h.norm.includes('判定'))) {
    problems.push({ level: 'WARN', rule: '判定节', where: where('缺失「sensor 判定」节（允许执行前工件）') });
  }

  // 3. Issue 锚定声明：锚定行须行首列表形态且冒号后非空（防把「分级：…须含锚定声明：…」模板注释误判为锚定）
  const metaBody = sectionBody(content, headings, ['元信息']);
  const grade = parseGrade(metaBody);
  if (/issue/i.test(grade)) {
    const anchored = (metaBody ?? []).some((l) => /^\s*[-*>]?\s*锚定[^\n：:]*[：:]\s*\S+/.test(l));
    if (!anchored) {
      problems.push({ level: 'FAIL', rule: 'Issue 锚定', where: where('分级=Issue，元信息须含「锚定：<目标 spec 路径>」声明') });
    }
  }

  // 4. 行数预算：分级不可解析时按 Story 缺省口径（元信息缺失已由章节规则 FAIL，此处不重复报）
  const budget = /epic/i.test(grade) ? LINE_BUDGET.epic : /issue/i.test(grade) ? LINE_BUDGET.issue : LINE_BUDGET.story;
  if (budget) {
    const lines = content.split('\n');
    if (lines.length > 0 && lines[lines.length - 1] === '') lines.pop(); // 对齐 wc -l：末尾换行不计一行
    const isDraft = (content.match(/\[NEEDS CLARIFICATION/g) ?? []).length > 0;
    const limit = isDraft ? budget[0] : budget[1];
    if (lines.length > limit) {
      const gradeLabel = /epic/i.test(grade) ? 'Epic ' : '';
      problems.push({
        level: 'FAIL',
        rule: '行数预算',
        where: where(`${isDraft ? '草案' : '终稿'} ${lines.length} 行，超 ${gradeLabel}上限 ${limit} 行`),
      });
    }
  }
  return problems;
}
