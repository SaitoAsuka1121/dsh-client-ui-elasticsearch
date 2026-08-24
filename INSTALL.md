# Elasticsearch Log Search Plugin · Install & Usage Guide

> [English](INSTALL.md) | [中文](INSTALL.zh.md)

A DSH plugin published on npm: **`@asuka1121/dsh-client-ui-elasticsearch`** (current `@latest` = **0.2.0**). It provides three things:

1. **Settings → Elasticsearch page** — configure `uris` (one per line) / `username` / `password`, stored in the **shared DSH settings document** (shared across sessions, survives restarts).
2. **`es_query_logs` model tool** — exact search by `trace_id`, **or** content search by natural-language keywords (`message`, `exception`, `stack_trace`, ...), usable from any session.
3. **Global tool guidance** — the system prompt auto-injects "when a trace_id or a log-content question is asked, use `es_query_logs`", so **no dedicated preset is required**; the default agent uses it proactively.

---

## 1. Install on a new machine

The package is public — **no npm account or token needed**.

### 1.1 Install the plugin (one command)

```sh
dsh plugin --profile web add @asuka1121/dsh-client-ui-elasticsearch@latest
```

> - Replace `web` with your actual profile name: `dsh plugin --profile <name> add ...`
> - Under the hood this runs `pnpm add`, so **install pnpm first**: `npm i -g pnpm`, and make sure `pnpm -v` works.
> - Because the package declares `dsh.bundle.patch` (bundles its own `cordis.patch.yml`), it is automatically appended to the profile's bundles — no manual file edits.

### 1.2 Restart the deployment

```sh
dsh --profile web
```

(or however you usually start it; refresh the browser page after restart.)

### 1.3 Configure the Elasticsearch connection

Open the Web GUI → **Settings → Elasticsearch**:

- `uris`: one per line, e.g. `http://192.168.1.10:9200` (use `https://` for self-signed certs)
- `username` / `password`: leave empty if no auth

> The config is written to **this machine's** shared settings document; re-enter it after moving machines or reinstalling (secrets do not ship with the plugin).

---

## 2. Usage

With the plugin installed, **any session** (the default agent is fine) can ask:

| Goal | Say | Tool call |
| --- | --- | --- |
| Full trace of one request | "Show me the logs for trace_id=`abc123`" | `trace_id: "abc123"` |
| Search by content / natural language | "Any `connection refused` errors recently?" | `query: "connection refused"` |
| Combine both | "Any NullPointerException in this trace?" | `trace_id` + `query` |
| Restrict fields | "Only check message and exception" | `fields: ["message", "exception"]` |
| Restrict index | "Search today's java logs only" | `index: "java_log-*"` |

### `es_query_logs` parameters

| Param | Required | Notes |
| ---- | ---- | ---- |
| `query` | one of* | natural-language keywords, matched against `message`/`log`/`exception`/`stack_trace`/`error`/`msg`/`details`/`reason` |
| `trace_id` | one of* | exact match on `trace_id`/`trace.id`/`traceId`/`traceID` |
| `fields` | no | explicit field list; **wildcards not supported** (fail on wide indices) |
| `index` | no | index pattern, default `*` |
| `size` | no | default `100`, max `500` |

\* provide at least one of `query` / `trace_id`; giving both narrows by trace first, then by content.

---

## 3. Optional: es-log-assistant preset (dedicated log troubleshooting role)

The plugin alone is already usable; the preset adds a "**read-only**" troubleshooting role plus **business-rejection vs system-fault** interpretation rules.

Copy the 3 files from `agent-preset/es-log-assistant/` in this repo to the new machine:

```
~/.dsh/.agent-presets/es-log-assistant/
├── agent.cordis.yml   ← persona (trace_id/query modes + interpretation rules)
├── preset.yml         ← display name "ES 日志排查助手"
└── README.md          ← docs (optional)
```

On Windows: `C:\Users\<user>\.dsh\.agent-presets\es-log-assistant\`. After restart, pick "ES 日志排查助手" in the preset picker and start a session.

> The preset's persona calls `es_query_logs` proactively, so install the **plugin + preset together** for the full experience.

---

## 4. FAQ

| Symptom | Fix |
| ---- | ---- |
| `dsh plugin` reports pnpm not found | `npm i -g pnpm`, verify `pnpm -v` |
| No Elasticsearch entry in Settings | didn't restart; or added to the wrong profile (check the `--profile` name) |
| Tool says "Elasticsearch is not configured" | add at least one URI in Settings → Elasticsearch |
| Auth failure / 401 | check username/password, uri scheme (http/https), and whether ES allows this source |
| No hits at all | try a different `index` pattern; use shorter/more generic `query` keywords; double-check the trace_id spelling |
| Confirm the version | `npm view @asuka1121/dsh-client-ui-elasticsearch version` |

---

## 5. Other install methods (developers)

**Local directory (unpublished / offline)**: clone or download this repo (root = the package, includes compiled `lib/`), then

```sh
dsh plugin --profile web add ./dsh-client-ui-elasticsearch
```

**Into a monorepo (source integration)**: put the package at `packages/client/ui-elasticsearch/`, add the reference in the root `tsconfig`, and add the dependency and row in `web-app`'s `dependencies` and `cordis.patch.yml`, then `pnpm install && pnpm build` and restart.

---

## 6. Upgrade / publishing notes

- **Upgrade the plugin**: repeat the `dsh plugin add` from section 1 (pulls `@latest`), then restart.
- **Publish a new version** (for yourself): bump the version → build with `clientBundle` (**the client bundle id must equal the package name**) → `npm publish`. This repo root is the publish artifact (source + compiled output together); `tsdown.config.ts` depends on the deepseek-harness monorepo's `packages/client/tsdown.client.ts` preset, so standalone builds must run inside the monorepo (see the Development section of the root README).
- **How install works**: `dsh plugin add` = `pnpm add` in `$DSH_HOME/profiles/<name>/`; the package's `dsh.bundle.patch` is auto-merged into the profile bundles; all runtime deps are `peerDependencies` (`*`), resolved from the DSH installation via the `profiles/node_modules` fallback, sharing the same single Cordis instance.
