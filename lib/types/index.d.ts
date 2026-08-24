/** Host registration for the durable Elasticsearch connection section. */
import type { Context } from '@deepseek-ai/cordis';
export { ELASTICSEARCH_SETTINGS_NAMESPACE, DEFAULT_ELASTICSEARCH_SETTINGS, ElasticsearchSettingsSchema, type ElasticsearchSettings, } from './elasticsearch-settings.ts';
export { ES_QUERY_LOGS_TOOL, ES_QUERY_LOGS_DEFAULT_SIZE, ES_QUERY_LOGS_MAX_SIZE } from './es-query-logs.ts';
/**
 * Register the durable Elasticsearch section when a settings provider is
 * composed, the `es_query_logs` model tool once both settings and tools
 * services exist, and a system-prompt guidance section so any session uses the
 * tool for trace ids. The browser half binds the same namespace through the
 * settings scope, so the section survives restarts and is shared across
 * sessions.
 * @param ctx - Host context whose optional services own the section and tool.
 */
export declare function apply(ctx: Context): void;
//# sourceMappingURL=index.d.ts.map