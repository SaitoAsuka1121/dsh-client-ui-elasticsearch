/**
 * Elasticsearch settings plugin, browser half. Binds the durable
 * `elasticsearch` settings namespace through the settings scope and registers
 * the feature-owned Elasticsearch page into the `settings.section` slot. The
 * Host half (this package's main entry) registers the namespace schema, so the
 * section survives restarts and is shared across sessions.
 * Export discipline: packages/client/AGENTS.md.
 */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client';
import { type ElasticsearchKey } from './locales.ts';
export type { ElasticsearchSectionInjected, ElasticsearchSectionProps } from './ElasticsearchSection.tsx';
export type { ElasticsearchKey } from './locales.ts';
export { ELASTICSEARCH_SETTINGS_NAMESPACE, type ElasticsearchSettings } from '../elasticsearch-settings.ts';
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface LocaleNamespaceMap {
        /** The Elasticsearch settings page copy. */
        'settings.elasticsearch': ElasticsearchKey;
    }
}
/**
 * Required services (cordis fiber inject). `settingsScope` binds the durable
 * namespace; `connection` and `remote` are the transport the binder resolves
 * on this context; `slots` and `locale` register the section and its copy.
 */
export declare const inject: string[];
/**
 * Register the Elasticsearch section once the `settings.section` declaration
 * is on the ledger, and bind its form to the durable settings namespace.
 * @param ctx - client root context.
 */
export declare function apply(ctx: ClientContext): void;
//# sourceMappingURL=index.d.ts.map