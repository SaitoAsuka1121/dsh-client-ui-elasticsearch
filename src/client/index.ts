/**
 * Elasticsearch settings plugin, browser half. Binds the durable
 * `elasticsearch` settings namespace through the settings scope and registers
 * the feature-owned Elasticsearch page into the `settings.section` slot. The
 * Host half (this package's main entry) registers the namespace schema, so the
 * section survives restarts and is shared across sessions.
 * Export discipline: packages/client/AGENTS.md.
 */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
// Type-only: pulls the shell's SlotMap merge (the 'settings.section' entry).
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
// Type-only: pulls the locale plugin's Context merge (ctx.locale).
import type {} from '@deepseek-ai/dsh-client-locale/client'
import { ELASTICSEARCH_SETTINGS_NAMESPACE, type ElasticsearchSettings } from '../elasticsearch-settings.ts'
import { ElasticsearchSection } from './ElasticsearchSection.tsx'
import type { ElasticsearchSectionInjected } from './ElasticsearchSection.tsx'
import { en, zh, type ElasticsearchKey } from './locales.ts'

export type { ElasticsearchSectionInjected, ElasticsearchSectionProps } from './ElasticsearchSection.tsx'
export type { ElasticsearchKey } from './locales.ts'
export { ELASTICSEARCH_SETTINGS_NAMESPACE, type ElasticsearchSettings } from '../elasticsearch-settings.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** The Elasticsearch settings page copy. */
    'settings.elasticsearch': ElasticsearchKey
  }
}

/** Dictionary namespace owned by this plugin. */
const NS = 'settings.elasticsearch'

/**
 * Required services (cordis fiber inject). `settingsScope` binds the durable
 * namespace; `connection` and `remote` are the transport the binder resolves
 * on this context; `slots` and `locale` register the section and its copy.
 */
export const inject = ['slots', 'locale', 'connection', 'remote', 'settingsScope']

/**
 * Register the Elasticsearch section once the `settings.section` declaration
 * is on the ledger, and bind its form to the durable settings namespace.
 * @param ctx - client root context.
 */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'ui-elasticsearch: copy dictionaries')

  const scope = ctx.settingsScope.bind<ElasticsearchSettings>({
    namespace: ELASTICSEARCH_SETTINGS_NAMESPACE,
  })
  // Registration-time text (the nav label thunk) and the inject face share
  // one bound translate; copy freshness rides the locale revision.
  const t = ctx.locale.bind(NS) as ElasticsearchSectionInjected['t']
  const injected = (): ElasticsearchSectionInjected => ({ scope, t })

  ctx.slots.inject('settings.section', () => ctx.slots.register({
    name: 'settings.section',
    id: 'elasticsearch',
    order: 30,
    label: () => t('nav'),
    inject: injected,
  }, ElasticsearchSection))
}
