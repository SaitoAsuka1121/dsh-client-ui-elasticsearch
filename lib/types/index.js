/** Host registration for the durable Elasticsearch connection section. */
import { settingsNamespace } from '@deepseek-ai/dsh-settings';
import { ELASTICSEARCH_SETTINGS_NAMESPACE, ElasticsearchSettingsSchema, } from "./elasticsearch-settings.js";
import { applyEsQueryLogsTool } from "./es-query-logs.js";
export { ELASTICSEARCH_SETTINGS_NAMESPACE, DEFAULT_ELASTICSEARCH_SETTINGS, ElasticsearchSettingsSchema, } from "./elasticsearch-settings.js";
export { ES_QUERY_LOGS_TOOL, ES_QUERY_LOGS_DEFAULT_SIZE, ES_QUERY_LOGS_MAX_SIZE } from "./es-query-logs.js";
const NAMESPACE = settingsNamespace(ELASTICSEARCH_SETTINGS_NAMESPACE);
/**
 * Tool-guidance section (order band 100–199) so every session — not just a
 * dedicated log-assistant preset — knows to use `es_query_logs` when a trace
 * id is on the table.
 */
const ES_QUERY_LOGS_GUIDANCE = `When the user provides a trace_id, asks about the logs or errors of a specific request, or wants to find log entries by content (an error message, exception type, or keywords), use the \`es_query_logs\` tool to search the configured Elasticsearch cluster — by trace_id and/or by natural-language search terms in the query parameter — then correlate the matching documents with the workspace files before answering. If the tool reports that Elasticsearch is not configured, tell the user to add a URI in Settings → Elasticsearch.`;
/**
 * Register the durable Elasticsearch section when a settings provider is
 * composed, the `es_query_logs` model tool once both settings and tools
 * services exist, and a system-prompt guidance section so any session uses the
 * tool for trace ids. The browser half binds the same namespace through the
 * settings scope, so the section survives restarts and is shared across
 * sessions.
 * @param ctx - Host context whose optional services own the section and tool.
 */
export function apply(ctx) {
    ctx.inject(['settings'], (settingsCtx) => {
        settingsCtx.settings.register(NAMESPACE, ElasticsearchSettingsSchema);
    });
    ctx.inject(['settings', 'tools'], (toolCtx) => {
        applyEsQueryLogsTool(toolCtx);
    });
    ctx.inject(['systemPrompt'], (promptCtx) => {
        promptCtx.systemPrompt.section({
            name: 'tool:es_query_logs',
            order: 113,
            text: ES_QUERY_LOGS_GUIDANCE,
        });
    });
}
//# sourceMappingURL=index.js.map