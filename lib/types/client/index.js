import { ELASTICSEARCH_SETTINGS_NAMESPACE } from "../elasticsearch-settings.js";
import { ElasticsearchSection } from "./ElasticsearchSection.js";
import { en, zh } from "./locales.js";
export { ELASTICSEARCH_SETTINGS_NAMESPACE } from "../elasticsearch-settings.js";
/** Dictionary namespace owned by this plugin. */
const NS = 'settings.elasticsearch';
/**
 * Required services (cordis fiber inject). `settingsScope` binds the durable
 * namespace; `connection` and `remote` are the transport the binder resolves
 * on this context; `slots` and `locale` register the section and its copy.
 */
export const inject = ['slots', 'locale', 'connection', 'remote', 'settingsScope'];
/**
 * Register the Elasticsearch section once the `settings.section` declaration
 * is on the ledger, and bind its form to the durable settings namespace.
 * @param ctx - client root context.
 */
export function apply(ctx) {
    ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'ui-elasticsearch: copy dictionaries');
    const scope = ctx.settingsScope.bind({
        namespace: ELASTICSEARCH_SETTINGS_NAMESPACE,
    });
    // Registration-time text (the nav label thunk) and the inject face share
    // one bound translate; copy freshness rides the locale revision.
    const t = ctx.locale.bind(NS);
    const injected = () => ({ scope, t });
    ctx.slots.inject('settings.section', () => ctx.slots.register({
        name: 'settings.section',
        id: 'elasticsearch',
        order: 30,
        label: () => t('nav'),
        inject: injected,
    }, ElasticsearchSection));
}
//# sourceMappingURL=index.js.map