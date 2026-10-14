// task 工件结构合规检查（05-cli 用途③ task 级；结构依据 = 03-artifacts「task 工件」结构表）。
// 全部为机械检查，不做语义判断：
//   1. 元信息三字段——depends_on / chain / 分支（03-artifacts task 元信息结构），缺失即 FAIL
//   2. guides 节存在且至少一条 guide 含 spec 锚点引用（G<数字> / AC<数字> / 「spec」字样，06-charter R13）
//      ——节缺失、无 guide 条目、有条目但均无锚点，均 FAIL
//   3. sensors 节存在且每条 sensor 含类型标注「计算型|推断型」（R14）——节缺失、无条目 FAIL；逐条缺标注按行号点名
//   4. 「sensor 判定」节存在——缺失仅 WARN（允许执行前工件，判定由 sensor 执行后回填）
//   5. 闭合差集（D32：闭合=全部 sensor 有判定）——声明 sensor 条数 vs 判定节已写判定条数（`- [` 开头行），
//      差集>0 报 WARN「N 项待判定」；判定节缺失时不再另报差集（判定节 WARN 已覆盖同一事实）
// 另导出 parseTaskArtifact：目录级检查（check-dag.mjs）复用的结构化解析——
// depends_on 编号列表 / chain 值 / 涉改文件集路径片段（范围节反引号 span，路径形态过滤）/ sensor 与判定计数。
// API：checkTask({ filePath, content }) → [{ level: 'FAIL'|'WARN', rule, where }]，空数组 = 全过。

// guides 的 spec 锚点形态（R13）：spec 规则号（G1）/验收号（AC4）或「spec」字样引用（含 spec 路径形态）
const GUIDE_ANCHOR = /G\d|AC\d|spec[\s：:]|specs?\//i;
// sensors 类型标注两分类（R14）
const SENSOR_TYPE = /计算型|推断型/;
// 涉改文件集片段的路径形态过滤：纯路径字符（字母/数字/_@~./-）且 ≥3 长——排除含空格/中文的散文反引号
const PATH_LIKE = /^[A-Za-z0-9_@~./-]{3,}$/;

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

/**
 * 谓词匹配取节正文：返回首个命中 ## 标题的正文行数组（[{ text, no }]，no=1 基行号，
 * 标题行之后、下一 ## 标题之前）；节缺失返回 null。谓词收归一化标题，由各节常量表达包含与排除。
 */
function sectionLines(content, headings, match) {
  const hit = headings.find(match);
  if (!hit) return null;
  const lines = content.split('\n');
  const body = [];
  // hit.line 为 1 基行号，作 0 基索引恰指向标题行的下一行
  for (let i = hit.line; i < lines.length; i++) {
    if (lines[i].startsWith('## ')) break;
    body.push({ text: lines[i], no: i + 1 });
  }
  return body;
}

// 各节标题谓词（归一化子串匹配；sensors 节须排除「判定」节——其标题同含 sensor 字样，靠「判定」排除）
const isMeta = (h) => h.norm.includes('元信息');
const isScope = (h) => h.norm.includes('范围');
const isGuides = (h) => h.norm.toLowerCase().includes('guide');
const isSensors = (h) => h.norm.toLowerCase().includes('sensor') && !h.norm.includes('判定');
const isJudge = (h) => h.norm.includes('判定');

/** 元信息节内按正则找字段行；节缺失（null）按空数组处理 */
const findMetaLine = (metaBody, re) => (metaBody ?? []).find((l) => re.test(l.text));

/** depends_on 编号列表：字段行内全部 T<数字> 记号（去重保序；引用存在性校验归目录级 check-dag） */
function parseDependsOn(metaBody) {
  const line = findMetaLine(metaBody, /depends_on/);
  if (!line) return [];
  return [...new Set([...line.text.matchAll(/T\d+/g)].map((m) => m[0]))];
}

