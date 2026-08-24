/** Copy dictionaries for the Elasticsearch settings section. */

/** English strings (the key-set source of truth for this pair). */
export const en = {
  nav: 'Elasticsearch',
  heading: 'Elasticsearch',
  description: 'Configure the Elasticsearch cluster connection. Saved to the shared settings document.',
  urisLabel: 'URIs (one per line)',
  urisPlaceholder: 'https://localhost:9200\nhttps://node-2:9200',
  usernameLabel: 'Username',
  usernamePlaceholder: 'elastic',
  passwordLabel: 'Password',
  passwordPlaceholder: '••••••••',
  save: 'Save',
  saving: 'Saving…',
  saved: 'Saved',
  saveFailed: 'Save failed',
  readOnly: 'The settings document is read-only in this deployment.',
} as const

export type ElasticsearchKey = keyof typeof en

/** Simplified-Chinese copy. */
export const zh: Record<ElasticsearchKey, string> = {
  nav: 'Elasticsearch',
  heading: 'Elasticsearch',
  description: '配置 Elasticsearch 集群连接，保存到共享设置文档。',
  urisLabel: 'URIs（每行一个）',
  urisPlaceholder: 'https://localhost:9200\nhttps://node-2:9200',
  usernameLabel: '用户名',
  usernamePlaceholder: 'elastic',
  passwordLabel: '密码',
  passwordPlaceholder: '••••••••',
  save: '保存',
  saving: '保存中…',
  saved: '已保存',
  saveFailed: '保存失败',
  readOnly: '该部署中的设置文档为只读。',
}
