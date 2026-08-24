/**
 * Model-facing `es_query_logs` tool: search the configured Elasticsearch
 * cluster for log documents — by trace id and/or by natural-language search
 * terms across log text fields — and return the matching documents. It reads
 * the durable `elasticsearch` settings namespace (URIs, optional basic auth)
 * and issues the search over Node's `fetch`, so it works even though `ctx.web`
 * cannot carry per-request auth headers.
 * @module @asuka1121/dsh-client-ui-elasticsearch
 */
import { defineTool } from '@deepseek-ai/dsh-tools';
import { settingsNamespace } from '@deepseek-ai/dsh-settings';
import { DEFAULT_ELASTICSEARCH_SETTINGS, ELASTICSEARCH_SETTINGS_NAMESPACE, } from "./elasticsearch-settings.js";
const NAMESPACE = settingsNamespace(ELASTICSEARCH_SETTINGS_NAMESPACE);
/** Registry name of the tool. */
export const ES_QUERY_LOGS_TOOL = 'es_query_logs';
/** Default hit count when the model does not request one. */
export const ES_QUERY_LOGS_DEFAULT_SIZE = 100;
/** Upper bound on hits returned by one call, bounding model-facing output. */
export const ES_QUERY_LOGS_MAX_SIZE = 500;
/** Index pattern used when the model does not name one. */
const DEFAULT_INDEX = '*';
/** Cooperative tool-call timeout budget (ms). */
const TOOL_TIMEOUT_MS = 30_000;
/** Cap on the complete rendered output string. */
const MAX_OUTPUT_CHARS = 60_000;
/**
 * Field names a log document may carry the trace id under (Filebeat/ECS and
 * common variants). A `term` on a field that does not exist simply matches
 * nothing, so probing several names is safe. Deliberately avoids a wildcard
 * field expansion, which fails on wide indices ("matches too many fields").
 */
const TRACE_FIELDS = ['trace_id', 'trace.id', 'traceId', 'traceID'];
/**
 * Default text fields the natural-language `query` matches against. Explicit
 * names keep `multi_match` safe on wide indices (a wildcard field list can
 * expand past Elasticsearch's field limit); fields absent from a mapping
 * simply contribute no matches.
 */
const DEFAULT_TEXT_FIELDS = ['message', 'log', 'exception', 'stack_trace', 'error', 'msg', 'details', 'reason'];
/**
 * Basic-auth header value, UTF-8 safe. Uses `TextEncoder` + `btoa` (DOM-lib
 * globals) instead of `Buffer` so the shared client/host package stays free of
 * Node-only ambient types.
 * @param username - basic-auth username.
 * @param password - basic-auth password.
 */
function basicAuth(username, password) {
    const bytes = new TextEncoder().encode(`${username}:${password}`);
    let binary = '';
    for (const byte of bytes)
        binary += String.fromCharCode(byte);
    return `Basic ${btoa(binary)}`;
}
function trimTrailingSlash(uri) {
    return uri.replace(/\/+$/, '');
}
function messageOf(error) {
    return error instanceof Error ? error.message : String(error);
}
/** Read the total-hit count across both legacy and object `total` shapes. */
function totalOf(data, hitCount) {
    const total = data.hits?.total;
    if (typeof total === 'number')
        return total;
    if (typeof total === 'object' && total !== null && typeof total.value === 'number')
        return total.value;
    return hitCount;
}
/**
 * Resolve the explicit `fields` list, rejecting wildcards that would expand
 * past Elasticsearch's field limit on wide indices.
 * @param fields - model-supplied field names, if any.
 * @returns the explicit list, or the default text fields when none is given.
 */
