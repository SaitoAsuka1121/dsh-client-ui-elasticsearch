/** Elasticsearch connection preferences stored in the Host user-settings document. */
import z from '@deepseek-ai/schemastery';
/** Settings namespace owned by the Elasticsearch settings plugin. */
export const ELASTICSEARCH_SETTINGS_NAMESPACE = 'elasticsearch';
/** Default connection settings when the user-settings document has no override. */
export const DEFAULT_ELASTICSEARCH_SETTINGS = {
    uris: [],
    username: '',
    password: '',
};
/** Durable Elasticsearch schema; also the wire envelope the browser scope validates against. */
export const ElasticsearchSettingsSchema = z.object({
    uris: z.array(z.string()).default([]),
    username: z.string().default(''),
    password: z.string().default(''),
});
//# sourceMappingURL=elasticsearch-settings.js.map