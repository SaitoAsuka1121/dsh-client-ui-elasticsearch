import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Elasticsearch settings section: a connection form (URIs, username,
 * password) persisted to the shared settings document through the bound
 * settings scope. Reads are reactive to Host invalidations; writes queue
 * through `scope.set` so ordering and revision fencing stay correct.
 */
import { useEffect, useRef, useState } from 'react';
/** Build a draft from a resolved section (or an empty one while loading). */
function draftOf(value) {
    return {
        uris: (value?.uris ?? []).join('\n'),
        username: value?.username ?? '',
        password: value?.password ?? '',
    };
}
const fieldStyle = { marginBottom: 14 };
const labelStyle = { display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600 };
const controlStyle = {
    width: '100%',
    boxSizing: 'border-box',
    padding: '8px 10px',
    borderRadius: 6,
    border: '1px solid var(--dsw-color-border-subtle, #cbd5e1)',
    background: 'var(--dsw-color-surface, transparent)',
    color: 'var(--dsw-color-text, inherit)',
    fontSize: 14,
};
/**
 * @param props - the inject face (`scope`, `t`); the outlet always spreads it.
 */
export function ElasticsearchSection(props) {
    const scope = props.scope;
    const t = props.t;
    // The outlet always spreads the inject face; a missing face is a
    // composition error, rendered as nothing (the guard never flips live).
    if (scope === undefined || t === undefined)
        return null;
    const [snapshot, setSnapshot] = useState(() => scope.getSnapshot());
    const [draft, setDraft] = useState(() => draftOf(scope.getSnapshot().value));
    const seededRef = useRef(false);
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState('');
    useEffect(() => {
        const sync = () => {
            const next = scope.getSnapshot();
            setSnapshot(next);
            if (!seededRef.current && next.value !== undefined) {
                setDraft(draftOf(next.value));
                seededRef.current = true;
            }
        };
        sync();
        return scope.subscribe(sync);
    }, [scope]);
    const update = (key) => (event) => {
        setDraft((prev) => ({ ...prev, [key]: event.target.value }));
    };
    const save = async () => {
        setBusy(true);
        setMessage('');
        try {
            const uris = draft.uris.split('\n').map((line) => line.trim()).filter(Boolean);
            await scope.set('uris', uris);
            await scope.set('username', draft.username);
            await scope.set('password', draft.password);
            setMessage(t('saved'));
        }
        catch (error) {
            setMessage(t('saveFailed') + ': ' + (error instanceof Error ? error.message : String(error)));
        }
        finally {
            setBusy(false);
        }
    };
    const readOnly = snapshot.status === 'unavailable' || !snapshot.writable;
    return (_jsxs("div", { style: { maxWidth: 560, padding: '8px 0' }, children: [_jsx("h2", { style: { margin: '0 0 8px', fontSize: 18 }, children: t('heading') }), _jsx("p", { style: { margin: '0 0 20px', fontSize: 13, opacity: 0.8 }, children: t('description') }), _jsxs("div", { style: fieldStyle, children: [_jsx("label", { style: labelStyle, htmlFor: "es-uris", children: t('urisLabel') }), _jsx("textarea", { id: "es-uris", rows: 3, style: { ...controlStyle, resize: 'vertical', fontFamily: 'inherit' }, placeholder: t('urisPlaceholder'), value: draft.uris, disabled: readOnly, onChange: update('uris') })] }), _jsxs("div", { style: fieldStyle, children: [_jsx("label", { style: labelStyle, htmlFor: "es-username", children: t('usernameLabel') }), _jsx("input", { id: "es-username", style: controlStyle, placeholder: t('usernamePlaceholder'), value: draft.username, disabled: readOnly, onChange: update('username') })] }), _jsxs("div", { style: fieldStyle, children: [_jsx("label", { style: labelStyle, htmlFor: "es-password", children: t('passwordLabel') }), _jsx("input", { id: "es-password", type: "password", style: controlStyle, placeholder: t('passwordPlaceholder'), value: draft.password, disabled: readOnly, onChange: update('password') })] }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 12 }, children: [_jsx("button", { type: "button", disabled: busy || readOnly, onClick: () => { void save(); }, style: {
                            padding: '8px 16px',
                            borderRadius: 6,
                            border: 'none',
                            background: 'var(--dsw-color-accent, #2563eb)',
                            color: '#fff',
                            fontSize: 14,
                            cursor: busy || readOnly ? 'not-allowed' : 'pointer',
                            opacity: busy || readOnly ? 0.6 : 1,
                        }, children: busy ? t('saving') : t('save') }), message !== '' ? _jsx("span", { style: { fontSize: 13, opacity: 0.8 }, children: message }) : null] }), readOnly ? _jsx("p", { style: { marginTop: 12, fontSize: 13, opacity: 0.8 }, children: t('readOnly') }) : null] }));
}
//# sourceMappingURL=ElasticsearchSection.js.map