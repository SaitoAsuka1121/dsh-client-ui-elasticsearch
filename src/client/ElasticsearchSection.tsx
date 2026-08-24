/**
 * Elasticsearch settings section: a connection form (URIs, username,
 * password) persisted to the shared settings document through the bound
 * settings scope. Reads are reactive to Host invalidations; writes queue
 * through `scope.set` so ordering and revision fencing stay correct.
 */

import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import type { SettingsScope, SettingsScopeSnapshot } from '@deepseek-ai/dsh-client-runtime/client'
import type { ElasticsearchSettings } from '../elasticsearch-settings.ts'
import type { en } from './locales.ts'

/** Injected dependencies of {@link ElasticsearchSection} (slot `inject`). */
export interface ElasticsearchSectionInjected {
  /** The bound settings scope for the elasticsearch namespace. */
  scope: SettingsScope<ElasticsearchSettings>
  /** Section copy. */
  t: (key: keyof typeof en) => string
}

/** Props delivered by the slot outlet: the inject face spread flat. */
export type ElasticsearchSectionProps = Partial<ElasticsearchSectionInjected>

/** Form draft: the textarea carries URIs as one-per-line text. */
interface Draft {
  uris: string
  username: string
  password: string
}

/** Build a draft from a resolved section (or an empty one while loading). */
function draftOf(value: ElasticsearchSettings | undefined): Draft {
  return {
    uris: (value?.uris ?? []).join('\n'),
    username: value?.username ?? '',
    password: value?.password ?? '',
  }
}

const fieldStyle: CSSProperties = { marginBottom: 14 }
const labelStyle: CSSProperties = { display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600 }
const controlStyle: CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '8px 10px',
  borderRadius: 6,
  border: '1px solid var(--dsw-color-border-subtle, #cbd5e1)',
  background: 'var(--dsw-color-surface, transparent)',
  color: 'var(--dsw-color-text, inherit)',
  fontSize: 14,
}

/**
 * @param props - the inject face (`scope`, `t`); the outlet always spreads it.
 */
export function ElasticsearchSection(props: ElasticsearchSectionProps): ReactNode {
  const scope = props.scope
  const t = props.t
  // The outlet always spreads the inject face; a missing face is a
  // composition error, rendered as nothing (the guard never flips live).
  if (scope === undefined || t === undefined) return null

  const [snapshot, setSnapshot] = useState<SettingsScopeSnapshot<ElasticsearchSettings>>(
    () => scope.getSnapshot(),
  )
  const [draft, setDraft] = useState<Draft>(() => draftOf(scope.getSnapshot().value))
  const seededRef = useRef(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const sync = (): void => {
      const next = scope.getSnapshot()
      setSnapshot(next)
      if (!seededRef.current && next.value !== undefined) {
        setDraft(draftOf(next.value))
        seededRef.current = true
      }
    }
    sync()
    return scope.subscribe(sync)
  }, [scope])

  const update = (key: keyof Draft) => (event: { target: { value: string } }): void => {
    setDraft((prev) => ({ ...prev, [key]: event.target.value }))
  }

  const save = async (): Promise<void> => {
    setBusy(true)
    setMessage('')
    try {
      const uris = draft.uris.split('\n').map((line) => line.trim()).filter(Boolean)
      await scope.set('uris', uris)
      await scope.set('username', draft.username)
      await scope.set('password', draft.password)
      setMessage(t('saved'))
    } catch (error) {
      setMessage(t('saveFailed') + ': ' + (error instanceof Error ? error.message : String(error)))
    } finally {
      setBusy(false)
    }
  }

  const readOnly = snapshot.status === 'unavailable' || !snapshot.writable

  return (
    <div style={{ maxWidth: 560, padding: '8px 0' }}>
      <h2 style={{ margin: '0 0 8px', fontSize: 18 }}>{t('heading')}</h2>
      <p style={{ margin: '0 0 20px', fontSize: 13, opacity: 0.8 }}>{t('description')}</p>

      <div style={fieldStyle}>
        <label style={labelStyle} htmlFor="es-uris">{t('urisLabel')}</label>
        <textarea
          id="es-uris"
          rows={3}
          style={{ ...controlStyle, resize: 'vertical', fontFamily: 'inherit' }}
          placeholder={t('urisPlaceholder')}
          value={draft.uris}
          disabled={readOnly}
          onChange={update('uris')}
        />
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle} htmlFor="es-username">{t('usernameLabel')}</label>
        <input
          id="es-username"
          style={controlStyle}
          placeholder={t('usernamePlaceholder')}
          value={draft.username}
          disabled={readOnly}
          onChange={update('username')}
        />
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle} htmlFor="es-password">{t('passwordLabel')}</label>
        <input
          id="es-password"
          type="password"
          style={controlStyle}
          placeholder={t('passwordPlaceholder')}
          value={draft.password}
          disabled={readOnly}
          onChange={update('password')}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          type="button"
          disabled={busy || readOnly}
          onClick={() => { void save() }}
          style={{
            padding: '8px 16px',
            borderRadius: 6,
            border: 'none',
            background: 'var(--dsw-color-accent, #2563eb)',
            color: '#fff',
            fontSize: 14,
            cursor: busy || readOnly ? 'not-allowed' : 'pointer',
            opacity: busy || readOnly ? 0.6 : 1,
          }}
        >
          {busy ? t('saving') : t('save')}
        </button>
        {message !== '' ? <span style={{ fontSize: 13, opacity: 0.8 }}>{message}</span> : null}
      </div>
      {readOnly ? <p style={{ marginTop: 12, fontSize: 13, opacity: 0.8 }}>{t('readOnly')}</p> : null}
    </div>
  )
}
