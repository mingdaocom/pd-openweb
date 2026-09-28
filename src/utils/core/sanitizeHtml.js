import filterXSS from 'xss';
import { escapeAttrValue, friendlyAttrValue, safeAttrValue, whiteList } from 'xss/lib/default';

const mergeAttributes = (tag, attributes) => Array.from(new Set([...(whiteList[tag] || []), ...attributes]));

const postMessageWhiteList = {
  ...whiteList,
  a: mergeAttributes('a', ['class', 'rel', 'data-accountid', 'data-groupid', 'data-action']),
  code: mergeAttributes('code', ['class']),
  div: mergeAttributes('div', ['class', 'data-message-id', 'data-custom-block']),
  font: mergeAttributes('font', ['class', 'style']),
  img: mergeAttributes('img', ['class']),
  pre: mergeAttributes('pre', ['class']),
  span: mergeAttributes('span', ['class']),
};

const iframeWhiteList = {
  iframe: [
    'allow',
    'allowfullscreen',
    'frameborder',
    'height',
    'loading',
    'name',
    'referrerpolicy',
    'src',
    'title',
    'width',
  ],
};

const linkTextWhiteList = {
  a: whiteList.a,
};

const markdownTaskCheckboxes = new Set([
  '<input class="task-list-checkbox" type="checkbox" disabled>',
  '<input class="task-list-checkbox" type="checkbox" disabled checked>',
]);

const previewWhiteList = Object.keys(whiteList).reduce(
  (result, tag) => ({
    ...result,
    [tag]: mergeAttributes(tag, ['class', 'style']),
  }),
  {},
);

const ensureSafeBlankTarget = html =>
  html.replace(/<a\b([^>]*)>/gi, (tag, attributes) => {
    if (!/\btarget=(['"])_blank\1/i.test(attributes)) return tag;

    const relMatch = attributes.match(/\brel=(['"])(.*?)\1/i);
    if (!relMatch) return `<a${attributes} rel="noopener noreferrer">`;

    const relValues = new Set(relMatch[2].split(/\s+/).filter(Boolean));
    relValues.add('noopener');
    relValues.add('noreferrer');
    return tag.replace(relMatch[0], `rel=${relMatch[1]}${Array.from(relValues).join(' ')}${relMatch[1]}`);
  });

const filterMarkdownPreviewTag = (tag, html) => {
  if (tag === 'input') return markdownTaskCheckboxes.has(html) ? html : '';
};

const safePostMessageAttrValue = (tag, name, value, cssFilter) => {
  const normalizedValue = friendlyAttrValue(value).trim();
  const normalizedProtocolValue = normalizedValue.replace(/[\u0000-\u0020\u007f-\u009f]/g, '');
  const defaultSafeValue = safeAttrValue(tag, name, value, cssFilter);

  // 兼容后端通知中的受控相对地址，其他属性值仍沿用 xss 默认规则。
  const isSafePostMessageHref =
    tag === 'a' &&
    name === 'href' &&
    ((/Download\/WorksheetExcel/i.test(normalizedValue) && !/^[a-z][a-z\d+.-]*:/i.test(normalizedProtocolValue)) ||
      /^appLang\/[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(normalizedValue));

  if (isSafePostMessageHref) {
    return escapeAttrValue(normalizedValue);
  }

  return defaultSafeValue;
};

export const sanitizeHtml = html => filterXSS(String(html ?? ''));

export const sanitizeLinkTextHtml = html =>
  ensureSafeBlankTarget(
    filterXSS(String(html ?? ''), {
      whiteList: linkTextWhiteList,
      stripIgnoreTag: true,
      stripIgnoreTagBody: ['script', 'style'],
    }),
  );

export const sanitizePostMessageHtml = html =>
  ensureSafeBlankTarget(
    filterXSS(String(html ?? ''), {
      whiteList: postMessageWhiteList,
      safeAttrValue: safePostMessageAttrValue,
      stripIgnoreTag: true,
      stripIgnoreTagBody: ['script', 'style'],
    }),
  );

export const sanitizeMarkdownPreviewHtml = html =>
  ensureSafeBlankTarget(
    filterXSS(String(html ?? ''), {
      whiteList: postMessageWhiteList,
      onTag: filterMarkdownPreviewTag,
      safeAttrValue: safePostMessageAttrValue,
      stripIgnoreTag: true,
      stripIgnoreTagBody: ['script', 'style'],
    }),
  );

export const sanitizeIframeHtml = html =>
  filterXSS(String(html ?? ''), {
    whiteList: iframeWhiteList,
    stripIgnoreTag: true,
    stripIgnoreTagBody: ['script', 'style'],
  });

export const sanitizePreviewHtml = html =>
  filterXSS(String(html ?? ''), {
    whiteList: previewWhiteList,
    stripIgnoreTag: true,
    stripIgnoreTagBody: ['script', 'style'],
  });
