#!/usr/bin/env node
// specp —— SpecPipe A 仓 CLI 入口。手写命令路由（承 B 仓 ocp 先例，不引 CLI 框架）：
// 命令表 + process.argv 解析 + --help，零 npm 依赖，Node ≥18，ESM。
// 退出码约定全命令统一（05-cli 契约）：0=成功 / 1=检查失败 / 2=用法错误。
import { main as mainCheck } from './commands/check.mjs';
import { main as mainColdstart } from './commands/coldstart.mjs';
import { main as mainRules } from './commands/rules.mjs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

// 命令表：T01 交付 coldstart/rules；T02 接入 check（spec/impl 层）；
// check 的 task 层与跨级（all）扩展由 T04 在此表内继续追加。
const COMMANDS = [
  {
    name: 'coldstart',
    summary: '棕地冷启动：铺设 specs/ 与 spec 骨架 + AGENTS.md 提示，输出项目事实盘点 JSON',
    main: mainColdstart,
  },
  {
    name: 'rules',
    summary: '规则速查：--list 列章节目录；<关键词> 全文检索语料（01-07 卷 + README）',
    main: mainRules,
  },
  {
    name: 'check',
    summary: '工件合规检查：spec/impl 结构、行数预算、锚定与引用（task/all 层待 T04 扩展）',
    main: mainCheck,
  },
];

// 帮助文本：按 05-cli 契约列三用途（含尚未交付的用途③，如实标注交付状态）
const USAGE = [
  'specp —— SpecPipe A 仓 CLI（方法论工具与语料字典）',
  '',
  '用法：specp <command> [args]',
  '',
  '三用途（05-cli 契约）：',
  '  ① 棕地项目冷启动 —— coldstart：脚手架铺设 + 项目事实盘点（JSON）',
  '  ② 规则手册速查 —— rules：条款级关键词检索与章节目录',
  '  ③ 工件合规检查 —— check：spec/impl/task/跨级机械检查（spec/impl 已交付；task/all 由 T04 扩展）',
  '',
  '命令：',
  ...COMMANDS.map((command) => `  ${command.name.padEnd(10)}${command.summary}`),
  '',
  '退出码：0=成功；1=检查失败；2=用法错误',
].join('\n');

/** 路由入口（导出供测试；import 本模块无副作用） */
export function main(argv) {
  const [name, ...rest] = argv;
  if (!name || name === '--help' || name === '-h') {
    console.log(USAGE);
    return 0;
  }
  const command = COMMANDS.find((c) => c.name === name);
  if (!command) {
    console.error(`未知命令：${name}`);
    console.error(USAGE);
    return 2;
  }
  return command.main(rest);
}

// 直接执行时走路由；被 import 时不产生副作用
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    process.exit(main(process.argv.slice(2)));
  } catch (error) {
    console.error(`specp 内部错误：${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}
