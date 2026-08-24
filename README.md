# dsh-client-ui-elasticsearch

> [English](README.md) | [中文](README.zh.md)

A DeepSeek Harness plugin that adds an **Elasticsearch** section to Settings and a
host-side `es_query_logs` model tool.

- **Settings → Elasticsearch**: configure `uris` (one per line), `username`, and
  `password`. Values are stored in the shared DSH settings document and shared
  across sessions.
- **`es_query_logs` tool**: search logs by `trace_id` (exact match) and/or by
  natural-language search terms via `query` (matched against `message`,
  `exception`, and other log text fields), with optional `fields`, `index`, and
  `size`. It reuses the connection configured above.
- **Auto-guidance**: a system-prompt section teaches every session to use the
  tool when a `trace_id` or a log-content question is asked — no dedicated
  agent preset required.

## Install

```sh
dsh plugin --profile web add @asuka1121/dsh-client-ui-elasticsearch@latest
```

Then restart the deployment. The package declares `dsh.bundle.patch`, so
`dsh plugin` registers it as a profile bundle automatically.

> Requires pnpm on `PATH`. The plugin resolves its `@deepseek-ai/*` runtime
> dependencies as peer dependencies from the DSH installation, so it shares the
> installation's single Cordis instance.

## Tool

`es_query_logs` parameters:

| name       | type             | required | default | notes                                  |
| ---------- | ---------------- | -------- | ------- | -------------------------------------- |
| `query`    | string           | no*      | —       | natural-language search terms matched against log text fields (e.g. `"connection refused"`, `"NullPointerException"`) |
| `trace_id` | string           | no*      | —       | exact trace id to search across trace fields |
| `fields`   | string[]         | no       | common log text fields | explicit fields the `query` matches against; wildcards unsupported |
| `index`    | string           | no       | `*`     | index pattern to target                |
| `size`     | integer          | no       | `100`   | max hits, capped at 500                |

\* at least one of `query` or `trace_id` is required.

- `trace_id` runs exact `term` queries on `trace_id`, `trace.id`, `traceId`,
  and `traceID`.
- `query` runs a `multi_match` (best_fields) over the resolved fields, avoiding
  wildcard field expansion that fails on wide indices.
- Both together narrow by trace and content; results are sorted by
  `@timestamp` desc, trying each configured URI in order.

## License

MIT

## Development

The compiled `lib/` ships with this repo, so consumers can install from the
directory directly. Building from source requires the
[deepseek-harness](https://github.com/deepseek-ai/deepseek-harness) monorepo:
`tsdown.config.ts` imports the `clientBundle` preset from
`packages/client/tsdown.client.ts`. The published npm package
(`@asuka1121/dsh-client-ui-elasticsearch`) is the canonical build artifact.
