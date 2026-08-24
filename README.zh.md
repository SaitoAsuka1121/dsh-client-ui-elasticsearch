# dsh-client-ui-elasticsearch

> [English](README.md) | 中文

一个 DeepSeek Harness 插件：在 Settings 中新增 **Elasticsearch** 设置页，并提供 Host 侧模型工具 `es_query_logs`。

- **Settings → Elasticsearch**：配置 `uris`（每行一个）、`username`、`password`。配置写入共享的 DSH 设置文档，跨会话共享。
- **`es_query_logs` 工具**：按 `trace_id` 精确检索，**和/或**通过 `query` 用自然语言检索（匹配 `message`、`exception` 等日志文本字段），支持可选 `fields`、`index`、`size`。复用上述连接配置。
- **自动指引**：系统提示词中自动注入「给了 trace_id 或问日志内容就用 `es_query_logs`」，无需专门 Agent 预设。

## 安装

```sh
dsh plugin --profile web add @asuka1121/dsh-client-ui-elasticsearch@latest
```

重启部署即可。包声明了 `dsh.bundle.patch`，`dsh plugin` 会自动注册为 profile bundle。

> 需要 pnpm 在 `PATH` 上。插件的 `@deepseek-ai/*` 运行时依赖以 peerDependencies 方式从 DSH 安装中解析，共享同一份 Cordis 实例。

## 工具

`es_query_logs` 参数：

| 参数 | 类型 | 必填 | 默认 | 说明 |
| ---- | ---- | ---- | ---- | ---- |
| `query` | string | 否* | — | 自然语言检索词，匹配日志文本字段（如 `"connection refused"`、`"NullPointerException"`） |
| `trace_id` | string | 否* | — | 精确 trace id，检索 trace 字段 |
| `fields` | string[] | 否 | 常用日志文本字段 | `query` 匹配的显式字段列表；**不支持通配符** |
| `index` | string | 否 | `*` | 索引模式 |
| `size` | integer | 否 | `100` | 最大命中数，上限 500 |

\* `query` 与 `trace_id` 至少提供其一。

- `trace_id` 对 `trace_id`、`trace.id`、`traceId`、`traceID` 做精确 `term` 查询。
- `query` 对解析后的字段做 `multi_match`（best_fields），避免通配符字段展开在宽索引上报错。
- 两者同时使用会先按 trace 收敛、再按内容过滤；结果按 `@timestamp` 倒序，依次尝试每个配置的 URI。

## 完整安装 / 使用说明

新电脑安装流程、可选 Agent 预设（es-log-assistant）、常见问题排查见 [INSTALL.md](INSTALL.md)。

## 许可

MIT

## 开发

编译产物 `lib/` 随仓库分发，可直接从目录安装。从源码构建需要
[deepseek-harness](https://github.com/deepseek-ai/deepseek-harness) monorepo：
`tsdown.config.ts` 引用了 `packages/client/tsdown.client.ts` 的 `clientBundle` 预设。
npm 发布包（`@asuka1121/dsh-client-ui-elasticsearch`）是规范的构建产物。
