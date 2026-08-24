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

## 未来计划

**愿景。** 日志检索插件的真正价值在于「关联」：不只是找到日志，而是把每条日志都溯源到产生它的项目代码。长期目标正是实现这种「日志 → 代码」的可追溯分析。

**当前边界。** 目前 Agent 只能把日志与本地工作区做关联。代码侧集成暂缓——等 dsh 官方开放远程/网络工作区访问（例如绑定 `0.0.0.0`）再启动；Agent 够不到的工作区，做代码关联没有意义。

**待解难点：代码获取。** 目前的设想是在**服务器端**按需拉取：每次询问前，根据日志里的 `app_name` 克隆对应项目，让答案自包含、始终基于最新代码。但为每个应用保存完整克隆的存储开销太大，正在评估更轻量的方案：浅/部分克隆、只懒加载 trace 命中的相关文件、缓存与淘汰策略等。
