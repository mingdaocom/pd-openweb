export const CONTENT_TYPE = {
  TEXT: 1,
  RICH_TEXT: 2,
  MJML: 3,
};

const DEFAULT_MJML_THEME_COLOR_PAIRS = [
  { backgroundColor: '#f2f2f2', textColor: '#222222' },
  { backgroundColor: '#ffffff', textColor: '#151515' },
  { backgroundColor: '#161616', textColor: '#e6e6e6' },
];

export function getDefaultMjml(theme = getMjmlPreviewTheme()) {
  const text = typeof _l === 'function' ? _l('在这里编辑 MJML 邮件内容') : '在这里编辑 MJML 邮件内容';
  const backgroundColor = theme.backgroundColor || '#ffffff';
  const textColor = theme.textColor || '#151515';

  return `<mjml>
  <mj-body background-color="${backgroundColor}">
    <mj-section padding="20px">
      <mj-column>
        <mj-text font-size="16px" color="${textColor}">
          ${text}
        </mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`;
}

export function getEmailContentType(data = {}) {
  const { emailContentType } = data;

  if ([CONTENT_TYPE.TEXT, CONTENT_TYPE.RICH_TEXT, CONTENT_TYPE.MJML].includes(emailContentType)) {
    return emailContentType;
  }

  const contentField = (data.fields || []).find(item => item.fieldId === 'content') || {};

  return contentField.isRichText ? CONTENT_TYPE.RICH_TEXT : CONTENT_TYPE.TEXT;
}

export function extractMjmlContent(value = '') {
  const text = value || '';
  const match = text.match(/<mjml[\s\S]*<\/mjml>/i);

  return match ? match[0].trim() : text;
}

export function getFormulaMapWithInsertedField(formulaMap = {}, field = {}) {
  const {
    nodeId,
    nodeTypeId,
    appType,
    actionId,
    nodeName,
    fieldValueId,
    fieldValueType,
    fieldValueName,
    isSourceApp,
    sourceType,
  } = field;

  if (!nodeId || !fieldValueId) return formulaMap || {};

  const nextFormulaMap = { ...(formulaMap || {}) };
  const nodeInfo = {
    type: nodeTypeId,
    appType,
    actionId,
    name: nodeName,
  };
  const fieldInfo = {
    type: fieldValueType,
    name: fieldValueName,
  };

  if (isSourceApp !== undefined && isSourceApp !== null) {
    nodeInfo.isSourceApp = isSourceApp.toString();
  }

  if (sourceType !== undefined) {
    fieldInfo.sourceType = sourceType;
  }

  nextFormulaMap[nodeId] = nodeInfo;
  nextFormulaMap[`${nodeId}-${fieldValueId}`] = fieldInfo;

  return nextFormulaMap;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function replaceMjmlFormulaForPreview(value = '', formulaMap = {}) {
  const text = value || '';

  if (!text || !formulaMap || !Object.keys(formulaMap).length) return text;

  const replaceWithName = (match, nodeId, fieldValueId) => {
    const nodeName = (formulaMap[nodeId] || {}).name;
    const fieldValueName = (formulaMap[`${nodeId}-${fieldValueId}`] || {}).name;

    if (!nodeName || !fieldValueName) return match;

    return `${escapeHtml(nodeName)}-${escapeHtml(fieldValueName)}`;
  };

  return text.replace(/\$([A-Za-z0-9#_]+)-([A-Za-z0-9#_]+)\$/g, replaceWithName);
}

export function getMjmlPreviewTheme() {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return {};
  }

  const rootStyle = window.getComputedStyle(document.documentElement);
  const backgroundColor =
    rootStyle.getPropertyValue('--color-background-primary').trim() ||
    rootStyle.getPropertyValue('--color-background-card').trim();
  const textColor =
    rootStyle.getPropertyValue('--color-text-primary').trim() ||
    rootStyle.getPropertyValue('--color-text-title').trim();

  return {
    backgroundColor,
    textColor,
  };
}

export function getMjmlPreviewHtml(value = '', formulaMap = {}, previewTheme = {}) {
  let html = replaceMjmlFormulaForPreview(value, formulaMap).replace(/max-width\s*:\s*600px;?/gi, '');
  const defaultThemeColorPair = DEFAULT_MJML_THEME_COLOR_PAIRS.find(
    item =>
      new RegExp(item.backgroundColor, 'i').test(html) &&
      new RegExp(item.textColor, 'i').test(html) &&
      (item.backgroundColor !== previewTheme.backgroundColor || item.textColor !== previewTheme.textColor),
  );

  if (defaultThemeColorPair && previewTheme.backgroundColor) {
    html = html.replace(new RegExp(defaultThemeColorPair.backgroundColor, 'gi'), previewTheme.backgroundColor);
  }

  if (defaultThemeColorPair && previewTheme.textColor) {
    html = html.replace(new RegExp(defaultThemeColorPair.textColor, 'gi'), previewTheme.textColor);
  }

  return html;
}
