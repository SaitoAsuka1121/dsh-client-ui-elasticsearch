# Elasticsearch 日志检索插件 · 安装与使用说明

发布在 npm 上的 DSH 插件：**`@asuka1121/dsh-client-ui-elasticsearch`**（当前 `@latest` = **0.2.0**）。它提供三样东西：

1. **Settings → Elasticsearch 设置页** —— 配置 `uris`（每行一个）/ `username` / `password`，写入**共享 DSH 设置文档**，跨会话共享、重启保留。
2. **`es_query_logs` 模型工具** —— 按 `trace_id` 精确查，**或按自然语言/关键词按内容查**（`message`、`exception`、`stack_trace` 等字段），任意会话可用。
3. **全局工具指引** —— 系统提示词自动注入「给了 trace_id 或问日志内容就用 `es_query_logs`」，**不需要专门预设**，默认 agent 也会主动调用。

---

## 一、在新电脑上安装

包已公开发布，**不需要任何 npm 账号或令牌**。

### 1. 安装插件（一条命令）

```sh
dsh plugin --profile web add @asuka1121/dsh-client-ui-elasticsearch@latest
```

> - `web` 换成你实际用的 profile 名：`dsh plugin --profile <名字> add ...`
> - 底层是 `pnpm add`，所以**先装 pnpm**：`npm i -g pnpm`，并确认 `pnpm -v` 能跑。
> - 因为包声明了 `dsh.bundle.patch`（自带 `cordis.patch.yml`），装完后会被自动并入该 profile 的 bundles，无需手动改任何文件。

### 2. 重启部署

```sh
dsh --profile web
```

（或按你平时的启动方式；重启后浏览器刷新页面。）

### 3. 配置 Elasticsearch 连接

打开 Web GUI → **Settings（设置）→ Elasticsearch**：

- `uris`：每行一个，如 `http://192.168.1.10:9200`（自签证书用 `https://`）
- `username` / `password`：没有认证就留空

> 配置写入**该机器**的公共设置文档，换机器/重装后需重新填写（密钥不随插件分发）。

---

## 二、使用

装完插件后，**任意会话**（默认 agent 即可）都可以这样问：

| 你想做什么 | 直接说 | 工具实际调用 |
|---|---|---|
| 查某次请求的全链路 | 「帮我查 trace_id=`abc123` 的日志」 | `trace_id: "abc123"` |
| 按内容/自然语言查 | 「查查最近有没有 connection refused 的报错」 | `query: "connection refused"` |
| 组合收敛 | 「这个 trace 里有 NullPointerException 吗」 | `trace_id` + `query` 一起 |
| 只看某些字段 | 「只查 message 和 exception 字段」 | `fields: ["message", "exception"]` |
| 限定索引 | 「只搜今天的 java 日志」 | `index: "java_log-*"` |

### `es_query_logs` 参数表

| 参数 | 必填 | 说明 |
| ---- | ---- | ---- |
| `query` | 二选一* | 自然语言关键词，匹配 `message`/`log`/`exception`/`stack_trace`/`error`/`msg`/`details`/`reason` |
| `trace_id` | 二选一* | 精确匹配 `trace_id`/`trace.id`/`traceId`/`traceID` |
| `fields` | 否 | 显式字段列表；**不支持通配符**（宽索引会报错） |
| `index` | 否 | 索引模式，默认 `*` |
| `size` | 否 | 默认 `100`，上限 `500` |

\* `query` 与 `trace_id` 至少给一个；都给时先按 trace 收敛、再按内容过滤。

---

## 三、可选：es-log-assistant 预设（日志排查专用角色）

只装插件已经能用；预设额外提供「**只读**日志排查角色 + **业务拒绝 vs 系统故障**解读规则」。

把本仓库 `agent-preset/es-log-assistant/` 下的 3 个文件复制到新机器：

```
~/.dsh/.agent-presets/es-log-assistant/
├── agent.cordis.yml   ← persona（trace_id/query 双模式 + 解读规则）
├── preset.yml         ← 显示名「ES 日志排查助手」
└── README.md          ← 说明（可选）
```

Windows 上即 `C:\Users\<用户名>\.dsh\.agent-presets\es-log-assistant\`。重启后在**预设选择器**里选「ES 日志排查助手」开新会话。

> 预设的 persona 会主动调用 `es_query_logs`，所以**插件 + 预设要一起装**才完整。

---

## 四、常见问题

| 现象 | 处理 |
| ---- | ---- |
| `dsh plugin` 报 pnpm not found | `npm i -g pnpm`，确认 `pnpm -v` |
| 设置页没有 Elasticsearch | 装完没重启；或加到了别的 profile（确认 `--profile` 名字） |
| 工具报「Elasticsearch is not configured」 | 去 Settings → Elasticsearch 填至少一个 URI |
| 认证失败 / 401 | 检查 username/password、uris 协议（http/https）、ES 是否放行该来源 |
| 搜不到任何命中 | 换个 `index` 模式；`query` 关键词换更短/更通用的词；核对 trace_id 拼写 |
| 想确认版本 | `npm view @asuka1121/dsh-client-ui-elasticsearch version` |

---

## 五、其他安装方式（开发者）

**本地目录（未发布 / 离线）**：克隆/下载本仓库（根目录即包，已含编译产物 `lib/`），然后

```sh
dsh plugin --profile web add ./dsh-client-ui-elasticsearch
```

**并入 monorepo（源码集成）**：把 `ui-elasticsearch/` 放进 `packages/client/ui-elasticsearch/`，在根 `tsconfig` 加引用、`web-app` 的 `dependencies` 与 `cordis.patch.yml` 加行，`pnpm install && pnpm build` 后重启。

---

## 六、升级 / 发布备注

- **升级插件**：重复第一节的 `dsh plugin add`（会拉到 `@latest`），重启即可。
- **发布新版本**（给自己发）：改版本号 → 用 `clientBundle` 构建（**client bundle id 必须等于包名**）→ `npm publish`。本仓库根目录即发布物（源码 + 编译产物同仓）；`tsdown.config.ts` 依赖 deepseek-harness monorepo 的 `packages/client/tsdown.client.ts` 预设，独立构建需在 monorepo 中进行（见根 README 的 Development 节）。
- **安装原理**：`dsh plugin add` = 在 `$DSH_HOME/profiles/<name>/` 跑 `pnpm add`；包声明 `dsh.bundle.patch` → 自动并入 profile bundles；运行时依赖全部走 `peerDependencies`（`*`），经 `profiles/node_modules` 回退共享 DSH 安装的同一份 Cordis 实例。
