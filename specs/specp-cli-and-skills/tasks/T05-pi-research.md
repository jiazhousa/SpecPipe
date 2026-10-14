# T05: pi 扩展机制采证

## 元信息
- depends_on: []
- chain: c1
- 分支/执行者: v3-drafts / 主会话统筹派发（采证=推断型 sensor 用途）

## 范围
- 涉改文件集：`specs/specp-cli-and-skills/pi-research.md`（采证报告，过程工件）
- 统筹要点：impl「验收」节前置——为 T06/T07 提供事实

## guides（前馈）
- guide: spec G2/G3/AC3（为 skills 形态与验收路由提供事实）+ 采证问题清单（见 sensors）| type: 计算型（机械引用）
- guide: 只读采证——pi --help 各子命令 / ~/.pi 结构 / pi 官方文档（npm pi-coding-agent）；结论逐条附来源，不确定标「未确认」| type: 推断型（统筹撰写）

## sensors（反馈）
- sensor: 报告覆盖六问：①扩展包目录形态（skills 资源是否存在）②本地包安装（pi install ./path）产物结构 ③provider/model 配置法（zhipuai GLM-5.3、deepseek-flash 的 id 与 auth）④-p 非交互与退出码 ⑤会话/上下文注入（--append-system-prompt / AGENTS.md）⑥sidecar 调用可行性（shell 起 pi 会话作 sensor 载体）| type: 推断型（sidecar 会话）

## sensor 判定
（执行后回填）
