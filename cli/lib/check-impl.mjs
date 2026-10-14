// impl 工件结构合规检查（05-cli 用途③ impl 级；结构依据 = 03-artifacts「impl 工件」结构表）。
// 全部为机械检查，不做语义判断：
//   1. 必填章节存在性——元信息 + spec 引用 / 技术方案 / 任务切分 / 涉改文件总清单 / 收尾清单（FAIL 级）；
//      sensors / sensor 判定 两节为 WARN 级（允许执行前工件，同 spec 层判定节口径）
//   2. 锚定 spec 引用存在性——解析「锚定 spec：`路径`」（兼容裸路径形态），解析后核对文件存在
//   3. 任务切分表存在性——任务切分节内须有「| task |」表头行
// API：checkImpl({ filePath, content }) → [{ level: 'FAIL'|'WARN', rule, where }]，空数组 = 全过。
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

// 必填章节白名单：[章节名, 归一化标题的可接受子串集合]（归一化 = 标题剥离全部空白后子串匹配）
const REQUIRED_SECTIONS = [
  ['元信息 + spec 引用', ['元信息']],
  ['技术方案', ['技术方案']],
  ['任务切分', ['任务切分']],
  ['涉改文件总清单', ['涉改文件']],
  ['收尾清单', ['收尾']],
];

// 锚定 spec 引用两种形态：反引号路径（首选，模板即此形态）；裸路径（回退兼容）
const REF_TICKED = /锚定\s*spec\s*[：:]\s*`([^`]+)`/g;
const REF_BARE = /锚定\s*spec\s*[：:]\s*([^\s`|，。；）)]+)/g;

/** 解析 ## 级标题 → [{ line, text, norm }]；norm = 剥离全部空白后的标题 */
function parseHeadings(content) {
  const headings = [];
  content.split('\n').forEach((text, i) => {
    if (!text.startsWith('## ')) return;
    const raw = text.slice(3).trim();
    headings.push({ line: i + 1, text: raw, norm: raw.replace(/\s/g, '') });
  });
  return headings;
}

/** 收集全部锚定 spec 引用路径（去重）；有反引号形态时不再叠加裸路径形态，防同一路径双报 */
function collectSpecRefs(content) {
  const ticked = [...content.matchAll(REF_TICKED)].map((m) => m[1].trim()).filter(Boolean);
  if (ticked.length > 0) return [...new Set(ticked)];
  return [...new Set([...content.matchAll(REF_BARE)].map((m) => m[1].trim()).filter(Boolean))];
}

/**
 * 引用存在性核对。锚定 spec 路径按仓根相对书写，但本命令可从任意 cwd 调用，
 * 故按基准候选集解析：当前工作目录 / impl 文件所在目录 / 其上级目录（topic 目录 → 仓根），
 * 任一基准下存在即视为存在（确定性：候选顺序固定，首个命中即真）。
 */
function refExists(filePath, ref) {
  const implDir = dirname(resolve(filePath));
  return [process.cwd(), implDir, dirname(implDir)].some((base) => existsSync(resolve(base, ref)));
}

/** impl 结构检查主入口（约定见文件头注释） */
export function checkImpl({ filePath, content }) {
  const problems = [];
  const headings = parseHeadings(content);
  const where = (detail) => `${filePath}：${detail}`;

  // 1. 必填章节（FAIL 级）
  for (const [name, whitelist] of REQUIRED_SECTIONS) {
    if (!headings.some((h) => whitelist.some((w) => h.norm.includes(w)))) {
      problems.push({ level: 'FAIL', rule: '必填章节', where: where(`缺失「${name}」节（## 级标题白名单匹配）`) });
    }
  }
  // sensors 节（WARN 级）：匹配含 sensor 但不含「判定」的标题，与判定节互斥区分
  if (!headings.some((h) => h.norm.toLowerCase().includes('sensor') && !h.norm.includes('判定'))) {
    problems.push({ level: 'WARN', rule: 'sensors 节', where: where('缺失「sensors」节（允许执行前工件）') });
  }
  // sensor 判定节（WARN 级）
  if (!headings.some((h) => h.norm.includes('判定'))) {
    problems.push({ level: 'WARN', rule: '判定节', where: where('缺失「sensor 判定」节（允许执行前工件）') });
  }

  // 2. 锚定 spec 引用存在性
  const refs = collectSpecRefs(content);
  if (refs.length === 0) {
    problems.push({ level: 'FAIL', rule: 'spec 引用', where: where('未找到「锚定 spec：`路径`」引用') });
  } else {
    for (const ref of refs) {
      if (!refExists(filePath, ref)) {
        problems.push({ level: 'FAIL', rule: 'spec 引用', where: where(`锚定 spec「${ref}」文件不存在`) });
      }
    }
  }

  // 3. 任务切分表：仅在任务切分节存在时检查表头（节缺失已由必填章节规则 FAIL，不重复报）
  const splitHit = headings.find((h) => h.norm.includes('任务切分'));
  if (splitHit) {
    const lines = content.split('\n');
    const body = [];
    for (let i = splitHit.line; i < lines.length; i++) {
      if (lines[i].startsWith('## ')) break;
      body.push(lines[i]);
    }
    if (!body.some((l) => l.includes('| task |'))) {
      problems.push({ level: 'FAIL', rule: '任务切分表', where: where('任务切分节缺「| task |」表头') });
    }
  }
  return problems;
}
