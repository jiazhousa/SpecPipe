# T07: 最小 CRM sandbox 初始化 + pi 注入 + 指派开发

## 元信息
- depends_on: [T03, T04, T06]
- chain: c1
- 分支/执行者: v3-drafts / 主会话统筹（OpenCode 扮演指派方）

## 范围
- 涉改文件集：sandbox 仓 `~/project/minimal-crm/`（新建 git 仓，非 A 仓）；A 仓内仅 `specs/specp-cli-and-skills/dispatch-record.md`（指派与观察记录）
- 统筹要点：impl「验收」节

## guides（前馈）
- guide: spec 验收标准 3 + 决策记录（GLM-5.3 主会话 / deepseek-flash sensor）| type: 计算型（机械引用）
- guide: 最小 CRM 需求边界（由统筹扮演用户向 pi 提出）：客户信息 CRUD（JSON 文件存储）+ 跟进记录关联客户 + CLI 命令行操作；目标=spec-anchored 链路验证非 CRM 完备性。流程期望：pi 加载 skill → spec 同步（coldstart 产物）→ spec 三要素+逐项确认 → impl 统筹 → tasks 执行（sensor 调用含 deepseek sidecar）→ 收敛 | type: 推断型（统筹撰写）
- guide: **HITL 前置依赖**：用户完成 pi 的 provider/auth 配置（zhipuai + deepseek）方可启动 | type: 计算型（机械引用）

## sensors（反馈）
- sensor: sandbox 初始化检查——`specp coldstart` 产物存在、pi 配置就绪（用户 auth 完成）、skill 加载确认 | type: 计算型（CLI）
- sensor: pi 会话产出工件链（spec/impl/tasks/commits）真实存在且渐进生成（会话记录可复查卡点）| type: 推断型（sidecar 会话）

## sensor 判定
（执行后回填）
