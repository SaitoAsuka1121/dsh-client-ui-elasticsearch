/**
 * Package-owned invariant companion for `@asuka1121/dsh-client-ui-elasticsearch`.
 * @module @asuka1121/dsh-client-ui-elasticsearch/invariant
 */

/* jscpd:ignore-start */
import type { Context } from '@deepseek-ai/cordis'
import type { InvariantInstaller } from '@deepseek-ai/dsh-invariants'

const PACKAGE_NAME = '@asuka1121/dsh-client-ui-elasticsearch'

/** Cordis companion plugin name. */
export const name = 'client-ui-elasticsearch-invariant'
/** Service required before the companion can reserve package ownership. */
export const inject = ['invariants']

/**
 * No runtime invariant: the settings scope validates and publishes the durable
 * section, and the section form writes only through that scope, so Host/browser
 * agreement is covered directly by the settings transport.
 */
const install: InvariantInstaller = () => {}

/**
 * Register this package's invariant companion.
 * @param ctx - Cordis context carrying the invariant service.
 * @returns the installed registration's disposer after setup succeeds.
 */
export const apply = (ctx: Context): Promise<() => void> =>
  Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install))
/* jscpd:ignore-end */
