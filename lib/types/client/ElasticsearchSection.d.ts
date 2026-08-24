/**
 * Elasticsearch settings section: a connection form (URIs, username,
 * password) persisted to the shared settings document through the bound
 * settings scope. Reads are reactive to Host invalidations; writes queue
 * through `scope.set` so ordering and revision fencing stay correct.
 */
import type { ReactNode } from 'react';
import type { SettingsScope } from '@deepseek-ai/dsh-client-runtime/client';
import type { ElasticsearchSettings } from '../elasticsearch-settings.ts';
import type { en } from './locales.ts';
/** Injected dependencies of {@link ElasticsearchSection} (slot `inject`). */
export interface ElasticsearchSectionInjected {
    /** The bound settings scope for the elasticsearch namespace. */
    scope: SettingsScope<ElasticsearchSettings>;
    /** Section copy. */
    t: (key: keyof typeof en) => string;
}
/** Props delivered by the slot outlet: the inject face spread flat. */
export type ElasticsearchSectionProps = Partial<ElasticsearchSectionInjected>;
/**
 * @param props - the inject face (`scope`, `t`); the outlet always spreads it.
 */
export declare function ElasticsearchSection(props: ElasticsearchSectionProps): ReactNode;
//# sourceMappingURL=ElasticsearchSection.d.ts.map