/** chain 值：冒号后首个空白/括号前的 token（如「c1（全图经 T07 连通，单链）」→ c1） */
function parseChain(metaBody) {
  const line = findMetaLine(metaBody, /chain[：:]/);
  if (!line) return '';
  return line.text.replace(/^.*?chain[：:]/, '').trim().split(/[（(\s]/)[0];
}

/** 涉改文件集路径片段：范围节内含「涉改文件集」的行中反引号 span，过滤非路径形态（去重保序） */
function parseFragments(scopeBody) {
  const fragments = [];
  for (const { text } of scopeBody ?? []) {
    if (!text.includes('涉改文件集')) continue;
    for (const m of text.matchAll(/`([^`]+)`/g)) {
      const frag = m[1].trim();
      if (PATH_LIKE.test(frag)) fragments.push(frag);
    }
  }
  return [...new Set(fragments)];
}

/** 结构化解析（目录级检查复用，见文件头注释） */
export function parseTaskArtifact({ content }) {
  const headings = parseHeadings(content);
  const metaBody = sectionLines(content, headings, isMeta);
  const scopeBody = sectionLines(content, headings, isScope);
  const sensorsBody = sectionLines(content, headings, isSensors);
  const judgeBody = sectionLines(content, headings, isJudge);
  return {
    dependsOn: parseDependsOn(metaBody),
    chain: parseChain(metaBody),
    fragments: parseFragments(scopeBody),
    sensorsCount: (sensorsBody ?? []).filter(({ text }) => /^\s*-\s*sensor/.test(text)).length,
    judgedCount: (judgeBody ?? []).filter(({ text }) => /^\s*-\s*\[/.test(text)).length,
  };
}

/** task 结构检查主入口（约定见文件头注释） */
export function checkTask({ filePath, content }) {
  const problems = [];
  const headings = parseHeadings(content);
  const where = (detail) => `${filePath}：${detail}`;

  // 1. 元信息三字段（节缺失时三字段一并点名——字段检查依赖节存在，不重复报节缺失）
  const metaBody = sectionLines(content, headings, isMeta);
  if (metaBody === null) {
    problems.push({ level: 'FAIL', rule: '元信息', where: where('缺失「元信息」节（depends_on/chain/分支三字段载体）') });
  } else {
    if (!findMetaLine(metaBody, /depends_on/)) {
      problems.push({ level: 'FAIL', rule: '元信息', where: where('缺 depends_on 字段（无依赖也须声明 depends_on: []）') });
    }
    if (!findMetaLine(metaBody, /chain[：:]/)) {
      problems.push({ level: 'FAIL', rule: '元信息', where: where('缺 chain 字段（所属执行链）') });
    }
    if (!findMetaLine(metaBody, /分支/)) {
      problems.push({ level: 'FAIL', rule: '元信息', where: where('缺「分支/执行者」字段') });
    }
  }

  // 2. guides 节 + spec 锚点（R13）
  const guidesBody = sectionLines(content, headings, isGuides);
  if (guidesBody === null) {
    problems.push({ level: 'FAIL', rule: 'guides 锚点', where: where('缺失「guides」节') });
  } else {
    const guideLines = guidesBody.filter(({ text }) => /^\s*-\s*guide/.test(text));
    if (guideLines.length === 0) {
      problems.push({ level: 'FAIL', rule: 'guides 锚点', where: where('guides 节无 guide 条目（- guide: …）') });
    } else if (!guideLines.some(({ text }) => GUIDE_ANCHOR.test(text))) {
      problems.push({
        level: 'FAIL',
        rule: 'guides 锚点',
        where: where(`guides ${guideLines.length} 条均无 spec 锚点引用（R13：须含 G<数字>/AC<数字>/spec 引用）`),
      });
    }
  }

  // 3. sensors 节 + 类型标注（R14，逐条按行号点名）
  const sensorsBody = sectionLines(content, headings, isSensors);
  let sensorsCount = 0;
  if (sensorsBody === null) {
    problems.push({ level: 'FAIL', rule: 'sensors 类型', where: where('缺失「sensors」节') });
  } else {
    const sensorLines = sensorsBody.filter(({ text }) => /^\s*-\s*sensor/.test(text));
    sensorsCount = sensorLines.length;
    if (sensorLines.length === 0) {
      problems.push({ level: 'FAIL', rule: 'sensors 类型', where: where('sensors 节无 sensor 条目（- sensor: …）') });
    } else {
      for (const { text, no } of sensorLines) {
        if (!SENSOR_TYPE.test(text)) {
          problems.push({ level: 'FAIL', rule: 'sensors 类型', where: where(`第 ${no} 行 sensor 缺类型标注（R14：须含「计算型」或「推断型」）`) });
        }
      }
    }
  }

  // 4. 判定节存在性（WARN 级：允许执行前工件）
  const judgeBody = sectionLines(content, headings, isJudge);
  if (judgeBody === null) {
    problems.push({ level: 'WARN', rule: '判定节', where: where('缺失「sensor 判定」节（允许执行前工件）') });
  }

  // 5. 闭合差集（D32）：两节齐备才计差集；判定节缺失已由上条 WARN 覆盖，不重复报
  if (sensorsBody !== null && judgeBody !== null) {
    const judged = judgeBody.filter(({ text }) => /^\s*-\s*\[/.test(text)).length;
    const diff = sensorsCount - judged;
    if (diff > 0) {
      problems.push({ level: 'WARN', rule: '闭合差集', where: where(`${diff} 项待判定（声明 ${sensorsCount} 条 sensor，判定节已写 ${judged} 条）`) });
    }
  }
  return problems;
}
