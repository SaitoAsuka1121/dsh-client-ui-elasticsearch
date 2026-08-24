/** Copy dictionaries for the Elasticsearch settings section. */
/** English strings (the key-set source of truth for this pair). */
export declare const en: {
    readonly nav: "Elasticsearch";
    readonly heading: "Elasticsearch";
    readonly description: "Configure the Elasticsearch cluster connection. Saved to the shared settings document.";
    readonly urisLabel: "URIs (one per line)";
    readonly urisPlaceholder: "https://localhost:9200\nhttps://node-2:9200";
    readonly usernameLabel: "Username";
    readonly usernamePlaceholder: "elastic";
    readonly passwordLabel: "Password";
    readonly passwordPlaceholder: "••••••••";
    readonly save: "Save";
    readonly saving: "Saving…";
    readonly saved: "Saved";
    readonly saveFailed: "Save failed";
    readonly readOnly: "The settings document is read-only in this deployment.";
};
export type ElasticsearchKey = keyof typeof en;
/** Simplified-Chinese copy. */
export declare const zh: Record<ElasticsearchKey, string>;
//# sourceMappingURL=locales.d.ts.map