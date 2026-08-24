# Agent 预设：ES 日志排查助手（es-log-assistant）

随 elasticsearch-settings 插件一起提供的一个 Agent 预设。它复制自 `standard`（标准模式），
只替换了 `persona`，使 Agent 以「只读日志/链路排查」的角色工作。

## 角色定位

- **只读**：只读取工作区中的文件（源码、配置、日志），不创建/修改/删除任何文件。
- 根据用户提供的信息 + 工作区文件 + Elasticsearch 日志回答问题。
- 当用户给出 `trace_id`、或想按内容/自然语言查日志（错误消息、异常类型、关键词）时，
  调用 `es_query_logs` 工具检索 Elasticsearch，并与工作区文件关联后作答。

## 检索方式（es_query_logs 工具）

- `trace_id`：精确匹配 trace 字段（`trace_id`/`trace.id`/`traceId`/`traceID`）。
- `query`：自然语言关键词，匹配 `message`/`exception`/`stack_trace` 等日志文本字段；
  可配 `fields` 指定字段、`index` 指定索引模式、`size` 限制条数。
- 两者可同时使用（先按 trace 收敛，再按内容过滤）。
- 连接信息来自 **Settings → Elasticsearch**（URIs / username / password），
  由 `@asuka1121/dsh-client-ui-elasticsearch` 插件提供并全局共享。

## 文件

| 文件 | 作用 |
| ---- | ---- |
| `agent.cordis.yml` | 预设组合（standard 的全套工具 + 替换后的 persona） |
| `preset.yml`     | 显示名称与描述 |

## 安装位置

已安装到用户预设根目录（`~/.dsh/.agent-presets/es-log-assistant/`），并镜像到此目录。
在会话/预设选择器中会出现「ES 日志排查助手」。

## 前置条件

- 安装并配置 ES 插件：
  `dsh plugin --profile <name> add @asuka1121/dsh-client-ui-elasticsearch@latest`，
  然后在 Settings → Elasticsearch 填入 URIs（可选用户名/密码），重启部署。
- 本预设的 persona 会主动调用 `es_query_logs`；未装插件时该工具不存在，需先安装。

## 关于「只读」的说明

- 预设本身**不能**设置沙箱模式（沙箱是会话级/主机级边界）。本预设通过 persona
  强约束「只读」行为。
- 需要**硬性**只读时，请在该会话里把访问模式切到 **read-only**（沙箱会拒绝一切写操作，
  `pwsh` 也会进入 ConstrainedLanguage）。
