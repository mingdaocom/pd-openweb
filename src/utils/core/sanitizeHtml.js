import filterXSS from 'xss';
import { escapeAttrValue, friendlyAttrValue, safeAttrValue, whiteList } from 'xss/lib/default';

const mergeAttributes = (tag, attributes) => Array.from(new Set([...(whiteList[tag] || []), ...attributes]));

/** 正文里可以带内联样式的排版标签：取值由 postMessageCssWhiteList 收窄 */
const STYLABLE_TAGS = [
  'p',
  'span',
  'div',
  'font',
  'em',
  'strong',
  'b',
  'i',
  'u',
  's',
  'del',
  'mark',
  'small',
  'sub',
  'sup',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'blockquote',
  'ul',
  'ol',
  'li',
  'table',
  'thead',
  'tbody',
  'tr',
  'th',
  'td',
  'code',
  'pre',
];

const withStyle = (tag, attributes = []) => mergeAttributes(tag, [...attributes, 'style']);

const postMessageWhiteList = {
  ...whiteList,
  ...Object.fromEntries(STYLABLE_TAGS.map(tag => [tag, withStyle(tag)])),
  a: mergeAttributes('a', ['class', 'rel', 'data-accountid', 'data-groupid', 'data-action']),
  code: withStyle('code', ['class']),
  div: withStyle('div', ['class', 'data-message-id', 'data-custom-block']),
  font: withStyle('font', ['class']),
  img: mergeAttributes('img', ['class']),
  hr: mergeAttributes('hr', ['class']),
  // Markdown 任务列表：Lute 渲染成 li.vditor-task + 只读复选框
  input: ['class', 'type', 'checked', 'disabled'],
  li: withStyle('li', ['class', 'id']),
  // 有序列表被其他块打断后会拆成多个 ol，续接的编号靠 start 表示；
  // 丢掉它每段都会从 1 重新开始，与编辑器显示不一致
  ol: withStyle('ol', ['class', 'start']),
  pre: withStyle('pre', ['class']),
  // title：已删除群组的「群组已删除」提示（messageTokens 的 buildGroupLinkHtml）
  span: withStyle('span', ['class', 'title']),
  sup: withStyle('sup', ['class', 'id']),
};

/**
 * 正文里唯一需要 id 的是 Markdown 脚注的跳转锚点，只放行这一种取值。
 * 不能放开任意 id：正文是用户可控内容，任意 id 可以做 DOM clobbering
 * （如 id="config" 会让 window.config 指向该元素），劫持代码里的全局变量判断。
 */
const FOOTNOTE_ANCHOR_ID = /^footnotes-(?:ref|def)-\d+(?:-\d+)?$/;

/**
 * 正文内联样式只放行纯排版属性。
 *
 * 正文写 HTML 时编辑器会按样式渲染，清洗掉 style 就变成「编辑有色、发布没色」。
 * 但正文是所有人可见的内容，样式能力要收窄到不产生副作用的范围：
 * 这里不放行 background-image（可向外部地址发请求做阅读追踪）、display 与定位类属性
 * （可隐藏内容或覆盖界面）；javascript: 与 expression() 由 xss 的 CSS 过滤器兜底。
 */
const postMessageCssWhiteList = {
  color: true,
  'background-color': true,
  'font-size': true,
  'font-weight': true,
  'font-style': true,
  'font-family': true,
  'text-align': true,
  'text-decoration': true,
  'line-height': true,
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

/**
 * 正文里只允许 Markdown 任务列表产生的只读复选框，其余 input 一律丢弃，
 * 避免正文里出现可输入控件。属性本身仍交给白名单按默认规则过滤。
 */
const filterPostMessageTag = (tag, html) => {
  if (tag !== 'input') return undefined;

  const isReadonlyCheckbox = /\btype\s*=\s*(['"]?)checkbox\1/i.test(html) && /\bdisabled\b/i.test(html);

  return isReadonlyCheckbox ? undefined : '';
};

const safePostMessageAttrValue = (tag, name, value, cssFilter) => {
  const normalizedValue = friendlyAttrValue(value).trim();
  const normalizedProtocolValue = normalizedValue.replace(/[\u0000-\u0020\u007f-\u009f]/g, '');
  const defaultSafeValue = safeAttrValue(tag, name, value, cssFilter);

  if (name === 'id') {
    return FOOTNOTE_ANCHOR_ID.test(normalizedValue) ? escapeAttrValue(normalizedValue) : '';
  }

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
      css: { whiteList: postMessageCssWhiteList },
      onTag: filterPostMessageTag,
      safeAttrValue: safePostMessageAttrValue,
      stripIgnoreTag: true,
      stripIgnoreTagBody: ['script', 'style'],
    }),
  );

export const sanitizeMarkdownPreviewHtml = html =>
  ensureSafeBlankTarget(
    filterXSS(String(html ?? ''), {
      whiteList: postMessageWhiteList,
      css: { whiteList: postMessageCssWhiteList },
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
