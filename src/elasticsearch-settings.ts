/** Elasticsearch connection preferences stored in the Host user-settings document. */

import z from '@deepseek-ai/schemastery'

/** Settings namespace owned by the Elasticsearch settings plugin. */
export const ELASTICSEARCH_SETTINGS_NAMESPACE = 'elasticsearch'

/** Durable Elasticsearch connection section shared by the Host schema and the browser scope. */
export interface ElasticsearchSettings {
  /** Base cluster URLs (e.g. https://localhost:9200). */
  uris: string[]
  /** Basic-auth username; empty disables auth. */
  username: string
  /** Basic-auth password. */
  password: string
}

/** Default connection settings when the user-settings document has no override. */
export const DEFAULT_ELASTICSEARCH_SETTINGS: ElasticsearchSettings = {
  uris: [],
  username: '',
  password: '',
}

/** Durable Elasticsearch schema; also the wire envelope the browser scope validates against. */
export const ElasticsearchSettingsSchema: z<ElasticsearchSettings> = z.object({
  uris: z.array(z.string()).default([]),
  username: z.string().default(''),
  password: z.string().default(''),
})
