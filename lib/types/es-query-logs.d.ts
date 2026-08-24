/**
 * Model-facing `es_query_logs` tool: search the configured Elasticsearch
 * cluster for log documents — by trace id and/or by natural-language search
 * terms across log text fields — and return the matching documents. It reads
 * the durable `elasticsearch` settings namespace (URIs, optional basic auth)
 * and issues the search over Node's `fetch`, so it works even though `ctx.web`
 * cannot carry per-request auth headers.
 * @module @asuka1121/dsh-client-ui-elasticsearch
 */
import type { Context } from '@deepseek-ai/cordis';
/** Registry name of the tool. */
export declare const ES_QUERY_LOGS_TOOL = "es_query_logs";
/** Default hit count when the model does not request one. */
export declare const ES_QUERY_LOGS_DEFAULT_SIZE = 100;
/** Upper bound on hits returned by one call, bounding model-facing output. */
export declare const ES_QUERY_LOGS_MAX_SIZE = 500;
/**
 * Register the `es_query_logs` tool. The tool stays registered even when no
 * cluster is configured and fails at execution time with a configuration hint,
 * mirroring the web tools' provider-availability posture.
 * @param ctx - context whose `tools` registry receives the registration.
 */
export declare function applyEsQueryLogsTool(ctx: Context): void;
//# sourceMappingURL=es-query-logs.d.ts.map