function resolveFields(fields) {
    if (fields === undefined || fields.length === 0)
        return DEFAULT_TEXT_FIELDS;
    const explicit = fields.map((field) => field.trim()).filter((field) => field.length > 0);
    if (explicit.length === 0)
        return DEFAULT_TEXT_FIELDS;
    if (explicit.some((field) => field.includes('*'))) {
        throw new Error('fields must be explicit field names; wildcards (e.g. "*") are not supported because they fail on wide indices');
    }
    return explicit;
}
/** One-line criterion summary for the model-facing result header. */
function describeCriteria(traceId, searchText) {
    const parts = [];
    if (traceId.length > 0)
        parts.push(`trace_id ${JSON.stringify(traceId)}`);
    if (searchText.length > 0)
        parts.push(`query ${JSON.stringify(searchText)}`);
    return parts.join(' + ');
}
/** Format the hit list as one bounded model-facing text block. */
function formatHits(data, uri, descriptor) {
    const hits = data.hits?.hits ?? [];
    const total = totalOf(data, hits.length);
    const parts = [
        `Elasticsearch: ${total} total hit(s) for ${descriptor} (queried ${uri}), showing ${hits.length}:`,
    ];
    hits.forEach((hit, index) => {
        const score = typeof hit._score === 'number' ? ` (score ${hit._score})` : '';
        parts.push(`\n[${index + 1}] ${hit._index ?? '-'}/${hit._id ?? '-'}${score}`);
        parts.push(JSON.stringify(hit._source ?? hit, null, 2));
    });
    if (hits.length === 0)
        parts.push('\n(no documents matched)');
    const text = parts.join('\n');
    if (text.length <= MAX_OUTPUT_CHARS)
        return text;
    return `${text.slice(0, MAX_OUTPUT_CHARS)}\n\n(output truncated at ${MAX_OUTPUT_CHARS} characters)`;
}
/** Resolve the durable connection, defaulting defensively when unset. */
function readConfig(ctx) {
    const resolved = ctx.settings.get(NAMESPACE);
    return {
        uris: resolved?.uris ?? DEFAULT_ELASTICSEARCH_SETTINGS.uris,
        username: resolved?.username ?? DEFAULT_ELASTICSEARCH_SETTINGS.username,
        password: resolved?.password ?? DEFAULT_ELASTICSEARCH_SETTINGS.password,
    };
}
/** Run the search against one URI, throwing a descriptive error on failure. */
async function search(uri, index, body, config, signal) {
    const headers = { 'Content-Type': 'application/json' };
    if (config.username.length > 0)
        headers.Authorization = basicAuth(config.username, config.password);
    const response = await fetch(`${trimTrailingSlash(uri)}/${index}/_search`, {
        method: 'POST',
        headers,
        body,
        signal,
    });
    if (!response.ok) {
        const detail = await response.text().catch(() => '');
        throw new Error(`HTTP ${response.status}${detail.length > 0 ? `: ${detail.slice(0, 500)}` : ''}`);
    }
    return await response.json();
}
/** Clamp a model-supplied size into the supported range. */
function clampSize(size) {
    if (size === undefined)
        return ES_QUERY_LOGS_DEFAULT_SIZE;
    if (!Number.isInteger(size) || size < 1)
        return ES_QUERY_LOGS_DEFAULT_SIZE;
    return Math.min(size, ES_QUERY_LOGS_MAX_SIZE);
}
/**
 * Register the `es_query_logs` tool. The tool stays registered even when no
 * cluster is configured and fails at execution time with a configuration hint,
 * mirroring the web tools' provider-availability posture.
 * @param ctx - context whose `tools` registry receives the registration.
 */
export function applyEsQueryLogsTool(ctx) {
    ctx.tools.register(defineTool({
        name: ES_QUERY_LOGS_TOOL,
        description: 'Search the configured Elasticsearch cluster for log documents, by trace id and/or by natural-language search terms, and return the matching documents. Provide trace_id for an exact trace lookup, and/or query with the key terms from the user\'s request (e.g. "connection refused", "NullPointerException", "payment failed") — the terms are matched against log text fields (message, exception, stack_trace, ...). Optionally narrow the searched fields with fields, the index pattern with index, and the hit count with size. Requires the Elasticsearch connection to be configured in Settings → Elasticsearch.',
        parameters: {
            query: {
                type: 'string',
                description: 'Natural-language search terms matched against log text fields (default: message, log, exception, stack_trace, error, msg, details, reason). Extract the meaningful keywords from the user\'s request rather than passing the full sentence.',
            },
            trace_id: {
                type: 'string',
                description: 'Exact trace id to search for across trace fields. Provide query and/or trace_id; combining both narrows by trace and content.',
            },
            fields: {
                type: 'array',
                items: { type: 'string' },
                description: 'Explicit field names the query matches against, e.g. ["message", "exception"]. Defaults to common log text fields. Wildcards are not supported.',
            },
            index: { type: 'string', description: 'Index pattern to search, e.g. "logs-*". Defaults to "*" (all indices).' },
            size: { type: 'integer', description: 'Maximum number of documents to return. Defaults to 100, capped at 500.' },
        },
        output: {
            schema: { type: 'string' },
            render: (_args, value) => [{ type: 'text', text: value }],
        },
        timeoutMs: TOOL_TIMEOUT_MS,
        isConcurrencySafe: () => true,
        async execute(args, exec) {
            const traceId = (args.trace_id ?? '').trim();
            const searchText = (args.query ?? '').trim();
            if (traceId.length === 0 && searchText.length === 0) {
                throw new Error('es_query_logs needs at least one of query (natural-language search terms) or trace_id');
            }
            const indexArg = args.index?.trim() ?? '';
            const index = indexArg.length > 0 ? indexArg : DEFAULT_INDEX;
            const config = readConfig(ctx);
            const uris = config.uris.filter((uri) => uri.trim().length > 0);
            if (uris.length === 0) {
                throw new Error('Elasticsearch is not configured. Add at least one URI in Settings → Elasticsearch, then retry.');
            }
            const clauses = [];
            if (traceId.length > 0) {
                clauses.push({
                    bool: {
                        should: TRACE_FIELDS.map((field) => ({ term: { [field]: traceId } })),
                        minimum_should_match: 1,
                    },
                });
            }
            if (searchText.length > 0) {
                const fields = resolveFields(args.fields);
                clauses.push({
                    multi_match: {
                        query: searchText,
                        fields,
                        type: 'best_fields',
                    },
                });
            }
            const body = JSON.stringify({
                query: clauses.length === 1 ? clauses[0] : { bool: { must: clauses } },
                size: clampSize(args.size),
                sort: [{ '@timestamp': { order: 'desc' } }],
            });
            const descriptor = describeCriteria(traceId, searchText);
            const failures = [];
            for (const uri of uris) {
                try {
                    const data = await search(uri, index, body, config, exec.signal);
                    return formatHits(data, uri, descriptor);
                }
                catch (error) {
                    failures.push(`${uri}: ${messageOf(error)}`);
                }
            }
            throw new Error(`es_query_logs failed against every configured URI:\n- ${failures.join('\n- ')}`);
        },
    }));
}
//# sourceMappingURL=es-query-logs.js.map